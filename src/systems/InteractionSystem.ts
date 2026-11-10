/**
 * Sistema di rilevamento interazioni e prompt a schermo.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.2.0
 */

import * as THREE from 'three';
import { globalEventBus } from '../core/EventBus';

export interface InteractableTarget {
  id: string;
  name: string;
  position: THREE.Vector3;
  radius: number;
  type: 'npc' | 'hint' | 'object';
  hintText?: string;
}

export class InteractionSystem {
  private targets: InteractableTarget[] = [];
  private currentActiveTarget: InteractableTarget | null = null;
  private promptElement: HTMLElement | null = null;
  private promptTextElement: HTMLElement | null = null;

  constructor() {
    this.promptElement = document.getElementById('interaction-prompt');
    this.promptTextElement = document.getElementById('prompt-text');
  }

  public registerTarget(target: InteractableTarget): void {
    this.targets.push(target);
  }

  public unregisterTarget(id: string): void {
    this.targets = this.targets.filter((t) => t.id !== id);
  }

  /**
   * Verifica la vicinanza del giocatore ai target registrati.
   * @param playerPos Posizione attuale di Pip.
   * @param isLanternActive Stato della lanterna.
   */
  public update(playerPos: THREE.Vector3, isLanternActive: boolean): InteractableTarget | null {
    let nearest: InteractableTarget | null = null;
    let minDistance = Infinity;

    for (const target of this.targets) {
      // Se il target è un indizio per il frammento nascosto, mostralo solo se la lanterna è spenta
      if (target.type === 'hint' && isLanternActive) continue;

      const dist = playerPos.distanceTo(target.position);
      if (dist <= target.radius && dist < minDistance) {
        minDistance = dist;
        nearest = target;
      }
    }

    if (nearest !== this.currentActiveTarget) {
      this.currentActiveTarget = nearest;
      this.updatePromptUI(nearest);
    }

    return this.currentActiveTarget;
  }

  private updatePromptUI(target: InteractableTarget | null): void {
    if (!this.promptElement || !this.promptTextElement) {
      this.promptElement = document.getElementById('interaction-prompt');
      this.promptTextElement = document.getElementById('prompt-text');
    }

    if (target && this.promptElement && this.promptTextElement) {
      this.promptElement.classList.remove('hidden');
      // Rigorosamente textContent per sicurezza XSS (Regola 5 utente)
      this.promptTextElement.textContent = target.hintText || `Parla con ${target.name}`;
      globalEventBus.emit('interactable-nearby', target);
    } else if (this.promptElement) {
      this.promptElement.classList.add('hidden');
      globalEventBus.emit('interactable-cleared');
    }
  }

  public getActiveTarget(): InteractableTarget | null {
    return this.currentActiveTarget;
  }
}

