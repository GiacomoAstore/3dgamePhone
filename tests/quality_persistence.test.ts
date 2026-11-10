/**
 * Test per QualitySettingsUI: rilevamento profilo iniziale, persistenza su localStorage
 * e meccanismo di abbassamento automatico per framerate basso (Regola utente 6 e 8).
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QualitySettingsUI, SavedSettings } from '../src/ui/QualitySettingsUI';
import { AudioSystem } from '../src/systems/AudioSystem';
import { DayNightCycle } from '../src/systems/DayNightCycle';

describe('QualitySettingsUI Persistence & Auto-Degrade', () => {
  let audioSystem: AudioSystem;
  let dayNightCycle: DayNightCycle;
  const onQualityChange = vi.fn();

  // Mock localStorage per il runtime di test
  const storageMock: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: vi.fn((key: string) => storageMock[key] || null),
    setItem: vi.fn((key: string, val: string) => {
      storageMock[key] = val;
    }),
    removeItem: vi.fn((key: string) => {
      delete storageMock[key];
    }),
    clear: vi.fn(() => {
      for (const k in storageMock) delete storageMock[k];
    }),
  };

  beforeEach(() => {
    vi.stubGlobal('localStorage', mockLocalStorage);
    mockLocalStorage.clear();
    onQualityChange.mockClear();

    audioSystem = new AudioSystem();
    dayNightCycle = new DayNightCycle();
  });

  it('rileva il profilo ottimale high su ambienti desktop standard', () => {
    const optimal = QualitySettingsUI.detectOptimalQuality();
    expect(['high', 'medium']).toContain(optimal);
  });

  it('esegue l abbassamento a gradini da high a medium a low', () => {
    const ui = new QualitySettingsUI({
      audioSystem,
      dayNightCycle,
      onQualityChange,
    });

    ui.selectQuality('high', false);
    expect(ui.getCurrentQuality()).toBe('high');

    // Primo degrado: high -> medium
    const step1 = ui.autoDegradeQuality();
    expect(step1).toBe('medium');
    expect(ui.getCurrentQuality()).toBe('medium');

    // Secondo degrado: medium -> low
    const step2 = ui.autoDegradeQuality();
    expect(step2).toBe('low');
    expect(ui.getCurrentQuality()).toBe('low');

    // Terzo degrado: low è già il minimo, restituisce null (mai risalita automatica)
    const step3 = ui.autoDegradeQuality();
    expect(step3).toBeNull();
    expect(ui.getCurrentQuality()).toBe('low');
  });

  it('permette di annullare la degradazione automatica tornando al profilo precedente', () => {
    const ui = new QualitySettingsUI({
      audioSystem,
      dayNightCycle,
      onQualityChange,
    });

    ui.selectQuality('high', false);
    expect(ui.getCurrentQuality()).toBe('high');

    // Auto-degrade a medium
    const step = ui.autoDegradeQuality();
    expect(step).toBe('medium');
    expect(ui.getCurrentQuality()).toBe('medium');

    // L'utente preme Annulla -> revertQualityDrop
    const restored = ui.revertQualityDrop();
    expect(restored).toBe('high');
    expect(ui.getCurrentQuality()).toBe('high');

    // Se non ci sono altre degradazioni recenti, revert restituisce null
    expect(ui.revertQualityDrop()).toBeNull();
  });

  it('salva e ricarica le impostazioni da localStorage', () => {
    const fakeSettings: SavedSettings = {
      quality: 'medium',
      masterVol: 0.6,
      ambientVol: 0.4,
      sfxVol: 0.7,
      isHourLocked: true,
      readableNight: true,
      smoothTransitions: false,
    };
    mockLocalStorage.setItem('brumavento_settings', JSON.stringify(fakeSettings));

    const loaded = QualitySettingsUI.loadSettings();
    expect(loaded).not.toBeNull();
    expect(loaded?.quality).toBe('medium');
    expect(loaded?.isHourLocked).toBe(true);

    // Inizializzando la UI, le preferenze caricate vengono applicate
    const ui = new QualitySettingsUI({
      audioSystem,
      dayNightCycle,
      onQualityChange,
    });

    expect(ui.getCurrentQuality()).toBe('medium');
    expect(dayNightCycle.getIsHourLocked()).toBe(true);
  });
});
