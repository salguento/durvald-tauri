// Dependencies
import "./App.css";
import { Router, Route } from "@solidjs/router";
import { onMount, createSignal, Show } from "solid-js";
import "overlayscrollbars/overlayscrollbars.css";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
// Hooks
import addToHistory from "./hooks/audio/addToHistory";
import getHistory from "./hooks/audio/getPlayHistory";
import mirrorDB from "./hooks/library/mirrorDB";
import { initVolume, useVolume } from "./hooks/audio/useVolume";
// Services
import { lastfm } from "./services/lastfm";
// Store
import { defineCurrentTrack, playerStore } from "./stores/playerStore";
import { uiStore } from "./stores/uiStore";
import { libraryStore } from "./stores/libraryStore";
import { initializePlayerStore } from "./stores/playerStore";
// Types
// Pages
import Routes from "./Routes";
import Layout from "./pages/Layout";
// Components
import { ErrorBoundary } from "solid-js";
import updateLibrary from "./hooks/library/updateLibrary";

function App() {
  initializePlayerStore();
  const [isInitialized, setIsInitialized] = createSignal(false);

  onMount(async () => {
    const [queueList, setQueueList] = playerStore.queueList;
    const [, setShowSidebar] = uiStore.showSideBar;
    const [, setInitializeLibraryStore] = libraryStore.initializeLibraryStore;
    const [trackStore] = libraryStore.trackStore;
    const [currentTrack] = playerStore.currentTrack;
    const [playbackProgress] = playerStore.playbackProgress;
    const { volume } = useVolume();

    try {
      await updateLibrary();
      await mirrorDB();
      await initVolume();
      lastfm.init();

      // ✅ Re-send "now playing" whenever Last.fm connection is restored
      // (handles network dropouts, player restarts, etc.)
      lastfm.onConnectionRestored(() => {
        const track = playerStore.currentTrack[0]();
        if (!track) return;
        const artist = (track.artist_name || "").trim();
        const title = (track.title || "").trim();
        const album = (track.release_title || "").trim() || undefined;
        if (artist && title) {
          console.log(
            "[Last.fm] Restoring now playing after reconnect:",
            artist,
            "-",
            title,
          );
          lastfm.updateNowPlaying(artist, title, album).catch((err) => {
            console.warn("[Last.fm] Now playing restore failed:", err);
          });
        }
      });

      await invoke("start_auto_play");

      // ✅ Handle player restart: if a track was already loaded before the
      // frontend started (e.g. app restart mid-session), send now playing immediately
      if (lastfm.status === "connected") {
        const track = playerStore.currentTrack[0]();
        if (track) {
          const artist = (track.artist_name || "").trim();
          const title = (track.title || "").trim();
          const album = (track.release_title || "").trim() || undefined;
          if (artist && title) {
            console.log(
              "[Last.fm] Sending now playing on startup:",
              artist,
              "-",
              title,
            );
            lastfm.updateNowPlaying(artist, title, album).catch((err) => {
              console.warn("[Last.fm] Startup now playing failed:", err);
            });
          }
        }
      }

      // ✅ SINGLE "song-changed" EVENT HANDLER
      // This is the ONLY place where queue updates happen in response to backend events
      await listen("song-changed", async () => {
        const trackId: number = await invoke("get_current_song_id");
        const trackObj = trackStore().filter((t) => t.song_id === trackId);

        if (trackObj.length > 0) {
          const newTrack = trackObj[0];

          // ✅ Add PREVIOUS track to history BEFORE updating to new track
          // currentTrack() still has the track that just finished
          addToHistory();

          // Update current track to the NEW track
          defineCurrentTrack(newTrack);

          // Remove first item from queue (song that just finished)
          setQueueList((prev) => prev.slice(1));

          // ✅ RESTART PROGRESS TRACKING for the new song
          // The backend's progress tracking loop stops when a song ends,
          // so we need to restart it for each new song
          await invoke("start_progress_tracking");

          // ✅ Update Last.fm "Now Playing" when song changes
          if (lastfm.status === "connected") {
            const artist = (newTrack.artist_name || "").trim();
            const title = (newTrack.title || "").trim();
            const album = (newTrack.release_title || "").trim() || undefined;

            lastfm.updateNowPlaying(artist, title, album).catch((err) => {
              console.warn("[Last.fm] Now playing update failed:", err);
            });

            console.log("[Last.fm] Now playing updated:", artist, "-", title);
          }
        }
      });

      getHistory();
    } catch (error) {
      console.log("Startup error:", error);
    } finally {
      if (queueList().length == 0) {
        setShowSidebar(false);
      }
      setInitializeLibraryStore(true);
      setIsInitialized(true);
    }

    const appWindow = getCurrentWindow();

    appWindow.onCloseRequested(async (event) => {
      event.preventDefault();

      await invoke("save_last_session", {
        currentSongId: currentTrack()?.song_id,
        progressSeconds: 214,
        volume: volume(),
        shuffleEnabled: false,
        repeatMode: "single",
        queueSnapshot: JSON.stringify(queueList()),
        queuePosition: 1,
        sourceContext: "not sure",
      });

      await appWindow.destroy();
    });
  });

  return (
    <ErrorBoundary
      fallback={(err) => {
        console.error("Error:", err);
        return <div>Something went wrong: {err.toString()}</div>;
      }}
    >
      <Show when={isInitialized()} fallback={<div>Loading...</div>}>
        <Router>
          <Route path="/" component={Layout}>
            <Routes />
          </Route>
        </Router>
      </Show>
    </ErrorBoundary>
  );
}

export default App;
