# Architettura del Progetto

<!--
Ultima modifica: 2026-11-10 - v0.2.0 - Implementazione Fase 2 (Interazione, Dialoghi, Missioni, Diario, i18n)
-->

Questo documento descrive la struttura delle cartelle, i moduli implementati, le loro interazioni e il diagramma del flusso di gioco di *Brumavento*.

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
├── DECISIONI.md                  # Registro delle decisioni architetturali (ADR 001 - 005)
├── TODO.md                       # Roadmap e backlog dei task per le prossime fasi
├── ASSETS.md                     # Censimento asset 3D, licenze e provenienza
├── VERSION                       # Indicatore della versione corrente (0.2.0)
├── package.json                  # Dipendenze con versioni bloccate (senza ^ o ~)
├── package-lock.json             # Lockfile deterministico delle dipendenze
├── tsconfig.json                 # Configurazione TypeScript strict
├── vite.config.ts                # Configurazione dev server Vite con host locale
├── index.html                    # Layout mobile-first con canvas WebGL, HUD, dialoghi e diario
├── src/
│   ├── main.ts                   # Entry point e bootstrap del gioco
│   ├── style.css                 # Stili CSS responsive, dialoghi cartoon, diario e toast
│   ├── data/
│   │   ├── locales/
│   │   │   └── it.json           # Localizzazione italiana di tutti i testi di gioco
│   │   ├── dialogues.json        # Struttura dei nodi e scelte di dialogo (chiavi i18n)
│   │   ├── quests.json           # Definizione missioni e stadi (chiavi i18n)
│   │   └── collectibles.json     # Punti di spawn e configurazione collezionabili
│   ├── core/
│   │   ├── Game.ts               # Game loop con delta time, update/render, coordinamento sistemi
│   │   ├── GameState.ts          # Macchina a stati (Loading, Menu, Playing, Dialogue, Paused)
│   │   └── EventBus.ts           # Bus di eventi tipizzato per comunicazione disaccoppiata
│   ├── systems/
│   │   ├── LocalizationSystem.ts # Risoluzione dinamica chiavi i18n con interpolazione parametri
│   │   ├── DialogueSystem.ts     # Macchina a stati dei dialoghi e serializzazione POJO
│   │   ├── QuestSystem.ts        # Gestione missioni, inventario, progresso nebbia e POJO
│   │   ├── InteractionSystem.ts  # Rilevamento vicinanza target (NPC, cerchio pietre) e prompt
│   │   ├── InputManager.ts       # Gestore universale input con sospensione sicura dei comandi
│   │   ├── CameraController.ts   # Telecamera 3a persona orbitale con smooth damping
│   │   └── PhysicsSystem.ts      # Collisioni e ground detection con three-mesh-bvh
│   ├── entities/
│   │   ├── Player.ts             # Controller di Pip (movimento, salto, gravità, animazioni)
│   │   ├── ProceduralPip.ts      # Modello 3D procedurale di Pip con materiali toon
│   │   ├── NPC.ts                # Nonna Bussola all'osservatorio e telescopio astronomico
│   │   └── Collectibles.ts       # 1° Frammento magico dell'Atlante, conchiglie, funghi, stelle
│   ├── world/
│   │   ├── Island.ts             # Terreno collinare low-poly con viraggio colore al risveglio
│   │   └── Environment.ts        # Sole toon, mare animato, nebbia dinamica con transizione animata
│   └── ui/
│       ├── DialogueBox.ts        # Box dialogo responsive per smartphone (textContent sicuro)
│       ├── JournalUI.ts          # Schermata Diario del Cartografo (missioni, frammenti, reperti)
│       ├── NotificationBanner.ts # Toast animato a comparsa per oggetti raccolti
│       └── TouchOverlay.ts       # Joystick virtuale e pulsanti touch per smartphone con resetInputs
└── tests/
    ├── game_math.test.ts         # Test matematici di movimento e telecamera
    ├── player_physics.test.ts    # Test fisica di Pip (velocità, gravità, salto)
    ├── terrain_collision.test.ts # Test rilevamento terreno e scivolamento ostacoli
    ├── quest_system.test.ts      # Test stadi missioni, collezionabili, nebbia e POJO
    ├── dialogue_system.test.ts   # Test nodi dialoghi, opzioni, azioni ed eventi
    └── collectibles.test.ts      # Test rivelazione frammento con lanterna e raggio pickup
```

## 2. Flusso dei Sistemi e Architettura Disaccoppiata
I sistemi non comunicano mai tramite accoppiamento diretto stretto, ma interagiscono via `EventBus`:
- `dialogue-action` $\rightarrow$ `QuestSystem`: avanza lo stadio della missione quando Nonna Bussola affida il compito a Pip.
- `fragment-collected` $\rightarrow$ `Environment` e `Island`: fa scattare l'interpolazione animata che dirada la nebbia, scalda il colore del cielo e ravviva l'erba.
- `dialogue-started` / `journal-opened` $\rightarrow$ `InputManager`: sospende istantaneamente il movimento di Pip e la rotazione della camera, azzerando i puntatori touch del joystick.
- `dialogue-closed` / `journal-closed` $\rightarrow$ `InputManager`: ripristina i controlli di gioco.
