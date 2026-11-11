/**
 * Sistema di gestione delle missioni, frammenti dell'Atlante e collezionabili.
 * Completamente serializzabile in JSON e guidato da eventi.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.2.0
 */

import questsConfig from '../data/quests.json';
import { localization } from './LocalizationSystem';
import { globalEventBus } from '../core/EventBus';

export interface QuestStageConfig {
  stageId: number;
  objectiveKey: string;
}

export interface QuestConfig {
  id: string;
  titleKey: string;
  descriptionKey: string;
  giver: string;
  requiredFragments: number;
  stages: QuestStageConfig[];
}

export interface QuestPOJOState {
  activeQuestId: string;
  questStages: Record<string, number>;
  completedQuests: string[];
  fragmentsCollected: number;
  totalFragments: number;
  inventory: {
    seashells: number;
    mushrooms: number;
    starfish: number;
  };
  timeInCurrentStage: number;
}

export interface ActiveQuestView {
  id: string;
  title: string;
  description: string;
  objective: string;
  stageIndex: number;
  isCompleted: boolean;
  hint?: string;
}

export class QuestSystem {
  private quests: QuestConfig[];
  private state: QuestPOJOState = {
    activeQuestId: 'quest_1',
    questStages: { quest_1: 0 },
    completedQuests: [],
    fragmentsCollected: 0,
    totalFragments: 7,
    inventory: {
      seashells: 0,
      mushrooms: 0,
      starfish: 0,
    },
    timeInCurrentStage: 0,
  };

  constructor() {
    this.quests = questsConfig.quests as QuestConfig[];
    this.initEventListeners();
  }

  private initEventListeners(): void {
    // Risponde alle azioni scatenate dai dialoghi
    globalEventBus.on<string>('dialogue-action', (action) => {
      if (action === 'start_quest_1') {
        this.advanceStage('quest_1', 1);
      }
    });
  }

  /**
   * Aggiorna il timer dello stadio per rilevare se il giocatore necessita di un suggerimento.
   */
  public update(dt: number): void {
    this.state.timeInCurrentStage += dt;

    // Se nello stadio 1 da più di 35 secondi, emette un suggerimento
    if (this.state.activeQuestId === 'quest_1' && this.state.questStages['quest_1'] === 1) {
      if (this.state.timeInCurrentStage > 35 && this.state.timeInCurrentStage - dt <= 35) {
        globalEventBus.emit('quest-hint-available', {
          questId: 'quest_1',
          hint: 'Suggerimento: Cerca il cerchio di pietre sulla scogliera a est e accendi la Lanterna (tasto E o 🏮).',
        });
      }
    }
  }

  /**
   * Avanza lo stadio di una missione specifica.
   */
  public advanceStage(questId: string, targetStage: number): void {
    const currentStage = this.state.questStages[questId] ?? 0;
    if (targetStage > currentStage) {
      this.state.questStages[questId] = targetStage;
      this.state.timeInCurrentStage = 0;

      const quest = this.quests.find((q) => q.id === questId);
      if (quest && targetStage >= quest.stages.length - 1) {
        if (!this.state.completedQuests.includes(questId)) {
          this.state.completedQuests.push(questId);
        }
      }

      globalEventBus.emit('quest-updated', this.getActiveQuestInfo());
    }
  }

  /**
   * Raccoglie un frammento dell'Atlante Vivo.
   */
  public collectFragment(fragmentIndex: number): void {
    this.state.fragmentsCollected++;
    this.advanceStage('quest_1', 2);

    const progressRatio = this.state.fragmentsCollected / this.state.totalFragments;

    // Notifica al bus per l'aggiornamento visivo della nebbia nel mondo
    globalEventBus.emit('fragment-collected', {
      fragmentIndex,
      collected: this.state.fragmentsCollected,
      total: this.state.totalFragments,
      progressRatio,
    });

    globalEventBus.emit('inventory-updated', this.getInventoryStats());
    globalEventBus.emit('quest-updated', this.getActiveQuestInfo());
  }

  /**
   * Raccoglie un collezionabile secondario.
   */
  public collectItem(type: 'seashell' | 'mushroom' | 'starfish'): void {
    if (type === 'seashell') this.state.inventory.seashells++;
    else if (type === 'mushroom') this.state.inventory.mushrooms++;
    else if (type === 'starfish') this.state.inventory.starfish++;

    globalEventBus.emit('item-collected', { type, count: this.state.inventory });
    globalEventBus.emit('inventory-updated', this.getInventoryStats());
  }

  /**
   * Restituisce la vista della missione attiva risolvendo i testi tramite i18n.
   */
  public getActiveQuestInfo(): ActiveQuestView | null {
    const quest = this.quests.find((q) => q.id === this.state.activeQuestId);
    if (!quest) return null;

    const stageIdx = this.state.questStages[this.state.activeQuestId] ?? 0;
    const stage = quest.stages[stageIdx] || quest.stages[quest.stages.length - 1];

    let hint: string | undefined = undefined;
    if (stageIdx === 1 && this.state.timeInCurrentStage > 30) {
      hint = 'Indizio: Cerca il cerchio di pietre sulla scogliera e accendi la Lanterna Magica.';
    }

    return {
      id: quest.id,
      title: localization.t(quest.titleKey),
      description: localization.t(quest.descriptionKey),
      objective: localization.t(stage.objectiveKey),
      stageIndex: stageIdx,
      isCompleted: this.state.completedQuests.includes(quest.id),
      hint,
    };
  }

  public getInventoryStats() {
    return {
      fragmentsCollected: this.state.fragmentsCollected,
      totalFragments: this.state.totalFragments,
      ...this.state.inventory,
    };
  }

  public getFogProgress(): number {
    return this.state.fragmentsCollected / this.state.totalFragments;
  }

  /**
   * Serializzazione dello stato in oggetto puro POJO (salvataggi Fase 4).
   */
  public serializeState(): QuestPOJOState {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Ripristino da stato salvato.
   */
  public deserializeState(saved: QuestPOJOState): void {
    this.state = JSON.parse(JSON.stringify(saved));
    globalEventBus.emit('quest-updated', this.getActiveQuestInfo());
    globalEventBus.emit('inventory-updated', this.getInventoryStats());
  }

  /**
   * Resetta lo stato delle missioni e dell'inventario ai valori iniziali di Nuova Partita.
   */
  public reset(): void {
    this.state = {
      activeQuestId: 'quest_1',
      questStages: { quest_1: 0 },
      completedQuests: [],
      fragmentsCollected: 0,
      totalFragments: 7,
      inventory: {
        seashells: 0,
        mushrooms: 0,
        starfish: 0,
      },
      timeInCurrentStage: 0,
    };
    globalEventBus.emit('quest-updated', this.getActiveQuestInfo());
    globalEventBus.emit('inventory-updated', this.getInventoryStats());
  }
}
