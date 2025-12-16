use kira::sound::streaming::{StreamingSoundData, StreamingSoundHandle};
use kira::sound::FromFileError;
use kira::Tween;
use kira::{AudioManager, AudioManagerSettings, DefaultBackend};
use std::time::Duration;

type SoundHandle = StreamingSoundHandle<FromFileError>;

pub struct AudioPlayer {
    manager: AudioManager<DefaultBackend>,
    current_sound: Option<SoundHandle>,
    total_duration: Option<Duration>,
    current_path: Option<String>,
    paused_position: Option<f64>,
    current_volume: f32,
}

impl AudioPlayer {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let manager = AudioManager::<DefaultBackend>::new(AudioManagerSettings::default())?;
        Ok(Self {
            manager,
            current_sound: None,
            total_duration: None,
            current_path: None,
            paused_position: None,
            current_volume: 1.0,
        })
    }

    pub async fn play(&mut self, path: String) -> Result<(), Box<dyn std::error::Error>> {
        self.stop();

        let path_clone = path.clone();

        // Load streaming sound data - starts playing immediately
        let sound_data =
            tokio::task::spawn_blocking(move || StreamingSoundData::from_file(&path_clone))
                .await??;

        self.total_duration = Some(sound_data.duration());
        self.current_path = Some(path.clone());
        self.paused_position = None;

        let mut sound_handle = self.manager.play(sound_data)?;
        sound_handle.set_volume(self.current_volume, Tween::default());
        self.current_sound = Some(sound_handle);

        Ok(())
    }

    pub fn pause(&mut self) {
        if let Some(sound) = &mut self.current_sound {
            self.paused_position = Some(sound.position());
            let _ = sound.pause(Tween::default());
        }
    }

    pub fn resume(&mut self) {
        if let Some(sound) = &mut self.current_sound {
            let _ = sound.resume(Tween::default());
            self.paused_position = None;
        }
    }

    pub fn stop(&mut self) {
        if let Some(mut sound) = self.current_sound.take() {
            let _ = sound.stop(Tween::default());
        }
        self.total_duration = None;
        self.current_path = None;
        self.paused_position = None;
    }

    pub fn set_volume(&mut self, volume: f32) {
        self.current_volume = volume;

        if let Some(sound) = &mut self.current_sound {
            let volume_db = if volume > 0.00001 {
                20.0 * volume.log10()
            } else {
                -80.0
            };

            sound.set_volume(volume_db as f32, Tween::default());
        }
    }

    pub fn is_paused(&self) -> bool {
        self.current_sound
            .as_ref()
            .map(|sound| {
                matches!(
                    sound.state(),
                    kira::sound::PlaybackState::Paused | kira::sound::PlaybackState::Pausing
                )
            })
            .unwrap_or(false)
    }

    pub fn is_empty(&self) -> bool {
        self.current_sound
            .as_ref()
            .map(|sound| {
                matches!(
                    sound.state(),
                    kira::sound::PlaybackState::Stopped | kira::sound::PlaybackState::Stopping
                )
            })
            .unwrap_or(true)
    }

    pub fn get_position(&self) -> Duration {
        if let Some(paused_pos) = self.paused_position {
            return Duration::from_secs_f64(paused_pos);
        }

        self.current_sound
            .as_ref()
            .map(|sound| Duration::from_secs_f64(sound.position()))
            .unwrap_or(Duration::ZERO)
    }

    pub fn get_duration(&self) -> Option<Duration> {
        self.total_duration
    }

    pub fn get_progress(&self) -> (Duration, Option<Duration>) {
        (self.get_position(), self.get_duration())
    }

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

    pub async fn seek_to_position(
        &mut self,
        seconds: u64,
    ) -> Result<(), Box<dyn std::error::Error>> {
        if let Some(sound) = &mut self.current_sound {
            sound.seek_to(seconds as f64);
            if self.paused_position.is_some() {
                self.paused_position = Some(seconds as f64);
            }
            Ok(())
        } else {
            Err("No track is currently loaded".into())
        }
    }

    pub async fn seek_to_percentage(
        &mut self,
        percentage: f32,
    ) -> Result<(), Box<dyn std::error::Error>> {
        if let Some(duration) = self.total_duration {
            let target_seconds = (duration.as_secs_f32() * percentage.clamp(0.0, 1.0)) as u64;
            self.seek_to_position(target_seconds).await
        } else {
            Err("Duration not available".into())
        }
    }

    pub async fn add_to_queue(&mut self, path: String) -> Result<(), Box<dyn std::error::Error>> {
        if self.is_empty() {
            self.play(path).await?;
        } else {
            return Err("Queue not implemented yet - current track still playing".into());
        }
        Ok(())
    }
}
