/**
 * Test per il DialogueSystem: nodi, opzioni, localizzazione e serializzazione.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.2.0
 */

import { describe, it, expect } from 'vitest';
import { DialogueSystem } from '../src/systems/DialogueSystem';
import { globalEventBus } from '../src/core/EventBus';

describe('DialogueSystem e Conversazioni NPC', () => {
  it('dovrebbe avviare il dialogo con Nonna Bussola e impostarsi come attivo', () => {
    const dialogueSystem = new DialogueSystem();
    const success = dialogueSystem.startDialogue('nonna_bussola', 'start');

    expect(success).toBe(true);
    expect(dialogueSystem.getIsActive()).toBe(true);
  });

  it('dovrebbe avanzare ai nodi successivi selezionando le opzioni', () => {
    const dialogueSystem = new DialogueSystem();
    dialogueSystem.startDialogue('nonna_bussola', 'start');

    // Opzione 0: "Cosa posso fare per aiutarti, Nonna?" -> porta a lantern_quest
    dialogueSystem.selectOption(0);
    expect(dialogueSystem.getIsActive()).toBe(true);

    const state = dialogueSystem.serializeState();
    expect(state.currentNodeId).toBe('lantern_quest');
  });

  it('dovrebbe emettere l evento di azione quando si attiva una missione', () => {
    const dialogueSystem = new DialogueSystem();
    dialogueSystem.startDialogue('nonna_bussola', 'lantern_quest');

    let actionEmitted: string | null = null;
    globalEventBus.on<string>('dialogue-action', (action) => {
      actionEmitted = action;
    });

    // Seleziona opzione finale -> scatena start_quest_1 e chiude il dialogo
    dialogueSystem.selectOption(0);

    expect(actionEmitted).toBe('start_quest_1');
    expect(dialogueSystem.getIsActive()).toBe(false);
  });

  it('dovrebbe serializzare e deserializzare lo stato della conversazione', () => {
    const dialogueSystem = new DialogueSystem();
    dialogueSystem.startDialogue('nonna_bussola', 'atlas_story');

    const state = dialogueSystem.serializeState();
    expect(state.currentNodeId).toBe('atlas_story');
    expect(state.isActive).toBe(true);

    const restored = new DialogueSystem();
    restored.deserializeState(state);

    expect(restored.getIsActive()).toBe(true);
    expect(restored.serializeState().currentNodeId).toBe('atlas_story');
  });
});

