use crate::{commands::get_audio_metadata, scan_folder, FileInfo};
use chrono::Utc;
use rusqlite::OptionalExtension;
use rusqlite::{params, Connection, Result};
use serde::Serialize;

use super::metadata_commands::AudioMetadata;

#[derive(Serialize, Clone, Debug)]
pub struct LibraryPath {
    path: String,
}

#[derive(Serialize, Clone, Debug)]
pub struct Releases {
    id: u64,
    title: String,
    artist_id: u64,
    artist_name: String,
    release_date: String,
    total_tracks: u8,
    total_discs: u8,
    duration: u64,
    artwork: String,
    is_favorite: bool,
    rating: Option<u8>,
    created_at: String,
    updated_at: String,
}

#[derive(Serialize, Clone, Debug)]
pub struct ArtistItem {
    artist_id: u64,
    artist_name: String,
}

#[derive(Serialize, Clone, Debug)]
pub struct PlayHistory {
    history_id: u64,
    song_id: u64,
    played_at: String,
    duration: u64,
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

#[derive(Serialize, Clone, Debug, Hash, Eq, PartialEq)]
pub struct SongItem {
    song_id: u64,
    title: String,
    artwork: String,
    artist_id: u64,
    artist_name: String,
    release_id: u64,
    release_title: String,
    track_number: u8,
    disc_number: u8,
    duration: u64,
    bitrate: Option<u16>,
    sample_rate: Option<u16>,
    play_count: u64,
    last_played: Option<String>,
    rating: Option<u8>,
    lyrics: Option<String>,
    is_favorite: bool,
    is_hidden: bool,
    sugest_less: bool,
    file_path: String,
    created_at: String,
    updated_at: String,
}

#[tauri::command]
pub fn create_tables() -> Result<(), String> {
    let db =
        Connection::open("music.db3").map_err(|e| format!("Failed to open database: {}", e))?;

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
        "CREATE TABLE IF NOT EXISTS queue (
            queue_id INTEGER PRIMARY KEY AUTOINCREMENT,
            song_id INTEGER NOT NULL,
            position INTEGER NOT NULL UNIQUE,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (song_id) REFERENCES songs(song_id) ON DELETE CASCADE
        )",
        (),
    )
    .map_err(|e| format!("Failed to create table: {}", e))?;

    db.execute(
        "CREATE TABLE IF NOT EXISTS listening_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            song_id INTEGER NOT NULL,
            played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            play_duration INTEGER, -- Seconds actually listened (optional)
            FOREIGN KEY (song_id) REFERENCES songs(song_id) ON DELETE CASCADE
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
            artwork TEXT,
            artist_id INTEGER NOT NULL,
            artist_name TEXT NOT NULL,
            release_id INTEGER NOT NULL,
            release_title TEXT NOT NULL,
            track_number INTEGER NOT NULL,
            disc_number INTEGER NOT NULL DEFAULT 1,
            duration INTEDGER NOT NULL,
            bitrate INTEGER,
            sample_rate INTEGER,
            play_count INTEGER DEFAULT 0,
            last_played DATETIME,
            rating INTEGER DEFAULT NULL,
            lyrics TEXT,
            is_favorite BOOL DEFAULT FALSE,
            is_hidden BOOL DEFAULT FALSE,
            sugest_less BOOL DEFAULT FALSE,
            file_path TEXT NOT NULL,
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
pub fn add_path_to_library_paths(folder_path: String) -> Result<(), String> {
    let db =
        Connection::open("music.db3").map_err(|e| format!("Failed to open database: {}", e))?;

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
pub fn get_paths_from_library_paths() -> Result<Vec<LibraryPath>, String> {
    let db =
        Connection::open("music.db3").map_err(|e| format!("Failed to open database: {}", e))?;

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

pub fn add_song(song: AudioMetadata) -> Result<(), String> {
    let db =
        Connection::open("music.db3").map_err(|e| format!("Failed to open database: {}", e))?;

    // Get artist_id (artist must exist)
    let artist_id: i64 = match db
        .query_row(
            "SELECT artist_id FROM artists WHERE name = ?1",
            params![&song.artist],
            |row| row.get(0),
        )
        .optional()
        .map_err(|e| format!("Failed to query artist: {}", e))?
    {
        Some(id) => id,
        None => return Err(format!("Artist '{:?}' not found", song.artist)),
    };

    // Get release_id (release must exist)
    let release_id: i64 = match db
        .query_row(
            "SELECT id FROM releases WHERE title = ?1 AND artist_id = ?2",
            params![&song.release, artist_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(|e| format!("Failed to query release: {}", e))?
    {
        Some(id) => id,
        None => return Err(format!("Release '{:?}' not found", song.release)),
    };

    // Check if song exists and insert if not
    let exists: bool = db
        .query_row(
            "SELECT COUNT(*) FROM songs WHERE title = ?1 AND artist_id = ?2 AND release_id = ?3",
            params![&song.title, artist_id, release_id],
            |row| Ok(row.get::<_, i64>(0)? > 0),
        )
        .map_err(|e| format!("Failed to check song existence: {}", e))?;

    if !exists {
        db.execute(
            "INSERT INTO songs (title, artwork, artist_id, artist_name, release_id, release_title, duration, track_number, disc_number, file_path) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                &song.title,
                &song.cover_image_base64,
                artist_id,
                &song.artist,
                release_id,
                &song.release,
                &song.duration,
                &song.track.unwrap_or(1),
                &song.disc.unwrap_or(1),
                &song.file_path
            ]
        )
        .map_err(|e| format!("Failed to insert song: {}", e))?;
    }

    Ok(())
}

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
        add_release(release).map_err(|e| format!("Failed to add release: {}", e))?;
    }

    for i in metadata {
        add_song(i).map_err(|e| format!("Failed to add song: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
pub fn get_releases() -> Result<Vec<Releases>, String> {
    let db =
        Connection::open("music.db3").map_err(|e| format!("Failed to open database: {}", e))?;

    let mut stmt = db
        .prepare("SELECT * FROM releases")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let releases_iter = stmt
        .query_map([], |row| {
            Ok(Releases {
                id: row.get(0)?,
                title: row.get(1)?,
                artist_id: row.get(2)?,
                artist_name: row.get(3)?,
                release_date: row.get::<_, i64>(4)?.to_string(),
                total_tracks: row.get(5)?,
                total_discs: row.get(6)?,
                duration: row.get(7)?,
                artwork: row.get(8)?,
                created_at: row.get::<_, String>(9)?.to_string(),
                updated_at: row.get::<_, String>(10)?.to_string(),
                is_favorite: row.get(11)?,
                rating: row.get(12)?,
            })
        })
        .map_err(|e| format!("Failed to query data: {}", e))?;

    // Collect all results into a Vec
    let releases: Result<Vec<Releases>, _> = releases_iter.collect();
    releases.map_err(|e| format!("Failed to collect results: {}", e))
}

#[tauri::command]
pub fn get_release_by_id(release_id: &str) -> Result<Releases, String> {
    let db =
        Connection::open("music.db3").map_err(|e| format!("Failed to open database: {}", e))?;

    db.query_row(
        "SELECT * FROM releases WHERE id = ?1",
        [release_id],
        |row| {
            Ok(Releases {
                id: row.get(0)?,
                title: row.get(1)?,
                artist_id: row.get(2)?,
                artist_name: row.get(3)?,
                release_date: row.get::<_, i64>(4)?.to_string(),
                total_tracks: row.get(5)?,
                total_discs: row.get(6)?,
                duration: row.get(7)?,
                artwork: row.get(8)?,
                created_at: row.get::<_, String>(9)?.to_string(),
                updated_at: row.get::<_, String>(10)?.to_string(),
                is_favorite: row.get(11)?,
                rating: row.get(12)?,
            })
        },
    )
    .map_err(|e| format!("Failed to query release: {}", e))
}

#[tauri::command]
pub fn get_songs_by_release_id(release_id: &str) -> Result<Vec<SongItem>, String> {
    let db =
        Connection::open("music.db3").map_err(|e| format!("Failed to open database: {}", e))?;

    let mut stmt = db
        .prepare("SELECT * FROM songs WHERE release_id = ?1")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let song_iter = stmt
        .query_map([release_id], |row| {
            Ok(SongItem {
                song_id: row.get(0)?,
                title: row.get(1)?,
                artwork: row.get(2)?,
                artist_id: row.get(3)?,
                artist_name: row.get(4)?,
                release_id: row.get(5)?,
                release_title: row.get(6)?,
                track_number: row.get(7)?,
                disc_number: row.get(8)?,
                duration: row.get::<_, f64>(9)? as u64,
                bitrate: row.get(10)?,
                sample_rate: row.get(11)?,
                play_count: row.get(12)?,
                last_played: row.get(13)?,
                rating: row.get(14)?,
                lyrics: row.get(15)?,
                is_favorite: row.get(16)?,
                is_hidden: row.get(17)?,
                sugest_less: row.get(18)?,
                file_path: row.get(19)?,
                created_at: row.get::<_, String>(20)?.to_string(),
                updated_at: row.get::<_, String>(21)?.to_string(),
            })
        })
        .map_err(|e| format!("Failed to query songs: {}", e))?;

    let mut songs = Vec::new();
    for song in song_iter {
        songs.push(song.map_err(|e| format!("Failed to process song row: {}", e))?);
    }

    Ok(songs)
}

#[tauri::command]
pub fn get_song_by_id(song_id: &str) -> Result<Vec<SongItem>, String> {
    let db =
        Connection::open("music.db3").map_err(|e| format!("Failed to open database: {}", e))?;

    let mut stmt = db
        .prepare("SELECT * FROM songs WHERE song_id = ?1")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let song_iter = stmt
        .query_map([song_id], |row| {
            Ok(SongItem {
                song_id: row.get(0)?,
                title: row.get(1)?,
                artwork: row.get(2)?,
                artist_id: row.get(3)?,
                artist_name: row.get(4)?,
                release_id: row.get(5)?,
                release_title: row.get(6)?,
                track_number: row.get(7)?,
                disc_number: row.get(8)?,
                duration: row.get::<_, f64>(9)? as u64,
                bitrate: row.get(10)?,
                sample_rate: row.get(11)?,
                play_count: row.get(12)?,
                last_played: row.get(13)?,
                rating: row.get(14)?,
                lyrics: row.get(15)?,
                is_favorite: row.get(16)?,
                is_hidden: row.get(17)?,
                sugest_less: row.get(18)?,
                file_path: row.get(19)?,
                created_at: row.get::<_, String>(20)?.to_string(),
                updated_at: row.get::<_, String>(21)?.to_string(),
            })
        })
        .map_err(|e| format!("Failed to query songs: {}", e))?;

    let mut songs = Vec::new();
    for song in song_iter {
        songs.push(song.map_err(|e| format!("Failed to process song row: {}", e))?);
    }

    Ok(songs)
}

#[tauri::command]
pub fn add_song_to_history(song_id: u64, duration: u64) -> Result<(), String> {
    let db =
        Connection::open("music.db3").map_err(|e| format!("Failed to open database: {}", e))?;

    let played_at = Utc::now().to_rfc3339();

    db.execute(
        "INSERT INTO play_history (song_id, played_at, play_duration) VALUES (?1, ?2, ?3)",
        params![song_id, played_at, duration,],
    )
    .map_err(|e| format!("Failed to insert song to history: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn get_play_history() -> Result<Vec<PlayHistory>, String> {
    let db =
        Connection::open("music.db3").map_err(|e| format!("Failed to open database: {}", e))?;

    let mut stmt = db
        .prepare("SELECT * FROM play_history")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let history = stmt
        .query_map([], |row| {
            Ok(PlayHistory {
                history_id: row.get(0)?,
                song_id: row.get(1)?,
                played_at: row.get(2)?,
                duration: row.get(3)?,
            })
        })
        .map_err(|e| format!("Failed to query data: {}", e))?;

    // Collect all results into a Vec
    let mut results = Vec::new();
    for item in history {
        results.push(item.map_err(|e| format!("Failed to get row: {}", e))?);
    }

    Ok(results)
}

#[tauri::command]
pub fn remove_song_from_history(history_id: u64) -> Result<(), String> {
    let db =
        Connection::open("music.db3").map_err(|e| format!("Failed to open database: {}", e))?;

    db.execute(
        "DELETE FROM play_history WHERE history_id = ?1 ",
        params![history_id],
    )
    .map_err(|e| format!("Failed to insert song to history: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn favorite_song(song_id: u64) -> Result<(), String> {
    let db =
        Connection::open("music.db3").map_err(|e| format!("Failed to open database: {}", e))?;

    db.execute(
        "UPDATE songs SET is_favorite = NOT is_favorite, updated_at = CURRENT_TIMESTAMP WHERE song_id = ?1 ",
        params![song_id],
    )
    .map_err(|e| format!("Failed to insert song to history: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn get_all_tracks() -> Result<Vec<SongItem>, String> {
    let db =
        Connection::open("music.db3").map_err(|e| format!("Failed to open database: {}", e))?;

    let mut tracks = db
        .prepare("SELECT * FROM songs")
        .map_err(|e| format!("Failed retrieve tracks: {}", e))?;

    let tracks_map = tracks
        .query_map([], |row| {
            Ok(SongItem {
                song_id: row.get(0)?,
                title: row.get(1)?,
                artwork: row.get(2)?,
                artist_id: row.get(3)?,
                artist_name: row.get(4)?,
                release_id: row.get(5)?,
                release_title: row.get(6)?,
                track_number: row.get(7)?,
                disc_number: row.get(8)?,
                duration: row.get::<_, f64>(9)? as u64,
                bitrate: row.get(10)?,
                sample_rate: row.get(11)?,
                play_count: row.get(12)?,
                last_played: row.get(13)?,
                rating: row.get(14)?,
                lyrics: row.get(15)?,
                is_favorite: row.get(16)?,
                is_hidden: row.get(17)?,
                sugest_less: row.get(18)?,
                file_path: row.get(19)?,
                created_at: row.get::<_, String>(20)?.to_string(),
                updated_at: row.get::<_, String>(21)?.to_string(),
            })
        })
        .map_err(|e| format!("Failed to query data: {}", e))?;

    let mut results = Vec::new();
    for item in tracks_map {
        results.push(item.map_err(|e| format!("Failed to get row: {}", e))?);
    }
    Ok(results)
}

#[tauri::command]
pub fn get_all_releases() -> Result<Vec<Releases>, String> {
    let db =
        Connection::open("music.db3").map_err(|e| format!("Failed to open database: {}", e))?;

    let mut releases = db
        .prepare("SELECT * FROM releases")
        .map_err(|e| format!("Failed retrieve releases: {}", e))?;

    let releases_map = releases
        .query_map([], |row| {
            Ok(Releases {
                id: row.get(0)?,
                title: row.get(1)?,
                artist_id: row.get(2)?,
                artist_name: row.get(3)?,
                release_date: row.get::<_, i64>(4)?.to_string(),
                total_tracks: row.get(5)?,
                total_discs: row.get(6)?,
                duration: row.get(7)?,
                artwork: row.get(8)?,
                created_at: row.get::<_, String>(9)?.to_string(),
                updated_at: row.get::<_, String>(10)?.to_string(),
                is_favorite: row.get(11)?,
                rating: row.get(12)?,
            })
        })
        .map_err(|e| format!("Failed to query data: {}", e))?;

    let mut results = Vec::new();
    for item in releases_map {
        results.push(item.map_err(|e| format!("Failed to get row: {}", e))?);
    }
    Ok(results)
}

#[tauri::command]
pub fn get_all_artists() -> Result<Vec<ArtistItem>, String> {
    let db =
        Connection::open("music.db3").map_err(|e| format!("Failed to open database: {}", e))?;

    let mut artists = db
        .prepare("SELECT * FROM artists")
        .map_err(|e| format!("Failed retrieve artists: {}", e))?;

    let artists_map = artists
        .query_map([], |row| {
            Ok(ArtistItem {
                artist_id: row.get(0)?,
                artist_name: row.get(1)?,
            })
        })
        .map_err(|e| format!("Failed to query data: {}", e))?;

    let mut results = Vec::new();
    for item in artists_map {
        results.push(item.map_err(|e| format!("Failed to get row: {}", e))?);
    }
    Ok(results)
}
