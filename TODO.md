# Roadmap & Backlog (TODO)

<!--
Ultima modifica: 2026-11-11 - v0.3.3 - Integrazione Modelli 3D Cartoon CC0 (Kenney, Quaternius, KayKit)
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

### ✅ Fase 3 & Refinement (v0.3.0 - v0.3.2)
- [x] **Ciclo Giorno / Notte (`DayNightCycle`)**: 24 ore dinamiche (8 minuti), posizionamento Sole e Luna su arco celeste, calibrazione palette cromatiche (alba, mezzogiorno, tramonto, notte).
- [x] **Accessibilità Visiva e Oraria**: Opzione per bloccare l'ora, "Notti Chiare" con intensità minima sollevata a 0.65 e transizioni smorzate esponenzialmente per evitare cambi bruschi.
- [x] **Sintesi Audio Procedurale e Fallback (`AudioSystem`)**: Generatore sonoro Web Audio in tempo reale (brezza marina modulata, passi di Pip, salto cartoon, accensione lanterna, fanfare collezionabili). Supporto trasparente per file audio esterni (`playMusicTrack`, `playSoundFile`) con ripiego automatico su sintesi procedurale in caso di risorsa mancante o offline.
- [x] **Ciclo di Vita Web Audio Mobile**: Sblocco su eventi `touchstart`, `pointerdown`, `mousedown`, `click` (conforme autoplay policy) e ripresa automatica su `visibilitychange` da background/chiamata.
- [x] **Cel-Shading a Gradini Discreti & Contorno Toon**: Generazione texture 1D a 3 gradini per shading cartoon; contorno Inverted Hull applicato al modello di Pip con stacco visivo rispetto al terreno.
- [x] **Contorno Toon Adattivo**: Disattivazione automatica dell'outline su profilo "Bassa" (`setQuality('low')`) per azzerare il costo di render su dispositivi modesti.
- [x] **Particelle d'Atmosfera Soffici (`ParticleSystem`)**: Texture a gradiente radiale con blending additivo per lucciole e polline soave, eliminando i pixel squadrati opachi.
- [x] **Priorità Unica dell'Azione (`ActionPriorityDispatcher`)**: Consumo gerarchico dell'azione (Dialogo -> Interazione NPC -> Lanterna) senza debounce a timer.
- [x] **Fisica Pendenze & Ground-Snapping (`PhysicsSystem.ts`)**: Tolleranza pendenze $Y \ge 0.55$, scivolamento tangenziale muri e snapping verticale fino a $0.50\,\text{m}$ in discesa.
- [x] **Guida Controlli HUD & Modal Illustrato**: Barra rapida tasti a schermo e modal `#help-modal` consultabile con `H` o tocco pulsante.
- [x] **Rifacimento Grafico Cartoon 3D Solido**: Geometria isola solida con scogliere a $-5.0\,\text{m}$ e fondale marino, piazza osservatorio in pietra e legno, alberi cartoon con chiome a nuvola, Pip e Nonna Bussola espressivi con accessori modellati e sciarpa svolazzante.
- [x] **Integrazione Modelli 3D Cartoon CC0 (v0.3.3)**: Modulo `AssetManager.ts` con caching e cel-shading; integrazione `Rogue_Hooded.glb` (Pip con animazioni scheletriche), `Mage.glb` (Nonna Bussola), `BoatWSail.glb` (barca a vela ormeggiata al molo), querce modellate Kenney, forziere antico dei pirati al cerchio di pietre, barili, cartello in legno, falò e volpina animata `Fox.glb`.
- [x] **Pannello Impostazioni & Auto-Degrade (`QualitySettingsUI`)**: Rilevamento automatico profilo (Mobile $\rightarrow$ Media, Desktop $\rightarrow$ Alta), persistenza su `localStorage`, declassamento automatico su frame drop persistenti con protezione anti-falsi positivi (warm-up 5s, tab nascosta, cooldown 30s) e toast con pulsante "Annulla".
- [x] **Strumenti Diagnostici e Benchmark**:
  - `?debug=1`: Overlay con FPS medio, minimo, 1% low, draw calls, triangoli, geometrie, texture e monitor multi-touch da `TouchOverlay`.
  - `?benchmark=1`: Benchmark di 30s deterministico con traiettoria orbitale automatica, ora bloccata a mezzogiorno e auto-degrade disattivato.
  - Copia report negli appunti con fallback automatico su modal con `<textarea>` selezionabile per connessioni HTTP locali.
- [x] **Verifica Contrasto Notturno WCAG 2.1**: Test matematico relativo alle luminanze ITU-R BT.709 che prova contrasto silhouette $\ge 3.0:1$ e contorno $\ge 3.5:1$.
- [x] **Suite di Test Completa**: 69 test in 18 file, tutti verdi (`npm test`).
- [x] **Checklist di Verifica Manuale**: File `tests/MANUAL_CHECKLIST.md` creato per la validazione fisica su smartphone e desktop.

---

## 🎯 Prossimi Obiettivi: Fase 4 (Salvataggi, Viaggio e Seconda Isola)
- [ ] **Sistema di Salvataggio Persistente (v0.4.0)**:
  - Salvataggio automatico versionato in `localStorage` o `IndexedDB` (posizione di Pip, stato quest, inventario frammenti e reperti, impostazioni audio/grafica).
  - Slot di salvataggio e opzione per ricominciare l'esplorazione.
- [ ] **Il Capitano Marea e il Veliero**:
  - Nuovo NPC (Capitano Marea) al pontile dell'Isola della Bussola.
  - Sequenza di transizione nautica per raggiungere la seconda isola.
- [ ] **Seconda Isola dell'Arcipelago**:
  - Nuova isola con topografia differente (es. scogliere a picco, grotte con funghi luminescenti o piccolo faro).
  - Nuova missione per il 2° Frammento dell'Atlante Vivo.
- [ ] **Asset 3D Modulari**: Valutazione integrazione modelli GLB gratuiti (Kenney Nature Kit / Town Kit) con licenze verificate.

---

## 🐛 Bug Noti
*(Nessun bug attivo).*

---

## 💳 Debito Tecnico
- **Peso Bundle JS (~640 KB minificato, ~167 KB gzip)**: Dovuto essenzialmente al core di Three.js e BVH. Nella Fase 4, all'introduzione di modelli binari GLB e tracce audio, implementare il code-splitting con `dynamic import()` per mantenere il download iniziale sotto la soglia critica mobile.
- **Aggiornamento Vitest / Tinypool**: ESLint è stato aggiornato a `9.39.5` (vulnerabilità `@eslint/plugin-kit` risolta). La migrazione di Vitest e Tinypool a Vitest 5.x è programmata come major upgrade dedicato, previa verifica della compatibilità con le API di mocking e con Vite 6 (ADR 004).
- **Shader Nebbia Avanzato**: La nebbia utilizza `THREE.FogExp2` configurata in `environment.json`; valutabile l'aggiunta di un raggio di dissolvenza volumetrico attorno alla lanterna di Pip.
