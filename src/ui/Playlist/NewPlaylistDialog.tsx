// Dependencies
import { Dialog } from "@kobalte/core/dialog";
import { JSX } from "solid-js";
import { createSignal } from "solid-js";
import { FileField } from "@kobalte/core/file-field";
import { useNavigate } from "@solidjs/router";
// Hooks
import createPlaylist from "../../hooks/library/Playlists/createPlaylist";
// Stores
import { uiStore } from "../../stores/uiStore";
// Types
interface Props {
  children: JSX.Element;
}
// Function
export default function NewPlaylistDialog(props: Props) {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = uiStore.openDialog;
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [image, setImage] = createSignal<string | null>();

  const handleFileChange = async (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const dataUrl = e.target.result as string;
          setImage(dataUrl);
        }
      };
      reader.onerror = (e) => {
        console.error("Error reading file:", e);
        alert("Error reading image file");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const playlistId = await createPlaylist({
      name: title(),
      cover: image() ?? null,
      description: description(),
    });
    console.log(playlistId);
    navigate(`/playlist/${playlistId}`);
    setOpenDialog(false);
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
              <form
                class="flex flex-col gap-4"
                onSubmit={(e) => {
                  handleSubmit(e);
                }}
              >
                <FileField
                  class="flex flex-col items-center justify-center  w-full"
                  multiple={false}
                  maxFiles={1}
                  onFileChange={(data) => handleFileChange(data.acceptedFiles)}
                >
                  <FileField.Dropzone class="flex flex-col items-center justify-center border-2  border-zinc-200 rounded-lg h-52 w-52">
                    <FileField.Trigger class="flex items-center justify-center text-white hover:text-zinc-950 rounded-sm cursor-pointer bg-zinc-900 hover:bg-zinc-200 h-10 w-10">
                      <span class="icon-[solar--gallery-add-linear] h-6 w-6 "></span>
                    </FileField.Trigger>
                  </FileField.Dropzone>
                  <FileField.HiddenInput />
                  <FileField.ItemList class="absolute h-52 w-52 -z-1 ">
                    {(_file) => (
                      <FileField.Item class="rounded-lg overflow-hidden">
                        <FileField.ItemPreviewImage class="h-52 w-52 object-cover" />
                      </FileField.Item>
                    )}
                  </FileField.ItemList>
                </FileField>
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
