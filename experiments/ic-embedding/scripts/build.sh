#!/bin/bash
set -ex

export RUSTFLAGS=$RUSTFLAGS' -C target-feature=+simd128'
export WASI_SDK_PATH=/Users/harshed/Downloads/wasi-sdk-21.0
export CC_wasm32_wasi="$WASI_SDK_PATH/bin/clang --sysroot=$WASI_SDK_PATH/share/wasi-sysroot"
export CXX_wasm32_wasi="$WASI_SDK_PATH/bin/clang++ --sysroot=$WASI_SDK_PATH/share/wasi-sysroot"

cargo build --release --target=wasm32-wasi
wasi2ic ./target/wasm32-wasi/release/ic_embedding_backend.wasm ./target/wasm32-wasi/release/ic_embedding_backend.wasm
wasm-opt -Os -o ./target/wasm32-wasi/release/ic_embedding_backend.wasm \
        ./target/wasm32-wasi/release/ic_embedding_backend.wasm

# candid-extractor "target/wasm32-wasi/release/ic_embedding_backend.wasm" > "src/ic-embedding-backend/ic-embedding-backend.did"
