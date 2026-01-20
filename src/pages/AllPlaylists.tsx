// Dependencies
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { For } from "solid-js";
// Store
import { libraryStore } from "../stores/libraryStore";
// UI
import PlaylistItem from "../ui/Components/Playlist/PlaylistItem";
// Function
export default function AllPlaylists() {
  const [playlistStore] = libraryStore.playlistStore;
  return (
    <div>
      <div class="relative w-full shadow-xl">
        <div class="absolute w-full text-white  bg-zinc-900/50  z-1  border-b border-zinc-700/50">
          <div class="backdrop-blur-xl flex flex-row items-center gap-2 pt-3 px-4 pb-3 w-full  ">
            <span class="text-xl font-semibold">Playlists</span>
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
              <div class="flex gap-3 w-full">
                <For each={playlistStore()}>
                  {(playlist) => <PlaylistItem playlist={playlist} />}
                </For>
              </div>
            </OverlayScrollbarsComponent>
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
