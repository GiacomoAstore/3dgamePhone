/**
 * Test per il QuestSystem: stadi missione, frammenti, nebbia e serializzazione POJO.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.2.0
 */

import { describe, it, expect } from 'vitest';
import { QuestSystem } from '../src/systems/QuestSystem';

describe('QuestSystem e Gestione Missioni', () => {
  it('dovrebbe inizializzare la prima missione allo stadio 0 (Parla con Nonna Bussola)', () => {
    const questSystem = new QuestSystem();
    const info = questSystem.getActiveQuestInfo();

    expect(info).not.toBeNull();
    expect(info?.id).toBe('quest_1');
    expect(info?.stageIndex).toBe(0);
    expect(info?.isCompleted).toBe(false);
  });

  it('dovrebbe avanzare sequenzialmente gli stadi della missione', () => {
    const questSystem = new QuestSystem();

    questSystem.advanceStage('quest_1', 1);
    let info = questSystem.getActiveQuestInfo();
    expect(info?.stageIndex).toBe(1);

    questSystem.advanceStage('quest_1', 2);
    info = questSystem.getActiveQuestInfo();
    expect(info?.stageIndex).toBe(2);
    expect(info?.isCompleted).toBe(true);
  });

  it('dovrebbe calcolare la percentuale di nebbia in base ai frammenti recuperati', () => {
    const questSystem = new QuestSystem();

    expect(questSystem.getFogProgress()).toBe(0);

    questSystem.collectFragment(1);
    expect(questSystem.getFogProgress()).toBeCloseTo(1 / 7, 5);

    const stats = questSystem.getInventoryStats();
    expect(stats.fragmentsCollected).toBe(1);
    expect(stats.totalFragments).toBe(7);
  });

  it('dovrebbe incrementare l inventario dei collezionabili secondari', () => {
    const questSystem = new QuestSystem();

    questSystem.collectItem('seashell');
    questSystem.collectItem('seashell');
    questSystem.collectItem('mushroom');
    questSystem.collectItem('starfish');

    const stats = questSystem.getInventoryStats();
    expect(stats.seashells).toBe(2);
    expect(stats.mushrooms).toBe(1);
    expect(stats.starfish).toBe(1);
  });

  it('dovrebbe essere perfettamente serializzabile in JSON puro (POJO) per i salvataggi', () => {
    const questSystem = new QuestSystem();
    questSystem.advanceStage('quest_1', 1);
    questSystem.collectItem('seashell');

    // Serializzazione
    const pojo = questSystem.serializeState();
    const jsonString = JSON.stringify(pojo);
    expect(typeof jsonString).toBe('string');

    // Deserializzazione in una nuova istanza
    const restoredSystem = new QuestSystem();
    restoredSystem.deserializeState(JSON.parse(jsonString));

    const info = restoredSystem.getActiveQuestInfo();
    const stats = restoredSystem.getInventoryStats();

    expect(info?.stageIndex).toBe(1);
    expect(stats.seashells).toBe(1);
  });
});
