// Dependencies
import { ParentComponent } from "solid-js";
// Components
import MenuBar from "../ui/MenuBar/MenuBar";
import SideBar from "../ui/SideBar/SideBar";
import PlayBar from "../ui/PlayBar/PlayBar";

const Layout: ParentComponent = (props) => {
  return (
    <main class=" w-screen h-screen min-w-screen  bg-white dark:bg-black overflow-hidden relative">
      <div
        class="flex flex-col w-screen p-3 gap-3 h-screen"
        data-tauri-drag-region
      >
        <div class="flex flex-row gap-3 h-full overflow-hidden">
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
