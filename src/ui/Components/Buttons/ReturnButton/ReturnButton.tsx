import { useNavigate, useLocation } from "@solidjs/router";

interface LocationState {
  previous?: string;
}

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const state = location.state as LocationState;

    // Check if we have history and can go back
    if (state?.previous || history.length > 1) {
      navigate(-1);
    } else {
      navigate("/"); // Fallback to home
    }
  };

  return (
    <button
      onClick={handleBack}
      class="hover:cursor-pointer h-6 w-6 text-zinc-400 hover:text-white"
      title="Return"
    >
      <span class="icon-[solar--arrow-left-linear] h-6 w-6 "></span>
    </button>
  );
}
