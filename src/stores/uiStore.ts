// Dependencies
import { createSignal } from "solid-js";
// States
export const uiStore = {
  menuCollapsed: createSignal<boolean>(false),
  showSideBar: createSignal<boolean>(true),
};
