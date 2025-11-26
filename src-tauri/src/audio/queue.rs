use std::path::PathBuf;

#[allow(dead_code)]
pub struct Playlist {
    tracks: Vec<PathBuf>,
    current_index: Option<usize>,
}

#[allow(dead_code)]
impl Playlist {
    pub fn new() -> Self {
        Self {
            tracks: Vec::new(),
            current_index: None,
        }
    }

    pub fn add_track(&mut self, path: PathBuf) {
        self.tracks.push(path);
    }

    pub fn next_track(&mut self) -> Option<&PathBuf> {
        let next_index = match self.current_index {
            Some(idx) if idx + 1 < self.tracks.len() => idx + 1,
            Some(_) => 0, // Loop to beginning
            None if !self.tracks.is_empty() => 0,
            None => return None,
        };
        self.current_index = Some(next_index);
        Some(&self.tracks[next_index])
    }

    pub fn current_track(&self) -> Option<&PathBuf> {
        self.current_index.and_then(|idx| self.tracks.get(idx))
    }
}
