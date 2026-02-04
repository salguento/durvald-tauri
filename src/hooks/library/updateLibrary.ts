import { invoke } from "@tauri-apps/api/core";
// Type
interface LibraryPaths {
  path: string;
}
// Function
export default async function updateLibrary() {
  try {
    console.log("Starting library update...");
    const libraryPaths: LibraryPaths[] = await invoke(
      "get_paths_from_library_paths",
    );
    for (const item of libraryPaths) {
      if (!item?.path || typeof item.path !== "string" || !item.path.trim()) {
        console.warn("Skipping invalid/empty path:", item);
        continue;
      }
      await invoke("update_database", { folderPath: item.path });
    }
  } catch (error) {
    console.error("Library update failed:", error);
  }
}
