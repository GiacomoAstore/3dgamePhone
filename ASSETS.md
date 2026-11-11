# Registro degli Asset e Licenze (ASSETS.md)

<!--
Ultima modifica: 2026-11-11 - v0.3.3 - Integrazione Modelli 3D Cartoon CC0 (Kenney, Quaternius, KayKit)
-->

Questo documento traccia tutti gli asset esterni (modelli 3D, texture, audio, font) utilizzati per *Brumavento*, documentando autore, licenza d'uso, link ufficiali e stato di verifica.

---

## 1. Asset 3D Integrati nel Gioco (`public/models/`)

Tutti i modelli 3D binari `.glb` integrati sono distribuiti con licenza libera **Creative Commons Zero (CC0 1.0 Universal - Public Domain)** e non contengono DRM, marchi registrati o restrizioni commerciali.

| File Asset | Pacchetto / Autore | Licenza | URL Ufficiale | Dimensione | Ruolo nel Gioco |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **`Rogue_Hooded.glb`** | KayKit Adventurers (Kay Lousberg) | **CC0 1.0** | [kaykit.nl](https://kaykit.nl) | 372 KB | Modello 3D principale di Pip (cappuccio, mantello, stivali, rigging) |
| **`Rig_Medium_MovementBasic.glb`** | KayKit Animations | **CC0 1.0** | [kaykit.nl](https://kaykit.nl) | 673 KB | Clip animazioni di Pip (`Walking_A`, `Running_A`, `Jump_Start`) |
| **`Rig_Medium_General.glb`** | KayKit Animations | **CC0 1.0** | [kaykit.nl](https://kaykit.nl) | 808 KB | Clip animazioni di Pip (`Idle_A`, `Interact`, `PickUp`) |
| **`Mage.glb`** | KayKit Adventurers | **CC0 1.0** | [kaykit.nl](https://kaykit.nl) | 344 KB | Modello 3D di Nonna Bussola all'osservatorio (tunica, cappello) |
| **`BoatWSail.glb`** | Quaternius Ships | **CC0 1.0** | [quaternius.com](https://quaternius.com) | 56 KB | Barca a vela cartoon ormeggiata al pontile di legno |
| **`Fox.glb`** | Quaternius Animals | **CC0 1.0** | [quaternius.com](https://quaternius.com) | 576 KB | Fauna selvatica dell'isola (volpina animata con idle e camminata) |
| **`tree_oak.glb`** | Kenney Nature Kit | **CC0 1.0** | [kenney.nl/assets/nature-kit](https://kenney.nl/assets/nature-kit) | 14 KB | Alberi di quercia cartoon a fusto modellato |
| **`tree_detailed.glb`** | Kenney Nature Kit | **CC0 1.0** | [kenney.nl/assets/nature-kit](https://kenney.nl/assets/nature-kit) | 30 KB | Alberi dettagliati a chioma sfaccettata |
| **`plant_bushDetailed.glb`** | Kenney Nature Kit | **CC0 1.0** | [kenney.nl/assets/nature-kit](https://kenney.nl/assets/nature-kit) | 10 KB | Cespugli e macchie di vegetazione per il prato |
| **`rock_largeA.glb`** | Kenney Nature Kit | **CC0 1.0** | [kenney.nl/assets/nature-kit](https://kenney.nl/assets/nature-kit) | 7 KB | Massi rocciosi arrotondati su litorale e scogliere |
| **`flower_purpleA.glb`** | Kenney Nature Kit | **CC0 1.0** | [kenney.nl/assets/nature-kit](https://kenney.nl/assets/nature-kit) | 7 KB | Fiori selvatici del prato |
| **`chest.glb`** | Kenney Pirate Kit | **CC0 1.0** | [kenney.nl/assets/pirate-kit](https://kenney.nl/assets/pirate-kit) | 24 KB | Antico forziere al cerchio di pietre che custodisce il 1° frammento |
| **`barrel.glb`** | Kenney Pirate Kit | **CC0 1.0** | [kenney.nl/assets/pirate-kit](https://kenney.nl/assets/pirate-kit) | 14 KB | Barili d'ormeggio e per l'accampamento dell'osservatorio |
| **`sign.glb`** | Kenney Nature Kit | **CC0 1.0** | [kenney.nl/assets/nature-kit](https://kenney.nl/assets/nature-kit) | 5 KB | Cartello indicatore in legno lungo il sentiero per la collina |
| **`campfire_logs.glb`** | Kenney Nature Kit | **CC0 1.0** | [kenney.nl/assets/nature-kit](https://kenney.nl/assets/nature-kit) | 9 KB | Fuoco da campo con ceppi per l'accampamento |

---

## 2. Asset Procedurali e Sintesi

| Nome Asset | Tipo | Fonte / Autore | Licenza | Note |
| :--- | :--- | :--- | :--- | :--- |
| **Solid Island Terrain Mesh** | Geometria 3D | Procedurale via codice (Three.js) | Licenza del progetto | Plateau collinare con scarpata verticale a -5m e fondale marino |
| **Procedural Audio Engine** | Sintesi Audio | Web Audio API nativo | Licenza del progetto | Onde, brezza marina, passi, salto, fanfare e lanterna |
| **Volumetric Cel-Shading Gradient** | Texture 1D | DataTexture generata a codice | Licenza del progetto | Mappa a gradini discreti per ombreggiature cartoon |
