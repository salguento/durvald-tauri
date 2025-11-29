export default function msToMinSec(ms: number) {
  return `${Math.floor(ms / 60)}:${((ms % 60) / 1).toFixed(0).padStart(2, "0")}`;
}
