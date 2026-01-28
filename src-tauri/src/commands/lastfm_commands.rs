use crate::secure_store::SECURE_STORE;
use md5::{Digest, Md5};
use serde::Serialize;
use serde_json::Value;
use std::sync::OnceLock;
use tauri::{AppHandle, Runtime};
use tokio::sync::Mutex as TokioMutex;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthTokenResponse {
    pub token: String,
    pub auth_url: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionResponse {
    pub username: String,
}

static LAST_REQUEST: OnceLock<TokioMutex<std::time::Instant>> = OnceLock::new();

pub fn init_rate_limiter() {
    LAST_REQUEST.get_or_init(|| TokioMutex::new(std::time::Instant::now()));
}

// ✅ SAFE: Explicit guard binding prevents "temporary value dropped" error
fn get_api_secret() -> Result<String, String> {
    let guard = SECURE_STORE.lock().unwrap(); // Bind guard FIRST
    let store_option = guard.as_ref(); // Then access
    let store = store_option.ok_or("Store not initialized")?;
    store.get_secret("api_secret")
}

fn get_api_key() -> Result<String, String> {
    let guard = SECURE_STORE.lock().unwrap();
    let store_option = guard.as_ref();
    let store = store_option.ok_or("Store not initialized")?;

    store
        .get("api_key")
        .and_then(|v| v.as_str().map(String::from))
        .ok_or("API key not configured".to_string())
}

fn get_session_key() -> Result<String, String> {
    let guard = SECURE_STORE.lock().unwrap();
    let store_option = guard.as_ref();
    let store = store_option.ok_or("Store not initialized")?;
    store.get_secret("session_key")
}

fn generate_signature(params: &[(&str, &str)], secret: &str) -> String {
    // ✅ CRITICAL: Sort parameters alphabetically by KEY (Last.fm requirement)
    let mut sorted_params: Vec<(&str, &str)> = params.to_vec();
    sorted_params.sort_by(|a, b| a.0.cmp(b.0));

    // ✅ CRITICAL: Concatenate key+value pairs WITHOUT separators
    let mut sig_string = String::new();
    for (key, value) in sorted_params {
        sig_string.push_str(key);
        sig_string.push_str(value);
    }

    // ✅ CRITICAL: Append API secret at the END
    sig_string.push_str(secret);

    // MD5 hash
    use md5::{Digest, Md5};
    let digest = Md5::new().chain_update(sig_string.as_bytes()).finalize();
    format!("{:x}", digest)
}

#[tauri::command]
pub async fn initialize_lastfm<R: Runtime>(
    _app: AppHandle<R>,
    api_key: String,
    api_secret: String,
) -> Result<(), String> {
    let guard = SECURE_STORE.lock().unwrap();
    let store = guard.as_ref().ok_or("Store not initialized")?;

    // Save API key to filesystem
    store.set("api_key".into(), api_key.into());
    store.save_data().map_err(|e| e.to_string())?;

    // ✅ CRITICAL: Propagate EXACT keychain error to frontend
    match store.set_secret("api_secret", &api_secret) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!(
            "Windows Credential Vault error: {}. Did you approve the security prompt?",
            e
        )),
    }
}

#[tauri::command]
pub async fn verify_credentials<R: Runtime>(_app: AppHandle<R>) -> Result<String, String> {
    let guard = SECURE_STORE.lock().unwrap();
    let store = guard.as_ref().ok_or("Store not initialized")?;

    // Check API key
    let api_key = store
        .get("api_key")
        .and_then(|v| v.as_str().map(String::from))
        .ok_or("API key not found in filesystem")?;

    // ✅ CRITICAL: Show EXACT keychain error
    match store.get_secret("api_secret") {
        Ok(secret) => Ok(format!(
            "✅ Verified! Key: {}... Secret length: {} chars",
            &api_key[..8.min(api_key.len())],
            secret.len()
        )),
        Err(e) => Err(format!("Windows Credential Vault error: {}", e)),
    }
}

#[tauri::command]
pub async fn get_auth_token<R: Runtime>(_app: AppHandle<R>) -> Result<AuthTokenResponse, String> {
    let api_key = get_api_key()?;
    let secret = get_api_secret()?;

    // ✅ Same parameter format as poll_session
    let params = vec![("method", "auth.getToken"), ("api_key", &api_key)];

    let sig = generate_signature(&params, &secret); // ✅ Uses fixed function
    let client = reqwest::Client::new();

    // Rate limiting
    if let Some(last) = LAST_REQUEST.get() {
        let mut guard = last.lock().await;
        let elapsed = guard.elapsed();
        if elapsed < std::time::Duration::from_secs(1) {
            tokio::time::sleep(std::time::Duration::from_secs(1) - elapsed).await;
        }
        *guard = std::time::Instant::now();
    }

    let res = client
        .post("https://ws.audioscrobbler.com/2.0/")
        .form(&[
            ("method", "auth.getToken"),
            ("api_key", &api_key),
            ("api_sig", &sig),
            ("format", "json"),
        ])
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    let json: Value = res
        .json()
        .await
        .map_err(|e| format!("JSON parse error: {}", e))?;

    if let Some(token) = json["token"].as_str() {
        Ok(AuthTokenResponse {
            token: token.to_string(),
            auth_url: format!(
                "https://www.last.fm/api/auth/?api_key={}&token={}",
                api_key, token
            ),
        })
    } else {
        Err(format!(
            "Auth failed (error {}): {}",
            json["error"].as_i64().unwrap_or(0),
            json["message"].as_str().unwrap_or("Unknown error")
        ))
    }
}

#[tauri::command]
pub async fn poll_session<R: Runtime>(
    _app: AppHandle<R>,
    token: String,
) -> Result<SessionResponse, String> {
    println!("\n=== POLL_SESSION DEBUG START ===");

    // Get credentials
    let api_key = get_api_key()?;
    let secret = get_api_secret()?;

    println!(
        "[DEBUG] API Key prefix: {}",
        &api_key[..8.min(api_key.len())]
    );
    println!("[DEBUG] API Secret length: {}", secret.len());
    println!("[DEBUG] Token prefix: {}", &token[..8.min(token.len())]);

    // Build params - MUST BE SORTED ALPHABETICALLY
    let mut params = vec![
        ("api_key", api_key.as_str()),
        ("method", "auth.getSession"),
        ("token", token.as_str()),
    ];

    // Sort parameters alphabetically by key (REQUIRED for Last.fm signature)
    params.sort_by(|a, b| a.0.cmp(b.0));

    println!("[DEBUG] Sorted params:");
    for (key, val) in &params {
        println!("  {} = {}", key, val);
    }

    // Generate signature
    let sig = generate_signature(&params, &secret);
    println!("[DEBUG] Generated signature: {}", sig);

    // Build signature string for verification
    let mut sig_string = String::new();
    for (key, val) in &params {
        sig_string.push_str(key);
        sig_string.push_str(val);
    }
    sig_string.push_str(&secret);
    println!("[DEBUG] Signature string (before MD5): {}", sig_string);

    let client = reqwest::Client::new();

    // Rate limiting
    if let Some(last) = LAST_REQUEST.get() {
        let mut guard = last.lock().await;
        let elapsed = guard.elapsed();
        if elapsed < std::time::Duration::from_secs(1) {
            tokio::time::sleep(std::time::Duration::from_secs(1) - elapsed).await;
        }
        *guard = std::time::Instant::now();
    }

    println!("[DEBUG] Sending request to Last.fm...");
    let res = client
        .post("https://ws.audioscrobbler.com/2.0/")
        .form(&[
            ("method", "auth.getSession"),
            ("api_key", &api_key),
            ("token", &token),
            ("api_sig", &sig),
            ("format", "json"),
        ])
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    let status = res.status();
    println!("[DEBUG] Response status: {}", status);

    let text = res.text().await.map_err(|e| format!("Read error: {}", e))?;
    println!("[DEBUG] Raw response: {}", text);

    println!("=== POLL_SESSION DEBUG END ===\n");

    let json: Value =
        serde_json::from_str(&text).map_err(|e| format!("JSON parse error: {}", e))?;

    // Check for API errors
    if let Some(error_code) = json["error"].as_i64() {
        let error_msg = json["message"].as_str().unwrap_or("Unknown error");
        return Err(format!("Last.fm API error {}: {}", error_code, error_msg));
    }

    // Extract session
    let session = json["session"].as_object().ok_or("No session object")?;
    let username = session["name"].as_str().ok_or("No username")?.to_string();
    let session_key = session["key"].as_str().ok_or("No session key")?.to_string();

    println!(
        "[DEBUG] Got session - username: {}, key length: {}",
        username,
        session_key.len()
    );

    // Store session key
    let guard = SECURE_STORE.lock().unwrap();
    let store = guard.as_ref().ok_or("Store not initialized")?;

    store.set_secret("session_key", &session_key)?;
    println!("[DEBUG] Session key stored successfully");

    Ok(SessionResponse { username })
}

#[tauri::command]
pub async fn update_now_playing<R: Runtime>(
    _app: AppHandle<R>,
    artist: String,
    track: String,
    album: Option<String>,
) -> Result<(), String> {
    let api_key = get_api_key()?;
    let session_key = get_session_key()?;
    let secret = get_api_secret()?;

    let mut params = vec![
        ("method", "track.updateNowPlaying"),
        ("api_key", &api_key),
        ("sk", &session_key),
        ("artist", &artist),
        ("track", &track),
        ("format", "json"),
    ];

    let album_ref = album.as_deref();
    if let Some(a) = album_ref {
        params.push(("album", a));
    }

    let sig = generate_signature(&params, &secret);
    let client = reqwest::Client::new();

    // Rate limiting
    if let Some(last) = LAST_REQUEST.get() {
        let mut guard = last.lock().await;
        let elapsed = guard.elapsed();
        if elapsed < std::time::Duration::from_secs(1) {
            tokio::time::sleep(std::time::Duration::from_secs(1) - elapsed).await;
        }
        *guard = std::time::Instant::now();
    }

    let res = client
        .post("https://ws.audioscrobbler.com/2.0/")
        .form(&[
            ("method", "track.updateNowPlaying"),
            ("api_key", &api_key),
            ("sk", &session_key),
            ("artist", &artist),
            ("track", &track),
            ("api_sig", &sig),
            ("format", "json"),
        ])
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("Last.fm error: {}", res.status()));
    }

    Ok(())
}

#[tauri::command]
pub async fn scrobble_track<R: Runtime>(
    _app: AppHandle<R>,
    artist: String,
    track: String,
    album: Option<String>,
    timestamp: i64,
) -> Result<(), String> {
    let api_key = get_api_key()?;
    let session_key = get_session_key()?;
    let secret = get_api_secret()?;
    let timestamp_str = timestamp.to_string();
    let album_ref = album.as_deref();

    let mut params = vec![
        ("method", "track.scrobble"),
        ("api_key", &api_key),
        ("sk", &session_key),
        ("artist", &artist),
        ("track", &track),
        ("timestamp", &timestamp_str),
        ("format", "json"),
    ];

    if let Some(a) = album_ref {
        params.push(("album", a));
    }

    let sig = generate_signature(&params, &secret);
    let client = reqwest::Client::new();

    // Rate limiting
    if let Some(last) = LAST_REQUEST.get() {
        let mut guard = last.lock().await;
        let elapsed = guard.elapsed();
        if elapsed < std::time::Duration::from_secs(1) {
            tokio::time::sleep(std::time::Duration::from_secs(1) - elapsed).await;
        }
        *guard = std::time::Instant::now();
    }

    let res = client
        .post("https://ws.audioscrobbler.com/2.0/")
        .form(&[
            ("method", "track.scrobble"),
            ("api_key", &api_key),
            ("sk", &session_key),
            ("artist", &artist),
            ("track", &track),
            ("timestamp", &timestamp_str),
            ("api_sig", &sig),
            ("format", "json"),
        ])
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("Scrobble failed: {}", res.status()));
    }

    Ok(())
}

#[tauri::command]
pub async fn is_connected<R: Runtime>(_app: AppHandle<R>) -> bool {
    let guard = SECURE_STORE.lock().unwrap();
    let store = match guard.as_ref() {
        Some(s) => s,
        None => {
            println!("[RUST] is_connected: Store not initialized");
            return false;
        }
    };

    match store.get_secret("session_key") {
        Ok(_) => {
            println!("[RUST] is_connected: Session key found ✓");
            true
        }
        Err(e) => {
            println!("[RUST] is_connected: Session key NOT found: {}", e);
            false
        }
    }
}

#[tauri::command]
pub async fn disconnect_lastfm<R: Runtime>(_app: AppHandle<R>) -> Result<(), String> {
    let guard = SECURE_STORE.lock().unwrap();
    let store_option = guard.as_ref();
    let store = store_option.ok_or("Store not initialized")?;

    let _ = store.delete_secret("session_key");
    store.delete("username");
    store.save_data().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn debug_store<R: Runtime>(_app: AppHandle<R>) -> Result<String, String> {
    let guard = SECURE_STORE.lock().unwrap();

    if guard.is_none() {
        return Err("Store not initialized".to_string());
    }

    let store = guard.as_ref().unwrap();

    // Only access public methods - NO private field access
    match store.get("api_key") {
        Some(val) => {
            if let Some(key) = val.as_str() {
                Ok(format!(
                    "Store OK. Key prefix: {}",
                    &key[..8.min(key.len())]
                ))
            } else {
                Ok("API key exists but not string type".to_string())
            }
        }
        None => Ok("API key not found".to_string()),
    }
}

#[tauri::command]
pub async fn debug_session<R: Runtime>(_app: AppHandle<R>) -> Result<String, String> {
    let guard = SECURE_STORE.lock().unwrap();
    let store = guard.as_ref().ok_or("Store not initialized")?;

    // Check if session key exists
    match store.get_secret("session_key") {
        Ok(key) => Ok(format!("Session key found (length: {})", key.len())),
        Err(e) => Ok(format!("Session key NOT found: {}", e)),
    }
}

#[tauri::command]
pub async fn debug_credentials<R: Runtime>(_app: AppHandle<R>) -> Result<String, String> {
    let api_key = get_api_key()?;
    let secret = get_api_secret()?;

    // Check for whitespace
    let key_has_whitespace = api_key.trim() != api_key;
    let secret_has_whitespace = secret.trim() != secret;

    Ok(format!(
        "API Key prefix: {}\nKey length: {}\nKey has whitespace: {}\n\nAPI Secret length: {}\nSecret has whitespace: {}",
        &api_key[..8.min(api_key.len())],
        api_key.len(),
        key_has_whitespace,
        secret.len(),
        secret_has_whitespace
    ))
}
