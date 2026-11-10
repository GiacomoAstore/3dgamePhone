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
