import { invoke } from "@tauri-apps/api/core";
import { A } from "@solidjs/router";
import { Show } from "solid-js";
import PlaylistContextMenu from "./PlaylistContextMenu";
import PlaylistDropdownMenu from "./PlaylistDropdownMenu";
import playBack from "../../../hooks/audio/play";
import { PlaylistType, TrackType } from "../../../types/DatabaseType";

export default function PlaylistItem({ playlist }: { playlist: PlaylistType }) {
  const handlePlay = async () => {
    const tracks: TrackType[] = await invoke("get_songs_by_release_id", {
      releaseId: playlist.id,
    });
    playBack(tracks[0]);
  };
  return (
    <PlaylistContextMenu playlist={playlist}>
      <div class="flex flex-col gap-1 group ">
        <Show
          when={playlist.cover?.length && playlist.cover != undefined}
          fallback={
            <div class="min-h-40 min-w-40 max-h-64 max-w-64 rounded-xl">
              <span class="icon-[solar--music-notes-bold-duotone] h-12 w-12 "></span>
            </div>
          }
        >
          <div class="relative">
            <A
              href={`/playlist/${playlist.id.toString()}`}
              class="hover:cursor-pointer relative"
            >
              <img
                src={
                  playlist.cover
                    ? URL.createObjectURL(
                        new Blob([new Uint8Array(playlist.cover)]),
                      )
                    : ""
                }
                alt=""
                class="aspect-square min-h-40 min-w-40 max-h-64 max-w-64 w-full h-full rounded-lg group-hover:border-white border border-transparent object-cover"
              />
            </A>
            <div class="absolute invisible group-hover:visible top-2 right-2 z-1">
              <PlaylistDropdownMenu playlist={playlist}>
                <button
                  class="w-8 h-8 cursor-pointer bg-zinc-900/50 backdrop-blur-lg flex items-center justify-center rounded-full"
                  title="Options"
                >
                  <span class="icon-[solar--menu-dots-bold] w-6 h-6 text-zinc-300 hover:text-white"></span>
                </button>
              </PlaylistDropdownMenu>
            </div>
            <div class="absolute invisible group-hover:visible  bottom-2 right-2">
              <button
                class="cursor-pointer items-center flex relative justify-center"
                title="Play release"
                onClick={() => handlePlay()}
              >
                <span class="bg-zinc-900/50 rounded-full backdrop-blur-lg h-12 w-12 flex items-center justify-center">
                  <span class="icon-[solar--play-bold] min-w-6 min-h-6 hover:text-white text-zinc-300 backdrop-blur-lg"></span>
                </span>
              </button>
            </div>
          </div>
        </Show>
        <div class="flex flex-col">
          <div class="flex items-center gap-1">
            <A
              href={`/playlist/${playlist.id.toString()}`}
              class="w-fit max-w-40 flex items-center h-fit"
            >
              <span class="text-sm text-zinc-300 font-medium hover:underline hover:text-white hover:cursor-pointer line-clamp-2">
                {playlist.name}
              </span>
            </A>
            <Show when={playlist.is_favorite}>
              <span class="icon-[solar--heart-angle-bold] h-3 w-3 text-zinc-300"></span>
            </Show>
          </div>
        </div>
      </div>
    </PlaylistContextMenu>
  );
}
