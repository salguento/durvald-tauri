use rusqlite::{params, Connection, Result};
use serde::Serialize;
use std::sync::Mutex;
use tauri::State;

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
        "CREATE TABLE IF NOT EXISTS audio_quality (
            id   INTEGER PRIMARY KEY,
            value TEXT
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    db.execute(
        "CREATE TABLE IF NOT EXISTS audio_sources (
            id   INTEGER PRIMARY KEY,
            name TEXT
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
            title TEXT,
            artist_id INTEGER NOT NULL,
            release_id INTEGER NOT NULL,
            track_number INTEGER NOT NULL,
            disc_numbert INTEGER NOT NULL DEFAULT 1,
            duration INTEDGER NOT NULL,
            preferred_file_path TEXT,
            preferred_file_format INTEGER,
            preferred_file_size INTEGER,
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
            name TEXT,
            image TEXT,
            bio TEXT,
            formed_year INTEGER,
            birthplace TEXT,
            is_favorite BOOL,
            spotify_url TEXT,
            apple_music_url TEXT,
            discogs_url TEXT,
            last_fm_url TEXT,
            rate_your_music_url TEXT,
            current_location TEXT,
            birthday DATETIME
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

    db.execute(
        "CREATE TABLE IF NOT EXISTS file_format (
            id   INTEGER PRIMARY KEY,
            name TEXT
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    db.execute(
        "CREATE TABLE IF NOT EXISTS sample_rate (
            id   INTEGER PRIMARY KEY,
            value TEXT
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    db.execute(
        "CREATE TABLE IF NOT EXISTS bitrate (
            id   INTEGER PRIMARY KEY,
            value TEXT
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
        .prepare("SELECT id, path FROM library_paths")
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
        .prepare("SELECT id, path FROM library_paths")
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


