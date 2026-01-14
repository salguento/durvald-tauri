// Dependencies
import { createSignal } from "solid-js";
// Types
import { ReleaseType } from "../types/ReleaseType";
import TrackType from "../types/Track";
import ArtistType from "../types/ArtistType";
import { HistoryType } from "../types/PlayHistoryType";
// Function
export const libraryStore = {
  releaseStore: createSignal<ReleaseType[]>([]),
  trackStore: createSignal<TrackType[]>([]),
  artistStore: createSignal<ArtistType[]>([]),
  historyStore: createSignal<HistoryType[]>([]),
  initializeLibraryStore: createSignal<boolean>(false),
};
