use std::path::{PathBuf, Path};
use std::fs;

use tauri::AppHandle;

pub fn get_app_data_dir_path(handle: AppHandle) -> PathBuf {
    return handle.path_resolver().app_data_dir().unwrap();
}

pub fn get_library_dir_path(handle: AppHandle) -> String {
    let config_dir = get_app_data_dir_path(handle);

    return format!("{}/library", config_dir.display());
}

pub fn init(handle: AppHandle) {
    let library_dir_path = get_library_dir_path(handle);
    if !Path::new(&library_dir_path).exists() {
        fs::create_dir_all(library_dir_path).unwrap();
    }
}
