import { createSignal } from "solid-js";
import { lastfm } from "../../services/lastfm";

export function LastFmTest() {
  const [apiKey, setApiKey] = createSignal("");
  const [apiSecret, setApiSecret] = createSignal("");
  const [result, setResult] = createSignal("");
  const [authToken, setAuthToken] = createSignal<string | null>(null);

  return (
    <div class="p-5 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 shadow max-w-md mx-auto mt-6">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Last.fm Setup
      </h3>

      {/* Step 1: Enter credentials */}
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          API Key
        </label>
        <input
          type="text"
          value={apiKey()}
          onInput={(e) => setApiKey(e.currentTarget.value)}
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Last.fm API key"
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
          placeholder="Enter Last.fm API secret"
        />
      </div>

      {/* Step 2: Initialize credentials */}
      <button
        onClick={async () => {
          setResult("Initializing...");
          const success = await lastfm.initialize(apiKey(), apiSecret());
          setResult(
            success ? "✅ Credentials stored!" : "❌ Initialization failed",
          );
        }}
        disabled={!apiKey() || !apiSecret()}
        class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
      >
        1. Store Credentials
      </button>

      {/* Step 3: Verify credentials */}
      <button
        onClick={async () => {
          setResult("Verifying...");
          const verification = await lastfm.verifyCredentials();
          setResult(verification);
        }}
        class="mt-3 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
      >
        2. Verify Credentials
      </button>

      {/* Step 4: Start OAuth (opens browser) */}
      <button
        onClick={async () => {
          setResult("Getting auth token...");
          const token = await lastfm.startAuth();
          if (token) {
            setAuthToken(token);
            setResult(
              '✅ Browser opened! Click "Allow" on Last.fm, then click button below',
            );
          } else {
            setResult("❌ Failed to start authorization");
          }
        }}
        class="mt-3 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
      >
        3. Start Authorization (opens browser)
      </button>

      {/* Step 5: Complete OAuth (manual polling) */}
      <button
        onClick={async () => {
          if (!authToken()) {
            setResult('❌ No auth token. Click "Start Authorization" first.');
            return;
          }
          setResult("Polling for authorization...");
          const result = await lastfm.completeAuth(authToken()!);
          setResult(result);

          // ✅ CRITICAL: Refresh UI status if connection succeeded
          if (result.startsWith("✅")) {
            await lastfm.refreshStatus();
            setResult(result + " (Status updated)");
          }

          setAuthToken(null);
        }}
        disabled={!authToken()}
        class="mt-3 w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
      >
        4. ✅ I Clicked "Allow" — Complete Connection
      </button>

      {/* Step 6: Debug session */}
      <button
        onClick={async () => {
          setResult("Checking session...");
          const debug = await lastfm.debugSession();
          setResult(debug);
        }}
        class="mt-3 w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-md transition-colors"
      >
        Debug Session
      </button>
      <button
        onClick={async () => {
          setResult("Debugging credentials...");
          const debug = await lastfm.debugCredentials();
          setResult(debug);
        }}
        class="mt-3 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
      >
        Debug Credentials
      </button>

      {/* Result display */}
      <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
        <strong class="text-gray-700 dark:text-gray-300">Result:</strong>
        <span class="ml-1 font-mono text-gray-900 dark:text-white break-all">
          {result()}
        </span>
      </div>

      {/* Connection status */}
      <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <strong class="text-gray-700 dark:text-gray-300">Status:</strong>
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
