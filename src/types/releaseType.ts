export interface ReleaseType {
  id: number;
  title: string;
  artist_id: number;
  artist_name: string;
  release_date: string;
  total_tracks: number;
  total_discs: number;
  duration: number;
  artwork: string;
  is_favorite: boolean;
  rating: number | null;
  created_at: string;
  updated_at: string;
}
