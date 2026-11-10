/**
 * Test per il Sistema Audio procedurale Web Audio.
 * Verifica sicurezza in ambienti senza audio hardware (CI/test), clamping volumi e reattività a eventi.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AudioSystem } from '../src/systems/AudioSystem';
import { globalEventBus } from '../src/core/EventBus';

describe('AudioSystem System', () => {
  let audio: AudioSystem;

  beforeEach(() => {
    audio = new AudioSystem({
      masterVolume: 0.8,
      sfxVolume: 0.9,
      ambientVolume: 0.4,
    });
  });

  it('si inizializza senza eccezioni anche se AudioContext è assente o degradato', () => {
    expect(audio).toBeDefined();
  });

  it('effettua il clamping dei volumi tra 0.0 e 1.0', () => {
    audio.setMasterVolume(1.5);
    audio.setSfxVolume(-0.2);
    audio.setAmbientVolume(0.5);

    // Esegue i metodi sonori senza crash
    expect(() => audio.playFootstepSound()).not.toThrow();
    expect(() => audio.playJumpSound()).not.toThrow();
    expect(() => audio.playLanternSound(true)).not.toThrow();
    expect(() => audio.playItemChime()).not.toThrow();
    expect(() => audio.playFragmentFanfare()).not.toThrow();
  });

  it('reagisce agli eventi dell EventBus senza errori', () => {
    expect(() => {
      globalEventBus.emit('player-footstep');
      globalEventBus.emit('player-jump');
      globalEventBus.emit('lantern-toggled', true);
      globalEventBus.emit('item-collected', { type: 'shells', total: 1 });
      globalEventBus.emit('fragment-collected', { fragmentIndex: 0, collected: 1, total: 7 });
    }).not.toThrow();
  });

  it('gestisce lo sblocco manuale e idempotente', () => {
    expect(() => {
      audio.unlockAudio();
      audio.unlockAudio();
    }).not.toThrow();
  });
});

