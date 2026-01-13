// Tauri
// Dependencies
import { invoke } from "@tauri-apps/api/core";
// Function
export default async function favoriteSong(id: number) {
  try {
    await invoke("favorite_song", { songId: id });
  } catch (error) {
    console.error("Failed to play audio:", error);
  }
}
