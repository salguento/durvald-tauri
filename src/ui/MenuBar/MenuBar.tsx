// Dependencies
import { Show } from "solid-js";
// Store
import { uiStore } from "../../stores/uiStore";
// Components
import MenubarButton from "./MenubarButton";
// Function
export default function MenuBar() {
  const [menuCollapsed, setMenuCollaped] = uiStore.menuCollapsed;
  function collapseMenu() {
    setMenuCollaped(!menuCollapsed());
  }
  return (
    <div
      class={`${menuCollapsed() ? "w-[58px] max-w-[58px] min-w-[58px]" : "max-w-72 w-72"} rounded-3xl border  h-full hidden sm:block`}
    >
      <div class={`flex flex-col gap-2 h-full  items-center  p-4 `}>
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
          <div class="flex w-full flex-col gap-4 flex-wrap justify-between items-center group">
            <img
              src="/assets/images/logo.svg"
              class="h-6 group-hover:invisible"
              alt="durvald logotype"
            />
            <button
              class="hover:text-zinc-200 text-zinc-600 h-6 w-6 hover:cursor-pointer active:cursor-text absolute invisible group-hover:visible"
              title="Expand"
              onClick={() => {
                collapseMenu();
              }}
            >
              <span class="icon-[solar--square-alt-arrow-right-linear] h-6 w-6 "></span>
            </button>
          </div>
        </Show>

        <div class={`flex flex-col ${menuCollapsed() ? "" : "w-full"} gap-0.5`}>
          <MenubarButton
            href="/"
            title="Home"
            icon="icon-[solar--home-angle-2-linear]"
          />
          <MenubarButton
            href="/new"
            title="New"
            icon="icon-[solar--bell-linear]"
          />
          <MenubarButton
            href="/listen-later"
            title="Listen later"
            icon="icon-[solar--bookmark-square-outline]"
          />
          <MenubarButton
            href="/recently-added"
            title="Recently added"
            icon="icon-[solar--clock-circle-linear]"
          />
          <MenubarButton
            href="/stats"
            title="Stats"
            icon="icon-[solar--round-graph-linear]"
          />
        </div>
        <div
          class={`flex flex-col ${menuCollapsed() ? "" : "w-full"}  gap-0.5 `}
        >
          <Show when={!menuCollapsed()}>
            <div class="flex flex-row w-full rounded-lg gap-2.5  focus:bg-zinc-900  text-sm h-10 font-normal text-zinc-500 items-center">
              <span class="icon-[solar--music-library-2-linear] h-5 w-5 "></span>
              <span>Library</span>
            </div>
          </Show>
          <MenubarButton
            href="/artists"
            title="Artists"
            icon="icon-[solar--microphone-2-linear]"
          />
          <MenubarButton
            href="/albuns"
            title="Albuns"
            icon="icon-[solar--library-linear]"
          />
          <MenubarButton
            href="/songs"
            title="Songs"
            icon="icon-[solar--music-notes-linear]"
          />
          <MenubarButton
            href="/genres"
            title="Genres"
            icon="icon-[solar--music-note-slider-linear]"
          />
        </div>
        <Show when={!menuCollapsed()}>
          <div
            class={`flex flex-col ${menuCollapsed() ? "" : "w-full"} gap-0.5`}
          >
            <div class="flex flex-row w-full rounded-lg gap-2.5  focus:bg-zinc-900  text-sm h-10 font-normal text-zinc-500 items-center">
              <span class="icon-[solar--playlist-minimalistic-2-bold] h-5 w-5 "></span>
              <span class="">Playlists</span>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}
