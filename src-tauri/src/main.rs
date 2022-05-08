use tauri::{Manager, AppHandle};
mod config;
mod menu;
mod commands;

fn main() {
    tauri::Builder::default()
        .menu(menu::init())
        .setup(|app| {
            let handle = app.handle();
            config::init(handle);
            Ok(())
        })
        .invoke_handler(commands::get_handlers())
        .run(tauri::generate_context!())
        .expect("failed to run app");
}
