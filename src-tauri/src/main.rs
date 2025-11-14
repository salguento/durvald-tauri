// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use tauri::command;

// Rodio
use rodio::Decoder;
use std::fs::File;

use rusqlite::Connection;
use std::sync::Mutex;

use tauri::Manager;

use commands::database_commands::AppState;
use commands::database_commands::{
    add_path_to_library_paths, create_tables, get_paths_from_library_paths,
};
use commands::get_audio_metadata;

#[command]
async fn play_song(path: String) {
    // Get an output stream handle to the default physical sound device.
    // Note that the playback stops when the stream_handle is dropped.//!
    let stream_handle =
        rodio::OutputStreamBuilder::open_default_stream().expect("open default audio stream");
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

#[derive(Serialize)]
pub struct FileInfo {
    name: String,
    path: String,
    size: u64,
    is_directory: bool,
    extension: String,
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

            // If it's a directory, scan recursively
            if metadata.is_dir() {
                scan_directory(&path, files)?;
                continue; // Skip adding directories to the files list
            }

            // Only process files (not directories)
            let file_info = FileInfo {
                name: path
                    .file_name()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .to_string(),
                path: path.to_string_lossy().to_string(),
                size: metadata.len(),
                is_directory: false, // We're only adding files now
                extension: path
                    .extension()
                    .map(|ext| ext.to_string_lossy().to_string())
                    .unwrap_or_default(),
            };

            // Check if it's an audio file
            if is_audio_file(&file_info.extension) {
                files.push(file_info);
            }
        }

        Ok(())
    }

    scan_directory(&path, &mut files)?;
    Ok(files)
}

fn is_audio_file(extension: &str) -> bool {
    let audio_extensions = [
        "mp3", "wav", "flac", "ogg", "m4a", "wma", "aiff", "aif", "ape", "opus", "dsd", "dsf",
        "dff", "alac", "mp4", "m4b", "m4p", "amr", "3gp", "aa", "aax", "aac", "webm", "ra", "rm",
        "mid", "midi",
    ];

    audio_extensions.contains(&extension.to_lowercase().as_str())
}

fn main() {
    let conn = Connection::open("music.db3").expect("Failed to open database");

    tauri::Builder::default()
        .manage(AppState {
            db: Mutex::new(conn),
        })
        .setup(|app| {
            let state = app.state::<AppState>();
            create_tables(state).expect("failed to create tables");
            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            select_folder,
            scan_folder,
            play_song,
            get_audio_metadata,
            create_tables,
            add_path_to_library_paths,
            get_paths_from_library_paths
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
