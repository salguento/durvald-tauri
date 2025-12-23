// Dependecies
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { onMount, Show, createSignal } from "solid-js";
// Hooks
import playBack from "../../hooks/audio/play";
import pausePlayback from "../../hooks/audio/pause";
import resumePlayback from "../../hooks/audio/resume";
import { useVolume } from "../../hooks/audio/useVolume";
import playNext from "../../hooks/audio/next";
import playPrevious from "../../hooks/audio/previous";
// Utils
import { secToMin } from "../../utils/secToMin";
// Store
import { playerStore } from "../../stores/playerStore";
// UI
import { Slider } from "@kobalte/core/slider";
// Types
import ProgressPayload from "../../types/ProgressPayload";
// Function
export default function PlayBar() {
  const [isDragging, setIsDragging] = createSignal(false);
  const [, setLastSeekTime] = createSignal(0);
  const [previewPosition, setPreviewPosition] = createSignal<number | null>(
    null,
  );
  const [, setLastProgressUpdate] = createSignal(0);
  const [previousVolume, setPreviousVolume] = createSignal<number>(0);
  // Imported Hooks
  const { volume, handleVolumeChange, setVolumeImmediate } = useVolume({
    initialVolume: 50,
    debounceDelay: 100,
  });
  setVolumeImmediate(50);

  // Imported Stores
  const [playBackState, setPlayBackState] = playerStore.playBackState;
  const [currentTrack] = playerStore.currentTrack;
  const [playbackProgress, setPlaybackProgress] = playerStore.playbackProgress;

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
    <div class=" h-20 rounded-3xl border border-zinc-700/50 relative overflow-hidden">
      <Show when={currentTrack()}>
        <div class="absolute inset-0 z-1 rounded-3xl">
          <img
            src={currentTrack()?.artwork}
            alt=""
            class="w-full h-full object-cover opacity-50"
          />
        </div>
      </Show>
      <div class="absolute inset-0 z-5 bg-black/20">
        <div class="backdrop-blur-xl w-full flex items-center h-full">
          <div class="grid grid-cols-12 w-full items-center px-3 gap-4">
            <div class="col-span-4 xl:col-span-3 h-full relative">
              <Show when={currentTrack()}>
                <div class="flex flex-row items-center justify-start h-full w-full gap-3">
                  <div class="flex flex-row h-full items-center gap-3 overflow-hidden">
                    <img
                      src={currentTrack()?.artwork}
                      alt=""
                      class="h-14 rounded-2xl bg-white"
                    />
                    <div class="flex flex-col truncate">
                      <span class="text-xs font-semibold text-white hover:underline hover:cursor-pointer truncate">
                        {currentTrack()?.title}
                      </span>
                      <span class="text-xs font-medium text-zinc-400 hover:text-white hover:underline hover:cursor-pointer truncate">
                        {currentTrack()?.artist_name}
                      </span>
                    </div>
                  </div>
                  <div class="flex flex-row justify-start  gap-3">
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
              </Show>
            </div>
            <div class="col-span-4 xl:col-span-6 h-16 items-center justify-center">
              <div class="flex flex-col items-center justify-around h-full gap-0">
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
                    onClick={async () => playPrevious()}
                  >
                    <span class="icon-[solar--rewind-back-bold] h-6 w-6"></span>
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
                    title="Forward"
                    onClick={async () => playNext()}
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
                <div class="flex flex-col gap-1 relative w-full">
                  <div class="flex flex-row justify-between items-center gap-2.5 text-xs text-zinc-400 relative w-full">
                    <Show
                      when={!playBackState()?.is_empty}
                      fallback={<span class="h-4 w-8 "></span>}
                    >
                      <span class="w-8">
                        {isDragging() && previewPosition() !== null
                          ? secToMin(previewPosition()!)
                          : secToMin(playbackProgress().position)}
                      </span>
                    </Show>
                    <Slider
                      class="relative flex flex-col items-center w-full hover:cursor-pointer"
                      value={
                        previewPosition() !== null &&
                        playbackProgress().duration
                          ? [previewPosition()! / playbackProgress().duration!]
                          : [playbackProgress().percentage ?? 0]
                      }
                      minValue={0}
                      maxValue={1}
                      step={0.001}
                      onChange={(value) => {
                        setIsDragging(true);
                        if (playbackProgress().duration) {
                          const newPos =
                            value[0] * playbackProgress().duration!;
                          setPreviewPosition(newPos);
                        }
                      }}
                      onChangeEnd={async (value) => {
                        const percentage = value[0];
                        setLastSeekTime(Date.now());

                        // Update UI to final position
                        if (playbackProgress().duration) {
                          const finalPosition =
                            percentage * playbackProgress().duration!;
                          setPlaybackProgress({
                            position: finalPosition,
                            duration: playbackProgress().duration,
                            percentage: percentage,
                          });
                        }

                        setTimeout(() => {
                          setIsDragging(false);
                          setPreviewPosition(null);
                        }, 200); // Show preview for 200ms after release

                        await invoke("seek_to_percentage", { percentage });
                      }}
                    >
                      <Slider.Track class="bg-zinc-500 relative rounded-full h-1 w-full">
                        <Slider.Fill class="absolute bg-white rounded-full h-full" />
                        <Slider.Thumb class="block w-3 h-3 bg-white rounded-full -top-1 hover:cursor-pointer hover:w-4 hover:h-4 hover:-top-1.5 border border-zinc-900/50 focus:outline-0">
                          <Slider.Input />
                        </Slider.Thumb>
                      </Slider.Track>
                    </Slider>
                    <Show
                      when={!playBackState()?.is_empty}
                      fallback={<span class="h-4 w-8"></span>}
                    >
                      <span class="w-8">
                        {playbackProgress().duration
                          ? secToMin(playbackProgress().duration)
                          : "0:00"}
                      </span>
                    </Show>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-span-4 xl:col-span-3 flex  justify-center">
              <div class="flex flex-row items-center justify-center gap-3">
                <button
                  class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer "
                  title={`${volume() !== 0 ? "Mute" : "Unmute"}`}
                  onClick={() => {
                    if (volume() == 0) {
                      setVolumeImmediate(previousVolume());
                    } else {
                      setPreviousVolume(volume());
                      setVolumeImmediate(0);
                    }
                  }}
                >
                  <Show when={volume() == 0}>
                    <span class="icon-[solar--volume-cross-linear] h-6 w-6 "></span>
                  </Show>
                  <Show when={volume() > 0 && volume() < 66}>
                    <span class="icon-[solar--volume-small-linear] h-6 w-6 "></span>
                  </Show>
                  <Show when={volume() >= 66}>
                    <span class="icon-[solar--volume-loud-linear] h-6 w-6 "></span>
                  </Show>
                </button>
                <Slider
                  class="relative flex flex-col items-center w-24 hover:cursor-pointer group"
                  value={[volume()]}
                  onChange={handleVolumeChange}
                  minValue={0}
                  maxValue={100}
                  step={1}
                >
                  <Slider.Track class="bg-zinc-500 relative rounded-full h-1 w-full">
                    <Slider.Fill class="absolute bg-white rounded-full h-full" />
                    <Slider.Thumb class=" w-3 h-3  bg-white rounded-full -top-1 hover:cursor-pointer hover:w-4 hover:h-4 hover:-top-1.5 border border-zinc-900/50 focus:outline-0 relative flex justify-center">
                      <Slider.Input />
                      <div class="text-black text-xs group-active:visible invisible absolute -top-7 flex justify-center bg-white  border border-zinc-500/50 h-fit px-2 py-0.5 rounded-lg w-8 text-center">
                        <span class="">{volume()}</span>
                      </div>
                    </Slider.Thumb>
                  </Slider.Track>
                </Slider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
