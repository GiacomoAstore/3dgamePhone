# Roadmap & Backlog (TODO)

<!--
Ultima modifica: 2026-11-10 - v0.2.0 - Completamento Fase 2 (Interazione e Prima Missione), pianificazione Fase 3
-->

## 🏁 Fasi Completate

### ✅ Fase 0: Fondamenta e Tooling (v0.1.0)
- [x] Regole vincolanti IA (`GEMINI.md`, `AGENTS.md`) e Game Design (`DOCS_DESIGN.md`).
- [x] Setup progetto con Three.js `0.180.0`, Vite `6.4.6`, TypeScript `5.7.3`, ESLint e Prettier.
- [x] Suite di test automatizzati con Vitest e repository Git con branch `main` e tag `v0.1.0`.

### ✅ Fase 1: Il Personaggio e il Mondo Minimo (v0.1.0)
- [x] Isola della Bussola procedurale con rilievi, vegetazione e pontile.
- [x] Pip procedurale con materiali toon, camminata, corsa, salto e animazioni.
- [x] Collisioni capsule-mesh e rilevamento terreno con `three-mesh-bvh`.
- [x] Telecamera orbitale in 3a persona con smooth damping.
- [x] Joystick virtuale touch responsive per smartphone e clamping mobile `DPR <= 2.0`.

### ✅ Fase 2: Interazione e Prima Missione (v0.2.0)
- [x] **Dati e Localizzazione (i18n)**: Contenuti in `src/data/locales/it.json`, `dialogues.json`, `quests.json` e `collectibles.json`.
- [x] **Lanterna Magica**: Meccanica di rivelazione del frammento nascosto presso l'antico cerchio di pietre della scogliera, con bagliore indizio a lanterna spenta.
- [x] **Collezionabili**: Conchiglie marine, funghi luminosi e stelle marine con contatori e banner notifica.
- [x] **Primo NPC (Nonna Bussola)**: Modello 3D procedurale con telescopio dell'osservatorio, prompt di interazione e dialoghi dinamici in base allo stato della quest.
- [x] **Box di Dialogo**: Scheda cartoon responsive per smartphone e PC con pulsanti di risposta touch e avanzamento da tastiera, con testi renderizzati in modo sicuro tramite `textContent`.
- [x] **Diario del Cartografo (`JournalUI`)**: Schermata con missione attiva, indizi se bloccati, frammenti (1/7) e reperti raccolti (apribile con `Tab`, `Esc` o icona `📖`).
- [x] **Ritirata della Nebbia e Viraggio Cromatico**: Transizione animata fluida che dirada la nebbia a 0.008, scalda il cielo verso turchese dorato e ravviva l'erba dell'isola.
- [x] **Sospensione Comandi**: Blocco pulito di movimento e camera durante dialoghi o diario, con reset istantaneo dei touch pointer del joystick.
- [x] **Stato Serializzabile (POJO)**: `QuestSystem` e `DialogueSystem` gestiti come oggetti puri per i salvataggi della Fase 4.
- [x] **Test Unitari**: 22/22 test verdi (compresi nuovi test per quest, dialoghi e collezionabili).

---

## 🎯 Prossimi Obiettivi: Fase 3 (Atmosfera & Rifiniture)
- [ ] Materiali Toon personalizzati con sfumature a gradini discrete e contorni (outline opzionale).
- [ ] Ciclo Giorno / Notte dinamico (alba, mezzogiorno dorato, tramonto corallo, notte stellata).
- [ ] Sistema particellare (lucciole notturne attorno ai funghi, polline, spuma delle onde).
- [ ] Audio ed effetti sonori con Howler.js (onde del mare, passi, accensione lanterna, fanfara recupero frammento).
- [ ] Valutazione integrazione modelli GLB gratuiti (Kenney Nature Kit / Town Kit) in sostituzione graduale delle forme procedurali.

---

## 🐛 Bug Noti
*(Nessun bug attivo).*

---

## 💳 Debito Tecnico
- **Peso Bundle Iniziale e Asset 3D (~600 KB JS)**: L'attuale output di build minificato è di ~600 KB (~157 KB gzip), dovuto quasi interamente al core di Three.js. Quando verranno introdotti modelli binari GLB e tracce audio, sarà necessario valutare il code-splitting con `dynamic import()` e compressione Draco/meshopt/KTX2 per rispettare il budget mobile-first (<15-20 MB di caricamento iniziale).
- **Tooling e devDependencies (npm audit)**: Aggiornamento controllato del tooling di sviluppo (Vite, TypeScript, Vitest ed ESLint) per risolvere le segnalazioni di vulnerabilità relative a pacchetti di test e linting (`tinypool`, `@vitest/mocker`, `minimatch`), senza ricorrere a `--force`.
- **Shader Nebbia**: La nebbia attuale utilizza `THREE.FogExp2` semplice; nella Fase 3 potrà essere integrato uno shader per dissolvenza volumetrica o sferica localizzata attorno alla lanterna di Pip.
