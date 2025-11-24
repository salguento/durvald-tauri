import { createSignal, For, Show, onMount } from "solid-js";
import { A } from "@solidjs/router";

const { invoke } = await import("@tauri-apps/api/core");
const { open } = await import("@tauri-apps/plugin-dialog");

interface FileInfo {
  name: string;
  path: string;
  size: number;
  is_directory: boolean;
  extension: string;
  metadata: Metadata;
  img: string | null;
}

interface Metadata {
  title: string;
  artist: string;
  release: string;
  genre: string;
  year: number;
  track: number;
  disc: string | null;
  duration: number;
  bitrate: number;
  sample_rate: number;
  channels: number;
  cover_image_base64: string;
  all_fields: [string];
}

interface LibraryPaths {
  path: string;
}
export default function FolderSelector() {
  onMount(async () => {
    try {
      console.log("Starting app initialization...");
      // Call your Tauri backend command
      const libraryPaths: LibraryPaths[] = await invoke(
        "get_paths_from_library_paths"
      );
      await invoke("update_database", { folderPath: libraryPaths[0].path });
      // scanFolder(libraryPaths[0].path);
    } catch (error) {
      console.error("Startup error:", error);
    }
  });
  // File System
  const [selectedFolder, setSelectedFolder] = createSignal<string>("");
  const [files, setFiles] = createSignal<FileInfo[]>([]);
  const [groupedFiles, setGroupedFiles] = createSignal<
    { release: string; files: FileInfo[] }[]
  >([]);
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

  const groupByAlbum = async (array: FileInfo[]) => {
    const grouped = array.reduce((groups: Record<string, FileInfo[]>, item) => {
      const album = item.metadata.release;
      (groups[album] = groups[album] || []).push(item);
      return groups;
    }, {});

    // Convert to array of groups
    return Object.entries(grouped).map(([release, files]) => ({
      release,
      files,
    }));
  };

  const scanFolder = async (folderPath: string) => {
    try {
      setLoading(true);
      setError("");
      const result: FileInfo[] = await invoke("scan_folder", { folderPath });
      const filesWithMetadata = await Promise.all(
        result.map(async (i) => {
          const metadata: Metadata = await invoke("get_audio_metadata", {
            path: i.path,
          });
          return {
            ...i,
            metadata,
          };
        })
      );
      setFiles(filesWithMetadata);
      const grouped = await groupByAlbum(filesWithMetadata);
      setGroupedFiles(grouped);
      console.log(files());

      await invoke("add_path_to_library_paths", { folderPath });
      // await invoke("add_local_files_to_library", {
      //   metadata: files(),
      // });
    } catch (err) {
      console.error("Full error:", err);
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
    <div class="">
      <div class="max-h-svh p-8 pt-8">
        <div class="max-w-full max-h-svh  mx-auto  pb-32">
          <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">
            Folder Scanner
          </h1>

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
            <div class="absolute inset-0 z-500">
              <div class="w-full h-full bg-zinc-900/50 backdrop-blur-3xl flex items-center justify-center p-4 z-100">
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
            </div>
          </Show>

          <Show when={loading()}>
            <div class="mt-8 flex items-center justify-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span class="ml-3 text-gray-600">Scanning folder...</span>
            </div>
          </Show>

          <Show when={!loading() && files().length > 0}>
            <div class="mt-8 pb-10 flex flex-col gap-4">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-semibold text-zinc-300">
                  Files ({files().length})
                </h2>
              </div>
              <For each={groupedFiles()}>
                {(groupedFiles) => (
                  <div class="flex flex-col gap-2">
                    <div>
                      <img
                        src={groupedFiles.files[0].metadata.cover_image_base64}
                        alt=""
                        class="min-h-40 min-w-40 max-h-40 max-w-40 rounded-xl"
                      />
                    </div>
                    <div class="flex flex-col">
                      <A href="/album/13" class="h-4">
                        <span class="text-sm text-zinc-300 font-medium hover:underline hover:text-white hover:cursor-pointer">
                          {groupedFiles.release}
                        </span>
                      </A>
                      <A href="/artist/13" class="h-4">
                        <span class="text-xs text-zinc-500 hover:underline hover:text-white hover:cursor-pointer">
                          {groupedFiles.files[0].metadata.artist}
                        </span>
                      </A>
                    </div>
                  </div>
                )}
              </For>

              <div class="bg-white rounded-lg shadow overflow-hidden">
                <table class="w-full divide-y divide-gray-200">
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
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <For each={files()}>
                      {(file) => (
                        <tr class="hover:bg-gray-50">
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                              <div
                                class={`w-3 h-3 rounded-full mr-3 ${
                                  file.is_directory
                                    ? "bg-yellow-400"
                                    : "bg-blue-400"
                                }`}
                              ></div>
                              <div class="text-sm font-medium text-gray-900">
                                {file.metadata.title}
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
    </div>
  );
}
