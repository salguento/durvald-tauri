// Tauri
import { invoke } from "@tauri-apps/api/core";
// Store
import { playerStore } from "../../stores/playerStore";
export default async function addToHistory() {
  const [currentTrack] = playerStore.currentTrack;
  await invoke("play_next");
  await invoke("add_song_to_history", {
    songId: currentTrack()?.song_id,
    duration: currentTrack()?.duration,
  });
}
