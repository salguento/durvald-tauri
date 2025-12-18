// Dependencies
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { Tabs } from "@kobalte/core/tabs";
import { createSignal, For } from "solid-js";
// Store
import { playerStore } from "../../../stores/playerStore";
// Types
// Components
import QueueTrack from "./QueueTrack";
import TrackType from "../../../types/Track";
export default function Queue() {
  const [queueList] = playerStore.queueList;
  const [queueTab, setQueueTab] = createSignal<string>("queue");

  const handleTab = (value: string) => {
    if (queueTab() != value) {
      setQueueTab(value);
    }
  };
  return (
    <Tabs
      aria-label="Queue navigation"
      class="max-w-2xs overflow-hidden relative h-full"
    >
      <Tabs.List class="w-full  text-center absolute top-0 z-1 border-b bg-zinc-900/50  border-zinc-700/50  ">
        <div class=" h-full  flex justify-between px-2.5 py-2.5 gap-2 backdrop-blur-xl  w-full">
          <Tabs.Trigger
            class={`w-full ${queueTab() == "queue" ? "bg-white text-zinc-950" : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800"} rounded-xl h-8 cursor-pointer font-medium text-sm`}
            value="queue"
            onClick={() => handleTab("queue")}
          >
            Queue
          </Tabs.Trigger>
          <Tabs.Trigger
            class={`w-full ${queueTab() == "history" ? "bg-white text-zinc-950" : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800"} rounded-xl h-8 cursor-pointer font-medium text-sm`}
            value="history"
            onClick={() => handleTab("history")}
          >
            History
          </Tabs.Trigger>
        </div>
      </Tabs.List>
      <Tabs.Content
        class="w-full relative h-full overflow-hidden"
        value="queue"
      >
        <OverlayScrollbarsComponent
          element="div"
          options={{ scrollbars: { autoHide: "scroll" } }}
          events={{
            scroll: () => {
              /* ... */
            },
          }}
          defer
          class="overflow-y-hidden max-w-2xs flex flex-col gap-1 h-full pt-15 pb-5 px-1.5"
        >
          <For each={queueList()}>
            {(item: TrackType) => <QueueTrack item={item} />}
          </For>
        </OverlayScrollbarsComponent>
      </Tabs.Content>
      <Tabs.Content class="w-full relative h-full" value="history">
        <OverlayScrollbarsComponent
          element="div"
          options={{ scrollbars: { autoHide: "scroll" } }}
          events={{
            scroll: () => {
              /* ... */
            },
          }}
          defer
          class="overflow-y-hidden max-w-2xs "
        >
          <For each={queueList()}>
            {(item: TrackType) => <QueueTrack item={item} />}
          </For>
        </OverlayScrollbarsComponent>
      </Tabs.Content>
    </Tabs>
  );
}
