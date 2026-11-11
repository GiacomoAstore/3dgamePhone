# Brumavento - L'Arcipelago della Nebbia

<!--
Ultima modifica: 2026-11-11 - v0.3.3 - Integrazione Modelli 3D Cartoon CC0 (Kenney, Quaternius, KayKit)
-->

**Brumavento** è un gioco 3D di esplorazione cartoon, giocabile direttamente nel browser da smartphone e desktop senza alcuna installazione.  
Il giocatore interpreta **Pip**, un piccolo apprendista cartografo guidato da **Nonna Bussola**, impegnato ad esplorare un arcipelago avvolto dalla nebbia, ritrovare i 7 frammenti dell'Atlante Vivo e restituire luce e colore al mondo.

---

## 📱 Come avviare e testare il gioco

### Requisiti
- **Node.js**: versione 18 o superiore (testato con successo su Node.js v24).
- **Browser**: qualsiasi browser moderno con supporto WebGL (Chrome, Safari iOS, Firefox, Edge).

### 1. Avvio in locale su Desktop
1. Clona o apri la cartella del progetto nel terminale.
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Avvia il server di sviluppo Vite:
   ```bash
   npm run dev
   ```
4. Apri il browser su [http://localhost:5173](http://localhost:5173).

---

### 2. Come provarlo su Smartphone (stessa rete Wi-Fi)
Vite è preconfigurato in `vite.config.ts` con `server.host = true` per accettare connessioni da altri dispositivi sulla rete locale.

1. **Stessa rete Wi-Fi**: assicurati che sia il computer che lo smartphone siano connessi alla stessa rete Wi-Fi (non usare reti isolate o dati cellulari).
2. **Trova l'IP locale del PC**:
   - Su Windows: apri PowerShell e digita `ipconfig`.
   - Cerca la scheda Wi-Fi o Ethernet attiva e annota l'indirizzo `IPv4` (es. `192.168.1.45`).
   - *Nota*: All'avvio di `npm run dev`, Vite visualizzerà automaticamente l'URL di rete nel terminale:
     ```text
     ➜  Local:   http://localhost:5173/
     ➜  Network: http://192.168.1.45:5173/
     ```
3. **Apri dal telefono**: apri Safari (iOS) o Chrome (Android) e digita l'indirizzo mostrato (es. `http://192.168.1.45:5173`).
4. **Gioca**: premi **"Inizia Esplorazione"**. Lo schermo si adatta a tutto schermo con controlli touch reattivi, blocco del pinch-to-zoom indesiderato e dialoghi touch leggibili.

#### ⚠️ Se lo smartphone non si collega sulla rete Wi-Fi:
Se il browser del telefono segnala "Impossibile raggiungere il sito" o resta in caricamento infinito, controlla questi tre punti tipici dei sistemi Windows e router domestici:
1. **Firewall di Windows Defender**:
   - Windows spesso blocca il traffico in entrata su porte non standard come `5173`.
   - Per consentire l'accesso temporaneo, esegui in PowerShell (come Amministratore):
     ```powershell
     New-NetFirewallRule -DisplayName "Brumavento Dev Server 5173" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
     ```
   - In alternativa, quando Windows mostra il pop-up "Avviso di sicurezza Windows Defender", spunta sia le reti private che quelle pubbliche e consenti l'accesso a `node.exe`.
2. **Isolamento AP (Client Isolation) sul Router Wi-Fi**:
   - Alcuni router (specialmente reti aziendali, hotspot di hotel o router con "Rete Ospiti") hanno attiva la funzione *Client Isolation* (o *AP Isolation*), che impedisce ai dispositivi connessi al Wi-Fi di comunicare tra loro.
   - Collega entrambi i dispositivi alla rete Wi-Fi principale (non ospite) o crea un hotspot Wi-Fi temporaneo dal telefono connettendo il PC.
3. **Avvio con Vite Preview su bundle di produzione**:
   - Per testare le massime prestazioni reali senza il sovraccarico di Vite HMR:
     ```bash
     npm run build
     npx vite preview --host 0.0.0.0 --port 5173
     ```

---

## ⏱️ Modalità Debug e Benchmark Automatico (30s)

Per eseguire analisi oggettive e ripetibili senza variazioni manuali:
- **Modalità Debug (`?debug=1`)**:
  - Apri `http://localhost:5173/?debug=1` (o l'IP locale).
  - Mostra a schermo in tempo reale: FPS medio, FPS minimo, **1% Low FPS**, draw calls WebGL, triangoli renderizzati, memorie (geometrie e texture), profilo grafico attivo e i touch identifier tracciati da `TouchOverlay`.
  - Cliccando su **"Copia Report"** genera un report formattato negli appunti (o apre un modal con `<textarea>` selezionabile se la clipboard di sistema è bloccata su HTTP non protetto).
- **Modalità Benchmark Automatico (`?benchmark=1`)**:
  - Apri `http://localhost:5173/?benchmark=1`.
  - Blocca l'ora del giorno a mezzogiorno (12:00 solare), disattiva l'auto-degrade e pilota automaticamente la telecamera lungo una traiettoria orbitale deterministica attorno all'isola per 30 secondi.
  - Al termine mostra il report finale congelato con il riepilogo metrico completo.

---

## 📋 Checklist di Verifica Manuale
La lista delle prove fisiche su smartphone e desktop (audio lifecycle, multi-touch, contrasto visivo notturno, toggle outline e benchmark) è documentata in:
👉 **[tests/MANUAL_CHECKLIST.md](file:///c:/Users/user/Desktop/workspace/3dgamePhone/tests/MANUAL_CHECKLIST.md)**

---

## 🎮 Schema dei Controlli

| Azione | Desktop (Tastiera e Mouse) | Smartphone (Touch Screen) |
| :--- | :--- | :--- |
| **Movimento** | `W`, `A`, `S`, `D` o Frecce direzionali | **Joystick virtuale** dinamico in basso a sinistra |
| **Rotazione Camera** | Trascina con il Mouse oppure tasti `Q` / `C` | **Trascina con il dito** sulla metà destra dello schermo |
| **Salto** | Barra spaziatrice (`Spazio`) | Pulsante circolare **⤴** in basso a destra |
| **Interazione / Parla con NPC** | Tasto `E` (priorità massima vicino a target) | Pulsante circolare **🏮** vicino al target |
| **Lanterna Magica (Accendi/Spegni)** | Tasto `F` (oppure `E` se nessun target) | Pulsante circolare **🏮** |
| **Guida Controlli** | Tasto `H` oppure pulsante `❓ Controlli` | Pulsante `❓ Controlli` in alto a destra |
| **Diario del Cartografo** | Tasto `Tab`, `Esc` o `J` | Icona **📖 Diario** in alto a destra |
| **Pannello Impostazioni (Qualità & Audio)** | Icona `⚙️` nell'HUD | Icona **⚙️** in alto a destra |

---

## 🌅 Atmosfera, Ciclo Giorno / Notte e Audio (Fase 3)
- **Ciclo Circadiano Dinamico**: Il tempo scorre naturalmente (giorno completo in 8 minuti). Il Sole e la Luna solcano l'arco celeste, proiettando ombre dinamiche e variando l'illuminazione tra alba pesca, pieno giorno dorato, tramonto corallo e notte blu profondo con stelle scintillanti.
- **Particelle d'Atmosfera (Single Draw-Call)**: Lucciole che fluttuano sui funghi illuminando la notte, polline trasportato dal vento, spuma alla battigia e stelle della volta celeste.
- **Audio Procedurale Web Audio (Zero File Esterni)**: Effetti sonori e brezza marina generati in tempo reale (passi di Pip, salto cartoon, toggle lanterna, chime di raccolta e fanfara trionfale dell'Atlante).
- **Menu Impostazioni e Profili Qualità**: Toccando l'icona ⚙️ puoi selezionare il preset grafico (Bassa: 1.0x DPR e ombre off; Media: 1.4x DPR; Alta: 2.0x DPR e ombre PCFSoft) e regolare i livelli di volume (Generale, Brezza/Onde, Effetti).

---

## 🧭 Guida alla Prima Missione (Fase 2)
1. **Incontra Nonna Bussola**: sali sulla cima della collina fino all'osservatorio e premi `E` (o tocca 🏮) per parlare con Nonna Bussola.
2. **Attiva la Missione**: Nonna Bussola ti parlerà del Grande Soffio e ti incaricherà di recuperare il 1° Frammento dell'Atlante Vivo.
3. **Cerca il Cerchio di Pietre**: scendi verso la scogliera a est. Vedrai un antico cerchio di pietre con un bagliore tenue fluttuante.
4. **Accendi la Lanterna Magica**: premi `E` (o 🏮) per accendere la lanterna: la pergamena dorata dell'Atlante si materializzerà con piena luce!
5. **Raccogli il Frammento**: avvicinati per raccoglierlo. Ammira la **ritirata visibile della nebbia**, il cielo che diventa turchese caldo e l'erba dell'isola che si risveglia in un verde smeraldo brillante.
6. **Controlla il Diario**: premi `Tab` o tocca `📖` per visualizzare i tuoi progressi, i frammenti (1/7) e le conchiglie, funghi e stelle marine raccolti.
7. **Torna da Nonna Bussola**: interagisci di nuovo con lei per completare la prima sezione dell'Atlante!

---

## 🎯 Dispositivo di Riferimento e Benchmark degli FPS (Fase 3)
Per validare le prestazioni in modo scientifico e ripetibile, definiamo l'hardware target e il percorso di prova:

### Dispositivi di Riferimento
- **Smartphone Mobile di Riferimento**:
  - Fascia: Smartphone Android medio (es. SoC Snapdragon 720G / Helio G85 o equivalente, GPU Adreno 618 / Mali-G52, 4-6 GB RAM, display 1080x2400 a 60 Hz).
  - Browser: Chrome Mobile 120+ / Safari iOS 17+.
  - Profilo target predefinito: **Media** (1.4x DPR, ombre basiche, 500 particelle).
  - **Budget Prestazionale**: $\ge 30$ FPS stabili senza cali percepibili.
- **Desktop di Riferimento**:
  - Laptop standard con GPU integrata (es. Intel Iris Xe / AMD Radeon Vega / Apple Silicon M1 base).
  - Browser: Chrome / Edge / Firefox desktop a 1080p.
  - Profilo target predefinito: **Alta** (2.0x DPR, ombre PCFSoft, 750 particelle).
  - **Budget Prestazionale**: $\ge 60$ FPS continui.

### Scena di Prova Ripetibile (Percorso Benchmark 30s)
1. **Spawn**: Pip compare al centro dell'isola (0, 5, 0).
2. **Corsa collina**: Avanza lungo il sentiero verso l'osservatorio di Nonna Bussola (inquadrando sia il terreno che l'orizzonte marino con onde animate).
3. **Discesa scogliera**: Scende verso il cerchio di pietre della scogliera orientale con la Lanterna Magica accesa.
4. **Sosta particelle**: Attesa di 5 secondi nel cerchio di pietre mentre lucciole, polline del vento e spuma marina sono contemporaneamente nel cono visivo.
- Se il framerate su dispositivi modesti scende sotto i 26 FPS per oltre 5 secondi, il sistema **Auto-Degrade** riduce automaticamente il profilo grafico di un gradino e mostra un avviso a schermo.

---

## 🛠️ Comandi di Sviluppo e Test

- `npm run dev`: avvia il server Vite con Hot Module Replacement (HMR).
- `npm run build`: esegue la compilazione TypeScript strict e la build di produzione in `dist/`.
- `npm test`: esegue la suite completa di 69 test unitari e di integrazione con **Vitest** (fisica, salti, collisioni BVH, quest, dialoghi, collezionabili, priorità dell'azione, audio con fallback e lifecycle, cel-shading a gradini, contorni toon Inverted Hull, contrasto notturno WCAG 2.1, calcolo 1% low FPS, debug touch e persistenza impostazioni).
- `npm run lint`: analisi statica del codice con **ESLint** per TypeScript.
- `npm run format`: formattazione automatica del codice sorgente con **Prettier**.

---

## 📐 Documentazione di Progetto
- [GEMINI.md](file:///c:/Users/user/Desktop/workspace/3dgamePhone/GEMINI.md): Regole vincolanti di sviluppo per l'IA.
- [ARCHITETTURA.md](file:///c:/Users/user/Desktop/workspace/3dgamePhone/ARCHITETTURA.md): Mappa dei moduli, diagrammi di flusso e cartelle.
- [CHANGELOG.md](file:///c:/Users/user/Desktop/workspace/3dgamePhone/CHANGELOG.md): Registro cronologico delle modifiche e versioning semantico.
- [DECISIONI.md](file:///c:/Users/user/Desktop/workspace/3dgamePhone/DECISIONI.md): Registro delle decisioni architetturali (ADR 001 - 007).
- [TODO.md](file:///c:/Users/user/Desktop/workspace/3dgamePhone/TODO.md): Roadmap e backlog per le prossime fasi.
- [ASSETS.md](file:///c:/Users/user/Desktop/workspace/3dgamePhone/ASSETS.md): Registro degli asset 3D e licenze.
