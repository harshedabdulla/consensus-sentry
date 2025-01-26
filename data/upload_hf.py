from huggingface_hub import HfApi
api = HfApi()
api.upload_folder(
    folder_path="../data/onnx",  # Folder containing model and tokenizer files
    repo_id="harshed/toxic_classifier1",  # Replace with your model repo
    repo_type="model"
)