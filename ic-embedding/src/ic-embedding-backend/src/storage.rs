use bytes::Bytes;
use std::io::Write;

pub fn bytes(filename: &str) -> Bytes {
    let data = std::fs::read(filename).unwrap();
    ic_cdk::println!("Read {} bytes from file {}", data.len(), filename);
    data.into()
}

pub fn append_bytes(filename: &str, bytes: Vec<u8>) {
    ic_cdk::println!("Appending {} bytes to {}", bytes.len(), filename);
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(filename)
        .unwrap();
    file.write_all(&bytes).unwrap();
}

pub fn clear_bytes(filename: &str) {
    // Don't fail if the file doesn't exist.
    let _ = std::fs::remove_file(filename);
}

