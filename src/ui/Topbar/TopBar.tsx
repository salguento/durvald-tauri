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

  // Runs a window op and surfaces any failure instead of swallowing it.
  const runCmd = async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch (err) {
      console.error(`[TopBar] ${label} failed:`, err);
    }
  };

  // Explicit drag handling. We avoid `data-tauri-drag-region` (unreliable on
  // macOS + conflicts when placed on large containers) and drive the native
  // drag ourselves: press the primary button on empty top-bar space only.
  // `preventDefault` stops the browser from treating this as a text-selection
  // / focus gesture so macOS hands the gesture to the window drag.
  const beginDrag = (e: MouseEvent) => {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest("button, input, a, select, textarea, [role]")) return;
    e.preventDefault();
    runCmd("startDragging", () => appWindow.startDragging());
  };

  // Stop the mousedown from bubbling to `beginDrag` so window-control presses
  // never trigger a drag (belt-and-suspenders on top of beginDrag's exclusion).
  const blockDrag = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const renderControls = () => (
    <div class="flex flex-row gap-2 h-full items-center justify-end">
      <button
        id="titlebar-minimize"
        class={windowControlClass}
        title="Minimize"
        onMouseDown={blockDrag}
        onClick={() => runCmd("minimize", () => appWindow.minimize())}
      >
        <span class="icon-[solar--square-top-up-linear] h-6 w-6"></span>
      </button>
      <button
        id="titlebar-maximize"
        class={windowControlClass}
        title={`${isFullscreen() ? "Windowed" : "Fullscreen"}`}
        onMouseDown={blockDrag}
        onClick={() => runCmd("toggleFullscreen", () => toogleFullscreen())}
      >
        <span
          class={`${isFullscreen() ? "icon-[solar--minimize-square-linear]" : "icon-[solar--maximize-square-linear]"} h-6 w-6`}
        ></span>
      </button>
      <button
        id="titlebar-close"
        class={windowControlClass}
        title="Close"
        onMouseDown={blockDrag}
        onClick={() => runCmd("close", () => appWindow.close())}
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
          onMouseDown={blockDrag}
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
      class="h-8 flex gap-2 justify-between items-center px-1 select-none"
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
