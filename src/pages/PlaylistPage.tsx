// Dependencies
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { For, Show } from "solid-js";
import { useParams } from "@solidjs/router";
import { createSignal, createEffect } from "solid-js";
// Hooks
import favoriteTrack from "../hooks/library/Tracks/favoriteTrack";
import favoriteRelease from "../hooks/library/Releases/favoriteRelease";
// Stores
import { libraryStore } from "../stores/libraryStore";
// Utils
import { secToMin } from "../utils/secToMin";
import { dateToDMY } from "../utils/dateToDMY";
import { coverUrl, coverThumbUrl } from "../utils/coverUrl";
// Types
import {
  PlaylistSongsType,
  PlaylistType,
  TrackType,
} from "../types/DatabaseType";
interface PlaylistSongsItemsType {
  playlist: PlaylistSongsType;
  track: TrackType;
}
// UI
import PlaylistContextMenu from "../ui/Components/Playlist/PlaylistContextMenu";
import PlaylistDropdownMenu from "../ui/Components/Playlist/PlaylistDropdownMenu";
import PlaylistTrackContextMenu from "../ui/Components/Playlist/PlaylistTrackContextMenu";
import PlaylistTrackDropdownMenu from "../ui/Components/Playlist/PlaylistTrackDropdownMenu";
import SearchSongPlaylist from "../ui/Components/Playlist/SearchSongPlaylist";
// Function
export default function PlaylistPage() {
  const [initializeLibraryStore] = libraryStore.initializeLibraryStore;
  const [playlistStore] = libraryStore.playlistStore;
  const [playlistSongStore] = libraryStore.playlistSongStore;
  const [trackStore] = libraryStore.trackStore;
  const [playlist, setPlaylist] = createSignal<PlaylistType>();
  const [playlistSongs, setPlaylistSongs] = createSignal<PlaylistSongsType[]>();
  const [songs, setSongs] = createSignal<PlaylistSongsItemsType[]>([]);
  const [, setIsOpen] = createSignal<boolean>(false);
  const [isLoaded, setIsLoaded] = createSignal<boolean>(false);
  const [currentLength, setCurrentLength] = createSignal<number>(0);
  const params = useParams();
  const playlistId = Number(params.id);
  createEffect(() => {
    try {
      if (initializeLibraryStore()) {
        setPlaylist(
          playlistStore().filter((playlist) => playlist.id === playlistId)[0],
        );
        setPlaylistSongs(
          playlistSongStore().filter((item) => item.playlist_id === playlistId),
        );
        setSongs([]);
        setSongs((prev) => [
          ...prev,
          ...((playlistSongs() || [])?.map((item) => {
            const track = trackStore().find(
              (track) => track.song_id === item.song_id,
            );
            return { playlist: item, track: track } as PlaylistSongsItemsType;
          }) || []),
        ]);
        setCurrentLength(songs().length);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoaded(true);
    }
  });

  createEffect(() => {
    setCurrentLength(songs().length);
  });

  return (
    <Show when={isLoaded()}>
      <div class="h-full">
        <div class="relative w-full shadow-xl">
          <PlaylistContextMenu playlist={playlist()!}>
            <div class="absolute w-full text-white  bg-zinc-900/50  z-1 border-b h-13 border-zinc-700/50">
              <div class="backdrop-blur-xl flex justify-between items-center  px-4 h-13  w-full ">
                <div class="col-span-1 flex gap-4 items-center justify-center">
                  <button
                    class="w-6 h-6 cursor-pointer"
                    title={`Play ${playlist()?.name}`}
                    onClick={() => {}}
                  >
                    <span class="icon-[solar--play-bold] w-6 h-6 text-white"></span>
                  </button>
                  <button
                    class="w-6 h-6 cursor-pointer"
                    title={`Shuffle ${playlist()?.name}`}
                  >
                    <span class="icon-[solar--shuffle-linear] w-6 h-6 text-white"></span>
                  </button>
                </div>
                <div class="col-span-2 flex gap-4 items-center justify-end">
                  <button class="w-6 h-6 cursor-pointer" title="Add to library">
                    <span class="icon-[solar--add-square-linear] w-6 h-6 text-white"></span>
                  </button>
                  <button
                    class="w-6 h-6 cursor-pointer"
                    title={`${playlist()?.is_favorite ? "Unfavorite release" : "Favorite"}`}
                    onClick={() => {
                      favoriteRelease(playlist()!.id);
                    }}
                  >
                    <span
                      class={`${playlist()?.is_favorite ? "icon-[solar--heart-angle-bold]" : "icon-[solar--heart-angle-linear]"} w-6 h-6 text-white`}
                    ></span>
                  </button>
                  <PlaylistDropdownMenu playlist={playlist()!}>
                    <button class="w-6 h-6 cursor-pointer" title="Options">
                      <span class="icon-[solar--menu-dots-bold] w-6 h-6 text-white"></span>
                    </button>
                  </PlaylistDropdownMenu>
                </div>
              </div>
            </div>
          </PlaylistContextMenu>
        </div>
        <OverlayScrollbarsComponent
          element="span"
          options={{ scrollbars: { autoHide: "scroll" } }}
          events={{
            scroll: () => {
              /* ... */
            },
          }}
          defer
          class="w-full flex flex-col gap-4 h-full pb-36 sm:pb-0"
        >
          <PlaylistContextMenu playlist={playlist()!}>
            <div class="sm:h-96 relative flex items-center w-full">
              <div class="absolute w-full h-full  overflow-hidden flex items-center">
                <div class="bg-zinc-900/50 backdrop-blur-xl absolute w-full h-full"></div>
                <img
                  src={
                    playlist()?.cover
                      ? URL.createObjectURL(
                          new Blob([new Uint8Array(playlist()?.cover!)]),
                        )
                      : ""
                  }
                  class="w-full h-full"
                ></img>
              </div>
              <div class="flex flex-col gap-8 w-full relative pt-14">
                <div class="flex flex-col sm:flex-row gap-2 sm:gap-8 items-center px-10 py-8 sm:py-0">
                  <div>
                    <img
                      src={
                        playlist()?.cover
                          ? URL.createObjectURL(
                              new Blob([new Uint8Array(playlist()?.cover!)]),
                            )
                          : ""
                      }
                      class="aspect-square sm:w-64 min-w-48 w-64 rounded-xl object-cover"
                      alt=""
                    />
                  </div>
                  <div class="flex flex-col gap-1 text-center sm:text-left">
                    <span class="text-xl sm:text-2xl text-white font-semibold line-clamp-2">
                      {playlist()?.name}
                    </span>
                    <div class="flex flex-rol gap-2 justify-center sm:justify-start">
                      <span class="text-sm sm:text-md text-zinc-400 font-medium hover:underline hover:cursor-pointer">
                        {playlist()?.created_at
                          ? dateToDMY(playlist()?.created_at!)
                          : ""}
                      </span>
                      <Show when={playlistSongs()?.length}>
                        <span class="text-sm sm:text-md text-zinc-400 font-medium">
                          •
                        </span>
                        <span class="text-sm sm:text-md text-zinc-400 font-medium hover:underline hover:cursor-pointer">
                          {currentLength() + " tracks"}
                        </span>
                        <span class="text-sm sm:text-md text-zinc-400 font-medium hover:underline hover:cursor-pointer">
                          {/*{secToMin(release()!.duration)}*/}
                        </span>
                      </Show>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PlaylistContextMenu>
          <div>
            <div class="overflow-hidden relative">
              <div class="relative overflow-hidden flex flex-col">
                <For each={songs()}>
                  {(song: PlaylistSongsItemsType) => (
                    <PlaylistTrackContextMenu track={song}>
                      <div class="flex justify-center items-center content-center  min-w-8 pl-2">
                        <button
                          class="text-zinc-300 hover:text-white hover:cursor-pointer w-4 h-4"
                          title={`${
                            song.track.is_favorite
                              ? "Unfavorite song"
                              : "Favorite song"
                          }`}
                          onClick={() => {
                            favoriteTrack(song.track.song_id);
                          }}
                        >
                          <span
                            class={`w-4 h-4  ${
                              song.track.is_favorite
                                ? "icon-[solar--heart-bold] "
                                : "group-hover:icon-[solar--heart-linear]"
                            }`}
                          ></span>
                        </button>
                      </div>
                      <div class="flex justify-center items-center h-12 min-w-10 ">
                        <div class="h-10 w-10 rounded-sm overflow-hidden relative flex items-center justify-center">
                          <img
                            src={coverThumbUrl(song.track.artwork)}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                coverUrl(song.track.artwork) ?? "";
                            }}
                            loading="lazy"
                            decoding="async"
                          />
                          <button
                            class="absolute flex items-center justify-center bg-zinc-700/25 w-full h-full invisible group-hover:visible cursor-pointer"
                            title="Play"
                          >
                            <span class="icon-[solar--play-bold] w-5 h-5 text-zinc-50 absolute" />
                          </button>
                        </div>
                      </div>
                      <div class="flex-row items-center content-center min-w-0 w-full">
                        <div class="text-sm font-medium text-zinc-300 truncate  max-w-full">
                          {song.track.title}
                        </div>
                        <div class="text-xs font-medium text-zinc-500 truncate max-w-full">
                          {song.track.artist_name}
                        </div>
                      </div>
                      <div class="flex items-center justify-end text-sm text-zinc-400 text-right l min-w-16 px-2">
                        {secToMin(song.track.duration)}
                      </div>
                      <div class="flex min-w-8 pr-2  hover:text-white text-transparent  items-center justify-center  text-sm group-hover:text-zinc-400 text-right">
                        <button
                          class="h-4 w-4 hover:cursor-pointer"
                          title="Options"
                          onClick={() => setIsOpen(true)}
                        >
                          <PlaylistTrackDropdownMenu track={song}>
                            <span class="icon-[solar--menu-dots-bold] h-4 w-4"></span>
                          </PlaylistTrackDropdownMenu>
                        </button>
                      </div>
                    </PlaylistTrackContextMenu>
                  )}
                </For>
              </div>
            </div>
          </div>
          <SearchSongPlaylist playlistId={playlistId} length={currentLength} />
        </OverlayScrollbarsComponent>
      </div>
    </Show>
  );
}
