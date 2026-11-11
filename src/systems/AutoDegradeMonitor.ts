/**
 * Monitor per il declassamento automatico delle prestazioni grafiche (Auto-Degrade).
 * Calcola la media mobile ponderata del framerate (FPS) su una finestra mobile di 5 secondi.
 * Previene falsi positivi escludendo pause, schede in background, warm-up iniziale e benchmark.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.3.9
 */

export const AUTO_DEGRADE_CONFIG = {
  /** Soglia minima di FPS al di sotto della quale viene suggerito il declassamento */
  THRESHOLD_FPS: 28,
  /** Durata della finestra mobile di campionamento (secondi) */
  WINDOW_DURATION_SECONDS: 5.0,
  /** Durata del periodo di warm-up iniziale da ignorare (secondi) */
  WARMUP_SECONDS: 5.0,
  /** Cooldown tra degradazioni successive (secondi) */
  COOLDOWN_SECONDS: 30.0,
  /** Cooldown esteso se l'utente annulla il declassamento (secondi) */
  REVERT_COOLDOWN_SECONDS: 60.0,
  /** Cooldown prima che il suggerimento di declassamento ricompaia dopo che l'utente ha premuto Annulla */
  SUGGESTION_COOLDOWN_SECONDS: 60.0,
} as const;

export interface FpsSample {
  fps: number;
  duration: number;
}

export class AutoDegradeMonitor {
  private samples: FpsSample[] = [];
  private cooldownTimer = 0;

  /**
   * Registra un campione di framerate ed eventualmente valuta se declassare la qualità.
   *
   * @param fps Framerate calcolato nell'ultimo intervallo
   * @param duration Durata dell'intervallo campionato in secondi
   * @param isPaused Se il gioco è attualmente in pausa
   * @param isHidden Se la scheda del browser è in background
   * @param sessionTime Tempo totale trascorso dall'avvio della sessione (secondi)
   * @param isBenchmarkRunning Se è in corso un benchmark automatico
   * @returns true se la qualità grafica deve essere declassata
   */
  public recordSample(
    fps: number,
    duration: number,
    isPaused: boolean,
    isHidden: boolean,
    sessionTime: number,
    isBenchmarkRunning = false
  ): boolean {
    // 1. Esclude il periodo di warm-up iniziale
    if (sessionTime < AUTO_DEGRADE_CONFIG.WARMUP_SECONDS) {
      this.samples = [];
      return false;
    }

    // 2. Esclude se il gioco è in pausa
    if (isPaused) {
      this.samples = [];
      return false;
    }

    // 3. Esclude se la scheda è in background (throttle nativo dei browser mobile/desktop)
    if (isHidden) {
      this.samples = [];
      return false;
    }

    // 4. Esclude se è in corso un benchmark diagnostico
    if (isBenchmarkRunning) {
      this.samples = [];
      return false;
    }

    // Gestione del cooldown
    if (this.cooldownTimer > 0) {
      this.cooldownTimer = Math.max(0, this.cooldownTimer - duration);
      return false;
    }

    // Inserisce il nuovo campione nella finestra mobile
    this.samples.push({ fps, duration });

    // Rimuove i campioni più vecchi che eccedono la finestra di 5.0 secondi
    let totalDuration = this.getTotalDuration();
    while (this.samples.length > 1 && totalDuration - this.samples[0].duration >= AUTO_DEGRADE_CONFIG.WINDOW_DURATION_SECONDS) {
      const removed = this.samples.shift();
      if (removed) {
        totalDuration -= removed.duration;
      }
    }

    // Valuta la media mobile solo se abbiamo accumulato almeno 5.0 secondi di campioni validi
    if (totalDuration >= AUTO_DEGRADE_CONFIG.WINDOW_DURATION_SECONDS) {
      const averageFps = this.getWeightedAverageFps();
      if (averageFps < AUTO_DEGRADE_CONFIG.THRESHOLD_FPS) {
        // Trigger auto-degrade e avvio cooldown
        this.cooldownTimer = AUTO_DEGRADE_CONFIG.COOLDOWN_SECONDS;
        this.samples = [];
        return true;
      }
    }

    return false;
  }

  /**
   * Calcola la media mobile ponderata per la durata di ciascun campione.
   */
  public getWeightedAverageFps(): number {
    const totalDuration = this.getTotalDuration();
    if (totalDuration <= 0) return 0;
    const weightedSum = this.samples.reduce((sum, s) => sum + s.fps * s.duration, 0);
    return weightedSum / totalDuration;
  }

  public getTotalDuration(): number {
    return this.samples.reduce((sum, s) => sum + s.duration, 0);
  }

  public getCooldown(): number {
    return this.cooldownTimer;
  }

  public setCooldown(seconds: number): void {
    this.cooldownTimer = seconds;
  }

  /**
   * Chiamato quando l'utente preme "Annulla" o rifiuta temporaneamente il declassamento.
   * La scelta non è permanente: avvia un cooldown di 60 secondi (SUGGESTION_COOLDOWN_SECONDS)
   * dopodiché il suggerimento potrà ricomparire se il framerate rimane insufficiente.
   */
  public onUserCancelled(): void {
    this.cooldownTimer = AUTO_DEGRADE_CONFIG.SUGGESTION_COOLDOWN_SECONDS;
    this.samples = [];
  }

  public reset(): void {
    this.samples = [];
    this.cooldownTimer = 0;
  }
}

