use base64::engine::{general_purpose, Engine as _};
use lofty::file::AudioFile;
use lofty::file::TaggedFileExt;
use lofty::read_from_path;
use lofty::tag::Accessor;
use md5::{Digest, Md5};
use serde::Deserialize;
use serde::Serialize;
use std::collections::HashMap;
use std::fs;
use tauri::{AppHandle, Manager};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AudioMetadata {
    pub title: Option<String>,
    pub artist: Option<String>,
    pub release: Option<String>,
    pub genre: Option<String>,
    pub year: Option<u32>,
    pub track: Option<u32>,
    pub disc: Option<u32>,
    pub duration: f64,
    pub bitrate: Option<u32>,
    pub sample_rate: Option<u32>,
    pub channels: Option<u8>,
    /// Legacy: embedded base64 data URL. Kept so already-persisted rows and
    /// the FolderSelector preview keep working unchanged.
    pub cover_image_base64: Option<String>,
    /// New: absolute path of the cover file, served via the asset protocol.
    /// Empty only when the track has no embedded artwork.
    pub cover_path: Option<String>,
    pub all_fields: HashMap<String, String>,
    pub file_path: String,
}

/// Extracts the front cover (or first embedded picture) as `(mime, raw bytes)`.
fn extract_cover_bytes(tag: &lofty::tag::Tag) -> Option<(String, Vec<u8>)> {
    let picture = tag
        .get_picture_type(lofty::picture::PictureType::CoverFront)
        .or_else(|| tag.pictures().first())?;

    let mime = match picture.mime_type() {
        Some(lofty::picture::MimeType::Jpeg) => "image/jpeg".to_string(),
        Some(lofty::picture::MimeType::Png) => "image/png".to_string(),
        Some(lofty::picture::MimeType::Bmp) => "image/bmp".to_string(),
        Some(lofty::picture::MimeType::Gif) => "image/gif".to_string(),
        Some(lofty::picture::MimeType::Tiff) => "image/tiff".to_string(),
        _ => "image/jpeg".to_string(),
    };

    Some((mime, picture.data().to_vec()))
}

/// Writes the cover to `{app_data}/covers/{content_md5}.{ext}` (idempotent by
/// content hash, so equal covers dedupe) and returns its absolute path.
pub(crate) fn write_cover_file(
    app: &AppHandle,
    mime: &str,
    bytes: &[u8],
) -> Result<Option<String>, String> {
    let ext = match mime {
        "image/png" => "png",
        "image/bmp" => "bmp",
        "image/gif" => "gif",
        "image/tiff" => "tiff",
        _ => "jpg",
    };

    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data dir: {}", e))?
        .join("covers");

    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create covers dir: {}", e))?;

    let hash = format!("{:x}", Md5::digest(bytes));
    let path = dir.join(format!("{}.{}", hash, ext));

    if !path.exists() {
        fs::write(&path, bytes).map_err(|e| format!("Failed to write cover: {}", e))?;
    }

    Ok(Some(path.to_string_lossy().to_string()))
}

/// Parses a legacy `data:<mime>;base64,<payload>` artwork value, writes the
/// decoded bytes to the covers dir and returns the absolute file path.
///
/// Returns `Ok(None)` when the value is not a base64 data URL, so the caller
/// can leave the row untouched (idempotent migration).
pub(crate) fn cover_path_from_data_url(
    app: &AppHandle,
    data_url: &str,
) -> Result<Option<String>, String> {
    let rest = data_url.strip_prefix("data:").unwrap_or(data_url);
    let (mime, payload) = match rest.split_once(";base64,") {
        Some((m, p)) => (m, p.trim()),
        None => return Ok(None),
    };

    let bytes = general_purpose::STANDARD
        .decode(payload)
        .map_err(|e| format!("Failed to decode cover base64: {}", e))?;

    write_cover_file(app, mime, &bytes)
}

#[tauri::command]
pub async fn get_audio_metadata(app: AppHandle, path: String) -> Result<AudioMetadata, String> {
    let tagged_file = read_from_path(&path).map_err(|e| format!("Failed to read file: {}", e))?;

    let properties = tagged_file.properties();
    let mut metadata = AudioMetadata {
        title: None,
        artist: None,
        release: None,
        genre: None,
        year: None,
        track: None,
        disc: None,
        duration: properties.duration().as_secs_f64(),
        bitrate: properties.audio_bitrate(),
        sample_rate: properties.sample_rate(),
        channels: properties.channels(),
        cover_image_base64: None,
        cover_path: None,
        all_fields: HashMap::new(),
        file_path: path,
    };

    if let Some(tag) = tagged_file.primary_tag() {
        // Standard fields
        metadata.title = tag.title().map(|s| s.to_string());
        metadata.artist = tag.artist().map(|s| s.to_string());
        metadata.release = tag.album().map(|s| s.to_string());
        metadata.genre = tag.genre().map(|s| s.to_string());
        metadata.year = tag.year();
        metadata.track = tag.track();
        metadata.disc = tag.disk();

        // Extract cover: persist as file (new) AND keep base64 (legacy/compat).
        if let Some((mime, bytes)) = extract_cover_bytes(tag) {
            let base64 = general_purpose::STANDARD.encode(&bytes);
            metadata.cover_image_base64 = Some(format!("data:{};base64,{}", mime, base64));
            metadata.cover_path = write_cover_file(&app, &mime, &bytes)?;
        }

        // All fields as key-value pairs
        for item in tag.items() {
            metadata
                .all_fields
                .insert(format!("{:?}", item.key()), format!("{:?}", item.value()));
        }
    }

    Ok(metadata)
}