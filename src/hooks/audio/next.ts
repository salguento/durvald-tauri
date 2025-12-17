// Tauri
import { invoke } from "@tauri-apps/api/core";
// Store
import { playerStore } from "../../stores/playerStore";
export default async function playNext() {
  const [, setCurrentTrack] = playerStore.currentTrack;
  const [queueList, setQueueList] = playerStore.queueList;
  await invoke("play_next");
  setCurrentTrack(queueList()[0]);
  setQueueList((queueList) => queueList.slice(1));
}
