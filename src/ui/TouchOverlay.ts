/**
 * Gestione interfaccia touch e joystick virtuale per smartphone.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.1
 */

import { controlsConfig } from '../data/controlsConfig';

export interface TouchInputState {
  joystickVector: { x: number; y: number };
  cameraDelta: { x: number; y: number };
  jumpPressed: boolean;
  actionPressed: boolean;
}

export interface TouchPointDebug {
  identifier: number;
  clientX: number;
  clientY: number;
  role: 'joystick' | 'camera' | 'jump' | 'action' | 'other';
}

export class TouchOverlay {
  private container: HTMLElement;
  private joystickZone: HTMLElement;
  private joystickThumb: HTMLElement;
  private btnJump: HTMLElement;
  private btnAction: HTMLElement;

  private state: TouchInputState = {
    joystickVector: { x: 0, y: 0 },
    cameraDelta: { x: 0, y: 0 },
    jumpPressed: false,
    actionPressed: false,
  };

  private joystickTouchId: number | null = null;
  private cameraTouchId: number | null = null;
  private jumpTouchId: number | null = null;
  private actionTouchId: number | null = null;

  private joystickCenter = { x: 0, y: 0 };
  private lastCameraTouch = { x: 0, y: 0 };

  constructor() {
    this.container = document.getElementById('touch-controls') as HTMLElement;
    this.joystickZone = document.getElementById('joystick-zone') as HTMLElement;
    this.joystickThumb = document.getElementById('joystick-thumb') as HTMLElement;
    this.btnJump = document.getElementById('btn-touch-jump') as HTMLElement;
    this.btnAction = document.getElementById('btn-touch-action') as HTMLElement;

    this.checkVisibility();
    this.initEvents();
  }

  /**
   * Mostra i comandi touch se il dispositivo supporta il tocco o la finestra è ridotta.
   */
  private checkVisibility(): void {
    const isTouch = 'ontouchstart' in window || (navigator && navigator.maxTouchPoints > 0);
    const isMobileWidth = window.innerWidth <= 840;
    if (isTouch || isMobileWidth) {
      this.container.classList.remove('hidden');
    }
  }

  private initEvents(): void {
    // Joystick touch handling
    this.joystickZone.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        e.preventDefault();
        if (this.joystickTouchId !== null) return;
        const touch = e.changedTouches[0];
        this.joystickTouchId = touch.identifier;
        const rect = this.joystickZone.getBoundingClientRect();
        this.joystickCenter = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
        this.updateJoystick(touch.clientX, touch.clientY);
      },
      { passive: false }
    );

    window.addEventListener(
      'touchmove',
      (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === this.joystickTouchId) {
            this.updateJoystick(touch.clientX, touch.clientY);
          } else if (touch.identifier === this.cameraTouchId) {
            const dx = touch.clientX - this.lastCameraTouch.x;
            const dy = touch.clientY - this.lastCameraTouch.y;
            this.state.cameraDelta.x += dx * controlsConfig.cameraTouchSensitivity;
            this.state.cameraDelta.y += dy * controlsConfig.cameraTouchSensitivity;
            this.lastCameraTouch = { x: touch.clientX, y: touch.clientY };
          }
        }
      },
      { passive: false }
    );

    const handleTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.joystickTouchId) {
          this.joystickTouchId = null;
          this.state.joystickVector = { x: 0, y: 0 };
          this.joystickThumb.style.transform = 'translate(0px, 0px)';
        } else if (touch.identifier === this.cameraTouchId) {
          this.cameraTouchId = null;
        } else if (touch.identifier === this.jumpTouchId) {
          this.jumpTouchId = null;
          this.state.jumpPressed = false;
          this.btnJump.classList.remove('active');
        } else if (touch.identifier === this.actionTouchId) {
          this.actionTouchId = null;
          this.state.actionPressed = false;
          this.btnAction.classList.remove('active');
        }
      }
    };

    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    // Touch camera swipe su metà destra dello schermo (escludendo i bottoni di azione)
    window.addEventListener('touchstart', (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        // Se tocco sulla metà destra e non dentro l'action zone
        const isRightHalf = touch.clientX > window.innerWidth * 0.45;
        const target = touch.target as HTMLElement;
        const isButton = target && target.closest && target.closest('#action-zone') !== null;
        if (isRightHalf && !isButton && this.cameraTouchId === null) {
          this.cameraTouchId = touch.identifier;
          this.lastCameraTouch = { x: touch.clientX, y: touch.clientY };
        }
      }
    });

    // Pulsante Salto
    this.btnJump.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        if (touch) this.jumpTouchId = touch.identifier;
        this.state.jumpPressed = true;
        this.btnJump.classList.add('active');
      },
      { passive: false }
    );

    this.btnJump.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.jumpTouchId = null;
      this.state.jumpPressed = false;
      this.btnJump.classList.remove('active');
    });

    // Pulsante Azione / Lanterna
    this.btnAction.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        if (touch) this.actionTouchId = touch.identifier;
        this.state.actionPressed = true;
        this.btnAction.classList.add('active');
      },
      { passive: false }
    );

    this.btnAction.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.actionTouchId = null;
      this.state.actionPressed = false;
      this.btnAction.classList.remove('active');
    });
  }

  private updateJoystick(clientX: number, clientY: number): void {
    const dx = clientX - this.joystickCenter.x;
    const dy = clientY - this.joystickCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Zona morta per prevenire derive microscopiche
    if (distance < controlsConfig.joystickDeadzone) {
      this.joystickThumb.style.transform = 'translate(0px, 0px)';
      this.state.joystickVector = { x: 0, y: 0 };
      return;
    }

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(distance, controlsConfig.joystickRadius);
    const thumbX = Math.cos(angle) * clampedDist;
    const thumbY = Math.sin(angle) * clampedDist;

    this.joystickThumb.style.transform = `translate(${thumbX}px, ${thumbY}px)`;

    // Vettore normalizzato (-1 a 1) scalato dal raggio effettivo
    const effectiveSpan = controlsConfig.joystickRadius - controlsConfig.joystickDeadzone;
    const normalizedMag = (clampedDist - controlsConfig.joystickDeadzone) / effectiveSpan;

    this.state.joystickVector = {
      x: Math.cos(angle) * normalizedMag,
      y: Math.sin(angle) * normalizedMag,
    };
  }

  /**
   * Restituisce i touch identifiers attivi tracciati dai comandi di gioco
   * (usato da DebugOverlay per evitare discrepanze tra debug e controlli reali).
   */
  public getActiveTouchesDebug(): TouchPointDebug[] {
    const result: TouchPointDebug[] = [];
    if (this.joystickTouchId !== null) {
      result.push({
        identifier: this.joystickTouchId,
        clientX: this.joystickCenter.x + this.state.joystickVector.x * controlsConfig.joystickRadius,
        clientY: this.joystickCenter.y + this.state.joystickVector.y * controlsConfig.joystickRadius,
        role: 'joystick',
      });
    }
    if (this.cameraTouchId !== null) {
      result.push({
        identifier: this.cameraTouchId,
        clientX: this.lastCameraTouch.x,
        clientY: this.lastCameraTouch.y,
        role: 'camera',
      });
    }
    if (this.jumpTouchId !== null) {
      result.push({
        identifier: this.jumpTouchId,
        clientX: 0,
        clientY: 0,
        role: 'jump',
      });
    }
    if (this.actionTouchId !== null) {
      result.push({
        identifier: this.actionTouchId,
        clientX: 0,
        clientY: 0,
        role: 'action',
      });
    }
    return result;
  }

  /**
   * Resetta completamente il joystick virtuale e i pointer touch.
   * Chiamato alla sospensione dei comandi (dialogo o diario aperto) per evitare joystick bloccati.
   */
  public resetInputs(): void {
    this.joystickTouchId = null;
    this.cameraTouchId = null;
    this.jumpTouchId = null;
    this.actionTouchId = null;
    this.state.joystickVector = { x: 0, y: 0 };
    this.state.cameraDelta = { x: 0, y: 0 };
    this.state.jumpPressed = false;
    this.state.actionPressed = false;
    this.joystickThumb.style.transform = 'translate(0px, 0px)';
    this.btnJump.classList.remove('active');
    this.btnAction.classList.remove('active');
  }

  /**
   * Consuma il delta della camera touch.
   */
  public consumeCameraDelta(): { x: number; y: number } {
    const delta = { ...this.state.cameraDelta };
    this.state.cameraDelta.x = 0;
    this.state.cameraDelta.y = 0;
    return delta;
  }

  public getState(): TouchInputState {
    return this.state;
  }
}
