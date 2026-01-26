// Dependencies
import { invoke } from "@tauri-apps/api/core";
import { createEffect, createRoot } from "solid-js";
// Stores
import { libraryStore } from "../../stores/libraryStore";
// Types
import {
  TrackType,
  ReleaseType,
  ArtistType,
  HistoryType,
  PlaylistType,
  PlaylistSongsType,
  SettingsType,
} from "../../types/DatabaseType";
// Function
export default async function mirrorDB() {
  createRoot((dispose) => {
    const [, setTrackStore] = libraryStore.trackStore;
    const [, setReleaseStore] = libraryStore.releaseStore;
    const [, setArtistStore] = libraryStore.artistStore;
    const [, setHistoryStore] = libraryStore.historyStore;
    const [, setPlaylistStore] = libraryStore.playlistStore;
    const [, setPlaylistSongStore] = libraryStore.playlistSongStore;
    const [, setShowOnboarding] = libraryStore.showOnboarding;

    createEffect(async () => {
      try {
        const settings = (await invoke("get_settings")) as SettingsType;
        const tracks = (await invoke("get_all_tracks")) as TrackType[];
        const releases = (await invoke("get_all_releases")) as ReleaseType[];
        const artists = (await invoke("get_all_artists")) as ArtistType[];
        const history = (await invoke("get_play_history")) as HistoryType[];
        const playlists = (await invoke("get_all_playlists")) as PlaylistType[];
        const playlistSongs = (await invoke(
          "get_all_playlist_songs",
        )) as PlaylistSongsType[];

        setShowOnboarding(settings.onboarding);
        setTrackStore(tracks);
        setReleaseStore(releases);
        setArtistStore(artists);
        setHistoryStore(history);
        setPlaylistStore(playlists);
        setPlaylistSongStore(playlistSongs);
      } catch (err) {
        console.error("Error mirroring database:", err);
      } finally {
        console.info("Database mirrored.");
      }
    });

    return dispose;
  });
}
