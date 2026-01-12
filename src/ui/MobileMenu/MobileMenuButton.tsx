// Dependencies
import { A } from "@solidjs/router";
// Type
interface Props {
  title: string;
  icon: string;
  href: string;
}
// Function
export default function MobileMenuButton({ title, icon, href }: Props) {
  return (
    <A href={href}>
      <button
        class="flex flex-col  p-1.5 rounded-lg gap-1 hover:bg-zinc-800 focus:bg-zinc-900  font-normal text-zinc-300 hover:cursor-pointer items-center text-xs"
        title={title}
      >
        <span class={`${icon} h-5 w-5`}></span>
        <span class="text-[10px]">{title}</span>
      </button>
    </A>
  );
}
