// Tauri
import { invoke } from "@tauri-apps/api/core";
// Store
import { playerStore } from "../../stores/playerStore";
import { historyStore } from "../../stores/playHistoryStore";
import TrackType from "../../types/Track";
import { FormattedHistoryType, HistoryType } from "../../types/PlayHistoryType";

export default async function addToHistory() {
  const [currentTrack] = playerStore.currentTrack;
  const track = currentTrack();

  if (!track) {
    console.warn("[addToHistory] No current track to add to history");
    return;
  }

  try {
    // Add to database
    await invoke("add_song_to_history", {
      songId: track.song_id,
      duration: track.duration,
    });

    // Refresh the entire history store to reflect the change
    const allHistory: HistoryType[] = await invoke("get_play_history");

    // Update the raw history store
    const [, setRawHistory] = historyStore.rawHistory;
    setRawHistory(allHistory);

    // Update the formatted history store by converting all entries
    const [, setFormattedHistory] = historyStore.formattedHistory;

    // Create formatted history entries for all items
    const formattedEntries: FormattedHistoryType[] = [];

    for (const historyItem of allHistory) {
      try {
        // Get the track associated with this history entry
        const trackItems: TrackType[] = await invoke("get_song_by_id", {
          songId: historyItem.song_id.toString(),
        });

        if (trackItems.length > 0) {
          const formattedItem: FormattedHistoryType = {
            historyId: historyItem.history_id,
            track: trackItems,
          };
          formattedEntries.push(formattedItem);
        }
      } catch (error) {
        console.error(
          `Failed to fetch track for history entry ${historyItem.song_id}:`,
          error,
        );
      }
    }

    // Sort by history_id in descending order (most recent first)
    formattedEntries.sort((a, b) => b.historyId - a.historyId);

    // Update the formatted history store with all entries
    setFormattedHistory(formattedEntries);

    console.log("[History] Added to history:", track.title);
  } catch (error) {
    console.error("[History] Failed to add song to history:", error);
  }
}
