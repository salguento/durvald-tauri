// Dependencies
import { useNavigate } from "@solidjs/router";
// Store
import { searchStore } from "../../stores/searchStore";
// Function
export default function SearchBar() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = searchStore.searchInput;
  const handleInput = (e: Event & { currentTarget: HTMLInputElement }) => {
    setSearchInput(e.currentTarget.value);
    navigate("/search");
  };
  return (
    <div class="relative w-64 hidden sm:block">
      <input
        type="text"
        value={searchInput()}
        onInput={handleInput}
        class="rounded-lg w-full border border-transparent bg-zinc-800 focus:bg-zinc-900  items-center hover:border-zinc-600 pl-8 placeholder:text-zinc-600 text-base h-8 font-light text-white inline-block "
        placeholder="Search"
      ></input>
      <span class="absolute left-1.5 top-1.5 icon-[solar--magnifer-linear] h-5 w-5 text-zinc-600 :text-white"></span>
    </div>
  );
}
