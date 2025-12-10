import { A } from "@solidjs/router";
import { Show } from "solid-js";

interface PropsReleaseItem {
  artwork: string;
  releaseId: number;
  releaseTitle: string;
  artistId: number;
  artistName: string;
  isFavorite: boolean;
}

export default function ReleaseItem(props: PropsReleaseItem) {
  return (
    <div class="flex flex-col gap-1">
      <Show
        when={props.artwork != "" && props.artwork != undefined}
        fallback={
          <div class="min-h-40 min-w-40 max-h-40 max-w-40 rounded-xl">
            <span class="icon-[solar--music-notes-bold-duotone] h-12 w-12 "></span>
          </div>
        }
      >
        <A
          href={`/release/${props.releaseId.toString()}`}
          class="hover:cursor-pointer"
        >
          <img
            src={props.artwork}
            alt=""
            class="min-h-40 min-w-40 max-h-40 max-w-40 rounded-xl hover:border-white border border-transparent"
          />
        </A>
      </Show>
      <div class="flex flex-col">
        <div class="flex items-center gap-1">
          <A
            href={`/release/${props.releaseId.toString()}`}
            class="w-fit max-w-40 flex items-center h-fit"
          >
            <span class="text-sm text-zinc-300 font-medium hover:underline hover:text-white hover:cursor-pointer line-clamp-2">
              {props.releaseTitle}
            </span>
          </A>
          <Show when={props.isFavorite}>
            <span class="icon-[solar--heart-angle-bold] h-4 w-4 text-zinc-300"></span>
          </Show>
        </div>
        <A
          href={`/release/${props.artistId.toString()}`}
          class="truncate w-full flex items-center h-fit"
        >
          <span class="text-xs text-zinc-500 hover:underline hover:text-white hover:cursor-pointer">
            {props.artistName}
          </span>
        </A>
      </div>
    </div>
  );
}
