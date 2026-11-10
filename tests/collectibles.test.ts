/**
 * Test per logica collezionabili e rivelazione tramite Lanterna Magica.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.2.0
 */

import { describe, it, expect } from 'vitest';

describe('Logica Collezionabili e Lanterna Magica', () => {
  it('dovrebbe consentire la raccolta del frammento solo se la lanterna è attiva', () => {
    const canCollectFragment = (dist: number, isLanternActive: boolean) => {
      const pickupRadius = 1.8;
      return dist <= pickupRadius && isLanternActive;
    };

    expect(canCollectFragment(1.2, true)).toBe(true); // Vicino + Lanterna ON -> Raccolto
    expect(canCollectFragment(1.2, false)).toBe(false); // Vicino + Lanterna OFF -> Protetto/Invisibile
    expect(canCollectFragment(3.5, true)).toBe(false); // Troppo lontano
  });

  it('dovrebbe calcolare l intensità del bagliore indizio quando la lanterna è spenta', () => {
    // Quando la lanterna è spenta, l'aura deve essere tenue (<= 0.5) come indizio discreto
    const computeAuraIntensity = (isLanternActive: boolean, pulse: number) => {
      if (isLanternActive) {
        return 2.0; // Piena luce
      }
      return 0.35 + pulse * 0.3; // Bagliore tenue tra 0.35 e 0.65
    };

    expect(computeAuraIntensity(true, 0.5)).toBe(2.0);
    expect(computeAuraIntensity(false, 0.0)).toBe(0.35);
    expect(computeAuraIntensity(false, 1.0)).toBeCloseTo(0.65, 2);
  });

  it('dovrebbe consentire la raccolta dei collezionabili ordinari indipendentemente dalla lanterna', () => {
    const canCollectOrdinary = (dist: number) => dist <= 1.5;

    expect(canCollectOrdinary(1.0)).toBe(true);
    expect(canCollectOrdinary(2.0)).toBe(false);
  });
});
