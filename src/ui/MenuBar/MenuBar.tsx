// Dependencies
import { Show } from "solid-js";
// Store
import { uiStore } from "../../stores/uiStore";
// Components
import MenubarButton from "./MenubarButton";
import PlaylistMenubarDropdownMenu from "./PlaylistMenubarDropdownMenu";
import LibraryMenubarDropdownMenu from "./LibraryMenubarDropdownMenu";
// Function
export default function MenuBar() {
  const [menuCollapsed, setMenuCollaped] = uiStore.menuCollapsed;
  const [expandLibrary, setExpandLibrary] = uiStore.expandLibrary;
  const [expandPlaylist, setExpandPlaylist] = uiStore.expandPlaylist;
  function collapseMenu() {
    setMenuCollaped(!menuCollapsed());
  }
  return (
    <div
      class={`${menuCollapsed() ? "w-8" : "max-w-3xs w-3xs min-w-3xs"} rounded-3xl  h-full hidden sm:block pl-1`}
    >
      <div class={`flex flex-col gap-2 h-full w-full  `}>
        <Show when={!menuCollapsed()}>
          <div class="flex w-full flex-row flex-wrap justify-between items-center  h-13 pl-1">
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
          <div class="flex w-full flex-col gap-4 flex-wrap justify-center items-start group h-13 pl-1">
            <img
              src="/assets/images/logo.svg"
              class="h-6 min-h-6 group-hover:invisible"
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

        <div
          class={`flex flex-col ${menuCollapsed() ? "items-center pl-1" : "w-full "} gap-1 `}
        >
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
        <div class={`flex flex-col ${menuCollapsed() ? "" : "w-full"}  gap-1 `}>
          <div class="w-full flex justify-between">
            <Show when={!menuCollapsed()}>
              <div
                class="flex flex-row w-full rounded-lg gap-2.5 h-8   focus:bg-zinc-900 text-sm  font-normal text-zinc-500 items-center cursor-default"
                onClick={() => setExpandLibrary(!expandLibrary())}
              >
                <span class="icon-[solar--music-library-2-linear] h-5 w-5 "></span>
                <span class="">Library</span>
              </div>
            </Show>
            <Show when={menuCollapsed()}>
              <LibraryMenubarDropdownMenu>
                <div
                  class="flex flex-row w-full rounded-lg gap-2.5 h-8 pl-1.5  focus:bg-zinc-900 text-sm  font-normal text-zinc-500 items-center cursor-pointer"
                  onClick={() => setExpandLibrary(!expandLibrary())}
                >
                  <span class="icon-[solar--music-library-2-linear] h-5 w-5 "></span>
                </div>
              </LibraryMenubarDropdownMenu>
            </Show>
            <Show when={!menuCollapsed()}>
              <div class="flex gap-1 ">
                <button
                  class="flex items-center text-zinc-500 p-1 hover:text-white hover:cursor-pointer"
                  title="Options"
                >
                  <span class="icon-[solar--menu-dots-bold] h-5 w-5 "></span>
                </button>
                <button
                  class="flex items-center text-zinc-500 p-1 hover:text-white hover:cursor-pointer"
                  title="Expand"
                  onClick={() => setExpandLibrary(!expandLibrary())}
                >
                  <span
                    class={`${expandLibrary() ? "icon-[solar--alt-arrow-up-linear]" : "icon-[solar--alt-arrow-down-linear]"} h-5 w-5 `}
                  ></span>
                </button>
              </div>
            </Show>
          </div>
          <Show when={expandLibrary()}>
            <MenubarButton
              href="/all-artists"
              title="Artists"
              icon="icon-[solar--microphone-2-linear]"
            />
            <MenubarButton
              href="/all-releases"
              title="Albuns"
              icon="icon-[solar--library-linear]"
            />
            <MenubarButton
              href="/all-songs"
              title="Songs"
              icon="icon-[solar--music-notes-linear]"
            />
            <MenubarButton
              href="/all-genres"
              title="Genres"
              icon="icon-[solar--music-note-slider-linear]"
            />
          </Show>
        </div>

        <div class={`flex flex-col ${menuCollapsed() ? "" : "w-full"} gap-1`}>
          <div class="w-full flex justify-between">
            <Show when={!menuCollapsed()}>
              <div
                class="flex flex-row w-full rounded-lg gap-2.5 h-8   focus:bg-zinc-900 text-sm  font-normal text-zinc-500 items-center"
                onClick={() => setExpandPlaylist(!expandPlaylist())}
              >
                <span class="icon-[solar--playlist-minimalistic-2-bold] h-5 w-5 "></span>
                <span class="">Playlists</span>
              </div>
            </Show>
            <Show when={menuCollapsed()}>
              <PlaylistMenubarDropdownMenu>
                <div
                  class="flex flex-row w-full rounded-lg gap-2.5 h-8 pl-2  focus:bg-zinc-900 text-sm  font-normal text-zinc-500 items-center"
                  onClick={() => setExpandPlaylist(!expandPlaylist())}
                >
                  <span class="icon-[solar--playlist-minimalistic-2-bold] h-5 w-5 "></span>
                </div>
              </PlaylistMenubarDropdownMenu>
            </Show>
            <Show when={!menuCollapsed()}>
              <div class="flex gap-1">
                <button
                  class="flex items-center text-zinc-500 p-1 hover:text-white hover:cursor-pointer"
                  title="New"
                >
                  <span class="icon-[solar--add-square-linear] h-5 w-5 "></span>
                </button>
                <button
                  class="flex items-center text-zinc-500 p-1 hover:text-white hover:cursor-pointer"
                  title="Expand"
                  onClick={() => setExpandPlaylist(!expandPlaylist())}
                >
                  <span
                    class={`${expandPlaylist() ? "icon-[solar--alt-arrow-up-linear]" : "icon-[solar--alt-arrow-down-linear]"} h-5 w-5 `}
                  ></span>
                </button>
              </div>
            </Show>
          </div>
          <Show when={expandPlaylist()}>
            <MenubarButton
              href="/all-playlists"
              title="All Playlists"
              icon="icon-[solar--widget-linear]"
            />
            <MenubarButton
              href="/favorite-songs"
              title="Favorite Songs"
              icon="icon-[solar--heart-angle-bold]"
            />
          </Show>
        </div>
      </div>
    </div>
  );
}
