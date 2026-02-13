use once_cell::sync::Lazy;
use serde_json::Value;
use std::{collections::HashMap, fs, path::PathBuf, sync::Mutex};
use tauri::{AppHandle, Manager};

/// Production-grade secure storage using OS keychain for secrets (macOS only),
/// and AES-256-GCM encrypted filesystem storage for Windows and Linux.
pub struct SecureStore {
    /// Path for non-sensitive data (API key, username)
    data_path: PathBuf,

    /// Keychain service name — only used on macOS
    #[cfg_attr(not(target_os = "macos"), allow(dead_code))]
    keychain_service: String,

    /// In-memory cache of non-sensitive data
    data: Mutex<HashMap<String, Value>>,
}

impl SecureStore {
    pub fn new(app: &AppHandle) -> Self {
        let data_path = app
            .path()
            .app_data_dir()
            .expect("Failed to get app data directory")
            .join("lastfm_data.json");

        let keychain_service = "durvald_lastfm".to_string();

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

    // ===== SECRETS =====
    // macOS  → OS Keychain via keyring crate (always reliable)
    // Windows → AES-256-GCM encrypted file, key derived from USERNAME|COMPUTERNAME
    // Linux   → AES-256-GCM encrypted file, key derived from /etc/machine-id|USER

    pub fn set_secret(&self, name: &str, value: &str) -> Result<(), String> {
        #[cfg(target_os = "macos")]
        {
            let entry = Entry::new(&self.keychain_service, name)
                .map_err(|e| format!("Keychain init failed: {:?}", e))?;
            entry
                .set_password(value)
                .map_err(|e| format!("Keychain save failed: {:?}", e))
        }

        #[cfg(not(target_os = "macos"))]
        {
            self.write_encrypted_secret(name, value)
        }
    }

    pub fn get_secret(&self, name: &str) -> Result<String, String> {
        #[cfg(target_os = "macos")]
        {
            let entry = Entry::new(&self.keychain_service, name)
                .map_err(|e| format!("Keychain init failed: {:?}", e))?;
            entry.get_password().map_err(|e| match e {
                keyring::Error::NoEntry => "Not found".to_string(),
                _ => format!("Keychain error: {:?}", e),
            })
        }

        #[cfg(not(target_os = "macos"))]
        {
            self.read_encrypted_secret(name)
        }
    }

    pub fn delete_secret(&self, name: &str) -> Result<(), String> {
        #[cfg(target_os = "macos")]
        {
            let entry = keyring::Entry::new(&self.keychain_service, name)
                .map_err(|e| format!("Keychain init failed: {:?}", e))?;
            entry
                .delete_credential()
                .map_err(|e| format!("Keychain delete failed: {:?}", e))
        }

        #[cfg(not(target_os = "macos"))]
        {
            let path = self.secret_path(name)?;
            if path.exists() {
                fs::remove_file(&path).map_err(|e| format!("delete failed: {}", e))
            } else {
                Ok(()) // Already gone — not an error
            }
        }
    }

    // ===== ENCRYPTED FILE HELPERS (Windows + Linux) =====

    #[cfg(not(target_os = "macos"))]
    fn machine_key(&self) -> Result<[u8; 32], String> {
        use ring::digest;

        #[cfg(windows)]
        let machine_id = format!(
            "{}|{}",
            std::env::var("USERNAME").unwrap_or_default(),
            std::env::var("COMPUTERNAME").unwrap_or_default()
        );

        #[cfg(target_os = "linux")]
        let machine_id = {
            // /etc/machine-id is a stable UUID present on all systemd-based distros.
            // Fall back to /var/lib/dbus/machine-id on older systems.
            let mid = fs::read_to_string("/etc/machine-id")
                .or_else(|_| fs::read_to_string("/var/lib/dbus/machine-id"))
                .unwrap_or_default()
                .trim()
                .to_string();
            let user = std::env::var("USER").unwrap_or_default();
            format!("{}|{}", mid, user)
        };

        let mut ctx = digest::Context::new(&digest::SHA256);
        ctx.update(machine_id.as_bytes());
        let digest = ctx.finish();
        digest
            .as_ref()
            .try_into()
            .map_err(|_| "Key derivation failed".to_string())
    }

    #[cfg(not(target_os = "macos"))]
    fn secret_path(&self, name: &str) -> Result<PathBuf, String> {
        let dir = self
            .data_path
            .parent()
            .ok_or("No parent directory for data_path")?;
        fs::create_dir_all(dir)
            .map_err(|e| format!("create_dir_all failed for {:?}: {}", dir, e))?;
        Ok(dir.join(format!("secret_{}.enc", name)))
    }

    #[cfg(not(target_os = "macos"))]
    fn write_encrypted_secret(&self, name: &str, value: &str) -> Result<(), String> {
        use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
        use ring::{
            aead::{self, Aad, LessSafeKey, Nonce, UnboundKey},
            rand,
        };

        let key_bytes = self.machine_key()?;

        let rng = rand::SystemRandom::new();
        let nonce: [u8; 12] = rand::generate(&rng)
            .map_err(|_| "RNG failed".to_string())?
            .expose();

        let sealing_key = LessSafeKey::new(
            UnboundKey::new(&aead::AES_256_GCM, &key_bytes)
                .map_err(|_| "Key setup failed".to_string())?,
        );

        let mut in_out = value.as_bytes().to_vec();
        sealing_key
            .seal_in_place_append_tag(
                Nonce::try_assume_unique_for_key(&nonce)
                    .map_err(|_| "Nonce creation failed".to_string())?,
                Aad::empty(),
                &mut in_out,
            )
            .map_err(|_| "Encryption failed".to_string())?;

        // Layout: [nonce (12 bytes)][ciphertext + GCM tag]
        let mut final_buf = nonce.to_vec();
        final_buf.extend_from_slice(&in_out);

        let path = self.secret_path(name)?;
        fs::write(&path, BASE64.encode(&final_buf))
            .map_err(|e| format!("write failed for {:?}: {}", path, e))
    }

    #[cfg(not(target_os = "macos"))]
    fn read_encrypted_secret(&self, name: &str) -> Result<String, String> {
        use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
        use ring::aead::{self, Aad, LessSafeKey, Nonce, UnboundKey};

        let key_bytes = self.machine_key()?;
        let path = self.secret_path(name)?;

        if !path.exists() {
            return Err("Not found".to_string());
        }

        let raw = fs::read(&path).map_err(|e| format!("read failed: {}", e))?;
        let decoded = BASE64
            .decode(&raw)
            .map_err(|e| format!("base64 decode failed: {}", e))?;

        if decoded.len() < 12 {
            return Err("Invalid ciphertext length".to_string());
        }

        let nonce: [u8; 12] = decoded[..12]
            .try_into()
            .map_err(|_| "Invalid nonce length".to_string())?;

        let opening_key = LessSafeKey::new(
            UnboundKey::new(&aead::AES_256_GCM, &key_bytes)
                .map_err(|_| "Key setup failed".to_string())?,
        );

        let mut buf = decoded[12..].to_vec();
        let plaintext = opening_key
            .open_in_place(
                Nonce::try_assume_unique_for_key(&nonce)
                    .map_err(|_| "Invalid nonce".to_string())?,
                Aad::empty(),
                &mut buf,
            )
            .map_err(|_| "Decryption failed (wrong machine or corrupted data)".to_string())?;

        String::from_utf8(plaintext.to_vec()).map_err(|e| e.to_string())
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
