// Dependencies
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { createSignal, For, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import ReleaseItem from "../ui/Components/ReleaseItem";

// Stores
import { playerStore } from "../stores/playerStore";
import { uiStore } from "../stores/uiStore";
// Types
import { ReleaseType } from "../types/ReleaseType";
import { QueueItemType } from "../types/QueueItemType";
import TrackType from "../types/Track";
// Function
export default function Page() {
  const [releases, setReleases] = createSignal<ReleaseType[]>([]);
  onMount(async () => {
    const [queueList, setQueueList] = playerStore.queueList;
    const [, setCurrentTrack] = playerStore.currentTrack;
    const [, setShowSidebar] = uiStore.showSideBar;

    try {
      setReleases(await invoke("get_releases"));
      await invoke("load_queue_from_db");
      const queue: QueueItemType[] = await invoke("get_queue");

      setQueueList([]);

      const trackPromises = queue.map(async (i: QueueItemType, index) => {
        const trackItem: TrackType[] = await invoke("get_song_by_id", {
          songId: i[0].toString(),
        });
        return { track: trackItem[0], isFirst: index === 0 };
      });

      const results = await Promise.all(trackPromises);

      const tracks = results.map((r) => r.track);
      setQueueList(tracks);

      if (results.length > 0 && results[0].isFirst) {
        setCurrentTrack(results[0].track);
      }
    } catch (error) {
      console.log("Startup error:", error);
    } finally {
      if (queueList().length == 0) {
        setShowSidebar(false);
      }
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
            <span class="text-base text-zinc-300 font-semibold">Top Picks</span>
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
              <div class="grid grid-flow-row grid-cols-3 gap-3 w-full">
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
