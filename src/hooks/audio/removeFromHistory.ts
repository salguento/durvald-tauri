// Tauri
import { invoke } from "@tauri-apps/api/core";
// Store
import { historyStore } from "../../stores/playHistoryStore";
export default async function removeFromHistory(id: number) {
  const [, setFormattedHistory] = historyStore.formattedHistory;
  setFormattedHistory((prev) => {
    const filtered = prev.filter((item) => item.historyId !== id);
    return filtered;
  });
  await invoke("remove_song_from_history", { historyId: id });
}
