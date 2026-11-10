# Checklist di Verifica Manuale - Brumavento

Documento di riferimento per i test funzionali ed esperienziali su dispositivi fisici (smartphone touch e desktop).
Questa checklist copre gli aspetti non automatizzabili nei test headless (touch reale, WebGL mobile, audio hardware, rendering toon).

**Versione corrente:** 0.3.1  
**Data revisione:** 2026-11-10  

---

## Tabella delle Verifiche Manuali

| ID | Ambito | Procedura di Test | Criterio di Accettazione | Esito (Pass/Fail) | Dispositivo / Browser | Note & Osservazioni |
|:---|:---|:---|:---|:---:|:---|:---|
| **MAN-01** | **Connessione Wi-Fi Mobile** | Avviare `npm run preview -- --host 0.0.0.0 --port 5173` su PC. Aprire l'indirizzo IP del PC (es. `http://192.168.1.X:5173`) da smartphone connesso allo stesso Wi-Fi. | La pagina iniziale di Brumavento si carica entro 3 secondi senza schermate nere o errori di connessione. | [ ] | Smartphone Android / iOS | In caso di blocco, verificare firewall Windows e disattivare isolamento AP sul router. |
| **MAN-02** | **Multi-Touch Simultaneo** | Con il pollice sinistro muovere il joystick virtuale; contemporaneamente, con il pollice destro, ruotare la visuale o toccare il pulsante salto (⤴). | Il movimento di Pip non si interrompe mentre si ruota la telecamera o si salta. Zero interferenze tra tocchi. | [ ] | Touchscreen | Verificabile con `?debug=1` per visualizzare i touch identifier tracciati da `TouchOverlay`. |
| **MAN-03** | **Sblocco Audio al 1° Tocco** | Caricare la pagina (inizialmente silenziosa per autoplay policy). Toccare "Inizia Esplorazione" o lo schermo. | Il motore audio Web Audio si attiva istantaneamente: si ode la brezza marina e le onde in sottofondo. | [ ] | Mobile / Desktop | Nessun errore audio in console; volume regolabile dal menu impostazioni (⚙️). |
| **MAN-04** | **Ciclo di Vita Audio (Background)** | Con il gioco avviato e audio attivo, cambiare scheda nel browser o minimizzare l'app per 10 secondi, poi riaprirla. | L'AudioContext non resta muto o bloccato: al ritorno in primo piano l'audio riprende regolarmente. | [ ] | Safari iOS / Chrome Android | Gestito da `visibilitychange` in `AudioSystem.ts`. |
| **MAN-05** | **Contorno Toon Pip (Silhouette)** | Osservare Pip su sfondo erboso e sabbioso durante il giorno e durante la notte. | Il corpo e la testa hanno un sottile contorno scuro Inverted Hull (`#162238`) che stacca la figura dal suolo. | [ ] | Schermo IPS / OLED | Contrasto misurato: >= 3.5:1 verso l'erba e >= 4.5:1 verso il cappotto. |
| **MAN-06** | **Disattivazione Outline (Profilo Bassa)** | Aprire Impostazioni (⚙️) e selezionare "Bassa". Osservare Pip. Poi rimettere "Media" o "Alta". | Su "Bassa" il contorno scompare (riduzione draw calls per GPU modeste). Su "Media/Alta" il contorno riappare. | [ ] | Dispositivo di test | Confermato dal test `tests/debug_and_benchmark.test.ts`. |
| **MAN-07** | **Contrasto e Leggibilità Notturna** | Nelle Impostazioni attivare "Notti Chiare" o attendere la fase notturna. | Il terreno dell'isola, la sagoma dei monoliti e la posizione di Pip rimangono chiaramente distinguibili anche sotto luce riflessa. | [ ] | Smartphone all'aperto / in stanza illuminata | Intensità ambientale minima garantita a 0.65. |
| **MAN-08** | **Auto-Degrade con Annulla** | Forzare lag o simulare FPS < 26 per oltre 5 secondi su profilo Alta. | Compare il toast "⚡ Qualità grafica ridotta a MEDIA". Cliccando "Annulla", il profilo torna ad ALTA con 60s di cooldown. | [ ] | Dispositivo con thermal throttling o FPS limitati | L'auto-degrade non si attiva nei primi 5s né con scheda in background. |
| **MAN-09** | **Benchmark Ripetibile (30s)** | Aprire l'URL con `?benchmark=1` (es. `http://localhost:5173/?benchmark=1`). Non toccare lo schermo per 30 secondi. | La camera segue un'orbita deterministica attorno all'isola; al termine compare il report con FPS medio, min, 1% low, draw calls e triangoli. | [ ] | Dispositivo di riferimento | Permette confronti oggettivi tra diverse build e profili. |
| **MAN-10** | **Copia Report & Fallback HTTP** | Nel pannello di debug/benchmark cliccare "Copia Report" su connessione HTTP non protetta (`http://192.168.x.x`). | Se gli appunti di sistema sono inaccessibili, si apre il modal con `<textarea>` selezionabile e pulsante "Seleziona Tutto". | [ ] | Browser mobile su rete locale | Nessun blocco silencioso o perdita del testo del report. |

---

## Note per il Tester
- Quando si compila la tabella, indicare il modello esatto del dispositivo (es. *Google Pixel 7*, *iPhone 13*, *Samsung Galaxy A53*) e il browser utilizzato.
- Per inviare i risultati del benchmark, incollare il report generato da `?benchmark=1` direttamente nella discussione o annotarlo in `CHANGELOG.md`.
