// Dependencies
import { createSignal } from "solid-js";
// Types
import HistoryType from "../types/PlayHistoryType";
import TrackType from "../types/Track";
// Function
export const historyStore = {
  rawHistory: createSignal<HistoryType[]>([]),
  formattedHistory: createSignal<TrackType[]>([]),
};
