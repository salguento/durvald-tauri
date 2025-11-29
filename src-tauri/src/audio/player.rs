use rodio::Source;
use std::fs::File;
use std::sync::Arc;
use std::time::Duration;

pub struct AudioPlayer {
    stream_handle: rodio::OutputStream,
    current_sink: Option<Arc<rodio::Sink>>,
    total_duration: Option<Duration>,
}

impl AudioPlayer {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let stream_handle = rodio::OutputStreamBuilder::open_default_stream()?;
        Ok(Self {
            stream_handle,
            current_sink: None,
            total_duration: None,
        })
    }

    pub async fn play(&mut self, path: String) -> Result<(), Box<dyn std::error::Error>> {
        self.stop();
        let sink = rodio::Sink::connect_new(self.stream_handle.mixer());
        let file = File::open(&path)?;

        // Try to get the total duration
        let duration = Self::get_file_duration(&path);
        self.total_duration = duration;

        let source = rodio::Decoder::try_from(file)?;
        sink.append(source);
        self.current_sink = Some(Arc::new(sink));
        Ok(())
    }

    pub fn pause(&self) {
        if let Some(sink) = &self.current_sink {
            sink.pause();
        }
    }

    pub fn resume(&self) {
        if let Some(sink) = &self.current_sink {
            sink.play();
        }
    }

    pub fn stop(&mut self) {
        if let Some(sink) = self.current_sink.take() {
            sink.stop();
        }
        self.total_duration = None;
    }

    pub fn set_volume(&self, volume: f32) {
        if let Some(sink) = &self.current_sink {
            sink.set_volume(volume);
        }
    }

    pub fn is_paused(&self) -> bool {
        self.current_sink
            .as_ref()
            .map(|sink| sink.is_paused())
            .unwrap_or(false)
    }

    pub fn is_empty(&self) -> bool {
        self.current_sink
            .as_ref()
            .map(|sink| sink.empty())
            .unwrap_or(true)
    }

    /// Get the current playback position
    pub fn get_position(&self) -> Duration {
        self.current_sink
            .as_ref()
            .map(|sink| sink.get_pos())
            .unwrap_or(Duration::ZERO)
    }

    /// Get the total duration of the current track
    pub fn get_duration(&self) -> Option<Duration> {
        self.total_duration
    }

    /// Get playback progress as a tuple of (current_position, total_duration)
    pub fn get_progress(&self) -> (Duration, Option<Duration>) {
        (self.get_position(), self.get_duration())
    }

    /// Get playback progress as a percentage (0.0 to 1.0)
    pub fn get_progress_percentage(&self) -> Option<f32> {
        if let Some(total) = self.total_duration {
            let current = self.get_position();
            let total_secs = total.as_secs_f32();
            if total_secs > 0.0 {
                return Some((current.as_secs_f32() / total_secs).min(1.0));
            }
        }
        None
    }

    pub async fn add_to_queue(&mut self, path: String) -> Result<(), Box<dyn std::error::Error>> {
        if let Some(sink) = &self.current_sink {
            let file = File::open(path)?;
            let source = rodio::Decoder::try_from(file)?;
            sink.append(source);
        } else {
            // No current sink, create a new one
            self.play(path).await?;
        }
        Ok(())
    }

    // Helper function to get duration from a file
    fn get_file_duration(path: &str) -> Option<Duration> {
        File::open(path)
            .ok()
            .and_then(|file| rodio::Decoder::try_from(file).ok())
            .and_then(|source| source.total_duration())
    }
}
