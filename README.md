# Brumavento - L'Arcipelago della Nebbia

<!--
Ultima modifica: 2026-11-10 - v0.1.0 - Documentazione Fasi 0 e 1 (Setup, comandi e guida smartphone)
-->

**Brumavento** è un gioco 3D di esplorazione cartoon, giocabile direttamente nel browser da smartphone e desktop senza alcuna installazione.  
Il giocatore interpreta **Pip**, un piccolo apprendista cartografo guidato da **Nonna Bussola**, impegnato ad esplorare un arcipelago avvolto dalla nebbia, ritrovare i 7 frammenti dell'Atlante Vivo e restituire luce e colore al mondo.

---

## 📱 Come avviare e testare il gioco

### Requisiti
- **Node.js**: versione 18 o superiore (testato con successo su Node.js v24 LTS).
- **Browser**: qualsiasi browser moderno con supporto WebGL (Chrome, Safari iOS, Firefox, Edge).

### 1. Avvio in locale su Desktop
1. Clona o apri la cartella del progetto nel terminale.
2. Installa le dipendenze (se non già fatto):
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
4. **Gioca**: premi **"Inizia Esplorazione"**. Lo schermo si adatta a tutto schermo con controlli touch reattivi e blocco del pinch-to-zoom indesiderato.

---

## 🎮 Schema dei Controlli

| Azione | Desktop (Tastiera e Mouse) | Smartphone (Touch Screen) |
| :--- | :--- | :--- |
| **Movimento** | `W`, `A`, `S`, `D` o Frecce direzionali | **Joystick virtuale** dinamico in basso a sinistra |
| **Rotazione Camera** | Trascina con il Mouse (tasto sinistro o destro) | **Trascina con il dito** sulla metà destra dello schermo |
| **Salto** | Barra spaziatrice (`Spazio`) | Pulsante circolare **⤴** in basso a destra |
| **Lanterna Magica** | Tasto `E` | Pulsante circolare **🏮** in basso a destra |

---

## 🛠️ Comandi di Sviluppo e Test

- `npm run dev`: avvia il server Vite con supporto Hot Module Replacement (HMR).
- `npm run build`: esegue la compilazione TypeScript strict e la build di produzione WebGL in `dist/`.
- `npm test`: esegue la suite completa di test unitari con **Vitest** (fisica, salti, collisioni terreno e matematica).
- `npm run lint`: analisi statica del codice con **ESLint** per TypeScript.
- `npm run format`: formattazione automatica del codice sorgente con **Prettier**.

---

## 📐 Documentazione di Progetto
- [GEMINI.md](file:///c:/Users/user/Desktop/workspace/3dgamePhone/GEMINI.md): Regole vincolanti di sviluppo per l'IA.
- [ARCHITETTURA.md](file:///c:/Users/user/Desktop/workspace/3dgamePhone/ARCHITETTURA.md): Mappa dei moduli, diagrammi di flusso e cartelle.
- [CHANGELOG.md](file:///c:/Users/user/Desktop/workspace/3dgamePhone/CHANGELOG.md): Registro cronologico delle modifiche e versioning semantico.
- [DECISIONI.md](file:///c:/Users/user/Desktop/workspace/3dgamePhone/DECISIONI.md): Registro delle decisioni architetturali (ADR 001, ADR 002, ADR 003).
- [TODO.md](file:///c:/Users/user/Desktop/workspace/3dgamePhone/TODO.md): Roadmap e backlog per le prossime fasi.
- [ASSETS.md](file:///c:/Users/user/Desktop/workspace/3dgamePhone/ASSETS.md): Registro degli asset 3D e licenze.
