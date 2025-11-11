export default function MenuBar() {
  return (
    <div class="bg-zinc-900 xl:size-1/6 lg:size-1/4 min-h-full rounded-3xl border border-zinc-700/50 p-4">
      <div class="flex flex-col gap-6">
        <div
          class="flex w-full flex-row flex-wrap justify-between items-center"
          data-tauri-drag-region
        >
          <img
            src="/assets/images/logotype.svg"
            class="h-6"
            alt="durvald logotype"
          />
          <button
            class="hover:text-zinc-200 text-zinc-600 h-6 w-6 hover:cursor-pointer active:cursor-text"
            title="Collapse"
          >
            <span class="icon-[solar--square-alt-arrow-left-linear] h-6 w-6 "></span>
          </button>
        </div>
        <div class="relative w-full">
          <input
            type="text"
            class="rounded-lg w-full border border-transparent bg-zinc-800 focus:bg-zinc-900 hover:border-zinc-600 pl-10 placeholder:text-zinc-600 text-base h-10 font-medium text-white inline-block align-middle pt-1"
            placeholder="Search"
          ></input>
          <span class="absolute left-2.5 top-2.5 icon-[solar--magnifer-linear] h-5 w-5 text-zinc-600 :text-white"></span>
        </div>
        <div class="flex flex-col ">
          <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
            <span class="icon-[solar--home-angle-2-linear] h-5 w-5 "></span>
            Home
          </button>
          <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
            <span class="icon-[solar--bell-linear] h-5 w-5 "></span>
            New
          </button>
          <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
            <span class="icon-[solar--clock-circle-linear] h-5 w-5 "></span>
            Recently Added
          </button>
        </div>
        <div class="flex flex-col">
          <div class="flex flex-row w-full rounded-lg gap-2.5  focus:bg-zinc-900  text-sm h-10 font-medium text-zinc-500 items-center">
            <span class="icon-[solar--music-library-2-linear] h-5 w-5 "></span>
            <span>Library</span>
          </div>
          <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
            <span class="icon-[solar--microphone-2-linear] h-5 w-5 "></span>
            Artists
          </button>
          <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
            <span class="icon-[solar--library-linear] h-5 w-5 "></span>
            Albuns
          </button>
          <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
            <span class="icon-[solar--music-notes-linear] h-5 w-5 "></span>
            Songs
          </button>
          <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
            <span class="icon-[solar--music-note-slider-linear] h-5 w-5 "></span>
            Genres
          </button>
        </div>
        <div class="flex flex-col">
          <div class="flex flex-row w-full rounded-lg gap-2.5  focus:bg-zinc-900  text-sm h-10 font-medium text-zinc-500 items-center">
            <span class="icon-[solar--playlist-minimalistic-2-bold] h-5 w-5 "></span>
            <span class="">Playlists</span>
          </div>
        </div>
      </div>
    </div>
  );
}
