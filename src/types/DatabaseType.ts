export interface TrackType {
  song_id: number;
  title: string;
  artwork: string;
  artist_id: number;
  artist_name: string;
  release_id: number;
  release_title: string;
  track_number: number;
  disc_number: number;
  duration: number;
  bitrate: number | null;
  sample_rate: number | null;
  play_count: number;
  last_played: string | null;
  rating: number | null;
  lyrics: string | null;
  is_favorite: boolean;
  is_hidden: boolean;
  suggest_less: boolean;
  file_path: string;
  created_at: string;
  updated_at: string;
}

export interface ReleaseType {
  release_id: number;
  title: string;
  artist_id: number;
  artist_name: string;
  release_date: string;
  total_tracks: number;
  total_discs: number;
  duration: number;
  artwork: string;
  is_favorite: boolean;
  is_hidden: boolean;
  suggest_less: boolean;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface ArtistType {
  artistId: number;
  artistName: string;
}

export interface HistoryType {
  history_id: number;
  song_id: number;
  playedAt: string;
  playDuration: number;
}
