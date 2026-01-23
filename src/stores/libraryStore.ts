// Dependencies
import { createSignal } from "solid-js";
// Types
import {
  ReleaseType,
  TrackType,
  ArtistType,
  HistoryType,
  PlaylistType,
  PlaylistSongsType,
} from "../types/DatabaseType";
// Function
export const libraryStore = {
  initializeLibraryStore: createSignal<boolean>(false),
  releaseStore: createSignal<ReleaseType[]>([]),
  trackStore: createSignal<TrackType[]>([]),
  artistStore: createSignal<ArtistType[]>([]),
  historyStore: createSignal<HistoryType[]>([]),
  playlistStore: createSignal<PlaylistType[]>([]),
  playlistSongStore: createSignal<PlaylistSongsType[]>([]),
  showOnboarding: createSignal<boolean>(true),
};
