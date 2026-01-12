import { createSignal } from "solid-js";

export const searchStore = {
  searchInput: createSignal<string>(""),
};
