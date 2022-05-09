use std::io::{Write, Read};
use std::fs::File;

const BUFFER_SIZE: usize = 4096;
const Q: u32 = 11;
const LGWIN: u32 = 22;

pub fn compress(filename: &str, contents: &str) -> bool {
    let writer = brotli::CompressorWriter::new(File::create(filename).unwrap(), BUFFER_SIZE, Q, LGWIN);
    write!(writer, "{}", contents).expect("Could not compress contents");
    
    true
}

pub fn decompress(filename: &str) -> String {
    let reader = brotli::Decompressor::new(File::open(filename).unwrap(), BUFFER_SIZE);
    let mut data = String::new();
    reader.read_to_string(&mut data).expect("Unable to decompress contents");
    
    data
}
