# Registro degli Asset e Licenze (ASSETS.md)

<!--
Ultima modifica: 2026-11-10 - v0.2.0 - Aggiornamento pacchetti consigliati Kenney e Quaternius
-->

Questo documento traccia tutti gli asset esterni (modelli 3D, texture, audio, font) utilizzati o pianificati per *Brumavento*, documentando autore, licenza d'uso, link ufficiali e data di verifica.

---

## 1. Asset Attuali (Fase 0, 1 e 2)
In tutte le prime tre fasi, tutti gli elementi visivi e sonori (Pip, Nonna Bussola, isola, rocce, vegetazione, pontile, frammento dell'Atlante e sintesi audio) sono **generati proceduralmente via codice** mediante Three.js e Web Audio API.  
Nessun file binario `.glb` o `.mp3` esterno è attualmente incorporato nella build, mantenendo il bundle compatto e privo di dipendenze esterne.

| Nome Asset | Tipo | Fonte / Autore | Licenza | Link | Data Verifica | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Procedural Terrain & Island** | Mesh 3D | Generato a codice (Three.js) | Licenza del progetto | - | 2026-11-10 | Forme low-poly primitive con materiali toon |
| **Procedural Pip (Protagonista)** | Mesh 3D | Generato a codice (Three.js) | Licenza del progetto | - | 2026-11-10 | Modello a capsule toon con cappello e lanterna |
| **Procedural Nonna Bussola** | Mesh 3D | Generato a codice (Three.js) | Licenza del progetto | - | 2026-11-10 | Modello anziana con scialle, chignon e telescopio |
| **Procedural Collectibles & Fragment**| Mesh 3D | Generato a codice (Three.js) | Licenza del progetto | - | 2026-11-10 | Pergamena dorata, conchiglie, funghi e stelle |
| **Procedural Web Audio Engine** | Audio SFX | Sintesi nativa (Web Audio) | Licenza del progetto | - | 2026-11-10 | Passi, salto, chimes, lanterna e brezza marina |

---

## 2. Pacchetti Consigliati per le Fasi Successive (Fase 3+ e Sostituzione Graduale)
> [!IMPORTANT]
> **Nota sulle Licenze**: In accordo con le regole di progetto, tutti i pacchetti esterni elencati di seguito sono contrassegnati come **"Licenza da verificare dall'utente"** e NON verranno importati nel codice finché l'utente non ne avrà verificato e confermato personalmente termini e condizioni sul sito ufficiale dell'autore.

### 1. Kenney Nature Kit
- **Autore**: Kenney ([kenney.nl](https://kenney.nl))
- **Stato Licenza**: **Licenza da verificare dall'utente** (dichiarata CC0 dall'autore, in attesa di conferma da parte dell'utente)
- **URL Pacchetto**: [https://kenney.nl/assets/nature-kit](https://kenney.nl/assets/nature-kit)
- **Contenuto**: Alberi low-poly di varie forme, ceppi, rocce litoranee e cespugli cartoon in formato `.glb`.

### 2. Kenney Fantasy Town Kit
- **Autore**: Kenney
- **Stato Licenza**: **Licenza da verificare dall'utente** (dichiarata CC0 dall'autore, in attesa di conferma da parte dell'utente)
- **URL Pacchetto**: [https://kenney.nl/assets/fantasy-town-kit](https://kenney.nl/assets/fantasy-town-kit)
- **Contenuto**: Dettagli per l'osservatorio astronomico sulla collina (telescopi rifiniti, librerie per cartografi, barchette in legno per il Capitano Marea).

### 3. Quaternius Tiny Animated Characters
- **Autore**: Quaternius ([quaternius.com](https://quaternius.com))
- **Stato Licenza**: **Licenza da verificare dall'utente** (dichiarata CC0 dall'autore, in attesa di conferma da parte dell'utente)
- **URL Pacchetto**: [https://quaternius.com](https://quaternius.com)
- **Contenuto**: Personaggi low-poly con armature scheletriche e clip di animazione esportate in glTF/GLB (walk, run, jump, idle).

### 4. Kenney Audio (Impact & UI Sounds)
- **Autore**: Kenney
- **Stato Licenza**: **Licenza da verificare dall'utente** (dichiarata CC0 dall'autore, in attesa di conferma da parte dell'utente)
- **URL Pacchetto**: [https://kenney.nl/assets/impact-sounds](https://kenney.nl/assets/impact-sounds)
- **Contenuto**: Campioni sonori leggeri per interfacce e collisioni qualora si decida di affiancare clip registrate alla sintesi procedurale.
