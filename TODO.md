# Roadmap & Backlog (TODO)

<!--
Ultima modifica: 2026-11-10 - v0.1.0 - Completamento Fasi 0 e 1, pianificazione Fase 2
-->

## 🏁 Fasi Completate

### ✅ Fase 0: Fondamenta e Tooling
- [x] Definizione regole per l'IA (`GEMINI.md`, `AGENTS.md`) e Game Design (`DOCS_DESIGN.md`).
- [x] Setup progetto con Vite 6.4.6, TypeScript 5.7.3 e Three.js 0.180.0 con versioni rigorosamente fissate.
- [x] Configurazione ESLint con `@typescript-eslint/parser` e Prettier per la qualità del codice.
- [x] Suite di test automatizzati con Vitest (`npm test`).
- [x] Inizializzazione repository Git e censimento asset in `ASSETS.md`.

### ✅ Fase 1: Il Personaggio e il Mondo Minimo
- [x] Isola di partenza procedurale (Isola della Bussola) con rilievi collinari, vegetazione cartoon, rocce litoranee e pontile.
- [x] Ambiente di gioco: sole toon con ombre soft, luce emisferica calda, nebbia di Three.js e mare animato.
- [x] Modello 3D procedurale di Pip con materiali toon, cappello da cartografo, stivaletti e lanterna magica.
- [x] Controller di movimento con camminata (5.2 m/s), salto (7.8 m/s), gravità controllata (22.0 m/s²) e animazioni procedurali (respiro, corsa, salto).
- [x] Telecamera in terza persona con smooth damping orbitale e prevenzione compenetrazione suolo.
- [x] Rilevamento collisioni e terreno accelerato con `three-mesh-bvh`.
- [x] Controlli responsive per smartphone: joystick virtuale a sinistra, pulsanti touch a destra e drag camera.
- [x] Budget prestazioni mobile: clamping `devicePixelRatio <= 2.0`, contatore FPS in tempo reale nell'HUD e predisposizione profili di qualità.
- [x] Test unitari su matematica vettoriale, fisica del giocatore e collisioni col terreno.

---

## 🎯 Prossimi Obiettivi: Fase 2 (Interazione e Prima Missione)
- [ ] **Lanterna Magica**: raggio d'azione per dissolvere la nebbia circostante e rivelare elementi invisibili.
- [ ] **Collezionabili**: stelle marine, conchiglie e funghi luminosi raccoglibili con conteggio HUD.
- [ ] **Primo NPC (Nonna Bussola)**: modello 3D procedurale nell'osservatorio e sistema di dialoghi a fumetto/scheda.
- [ ] **Primo Frammento dell'Atlante Vivo**: enigma ambientale semplice e recupero del frammento con ritirata della nebbia.
- [ ] **Diario del Cartografo**: schermata HUD (tasto icona o `Tab`/`Esc`) con elenco missioni e mappa parziale.

---

## 🐛 Bug Noti
*(Nessun bug attivo).*

---

## 💳 Debito Tecnico
- La nebbia attuale utilizza `THREE.FogExp2` semplice; nella Fase 3 potrà essere integrato uno shader per dissolvenza volumetrica o sferica localizzata attorno alla lanterna di Pip.
