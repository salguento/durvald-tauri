// Tauri
import { invoke } from "@tauri-apps/api/core";
// Stores
import { playerStore } from "../../stores/playerStore";
import { TrackType } from "../../types/DatabaseType";
export default async function playPrevious() {
  const [, setCurrentTrack] = playerStore.currentTrack;
  await invoke("play_previous");
  const queueTrackId: number = await invoke("get_current_song_id");
  const track: TrackType[] = await invoke("get_song_by_id", {
    songId: queueTrackId.toString(),
  });
  setCurrentTrack(track[0]);
}
