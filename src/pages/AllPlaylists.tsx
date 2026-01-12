// Dependencies
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
// Function
export default function AllPlaylists() {
  return (
    <div>
      <div class="relative w-full shadow-xl">
        <div class="absolute w-full text-white  bg-zinc-900/50  z-1  border-b border-zinc-700/50">
          <div
            class="backdrop-blur-xl flex flex-row items-center gap-2 pt-3 px-4 pb-3 w-full h-full "
            data-tauri-drag-region
          >
            <span class="text-xl font-semibold">All Playlists</span>
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
      ></OverlayScrollbarsComponent>
    </div>
  );
}
