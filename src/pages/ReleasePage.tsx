// Dependencies
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { For, onMount, Show } from "solid-js";
import { useParams } from "@solidjs/router";
import { invoke } from "@tauri-apps/api/core";
import { createSignal } from "solid-js";
import { A } from "@solidjs/router";
// Hooks
import playBack from "../hooks/audio/play";
// Utils
import { secToMin } from "../utils/secToMin";
// Types
import { ReleaseType } from "../types/ReleaseType";
import SongType from "../types/Track";
// UI
import BackButton from "../ui/Components/Buttons/ReturnButton/ReturnButton";
import TrackContextMenu from "../ui/Components/Release/TrackContextMenu/TrackContextMenu";
import TrackDropdownMenu from "../ui/Components/Release/TrackContextMenu/TrackDropdownMenu";

export default function ReleasePage() {
  const [release, setRelease] = createSignal<ReleaseType>();
  const [songs, setSongs] = createSignal<SongType[]>([]);
  const [, setIsOpen] = createSignal<boolean>(false);

  onMount(async () => {
    const params = useParams();
    const releaseId = params.id;
    setRelease(await invoke("get_release_by_id", { releaseId: releaseId }));
    setSongs(await invoke("get_songs_by_release_id", { releaseId: releaseId }));
  });

  return (
    <div class="h-full">
      <div class="relative w-full shadow-xl">
        <div class="absolute w-full text-white  bg-zinc-900/50  z-1 border-b border-zinc-700/50">
          <div class="backdrop-blur-xl grid grid-cols-5 items-center  pt-3 px-4 pb-3 w-full h-full">
            <div class="flex items-center gap-2 col-span-2">
              <BackButton />
              <span class="text-xl font-semibold">Album</span>
            </div>
            <div class="col-span-1 flex gap-4 items-center justify-center">
              <button class="w-8 h-8">
                <span class="icon-[solar--play-circle-bold] w-8 h-8 text-white"></span>
              </button>
              <button class="w-6 h-6">
                <span class="icon-[solar--shuffle-linear] w-6 h-6 text-white"></span>
              </button>
            </div>
            <div class="col-span-2 flex gap-4 items-center justify-end">
              <button class="w-6 h-6">
                <span class="icon-[solar--add-square-linear] w-6 h-6 text-white"></span>
              </button>
              <button class="w-6 h-6">
                <span class="icon-[solar--heart-angle-linear] w-6 h-6 text-white"></span>
              </button>
              <button class="w-6 h-6">
                <span class="icon-[solar--menu-dots-bold] w-6 h-6 text-white"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <OverlayScrollbarsComponent
        element="span"
        options={{ scrollbars: { autoHide: "scroll" } }}
        events={{
          scroll: () => {
            /* ... */
          },
        }}
        defer
        class="w-full flex flex-col gap-4 h-full"
      >
        <div class="h-96 relative flex items-center">
          <div class="absolute w-full h-full  overflow-hidden flex items-center">
            <div class="bg-zinc-900/50 backdrop-blur-xl absolute w-full h-full"></div>
            <img src={release()?.artwork} class="w-full"></img>
          </div>
          <div class="flex flex-col gap-8 w-full relative pt-14">
            <div class="flex flex-row gap-8 items-center px-10">
              <div>
                <img
                  src={release()?.artwork}
                  class="w-64 min-w-48 rounded-xl"
                  alt=""
                />
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-2xl text-white font-semibold line-clamp-2">
                  {release()?.title}
                </span>
                <A href={`/artist/${release()?.artist_id}`}>
                  <span class="text-xl text-white/35 font-semibold hover:underline hover:cursor-pointer mix-blend-plus-lighter">
                    {release()?.artist_name}
                  </span>
                </A>
                <div class="flex flex-rol gap-2">
                  <span class="text-md text-zinc-400 font-medium hover:underline hover:cursor-pointer">
                    Electronic
                  </span>
                  <span class="text-md text-zinc-400 font-medium">•</span>
                  <span class="text-md text-zinc-400 font-medium hover:underline hover:cursor-pointer">
                    {release()?.release_date}
                  </span>
                  <Show when={release()?.duration}>
                    <span class="text-md text-zinc-400 font-medium">•</span>
                    <span class="text-md text-zinc-400 font-medium hover:underline hover:cursor-pointer">
                      {secToMin(release()!.duration)}
                    </span>
                  </Show>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="overflow-hidden relative">
            <div class="relative overflow-hidden">
              <For each={songs()}>
                {(song: SongType) => (
                  <TrackContextMenu track={song}>
                    <div class="flex justify-center items-center content-center h-12  min-w-8 pl-2 ">
                      <button
                        class="text-zinc-300 hover:text-white hover:cursor-pointer w-4 h-4"
                        title={`${
                          song.is_favorite ? "Unfavorite song" : "Favorite song"
                        }`}
                      >
                        <span
                          class={`w-4 h-4  ${
                            song.is_favorite
                              ? "icon-[solar--heart-bold] hover:icon-[solar--heart-linear]"
                              : "group-hover:icon-[solar--heart-linear] hover:icon-[solar--heart-bold]"
                          }`}
                        ></span>
                      </button>
                    </div>
                    <div class="flex justify-center items-center h-12 min-w-10 ">
                      <div class="text-sm font-medium text-zinc-300 group-hover:hidden h-4 w-4 text-center">
                        {song.track_number}
                      </div>
                      <button
                        class="group-hover:block hidden h-4 w-4 hover:cursor-pointer"
                        title="Play"
                        onClick={() => playBack(song)}
                      >
                        <span class="icon-[solar--play-bold] text-white h-4 w-4 text-center"></span>
                      </button>
                    </div>
                    <div class="flex-row items-center content-center min-w-0 w-full px-2">
                      <div class="text-sm font-medium text-zinc-300 truncate  max-w-full">
                        {song.title}
                      </div>
                      <div class="text-xs font-medium text-zinc-500 truncate max-w-full">
                        {song.artist_name}
                      </div>
                    </div>
                    <div class="flex items-center justify-end text-sm text-zinc-400 text-right l min-w-16 px-2">
                      {secToMin(song.duration)}
                    </div>
                    <div class="flex min-w-8 pr-2  hover:text-white text-transparent  items-center justify-center  text-sm group-hover:text-zinc-400 text-right">
                      <button
                        class="h-4 w-4 hover:cursor-pointer"
                        title="Options"
                        onClick={() => setIsOpen(true)}
                      >
                        <TrackDropdownMenu track={song}>
                          <span class="icon-[solar--menu-dots-bold] h-4 w-4"></span>
                        </TrackDropdownMenu>
                      </button>
                    </div>
                  </TrackContextMenu>
                )}
              </For>
            </div>
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
