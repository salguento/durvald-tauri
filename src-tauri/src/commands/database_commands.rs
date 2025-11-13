use rusqlite::{ params, Connection, Result};

#[derive(Debug)]
struct LibraryPath {
    path: String
}

#[tauri::command]
pub fn create_tables() -> Result<(), String> {
    let conn = Connection::open("music.db3")
        .map_err(|e| format!("Failed to open database: {}", e))?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS library_paths (
            id   INTEGER PRIMARY KEY,
            path TEXT
        )",
        (),
    ).map_err(|e| format!("Failed to create table: {}", e))?;
    
    let path = LibraryPath {
        path: "".to_string()
    };
    

    conn.execute(
        "INSERT INTO library_paths (path) VALUES ( ?1)",
        params![&path.path],
    ).map_err(|e| format!("Failed to insert data: {}", e))?;
    
    let mut stmt = conn.prepare("SELECT id, path FROM library_paths")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let path_iter = stmt.query_map([], |row| {
        Ok(LibraryPath {
            path: row.get(1)?,
        })
    }).map_err(|e| format!("Failed to query data: {}", e))?;

    for path in path_iter {
        let path = path.map_err(|e| format!("Failed to get person: {}", e))?;
        println!("Found path {:?}", path);
    
}
    Ok(())
}