// Dependencies
import { invoke } from "@tauri-apps/api/core";
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
export default async function mirrorDB() {
  const [, setTrackStore] = libraryStore.trackStore;
  const [, setReleaseStore] = libraryStore.releaseStore;
  const [, setArtistStore] = libraryStore.artistStore;
  const [, setHistoryStore] = libraryStore.historyStore;

  try {
    const tracks: TrackType[] = await invoke("get_all_tracks");
    const releases: ReleaseType[] = await invoke("get_all_releases");
    const artists: ArtistType[] = await invoke("get_all_artists");
    const history: HistoryType[] = await invoke("get_play_history");
    setTrackStore(tracks);
    setReleaseStore(releases);
    setArtistStore(artists);
    setHistoryStore(history);
  } catch (err) {
    console.error("Error mirroring database:", err);
  } finally {
    console.info("Database mirrored.");
  }
}
