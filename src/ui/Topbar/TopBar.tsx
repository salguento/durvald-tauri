// Dependencies
import { getCurrentWindow } from "@tauri-apps/api/window";
// Hooks
import { useFullscreen } from "../../hooks/ui/useFullscreen";
// Components
import MainMenu from "../Components/Buttons/MainMenu/MainMenu";
import SearchBar from "./SearchBar";
import ReturnButton from "./ReturnButton";
import ForwardButton from "./ForwardButton";
import SidebarButtons from "./SidebarButtons";
// Function
export default function TopBar() {
  const appWindow = getCurrentWindow();
  const { isFullscreen, toogleFullscreen } = useFullscreen();

  return (
    <div
      class="h-10 flex gap-2 sm:gap-5 px-3.5 justify-between items-center"
      data-tauri-drag-region
    >
      <MainMenu>
        <button
          class="text-zinc-200 hover:text-white flex items-center justify-center backdrop-blur-xl  hover:bg-zinc-500/50  rounded-xl hover:cursor-pointer h-8 w-8"
          title="Menu"
        >
          <span class="icon-[solar--hamburger-menu-linear] h-6 w-6 "></span>
        </button>
      </MainMenu>
      {/*<button
          class="text-zinc-200 hover:text-white flex items-center justify-center backdrop-blur-xl  hover:bg-zinc-500/50  rounded-xl hover:cursor-pointer h-8 w-8"
          title="Miniplayer"
        >
          <span class="icon-[solar--minimize-square-3-linear] h-6 w-6 "></span>
        </button>
        <button
          class="text-zinc-200 hover:text-white flex items-center justify-center backdrop-blur-xl  hover:bg-zinc-500/50  rounded-xl hover:cursor-pointer h-8 w-8"
          title="Visualizer"
        >
          <span class="icon-[solar--full-screen-square-linear] h-6 w-6 "></span>
        </button>*/}

      <div
        class="flex flex-row items-center h-full gap-1 w-full "
        data-tauri-drag-region
      >
        <ReturnButton />
        <ForwardButton />
        <SearchBar />
        <SidebarButtons />
      </div>

      <div
        class="flex flex-row gap-2 h-full items-center justify-end"
        data-tauri-drag-region
      >
        <button
          id="titlebar-minimize"
          class="text-zinc-400 hover:text-white flex items-center justify-center h-6 w-6"
          title="Minimize"
          onclick={async () => await appWindow.minimize()}
        >
          <span class="icon-[solar--square-top-up-linear] h-6 w-6 "></span>
        </button>
        <button
          id="titlebar-maximize"
          class="text-zinc-400 hover:text-white flex items-center justify-center h-6 w-6"
          title={`${isFullscreen() ? "Windowed" : "Fullscreen"}`}
          onclick={toogleFullscreen}
        >
          <span
            class={`${isFullscreen() ? "icon-[solar--minimize-square-linear]" : "icon-[solar--maximize-square-linear]"} h-6 w-6`}
          ></span>
        </button>
        <button
          id="titlebar-close"
          class="text-zinc-400 hover:text-white flex items-center justify-center h-6 w-6"
          title="Close"
          onclick={async () => appWindow.close()}
        >
          <span class="icon-[solar--close-square-linear] h-6 w-6 "></span>
        </button>
      </div>
    </div>
  );
}
