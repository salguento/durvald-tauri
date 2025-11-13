use rusqlite::{ Connection, Result};


#[derive(Debug)]
struct Person {
    name: String,
    data: Option<Vec<u8>>,
}

#[tauri::command]
pub fn create_tables() -> Result<(), String> {
    let conn = Connection::open("music.db3")
        .map_err(|e| format!("Failed to open database: {}", e))?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS person (
            id   INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            data BLOB
        )",
        (),
    ).map_err(|e| format!("Failed to create table: {}", e))?;
    
    let me = Person {
        name: "Steven".to_string(),
        data: None,
    };
    
    conn.execute(
        "INSERT INTO person ( name, data) VALUES ( ?1, ?2)",
        ( &me.name, &me.data),
    ).map_err(|e| format!("Failed to insert data: {}", e))?;

    let mut stmt = conn.prepare("SELECT id, name, data FROM person")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let person_iter = stmt.query_map([], |row| {
        Ok(Person {
            name: row.get(1)?,
            data: row.get(2)?,
        })
    }).map_err(|e| format!("Failed to query data: {}", e))?;

    for person in person_iter {
        let person = person.map_err(|e| format!("Failed to get person: {}", e))?;
        println!("Found person {:?}", person);
    }
    
    Ok(())
}