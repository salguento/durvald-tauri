// hooks/useVolume.ts
import { invoke } from "@tauri-apps/api/core";
import { createSignal, onCleanup, Accessor, Setter } from "solid-js";

interface UseVolumeOptions {
  initialVolume?: number;
  debounceDelay?: number;
}

interface UseVolumeReturn {
  volume: Accessor<number>;
  setVolume: Setter<number>;
  handleVolumeChange: (value: number[]) => void;
  setVolumeImmediate: (volume: number) => Promise<void>;
  resetVolume: () => void;
  volumeInitialized: Accessor<boolean>;
}

// Created once, outside the function — shared across all callers
const [volume, setVolume] = createSignal(50);
const [volumeInitialized, setVolumeInitialized] = createSignal(false);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const setVolumeBackend = async (newVolume: number) => {
  try {
    const normalizedVolume = newVolume / 100;
    await invoke("set_volume", { volume: normalizedVolume });
  } catch (error) {
    console.error("[useVolume] Failed to set volume:", error);
  }
};

export async function initVolume() {
  try {
    const session = await invoke<{ volume: number }>("get_last_session");
    console.log("[initVolume] raw session:", session); // 👈 add this
    const vol = Math.round(session.volume);
    console.log("[initVolume] setting volume to:", vol);
    setVolume(vol);
    await setVolumeBackend(vol);
  } catch (e) {
    console.error("[useVolume] Failed to load last session volume:", e);
  } finally {
    setVolumeInitialized(true);
  }
}

export function useVolume(options: UseVolumeOptions = {}): UseVolumeReturn {
  const { debounceDelay = 100 } = options;

  // Only set initial volume once on first meaningful call
  const setVolumeImmediate = async (newVolume: number) => {
    const normalizedVolume = Math.max(0, Math.min(100, newVolume));
    setVolume(normalizedVolume);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    await setVolumeBackend(normalizedVolume);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = Math.max(0, Math.min(100, Math.round(value[0])));
    setVolume(newVolume);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      setVolumeBackend(newVolume);
      debounceTimer = null;
    }, debounceDelay);
  };

  const resetVolume = () => handleVolumeChange([50]);

  // onCleanup is now only safe to call inside a component
  // so we guard it here
  try {
    onCleanup(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
    });
  } catch {
    // Called outside reactive context (e.g. onCloseRequested), safe to ignore
  }

  return {
    volume,
    setVolume,
    handleVolumeChange,
    setVolumeImmediate,
    resetVolume,
    volumeInitialized,
  };
}
