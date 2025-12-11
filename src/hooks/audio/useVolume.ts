// hooks/useVolume.ts
import { invoke } from "@tauri-apps/api/core";
import { createSignal, onCleanup, Accessor, Setter } from "solid-js";

interface UseVolumeOptions {
  /** Initial volume value (0-100) */
  initialVolume?: number;
  /** Debounce delay in milliseconds */
  debounceDelay?: number;
}

interface UseVolumeReturn {
  /** Current volume (0-100) */
  volume: Accessor<number>;
  /** Set volume directly */
  setVolume: Setter<number>;
  /** Handle slider value changes */
  handleVolumeChange: (value: number[]) => void;
  /** Set volume with immediate backend call (no debounce) */
  setVolumeImmediate: (volume: number) => Promise<void>;
  /** Reset to default volume (50) */
  resetVolume: () => void;
}

export function useVolume(options: UseVolumeOptions = {}): UseVolumeReturn {
  const { initialVolume = 50, debounceDelay = 100 } = options;
  const [volume, setVolume] = createSignal(initialVolume);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Debounced function to set volume in backend
  const setVolumeBackend = async (newVolume: number) => {
    try {
      const normalizedVolume = newVolume / 100;
      await invoke("set_volume", { volume: normalizedVolume });
    } catch (error) {
      console.error("[useVolume] Failed to set volume:", error);
    }
  };

  // Set volume immediately without debounce
  const setVolumeImmediate = async (newVolume: number) => {
    const normalizedVolume = Math.max(0, Math.min(100, newVolume));
    setVolume(normalizedVolume);

    // Clear any pending debounce
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    await setVolumeBackend(normalizedVolume);
  };

  // Handle slider value changes with debouncing
  const handleVolumeChange = (value: number[]) => {
    const newVolume = Math.max(0, Math.min(100, Math.round(value[0])));
    setVolume(newVolume);

    // Debounce the backend call
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      setVolumeBackend(newVolume);
      debounceTimer = null;
    }, debounceDelay);
  };

  // Reset to default volume
  const resetVolume = () => {
    handleVolumeChange([50]);
  };

  // Cleanup on unmount
  onCleanup(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  });

  return {
    volume,
    setVolume,
    handleVolumeChange,
    setVolumeImmediate,
    resetVolume,
  };
}
