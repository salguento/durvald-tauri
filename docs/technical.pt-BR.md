# Documentação técnica do Durvald

> Versão 0.1.0 · Aplicativo desktop em desenvolvimento · Atualizado em julho de 2026

## Visão geral

Durvald é um reprodutor de música local-first. A interface é construída com SolidJS e TypeScript; o processo nativo usa Tauri e Rust para acessar o sistema de arquivos, ler metadados, persistir a biblioteca e reproduzir áudio. A versão aberta em um navegador exibe uma vitrine estática do produto e não acessa arquivos locais.

## Arquitetura

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

O frontend chama comandos Rust com `invoke`. O backend publica eventos como `progress-update` e `song-changed`; os stores reativos atualizam a fila, a faixa atual e a interface. Operações SQLite bloqueantes usam pool de conexões e tarefas dedicadas, enquanto reprodução, atualização de progresso e chamadas HTTP usam Tokio.

## Tecnologias

| Camada | Tecnologia | Responsabilidade |
| --- | --- | --- |
| Interface | SolidJS, TypeScript, Tailwind CSS | Rotas, componentes e estado reativo |
| Desktop | Tauri 2 | Janela nativa, permissões e ponte IPC |
| Núcleo | Rust, Tokio | Comandos, concorrência e tarefas assíncronas |
| Áudio | Kira | Streaming, pausa, seek, volume e fila |
| Metadados | Lofty | Tags, duração, bitrate e capas incorporadas |
| Dados | SQLite, rusqlite, r2d2 | Biblioteca, playlists, histórico, fila e sessão |
| Integração | reqwest, Last.fm API | Autenticação, now playing e scrobble |
| Segredos | Keyring / AES-256-GCM | Credenciais por plataforma |

## Estrutura do repositório

```text
src/
  hooks/          ações de áudio, biblioteca e interface
  pages/          telas e rotas da aplicação
  services/       integração Last.fm no frontend
  stores/         estado reativo global
  ui/             componentes reutilizáveis
  web/            vitrine otimizada para navegadores
src-tauri/
  capabilities/   permissões da janela principal
  src/audio/      player e gerenciamento da fila
  src/commands/   banco, metadados e Last.fm
  src/main.rs     bootstrap e comandos Tauri
  src/secure_store.rs  armazenamento de credenciais
```

## Fluxos principais

### Indexação da biblioteca

1. O usuário seleciona uma ou mais pastas no onboarding.
2. O backend percorre os arquivos suportados e o Lofty extrai tags e propriedades técnicas.
3. Artistas, lançamentos e faixas são normalizados e gravados no SQLite.
4. `mirrorDB` carrega os registros nos stores SolidJS.

Os formatos habilitados pelo player são MP3, OGG, FLAC e WAV.

### Reprodução e fila

O `AudioPlayer` mantém a faixa atual, uma `VecDeque` para a fila e um histórico em memória. Alterações da fila também são persistidas no SQLite. Um loop assíncrono detecta o fim da faixa, inicia o próximo item, salva a fila e emite `song-changed`. O progresso é enviado separadamente à interface.

### Sessão

Uma única linha de sessão armazena faixa atual, posição, volume, shuffle, repeat, snapshot da fila, posição na fila e contexto de origem. A gravação permite retomar o estado após fechar o aplicativo.

### Last.fm

A integração implementa autenticação por token, atualização de “now playing” e scrobble. Um limitador global respeita o intervalo mínimo de uma requisição por segundo. Scrobbles que falham por indisponibilidade de rede entram em uma fila no `localStorage` e são reenviados quando a conexão volta.

## Dados e segurança

- A biblioteca, fila, playlists, configurações, histórico e última sessão ficam no arquivo local `music.db3`.
- No macOS, segredos do Last.fm são armazenados no Keychain pelo crate `keyring`.
- No Windows e Linux, segredos são criptografados com AES-256-GCM e vinculados à identidade local da máquina/usuário.
- Chave de API e nome do usuário, considerados não secretos, ficam no diretório de dados da aplicação.
- A capability principal limita o acesso a janela, diálogo, filesystem e abertura de URLs.
- Arquivos de áudio não são enviados pelo Durvald para serviços externos.

## Pré-requisitos

- Bun 1.x
- Rust stable e Cargo
- Dependências de sistema exigidas pelo Tauri 2 para o sistema operacional
- Credenciais de uma aplicação Last.fm, apenas para habilitar scrobble

## Desenvolvimento

```sh
bun install
bun run dev          # vitrine web
bun run tauri dev    # aplicativo desktop completo
```

## Validação e build

```sh
bun run check
bun run build
cargo check --manifest-path src-tauri/Cargo.toml
bun run tauri build
```

`bun run build` executa o TypeScript antes do Vite. O resultado web fica em `dist/`; os instaladores desktop são produzidos pelo Tauri conforme a plataforma de build.

## Ambientes de execução

O bootstrap detecta `__TAURI_INTERNALS__`. No Tauri, carrega o aplicativo completo e sinaliza que a janela principal está pronta. Em um navegador convencional, carrega somente a vitrine em um chunk separado, sem executar comandos nativos.

## Limitações atuais

- O projeto está na versão 0.1.0 e ainda não possui suíte automatizada de testes.
- A biblioteca depende de metadados consistentes nos arquivos de áudio.
- O banco ainda usa criação incremental de tabelas no startup, sem framework formal de migrations.
- A integração Last.fm exige que o usuário forneça credenciais próprias.

## Licença e código-fonte

O projeto usa licença MIT. Código-fonte: [github.com/salguento/durvald](https://github.com/salguento/durvald).
