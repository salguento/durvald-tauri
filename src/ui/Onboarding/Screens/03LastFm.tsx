import { invoke } from "@tauri-apps/api/core";
import { Show, createSignal } from "solid-js";
import { LastFmTest } from "../../LastFm/LastFmConnect";

export default function LastFm() {
  const [step, setStep] = createSignal<number>(0);
  return (
    <div class="h-full">
      <Show when={step() == 0}>
        <div class="text-center text-zinc-50  py-4 h-full flex flex-col justify-center items-center">
          <h3 class="text-xl font-bold">LastFm</h3>
          <p class="py-2">
            Connect to your account to scrobble your listining history.
          </p>
          <button
            class="py-2 underline cursor-pointer font-medium"
            onClick={async () => {
              await invoke("plugin:shell|open", {
                path: "https://www.last.fm/api/account/create",
              });
              setStep((prev) => ++prev);
            }}
          >
            Get an API credential with your account.
          </button>
          <div class="flex flex-col gap-0.5 pt-4">
            <p class="text-xs">
              Fill out only the application name and description
            </p>
            <p class="text-xs">
              Then copy and paste the API Key and API Secret
            </p>
          </div>
        </div>
      </Show>
      <Show when={step() == 1}>
        <LastFmTest />
      </Show>
    </div>
  );
}
