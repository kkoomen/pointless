use tauri::AppHandle;
use std::path::Path;
use crate::config;
use crate::file::{compress, decompress};

#[tauri::command]
async fn load_library(app: AppHandle) -> Option<serde_json::Value> {
    let library_config_file = config::get_library_path(app);

    if Path::new(&library_config_file).exists() {
        let contents = decompress(&library_config_file);
        let json: serde_json::Value = serde_json::from_str(&contents).expect("Unable to parse library state");
        return Some(json);
    }

    None
}

#[tauri::command]
async fn save_library(app: AppHandle, library_state: String) {
    let library_config_file = config::get_library_path(app);
    compress(&library_config_file, &library_state);
}

#[tauri::command]
async fn get_system_theme() -> String {
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
