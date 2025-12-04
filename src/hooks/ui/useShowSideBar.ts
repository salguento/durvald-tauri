// Store
import { uiStore } from "../../stores/uiStore";
// Function
export function useShowSideBar() {
  const [showSideBar, setShowSideBar] = uiStore.showSideBar;

  const toogleSideBar = () => {
    setShowSideBar(!showSideBar());
  };

  return {
    showSideBar,
    toogleSideBar,
  };
}
