export default function FowardButton() {
  return (
    <button
      id="titlebar-close"
      class="text-zinc-400 hover:text-white flex items-center justify-center h-8 w-8 cursor-pointer hover:bg-zinc-700 rounded-xl"
      title="Close"
      onclick={() => console.log("clicked")}
    >
      <span class="icon-[solar--alt-arrow-right-linear] h-6 w-6 "></span>
    </button>
  );
}
