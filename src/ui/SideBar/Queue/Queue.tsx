// Dependencies
import { OverlayScrollbarsComponent } from "overlayscrollbars-solid";
import { Tabs } from "@kobalte/core/tabs";
import { createSignal, For, Show } from "solid-js";
// Hooks
import clearQueue from "../../../hooks/audio/clearQueue";
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
          class="overflow-y-hidden max-w-2xs flex flex-col gap-1 h-full pt-13 pb-5 px-1.5"
        >
          <Show
            when={queueList().length > 0}
            fallback={
              <div class="flex justify-center px-1.5 py-3.5">
                <span class="text-zinc-500 text-sm text-center">
                  There's no song in the queue
                </span>
              </div>
            }
          >
            <div class="text-zinc-300 flex justify-between items-center px-1.5 border-b border-zinc-700/50 py-2.5">
              <button
                class="hover:text-white p-1 rounded-full h-7 w-7 cursor-pointer hover:bg-zinc-700/50"
                title="Autoplay"
              >
                <span class="icon-[solar--infinity-linear] h-5 w-5"></span>
              </button>
              <button
                class="hover:text-white cursor-pointer h-7 hover:bg-zinc-700/50 px-2 py-.5 flex items-center rounded-lg"
                title="Clear queue"
                onClick={() => {
                  clearQueue();
                }}
              >
                <span class="text-xs ">Clear</span>
              </button>
            </div>
            <For each={queueList()}>
              {(item: TrackType) => <QueueTrack item={item} />}
            </For>
          </Show>
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
