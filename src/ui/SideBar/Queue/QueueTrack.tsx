// Dependencies
import { createSignal } from "solid-js";
// Types
import SongType from "../../../types/Track";
// Components
import QueueContextMenu from "./QueueContextMenu";
import QueueDropdownMenu from "./QueueDropdownMenu";
import TrackType from "../../../types/Track";
import { secToMin } from "../../../utils/secToMin";

interface QueueTrackProps {
  item: TrackType;
}
export default function QueueTrack({ item }: QueueTrackProps) {
  const [, setIsOpen] = createSignal<boolean>(false);
  const song: SongType = {
    song_id: 1,
    title: "title",
    artwork: "url",
    artist_id: 1,
    artist_name: "Artist",
    release_id: 1,
    release_title: "Release",
    track_number: 1,
    disc_number: 1,
    duration: 211000,
    bitrate: null,
    sample_rate: null,
    play_count: 0,
    last_played: null,
    rating: null,
    lyrics: null,
    is_favorite: false,
    file_path: "url",
    created_at: "date",
    updated_at: "date",
  };
  return (
    <div class="w-full relative">
      <QueueContextMenu track={song}>
        <div class="flex justify-between gap-2 group  px-1.5 py-1.5 overflow-hidden rounded-xl">
          <div class="min-w-10 min-h-10 relative flex items-center justify-center rounded-sm overflow-hidden ">
            <div class="absolute w-full h-full  bg-zinc-500/75 hidden   group-hover:flex ">
              <button
                class="w-full h-full items-center justify-center flex cursor-pointer"
                title="Remove from queue"
                onClick={() => {}}
              >
                <span class="icon-[solar--minus-circle-linear] h-6 w-6 text-white"></span>
              </button>
            </div>
            <img src={item.artwork} class="w-10 h-10"></img>
          </div>
          <div class="flex flex-col grow text-left overflow-hidden">
            <span class="text-sm truncate">{item.title}</span>
            <span class="text-xs text-zinc-400 truncate">
              {item.artist_name + "-" + item.release_title}
            </span>
          </div>
          <div class="flex items-center justify-end text-right min-w-8">
            <QueueDropdownMenu track={song}>
              <span
                class={`group-hover:hidden block text-xs text-zinc-400 h-6`}
              >
                {secToMin(item.duration)}
              </span>
              <div class={`group-hover:block hidden`}>
                <button
                  class="h-6 w-6 hover:cursor-pointer flex items-center justify-center hover:bg-white rounded-full text-zinc-300 hover:text-black p-1"
                  title="Options"
                  onClick={() => setIsOpen(true)}
                >
                  <span class="icon-[solar--menu-dots-bold] h-4 w-4"></span>
                </button>
              </div>
            </QueueDropdownMenu>
          </div>
        </div>
      </QueueContextMenu>
    </div>
  );
}
