// Dependencies
import { DropdownMenu } from "@kobalte/core/dropdown-menu";
// Types
import { JSX } from "solid-js";
import TrackType from "../../../types/Track";
interface Props {
  children: JSX.Element;
  track: TrackType;
}
// Function
export default function DropdownMenuComponent(props: Props) {
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
        <DropdownMenu.Content class="min-w-3xs p-1 bg-black/50 backdrop-blur-3xl border border-zinc-700/50  text-zinc-400 rounded-2xl z-100 outline-none cursor-pointer text-sm">
          <DropdownMenu.Sub overlap gutter={-1} shift={8}>
            <DropdownMenu.SubTrigger class="flex justify-between items-center cursor-default hover:bg-zinc-600/50 px-2 py-2 rounded-xl hover:text-white outline-0 ">
              <div class="">Add to playlist</div>
              <span class="icon-[solar--alt-arrow-right-linear] w-4 h-4"></span>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent class="bg-black/50 backdrop-blur-3xl border border-zinc-700/50 rounded-2xl z-100 overflow-hidden p-1 w-64 text-sm outline-0">
                <DropdownMenu.Item class="text-zinc-400 hover:text-white px-2 py-2 hover:bg-zinc-600/50 rounded-xl cursor-pointer outline-0">
                  Find a playlist
                </DropdownMenu.Item>
                <DropdownMenu.Item class="text-zinc-400 hover:text-white px-2 py-2 hover:bg-zinc-600/50 rounded-xl cursor-pointer outline-0">
                  New playlist
                </DropdownMenu.Item>
                <DropdownMenu.Separator class=" h-px my-1 border-t border-zinc-700/50" />
                <DropdownMenu.Item class="text-zinc-400 hover:text-white px-2 py-2 hover:bg-zinc-600/50 rounded-xl cursor-pointer outline-0">
                  Playlist for loop
                </DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
          <DropdownMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div class="">Add to library</div>
            <div class="">⌘+K</div>
          </DropdownMenu.Item>
          <DropdownMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Favorite</div>
            <div>⇧+⌘+K</div>
          </DropdownMenu.Item>
          <DropdownMenu.Separator class="h-px my-1 border-t border-zinc-700/50" />
          <DropdownMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Add next to queue</div>
            <div>⇧+⌘+K</div>
          </DropdownMenu.Item>
          <DropdownMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Add last to queue</div>
            <div>⇧+⌘+K</div>
          </DropdownMenu.Item>
          <DropdownMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Create song station</div>
            <div>⇧+⌘+K</div>
          </DropdownMenu.Item>
          <DropdownMenu.Separator class="h-px my-1 border-t border-zinc-700/50" />
          <DropdownMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Hide song</div>
            <div>⇧+⌘+K</div>
          </DropdownMenu.Item>
          <DropdownMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Suggest less</div>
            <div>⇧+⌘+K</div>
          </DropdownMenu.Item>
          <DropdownMenu.Separator class="h-px my-1 border-t border-zinc-700/50" />
          <DropdownMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Share</div>
            <div>⇧+⌘+K</div>
          </DropdownMenu.Item>
          <DropdownMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Info</div>
            <div>⇧+⌘+K</div>
          </DropdownMenu.Item>
          <DropdownMenu.Separator class="h-px my-1 border-t border-zinc-700/50" />
          <DropdownMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white">
            <div>View source</div>
            <div>⇧+⌘+K</div>
          </DropdownMenu.Item>
          <DropdownMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Search for sources</div>
            <div>⇧+⌘+K</div>
          </DropdownMenu.Item>
          <DropdownMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Download</div>
            <div>⇧+⌘+K</div>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
}
