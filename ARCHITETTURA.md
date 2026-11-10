# Architettura del Progetto

<!--
Ultima modifica: 2026-11-10 - v0.1.0 - Inizializzazione struttura architetturale
-->

Questo documento descrive la struttura delle cartelle, i moduli principali, le loro interazioni e il diagramma del flusso di gioco.

## 1. Struttura delle Cartelle
*(Struttura iniziale di documentazione e configurazione; verrà espansa con i sorgenti del codice)*
```text
3dgamePhone/
├── .gitignore         # File esclusi dal controllo versione
├── GEMINI.md          # Regole vincolanti di sviluppo per l'IA
├── AGENTS.md          # Riferimento regole agenti
├── README.md          # Panoramica del gioco e avvio
├── ARCHITETTURA.md    # Architettura e moduli del gioco
├── CHANGELOG.md       # Tracciamento versioni e modifiche
├── DECISIONI.md       # Registro delle decisioni di progetto (ADR)
├── TODO.md            # Roadmap e backlog dei task
└── VERSION            # File indicatore della versione corrente (0.1.0)
```

## 2. Moduli Principali (Target architetturale)
In base alle regole stabilite nella Sezione 3 di [GEMINI.md](file:///c:/Users/user/Desktop/workspace/3dgamePhone/GEMINI.md), l'architettura rispetterà la separazione delle responsabilità:
- **Core / Game Loop**: Gestione del tempo (`delta time`), ciclo `update` (logica) e `render` (grafica).
- **State Machine**: Macchina a stati per gestire Menu, In-Game, Pausa, Game Over.
- **Input System**: Gestione dei comandi touch/mobile e tastiera/mouse, disaccoppiati dalla logica.
- **Rendering / 3D Graphics**: Gestione di scene, telecamere, luci, mesh.
- **Entities / Components**: Sistema a componenti/composizione per le entità di gioco.
- **Audio System**: Gestione suoni ed effetti con caricamento centralizzato.
- **Data & Config**: Gestione parametri (bilanciamento, statistiche) tramite file esterni (JSON/YAML).

## 3. Diagramma Flusso di Gioco (Text Flow)
```text
[Avvio Applicazione]
       │
       ▼
[Inizializzazione Sistemi] (Config, Audio, Input, Renderer)
       │
       ▼
[State Machine: MENU] ◄───────────────┐
       │                              │
       ▼ (Start Game)                 │
[State Machine: PLAYING]              │
   ├── Input Handling                 │
   ├── Logic Update (Delta Time)      │ (Restart / Return to Menu)
   └── Render Pipeline                │
       │                              │
       ├──► [State Machine: PAUSED] ──┤
       │                              │
       └──► [State Machine: GAMEOVER] ┘
```

