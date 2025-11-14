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
            id   INTEGER PRIMARY KEY,
            path TEXT
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
