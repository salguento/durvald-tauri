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
      <div class="flex flex-col w-screen p-3 gap-3 h-screen">
        <div class="flex flex-row gap-3 h-full overflow-hidden">
          {/*MENU BAR*/}
          <div class="bg-zinc-900 xl:size-1/6 lg:size-1/4 min-h-full rounded-3xl box-border p-4">
            <div class="flex flex-col gap-6">
              <div class="flex w-full flex-row flex-wrap justify-between items-center ">
                <img
                  src="/assets/images/logotype.svg"
                  class="h-6"
                  alt="durvald logotype"
                />
                <button
                  class="hover:text-zinc-200 text-zinc-600 h-6 w-6 hover:cursor-pointer active:cursor-text"
                  title="Collapse"
                >
                  <span class="icon-[solar--square-alt-arrow-left-linear] h-6 w-6 "></span>
                </button>
              </div>
              <div class="relative w-full">
                <input
                  type="text"
                  class="rounded-lg w-full border border-transparent bg-zinc-800 focus:bg-zinc-900 hover:border-zinc-600 pl-10 placeholder:text-zinc-600 text-base h-10 font-medium text-white inline-block align-middle pt-1"
                  placeholder="Search"
                ></input>
                <span class="absolute left-2.5 top-2.5 icon-[solar--magnifer-linear] h-5 w-5 text-zinc-600 :text-white"></span>
              </div>
              <div class="flex flex-col ">
                <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
                  <span class="icon-[solar--home-angle-2-linear] h-5 w-5 "></span>
                  Home
                </button>
                <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
                  <span class="icon-[solar--bell-linear] h-5 w-5 "></span>
                  New
                </button>
                <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
                  <span class="icon-[solar--clock-circle-linear] h-5 w-5 "></span>
                  Recently Added
                </button>
              </div>
              <div class="flex flex-col">
                <div class="flex flex-row w-full rounded-lg gap-2.5  focus:bg-zinc-900  text-sm h-10 font-medium text-zinc-500 items-center">
                  <span class="icon-[solar--music-library-2-linear] h-5 w-5 "></span>
                  <p class="pt-1">Library</p>
                </div>
                <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
                  <span class="icon-[solar--microphone-2-linear] h-5 w-5 "></span>
                  Artists
                </button>
                <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
                  <span class="icon-[solar--library-linear] h-5 w-5 "></span>
                  Albuns
                </button>
                <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
                  <span class="icon-[solar--music-notes-linear] h-5 w-5 "></span>
                  Songs
                </button>
                <button class="flex flex-row w-full p-2.5 rounded-lg gap-2.5 hover:bg-zinc-800 focus:bg-zinc-900  text-base h-10 font-medium text-zinc-300 hover:cursor-pointer">
                  <span class="icon-[solar--music-note-slider-linear] h-5 w-5 "></span>
                  Genres
                </button>
              </div>
              <div class="flex flex-col">
                <div class="flex flex-row w-full rounded-lg gap-2.5  focus:bg-zinc-900  text-sm h-10 font-medium text-zinc-500 items-center">
                  <span class="icon-[solar--playlist-minimalistic-2-bold] h-5 w-5 "></span>
                  <p class="pt-1">Playlists</p>
                </div>
              </div>
            </div>
          </div>
          {/*CONTENT*/}
          <div class="bg-blue-500 size-7/12 h-full rounded-3xl grow"></div>
          {/*SIDE BAR*/}
          <div class="bg-zinc-900 size-3/12 h-full rounded-3xl p-4">
            <div class="flex flex-col gap-4">
              <div class="w-full justify-between flex" data-tauri-drag-region>
                <div class="flex flex-row gap-3">
                  <button
                    id="titlebar-minimize"
                    class="text-zinc-400 hover:text-white h-6 hover:cursor-pointer"
                    title="Settings"
                  >
                    <span class="icon-[solar--settings-linear] h-6 w-6 "></span>
                  </button>
                </div>
                <div class="flex flex-row gap-3">
                  <button
                    id="titlebar-minimize"
                    class="text-zinc-600 hover:text-white h-6"
                    title="Minimize"
                    onclick={async () => await appWindow.minimize()}
                  >
                    <span class="icon-[solar--minimize-square-linear] h-6 w-6 "></span>
                  </button>
                  <button
                    id="titlebar-maximize"
                    class="text-zinc-600 hover:text-white h-6"
                    title="Maximize"
                    onclick={async () => {
                      if (await appWindow.isMaximized()) {
                        await appWindow.unmaximize();
                      } else {
                        await appWindow.maximize();
                      }
                    }}
                  >
                    <span class="icon-[solar--maximize-square-linear] h-6 w-6 "></span>
                  </button>
                  <button
                    id="titlebar-close"
                    class="text-zinc-600 hover:text-white h-6"
                    title="Close"
                    onclick={async () => appWindow.close()}
                  >
                    <span class="icon-[solar--close-square-linear] h-6 w-6 "></span>
                  </button>
                </div>
              </div>
              <div class="flex flex-row justify-between">
                <button
                  id="titlebar-minimize"
                  title="Playing"
                  class="text-zinc-200 hover:text-white flex items-center gap-2 px-4  p-2.5 hover:bg-zinc-700 rounded-2xl hover:cursor-pointer"
                >
                  <span class="icon-[solar--play-stream-linear] h-6 w-6 "></span>
                  <p class="pt-1 hidden xl:inline">Playing</p>
                </button>
                <button
                  id="titlebar-minimize"
                  class="text-zinc-200 hover:text-white flex items-center gap-2 px-4 py-2.5 hover:bg-zinc-700 rounded-2xl hover:cursor-pointer"
                  title="Lyrics"
                >
                  <span class="icon-[solar--document-add-linear] h-6 w-6 "></span>
                  <p class="pt-1 hidden xl:inline-block">Lyrics</p>
                </button>
                <button
                  id="titlebar-minimize"
                  class="text-zinc-200 hover:text-white flex items-center gap-2 px-4 py-2.5 hover:bg-zinc-700 rounded-2xl hover:cursor-pointer"
                  title="Queue"
                >
                  <span class="icon-[solar--playlist-linear] h-6 w-6 "></span>
                  <p class="pt-1 hidden xl:inline-block">Queue</p>
                </button>
              </div>
              <div>
                <div class="flex flex-col gap-3">
                  <img
                    src="/assets/images/britpop-agcook.jpg"
                    class="rounded-2xl w-full"
                  />
                  <div class="flex flex-row justify-between w-full items-center">
                    <span class="text-base lg:text-xl text-white font-semibold truncate hover:underline hover:cursor-pointer">
                      Britpop
                    </span>
                    <div class="flex flex-row gap-4">
                      <button
                        class="flex flex-row rounded-lg text-base  font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                        title="favorite"
                      >
                        <span class="icon-[solar--heart-linear] h-5 w-5 "></span>
                      </button>
                      <button
                        class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                        title="Add"
                      >
                        <span class="icon-[solar--add-circle-linear] h-5 w-5 "></span>
                      </button>
                      <button
                        class="flex flex-row rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:cursor-pointer"
                        title="Options"
                      >
                        <span class="icon-[solar--menu-dots-bold] h-5 w-5 "></span>
                      </button>
                    </div>
                  </div>
                  <div class="flex flex-row">
                    <span class="text-sm lg:text-base  text-zinc-500 hover:cursor-pointer hover:text-white hover:underline">
                      Genre
                    </span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs text-zinc-600 font-semibold">
                      23 February 2024
                    </span>
                    <span class="text-xs text-zinc-600 font-semibold">
                      24 songs, 1 hour and 40 minutes
                    </span>
                    <span class="text-xs text-zinc-600 font-semibold">
                      New Alias
                    </span>
                  </div>
                  <div class="flex flex-row p-4 bg-zinc-800 rounded-2xl items-center gap-3 hover:cursor-pointer">
                    <div class="w-fit">
                      <img
                        src="/assets/images/ag-cook.jpg"
                        class="h-10 min-w-10 xl:h-16 xl:min-w-16 rounded-full"
                      ></img>
                    </div>
                    <div class="flex flex-row justify-between w-full">
                      <span class="text-base pt-1 lg:text-xl font-semibold text-zinc-400 truncate hover:underline hover:text-white hover:cursor-pointer">
                        AG Cook
                      </span>
                      <button
                        class="flex flex-row  rounded-lg text-base  font-medium text-zinc-400 hover:text-white hover:cursor-pointer items-center"
                        title="Follow"
                      >
                        <span class="icon-[solar--add-square-linear] h-6 w-6 "></span>
                      </button>
                    </div>
                  </div>
                  <div class=" bg-zinc-800 p-4 rounded-2xl relative max-h-32 overflow-auto">
                    <div class="flex flex-col gap-3">
                      <span class="text-sm text-zinc-400">
                        Britpop is the third album by British singer,
                        songwriter, and producer A. G. Cook. This 100-minute
                        album is split into three discs: Past, Present, and
                        Future.
                      </span>
                      <span class="text-sm text-zinc-400">
                        — Past (tracks 1 to 8): This disc features fast-paced,
                        playful electronic sounds and vocal chops. The tracks
                        reference the mindset and idealism of a certain era, but
                        the sound is more advanced, reflecting the work A.G.
                        Cook has done since then. It includes the album’s lead
                        single Silver Thread Golden Needle and the title track
                        Britpop.
                      </span>
                      <span class="text-sm text-zinc-400">
                        — Present (tracks 9 to 16): This is the most lyrical
                        disc, dedicated to a more traditional approach to
                        songwriting. It features the use of guitar and lo-fi
                        vocal treatment. Notably, it includes Without, an ode to
                        the late producer SOPHIE, one of Cook’s closest friends
                        and collaborators.
                      </span>
                      <span class="text-sm text-zinc-400">
                        — Future (tracks 17 to 24): This disc showcases
                        avant-garde and chaotic sound designs. As A. G. Cook
                        said, Future includes all the tracks that almost make
                        him feel uncomfortable, where he questions the tempo or
                        genre. It includes the album’s third single and oldest
                        song, Soulbreaker.
                      </span>
                      <span class="text-sm text-zinc-400">
                        This album was released via New Alias, A. G. Cook’s new
                        label, founded after PC Music’s wind down.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-emerald-500 w-full h-24 rounded-3xl"></div>
      </div>
    </main>
  );
}

export default App;
