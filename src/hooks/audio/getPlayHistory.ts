// Tauri
import { invoke } from "@tauri-apps/api/core";
// Type
import TrackType from "../../types/Track";
// Store
import { historyStore } from "../../stores/playHistoryStore";
export default async function getPlayHistory() {
  const [rawHistory, setRawHistory] = historyStore.rawHistory;
  const [, setFormattedHistory] = historyStore.formattedHistory;
  setRawHistory(await invoke("get_play_history"));
  for (const item of rawHistory()) {
    try {
      // Assuming invoke returns a single TrackType, not TrackType[]
      const trackItem: TrackType[] = await invoke("get_song_by_id", {
        songId: item.song_id.toString(),
      });

      // Add the track object, not an array
      setFormattedHistory((prev) => [...trackItem, ...prev]);
    } catch (error) {
      console.error(`Failed to fetch track ${item.song_id}:`, error);
    } finally {
    }
  }
}
