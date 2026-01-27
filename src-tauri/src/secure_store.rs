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

        // ✅ FIXED: Shortened service name (14 chars) avoids Windows 32-char limit
        let keychain_service = "durvald.lastfm".to_string();

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

    // ===== KEYCHAIN (SECRETS) - WINDOWS FALLBACK =====

    pub fn set_secret(&self, name: &str, value: &str) -> Result<(), String> {
        #[cfg(windows)]
        {
            // Windows fallback: AES-256-GCM encrypted filesystem storage
            use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
            use ring::{
                aead::{self, Aad, LessSafeKey, Nonce, UnboundKey},
                digest, rand,
            };

            // Derive machine-specific key
            let machine_id = format!(
                "{}|{}",
                std::env::var("USERNAME").unwrap_or_default(),
                std::env::var("COMPUTERNAME").unwrap_or_default()
            );
            let mut ctx = digest::Context::new(&digest::SHA256);
            ctx.update(machine_id.as_bytes());
            let digest = ctx.finish();
            let key_bytes: [u8; 32] = digest
                .as_ref()
                .try_into()
                .map_err(|_| "Key derivation failed".to_string())?;

            // Generate 12-byte nonce
            let rng = rand::SystemRandom::new();
            let nonce: [u8; 12] = rand::generate(&rng)
                .map_err(|_| "RNG failed".to_string())?
                .expose();

            // Create sealing key
            let sealing_key = LessSafeKey::new(
                UnboundKey::new(&aead::AES_256_GCM, &key_bytes)
                    .map_err(|_| "Key setup failed".to_string())?,
            );

            // CORRECT ring pattern: seal plaintext first, then prepend nonce
            let mut in_out = value.as_bytes().to_vec();
            sealing_key
                .seal_in_place_append_tag(
                    Nonce::try_assume_unique_for_key(&nonce)
                        .map_err(|_| "Nonce creation failed".to_string())?,
                    Aad::empty(),
                    &mut in_out,
                )
                .map_err(|_| "Encryption failed".to_string())?;

            // Build final buffer: [nonce (12 bytes)][ciphertext + tag]
            let mut final_buf = nonce.to_vec();
            final_buf.extend_from_slice(&in_out);

            // Save to file
            let path = self
                .data_path
                .parent()
                .ok_or("No parent directory")?
                .join(format!("secret_{}.enc", name));

            std::fs::write(&path, BASE64.encode(&final_buf)).map_err(|e| e.to_string())?;

            Ok(())
        }

        #[cfg(not(windows))]
        {
            // macOS/Linux: native keychain
            let entry = keyring::Entry::new(&self.keychain_service, name)
                .map_err(|e| format!("Keychain init failed: {:?}", e))?;
            entry
                .set_password(value)
                .map_err(|e| format!("Keychain save failed: {:?}", e))
        }
    }

    pub fn get_secret(&self, name: &str) -> Result<String, String> {
        #[cfg(windows)]
        {
            use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
            use ring::{
                aead::{self, Aad, LessSafeKey, Nonce, UnboundKey},
                digest,
            };

            // Derive same machine-specific key
            let machine_id = format!(
                "{}|{}",
                std::env::var("USERNAME").unwrap_or_default(),
                std::env::var("COMPUTERNAME").unwrap_or_default()
            );
            let mut ctx = digest::Context::new(&digest::SHA256);
            ctx.update(machine_id.as_bytes());
            let digest = ctx.finish();
            let key_bytes: [u8; 32] = digest
                .as_ref()
                .try_into()
                .map_err(|_| "Key derivation failed".to_string())?;

            // Read and decode ciphertext
            let path = self
                .data_path
                .parent()
                .ok_or("No parent directory")?
                .join(format!("secret_{}.enc", name));

            let ciphertext = std::fs::read(&path).map_err(|e| e.to_string())?;
            let decoded = BASE64.decode(&ciphertext).map_err(|e| e.to_string())?;

            if decoded.len() < 12 {
                return Err("Invalid ciphertext length".to_string());
            }

            // Split nonce and ciphertext+tag
            let nonce: [u8; 12] = decoded[..12]
                .try_into()
                .map_err(|_| "Invalid nonce length".to_string())?;
            let ciphertext_and_tag = &decoded[12..];

            // Create opening key
            let opening_key = LessSafeKey::new(
                UnboundKey::new(&aead::AES_256_GCM, &key_bytes)
                    .map_err(|_| "Key setup failed".to_string())?,
            );

            // Decrypt (in-place operation modifies the buffer)
            let mut buf = ciphertext_and_tag.to_vec();
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

        #[cfg(not(windows))]
        {
            // macOS/Linux: native keychain
            let entry = keyring::Entry::new(&self.keychain_service, name)
                .map_err(|e| format!("Keychain init failed: {:?}", e))?;
            entry.get_password().map_err(|e| match e {
                keyring::Error::NoEntry => "Not found".to_string(),
                _ => format!("Keychain error: {:?}", e),
            })
        }
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
