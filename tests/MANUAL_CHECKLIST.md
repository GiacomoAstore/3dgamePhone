# Checklist di Collaudo Manuale su Dispositivo Reale (Fase 4)

Documento di riferimento per i test fisici su smartphone (Android / iOS) e desktop touch.

---

## 1. Budget e Peso del Caricamento Iniziale Totale

| Componente | Dimensione Non Compressa | Dimensione Trasferita (Gzip) | Note |
| :--- | :---: | :---: | :--- |
| **`index.html`** | 9.7 KB | 2.7 KB | Entrypoint HTML con scheletro UI |
| **`index-[hash].css`** | 11.1 KB | 2.8 KB | Stili CSS, HUD, modali e dialoghi cartoon |
| **`index-[hash].js`** | 773.9 KB | 204.3 KB | Bundle TypeScript, Three.js, BVH e logica di gioco |
| **Texture Palette (`colormap.png`)** | 9.8 KB | 9.8 KB | Texture unica condivisa modelli Kenney |
| **Pip (`Rogue_Hooded.glb`)** | 372.5 KB | 372.5 KB | Modello 3D protagonista |
| **Nonna Bussola (`Mage.glb`)** | 344.2 KB | 344.2 KB | Modello 3D NPC osservatorio |
| **Rig Animazioni (`General` + `Movement`)** | 1.48 MB | 1.48 MB | Clip `Idle_A`, `Running_A`, `Walking_A` |
| **TOTALE CARICAMENTO INIZIALE** | **~3.0 MB** | **~2.4 MB** | **Ampiamente entro il budget di 15-20 MB (< 20%)** |

---

## 2. Protocollo di Test Manuale su Smartphone (Android / iOS)

### Prerequisiti:
1. Smartphone Android collegato al PC con cavo USB (Debug USB attivo).
2. Da terminale PC eseguire:
   ```bash
   adb reverse tcp:5173 tcp:5173
   ```
3. Aprire Google Chrome su Android e navigare all'indirizzo: `http://localhost:5173`.
   *(Su iOS Safari: avviare un tunnel sicuro HTTPS locale o server locale autorizzato).*

---

### Step 1: Installazione PWA e Schermata Home
- [ ] Verificare che compaia il prompt del browser "Aggiungi a schermata Home" o che sia selezionabile dal menu di Chrome.
- [ ] Aggiungere l'app: verificare che l'icona cartoon di Brumavento e il nome appaiano correttamente nel launcher dello smartphone.
- [ ] Avviare Brumavento dall'icona nella schermata Home: verificare che si apra in modalità `standalone` a tutto schermo (senza barra degli indirizzi o controlli del browser).

---

### Step 2: Test Lifecycle "Swipe-Close" dal Task Switcher (Verifica Salvataggio)
1. Cliccare su **"Nuova Partita"** nel menu principale.
2. Parlare con Nonna Bussola all'osservatorio per avviare la quest della lanterna.
3. Camminare con il joystick virtuale fino all'antico cerchio di pietre della scogliera $(18, -15)$.
4. Accendere la Lanterna Magica (tasto `F` o icona lanterna) e raccogliere il 1° Frammento dell'Atlante Vivo.
5. Verificare che compaia il messaggio di notifica "Frammento raccolto!".
6. **Azione critica di chiusura improvvisa**:
   - Senza aprire menu di pausa, aprire il **Task Switcher** dello smartphone (swipe verso l'alto o tasto multitasking).
   - Chiudere forzatamente l'app/scheda con uno swipe deciso verso l'alto (interrompendo il processo di sistema).
7. **Riapertura e Ripresa**:
   - Riaprire Brumavento dalla schermata Home.
   - Verificare che il menu principale mostri il pulsante **"Continua"** abilitato con l'indicazione dei progressi (es. *"Frammenti: 1/7"*).
   - Cliccare **"Continua"**.
8. **Verifica dello Stato di Gioco**:
   - [ ] Pip compare esattamente nella posizione in cui si trovava presso il cerchio di pietre.
   - [ ] Pip è solidamente a terra (quota $y$ ricalcolata correttamente da `getTerrainHeight`, nessun sprofondamento né galleggiamento).
   - [ ] L'inventario contiene 1 frammento raccolto.
   - [ ] La nebbia ha densità ridotta a `0.014` (invece di `0.018`).
   - [ ] L'obiettivo della quest indica correttamente: *"Torna da Nonna Bussola per completare la prima sezione dell'Atlante"*.

---

### Step 3: Test Menu di Pausa e Sospensione Audio
- [ ] Con la musica o l'effetto delle onde attivo, premere l'icona "Pausa" in alto a destra.
- [ ] Verificare che il gioco si fermi (Pip e volpe congelati).
- [ ] Verificare che l'audio sia istantaneamente e totalmente muto (zero sibili o consumi in background).
- [ ] Cambiare app o bloccare lo schermo del telefono.
- [ ] Sbloccare lo schermo e tornare a Brumavento: **verificare che l'audio rimanga muto finché non si preme "Riprendi"**.
- [ ] Premere "Riprendi": verificare che il movimento e l'audio ripartano fluidamente.

---

### Step 4: Accessibilità Touch
- [ ] Verificare che tutti i pulsanti (Start, Opzioni, Diario, Risposte di dialogo, Pausa) abbiano un'area di tocco confortevole $\ge 44 \times 44\,\text{px}$.
- [ ] Verificare che il joystick virtuale non scivoli né si blocchi durante rapide virate con il pollice.
