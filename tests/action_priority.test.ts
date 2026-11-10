/**
 * Test per il Gestore dell'Azione con Priorità Rigorosa.
 * Verifica che l'interazione e il dialogo abbiano sempre precedenza sulla lanterna,
 * eliminando qualsiasi attivazione accidentale della lanterna senza debounce arbitrari.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.0
 */

import { describe, it, expect, vi } from 'vitest';
import { ActionPriorityDispatcher } from '../src/systems/ActionPriorityDispatcher';
import { InteractableTarget } from '../src/systems/InteractionSystem';
import * as THREE from 'three';

describe('ActionPriorityDispatcher', () => {
  const dummyTarget: InteractableTarget = {
    id: 'nonna_bussola',
    name: 'Nonna Bussola',
    position: new THREE.Vector3(0, 0, 0),
    radius: 3,
    type: 'npc',
  };

  it('non fa nulla se non viene premuto il tasto azione', () => {
    const onAdvanceDialogue = vi.fn();
    const onInteract = vi.fn();
    const onToggleLantern = vi.fn();

    const result = ActionPriorityDispatcher.dispatch(false, {
      isDialogueActive: false,
      activeTarget: null,
      onAdvanceDialogue,
      onInteract,
      onToggleLantern,
    });

    expect(result).toBe('none');
    expect(onAdvanceDialogue).not.toHaveBeenCalled();
    expect(onInteract).not.toHaveBeenCalled();
    expect(onToggleLantern).not.toHaveBeenCalled();
  });

  it('Priorità 1: consuma l azione sul dialogo se attivo, anche in presenza di un target e senza toccare la lanterna', () => {
    const onAdvanceDialogue = vi.fn();
    const onInteract = vi.fn();
    const onToggleLantern = vi.fn();

    const result = ActionPriorityDispatcher.dispatch(true, {
      isDialogueActive: true,
      activeTarget: dummyTarget,
      onAdvanceDialogue,
      onInteract,
      onToggleLantern,
    });

    expect(result).toBe('dialogue');
    expect(onAdvanceDialogue).toHaveBeenCalledOnce();
    expect(onInteract).not.toHaveBeenCalled();
    expect(onToggleLantern).not.toHaveBeenCalled();
  });

  it('Priorità 2: consuma l azione sull interazione con il target se vicino e nessun dialogo è attivo', () => {
    const onAdvanceDialogue = vi.fn();
    const onInteract = vi.fn();
    const onToggleLantern = vi.fn();

    const result = ActionPriorityDispatcher.dispatch(true, {
      isDialogueActive: false,
      activeTarget: dummyTarget,
      onAdvanceDialogue,
      onInteract,
      onToggleLantern,
    });

    expect(result).toBe('interaction');
    expect(onInteract).toHaveBeenCalledWith(dummyTarget);
    expect(onAdvanceDialogue).not.toHaveBeenCalled();
    expect(onToggleLantern).not.toHaveBeenCalled();
  });

  it('Priorità 3 (Fallback): aziona la Lanterna SOLO se nessun dialogo è attivo e nessun target è vicino', () => {
    const onAdvanceDialogue = vi.fn();
    const onInteract = vi.fn();
    const onToggleLantern = vi.fn();

    const result = ActionPriorityDispatcher.dispatch(true, {
      isDialogueActive: false,
      activeTarget: null,
      onAdvanceDialogue,
      onInteract,
      onToggleLantern,
    });

    expect(result).toBe('lantern');
    expect(onToggleLantern).toHaveBeenCalledOnce();
    expect(onAdvanceDialogue).not.toHaveBeenCalled();
    expect(onInteract).not.toHaveBeenCalled();
  });
});
