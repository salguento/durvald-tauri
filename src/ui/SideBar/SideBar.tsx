import { getCurrentWindow } from "@tauri-apps/api/window";
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { A } from "@solidjs/router";
export default function SideBar() {
  const appWindow = getCurrentWindow();

  return (
    <div class="bg-zinc-900 size-3/12 h-full rounded-3xl border border-zinc-700/50 z-1 overflow-hidden">
      <div class="flex flex-col gap-4 h-full relative">
        <div
          class="w-full  absolute bg-zinc-900/50  z-1 "
          data-tauri-drag-region
        >
          <div class=" w-full h-full justify-between flex backdrop-blur-3xl p-4">
            <div class="flex flex-row gap-3">
              <button
                id="titlebar-minimize"
                class="text-zinc-400 hover:text-white h-6 hover:cursor-pointer"
                title="Settings"
              >
                <A href="/settings">
                  <span class="icon-[solar--settings-linear] h-6 w-6 "></span>
                </A>
              </button>
            </div>
            <div class="flex flex-row gap-3">
              <button
                id="titlebar-minimize"
                class="text-zinc-400 hover:text-white h-6"
                title="Minimize"
                onclick={async () => await appWindow.minimize()}
              >
                <span class="icon-[solar--minimize-square-linear] h-6 w-6 "></span>
              </button>
              <button
                id="titlebar-maximize"
                class="text-zinc-400 hover:text-white h-6"
                title="Maximize"
                onclick={async () => {
                  if (await appWindow.isMaximized()) {
                    await appWindow.unmaximize();
                  } else {
                    await appWindow.maximize();
                  }
                }}
              >
                <span class="icon-[solar--maximize-square-linear] h-6 w-6 "></span>
              </button>
              <button
                id="titlebar-close"
                class="text-zinc-400 hover:text-white h-6"
                title="Close"
                onclick={async () => appWindow.close()}
              >
                <span class="icon-[solar--close-square-linear] h-6 w-6 "></span>
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-row justify-between w-full absolute mt-13 bg-zinc-900/50 backdrop-blur-3xl p-4 z-1  border-t border-b border-zinc-700/50">
          <button
            id="titlebar-minimize"
            title="Playing"
            class="text-zinc-200 hover:text-white flex items-center gap-2 2xl:px-4 px-2.5  py-2.5 backdrop-blur-xl border border-white bg-zinc-800/50 hover:border-white rounded-full hover:cursor-pointer"
          >
            <span class="icon-[solar--play-stream-linear] h-6 w-6 "></span>
            <p class=" hidden 2xl:inline">Playing</p>
          </button>
          <button
            id="titlebar-minimize"
            class="text-zinc-400 hover:text-white flex items-center gap-2 2xl:px-4 px-2.5 py-2.5 border border-transparent hover:border-white backdrop-blur-xl  rounded-full hover:cursor-pointer"
            title="Lyrics"
          >
            <span class="icon-[solar--document-add-linear] h-6 w-6 "></span>
            <p class=" hidden 2xl:inline-block">Lyrics</p>
          </button>
          <button
            id="titlebar-minimize"
            class="text-zinc-400 hover:text-white flex items-center gap-2 2xl:px-4 px-2.5 py-2.5  rounded-full border border-transparent hover:border-white hover:cursor-pointer"
            title="Queue"
          >
            <span class="icon-[solar--playlist-linear] h-6 w-6 "></span>
            <p class=" hidden 2xl:inline-block">Queue</p>
          </button>
        </div>
        <OverlayScrollbarsComponent
          element="div"
          options={{ scrollbars: { autoHide: "scroll" } }}
          events={{
            scroll: () => {
              /* ... */
            },
          }}
          defer
          class="h-full  rounded-2xl relative overflow-auto p-4 pt-36 "
        >
          <div class="flex flex-col gap-3">
            <img
              src="/assets/images/britpop-agcook.jpg"
              class="rounded-2xl w-full"
            />
            <div class="flex flex-row justify-between w-full items-center">
              <span class="text-base lg:text-xl text-white font-semibold truncate hover:underline hover:cursor-pointer">
                Britpop
              </span>
              <div class="flex flex-row gap-4">
                <button
                  class="flex flex-row rounded-lg text-base  font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                  title="favorite"
                >
                  <span class="icon-[solar--heart-linear] h-5 w-5 "></span>
                </button>
                <button
                  class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                  title="Add"
                >
                  <span class="icon-[solar--add-circle-linear] h-5 w-5 "></span>
                </button>
                <button
                  class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                  title="Options"
                >
                  <span class="icon-[solar--menu-dots-bold] h-5 w-5 "></span>
                </button>
              </div>
            </div>
            <div class="flex flex-row">
              <span class="text-sm lg:text-base  text-zinc-500 hover:cursor-pointer hover:text-white hover:underline">
                Genre
              </span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-zinc-600 font-semibold">
                23 February 2024
              </span>
              <span class="text-xs text-zinc-600 font-semibold">
                24 songs, 1 hour and 40 minutes
              </span>
              <span class="text-xs text-zinc-600 font-semibold">New Alias</span>
            </div>
            <div class="flex flex-row p-4 bg-zinc-800 rounded-2xl items-center gap-3 hover:cursor-pointer">
              <div class="w-fit">
                <img
                  src="/assets/images/ag-cook.jpg"
                  class="h-10 min-w-10 xl:h-16 xl:min-w-16 rounded-full"
                ></img>
              </div>
              <div class="flex flex-row justify-between w-full">
                <span class="text-base lg:text-lg font-semibold text-zinc-400 truncate hover:underline hover:text-white hover:cursor-pointer">
                  AG Cook
                </span>
                <button
                  class="flex flex-row  rounded-lg text-base  font-medium text-zinc-400 hover:text-white hover:cursor-pointer items-center"
                  title="Follow"
                >
                  <span class="icon-[solar--add-square-linear] h-6 w-6 "></span>
                </button>
              </div>
            </div>
            <OverlayScrollbarsComponent
              element="div"
              options={{ scrollbars: { autoHide: "scroll" } }}
              events={{
                scroll: () => {
                  /* ... */
                },
              }}
              defer
              class="h-full  bg-zinc-800 p-4 rounded-2xl relative max-h-80 overflow-auto"
            >
              <div class="flex flex-col gap-3">
                <span class="text-sm text-zinc-400">
                  Britpop is the third album by British singer, songwriter, and
                  producer A. G. Cook. This 100-minute album is split into three
                  discs: Past, Present, and Future.
                </span>
                <span class="text-sm text-zinc-400">
                  — Past (tracks 1 to 8): This disc features fast-paced, playful
                  electronic sounds and vocal chops. The tracks reference the
                  mindset and idealism of a certain era, but the sound is more
                  advanced, reflecting the work A.G. Cook has done since then.
                  It includes the album’s lead single Silver Thread Golden
                  Needle and the title track Britpop.
                </span>
                <span class="text-sm text-zinc-400">
                  — Present (tracks 9 to 16): This is the most lyrical disc,
                  dedicated to a more traditional approach to songwriting. It
                  features the use of guitar and lo-fi vocal treatment. Notably,
                  it includes Without, an ode to the late producer SOPHIE, one
                  of Cook’s closest friends and collaborators.
                </span>
                <span class="text-sm text-zinc-400">
                  — Future (tracks 17 to 24): This disc showcases avant-garde
                  and chaotic sound designs. As A. G. Cook said, Future includes
                  all the tracks that almost make him feel uncomfortable, where
                  he questions the tempo or genre. It includes the album’s third
                  single and oldest song, Soulbreaker.
                </span>
                <span class="text-sm text-zinc-400">
                  This album was released via New Alias, A. G. Cook’s new label,
                  founded after PC Music’s wind down.
                </span>
              </div>
            </OverlayScrollbarsComponent>
          </div>
        </OverlayScrollbarsComponent>
      </div>
    </div>
  );
}
