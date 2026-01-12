// Dependencies
import "./App.css";
import { Router, Route } from "@solidjs/router";
import { onMount } from "solid-js";
import "overlayscrollbars/overlayscrollbars.css";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
// Hooks
import { playerStore } from "./stores/playerStore";
import { uiStore } from "./stores/uiStore";
import { libraryStore } from "./stores/libraryStore";
// Store
import { initializePlayerStore } from "./stores/playerStore";
// Types
import { QueueItemType } from "./types/QueueItemType";
import TrackType from "./types/Track";
// Pages
import Routes from "./Routes";
import Layout from "./pages/Layout";
// Components
import { ErrorBoundary } from "solid-js";
import addToHistory from "./hooks/audio/addToHistory";

function App() {
  initializePlayerStore();
  onMount(async () => {
    const [queueList, setQueueList] = playerStore.queueList;
    const [, setCurrentTrack] = playerStore.currentTrack;
    const [, setShowSidebar] = uiStore.showSideBar;
    const [, setReleaseStore] = libraryStore.releaseStore;
    await invoke("start_auto_play");
    await listen("song-changed", async () => {
      const trackId: number = await invoke("get_current_song_id");
      const trackObj: TrackType[] = await invoke("get_song_by_id", {
        songId: trackId.toString(),
      });
      addToHistory();
      setCurrentTrack(trackObj[0]);
      setQueueList((prev) => prev.slice(1));
    });
    try {
      setReleaseStore(await invoke("get_releases"));
      await invoke("load_queue_from_db");
      const queue: QueueItemType[] = await invoke("get_queue");

      setQueueList([]);

      const trackPromises = queue.map(async (i: QueueItemType, index) => {
        const trackItem: TrackType[] = await invoke("get_song_by_id", {
          songId: i[0].toString(),
        });
        return { track: trackItem[0], isFirst: index === 0 };
      });

      const results = await Promise.all(trackPromises);

      const tracks = results.map((r) => r.track);
      setQueueList(tracks);

      if (results.length > 0 && results[0].isFirst) {
        setCurrentTrack(results[0].track);
      }
    } catch (error) {
      console.log("Startup error:", error);
    } finally {
      if (queueList().length == 0) {
        setShowSidebar(false);
      }
    }
  });
  return (
    <ErrorBoundary
      fallback={(err) => {
        console.error("Error:", err);
        return <div>Something went wrong: {err.toString()}</div>;
      }}
    >
      <Router>
        <Route path="/" component={Layout}>
          <Routes />
        </Route>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
