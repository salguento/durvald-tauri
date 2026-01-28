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

// ===== PUBLIC API =====
export const lastfm = {
  // ✅ ADDED GETTERS
  get status() {
    return state.status;
  },
  get username() {
    return state.username;
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

  scrobble: async (
    artist: string,
    track: string,
    album?: string,
    timestamp?: number,
  ): Promise<void> => {
    if (state.status !== "connected") return;
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Last.fm] ✗ Scrobble failed:", msg);
      // ✅ Alert user visibly for scrobble failures
      if (msg.includes("not JSON") || msg.includes("HTTP")) {
        console.error(
          "[Last.fm] CRITICAL: Last.fm API communication failed. Check Rust terminal logs immediately!",
        );
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
      // ✅ PRESERVE USERNAME IF ALREADY SET
      setState((prev) => ({
        status: connected ? "connected" : "disconnected",
        username: connected ? prev.username : null,
      }));
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
