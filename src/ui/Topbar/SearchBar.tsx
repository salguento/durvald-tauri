// Dependencies
import { useNavigate } from "@solidjs/router";
// Function
export default function SearchBar() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/search");
  };
  return (
    <div class="relative w-56">
      <input
        type="text"
        onClick={handleClick}
        class="rounded-lg w-full border border-transparent bg-zinc-800 focus:bg-zinc-900  items-center hover:border-zinc-600 pl-8 placeholder:text-zinc-600 text-base h-8 font-medium text-white inline-block "
        placeholder="Search"
      ></input>
      <span class="absolute left-1.5 top-1.5 icon-[solar--magnifer-linear] h-5 w-5 text-zinc-600 :text-white"></span>
    </div>
  );
}
