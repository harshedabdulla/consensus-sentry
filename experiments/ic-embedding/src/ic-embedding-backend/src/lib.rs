//lib.rs
mod onnx;
mod storage;

use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager},
    DefaultMemoryImpl,
};
use std::cell::RefCell;

const WASI_MEMORY_ID: MemoryId = MemoryId::new(0);
const VOCAB_FILE: &str = "tokenizer.json";
const MODEL_FILE: &str = "toxic_classifier.onnx";

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
}

#[derive(candid::CandidType, serde::Deserialize)]
struct ClassificationResult {
    probability: f32,
    label: String,
}

#[target_feature(enable = "simd128")]

#[ic_cdk::init]
fn init() {
    let wasi_memory = MEMORY_MANAGER.with(|m| m.borrow().get(WASI_MEMORY_ID));
    ic_wasi_polyfill::init_with_memory(&[0u8; 32], &[], wasi_memory);
}

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    let wasi_memory = MEMORY_MANAGER.with(|m| m.borrow().get(WASI_MEMORY_ID));
    ic_wasi_polyfill::init_with_memory(&[0u8; 32], &[], wasi_memory);
}

#[ic_cdk::update]
fn clear_vocab_bytes() {
    storage::clear_bytes(VOCAB_FILE);
}

#[ic_cdk::update]
fn clear_model_bytes() {
    storage::clear_bytes(MODEL_FILE);
}

#[ic_cdk::update]
fn append_vocab_bytes(bytes: Vec<u8>) {
    println!("Appending bytes of length: {}", bytes.len());
    storage::append_bytes(VOCAB_FILE, bytes);
}


#[ic_cdk::update]
fn append_model_bytes(bytes: Vec<u8>) {
    println!("Appending bytes of length: {}", bytes.len());
    storage::append_bytes(MODEL_FILE, bytes);
}

#[ic_cdk::update]
fn classify_text(text: String) -> Result<Vec<ClassificationResult>, String> {
    onnx::inference(text).map(|results| {
        results
            .into_iter()
            .map(|(label, probability)| ClassificationResult { label, probability })
            .collect()
    })
}

#[ic_cdk::update]
fn setup() -> Result<(), String> {
    onnx::setup_vocab(&storage::bytes(VOCAB_FILE)[..])
        .map_err(|err| format!("Failed to setup vocab: {:?}", err))?;
    
    onnx::setup_model(&storage::bytes(MODEL_FILE)[..])
        .map_err(|err| format!("Failed to setup model: {}", err))?;
    
    Ok(())
}

ic_cdk::export_candid!();