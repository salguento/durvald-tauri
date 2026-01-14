// Dependencies
import { invoke } from "@tauri-apps/api/core";
// Stores
import { libraryStore } from "../../../stores/libraryStore";
// Function
export default async function suggestLessTrack(id: number) {
  const [, setTrackStore] = libraryStore.trackStore;
  try {
    await invoke("suggest_less_track", { songId: id });
    setTrackStore((prev) => {
      return prev.map((track) =>
        track.song_id === id
          ? { ...track, suggest_less: !track.suggest_less }
          : track,
      );
    });
  } catch (error) {
    console.error("Failed to favorite track:", error);
  }
}
