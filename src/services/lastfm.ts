import { invoke } from "@tauri-apps/api/core";
import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";

// ===== STORE =====
const [state, setState] = createStore<{
  status: "disconnected" | "connected";
}>({
  status: "disconnected",
});

// ===== PUBLIC API =====
export const lastfm = {
  get status() {
    return state.status;
  },

  // Initialize connection status on app start
  init: () => {
    lastfm.refreshStatus();
    createEffect(() => {
      const check = async () => {
        try {
          const connected: boolean = await invoke("is_connected");
          setState({ status: connected ? "connected" : "disconnected" });
        } catch {
          setState({ status: "disconnected" });
        }
      };
      check();
    });
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

  // Step 1: Get auth token + open browser
  startAuth: async (): Promise<string | null> => {
    try {
      const { token, authUrl } = await invoke<{
        token: string;
        authUrl: string;
      }>("get_auth_token");
      console.log("[Last.fm] Auth URL:", authUrl);

      // Open browser
      try {
        await invoke("plugin:shell|open", { path: authUrl });
        console.log("[Last.fm] Browser opened");
      } catch (err) {
        console.error("[Last.fm] Browser open failed:", err);
        return null;
      }

      return token; // Return token for manual polling
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
      console.log("[Last.fm] Connected as:", session.username);
      return `✅ Connected as ${session.username}!`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Last.fm] completeAuth failed:", err);
      return `❌ Authorization failed: ${msg}`;
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

  debugCredentials: async (): Promise<string> => {
    try {
      return await invoke<string>("debug_credentials");
    } catch (err) {
      return (
        "Debug failed: " + (err instanceof Error ? err.message : String(err))
      );
    }
  },

  // Refresh connection status from backend
  refreshStatus: async () => {
    try {
      const connected: boolean = await invoke("is_connected");
      setState({ status: connected ? "connected" : "disconnected" });
      console.log(
        "[Last.fm] Status refreshed:",
        connected ? "connected" : "disconnected",
      );
    } catch (err) {
      console.error("[Last.fm] Status refresh failed:", err);
      setState({ status: "disconnected" });
    }
  },
};
