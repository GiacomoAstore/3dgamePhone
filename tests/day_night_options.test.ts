/**
 * Test per le opzioni avanzate del Ciclo Giorno / Notte:
 * - Blocco dell'ora e variazione velocità (time scale)
 * - Modalità notti leggibili su schermi piccoli (readable night)
 * - Smorzamento transizioni luminose (smooth transitions)
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DayNightCycle } from '../src/systems/DayNightCycle';

describe('DayNightCycle Advanced Options', () => {
  let cycle: DayNightCycle;

  beforeEach(() => {
    cycle = new DayNightCycle({
      cycleDurationSeconds: 240, // 240s = 24h -> 1 ora ogni 10s
      initialHour: 10.0,
      readableNight: true,
      smoothTransitions: true,
    });
  });

  it('blocca l avanzamento dell ora quando isHourLocked è true', () => {
    cycle.setHourLocked(true);
    cycle.update(20); // 20s normalmente avanzerebbero di 2 ore

    expect(cycle.getHour()).toBeCloseTo(10.0);
    expect(cycle.getIsHourLocked()).toBe(true);

    cycle.setHourLocked(false);
    cycle.update(20);
    expect(cycle.getHour()).toBeCloseTo(12.0);
  });

  it('rallenta l avanzamento del tempo se timeScale è inferiore a 1', () => {
    cycle.setTimeScale(0.5); // Mezza velocità: 1 ora ogni 20 secondi
    cycle.update(10); // 10s a mezza velocità = 0.5 ore

    expect(cycle.getHour()).toBeCloseTo(10.5);
  });

  it('fornisce luce ambientale notturna più alta in modalità readableNight', () => {
    cycle.setHour(0.0); // Mezzanotte

    // Notti leggibili abilitate (default)
    cycle.setReadableNight(true);
    cycle.setSmoothTransitions(false);
    const ambientReadable = cycle.getAmbientIntensity();
    expect(ambientReadable).toBe(0.65);

    // Notti standard (più scure)
    cycle.setReadableNight(false);
    const ambientDark = cycle.getAmbientIntensity();
    expect(ambientDark).toBe(0.35);

    expect(ambientReadable).toBeGreaterThan(ambientDark);
  });

  it('smorza le variazioni di luce nel ciclo naturale se smoothTransitions è abilitato', () => {
    cycle.setHour(16.0); // Pieno pomeriggio
    cycle.setSmoothTransitions(true);
    cycle.update(0.016);
    const startIntensity = cycle.getSunIntensity();
    expect(startIntensity).toBeGreaterThan(0.8);

    // Avanza di 20 secondi (2 ore) verso il tramonto
    cycle.update(20);
    const intensityDuringTransition = cycle.getSunIntensity();

    // L'intensità degrada dolcemente con lo smorzamento
    expect(intensityDuringTransition).toBeLessThan(startIntensity);
    expect(intensityDuringTransition).toBeGreaterThanOrEqual(0);
  });

  it('serializza e deserializza tutte le opzioni persistenti', () => {
    cycle.setHour(21.5);
    cycle.setTimeScale(0.5);
    cycle.setHourLocked(true);
    cycle.setReadableNight(false);

    const state = cycle.serializeState();
    expect(state.currentHour).toBeCloseTo(21.5);
    expect(state.timeScale).toBe(0.5);
    expect(state.isHourLocked).toBe(true);
    expect(state.readableNight).toBe(false);

    const newCycle = new DayNightCycle();
    newCycle.deserializeState(state);

    expect(newCycle.getHour()).toBeCloseTo(21.5);
    expect(newCycle.getTimeScale()).toBe(0.5);
    expect(newCycle.getIsHourLocked()).toBe(true);
    expect(newCycle.getReadableNight()).toBe(false);
  });
});
