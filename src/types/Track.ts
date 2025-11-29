export default interface TrackType {
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
  file_path: string;
  created_at: string;
  updated_at: string;
}
