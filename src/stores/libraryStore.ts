// Dependencies
import { createSignal } from "solid-js";
// Types
import {
  ReleaseType,
  TrackType,
  ArtistType,
  HistoryType,
} from "../types/DatabaseType";
// Function
export const libraryStore = {
  releaseStore: createSignal<ReleaseType[]>([]),
  trackStore: createSignal<TrackType[]>([]),
  artistStore: createSignal<ArtistType[]>([]),
  historyStore: createSignal<HistoryType[]>([]),
  initializeLibraryStore: createSignal<boolean>(false),
};
