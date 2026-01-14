// Dependencies
import { invoke } from "@tauri-apps/api/core";
// Stores
import { libraryStore } from "../../stores/libraryStore";
// Function
export default async function favoriteTrack(id: number) {
  const [, setTrackStore] = libraryStore.trackStore;
  try {
    await invoke("favorite_song", { songId: id });
    setTrackStore((prev) => {
      return prev.map((track) =>
        track.song_id === id
          ? { ...track, is_favorite: !track.is_favorite }
          : track,
      );
    });
  } catch (error) {
    console.error("Failed to favorite track:", error);
  }
}
