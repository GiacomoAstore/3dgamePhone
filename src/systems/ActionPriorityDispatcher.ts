/**
 * Gestore dell'azione con priorità rigorosa per Brumavento.
 * Sostituisce i vecchi timer di debounce garantendo che:
 * 1. Se un dialogo è attivo -> avanza/chiude il dialogo.
 * 2. Se un target è nel raggio -> interagisce con il target (NPC o punto d'interesse).
 * 3. SOLO se non c'è nulla con cui interagire -> accende/spegne la Lanterna Magica.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.0
 */

import { InteractableTarget } from './InteractionSystem';

export interface ActionPriorityContext {
  isDialogueActive: boolean;
  activeTarget: InteractableTarget | null;
  onAdvanceDialogue: () => void;
  onInteract: (target: InteractableTarget) => void;
  onToggleLantern: () => void;
}

export type ActionExecutionResult = 'dialogue' | 'interaction' | 'lantern' | 'none';

export class ActionPriorityDispatcher {
  /**
   * Consuma l'input azione secondo la gerarchia di priorità a singolo consumatore.
   * @param hasActionInput Se l'utente ha premuto il tasto azione (E / 🏮)
   * @param context Contesto corrente dello stato di gioco e callback
   */
  public static dispatch(
    hasActionInput: boolean,
    context: ActionPriorityContext
  ): ActionExecutionResult {
    if (!hasActionInput) {
      return 'none';
    }

    // 1. Massima Priorità: Dialogo attivo
    if (context.isDialogueActive) {
      context.onAdvanceDialogue();
      return 'dialogue';
    }

    // 2. Seconda Priorità: Bersaglio interattivo nel raggio
    if (context.activeTarget) {
      context.onInteract(context.activeTarget);
      return 'interaction';
    }

    // 3. Fallback: Lanterna Magica (solo se non c'è alcun bersaglio o dialogo)
    context.onToggleLantern();
    return 'lantern';
  }
}
