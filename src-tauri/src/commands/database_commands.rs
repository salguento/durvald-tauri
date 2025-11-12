use tauri::{State};
use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

// Define your data structures
#[derive(Debug, Serialize, Deserialize)]
pub struct Song {
    id: Option<i64>,
    title: String,
    artist: String,
    album: String,
    file_path: String,
    duration: f64,
}

// Database connection state
pub struct DbConnection(pub Mutex<Connection>);

#[tauri::command]
pub fn get_all_songs(db: State<DbConnection>) -> Result<Vec<Song>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, title, artist, album, file_path, duration FROM songs"
    ).map_err(|e| e.to_string())?;
    
    let song_iter = stmt.query_map([], |row| {
        Ok(Song {
            id: row.get(0)?,
            title: row.get(1)?,
            artist: row.get(2)?,
            album: row.get(3)?,
            file_path: row.get(4)?,
            duration: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut songs = Vec::new();
    for song in song_iter {
        songs.push(song.map_err(|e| e.to_string())?);
    }
    
    Ok(songs)
}

#[tauri::command]
pub fn add_song(
    song: Song,
    db: State<DbConnection>,
) -> Result<i64, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT INTO songs (title, artist, album, file_path, duration) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![song.title, song.artist, song.album, song.file_path, song.duration],
    ).map_err(|e| e.to_string())?;
    
    let id = conn.last_insert_rowid();
    Ok(id)
}

#[tauri::command]
pub fn create_tables(db_state: State<'_, DbConnection>) -> Result<String, String> {
    let conn = db_state.0.lock().map_err(|e| e.to_string())?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS songs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            artist TEXT NOT NULL,
            album TEXT NOT NULL,
            file_path TEXT UNIQUE NOT NULL,
            duration REAL NOT NULL,
            play_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| e.to_string())?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS playlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| e.to_string())?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS playlist_songs (
            playlist_id INTEGER,
            song_id INTEGER,
            position INTEGER,
            FOREIGN KEY(playlist_id) REFERENCES playlists(id),
            FOREIGN KEY(song_id) REFERENCES songs(id),
            PRIMARY KEY (playlist_id, song_id)
        )",
        [],
    ).map_err(|e| e.to_string())?;
    
    Ok("Tables created successfully".to_string())
}

