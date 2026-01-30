// Tauri
import { invoke } from "@tauri-apps/api/core";
// Types
import { TrackType } from "../../types/DatabaseType";
// Store
import { defineCurrentTrack, playerStore } from "../../stores/playerStore";
import { libraryStore } from "../../stores/libraryStore";
// Services
import { lastfm } from "../../services/lastfm";

export default async function playBack(track: TrackType) {
  const [, setPlayBackState] = playerStore.playBackState;
  const [, setPlaybackProgress] = playerStore.playbackProgress;
  const [, setQueueList] = playerStore.queueList;
  const [trackStore] = libraryStore.trackStore;

  try {
    // ✅ RESET PROGRESS BAR before starting new playback
    setPlaybackProgress({
      position: 0,
      duration: track.duration || null,
      percentage: 0,
    });

    // Start playback of the first track
    await invoke("play_file", { path: track.file_path });
    await invoke("start_progress_tracking");
    await invoke("clear_queue");
    setQueueList([]);

    // ✅ No need to setup progress listener here - playerStore already handles it globally

    // Build queue from release tracks (all tracks AFTER the current one)
    const trackList: TrackType[] = trackStore()
      .filter((t) => t.release_id === track.release_id)
      .sort((a, b) => a.track_number - b.track_number);

    const newQueueItems: TrackType[] = [];

    for (const item of trackList) {
      // Skip tracks up to and including the current track
      if (item.track_number <= track.track_number) continue;

      // Add remaining tracks to queue
      await invoke("add_to_queue", {
        songId: item.song_id,
        path: item.file_path,
      });
      newQueueItems.push(item);
    }

    // Update frontend queue state
    setQueueList(newQueueItems);

    console.log(
      `[playBack] Started playing "${track.title}" with ${newQueueItems.length} tracks queued`,
    );

    // ✅ Update Last.fm "Now Playing" for the FIRST track
    if (lastfm.status === "connected") {
      const artist = (track.artist_name || "").trim();
      const title = (track.title || "").trim();
      const album = (track.release_title || "").trim() || undefined;

      lastfm.updateNowPlaying(artist, title, album).catch((err) => {
        console.warn("[Last.fm] Now playing update failed:", err);
      });

      console.log("[Last.fm] Now playing updated:", artist, "-", title);
    }
  } catch (error) {
    console.error("Failed to play audio:", error);
  } finally {
    // Set the current track
    defineCurrentTrack(track);
    setPlayBackState(await invoke("get_playback_state"));
  }
}
