use crate::secure_store::SECURE_STORE;
use serde::Serialize;
use serde_json::Value;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Runtime};

// ✅ Lock-free rate limiter: enforces Last.fm's 1 request/second limit
static LAST_REQUEST_MS: AtomicU64 = AtomicU64::new(0);

async fn enforce_rate_limit() -> Result<(), String> {
    loop {
        let now_ms = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| format!("Time error: {}", e))?
            .as_millis() as u64;

        let last_ms = LAST_REQUEST_MS.load(Ordering::SeqCst);
        let elapsed_ms = now_ms.saturating_sub(last_ms);

        if elapsed_ms >= 1000 {
            if LAST_REQUEST_MS
                .compare_exchange(last_ms, now_ms, Ordering::SeqCst, Ordering::SeqCst)
                .is_ok()
            {
                return Ok(());
            }
        } else {
            let wait_ms = 1000 - elapsed_ms;
            tokio::time::sleep(Duration::from_millis(wait_ms)).await;
        }
    }
}

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

fn get_api_secret() -> Result<String, String> {
    let guard = SECURE_STORE.lock().unwrap();
    let store = guard.as_ref().ok_or("Store not initialized")?;
    store.get_secret("api_secret")
}

fn get_api_key() -> Result<String, String> {
    let guard = SECURE_STORE.lock().unwrap();
    let store = guard.as_ref().ok_or("Store not initialized")?;

    store
        .get("api_key")
        .and_then(|v| v.as_str().map(String::from))
        .ok_or("API key not configured".to_string())
}

fn get_session_key() -> Result<String, String> {
    let guard = SECURE_STORE.lock().unwrap();
    let store = guard.as_ref().ok_or("Store not initialized")?;
    store.get_secret("session_key")
}

fn generate_signature(params: &[(&str, &str)], secret: &str) -> String {
    let mut sorted_params: Vec<(&str, &str)> = params.to_vec();
    sorted_params.sort_by(|a, b| a.0.cmp(b.0));

    let mut sig_string = String::new();
    for (key, value) in sorted_params {
        sig_string.push_str(key);
        sig_string.push_str(value);
    }
    sig_string.push_str(secret);

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

    store.set("api_key".into(), api_key.into());
    store.save_data().map_err(|e| e.to_string())?;
    store.set_secret("api_secret", &api_secret).map_err(|e| {
        format!(
            "Credential storage failed: {}. Did you approve the security prompt?",
            e
        )
    })
}

#[tauri::command]
pub async fn verify_credentials<R: Runtime>(_app: AppHandle<R>) -> Result<String, String> {
    let guard = SECURE_STORE.lock().unwrap();
    let store = guard.as_ref().ok_or("Store not initialized")?;

    let api_key = store
        .get("api_key")
        .and_then(|v| v.as_str().map(String::from))
        .ok_or("API key not found")?;

    let secret = store.get_secret("api_secret")?;
    Ok(format!(
        "✅ Verified! Key: {}... Secret: {} chars",
        &api_key[..8.min(api_key.len())],
        secret.len()
    ))
}

#[tauri::command]
pub async fn get_auth_token<R: Runtime>(_app: AppHandle<R>) -> Result<AuthTokenResponse, String> {
    enforce_rate_limit().await?;

    let api_key = get_api_key()?;
    let secret = get_api_secret()?;

    let params = vec![("method", "auth.getToken"), ("api_key", &api_key)];
    let sig = generate_signature(&params, &secret);

    let client = reqwest::Client::new();
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
    enforce_rate_limit().await?;

    let api_key = get_api_key()?;
    let secret = get_api_secret()?;

    let mut params = vec![
        ("api_key", api_key.as_str()),
        ("method", "auth.getSession"),
        ("token", token.as_str()),
    ];
    params.sort_by(|a, b| a.0.cmp(b.0));
    let sig = generate_signature(&params, &secret);

    let client = reqwest::Client::new();
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

    let text = res.text().await.map_err(|e| format!("Read error: {}", e))?;
    let json: Value = serde_json::from_str(&text).map_err(|e| {
        format!(
            "Invalid JSON response: {}. Raw preview: {}",
            e,
            &text[..text.len().min(80)]
        )
    })?;

    if let Some(code) = json["error"].as_i64() {
        let msg = json["message"].as_str().unwrap_or("Unknown error");
        return Err(format!("Last.fm error {}: {}", code, msg));
    }

    let session = json["session"].as_object().ok_or("No session object")?;
    let username = session["name"].as_str().ok_or("No username")?.to_string();
    let session_key = session["key"].as_str().ok_or("No session key")?.to_string();

    let guard = SECURE_STORE.lock().unwrap();
    let store = guard.as_ref().ok_or("Store not initialized")?;
    store.set_secret("session_key", &session_key)?;

    Ok(SessionResponse { username })
}

#[tauri::command]
pub async fn update_now_playing<R: Runtime>(
    _app: AppHandle<R>,
    artist: String,
    track: String,
    album: Option<String>,
) -> Result<(), String> {
    enforce_rate_limit().await?;

    // ✅ Trim inputs (signature is whitespace-sensitive)
    let artist = artist.trim().to_string();
    let track = track.trim().to_string();
    let album = album.and_then(|a| {
        let trimmed = a.trim().to_string();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed)
        }
    });

    let session_key = get_session_key()?;
    let api_key = get_api_key()?;
    let secret = get_api_secret()?;

    // ✅ CRITICAL FIX: Signature params EXCLUDE 'format' (Last.fm auth spec requirement)
    let mut params = vec![
        ("api_key", api_key.as_str()),
        ("artist", &artist),
        ("method", "track.updateNowPlaying"),
        ("sk", session_key.as_str()),
        ("track", &track),
    ];

    if let Some(ref a) = album {
        params.push(("album", a.as_str()));
    }

    // Sort alphabetically (Last.fm requirement)
    params.sort_by(|a, b| a.0.cmp(b.0));
    let sig = generate_signature(&params, &secret);

    // ✅ Create HTTP client
    let client = reqwest::Client::new();

    // ✅ 'format' ONLY in POST body (NOT in signature params)
    let mut form = vec![
        ("method", "track.updateNowPlaying"),
        ("api_key", &api_key),
        ("api_sig", &sig),
        ("sk", &session_key),
        ("artist", &artist),
        ("track", &track),
        ("format", "json"), // ← ONLY in POST body to get JSON response
    ];

    if let Some(ref a) = album {
        form.push(("album", a));
    }

    let res = client
        .post("https://ws.audioscrobbler.com/2.0/")
        .form(&form)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    let text = res.text().await.map_err(|e| format!("Read error: {}", e))?;
    let json: Value = serde_json::from_str(&text).map_err(|e| {
        format!(
            "Invalid JSON: {}. Preview: {}",
            e,
            &text[..text.len().min(80)]
        )
    })?;

    if let Some(code) = json["error"].as_i64() {
        let msg = json["message"].as_str().unwrap_or("Unknown error");
        return Err(format!("Last.fm error {}: {}", code, msg));
    }

    Ok(())
}

#[tauri::command]
pub async fn scrobble_track<R: Runtime>(
    _app: AppHandle<R>,
    artist: String,
    track: String,
    album: Option<String>,
    timestamp: u64,
) -> Result<(), String> {
    enforce_rate_limit().await?;

    let artist = artist.trim().to_string();
    let track = track.trim().to_string();
    let album = album.and_then(|a| {
        let trimmed = a.trim().to_string();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed)
        }
    });
    let timestamp_str = timestamp.to_string();

    let session_key = get_session_key()?;
    let api_key = get_api_key()?;
    let secret = get_api_secret()?;

    // ✅ CRITICAL FIX: Signature params EXCLUDE 'format'
    let mut params = vec![
        ("api_key", api_key.as_str()),
        ("artist", &artist),
        ("method", "track.scrobble"),
        ("sk", session_key.as_str()),
        ("timestamp", &timestamp_str),
        ("track", &track),
    ];

    if let Some(ref a) = album {
        params.push(("album", a.as_str()));
    }

    params.sort_by(|a, b| a.0.cmp(b.0));
    let sig = generate_signature(&params, &secret);

    // ✅ Create HTTP client
    let client = reqwest::Client::new();

    // ✅ 'format' ONLY in POST body
    let mut form = vec![
        ("method", "track.scrobble"),
        ("api_key", &api_key),
        ("api_sig", &sig),
        ("sk", &session_key),
        ("artist", &artist),
        ("track", &track),
        ("timestamp", &timestamp_str),
        ("format", "json"), // ← ONLY in POST body
    ];

    if let Some(ref a) = album {
        form.push(("album", a));
    }

    let res = client
        .post("https://ws.audioscrobbler.com/2.0/")
        .form(&form)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    let text = res.text().await.map_err(|e| format!("Read error: {}", e))?;
    let json: Value = serde_json::from_str(&text).map_err(|e| {
        format!(
            "Invalid JSON: {}. Preview: {}",
            e,
            &text[..text.len().min(80)]
        )
    })?;

    if let Some(code) = json["error"].as_i64() {
        let msg = json["message"].as_str().unwrap_or("Unknown error");
        return Err(format!("Last.fm error {}: {}", code, msg));
    }

    Ok(())
}

#[tauri::command]
pub async fn is_connected<R: Runtime>(_app: AppHandle<R>) -> bool {
    let guard = SECURE_STORE.lock().unwrap();
    let store = match guard.as_ref() {
        Some(s) => s,
        None => return false,
    };
    store.get_secret("session_key").is_ok()
}

#[tauri::command]
pub async fn disconnect_lastfm<R: Runtime>(_app: AppHandle<R>) -> Result<(), String> {
    let guard = SECURE_STORE.lock().unwrap();
    let store = guard.as_ref().ok_or("Store not initialized")?;

    let _ = store.delete_secret("session_key");
    store.delete("username");
    store.save_data().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn debug_store<R: Runtime>(_app: AppHandle<R>) -> Result<String, String> {
    let guard = SECURE_STORE.lock().unwrap();
    let store = guard.as_ref().ok_or("Store not initialized")?;

    store
        .get("api_key")
        .and_then(|v| v.as_str().map(String::from))
        .map(|key| format!("Store OK. Key prefix: {}", &key[..8.min(key.len())]))
        .ok_or("API key not found".to_string())
}

#[tauri::command]
pub async fn debug_session<R: Runtime>(_app: AppHandle<R>) -> Result<String, String> {
    let guard = SECURE_STORE.lock().unwrap();
    let store = guard.as_ref().ok_or("Store not initialized")?;

    match store.get_secret("session_key") {
        Ok(key) => Ok(format!("Session key found ({} chars)", key.len())),
        Err(e) => Ok(format!("Session key not found: {}", e)),
    }
}

#[tauri::command]
pub async fn debug_credentials<R: Runtime>(_app: AppHandle<R>) -> Result<String, String> {
    let api_key = get_api_key()?;
    let secret = get_api_secret()?;

    Ok(format!(
        "API Key: {}... ({} chars)\nAPI Secret: {} chars",
        &api_key[..8.min(api_key.len())],
        api_key.len(),
        secret.len()
    ))
}
