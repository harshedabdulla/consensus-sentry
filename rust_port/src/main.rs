use tract_onnx::prelude::*;

fn main() -> TractResult<()> {
    // Path to your ONNX file
    let model_path = "../data/onnx/toxic_classifier.onnx";
    println!("Loading ONNX model from: {}", model_path);

    // Load the ONNX model
    let model = tract_onnx::onnx()
        .model_for_path(model_path)?
        .into_optimized()?
        .into_runnable()?;
    println!("Model successfully loaded!");

    // Dummy input (adjust dimensions based on your ONNX model's input shape)
    let input_ids = tract_ndarray::Array2::<i64>::from_shape_vec((1, 128), vec![101; 128])?;
    let attention_mask = tract_ndarray::Array2::<i64>::from_shape_vec((1, 128), vec![1; 128])?;
    println!("Dummy inputs created!");

    // Convert to Tensor and then to TValue
    let input_ids_tensor: TValue = Tensor::from(input_ids).into();
    let attention_mask_tensor: TValue = Tensor::from(attention_mask).into();
    println!("Inputs converted to tensors!");

    // Run the model
    let outputs = model.run(tvec!(input_ids_tensor, attention_mask_tensor))?;
    println!("Model successfully run!");

    // Print output
    println!("Model outputs: {:?}", outputs);

    Ok(())
}