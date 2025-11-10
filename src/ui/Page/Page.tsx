import FolderSelector from "../FolderSelector/FolderSelector";
import "overlayscrollbars/overlayscrollbars.css";
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";

export default function Page() {
  return (
    <div class="bg-zinc-900 size-7/12 h-full rounded-3xl grow overflow-hidden border border-zinc-700/50">
      <OverlayScrollbarsComponent
        element="div"
        options={{ scrollbars: { autoHide: "scroll" } }}
        events={{
          scroll: () => {
            /* ... */
          },
        }}
        defer
        class="h-full relative"
      >
        <div class=" w-full flex flex-col gap-4 h-[1028px] ">
          <div
            class="flex flex-row items-center gap-2 pt-3 px-4 pb-3  top-0 text-white sticky z-10  bg-zinc-900/50 backdrop-blur-3xl"
            data-tauri-drag-region
          >
            <span class="icon-[solar--home-angle-2-linear] h-6 w-6 "></span>
            <span class="text-xl font-semibold">Home</span>
          </div>
          <div class="flex flex-col gap-2 w-full ">
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
            <FolderSelector />
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
