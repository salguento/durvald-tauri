// Dependecies
import { invoke } from "@tauri-apps/api/core";
import { onMount, Show } from "solid-js";
// Hooks
import pausePlayback from "../../hooks/audio/pause";
import resumePlayback from "../../hooks/audio/resume";
// Store
import { playerStore } from "../../stores/playerStore";
// Function
export default function PlayBar() {
  const [playBackState, setPlayBackState] = playerStore.playBackState;
  const [currentTrack, setCurrentTrack] = playerStore.currentTrack;
  onMount(async () => {
    setPlayBackState(await invoke("get_playback_state"));
  });

  return (
    <div class="bg-zinc-900 w-full h-24 rounded-3xl border border-zinc-700/50 relative overflow-hidden">
      <div class="absolute inset-0 z-1 rounded-3xl">
        <img src={currentTrack()?.artwork} alt="" class="w-full h-full" />
      </div>
      <div class="absolute inset-0 z-5 bg-zinc-900/50">
        <div class="backdrop-blur-3xl w-full flex items-center h-full">
          <div class="flex flex-row w-full p-2.5 gap-4">
            <div class="size-1/4 ">
              <div class="flex flex-row items-center justify-between">
                <div class="flex flex-row relative h-full items-center gap-3">
                  <img
                    src={currentTrack()?.artwork}
                    alt=""
                    class="h-16 rounded-xl bg-white"
                  />
                  <div class="flex flex-col">
                    <span class="text-xs font-semibold text-white hover:underline hover:cursor-pointer">
                      {currentTrack()?.title}
                    </span>
                    <span class="text-xs font-medium text-zinc-400 hover:text-white hover:underline hover:cursor-pointer">
                      {currentTrack()?.artist_name}
                    </span>
                  </div>
                </div>
                <div class="flex flex-row gap-3">
                  <button
                    class="flex flex-row rounded-lg text-base  font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Favorite song"
                  >
                    <span
                      class={` h-5 w-5 ${currentTrack()?.is_favorite ? "icon-[solar--heart-angle-bold]" : "icon-[solar--heart-angle-linear]"}`}
                    ></span>
                  </button>
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Add song"
                  >
                    <span class="icon-[solar--add-circle-linear] h-5 w-5 "></span>
                  </button>
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="More options"
                  >
                    <span class="icon-[solar--menu-dots-bold] h-5 w-5 "></span>
                  </button>
                </div>
              </div>
            </div>
            <div class="size-1/2 h-16">
              <div class="flex flex-col items-center justify-around h-full">
                <div class="flex flex-row items-center gap-4">
                  <button
                    class="flex flex-row rounded-lg text-base  font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Shuffle"
                  >
                    <span class="icon-[solar--shuffle-linear] h-5 w-5 "></span>
                  </button>
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Backwards"
                  >
                    <span class="icon-[solar--rewind-back-bold] h-6 w-6"></span>
                  </button>
                  <Show when={playBackState()?.is_empty == true}>
                    <button
                      class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                      title="Play"
                      // onclick={async () => playMusic("./assets/audio/song.wav")}
                    >
                      <span class="icon-[solar--play-circle-bold] h-8 w-8 "></span>
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
                      <span class="icon-[solar--play-circle-bold] h-8 w-8 "></span>
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
                      <span class="icon-[solar--pause-circle-bold] h-8 w-8 "></span>
                    </button>
                  </Show>
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Foward"
                  >
                    <span class="icon-[solar--rewind-forward-bold] h-6 w-6 "></span>
                  </button>
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Repeat"
                  >
                    <span class="icon-[solar--repeat-linear] h-5 w-5 "></span>
                  </button>
                </div>
                <div class="flex flex-col gap-1">
                  <div class="flex flex-row justify-between items-center gap-2 text-xs text-zinc-400">
                    <span>0:00</span>
                    <div class="bg-white h-1 w-[396px] xl:w-lg rounded-full"></div>
                    <span>5:15</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="size-1/4 h-16">
              <div class="flex flex-row w-full h-full items-center justify-between">
                <div class="flex flex-row items-center gap-3">
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Mute"
                  >
                    <span class="icon-[solar--volume-loud-linear] h-6 w-6 "></span>
                  </button>
                  <div class="w-24 h-1 bg-white rounded-full"></div>
                </div>
                <div class="flex flex-row gap-4">
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Miniplayer"
                  >
                    <span class="icon-[solar--minimize-square-3-linear] h-6 w-6 "></span>
                  </button>
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Visualizer"
                  >
                    <span class="icon-[solar--full-screen-square-linear] h-6 w-6 "></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
