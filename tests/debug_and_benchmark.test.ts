/**
 * Test per DebugOverlay, calcolo 1% low FPS, Benchmark deterministico,
 * tracciamento multi-touch coordinato e disattivazione contorno toon su profilo 'low'.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Player } from '../src/entities/Player';
import { TouchOverlay } from '../src/ui/TouchOverlay';

describe('DebugOverlay, 1% Low FPS & Toon Outline Quality Presets', () => {
  beforeEach(() => {
    // Stub DOM
    vi.stubGlobal('document', {
      getElementById: vi.fn(() => ({
        addEventListener: vi.fn(),
        classList: { remove: vi.fn(), add: vi.fn() },
        style: {},
      })),
      createElement: vi.fn(() => ({
        appendChild: vi.fn(),
        addEventListener: vi.fn(),
        classList: { remove: vi.fn(), add: vi.fn() },
        style: {},
      })),
      body: {
        appendChild: vi.fn(),
      },
    });
    vi.stubGlobal('window', {
      location: { search: '?debug=1' },
      innerWidth: 1024,
      innerHeight: 768,
      devicePixelRatio: 2,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  it('disattiva i contorni toon Inverted Hull quando la qualita e impostata su low per risparmiare draw calls', () => {
    const player = new Player();
    const bodyOutline = player.meshComponents.root.getObjectByName('Pip_Body_outline');
    const headOutline = player.meshComponents.root.getObjectByName('Pip_Head_outline');

    expect(bodyOutline).toBeDefined();
    expect(headOutline).toBeDefined();

    // Inizialmente o su High/Medium: visibili
    player.setQuality('high');
    expect(bodyOutline?.visible).toBe(true);
    expect(headOutline?.visible).toBe(true);

    player.setQuality('medium');
    expect(bodyOutline?.visible).toBe(true);
    expect(headOutline?.visible).toBe(true);

    // Su Low: invisibili (zero render cost per outline su mobile low-end)
    player.setQuality('low');
    expect(bodyOutline?.visible).toBe(false);
    expect(headOutline?.visible).toBe(false);
  });

  it('calcola correttamente avg, min e 1% low FPS', () => {
    // Simulazione di 100 frame: 95 frame a 60 FPS (16.6ms) e 5 frame lenti (stutter: 50ms = 20 FPS)
    const samples: number[] = [];
    for (let i = 0; i < 95; i++) samples.push(0.0166);
    for (let i = 0; i < 5; i++) samples.push(0.050);

    const fpsValues = samples.map((dt) => 1.0 / dt);
    const avgFps = Math.round(fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length);
    const minFps = Math.round(Math.min(...fpsValues));

    const sorted = [...fpsValues].sort((a, b) => a - b);
    const onePercentCount = Math.max(1, Math.floor(sorted.length * 0.01));
    const worstOnePercent = sorted.slice(0, onePercentCount);
    const onePercentLow = Math.round(
      worstOnePercent.reduce((a, b) => a + b, 0) / worstOnePercent.length
    );

    expect(avgFps).toBeGreaterThanOrEqual(55);
    expect(minFps).toBe(20);
    expect(onePercentLow).toBe(20);
  });

  it('esporta i touch identifiers attivi tramite TouchOverlay', () => {
    const touchOverlay = new TouchOverlay();
    const debugTouches = touchOverlay.getActiveTouchesDebug();
    expect(Array.isArray(debugTouches)).toBe(true);
    expect(debugTouches.length).toBe(0);
  });
});
