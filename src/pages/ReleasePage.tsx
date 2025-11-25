// Dependencies
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { For, onMount } from "solid-js";
import { useParams } from "@solidjs/router";
import { invoke } from "@tauri-apps/api/core";
import { createSignal } from "solid-js";
// Types
import { ReleaseType } from "../types/releaseType";
import SongType from "../types/songType";
// UI
import BackButton from "../ui/components/BackButton";

export default function ReleasePage() {
  const [release, setRelease] = createSignal<ReleaseType>();
  const [songs, setSongs] = createSignal<SongType[]>([]);
  function msToMinSec(ms: number) {
    return `${Math.floor(ms / 60)}:${((ms % 60) / 1).toFixed(0).padStart(2, "0")}`;
  }

  onMount(async () => {
    const params = useParams();
    const releaseId = params.id;
    setRelease(await invoke("get_release_by_id", { releaseId: releaseId }));
    setSongs(await invoke("get_songs_by_release_id", { releaseId: releaseId }));
  });

  return (
    <div class="bg-zinc-900 size-7/12 h-full rounded-3xl grow overflow-hidden border border-zinc-700/50">
      <div class="relative w-full shadow-xl">
        <div class="absolute  w-full text-white  bg-zinc-900/50  z-1  border-b border-zinc-700/50">
          <div
            class="backdrop-blur-3xl flex flex-row items-center gap-2 pt-3 px-4 pb-3 w-full h-full "
            data-tauri-drag-region
          >
            <BackButton />
            <span class="text-xl font-semibold">Album</span>
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
        <div class="flex flex-col gap-8 w-full pt-18 relative">
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
              <span class="text-xl text-zinc-400 font-medium hover:underline hover:cursor-pointer">
                {release()?.artist_name}
              </span>
              <div class="flex flex-rol gap-2">
                <span class="text-md text-zinc-600 font-medium hover:underline hover:cursor-pointer">
                  Electronic
                </span>
                <span class="text-md text-zinc-600 font-medium">•</span>
                <span class="text-md text-zinc-600 font-medium hover:underline hover:cursor-pointer">
                  {release()?.release_date}
                </span>
              </div>
            </div>
          </div>
          <div class="  shadow overflow-hidden">
            <table class="w-full divide-y divide-zinc-700">
              <thead class="">
                <tr>
                  <th class="px-2 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"></th>
                  <th class="px-2 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    #
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody class="bg-zinc-900 divide-y divide-zinc-700">
                <For each={songs()}>
                  {(song: SongType) => (
                    <tr class="hover:bg-zinc-700 ">
                      <td class="px-4 py-2 whitespace-nowrap">
                        <button
                          class="text-zinc-400 hover:text-white hover:cursor-pointer"
                          title={`${
                            song.is_favorite
                              ? "Unfavorite song"
                              : "Favorite song"
                          }`}
                        >
                          <span
                            class={`w-4 h-4 rounded-full mr-3 ${
                              song.is_favorite
                                ? "icon-[solar--heart-bold]"
                                : "icon-[solar--heart-linear]"
                            }`}
                          ></span>
                        </button>
                      </td>
                      <td class="px-2 py-2 whitespace-nowrap">
                        <div class="text-sm font-medium text-zinc-400">
                          {song.track_number}
                        </div>
                      </td>
                      <td class="px-6 py-2 whitespace-nowrap">
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
                      <td class="px-6 py-2 whitespace-nowrap text-sm text-zinc-400">
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
