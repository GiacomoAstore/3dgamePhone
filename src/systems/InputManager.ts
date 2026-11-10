/**
 * Gestore unificato degli input (Desktop Tastiera/Mouse + Mobile Touch).
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.1.0
 */

import { TouchOverlay } from '../ui/TouchOverlay';

export interface MovementInput {
  x: number; // -1 (sinistra) a 1 (destra)
  z: number; // -1 (avanti) a 1 (indietro)
  length: number;
}

export class InputManager {
  private keysDown: Set<string> = new Set();
  private touchOverlay: TouchOverlay;
  private isBlocked = false;

  // Rotazione camera da mouse
  private mouseDelta = { x: 0, y: 0 };
  private isMouseDown = false;

  // Azioni istantanee
  private jumpRequested = false;
  private actionRequested = false;

  constructor(touchOverlay: TouchOverlay) {
    this.touchOverlay = touchOverlay;
    this.initKeyboardEvents();
    this.initMouseEvents();
  }

  /**
   * Sospende o riattiva gli input di movimento e camera (dialogo o diario aperto).
   * Resetta contestualmente tutti i puntatori touch e i tasti premuti.
   */
  public setBlocked(blocked: boolean): void {
    this.isBlocked = blocked;
    this.keysDown.clear();
    this.mouseDelta = { x: 0, y: 0 };
    this.jumpRequested = false;
    this.actionRequested = false;
    this.touchOverlay.resetInputs();
  }

  public getIsBlocked(): boolean {
    return this.isBlocked;
  }

  private initKeyboardEvents(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      this.keysDown.add(e.code);
      if (e.code === 'Space') {
        this.jumpRequested = true;
      }
      if (e.code === 'KeyE') {
        this.actionRequested = true;
      }
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      this.keysDown.delete(e.code);
    });
  }

  private initMouseEvents(): void {
    window.addEventListener('mousedown', (e: MouseEvent) => {
      // Tasto sinistro o destro per ruotare camera se non su elementi HUD
      if (e.target instanceof HTMLCanvasElement) {
        this.isMouseDown = true;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (this.isMouseDown) {
        this.mouseDelta.x += e.movementX * 0.003;
        this.mouseDelta.y += e.movementY * 0.003;
      }
    });
  }

  /**
   * Restituisce la direzione di movimento normalizzata combinando desktop e mobile.
   */
  public getMovement(): MovementInput {
    if (this.isBlocked) {
      return { x: 0, z: 0, length: 0 };
    }

    let x = 0;
    let z = 0;

    // Desktop: WASD / Frecce
    if (this.keysDown.has('KeyW') || this.keysDown.has('ArrowUp')) z -= 1;
    if (this.keysDown.has('KeyS') || this.keysDown.has('ArrowDown')) z += 1;
    if (this.keysDown.has('KeyA') || this.keysDown.has('ArrowLeft')) x -= 1;
    if (this.keysDown.has('KeyD') || this.keysDown.has('ArrowRight')) x += 1;

    // Mobile: Joystick Virtuale
    const touchState = this.touchOverlay.getState();
    if (
      Math.abs(touchState.joystickVector.x) > 0.05 ||
      Math.abs(touchState.joystickVector.y) > 0.05
    ) {
      x = touchState.joystickVector.x;
      z = touchState.joystickVector.y;
    }

    const len = Math.sqrt(x * x + z * z);
    if (len > 1.0) {
      x /= len;
      z /= len;
    }

    return {
      x,
      z,
      length: Math.min(len, 1.0),
    };
  }

  /**
   * Verifica se è stato richiesto il salto e resetta il flag.
   */
  public consumeJump(): boolean {
    if (this.isBlocked) {
      this.jumpRequested = false;
      return false;
    }
    const jump = this.jumpRequested || this.touchOverlay.getState().jumpPressed;
    this.jumpRequested = false;
    return jump;
  }

  /**
   * Verifica se è stato premuto il tasto azione/lanterna e resetta il flag.
   */
  public consumeAction(): boolean {
    if (this.isBlocked) {
      this.actionRequested = false;
      return false;
    }
    const action = this.actionRequested || this.touchOverlay.getState().actionPressed;
    this.actionRequested = false;
    return action;
  }

  /**
   * Consuma la rotazione camera accumulata (Mouse o Touch swipe).
   */
  public consumeCameraDelta(): { x: number; y: number } {
    const touchCameraDelta = this.touchOverlay.consumeCameraDelta();
    if (this.isBlocked) {
      this.mouseDelta = { x: 0, y: 0 };
      return { x: 0, y: 0 };
    }
    const totalDelta = {
      x: this.mouseDelta.x + touchCameraDelta.x,
      y: this.mouseDelta.y + touchCameraDelta.y,
    };
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    return totalDelta;
  }
}
