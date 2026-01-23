// Dependencies
import { ParentComponent, Show } from "solid-js";
// Store
import { libraryStore } from "../stores/libraryStore";
// Components
import MenuBar from "../ui/MenuBar/MenuBar";
import SideBar from "../ui/SideBar/SideBar";
import PlayBar from "../ui/PlayBar/PlayBar";
import TopBar from "../ui/Topbar/TopBar";
import MobileMenu from "../ui/MobileMenu/MobileMenu";
import MobilePlaybar from "../ui/MobilePlaybar.tsx/MobilePlaybar";
import Onboarding from "../ui/Onboarding/Onboarding";
// Function
const Layout: ParentComponent = (props) => {
  const [showOnboarding] = libraryStore.showOnboarding;
  return (
    <main class="overflow-hidden">
      <div
        class="flex flex-col w-screen p-2 gap-2 h-screen relative"
        data-tauri-drag-region
      >
        <Show when={!showOnboarding()} fallback={<Onboarding />}>
          <TopBar />
          <div class={`flex gap-4 flex-1 overflow-hidden relative`}>
            <MenuBar />
            <div class={`flex grow relative gap-2 w-full overflow-hidden`}>
              <div
                class={`w-full h-full rounded-3xl grow overflow-hidden border border-zinc-700/50 bg-zinc-900`}
              >
                {props.children}
              </div>
              <SideBar />
            </div>
          </div>
          <PlayBar />
          <MobilePlaybar />
          <MobileMenu />
        </Show>
      </div>
    </main>
  );
};

export default Layout;
