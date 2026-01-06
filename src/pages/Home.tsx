// Dependencies
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { For } from "solid-js";
import ReleaseItem from "../ui/Components/Release/ReleaseItem/ReleaseItem";
// Stores
import { libraryStore } from "../stores/libraryStore";
// Function
export default function Page() {
  const [releaseStore] = libraryStore.releaseStore;

  return (
    <div>
      <div class="relative w-full shadow-xl">
        <div class="absolute w-full text-white  bg-zinc-900/50  z-1  border-b border-zinc-700/50">
          <div class="backdrop-blur-xl flex flex-row items-center gap-2 pt-3 px-4 pb-3 w-full  ">
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
              <div class="flex gap-3 w-full">
                <For each={releaseStore()}>
                  {(release) => <ReleaseItem release={release} />}
                </For>
              </div>
            </OverlayScrollbarsComponent>
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
