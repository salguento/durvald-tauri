// Tauri
import { invoke } from "@tauri-apps/api/core";

/**
 * ✅ SIMPLIFIED playNext function
 * 
 * This function ONLY tells the backend to skip to next track.
 * The backend will:
 * 1. Play the next song
 * 2. Emit "song-changed" event
 * 3. Frontend's "song-changed" listener handles all state updates
 * 
 * DO NOT manipulate currentTrack or queueList here - that causes double updates
 */
export default async function playNext() {
  await invoke("play_next");
  console.log("[playNext] Requested next track from backend");
}
