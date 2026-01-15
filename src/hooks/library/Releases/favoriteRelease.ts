// Dependencies
import { invoke } from "@tauri-apps/api/core";
// Stores
import { libraryStore } from "../../../stores/libraryStore";
// Function
export default async function favoriteRelease(id: number) {
  const [, setReleaseStore] = libraryStore.releaseStore;
  try {
    await invoke("favorite_release", { releaseId: id });
    setReleaseStore((prev) =>
      prev.map((release) =>
        release.release_id === id
          ? { ...release, is_favorite: !release.is_favorite }
          : release,
      ),
    );
  } catch (error) {
    console.error("Failed to favorite release:", error);
  }
}
