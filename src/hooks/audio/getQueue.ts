// Tauri
import { invoke } from "@tauri-apps/api/core";
// Stores
import { defineCurrentTrack, playerStore } from "../../stores/playerStore";
import { libraryStore } from "../../stores/libraryStore";
// Type
import { QueueItemType } from "../../types/QueueItemType";
import { TrackType } from "../../types/DatabaseType";
export async function getQueue() {
  const [, setQueueList] = playerStore.queueList;
  const [trackStore] = libraryStore.trackStore;

  try {
    await invoke("load_queue_from_db");
    const queue: QueueItemType[] = await invoke("get_queue");
    setQueueList([]);

    if (queue.length > 0) {
      const trackPromises = queue.map(async (i: QueueItemType, index) => {
        const trackItem: TrackType[] = trackStore().filter(
          (t) => t.song_id === i[0],
        );
        return { track: trackItem[0], isFirst: index === 0 };
      });

      const results = await Promise.all(trackPromises);
      const tracks = results.map((r) => r.track);
      setQueueList(tracks);

      if (results.length > 0 && results[0].isFirst) {
        defineCurrentTrack(results[0].track);
      }
    }
  } catch (err) {
    console.error("Error fetching queue list:" + err);
  }
}
