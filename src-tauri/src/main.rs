// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Listener, Manager, WebviewUrl, WebviewWindowBuilder};

mod commands;

pub mod secure_store;

use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use std::time::Duration;
use tauri::command;
use tauri::Emitter;

use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use std::sync::Arc;

use commands::database_commands::{
    add_path_to_library_paths, add_song_to_history, add_track_to_playlist_songs,
    clear_last_session, create_playlist, create_tables, favorite_release, favorite_track,
    get_all_artists, get_all_playlist_songs, get_all_playlists, get_all_releases, get_all_tracks,
    get_last_session, get_paths_from_library_paths, get_play_history, get_release_by_id,
    get_releases, get_settings, get_song_by_id, get_songs_by_release_id, hide_track,
    initiate_last_session, initiate_settings, remove_song_from_history, remove_track_from_playlist,
    save_last_session, suggest_less_track, update_database, update_onboarding_settings,
    update_session_current_song, update_session_progress, update_session_volume,
};
use commands::get_audio_metadata;

use commands::lastfm_commands::{
    debug_credentials, debug_session, debug_store, disconnect_lastfm, get_auth_token,
    initialize_lastfm, is_connected, poll_session, scrobble_track, update_now_playing,
    verify_credentials,
};

mod audio;
use audio::AudioPlayer;

#[derive(Clone)]
struct AppState {
    db_pool: Arc<Pool<SqliteConnectionManager>>,
    audio_player: Arc<tokio::sync::Mutex<AudioPlayer>>,
}

#[derive(Clone, Serialize)]
struct ProgressPayload {
    position: u64,
    duration: Option<u64>,
    percentage: Option<f32>,
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
async fn start_auto_play(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    let app_clone = app.clone();
    let player = state.audio_player.clone();
    let db_pool = state.db_pool.clone();

    tokio::spawn(async move {
        let mut was_playing = false;

        loop {
            tokio::time::sleep(Duration::from_millis(100)).await;

            let player_lock = player.lock().await;
            let current_state = player_lock.get_playback_state();
            let has_queue = !player_lock.queue_is_empty();
            drop(player_lock);

            match current_state {
                Some(kira::sound::PlaybackState::Playing) => {
                    was_playing = true;
                }
                Some(kira::sound::PlaybackState::Stopped) if was_playing && has_queue => {
                    // Song just finished and there's more in queue
                    was_playing = false;

                    let mut player_lock = player.lock().await;
                    if let Ok(true) = player_lock.play_next().await {
                        let queue_data = player_lock.get_queue_data_for_db();
                        drop(player_lock);

                        let db_pool_clone = db_pool.clone();
                        tokio::task::spawn_blocking(move || {
                            if let Ok(mut conn) = db_pool_clone.get() {
                                let _ =
                                    AudioPlayer::save_queue_to_db_blocking(&mut *conn, &queue_data);
                            }
                        });

                        let _ = app_clone.emit("song-changed", ());
                    }
                }
                Some(kira::sound::PlaybackState::Stopped) => {
                    was_playing = false;
                }
                _ => {}
            }
        }
    });

    Ok(())
}

#[command]
async fn pause_playback(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut player = state.audio_player.lock().await;
    player.pause();
    Ok(())
}

#[command]
async fn resume_playback(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut player = state.audio_player.lock().await;
    player.resume();
    Ok(())
}

#[command]
async fn set_volume(volume: f32, state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut player = state.audio_player.lock().await;
    player.set_volume(volume);
    Ok(())
}

#[command]
async fn stop_playback(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut player = state.audio_player.lock().await;
    player.stop();
    Ok(())
}

#[command]
async fn get_progress(state: tauri::State<'_, AppState>) -> Result<(u64, Option<u64>), String> {
    let player = state.audio_player.lock().await;
    let (position, duration) = player.get_progress();
    Ok((position.as_secs(), duration.map(|d| d.as_secs())))
}

#[command]
async fn get_progress_percentage(state: tauri::State<'_, AppState>) -> Result<Option<f32>, String> {
    let player = state.audio_player.lock().await;
    Ok(player.get_progress_percentage())
}

#[command]
async fn get_playback_state(
    state: tauri::State<'_, AppState>,
) -> Result<PlaybackStateInfo, String> {
    let player = state.audio_player.lock().await;
    tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
    Ok(PlaybackStateInfo {
        is_paused: player.is_paused(),
        is_empty: player.is_empty(),
    })
}

#[command]
async fn add_to_queue(
    state: tauri::State<'_, AppState>,
    song_id: i64,
    path: String,
) -> Result<(), String> {
    let mut player = state.audio_player.lock().await;

    player
        .add_to_queue(song_id, path)
        .await
        .map_err(|e| e.to_string())?;

    // Save to DB in a blocking task
    let db_pool = state.db_pool.clone();
    let queue_data = player.get_queue_data_for_db();

    tokio::task::spawn_blocking(move || {
        let mut conn = db_pool.get().map_err(|e| e.to_string())?;
        AudioPlayer::save_queue_to_db_blocking(&mut *conn, &queue_data).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())??;

    Ok(())
}

#[command]
async fn play_next(state: tauri::State<'_, AppState>) -> Result<bool, String> {
    let mut player = state.audio_player.lock().await;
    let result = player.play_next().await.map_err(|e| e.to_string())?;

    // Save queue to DB in blocking task
    let db_pool = state.db_pool.clone();
    let queue_data = player.get_queue_data_for_db();

    tokio::task::spawn_blocking(move || {
        let mut conn = db_pool.get().map_err(|e| e.to_string())?;
        AudioPlayer::save_queue_to_db_blocking(&mut *conn, &queue_data).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())??;

    Ok(result)
}

#[command]
async fn remove_from_queue(
    state: tauri::State<'_, AppState>,
    position: usize,
) -> Result<(), String> {
    let mut player = state.audio_player.lock().await;
    player
        .remove_from_queue(position)
        .map_err(|e| e.to_string())?;

    // Save to DB in a blocking task
    let db_pool = state.db_pool.clone();
    let queue_data = player.get_queue_data_for_db();

    tokio::task::spawn_blocking(move || {
        let mut conn = db_pool.get().map_err(|e| e.to_string())?;
        AudioPlayer::save_queue_to_db_blocking(&mut *conn, &queue_data).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())??;

    Ok(())
}

#[command]
async fn get_queue(state: tauri::State<'_, AppState>) -> Result<Vec<(i64, String)>, String> {
    let player = state.audio_player.lock().await;
    Ok(player.get_queue())
}

#[command]
async fn clear_queue(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut player = state.audio_player.lock().await;
    player.clear_queue();

    // Clear from DB in a blocking task
    let db_pool = state.db_pool.clone();

    tokio::task::spawn_blocking(move || {
        let conn = db_pool.get().map_err(|e| e.to_string())?;
        conn.execute("DELETE FROM queue", ())
            .map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())??;

    Ok(())
}

#[command]
async fn move_in_queue(
    state: tauri::State<'_, AppState>,
    from: usize,
    to: usize,
) -> Result<(), String> {
    let mut player = state.audio_player.lock().await;
    player.move_in_queue(from, to).map_err(|e| e.to_string())?;

    // Save to DB in a blocking task
    let db_pool = state.db_pool.clone();
    let queue_data = player.get_queue_data_for_db();

    tokio::task::spawn_blocking(move || {
        let mut conn = db_pool.get().map_err(|e| e.to_string())?;
        AudioPlayer::save_queue_to_db_blocking(&mut *conn, &queue_data).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())??;

    Ok(())
}

#[command]
async fn seek_to_position(seconds: u64, state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut player = state.audio_player.lock().await;
    player
        .seek_to_position(seconds)
        .await
        .map_err(|e| e.to_string())
}

#[command]
async fn seek_to_percentage(
    percentage: f32,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    let mut player = state.audio_player.lock().await;
    player
        .seek_to_percentage(percentage)
        .await
        .map_err(|e| e.to_string())
}

#[command]
async fn play_previous(state: tauri::State<'_, AppState>) -> Result<bool, String> {
    let mut player = state.audio_player.lock().await;
    let result = player.play_previous().await.map_err(|e| e.to_string())?;

    // Save queue to DB in blocking task
    let db_pool = state.db_pool.clone();
    let queue_data = player.get_queue_data_for_db();

    tokio::task::spawn_blocking(move || {
        let mut conn = db_pool.get().map_err(|e| e.to_string())?;
        AudioPlayer::save_queue_to_db_blocking(&mut *conn, &queue_data).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())??;

    Ok(result)
}

#[command]
async fn skip_to(state: tauri::State<'_, AppState>, position: usize) -> Result<(), String> {
    let mut player = state.audio_player.lock().await;
    player.skip_to(position).await.map_err(|e| e.to_string())?;

    // Save queue to DB in blocking task
    let db_pool = state.db_pool.clone();
    let queue_data = player.get_queue_data_for_db();

    tokio::task::spawn_blocking(move || {
        let mut conn = db_pool.get().map_err(|e| e.to_string())?;
        AudioPlayer::save_queue_to_db_blocking(&mut *conn, &queue_data).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())??;

    Ok(())
}

#[command]
async fn insert_at_position(
    state: tauri::State<'_, AppState>,
    song_id: i64,
    path: String,
    position: usize,
) -> Result<(), String> {
    let mut player = state.audio_player.lock().await;

    player.insert_at_position(song_id, path, position);

    // Save to DB in a blocking task
    let db_pool = state.db_pool.clone();
    let queue_data = player.get_queue_data_for_db();

    tokio::task::spawn_blocking(move || {
        let mut conn = db_pool.get().map_err(|e| e.to_string())?;
        AudioPlayer::save_queue_to_db_blocking(&mut *conn, &queue_data).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())??;

    Ok(())
}

#[command]
async fn check_and_play_next(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut player = state.audio_player.lock().await;
    player
        .check_and_play_next()
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
async fn load_queue_from_db(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let db_pool = state.db_pool.clone();

    // Load queue data in a blocking task
    let queue_data = tokio::task::spawn_blocking(move || {
        let conn = db_pool.get().map_err(|e| e.to_string())?;
        AudioPlayer::load_queue_from_db_blocking(&conn).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())??;

    // Apply loaded queue to player
    let mut player = state.audio_player.lock().await;
    player.load_queue(queue_data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn get_current_song_id(state: tauri::State<'_, AppState>) -> Result<Option<i64>, String> {
    let player = state.audio_player.lock().await;
    Ok(player.get_current_song_id())
}

#[command]
async fn start_progress_tracking(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    let app_clone = app.clone();
    let player = state.audio_player.clone();

    tokio::spawn(async move {
        loop {
            tokio::time::sleep(Duration::from_millis(500)).await;

            let player_lock = player.lock().await;
            let (position, duration) = player_lock.get_progress();
            let percentage = player_lock.get_progress_percentage();

            // Stop emitting if player is empty
            if player_lock.is_empty() {
                break;
            }

            let payload = ProgressPayload {
                position: position.as_secs(),
                duration: duration.map(|d| d.as_secs()),
                percentage,
            };

            drop(player_lock); // Release the lock before emitting

            app_clone.emit("progress-update", payload).ok();
        }
    });

    Ok(())
}

#[derive(Serialize)]
struct PlaybackStateInfo {
    is_paused: bool,
    is_empty: bool,
}

#[command]
async fn select_folder() -> Result<String, String> {
    let handle = tokio::spawn(async move {
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
        let manager = SqliteConnectionManager::file("music.db3");
        let pool = r2d2::Pool::new(manager).expect("Failed to create pool");

        // Create AppState
        let app_state = AppState {
            db_pool: Arc::new(pool),
            audio_player: Arc::new(tokio::sync::Mutex::new(player)),
        };

        tauri::Builder::default()
            .manage(app_state)
            .setup(|app| {
                // Get references to windows that already exist from config
                let loading_window = WebviewWindowBuilder::new(
                    app,
                    "loading",
                    WebviewUrl::App("loading.html".into()),
                )
                .title("Loading...")
                .inner_size(1080.0, 800.0)
                .resizable(false)
                .decorations(false)
                .center()
                .visible(true)
                .theme(Some(tauri::Theme::Dark))
                .build()?;

                let main_window = app
                    .get_webview_window("main")
                    .expect("Main window should exist");

                // Make sure loading is visible and main is hidden
                let _ = loading_window.show();
                let _ = main_window.hide();

                // Listen for when main window is ready
                let loading_window_clone = loading_window.clone();
                let main_window_clone = main_window.clone();
                main_window.once("main-window-ready", move |_event| {
                    let _ = loading_window_clone.close();
                    let _ = main_window_clone.show();
                    let _ = main_window_clone.set_focus();
                });

                create_tables().expect("failed to create tables");
                initiate_settings().expect("failed to initiate settings");
                initiate_last_session().expect("failed to initiate last session");

                let app_handle = app.handle();
                secure_store::init_secure_store(&app_handle);

                Ok(())
            })
            .plugin(tauri_plugin_dialog::init())
            .plugin(tauri_plugin_shell::init())
            .invoke_handler(tauri::generate_handler![
                select_folder,
                scan_folder,
                get_audio_metadata,
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
                get_progress,
                get_progress_percentage,
                start_progress_tracking,
                seek_to_position,
                seek_to_percentage,
                insert_at_position,
                play_next,
                play_previous,
                skip_to,
                remove_from_queue,
                get_queue,
                move_in_queue,
                check_and_play_next,
                load_queue_from_db,
                clear_queue,
                get_song_by_id,
                get_current_song_id,
                start_auto_play,
                add_song_to_history,
                get_play_history,
                remove_song_from_history,
                favorite_track,
                get_all_tracks,
                get_all_releases,
                get_all_artists,
                hide_track,
                suggest_less_track,
                favorite_release,
                create_playlist,
                get_all_playlists,
                get_all_playlist_songs,
                add_track_to_playlist_songs,
                remove_track_from_playlist,
                update_onboarding_settings,
                get_settings,
                initialize_lastfm,
                get_auth_token,
                poll_session,
                update_now_playing,
                scrobble_track,
                is_connected,
                disconnect_lastfm,
                verify_credentials,
                debug_store,
                debug_session,
                debug_credentials,
                get_last_session,
                save_last_session,
                update_session_progress,
                update_session_volume,
                update_session_current_song,
                clear_last_session
            ])
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
    });
}
