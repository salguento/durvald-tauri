// Dependencies
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { createSignal, For, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import ReleaseItem from "../ui/Components/ReleaseItem";
// Types
import { ReleaseType } from "../types/ReleaseType";

export default function Page() {
  const [releases, setReleases] = createSignal<ReleaseType[]>([]);

  onMount(async () => {
    try {
      setReleases(await invoke("get_releases"));
    } catch (error) {
      console.log("Startup error:", error);
    }
  });
  return (
    <div>
      <div class="relative w-full shadow-xl">
        <div class="absolute w-full text-white  bg-zinc-900/50  z-1  border-b border-zinc-700/50">
          <div
            class="backdrop-blur-xl flex flex-row items-center gap-2 pt-3 px-4 pb-3 w-full h-full "
            data-tauri-drag-region
          >
            <span class="icon-[solar--home-angle-2-linear] h-6 w-6 text-zinc-400 "></span>
            <span class="text-xl font-semibold">Home</span>
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
        <div class="flex flex-col gap-2 w-full pt-16 relative">
          <div class="flex flex-row justify-between items-center px-4">
            <span class="text-base text-zinc-300 font-medium">Top Picks</span>
            <span class="text-xs text-zinc-300 hover:underline hover:cursor-pointer hover:text-white">
              See all
            </span>
          </div>
          <div class="w-full">
            <OverlayScrollbarsComponent
              element="div"
              options={{ scrollbars: { autoHide: "scroll" } }}
              events={{
                scroll: () => {
                  /* ... */
                },
              }}
              defer
              class="px-4"
            >
              <div class="grid grid-cols-4 gap-4 w-full">
                <For each={releases()}>
                  {(releases) => (
                    <ReleaseItem
                      artwork={releases.artwork}
                      releaseId={releases.id}
                      releaseTitle={releases.title}
                      artistId={releases.artist_id}
                      artistName={releases.artist_name}
                      isFavorite={releases.is_favorite}
                    />
                  )}
                </For>
              </div>
            </OverlayScrollbarsComponent>
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
