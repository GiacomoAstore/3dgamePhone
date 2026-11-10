# Architettura del Progetto

<!--
Ultima modifica: 2026-11-10 - v0.1.0 - Implementazione moduli Fase 0 e 1
-->

Questo documento descrive la struttura delle cartelle, i moduli implementati, le loro interazioni e il diagramma del flusso di gioco.

## 1. Struttura delle Cartelle
```text
3dgamePhone/
├── .gitignore                    # Regole di esclusione git (build, node_modules, log, credenziali)
├── .prettierrc                   # Regole di formattazione del codice
├── eslint.config.js              # Configurazione linter ESLint per TypeScript
├── GEMINI.md                     # Regole vincolanti di sviluppo per l'IA
├── AGENTS.md                     # Indicizzazione regole per agenti
├── DOCS_DESIGN.md                # Game Design Document completo e specifiche tecniche
├── README.md                     # Guida al gioco, avvio e istruzioni smartphone
├── ARCHITETTURA.md               # Architettura, moduli e flussi del gioco
├── CHANGELOG.md                  # Registro cronologico delle modifiche (SemVer)
├── DECISIONI.md                  # Registro delle decisioni architetturali (ADR 001, ADR 002, ADR 003)
├── TODO.md                       # Roadmap e backlog dei task per le prossime fasi
├── ASSETS.md                     # Censimento asset 3D, licenze e provenienza
├── VERSION                       # Indicatore della versione corrente (0.1.0)
├── package.json                  # Dipendenze con versioni bloccate (senza ^ o ~)
├── package-lock.json             # Lockfile deterministico delle dipendenze
├── tsconfig.json                 # Configurazione TypeScript strict
├── vite.config.ts                # Configurazione dev server Vite con host locale
├── index.html                    # Layout mobile-first con canvas WebGL e HUD
├── src/
│   ├── main.ts                   # Entry point e bootstrap del gioco
│   ├── style.css                 # Stili CSS responsive e overlay comandi touch
│   ├── core/
│   │   ├── Game.ts               # Game loop con delta time, update/render e monitor FPS
│   │   ├── GameState.ts          # Macchina a stati (Loading, Menu, Playing, Paused)
│   │   └── EventBus.ts           # Bus di eventi tipizzato per comunicazione disaccoppiata
│   ├── systems/
│   │   ├── InputManager.ts       # Gestore universale input (WASD/Mouse + Touch Joystick)
│   │   ├── CameraController.ts   # Telecamera 3a persona orbitale con smooth damping
│   │   └── PhysicsSystem.ts      # Collisioni e ground detection con three-mesh-bvh
│   ├── entities/
│   │   ├── Player.ts             # Controller di Pip (movimento, salto, gravità, animazioni)
│   │   └── ProceduralPip.ts      # Modello 3D procedurale di Pip con materiali toon
│   ├── world/
│   │   ├── Island.ts             # Terreno collinare low-poly, alberi toon, rocce e pontile
│   │   └── Environment.ts        # Sole toon, luce emisferica, mare animato e nebbia
│   └── ui/
│       └── TouchOverlay.ts       # Joystick virtuale e pulsanti touch per smartphone
└── tests/
    ├── game_math.test.ts         # Test matematici di movimento e telecamera
    ├── player_physics.test.ts    # Test fisica di Pip (velocità, gravità, salto)
    └── terrain_collision.test.ts # Test rilevamento terreno e scivolamento ostacoli
```

## 2. Moduli Implementati e Responsabilità
- **Core (`src/core/`)**:
  - `Game.ts`: Gestisce il loop continuo a tempo variabile controllato (clamping a `dt <= 0.08s`), monitora il framerate calcolando gli FPS reali, coordina renderer, telecamera, fisica e mondo, e applica il budget mobile (DPR limitato a 2.0).
  - `GameState.ts`: Macchina a stati esplicita (`LOADING`, `START_MENU`, `PLAYING`, `PAUSED`, `DIALOGUE`).
  - `EventBus.ts`: Bus di eventi pub/sub fortemente tipizzato.
- **Sistemi (`src/systems/`)**:
  - `InputManager.ts`: Raccoglie gli input da tastiera/mouse su desktop e li unifica con i comandi del joystick e pulsanti virtuali touch su smartphone.
  - `CameraController.ts`: Segue Pip mantenendo un orientamento sferico orbitale, con pitch limitato per non compenetrare il terreno.
  - `PhysicsSystem.ts`: Costruisce la struttura BVH per il terreno e proietta raycast rapidi per identificare altezza del terreno, pendenze e scivolamento su pareti verticali.
- **Entità (`src/entities/`)**:
  - `Player.ts`: Logica di Pip. Applica gravità, velocità orizzontale in relazione alla camera, gestisce lo stato grounded e guida le animazioni procedurali (oscillazione braccia/gambe, respiro in idle, squash in salto).
  - `ProceduralPip.ts`: Genera l'intera geometria di Pip usando materiali toon (cappotto turchese, cappello da cartografo, occhioni cartoon, stivaletti e lanterna con luce puntiforme).
- **Mondo (`src/world/`)**:
  - `Island.ts`: Genera l'isola di partenza (Isola della Bussola) con rilievi collinari, vegetazione cartoon, rocce litoranee e pontile per il Capitano Marea.
  - `Environment.ts`: Gestisce sole direzionale dorato con ombre soft, luce ambientale emisferica, nebbia di Three.js e mare animato a onde morbide.
- **Interfaccia (`src/ui/`)**:
  - `TouchOverlay.ts`: Monitora gli eventi touch con multi-touch tracking, proietta il joystick virtuale e mappa la metà destra dello schermo alla rotazione della visuale.

## 3. Diagramma del Flusso di Gioco
```text
               [Avvio index.html]
                       │
                       ▼
             [Inizializzazione Game]
       ┌───────────────┴───────────────┐
       ▼                               ▼
[Setup Three.js & BVH]      [Overlay UI & Start Screen]
       │                               │
       └───────────────┬───────────────┘
                       │
                       ▼ (Pressione "Inizia Esplorazione")
             [GameState.PLAYING]
                       │
       ┌───────────────┴───────────────┐
       ▼ (Ogni Frame - requestAnimationFrame)
   [update(dt)]                   [render()]
   ├── InputManager (WASD / Touch)├── Aggiorna scena WebGL
   ├── Environment (Onde mare)    ├── Clamping PixelRatio <= 2.0
   ├── Player (Fisica + BVH)      └── Tone Mapping Filmic
   ├── Camera (Smooth Follow)
   └── FPS Counter (Debug HUD)
```
