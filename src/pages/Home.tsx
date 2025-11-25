// Dependencies
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { createSignal, For, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import ReleaseItem from "../ui/components/ReleaseItem";

interface Release {
  id: number;
  title: string;
  artist_id: number;
  artist_name: string;
  release_date: string;
  total_tracks: number;
  total_discs: number;
  duration: number;
  artwork: string;
  is_favorite: boolean;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export default function Page() {
  const [releases, setReleases] = createSignal<Release[]>([]);

  onMount(async () => {
    try {
      setReleases(await invoke("get_releases"));
      console.log(releases());
    } catch (error) {
      console.log("Startup error:", error);
    }
  });
  return (
    <div class="bg-zinc-900 size-7/12 h-full rounded-3xl grow overflow-hidden border border-zinc-700/50">
      <div class="relative w-full shadow-xl">
        <div class="absolute  w-full text-white  bg-zinc-900/50  z-1  border-b border-zinc-700/50">
          <div
            class="backdrop-blur-3xl flex flex-row items-center gap-2 pt-3 px-4 pb-3 w-full h-full "
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
        <div class="flex flex-col gap-2 w-full pt-18 relative">
          <div class="flex flex-row justify-between items-center px-12">
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
              class="px-12"
            >
              <div class="flex flex-row gap-3 w-[1364px]">
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
                <div class="flex flex-col gap-2">
                  <div>
                    <img
                      src="/assets/images/britpop-agcook.jpg"
                      alt=""
                      class="min-h-40 min-w-40 max-h-40 max-w-40 rounded-xl"
                    />
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm text-zinc-300 font-medium hover:underline hover:text-white hover:cursor-pointer">
                      Britpop
                    </span>
                    <span class="text-xs text-zinc-500 hover:underline hover:text-white hover:cursor-pointer">
                      AG Cook
                    </span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <div>
                    <img
                      src="/assets/images/britpop-agcook.jpg"
                      alt=""
                      class="min-h-40 min-w-40 max-h-40 max-w-40 rounded-xl"
                    />
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm text-zinc-300 font-medium hover:underline hover:text-white hover:cursor-pointer">
                      Britpop
                    </span>
                    <span class="text-xs text-zinc-500 hover:underline hover:text-white hover:cursor-pointer">
                      AG Cook
                    </span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <div>
                    <img
                      src="/assets/images/britpop-agcook.jpg"
                      alt=""
                      class="min-h-40 min-w-40 max-h-40 max-w-40 rounded-xl"
                    />
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm text-zinc-300 font-medium hover:underline hover:text-white hover:cursor-pointer">
                      Britpop
                    </span>
                    <span class="text-xs text-zinc-500 hover:underline hover:text-white hover:cursor-pointer">
                      AG Cook
                    </span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <div>
                    <img
                      src="/assets/images/britpop-agcook.jpg"
                      alt=""
                      class="min-h-40 min-w-40 max-h-40 max-w-40 rounded-xl"
                    />
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm text-zinc-300 font-medium hover:underline hover:text-white hover:cursor-pointer">
                      Britpop
                    </span>
                    <span class="text-xs text-zinc-500 hover:underline hover:text-white hover:cursor-pointer">
                      AG Cook
                    </span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <div>
                    <img
                      src="/assets/images/britpop-agcook.jpg"
                      alt=""
                      class="min-h-40 min-w-40 max-h-40 max-w-40 rounded-xl"
                    />
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm text-zinc-300 font-medium hover:underline hover:text-white hover:cursor-pointer">
                      Britpop
                    </span>
                    <span class="text-xs text-zinc-500 hover:underline hover:text-white hover:cursor-pointer">
                      AG Cook
                    </span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <div>
                    <img
                      src="/assets/images/britpop-agcook.jpg"
                      alt=""
                      class="min-h-40 min-w-40 max-h-40 max-w-40 rounded-xl"
                    />
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm text-zinc-300 font-medium hover:underline hover:text-white hover:cursor-pointer">
                      Britpop
                    </span>
                    <span class="text-xs text-zinc-500 hover:underline hover:text-white hover:cursor-pointer">
                      AG Cook
                    </span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <div>
                    <img
                      src="/assets/images/britpop-agcook.jpg"
                      alt=""
                      class="min-h-40 min-w-40 max-h-40 max-w-40 rounded-xl"
                    />
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm text-zinc-300 font-medium hover:underline hover:text-white hover:cursor-pointer">
                      Britpop
                    </span>
                    <span class="text-xs text-zinc-500 hover:underline hover:text-white hover:cursor-pointer">
                      AG Cook
                    </span>
                  </div>
                </div>
              </div>
            </OverlayScrollbarsComponent>
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
