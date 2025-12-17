// Tauri
import { listen } from "@tauri-apps/api/event";
// Solidjs
import { createSignal } from "solid-js";
import { createRoot } from "solid-js";
// Types
import PlayBackStateType from "../types/Playback";
import TrackType from "../types/Track";
import ProgressPayloadType from "../types/ProgressPayload";
import { QueueItemType } from "../types/QueueItemType";
// Function
export const playerStore = {
  playBackState: createSignal<PlayBackStateType>(),
  currentTrack: createSignal<TrackType>(),
  playbackProgress: createSignal<ProgressPayloadType>({
    position: 0,
    duration: null,
    percentage: null,
  }),
  queueList: createSignal<TrackType[]>([]),
};

let dispose: (() => void) | undefined;

export const initializePlayerStore = () => {
  if (dispose) return; // Already initialized

  dispose = createRoot((disposeFn) => {
    listen<ProgressPayloadType>("progress-update", (event) => {
      const [, setPlaybackProgress] = playerStore.playbackProgress;
      setPlaybackProgress(event.payload);
    });

    return disposeFn;
  });
};
