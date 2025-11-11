import { invoke } from "@tauri-apps/api/core";

export default function PlayBar() {
  async function playMusic(path: string) {
    try {
      await invoke("play_song", { path: path });
      let obj = await invoke("get_audio_metadata", { path: path });
      console.log(await obj);
    } catch (error) {
      console.error("Failed to play audio:", error);
    }
  }

  return (
    <div class="bg-zinc-900 w-full h-24 rounded-3xl border border-zinc-700/50 relative overflow-hidden">
      <div class="absolute inset-0 z-1 rounded-3xl">
        <img
          src="/assets/images/britpop-agcook.jpg"
          alt=""
          class="w-full h-full"
        />
      </div>
      <div class="absolute inset-0 z-5 bg-zinc-900/50">
        <div class="backdrop-blur-3xl w-full flex items-center h-full">
          <div class="flex flex-row w-full p-2.5 gap-4">
            <div class="size-1/4 ">
              <div class="flex flex-row items-center justify-between">
                <div class="flex flex-row relative h-full items-center gap-3">
                  <img
                    src="/assets/images/britpop-agcook.jpg"
                    alt=""
                    class="h-16 rounded-xl bg-white"
                  />
                  <div class="flex flex-col">
                    <span class="text-xs font-semibold text-white hover:underline hover:cursor-pointer">
                      You Know Me
                    </span>
                    <span class="text-xs font-medium text-zinc-400 hover:text-white hover:underline hover:cursor-pointer">
                      AG Cook
                    </span>
                  </div>
                </div>
                <div class="flex flex-row gap-3">
                  <button
                    class="flex flex-row rounded-lg text-base  font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Favorite song"
                  >
                    <span class="icon-[solar--heart-linear] h-5 w-5 "></span>
                  </button>
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Add song"
                  >
                    <span class="icon-[solar--add-circle-linear] h-5 w-5 "></span>
                  </button>
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="More options"
                  >
                    <span class="icon-[solar--menu-dots-bold] h-5 w-5 "></span>
                  </button>
                </div>
              </div>
            </div>
            <div class="size-1/2 ">
              <div class="flex flex-col items-center justify-center h-full">
                <div class="flex flex-row items-center gap-4">
                  <button
                    class="flex flex-row rounded-lg text-base  font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Shuffle"
                  >
                    <span class="icon-[solar--shuffle-linear] h-6 w-6 "></span>
                  </button>
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Backwards"
                  >
                    <span class="icon-[solar--rewind-back-bold] h-6 w-6"></span>
                  </button>
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Play"
                    onclick={async () => playMusic("./assets/audio/song.wav")}
                  >
                    <span class="icon-[solar--play-circle-bold] h-10 w-10 "></span>
                  </button>
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Foward"
                  >
                    <span class="icon-[solar--rewind-forward-bold] h-6 w-6 "></span>
                  </button>
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Repeat"
                  >
                    <span class="icon-[solar--repeat-linear] h-6 w-6 "></span>
                  </button>
                </div>
                <div class="flex flex-col gap-1">
                  <div class="flex flex-row justify-between text-xs text-zinc-400">
                    <span>0:00</span>
                    <span>5:15</span>
                  </div>
                  <div class="bg-white h-1 w-[396px] xl:w-lg rounded-full"></div>
                </div>
              </div>
            </div>
            <div class="size-1/4 h-16">
              <div class="flex flex-row w-full h-full items-center justify-between">
                <div class="flex flex-row items-center gap-3">
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Mute"
                  >
                    <span class="icon-[solar--volume-loud-linear] h-6 w-6 "></span>
                  </button>
                  <div class="w-24 h-1 bg-white rounded-full"></div>
                </div>
                <div class="flex flex-row gap-4">
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Miniplayer"
                  >
                    <span class="icon-[solar--minimize-square-3-linear] h-6 w-6 "></span>
                  </button>
                  <button
                    class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                    title="Visualizer"
                  >
                    <span class="icon-[solar--full-screen-square-linear] h-6 w-6 "></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
