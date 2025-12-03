// Dependencies
import { ParentComponent } from "solid-js";
// Components
import MenuBar from "../ui/MenuBar/MenuBar";
import SideBar from "../ui/SideBar/SideBar";
import PlayBar from "../ui/PlayBar/PlayBar";
import TopBar from "../ui/Topbar/TopBar";

const Layout: ParentComponent = (props) => {
  return (
    <main class=" w-screen h-screen min-w-screen  bg-white dark:bg-black overflow-hidden relative">
      <div
        class="flex flex-col w-screen p-2 gap-2 h-screen"
        data-tauri-drag-region
      >
        <TopBar />
        <div class="flex flex-row gap-2 h-full overflow-hidden">
          <MenuBar />
          {props.children}
          <SideBar />
        </div>
        <PlayBar />
      </div>
    </main>
  );
};

export default Layout;
