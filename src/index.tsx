/* @refresh reload */
import { render } from "solid-js/web";
import "./App.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Application root element was not found");
}

async function bootstrap() {
  const isTauri = "__TAURI_INTERNALS__" in window;

  if (isTauri) {
    document.documentElement.dataset.runtime = "tauri";
    const [{ default: App }, { getCurrentWebviewWindow }] = await Promise.all([
      import("./App"),
      import("@tauri-apps/api/webviewWindow"),
    ]);

    await getCurrentWebviewWindow().emit("main-window-ready");
    render(() => <App />, root!);
    return;
  }

  const { default: WebShowcase } = await import("./web/WebShowcase");
  render(() => <WebShowcase />, root!);
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to start durvald:", error);
  root.textContent = "Unable to load durvald. Please refresh and try again.";
});
