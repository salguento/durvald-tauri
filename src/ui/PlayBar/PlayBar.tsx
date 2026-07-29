// Dependecies
import { invoke } from "@tauri-apps/api/core";
import { onMount, Show, createSignal, createEffect } from "solid-js";
// Hooks
import playBack from "../../hooks/audio/play";
import pausePlayback from "../../hooks/audio/pause";
import resumePlayback from "../../hooks/audio/resume";
import { useVolume } from "../../hooks/audio/useVolume";
import playNext from "../../hooks/audio/next";
import playPrevious from "../../hooks/audio/previous";
import favoriteTrack from "../../hooks/library/Tracks/favoriteTrack";
// Service
import { lastfm } from "../../services/lastfm";
// Utils
import { secToMin } from "../../utils/secToMin";
// Store
import { playerStore } from "../../stores/playerStore";
// UI
import { Slider } from "@kobalte/core/slider";
import TrackDropdownMenu from "../Components/Release/TrackContextMenu/TrackDropdownMenu";

export default function PlayBar() {
  const [isDragging, setIsDragging] = createSignal(false);
  const [, setLastSeekTime] = createSignal(0);
  const [previewPosition, setPreviewPosition] = createSignal<number | null>(
    null,
  );
  const [previousVolume, setPreviousVolume] = createSignal<number>(0);

  // ✅ LAST.FM SCROBBLING STATE
  const [lastScrobbledTrackId, setLastScrobbledTrackId] = createSignal<
    string | null
  >(null);
  const [, setPlayStartTime] = createSignal<number | null>(null);
  const [hasScrobbled, setHasScrobbled] = createSignal(false);

  // Imported Hooks
  const { volume, handleVolumeChange, setVolumeImmediate, volumeInitialized } =
    useVolume({
      debounceDelay: 100,
    });

  // Imported Stores
  const [playBackState, setPlayBackState] = playerStore.playBackState;
  const [currentTrack, setCurrentTrack] = playerStore.currentTrack;
  const [playbackProgress, setPlaybackProgress] = playerStore.playbackProgress;

  // ✅ CENTRALIZED: Watch for track changes and reset scrobble state
  createEffect(() => {
    const track = currentTrack();
    if (!track) {
      console.log("[PlayBar createEffect] No track");
      return;
    }

    const trackId = `${track.song_id}`;
    const lastId = lastScrobbledTrackId();

    console.log(
      `[PlayBar createEffect] Track: "${track.title}" (ID: ${trackId}), LastScrobbledID: ${lastId}, hasScrobbled: ${hasScrobbled()}`,
    );

    // Reset scrobble state when track changes
    if (lastId !== trackId) {
      console.log(
        `[PlayBar] Track changed from ID ${lastId} to ${trackId}, resetting scrobble state:`,
        track.title,
      );
      setLastScrobbledTrackId(null);
      setHasScrobbled(false);
      setPlayStartTime(Date.now());
    } else {
      console.log(`[PlayBar createEffect] Same track, no reset needed`);
    }
  });

  onMount(async () => {
    setPlayBackState(await invoke("get_playback_state"));

    // ✅ Subscribe to progress updates to check scrobble criteria
    // Note: playerStore already updates playbackProgress via its own listener
    // We just need to react to those updates for scrobbling
    let checkCount = 0;
    const checkScrobbleInterval = setInterval(() => {
      checkCount++;
      const track = currentTrack();
      const progress = playbackProgress();

      if (checkCount % 10 === 0) {
        console.log(
          `[Scrobble Interval] Check #${checkCount} - Track: ${track?.title || "none"}, Progress: ${progress.position}s / ${progress.duration}s`,
        );
      }

      if (track && progress.duration && !isDragging()) {
        checkScrobbleCriteria(track, progress.position, progress.duration);
      }
    }, 1000); // Check every second

    // Cleanup interval on unmount
    return () => {
      console.log("[Scrobble Interval] Cleaning up interval");
      clearInterval(checkScrobbleInterval);
    };
  });

  const handleFavorite = () => {
    favoriteTrack(currentTrack()!.song_id);
    setCurrentTrack((prev) => {
      const track = prev!;
      return {
        ...track,
        is_favorite: !track.is_favorite,
      };
    });
  };

  /**
   * ✅ Check if scrobble criteria is met
   * Scrobbles when: 50% of track played OR 240 seconds (4 minutes), whichever comes first
   */
  const checkScrobbleCriteria = (
    track: any,
    position: number,
    duration: number,
  ) => {
    if (!track) {
      console.log("[Scrobble Check] No track");
      return;
    }

    if (hasScrobbled()) {
      console.log("[Scrobble Check] Already scrobbled (hasScrobbled=true)");
      return;
    }

    const trackId = `${track.song_id}`;

    // Prevent duplicate scrobbles for the same track
    if (lastScrobbledTrackId() === trackId) {
      console.log("[Scrobble Check] Already scrobbled this track ID:", trackId);
      return;
    }

    const playedSeconds = position;
    const minPlayTime = Math.min(duration * 0.5, 240); // 50% of track OR 4 minutes

    console.log(
      `[Scrobble Check] ${track.title}: ${playedSeconds.toFixed(0)}s / ${minPlayTime.toFixed(0)}s (${((playedSeconds / duration) * 100).toFixed(1)}%)`,
    );

    if (playedSeconds >= minPlayTime) {
      // Scrobble criteria met!
      if (lastfm.status === "connected") {
        const artist = (track.artist_name || "").trim();
        const title = (track.title || "").trim();
        const album = (track.release_title || "").trim() || undefined;

        lastfm
          .scrobble(artist, title, album)
          .then((success) => {
            if (success) {
              // Scrobble confirmed — mark as done so we don't retry
              setHasScrobbled(true);
              setLastScrobbledTrackId(trackId);
            } else {
              // Network failure — scrobble was queued for retry.
              // Leave hasScrobbled=false so if connection comes back mid-song
              // and the queue flush doesn't cover it, we can still try again.
              console.log(
                "[Scrobble Check] Scrobble queued offline, will retry when back online.",
              );
            }
          })
          .catch((err) => {
            console.warn("[Last.fm] Scrobble call threw unexpectedly:", err);
          });

        console.log("[Last.fm] Scrobble initiated for:", artist, "-", title);
      } else {
        // Not connected at all — queue it and leave hasScrobbled=false
        const artist = (track.artist_name || "").trim();
        const title = (track.title || "").trim();
        const album = (track.release_title || "").trim() || undefined;
        lastfm.scrobble(artist, title, album); // will enqueue since not connected
        console.log(
          "[Scrobble Check] Not connected, scrobble queued for later.",
        );
      }
    }
  };

  return (
    <div class=" h-20 rounded-3xl border border-zinc-700/50 relative overflow-hidden hidden sm:block">
      <Show when={currentTrack()}>
        <div class="absolute inset-0 z-1 rounded-3xl">
          <img
            src={currentTrack()?.artwork}
            alt=""
            class="w-full h-full object-cover opacity-50"
          />
        </div>
      </Show>
      <div class="absolute inset-0 z-5 bg-zinc-950/20">
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
                      title={`${currentTrack()?.is_favorite ? "Unfavorite track" : "Favorite track"}`}
                      onClick={() => handleFavorite()}
                    >
                      <span
                        class={` h-5 w-5 ${currentTrack()?.is_favorite ? "icon-[solar--heart-angle-bold]" : "icon-[solar--heart-angle-linear]"}`}
                      ></span>
                    </button>
                    <button
                      class="flex flex-row rounded-lg text-base  font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                      title="Options"
                    >
                      <TrackDropdownMenu track={currentTrack()!}>
                        <span class="icon-[solar--menu-dots-bold] h-5 w-5"></span>
                      </TrackDropdownMenu>
                    </button>
                  </div>
                </div>
              </Show>
            </div>
            <div class="col-span-4 xl:col-span-6 flex flex-col justify-center items-center">
              <div class="flex flex-col w-full h-full  justify-center items-center gap-1.5">
                <div class="flex flex-row items-center justify-center gap-3">
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Shuffle"
                  >
                    <span class="icon-[solar--shuffle-linear] h-5 w-5 "></span>
                  </button>
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Rewind"
                    onClick={async () => {
                      await playPrevious();
                    }}
                  >
                    <span class="icon-[solar--rewind-back-bold] h-6 w-6 "></span>
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
                      playBackState()?.is_paused == true &&
                      playBackState()?.is_empty == false
                    }
                  >
                    <button
                      class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                      title="Resume"
                      onclick={async () => {
                        await resumePlayback();
                        // ✅ Reset play start time when resuming
                        setPlayStartTime(Date.now());
                      }}
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
                      <span class="icon-[solar--pause-bold] h-6 w-6 "></span>
                    </button>
                  </Show>
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Forward"
                    onClick={async () => {
                      // ✅ Just call playNext - the backend will handle everything
                      // and emit "song-changed" which will trigger scrobble reset
                      await playNext();
                    }}
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
                <Show when={lastfm.status === "connected"}>
                  <div
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20"
                    title={`Last.fm connected${lastfm.username ? `: ${lastfm.username}` : ""}`}
                  >
                    <span class="icon-[solar--radio-minimalistic-bold] h-4 w-4 text-blue-400"></span>
                    <span class="text-xs font-medium text-blue-300 hidden md:block">
                      {lastfm.username
                        ? lastfm.username.slice(0, 8)
                        : "Last.fm"}
                    </span>
                  </div>
                </Show>
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
                <Show when={volumeInitialized()}>
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
                        <div class="text-zinc-950 text-xs group-active:visible invisible absolute -top-7 flex justify-center bg-white  border border-zinc-500/50 h-fit px-2 py-0.5 rounded-lg w-8 text-center">
                          <span class="">{volume()}</span>
                        </div>
                      </Slider.Thumb>
                    </Slider.Track>
                  </Slider>
                </Show>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
