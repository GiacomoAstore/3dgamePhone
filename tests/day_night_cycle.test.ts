/**
 * Test per il sistema del Ciclo Giorno / Notte e calcolo corpi celesti.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DayNightCycle } from '../src/systems/DayNightCycle';

describe('DayNightCycle System', () => {
  let cycle: DayNightCycle;

  beforeEach(() => {
    // Ciclo accelerato per i test: 240 secondi per un'intera giornata, ora iniziale 12:00
    cycle = new DayNightCycle({
      cycleDurationSeconds: 240,
      initialHour: 12.0,
    });
  });

  it('inizializza correttamente ora e fase iniziale (mezzogiorno = day)', () => {
    expect(cycle.getHour()).toBeCloseTo(12.0);
    expect(cycle.getPhase()).toBe('day');
  });

  it('avanza il tempo in modo proporzionale al delta time', () => {
    // 10 secondi a 240s/giorno -> 10 * (24 / 240) = 1.0 ora
    cycle.update(10);
    expect(cycle.getHour()).toBeCloseTo(13.0);
  });

  it('identifica le quattro fasi del giorno correttamente', () => {
    cycle.setHour(6.5);
    expect(cycle.getPhase()).toBe('dawn');

    cycle.setHour(12.0);
    expect(cycle.getPhase()).toBe('day');

    cycle.setHour(19.0);
    expect(cycle.getPhase()).toBe('sunset');

    cycle.setHour(23.0);
    expect(cycle.getPhase()).toBe('night');

    cycle.setHour(2.0);
    expect(cycle.getPhase()).toBe('night');
  });

  it('calcola posizioni del Sole e della Luna diametralmente opposte', () => {
    cycle.setHour(12.0);
    const sunPosNoon = cycle.getSunPosition();
    const moonPosNoon = cycle.getMoonPosition();

    // A mezzogiorno il Sole è alto nel cielo (+y) e la Luna è sotto l'orizzonte (-y)
    expect(sunPosNoon.y).toBeGreaterThan(0);
    expect(moonPosNoon.y).toBeLessThan(0);
    expect(sunPosNoon.x).toBeCloseTo(-moonPosNoon.x);
    expect(sunPosNoon.y).toBeCloseTo(-moonPosNoon.y);
    expect(sunPosNoon.z).toBeCloseTo(-moonPosNoon.z);

    // A mezzanotte la situazione si inverte
    cycle.setHour(0.0);
    const sunPosMidnight = cycle.getSunPosition();
    const moonPosMidnight = cycle.getMoonPosition();

    expect(sunPosMidnight.y).toBeLessThan(0);
    expect(moonPosMidnight.y).toBeGreaterThan(0);
  });

  it('calcola intensità luminose coerenti tra sole e luna', () => {
    // Mezzogiorno: intensità solare alta, lunare zero
    cycle.setHour(12.0);
    expect(cycle.getSunIntensity()).toBeGreaterThan(1.0);
    expect(cycle.getMoonIntensity()).toBe(0.0);

    // Mezzanotte: intensità solare zero, intensità lunare attiva
    cycle.setHour(0.0);
    expect(cycle.getSunIntensity()).toBe(0.0);
    expect(cycle.getMoonIntensity()).toBeGreaterThan(0.0);
  });

  it('interpola il colore del cielo senza produrre NaN', () => {
    for (let h = 0; h < 24; h += 0.5) {
      cycle.setHour(h);
      const skyCol = cycle.getInterpolatedSkyColor(false);
      expect(Number.isNaN(skyCol.r)).toBe(false);
      expect(Number.isNaN(skyCol.g)).toBe(false);
      expect(Number.isNaN(skyCol.b)).toBe(false);
      expect(skyCol.r).toBeGreaterThanOrEqual(0);
      expect(skyCol.r).toBeLessThanOrEqual(1);
    }
  });

  it('serializza e deserializza lo stato POJO', () => {
    cycle.setHour(16.5);
    const state = cycle.serializeState();
    expect(state.currentHour).toBeCloseTo(16.5);
    expect(state.phase).toBe('day');

    const newCycle = new DayNightCycle();
    newCycle.deserializeState(state);
    expect(newCycle.getHour()).toBeCloseTo(16.5);
  });
});

