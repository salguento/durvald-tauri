export default function DivisorButton() {
  return (
    <div class="w-full flex justify-between">
      <div class="flex flex-row w-full rounded-lg gap-2.5 h-8   focus:bg-zinc-900 text-sm  font-normal text-zinc-500 items-center ">
        <span class="icon-[solar--music-library-2-linear] h-5 w-5 "></span>
        <span class="">Library</span>
      </div>
      <div class="flex gap-1">
        <button
          class="flex items-center text-zinc-500 p-1 hover:text-white"
          title="Expand"
        >
          <span class="icon-[solar--menu-dots-bold] h-5 w-5 "></span>
        </button>
        <button
          class="flex items-center text-zinc-500 p-1 hover:text-white"
          title="Expand"
        >
          <span class="icon-[solar--alt-arrow-down-linear] h-5 w-5 "></span>
        </button>
      </div>
    </div>
  );
}
