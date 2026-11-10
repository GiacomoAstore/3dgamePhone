/**
 * Test per AudioSystem: caricamento file audio esterni con ripiego procedurale.
 * Verifica che file inesistenti o errori di rete non causino crash e attivino
 * automaticamente il generatore sonoro procedurale (Regola utente 3).
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioSystem } from '../src/systems/AudioSystem';

describe('AudioSystem Audio File Support & Procedural Fallback', () => {
  let audio: AudioSystem;

  beforeEach(() => {
    audio = new AudioSystem({
      masterVolume: 0.8,
      sfxVolume: 0.8,
      ambientVolume: 0.5,
    });
  });

  it('esegue il ripiego procedurale se il file musicale non è reperibile', async () => {
    const fallbackSpy = vi.fn();

    const success = await audio.playMusicTrack(
      '/assets/music/non_existent_theme.ogg',
      fallbackSpy
    );

    expect(success).toBe(false);
    expect(fallbackSpy).toHaveBeenCalledOnce();
  });

  it('utilizza il fallback procedurale di default (brezza marina) se non viene passato un callback specifico', async () => {
    const seaBreezeSpy = vi.spyOn(audio, 'startSeaBreezeAmbient').mockImplementation(() => {});

    const success = await audio.playMusicTrack('/assets/music/non_existent_theme.mp3');

    expect(success).toBe(false);
    expect(seaBreezeSpy).toHaveBeenCalled();
  });

  it('esegue il fallback procedurale per un effetto sonoro non disponibile', async () => {
    const sfxFallbackSpy = vi.fn();

    const success = await audio.playSoundFile(
      '/assets/sounds/missing_chime.ogg',
      sfxFallbackSpy
    );

    expect(success).toBe(false);
    expect(sfxFallbackSpy).toHaveBeenCalledOnce();
  });

  it('gestisce lo stop della traccia senza eccezioni anche se nulla è in riproduzione', () => {
    expect(() => audio.stopMusicTrack()).not.toThrow();
  });
});
