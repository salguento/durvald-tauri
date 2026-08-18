// Components
import MainMenu from "../Components/Buttons/MainMenu/MainMenu";
import SearchBar from "./SearchBar";
import ReturnButton from "./ReturnButton";
import ForwardButton from "./ForwardButton";
import SidebarButtons from "./SidebarButtons";

// With the native title bar enabled (decorations), macOS/Windows render the
// window controls and drag themselves, so the app toolbar holds only the
// in-app navigation, search and menu.
export default function TopBar() {
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

  return (
    <div class="h-10 flex gap-2 justify-between items-center px-4 select-none">
      {renderMenu()}
      {renderCenter()}
      <SidebarButtons />
    </div>
  );
}