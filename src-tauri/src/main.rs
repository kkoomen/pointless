mod config;
mod menu;
mod commands;
mod file;

fn main() {
    tauri::Builder::default()
        .menu(menu::init())
        .invoke_handler(commands::get_handlers())
        .run(tauri::generate_context!())
        .expect("failed to run app");
}
