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

  // Open browser to Last.fm authorization page
  openAuthUrl: async (authUrl: string): Promise<boolean> => {
    try {
      await invoke("plugin:shell|open", {
        path: authUrl,
      });
      return true;
    } catch (err) {
      console.error("[Last.fm] Browser open failed:", err);
      return false;
    }
  },

  getAuthToken: async (): Promise<string> => {
    try {
      const { token, authUrl } = await invoke<{
        token: string;
        authUrl: string;
      }>("get_auth_token");
      return `Token: ${token}\nURL: ${authUrl}`;
    } catch (err) {
      return (
        "Token failed: " +
        (err instanceof Error ? err.message : "Unknown error")
      );
    }
  },

  debugStore: async (): Promise<string> => {
    try {
      return await invoke<string>("debug_store");
    } catch (err) {
      return (
        "Debug failed: " + (err instanceof Error ? err.message : String(err))
      );
    }
  },

  getServiceName: async () => await invoke<string>("get_service_name"),
};
