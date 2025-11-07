// Prevents additional console window on Windows in release, DO NOT REMOVE!!

use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use tauri::command;

// Rodio
use std::fs::File;
use rodio::{Decoder};


#[derive(Serialize)]
pub struct FileInfo {
    name: String,
    path: String,
    size: u64,
    is_directory: bool,
    extension: String,
}

#[command]
async fn play_song(path: String){
// Get an output stream handle to the default physical sound device.
// Note that the playback stops when the stream_handle is dropped.//!
let stream_handle = rodio::OutputStreamBuilder::open_default_stream()
        .expect("open default audio stream");
let _sink = rodio::Sink::connect_new(&stream_handle.mixer());
// Load a sound from a file, using a path relative to Cargo.toml
let file = File::open(path).unwrap();
// Decode that sound file into a source
let source = Decoder::try_from(file).unwrap();
// Play the sound directly on the device
stream_handle.mixer().add(source);

// The sound plays in a separate audio thread,
// so we need to keep the main thread alive while it's playing.
std::thread::sleep(std::time::Duration::from_secs(5));
}

#[command]
async fn select_folder() -> Result<String, String> {
    let handle = tauri::async_runtime::spawn(async move {
        if let Some(folder) = rfd::AsyncFileDialog::new()
            .set_title("Select folder to scan")
            .pick_folder()
            .await
        {
            Ok(folder.path().to_string_lossy().to_string())
        } else {
            Err("No folder selected".to_string())
        }
    });

    handle.await.unwrap()
}

#[command]
async fn scan_folder(folder_path: String) -> Result<Vec<FileInfo>, String> {
    let path = PathBuf::from(folder_path);

    if !path.exists() {
        return Err("Folder does not exist".to_string());
    }

    if !path.is_dir() {
        return Err("Path is not a directory".to_string());
    }

    let mut files = Vec::new();

    fn scan_directory(dir: &PathBuf, files: &mut Vec<FileInfo>) -> Result<(), String> {
        let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;

        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;

            let file_info = FileInfo {
                name: path
                    .file_name()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .to_string(),
                path: path.to_string_lossy().to_string(),
                size: metadata.len(),
                is_directory: metadata.is_dir(),
                extension: path
                    .extension()
                    .map(|ext| ext.to_string_lossy().to_string())
                    .unwrap_or_default(),
            };

            files.push(file_info);

            // Recursively scan subdirectories
            if metadata.is_dir() {
                scan_directory(&path, files)?;
            }
        }

        Ok(())
    }

    scan_directory(&path, &mut files)?;
    Ok(files)
}



fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![select_folder, scan_folder, play_song])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
