use crate::{commands::get_audio_metadata, scan_folder, FileInfo};
use rusqlite::OptionalExtension;
use rusqlite::{params, Connection, Result};
use serde::Serialize;
use std::sync::Mutex;
use tauri::State;

use super::metadata_commands::AudioMetadata;

#[derive(Serialize, Clone, Debug)]
pub struct LibraryPath {
    path: String,
}

#[derive(Serialize, Clone, Debug, Hash, Eq, PartialEq)]
pub struct ReleaseGroup {
    title: String,
    artist: String,
    cover_image_base64: String,
    tracks: u32,
    disc: u32,
    date: u32,
    duration: u64,
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
            path TEXT UNIQUE
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
            artist_id   INTEGER PRIMARY KEY,
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
            artist_name TEXT NOT NULL,
            release_date DATETIME,
            total_tracks INTEGER DEFAULT 1,
            total_discs INTEGER DEFAULT 1,
            duration INTEGER,
            artwork TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_favorite BOOL DEFAULT FALSE,
            rating INTEGER DEFAULT NULL,
            FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE
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
        "INSERT OR IGNORE INTO library_paths (path) VALUES ( ?1)",
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
    let db =
        Connection::open("music.db3").map_err(|e| format!("Failed to open database: {}", e))?;

    // First check if the artist already exists
    let exists: bool = db
        .query_row(
            "SELECT COUNT(*) FROM artists WHERE name = ?1",
            params![&artist],
            |row| Ok(row.get::<_, i64>(0)? > 0),
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

pub fn add_release(release: ReleaseGroup) -> Result<(), String> {
    let db =
        Connection::open("music.db3").map_err(|e| format!("Failed to open database: {}", e))?;

    // First get the artist_id from the artists table
    let artist_id: Option<i64> = db
        .query_row(
            "SELECT artist_id FROM artists WHERE name = ?1",
            params![&release.artist],
            |row| row.get(0),
        )
        .optional()
        .map_err(|e| format!("Failed to query artist: {}", e))?;

    // If artist doesn't exist, we can't add the release (or you might want to handle this differently)
    let artist_id = match artist_id {
        Some(id) => id,
        None => {
            return Err(format!("Artist '{}' not found in database", release.artist));
        }
    };

    // Check if the release already exists for this artist
    let exists: bool = db
        .query_row(
            "SELECT COUNT(*) FROM releases WHERE title = ?1 AND artist_id = ?2",
            params![&release.title, artist_id],
            |row| Ok(row.get::<_, i64>(0)? > 0),
        )
        .map_err(|e| format!("Failed to check release existence: {}", e))?;

    // Only insert if the release doesn't exist
    if !exists {
        db.execute(
            "INSERT INTO releases (title, artist_id, artist_name, release_date, total_tracks, total_discs, duration, artwork) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![&release.title, artist_id, &release.artist, &release.date, &release.tracks, &release.disc, &release.duration, &release.cover_image_base64]
        )
        .map_err(|e| format!("Failed to insert release: {}", e))?;
    }
    Ok(())
}

pub fn add_song() {}

pub fn group_artists(array: &Vec<AudioMetadata>) -> Vec<String> {
    let artists: std::collections::HashSet<String> = array
        .into_iter()
        .filter_map(|item| item.artist.as_ref().cloned())
        .collect();

    artists.into_iter().collect()
}

pub fn group_releases(array: &Vec<AudioMetadata>) -> Vec<ReleaseGroup> {
    use std::collections::HashMap;

    let mut release_map: HashMap<String, ReleaseGroup> = HashMap::new();

    for item in array {
        if let (Some(title), Some(artist), Some(artwork), Some(year)) = (
            &item.release,
            &item.artist,
            &item.cover_image_base64,
            &item.year,
        ) {
            // Create a key based on release title, artist, and year to group by
            let key = format!("{}|{}|{}", title, artist, year);

            // Get or create the ReleaseGroup entry
            let release_group = release_map.entry(key).or_insert_with(|| ReleaseGroup {
                title: title.clone(),
                artist: artist.clone(),
                cover_image_base64: artwork.clone(),
                date: year.clone(),
                duration: 0, // Initialize to 0
                tracks: 0,   // Initialize to 0
                disc: 1,     // Initialize to 0
            });

            // Accumulate the values
            release_group.duration += item.duration as u64;
            release_group.tracks += 1; // Count each track
            if let Some(disc) = item.disc {
                release_group.disc = release_group.disc.max(disc); // Use the highest disc number
            }
        }
    }

    release_map.into_values().collect()
}

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

    let all_artist = group_artists(&metadata);

    for artist in all_artist {
        add_artist(artist).map_err(|e| format!("Failed to add artist: {}", e))?;
    }

    let all_releases = group_releases(&metadata);

    for release in all_releases {
        println!("{:?}", release);
        add_release(release).map_err(|e| format!("Failed to add release: {}", e))?;
    }

    Ok(())
}
