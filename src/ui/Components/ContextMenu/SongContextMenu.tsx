// Dependencies
import { ContextMenu } from "@kobalte/core/context-menu";
import { createSignal } from "solid-js";
// Types
import { JSX } from "solid-js";
import TrackType from "../../../types/Track";
interface Props {
  children: JSX.Element;
  track: TrackType;
}
// Function
export default function ContextMenuComponent(props: Props) {
  const [showGitLog, setShowGitLog] = createSignal(true);
  const [showHistory, setShowHistory] = createSignal(false);
  const [branch, setBranch] = createSignal("main");
  return (
    <ContextMenu>
      <ContextMenu.Trigger class="relative w-full h-full flex group bg-zinc-900 hover:bg-zinc-800 hover:cursor-pointer">
        {props.children}
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content class="min-w-3xs p-1 bg-black/50 backdrop-blur-3xl border border-zinc-500/50  text-zinc-400 rounded-2xl z-100 outline-none cursor-pointer text-sm">
          <ContextMenu.Sub overlap gutter={-1} shift={8}>
            <ContextMenu.SubTrigger class="flex justify-between items-center cursor-default hover:bg-zinc-600/50 px-2 py-2 rounded-xl hover:text-white outline-0 ">
              <div class="">Add to playlist</div>
              <span class="icon-[solar--alt-arrow-right-linear] w-4 h-4"></span>
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent class="bg-black/50 backdrop-blur-3xl border border-zinc-500/50 rounded-2xl z-100 overflow-hidden p-1 w-64 text-sm outline-0">
                <ContextMenu.Item class="text-zinc-400 hover:text-white px-2 py-2 hover:bg-zinc-600/50 rounded-xl cursor-pointer outline-0">
                  Find a playlist
                </ContextMenu.Item>
                <ContextMenu.Item class="text-zinc-400 hover:text-white px-2 py-2 hover:bg-zinc-600/50 rounded-xl cursor-pointer outline-0">
                  New playlist
                </ContextMenu.Item>
                <ContextMenu.Separator class=" h-px my-1 border-t border-zinc-800/50" />
                <ContextMenu.Item class="text-zinc-400 hover:text-white px-2 py-2 hover:bg-zinc-600/50 rounded-xl cursor-pointer outline-0">
                  Playlist for loop
                </ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>
          <ContextMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div class="">Add to library</div>
            <div class="">⌘+K</div>
          </ContextMenu.Item>
          <ContextMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Favorite</div>
            <div>⇧+⌘+K</div>
          </ContextMenu.Item>
          <ContextMenu.Separator class="h-px my-1 border-t border-zinc-700/50" />
          <ContextMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Add next to queue</div>
            <div>⇧+⌘+K</div>
          </ContextMenu.Item>
          <ContextMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Add last to queue</div>
            <div>⇧+⌘+K</div>
          </ContextMenu.Item>
          <ContextMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Create song station</div>
            <div>⇧+⌘+K</div>
          </ContextMenu.Item>
          <ContextMenu.Separator class="h-px my-1 border-t border-zinc-700/50" />
          <ContextMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Hide song</div>
            <div>⇧+⌘+K</div>
          </ContextMenu.Item>
          <ContextMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Suggest less</div>
            <div>⇧+⌘+K</div>
          </ContextMenu.Item>
          <ContextMenu.Separator class="h-px my-1 border-t border-zinc-700/50" />
          <ContextMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Share</div>
            <div>⇧+⌘+K</div>
          </ContextMenu.Item>
          <ContextMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Info</div>
            <div>⇧+⌘+K</div>
          </ContextMenu.Item>
          <ContextMenu.Separator class="h-px my-1 border-t border-zinc-700/50" />
          <ContextMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white">
            <div>View source</div>
            <div>⇧+⌘+K</div>
          </ContextMenu.Item>
          <ContextMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Search for sources</div>
            <div>⇧+⌘+K</div>
          </ContextMenu.Item>
          <ContextMenu.Item class="hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl hover:text-white outline-0">
            <div>Download</div>
            <div>⇧+⌘+K</div>
          </ContextMenu.Item>
          {/*<ContextMenu.Item
            class=" text-zinc-700 relative px-2 py-2 flex justify-between rounded-xl cursor-default"
            disabled
          >
            Update Project <div class="">⌘+T</div>
          </ContextMenu.Item>

          <ContextMenu.CheckboxItem
            class="flex justify-start items-center gap-1"
            checked={showGitLog()}
            onChange={setShowGitLog}
          >
            <ContextMenu.ItemIndicator class="h-4 w-4 flex items-center">
              <span class="icon-[solar--check-square-linear] w-4 h-4"></span>
            </ContextMenu.ItemIndicator>
            Show Git Log
          </ContextMenu.CheckboxItem>
          <ContextMenu.CheckboxItem
            class="flex justify-start items-center gap-1"
            checked={showHistory()}
            onChange={setShowHistory}
          >
            <ContextMenu.ItemIndicator class="h-4 w-4 flex items-center">
              <span class="icon-[solar--check-square-linear] w-4 h-4"></span>
            </ContextMenu.ItemIndicator>
            Show History
          </ContextMenu.CheckboxItem>
          <ContextMenu.Separator class="" />
          <ContextMenu.Group>
            <ContextMenu.GroupLabel class="">Branches</ContextMenu.GroupLabel>
            <ContextMenu.RadioGroup value={branch()} onChange={setBranch}>
              <ContextMenu.RadioItem
                class="flex justify-start gap-1 items-center"
                value="main"
              >
                <ContextMenu.ItemIndicator class="flex justify-center items-center h-4 w-4">
                  <span class="icon-[solar--double-alt-arrow-right-linear] w-4 h-4"></span>
                </ContextMenu.ItemIndicator>
                main
              </ContextMenu.RadioItem>
              <ContextMenu.RadioItem
                class="flex justify-start gap-1 items-center"
                value="develop"
              >
                <ContextMenu.ItemIndicator class="flex justify-center items-center h-4 w-4">
                  <span class="icon-[solar--double-alt-arrow-right-linear] w-4 h-4"></span>
                </ContextMenu.ItemIndicator>
                develop
              </ContextMenu.RadioItem>
            </ContextMenu.RadioGroup>
          </ContextMenu.Group>*/}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu>
  );
}
