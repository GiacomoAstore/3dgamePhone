# Registro delle Decisioni Architetturali e Progettuali (ADR)

<!--
Ultima modifica: 2026-11-10 - v0.1.0 - Inizializzazione registro decisioni
-->

Questo documento traccia le decisioni architetturali rilevanti per il progetto, con alternative valutate e motivazione della scelta.

---

## ADR 001 - Adozione delle Regole Vincolanti per l'IA
- **Data**: 2026-11-10
- **Stato**: Approvata
- **Contesto**:
  Necessità di stabilire uno standard rigoroso per lo sviluppo collaborativo con l'IA, garantendo codice pulito, testabile, documentato e con tracciamento rigoroso di ogni singola modifica.
- **Decisione**:
  Adozione del documento di regole fornito dall'utente, salvato come file vincolante [GEMINI.md](file:///c:/Users/user/Desktop/workspace/3dgamePhone/GEMINI.md) e [AGENTS.md](file:///c:/Users/user/Desktop/workspace/3dgamePhone/AGENTS.md), e istituzione dell'infrastruttura di documentazione (`CHANGELOG.md`, `README.md`, `ARCHITETTURA.md`, `DECISIONI.md`, `TODO.md`, `VERSION`).
- **Alternative considerate**:
  - Nessuna regola esplicita (rischio di allucinazioni, codice non manutenibile, mancanza di tracciamento).
- **Conseguenze**:
  Tutte le sessioni future seguiranno la procedura in 8 fasi (Sezione 6) e la checklist di consegna (Sezione 10).


---

## ADR 002 - Scelta e Blocco delle Versioni del Tooling (Vite 6.4.6, TypeScript 5.7.3, Three.js 0.180.0)
- **Data**: 2026-11-10
- **Stato**: Approvata
- **Contesto**:
  La verifica del registro npm (`npm view <pkg> dist-tags`) mostra che il tag `latest` per Vite è `8.3.7` (con tag `previous` su `6.4.6`) e per TypeScript è `7.0.2`.
  Né Vite né TypeScript adottano una denominazione ufficiale di supporto a lungo termine ("LTS").
  La dicitura iniziale che qualificava Vite 6.4.6 come "LTS" era errata e non verificata.
- **Decisione**:
  Bloccare le versioni esatte (senza `^` o `~`) nel `package.json` su:
  - `three`: `0.180.0`
  - `three-mesh-bvh`: `0.9.18`
  - `@types/three`: `0.180.0`
  - `vite`: `6.4.6` (versione risolta all'installazione iniziale, corrispondente al tag `previous` di Vite)
  - `typescript`: `5.7.3` (versione iniziale della linea 5.x, pienamente compatibile con `@types/three`)
  - `vitest`: `3.2.7`
  - `eslint`: `9.20.1` e `@typescript-eslint/parser`: `8.24.1`
  - `prettier`: `3.5.1`
- **Motivazione della scelta**:
  Garantire stabilità e riproducibilità immediata della pipeline di build e test, evitando breaking change introdotte nelle major release successive di Vite (v7/v8) e TypeScript (v7) per non rallentare lo sviluppo del prototipo.
- **Conseguenze**:
  Build deterministica e isolata da aggiornamenti impliciti di pacchetti terzi.

---

## ADR 003 - Performance Budget Mobile e Pixel Ratio Clamping
- **Data**: 2026-11-10
- **Stato**: Approvata
- **Contesto**:
  I dispositivi mobili moderni hanno schermi ad altissima densità (DPR 3 o 4), che quadruplicano i pixel da renderizzare portando al collasso del framerate su GPU mobili integrate.
- **Decisione**:
  Limitare rigidamente il `devicePixelRatio` a un massimo di `2.0` (`Math.min(window.devicePixelRatio, 2.0)`), attivare un contatore FPS leggero nell'HUD per monitorare i frame e predisporre un sistema di profili di qualità grafica (Bassa, Media, Alta).
- **Conseguenze**:
  Prestazioni stabili a 30+ FPS su smartphone e 60 FPS su desktop.

---

## ADR 004 - Analisi di Sicurezza delle Dipendenze (npm audit)
- **Data**: 2026-11-10
- **Stato**: Approvata
- **Contesto**:
  Il comando `npm audit` segnala 8 vulnerabilità (2 low, 4 moderate, 2 critical) relative a:
  - `@eslint/plugin-kit` (ReDoS via parser commenti di configurazione)
  - `tinypool` e `@vitest/mocker` (prototype pollution in worker runner locale di Vitest)
  - `minimatch` (tramite `@typescript-eslint/parser`)
- **Decisione**:
  Tutti i pacchetti segnalati appartengono esclusivamente a **`devDependencies`** (strumenti locali di linting e unit testing).
  Le dipendenze di produzione a runtime (`three` e `three-mesh-bvh`) hanno **0 vulnerabilità**.
  Si decide di **non eseguire `npm audit fix --force`**, in quanto comporterebbe salti di versione breaking (es. Vitest 5.x o downgrade di `@typescript-eslint/parser` a v6) che romperebbero la suite di test attuale.
- **Conseguenze**:
  Nessun impatto o rischio di sicurezza per il bundle WebGL client-side eseguito nel browser dell'utente. L'allineamento del tooling di sviluppo viene formalmente registrato in `TODO.md` come debito tecnico da gestire in una fase di manutenzione dedicata.

---

## ADR 005 - Architettura Data-Driven, Localizzazione e Transizione Nebbia (Fase 2)
- **Data**: 2026-11-10
- **Stato**: Approvata
- **Contesto**:
  Nella Fase 2 è necessario implementare la prima missione, il primo NPC (Nonna Bussola), i collezionabili, il diario del cartografo e il diradamento visibile della nebbia. L'architettura deve essere conforme al Pilastro 4 del design (espandibilità data-driven) e preparare il salvataggio automatico (Fase 4).
- **Decisione**:
  1. **Separazione Dati e Testi**: Tutte le stringhe sono isolate in `src/data/locales/it.json`, mentre le strutture di quest e dialoghi in `quests.json` e `dialogues.json` contengono solo chiavi (architettura pronta per `en.json`).
  2. **Stato Serializzabile Puro (POJO)**: `QuestSystem` e `DialogueSystem` gestiscono lo stato sotto forma di plain object JSON senza classi annidate o funzioni, permettendo la serializzazione immediata con `JSON.stringify()`.
  3. **Sicurezza DOM**: L'iniezione dei testi a schermo nella UI (`DialogueBox`, `JournalUI`, `NotificationBanner`, `interaction-prompt`) avviene esclusivamente tramite `textContent`, senza ricorso a `innerHTML`.
  4. **Transizione Nebbia e Colore**: Al ritrovamento del frammento, scatta un'interpolazione animata continua su 3.5 secondi che porta la densità della nebbia locale a `0.008`, riscalda il colore del cielo da `#a3b8cc` a `#8ecae6`, intensifica la luce solare e trasforma il terreno in verde vivido.
  5. **Sospensione Comandi Pulita**: Durante dialoghi o diario aperti, `InputManager.setBlocked(true)` azzera i vettori e chiama `TouchOverlay.resetInputs()`, evitando che il joystick virtuale mobile o i tasti rimangano incastrati.
- **Conseguenze**:
  Codice sicuro, privo di numeri magici, scalabile per le future isole e facilmente localizzabile.

---

## ADR 006 - Atmosfera: Web Audio Sintetico, Ciclo Circadiano, Particelle a Singola Draw-Call e Menu Qualità (Fase 3)
- **Data**: 2026-11-10
- **Stato**: Approvata
- **Contesto**:
  Nella Fase 3 occorre dotare Brumavento di un'atmosfera immersiva: ciclo giorno/notte, effetti particellari (lucciole, polline del vento, spuma marina, stelle), onde dinamiche, musica/suoni ambientali e un pannello per il controllo prestazionale.
  Vincoli stringenti: rispetto del budget mobile (<100 draw calls, <150k poligoni, zero lag touch, policy autoplay di Web Audio, e contenimento del peso del bundle per connessioni mobili senza scaricare decine di MB di campioni audio).
- **Decisione**:
  1. **Sintesi Procedurale Web Audio API (`AudioSystem`)**: Nessun file audio binario esterno (.mp3/.wav/.ogg). I suoni vengono sintetizzati in tempo reale via nodi nativi Web Audio (oscillatori sine/triangle, filtri biquad passa-basso modulati da LFO, curve di gain esponenziali):
     - Passi cartoon di Pip con micro-pitching casuale.
     - Salto cartoon con sweep di frequenza ascendente.
     - Toggle della Lanterna Magica.
     - Chime arpeggiato a due toni per la raccolta di conchiglie, funghi e stelle marine.
     - Fanfara magica a quattro toni per il recupero del frammento dell'Atlante.
     - Brezza marina e risacca delle onde generata con rumore rosa e filtro passa-basso oscillante a 0.25 Hz.
     - Sblocco dell'AudioContext al primo gesto utente (click/touch su "Inizia Esplorazione" o tocco sullo schermo), con fallback sicuro per ambienti non-browser.
  2. **Ciclo Giorno/Notte a Coordinate Celesti (`DayNightCycle`)**:
     - Simulazione circadiana (giorno predefinito di 8 minuti, configurabile).
     - Sole e Luna su orbite polari opposte a 180° lungo l'arco celeste.
     - Calcolo in tempo reale dell'elevazione solare/lunare per modulare le intensità di `DirectionalLight` e `HemisphereLight`.
     - Interpolazione continua dei colori di cielo e nebbia tra le 4 fasi (alba corallo/pesca, giorno turchese splendente, tramonto arancio caldo, notte blu scuro).
  3. **Sistema Particellare a Singola Draw-Call (`ParticleSystem`)**:
     - 4 tipologie atmosferiche (lucciole, polline dorato, spuma alla battigia, stelle della volta celeste) compattate in un unico oggetto `THREE.Points` con `BufferGeometry` e vertex colors.
     - Budget fisso a 750 particelle totali, scalabile istantaneamente via `geometry.setDrawRange()` in base al profilo di qualità grafica.
  4. **Pannello Impostazioni Qualità e Volumi (`QualitySettingsUI`)**:
     - Accessibile tramite icona ⚙️ nella barra superiore dell'HUD.
     - Selettore preset (Bassa: 1.0x DPR, ombre disattivate, 250 particelle; Media: 1.4x DPR, ombre basic, 500 particelle; Alta: fino a 2.0x DPR, ombre PCFSoft, 750 particelle).
     - 3 slider touch per la regolazione indipendente dei volumi (Master, Brezza/Onde, Effetti SFX) da 0 a 100%.
     - Costruzione DOM con `textContent` e sospensione degli input di gioco durante l'apertura.
- **Conseguenze**:
  Bundle di produzione estremamente leggero (~618 KB totali minificati con Three.js e BVH inclusi, zero asset audio esterni), 60 FPS stabili su desktop, 30+ FPS garantiti su mobile e totale immersività sensoriale.

---

## ADR 007 - Raffinamenti Architetturali Fase 3: Priorità dell'Azione, Fallback Audio, Cel-Shading a Gradini, Auto-Degrade e Benchmark Standard
- **Data**: 2026-11-10
- **Stato**: Approvata
- **Contesto**:
  In seguito alla revisione della Fase 3, sono emersi requisiti specifici di robustezza e accessibilità:
  1. Evitare accensioni accidentali della lanterna durante i dialoghi o le interazioni eliminando i debounce temporali a favore di una logica a consumatore singolo gerarchico.
  2. Permettere l'integrazione di file audio esterni (mp3/ogg, es. tracce musicali CC0) con fallback automatico e trasparente sulla sintesi procedurale qualora la rete o il file falliscano.
  3. Definire tecnicamente lo stile cartoon (gradient map a gradini discreti e contorni inverted-hull).
  4. Introdurre opzioni per bloccare l'ora del giorno, notti chiare e leggibili su display AMOLED/smartphone, e transizioni morbide per evitare cambi bruschi di luce.
  5. Rendere il profilo grafico auto-adattivo, persistente su `localStorage` e capace di degradare automaticamente di preset se il framerate scende sotto i 26 FPS per 5 secondi continui.
  6. Definire un dispositivo di riferimento e una scena di test ripetibile per validare gli FPS.
- **Decisione**:
  1. **Dispatchee dell'Azione a Priorità Unica (`ActionPriorityDispatcher`)**: L'input azione (tasto `E` o pulsante touch 🏮) viene consumato con gerarchia stretta: se un dialogo è aperto avanza il testo; altrimenti se un target è in raggio interagisce con esso; solo in assenza di interazioni attiva/disattiva la lanterna.
  2. **Supporto File Audio con Ripiego Procedurale (`AudioSystem.playMusicTrack / playSoundFile`)**: Metodi asincroni che tentano la riproduzione di file audio esterni; in caso di errore 404, codec non supportato o offline, attivano immediatamente la brezza o i chime procedurali senza errori a schermo.
  3. **Cel-Shading a Gradini Discreti (`ToonShaderUtils`)**: Generazione a codice di una `DataTexture` 1D a 3 o 4 bande con `NearestFilter` collegata a `MeshToonMaterial.gradientMap` per Pip, Nonna Bussola e il terreno collinare, garantendo stacchi di luce e ombra tipici dell'animazione cartoon.
  4. **Accessibilità Visiva e Circadiana (`DayNightCycle`)**: Implementazione di `setHourLocked()`, `setTimeScale()`, `setReadableNight()` (luce d'ambiente minima sollevata a 0.65) e smorzamento esponenziale con costante di tempo per cambi di luce progressivi e privi di overshoot.
  5. **Auto-Degrade e Persistenza Grafica (`QualitySettingsUI`)**: Rilevamento automatico del profilo alla prima esecuzione (Mobile/Touch $\rightarrow$ 'medium', Desktop $\rightarrow$ 'high'), persistenza su `localStorage`, e declassamento a scalare (high $\rightarrow$ medium $\rightarrow$ low) se la GPU mobile va in sofferenza persistente.
  6. **Dispositivo di Riferimento e Benchmark**:
     - *Riferimento Mobile*: smartphone di fascia media con GPU Mali-G52 / Adreno 618, schermo 1080p, Chrome/Safari.
     - *Scena Benchmark (30s)*: Spawn $\rightarrow$ Corsa verso l'Osservatorio $\rightarrow$ Discesa alla scogliera con lanterna e 750 particelle a vista. Obiettivo: $\ge 30$ FPS su smartphone di riferimento, $\ge 60$ FPS su desktop.
- **Conseguenze**:
  Eliminazione definitiva dei conflitti tra tasto interazione e lanterna, gameplay visivamente chiaro e fruibile all'aperto su smartphone, tolleranza assoluta a file audio mancanti e framerate protetto.
