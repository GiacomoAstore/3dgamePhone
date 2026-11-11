# Changelog

Tutte le modifiche a questo progetto vengono registrate cronologicamente in questo documento seguendo il Semantic Versioning (`MAGGIORE.MINORE.PATCH`).

## [0.3.2] - 2026-11-11

### Aggiunto
- **Guida Controlli HUD & Modal Illustrato**:
  - Aggiunta scorciatoia visiva persistente in basso a sinistra dello schermo (`.hud-controls-bar`) con tasti `WASD`, `Spazio`, `F`, `E`, `Q/C`, `H`.
  - Aggiunto pulsante rapido `❓ Controlli` nella barra superiore di gioco.
  - Implementato modal interattivo `#help-modal` consultabile con il tasto `H` o tramite tocco/click, con schede dettagliate per movimento, interazione e comandi touch mobile, con sospensione dell'input di gioco e testo renderizzato in modo sicuro con `textContent`.
- **Rotazione Telecamera da Tastiera (`KeyQ` e `KeyC`)**:
  - Aggiunti tasti `Q` (rotazione orizzontale oraria) e `C` (rotazione antioraria) in `InputManager.ts` per esplorare agevolmente anche senza mouse.
- **Modelli 3D Cartoon Procedurali Completi**:
  - *Pip*: viso cartoon modellato con occhi espressivi provvisti di iride turchese e punto luce speculare, guance rosate, ciuffo di capelli, cappotto a doppio petto con collo ripiegato e bottoni in ottone, cinta in pelle con tascapane, sciarpa corallo animata dinamicamente con oscillazione al vento (`scarfTail`), zaino da esploratore con rotoli di mappe nautiche e lanterna esagonale ottocentesca rifinita.
  - *Nonna Bussola*: abito prugna plissettato con ricami dorati, scialle in morbida lana crema a righe corallo, occhiali da lettura cerchiati d'oro, capelli argentati con crocchia e spillone a rosa dei venti, bastone in legno con pomo d'ambra, telescopio astronomico in ottone su treppiede in noce e tavolo cartografico con carte nautiche e bussola.
- **Geometria Terreno Tridimensionale Solida**:
  - Isola solida volumetrica dotata di scogliere verticali rocciose (`Terrain_Cliff`) estese fino a -5.0 m di profondità e fondale marino scuro (`seabedGeom`), eliminando definitivamente l'effetto lamina sottile fluttuante nel vuoto.
  - Piazza dell'osservatorio sopraelevata con basamento in pietra, pavimentazione in assi di legno e parapetto protettivo.
  - Alberi cartoon volumetrici con fusti sinuosi a radici visibili e chiome a grappolo di sfere cel-shaded stile The Witness/Animal Crossing, cespugli di bacche, margherite e campanule selvatiche sul prato.
- **Particelle Atmosferiche Soffici**:
  - Texture procedurale generata dinamicamente su canvas con gradiente radiale circolare morbido e blending additivo per le lucciole dorate e i pollini, eliminando i pixel squadrati opachi.

### Modificato
- `src/systems/PhysicsSystem.ts`:
  - Soglia pendenze camminabili in `checkHorizontalCollision`: i poligoni con normale verticale Y >= 0.55 non sono più trattati come muri ma come pendenze calpestabili, permettendo la risalita fluida delle colline.
  - Scivolamento muri ripidi (Y < 0.55): la velocità orizzontale viene proiettata lungo la tangente orizzontale della parete evitando incastri e blocchi improvvisi.
  - Ground-snapping in discesa in `checkGround`: estensione della tolleranza di aggancio verticale a 0.50 m verso il basso quando il giocatore era già al suolo e non sta saltando in alto, eliminando sfarfallii e micro-salti scendendo i pendii.
- `src/entities/Player.ts`:
  - Passaggio dello stato `isGrounded` del frame precedente al controllo fisico per il ground snapping.
  - Animazione procedurale della sciarpa (`scarfTail`) e oscillazione dinamica di braccia e gambe durante la corsa.
- `src/systems/InputManager.ts`:
  - Calibrazione sensibilità rotazione telecamera da mouse a 0.0045 rad/px per movimenti più reattivi e confortevoli.
- `src/world/Island.ts`:
  - Calcolo della transizione cromatica del terreno con tolleranza Manhattan RGB sicura senza dipendere da metodi inesistenti di THREE.Color.
- `src/entities/NPC.ts`:
  - Gestione sicura a prova di null di `activeQuest` nel metodo `interact()`.

### Corretto
- Risolto blocco di Pip sui pendii erbosi risalendo verso l'Osservatorio.
- Risolto tremolio e perdita continua di aderenza (grounded jitter) scendendo colline ripide.
- Risolto rendering delle particelle che apparivano a schermo come blocchi quadrati bianchi opachi.
- Risolto errore TypeScript TS18047 (`activeQuest` null check in `NPC.ts`) e TS2339 (`Color.distanceTo` in `Island.ts`).

### File toccati
- `index.html`: aggiunta barra scorciatoie controlli desktop e modal `#help-modal`.
- `src/style.css`: stili grafici per bottoni guida, chip kbd e layout dialoghi guida.
- `src/core/Game.ts`: integrazione eventi per apertura/chiusura guida comandi con sospensione input.
- `src/data/controlsConfig.ts`: taratura sensibilità telecamera e rotazione tastiera.
- `src/entities/ProceduralPip.ts`: rifacimento integrale del modello 3D cartoon di Pip.
- `src/entities/NPC.ts`: rifacimento integrale del modello 3D di Nonna Bussola e scena telescopio/tavolo.
- `src/entities/Player.ts`: animazioni procedurali sciarpa e arti, propagazione stato ground snapping.
- `src/systems/InputManager.ts`: supporto rotazione telecamera con tasti Q e C.
- `src/systems/PhysicsSystem.ts`: logica pendenze scalabili Y >= 0.55 e ground-snapping esteso a 0.50 m.
- `src/world/Island.ts`: volume 3D solido dell'isola con scogliere fino a -5m, alberi volumetrici, piazza e lerp colore sicuro.
- `src/world/ParticleSystem.ts`: generazione texture canvas a gradiente radiale e blending additivo.
- `tests/player_physics.test.ts`: test automatici per soglia pendenze camminabili e ground-snapping in discesa.
- `tests/MANUAL_CHECKLIST.md`: aggiunti test MAN-11 e MAN-12 per pendenze e modal controlli.
- `VERSION`, `package.json`: incremento versione a 0.3.2.
- `DECISIONI.md`: registrazione ADR 009.

### Motivo
- Feedback utente: risoluzione dei bug di movimento su pendenze, aggiunta guida immediata ai comandi a schermo e rifacimento totale degli asset in stile cartoon 3D pieno.

## [0.3.1] - 2026-11-10

> [!NOTE]
> **Nota sull'evoluzione dei tag**: La versione `0.3.0` era stata rifinita e corretta localmente; poiché il repository non possiede remoti (`git remote -v` vuoto), non si sono verificate discrepanze esterne. In conformità con la nuova politica di immutabilità dei tag (ADR 008), ogni modifica successiva a un rilascio genera un incremento semantico del numero di patch (`0.3.1`), con commit dedicato e tag immutabile.

### Aggiunto
- **Modalità Debug Avanzata (`?debug=1` in `src/ui/DebugOverlay.ts`)**:
  - Visualizzazione a schermo in tempo reale di: FPS istantaneo, FPS medio, FPS minimo e **1% Low FPS** calcolato su un buffer circolare di frametime.
  - Metriche WebGL di `renderer.info`: draw calls, triangoli, geometrie e texture allocate in memoria.
  - Profilo grafico attivo, DPR effettivo e risoluzione reale del canvas WebGL (`LxA`).
  - Monitoraggio touch nativo da `TouchOverlay`: visualizza gli identificatori esatti (`identifier`) dei touch attivi (joystick, camera, pulsanti) per azzerare discrepanze diagnostiche.
- **Modalità Benchmark Deterministico (`?benchmark=1`)**:
  - Sessione di prova automatica e ripetibile della durata esatta di 30 secondi.
  - Posizionamento e rotazione della telecamera pilotati lungo una traiettoria orbitale circolare attorno all'isola e all'osservatorio.
  - Ora del giorno bloccata a mezzogiorno solare (12:00) e auto-degrade qualitativo disattivato per tutta la durata del test.
  - Generazione al 30° secondo di un report diagnostico congelato e formattato.
- **Copia del Report con Fallback per Rete Locale HTTP**:
  - Tentativo prioritario di scrittura negli appunti tramite `navigator.clipboard.writeText()`.
  - Fallback automatico su modal con `<textarea>` selezionabile e pulsante "Seleziona Tutto" in contesti HTTP locali non-sicuri (es. smartphone collegato su `http://192.168.x.x:5173`).
- **Verifica Matematica del Contrasto Notturno WCAG 2.1 (`tests/readable_night_contrast.test.ts`)**:
  - Implementazione delle formule di luminanza relativa spaziale ITU-R BT.709 e contrast ratio WCAG 2.1.
  - Validazione analitica dei colori reali del gioco (senza alterazioni arbitrarie):
    - Silhouette dell'isola (erba `#588157`) contro cielo notturno leggibile (`#1e2e47`): contrasto di $3.08:1$, conforme a WCAG SC 1.4.11 Non-text Contrast ($\ge 3.0:1$).
    - Viso di Pip (`#f4a261`) contro cielo notturno: contrasto di $6.04:1$.
    - Dimostrazione matematica dell'utilità dell'Inverted Hull Toon (`#162238`): il contorno scuro produce un contrasto di $3.94:1$ rispetto al terreno erboso e di $4.78:1$ rispetto al cappotto, garantendo perfetta visibilità della silhouette anche con luminanze cromatiche simili.
- **Contorno Toon Inverted Hull Adattivo su Pip**:
  - Mesh di contorno invertito applicate a corpo (`Pip_Body_outline`, spessore 0.025) e testa (`Pip_Head_outline`, spessore 0.022) in `src/entities/ProceduralPip.ts`.
  - Metodo `Player.setQuality(quality)` che disattiva la visibilità dell'outline (`visible = false`) sul profilo "Bassa", risparmiando draw calls e triangoli per hardware modesti.
- **Configurazione Centralizzata Controlli Touch (`src/data/controlsConfig.ts`)**:
  - Parametri esposti e modificabili per raggio del joystick (65px), deadzone (8px) e sensibilità rotazione telecamera touch (0.005) e mouse (0.003).
- **Ciclo di Vita Audio Robusto (`src/systems/AudioSystem.ts` e `tests/audio_lifecycle.test.ts`)**:
  - Sblocco dell'AudioContext all'interazione utente esteso a tutti gli eventi touch e pointer (`touchstart`, `pointerdown`, `mousedown`, `click`).
  - Gestione dell'evento `visibilitychange`: ripristino automatico dello stato dell'AudioContext (`resume()`) qualora sia stato sospeso o interrotto dal sistema operativo mobile (iOS Safari o Android background).
- **Checklist di Verifica Manuale (`tests/MANUAL_CHECKLIST.md`)**:
  - Creata matrice formattata a tabella con 10 casi di test fisici (ID, Ambito, Procedura, Criterio di Accettazione, Esito, Dispositivo/Browser, Note) per validazioni su smartphone reali.

### Modificato
- `package.json`, `package-lock.json`: Aggiornato `eslint` a `9.39.5` (ultima versione di manutenzione della linea 9.x), risolvendo completamente la vulnerabilità `@eslint/plugin-kit <0.3.4`.
- `src/core/Game.ts`:
  - Integrata istanza di `DebugOverlay` e gestione traiettoria automatica durante il benchmark.
  - Protezione anti-falsi positivi per l'auto-degrade: warm-up iniziale di 5s ignorato, schede minimizzate o in background (`document.hidden`) ignorate, sospensione durante il benchmark.
  - Cooldown dell'auto-degrade fissato esattamente a 30 secondi tra degradazioni successive.
  - Toast di avviso arricchito con pulsante "Annulla": se premuto, ripristina la qualità precedente e imposta un cooldown di sicurezza esteso a 60 secondi.
  - Invocazione di `player.setQuality(quality)` al cambio di profilo grafico.
- `src/ui/NotificationBanner.ts`: Aggiunto supporto a pulsante di azione interattivo con callback e gestione ciclo di vita (`actionText`, `onAction`).
- `src/ui/QualitySettingsUI.ts`: Memorizzazione di `previousQuality` e introduzione di `revertQualityDrop()` per consentire l'annullamento della degradazione automatica.
- `src/ui/TouchOverlay.ts`: Integrata configurazione da `controlsConfig.ts`, implementata deadzone centrale nel joystick e aggiunto metodo `getActiveTouchesDebug()` per coordinare il debug overlay.
- `src/systems/DayNightCycle.ts`: Aggiunto metodo `setTime(hour)` per consentire il congelamento dell'ora solare durante il benchmark.
- `src/data/locales/it.json`: Aggiunti testi localizzati per `btn_undo` ("Annulla") e notifica di ripristino qualità grafica.
- `src/style.css`: Aggiunti stili CSS responsive per `.debug-panel`, `.debug-textarea`, banner toast interattivo `.toast-btn`.
- `README.md`: Aggiunta sezione di troubleshooting per connessione Wi-Fi su smartphone (Firewall Windows Defender porta 5173 TCP, Client Isolation router Wi-Fi e comando `vite preview`), documentazione di `?debug=1` e `?benchmark=1`, e link alla checklist manuale.
- `DECISIONI.md`: Aggiornata ADR 004 con la condizione esplicita per il futuro upgrade a Vitest 5.x; aggiunta ADR 008 sulla politica di immutabilità dei tag e rilascio patch v0.3.1.
- `TODO.md`: Aggiornati debiti tecnici, esito audit e roadmap verso la Fase 4.
- `ARCHITETTURA.md`: Aggiornato albero dei file e indice dei moduli.
- `VERSION`, `package.json`: Avanzamento versione a `0.3.1`.

### Corretto
- Risolta la vulnerabilità di sicurezza `@eslint/plugin-kit` aggiornando ESLint alla versione `9.39.5`.
- Corretti errori di tipo TypeScript (`noUnusedLocals` e compatibilità export di `QualityPreset`).
- Eliminati falsi positivi nell'abbassamento automatico di qualità quando la scheda è in background o durante i primi secondi di caricamento.
- Risolto mancato sblocco audio in determinati browser mobile aggiungendo listener su `pointerdown` e `mousedown` oltre a `touchstart`.

### Rimosso
- Nessuna funzionalità o risorsa rimossa.

### File toccati
- `package.json`: avanzamento versione a `0.3.1` e aggiornamento `eslint` a `9.39.5`.
- `package-lock.json`: aggiornamento deterministico delle dipendenze.
- `VERSION`: impostata versione `0.3.1`.
- `src/core/Game.ts`: integrazione DebugOverlay, benchmark 30s, logica auto-degrade con ignore 5s/hidden/benchmark, cooldown 30s e toast con Annulla.
- `src/entities/ProceduralPip.ts`: mesh contorno Inverted Hull applicate a corpo e testa con metodo statico `setOutlineVisible`.
- `src/entities/Player.ts`: metodo `setQuality` per attivare/disattivare outline toon in base al preset grafico.
- `src/ui/QualitySettingsUI.ts`: esportazione tipo `QualityPreset`, tracciamento `previousQuality` e metodo `revertQualityDrop`.
- `src/ui/NotificationBanner.ts`: supporto pulsante azione interattivo e metodo `hide`.
- `src/ui/DebugOverlay.ts`: nuovo overlay diagnostico (?debug=1, ?benchmark=1, FPS 1% low, touch info, copia con fallback textarea).
- `src/ui/TouchOverlay.ts`: deadzone joystick, parametri da `controlsConfig.ts` e metodo `getActiveTouchesDebug`.
- `src/data/controlsConfig.ts`: nuovo file di configurazione per raggio joystick, deadzone e sensibilità telecamera.
- `src/systems/AudioSystem.ts`: sblocco multitouch (`touchstart`, `pointerdown`, `mousedown`, `click`) e resume su `visibilitychange`.
- `src/systems/DayNightCycle.ts`: metodo `setTime(hour)` per blocco orario durante benchmark.
- `src/data/locales/it.json`: nuove stringhe i18n per pulsante Annulla e ripristino profilo.
- `src/style.css`: stili per debug panel, benchmark, textarea fallback e toast banner interattivo.
- `index.html`: pulsante azione aggiunto all'HTML del toast.
- `tests/readable_night_contrast.test.ts`: nuovo test matematico luminanza e contrasto WCAG 2.1.
- `tests/audio_lifecycle.test.ts`: nuovo test ciclo di vita Web Audio, autoplay policy e ripresa da background.
- `tests/debug_and_benchmark.test.ts`: nuovo test per calcolo 1% low FPS, debug touch da TouchOverlay e outline toggle.
- `tests/toon_outline.test.ts`: nuovo test per contorno Inverted Hull.
- `tests/quality_persistence.test.ts`: aggiunti test per revert auto-degrade e assenza di risalita automatica.
- `tests/MANUAL_CHECKLIST.md`: nuova checklist strutturata per verifiche manuali su dispositivi fisici.
- `README.md`: guida Wi-Fi, istruzioni benchmark/debug e link alla checklist.
- `ARCHITETTURA.md`: aggiornamento albero cartelle e diagramma architetturale.
- `DECISIONI.md`: aggiornamento ADR 004 e stesura ADR 008.
- `TODO.md`: aggiornamento stato del progetto, chiusura Fase 3/3.1 e preparazione Fase 4.

### Motivo
- Esecuzione rigorosa e completa di tutti i requisiti pre-Fase 4 concordati con l'utente: risoluzione vulnerabilità ESLint, taratura scientifica e testata del contrasto notturno, benchmark oggettivo ripetibile di 30s per la misurazione degli FPS, monitoraggio analitico 1% low, contorno toon disattivabile per hardware modesti, auto-degrade protetto da falsi positivi con opzione di annullamento, e adozione della politica vincolante di immutabilità assoluta dei tag Git.

---

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
