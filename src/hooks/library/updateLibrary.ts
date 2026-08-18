import { invoke } from "@tauri-apps/api/core";

// Kicks off a full library scan in the background (backend > start_library_scan).
// Returns immediately; progress is reported via "library-scan-progress" events
// and completion via "library-scan-done", so this never blocks boot.
export default async function updateLibrary(): Promise<void> {
  try {
    await invoke("start_library_scan");
  } catch (error) {
    console.error("Library update failed:", error);
  }
}
