/**
 * Finestra Modale Bloccante di Conferma e Notifica di Sistema (ConfirmModalUI).
 * Gestisce conferme per:
 * - Nuova partita quando esiste già un salvataggio
 * - Notifica salvataggio corrotto con backup effettuato
 * - Salvataggio creato da una versione con schema più recente
 * - Notifica conflitto multi-scheda
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.5.0
 */

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isDanger?: boolean;
}

export class ConfirmModalUI {
  private static instance: ConfirmModalUI | null = null;
  private container: HTMLElement;
  private card: HTMLElement;
  private titleElem: HTMLElement;
  private messageElem: HTMLElement;
  private confirmBtn: HTMLButtonElement;
  private cancelBtn: HTMLButtonElement;
  private currentOptions: ConfirmDialogOptions | null = null;

  private constructor() {
    this.container = document.createElement('div');
    this.container.id = 'confirm-dialog';
    this.container.className = 'journal-overlay hidden';

    this.card = document.createElement('div');
    this.card.className = 'journal-card confirm-card';

    // Header / Titolo
    const header = document.createElement('div');
    header.className = 'journal-header';
    this.titleElem = document.createElement('h2');
    this.titleElem.textContent = 'Attenzione';
    header.appendChild(this.titleElem);
    this.card.appendChild(header);

    // Contenuto / Messaggio
    const content = document.createElement('div');
    content.className = 'journal-content';
    this.messageElem = document.createElement('p');
    this.messageElem.className = 'confirm-message';
    content.appendChild(this.messageElem);

    // Bottoni Azione
    const btnGroup = document.createElement('div');
    btnGroup.className = 'confirm-btn-group';

    this.cancelBtn = document.createElement('button');
    this.cancelBtn.className = 'secondary-button menu-btn';
    this.cancelBtn.textContent = 'Annulla';
    this.cancelBtn.addEventListener('click', () => {
      this.close();
      if (this.currentOptions?.onCancel) {
        this.currentOptions.onCancel();
      }
    });

    this.confirmBtn = document.createElement('button');
    this.confirmBtn.className = 'primary-button menu-btn';
    this.confirmBtn.textContent = 'Conferma';
    this.confirmBtn.addEventListener('click', () => {
      this.close();
      if (this.currentOptions?.onConfirm) {
        this.currentOptions.onConfirm();
      }
    });

    btnGroup.appendChild(this.cancelBtn);
    btnGroup.appendChild(this.confirmBtn);
    content.appendChild(btnGroup);

    this.card.appendChild(content);
    this.container.appendChild(this.card);
    document.body.appendChild(this.container);
  }

  public static getInstance(): ConfirmModalUI {
    if (!ConfirmModalUI.instance) {
      ConfirmModalUI.instance = new ConfirmModalUI();
    }
    return ConfirmModalUI.instance;
  }

  public show(options: ConfirmDialogOptions): void {
    this.currentOptions = options;
    this.titleElem.textContent = options.title;
    this.messageElem.textContent = options.message;
    this.confirmBtn.textContent = options.confirmLabel;

    if (options.isDanger) {
      this.confirmBtn.classList.add('danger-btn');
    } else {
      this.confirmBtn.classList.remove('danger-btn');
    }

    if (options.cancelLabel) {
      this.cancelBtn.textContent = options.cancelLabel;
      this.cancelBtn.classList.remove('hidden');
    } else {
      this.cancelBtn.classList.add('hidden');
    }

    this.container.classList.remove('hidden');
  }

  public close(): void {
    this.container.classList.add('hidden');
    this.currentOptions = null;
  }
}
