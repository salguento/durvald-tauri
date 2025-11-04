import { getCurrentWindow } from "@tauri-apps/api/window";
import { createSignal, For, Show } from "solid-js";
const { invoke } = await import("@tauri-apps/api/core");
const { open } = await import("@tauri-apps/plugin-dialog");
import "./App.css";

interface FileInfo {
  name: string;
  path: string;
  size: number;
  is_directory: boolean;
  extension: string;
}

function App() {
  // when using `"withGlobalTauri": true`, you may use
  // const { getCurrentWindow } = window.__TAURI__.window;
  // Title Bar
  const appWindow = getCurrentWindow();

  // File System
  const [selectedFolder, setSelectedFolder] = createSignal<string>("");
  const [files, setFiles] = createSignal<FileInfo[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const [showPopup, setShowPopup] = createSignal(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const selectFolder = async () => {
    try {
      setError("");
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select folder to scan",
      });

      if (selected) {
        setSelectedFolder(selected);
        setShowPopup(false);
        await scanFolder(selected);
      }
    } catch (err) {
      setError(`Error selecting folder: ${err}`);
    }
  };

  const scanFolder = async (folderPath: string) => {
    try {
      setLoading(true);
      setError("");
      const result: FileInfo[] = await invoke("scan_folder", { folderPath });
      setFiles(result);
    } catch (err) {
      setError(`Error scanning folder: ${err}`);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const openPopup = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setError("");
  };
  return (
    <main class=" w-screen h-screen min-w-screen  bg-white dark:bg-black overflow-hidden">
      {/* <div>
      <div class="titlebar">
        <div data-tauri-drag-region></div>
        <div class="controls">
          <button
            id="titlebar-minimize"
            title="minimize"
            onclick={async () => await appWindow.minimize()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path fill="currentColor" d="M19 13H5v-2h14z" />
            </svg>
          </button>
          <button
            id="titlebar-maximize"
            title="maximize"
            onclick={async () => {
              if (await appWindow.isMaximized()) {
                await appWindow.unmaximize();
              } else {
                await appWindow.maximize();
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path fill="currentColor" d="M4 4h16v16H4zm2 4v10h12V8z" />
            </svg>
          </button>
          <button
            id="titlebar-close"
            title="close"
            onclick={async () => appWindow.close()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M13.46 12L19 17.54V19h-1.46L12 13.46L6.46 19H5v-1.46L10.54 12L5 6.46V5h1.46L12 10.54L17.54 5H19v1.46z"
              />
            </svg>
          </button>
        </div>
      </div>
        <div class="max-h-svh pt-24 px-24">
          <div class="max-w-screen max-h-svh  mx-auto overflow-auto pb-32">
            <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">Folder Scanner</h1>

            <button
              onClick={openPopup}
              class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200"
            >
              Select Folder to Scan
            </button>

            <Show when={selectedFolder()}>
              <div class="mt-4 p-4 bg-white rounded-lg shadow">
                <p class="text-sm text-gray-600">Selected folder:</p>
                <p class="font-mono text-sm break-all">{selectedFolder()}</p>
              </div>
            </Show>

            <Show when={showPopup()}>
              <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <h2 class="text-xl font-semibold text-gray-800 mb-4">
                    Select Folder to Scan
                  </h2>

                  <p class="text-gray-600 mb-6">
                    Choose a folder to scan for all files and subdirectories.
                  </p>

                  <div class="flex gap-3">
                    <button
                      onClick={selectFolder}
                      class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                    >
                      Browse Folder
                    </button>

                    <button
                      onClick={closePopup}
                      class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>

                  <Show when={error()}>
                    <div class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {error()}
                    </div>
                  </Show>
                </div>
              </div>
            </Show>

            <Show when={loading()}>
              <div class="mt-8 flex items-center justify-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span class="ml-3 text-gray-600">Scanning folder...</span>
              </div>
            </Show>

            <Show when={!loading() && files().length > 0}>
              <div class="mt-8">
                <div class="flex justify-between items-center mb-4">
                  <h2 class="text-2xl font-semibold text-gray-800">
                    Files ({files().length})
                  </h2>
                </div>

                <div class="bg-white rounded-lg shadow overflow-hidden">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Path
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <For each={files()}>
                        {(file) => (
                          <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="flex items-center">
                                <div
                                  class={`w-3 h-3 rounded-full mr-3 ${file.is_directory
                                      ? "bg-yellow-400"
                                      : "bg-blue-400"
                                    }`}
                                ></div>
                                <div class="text-sm font-medium text-gray-900">
                                  {file.name}
                                </div>
                              </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <span
                                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                                classList={{
                                  "bg-yellow-100 text-yellow-800":
                                    file.is_directory,
                                  "bg-blue-100 text-blue-800": !file.is_directory,
                                }}
                              >
                                {file.is_directory
                                  ? "Folder"
                                  : file.extension || "File"}
                              </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {file.is_directory
                                ? "-"
                                : formatFileSize(file.size)}
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500 break-all">
                              {file.path}
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </div>
            </Show>

            <Show when={!loading() && files().length === 0 && selectedFolder()}>
              <div class="mt-8 text-center py-12 bg-white rounded-lg shadow">
                <p class="text-gray-500 text-lg">
                  No files found in the selected folder.
                </p>
              </div>
            </Show>
          </div>
        </div>
        </div> */}
      <div class="flex flex-col w-screen p-4 gap-4 h-screen">
        <div class="flex flex-row gap-4 h-full overflow-hidden">
          <div class="bg-zinc-900 xl:size-1/6 lg:size-1/4 min-h-full rounded-3xl box-border p-4">
            <div class="flex flex-col gap-6">
              <div class="flex w-full flex-row pl-2 flex-wrap justify-between items-center ">
                <img
                  src="/assets/images/logotype.svg"
                  class="h-6"
                  alt="durvald logotype"
                />
                <button class="hover:text-zinc-200 text-zinc-600 h-6 w-6 hover:cursor-pointer active:cursor-text">
                  <span class="icon-[solar--square-alt-arrow-left-linear] h-6 w-6 "></span>
                </button>
              </div>
              <div class="relative">
                <input
                  type="text"
                  class="rounded-lg w-full border border-transparent bg-zinc-800 focus:bg-zinc-900 hover:border-zinc-600 pl-10 placeholder:text-zinc-600 text-base h-10 font-medium text-white inline-block align-middle pt-0.5"
                  placeholder="Search"
                ></input>
                <span class="absolute left-2.5 top-2.5 icon-[solar--magnifer-linear] h-5 w-5 text-zinc-600 :text-white"></span>
              </div>
              <div class="flex flex-col ">
                <button class="flex flex-row w-full px-2.5 pt-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
                  <span class="icon-[solar--home-angle-2-linear] h-5 w-5 "></span>
                  Home
                </button>
                <button class="flex flex-row w-full px-2.5 pt-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
                  <span class="icon-[solar--bell-linear] h-5 w-5 "></span>
                  New
                </button>
                <button class="flex flex-row w-full px-2.5 pt-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
                  <span class="icon-[solar--clock-circle-linear] h-5 w-5 "></span>
                  Recently Added
                </button>
              </div>
              <div class="flex flex-col">
                <div class="flex flex-row w-full  pt-2.5 rounded-lg gap-2.5  focus:bg-zinc-900  text-sm h-10 font-medium text-zinc-500">
                  <span class="icon-[solar--music-library-2-linear] h-5 w-5 "></span>
                  Library
                </div>
                <button class="flex flex-row w-full px-2.5 pt-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
                  <span class="icon-[solar--microphone-2-linear] h-5 w-5 "></span>
                  Artists
                </button>
                <button class="flex flex-row w-full px-2.5 pt-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
                  <span class="icon-[solar--library-linear] h-5 w-5 "></span>
                  Albuns
                </button>
                <button class="flex flex-row w-full px-2.5 pt-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
                  <span class="icon-[solar--music-notes-linear] h-5 w-5 "></span>
                  Songs
                </button>
                <button class="flex flex-row w-full px-2.5 pt-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
                  <span class="icon-[solar--music-note-slider-linear] h-5 w-5 "></span>
                  Genres
                </button>
              </div>
              <div class="flex flex-col">
                <div class="flex flex-row w-full  pt-2.5 rounded-lg gap-2.5  focus:bg-zinc-900  text-sm h-10 font-medium text-zinc-500">
                  <span class="icon-[solar--playlist-minimalistic-2-bold] h-5 w-5 "></span>
                  Playlists
                </div>
              </div>
            </div>
          </div>
          <div class="bg-blue-500 size-7/12 h-full rounded-3xl grow"></div>
          <div class="bg-amber-500 size-3/12  h-full rounded-3xl"></div>
        </div>
        <div class="bg-emerald-500 w-full h-24 rounded-3xl"></div>
      </div>
    </main>
  );
}

export default App;
