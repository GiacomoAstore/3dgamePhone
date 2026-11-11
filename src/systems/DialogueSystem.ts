/**
 * Sistema di gestione dei dialoghi guidato da dati JSON e localizzazione.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.2.0
 */

import dialogueData from '../data/dialogues.json';
import { localization } from './LocalizationSystem';
import { globalEventBus } from '../core/EventBus';

export interface DialogueOptionConfig {
  textKey: string;
  nextNode: string | null;
}

export interface DialogueNodeConfig {
  textKey: string;
  action?: string;
  options: DialogueOptionConfig[];
}

export interface DialogueCharacterConfig {
  characterKey: string;
  avatar: string;
  initialNode: string;
  nodes: Record<string, DialogueNodeConfig>;
}

export interface DialogueResolvedOption {
  text: string;
  index: number;
}

export interface DialogueResolvedView {
  speakerName: string;
  speakerRole: string;
  avatar: string;
  text: string;
  options: DialogueResolvedOption[];
}

export interface DialogueSystemState {
  activeCharacterId: string | null;
  currentNodeId: string | null;
  isActive: boolean;
}

export class DialogueSystem {
  private characters: Record<string, DialogueCharacterConfig>;
  private state: DialogueSystemState = {
    activeCharacterId: null,
    currentNodeId: null,
    isActive: false,
  };

  constructor() {
    this.characters = dialogueData as Record<string, DialogueCharacterConfig>;
  }

  /**
   * Avvia una conversazione con un NPC specifico.
   */
  public startDialogue(characterId: string, initialNode?: string): boolean {
    const char = this.characters[characterId];
    if (!char) {
      console.warn(`[DialogueSystem] Personaggio non trovato: ${characterId}`);
      return false;
    }

    const nodeToLoad = initialNode || char.initialNode || 'start';
    if (!char.nodes[nodeToLoad]) {
      console.warn(`[DialogueSystem] Nodo non trovato: ${nodeToLoad} per ${characterId}`);
      return false;
    }

    this.state.activeCharacterId = characterId;
    this.state.currentNodeId = nodeToLoad;
    this.state.isActive = true;

    globalEventBus.emit('dialogue-started', characterId);
    this.emitCurrentView();
    return true;
  }

  /**
   * Seleziona un'opzione di risposta e avanza nella conversazione.
   */
  public selectOption(index: number): void {
    if (!this.state.isActive || !this.state.activeCharacterId || !this.state.currentNodeId) return;

    const char = this.characters[this.state.activeCharacterId];
    const node = char.nodes[this.state.currentNodeId];
    if (!node || !node.options[index]) return;

    const chosenOption = node.options[index];

    // Se il nodo aveva un'azione collegata, emettila prima di cambiare nodo
    if (node.action) {
      globalEventBus.emit('dialogue-action', node.action);
    }

    if (chosenOption.nextNode && char.nodes[chosenOption.nextNode]) {
      this.state.currentNodeId = chosenOption.nextNode;
      this.emitCurrentView();
    } else {
      this.closeDialogue();
    }
  }

  /**
   * Chiude il dialogo corrente e ripristina lo stato del gioco.
   */
  public closeDialogue(): void {
    if (!this.state.isActive) return;
    this.state.isActive = false;
    this.state.activeCharacterId = null;
    this.state.currentNodeId = null;

    globalEventBus.emit('dialogue-closed');
  }

  /**
   * Risolve i testi tramite LocalizationSystem ed emette la vista pronta per la UI.
   */
  private emitCurrentView(): void {
    if (!this.state.activeCharacterId || !this.state.currentNodeId) return;

    const char = this.characters[this.state.activeCharacterId];
    const node = char.nodes[this.state.currentNodeId];

    const speakerName = localization.t(`characters.${char.characterKey}.name`);
    const speakerRole = localization.t(`characters.${char.characterKey}.role`);
    const text = localization.t(node.textKey);
    const options: DialogueResolvedOption[] = node.options.map((opt, idx) => ({
      text: localization.t(opt.textKey),
      index: idx,
    }));

    const view: DialogueResolvedView = {
      speakerName,
      speakerRole,
      avatar: char.avatar,
      text,
      options,
    };

    globalEventBus.emit('dialogue-updated', view);
  }

  public getIsActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Restituisce lo stato serializzabile puro (POJO).
   */
  public serializeState(): DialogueSystemState {
    return { ...this.state };
  }

  /**
   * Ripristina lo stato salvato.
   */
  public deserializeState(saved: DialogueSystemState): void {
    this.state = { ...saved };
    if (this.state.isActive) {
      this.emitCurrentView();
    }
  }

  /**
   * Resetta lo stato dei dialoghi ai valori iniziali di Nuova Partita.
   */
  public reset(): void {
    this.state = {
      activeCharacterId: null,
      currentNodeId: null,
      isActive: false,
    };
  }
}
