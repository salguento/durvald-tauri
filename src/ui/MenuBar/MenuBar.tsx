// Dependencies
import { Show } from "solid-js";
import { A } from "@solidjs/router";
// Store
import { uiStore } from "../../stores/uiStore";
// Function
export default function MenuBar() {
  const [menuCollapsed, setMenuCollaped] = uiStore.menuCollapsed;
  function collapseMenu() {
    setMenuCollaped(!menuCollapsed());
  }
  return (
    <div
      class={`${menuCollapsed() ? "w-[58px] max-w-[58px] min-w-[58px]" : "max-w-72 w-72"} rounded-3xl border  h-full`}
    >
      <div class={`flex flex-col gap-6 h-full  items-center  p-4 `}>
        <Show when={!menuCollapsed()}>
          <div class="flex w-full flex-row flex-wrap justify-between items-center">
            <img
              src="/assets/images/logotype.svg"
              class="h-6"
              alt="durvald logotype"
            />
            <button
              class="hover:text-zinc-200 text-zinc-600 h-6 w-6 hover:cursor-pointer active:cursor-text"
              title="Collapse"
              onClick={() => {
                collapseMenu();
              }}
            >
              <span class="icon-[solar--square-alt-arrow-left-linear] h-6 w-6 "></span>
            </button>
          </div>
        </Show>
        <Show when={menuCollapsed()}>
          <div class="flex w-full flex-col gap-4 flex-wrap justify-between items-center">
            <img
              src="/assets/images/logo.svg"
              class="h-6"
              alt="durvald logotype"
            />
            <button
              class="hover:text-zinc-200 text-zinc-600 h-6 w-6 hover:cursor-pointer active:cursor-text"
              title="Expand"
              onClick={() => {
                collapseMenu();
              }}
            >
              <span class="icon-[solar--square-alt-arrow-right-linear] h-6 w-6 "></span>
            </button>
          </div>
        </Show>
        <div class="relative">
          <Show
            when={!menuCollapsed()}
            fallback={
              <button class="flex  items-center justify-center rounded-lg h-10 w-10 hover:bg-zinc-800 focus:bg-zinc-900  text-zinc-300 hover:cursor-pointer">
                <span class="icon-[solar--magnifer-linear] h-5 w-5 "></span>
              </button>
            }
          >
            <input
              type="text"
              class="rounded-lg w-full border border-transparent bg-zinc-800 focus:bg-zinc-900 hover:border-zinc-600 pl-10 placeholder:text-zinc-600 text-base h-10 font-medium text-white inline-block align-middle pt-1"
              placeholder="Search"
            ></input>
            <span class="absolute left-2.5 top-2.5 icon-[solar--magnifer-linear] h-5 w-5 text-zinc-600 :text-white"></span>
          </Show>
        </div>
        <div class={`flex flex-col ${menuCollapsed() ? "" : "w-full"} `}>
          <A href="/">
            <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
              <span class="icon-[solar--home-angle-2-linear] h-5 w-5 "></span>
              <Show when={!menuCollapsed()}>Home</Show>
            </button>
          </A>
          <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
            <span class="icon-[solar--bell-linear] h-5 w-5 "></span>
            <Show when={!menuCollapsed()}>New</Show>
          </button>
          <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
            <span class="icon-[solar--clock-circle-linear] h-5 w-5 "></span>
            <Show when={!menuCollapsed()}>Recently Added</Show>
          </button>
        </div>
        <div class={`flex flex-col ${menuCollapsed() ? "" : "w-full"} `}>
          <Show when={!menuCollapsed()}>
            <div class="flex flex-row w-full rounded-lg gap-2.5  focus:bg-zinc-900  text-sm h-10 font-medium text-zinc-500 items-center">
              <span class="icon-[solar--music-library-2-linear] h-5 w-5 "></span>
              <span>Library</span>
            </div>
          </Show>
          <A href="/all-artists">
            <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
              <span class="icon-[solar--microphone-2-linear] h-5 w-5 "></span>
              <Show when={!menuCollapsed()}>Artists</Show>
            </button>
          </A>
          <A href="/all-releases">
            <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
              <span class="icon-[solar--library-linear] h-5 w-5 "></span>
              <Show when={!menuCollapsed()}> Albuns</Show>
            </button>
          </A>
          <A href="/all-songs">
            <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
              <span class="icon-[solar--music-notes-linear] h-5 w-5 "></span>
              <Show when={!menuCollapsed()}>Songs</Show>
            </button>
          </A>
          <A href="/all-genres">
            <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
              <span class="icon-[solar--music-note-slider-linear] h-5 w-5 "></span>
              <Show when={!menuCollapsed()}>Genres</Show>
            </button>
          </A>
        </div>
        <Show when={!menuCollapsed()}>
          <div class={`flex flex-col ${menuCollapsed() ? "" : "w-full"} `}>
            <div class="flex flex-row w-full rounded-lg gap-2.5  focus:bg-zinc-900  text-sm h-10 font-medium text-zinc-500 items-center">
              <span class="icon-[solar--playlist-minimalistic-2-bold] h-5 w-5 "></span>
              <span class="">Playlists</span>
            </div>
          </div>
        </Show>
        <div
          class={`flex flex-col h-full justify-end ${menuCollapsed() ? "" : "w-full"} `}
        >
          <A href="/settings">
            <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-400 hover:cursor-pointer">
              <span class="icon-[solar--settings-bold] h-5 w-5 "></span>
              <Show when={!menuCollapsed()}>Settings</Show>
            </button>
          </A>
        </div>
      </div>
    </div>
  );
}
