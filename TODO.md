# Roadmap & Backlog (TODO)

<!--
Ultima modifica: 2026-11-11 - v0.3.7 - Test UI Chrome, Animazione NPC Idle e Risoluzione T-Pose
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
- [x] **Suite di Test Completa**: 75 test in 19 file, tutti verdi (`npm test`).
- [x] **Test E2E Reale su Google Chrome (`npm run test:chrome`)**: Suite automatizzata su Chrome headless reale via CDP che valida WebGL, spawn physically grounded, input WASD/movimento, interazione dialogo con Nonna Bussola e cattura screenshot ad alta risoluzione senza errori JS.
- [x] **Suite di Test UI Completa su Chrome (`npm run test:ui`)**: Validazione automatizzata di tutti gli 8 componenti UI (Start Screen, HUD, Modal Guida, Modal Diario, Modal Impostazioni, Interaction Badge, Dialogue Box e Responsive Mobile 390x844).
- [x] **Eliminazione T-Pose Nonna Bussola**: Animazione scheletrica `Idle_A` in loop continuo integrata nell'NPC.
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

## 💳 Debito Tecnico e Ottimizzazioni Prestazionali

### 📉 Analisi Draw Calls (208-245 misurate vs Budget < 100) e Piano di Riduzione (v0.3.7)
Durante il profiling diagnostico via Chrome DevTools Protocol (`tests/profile_draw_calls.mjs`) sono state rilevate **208-245 draw calls** per frame con **489 mesh totali** e **214 shadow casters** attivi nella scena.

#### Ripartizione reale delle Mesh e Fonti di Draw Call:
1. **Fogliame e Fiori Procedurali (174 mesh)**:
   - 24 fiori selvatici × 6 mesh ciascuno (1 ricettacolo + 5 petali singoli) = 144 draw calls.
   - 5 cespugli di bacche × 6 mesh ciascuno (1 sfera cespuglio + 5 bacche singole) = 30 draw calls.
2. **Duplicazione Alberi Procedurali e Kenney (102 mesh totali)**:
   - 9 alberi procedurali rimasti attivi in scena (9 tronchi + 27 radici + 36 batuffoli chioma = 72 mesh).
   - 12 alberi cartoon Kenney caricati in parallelo = 30 mesh.
3. **Personaggi SkinnedMesh (108 mesh)**: Pip (`Rogue_Hooded`), Nonna Bussola (`Mage`) e Volpe (`Fox`) con nodi e armature scheletriche articolate.
4. **Strutture Statiche in Legno e Pietra (~40 mesh)**: 7 assi + 6 pali del pontile, 2 bitte, 12 montanti ringhiera dell'osservatorio e monoliti runici creati come `BoxGeometry` e `CylinderGeometry` separate.
5. **Prop Kenney e Collezionabili (~49 mesh)**: barca a vela, cassa pirata, barili, cartelli, falò, frammenti e pergamene.
6. **Pass Ombreggiatura (`castShadow = true`)**: 214 oggetti proiettano ombre, raddoppiando il campionamento nella shadow map pass.

#### Proposta di Piano di Riduzione (programmato per Fase 4, senza modifiche in 0.3.7):
- **Azione 1: Instancing (`InstancedMesh`) per Vegetazione Minore**:
  Convertire i 24 fiori e i 5 cespugli in 4 `InstancedMesh` Three.js (ricettacolo fiore, petalo fiore, corpo cespuglio, bacca). Riduzione stimata: **da 174 draw calls a sole 4 draw calls** (risparmio netto: -170 draw calls).
- **Azione 2: Disattivazione Alberi Procedurali con Asset Kenney Attivi**:
  All'avvenuto caricamento dei modelli `.glb` di quercia e albero dettagliato Kenney, impostare `this.proceduralTreesGroup.visible = false` o rimuovere il gruppo dal grafo di scena. Risparmio netto: **-72 draw calls**.
- **Azione 3: Geometria Unificata (`BufferGeometryUtils.mergeGeometries`) per Strutture Statiche**:
  Unire le assi del molo, i montanti e la staccionata dell'osservatorio in un unico buffer geometrico con un solo materiale legnoso. Risparmio netto: **-25 draw calls**.
- **Azione 4: Profilo "Bassa" Senza Ombre e Senza Inverted Hull**:
  Nel preset grafico "Bassa" disattivare il rendering delle ombre (`renderer.shadowMap.enabled = false` o `sunLight.castShadow = false`) e rimuovere il pass contorno toon invertito, abbattendo le chiamate shadow pass.
- **Risultato Previsto**: Riduzione del conteggio draw call totale da ~239 a **45-65 draw calls** (sotto il budget di 100).

---

- **Peso Bundle JS (~640 KB minificato, ~167 KB gzip)**: Dovuto essenzialmente al core di Three.js e BVH. Nella Fase 4, all'introduzione di modelli binari GLB e tracce audio, implementare il code-splitting con `dynamic import()` per mantenere il download iniziale sotto la soglia critica mobile.
- **Aggiornamento Vitest / Tinypool**: ESLint è stato aggiornato a `9.39.5` (vulnerabilità `@eslint/plugin-kit` risolta). La migrazione di Vitest e Tinypool a Vitest 5.x è programmata come major upgrade dedicato, previa verifica della compatibilità con le API di mocking e con Vite 6 (ADR 004).
- **Shader Nebbia Avanzato**: La nebbia utilizza `THREE.FogExp2` configurata in `environment.json`; valutabile l'aggiunta di un raggio di dissolvenza volumetrico attorno alla lanterna di Pip.
