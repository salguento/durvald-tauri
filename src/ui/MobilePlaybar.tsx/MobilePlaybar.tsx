// Dependecies
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { onMount, Show, createSignal } from "solid-js";
// Hooks
import playBack from "../../hooks/audio/play";
import pausePlayback from "../../hooks/audio/pause";
import resumePlayback from "../../hooks/audio/resume";
import playNext from "../../hooks/audio/next";
// Store
import { playerStore } from "../../stores/playerStore";

// Types
import ProgressPayload from "../../types/ProgressPayload";
// Function
export default function MobilePlaybar() {
  const [isDragging] = createSignal(false);

  const [, setLastProgressUpdate] = createSignal(0);
  // Imported Stores
  const [playBackState, setPlayBackState] = playerStore.playBackState;
  const [currentTrack] = playerStore.currentTrack;
  const [, setPlaybackProgress] = playerStore.playbackProgress;

  onMount(async () => {
    setPlayBackState(await invoke("get_playback_state"));

    // In your progress listener
    await listen<ProgressPayload>("progress-update", (event) => {
      setLastProgressUpdate(Date.now());

      // Only update if not currently dragging
      if (!isDragging()) {
        setPlaybackProgress(event.payload);
      }
    });
  });
  return (
    <Show when={currentTrack()}>
      <div
        class={`h-18 bottom-18 left-0 right-0 overflow-hidden absolute p-1 z-10 sm:hidden`}
      >
        <div class="bg-zinc-900/50 backdrop-blur-xl border border-zinc-700/50 w-full h-full rounded-2xl overflow-hidden">
          <div class="flex flex-row items-center justify-between p-2 h-full w-full">
            <div class="absolute inset-0 z-1 rounded-3xl">
              <img
                src={currentTrack()?.artwork}
                alt=""
                class="w-full h-full object-cover opacity-50"
              />
            </div>
            <div class="absolute inset-0 z-5 bg-zinc-950/20 rounded-2xl w-full">
              <div class="backdrop-blur-3xl w-full flex items-center h-full">
                <div class="flex justify-between w-full items-center px-1.5 gap-4">
                  <div class="flex min-w-0 h-full relative">
                    <div class="flex flex-row items-center justify-start h-full w-full gap-3">
                      <div class="flex flex-row h-full items-center gap-3 overflow-hidden w-full">
                        <img
                          src={currentTrack()?.artwork}
                          alt=""
                          class="h-12 rounded-lg bg-white"
                        />
                        <div class="flex flex-col truncate shrink grow">
                          <span class="text-xs font-semibold text-white hover:underline hover:cursor-pointer truncate">
                            {currentTrack()?.title}
                          </span>
                          <span class="text-xs font-medium text-zinc-400 hover:text-white hover:underline hover:cursor-pointer truncate">
                            {currentTrack()?.artist_name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="h-16 items-center w-fit">
                    <div class="flex flex-col items-center justify-around h-full gap-0 w-full">
                      <div class="flex flex-row items-center gap-4">
                        <button
                          class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                          title="Favorite"
                          onclick={async () => {
                            await playBack(currentTrack()!);
                          }}
                          disabled={!currentTrack()}
                        >
                          <span class="icon-[solar--heart-angle-linear] h-6 w-6 "></span>
                        </button>
                        <Show when={playBackState()?.is_empty == true}>
                          <button
                            class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                            title="Play"
                            onclick={async () => {
                              await playBack(currentTrack()!);
                            }}
                            disabled={!currentTrack()}
                          >
                            <span class="icon-[solar--play-bold] h-6 w-6 "></span>
                          </button>
                        </Show>
                        <Show
                          when={
                            playBackState()?.is_empty == false &&
                            playBackState()?.is_paused == true
                          }
                        >
                          <button
                            class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                            title="Resume"
                            onclick={async () => resumePlayback()}
                          >
                            <span class="icon-[solar--play-bold] h-6 w-6 "></span>
                          </button>
                        </Show>
                        <Show
                          when={
                            playBackState()?.is_empty == false &&
                            playBackState()?.is_paused == false
                          }
                        >
                          <button
                            class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                            title="Pause"
                            onclick={async () => pausePlayback()}
                          >
                            <span class="icon-[solar--pause-circle-bold] h-6 w-6 "></span>
                          </button>
                        </Show>
                        <button
                          class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                          title="Forward"
                          onClick={async () => playNext()}
                        >
                          <span class="icon-[solar--rewind-forward-bold] h-6 w-6 "></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
