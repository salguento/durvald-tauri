// Dependencies
import { DropdownMenu } from "@kobalte/core/dropdown-menu";
import { A } from "@solidjs/router";
// Types
import { JSX } from "solid-js";
interface Props {
  children: JSX.Element;
}
// Function
export default function MainMenu(props: Props) {
  return (
    <DropdownMenu
      fitViewport={true}
      shift={18}
      slide={true}
      overlap={true}
      flip={true}
      sameWidth={false}
    >
      <DropdownMenu.Trigger class="relative w-8 h-8 flex  hover:cursor-pointer">
        {props.children}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content class="relative min-w-3xs p-1 border bg-zinc-900/50 backdrop-blur-xl border-zinc-700/50  text-zinc-200 rounded-2xl z-1  outline-none cursor-default text-sm  overflow-hidden ">
          <div class=" flex flex-col w-full h-full overflow-hidden">
            <DropdownMenu.Item class="bg-transparent hover:bg-zinc-600/50 relative px-2 py-2 flex justify-between rounded-xl  outline-0">
              <A href="/settings" class=" flex gap-2 items-center">
                <span class="icon-[solar--settings-linear] w-4 h-4"></span>
                <span class="">Settings</span>
              </A>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
}
