# Roadmap & Backlog (TODO)

<!--
Ultima modifica: 2026-11-11 - v0.3.9 - Riduzione draw calls (<100) completata, test scheletro NPC e camminata continua E2E, perimetrazione rigorosa Fasi 4 e 5
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
- [x] **Ritirata della Nebbia e Viraggio Cromatico**: Transizione animata fluida che dirada la nebbia a 0.008 (target dinamico 0.0062 per il 1° frammento), scalda il cielo verso turchese dorato e ravviva l'erba dell'isola.
- [x] **Sospensione Comandi**: Blocco pulito di movimento e camera durante dialoghi o diario, con reset istantaneo dei touch pointer del joystick.
- [x] **Stato Serializzabile (POJO)**: `QuestSystem` e `DialogueSystem` gestiti come oggetti puri per i salvataggi della Fase 4.

### ✅ Fase 3 & Polishing Pre-Fase 4 (v0.3.0 - v0.3.9)
- [x] **Ciclo Giorno / Notte (`DayNightCycle`)**: 24 ore dinamiche (8 minuti), Sole e Luna su arco celeste, palette cromatiche (alba, mezzogiorno, tramonto, notte).
- [x] **Accessibilità Visiva e Oraria**: "Notti Chiare" con intensità ambientale a 0.65 (vs 0.35 standard) e transizioni smorzate esponenzialmente.
- [x] **Sintesi Audio Procedurale e Fallback (`AudioSystem`)**: Generatore Web Audio in tempo reale (brezza marina modulata, passi di Pip, salto, accensione lanterna, fanfare).
- [x] **Ciclo di Vita Web Audio Mobile**: Sblocco su eventi utente (autoplay policy) e ripresa su `visibilitychange`.
- [x] **Cel-Shading a Gradini Discreti & Contorno Toon**: Texture 1D a 3 gradini per shading cartoon; contorno Inverted Hull adattivo con disattivazione su profilo Bassa.
- [x] **Particelle d'Atmosfera Soffici (`ParticleSystem`)**: Lucciole, polline del vento, spuma marina e stelle in batching efficiente.
- [x] **Priorità Unica dell'Azione (`ActionPriorityDispatcher`)**: Consumo gerarchico dell'azione (Dialogo -> Interazione NPC -> Lanterna).
- [x] **Fisica Pendenze & Ground-Snapping (`PhysicsSystem.ts`)**: Tolleranza pendenze $Y \ge 0.55$, scivolamento tangenziale muri e snapping verticale fino a $0.60\,\text{m}$ in discesa.
- [x] **Integrazione Modelli 3D Cartoon CC0**: `AssetManager.ts` con caching e cel-shading; `Rogue_Hooded.glb` (Pip), `Mage.glb` (Nonna Bussola), `BoatWSail.glb`, querce Kenney, forziere pirata, barili, cartello in legno, falò e volpina animata `Fox.glb`.
- [x] **Pannello Impostazioni & Auto-Degrade (`QualitySettingsUI`)**: Rilevamento automatico profilo (Mobile $\rightarrow$ Media, Desktop $\rightarrow$ Alta), persistenza su `localStorage`, declassamento automatico su frame drop persistenti (<24 FPS per 5.0s).
- [x] **Riduzione Draw Calls Sotto il Budget (< 100)**:
  - `InstancedMesh` per 5 cespugli, 25 bacche, 24 ricettacoli di margherite e 120 petali di fiore (-170 draw calls).
  - Rimozione fisica dal scene graph degli alberi e fantocci procedurali quando i modelli GLB sono caricati (-72 draw calls).
  - Geometrie statiche unite con `BufferGeometryUtils.mergeGeometries`: balaustra (11 colonne $\rightarrow$ 1 mesh), pontile (13 elementi $\rightarrow$ 2 mesh), cerchio runico e lanterna.
  - Profilo Bassa con ombre e outline disattivati.
  - Risultato misurato con `tests/profile_draw_calls.mjs`: **93 draw call** (budget <100 ampiamente centrato).
- [x] **Test E2E Reale su Google Chrome (`npm run test:chrome`)**: Validazione automatizzata CDP su browser reale con verifica mid-motion `Running_A`, spostamento reale > 1.5m, verifica scheletro Nonna Bussola (mani sotto le spalle, no T-pose) e completamento Quest 1 con camminata continua passo dopo passo senza teletrasporti.
- [x] **Test UI Completi su Chrome (`npm run test:ui`)**: 10 screenshot catturati di tutti i modal, bottoni, albero dei dialoghi e responsive mobile touch 390x844.
- [x] **Allineamento Parametri & DOCS_DESIGN**: Auto-degrade a 5.0s, notte a 0.35/0.65, nebbia target dinamica a 0.0062, tasto lanterna F e tracciabilità crittografica ASSETS.md con URL esatti di download.

---

## 🎯 Prossimi Obiettivi: Fase 4 (Salvataggi, Menu di Sistema, PWA e Crediti)

> [!IMPORTANT]
> **Perimetro Chiarito della Fase 4**: La Fase 4 include esclusivamente le funzionalità di persistenza, schermate di menu complete, Progressive Web App e rifinitura audio. Il viaggio in barca e la seconda isola appartengono alla Fase 5.

- [ ] **Sistema di Salvataggio Persistente (v0.4.0)**:
  - Schema dati versionato (`SaveStateV1`) salvato in `localStorage` o `IndexedDB`.
  - Salvataggio automatico: posizione e orientamento di Pip, stato quest (`QuestSystem`), inventario (frammenti e collezionabili), ora del giorno (`DayNightCycle`), impostazioni audio e grafiche.
  - Slot di salvataggio (Nuova Partita / Continua / Ripristina).
- [ ] **Schermate di Menu Complete**:
  - Menu Principale iniziale arricchito con opzioni "Nuova Avventura" e "Continua".
  - Menu di Pausa in-game (apribile con `Escape` o pulsante HUD) con opzioni "Riprendi", "Impostazioni", "Guida Controlli" e "Torna al Menu".
  - Schermata dei Crediti di gioco (riconoscimenti autori asset CC0 Kenney, KayKit, Quaternius e team di sviluppo).
- [ ] **Supporto Progressive Web App (PWA)**:
  - Web App Manifest (`manifest.webmanifest`) con icone responsive per schermata home smartphone.
  - Service Worker per caching offline di HTML, bundle JS/CSS e modelli 3D GLB.
  - Supporto per esecuzione standalone senza barra degli indirizzi del browser.
- [ ] **Persistenza Audio e Impostazioni**:
  - Salvataggio automatico di preferenze volume master, musica, effetti e modalità "Notti Chiare".

---

## ⛵ Fase 5 (Capitano Marea, Barca a Vela e Seconda Isola)

- [ ] **NPC Capitano Marea al Molo**:
  - Modello 3D toon e animazione idle del Capitano Marea ormeggiato al molo di legno.
  - Dialogo dedicato per il viaggio verso la nuova rotta marittima dopo il completamento della prima missione.
- [ ] **Sequenza di Navigazione Marittima**:
  - Transizione cinematica / navigazione interattiva della barca a vela `BoatWSail.glb` tra le onde del mare.
- [ ] **Seconda Isola dell'Arcipelago (Isola della Scogliera)**:
  - Nuova isola con scogliere ripide, faro marittimo o caverna luminescente.
  - Nuovi enigmi con rifrazione ottica della Lanterna Magica.
  - 2° Frammento dell'Atlante Vivo e nuovi collezionabili regionali.

---

## 🐛 Bug Noti
*(Nessun bug attivo).*

---

## 💳 Debito Tecnico e Manutenzione
- [x] ~~Riduzione draw call sotto il budget <100~~ (Risolto in v0.3.8: 93 draw calls).
- [ ] Rimozione opzionale dei 6 modelli GLB inutilizzati in `public/models/` (previa conferma dell'utente) per risparmiare 158.8 KB.
