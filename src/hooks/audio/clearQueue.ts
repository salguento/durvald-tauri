// Tauri
import { invoke } from "@tauri-apps/api/core";
// Store
import { playerStore } from "../../stores/playerStore";
// Function
export default async function clearQueue() {
  const [, setQueueList] = playerStore.queueList;
  try {
    await invoke("clear_queue");
    setQueueList([]);
  } catch (error) {
    console.error("Failed to play audio:", error);
  }
}
