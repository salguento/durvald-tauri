import { createSignal, For, Show } from "solid-js";
const { invoke } = await import("@tauri-apps/api/core");
const { open } = await import("@tauri-apps/plugin-dialog");

interface FileInfo {
  name: string;
  path: string;
  size: number;
  is_directory: boolean;
  extension: string;
}

export default function FolderSelector() {
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
    <div>
      <div class="max-h-svh pt-24 px-24">
        <div class="max-w-screen max-h-svh  mx-auto overflow-auto pb-32">
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
                                class={`w-3 h-3 rounded-full mr-3 ${
                                  file.is_directory
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
    </div>
  );
}
