// Dependencies
import { invoke } from "@tauri-apps/api/core";
// Stores
import { libraryStore } from "../../../stores/libraryStore";
import { PlaylistType } from "../../../types/DatabaseType";
// Type
interface Args {
  name: string;
  cover: string | null;
  description: string;
}
// Function
export default async function createPlaylist(playlist: Args) {
  const [, setPlaylistStore] = libraryStore.playlistStore;
  try {
    const newPlaylist: PlaylistType = await invoke("create_playlist", {
      name: playlist.name,
      cover: playlist.cover,
      description: playlist.description,
    });
    setPlaylistStore((prev: PlaylistType[]) => [...prev, newPlaylist]);
  } catch (error) {
    console.error("Failed to create playlist:", error);
  }
}
