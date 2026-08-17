// Dependencies
import { For, Show, createSignal, Accessor } from "solid-js";
// Hooks
import addTrackToPlaylist from "../../../hooks/library/Playlists/addTrackToPlaylist";
// Stores
import { libraryStore } from "../../../stores/libraryStore";
import { TrackType } from "../../../types/DatabaseType";
import { coverUrl, coverThumbUrl } from "../../../utils/coverUrl";
// Functions
export default function SearchSongPlaylist({
  playlistId,
  length,
}: {
  playlistId: number;
  length: Accessor<number>;
}) {
  const [trackStore] = libraryStore.trackStore;
  const [input, setInput] = createSignal<string>("");
  const [tracks, setTracks] = createSignal<TrackType[]>([]);

  const handleInput = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
    const value = e.currentTarget.value;
    setInput(value);
    setTracks(
      trackStore().filter(
        (track) =>
          track.artist_name.toLowerCase().includes(value.toLowerCase()) ||
          track.title.toLowerCase().includes(value.toLowerCase()) ||
          track.release_title.toLowerCase().includes(value.toLowerCase()),
      ),
    );
  };
  return (
    <div class="w-full p-4">
      <div class="bg-zinc-800 w-full h-full rounded-xl border border-zinc-700/50 p-2">
        <div class="flex flex-col gap-2 justify-center">
          <span class="text-zinc-400 text-lg font-semibold pl-1">
            Find tracks for your playlist
          </span>
          <form class="w-full">
            <div class="relative items-center flex w-full">
              <input
                class="h-10 bg-zinc-900/50 rounded-lg text-sm text-zinc-400 px-10 relative w-full"
                placeholder="Search tracks..."
                value={input()}
                onInput={handleInput}
              ></input>
              <span class="icon-[solar--magnifer-linear] h-5 w-5 text-zinc-400 absolute left-3"></span>
              <Show when={input().length}>
                <button
                  class="cursor-pointer flex items-center"
                  onClick={() => {
                    setInput("");
                    setTracks([]);
                  }}
                >
                  <span class="icon-[solar--close-circle-linear] h-5 w-5 text-zinc-400 absolute right-3"></span>
                </button>
              </Show>
            </div>
          </form>
          <Show when={tracks().length}>
            <div class=" flex flex-col gap-0.5 pt-2">
              <For each={tracks()}>
                {(track) => (
                  <div class="flex gap-2 p-2 items-center hover:bg-zinc-900/50 rounded-xl">
                    <div class="aspect-square h-10 w-10 min-w-10 rounded-lg overflow-hidden">
                      <img
                        src={coverThumbUrl(track.artwork)}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            coverUrl(track.artwork) ?? "";
                        }}
                        loading="lazy"
                        decoding="async"
                        class="w-full h-full"
                      />
                    </div>
                    <div class="flex w-full justify-between">
                      <div class="flex flex-col">
                        <span class="text-sm text-zinc-300">{track.title}</span>
                        <div class="flex gap-2 text-xs text-zinc-400">
                          <span class="">{track.artist_name}</span>
                          <span>•</span>
                          <span class="">{track.release_title}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <button
                        class="text-sm px-3 py-1 rounded-full border border-zinc-700 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-950 cursor-pointer font-semibold"
                        onClick={() =>
                          addTrackToPlaylist(
                            playlistId,
                            track.song_id,
                            length() + 1,
                          )
                        }
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
          <Show when={input().length && tracks().length === 0}>
            <div class="flex w-full text-zinc-400 text-center pt-2 justify-center items-center">
              <span>No track found</span>
            </div>
          </Show>
          <div></div>
        </div>
      </div>
    </div>
  );
}
