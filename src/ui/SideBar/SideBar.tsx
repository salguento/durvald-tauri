// Dependencies
import { Tabs } from "@kobalte/core/tabs";
import { Show } from "solid-js";
// Hooks
// Store
import { uiStore } from "../../stores/uiStore";
// Components
import Queue from "./QueueHistory/QueueHistory";
import Lyrics from "./Lyrics";
import Playing from "./Playing/Playing";
// Function
export default function SideBar() {
  const [sideBarTab, setSideBarTab] = uiStore.sideBarTab;
  const [showSideBar] = uiStore.showSideBar;

  return (
    <Show when={showSideBar()}>
      <div
        class={`max-w-xs w-xs min-w-xs h-full rounded-3xl z-1 overflow-hidden relative hidden sm:block`}
      >
        <div class="flex flex-col gap-4 h-full relative">
          <Tabs
            aria-label="Main navigation"
            class="text-white h-full relative overflow-hidden"
            value={sideBarTab()}
            onChange={setSideBarTab}
          >
            <Tabs.Content class="h-full" value="playing">
              <Playing />
            </Tabs.Content>
            <Tabs.Content class="h-full" value="lyrics">
              <Lyrics></Lyrics>
            </Tabs.Content>
            <Tabs.Content class="h-full relative" value="queue">
              <Queue />
            </Tabs.Content>
          </Tabs>
        </div>
      </div>
    </Show>
  );
}
