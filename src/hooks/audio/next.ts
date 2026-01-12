// Tauri
import { invoke } from "@tauri-apps/api/core";
// Store
import { playerStore } from "../../stores/playerStore";
import addToHistory from "./addToHistory";
export default async function playNext() {
  const [currentTrack, setCurrentTrack] = playerStore.currentTrack;
  const [queueList, setQueueList] = playerStore.queueList;
  await invoke("play_next");
  await addToHistory();
  console.log(currentTrack());
  setCurrentTrack(queueList()[0]);
  setQueueList((queueList) => queueList.slice(1));
}
