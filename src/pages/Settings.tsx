import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { A } from "@solidjs/router";
// Components
import FolderSelector from "../ui/FolderSelector/FolderSelector";

export default function Settings() {
  return (
    <div class="">
      <div class="relative w-full shadow-xl">
        <div class="absolute  w-full text-white  bg-black/50  z-1  border-b border-zinc-500/50">
          <div class="backdrop-blur-xl flex flex-row items-center gap-2 pt-3 px-4 pb-3 w-full h-full ">
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
