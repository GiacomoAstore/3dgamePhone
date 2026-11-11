/**
 * Sistema di Salvataggio Persistente Versionato (SaveSystem).
 * Gestisce la serializzazione, validazione, migrazione, backup anti-corruzione
 * e salvataggio automatico per Brumavento.
 *
 * Specifiche e vincoli di progetto:
 * 1. Schema versionato (schemaVersion = 1, gameVersion = "0.5.0").
 * 2. Trattamento dati come NON fidati: validazione puntuale di tipi, coordinate e range.
 * 3. Coordinate: salva solo x, z e rotazione (yaw); y viene sempre calcolato da getTerrainHeight.
 * 4. Controllo coerenza logica: verifica coerenza tra quest completate e frammenti raccolti.
 * 5. Slot dedicato per schemi più recenti (brumavento_save_future_schema_backup) escluso dalla rotazione.
 * 6. Rotazione FIFO dei backup di corruzione (max 3 file: brumavento_save_backup_1..3).
 * 7. Rilevamento multi-scheda via evento standard 'storage'.
 * 8. Salvataggio automatico su eventi di gioco, visibilitychange e pagehide.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.5.0
 */

import { globalEventBus } from '../core/EventBus';
import type { QualityPreset } from '../ui/QualitySettingsUI';

export const CURRENT_SCHEMA_VERSION = 1;
export const CURRENT_GAME_VERSION = '0.5.0';

export const STORAGE_KEYS = {
  SAVE: 'brumavento_save_v1',
  SETTINGS: 'brumavento_settings',
  FUTURE_SCHEMA_BACKUP: 'brumavento_save_future_schema_backup',
  BACKUP_PREFIX: 'brumavento_save_backup_',
  MAX_CORRUPTION_BACKUPS: 3,
} as const;

export interface PlayerSaveData {
  x: number;
  z: number;
  yaw: number;
}

export interface InventorySaveData {
  fragmentsCollected: number;
  notesCollected: number;
  activeCompass: boolean;
  seashells?: number;
  mushrooms?: number;
  starfish?: number;
  items: string[];
}

export interface QuestSaveData {
  activeQuestId: string;
  stageIndex: number;
  completedQuestIds: string[];
  questStages?: Record<string, number>;
}

export interface DialogueSaveData {
  visitedNodeIds: string[];
}

export interface SettingsSaveData {
  qualityPreset: QualityPreset;
  dayNightMode: 'dynamic' | 'day' | 'night';
  readableNight: boolean;
  masterVolume: number;
  isManualQualitySelection: boolean;
}

export interface SaveData {
  schemaVersion: number;
  gameVersion: string;
  timestamp: number;
  player: PlayerSaveData;
  inventory: InventorySaveData;
  quest: QuestSaveData;
  dialogue: DialogueSaveData;
  settings: SettingsSaveData;
}

export type SaveLoadResult =
  | { success: true; data: SaveData }
  | { success: false; reason: 'empty' }
  | { success: false; reason: 'corrupted'; raw: string; backupSlot: string }
  | { success: false; reason: 'newer_schema'; data: SaveData; backupSlot: string };

export class SaveSystem {
  private static instance: SaveSystem | null = null;
  private isStorageAvailable: boolean;
  private multiTabConflictDetected = false;
  private lastSavedTimestamp = 0;

  private constructor() {
    this.isStorageAvailable = this.checkStorageAvailability();
    this.initMultiTabListener();
  }

  public static getInstance(): SaveSystem {
    if (!SaveSystem.instance) {
      SaveSystem.instance = new SaveSystem();
    }
    return SaveSystem.instance;
  }

  /**
   * Verifica se localStorage è disponibile e accessibile (es. gestione navigazione privata / quote).
   */
  private checkStorageAvailability(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      const testKey = '__brumavento_storage_probe__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      console.warn('[SaveSystem] localStorage non disponibile o quota esaurita. Il salvataggio locale è disattivato.');
      return false;
    }
  }

  /**
   * Ascolta le modifiche allo storage generate da altre schede del browser aperte sullo stesso dominio.
   */
  private initMultiTabListener(): void {
    if (typeof window === 'undefined' || !window.addEventListener) return;

    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEYS.SAVE && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (parsed && parsed.timestamp > this.lastSavedTimestamp) {
            console.warn('[SaveSystem] Rilevato aggiornamento del salvataggio da un altra scheda!');
            this.multiTabConflictDetected = true;
            globalEventBus.emit('save:multiTabConflict', {
              timestamp: parsed.timestamp,
            });
          }
        } catch {
          // Ignora parsing errori da storage esterno
        }
      }
    });
  }

  /**
   * Configura i listener di salvataggio automatico per gli eventi del ciclo di vita della pagina.
   */
  public initLifecycleAutosave(getSavePayload: () => SaveData): void {
    if (typeof window === 'undefined') return;

    // Salvataggio su cambio visibilità (es. scheda nascosta o minimizzata su smartphone)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.save(getSavePayload());
      }
    });

    // Salvataggio su chiusura / swipe-close della pagina
    window.addEventListener('pagehide', () => {
      this.save(getSavePayload());
    });
  }

  /**
   * Verifica se esiste un salvataggio in storage.
   */
  public hasSave(): boolean {
    if (!this.isStorageAvailable) return false;
    return window.localStorage.getItem(STORAGE_KEYS.SAVE) !== null;
  }

  /**
   * Salva lo stato di gioco su localStorage.
   */
  public save(data: SaveData): boolean {
    if (!this.isStorageAvailable) return false;

    try {
      // Aggiorna metadati di sistema
      data.schemaVersion = CURRENT_SCHEMA_VERSION;
      data.gameVersion = CURRENT_GAME_VERSION;
      data.timestamp = Date.now();

      const serialized = JSON.stringify(data);
      window.localStorage.setItem(STORAGE_KEYS.SAVE, serialized);
      this.lastSavedTimestamp = data.timestamp;
      this.multiTabConflictDetected = false;

      globalEventBus.emit('save:saved', { timestamp: data.timestamp });
      return true;
    } catch (e) {
      console.error('[SaveSystem] Impossibile salvare la partita:', e);
      return false;
    }
  }

  /**
   * Carica e valida rigorosamente lo stato di gioco salvato.
   */
  public load(): SaveLoadResult {
    if (!this.isStorageAvailable) {
      return { success: false, reason: 'empty' };
    }

    const raw = window.localStorage.getItem(STORAGE_KEYS.SAVE);
    if (!raw) {
      return { success: false, reason: 'empty' };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const backupSlot = this.backupCorruptedSave(raw);
      return { success: false, reason: 'corrupted', raw, backupSlot };
    }

    if (!parsed || typeof parsed !== 'object') {
      const backupSlot = this.backupCorruptedSave(raw);
      return { success: false, reason: 'corrupted', raw, backupSlot };
    }

    const candidate = parsed as Partial<SaveData>;

    // Controllo versione dello schema più recente (es. versione futura del gioco)
    if (typeof candidate.schemaVersion === 'number' && candidate.schemaVersion > CURRENT_SCHEMA_VERSION) {
      const backupSlot = STORAGE_KEYS.FUTURE_SCHEMA_BACKUP;
      try {
        window.localStorage.setItem(backupSlot, raw);
      } catch (e) {
        console.warn('[SaveSystem] Errore nel salvataggio slot schema futuro:', e);
      }
      return {
        success: false,
        reason: 'newer_schema',
        data: candidate as SaveData,
        backupSlot,
      };
    }

    // Validazione rigorosa dei campi dello schema 1
    const validated = this.validateAndSanitize(candidate);
    if (!validated) {
      const backupSlot = this.backupCorruptedSave(raw);
      return { success: false, reason: 'corrupted', raw, backupSlot };
    }

    this.lastSavedTimestamp = validated.timestamp;
    return { success: true, data: validated };
  }

  /**
   * Esegue backup di rotazione FIFO per dati corrotti (max 3 slot).
   */
  public backupCorruptedSave(raw: string): string {
    if (!this.isStorageAvailable) return '';

    try {
      // Cerca il primo slot libero o sovrascrive a rotazione
      let targetSlot = '';
      for (let i = 1; i <= STORAGE_KEYS.MAX_CORRUPTION_BACKUPS; i++) {
        const slotKey = `${STORAGE_KEYS.BACKUP_PREFIX}${i}`;
        if (!window.localStorage.getItem(slotKey)) {
          targetSlot = slotKey;
          break;
        }
      }

      if (!targetSlot) {
        // Rotazione FIFO: scala i backup e sovrascrive il più vecchio
        const b2 = window.localStorage.getItem(`${STORAGE_KEYS.BACKUP_PREFIX}2`) || '';
        const b3 = window.localStorage.getItem(`${STORAGE_KEYS.BACKUP_PREFIX}3`) || '';
        window.localStorage.setItem(`${STORAGE_KEYS.BACKUP_PREFIX}1`, b2);
        window.localStorage.setItem(`${STORAGE_KEYS.BACKUP_PREFIX}2`, b3);
        targetSlot = `${STORAGE_KEYS.BACKUP_PREFIX}3`;
      }

      window.localStorage.setItem(targetSlot, raw);
      console.warn(`[SaveSystem] Backup di corruzione salvato nello slot: ${targetSlot}`);
      return targetSlot;
    } catch (e) {
      console.error('[SaveSystem] Errore durante il backup di corruzione:', e);
      return '';
    }
  }

  /**
   * Valida e sanifica i campi dell'oggetto di salvataggio.
   */
  public validateAndSanitize(candidate: Partial<SaveData>): SaveData | null {
    // 1. Controllo Player
    if (!candidate.player || typeof candidate.player !== 'object') return null;
    const p = candidate.player as Partial<PlayerSaveData>;
    if (typeof p.x !== 'number' || isNaN(p.x) || typeof p.z !== 'number' || isNaN(p.z)) return null;
    const yaw = typeof p.yaw === 'number' && !isNaN(p.yaw) ? p.yaw : 0;

    // 2. Controllo Inventory
    const inv = candidate.inventory || ({} as Partial<InventorySaveData>);
    const fragmentsCollected = Math.max(0, Math.min(7, typeof inv.fragmentsCollected === 'number' ? inv.fragmentsCollected : 0));
    const notesCollected = Math.max(0, typeof inv.notesCollected === 'number' ? inv.notesCollected : 0);
    const seashells = typeof inv.seashells === 'number' && inv.seashells >= 0 ? inv.seashells : 0;
    const mushrooms = typeof inv.mushrooms === 'number' && inv.mushrooms >= 0 ? inv.mushrooms : 0;
    const starfish = typeof inv.starfish === 'number' && inv.starfish >= 0 ? inv.starfish : 0;
    const activeCompass = Boolean(inv.activeCompass);
    const validItems: string[] = Array.isArray(inv.items)
      ? inv.items.filter((it) => typeof it === 'string' && it.length > 0 && it.length < 64)
      : [];

    // 3. Controllo Quest
    const q = candidate.quest || ({} as Partial<QuestSaveData>);
    const activeQuestId = typeof q.activeQuestId === 'string' ? q.activeQuestId : 'quest_1';
    const stageIndex = typeof q.stageIndex === 'number' && q.stageIndex >= 0 ? q.stageIndex : 0;
    const completedQuestIds = Array.isArray(q.completedQuestIds)
      ? q.completedQuestIds.filter((cid) => typeof cid === 'string')
      : [];
    const questStages: Record<string, number> = {};
    if (q.questStages && typeof q.questStages === 'object') {
      for (const [k, v] of Object.entries(q.questStages)) {
        if (typeof k === 'string' && typeof v === 'number') {
          questStages[k] = v;
        }
      }
    }

    // Controllo di coerenza logica: se quest_1 è completata, deve esserci almeno 1 frammento
    let consistentFragments = fragmentsCollected;
    if (completedQuestIds.includes('quest_1') && consistentFragments < 1) {
      console.warn('[SaveSystem] Incoerenza rilevata: Quest 1 completata ma 0 frammenti. Rettificato a 1.');
      consistentFragments = 1;
    }

    // 4. Controllo Dialogue
    const d = candidate.dialogue || ({} as Partial<DialogueSaveData>);
    const visitedNodeIds = Array.isArray(d.visitedNodeIds)
      ? d.visitedNodeIds.filter((nid) => typeof nid === 'string')
      : [];

    // 5. Controllo Settings
    const s = candidate.settings || ({} as Partial<SettingsSaveData>);
    const validPresets: QualityPreset[] = ['low', 'medium', 'high'];
    const qualityPreset: QualityPreset = validPresets.includes(s.qualityPreset as QualityPreset)
      ? (s.qualityPreset as QualityPreset)
      : 'medium';
    const dayNightMode = s.dayNightMode === 'day' || s.dayNightMode === 'night' ? s.dayNightMode : 'dynamic';
    const readableNight = Boolean(s.readableNight);
    const masterVolume = typeof s.masterVolume === 'number' ? Math.max(0, Math.min(1, s.masterVolume)) : 0.8;
    const isManualQualitySelection = Boolean(s.isManualQualitySelection);

    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      gameVersion: typeof candidate.gameVersion === 'string' ? candidate.gameVersion : CURRENT_GAME_VERSION,
      timestamp: typeof candidate.timestamp === 'number' ? candidate.timestamp : Date.now(),
      player: {
        x: p.x,
        z: p.z,
        yaw,
      },
      inventory: {
        fragmentsCollected: consistentFragments,
        notesCollected,
        activeCompass,
        seashells,
        mushrooms,
        starfish,
        items: validItems,
      },
      quest: {
        activeQuestId,
        stageIndex,
        completedQuestIds,
        questStages,
      },
      dialogue: {
        visitedNodeIds,
      },
      settings: {
        qualityPreset,
        dayNightMode,
        readableNight,
        masterVolume,
        isManualQualitySelection,
      },
    };
  }

  /**
   * Elimina il salvataggio principale (es. per reset manuale).
   */
  public deleteSave(): void {
    if (!this.isStorageAvailable) return;
    window.localStorage.removeItem(STORAGE_KEYS.SAVE);
    this.lastSavedTimestamp = 0;
  }

  public getIsMultiTabConflict(): boolean {
    return this.multiTabConflictDetected;
  }
}
