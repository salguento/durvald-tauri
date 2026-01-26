// Dependencies
import { invoke } from "@tauri-apps/api/core";

export default async function finishOnboarding() {
  try {
    await invoke("update_onboarding_settings", {
      value: false,
    });
  } catch (err) {
    console.error("Failed to update settings: " + err);
  }
}
