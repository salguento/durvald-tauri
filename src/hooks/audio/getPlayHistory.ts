// Tauri
import { invoke } from "@tauri-apps/api/core";
// Type
import TrackType from "../../types/Track";
// Store
import { historyStore } from "../../stores/playHistoryStore";
import { FormattedHistoryType } from "../../types/PlayHistoryType";
export default async function getPlayHistory() {
  const [rawHistory, setRawHistory] = historyStore.rawHistory;
  const [, setFormattedHistory] = historyStore.formattedHistory;
  setRawHistory(await invoke("get_play_history"));
  for (const item of rawHistory()) {
    try {
      const trackItem: TrackType[] = await invoke("get_song_by_id", {
        songId: item.song_id.toString(),
      });
      setFormattedHistory((prev) => {
        const newItem: FormattedHistoryType = {
          historyId: item.history_id,
          track: [...trackItem],
        };
        return [newItem, ...prev];
      });
    } catch (error) {
      console.error(`Failed to fetch track ${item.song_id}:`, error);
    } finally {
    }
  }
}
