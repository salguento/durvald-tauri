// Tauri
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
// Types
import TrackType from "../../types/Track";
import ProgressPayload from "../../types/ProgressPayload";
// Store
import { playerStore } from "../../stores/playerStore";
import { ReleaseType } from "../../types/ReleaseType";
// Function
export default async function playBack(track: TrackType) {
  const [playBackState, setPlayBackState] = playerStore.playBackState;
  const [currentTrack, setCurrentTrack] = playerStore.currentTrack;
  const [playbackProgress, setPlaybackProgress] = playerStore.playbackProgress;
  const [queueList, setQueueList] = playerStore.queueList;
  try {
    await invoke("play_file", { path: track.file_path });
    await invoke("start_progress_tracking");
    await listen<ProgressPayload>("progress-update", (event) => {
      setPlaybackProgress(event.payload);
    });
    const trackList: TrackType[] = await invoke("get_songs_by_release_id", {
      releaseId: track.release_id.toString(),
    });
    trackList.forEach(async (item, index) => {
      if (index + 1 <= track.track_number) return;
      await invoke("add_to_queue", {
        songId: item.song_id,
        path: item.file_path,
      });
    });
  } catch (error) {
    console.error("Failed to play audio:", error);
  } finally {
    setCurrentTrack(track);
    setPlayBackState(await invoke("get_playback_state"));
    setQueueList(await invoke("get_queue"));
  }
}
