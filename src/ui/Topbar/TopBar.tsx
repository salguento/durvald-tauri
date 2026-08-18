// Dependencies
import { getCurrentWindow } from "@tauri-apps/api/window";
// Hooks
import { useFullscreen } from "../../hooks/interface/useFullscreen";
import { usePlatform } from "../../hooks/interface/usePlatform";
// Components
import MainMenu from "../Components/Buttons/MainMenu/MainMenu";
import SearchBar from "./SearchBar";
import ReturnButton from "./ReturnButton";
import ForwardButton from "./ForwardButton";
import SidebarButtons from "./SidebarButtons";

// Window control buttons (minimize / maximize-fullscreen / close).
const windowControlClass =
  "text-zinc-400 hover:text-white flex items-center justify-center h-6 w-6";

export default function TopBar() {
  const appWindow = getCurrentWindow();
  const { isFullscreen, toogleFullscreen } = useFullscreen();
  const { isMac } = usePlatform();

  // Explicit drag handling. The `data-tauri-drag-region` attribute is unreliable
  // on some platforms/macOS, so we drive the native drag ourselves, ignoring
  // presses that land on interactive controls (buttons/inputs/menus).
  const beginDrag = (e: MouseEvent) => {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest("button, input, a, select, textarea, [role]")) return;
    appWindow.startDragging().catch(() => {});
  };

  const renderControls = () => (
    <div class="flex flex-row gap-2 h-full items-center justify-end">
      <button
        id="titlebar-minimize"
        class={windowControlClass}
        title="Minimize"
        onClick={async () => await appWindow.minimize()}
      >
        <span class="icon-[solar--square-top-up-linear] h-6 w-6"></span>
      </button>
      <button
        id="titlebar-maximize"
        class={windowControlClass}
        title={`${isFullscreen() ? "Windowed" : "Fullscreen"}`}
        onClick={toogleFullscreen}
      >
        <span
          class={`${isFullscreen() ? "icon-[solar--minimize-square-linear]" : "icon-[solar--maximize-square-linear]"} h-6 w-6`}
        ></span>
      </button>
      <button
        id="titlebar-close"
        class={windowControlClass}
        title="Close"
        onClick={async () => appWindow.close()}
      >
        <span class="icon-[solar--close-square-linear] h-6 w-6"></span>
      </button>
    </div>
  );

  const renderMenu = () => (
    <div class="w-3xs max-w-3xs min-w-3xs">
      <MainMenu>
        <button
          class="text-zinc-200 hover:text-white flex items-center justify-center backdrop-blur-xl hover:bg-zinc-500/50 rounded-xl hover:cursor-pointer h-8 w-8"
          title="Menu"
        >
          <span class="icon-[solar--hamburger-menu-linear] h-6 w-6"></span>
        </button>
      </MainMenu>
    </div>
  );

  const renderCenter = () => (
    <div class="flex flex-row items-center justify-center h-full gap-2 w-full px-1">
      <div class="flex gap-0.5">
        <ReturnButton />
        <ForwardButton />
      </div>
      <SearchBar />
    </div>
  );

  const renderRight = (mac: boolean) => (
    <div
      class={`flex w-xs md:min-w-xs justify-end ${mac ? "" : "md:justify-between"} h-full items-center pl-3 pr-2`}
    >
      <SidebarButtons />
      {mac ? renderMenu() : renderControls()}
    </div>
  );

  return (
    <div
      class="h-8 flex gap-2 justify-between items-center px-1"
      onMouseDown={beginDrag}
    >
      {isMac() ? (
        <>
          {renderControls()}
          {renderCenter()}
          {renderRight(true)}
        </>
      ) : (
        <>
          {renderMenu()}
          {renderCenter()}
          {renderRight(false)}
        </>
      )}
    </div>
  );
}