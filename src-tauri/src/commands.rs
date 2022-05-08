use tauri::{Manager, AppHandle};
use std::fs::File;
use std::io::Read;
use std::path::Path;
use std::fs;
use crate::config;

#[tauri::command]
pub fn load_library(app: AppHandle) -> Option<serde_json::Value> {
    let library_config_file = config::get_library_path(app);

    if Path::new(&library_config_file).exists() {
        let mut file = File::open(library_config_file).unwrap();
        let mut data = String::new();
        file.read_to_string(&mut data).unwrap();
        let json: serde_json::Value = serde_json::from_str(&data).expect("Unable to parse library state");
        return Some(json);
    }

    None
}

#[tauri::command]
pub fn save_library(app: AppHandle, library_state: String) {
    let library_config_file = config::get_library_path(app);
    fs::write(library_config_file, library_state).expect("Unable to save library state");
}

#[tauri::command]
pub fn get_system_theme() -> String {
    let mode = dark_light::detect();
    match mode {
        dark_light::Mode::Dark => {
            return "dark".into();
        },
        dark_light::Mode::Light => {
            return "light".into();
        },
    }
}

pub fn get_handlers() -> Box<dyn Fn(tauri::Invoke<tauri::Wry>) + Send + Sync> {
    Box::new(tauri::generate_handler![
        load_library,
        save_library,
        get_system_theme
    ])
}
