// Dependencies
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { Tabs } from "@kobalte/core/tabs";
import { createSignal, For } from "solid-js";
// Store
import { playerStore } from "../../../stores/playerStore";
// Types
import { QueueItemType } from "../../../types/QueueItemType";
// Components
import QueueTrack from "./QueueTrack";
export default function Queue() {
  const [queueList, setQueueList] = playerStore.queueList;
  const [queueTab, setQueueTab] = createSignal<string>("queue");
  const [isOpen, setIsOpen] = createSignal<boolean>(false);

  const handleTab = (value: string) => {
    if (queueTab() != value) {
      setQueueTab(value);
    }
  };
  return (
    <Tabs aria-label="Queue navigation" class="max-w-2xs overflow-hidden">
      <Tabs.List class="w-full flex justify-between text-center gap-2 px-3 py-3 relative ">
        <Tabs.Trigger
          class={`w-full ${queueTab() == "queue" ? "bg-white text-zinc-950" : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800"} rounded-lg h-8 cursor-pointer font-medium text-sm`}
          value="queue"
          onClick={() => handleTab("queue")}
        >
          Queue
        </Tabs.Trigger>
        <Tabs.Trigger
          class={`w-full ${queueTab() == "history" ? "bg-white text-zinc-950" : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800"} rounded-lg h-8 cursor-pointer font-medium text-sm`}
          value="history"
          onClick={() => handleTab("history")}
        >
          History
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content class="w-full relative px-1" value="queue">
        <OverlayScrollbarsComponent
          element="div"
          options={{ scrollbars: { autoHide: "scroll" } }}
          events={{
            scroll: () => {
              /* ... */
            },
          }}
          defer
          class="overflow-y-hidden max-w-2xs flex flex-col gap-1 "
        >
          <For each={queueList()}>
            {(item: QueueItemType) => <QueueTrack item={item} />}
          </For>
        </OverlayScrollbarsComponent>
      </Tabs.Content>
      <Tabs.Content class="w-full relative px-1" value="history">
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
            {(item: QueueItemType) => <QueueTrack item={item} />}
          </For>
        </OverlayScrollbarsComponent>
      </Tabs.Content>
    </Tabs>
  );
}
