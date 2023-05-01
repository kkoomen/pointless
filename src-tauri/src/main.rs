mod menu;

fn main() {
    tauri::Builder::default()
        .menu(menu::init())
        .run(tauri::generate_context!())
        .expect("failed to run app");
}
