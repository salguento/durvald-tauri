// Tauri
import { invoke } from "@tauri-apps/api/core";
//Store
import { playerStore } from "../../stores/playerStore";
// Function
export default async function resumePlayback() {
  const [, setPlayBackState] = playerStore.playBackState;
  try {
    await invoke("resume_playback");
  } catch (error) {
    console.error("Error resuming playback:", error);
  } finally {
    setPlayBackState(await invoke("get_playback_state"));
  }
}
