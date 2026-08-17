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