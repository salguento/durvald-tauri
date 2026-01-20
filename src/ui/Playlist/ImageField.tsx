import { FileField } from "@kobalte/core/file-field";

export default function ImageField() {
  return (
    <FileField
      class="flex flex-col items-center justify-center  w-full"
      multiple={false}
      maxFiles={1}
      onFileAccept={(data) => console.log("data", data)}
      onFileReject={(data) => console.log("data", data)}
      onFileChange={(data) => console.log("data", data)}
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
  );
}
