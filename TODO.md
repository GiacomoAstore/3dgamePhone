# Roadmap & Backlog (TODO)

<!--
Ultima modifica: 2026-11-10 - v0.3.0 - Completamento Fase 3 (Atmosfera, Ciclo Circadiano, Web Audio e Impostazioni), pianificazione Fase 4
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
- [x] **Test Unitari**: 23/23 test verdi (compreso test di integrazione prima missione).

### ✅ Fase 3: Atmosfera, Ciclo Circadiano, Web Audio e Impostazioni (v0.3.0)
- [x] **Ciclo Giorno / Notte (`DayNightCycle`)**: Simulazione circadiana continua (giorno da 8 minuti) con archi polari realistici per Sole e Luna, intensità modulate ed elevazione sopra l'orizzonte.
- [x] **Color Grading Dinamico**: Interpolazione a 4 fasi (notte blu notte, alba rosa pesca, giorno turchese splendente, tramonto arancio corallo) per cielo, nebbia e luce ambientale.
- [x] **Sistema Particellare Unificato (`ParticleSystem`)**: 750 particelle raggruppate in un'unica draw call `THREE.Points` (lucciole pulsanti sui funghi, polline del vento, spuma d'onda sulla costa, stelle scintillanti di notte).
- [x] **Motore Web Audio Procedurale (`AudioSystem`)**: Sintesi nativa in codice puro (0 KB di file audio esterni): passi di Pip, salto cartoon, toggle lanterna, chime di raccolta, fanfara del frammento e rumore d'onda/brezza marina con LFO a 0.25 Hz. Sblocco automatico tramite gesture su "Inizia Esplorazione".
- [x] **Pannello Impostazioni Qualità e Volumi (`QualitySettingsUI`)**: Modale HUD (icona ⚙️) con selettore profili (Bassa, Media, Alta) per scalare al volo DPR (1.0x, 1.4x, 2.0x), ombre (disattivate, base, PCFSoft) e particelle (250, 500, 750), più slider per i 3 canali di volume.
- [x] **Test Unitari e Integrazione**: 38/38 test verdi (aggiunti test per ciclo giorno/notte, audio system e particle system).

---

## 🎯 Prossimi Obiettivi: Fase 4 (Salvataggio, PWA e Seconda Isola)
- [ ] **Sistema di Salvataggio Versionato (`SaveSystem`)**: Serializzazione su `localStorage` / `IndexedDB` dello stato di Pip (posizione, lanterna), quest completate, diario, frammenti e opzioni audio/video (formato versionato v1).
- [ ] **PWA (Progressive Web App)**: Web App Manifest, Service Worker per caching offline, icone touch e supporto full-screen senza barre del browser.
- [ ] **Seconda Isola dell'Arcipelago (Isola dei Fari / Funivia)**: Collegamento tramite barchetta a remi o piattaforma semovente, nuovi NPC e secondo frammento dell'Atlante Vivo.
- [ ] **Valutazione Integrazione Modelli GLB Esterni**: Modelli a basso poligono con licenza CC0 (Kenney) o continuazione con forme procedurali ottimizzate.

---

## 🐛 Bug Noti
*(Nessun bug attivo).*

---

## 💳 Debito Tecnico
- **Peso Bundle (~618 KB JS)**: Il bundle JS di produzione include l'intero Three.js e il wrapper BVH. Valutare code-splitting con `dynamic import()` qualora vengano caricate ulteriori isole o librerie ausiliarie.
- **Tooling e devDependencies (npm audit)**: Aggiornamento controllato del tooling di sviluppo (Vite, TypeScript, Vitest ed ESLint) per risolvere le vulnerabilità di librerie di supporto (`tinypool`, `@vitest/mocker`, `minimatch`), senza ricorrere a `--force`.
