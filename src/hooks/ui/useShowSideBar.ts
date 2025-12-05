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
    console.log("closed");
  };

  return {
    showSideBar,
    openSideBar,
    closeSideBar,
  };
}
