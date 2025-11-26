use thiserror::Error;

#[derive(Error, Debug)]
pub enum AudioError {
    #[error("Audio stream error: {0}")]
    StreamError(#[from] rodio::StreamError),

    #[error("Audio device error: {0}")]
    DeviceError(#[from] rodio::DevicesError),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Decoder error: {0}")]
    DecoderError(#[from] rodio::decoder::DecoderError),
}

#[allow(dead_code)]
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum PlaybackState {
    Playing,
    Paused,
    Stopped,
}

#[allow(dead_code)]
pub type Result<T> = std::result::Result<T, AudioError>;
