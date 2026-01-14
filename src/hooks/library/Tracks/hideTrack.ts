// Dependencies
import { invoke } from "@tauri-apps/api/core";
// Stores
import { libraryStore } from "../../../stores/libraryStore";
// Function
export default async function hideTrack(id: number) {
  const [, setTrackStore] = libraryStore.trackStore;
  try {
    await invoke("hide_track", { songId: id });
    setTrackStore((prev) => {
      return prev.map((track) =>
        track.song_id === id
          ? { ...track, is_hidden: !track.is_hidden }
          : track,
      );
    });
  } catch (error) {
    console.error("Failed to favorite track:", error);
  }
}
