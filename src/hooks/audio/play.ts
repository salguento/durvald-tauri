// Tauri
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
// Types
import { TrackType } from "../../types/DatabaseType";
import ProgressPayload from "../../types/ProgressPayload";
// Store
import { defineCurrentTrack, playerStore } from "../../stores/playerStore";
import { libraryStore } from "../../stores/libraryStore";

export default async function playBack(track: TrackType) {
  const [, setPlayBackState] = playerStore.playBackState;
  const [, setPlaybackProgress] = playerStore.playbackProgress;
  const [, setQueueList] = playerStore.queueList;
  const [trackStore] = libraryStore.trackStore;

  try {
    // Start playback
    await invoke("play_file", { path: track.file_path });
    await invoke("start_progress_tracking");
    await invoke("clear_queue");
    setQueueList([]);

    // Setup progress listener
    await listen<ProgressPayload>("progress-update", (event) => {
      setPlaybackProgress(event.payload);
    });

    // Build queue from release tracks
    const trackList: TrackType[] = trackStore().filter(
      (t) => t.release_id === track.release_id,
    );

    const newQueueItems = await trackList.reduce(
      async (
        accPromise: Promise<TrackType[]>,
        item: TrackType,
        index: number,
      ) => {
        const acc = await accPromise;
        if (index + 1 <= track.track_number) return acc;

        await invoke("add_to_queue", {
          songId: item.song_id,
          path: item.file_path,
        });
        return [...acc, item];
      },
      Promise.resolve([] as TrackType[]),
    );

    setQueueList((prev) => [...prev, ...newQueueItems]);
  } catch (error) {
    console.error("Failed to play audio:", error);
  } finally {
    defineCurrentTrack(track);
    setPlayBackState(await invoke("get_playback_state"));
  }
}
