// Dependencies
import { invoke } from "@tauri-apps/api/core";
// Store
import { libraryStore } from "../../../stores/libraryStore";
// Function
export default async function removeTrackFromPlaylist(
  playlistId: number,
  trackId: number,
  position: number,
) {
  const [, setPlaylistSongStore] = libraryStore.playlistSongStore;

  await invoke("remove_track_from_playlist", {
    playlistId: playlistId,
    songId: trackId,
    position: position,
  });

  setPlaylistSongStore((prev) =>
    prev.filter(
      (item) =>
        item.playlist_id !== playlistId ||
        item.song_id !== trackId ||
        item.position !== position,
    ),
  );
}
