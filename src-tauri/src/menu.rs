use tauri::{Menu, Submenu, MenuItem};

pub fn init() -> Menu {
    let root_submenu = Submenu::new("", Menu::new().add_native_item(MenuItem::Quit));
    let menu = Menu::new()
        .add_submenu(root_submenu);

    menu
}
