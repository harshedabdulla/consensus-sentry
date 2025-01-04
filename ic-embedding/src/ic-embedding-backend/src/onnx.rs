//onnx.rs
use rust_tokenizers::tokenizer::{BertTokenizer, Tokenizer, TruncationStrategy};
use rust_tokenizers::vocab::{BertVocab};
use std::cell::RefCell;
use serde_json::Value;
use tract_onnx::prelude::*;
use tract_ndarray::Array2;
use tract_ndarray::prelude::*;

type Model = SimplePlan<TypedFact, Box<dyn TypedOp>, Graph<TypedFact, Box<dyn TypedOp>>>;

thread_local! {
    static MODEL: RefCell<Option<Model>> = RefCell::new(None);
    static VOCAB: RefCell<Option<BertVocab>> = RefCell::new(None);
}

const TARGET_LEN: usize = 128;

pub fn setup_model(model_data: &[u8]) -> TractResult<()> {
    println!("Loading ONNX model...");
    let model = tract_onnx::onnx()
        .model_for_read(&mut std::io::Cursor::new(model_data))?
        .into_optimized()?
        .into_runnable()?;
    
    MODEL.with(|m| {
        *m.borrow_mut() = Some(model);
    });
    
    println!("Model loaded successfully!");
    Ok(())
}

pub fn setup_vocab(vocab_data: &[u8]) -> Result<(), Box<dyn std::error::Error>> {
    println!("Loading tokenizer...");
    println!("Loaded vocab data size: {}", vocab_data.len());
    
    // Parse JSON data
    let json_str = String::from_utf8(vocab_data.to_vec())
    .map_err(|e| {
        println!("Error converting vocab data to string: {}", e);
        e
    })?;


    let json: Value = serde_json::from_str(&json_str)
        .map_err(|e| {
            println!("Error parsing JSON: {}", e);
            e
        })?;

    
    
    // Convert JSON to vocabulary file format
    let mut vocab_contents = String::new();
    
    // Add special tokens first
    vocab_contents.push_str("[PAD]\n[UNK]\n[CLS]\n[SEP]\n[MASK]\n");
    
    // Add the rest of the vocabulary
    if let Some(vocab_obj) = json["model"]["vocab"].as_object() {
        for (token, _) in vocab_obj {
            if !token.starts_with('[') {  // Skip special tokens as we've already added them
                vocab_contents.push_str(token);
                vocab_contents.push('\n');
            }
        }
    } else {
        return Err("Invalid vocabulary format".into());
    }
    
    // Create BertVocab from the processed contents
    let vocab = BertVocab::from_bytes(vocab_contents.as_bytes())
        .map_err(|e| Box::new(e) as Box<dyn std::error::Error>)?;
    
    VOCAB.with(|v| {
        *v.borrow_mut() = Some(vocab);
    });
    
    println!("Tokenizer loaded successfully!");
    Ok(())
}

// fn pad_vector<T: Default + Clone>(input_ids: Vec<T>, target_len: usize) -> Vec<T> {
//     let mut padded = input_ids;
//     padded.resize(target_len, T::default());
//     padded
// }

pub fn get_tokens(sentence: &str) -> Result<(Vec<i64>, Vec<i64>, Vec<i8>), String> {
    // Pre-allocate vectors with capacity
    let mut input_ids = Vec::with_capacity(TARGET_LEN);
    let mut attention_mask = Vec::with_capacity(TARGET_LEN);
    let mut token_type_ids = Vec::with_capacity(TARGET_LEN);

    VOCAB.with(|vocab_cell| {
        let vocab = vocab_cell.borrow();
        let vocab = vocab.as_ref().ok_or("Vocab not loaded")?;
        
        // Initialize tokenizer with minimal cloning
        let tokenizer = BertTokenizer::from_existing_vocab(
            vocab.clone(),
            true,
            true,
        );

        // Tokenize with pre-defined length
        let tokens = tokenizer.encode(
            sentence,
            None,
            TARGET_LEN,
            &TruncationStrategy::LongestFirst,
            0,
        );

        // Convert and pad input_ids efficiently
        input_ids.extend(tokens.token_ids.iter().map(|&id| id as i64));
        input_ids.resize(TARGET_LEN, 0);

        // Create attention mask directly from input_ids
        attention_mask.extend(input_ids.iter().map(|&id| if id == 0 { 0 } else { 1 }));
        
        // Convert and pad token_type_ids efficiently
        token_type_ids.extend(tokens.segment_ids.iter().map(|&id| id as i8));
        token_type_ids.resize(TARGET_LEN, 0);

        Ok((input_ids, attention_mask, token_type_ids))
    })
}

pub fn inference(text: String) -> Result<Vec<(String, f32)>, String> {
    // Pre-allocate vectors and minimize logging
    let (input_ids, attention_mask, _) = get_tokens(&text)
        .map_err(|e| format!("Tokenization error: {}", e))?;
    
    MODEL.with(|model_cell| {
        let model = model_cell.borrow();
        let model = model.as_ref().ok_or("Model not loaded")?;

        // More efficient tensor creation by pre-allocating shape
        let shape = (1, TARGET_LEN);
        
        // Create tensors without intermediate Vec allocations
        let input_ids_tensor = Array2::from_shape_vec(shape, input_ids)
            .map_err(|e| format!("Input tensor error: {}", e))?
            .into_tensor();
        
        let attention_mask_tensor = Array2::from_shape_vec(shape, attention_mask)
            .map_err(|e| format!("Mask tensor error: {}", e))?
            .into_tensor();

        // Run model with minimal overhead
        let outputs = model.run(tvec!(
            input_ids_tensor.into(),
            attention_mask_tensor.into(),
        )).map_err(|e| format!("Inference error: {}", e))?;

        // Efficient output processing
        let output_tensor = outputs[0].to_array_view::<f32>()
            .map_err(|e| format!("Output processing error: {}", e))?;

        // Get probabilities directly without intermediate allocations
        let probabilities = if output_tensor.shape().len() == 2 {
            output_tensor.slice(s![0, ..]).to_vec()
        } else {
            output_tensor.as_slice().unwrap_or(&[]).to_vec()
        };

        // Static labels to avoid allocation
        static LABELS: [&str; 6] = ["toxic", "severe_toxic", "obscene", "threat", "insult", "identity_hate"];
        
        // Check dimensions match
        if LABELS.len() != probabilities.len() {
            return Err(format!("Dimension mismatch: labels={}, probs={}", 
                             LABELS.len(), probabilities.len()));
        }

        // Create results with pre-allocated capacity
        let mut results = Vec::with_capacity(LABELS.len());
        for (i, &prob) in probabilities.iter().enumerate() {
            results.push((LABELS[i].to_string(), prob));
        }

        Ok(results)
    })
}