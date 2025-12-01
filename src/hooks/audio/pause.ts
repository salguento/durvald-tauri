// Tauri
import { invoke } from "@tauri-apps/api/core";
// Store
import { playerStore } from "../../stores/playerStore";
// Fuction
export default async function pausePlayback() {
  const [playBackState, setPlayBackState] = playerStore.playBackState;
  const [playbackProgress, setPlaybackProgress] = playerStore.playbackProgress;
  try {
    await invoke("pause_playback");
  } catch (error) {
    console.error("Error resuming playback:", error);
  } finally {
    setPlayBackState(await invoke("get_playback_state"));
  }
}
