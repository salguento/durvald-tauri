# durvald

durvald is a local-first desktop music player built with SolidJS, Rust and Tauri. It keeps the listener's own collection at the center, with library browsing, queues, playlists, playback history, favorites and Last.fm integration.

## Technical documentation

- [Português (Brasil)](docs/technical.pt-BR.md)
- [English (US)](docs/technical.en-US.md)
- [Español (Latinoamérica)](docs/technical.es-419.md)

The same codebase has two intentional entry experiences:

- Tauri launches the complete native music player.
- A standard browser renders a lightweight, responsive project showcase suitable for `salguento.xyz`.

## Development

```sh
bun install
bun run dev
```

Run the native application with:

```sh
bun run tauri dev
```

## Production checks

```sh
bun run check
bun run build
```

The static web output is generated in `dist/`. Configure the host to serve `index.html` for unknown paths and set the desired Vite base path at build time when publishing below a subdirectory.
