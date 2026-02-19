import { invoke } from "@tauri-apps/api/core";
import { createStore } from "solid-js/store";

// ===== STORE =====
const [state, setState] = createStore<{
  status: "disconnected" | "connected";
  username: string | null; // ✅ ADDED
}>({
  status: "disconnected",
  username: null, // ✅ INITIALIZED
});

// ===== CONNECTION RESTORED CALLBACKS =====
// External code (e.g. App.tsx) can register a callback here to re-send
// "now playing" status whenever the Last.fm connection is restored after
// being lost (network dropout, player restart, etc.)
let _onConnectionRestoredCallback: (() => void) | null = null;

// ===== PUBLIC API =====
export const lastfm = {
  // ✅ ADDED GETTERS
  get status() {
    return state.status;
  },
  get username() {
    return state.username;
  },

  // Register a callback to be called when Last.fm connection is restored.
  // App.tsx uses this to re-send "now playing" for the current track.
  onConnectionRestored: (callback: () => void) => {
    _onConnectionRestoredCallback = callback;
  },

  // Initialize connection status on app start
  init: () => {
    lastfm.refreshStatus(); // Run immediately
    setInterval(() => lastfm.refreshStatus(), 30000); // Refresh every 30s
  },

  // DEV-ONLY: Store credentials
  initialize: async (apiKey: string, apiSecret: string): Promise<boolean> => {
    try {
      await invoke("initialize_lastfm", { apiKey, apiSecret });
      return true;
    } catch (err) {
      console.error("[Last.fm] Init failed:", err);
      return false;
    }
  },

  verifyCredentials: async (): Promise<string> => {
    try {
      const result = await invoke<string>("verify_credentials");
      return result;
    } catch (err) {
      return (
        "Verification failed: " +
        (err instanceof Error ? err.message : "Unknown error")
      );
    }
  },

  // Open browser to Last.fm authorization page
  openAuthUrl: async (authUrl: string): Promise<boolean> => {
    try {
      await invoke("plugin:shell|open", { path: authUrl });
      return true;
    } catch (err) {
      console.error("[Last.fm] Browser open failed:", err);
      return false;
    }
  },

  // Step 1: Get auth token + open browser
  startAuth: async (): Promise<string | null> => {
    try {
      const { token, authUrl } = await invoke<{
        token: string;
        authUrl: string;
      }>("get_auth_token");
      console.log("[Last.fm] Auth URL:", authUrl);

      if (!(await lastfm.openAuthUrl(authUrl))) return null;

      return token;
    } catch (err) {
      console.error("[Last.fm] startAuth failed:", err);
      return null;
    }
  },

  // Step 2: Manual polling AFTER user clicks "Allow" on Last.fm
  completeAuth: async (token: string): Promise<string> => {
    try {
      const session = await invoke<{ username: string }>("poll_session", {
        token,
      });
      // ✅ SET USERNAME IN STORE
      setState({ status: "connected", username: session.username });
      console.log("[Last.fm] Connected as:", session.username);
      return `✅ Connected as ${session.username}!`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Last.fm] completeAuth failed:", err);
      return `❌ Authorization failed: ${msg}`;
    }
  },

  updateNowPlaying: async (
    artist: string,
    track: string,
    album?: string,
  ): Promise<void> => {
    if (state.status !== "connected") return;
    try {
      await invoke("update_now_playing", { artist, track, album });
      console.log("[Last.fm] ✓ Now playing:", artist, "-", track);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // ✅ Show visible warning for now playing failures
      console.warn("[Last.fm] ✗ Failed to update now playing:", msg);
      if (msg.includes("not JSON") || msg.includes("HTTP")) {
        console.error(
          "[Last.fm] CRITICAL: Last.fm API returned invalid response. Check Rust terminal logs!",
        );
      }
    }
  },

  // ===== OFFLINE SCROBBLE QUEUE =====
  // Persisted in localStorage so it survives page reloads
  _loadQueue: (): Array<{ artist: string; track: string; album?: string; timestamp: number }> => {
    try {
      return JSON.parse(localStorage.getItem("lastfm_scrobble_queue") || "[]");
    } catch {
      return [];
    }
  },

  _saveQueue: (queue: Array<{ artist: string; track: string; album?: string; timestamp: number }>) => {
    try {
      localStorage.setItem("lastfm_scrobble_queue", JSON.stringify(queue));
    } catch {
      console.warn("[Last.fm] Failed to persist scrobble queue");
    }
  },

  _enqueueScrobble: (artist: string, track: string, album?: string, timestamp?: number) => {
    const queue = lastfm._loadQueue();
    const entry = { artist, track, album, timestamp: timestamp || Math.floor(Date.now() / 1000) };
    queue.push(entry);
    lastfm._saveQueue(queue);
    console.log(`[Last.fm] 📥 Queued offline scrobble: ${artist} - ${track} (queue size: ${queue.length})`);
  },

  // Flush queued scrobbles — called automatically when connection is restored
  flushQueue: async (): Promise<void> => {
    const queue = lastfm._loadQueue();
    if (queue.length === 0) return;

    console.log(`[Last.fm] 🔄 Flushing ${queue.length} queued scrobble(s)...`);
    const failed: typeof queue = [];

    for (let i = 0; i < queue.length; i++) {
      const entry = queue[i];
      try {
        await invoke("scrobble_track", {
          artist: entry.artist,
          track: entry.track,
          album: entry.album,
          timestamp: entry.timestamp,
        });
        console.log(`[Last.fm] ✓ Flushed queued scrobble: ${entry.artist} - ${entry.track}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const isNetworkError = msg.toLowerCase().includes("network") || msg.includes("error sending request");
        if (isNetworkError) {
          // Still offline — keep remaining entries and abort
          failed.push(...queue.slice(i));
          console.warn(`[Last.fm] Still offline during flush. ${failed.length} scrobble(s) remain queued.`);
          break;
        } else {
          // API error — drop it, won't be fixed by retrying
          console.error(`[Last.fm] ✗ Queued scrobble dropped (API error): ${entry.artist} - ${entry.track}:`, msg);
        }
      }
    }

    lastfm._saveQueue(failed);
    if (failed.length === 0) {
      console.log("[Last.fm] ✅ Scrobble queue fully flushed.");
    }
  },

  // Returns true if scrobble succeeded or is a non-retriable error (caller marks as done).
  // Returns false if it failed due to network (caller should NOT mark as scrobbled — will retry).
  scrobble: async (
    artist: string,
    track: string,
    album?: string,
    timestamp?: number,
  ): Promise<boolean> => {
    if (state.status !== "connected") {
      lastfm._enqueueScrobble(artist, track, album, timestamp);
      return false;
    }
    try {
      const ts = timestamp || Math.floor(Date.now() / 1000);
      await invoke("scrobble_track", { artist, track, album, timestamp: ts });
      console.log(
        "[Last.fm] ✓ Scrobbled:",
        artist,
        "-",
        track,
        "@",
        new Date(ts * 1000).toLocaleTimeString(),
      );
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isNetworkError =
        msg.toLowerCase().includes("network") ||
        msg.includes("error sending request");

      if (isNetworkError) {
        console.warn(`[Last.fm] ✗ Scrobble failed (offline): ${artist} - ${track}. Queuing for retry.`);
        lastfm._enqueueScrobble(artist, track, album, timestamp);
        return false; // ← caller should NOT mark track as scrobbled
      } else {
        console.error("[Last.fm] ✗ Scrobble failed (API error):", msg);
        if (msg.includes("not JSON") || msg.includes("HTTP")) {
          console.error("[Last.fm] CRITICAL: Last.fm API returned invalid response. Check Rust terminal logs!");
        }
        return true; // ← API errors won't be fixed by retrying, treat as done
      }
    }
  },

  // Check connection status
  isConnected: async (): Promise<boolean> => {
    try {
      return await invoke<boolean>("is_connected");
    } catch {
      return false;
    }
  },

  // Refresh connection status from backend
  refreshStatus: async () => {
    try {
      const connected: boolean = await invoke("is_connected");
      const wasDisconnected = state.status === "disconnected";
      // ✅ PRESERVE USERNAME IF ALREADY SET
      setState((prev) => ({
        status: connected ? "connected" : "disconnected",
        username: connected ? prev.username : null,
      }));
      // ✅ Flush any queued offline scrobbles when connection is restored
      if (connected && wasDisconnected) {
        console.log("[Last.fm] Connection restored — flushing offline scrobble queue...");
        lastfm.flushQueue();
        // ✅ Re-send now playing for the current track
        if (_onConnectionRestoredCallback) {
          console.log("[Last.fm] Connection restored — re-sending now playing...");
          _onConnectionRestoredCallback();
        }
      }
    } catch (err) {
      console.error("[Last.fm] Status refresh failed:", err);
      setState({ status: "disconnected", username: null });
    }
  },

  // Debug methods
  debugSession: async (): Promise<string> => {
    try {
      return await invoke<string>("debug_session");
    } catch (err) {
      return (
        "Debug failed: " + (err instanceof Error ? err.message : String(err))
      );
    }
  },
};
