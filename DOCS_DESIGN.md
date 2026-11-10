# Brumavento: Game Design e Specifiche Tecniche

<!--
Ultima modifica: 2026-11-10 - v0.1.0 - Inizializzazione documento di Game Design
-->

## 1. Visione in breve
**Brumavento** è un gioco 3D di esplorazione dal tono cartoon, giocabile nel browser da smartphone e desktop, senza installazione. Il giocatore è un apprendista cartografo che esplora un arcipelago avvolto dalla nebbia, ritrova i frammenti di una mappa magica e restituisce colore e vita al mondo.

### Pilastri del design:
1. **Semplicità**: si gioca con un solo stick/tasto direzionale e un pulsante d'azione.
2. **Scoperta**: il piacere è esplorare, non combattere. Ogni angolo nasconde qualcosa.
3. **Immersione**: luce, suoni, nebbia e colori che cambiano trasmettono atmosfera.
4. **Espandibilità**: tutto il contenuto (isole, missioni, personaggi) è definito in dati, così si aggiunge senza toccare il motore.

---

## 2. Epoca e ambientazione
- **Epoca**: mondo fantastico ispirato alla fine dell'Ottocento (mongolfiere, bussole, telescopi, lanterne a olio, velieri, osservatori e fari). Nessuna tecnologia moderna.
- **Luogo**: Arcipelago di Brumavento, isole collegate da ponti, funivie e barche in un mare calmo e cielo di nuvole morbide.
- **Tono**: caldo, curioso, leggero, adatto a tutte le età. Nessuna violenza. Ispirazioni: *Journey*, *A Short Hike*, *Animal Crossing*, *The Legend of Zelda: The Wind Waker*.

---

## 3. Trama e Personaggi
L'Atlante Vivo teneva insieme l'arcipelago. Il Grande Soffio lo ha spezzato in 7 frammenti, avvolgendo il mondo in una nebbia grigia. Pip, apprendista di Nonna Bussola, parte con la sua Lanterna Magica per ricomporre la mappa e ridare colore al mondo.

### Personaggi principali:
- **Pip**: protagonista curioso e coraggioso dalle proporzioni buffe.
- **Nonna Bussola**: mentore nell'osservatorio dell'isola iniziale.
- **Gufo Sestante**: compagno volante, indizi e tutorial.
- **Capitano Marea**: barcaiolo per viaggiare tra le isole.
- **La Nebbia**: presenza sfuggente che si ritira al ripristino delle zone.

---

## 4. Gameplay
### Core loop:
`Esplora l'isola` → `Trova indizi/oggetti` → `Risolvi piccolo enigma` → `Recupera frammento` → `La nebbia si ritira e l'isola si colora` → `Sblocca la prossima isola`.

### Meccaniche base (MVP):
- Movimento terza persona (camminata, corsa, salto).
- Lanterna magica (tasto azione per rivelare segreti e diradare la nebbia).
- Interazione (dialoghi con NPC, raccolta oggetti, leve).
- Diario del cartografo (missioni, mappa progressiva).
- Collezionabili secondari (stelle marine, conchiglie, funghi).
- Salvataggio automatico locale.

---

## 5. Stile Artistico e Palette
- **Look**: Low-poly cartoon, forme arrotondate, proporzioni morbide.
- **Materiali**: Toon shading / sfumature discrete a gradini con luce calda.
- **Palette**: Transizione da desaturata/grigio-nebbiosa a vivida (turchese, corallo, giallo burro, verde menta) con il recupero dei frammenti.
- **Atmosfera**: Nebbia reattiva, raggi di sole, lucciole, particelle di polline e spuma d'onde.

---

## 6. Schema Controlli
| Azione | Desktop | Smartphone |
| :--- | :--- | :--- |
| **Movimento** | WASD / Frecce | Joystick virtuale (sinistra) |
| **Camera** | Mouse / Drag destro | Touch drag (destra) |
| **Salto** | Barra spaziatrice | Pulsante Salto (destra) |
| **Lanterna / Azione** | `E` o Click sinistro | Pulsante Azione (destra) |
| **Diario / Mappa** | `Esc` o `Tab` | Icona Diario (in alto) |

