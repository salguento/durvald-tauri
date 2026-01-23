// Dependencies
import { Tabs } from "@kobalte/core";
import { createSignal, For } from "solid-js";
// Store
import { libraryStore } from "../../stores/libraryStore";
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

  const finishOnboard = () => {
    setShowOnboarding(false);
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
      class="w-full h-full flex items-center justify-center py-24"
      data-tauri-drag-region
    >
      <div class="w-2xl h-full bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-700/50 flex flex-col p-4 items-center gap-2">
        <div class="pt-12 pb-8">
          <img src="./public/assets/images/logotype.svg" class="h-8" />
        </div>
        <div class="flex flex-col mb-4 gap-4 h-full w-full max-w-md">
          <Tabs.Root
            value={currentStep().toString()}
            class="h-full w-full flex justify-center"
          >
            <Tabs.Content
              value={"0"}
              class="text-center text-zinc-50  py-4 h-full flex flex-col justify-center items-center"
            >
              <h3 class="text-xl font-bold">Welcome</h3>
              <p class="mt-2">
                Welcome to a musicophile road to a dream music library.
              </p>
              <p class="mt-2">Let's setup the basics.</p>
              <p>:)</p>
            </Tabs.Content>
            <Tabs.Content
              value={"1"}
              class="text-center text-zinc-50  py-4 h-full flex flex-col justify-center items-center gap-2"
            >
              <div class="flex flex-col">
                <h3 class="text-xl font-bold">Local Files</h3>
                <p class="mt-2">Set the path to your local files:</p>
              </div>
              <div class="flex flex-col gap-1">
                <For each={onboarding()?.file_paths}>
                  {(path) => (
                    <div class="flex gap-2 bg-zinc-950 border border-zinc-700/50 pl-4 pr-2 py-1 rounded-full items-center">
                      <span class="text-xs   text-zinc-300">{path}</span>
                      <button
                        class="flex items-center cursor-pointer text-zinc-300 hover:text-zinc-50"
                        title="Remove path"
                        onClick={() => {
                          handleRemovePath(path);
                        }}
                      >
                        <span class="icon-[solar--close-circle-outline] h-3 "></span>
                      </button>
                    </div>
                  )}
                </For>
              </div>
              <div class="py-4">
                <button
                  class="bg-zinc-50 px-4 py-0.5 text-zinc-950 rounded-full font-medium cursor-pointer"
                  onClick={() => {
                    handleAddPath();
                  }}
                >
                  Add path
                </button>
              </div>
            </Tabs.Content>
            <Tabs.Content
              value={"2"}
              class="text-center text-zinc-50  py-4 h-full flex flex-col justify-center items-center"
            >
              <h3 class="text-xl font-bold">LastFm</h3>
              <p class="mt-2">
                Connect to your account to scrobble your listining history.
              </p>
            </Tabs.Content>
            <Tabs.Content
              value={"3"}
              class="text-center text-zinc-50  py-4 h-full flex flex-col justify-center items-center"
            >
              <h3 class="text-xl font-bold">{steps[currentStep()].title}</h3>
              <p class="mt-2">{steps[currentStep()].content}</p>
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
              <div class="flex gap-2 justify-center  bottom-0 items-center w-full ">
                <For each={steps}>
                  {(_step, index) => (
                    <div
                      class={`w-8 h-8 flex items-center justify-center rounded-full ${currentStep() === index() ? "bg-zinc-50 text-zinc-950 font-medium" : "bg-zinc-500/50 text-zinc-50 font-normal"}`}
                    >
                      {index() + 1}
                    </div>
                  )}
                </For>
              </div>

              <button
                onClick={() => {
                  if (currentStep() < steps.length - 1)
                    setCurrentStep((p) => p + 1);
                  else finishOnboard();
                }}
                class="bg-zinc-50 px-4 py-0.5 text-zinc-950 rounded-full hover:bg-zinc-50 cursor-pointer font-medium min-w-24"
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
