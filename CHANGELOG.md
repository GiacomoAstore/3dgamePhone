# Changelog

Tutte le modifiche a questo progetto vengono registrate cronologicamente in questo documento seguendo il Semantic Versioning (`MAGGIORE.MINORE.PATCH`).

## [0.1.0] - 2026-11-10

### Aggiunto
- **Tooling e Fondamenta (Fase 0)**:
  - Configurazione deterministica del progetto con versioni esatte bloccate: Three.js `0.180.0`, Vite `6.4.6`, TypeScript `5.7.3`, three-mesh-bvh `0.9.18`, Vitest `3.2.7`, ESLint `9.20.1` e Prettier `3.5.1`.
  - Configurazione ESLint con `@typescript-eslint/parser` e formattazione con Prettier.
  - Creata documentazione di progetto: `README.md`, `ARCHITETTURA.md`, `CHANGELOG.md`, `DECISIONI.md`, `TODO.md`, `ASSETS.md`, `DOCS_DESIGN.md`.
  - Registrate ADR 001 (Regole vincolanti IA), ADR 002 (Scelta versioni stabili tooling) e ADR 003 (Performance budget mobile e DPR clamping).
- **Mondo e Personaggio (Fase 1)**:
  - Generazione procedurale dell'Isola della Bussola (`src/world/Island.ts`) con terreno collinare, vegetazione toon, rocce e pontile del Capitano Marea.
  - Modello procedurale 3D di Pip (`src/entities/ProceduralPip.ts`) con cappello, occhioni cartoon, stivali e lanterna magica.
  - Controller del giocatore (`src/entities/Player.ts`) con camminata, corsa, salto e animazioni procedurali (respiro, oscillazione arti).
  - Sistema di collisioni terreno e pareti con `three-mesh-bvh` (`src/systems/PhysicsSystem.ts`).
  - Ambiente (`src/world/Environment.ts`) con sole toon, luce emisferica, nebbia Three.js e mare animato.
  - Telecamera orbitale in terza persona con smooth damping (`src/systems/CameraController.ts`).
  - Overlay controlli touch mobile per smartphone (`src/ui/TouchOverlay.ts`) con joystick virtuale, pulsanti azione/salto e swipe visuale.
  - Clamping mobile del `devicePixelRatio <= 2.0`, contatore FPS in tempo reale nell'HUD e predisposizione profili qualità in `src/core/Game.ts`.
  - Suite di test automatici (`tests/game_math.test.ts`, `tests/player_physics.test.ts`, `tests/terrain_collision.test.ts`).

### Modificato
- Aggiornato `README.md` con la guida dettagliata passo-passo per il testing da smartphone tramite connessione Wi-Fi locale.

### Corretto
- Corretta la proiezione vettoriale di scivolamento lungo la normale delle pareti nel test di collisione (`tests/terrain_collision.test.ts`).

### Rimosso
- Nessun elemento rimosso.

### File toccati
- `package.json`, `package-lock.json`: blocco delle versioni esatte (senza `^` o `~`).
- `eslint.config.js`, `.prettierrc`: configurazione linting e formattazione.
- `index.html`, `src/style.css`: viewport mobile, canvas e HUD touch.
- `src/main.ts`: bootstrap del gioco e gestione schermata iniziale.
- `src/core/Game.ts`: game loop, clamping DPR e contatore FPS.
- `src/core/GameState.ts`, `src/core/EventBus.ts`: gestione stati e bus eventi.
- `src/systems/InputManager.ts`, `src/systems/CameraController.ts`, `src/systems/PhysicsSystem.ts`: sistemi di input, telecamera e collisioni BVH.
- `src/entities/Player.ts`, `src/entities/ProceduralPip.ts`: logica e modello procedurale di Pip.
- `src/world/Island.ts`, `src/world/Environment.ts`: generazione mondo, isola e nebbia.
- `src/ui/TouchOverlay.ts`: joystick virtuale e comandi touch.
- `tests/game_math.test.ts`, `tests/player_physics.test.ts`, `tests/terrain_collision.test.ts`: test unitari.
- `README.md`, `ARCHITETTURA.md`, `TODO.md`, `CHANGELOG.md`, `DECISIONI.md`: allineamento documentazione obbligatoria.

### Motivo
- Completamento delle Fasi 0 e 1 della roadmap di Brumavento in conformità alle regole di progetto e ai requisiti dell'utente.
