/**
 * Schermata UI del Diario del Cartografo.
 * Mostra le missioni in corso, frammenti e statistiche collezionabili.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.2.0
 */

import { QuestSystem } from '../systems/QuestSystem';
import { globalEventBus } from '../core/EventBus';

export class JournalUI {
  private container: HTMLElement;
  private questTitleEl: HTMLElement;
  private questObjectiveEl: HTMLElement;
  private questHintEl: HTMLElement;
  private fragmentsCountEl: HTMLElement;
  private shellsCountEl: HTMLElement;
  private mushroomsCountEl: HTMLElement;
  private starfishCountEl: HTMLElement;
  private btnClose: HTMLElement;
  private questSystem: QuestSystem;

  private isOpen = false;

  constructor(questSystem: QuestSystem) {
    this.questSystem = questSystem;

    this.container = document.getElementById('journal-modal') as HTMLElement;
    this.questTitleEl = document.getElementById('journal-quest-title') as HTMLElement;
    this.questObjectiveEl = document.getElementById('journal-quest-objective') as HTMLElement;
    this.questHintEl = document.getElementById('journal-quest-hint') as HTMLElement;
    this.fragmentsCountEl = document.getElementById('journal-fragments-count') as HTMLElement;
    this.shellsCountEl = document.getElementById('journal-shells-count') as HTMLElement;
    this.mushroomsCountEl = document.getElementById('journal-mushrooms-count') as HTMLElement;
    this.starfishCountEl = document.getElementById('journal-starfish-count') as HTMLElement;
    this.btnClose = document.getElementById('journal-btn-close') as HTMLElement;

    this.initEventListeners();
  }

  private initEventListeners(): void {
    this.btnClose.addEventListener('click', () => this.close());

    // Toggle da pulsante nell'HUD
    const hudJournalBtn = document.getElementById('btn-hud-journal');
    hudJournalBtn?.addEventListener('click', () => this.toggle());

    // Toggle da tastiera (Tab o Esc)
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code === 'KeyJ' || e.code === 'Tab' || (e.code === 'Escape' && this.isOpen)) {
        e.preventDefault();
        this.toggle();
      }
    });

    globalEventBus.on('quest-updated', () => {
      if (this.isOpen) this.refresh();
    });

    globalEventBus.on('inventory-updated', () => {
      if (this.isOpen) this.refresh();
    });
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public open(): void {
    this.isOpen = true;
    this.refresh();
    this.container.classList.remove('hidden');
    globalEventBus.emit('journal-opened');
  }

  public close(): void {
    this.isOpen = false;
    this.container.classList.add('hidden');
    globalEventBus.emit('journal-closed');
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }

  private refresh(): void {
    const questInfo = this.questSystem.getActiveQuestInfo();
    const stats = this.questSystem.getInventoryStats();

    if (questInfo) {
      this.questTitleEl.textContent = questInfo.title;
      this.questObjectiveEl.textContent = questInfo.objective;
      if (questInfo.hint) {
        this.questHintEl.textContent = questInfo.hint;
        this.questHintEl.classList.remove('hidden');
      } else {
        this.questHintEl.textContent = '';
        this.questHintEl.classList.add('hidden');
      }
    } else {
      this.questTitleEl.textContent = 'Nessuna missione attiva';
      this.questObjectiveEl.textContent = "Esplora l'isola liberamente.";
      this.questHintEl.classList.add('hidden');
    }

    this.fragmentsCountEl.textContent = `${stats.fragmentsCollected} / ${stats.totalFragments}`;
    this.shellsCountEl.textContent = String(stats.seashells);
    this.mushroomsCountEl.textContent = String(stats.mushrooms);
    this.starfishCountEl.textContent = String(stats.starfish);
  }
}
