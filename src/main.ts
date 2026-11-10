/**
 * Punto di ingresso principale (Entry point) di Brumavento.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.1.0
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

  const startGame = () => {
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
