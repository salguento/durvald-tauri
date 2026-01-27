use keyring::{Entry, Error as KeyringError};
use once_cell::sync::Lazy;
use serde_json::Value;
use std::{collections::HashMap, fs, path::PathBuf, sync::Mutex};
use tauri::{AppHandle, Manager}; // ✅ Required for .path() and .config()

/// Production-grade secure storage using OS keychain for secrets
pub struct SecureStore {
    /// Path for non-sensitive data (API key, username)
    data_path: PathBuf,

    /// Keychain service name (scoped to app bundle identifier)
    keychain_service: String,

    /// In-memory cache of non-sensitive data
    data: Mutex<HashMap<String, Value>>, // ✅ Fixed: snake_case + proper type syntax
}

impl SecureStore {
    pub fn new(app: &AppHandle) -> Self {
        let data_path = app
            .path()
            .app_data_dir()
            .expect("Failed to get app data directory")
            .join("lastfm_data.json");

        // ✅ CORRECT Tauri v2 config: bundle identifier is top-level field
        let bundle_id = &app.config().identifier; // ← FIXED: no .tauri.bundle
        let keychain_service = format!("{}.lastfm", bundle_id);

        let data = if data_path.exists() {
            Self::load_data(&data_path).unwrap_or_default()
        } else {
            HashMap::new()
        };

        Self {
            data_path,
            keychain_service,
            data: Mutex::new(data),
        }
    }

    fn load_data(path: &PathBuf) -> Result<HashMap<String, Value>, String> {
        fs::read_to_string(path)
            .map_err(|e| e.to_string())
            .and_then(|s| serde_json::from_str(&s).map_err(|e| e.to_string()))
    }

    pub fn save_data(&self) -> Result<(), String> {
        let data = self.data.lock().unwrap();
        let contents = serde_json::to_string(&*data).map_err(|e| e.to_string())?;
        fs::write(&self.data_path, contents).map_err(|e| e.to_string())
    }

    // ===== KEYCHAIN (SECRETS ONLY) =====

    pub fn set_secret(&self, name: &str, value: &str) -> Result<(), String> {
        let entry = Entry::new(&self.keychain_service, name)
            .map_err(|e| format!("Keychain init failed: {:?}", e))?;
        entry
            .set_password(value)
            .map_err(|e| format!("Keychain save failed: {:?}", e))
    }

    pub fn get_secret(&self, name: &str) -> Result<String, String> {
        let entry = Entry::new(&self.keychain_service, name)
            .map_err(|e| format!("Keychain init failed: {:?}", e))?;
        // ✅ keyring v3.6.3: get_password() exists
        entry.get_password().map_err(|e| match e {
            KeyringError::NoEntry => "Not found".to_string(),
            _ => format!("Keychain error: {:?}", e),
        })
    }

    pub fn delete_secret(&self, name: &str) -> Result<(), String> {
        let entry = Entry::new(&self.keychain_service, name)
            .map_err(|e| format!("Keychain init failed: {:?}", e))?;
        // ✅ keyring v3.6.3: delete_credential() (renamed from delete_password)
        entry
            .delete_credential()
            .map_err(|e| format!("Keychain delete failed: {:?}", e))
    }

    // ===== NON-SECRET DATA (FILESYSTEM) =====

    pub fn get(&self, key: &str) -> Option<Value> {
        self.data.lock().unwrap().get(key).cloned()
    }

    pub fn set(&self, key: String, value: Value) {
        self.data.lock().unwrap().insert(key, value);
    }

    pub fn delete(&self, key: &str) {
        self.data.lock().unwrap().remove(key);
    }
}

/// Global store instance (initialized once during app setup)
pub static SECURE_STORE: Lazy<Mutex<Option<SecureStore>>> = Lazy::new(|| Mutex::new(None));

pub fn init_secure_store(app: &AppHandle) {
    let mut store = SECURE_STORE.lock().unwrap();
    *store = Some(SecureStore::new(app));
}
