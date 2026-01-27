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
    let mut sorted: Vec<_> = params.iter().collect();
    sorted.sort_by_key(|(k, _)| *k);

    let mut sig = String::new();
    for (k, v) in sorted {
        sig.push_str(k);
        sig.push_str(v);
    }
    sig.push_str(secret);

    format!("{:x}", Md5::digest(sig.as_bytes()))
}

#[tauri::command]
pub async fn initialize_lastfm<R: Runtime>(
    _app: AppHandle<R>,
    api_key: String,
    api_secret: String,
) -> Result<(), String> {
    let guard = SECURE_STORE.lock().unwrap();
    let store_option = guard.as_ref();
    let store = store_option.ok_or("Store not initialized")?;

    store.set("api_key".into(), api_key.into());
    store.save_data().map_err(|e| e.to_string())?;
    store.set_secret("api_secret", &api_secret)?;

    Ok(())
}

#[tauri::command]
pub async fn get_auth_token<R: Runtime>(_app: AppHandle<R>) -> Result<AuthTokenResponse, String> {
    let api_key = get_api_key()?;
    let secret = get_api_secret()?;

    let params = vec![
        ("method", "auth.getToken"),
        ("api_key", &api_key),
        ("format", "json"),
    ];

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
    let api_key = get_api_key()?;
    let secret = get_api_secret()?;

    let params = vec![
        ("method", "auth.getSession"),
        ("api_key", &api_key),
        ("token", &token),
        ("format", "json"),
    ];

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
            ("method", "auth.getSession"),
            ("api_key", &api_key),
            ("token", &token),
            ("api_sig", &sig),
            ("format", "json"),
        ])
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    let json: Value = res.json().await.map_err(|e| e.to_string())?;

    if let Some(session) = json["session"].as_object() {
        let username = session["name"].as_str().unwrap_or("User").to_string();
        let session_key = session["key"].as_str().ok_or("No session key")?.to_string();

        let guard = SECURE_STORE.lock().unwrap();
        let store_option = guard.as_ref();
        let store = store_option.ok_or("Store not initialized")?;
        store.set_secret("session_key", &session_key)?;

        Ok(SessionResponse { username })
    } else {
        let code = json["error"].as_i64().unwrap_or(0);
        if code == 14 {
            Err("Token not authorized yet. Please authorize in browser.".to_string())
        } else {
            Err(format!(
                "Session failed (error {}): {}",
                code,
                json["message"].as_str().unwrap_or("Unknown error")
            ))
        }
    }
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
    let store_option = guard.as_ref();
    store_option
        .and_then(|s| s.get_secret("session_key").ok())
        .is_some()
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
