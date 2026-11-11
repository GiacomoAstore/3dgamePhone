# Registro degli Asset e Licenze (ASSETS.md)

<!--
Ultima modifica: 2026-11-11 - v0.3.9 - URL diretti di download, URL licenze ufficiali, dichiarazione conformità TLS, catalogo modelli inutilizzati e proposta di rimozione
-->

Questo documento traccia tutti gli asset esterni (modelli 3D, texture, audio, font) utilizzati per *Brumavento*, documentando autore, licenza d'uso dichiarata, link diretti di download, link ufficiali con licenza, hash SHA-256 e stato di verifica.

---

## 1. Metodo di Acquisizione e Download degli Asset

Tutti i modelli 3D binari `.glb` e le relative texture sono stati scaricati tramite uno script Node.js che attinge direttamente ai repository Git e mirror CDN pubblici ufficiali dei pacchetti open-source degli autori originali:
- **Kenney** ([kenney.nl](https://kenney.nl)) per Nature Kit, Pirate Kit e Fantasy Town.
- **Kay Lousberg / KayKit** ([kaykit.nl](https://kaykit.nl)) per Adventurers e Character Animations.
- **Quaternius** ([quaternius.com](https://quaternius.com)) per Quaternius Ships e Ultimate Modular Animals.

### 1.1 Dichiarazione sulla Verifica TLS / Certificati HTTPS
Durante il download automatizzato degli asset eseguito dall'ambiente Node.js:
- **La verifica dei certificati TLS/SSL NON è mai stata disattivata**.
- La variabile di sistema `NODE_TLS_REJECT_UNAUTHORIZED` **NON** è mai stata impostata a `0`.
- Tutte le richieste HTTP sono state veicolate su protocollo sicuro HTTPS standard (`https://`) con validazione crittografica della catena di certificati delle Certificate Authority (CA) ufficiali.

> [!IMPORTANT]
> **Stato di verifica licenza**: Tutti gli autori rilasciano i loro pacchetti sotto la dicitura **CC0 1.0 Universal (Public Domain Dedication)**. Come da politica vincolante di progetto (`GEMINI.md`), ciascun asset è contrassegnato con la dicitura **"Licenza CC0 dichiarata dall'autore, da verificare dall'utente"** finché non viene esplicitamente confermata e validata dall'utente finale prima di qualsiasi distribuzione commerciale.

---

## 2. Registro Completo Modelli 3D e Texture (`public/models/`)

| File Asset | Pacchetto / Autore | SHA-256 (Checksum) | Licenza Dichiarata & Pagina Ufficiale | URL Esatto di Download Diretto | Dimensione | Ruolo nel Gioco |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- |
| **`barrel.glb`** | Kenney Pirate Kit | `7616DEDF7C1023AFA6ECD3C52A4609460AAE0E582DEE14E60EC5E47C1174793B` | CC0 ([Pagina Kenney Pirate Kit](https://kenney.nl/assets/pirate-kit)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/KenneyNL/Starter-Kits/master/3D/Pirate%20Kit/barrel.glb` | 13.8 KB | Barili d'ormeggio e accampamento osservatorio |
| **`boat-sail-a.glb`** | Kenney Pirate Kit | `35C8E2ADAE1D3F0FE9D0E37C65422F1C6C6F1F10D818F9BDE273A9DA264EEF4C` | CC0 ([Pagina Kenney Pirate Kit](https://kenney.nl/assets/pirate-kit)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/KenneyNL/Starter-Kits/master/3D/Pirate%20Kit/boat-sail-a.glb` | 34.4 KB | *Inutilizzato nel codice* (vedi sez. 2.2) |
| **`BoatWSail.glb`** | Quaternius Ships | `DD0D959F66C058E2AFCFC01227F80B83347B5105D324690596A0C0EB6E65FB95` | CC0 ([Pagina Quaternius Ships](https://quaternius.com/packs/modularships.html)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/quaternius/ModularShips/master/glTF/BoatWSail.glb` | 56.8 KB | Barca a vela ormeggiata al pontile di legno |
| **`campfire_logs.glb`** | Kenney Nature Kit | `98D87CDCF9095B94FD348D0946E911DD4CA6C0956BAC3318CFD2B0030B86055A` | CC0 ([Pagina Kenney Nature Kit](https://kenney.nl/assets/nature-kit)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/KenneyNL/Starter-Kits/master/3D/Nature%20Kit/campfire_logs.glb` | 9.1 KB | Fuoco da campo con ceppi per l'accampamento |
| **`character.glb`** | Kenney Animated | `7112F6A08400914F9DA546F3E6029E947CC9EAB2B4A6DA5EB99776111289EFB1` | CC0 ([Pagina Kenney Animated](https://kenney.nl/assets/animated-characters-1)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/KenneyNL/Starter-Kits/master/3D/Animated%20Characters/character.glb` | 85.6 KB | *Inutilizzato nel codice* (sostituito da Rogue_Hooded) |
| **`chest.glb`** | Kenney Pirate Kit | `26D26C4C032A12320FE05B5005A72EBA96DB7167DB0D35873639A4B7DCC06BCB` | CC0 ([Pagina Kenney Pirate Kit](https://kenney.nl/assets/pirate-kit)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/KenneyNL/Starter-Kits/master/3D/Pirate%20Kit/chest.glb` | 24.6 KB | Antico forziere al cerchio di pietre (custode 1° frammento) |
| **`flower_purpleA.glb`** | Kenney Nature Kit | `F6FC34C96A03420A74FE36D4C2D0EC88F15204FCAD99CD1416C3C4ECB22E48C4` | CC0 ([Pagina Kenney Nature Kit](https://kenney.nl/assets/nature-kit)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/KenneyNL/Starter-Kits/master/3D/Nature%20Kit/flower_purpleA.glb` | 6.9 KB | *Inutilizzato nel codice* (sostituito da InstancedMesh) |
| **`Fox.glb`** | Quaternius Animals | `1785E9CE836107276853A8A8183D7C6FA14E5BEFBD105D79BE1FB7E38DE9F446` | CC0 ([Pagina Quaternius Animals](https://quaternius.com/packs/modularanimals.html)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/quaternius/ModularAnimals/master/glTF/Fox.glb` | 576.3 KB | Fauna selvatica (volpe animata con idle e camminata) |
| **`Mage.glb`** | KayKit Adventurers | `1F7D891BDE50B879C70965F155B7B765B166DC3F8518E5ABB86C0002F191A26E` | CC0 ([Pagina KayKit Adventurers](https://kaylousberg.itch.io/kaykit-adventurers)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/KayLousberg/KayKit-Adventurers/main/Characters/gltf/Mage.glb` | 344.2 KB | Modello 3D di Nonna Bussola all'osservatorio |
| **`mushroom_redGroup.glb`** | Kenney Nature Kit | `29F02DF0589DD2B09E8D2AFF6A4662394DAC5CFCF1FEC701640DCBD6127E0802` | CC0 ([Pagina Kenney Nature Kit](https://kenney.nl/assets/nature-kit)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/KenneyNL/Starter-Kits/master/3D/Nature%20Kit/mushroom_redGroup.glb` | 14.6 KB | *Inutilizzato nel codice* (funghi gestiti in Collectibles) |
| **`plant_bushDetailed.glb`** | Kenney Nature Kit | `2E0487020D68CCF664435DB9D829C78AE00E6D2785EE3EC10B9F89CC70A10406` | CC0 ([Pagina Kenney Nature Kit](https://kenney.nl/assets/nature-kit)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/KenneyNL/Starter-Kits/master/3D/Nature%20Kit/plant_bushDetailed.glb` | 9.9 KB | *Inutilizzato nel codice* (sostituito da InstancedMesh) |
| **`Rig_Medium_General.glb`** | KayKit Animations | `5F725C0F745F36078C7238968CD5C04843CBC6260689EB6E7F5E2BBD7FFDD7AD` | CC0 ([Pagina KayKit Animations](https://kaylousberg.itch.io/kaykit-animations)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/KayLousberg/KayKit-Animations/main/Rig_Medium_General.glb` | 808.8 KB | Clip animazioni generali Pip e NPC (`Idle_A`, `Interact`) |
| **`Rig_Medium_MovementBasic.glb`** | KayKit Animations | `11422AFD50ABF7E8C92EA107E2E0BC94ABD38023D6D15F55AD580347EFBFA29E` | CC0 ([Pagina KayKit Animations](https://kaylousberg.itch.io/kaykit-animations)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/KayLousberg/KayKit-Animations/main/Rig_Medium_MovementBasic.glb` | 673.5 KB | Clip animazioni movimento Pip (`Running_A`, `Walking_A`) |
| **`rock_largeA.glb`** | Kenney Nature Kit | `6DD15390FD96501DCD1454765A17BA61DBBD8D47705DFE5149C8DD92B353CE25` | CC0 ([Pagina Kenney Nature Kit](https://kenney.nl/assets/nature-kit)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/KenneyNL/Starter-Kits/master/3D/Nature%20Kit/rock_largeA.glb` | 7.4 KB | *Inutilizzato nel codice* (rocce procedurali nel terreno) |
| **`Rogue_Hooded.glb`** | KayKit Adventurers | `E8F3233C6DB190506FBEF3AD855683E6CB8BD7350DE637D923E14A08AEF088DC` | CC0 ([Pagina KayKit Adventurers](https://kaylousberg.itch.io/kaykit-adventurers)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/KayLousberg/KayKit-Adventurers/main/Characters/gltf/Rogue_Hooded.glb` | 372.5 KB | Modello 3D di Pip (cappuccio verde, mantello, stivali) |
| **`sign.glb`** | Kenney Nature Kit | `C658C21672ECD63C5D3E53F06F875D68E6509EDB1AB7E3B75374DF7C61E7DD0C` | CC0 ([Pagina Kenney Nature Kit](https://kenney.nl/assets/nature-kit)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/KenneyNL/Starter-Kits/master/3D/Nature%20Kit/sign.glb` | 4.9 KB | Cartello indicatore in legno sul sentiero della collina |
| **`tree_detailed.glb`** | Kenney Nature Kit | `C041DAF2F0FB1D49E4325227CBCD58667ADBE51E9B55E8C1F0A94B74CC521B3B` | CC0 ([Pagina Kenney Nature Kit](https://kenney.nl/assets/nature-kit)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/KenneyNL/Starter-Kits/master/3D/Nature%20Kit/tree_detailed.glb` | 30.7 KB | Alberi dettagliati a chioma sfaccettata |
| **`tree_oak.glb`** | Kenney Nature Kit | `D7FD8773674928C50C11B66D12C636D49BDCC15A8B1C7FBB98E6F63A3439A3F3` | CC0 ([Pagina Kenney Nature Kit](https://kenney.nl/assets/nature-kit)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/KenneyNL/Starter-Kits/master/3D/Nature%20Kit/tree_oak.glb` | 14.3 KB | Alberi di quercia cartoon a fusto modellato |
| **`Textures/colormap.png`** | Kenney Texture Atlas | `451E1D7A53B8E76F4B2EE58742E241509FEE5F82CF2CEE6E3F7ACA86BA718ABE` | CC0 ([Pagina Kenney Texture Atlas](https://kenney.nl)) - [Licenza CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `https://raw.githubusercontent.com/KenneyNL/Starter-Kits/master/Textures/colormap.png` | 9.8 KB | Texture palette unificata per tutti i modelli Kenney |

---

## 2.2 File Non Usati dal Codice e Proposta di Eliminazione

L'ispezione statica dell'intero albero sorgente (`src/`) evidenzia che i seguenti **6 file `.glb`** presenti in `public/models/` non sono importati né referenziati in alcun punto del gioco:

1. **`character.glb`** (85.6 KB) - Modello umanoide Kenney di test, soppiantato dal modello dedicato `Rogue_Hooded.glb`.
2. **`boat-sail-a.glb`** (34.4 KB) - Barca a vela Kenney di test, soppiantata da `BoatWSail.glb` (Quaternius).
3. **`plant_bushDetailed.glb`** (9.9 KB) - Cespuglio singolo Kenney, soppiantato dalle istanze ottimizzate `InstancedMesh` di `Island.ts`.
4. **`flower_purpleA.glb`** (6.9 KB) - Fiore singolo Kenney, soppiantato dalle istanze ottimizzate `InstancedMesh` di `Island.ts`.
5. **`mushroom_redGroup.glb`** (14.6 KB) - Funghi Kenney, attualmente gestiti proceduralmente dal manager collezionabili (`Collectibles.ts`).
6. **`rock_largeA.glb`** (7.4 KB) - Roccia singola Kenney, non istanziata (l'isola adotta rocce toon procedurali con collider BVH).

### Proposta di Rimozione
- **Peso totale risparmiabile**: **158.8 KB** (pari a ~4% del peso totale di `dist/`).
- **Azione proposta**: L'eliminazione fisica di questi 6 file da `public/models/` ridurrà il bundle senza alcuna regressione logica o grafica. In ossequio alla regola 8 di `GEMINI.md` ("Non cancellare né riscrivere grandi parti di codice senza chiedere conferma"), la rimozione verrà eseguita solo previa conferma esplicita dell'utente.

---

## 3. Asset Procedurali e Sintesi

| Nome Asset | Tipo | Fonte / Autore | Licenza | Note |
| :--- | :--- | :--- | :--- | :--- |
| **Solid Island Terrain Mesh** | Geometria 3D | Procedurale via codice (Three.js) | Licenza del progetto | Plateau collinare con scarpata verticale a -5m e fondale marino |
| **Procedural Audio Engine** | Sintesi Audio | Web Audio API nativo | Licenza del progetto | Onde, brezza marina, passi, salto, fanfare e lanterna |
| **Volumetric Cel-Shading Gradient** | Texture 1D | DataTexture generata a codice | Licenza del progetto | Mappa a gradini discreti per ombreggiature cartoon |
