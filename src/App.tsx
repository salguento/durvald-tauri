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
