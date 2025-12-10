// Dependencies
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { A } from "@solidjs/router";
import { Tabs } from "@kobalte/core/tabs";
import { Show } from "solid-js";
// Hooks
// Store
import { playerStore } from "../../stores/playerStore";
import { uiStore } from "../../stores/uiStore";
export default function SideBar() {
  const [currentTrack, setCurrentTrack] = playerStore.currentTrack;
  const [menuCollapsed, setMenuCollapsed] = uiStore.menuCollapsed;
  const [sideBarTab, setSideBarTab] = uiStore.sideBarTab;
  const [showSideBar, setShowSideBar] = uiStore.showSideBar;

  return (
    <Show when={showSideBar()}>
      <div
        class={`${menuCollapsed() ? "flex grow max-w-80 w-full" : "col-span-3 xl:col-span-2"} h-full rounded-3xl border border-zinc-700/50 bg-zinc-900 z-1 overflow-hidden relative`}
      >
        <div class="flex flex-col gap-4 h-full relative">
          <OverlayScrollbarsComponent
            element="div"
            options={{ scrollbars: { autoHide: "scroll" } }}
            events={{
              scroll: () => {
                /* ... */
              },
            }}
            defer
            class="h-full  rounded-2xl relative overflow-auto px-4 pt-4"
          >
            <Tabs
              aria-label="Main navigation"
              class="text-white"
              value={sideBarTab()}
              onChange={setSideBarTab}
            >
              <Tabs.Content class="" value="playing">
                <div class="flex flex-col gap-3">
                  <img
                    src={currentTrack()?.artwork}
                    class="rounded-2xl w-full"
                  />
                  <div class="flex flex-row justify-between w-full items-center">
                    <span class="text-base lg:text-xl text-white font-semibold truncate hover:underline hover:cursor-pointer">
                      {currentTrack()?.release_title}
                    </span>
                    <div class="flex flex-row gap-2">
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
                    <span class="text-xs text-zinc-600 font-semibold">
                      New Alias
                    </span>
                  </div>
                  <div class="flex flex-row items-center gap-3 hover:cursor-pointer">
                    <div class="w-fit">
                      <img
                        src="/assets/images/ag-cook.jpg"
                        class="h-10 min-w-10 xl:h-16 xl:min-w-16 rounded-full"
                      ></img>
                    </div>
                    <div class="flex flex-row justify-between w-full relative">
                      <span class="text-base/tight lg:text-lg/tight font-semibold text-zinc-400  hover:underline hover:text-white hover:cursor-pointer w-full text-clip ">
                        {currentTrack()?.artist_name}
                      </span>
                      <button
                        class="flex flex-row  rounded-lg text-base  font-medium text-zinc-400 hover:text-white hover:cursor-pointer items-center min-w-fit"
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
                    class="h-full relative max-h-96 overflow-auto bg-zinc-800/50 rounded-xl p-3"
                  >
                    <div class="flex flex-col gap-3">
                      <span class="text-sm text-zinc-400">
                        Britpop is the third album by British singer,
                        songwriter, and producer A. G. Cook. This 100-minute
                        album is split into three discs: Past, Present, and
                        Future.
                      </span>
                      <span class="text-sm text-zinc-400">
                        — Past (tracks 1 to 8): This disc features fast-paced,
                        playful electronic sounds and vocal chops. The tracks
                        reference the mindset and idealism of a certain era, but
                        the sound is more advanced, reflecting the work A.G.
                        Cook has done since then. It includes the album’s lead
                        single Silver Thread Golden Needle and the title track
                        Britpop.
                      </span>
                      <span class="text-sm text-zinc-400">
                        — Present (tracks 9 to 16): This is the most lyrical
                        disc, dedicated to a more traditional approach to
                        songwriting. It features the use of guitar and lo-fi
                        vocal treatment. Notably, it includes Without, an ode to
                        the late producer SOPHIE, one of Cook’s closest friends
                        and collaborators.
                      </span>
                      <span class="text-sm text-zinc-400">
                        — Future (tracks 17 to 24): This disc showcases
                        avant-garde and chaotic sound designs. As A. G. Cook
                        said, Future includes all the tracks that almost make
                        him feel uncomfortable, where he questions the tempo or
                        genre. It includes the album’s third single and oldest
                        song, Soulbreaker.
                      </span>
                      <span class="text-sm text-zinc-400">
                        This album was released via New Alias, A. G. Cook’s new
                        label, founded after PC Music’s wind down.
                      </span>
                    </div>
                  </OverlayScrollbarsComponent>
                </div>
              </Tabs.Content>
              <Tabs.Content class="" value="lyrics">
                Dashboard details
              </Tabs.Content>
              <Tabs.Content class="" value="queue">
                Settings details
              </Tabs.Content>
            </Tabs>
          </OverlayScrollbarsComponent>
        </div>
      </div>
    </Show>
  );
}
