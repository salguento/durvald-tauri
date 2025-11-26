// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use tauri::command;

use rusqlite::Connection;
use std::sync::Mutex;
use tokio::sync::Mutex as TokioMutex;

use commands::database_commands::{
    add_path_to_library_paths, create_tables, get_paths_from_library_paths, get_release_by_id,
    get_releases, get_songs_by_release_id, update_database,
};
use commands::get_audio_metadata;

mod audio;
use audio::AudioPlayer;

pub struct AppState {
    pub db: Mutex<Connection>,
    pub audio_player: TokioMutex<AudioPlayer>,
}

#[derive(Serialize)]
pub struct FileInfo {
    name: String,
    path: String,
    size: u64,
    is_directory: bool,
    extension: String,
}

// Audio player commands
#[command]
async fn play_file(path: String, state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut player = state.audio_player.lock().await;
    player.play(path).await.map_err(|e| e.to_string())
}

#[command]
async fn pause_playback(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let player = state.audio_player.lock().await;
    player.pause();
    Ok(())
}

#[command]
async fn resume_playback(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let player = state.audio_player.lock().await;
    player.resume();
    Ok(())
}

#[command]
async fn stop_playback(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut player = state.audio_player.lock().await;
    player.stop();
    Ok(())
}

#[command]
async fn set_volume(volume: f32, state: tauri::State<'_, AppState>) -> Result<(), String> {
    let player = state.audio_player.lock().await;
    player.set_volume(volume);
    Ok(())
}

#[command]
async fn get_playback_state(
    state: tauri::State<'_, AppState>,
) -> Result<PlaybackStateInfo, String> {
    let player = state.audio_player.lock().await;
    Ok(PlaybackStateInfo {
        is_paused: player.is_paused(),
        is_empty: player.is_empty(),
    })
}

#[command]
async fn add_to_queue(path: String, state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut player = state.audio_player.lock().await;
    player.add_to_queue(path).await.map_err(|e| e.to_string())
}

#[derive(Serialize)]
struct PlaybackStateInfo {
    is_paused: bool,
    is_empty: bool,
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
    tauri::async_runtime::block_on(async {
        let player = AudioPlayer::new().expect("Failed to create audio player");
        let conn = Connection::open("music.db3").expect("Failed to open database");
        tauri::Builder::default()
            .manage(AppState {
                db: Mutex::new(conn),
                audio_player: TokioMutex::new(player),
            })
            .setup(|_app| {
                create_tables().expect("failed to create tables");
                Ok(())
            })
            .plugin(tauri_plugin_dialog::init())
            .invoke_handler(tauri::generate_handler![
                select_folder,
                scan_folder,
                get_audio_metadata,
                create_tables,
                add_path_to_library_paths,
                get_paths_from_library_paths,
                update_database,
                get_releases,
                get_release_by_id,
                get_songs_by_release_id,
                play_file,
                pause_playback,
                resume_playback,
                stop_playback,
                set_volume,
                get_playback_state,
                add_to_queue,
            ])
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
    });
}
