/**
 * Componente UI per i dialoghi con gli NPC.
 * Sicuro (uso esclusivo di textContent) e responsive per smartphone.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.2.0
 */

import { DialogueSystem, DialogueResolvedView } from '../systems/DialogueSystem';
import { globalEventBus } from '../core/EventBus';

export class DialogueBox {
  private container: HTMLElement;
  private avatarEl: HTMLElement;
  private nameEl: HTMLElement;
  private roleEl: HTMLElement;
  private textEl: HTMLElement;
  private optionsContainer: HTMLElement;
  private dialogueSystem: DialogueSystem;

  constructor(dialogueSystem: DialogueSystem) {
    this.dialogueSystem = dialogueSystem;
    this.container = document.getElementById('dialogue-box') as HTMLElement;
    this.avatarEl = document.getElementById('dialogue-avatar') as HTMLElement;
    this.nameEl = document.getElementById('dialogue-name') as HTMLElement;
    this.roleEl = document.getElementById('dialogue-role') as HTMLElement;
    this.textEl = document.getElementById('dialogue-text') as HTMLElement;
    this.optionsContainer = document.getElementById('dialogue-options') as HTMLElement;

    this.initEventListeners();
  }

  private initEventListeners(): void {
    globalEventBus.on<DialogueResolvedView>('dialogue-updated', (view) => {
      this.renderView(view);
    });

    globalEventBus.on('dialogue-closed', () => {
      this.container.classList.add('hidden');
    });

    // Supporto avanzamento rapido con tasto Spazio o Invio se c'è una sola opzione
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (
        this.dialogueSystem.getIsActive() &&
        (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE')
      ) {
        e.stopPropagation();
        this.advance();
      }
    });
  }

  /**
   * Seleziona la prima opzione disponibile per avanzare o chiudere il dialogo.
   */
  public advance(): void {
    const firstOption =
      this.optionsContainer.querySelector<HTMLButtonElement>('.dialogue-option-btn');
    if (firstOption) {
      firstOption.click();
    }
  }

  /**
   * Renderizza la schermata di dialogo popolando i campi rigorosamente con textContent.
   */
  private renderView(view: DialogueResolvedView): void {
    this.container.classList.remove('hidden');

    // Assegnazione sicura dei testi (Regola utente 5)
    this.avatarEl.textContent = view.avatar;
    this.nameEl.textContent = view.speakerName;
    this.roleEl.textContent = view.speakerRole;
    this.textEl.textContent = view.text;

    // Svuota le opzioni precedenti
    while (this.optionsContainer.firstChild) {
      this.optionsContainer.removeChild(this.optionsContainer.firstChild);
    }

    // Ricostruisce i bottoni di risposta
    for (const opt of view.options) {
      const btn = document.createElement('button');
      btn.className = 'dialogue-option-btn';
      btn.textContent = opt.text; // Sicuro
      btn.addEventListener('click', () => {
        this.dialogueSystem.selectOption(opt.index);
      });
      btn.addEventListener(
        'touchstart',
        (e) => {
          e.stopPropagation();
        },
        { passive: true }
      );
      this.optionsContainer.appendChild(btn);
    }
  }
}
