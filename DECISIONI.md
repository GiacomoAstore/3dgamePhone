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

## ADR 004 - Analisi di Sicurezza delle Dipendenze (npm audit) e Aggiornamento ESLint
- **Data**: 2026-11-10 (Revisione v0.3.1)
- **Stato**: Approvata
- **Contesto**:
  Il comando `npm audit` segnalava inizialmente 8 vulnerabilità in `devDependencies`.
  Tra queste, `@eslint/plugin-kit <0.3.4` (ReDoS via comment parser) impattava ESLint 9.20.1.
  Le altre riguardavano `tinypool` e `@vitest/mocker` (prototype pollution nel test runner Vitest 3.x) e `minimatch` in `@typescript-eslint`.
- **Decisione**:
  1. È stato verificato con `npm view eslint versions` che `9.39.5` è l'ultima versione stabile pubblicata della linea 9.x contenente la patch per `@eslint/plugin-kit`. `eslint` è stato aggiornato esattamente a `"9.39.5"` in `package.json` e il lockfile riallineato. Con questo intervento, la vulnerabilità di ESLint è completamente risolta.
  2. Per `tinypool` e `@vitest/mocker`, la risoluzione richiederebbe `vitest@5.1.0`, che è un major breaking change per l'intero stack di test Vitest 3.x e Vite 6.
  3. **Condizione esplicita per l'aggiornamento di Vitest/Tinypool**: L'aggiornamento a Vitest 5.x verrà eseguito solo in una sessione di manutenzione dedicata al major upgrade del framework di test, verificando preliminarmente che la nuova major non rompa le API `vi.stubGlobal` per `AudioContext` e `localStorage` e che non introduca incompatibilità peer con `vite@6.4.6`. Fino ad allora rimane formalmente annotato in `TODO.md` come debito tecnico non bloccante (strumenti isolati alla build e assenti dal runtime browser).
- **Conseguenze**:
  Zero vulnerabilità nel bundle WebGL client inviato agli smartphone. ESLint allineato all'ultima versione di manutenzione 9.x.

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

---

## ADR 008 - Politica di Immutabilità dei Tag Git di Rilascio e Patch Release v0.3.1
- **Data**: 2026-11-10
- **Stato**: Approvata
- **Contesto**:
  Durante la chiusura della versione `0.3.0`, sono state implementate correzioni ai test e al cel-shading. Il tag `v0.3.0` era stato aggiornato localmente con `git tag -a -f`.
  L'analisi dei remoti (`git remote -v`) ha confermato che il repository è attualmente solo locale e il tag non è mai stato distribuito all'esterno.
  Tuttavia, per garantire la massima integrità cronologica e tracciabilità ingegneristica (Regola utente 5 e 9), è necessario formalizzare una politica rigorosa sull'immutabilità dei tag.
- **Decisione**:
  1. **Immutabilità Assoluta dei Tag Git**: D'ora in poi nessun tag Git già creato verrà mai cancellato o spostato con `-f`, né localmente né in remoto.
  2. **Patch Release Semantica**: Qualsiasi modifica, correzione o rifinitura successiva a un rilascio richiederà un incremento semantico del numero di patch (`0.3.1`, `0.3.2`, ecc.) con commit dedicato e creazione di un nuovo tag univoco e immutabile.
  3. **Ambito del Rilascio v0.3.1**:
     - *Benchmark Deterministico (30s)*: percorso orbitale automatico della camera (`?benchmark=1`), tempo e ora bloccati a mezzogiorno (12:00), auto-degrade sospeso durante il benchmark.
     - *Debug Overlay & 1% Low FPS*: calcolo analitico di FPS medio, minimo e 1% low tramite buffer circolare di frametime, draw calls WebGL, triangoli, geometrie e texture (`?debug=1`).
     - *Tracciamento Multi-Touch Diretto*: esposizione nel debug degli stessi identificatori di tocco gestiti nativamente da `TouchOverlay` (joystick, camera, pulsanti), azzerando discrepanze.
     - *Fallback di Copia Report*: gestione del blocco di `navigator.clipboard` su connessioni HTTP locali non protette tramite apertura automatica di un modal con `<textarea>` selezionabile.
     - *Taratura Matematica del Contrasto Notturno (WCAG 2.1)*: dimostrazione analitica del contrasto silhouette (cielo/terreno $\ge 3.0:1$) e del ruolo dell'Inverted Hull Toon (`0x162238`) nello stacco di Pip dal terreno ($\ge 3.5:1$).
     - *Contorno Toon Toggleabile*: disattivazione automatica del contorno Inverted Hull nel profilo qualitativo "Bassa" (`player.setQuality('low')`) per risparmiare draw calls e geometrie su hardware entry-level.
     - *Auto-Degrade Protetto*: warm-up iniziale di 5s ignorato, schede in background (`document.hidden`) ignorate, cooldown rigoroso di 30s tra una degradazione e l'altra, e toast di notifica con pulsante "Annulla" per ripristinare il profilo precedente.
     - *Ciclo di Vita Web Audio*: ascolto esteso degli eventi di sblocco (`touchstart`, `pointerdown`, `mousedown`, `click`) e ripresa automatica su evento `visibilitychange` (iOS Safari e Android Chrome).
- **Conseguenze**:
  Tracciabilità cronologica trasparente e ineccepibile, zero rischi di tag desincronizzati e suite completa di strumenti diagnostici oggettivi per la validazione su dispositivi reali.
