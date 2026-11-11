/**
 * Test per il ciclo di vita dell'audio Web Audio (sblocco interattivo e ripristino da background).
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioSystem } from '../src/systems/AudioSystem';

describe('AudioSystem Lifecycle & Autoplay Policy', () => {
  let mockState: AudioContextState = 'suspended';
  const mockResume = vi.fn(async () => {
    mockState = 'running';
  });
  const mockSuspend = vi.fn(async () => {
    mockState = 'suspended';
  });

  const mockAudioContext = vi.fn().mockImplementation(() => ({
    get state() {
      return mockState;
    },
    currentTime: 0,
    destination: {},
    createGain: vi.fn(() => ({
      gain: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
    })),
    createOscillator: vi.fn(() => ({
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    })),
    createBufferSource: vi.fn(() => ({
      buffer: null,
      loop: false,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    })),
    createBuffer: vi.fn(() => ({
      getChannelData: vi.fn(() => new Float32Array(100)),
    })),
    createBiquadFilter: vi.fn(() => ({
      type: 'lowpass',
      frequency: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    })),
    resume: mockResume,
    suspend: mockSuspend,
  }));

  beforeEach(() => {
    mockState = 'suspended';
    mockResume.mockClear();
    mockSuspend.mockClear();
    vi.stubGlobal('AudioContext', mockAudioContext);
    vi.stubGlobal('window', {
      AudioContext: mockAudioContext,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('document', {
      visibilityState: 'visible',
      addEventListener: vi.fn(),
    });
  });

  it('rispetta la mobile autoplay policy rimanendo locked fino al primo tocco', () => {
    const audio = new AudioSystem();
    expect(audio.getIsUnlocked()).toBe(false);
    expect(audio.getContextState()).toBe('suspended');
  });

  it('sblocca l audioContext e attiva i suoni ambientali alla prima interazione', async () => {
    const audio = new AudioSystem();
    await audio.unlockAudio();

    expect(mockResume).toHaveBeenCalledTimes(1);
    expect(audio.getIsUnlocked()).toBe(true);
  });

  it('ripristina l AudioContext sospeso quando la scheda torna visibile (iOS/Android)', async () => {
    const audio = new AudioSystem();
    await audio.unlockAudio();
    expect(audio.getIsUnlocked()).toBe(true);

    // Simula passaggio in background (AudioContext sospeso dal SO mobile)
    mockState = 'suspended';
    expect(audio.getContextState()).toBe('suspended');

    // Scheda torna visibile
    await audio.handleVisibilityChange(true);

    expect(mockResume).toHaveBeenCalledTimes(2);
  });

  it('non effettua resume se l audio non era ancora mai stato sbloccato dall utente', async () => {
    const audio = new AudioSystem();
    expect(audio.getIsUnlocked()).toBe(false);

    // Torna visibile ma l'utente non ha mai interagito
    await audio.handleVisibilityChange(true);

    expect(mockResume).not.toHaveBeenCalled();
  });

  it('NON chiama resume al ritorno alla visibilità se la pausa di gioco è attiva', async () => {
    const audio = new AudioSystem();
    await audio.unlockAudio();
    expect(audio.getIsUnlocked()).toBe(true);
    expect(mockResume).toHaveBeenCalledTimes(1);

    // Mette il gioco in pausa
    audio.setPaused(true);
    expect(audio.getIsPaused()).toBe(true);

    // Simula passaggio in background
    mockState = 'suspended';

    // Ritorno alla visibilità con pausa ATTIVA
    await audio.handleVisibilityChange(true);

    // mockResume NON deve essere stato invocato una seconda volta!
    expect(mockResume).toHaveBeenCalledTimes(1);
    expect(audio.getContextState()).toBe('suspended');
  });
});
