/**
 * Test unitari per la progressione della densità della nebbia.
 * Verifica che triggerIslandRestoration interroghi la tabella densityByFragments
 * configurata in environment.json per 0, 1, 3 e 7 frammenti, rispettando il vincolo minDensity.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.3.9
 */

import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { Environment } from '../src/world/Environment';
import envConfig from '../src/data/environment.json';

describe('Progressione Densità Nebbia basata su Frammenti (environment.json)', () => {
  it('dovrebbe impostare la densità iniziale corretta per 0 frammenti', () => {
    const scene = new THREE.Scene();
    const env = new Environment(scene);

    env.triggerIslandRestoration(0, 7);

    const expected0 = envConfig.atmosphere.fog.densityByFragments['0'];
    expect(env.getTargetDensity()).toBeCloseTo(expected0, 5);
    expect(env.getTargetDensity()).toBeCloseTo(0.018, 5);
    expect(env.isRestored()).toBe(false);
  });

  it('dovrebbe ridurre la nebbia al primo frammento secondo la tabella (1 frammento)', () => {
    const scene = new THREE.Scene();
    const env = new Environment(scene);

    env.triggerIslandRestoration(1, 7);

    const expected1 = envConfig.atmosphere.fog.densityByFragments['1'];
    expect(env.getTargetDensity()).toBeCloseTo(expected1, 5);
    expect(env.getTargetDensity()).toBeCloseTo(0.014, 5);
    expect(env.isRestored()).toBe(true);
    expect(env.getTargetDensity()).toBeLessThan(envConfig.atmosphere.fog.initialDensity);
  });

  it('dovrebbe ridurre ulteriormente la nebbia a 3 frammenti secondo la tabella (3 frammenti)', () => {
    const scene = new THREE.Scene();
    const env = new Environment(scene);

    env.triggerIslandRestoration(3, 7);

    const expected3 = envConfig.atmosphere.fog.densityByFragments['3'];
    expect(env.getTargetDensity()).toBeCloseTo(expected3, 5);
    expect(env.getTargetDensity()).toBeCloseTo(0.010, 5);
    expect(env.getTargetDensity()).toBeLessThan(envConfig.atmosphere.fog.densityByFragments['1']);
  });

  it('dovrebbe raggiungere la minima densità a 7 frammenti (7 frammenti)', () => {
    const scene = new THREE.Scene();
    const env = new Environment(scene);

    env.triggerIslandRestoration(7, 7);

    const expected7 = envConfig.atmosphere.fog.densityByFragments['7'];
    expect(env.getTargetDensity()).toBeCloseTo(expected7, 5);
    expect(env.getTargetDensity()).toBeCloseTo(envConfig.atmosphere.fog.minDensity, 5);
    expect(env.getTargetDensity()).toBeCloseTo(0.005, 5);
  });

  it('dovrebbe non scendere mai al di sotto di minDensity anche con input anomali', () => {
    const scene = new THREE.Scene();
    const env = new Environment(scene);

    env.triggerIslandRestoration(99, 7);

    expect(env.getTargetDensity()).toBeGreaterThanOrEqual(envConfig.atmosphere.fog.minDensity);
  });
});
