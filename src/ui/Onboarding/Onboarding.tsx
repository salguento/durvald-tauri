// Dependencies
import { invoke } from "@tauri-apps/api/core";
import { Tabs } from "@kobalte/core";
import { createSignal } from "solid-js";
// Store
import { libraryStore } from "../../stores/libraryStore";
import finishOnboarding from "../../hooks/library/Settings/finishOnboarding";
import Welcome from "./Screens/01Welcome";
import LocalFiles from "./Screens/02LocalFiles";
import LastFm from "./Screens/03LastFm";
import Finish from "./Screens/04Finish";
// Types
interface OnboardingType {
  file_paths: string[];
  auth_lastfm: string;
}
// Function
export default function Onboarding() {
  const [currentStep, setCurrentStep] = createSignal(0);
  const [onboarding, setOnboarding] = createSignal<OnboardingType>();
  const [, setShowOnboarding] = libraryStore.showOnboarding;

  const handleAddPath = async () => {
    const { open } = await import("@tauri-apps/plugin-dialog");

    const selected = (await open({
      multiple: true,
      directory: true,
      title: "Select music folders",
    })) as string[] | string | null;

    if (selected) {
      // Convert to array if single selection
      const paths = Array.isArray(selected) ? selected : [selected];

      setOnboarding((prev) => {
        if (!prev) {
          return {
            file_paths: paths,
            auth_lastfm: "",
          };
        }

        // Filter out duplicates
        const existingPaths = new Set(prev.file_paths);
        const newPaths = paths.filter((path) => !existingPaths.has(path));

        return {
          ...prev,
          file_paths: [...prev.file_paths, ...newPaths],
        };
      });
    }
  };

  const handleRemovePath = (path: string) => {
    setOnboarding((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        file_paths: prev.file_paths.filter((item) => item !== path),
      };
    });
  };

  const finishOnboard = async () => {
    setShowOnboarding(false);
    onboarding()?.file_paths.forEach(async (i) => {
      await invoke("add_path_to_library_paths", { folderPath: i });
      console.log(i);
    });
    finishOnboarding();
  };

  const steps = [
    {
      title: "Welcome",
      content: "Welcome to a musiphile road to a dream music library manager.",
    },
    { title: "LastFm", content: "If you want " },
    { title: "LastFm", content: "If you want " },
    { title: "Get Started", content: "Let's begin!" },
  ];
  return (
    <div
      class="w-full h-full flex items-center justify-center py-12"
      data-tauri-drag-region
    >
      <div class="w-2xl h-full bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-700/50 flex flex-col p-4 items-center gap-2">
        <div class="py-4">
          <img src="./assets/images/logotype.svg" class="h-8" />
        </div>
        <div class="flex flex-col p-4 gap-4 h-full w-full ">
          <Tabs.Root
            value={currentStep().toString()}
            class="h-full w-full flex justify-center"
          >
            <Tabs.Content value={"0"}>
              <Welcome />
            </Tabs.Content>
            <Tabs.Content value={"1"}>
              <LocalFiles
                addPath={handleAddPath}
                removePath={handleRemovePath}
                filePaths={onboarding()?.file_paths}
              />
            </Tabs.Content>
            <Tabs.Content value={"2"}>
              <LastFm />
            </Tabs.Content>
            <Tabs.Content value={"3"}>
              <Finish />
            </Tabs.Content>
          </Tabs.Root>
          <div class="relative ">
            <div class="flex justify-between mt-6 text-zinc-300 w-full z-10">
              {currentStep() > 0 ? (
                <button
                  onClick={() => setCurrentStep((p) => p - 1)}
                  class="bg-zinc-500/50 px-4 py-0.5 min-w-24 text-zinc-50  hover:text-zinc-950 rounded-full hover:bg-zinc-50 cursor-pointer font-medium"
                >
                  Back
                </button>
              ) : (
                <div class="min-w-24"></div>
              )}
              {/*<div class="flex gap-2 justify-center  bottom-0 items-center w-full ">
                <For each={steps}>
                  {(_step, index) => (
                    <div
                      class={`w-8 h-8 flex items-center justify-center rounded-full ${currentStep() === index() ? "bg-zinc-50 text-zinc-950 font-medium" : "bg-zinc-500/50 text-zinc-50 font-normal"}`}
                    >
                      {index() + 1}
                    </div>
                  )}
                </For>
              </div>*/}

              <button
                onClick={() => {
                  if (currentStep() < steps.length - 1)
                    setCurrentStep((p) => p + 1);
                  else finishOnboard();
                }}
                class="bg-zinc-50 px-4 py-0.5 text-zinc-950 rounded-full hover:bg-zinc-50 cursor-pointer font-medium min-w-24 disabled:bg-zinc-400 disabled:cursor-not-allowed"
                disabled={
                  !onboarding()?.file_paths.length && currentStep() == 1
                }
              >
                {currentStep() === steps.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
