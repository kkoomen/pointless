use std::io::{Write, Read};
use std::fs::File;

pub fn compress(filename: &str, contents: &str) -> bool {
    let mut writer = brotli::CompressorWriter::new(File::create(filename).unwrap(), 4096, 11, 22);
    write!(&mut writer, "{}", contents).expect("Could not compress contents");

    true
}

pub fn decompress(filename: &str) -> String {
    let mut reader = brotli::Decompressor::new(File::open(filename).unwrap(), 4096);
    let mut data = String::new();
    reader.read_to_string(&mut data).expect("Unable to decompress contents");

    data
}
