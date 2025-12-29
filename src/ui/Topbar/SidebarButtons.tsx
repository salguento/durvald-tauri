// Hooks
import { useShowSideBar } from "../../hooks/ui/useShowSideBar";
// Stores
import { uiStore } from "../../stores/uiStore";
// Function
export default function SidebarButtons() {
  const { openSideBar, closeSideBar, showSideBar } = useShowSideBar();
  const [sideBarTab, setSideBarTab] = uiStore.sideBarTab;

  function handleTab(tabName: string) {
    if (sideBarTab() == tabName && showSideBar()) {
      closeSideBar();
    } else {
      setSideBarTab(tabName);
      openSideBar();
    }
  }
  return (
    <div
      class="sm:flex flex-row items-center h-full gap-1  hidden"
      data-tauri-drag-region
    >
      <button
        id="playing-tab"
        title="Playing"
        class="text-zinc-200 hover:text-white flex items-center justify-center backdrop-blur-xl  hover:bg-zinc-500/50  rounded-xl hover:cursor-pointer h-8 w-8"
        onClick={() => {
          handleTab("playing");
        }}
      >
        <span class="icon-[solar--play-stream-linear] h-6 w-6 "></span>
      </button>
      <button
        id="lyrics-tab"
        class="text-zinc-200 hover:text-white flex items-center justify-center backdrop-blur-xl  hover:bg-zinc-500/50  rounded-xl hover:cursor-pointer h-8 w-8"
        title="Lyrics"
        onClick={() => {
          handleTab("lyrics");
        }}
      >
        <span class="icon-[solar--document-add-linear] h-6 w-6 "></span>
      </button>
      <button
        id="queue-tab"
        class="text-zinc-200 hover:text-white flex items-center justify-center backdrop-blur-xl  hover:bg-zinc-500/50  rounded-xl hover:cursor-pointer h-8 w-8"
        title="Queue"
        onClick={() => {
          handleTab("queue");
        }}
      >
        <span class="icon-[solar--playlist-linear] h-6 w-6 "></span>
      </button>
    </div>
  );
}
