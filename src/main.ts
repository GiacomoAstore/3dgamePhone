/**
 * Punto di ingresso principale (Entry point) di Brumavento.
 * Gestisce l'avvio del gioco, schermata iniziale, ripristino salvataggi,
 * registrazione del Service Worker PWA e sblocco audio policy.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.5.0
 */

import { Game } from './core/Game';
import { ConfirmModalUI } from './ui/ConfirmModalUI';

function initGame(): void {
  const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas WebGL non trovato nella pagina.');
    return;
  }

  const startScreen = document.getElementById('start-screen');
  const btnContinue = document.getElementById('btn-continue');
  const btnStart = document.getElementById('btn-start');
  const btnStartOptions = document.getElementById('btn-start-options');
  const btnStartCredits = document.getElementById('btn-start-credits');

  const game = new Game(canvas);
  (window as unknown as { game: Game }).game = game;

  // Se esiste un salvataggio valido, mostra il pulsante "Continua"
  if (game.saveSystem.hasSave() && btnContinue) {
    btnContinue.classList.remove('hidden');
  }

  const hideStartScreen = () => {
    if (startScreen) {
      startScreen.style.opacity = '0';
      setTimeout(() => {
        startScreen.style.display = 'none';
      }, 300);
    }
  };

  // 1. Continua partita salvata
  const onContinueClick = () => {
    game.audioSystem.unlockAudio();
    const loaded = game.loadSavedGame();
    if (loaded) {
      hideStartScreen();
      game.start();
    }
  };

  btnContinue?.addEventListener('click', onContinueClick);
  btnContinue?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    onContinueClick();
  });

  // 2. Nuova partita
  const onStartClick = () => {
    game.audioSystem.unlockAudio();

    if (game.saveSystem.hasSave()) {
      ConfirmModalUI.getInstance().show({
        title: 'Nuova Partita',
        message: 'Esiste già una partita salvata. Iniziando una nuova avventura, i progressi attuali verranno sovrascritti. Desideri continuare?',
        confirmLabel: 'Inizia Nuova Partita',
        cancelLabel: 'Annulla',
        isDanger: true,
        onConfirm: () => {
          hideStartScreen();
          game.startNewGame();
        },
      });
    } else {
      hideStartScreen();
      game.startNewGame();
    }
  };

  btnStart?.addEventListener('click', onStartClick);
  btnStart?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    onStartClick();
  });

  // 3. Opzioni dalla schermata iniziale
  btnStartOptions?.addEventListener('click', () => {
    game.qualitySettingsUI.open();
  });
  btnStartOptions?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    game.qualitySettingsUI.open();
  });

  // 4. Crediti dalla schermata iniziale
  btnStartCredits?.addEventListener('click', () => {
    game.creditsUI.open();
  });
  btnStartCredits?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    game.creditsUI.open();
  });

  // 5. Registrazione Service Worker per Progressive Web App (PWA) offline
  if ('serviceWorker' in navigator && !window.location.search.includes('disable_sw=1')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.info('[PWA] Service Worker registrato con successo. Scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Registrazione Service Worker non riuscita:', err);
        });
    });
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
