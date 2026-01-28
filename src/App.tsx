// Dependencies
import "./App.css";
import { Router, Route } from "@solidjs/router";
import { onMount, createSignal, Show, createEffect } from "solid-js";
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

function App() {
  initializePlayerStore();
  const [isInitialized, setIsInitialized] = createSignal(false);
  onMount(async () => {
    const [queueList, setQueueList] = playerStore.queueList;
    const [, setShowSidebar] = uiStore.showSideBar;
    const [, setInitializeLibraryStore] = libraryStore.initializeLibraryStore;
    const [trackStore] = libraryStore.trackStore;
    try {
      await mirrorDB();
      lastfm.init();
      await invoke("start_auto_play");
      // ✅ CENTRALIZED LAST.FM "NOW PLAYING" TRACKER
      createEffect(() => {
        const [currentTrack] = playerStore.currentTrack;
        const track = currentTrack();
        

        // Only update when track changes AND we're connected
        if (track && lastfm.status === "connected") {
          // Prevent duplicate updates for same track (using song_id)
          const staticTrackId = `${track.song_id}`;
          if ((window as any)._lastFmTrackId === staticTrackId) return;
          (window as any)._lastFmTrackId = staticTrackId;

          // Trim metadata to prevent signature errors
          const artist = (track.artist_name || "").trim();
          const title = (track.title || "").trim();
          const album = (track.release_title || "").trim() || undefined;

          // Fire-and-forget update (non-blocking)
          lastfm.updateNowPlaying(artist, title, album).catch((err) => {
            console.warn("[Last.fm] Now playing update failed:", err);
          });

          console.log("[Last.fm] Now playing updated:", artist, "-", title);
        }
      });

      await listen("song-changed", async () => {
        const trackId: number = await invoke("get_current_song_id");
        addToHistory();

        const trackObj = trackStore().filter((t) => t.song_id === trackId);
        defineCurrentTrack(trackObj[0]);

        setQueueList((prev) => prev.slice(1));
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
