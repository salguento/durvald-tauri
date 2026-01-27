import { createSignal } from "solid-js";
import { lastfm } from "../../services/lastfm";
import { invoke } from "@tauri-apps/api/core";

export function LastFmTest() {
  const [apiKey, setApiKey] = createSignal("");
  const [apiSecret, setApiSecret] = createSignal("");
  const [result, setResult] = createSignal("");

  const handleInitialize = async () => {
    setResult("Initializing...");
    const success = await lastfm.initialize(apiKey(), apiSecret());
    setResult(
      success ? "✅ Initialization successful!" : "❌ Initialization failed",
    );
  };

  return (
    <div class="p-5 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 shadow max-w-md mx-auto mt-6">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Last.fm Test
      </h3>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          API Key
        </label>
        <input
          type="text"
          value={apiKey()}
          onInput={(e) => setApiKey(e.currentTarget.value)}
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your Last.fm API key"
        />
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          API Secret
        </label>
        <input
          type="password"
          value={apiSecret()}
          onInput={(e) => setApiSecret(e.currentTarget.value)}
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your Last.fm API secret"
        />
      </div>

      <button
        onClick={handleInitialize}
        disabled={!apiKey() || !apiSecret()}
        class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
      >
        Initialize Credentials
      </button>

      <button
        onClick={async () => {
          setResult("Verifying...");
          const verification = await lastfm.verifyCredentials();
          setResult(verification);
        }}
        class="mt-3 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
      >
        Verify Credentials
      </button>
      <button
        onClick={async () => {
          setResult("Testing browser open...");
          try {
            // ✅ Minimal test: hardcoded URL
            await invoke("plugin:shell|open", {
              path: "https://example.com",
            });
            setResult("✅ Browser opened to example.com!");
          } catch (err) {
            setResult(
              `❌ Open failed: ${err instanceof Error ? err.message : String(err)}`,
            );
            console.error("[DEBUG] Shell open error:", err);
          }
        }}
        class="mt-3 w-full px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-md transition-colors"
      >
        Test Browser Open (example.com)
      </button>
      <button
        onClick={async () => {
          setResult("Opening browser...");
          const { authUrl } = await invoke<{ token: string; authUrl: string }>(
            "get_auth_token",
          );
          const success = await lastfm.openAuthUrl(authUrl);
          setResult(success ? "✅ Browser opened!" : "❌ Browser open failed");
        }}
        class="mt-3 w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
      >
        Get Token & Open Browser
      </button>

      <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
        <strong class="text-gray-700 dark:text-gray-300">Result:</strong>
        <span class="ml-1 font-mono text-gray-900 dark:text-white">
          {result()}
        </span>
      </div>

      <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <strong class="text-gray-700 dark:text-gray-300">
          Current Status:
        </strong>
        <span
          class={`ml-1 font-medium ${
            lastfm.status === "connected" ? "text-green-600" : "text-gray-500"
          }`}
        >
          {lastfm.status.charAt(0).toUpperCase() + lastfm.status.slice(1)}
        </span>
      </div>
    </div>
  );
}
