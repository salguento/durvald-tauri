// Tauri
import { invoke } from "@tauri-apps/api/core";
//Store
import { playerStore } from "../../stores/playerStore";
// Function
export default async function resumePlayback() {
  const [playBackState, setPlayBackState] = playerStore.playBackState;
  try {
    await invoke("resume_playback");
  } catch (error) {
    console.error("Error resuming playback:", error);
  } finally {
    console.log(playBackState());
    setPlayBackState(await invoke("get_playback_state"));
  }
}
