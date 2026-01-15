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
} from "../../types/DatabaseType";
// Function
export default function mirrorDB() {
  createRoot((dispose) => {
    const [, setTrackStore] = libraryStore.trackStore;
    const [, setReleaseStore] = libraryStore.releaseStore;
    const [, setArtistStore] = libraryStore.artistStore;
    const [, setHistoryStore] = libraryStore.historyStore;

    createEffect(async () => {
      try {
        const tracks = (await invoke("get_all_tracks")) as TrackType[];
        const releases = (await invoke("get_all_releases")) as ReleaseType[];
        const artists = (await invoke("get_all_artists")) as ArtistType[];
        const history = (await invoke("get_play_history")) as HistoryType[];

        setTrackStore(tracks);
        setReleaseStore(releases);
        setArtistStore(artists);
        setHistoryStore(history);
      } catch (err) {
        console.error("Error mirroring database:", err);
      } finally {
        console.info("Database mirrored.");
      }
    });

    return dispose;
  });
}
