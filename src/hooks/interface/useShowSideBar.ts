// Store
import { uiStore } from "../../stores/uiStore";
// Function
export function useShowSideBar() {
  const [showSideBar, setShowSideBar] = uiStore.showSideBar;

  const openSideBar = () => {
    setShowSideBar(true);
  };

  const closeSideBar = () => {
    setShowSideBar(false);
  };

  return {
    showSideBar,
    openSideBar,
    closeSideBar,
  };
}
