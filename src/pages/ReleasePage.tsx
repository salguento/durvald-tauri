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
import msToMinSec from "../utils/msToSec";
// Types
import { ReleaseType } from "../types/ReleaseType";
import SongType from "../types/Track";
// UI
import BackButton from "../ui/Components/BackButton";

export default function ReleasePage() {
  const [release, setRelease] = createSignal<ReleaseType>();
  const [songs, setSongs] = createSignal<SongType[]>([]);

  onMount(async () => {
    const params = useParams();
    const releaseId = params.id;
    setRelease(await invoke("get_release_by_id", { releaseId: releaseId }));
    setSongs(await invoke("get_songs_by_release_id", { releaseId: releaseId }));
  });

  return (
    <div class="col-span-6 h-full rounded-3xl overflow-hidden border border-zinc-500/50">
      <div class="relative w-full shadow-xl">
        <div class="absolute  w-full text-white  bg-black/50  z-1  border-b border-zinc-500/50">
          <div class="backdrop-blur-2xl grid grid-cols-5 items-center  pt-3 px-4 pb-3 w-full h-full">
            <div
              class="flex items-center gap-2 col-span-2"
              data-tauri-drag-region
            >
              <BackButton />
              <span class="text-xl font-semibold">Album</span>
            </div>
            <div
              class="col-span-1 flex gap-4 items-center justify-center"
              data-tauri-drag-region
            >
              <button class="w-8 h-8">
                <span class="icon-[solar--play-circle-bold] w-8 h-8 text-white"></span>
              </button>
              <button class="w-6 h-6">
                <span class="icon-[solar--shuffle-linear] w-6 h-6 text-white"></span>
              </button>
            </div>
            <div
              class="col-span-2 flex gap-4 items-center justify-end"
              data-tauri-drag-region
            >
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
        element="div"
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
            <div class="bg-black/50 backdrop-blur-2xl absolute w-full h-full"></div>
            <img src={release()?.artwork} class="w-full"></img>
          </div>
          <div class="flex flex-col gap-8 w-full relative pt-14">
            <div class="flex flex-row gap-8 items-center px-4">
              <div>
                <img
                  src={release()?.artwork}
                  class="h-48 w-48 rounded-2xl"
                  alt=""
                />
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-2xl text-white font-semibold">
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
                      {msToMinSec(release()!.duration)}
                    </span>
                  </Show>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="  shadow overflow-hidden">
            <table class="w-full divide-y divide-zinc-700">
              <thead class="h-4 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                <tr class="">
                  <th class="w-8  text-left py-1"></th>
                  <th class="w-8 text-center py-1">#</th>
                  <th class="px-2  text-left py-1">Title</th>
                  <th class="px-2 text-left  py-1">Duration</th>
                </tr>
              </thead>
              <tbody class="bg-black divide-y divide-zinc-500/50">
                <For each={songs()}>
                  {(song: SongType) => (
                    <tr
                      class="hover:bg-zinc-800 group hover:cursor-pointer relative h-8"
                      onDblClick={() => playBack(song)}
                    >
                      <td class=" flex justify-center items-center px-2 w-fit  overflow-hidden h-8">
                        <button
                          class="text-zinc-400 hover:text-white hover:cursor-pointer  flex justify-center w-4"
                          title={`${
                            song.is_favorite
                              ? "Unfavorite song"
                              : "Favorite song"
                          }`}
                        >
                          <span
                            class={`w-4 h-4 rounded-full  ${
                              song.is_favorite
                                ? "icon-[solar--heart-bold]"
                                : "group-hover:icon-[solar--heart-linear]"
                            }`}
                          ></span>
                        </button>
                      </td>
                      <td class="whitespace-nowrap items-center">
                        <div class="flex items-center justify-center w-8">
                          <div class="text-sm font-medium text-zinc-400 group-hover:hidden">
                            {song.track_number}
                          </div>
                          <button
                            class="group-hover:block hidden h-4 w-4 hover:cursor-pointer"
                            title="Play"
                            onClick={() => playBack(song)}
                          >
                            <span class="icon-[solar--play-bold] text-white h-4 w-4"></span>
                          </button>
                        </div>
                      </td>
                      <td class="px-2  whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="text-sm font-medium text-zinc-400">
                            {song.title}
                          </div>
                        </div>
                      </td>
                      {/*<td class="px-6 py-2 whitespace-nowrap">
                        <span
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                          classList={{
                            "bg-yellow-100 text-yellow-800": song.isFavorite,
                            "bg-blue-100 text-blue-800": !song.isFavorite,
                          }}
                        >
                          {song.isFavorite ? "Folder" : song.isAdded || "File"}
                        </span>
                      </td>*/}
                      <td class="px-6  whitespace-nowrap text-sm text-zinc-400">
                        {msToMinSec(song.duration)}
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
          <div class="w-full">
            <div class="w-full h-full bg-amber-500"></div>
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
