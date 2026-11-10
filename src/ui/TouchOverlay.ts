/**
 * Gestione interfaccia touch e joystick virtuale per smartphone.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.1.0
 */

export interface TouchInputState {
  joystickVector: { x: number; y: number };
  cameraDelta: { x: number; y: number };
  jumpPressed: boolean;
  actionPressed: boolean;
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
  private joystickCenter = { x: 0, y: 0 };
  private maxJoystickRadius = 45; // Pixel massimi di escursione
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
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
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
            this.state.cameraDelta.x += dx * 0.005;
            this.state.cameraDelta.y += dy * 0.005;
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
        const isButton = target.closest('#action-zone') !== null;
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
        this.state.jumpPressed = true;
        this.btnJump.classList.add('active');
      },
      { passive: false }
    );

    this.btnJump.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.state.jumpPressed = false;
      this.btnJump.classList.remove('active');
    });

    // Pulsante Azione / Lanterna
    this.btnAction.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        this.state.actionPressed = true;
        this.btnAction.classList.add('active');
      },
      { passive: false }
    );

    this.btnAction.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.state.actionPressed = false;
      this.btnAction.classList.remove('active');
    });
  }

  private updateJoystick(clientX: number, clientY: number): void {
    const dx = clientX - this.joystickCenter.x;
    const dy = clientY - this.joystickCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const clampedDist = Math.min(distance, this.maxJoystickRadius);
    const thumbX = Math.cos(angle) * clampedDist;
    const thumbY = Math.sin(angle) * clampedDist;

    this.joystickThumb.style.transform = `translate(${thumbX}px, ${thumbY}px)`;

    // Vettore normalizzato (-1 a 1)
    this.state.joystickVector = {
      x: thumbX / this.maxJoystickRadius,
      y: thumbY / this.maxJoystickRadius,
    };
  }

  /**
   * Resetta completamente il joystick virtuale e i pointer touch.
   * Chiamato alla sospensione dei comandi (dialogo o diario aperto) per evitare joystick bloccati.
   */
  public resetInputs(): void {
    this.joystickTouchId = null;
    this.cameraTouchId = null;
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
