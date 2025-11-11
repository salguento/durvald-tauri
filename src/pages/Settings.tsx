import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { A } from "@solidjs/router";
// Components
import FolderSelector from "../ui/FolderSelector/FolderSelector";

export default function Settings() {
  return (
    <div class="bg-zinc-900 size-7/12 h-full rounded-3xl grow overflow-hidden border border-zinc-700/50">
      <div class="relative w-full shadow-xl">
        <div class="absolute  w-full text-white  bg-zinc-900/50  z-1  border-b border-zinc-700/50">
          <div
            class="backdrop-blur-3xl flex flex-row items-center gap-2 pt-3 px-4 pb-3 w-full h-full "
            data-tauri-drag-region
          >
            <button class="hover:cursor-pointer h-6 w-6 text-zinc-400 hover:text-white">
              <A href="/">
                <span class="icon-[solar--arrow-left-linear] h-6 w-6 "></span>
              </A>
            </button>
            <span class="text-xl font-semibold">Settings</span>
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
            <FolderSelector />
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
