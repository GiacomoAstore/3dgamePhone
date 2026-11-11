/**
 * Test unitari per il Sistema di Salvataggio Persistente (SaveSystem).
 * Verifica conformità vincolante: versionamento, sanitizzazione dati non fidati,
 * rotazione backup di corruzione, slot dedicato schemi futuri e coerenza quest/inventario.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.5.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SaveSystem,
  CURRENT_SCHEMA_VERSION,
  CURRENT_GAME_VERSION,
  STORAGE_KEYS,
  type SaveData,
} from '../src/systems/SaveSystem';

describe('SaveSystem (Salvataggio Persistente Versionato)', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const localStorageMock = {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, val: string) => {
        mockStorage[key] = val;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
    };

    vi.stubGlobal('localStorage', localStorageMock);
    vi.stubGlobal('window', {
      localStorage: localStorageMock,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  const createValidPayload = (): SaveData => ({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    gameVersion: CURRENT_GAME_VERSION,
    timestamp: Date.now(),
    player: {
      x: 12.5,
      z: -8.4,
      yaw: 1.57,
    },
    inventory: {
      fragmentsCollected: 1,
      notesCollected: 2,
      activeCompass: true,
      items: ['compass', 'shell_1'],
    },
    quest: {
      activeQuestId: 'quest_1',
      stageIndex: 2,
      completedQuestIds: [],
    },
    dialogue: {
      visitedNodeIds: ['start', 'lantern_quest'],
    },
    settings: {
      qualityPreset: 'medium',
      dayNightMode: 'dynamic',
      readableNight: false,
      masterVolume: 0.85,
      isManualQualitySelection: true,
    },
  });

  it('dovrebbe salvare e caricare correttamente uno stato di gioco valido', () => {
    const saveSys = SaveSystem.getInstance();
    const payload = createValidPayload();

    const saveSuccess = saveSys.save(payload);
    expect(saveSuccess).toBe(true);
    expect(saveSys.hasSave()).toBe(true);

    const loadResult = saveSys.load();
    expect(loadResult.success).toBe(true);
    if (loadResult.success) {
      expect(loadResult.data.player.x).toBe(12.5);
      expect(loadResult.data.player.z).toBe(-8.4);
      expect(loadResult.data.player.yaw).toBe(1.57);
      // y NON deve essere presente nel payload salvato
      expect((loadResult.data.player as unknown as { y?: number }).y).toBeUndefined();
      expect(loadResult.data.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(loadResult.data.gameVersion).toBe(CURRENT_GAME_VERSION);
      expect(loadResult.data.settings.isManualQualitySelection).toBe(true);
    }
  });

  it('dovrebbe isolare il salvataggio in uno slot dedicato se lo schemaVersion è superiore a quello corrente', () => {
    const saveSys = SaveSystem.getInstance();
    const futurePayload = {
      ...createValidPayload(),
      schemaVersion: 2, // Schema futuro (es. v0.6.0)
      gameVersion: '0.6.0',
    };

    mockStorage[STORAGE_KEYS.SAVE] = JSON.stringify(futurePayload);

    const loadResult = saveSys.load();
    expect(loadResult.success).toBe(false);
    if (!loadResult.success && loadResult.reason === 'newer_schema') {
      expect(loadResult.backupSlot).toBe(STORAGE_KEYS.FUTURE_SCHEMA_BACKUP);
      expect(mockStorage[STORAGE_KEYS.FUTURE_SCHEMA_BACKUP]).toBeDefined();
      expect(JSON.parse(mockStorage[STORAGE_KEYS.FUTURE_SCHEMA_BACKUP]).schemaVersion).toBe(2);
    } else {
      throw new Error('Doveva restituire reason: newer_schema');
    }
  });

  it('dovrebbe eseguire il backup di rotazione FIFO (max 3 slot) in caso di JSON corrotto', () => {
    const saveSys = SaveSystem.getInstance();

    // 1. Corruzione 1
    mockStorage[STORAGE_KEYS.SAVE] = '{ dati_corrotti_non_valido_1';
    const res1 = saveSys.load();
    expect(res1.success).toBe(false);
    if (!res1.success && res1.reason === 'corrupted') {
      expect(res1.backupSlot).toBe(`${STORAGE_KEYS.BACKUP_PREFIX}1`);
      expect(mockStorage[`${STORAGE_KEYS.BACKUP_PREFIX}1`]).toBe('{ dati_corrotti_non_valido_1');
    }

    // 2. Corruzione 2
    mockStorage[STORAGE_KEYS.SAVE] = '{ dati_corrotti_2';
    const res2 = saveSys.load();
    if (!res2.success && res2.reason === 'corrupted') {
      expect(res2.backupSlot).toBe(`${STORAGE_KEYS.BACKUP_PREFIX}2`);
    }

    // 3. Corruzione 3
    mockStorage[STORAGE_KEYS.SAVE] = '{ dati_corrotti_3';
    const res3 = saveSys.load();
    if (!res3.success && res3.reason === 'corrupted') {
      expect(res3.backupSlot).toBe(`${STORAGE_KEYS.BACKUP_PREFIX}3`);
    }

    // 4. Corruzione 4 (rotazione FIFO: 2 passa a 1, 3 passa a 2, nuovo in 3)
    mockStorage[STORAGE_KEYS.SAVE] = '{ dati_corrotti_4';
    const res4 = saveSys.load();
    if (!res4.success && res4.reason === 'corrupted') {
      expect(res4.backupSlot).toBe(`${STORAGE_KEYS.BACKUP_PREFIX}3`);
      expect(mockStorage[`${STORAGE_KEYS.BACKUP_PREFIX}1`]).toBe('{ dati_corrotti_2');
      expect(mockStorage[`${STORAGE_KEYS.BACKUP_PREFIX}2`]).toBe('{ dati_corrotti_3');
      expect(mockStorage[`${STORAGE_KEYS.BACKUP_PREFIX}3`]).toBe('{ dati_corrotti_4');
    }
  });

  it('dovrebbe sanificare valori invalidi o fuori range e forzare coerenza quest/inventario', () => {
    const saveSys = SaveSystem.getInstance();

    // Dati parzialmente invalidi
    const invalidCandidate = {
      schemaVersion: 1,
      player: { x: 5.0, z: -2.0, yaw: NaN },
      inventory: {
        fragmentsCollected: 0, // Incoerente con quest completata!
        items: ['valid_item', '', null, 12345], // Contiene valori spuri
      },
      quest: {
        activeQuestId: 'quest_1',
        completedQuestIds: ['quest_1'], // Quest 1 è completata
      },
      settings: {
        qualityPreset: 'invalid_quality_name',
        masterVolume: 2.5, // Fuori range [0, 1]
      },
    };

    const sanitized = saveSys.validateAndSanitize(invalidCandidate as unknown as Partial<SaveData>);
    expect(sanitized).not.toBeNull();
    if (sanitized) {
      // Yaw sanificato
      expect(sanitized.player.yaw).toBe(0);
      // Coerenza forzata: quest_1 completata -> fragmentsCollected rettificato a 1
      expect(sanitized.inventory.fragmentsCollected).toBe(1);
      // Item spuri filtrati
      expect(sanitized.inventory.items).toEqual(['valid_item']);
      // Preset ripiegato su medium
      expect(sanitized.settings.qualityPreset).toBe('medium');
      // Volume clamppato a 1.0
      expect(sanitized.settings.masterVolume).toBe(1.0);
    }
  });
});
