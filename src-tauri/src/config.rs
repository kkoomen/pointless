use tauri::AppHandle;
use std::env;
use std::fs;

pub fn get_root(app: AppHandle) -> String {
    let home = env::var("HOME").unwrap();
    let product_name = app.config().package.product_name.as_ref().unwrap().clone();

    format!("{}/.config/{}", home, product_name)
}

pub fn get_library_path(app: AppHandle) -> String {
    let config_dir = get_root(app);

    format!("{}/library.dat", config_dir)
}

pub fn init(app: AppHandle) {
    // Create the root dir
    let root_dir = get_root(app);
    fs::create_dir_all(root_dir).unwrap();
}
