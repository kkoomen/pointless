use tauri::Manager;
use tauri::AppHandle;
use std::fs::File;
use std::io::Read;
use std::path::Path;
use std::fs;
mod config;

#[tauri::command]
fn load_library(app: AppHandle) -> Option<serde_json::Value> {
    let library_config_file = config::get_library_path(app);

    if Path::new(&library_config_file).exists() {
        let mut file = File::open(library_config_file).expect("Library file doesn't exists");
        let mut data = String::new();
        file.read_to_string(&mut data).unwrap();
        let json: serde_json::Value = serde_json::from_str(&data).expect("Unable to parse library state");
        Some(json);
    }

    None
}

#[tauri::command]
fn save_library(app: AppHandle, library_state: String) {
    let library_config_file = config::get_library_path(app);
    fs::write(library_config_file, library_state).expect("Unable to save library state");
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            config::init(handle);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_library,
            save_library
        ])
        .run(tauri::generate_context!())
        .expect("failed to run app");
}
