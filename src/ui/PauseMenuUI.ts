/**
 * Menu di Pausa in-game (PauseMenuUI).
 * Permette di sospendere il gioco, salvare manualmente lo stato,
 * accedere alle impostazioni grafiche/audio o tornare al menu principale.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.5.0
 */

export interface PauseMenuCallbacks {
  onResume: () => void;
  onSave: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onReturnToMainMenu: () => void;
}

export class PauseMenuUI {
  private container: HTMLElement;
  private card: HTMLElement;
  private isOpen = false;
  private callbacks: PauseMenuCallbacks;

  constructor(callbacks: PauseMenuCallbacks) {
    this.callbacks = callbacks;

    this.container = document.createElement('div');
    this.container.id = 'pause-modal';
    this.container.className = 'journal-overlay hidden';

    this.card = document.createElement('div');
    this.card.className = 'journal-card pause-card';

    this.buildHeader();
    this.buildOptions();
    this.container.appendChild(this.card);
    document.body.appendChild(this.container);

    // Chiudi cliccando fuori dalla card
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });

    // Ascolto tasto Escape / P per aprire/chiudere pausa da tastiera
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        // Se ci sono altri modali aperti (es. diario, crediti), non intercettare Escape
        const journal = document.getElementById('journal-modal');
        const settings = document.getElementById('settings-modal');
        const help = document.getElementById('help-modal');
        const credits = document.getElementById('credits-modal');
        const start = document.getElementById('start-screen');

        if (start && !start.classList.contains('hidden')) return;
        if (journal && !journal.classList.contains('hidden')) return;
        if (settings && !settings.classList.contains('hidden')) return;
        if (help && !help.classList.contains('hidden')) return;
        if (credits && !credits.classList.contains('hidden')) return;

        this.toggle();
      }
    });
  }

  private buildHeader(): void {
    const header = document.createElement('div');
    header.className = 'journal-header';

    const title = document.createElement('h2');
    title.textContent = '⏸️ Gioco in Pausa';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.setAttribute('aria-label', 'Chiudi');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(title);
    header.appendChild(closeBtn);
    this.card.appendChild(header);
  }

  private buildOptions(): void {
    const content = document.createElement('div');
    content.className = 'pause-button-group';

    // 1. Riprendi
    const resumeBtn = document.createElement('button');
    resumeBtn.className = 'primary-button menu-btn';
    resumeBtn.textContent = '▶️ Riprendi Gioco';
    resumeBtn.addEventListener('click', () => this.close());
    content.appendChild(resumeBtn);

    // 2. Salva Partita
    const saveBtn = document.createElement('button');
    saveBtn.className = 'secondary-button menu-btn';
    saveBtn.textContent = '💾 Salva Partita';
    saveBtn.addEventListener('click', () => {
      this.callbacks.onSave();
    });
    content.appendChild(saveBtn);

    // 3. Impostazioni
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'secondary-button menu-btn';
    settingsBtn.textContent = '⚙️ Opzioni & Qualità';
    settingsBtn.addEventListener('click', () => {
      this.close();
      this.callbacks.onOpenSettings();
    });
    content.appendChild(settingsBtn);

    // 4. Guida Controlli
    const helpBtn = document.createElement('button');
    helpBtn.className = 'secondary-button menu-btn';
    helpBtn.textContent = '❓ Guida Controlli';
    helpBtn.addEventListener('click', () => {
      this.close();
      this.callbacks.onOpenHelp();
    });
    content.appendChild(helpBtn);

    // 5. Torna al Menu Principale
    const menuBtn = document.createElement('button');
    menuBtn.className = 'secondary-button menu-btn danger-hover';
    menuBtn.textContent = '🏠 Torna al Menu Principale';
    menuBtn.addEventListener('click', () => {
      this.close();
      this.callbacks.onReturnToMainMenu();
    });
    content.appendChild(menuBtn);

    this.card.appendChild(content);
  }

  public open(): void {
    this.isOpen = true;
    this.container.classList.remove('hidden');
  }

  public close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.container.classList.add('hidden');
    this.callbacks.onResume();
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }
}
