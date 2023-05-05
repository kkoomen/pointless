use std::io::{Write, Read, self};
use std::fs::File;
use std::fs;
use std::path::Path;

pub fn compress(filename: &str, contents: &str) -> bool {
    let mut writer = brotli::CompressorWriter::new(File::create(filename).unwrap(), 4096, 11, 22);
    write!(&mut writer, "{}", contents).expect("Could not compress contents");

    true
}

pub fn decompress<P: AsRef<Path>>(filename: P) -> Result<String, io::Error> {
    let file = File::open(filename)?;
    let mut reader = brotli::Decompressor::new(file, 4096);
    let mut data = String::new();
    reader.read_to_string(&mut data)?;

    Ok(data)
}


pub fn read_directory_contents(path: &str) -> Vec<String> {
    let mut contents: Vec<String> = vec![];

    for entry in fs::read_dir(path).unwrap() {
        let file_name = entry.unwrap().file_name();
        let file_name_str = file_name.to_str().unwrap().to_owned();
        if !file_name_str.starts_with(".") {
            contents.push(file_name_str);
        }
    }

    contents
}
