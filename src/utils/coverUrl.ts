import { convertFileSrc } from "@tauri-apps/api/core";

/**
 * Resolves a cover artwork value into a renderable `src`.
 *
 * - `data:...`          → legacy/embedded base64 data URL, used as-is.
 * - absolute path       → converted to an `asset://` URL served by the
 *                         asset protocol (covers written to disk).
 * - anything else / null → returned unchanged (safe in the web showcase).
 */
export function coverUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("data:")) return value;
  if (!("__TAURI_INTERNALS__" in window)) return value; // web showcase
  return convertFileSrc(value);
}

/**
 * Resolves the small thumbnail for a cover, used in lists/grids so the first
 * paint stays cheap. Derives `<dir>/thumb_<hash>.jpg` from the full path.
 *
 * Falls back to the full cover (`coverUrl`) for legacy base64 rows or when
 * running outside Tauri. Components should also handle a missing thumbnail
 * file by swapping to the full URL via `onError`.
 */
export function coverThumbUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("data:") || !("__TAURI_INTERNALS__" in window)) {
    return coverUrl(value);
  }
  const idx = value.lastIndexOf("/");
  const dir = value.slice(0, idx + 1);
  const file = value.slice(idx + 1);
  const dot = file.lastIndexOf(".");
  const stem = dot > 0 ? file.slice(0, dot) : file;
  return coverUrl(`${dir}thumb_${stem}.jpg`);
}