import { For, Show, createSignal } from "solid-js";

const baseUrl = import.meta.env.BASE_URL;

const releases = [
  {
    title: "Britpop",
    artist: "A. G. Cook",
    artwork: `${baseUrl}assets/images/britpop-agcook.jpg`,
  },
  {
    title: "Dream Logic",
    artist: "Local library",
    artwork: `${baseUrl}assets/images/ag-cook.jpg`,
  },
];

const features = [
  {
    number: "01",
    title: "Your files stay yours",
    description:
      "Scan and organize a local music collection without handing it to a streaming platform.",
  },
  {
    number: "02",
    title: "Built for listening",
    description:
      "Queue management, playback history, favorites and focused navigation in one calm interface.",
  },
  {
    number: "03",
    title: "Native where it matters",
    description:
      "A SolidJS interface backed by Rust and Tauri for responsive playback and desktop integration.",
  },
];

export default function WebShowcase() {
  const [isPlaying, setIsPlaying] = createSignal(false);

  return (
    <div class="min-h-screen overflow-x-hidden bg-[#070908] text-zinc-100 selection:bg-cyan-300 selection:text-zinc-950">
      <a
        href="#main-content"
        class="sr-only z-50 rounded-full bg-cyan-300 px-4 py-2 font-semibold text-zinc-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <header class="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <a href="#main-content" aria-label="durvald home">
          <img
            src={`${baseUrl}assets/images/logotype.svg`}
            width="108"
            height="24"
            alt="durvald"
            class="h-7 w-auto"
          />
        </a>
        <div class="flex items-center gap-3">
          <span class="hidden text-xs uppercase tracking-[0.2em] text-zinc-500 sm:inline">
            Desktop music player
          </span>
          <a
            href="https://github.com/salguento/durvald"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium transition hover:border-white/30 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
          >
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <main id="main-content">
        <section class="relative mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl items-center gap-14 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12 lg:py-16">
          <div class="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-cyan-400/10 blur-[120px]" />
          <div class="relative z-10 max-w-xl">
            <p class="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              <span class="h-px w-8 bg-cyan-300" aria-hidden="true" />
              A local-first music experience
            </p>
            <h1 class="text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl lg:text-[5.5rem]">
              Your library,
              <span class="block text-zinc-500">in tune with you.</span>
            </h1>
            <p class="mt-7 max-w-lg text-pretty text-base leading-7 text-zinc-400 sm:text-lg">
              durvald is a desktop music player designed around ownership,
              discovery and the pleasure of browsing a collection you built.
            </p>
            <div class="mt-9 flex flex-wrap gap-3">
              <a
                href="#experience"
                class="rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
              >
                Explore the experience
              </a>
              <a
                href="https://github.com/salguento/durvald"
                target="_blank"
                rel="noreferrer"
                class="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold transition hover:border-white/30 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
              >
                View source
              </a>
            </div>
            <dl class="mt-12 grid max-w-md grid-cols-3 gap-5 border-t border-white/10 pt-6">
              <div><dt class="text-xs text-zinc-500">Frontend</dt><dd class="mt-1 text-sm font-medium">SolidJS</dd></div>
              <div><dt class="text-xs text-zinc-500">Core</dt><dd class="mt-1 text-sm font-medium">Rust</dd></div>
              <div><dt class="text-xs text-zinc-500">Platform</dt><dd class="mt-1 text-sm font-medium">Tauri</dd></div>
            </dl>
          </div>

          <div class="relative mx-auto w-full max-w-3xl lg:translate-x-8">
            <div class="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-cyan-300/15 via-transparent to-pink-400/10 blur-2xl" />
            <div class="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-zinc-950/90 p-2 shadow-2xl shadow-black/60">
              <div class="flex min-h-[570px] overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0e1110] sm:min-h-[620px]">
                <aside class="hidden w-44 shrink-0 flex-col border-r border-white/10 p-5 sm:flex">
                  <img src={`${baseUrl}assets/images/logotype.svg`} width="108" height="24" alt="" class="mb-9 h-5 w-auto self-start" />
                  <nav aria-label="App preview navigation" class="space-y-1 text-sm">
                    <span class="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-white"><span class="icon-[solar--home-angle-2-bold] h-4 w-4 text-cyan-300" />Home</span>
                    <span class="flex items-center gap-2 px-3 py-2 text-zinc-500"><span class="icon-[solar--music-library-2-linear] h-4 w-4" />Library</span>
                    <span class="flex items-center gap-2 px-3 py-2 text-zinc-500"><span class="icon-[solar--clock-circle-linear] h-4 w-4" />Recently added</span>
                  </nav>
                  <p class="mb-3 mt-9 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-zinc-600">Playlists</p>
                  <div class="space-y-3 text-xs text-zinc-500"><p>Slow mornings</p><p>After midnight</p><p>On repeat</p></div>
                </aside>

                <div class="flex min-w-0 flex-1 flex-col">
                  <div class="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
                    <p class="text-sm font-semibold">Good evening</p>
                    <span class="icon-[solar--magnifer-linear] h-5 w-5 text-zinc-500" />
                  </div>
                  <div class="flex-1 p-4 sm:p-6">
                    <p class="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Made for your library</p>
                    <div class="grid grid-cols-2 gap-3">
                      <For each={releases}>
                        {(release) => (
                          <article class="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                            <div class="relative overflow-hidden rounded-xl">
                              <img src={release.artwork} width="480" height="480" loading="eager" alt={`Cover artwork for ${release.title}`} class="aspect-square w-full object-cover transition duration-500 hover:scale-[1.03]" />
                            </div>
                            <h2 class="mt-3 truncate text-sm font-semibold">{release.title}</h2>
                            <p class="mt-1 truncate text-xs text-zinc-500">{release.artist}</p>
                          </article>
                        )}
                      </For>
                    </div>
                  </div>

                  <div class="m-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/90 p-3 sm:m-4">
                    <img src={`${baseUrl}assets/images/britpop-agcook.jpg`} width="48" height="48" alt="" class="h-12 w-12 rounded-xl object-cover" />
                    <div class="min-w-0 flex-1"><p class="truncate text-xs font-semibold">Silver Thread Golden Needle</p><p class="mt-1 text-[0.7rem] text-zinc-500">A. G. Cook</p></div>
                    <button
                      type="button"
                      aria-label={isPlaying() ? "Pause preview" : "Play preview"}
                      aria-pressed={isPlaying()}
                      onClick={() => setIsPlaying((value) => !value)}
                      class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cyan-300 text-zinc-950 transition hover:scale-105 hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
                    >
                      <Show when={isPlaying()} fallback={<span class="icon-[solar--play-bold] h-5 w-5" />}>
                        <span class="icon-[solar--pause-bold] h-5 w-5" />
                      </Show>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" class="border-y border-white/10 bg-white/[0.02]">
          <div class="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
            <div class="grid gap-8 lg:grid-cols-2">
              <p class="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Designed with intent</p>
              <h2 class="max-w-2xl text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Less platform. More connection to your music.</h2>
            </div>
            <div class="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 lg:grid-cols-3">
              <For each={features}>
                {(feature) => (
                  <article class="bg-[#0a0c0b] p-7 sm:p-9">
                    <p class="font-mono text-xs text-cyan-300">{feature.number}</p>
                    <h3 class="mt-12 text-xl font-semibold">{feature.title}</h3>
                    <p class="mt-3 text-sm leading-6 text-zinc-500">{feature.description}</p>
                  </article>
                )}
              </For>
            </div>
          </div>
        </section>
      </main>

      <footer class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-10 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p>durvald — crafted by Salguento.</p>
        <a href="https://salguento.xyz" class="transition hover:text-zinc-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">Back to salguento.xyz ↗</a>
      </footer>
    </div>
  );
}
