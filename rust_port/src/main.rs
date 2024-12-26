use tract_onnx::prelude::*;
use tokenizers::Tokenizer;
use std::io::{self, Write};
use std::time::Instant;

fn load_model(model_path: &str) -> TractResult<RunnableModel<TypedFact, Box<dyn TypedOp>, Graph<TypedFact, Box<dyn TypedOp>>>> {
    println!("Loading model...");
    let model = tract_onnx::onnx()
        .model_for_path(model_path)?
        .into_optimized()?
        .into_runnable()?;
    println!("Model loaded successfully!");
    Ok(model)
}

fn process_input(text: &str, tokenizer: &Tokenizer, max_length: usize) -> (Vec<i64>, Vec<i64>) {
    let encoding = tokenizer.encode(text, true).unwrap();
    
    let mut input_ids: Vec<i64> = encoding.get_ids()
        .iter()
        .map(|&id| id as i64)
        .collect();
    let mut attention_mask: Vec<i64> = encoding.get_attention_mask()
        .iter()
        .map(|&mask| mask as i64)
        .collect();
    
    // Pad or truncate
    input_ids.resize(max_length, 0);
    attention_mask.resize(max_length, 0);
    
    (input_ids, attention_mask)
}

fn run_inference(
    model: &RunnableModel<TypedFact, Box<dyn TypedOp>, Graph<TypedFact, Box<dyn TypedOp>>>,
    input_ids: Vec<i64>,
    attention_mask: Vec<i64>
) -> TractResult<Vec<f32>> {
    let start = Instant::now();
    
    // Convert to tensors properly
    let input_ids = tract_ndarray::Array2::from_shape_vec((1, input_ids.len()), input_ids)?;
    let attention_mask = tract_ndarray::Array2::from_shape_vec((1, attention_mask.len()), attention_mask)?;
    
    // Create tensors correctly
    let input_ids_tensor = Tensor::from(input_ids);
    let attention_mask_tensor = Tensor::from(attention_mask);
    
    // Convert to TValue
    let input_ids_tvalue: TValue = input_ids_tensor.into();
    let attention_mask_tvalue: TValue = attention_mask_tensor.into();
    
    let outputs = model.run(tvec!(input_ids_tvalue, attention_mask_tvalue))?;
    println!("Inference time: {:?}", start.elapsed());
    
    let output_tensor = outputs[0].to_array_view::<f32>()?;
    Ok(output_tensor.iter().copied().collect())
}

fn main() -> TractResult<()> {
    // Load model
    let model = load_model("../data/onnx/toxic_classifier.onnx")?;
    
    // Load tokenizer from file or create new
    let tokenizer = Tokenizer::from_file("../data/onnx/tokenizer/tokenizer.json")
        .expect("Failed to load tokenizer");
    
    let categories = vec!["toxic", "severe_toxic", "obscene", "threat", "insult", "identity_hate"];
    
    println!("Model and tokenizer loaded. Ready for input!");
    
    loop {
        print!("\nEnter text to analyze (or 'quit' to exit): ");
        io::stdout().flush().unwrap();
        
        let mut input = String::new();
        io::stdin().read_line(&mut input).unwrap();
        let input = input.trim();
        
        if input.to_lowercase() == "quit" {
            break;
        }
        
        let (input_ids, attention_mask) = process_input(input, &tokenizer, 128);
        
        match run_inference(&model, input_ids, attention_mask) {
            Ok(predictions) => {
                println!("\nResults:");
                println!("--------");
                for (category, &prob) in categories.iter().zip(predictions.iter()) {
                    println!("{}: {:.1}%", category, prob * 100.0);
                }
            },
            Err(e) => println!("Error during inference: {:?}", e),
        }
    }
    
    Ok(())
}