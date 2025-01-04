#!/bin/bash
set -e

echo "Clearing existing data..."
dfx canister call ic-embedding-backend clear_vocab_bytes
dfx canister call ic-embedding-backend clear_model_bytes

echo "Uploading vocabulary file..."
if [ ! -f "src/ic-embedding-backend/src/tokenizer.json" ]; then
    echo "Error: tokenizer.json not found!"
    exit 1
fi

echo "Uploading model file..."
if [ ! -f "src/ic-embedding-backend/src/toxic_classifier.onnx" ]; then
    echo "Error: toxic_classifier.onnx not found!"
    exit 1
fi

ic-file-uploader ic-embedding-backend append_vocab_bytes src/ic-embedding-backend/src/tokenizer.json
echo "Vocabulary file uploaded"

ic-file-uploader ic-embedding-backend append_model_bytes src/ic-embedding-backend/src/toxic_classifier.onnx
echo "Model file uploaded"

echo "Setting up model..."
dfx canister call ic-embedding-backend setup

echo "Upload complete!"