// Dependencies
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
// Stores
import { searchStore } from "../stores/searchStore";
import SearchResults from "../ui/Search/SearchResults";
import { Show } from "solid-js";
// Function
export default function AllArtists() {
  const [searchInput] = searchStore.searchInput;
  return (
    <div>
      <div class="relative w-full shadow-xl">
        <div class="absolute w-full text-white  bg-zinc-900/50  z-1  border-b border-zinc-700/50">
          <div
            class="backdrop-blur-xl flex flex-row items-center gap-2 pt-3 px-4 pb-3 w-full h-full text-xl font-semibold"
            data-tauri-drag-region
          >
            <Show when={searchInput()} fallback={<span>Browse</span>}>
              <span>Showing results for '{searchInput()}'</span>
            </Show>
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
        <Show when={searchInput()}>
          <SearchResults />
        </Show>
      </OverlayScrollbarsComponent>
    </div>
  );
}
