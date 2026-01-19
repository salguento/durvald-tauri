// Dependencies
import { createSignal } from "solid-js";
// Types
interface NavigationState {
  depth: number;
  length: number;
}
// States
export const uiStore = {
  menuCollapsed: createSignal<boolean>(false),
  showSideBar: createSignal<boolean>(true),
  sideBarTab: createSignal<string>("queue"),
  navigationHistory: createSignal<NavigationState>({
    depth: history.state?._depth ?? 0,
    length: history.length,
  }),
  expandLibrary: createSignal<boolean>(true),
  expandPlaylist: createSignal<boolean>(true),
  openDialog: createSignal<boolean>(false),
};
