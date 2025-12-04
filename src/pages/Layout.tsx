// Dependencies
import { ParentComponent } from "solid-js";
// Components
import MenuBar from "../ui/MenuBar/MenuBar";
import SideBar from "../ui/SideBar/SideBar";
import PlayBar from "../ui/PlayBar/PlayBar";
import TopBar from "../ui/Topbar/TopBar";

const Layout: ParentComponent = (props) => {
  return (
    <main class="overflow-hidden">
      <div
        class="flex flex-col w-screen p-2 gap-2 h-screen relative"
        data-tauri-drag-region
      >
        <TopBar />
        <div class="grid grid-cols-12 grid-rows-1 gap-2 flex-1 overflow-hidden relative">
          <MenuBar />
          <div class="relative grid grid-cols-9 col-span-9 gap-2">
            {props.children}
            <SideBar />
          </div>
        </div>
        <PlayBar />
      </div>
    </main>
  );
};

export default Layout;
