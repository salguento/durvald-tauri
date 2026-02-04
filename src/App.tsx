// Dependencies
import "./App.css";
import { Router, Route } from "@solidjs/router";
import { onMount, createSignal, Show } from "solid-js";
import "overlayscrollbars/overlayscrollbars.css";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
// Hooks
import addToHistory from "./hooks/audio/addToHistory";
import getHistory from "./hooks/audio/getPlayHistory";
import mirrorDB from "./hooks/library/mirrorDB";
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

    try {
      await updateLibrary();
      await mirrorDB();
      lastfm.init();
      await invoke("start_auto_play");

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
