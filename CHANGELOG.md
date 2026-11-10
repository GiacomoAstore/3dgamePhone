# Changelog

Tutte le modifiche a questo progetto vengono registrate cronologicamente in questo documento seguendo il Semantic Versioning (`MAGGIORE.MINORE.PATCH`).

## [0.3.0] - 2026-11-10

### Aggiunto
- **Consumatore dell'Azione a Priorità Rigorosa (`src/systems/ActionPriorityDispatcher.ts`)**:
  - Sostituito integralmente il vecchio debounce temporale con un unico dispatcher dell'azione a 3 livelli di priorità:
    1. Se un dialogo è attivo -> avanza/chiude il dialogo.
    2. Se un bersaglio interattivo è nel raggio (es. Nonna Bussola) -> interagisce con il bersaglio.
    3. Solo se non c'è nulla con cui interagire -> accende o spegne la Lanterna Magica.
  - Aggiunta suite di test dedicata in `tests/action_priority.test.ts`.
- **Supporto File Audio Esterni con Ripiego Procedurale (`src/systems/AudioSystem.ts`)**:
  - Aggiunti i metodi asincroni `playMusicTrack(url, fallback)` e `playSoundFile(url, fallback)` per consentire l'integrazione di tracce musicali CC0 (mp3/ogg).
  - In caso di assenza del file (404), codec non supportato o modalità offline, si attiva automaticamente e senza crash il motore sonoro procedurale (brezza marina o chime).
  - Aggiunti test dedicati in `tests/audio_file_fallback.test.ts`.
- **Stile Cel-Shading a Gradini Discreti e Contorni (`src/world/ToonShaderUtils.ts`)**:
  - Generazione a codice di una `DataTexture` 1D a 3 gradini (`[100, 190, 255]`) con `NearestFilter` applicata a `MeshToonMaterial.gradientMap` su Pip (`ProceduralPip.ts`) e sul terreno (`Island.ts`), producendo stacchi netti di luce cartoon senza gradienti realistici sfumati.
  - Implementata la tecnica di contorno Inverted Hull (silhouette esterna estrusa lungo le normali con `THREE.BackSide`).
- **Accessibilità Circadiana e Ciclo Giorno / Notte Avanzato (`src/systems/DayNightCycle.ts`)**:
  - Possibilità di bloccare l'ora del giorno (`setHourLocked()`) e modulare la velocità (`setTimeScale()`).
  - Modalità **Notti Chiare** (`readableNight: true`), con pavimento di luce ambientale elevato a 0.65 e luna potenziata per rendere il gioco perfettamente visibile e contrastato su schermi di smartphone all'aperto.
  - Modalità **Transizioni Morbide** con smorzamento esponenziale stabile anti-overshoot per prevenire sbalzi improvvisi di luce.
  - Aggiunti test dedicati in `tests/day_night_options.test.ts`.
- **Pannello Impostazioni Qualità con Auto-Degrade e Persistenza (`src/ui/QualitySettingsUI.ts`)**:
  - Rilevamento automatico del profilo iniziale in base al dispositivo (Mobile/Touch -> Media, Desktop -> Alta).
  - Persistenza automatica della scelta utente su `localStorage` (`brumavento_settings`).
  - Sistema di **Auto-Degrade**: monitora il framerate e, qualora gli FPS restino inferiori a 26 per oltre 5 secondi consecutivi, riduce automaticamente di un gradino il preset grafico (High -> Medium -> Low) visualizzando un toast di notifica.
  - Tutti i nuovi testi localizzati rigorosamente in `src/data/locales/it.json` e iniettati con `textContent`.
  - Aggiunti test dedicati in `tests/quality_persistence.test.ts`.
- **Standard di Benchmark e Dispositivo di Riferimento**:
  - Definito lo smartphone Android medio di riferimento (GPU Mali-G52 / Adreno 618, 1080p, $\ge 30$ FPS) e desktop con GPU integrata ($\ge 60$ FPS).
  - Formalizzato il percorso benchmark di 30 secondi (spawn, osservatorio, scogliera con particelle attive).
- **Nuove Decisioni Architetturali**:
  - Registrate ADR 006 (Atmosfera, Web Audio e Ciclo Circadiano) e ADR 007 (Priorità Azione, Fallback Audio, Cel-Shading, Auto-Degrade e Benchmark) in `DECISIONI.md`.
- **Aggiornamento Licenze Asset**:
  - In `ASSETS.md` i pacchetti Kenney e Quaternius sono stati esplicitamente contrassegnati come *"Licenza da verificare dall'utente"*, in attesa di controllo diretto da parte dell'utente prima di qualsiasi import.
- **Suite di Test Completa**:
  - 14 file di test e 54/54 test automatici superati con successo con Vitest.

### Modificato
- `src/core/Game.ts`: integrato `ActionPriorityDispatcher`, eliminati tutti i debounce temporali (`actionCooldown`), integrato auto-degrade per FPS bassi e persistenza.
- `src/systems/LocalizationSystem.ts`: aggiunto helper statico `LocalizationSystem.t()` accessibile globalmente.
- `src/ui/DialogueBox.ts`: aggiunto metodo pubblico `advance()` per consumare l'azione durante i dialoghi.
- `src/entities/ProceduralPip.ts`, `src/world/Island.ts`: integrato `gradientMap` a 3 gradini discreti.
- `ASSETS.md`: aggiornata la tabella e le note di avviso per la verifica manuale delle licenze.
- `README.md`, `ARCHITETTURA.md`, `TODO.md`: documentazione completamente allineata ai nuovi standard.
- `index.html`: aggiunto pulsante impostazioni ⚙️ nell'header HUD.
- `src/style.css`: aggiunti stili per il pulsante impostazioni, card modale, bottoni qualità e slider touch.
- `VERSION`, `package.json`: avanzamento versione a 0.3.0.
- `TODO.md`, `README.md`, `ARCHITETTURA.md`, `ASSETS.md`: aggiornamento documentazione.

### Corretto
- Risolto errore in ambiente Node per `window is not defined` durante l'inizializzazione dei test di `AudioSystem`.
- Rimossi campi non letti e variabili inutilizzate in `QualitySettingsUI` e `ParticleSystem` per soddisfare `tsc` con `noUnusedLocals: true`.

### Rimosso
- Nessuna funzionalità rimossa.

### File toccati
- `VERSION`, `package.json`: incremento versione a 0.3.0.
- `src/systems/AudioSystem.ts`: motore audio sintetico Web Audio API.
- `src/systems/DayNightCycle.ts`: simulazione circadiana e orbite celesti.
- `src/world/ParticleSystem.ts`: sistema particelle unificato a 1 draw call.
- `src/world/Environment.ts`: integrazione sole, luna, particelle e ciclo giorno/notte.
- `src/ui/QualitySettingsUI.ts`: modale impostazioni qualità grafica e volumi.
- `src/entities/Player.ts`: emissione eventi audio di passi e salto.
- `src/core/Game.ts`: orchestrazione audio, impostazioni e profilo qualità.
- `src/main.ts`: gestione sblocco audio policy al primo gesto.
- `index.html`, `src/style.css`: pulsante HUD ⚙️ e fogli di stile impostazioni.
- `tests/day_night_cycle.test.ts`, `tests/audio_system.test.ts`, `tests/particle_system.test.ts`: suite di test Fase 3.
- `DECISIONI.md`, `TODO.md`, `README.md`, `ARCHITETTURA.md`, `ASSETS.md`, `CHANGELOG.md`: documentazione obbligatoria.

### Motivo
- Completamento della Fase 3 (Atmosfera, Ciclo Giorno/Notte, Audio Sintetico e Menu Qualità) come approvato e richiesto dall'utente.

---

## [0.2.0] - 2026-11-10

### Aggiunto
- **Contenuti Data-Driven e Localizzazione (i18n)**:
  - File di localizzazione `src/data/locales/it.json` contenente tutte le stringhe testuali di gioco (dialoghi, missioni, collezionabili, notifiche e prompt).
  - Sistema di localizzazione dinamica `src/systems/LocalizationSystem.ts` con risoluzione chiavi e interpolazione parametri `{param}`.
  - Strutture JSON per dialoghi (`src/data/dialogues.json`), missioni (`src/data/quests.json`) e punti di spawn dei collezionabili (`src/data/collectibles.json`).
- **Primo NPC (Nonna Bussola)**:
  - Modello procedurale 3D di Nonna Bussola (`src/entities/NPC.ts`) con gonna, scialle crema, occhiali, chignon argentato, bastone da passeggio e telescopio astronomico su treppiede in ottone.
  - Dialoghi contestuali dinamici che cambiano a seconda dello stato della prima missione (inizio, ricerca in corso, completamento).
- **Lanterna Magica e 1° Frammento dell'Atlante Vivo**:
  - Il 1° frammento fluttuante presso l'antico cerchio di pietre della scogliera presenta un bagliore tenue indizio a lanterna spenta e si rivela con piena luce dorata quando la lanterna di Pip è accesa (`src/entities/Collectibles.ts`).
  - Timer di soccorso con suggerimento testuale discreto se il giocatore cerca per più di 35 secondi senza trovare il frammento.
  - Collezionabili sparsi sull'isola: conchiglie marine sulla spiaggia, funghi luminosi sotto gli alberi e stelle marine sul pontile.
- **Interfaccia Utente Mobile-First e Sicura**:
  - `src/ui/DialogueBox.ts`: scheda di dialogo cartoon per smartphone e desktop con pulsanti grandi touch e avanzamento sicuro tramite `textContent` (zero `innerHTML`).
  - `src/ui/JournalUI.ts`: Diario del Cartografo apribile con `Tab`, `Esc` o icona `📖` nell'HUD, con tracciamento missione, indizi, conteggio frammenti (1/7) e reperti.
  - `src/ui/NotificationBanner.ts`: toast animato a comparsa per confermare la raccolta degli oggetti.
  - `src/systems/InteractionSystem.ts`: visualizzazione contestuale del badge `[E] Parla con Nonna Bussola` o dell'indizio sulla presenza magica.
- **Ritirata della Nebbia e Viraggio Cromatico**:
  - Al recupero del frammento scatta una transizione animata fluida di 3.5s (`src/world/Environment.ts`) che riduce la densità della nebbia a 0.008, scalda il colore del cielo da `#a3b8cc` a `#8ecae6`, intensifica la luce solare e trasforma l'erba dell'isola (`src/world/Island.ts`) in un verde smeraldo vivido (`#38b000`).
- **Sospensione Comandi e Gestione Stati**:
  - Blocco pulito di movimento e camera durante dialoghi o diario aperti con reset istantaneo dei touch pointer (`TouchOverlay.resetInputs()`) per evitare che il joystick rimanga bloccato.
- **Stato Serializzabile Puro (POJO)**:
  - `QuestSystem` e `DialogueSystem` gestiscono lo stato sotto forma di plain object serializzabile con `JSON.stringify()` in vista dei salvataggi della Fase 4.
- **Suite di Test Unitari**:
  - Aggiunti test per `QuestSystem` (`tests/quest_system.test.ts`), `DialogueSystem` (`tests/dialogue_system.test.ts`) e `Collectibles` (`tests/collectibles.test.ts`). Totale test: 22/22 superati.
- **Decisioni Architetturali**:
  - Registrata ADR 005 (Architettura data-driven, localizzazione e transizione nebbia) in `DECISIONI.md`.

### Modificato
- Aggiornato `README.md` con la guida completa alla prima missione e i controlli per interagire con Nonna Bussola e aprire il Diario.
- Aggiornato `TODO.md` con il completamento di tutti gli obiettivi della Fase 2 e pianificazione della Fase 3.
- Aggiornato `ARCHITETTURA.md` con l'albero dei file completo e il diagramma dei nuovi moduli.

### Corretto
- Risolto errore di compilazione per variabile non utilizzata in `src/world/Environment.ts`.
- Sostituita la formula statica della nebbia con transizione animata e dissolvenza marcata per rendere l'effetto della prima missione chiaramente visibile.

### Rimosso
- Nessuna funzionalità rimossa.

### File toccati
- `VERSION`, `package.json`: incremento versione a 0.2.0.
- `src/data/locales/it.json`: dizionario di localizzazione italiana.
- `src/data/dialogues.json`, `src/data/quests.json`, `src/data/collectibles.json`: definizioni data-driven.
- `src/systems/LocalizationSystem.ts`: sistema i18n.
- `src/systems/DialogueSystem.ts`, `src/systems/QuestSystem.ts`, `src/systems/InteractionSystem.ts`: logica gameplay e POJO.
- `src/systems/InputManager.ts`, `src/ui/TouchOverlay.ts`: sospensione input e reset joystick.
- `src/entities/NPC.ts`, `src/entities/Collectibles.ts`: modelli procedurali e logica di raccolta.
- `src/ui/DialogueBox.ts`, `src/ui/JournalUI.ts`, `src/ui/NotificationBanner.ts`: componenti UI overlay.
- `src/world/Environment.ts`, `src/world/Island.ts`: transizione nebbia, cielo e viraggio colore erba.
- `src/core/Game.ts`: coordinamento sistemi, interazione NPC/lanterna e gestione stati.
- `index.html`, `src/style.css`: template e fogli di stile dialoghi, diario e toast.
- `tests/quest_system.test.ts`, `tests/dialogue_system.test.ts`, `tests/collectibles.test.ts`: test automatici.
- `README.md`, `ARCHITETTURA.md`, `TODO.md`, `DECISIONI.md`, `CHANGELOG.md`: documentazione obbligatoria.

### Motivo
- Completamento della Fase 2 (Interazione e prima missione) di Brumavento secondo le specifiche di design e le richieste dell'utente.

---

## [0.1.0] - 2026-11-10

### Aggiunto
- **Tooling e Fondamenta (Fase 0)**:
  - Configurazione deterministica del progetto con versioni esatte bloccate: Three.js `0.180.0`, Vite `6.4.6`, TypeScript `5.7.3`, three-mesh-bvh `0.9.18`, Vitest `3.2.7`, ESLint `9.20.1` e Prettier `3.5.1`.
  - Configurazione ESLint con `@typescript-eslint/parser` e formattazione con Prettier.
  - Creata documentazione di progetto: `README.md`, `ARCHITETTURA.md`, `CHANGELOG.md`, `DECISIONI.md`, `TODO.md`, `ASSETS.md`, `DOCS_DESIGN.md`.
  - Registrate ADR 001 (Regole vincolanti IA), ADR 002 (Scelta versioni stabili tooling), ADR 003 (Performance budget mobile e DPR clamping) e ADR 004 (Analisi npm audit).
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
