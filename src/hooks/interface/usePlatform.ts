import { createSignal, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

/**
 * Detects the host OS at runtime (Tauri <-> Rust `get_platform`), so UI can
 * adapt window-control placement and other platform conventions.
 */
export function usePlatform() {
  const [isMac, setIsMac] = createSignal(false);

  onMount(async () => {
    try {
      const os = await invoke<string>("get_platform");
      setIsMac(os === "macos");
    } catch (err) {
      console.warn("[Platform] failed to detect OS:", err);
      setIsMac(false);
    }
  });

  return { isMac };
}