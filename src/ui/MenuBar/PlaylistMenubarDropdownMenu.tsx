// Dependencies
import { DropdownMenu } from "@kobalte/core/dropdown-menu";
// Types
import { JSX } from "solid-js";
import { uiStore } from "../../stores/uiStore";
interface Props {
  children: JSX.Element;
}
// Function
export default function PlaylistMenubarDropdownMenu(props: Props) {
  const [expandPlaylist, setExpandPlaylist] = uiStore.expandPlaylist;
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
            <DropdownMenu.Item class="bg-transparent hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl  outline-0">
              <div class=" flex gap-2 items-center w-full">
                <span class="icon-[solar--add-square-linear] w-4 h-4"></span>
                <span class="">New</span>
              </div>
            </DropdownMenu.Item>
            {/*<DropdownMenu.Separator class="h-px my-1 border-t border-zinc-700/50" />*/}
            <DropdownMenu.Item class="bg-transparent hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl  outline-0">
              <button
                class=" flex gap-2 items-center w-full"
                onClick={() => {
                  setExpandPlaylist(!expandPlaylist());
                }}
              >
                <span
                  class={`${expandPlaylist() ? "icon-[solar--alt-arrow-up-linear]" : "icon-[solar--alt-arrow-down-linear]"} h-4 w-4 `}
                ></span>
                <span class="">{expandPlaylist() ? "Collapse" : "Expand"}</span>
              </button>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
}
