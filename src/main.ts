/**
 * Punto di ingresso principale (Entry point) di Brumavento.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.0
 */

import { Game } from './core/Game';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas WebGL non trovato nella pagina.');
    return;
  }

  const startScreen = document.getElementById('start-screen');
  const btnStart = document.getElementById('btn-start');

  const game = new Game(canvas);
  (window as unknown as { game: Game }).game = game;

  const startGame = () => {
    // Sblocca Web Audio API al primo gesto utente (Mobile Autoplay policy)
    game.audioSystem.unlockAudio();

    if (startScreen) {
      startScreen.style.opacity = '0';
      setTimeout(() => {
        startScreen.style.display = 'none';
      }, 300);
    }
    game.start();
  };

  btnStart?.addEventListener('click', startGame);
  btnStart?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startGame();
  });
});
