// Components
import MobileMenuButton from "./MobileMenuButton";
// Function
export default function MobileMenu() {
  return (
    <div class="h-18 bottom-0 left-0 right-0 overflow-hidden absolute p-1 z-1 sm:hidden">
      <div class="bg-zinc-900/50 backdrop-blur-xl border border-zinc-700/50 w-full h-full rounded-2xl">
        <div class="flex flex-row items-center justify-around p-2 h-full">
          <MobileMenuButton
            title="Home"
            href="/"
            icon="icon-[solar--home-angle-2-linear]"
          />
          {/*<MobileMenuButton
            title="New"
            href="/new"
            icon="icon-[solar--bell-linear]"
          />*/}
          <MobileMenuButton
            title="Search"
            href="/search"
            icon="icon-[solar--magnifer-linear]"
          />
          <MobileMenuButton
            title="Library"
            href="/library"
            icon="icon-[solar--music-library-2-linear]"
          />
          <MobileMenuButton
            title="Create"
            href="/create"
            icon="icon-[solar--widget-add-linear]"
          />
        </div>
      </div>
    </div>
  );
}
