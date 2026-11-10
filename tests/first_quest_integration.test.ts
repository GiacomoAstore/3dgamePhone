/**
 * Test di Integrazione Logica: Ciclo Completo della Prima Missione di Brumavento.
 * Percorre: Incontro con Nonna Bussola -> Accettazione Quest -> Ricerca con Lanterna ->
 * Raccolta del 1° Frammento -> Ritirata della nebbia -> Ritorno da Nonna Bussola.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.2.0
 */

import { describe, it, expect } from 'vitest';
import { DialogueSystem } from '../src/systems/DialogueSystem';
import { QuestSystem } from '../src/systems/QuestSystem';
import { globalEventBus } from '../src/core/EventBus';

describe('Test di Integrazione: Prima Missione (Il Risveglio della Lanterna)', () => {
  it('dovrebbe completare l intero flusso della prima missione dall inizio alla fine', () => {
    const dialogueSystem = new DialogueSystem();
    const questSystem = new QuestSystem();

    // 1. STATO INIZIALE
    let questInfo = questSystem.getActiveQuestInfo();
    expect(questInfo?.id).toBe('quest_1');
    expect(questInfo?.stageIndex).toBe(0);
    expect(questInfo?.isCompleted).toBe(false);
    expect(questSystem.getFogProgress()).toBe(0);

    // 2. INCONTRO CON NONNA BUSSOLA SULLA COLLINA
    const started = dialogueSystem.startDialogue('nonna_bussola', 'start');
    expect(started).toBe(true);
    expect(dialogueSystem.getIsActive()).toBe(true);

    // 3. DIALOGO E ACCETTAZIONE MISSIONE
    // Scelta 0: "Cosa posso fare per aiutarti, Nonna?" -> passa a lantern_quest
    dialogueSystem.selectOption(0);
    expect(dialogueSystem.serializeState().currentNodeId).toBe('lantern_quest');

    // Scelta 0: "Contaci, Nonna! Vado subito." -> emette start_quest_1 e chiude il dialogo
    dialogueSystem.selectOption(0);
    expect(dialogueSystem.getIsActive()).toBe(false);

    // Verifica avanzamento Quest allo Stadio 1 (Cerca il frammento con la Lanterna)
    questInfo = questSystem.getActiveQuestInfo();
    expect(questInfo?.stageIndex).toBe(1);

    // 4. RICERCA DEL FRAMMENTO PRESSO IL CERCHIO DI PIETRE
    let isLanternActive = false;
    const playerDistanceToFragment = 1.2; // Pip è vicino al cerchio di pietre
    const pickupRadius = 1.8;

    const canCollect = (dist: number, lanternOn: boolean) => dist <= pickupRadius && lanternOn;

    // Tentativo di raccolta a lanterna spenta: bloccato
    expect(canCollect(playerDistanceToFragment, isLanternActive)).toBe(false);

    // Pip accende la Lanterna Magica (tasto E o pulsante touch 🏮)
    isLanternActive = true;
    expect(canCollect(playerDistanceToFragment, isLanternActive)).toBe(true);

    // 5. RACCOLTA DEL FRAMMENTO E RITIRATA DELLA NEBBIA
    let fogEventEmitted = false;
    globalEventBus.on('fragment-collected', () => {
      fogEventEmitted = true;
    });

    questSystem.collectFragment(1);

    expect(fogEventEmitted).toBe(true);
    expect(questSystem.getFogProgress()).toBeCloseTo(1 / 7, 5);

    // La quest passa allo Stadio 2: "Torna da Nonna Bussola"
    questInfo = questSystem.getActiveQuestInfo();
    expect(questInfo?.stageIndex).toBe(2);

    // 6. RITORNO DA NONNA BUSSOLA
    // L'NPC rileva che lo stadio è >= 2 e seleziona il nodo "quest_1_completed"
    const targetNodeForReturn = questInfo && questInfo.stageIndex >= 2 ? 'quest_1_completed' : 'quest_1_active';
    expect(targetNodeForReturn).toBe('quest_1_completed');

    dialogueSystem.startDialogue('nonna_bussola', targetNodeForReturn);
    expect(dialogueSystem.getIsActive()).toBe(true);
    expect(dialogueSystem.serializeState().currentNodeId).toBe('quest_1_completed');

    // Pip conclude la conversazione: "Brumavento sta tornando a splendere!"
    dialogueSystem.selectOption(0);
    expect(dialogueSystem.getIsActive()).toBe(false);

    // 7. VERIFICA FINALE
    const finalStats = questSystem.getInventoryStats();
    expect(finalStats.fragmentsCollected).toBe(1);
    expect(finalStats.totalFragments).toBe(7);
  });
});

