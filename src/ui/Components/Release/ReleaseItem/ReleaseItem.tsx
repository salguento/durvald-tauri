import { A } from "@solidjs/router";
import { Show } from "solid-js";
import ReleaseContextMenu from "../ReleaseContextMenu/ReleaseContextMenu";
import ReleaseDropdownMenu from "../ReleaseContextMenu/ReleaseDropdownMenu";
import { ReleaseType } from "../../../../types/ReleaseType";

export default function ReleaseItem(props: { release: ReleaseType }) {
  return (
    <ReleaseContextMenu release={props.release}>
      <div class="flex flex-col gap-1 group ">
        <Show
          when={
            props.release.artwork != "" && props.release.artwork != undefined
          }
          fallback={
            <div class="min-h-40 min-w-40 max-h-64 max-w-64 rounded-xl">
              <span class="icon-[solar--music-notes-bold-duotone] h-12 w-12 "></span>
            </div>
          }
        >
          <div class="relative">
            <A
              href={`/release/${props.release.id.toString()}`}
              class="hover:cursor-pointer relative"
            >
              <img
                src={props.release.artwork}
                alt=""
                class="min-h-40 min-w-40 max-h-64 max-w-64 w-full h-full rounded-lg hover:border-white border border-transparent"
              />
            </A>
            <div class="absolute invisible group-hover:visible top-2 right-2 z-1">
              <ReleaseDropdownMenu release={props.release}>
                <button
                  class="w-8 h-8 cursor-pointer bg-zinc-900/50 backdrop-blur-lg flex items-center justify-center rounded-full"
                  title="Options"
                >
                  <span class="icon-[solar--menu-dots-bold] w-6 h-6 text-zinc-300 hover:text-white"></span>
                </button>
              </ReleaseDropdownMenu>
            </div>
            <div class="absolute invisible group-hover:visible bottom-1 right-1">
              <button
                class="cursor-pointer items-center flex relative justify-center"
                title="Play release"
              >
                <span class="h-6 w-6 bg-zinc-900/50 backdrop-blur-lg absolute"></span>
                <span class="icon-[solar--play-circle-bold] w-12 h-12 text-white "></span>
              </button>
            </div>
          </div>
        </Show>
        <div class="flex flex-col">
          <div class="flex items-center gap-1">
            <A
              href={`/release/${props.release.id.toString()}`}
              class="w-fit max-w-40 flex items-center h-fit"
            >
              <span class="text-sm text-zinc-300 font-medium hover:underline hover:text-white hover:cursor-pointer line-clamp-2">
                {props.release.title}
              </span>
            </A>
            <Show when={props.release.is_favorite}>
              <span class="icon-[solar--heart-angle-bold] h-4 w-4 text-zinc-300"></span>
            </Show>
          </div>
          <A
            href={`/release/${props.release.artist_id.toString()}`}
            class="truncate w-full flex items-center h-fit"
          >
            <span class="text-xs text-zinc-500 hover:underline hover:text-white hover:cursor-pointer">
              {props.release.artist_name}
            </span>
          </A>
        </div>
      </div>
    </ReleaseContextMenu>
  );
}
