use std::fs::File;
// use std::io::BufReader;
use std::sync::Arc;

pub struct AudioPlayer {
    stream_handle: rodio::OutputStream,
    current_sink: Option<Arc<rodio::Sink>>,
}

impl AudioPlayer {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let stream_handle = rodio::OutputStreamBuilder::open_default_stream()?;
        Ok(Self {
            stream_handle,
            current_sink: None,
        })
    }

    pub async fn play(&mut self, path: String) -> Result<(), Box<dyn std::error::Error>> {
        self.stop();

        let sink = rodio::Sink::connect_new(self.stream_handle.mixer());
        let file = File::open(path)?;
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
}
