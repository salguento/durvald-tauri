// Dependencies
import { DropdownMenu } from "@kobalte/core/dropdown-menu";
// Hooks
import favoriteRelease from "../../../hooks/library/Releases/favoriteRelease";
// Types
import { JSX } from "solid-js";
import { PlaylistType } from "../../../types/DatabaseType";
interface Props {
  children: JSX.Element;
  playlist: PlaylistType;
}
// Function
export default function PlaylistDropdownMenu(props: Props) {
  return (
    <DropdownMenu
      fitViewport={true}
      shift={18}
      slide={true}
      overlap={true}
      flip={true}
      sameWidth={false}
    >
      <DropdownMenu.Trigger class="relative w-full h-full flex  hover:cursor-pointer">
        {props.children}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content class="relative min-w-3xs p-1 border bg-zinc-900/50 backdrop-blur-xl border-zinc-700/50  text-zinc-200 rounded-2xl z-10  outline-none cursor-default text-sm  overflow-hidden ">
          <div class=" flex flex-col w-full h-full overflow-hidden">
            <DropdownMenu.Sub overlap gutter={-1} shift={8}>
              <DropdownMenu.SubTrigger class="flex justify-between items-center cursor-default  hover:bg-zinc-600/50  px-2 py-2 rounded-xl  outline-0 ">
                <div class=" flex gap-2 items-center">
                  <span class="icon-[solar--playlist-minimalistic-2-bold] w-4 h-4"></span>
                  <span class="">Add to playlist</span>
                </div>
                <span class="icon-[solar--alt-arrow-right-linear] w-4 h-4"></span>
              </DropdownMenu.SubTrigger>
              <DropdownMenu.Portal>
                <DropdownMenu.SubContent class="bg-zinc-900/50 backdrop-blur-xl border border-zinc-700/50 rounded-2xl z-100 overflow-hidden p-1 w-64 text-sm outline-0 text-zinc-200">
                  <DropdownMenu.Item class="px-2 py-2  bg-transparent hover:bg-zinc-600/50 rounded-xl  outline-0 cursor-default">
                    <div class=" flex gap-2 items-center">
                      <span class="icon-[solar--magnifer-linear] w-4 h-4"></span>
                      <span class="">Find a playlist</span>
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item class=" px-2 py-2 bg-transparent hover:bg-zinc-600/50 rounded-xl  outline-0 cursor-default">
                    <div class=" flex gap-2 items-center">
                      <span class="icon-[solar--playlist-linear] w-4 h-4"></span>
                      <span class="">New playlist</span>
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator class=" h-px my-1 border-t border-zinc-700/50" />
                  <DropdownMenu.Item class=" px-2 py-2 bg-transparent hover:bg-zinc-600/50 rounded-xl outline-0 cursor-default">
                    Playlist for loop
                  </DropdownMenu.Item>
                </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>
            <DropdownMenu.Item class="bg-transparent hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl  outline-0">
              <div class=" flex gap-2 items-center">
                <span class="icon-[solar--add-circle-outline] w-4 h-4"></span>
                <span class="">Add to library</span>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Item class="bg-transparent hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl  outline-0">
              <button
                class=" flex gap-2 items-center w-full"
                onClick={() => favoriteRelease(props.playlist.id)}
              >
                <span
                  class={`${props.playlist.is_favorite ? "icon-[solar--heart-angle-bold]" : "icon-[solar--heart-angle-linear]"} w-4 h-4`}
                ></span>
                <span>
                  {props.playlist.is_favorite ? "Unfavorite" : "Favorite"}
                </span>
              </button>
            </DropdownMenu.Item>
            <DropdownMenu.Separator class="h-px my-1 border-t border-zinc-700/50" />
            <DropdownMenu.Item class="bg-transparent hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl  outline-0">
              <div class=" flex gap-2 items-center">
                <span class="icon-[solar--play-bold] w-4 h-4"></span>
                <span class="">Play</span>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Item class="bg-transparent hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl  outline-0">
              <div class=" flex gap-2 items-center">
                <span class="icon-[solar--shuffle-linear] w-4 h-4"></span>
                <span class="">Shuffle</span>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Item class="bg-transparent hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl  outline-0">
              <div class=" flex gap-2 items-center">
                <span class="icon-[solar--list-arrow-up-minimalistic-linear] w-4 h-4"></span>
                <span class="">Add next to queue</span>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Item class="bg-transparent hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl  outline-0">
              <div class=" flex gap-2 items-center">
                <span class="icon-[solar--list-arrow-down-minimalistic-linear] w-4 h-4"></span>
                <span class="">Add last to queue</span>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Item class="bg-transparent hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl  outline-0">
              <div class=" flex gap-2 items-center">
                <span class="icon-[solar--radio-minimalistic-outline] w-4 h-4"></span>
                <span class="">Create song radio</span>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Separator class="h-px my-1 border-t border-zinc-700/50" />
            <DropdownMenu.Item class="bg-transparent hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl  outline-0">
              <div class=" flex gap-2 items-center">
                <span class="icon-[solar--eye-closed-linear] w-4 h-4"></span>
                <span class="">Hide song</span>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Item class="bg-transparent hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl  outline-0">
              <div class=" flex gap-2 items-center">
                <span class="icon-[solar--dislike-linear] w-4 h-4"></span>
                <span class="">Suggest less</span>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Separator class="h-px my-1 border-t border-zinc-700/50" />
            <DropdownMenu.Item class="bg-transparent hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl  outline-0">
              <div class=" flex gap-2 items-center">
                <span class="icon-[solar--share-bold] w-4 h-4"></span>
                <span class="">Share</span>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Item class="bg-transparent hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl  outline-0">
              <div class=" flex gap-2 items-center">
                <span class="icon-[solar--info-circle-linear] w-4 h-4"></span>
                <span class="">Info</span>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Separator class="h-px my-1 border-t border-zinc-700/50" />
            <DropdownMenu.Item class="bg-transparent hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl  outline-0">
              <div class=" flex gap-2 items-center">
                <span class="icon-[solar--station-minimalistic-linear] w-4 h-4"></span>
                <span class="">View source</span>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Item class="bg-transparent hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl  outline-0">
              <div class=" flex gap-2 items-center">
                <span class="icon-[solar--server-minimalistic-linear] w-4 h-4"></span>
                <span class="">Search for sources</span>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Item class="bg-transparent hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl  outline-0">
              <div class=" flex gap-2 items-center">
                <span class="icon-[solar--cloud-download-linear] w-4 h-4"></span>
                <span class="">Download</span>
              </div>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
}
