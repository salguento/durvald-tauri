// Dependencies
import { useNavigate, useLocation } from "@solidjs/router";
import { createMemo, onMount, onCleanup } from "solid-js";
// Store
import { uiStore } from "../../stores/uiStore";
// Types
interface LocationState {
  previous?: string;
}
export default function ForwardButton() {
  const [navigationHistory, setNavigationHistory] = uiStore.navigationHistory;
  const navigate = useNavigate();
  const location = useLocation();

  // Update navigation state whenever location changes
  const updateNavigationState = () => {
    setNavigationHistory({
      depth: history.state?._depth ?? 0,
      length: history.length,
    });
  };

  // Listen for navigation events
  onMount(() => {
    window.addEventListener("popstate", updateNavigationState);
    updateNavigationState(); // Initial update
  });

  onCleanup(() => {
    window.removeEventListener("popstate", updateNavigationState);
  });

  const handleClick = () => {
    const state = location.state as LocationState;

    // Check if we have history and can go forward
    if (state?.previous || history.length > 1) {
      navigate(1);
    } else {
      navigate("/"); // Fallback to home
    }
    // Update after a short delay to let navigation complete
    setTimeout(updateNavigationState, 0);
  };

  const cantNavigateForward = createMemo(() => {
    const state = navigationHistory();
    return state.depth >= state.length - 1;
  });

  return (
    <button
      id="navigate-forward"
      class={`text-zinc-400 flex items-center justify-center h-8 w-8 rounded-xl ${
        cantNavigateForward()
          ? "text-zinc-400/50"
          : "cursor-pointer hover:bg-zinc-700 hover:text-white"
      }`}
      title="Forward"
      onclick={handleClick}
      disabled={cantNavigateForward()}
    >
      <span class="icon-[solar--alt-arrow-right-linear] h-6 w-6"></span>
    </button>
  );
}
