/**
 * Test per il Sistema Particellare unificato (Lucciole, Polline, Spuma, Stelle).
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../src/world/ParticleSystem';

describe('ParticleSystem System', () => {
  let particles: ParticleSystem;

  beforeEach(() => {
    particles = new ParticleSystem();
  });

  it('inizializza il sistema con esattamente 750 particelle massime in un unico Points', () => {
    expect(particles.points).toBeDefined();
    expect(particles.getActiveCount()).toBe(750);
    expect(particles.geometry.attributes.position.count).toBe(750);
    expect(particles.geometry.attributes.color.count).toBe(750);
  });

  it('scala il numero di particelle attive in base al preset grafico', () => {
    particles.setQuality('low');
    expect(particles.getActiveCount()).toBe(250);
    expect(particles.geometry.drawRange.count).toBe(250);

    particles.setQuality('medium');
    expect(particles.getActiveCount()).toBe(500);
    expect(particles.geometry.drawRange.count).toBe(500);

    particles.setQuality('high');
    expect(particles.getActiveCount()).toBe(750);
    expect(particles.geometry.drawRange.count).toBe(750);
  });

  it('aggiorna le particelle nel tempo senza generare valori NaN o infiniti', () => {
    // Esegue diversi cicli di update sia di giorno che di notte
    for (let i = 0; i < 20; i++) {
      particles.update(0.016, i % 2 === 0);
    }

    const posAttr = particles.geometry.attributes.position;
    const colAttr = particles.geometry.attributes.color;

    for (let i = 0; i < particles.getActiveCount(); i++) {
      expect(Number.isNaN(posAttr.getX(i))).toBe(false);
      expect(Number.isNaN(posAttr.getY(i))).toBe(false);
      expect(Number.isNaN(posAttr.getZ(i))).toBe(false);

      expect(Number.isNaN(colAttr.getX(i))).toBe(false);
      expect(Number.isNaN(colAttr.getY(i))).toBe(false);
      expect(Number.isNaN(colAttr.getZ(i))).toBe(false);
    }
  });

  it('disattiva visivamente le stelle durante il giorno (luminosità 0)', () => {
    // Aggiornamento diurno
    particles.update(0.1, false);

    const colAttr = particles.geometry.attributes.color;
    // Le ultime 150 particelle sono le stelle (da indice 600 a 749)
    const starIndex = 650;
    expect(colAttr.getX(starIndex)).toBe(0);
    expect(colAttr.getY(starIndex)).toBe(0);
    expect(colAttr.getZ(starIndex)).toBe(0);

    // Aggiornamento notturno: le stelle brillano
    particles.update(0.1, true);
    expect(colAttr.getX(starIndex)).toBeGreaterThan(0);
    expect(colAttr.getY(starIndex)).toBeGreaterThan(0);
    expect(colAttr.getZ(starIndex)).toBeGreaterThan(0);
  });
});

