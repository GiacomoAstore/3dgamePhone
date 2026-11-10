# Registro degli Asset e Licenze (ASSETS.md)

<!--
Ultima modifica: 2026-11-10 - v0.3.0 - Conferma asset procedurali e Web Audio in Fase 3
-->

Questo documento traccia tutti gli asset esterni (modelli 3D, texture, audio, font) utilizzati o pianificati per *Brumavento*, documentando autore, licenza d'uso, link ufficiali e data di verifica.

---

## 1. Asset Attuali (Fase 0, 1, 2 e 3)
In tutte le prime quattro fasi, tutti gli elementi visivi e sonori (Pip, Nonna Bussola, isola, rocce, vegetazione, pontile, frammento dell'Atlante, particelle e sintesi audio) sono **generati proceduralmente via codice** mediante Three.js e Web Audio API.  
Nessun file binario `.glb` o `.mp3` esterno è attualmente incorporato nella build, mantenendo il bundle compatto (~618 KB totali minificati) e privo di dipendenze esterne.

| Nome Asset | Tipo | Fonte / Autore | Licenza | Link | Data Verifica | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Procedural Terrain & Island** | Mesh 3D | Generato a codice (Three.js) | Licenza del progetto | - | 2026-11-10 | Forme low-poly primitive con materiali toon |
| **Procedural Pip (Protagonista)** | Mesh 3D | Generato a codice (Three.js) | Licenza del progetto | - | 2026-11-10 | Modello a capsule toon con cappello e lanterna |
| **Procedural Nonna Bussola** | Mesh 3D | Generato a codice (Three.js) | Licenza del progetto | - | 2026-11-10 | Modello anziana con scialle, chignon e telescopio |
| **Procedural Collectibles & Fragment**| Mesh 3D | Generato a codice (Three.js) | Licenza del progetto | - | 2026-11-10 | Pergamena dorata, conchiglie, funghi e stelle |
| **Atmospheric Particle System** | Particelle 3D | Generato a codice (Three.js) | Licenza del progetto | - | 2026-11-10 | 750 particelle a 1 draw-call (lucciole, polline, spuma, stelle) |
| **Procedural Web Audio Engine** | Audio SFX | Sintesi nativa (Web Audio) | Licenza del progetto | - | 2026-11-10 | Passi, salto, chimes, lanterna, brezza e fanfare |

---

## 2. Pacchetti Consigliati per le Fasi Successive (Fase 3+ e Sostituzione Graduale)
Pacchetti selezionati con licenza permissiva **CC0 1.0 Universal (Pubblico Dominio)**:

### 1. Kenney Nature Kit
- **Autore**: Kenney ([kenney.nl](https://kenney.nl))
- **Licenza**: CC0 1.0 Universal (libero uso personale e commerciale, nessuna attribuzione obbligatoria)
- **URL Pacchetto**: [https://kenney.nl/assets/nature-kit](https://kenney.nl/assets/nature-kit)
- **Contenuto**: Alberi low-poly di varie forme, ceppi, rocce litoranee e cespugli cartoon in formato `.glb`.

### 2. Kenney Fantasy Town Kit
- **Autore**: Kenney
- **Licenza**: CC0 1.0 Universal
- **URL Pacchetto**: [https://kenney.nl/assets/fantasy-town-kit](https://kenney.nl/assets/fantasy-town-kit)
- **Contenuto**: Dettagli per l'osservatorio astronomico sulla collina (telescopi rifiniti, librerie per cartografi, barchette in legno per il Capitano Marea).

### 3. Quaternius Tiny Animated Characters
- **Autore**: Quaternius ([quaternius.com](https://quaternius.com))
- **Licenza**: CC0 1.0 Universal
- **URL Pacchetto**: [https://quaternius.com](https://quaternius.com)
- **Contenuto**: Personaggi low-poly con armature scheletriche e clip di animazione esportate in glTF/GLB (walk, run, jump, idle).

### 4. Kenney Audio (Impact & UI Sounds)
- **Autore**: Kenney
- **Licenza**: CC0 1.0 Universal
- **URL Pacchetto**: [https://kenney.nl/assets/impact-sounds](https://kenney.nl/assets/impact-sounds)
- **Contenuto**: Campioni sonori leggeri per interfacce e collisioni qualora si decida di affiancare clip registrate alla sintesi procedurale.
