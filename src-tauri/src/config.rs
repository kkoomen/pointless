use tauri::AppHandle;

pub fn get_library_filename_path(handle: AppHandle) -> String {
    let config_dir = handle.path_resolver().app_data_dir().unwrap();

    format!("{}/library.dat", config_dir.display())
}
