# Brumavento: Game Design Document & Specifiche Tecniche (DOCS_DESIGN.md)

<!--
Ultima modifica: 2026-11-11 - v0.3.9 - Ripristino completo documento di design con stack, budget, pipeline asset, perimetro roadmap Fase 4/5, accessibilità, gestione rischi e comandi corretti (Lanterna su F, Interazione su E)
-->

## 1. Visione del Gioco e Pilastri di Design

**Brumavento** è un videogioco 3D di esplorazione cartoon, fruibile istantaneamente nel browser da smartphone e personal computer desktop senza alcuna installazione.
Il giocatore veste i panni di Pip, un piccolo apprendista cartografo guidato dall'anziana Nonna Bussola, che esplora un arcipelago incantato avvolto da una nebbia magica per ritrovare i frammenti perduti dell'Atlante Vivo e restituire luce, colore e vita al mondo.

### Pilastri Fondamentali:
1. **Semplicità e Immediatezza**: Mobile-first, controlli touch ergonomici e reattivi (joystick a sinistra, pulsanti azione a destra) affiancati da controlli desktop standard WASD/Mouse/Gamepad.
2. **Esplorazione e Meraviglia**: Nessun combattimento, nessuna violenza o punizione; il piacere risiede nella curiosità, nella scoperta di reperti e nella contemplazione del mondo.
3. **Immersione Atmosferica**: Ciclo giorno/notte dinamico con transizioni cromatiche fluide, brezza marina, onde procedurali e audio sintetico Web Audio reattivo.
4. **Data-Driven & Disaccoppiamento**: Tutti i contenuti (missioni, dialoghi, collezionabili, parametri ambientali) sono memorizzati in file JSON e caricati dinamicamente.

---

## 2. Epoca, Ambientazione e Personaggi

- **Ambientazione**: L'Arcipelago di Brumavento, un insieme di isole collinari e scogliere a picco bagnate da un mare calmo e circondate da nebbia fitta.
- **Epoca & Tono**: Mondo fantastico di fine Ottocento: mongolfiere, telescopi in ottone, mappe nautiche, lanterne a olio e barche a vela. Tono caldo, accogliente e fiabesco (ispirazioni: *A Short Hike*, *The Legend of Zelda: The Wind Waker*, *Animal Crossing*).

### Personaggi:
- **Pip**: Protagonista coraggioso e curioso, con cappuccio verde, mantello e stivali (modello 3D rigged KayKit). Custodisce la Lanterna Magica.
- **Nonna Bussola**: Cartografa anziana e mentore, situata sulla collina dell'osservatorio astronomico con telescopio e carte nautiche. Guida Pip nell'avventura.
- **Capitano Marea** *(Fase 5)*: Esperto lupo di mare ormeggiato al molo di legno, traghettatore per il viaggio verso la Seconda Isola.
- **La Nebbia**: Elemento scenico e narrativo vivo, che si dirada esponendo i colori vibranti dell'arcipelago al recupero di ciascun frammento.

---

## 3. Core Loop e Meccaniche di Gioco

```
   ┌──────────────────────────────────────────────┐
   │            Esplora l'Isola                    │
   │  (Camminata, salto, orientamento visivo)     │
   └──────────────────────┬───────────────────────┘
                          │
                          ▼
   ┌──────────────────────────────────────────────┐
   │         Interagisci e Risolvi                │
   │  (Dialoghi con NPC, Lanterna Magica, enigmi) │
   └──────────────────────┬───────────────────────┘
                          │
                          ▼
   ┌──────────────────────────────────────────────┐
   │       Raccogli il Frammento dell'Atlante     │
   │  (Sblocco stadio missione, segreti, reperti) │
   └──────────────────────┬───────────────────────┘
                          │
                          ▼
   ┌──────────────────────────────────────────────┐
   │        Restaurazione Ambientale              │
   │  (Ritiro visibile della nebbia: -65.6%,      │
   │   viraggio cromatico cielo/mare, nuova isola)│
   └──────────────────────────────────────────────┘
```

---

## 4. Stack Tecnologico

Il progetto adotta tecnologie web moderne native senza framework pesanti di terze parti:

| Componente | Tecnologia | Versione | Motivazione |
| :--- | :--- | :--- | :--- |
| **Linguaggio** | TypeScript (Strict mode) | `^5.7.0` | Massima robustezza, tipizzazione forte e assenza di `any` impliciti |
| **Motore di Rendering** | Three.js | `0.180.0` | Standard industriale WebGL/WebGPU-ready, leggero e modulare |
| **Strumenti di Build** | Vite | `^6.4.6` | Avvio istantaneo HMR, ottimizzazione Rollup e tree-shaking aggressivo |
| **Fisica & Raycasting** | Three-Mesh-BVH | `^0.9.1` | Raycasting su gerarchia di volumi delimitatori (BVH) accelerato per terreni complessi |
| **Audio Engine** | Web Audio API Nativo | Specifica W3C | Sintesi procedurale di onde, brezza, passi e fanfare senza dipendenze esterne pesanti |
| **Interfaccia Utente (UI)** | HTML5 + CSS3 Flex/Grid | Nativo | Overlay responsive leggero sopra il canvas 3D con supporto pointer events e WCAG 2.1 |
| **Test Framework** | Vitest + Chrome DevTools Protocol | `^3.2.7` | Test unitari rapidi e test E2E reali su browser Google Chrome headless |

---

## 5. Budget Prestazionali e Risorse

Per garantire un'esperienza a 60 FPS su desktop e 30+ FPS su dispositivi mobile entry-level, il progetto applica un budget prestazionale vincolante:

| Parametro | Budget Obiettivo | Misurazione Reale (v0.3.9) | Stato | Note di Ottimizzazione |
| :--- | :---: | :---: | :---: | :--- |
| **Draw Calls** | **< 100** | **93** | ✅ Conforme | Instancing foliage (`InstancedMesh`), merge pontile/balaustra, alberi unificati |
| **Triangoli (Poligoni)** | **< 150.000** | **34.957** | ✅ Conforme | Geometrie cartoon low-poly ottimizzate |
| **Frame Rate Desktop** | **60 FPS** | **60-61 FPS** | ✅ Conforme | Game loop a delta-time fisso/clamped |
| **Frame Rate Mobile** | **30+ FPS** | **30-60 FPS** | ✅ Conforme | Pixel ratio adattivo (1.0x su mobile / Bassa) |
| **Peso Totale `dist/`** | **15 - 20 MB** | **3.78 MB** | ✅ Conforme | Bundle JS (754 KB minificato / 203 KB gzip), modelli GLB (~3.0 MB) |
| **Tempo di Caricamento** | **< 3 secondi** | **~1.2 secondi** | ✅ Conforme | Caricamento asincrono asset e start screen interattiva |

---

## 6. Pipeline degli Asset 3D e Rendering Toon

1. **Modelli 3D Cartoon (CC0)**:
   - Personaggio Pip: `Rogue_Hooded.glb` (KayKit Adventurers) con animazioni scheletriche `Rig_Medium_MovementBasic.glb` e `Rig_Medium_General.glb`.
   - Mentore Nonna Bussola: `Mage.glb` (KayKit Adventurers) con animazione continua `Idle_A` (eliminazione T-pose verificata).
   - Props & Natura: `barrel.glb`, `chest.glb`, `campfire_logs.glb`, `tree_oak.glb`, `tree_detailed.glb`, `sign.glb` (Kenney) e `BoatWSail.glb`, `Fox.glb` (Quaternius).
2. **Tecniche di Riduzione Draw Calls**:
   - `InstancedMesh`: Unica chiamata di disegno per 5 cespugli e 25 bacche; 24 centri di margherite; 120 petali di fiore.
   - `BufferGeometryUtils.mergeGeometries`: 11 colonne della balaustra dell'osservatorio fuse in 1 mesh; tavole e pali del pontile fusi in 1 mesh legno + 1 mesh ferro; cerchio di pietre runico fuso in 1 mesh.
   - Rimozione fisica dal scene graph degli alberi e fantocci procedurali quando i modelli GLB sono caricati.
3. **Toon Shading a Gradini Discreti**:
   - `MeshToonMaterial` con gradiente a 3 step discreti (`DataTexture` 1D) per luci e ombreggiature cel-shaded nette.

---

## 7. Schema dei Controlli

| Azione | Desktop (Tastiera & Mouse) | Smartphone / Tablet (Touch Screen) |
| :--- | :--- | :--- |
| **Movimento** | Tasti `W`, `A`, `S`, `D` o Frecce direzionali | Virtual Joystick analogico (metà sinistra schermo) |
| **Rotazione Telecamera** | Mouse Drag (tasto sinistro o destro) | Touch Swipe / Drag orizzontale (metà destra schermo) |
| **Salto** | Barra Spaziatrice (`Space`) | Pulsante circolare verde "Salto" (in basso a destra) |
| **Interazione / Dialoghi** | Tasto **`E`** (o click sul prompt a schermo) | Pulsante "Azione" contestuale o tocco sul badge |
| **Lanterna Magica** | Tasto **`F`** (accensione / spegnimento fascio) | Tasto dedicato / toggle lanterna nell'HUD |
| **Diario del Cartografo** | Tasto **`Tab`** o click icona 📖 Diario | Pulsante 📖 Diario nella barra superiore |
| **Guida ai Controlli** | Tasto **`H`** o click icona ❓ Guida | Pulsante ❓ Guida nella barra superiore |
| **Menu Impostazioni** | Click icona ⚙️ Impostazioni | Pulsante ⚙️ Impostazioni nella barra superiore |

---

## 8. Accessibilità (A11y) e Opzioni Visive

- **Conformità WCAG 2.1 AA**: Tutti i testi e i pulsanti dell'HUD mantengono un rapporto di contrasto cromatico $\ge 4.5:1$ sullo sfondo.
- **Modalità "Notti Chiare" (`readableNight: true`)**: Aumenta l'intensità della luce ambientale notturna da **`0.35`** a **`0.65`** e la luce lunare da `0.45` a `0.65`, garantendo piena leggibilità anche durante la fase notturna per utenti con ipovisione o schermi poco luminosi.
- **Profili di Qualità Grafica**:
  - **Bassa**: DPR 1.0x, ombre disattivate (`castShadow = false`), outline toon disattivato, particelle ridotte.
  - **Media**: DPR 1.5x, ombre filtrate di base, outline adattivo, particelle normali.
  - **Alta**: DPR 2.0x, PCF Soft Shadows ad alta risoluzione, outline volumetrico completo, particelle estese.

---

## 9. Gestione Rischi e Degradazione Controllata

- **Auto-Degrade Automatico**: Se il frame rate medio scende al di sotto di **24 FPS per 5.0 secondi consecutivi** di sessione attiva, il motore esegue il downgrade automatico del profilo qualitativo (`Alta` $\rightarrow$ `Media` $\rightarrow$ `Bassa`), notificando l'utente e preservando la giocabilità.
- **Protezione Anti-Caduta**: Se per un'anomalia di collisione o glitch il giocatore scende a $y < -5.0\text{ m}$ (sotto il fondale marino), viene automaticamente riposizionato allo `spawnPoint` sicuro dell'isola a velocità azzerata.
- **Graceful Degradation Asset**: In caso di mancato caricamento di un file GLB o di errore di rete, il motore ripristina la rappresentazione geometrica procedurale senza interrompere il gioco.

---

## 10. Roadmap delle Fasi di Sviluppo (Perimetro Chiarito)

### Fasi Completate:
- **Fase 0 - Setup e Architettura Base (v0.1.0)**: Tooling, Vite, TypeScript, Three.js, regole vincolanti e standard documentali.
- **Fase 1 - Mondo 3D e Personaggio (v0.1.0 - v0.2.0)**: Isola procedurale, fisica, controlli touch e desktop, camera in terza persona.
- **Fase 2 - Dialoghi e Meccaniche Esplorative (v0.2.0 - v0.3.0)**: Nonna Bussola, albero di dialogo, prima missione, diario, collezionabili e transizione nebbia.
- **Fase 3 - Atmosfera, Audio e Polishing (v0.3.0 - v0.3.9)**: Ciclo circadiano, sintesi Web Audio, particelle, modelli CC0 cartoon rigged, test reali E2E su Google Chrome (CDP), rig scheletrico senza T-pose, riduzione draw calls (<100) e verifica camminata continua.

### Fasi Future:
- **Fase 4 - Salvataggi, Menu di Sistema, PWA e Crediti**:
  - *Salvataggi Persistenti*: Archiviazione progressi su `localStorage` / `IndexedDB` con schema dati versionato (frammenti, collezionabili, impostazioni).
  - *Schermate Menu Complete*: Start Menu iniziale arricchito, Menu di Pausa (`Escape`), Schermata Crediti e schermata Game Over/Completamento.
  - *Progressive Web App (PWA)*: Manifest web app, icone dedicate, Service Worker per caching offline e installazione su smartphone.
  - *Audio Persistence*: Memorizzazione preferenze utente (volume master, musica, effetti).
- **Fase 5 - Viaggio in Mare e Seconda Isola**:
  - *Capitano Marea*: NPC lupo di mare con dialogo al molo e animazione barca a vela.
  - *Transizione Navigazione*: Sequenza interattiva o cinematica di navigazione marittima tra le isole.
  - *Seconda Isola (Isola della Scogliera / Isola dei Sospiri)*: Nuovo bioma roccioso, enigmi con la lanterna a rifrazione ottica, nuovi collezionabili e 2° frammento dell'Atlante Vivo.
