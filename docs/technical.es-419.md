# Documentación técnica de Durvald

> Versión 0.1.0 · Aplicación de escritorio en desarrollo · Actualizado en julio de 2026

## Descripción general

Durvald es un reproductor de música local-first. La interfaz está construida con SolidJS y TypeScript; el proceso nativo utiliza Tauri y Rust para acceder al sistema de archivos, leer metadatos, persistir la biblioteca y reproducir audio. En un navegador convencional, el proyecto muestra una presentación estática del producto y no accede a archivos locales.

## Arquitectura

```text
SolidJS UI
  ├─ pages, components and reactive stores
  ├─ audio/library hooks
  └─ Tauri invoke + event listeners
                │
                ▼
Tauri command boundary
  ├─ audio player (Kira)
  ├─ metadata scanner (Lofty)
  ├─ library and session persistence (SQLite)
  └─ Last.fm client + secure credential storage
                │
                ▼
Local filesystem, OS credential store and Last.fm API
```

El frontend llama comandos Rust mediante `invoke`. El backend publica eventos como `progress-update` y `song-changed`; los stores reactivos actualizan la cola, la pista actual y la interfaz. Las operaciones bloqueantes de SQLite usan un pool de conexiones y tareas dedicadas, mientras la reproducción, las actualizaciones de progreso y las llamadas HTTP usan Tokio.

## Tecnologías

| Capa | Tecnología | Responsabilidad |
| --- | --- | --- |
| Interfaz | SolidJS, TypeScript, Tailwind CSS | Rutas, componentes y estado reactivo |
| Escritorio | Tauri 2 | Ventana nativa, permisos y puente IPC |
| Núcleo | Rust, Tokio | Comandos, concurrencia y tareas asíncronas |
| Audio | Kira | Streaming, pausa, seek, volumen y cola |
| Metadatos | Lofty | Tags, duración, bitrate y portadas incrustadas |
| Datos | SQLite, rusqlite, r2d2 | Biblioteca, playlists, historial, cola y sesión |
| Integración | reqwest, Last.fm API | Autenticación, now playing y scrobbling |
| Secretos | Keyring / AES-256-GCM | Credenciales específicas de cada plataforma |

## Estructura del repositorio

```text
src/
  hooks/          acciones de audio, biblioteca e interfaz
  pages/          pantallas y rutas de la aplicación
  services/       integración Last.fm en el frontend
  stores/         estado reactivo global
  ui/             componentes reutilizables
  web/            presentación optimizada para navegador
src-tauri/
  capabilities/   permisos de la ventana principal
  src/audio/      reproductor y administración de la cola
  src/commands/   base de datos, metadatos y Last.fm
  src/main.rs     bootstrap y comandos Tauri
  src/secure_store.rs  almacenamiento de credenciales
```

## Flujos principales

### Indexación de la biblioteca

1. El usuario selecciona una o más carpetas durante el onboarding.
2. El backend recorre los archivos compatibles y Lofty extrae tags y propiedades técnicas.
3. Artistas, lanzamientos y pistas son normalizados y guardados en SQLite.
4. `mirrorDB` carga los registros en los stores de SolidJS.

El reproductor habilita los formatos MP3, OGG, FLAC y WAV.

### Reproducción y cola

`AudioPlayer` mantiene la pista actual, una cola `VecDeque` y un historial en memoria. Los cambios de la cola también se guardan en SQLite. Un loop asíncrono detecta el final de la pista, inicia el siguiente elemento, guarda la cola y emite `song-changed`. El progreso se envía por separado a la interfaz.

### Sesión

Una única fila de sesión guarda la pista actual, posición, volumen, shuffle, modo repeat, snapshot de la cola, posición en la cola y contexto de origen. Esta persistencia permite recuperar el estado después de cerrar la aplicación.

### Last.fm

La integración implementa autenticación por token, actualización de “now playing” y scrobbling. Un limitador global garantiza un intervalo mínimo de un segundo entre solicitudes. Los scrobbles que fallan por falta de red entran en una cola de `localStorage` y se reintentan cuando vuelve la conexión.

## Datos y seguridad

- Biblioteca, cola, playlists, ajustes, historial y última sesión se guardan en el archivo local `music.db3`.
- En macOS, los secretos de Last.fm se guardan en Keychain mediante el crate `keyring`.
- En Windows y Linux, los secretos se cifran con AES-256-GCM y se vinculan a la identidad local de la máquina/usuario.
- La clave de API y el nombre de usuario, tratados como datos no secretos, viven en el directorio de datos de la aplicación.
- La capability principal limita el acceso a ventana, diálogos, filesystem y apertura de URLs.
- Durvald no sube archivos de audio a servicios externos.

## Requisitos

- Bun 1.x
- Rust estable y Cargo
- Dependencias de sistema de Tauri 2 para el sistema operativo de destino
- Credenciales de una aplicación Last.fm, solamente al habilitar scrobbling

## Desarrollo

```sh
bun install
bun run dev          # presentación web
bun run tauri dev    # aplicación de escritorio completa
```

## Validación y build

```sh
bun run check
bun run build
cargo check --manifest-path src-tauri/Cargo.toml
bun run tauri build
```

`bun run build` valida TypeScript antes de Vite. El resultado web se escribe en `dist/`; Tauri genera los instaladores de escritorio para la plataforma de build actual.

## Entornos de ejecución

El bootstrap detecta `__TAURI_INTERNALS__`. En Tauri carga la aplicación completa y señala que la ventana principal está lista. En un navegador estándar carga solamente la presentación en un chunk separado, sin ejecutar comandos nativos.

## Limitaciones actuales

- El proyecto está en la versión 0.1.0 y todavía no incluye una suite automatizada de pruebas.
- La calidad de la biblioteca depende de metadatos consistentes en los archivos de audio.
- La base de datos crea tablas incrementalmente al iniciar, sin un framework formal de migraciones.
- Last.fm requiere que el usuario proporcione sus propias credenciales de aplicación.

## Licencia y código fuente

El proyecto se publica bajo licencia MIT. Código fuente: [github.com/salguento/durvald](https://github.com/salguento/durvald).
