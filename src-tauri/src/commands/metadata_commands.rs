use base64::engine::{general_purpose, Engine as _};
use lofty::file::AudioFile;
use lofty::file::TaggedFileExt;
use lofty::read_from_path;
use lofty::tag::Accessor;
use serde::Serialize;
use std::collections::HashMap;

#[derive(Serialize)]
pub struct AudioMetadata {
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub genre: Option<String>,
    pub year: Option<u32>,
    pub track: Option<u32>,
    pub disc: Option<u32>,
    pub duration: f64,
    pub bitrate: Option<u32>,
    pub sample_rate: Option<u32>,
    pub channels: Option<u8>,
    pub cover_image_base64: Option<String>, // Changed to base64
    pub all_fields: HashMap<String, String>,
}

#[tauri::command]
pub fn get_audio_metadata(path: String) -> Result<AudioMetadata, String> {
    let tagged_file = read_from_path(&path).map_err(|e| format!("Failed to read file: {}", e))?;

    let properties = tagged_file.properties();
    let mut metadata = AudioMetadata {
        title: None,
        artist: None,
        album: None,
        genre: None,
        year: None,
        track: None,
        disc: None,
        duration: properties.duration().as_secs_f64(),
        bitrate: properties.audio_bitrate(),
        sample_rate: properties.sample_rate(),
        channels: properties.channels(),
        cover_image_base64: None,
        all_fields: HashMap::new(),
    };

    if let Some(tag) = tagged_file.primary_tag() {
        // Standard fields
        metadata.title = tag.title().map(|s| s.to_string());
        metadata.artist = tag.artist().map(|s| s.to_string());
        metadata.album = tag.album().map(|s| s.to_string());
        metadata.genre = tag.genre().map(|s| s.to_string());
        metadata.year = tag.year();
        metadata.track = tag.track();
        metadata.disc = tag.disk();

        // Extract cover image as base64
        metadata.cover_image_base64 = extract_embedded_cover_base64(tag);

        // All fields as key-value pairs
        for item in tag.items() {
            metadata
                .all_fields
                .insert(format!("{:?}", item.key()), format!("{:?}", item.value()));
        }
    }

    Ok(metadata)
}

fn extract_embedded_cover_base64(tag: &lofty::tag::Tag) -> Option<String> {
    let picture = tag
        .get_picture_type(lofty::picture::PictureType::CoverFront)
        .or_else(|| tag.pictures().first())?;

    let mime_type = match picture.mime_type() {
        Some(lofty::picture::MimeType::Jpeg) => "image/jpeg",
        Some(lofty::picture::MimeType::Png) => "image/png",
        Some(lofty::picture::MimeType::Bmp) => "image/bmp",
        Some(lofty::picture::MimeType::Gif) => "image/gif",
        Some(lofty::picture::MimeType::Tiff) => "image/tiff",
        _ => "image/jpeg",
    };

    let base64_data = general_purpose::STANDARD.encode(picture.data());
    Some(format!("data:{};base64,{}", mime_type, base64_data))
}
