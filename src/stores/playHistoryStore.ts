// Dependencies
import { createSignal } from "solid-js";
// Types
import { HistoryType, FormattedHistoryType } from "../types/PlayHistoryType";
// Function
export const historyStore = {
  rawHistory: createSignal<HistoryType[]>([]),
  formattedHistory: createSignal<FormattedHistoryType[]>([]),
};
