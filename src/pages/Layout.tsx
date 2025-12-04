// Dependencies
import { ParentComponent } from "solid-js";
// Components
import MenuBar from "../ui/MenuBar/MenuBar";
import SideBar from "../ui/SideBar/SideBar";
import PlayBar from "../ui/PlayBar/PlayBar";
import TopBar from "../ui/Topbar/TopBar";
// Stores
import { uiStore } from "../stores/uiStore";

const Layout: ParentComponent = (props) => {
  const [menuCollapsed, setMenuCollapsed] = uiStore.menuCollapsed;
  return (
    <main class="overflow-hidden">
      <div
        class="flex flex-col w-screen p-2 gap-2 h-screen relative"
        data-tauri-drag-region
      >
        <TopBar />
        <div
          class={`${menuCollapsed() ? "flex" : "grid grid-cols-12 grid-rows-1"} gap-2 flex-1 overflow-hidden relative`}
        >
          <MenuBar />
          <div
            class={`${menuCollapsed() ? "flex grow" : "grid grid-cols-9 col-span-9 xl:col-span-10"} relative gap-2 w-full overflow-hidden`}
          >
            <div
              class={`${menuCollapsed() ? "w-full" : "col-span-6 xl:col-span-7"} h-full rounded-3xl grow overflow-hidden border border-zinc-500/50`}
            >
              {props.children}
            </div>
            <SideBar />
          </div>
        </div>
        <PlayBar />
      </div>
    </main>
  );
};

export default Layout;
