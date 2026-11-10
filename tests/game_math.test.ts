/**
 * Test per funzioni matematiche di movimento e telecamera.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.1.0
 */

import { describe, it, expect } from 'vitest';

describe('Matematica di Gioco e Vettori', () => {
  it('dovrebbe normalizzare i vettori di input a lunghezza massima 1.0', () => {
    const rawX = 1.0;
    const rawZ = 1.0;
    const len = Math.sqrt(rawX * rawX + rawZ * rawZ);

    let normX = rawX;
    let normZ = rawZ;
    if (len > 1.0) {
      normX /= len;
      normZ /= len;
    }

    const finalLength = Math.sqrt(normX * normX + normZ * normZ);
    expect(finalLength).toBeCloseTo(1.0, 5);
  });

  it('dovrebbe limitare correttamente il pitch della telecamera tra i limiti stabiliti', () => {
    const minPitch = -0.1;
    const maxPitch = 1.25;

    const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

    expect(clamp(-0.5, minPitch, maxPitch)).toBe(minPitch);
    expect(clamp(2.0, minPitch, maxPitch)).toBe(maxPitch);
    expect(clamp(0.5, minPitch, maxPitch)).toBe(0.5);
  });

  it('dovrebbe calcolare la differenza angolare minima per la rotazione del personaggio', () => {
    const normalizeAngleDiff = (target: number, current: number) =>
      Math.atan2(Math.sin(target - current), Math.cos(target - current));

    // Rotazione da 350 gradi (~6.10 rad) a 10 gradi (~0.17 rad): la via più breve è +20 gradi (+0.35 rad)
    const current = (350 * Math.PI) / 180;
    const target = (10 * Math.PI) / 180;
    const diff = normalizeAngleDiff(target, current);

    expect(diff).toBeGreaterThan(0);
    expect(diff).toBeCloseTo((20 * Math.PI) / 180, 4);
  });
});
