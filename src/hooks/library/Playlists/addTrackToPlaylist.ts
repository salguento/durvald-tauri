// Dependencies
import { invoke } from "@tauri-apps/api/core";
// Store
import { libraryStore } from "../../../stores/libraryStore";
import { PlaylistSongsType } from "../../../types/DatabaseType";
// Function
export default async function addTrackToPlaylist(
  playlistId: number,
  trackId: number,
  currentLength: number,
) {
  const [, setPlaylistSongStore] = libraryStore.playlistSongStore;

  console.log(playlistId, trackId, currentLength);
  const newTrack: PlaylistSongsType = await invoke(
    "add_track_to_playlist_songs",
    {
      playlistId: playlistId,
      songId: trackId,
      position: currentLength++,
    },
  );

  console.log(currentLength);

  setPlaylistSongStore((prev) => [...prev, newTrack]);
}
