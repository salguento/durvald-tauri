// hooks/useFullscreen.ts
import { createSignal, onMount, onCleanup } from "solid-js";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = createSignal(false);
  const appWindow = getCurrentWindow();

  const checkFullscreen = async () => {
    const fullscreen = await appWindow.isMaximized();
    setIsFullscreen(fullscreen);
  };

  const toogleFullscreen = async () => {
    if (await appWindow.isMaximized()) {
      await appWindow.unmaximize();
    } else {
      await appWindow.maximize();
    }
  };

  onMount(() => {
    // Check initial state
    checkFullscreen();

    // Listen for fullscreen changes
    const unlisten = appWindow.onResized(() => {
      checkFullscreen();
    });

    onCleanup(() => {
      unlisten.then((fn) => fn());
    });
  });

  return {
    isFullscreen,
    toogleFullscreen,
  };
}
