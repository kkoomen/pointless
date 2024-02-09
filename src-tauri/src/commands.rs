use tauri::AppHandle;
use std::path::{Path, PathBuf};
use crate::config;
use crate::file::{compress, decompress, read_directory_contents};
use std::fs;
use serde_json::Value;


#[tauri::command]
async fn load_library_folder_papers(handle: AppHandle, folder_id: String) -> Option<Vec<serde_json::Value>> {
    let library_dir_path = config::get_library_dir_path(handle);
    let folder_path = format!("{}/{}", &library_dir_path, folder_id);

    if Path::new(&folder_path).exists() {
        let mut papers: Vec<serde_json::Value> = vec![];
        let paper_ids = read_directory_contents(&folder_path);
        for paper_id in paper_ids {
            if paper_id == "folder_info.dat" {
                continue;
            }
            let paper_path = format!("{}/{}", &folder_path, paper_id);
            let err_msg = format!("Failed to decompress \"{}/{}\"", &folder_path, &paper_id);
            let contents = decompress(&paper_path).expect(&err_msg);
            let json: serde_json::Value = serde_json::from_str(&contents).expect("Unable to parse paper");
            papers.push(json);
        }
        return Some(papers);
    }

    None
}

#[tauri::command]
async fn load_library_folders(handle: AppHandle) -> Option<Vec<serde_json::Value>> {
    let library_dir_path = config::get_library_dir_path(handle);

    if Path::new(&library_dir_path).exists() {
        let mut folders: Vec<serde_json::Value> = vec![];

        let folder_ids = read_directory_contents(&library_dir_path);
        for folder_id in folder_ids {
            let folder_info_filepath = format!("{}/{}/folder_info.dat", &library_dir_path, folder_id);
            let contents = decompress(&folder_info_filepath).unwrap();
            let json: serde_json::Value = serde_json::from_str(&contents).expect("Unable to parse folder info file");
            folders.push(json);
        }
        return Some(folders);
    }

    None
}

#[tauri::command]
async fn delete_library_folder(handle: AppHandle, folder_id: String) {
    let library_dir_path = config::get_library_dir_path(handle);
    let folder_path = format!("{}/{}", &library_dir_path, folder_id);

    let folder_path_buf = PathBuf::from(&folder_path);

    if folder_path_buf.exists() && folder_path_buf.is_dir() {
        match fs::remove_dir_all(&folder_path_buf) {
            Ok(_) => {},
            Err(e) => eprintln!("Error removing folder {}: {:?}", folder_id, e),
        }
    }
}

#[tauri::command]
async fn delete_library_paper(handle: AppHandle, folder_id: String, paper_id: String) {
    let library_dir_path = config::get_library_dir_path(handle);
    let paper_filepath = format!("{}/{}/{}.dat", &library_dir_path, folder_id, paper_id);

    let paper_filepath_buf = PathBuf::from(&paper_filepath);

    if paper_filepath_buf.exists() && paper_filepath_buf.is_file() {
        match fs::remove_file(&paper_filepath_buf) {
            Ok(_) => {},
            Err(e) => eprintln!("Error removing folder {}: {:?}", folder_id, e),
        }
    }
}

#[tauri::command]
async fn save_library(handle: AppHandle, library_state: String) {
    let json: Value = serde_json::from_str(&library_state).expect("Unable to parse paper");
    let library_dir_path = config::get_library_dir_path(handle);


    // Loop through folders and create each one if it doesn't exist.
    if let Some(folders) = json.get("folders").and_then(|f| f.as_array()) {
        for folder in folders {
            if let Some(folder_id) = folder.get("id").and_then(|id| id.as_str()) {
                let folder_path = format!("{}/{}", &library_dir_path, folder_id);
                if !Path::new(&folder_path).exists() {
                    fs::create_dir_all(&folder_path).expect("Unable to create folder");
                }

                let folder_info_filepath = format!("{}/folder_info.dat", &folder_path);
                compress(&folder_info_filepath, &folder.to_string());
            }
        }
    }

    // Loop through papers and save each one inside its corresponding folder.
    if let Some(papers) = json.get("papers").and_then(|p| p.as_array()) {
        for paper in papers {
            let folder_id = paper.get("folderId").and_then(|id| id.as_str()).unwrap();
            let folder_path = format!("{}/{}", &library_dir_path, folder_id);
            let paper_id = paper.get("id").and_then(|id| id.as_str()).unwrap();
            let paper_filepath = format!("{}/{}.dat", &folder_path, paper_id);
            compress(&paper_filepath, &paper.to_string());
        }
    }
}

#[tauri::command]
async fn save_settings(handle: AppHandle, settings: String) {
    let settings_filepath = config::get_settings_filepath(handle);
    compress(&settings_filepath, &settings);
}

#[tauri::command]
async fn load_settings(handle: AppHandle) -> Option<serde_json::Value> {
    let settings_filepath = config::get_settings_filepath(handle);

    if Path::new(&settings_filepath).exists() {
        let contents = decompress(&settings_filepath).unwrap();
        let json: serde_json::Value = serde_json::from_str(&contents).expect("Unable to load settings");
        return Some(json);
    }

    None
}

pub fn get_handlers() -> Box<dyn Fn(tauri::Invoke<tauri::Wry>) + Send + Sync> {
    Box::new(tauri::generate_handler![
        load_library_folders,
        load_library_folder_papers,
        delete_library_folder,
        delete_library_paper,
        save_library,
        load_settings,
        save_settings
    ])
}
