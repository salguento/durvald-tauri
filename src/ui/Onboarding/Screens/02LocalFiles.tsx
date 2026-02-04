// Dependencies
import { For } from "solid-js";
// Type
interface LocalFilesProps {
  addPath: () => Promise<void>;
  removePath: (path: string) => void;
  filePaths: string[] | undefined;
}
// Function
export default function LocalFiles(props: LocalFilesProps) {
  return (
    <div class="text-center text-zinc-50  py-4 h-full flex flex-col justify-center items-center gap-2">
      <div class="flex flex-col">
        <h3 class="text-xl font-bold">Local Files</h3>
        <p class="mt-2">Set the path to your local files:</p>
      </div>
      <div class="flex flex-col gap-1">
        <For each={props.filePaths}>
          {(path) => (
            <div class="flex gap-2 bg-zinc-950 border border-zinc-700/50 pl-4 pr-2 py-1 rounded-full items-center">
              <span class="text-xs   text-zinc-300">{path}</span>
              <button
                class="flex items-center cursor-pointer text-zinc-300 hover:text-zinc-50"
                title="Remove path"
                onClick={() => {
                  props.removePath(path);
                }}
              >
                <span class="icon-[solar--close-circle-outline] h-3 "></span>
              </button>
            </div>
          )}
        </For>
      </div>
      <div class="py-4">
        <button
          class="hover:bg-zinc-50 border border-zinc-50 px-4 py-0.5 hover:text-zinc-950 rounded-full font-medium cursor-pointer"
          onClick={() => {
            props.addPath();
          }}
        >
          Add path
        </button>
      </div>
    </div>
  );
}
