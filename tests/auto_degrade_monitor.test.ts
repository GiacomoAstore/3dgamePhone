/**
 * Test unitari per il sistema di Auto-Degrade e monitoraggio FPS su media mobile.
 * Verifica che la soglia sia 28 FPS su finestra di 5 secondi, che escluda pause,
 * schede nascoste, warm-up e che non declassi un dispositivo stabile a 30 FPS.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.3.9
 */

import { describe, it, expect } from 'vitest';
import {
  AutoDegradeMonitor,
  AUTO_DEGRADE_CONFIG,
} from '../src/systems/AutoDegradeMonitor';

describe('AutoDegradeMonitor (Media Mobile 5s e Soglia 28 FPS)', () => {
  it('dovrebbe avere costanti configurate secondo le specifiche vincolanti', () => {
    expect(AUTO_DEGRADE_CONFIG.THRESHOLD_FPS).toBe(28);
    expect(AUTO_DEGRADE_CONFIG.WINDOW_DURATION_SECONDS).toBe(5.0);
    expect(AUTO_DEGRADE_CONFIG.WARMUP_SECONDS).toBe(5.0);
    expect(AUTO_DEGRADE_CONFIG.COOLDOWN_SECONDS).toBe(30.0);
    expect(AUTO_DEGRADE_CONFIG.REVERT_COOLDOWN_SECONDS).toBe(60.0);
  });

  it('NON dovrebbe declassare un dispositivo stabile a 30 FPS (con lievi fluttuazioni a 29-30)', () => {
    const monitor = new AutoDegradeMonitor();

    // Simula 10 secondi di sessione attiva oltre il warm-up
    let triggered = false;
    for (let t = 5.0; t <= 15.0; t += 0.5) {
      // Alterna 30 FPS e 29 FPS (media ~29.5 FPS >= 28 FPS)
      const fps = t % 1.0 === 0 ? 30 : 29;
      if (monitor.recordSample(fps, 0.5, false, false, t)) {
        triggered = true;
      }
    }

    expect(triggered).toBe(false);
    expect(monitor.getWeightedAverageFps()).toBeGreaterThanOrEqual(28);
  });

  it('NON dovrebbe declassare durante il warm-up iniziale (< 5.0 secondi)', () => {
    const monitor = new AutoDegradeMonitor();

    // FPS molto bassi (15 FPS), ma nei primi 4.5 secondi di avvio
    let triggered = false;
    for (let t = 0.5; t < 5.0; t += 0.5) {
      if (monitor.recordSample(15, 0.5, false, false, t)) {
        triggered = true;
      }
    }

    expect(triggered).toBe(false);
    expect(monitor.getTotalDuration()).toBe(0); // Nessun campione accumulato durante il warm-up
  });

  it('NON dovrebbe declassare se il gioco è in pausa', () => {
    const monitor = new AutoDegradeMonitor();

    // 10 secondi a 18 FPS, ma con isPaused = true
    let triggered = false;
    for (let t = 6.0; t <= 16.0; t += 0.5) {
      if (monitor.recordSample(18, 0.5, true, false, t)) {
        triggered = true;
      }
    }

    expect(triggered).toBe(false);
    expect(monitor.getTotalDuration()).toBe(0);
  });

  it('NON dovrebbe declassare se la scheda è in background (document.hidden)', () => {
    const monitor = new AutoDegradeMonitor();

    // 10 secondi a 10 FPS (throttle tipico del browser), ma con isHidden = true
    let triggered = false;
    for (let t = 6.0; t <= 16.0; t += 0.5) {
      if (monitor.recordSample(10, 0.5, false, true, t)) {
        triggered = true;
      }
    }

    expect(triggered).toBe(false);
    expect(monitor.getTotalDuration()).toBe(0);
  });

  it('NON dovrebbe declassare se è in corso un benchmark automatico', () => {
    const monitor = new AutoDegradeMonitor();

    let triggered = false;
    for (let t = 6.0; t <= 16.0; t += 0.5) {
      if (monitor.recordSample(15, 0.5, false, false, t, true)) {
        triggered = true;
      }
    }

    expect(triggered).toBe(false);
  });

  it('DOVREBBE declassare se la media mobile su 5.0s è persistentemente sotto 28 FPS', () => {
    const monitor = new AutoDegradeMonitor();

    let triggered = false;
    let triggerTime = 0;
    let cooldownAtTrigger = 0;

    // Simula FPS persistentemente a 24-25 FPS (media ~24.5 FPS < 28 FPS)
    for (let t = 5.0; t <= 12.0; t += 0.5) {
      const fps = t % 1.0 === 0 ? 25 : 24;
      const res = monitor.recordSample(fps, 0.5, false, false, t);
      if (res && !triggered) {
        triggered = true;
        triggerTime = t;
        cooldownAtTrigger = monitor.getCooldown();
        break;
      }
    }

    expect(triggered).toBe(true);
    // Scatta non appena sono stati accumulati 10 campioni da 0.5s (t = 5.0 a 9.5, totale 5.0s)
    expect(triggerTime).toBe(9.5);
    // Deve avviare il cooldown di 30 secondi
    expect(cooldownAtTrigger).toBe(AUTO_DEGRADE_CONFIG.COOLDOWN_SECONDS);
  });

  it('dovrebbe rispettare il cooldown di 30 secondi prima di consentire una seconda degradazione', () => {
    const monitor = new AutoDegradeMonitor();

    // Scatena la prima degradazione a t = 9.5 (dopo 5s di campionamento)
    for (let t = 5.0; t <= 9.5; t += 0.5) {
      monitor.recordSample(20, 0.5, false, false, t);
    }
    expect(monitor.getCooldown()).toBe(30.0);

    // Continua a girare a 20 FPS durante il cooldown di 30 secondi
    let secondTrigger = false;
    for (let t = 10.0; t < 39.5; t += 0.5) {
      if (monitor.recordSample(20, 0.5, false, false, t)) {
        secondTrigger = true;
      }
    }
    // Nessuna seconda degradazione durante il cooldown
    expect(secondTrigger).toBe(false);

    // Trascorsi i 30 secondi di cooldown e una nuova finestra di 5 secondi
    for (let t = 40.0; t <= 45.0; t += 0.5) {
      if (monitor.recordSample(20, 0.5, false, false, t)) {
        secondTrigger = true;
      }
    }
    expect(secondTrigger).toBe(true);
  });

  it('dovrebbe far tornare il suggerimento dopo SUGGESTION_COOLDOWN_SECONDS (60s) se l utente preme Annulla', () => {
    const monitor = new AutoDegradeMonitor();

    // Prima degradazione a t = 9.5
    for (let t = 5.0; t <= 9.5; t += 0.5) {
      monitor.recordSample(20, 0.5, false, false, t);
    }
    // L'utente preme "Annulla": non è permanente, imposta cooldown di 60s
    monitor.onUserCancelled();
    expect(monitor.getCooldown()).toBe(AUTO_DEGRADE_CONFIG.SUGGESTION_COOLDOWN_SECONDS);
    expect(AUTO_DEGRADE_CONFIG.SUGGESTION_COOLDOWN_SECONDS).toBe(60.0);

    // Durante i successivi 60 secondi (da t=10 a t=69.5), nessun suggerimento
    let cancelledTrigger = false;
    for (let t = 10.0; t < 69.5; t += 0.5) {
      if (monitor.recordSample(20, 0.5, false, false, t)) {
        cancelledTrigger = true;
      }
    }
    expect(cancelledTrigger).toBe(false);

    // Trascorsi i 60 secondi di cooldown + la finestra di 5 secondi (da t=70.0 a 75.0)
    for (let t = 70.0; t <= 75.0; t += 0.5) {
      if (monitor.recordSample(20, 0.5, false, false, t)) {
        cancelledTrigger = true;
      }
    }
    // Il suggerimento ritorna regolarmente!
    expect(cancelledTrigger).toBe(true);
  });
});
