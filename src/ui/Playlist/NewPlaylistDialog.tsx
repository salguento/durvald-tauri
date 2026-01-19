// Dependencies
import { Dialog } from "@kobalte/core/dialog";
import { JSX } from "solid-js";
import { createSignal } from "solid-js";
// Stores
import { uiStore } from "../../stores/uiStore";
import ImageField from "./ImageField";
// Types
interface Props {
  children: JSX.Element;
}
// Function
export default function NewPlaylistDialog(props: Props) {
  const [openDialog, setOpenDialog] = uiStore.openDialog;
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [image, setImage] = createSignal(null);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    // Handle form submission here
    console.log({
      title: title(),
      description: description(),
      image: image(),
    });
    // You would typically send this data to an API
  };

  return (
    <Dialog open={openDialog()}>
      <Dialog.Trigger class="min-w-0 min-h-0">{props.children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay class="fixed inset-0 z-10 " />
        <div class="fixed inset-0 z-50 flex items-center justify-center ">
          <Dialog.Content class="z-10 max-w-xs w-xs bg-zinc-900/50 backdrop-blur-2xl border border-zinc-700/50 p-4 rounded-2xl">
            <div class="flex items-center justify-between mb-5">
              <Dialog.Title class="text-xl font-medium text-zinc-200">
                New Playlist
              </Dialog.Title>
              <Dialog.CloseButton
                class="h-6 w-6"
                onClick={() => {
                  setOpenDialog(false);
                }}
              >
                <span class="icon-[solar--close-circle-linear] h-6 w-6 text-zinc-400 hover:text-white"></span>
              </Dialog.CloseButton>
            </div>
            <Dialog.Description class="text-base text-zinc-300">
              <form class="flex flex-col gap-4">
                <ImageField />
                <div>
                  <input
                    placeholder="Playlist title"
                    value={title()}
                    onInput={(e) => setTitle(e.currentTarget.value)}
                    class="pl-4 py-1.5 bg-zinc-800 w-full rounded-md font-normal"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Description (optional)"
                    rows={3}
                    value={description()}
                    onInput={(e) => setDescription(e.currentTarget.value)}
                    class="pl-4 py-1.5 bg-zinc-800 w-full h-full rounded-md font-normal m-0"
                  />
                </div>
                <div>
                  <button
                    class="w-full py-2 font-medium rounded-lg  transition-colors"
                    classList={{
                      "bg-zinc-700 text-zinc-400 ": !title().trim(),
                      "bg-zinc-800 hover:bg-zinc-200 hover:text-zinc-950 cursor-pointer":
                        !!title().trim(),
                    }}
                    type="submit"
                    disabled={!title().trim()}
                  >
                    Create
                  </button>
                </div>
              </form>
            </Dialog.Description>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog>
  );
}
