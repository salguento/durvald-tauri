pub struct AudioPlayer {
    _stream: rodio::OutputStream, // Kept alive for the app lifetime
    stream_handle: rodio::OutputStreamHandle,
    current_sink: Option<Arc<rodio::Sink>>,
}

impl AudioPlayer {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let (stream, stream_handle) = rodio::OutputStream::try_default()?;
        Ok(Self {
            _stream: stream,
            stream_handle,
            current_sink: None,
        })
    }

    pub async fn play(&mut self, path: String) -> Result<(), Box<dyn std::error::Error>> {
        self.stop(); // Stop current playback

        let stream_handle = self.stream_handle.clone();
        let sink = rodio::Sink::try_new(&stream_handle)?;

        let file = File::open(path)?;
        let source = rodio::Decoder::new(file)?;
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
        if let Some(sink) = &self.current_sink {
            sink.stop();
        }
        self.current_sink = None;
    }

    pub fn set_volume(&self, volume: f32) {
        if let Some(sink) = &self.current_sink {
            sink.set_volume(volume);
        }
    }

    pub fn get_progress(&self) -> Option<std::time::Duration> {
        self.current_sink.as_ref().map(|sink| sink.get_pos())
    }

    pub async fn add_to_queue(&mut self, path: String) -> Result<(), Box<dyn std::error::Error>> {
        let stream_handle = self.stream_handle.clone();
        let sink = self.current_sink.clone().unwrap_or_else(|| {
            Arc::new(rodio::Sink::try_new(&stream_handle).expect("Failed to create sink"))
        });

        let file = File::open(path)?;
        let source = rodio::Decoder::new(file)?;
        sink.append(source);

        if self.current_sink.is_none() {
            self.current_sink = Some(sink);
        }
        Ok(())
    }
}
