// Tauri
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
// Types
import SongType from "../../types/Track";
import ProgressPayload from "../../types/ProgressPayload";
// Store
import { playerStore } from "../../stores/playerStore";
// Function
export default async function playBack(track: SongType) {
  const [playBackState, setPlayBackState] = playerStore.playBackState;
  const [currentTrack, setCurrentTrack] = playerStore.currentTrack;
  const [playbackProgress, setPlaybackProgress] = playerStore.playbackProgress;
  try {
    await invoke("play_file", { path: track.file_path });
    await invoke("start_progress_tracking");
    await listen<ProgressPayload>("progress-update", (event) => {
      setPlaybackProgress(event.payload);
    });
  } catch (error) {
    console.error("Failed to play audio:", error);
  } finally {
    setCurrentTrack(track);
    setPlayBackState(await invoke("get_playback_state"));
    console.log(playbackProgress());
  }
}
