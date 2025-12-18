// Dependencies
import { createSignal } from "solid-js";
// Types
import { ReleaseType } from "../types/ReleaseType";
// Function
export const libraryStore = {
  releaseStore: createSignal<ReleaseType[]>([]),
};
