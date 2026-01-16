// Dependencies
import { A } from "@solidjs/router";
import { Show } from "solid-js";
// Store
import { uiStore } from "../../stores/uiStore";
// Type
interface Props {
  href: string;
  title: string;
  icon: string;
}
//function
export default function MenubarButton({ href, title, icon }: Props) {
  const [menuCollapsed] = uiStore.menuCollapsed;
  return (
    <A href={href}>
      <button
        class={`flex flex-row ${menuCollapsed() ? "w-8 justify-center p-1" : "w-full"} items-center h-8 rounded-lg gap-1 hover:bg-zinc-800 focus:bg-zinc-900 text-sm font-normal text-zinc-300 hover:cursor-pointer `}
        title={title}
      >
        <div class="flex items-center justify-center w-8 h-8 p-1">
          <span class={`${icon} h-5 w-5`}></span>
        </div>
        <Show when={!menuCollapsed()}>{title}</Show>
      </button>
    </A>
  );
}
