// Tauri
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
// Types
import TrackType from "../../types/Track";
import ProgressPayload from "../../types/ProgressPayload";
// Store
import { playerStore } from "../../stores/playerStore";
// Function
export default async function playBack(track: TrackType) {
  const [, setPlayBackState] = playerStore.playBackState;
  const [, setCurrentTrack] = playerStore.currentTrack;
  const [, setPlaybackProgress] = playerStore.playbackProgress;
  const [, setQueueList] = playerStore.queueList;
  try {
    await invoke("play_file", { path: track.file_path });
    await invoke("start_progress_tracking");
    await invoke("clear_queue");
    setQueueList([]);
    await listen<ProgressPayload>("progress-update", (event) => {
      setPlaybackProgress(event.payload);
    });
    const trackList: TrackType[] = await invoke("get_songs_by_release_id", {
      releaseId: track.release_id.toString(),
    });
    const newQueueItems = await trackList.reduce(
      async (
        accPromise: Promise<TrackType[]>,
        item: TrackType,
        index: number,
      ) => {
        const acc = await accPromise;

        if (index + 1 <= track.track_number) {
          return acc;
        }

        await invoke("add_to_queue", {
          songId: item.song_id,
          path: item.file_path,
        });

        return [...acc, item];
      },
      Promise.resolve([] as TrackType[]),
    ); // Cast initial value

    setQueueList((prev) => [...prev, ...newQueueItems]);
  } catch (error) {
    console.error("Failed to play audio:", error);
  } finally {
    setCurrentTrack(track);
    setPlayBackState(await invoke("get_playback_state"));
  }
}
