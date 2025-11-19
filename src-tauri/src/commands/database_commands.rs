use crate::{commands::get_audio_metadata, scan_folder, FileInfo};
use rusqlite::{params, Connection, Result};
use serde::Serialize;
use std::sync::Mutex;
use tauri::State;

use super::metadata_commands::AudioMetadata;

#[derive(Serialize, Clone, Debug)]
pub struct LibraryPath {
    path: String,
}

#[derive(Debug)]
pub struct AppState {
    pub db: Mutex<Connection>,
}

#[tauri::command]
pub fn create_tables(state: State<AppState>) -> Result<(), String> {
    let db = state.db.lock().unwrap();

    db.execute(
        "CREATE TABLE IF NOT EXISTS library_paths (
            path_id   INTEGER PRIMARY KEY,
            path TEXT
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    db.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            settings_id   INTEGER PRIMARY KEY,
            cross_fade BOOL DEFAULT TRUE,
            cross_fade_duration INTEGER DEFAULT 5,
            normalize_volume BOOL DEFAULT TRUE,
            explicit_content BOOL DEFAULT TRUE,
            autoplay BOOL DEFAULT TRUE,
            preferred_audio_quality INTEGER,
            preferrend_audio_source INTEGER,
            download_path TEXT,
            open_on_startup BOOL DEFAULT FALSE,
            minimize_on_close BOOL DEFAULT FALSE
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    db.execute(
        "CREATE TABLE IF NOT EXISTS genres (
            genre_id   INTEGER PRIMARY KEY,
            name TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    db.execute(
        "CREATE TABLE IF NOT EXISTS playlists (
            playlist_id   INTEGER PRIMARY KEY,
            name TEXT,
            artwork TEXT
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    db.execute(
        "CREATE TABLE IF NOT EXISTS songs (
            song_id   INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            artist_id INTEGER NOT NULL,
            artist_name TEXT NOT NULL,
            release_id INTEGER NOT NULL,
            release_name TEXT NOT NULL,
            track_number INTEGER NOT NULL,
            disc_numbert INTEGER NOT NULL DEFAULT 1,
            duration INTEDGER NOT NULL,
            bitrate INTEGER,
            sample_rate INTEGER,
            play_count INTEGER DEFAULT 0,
            last_played DATETIME,
            rating INTEGER,
            lyrics TEXT,
            is_favorite BOOL DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    db.execute(
        "CREATE TABLE IF NOT EXISTS playlist_songs (
            playlist_id   INTEGER NOT NULL,
            song_id INTEGER NOT NULL,
            position INTEGER NOT NULL,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (playlist_id, song_id),
            FOREIGN KEY (playlist_id) REFERENCES playlist(playlist_id) ON DELETE CASCADE,
            FOREIGN KEY (song_id) REFERENCES songs(song_id) ON DELETE CASCADE
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    db.execute(
        "CREATE TABLE IF NOT EXISTS artists (
            id   INTEGER PRIMARY KEY,
            name TEXT
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    db.execute(
        "CREATE TABLE IF NOT EXISTS release_types (
            release_type_id   INTEGER PRIMARY KEY,
            name TEXT
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    db.execute(
        "CREATE TABLE IF NOT EXISTS labels (
            id   INTEGER PRIMARY KEY,
            name TEXT,
            country TEXT
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    db.execute(
        "CREATE TABLE IF NOT EXISTS releases (
            id   INTEGER PRIMARY KEY,
            title TEXT,
            artist_id INTEGER NOT NULL,
            artists_name TEXT,
            release_type_id INTEGER NOT NULL,
            release_date DATETIME,
            total_tracks INTEGER DEFAULT 1,
            total_discs INTEGER DEFAULT 1,
            artwork TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_explicit BOOL,
            is_favorite BOOL,
            rating INTEGER,
            FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE,
            FOREIGN KEY (release_type_id) REFERENCES release_types(release_type_id) ON DELETE CASCADE
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    db.execute(
        "CREATE TABLE IF NOT EXISTS artists_releases (
            id   INTEGER PRIMARY KEY,
            title TEXT,
            artist_id INTEGER NOT NULL,
            artists_name TEXT,
            release_type_id INTEGER NOT NULL,
            release_date DATETIME,
            total_tracks INTEGER DEFAULT 1,
            total_discs INTEGER DEFAULT 1,
            label_id INTEGER NOT NULL,
            artwork TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            description TEXT,
            is_explicit BOOL,
            is_favorite BOOL,
            rating INTEGER,
            spotify_url TEXT,
            apple_music_url TEXT,
            last_fm_url TEXT,
            discog_url TEXT,
            rate_your_music_url TEXT,
            FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE,
            FOREIGN KEY (release_type_id) REFERENCES release_types(release_type_id) ON DELETE CASCADE
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    db.execute(
        "CREATE TABLE IF NOT EXISTS artists_releases (
            id   INTEGER PRIMARY KEY,
            artist_id INTEGER NOT NULL,
            release_id INTEGER NOT NULL,
            FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE,
            FOREIGN KEY (release_id) REFERENCES releases(release_id) ON DELETE CASCADE
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    db.execute(
        "CREATE TABLE IF NOT EXISTS artists_playlists (
            id   INTEGER PRIMARY KEY,
            artist_id INTEGER NOT NULL,
            playlist_id INTEGER NOT NULL,
            FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE,
            FOREIGN KEY (playlist_id) REFERENCES playlists(playlist_id) ON DELETE CASCADE
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    db.execute(
        "CREATE TABLE IF NOT EXISTS labels_artists (
            id   INTEGER PRIMARY KEY,
            artist_id INTEGER NOT NULL,
            label_id INTEGER NOT NULL,
            FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE,
            FOREIGN KEY (label_id) REFERENCES labels(label_id) ON DELETE CASCADE
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    db.execute(
        "CREATE TABLE IF NOT EXISTS play_history (
                history_id INTEGER PRIMARY KEY AUTOINCREMENT,
                song_id INTEGER NOT NULL,
                played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                play_duration INTEGER,
                FOREIGN KEY (song_id) REFERENCES songs(song_id) ON DELETE CASCADE
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn add_path_to_library_paths(
    folder_path: String,
    state: State<AppState>,
) -> Result<(), String> {
    let db = state.db.lock().unwrap();

    let p = LibraryPath { path: folder_path };

    db.execute(
        "INSERT INTO library_paths (path) VALUES ( ?1)",
        params![&p.path],
    )
    .map_err(|e| format!("Failed to insert data: {}", e))?;

    let mut stmt = db
        .prepare("SELECT path_id, path FROM library_paths")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let path_iter = stmt
        .query_map([], |row| Ok(LibraryPath { path: row.get(1)? }))
        .map_err(|e| format!("Failed to query data: {}", e))?;

    for path in path_iter {
        let path = path.map_err(|e| format!("Failed to get person: {}", e))?;
        println!("Found path {:?}", path);
    }
    Ok(())
}

#[tauri::command]
pub fn get_paths_from_library_paths(state: State<AppState>) -> Result<Vec<LibraryPath>, String> {
    let db = state.db.lock().unwrap();

    let mut stmt = db
        .prepare("SELECT path_id, path FROM library_paths")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let path_iter = stmt
        .query_map([], |row| {
            Ok(LibraryPath {
                path: row.get(1)?, // Get the path from column 1
            })
        })
        .map_err(|e| format!("Failed to query data: {}", e))?;

    // Collect all results into a Vec
    let paths: Result<Vec<LibraryPath>, _> = path_iter.collect();
    paths.map_err(|e| format!("Failed to collect results: {}", e))
}

pub fn add_artist(artist: String) -> Result<(), String> {
    let db = Connection::open("music.db3").map_err(|e| format!("Failed to open database: {}", e))?;
    
    // First check if the artist already exists
    let exists: bool = db
        .query_row(
            "SELECT COUNT(*) FROM artists WHERE name = ?1",
            params![&artist],
            |row| Ok(row.get::<_, i64>(0)? > 0)
        )
        .map_err(|e| format!("Failed to check artist existence: {}", e))?;

    // Only insert if the artist doesn't exist
    if !exists {
        db.execute("INSERT INTO artists (name) VALUES (?1)", params![&artist])
            .map_err(|e| format!("Failed to insert artist: {}", e))?;
    }
    // If artist exists, we just return Ok(()) without inserting

    Ok(())
}

pub fn add_release() {}

pub fn add_song() {}

pub fn group_artists(array: Vec<AudioMetadata>) -> Vec<String> {
    let artists: std::collections::HashSet<String> =
        array.into_iter().filter_map(|item| item.artist).collect();

    artists.into_iter().collect()
}

pub fn group_releases() {}

#[tauri::command]
pub async fn update_database(folder_path: String) -> Result<(), String> {
    let all_files: Vec<FileInfo> = scan_folder(folder_path)
        .await
        .map_err(|e| format!("Failed to scan folder: {}", e))?;

    let metadata: Vec<AudioMetadata> = {
        let mut vec = Vec::new();
        for item in all_files {
            let file_metadata: AudioMetadata = get_audio_metadata(item.path)
                .await
                .map_err(|e| format!("Failed to get audio metadata: {}", e))?;
            vec.push(file_metadata)
        }
        vec
    };

    let all_artist = group_artists(metadata);

    for artist in all_artist {
        add_artist(artist).map_err(|e| format!("Failed to add artist: {}", e))?;
    }

    Ok(())
}
