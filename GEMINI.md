# Regole per l'IA: sviluppo del gioco

Documento di riferimento da fornire all'IA all'inizio di ogni sessione di lavoro. Le regole sono vincolanti: in caso di dubbio, l'IA chiede chiarimenti prima di procedere.

---

## 1. Scopo e principi generali
L'IA collabora alla creazione di un videogioco producendo codice leggibile, manutenibile, testabile e documentato. Ogni modifica deve essere tracciata.

### Principi guida:
- **Chiarezza prima dell'astuzia**: il codice si scrive per essere letto da altre persone (e dall'IA stessa nelle sessioni future).
- **Niente modifiche silenziose**: ogni cambiamento, anche minimo, viene dichiarato e registrato.
- **Piccoli passi**: meglio molte modifiche piccole e verificabili che una grande e opaca.
- **Non rompere ciò che funziona**: prima di modificare, capire il codice esistente.
- **Mai inventare**: se mancano informazioni (linguaggio, motore, convenzioni), l'IA chiede invece di assumere.

---

## 2. Contesto del progetto (da compilare)
L'utente compila questa sezione una volta; l'IA la considera sempre valida.
- **Nome del gioco**: *(da definire)*
- **Genere e descrizione breve**: *(da definire)*
- **Linguaggio / motore (es. Python+Pygame, Unity C#, Godot GDScript, JavaScript/Three.js, WebGL)**: *(da definire)*
- **Piattaforme target**: *(es. Mobile / Phone, Web, Desktop)*
- **Versione corrente**: 0.1.0
- **Convenzioni già esistenti (se presenti)**: *(da definire)*

---

## 3. Regole di buona programmazione

### 3.1 Struttura e design
- Applicare il principio di responsabilità singola: ogni classe, modulo e funzione fa una cosa sola.
- Separare chiaramente logica di gioco, rendering/grafica, input, audio, dati/configurazione e interfaccia utente.
- Preferire la composizione all'ereditarietà (es. sistema a componenti per entità di gioco).
- Evitare dipendenze circolari e accoppiamento forte; usare interfacce, eventi o messaggi per far comunicare i sistemi.
- Usare un game loop esplicito con separazione tra update (logica) e draw/render (grafica), gestendo il tempo con delta time così che il gioco non dipenda dalla velocità del computer.
- Gestire gli stati del gioco (menu, gioco, pausa, game over) con una macchina a stati chiara.

### 3.2 Stile e leggibilità
- Nomi descrittivi e coerenti per variabili, funzioni e classi (es. `playerHealth`, non `ph`). Lingua dei nomi: inglese, salvo diversa indicazione.
- Seguire le convenzioni standard del linguaggio scelto (PEP 8 per Python, convenzioni C# per Unity, standard JS/TS, ecc.).
- Funzioni brevi (indicativamente sotto le 40 righe) e con pochi parametri.
- Nessun numero magico: valori come velocità, danni, dimensioni vanno in costanti con nome o in file di configurazione.
- Nessuna duplicazione di codice (DRY): se una logica si ripete, va estratta.
- Non lasciare codice morto, codice commentato o TODO senza motivazione; se un TODO è necessario, deve indicare cosa e perché.
- Non fare ottimizzazioni premature: prima correttezza e chiarezza, poi prestazioni dove serve (con misurazioni).

### 3.3 Gestione di dati e configurazione
- Parametri di bilanciamento (velocità, vita, costi, difficoltà) fuori dal codice, in file di configurazione (JSON, YAML, ScriptableObject, ecc.).
- Percorsi di risorse (immagini, suoni, livelli) centralizzati in un unico punto.
- Salvataggi con formato versionato, in modo da poter leggere vecchi salvataggi dopo un aggiornamento.

### 3.4 Gestione degli errori
- Non ignorare mai gli errori in silenzio: gestirli o segnalarli con messaggi chiari.
- Validare gli input (file mancanti, valori fuori range, dati corrotti).
- Usare un sistema di log con livelli (debug, info, warning, error) invece di stampe sparse.
- Il gioco deve degradare in modo controllato (es. risorsa mancante → placeholder + log), non andare in crash senza spiegazione.

### 3.5 Prestazioni e risorse
- Evitare allocazioni inutili nel ciclo di gioco; riutilizzare oggetti con object pooling per elementi frequenti (proiettili, particelle).
- Caricare le risorse una sola volta e liberarle quando non servono.
- Segnalare in documentazione ogni punto potenzialmente costoso.

### 3.6 Sicurezza e robustezza
- Non inserire credenziali, chiavi o dati personali nel codice.
- Trattare come non affidabili i dati letti da file di salvataggio o dalla rete.

---

## 4. Regole di documentazione
La documentazione è obbligatoria e va aggiornata nella stessa modifica che cambia il codice. Codice senza documentazione aggiornata è considerato incompleto.

### 4.1 Nel codice
- Ogni file inizia con un commento di intestazione: scopo del file, autore/ultima modifica, dipendenze principali.
- Ogni classe, funzione e metodo pubblico ha un commento di documentazione (docstring / XML doc / JSDoc) con: cosa fa, parametri, valore restituito, eccezioni e un esempio se non banale.
- I commenti spiegano il perché, non il cosa ovvio. Le scelte non evidenti (workaround, compromessi, formule) vanno sempre motivate.

### 4.2 Documenti del progetto
L'IA mantiene sempre aggiornati questi file nella radice del progetto:
- `README.md`: descrizione del gioco, requisiti, installazione, come avviarlo, comandi di gioco.
- `ARCHITETTURA.md`: struttura delle cartelle, moduli principali, come interagiscono, diagramma testuale del flusso del gioco.
- `CHANGELOG.md`: registro cronologico di tutte le modifiche (vedi sezione 5).
- `DECISIONI.md`: registro delle decisioni progettuali importanti (cosa è stato scelto, alternative considerate, motivo).
- `TODO.md` (o `ROADMAP.md`): funzionalità pianificate, bug noti, debito tecnico.

---

## 5. Tracciamento di tutte le modifiche
Ogni modifica, senza eccezioni, deve lasciare una traccia. Nessuna modifica è "troppo piccola" per essere registrata.

### 5.1 Versionamento
- Usare il Versionamento Semantico: `MAGGIORE.MINORE.PATCH`.
  - `MAGGIORE`: cambiamenti incompatibili (es. formato di salvataggio nuovo non retrocompatibile).
  - `MINORE`: nuove funzionalità compatibili.
  - `PATCH`: correzioni di bug e piccoli aggiustamenti.
- La versione corrente è riportata in un unico punto del progetto (es. file `VERSION` o costante) e nel `CHANGELOG.md`.

### 5.2 Formato del CHANGELOG
Ogni voce segue questo schema, con la più recente in alto:
```markdown
## [versione] - AAAA-MM-GG

### Aggiunto
- Nuove funzionalità.

### Modificato
- Cambiamenti a funzionalità esistenti.

### Corretto
- Bug risolti (descrivere sintomo e causa).

### Rimosso
- Funzionalità o codice eliminati.

### File toccati
- percorso/del/file.ext: cosa è cambiato in breve.

### Motivo
- Perché la modifica è stata fatta (richiesta dell'utente, bug, refactoring).
```

### 5.3 Commit (se si usa Git)
- Un commit per modifica logica, mai commit enormi e misti.
- Messaggi nel formato: `tipo: descrizione breve` con tipi `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.
- Esempio: `fix: corregge la collisione del giocatore con le pareti`.

### 5.4 Intestazione dei file modificati
Quando un file viene modificato, aggiornare nell'intestazione la data e la versione dell'ultima modifica, con una riga di riepilogo.

---

## 6. Procedura da seguire ad ogni richiesta
Per ogni richiesta dell'utente l'IA segue sempre questi passi, in ordine:
1. **Capire**: riformulare brevemente la richiesta; se è ambigua, fare domande prima di scrivere codice.
2. **Analizzare** il codice e la documentazione esistenti, per non duplicare né rompere nulla.
3. **Pianificare**: elencare in breve cosa verrà modificato e quali file saranno toccati.
4. **Implementare** in piccoli passi, rispettando le regole delle sezioni 3 e 4.
5. **Verificare**: controllare che il codice funzioni, scrivere o aggiornare i test, rileggere la modifica.
6. **Documentare**: aggiornare commenti, README, ARCHITETTURA, DECISIONI se coinvolti.
7. **Registrare**: aggiungere la voce nel CHANGELOG e aggiornare la versione.
8. **Riepilogare all'utente**: cosa è stato fatto, file toccati, come provarlo, eventuali limiti o rischi.

---

## 7. Test e qualità
- Scrivere test automatici per la logica non banale (calcolo danni, punteggi, collisioni, salvataggi, stati di gioco).
- Ogni bug corretto deve avere, se possibile, un test che ne impedisca il ritorno (test di regressione).
- Prima di consegnare, l'IA verifica mentalmente o con test: avvio del gioco, casi limite (valori nulli, zero, massimi), input inattesi.
- Se l'IA non può eseguire il codice, lo dichiara esplicitamente e indica cosa l'utente deve controllare.

---

## 8. Regole di comunicazione dell'IA
- Rispondere in italiano, in modo chiaro e conciso.
- Mostrare solo i file o le parti modificate quando il progetto è grande, indicando con precisione dove inserirle; fornire il file completo se l'utente lo chiede o se le modifiche sono estese.
- Dichiarare sempre assunzioni, limiti e rischi della soluzione proposta.
- Segnalare problemi che nota nel codice esistente (bug, cattive pratiche) senza correggerli di nascosto: proporre la correzione e registrarla se approvata.
- Non cancellare né riscrivere grandi parti di codice senza chiedere conferma.
- Non introdurre nuove librerie o dipendenze senza spiegarne il motivo e chiedere approvazione.

---

## 9. Divieti assoluti
- Modificare codice senza registrare la modifica nel CHANGELOG.
- Consegnare codice senza commenti o documentazione.
- Rimuovere funzionalità esistenti senza richiesta esplicita.
- Lasciare codice che non è stato verificato dicendo che "dovrebbe funzionare" senza segnalarlo.
- Usare scorciatoie che peggiorano la manutenibilità senza dichiararlo in DECISIONI.md come debito tecnico.
- Copiare codice o risorse protette da copyright senza indicarne la fonte e la licenza.

---

## 10. Checklist finale prima di ogni consegna
- [ ] Il codice rispetta le regole di stile e struttura (sezione 3)
- [ ] Non ci sono numeri magici, duplicazioni o codice morto
- [ ] Funzioni e classi sono documentate
- [ ] Gli errori sono gestiti e loggati
- [ ] I test sono scritti o aggiornati
- [ ] README, ARCHITETTURA e DECISIONI sono aggiornati se necessario
- [ ] Il CHANGELOG contiene la nuova voce con data, file toccati e motivo
- [ ] La versione è stata aggiornata
- [ ] Il riepilogo per l'utente è chiaro e indica come provare la modifica

