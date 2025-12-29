// Dependencies
import { A } from "@solidjs/router";
// Function
export default function MobileMenu() {
  return (
    <div class="h-14 bottom-0 left-0 right-0 overflow-hidden absolute p-1 z-1 sm:hidden">
      <div class="bg-zinc-900/50 backdrop-blur-xl border border-zinc-700/50 w-full h-full rounded-2xl">
        <div class="flex flex-row items-center justify-between p-2 h-full">
          <A href="/">
            <button
              class="flex flex-col  p-1.5 rounded-lg gap-1 hover:bg-zinc-800 focus:bg-zinc-900  font-normal text-zinc-300 hover:cursor-pointer items-center text-xs"
              title="Home"
            >
              <span class="icon-[solar--home-angle-2-linear] h-6 w-6"></span>
            </button>
          </A>
          <A href="/">
            <button
              class="flex flex-col  p-1.5 rounded-lg gap-1 hover:bg-zinc-800 focus:bg-zinc-900  font-normal text-zinc-300 hover:cursor-pointer items-center text-xs"
              title="New"
            >
              <span class="icon-[solar--bell-linear] h-6 w-6"></span>
            </button>
          </A>
          <A href="/search">
            <button
              class="flex flex-col  p-1.5 rounded-lg gap-1 hover:bg-zinc-800 focus:bg-zinc-900  font-normal text-zinc-300 hover:cursor-pointer items-center text-xs"
              title="Search"
            >
              <span class="icon-[solar--magnifer-linear] h-6 w-6"></span>
            </button>
          </A>
          <A href="/">
            <button
              class="flex flex-col  p-1.5 rounded-lg gap-1 hover:bg-zinc-800 focus:bg-zinc-900  font-normal text-zinc-300 hover:cursor-pointer items-center text-xs"
              title="Library"
            >
              <span class="icon-[solar--music-library-2-linear] h-6 w-6"></span>
            </button>
          </A>
          <A href="/">
            <button
              class="flex flex-col  p-1.5 rounded-lg gap-1 hover:bg-zinc-800 focus:bg-zinc-900  font-normal text-zinc-300 hover:cursor-pointer items-center text-xs"
              title="Create"
            >
              <span class="icon-[solar--widget-add-linear] h-6 w-6"></span>
            </button>
          </A>
        </div>
      </div>
    </div>
  );
}
