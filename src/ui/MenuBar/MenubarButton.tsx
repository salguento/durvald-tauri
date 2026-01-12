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
        class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900 text-sm font-normal text-zinc-300 hover:cursor-pointer items-center"
        title={title}
      >
        <span class={`${icon} h-5 w-5`}></span>
        <Show when={!menuCollapsed()}>{title}</Show>
      </button>
    </A>
  );
}
