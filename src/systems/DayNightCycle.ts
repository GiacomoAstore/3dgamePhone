/**
 * Gestione del Ciclo Giorno / Notte con orbita di Sole e Luna e color grading d'atmosfera.
 * Include opzioni per:
 * - Blocco dell'ora e rallentamento della velocità (time scale)
 * - Notti leggibili su schermi piccoli (readable night mode con luce ambientale potenziata)
 * - Transizioni morbide per evitare cambi di luce bruschi
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.0
 */

import * as THREE from 'three';
import { globalEventBus } from '../core/EventBus';

export type TimeOfDayPhase = 'dawn' | 'day' | 'sunset' | 'night';

export interface DayNightConfig {
  cycleDurationSeconds: number; // Durata di un giorno completo (es. 480s = 8 minuti)
  initialHour: number; // Ora iniziale (0.0 - 24.0, es. 10.5 = 10:30)
  timeScale?: number; // Moltiplicatore di velocità (default: 1.0)
  readableNight?: boolean; // Notti più chiare per schermi piccoli (default: true)
  smoothTransitions?: boolean; // Smorzamento cambi di luce (default: true)
}

export interface DayNightOptionsState {
  currentHour: number;
  phase: TimeOfDayPhase;
  timeScale: number;
  isHourLocked: boolean;
  readableNight: boolean;
  smoothTransitions: boolean;
}

export class DayNightCycle {
  private cycleDuration = 480; // 8 minuti per un'intera giornata
  private currentHour = 10.5; // Inizia a metà mattina
  private timeScale = 1.0;
  private isHourLocked = false;
  private isPaused = false;

  // Opzioni di accessibilità visiva
  private readableNight = true;
  private smoothTransitions = true;

  // Valori smorzati per transizioni morbide
  private dampedSunIntensity = 1.4;
  private dampedAmbientIntensity = 1.1;

  private sunOrbitalRadius = 55;

  // Palette orarie per il cielo e la nebbia
  private colors = {
    dawnSky: new THREE.Color(0xf4a261), // Rosa antico / pesca
    dawnFog: new THREE.Color(0xf6bd60),
    daySky: new THREE.Color(0x8ecae6), // Turchese vivo solare
    dayFog: new THREE.Color(0xa3b8cc),
    sunsetSky: new THREE.Color(0xe76f51), // Arancio corallo caldo
    sunsetFog: new THREE.Color(0xd97757),
    nightSky: new THREE.Color(0x111c2e), // Blu notte profondo
    nightSkyReadable: new THREE.Color(0x1e2e47), // Blu notte leggibile su smartphone
    nightFog: new THREE.Color(0x182436),
  };

  constructor(config?: Partial<DayNightConfig>) {
    if (config?.cycleDurationSeconds) this.cycleDuration = Math.max(30, config.cycleDurationSeconds);
    if (config?.initialHour !== undefined) this.currentHour = (config.initialHour + 24) % 24;
    if (config?.timeScale !== undefined) this.timeScale = Math.max(0.1, config.timeScale);
    if (config?.readableNight !== undefined) this.readableNight = config.readableNight;
    if (config?.smoothTransitions !== undefined) this.smoothTransitions = config.smoothTransitions;
  }

  /**
   * Avanza il tempo nel ciclo giorno/notte tenendo conto di pause, blocco e scala temporale.
   * @param dt Delta time in secondi.
   */
  public update(dt: number): void {
    if (this.isPaused || this.isHourLocked) return;

    // Incrementa l'ora: (24 ore / durataCicloInSecondi) * dt * timeScale
    const hoursPerSecond = (24.0 / this.cycleDuration) * this.timeScale;
    this.currentHour = (this.currentHour + hoursPerSecond * dt) % 24.0;

    // Aggiorna valori smorzati con decadimento esponenziale stabile (anti-overshoot)
    if (this.smoothTransitions) {
      const targetSun = this.calculateRawSunIntensity();
      const targetAmbient = this.calculateRawAmbientIntensity();
      const blend = 1.0 - Math.exp(-2.5 * dt);
      this.dampedSunIntensity = THREE.MathUtils.lerp(this.dampedSunIntensity, targetSun, blend);
      this.dampedAmbientIntensity = THREE.MathUtils.lerp(this.dampedAmbientIntensity, targetAmbient, blend);
    } else {
      this.dampedSunIntensity = this.calculateRawSunIntensity();
      this.dampedAmbientIntensity = this.calculateRawAmbientIntensity();
    }
  }

  /**
   * Calcola la fase oraria corrente.
   */
  public getPhase(): TimeOfDayPhase {
    if (this.currentHour >= 5.0 && this.currentHour < 8.0) return 'dawn';
    if (this.currentHour >= 8.0 && this.currentHour < 17.5) return 'day';
    if (this.currentHour >= 17.5 && this.currentHour < 20.5) return 'sunset';
    return 'night';
  }

  /**
   * Calcola la posizione tridimensionale del Sole lungo l'arco celeste.
   */
  public getSunPosition(): THREE.Vector3 {
    // 0h: nadir (-y), 6h: est (+x), 12h: zenit (+y), 18h: ovest (-x)
    const angle = ((this.currentHour - 6.0) / 24.0) * Math.PI * 2;
    const x = Math.cos(angle) * this.sunOrbitalRadius;
    const y = Math.sin(angle) * this.sunOrbitalRadius;
    const z = Math.sin(angle * 0.5) * 15.0; // Inclinazione equatoriale
    return new THREE.Vector3(x, y, z);
  }

  /**
   * Calcola la posizione tridimensionale della Luna (opposta al Sole).
   */
  public getMoonPosition(): THREE.Vector3 {
    const sunPos = this.getSunPosition();
    return new THREE.Vector3(-sunPos.x, -sunPos.y, -sunPos.z);
  }

  /**
   * Restituisce il colore interpolato del cielo per l'ora corrente.
   */
  public getInterpolatedSkyColor(isRestored = false): THREE.Color {
    const hour = this.currentHour;
    const result = new THREE.Color();
    const effectiveNightColor = this.readableNight ? this.colors.nightSkyReadable : this.colors.nightSky;

    if (hour >= 5.0 && hour < 8.0) {
      // Transizione Notte -> Alba -> Giorno
      const t = (hour - 5.0) / 3.0;
      result.copy(effectiveNightColor).lerp(this.colors.dawnSky, t);
    } else if (hour >= 8.0 && hour < 17.5) {
      // Giorno pieno (più turchese se l'isola è stata risvegliata)
      const targetDayColor = isRestored ? new THREE.Color(0x64b5f6) : this.colors.daySky;
      result.copy(targetDayColor);
    } else if (hour >= 17.5 && hour < 20.5) {
      // Transizione Giorno -> Tramonto -> Notte
      const t = (hour - 17.5) / 3.0;
      result.copy(this.colors.daySky).lerp(this.colors.sunsetSky, t);
    } else {
      // Notte profonda o leggibile
      const t = hour >= 20.5 ? (hour - 20.5) / 3.5 : 1.0;
      result.copy(this.colors.sunsetSky).lerp(effectiveNightColor, Math.min(1.0, t));
    }

    return result;
  }

  private calculateRawSunIntensity(): number {
    const sunPos = this.getSunPosition();
    if (sunPos.y <= 0) return 0.0;
    const elevationRatio = Math.min(1.0, sunPos.y / 35.0);
    return elevationRatio * 1.6;
  }

  /**
   * Restituisce l'intensità del sole (smorzata o immediata).
   */
  public getSunIntensity(): number {
    return this.smoothTransitions ? this.dampedSunIntensity : this.calculateRawSunIntensity();
  }

  /**
   * Restituisce l'intensità della luce lunare (più luminosa in modalità notte leggibile).
   */
  public getMoonIntensity(): number {
    const moonPos = this.getMoonPosition();
    if (moonPos.y <= 0) return 0.0;
    const elevationRatio = Math.min(1.0, moonPos.y / 35.0);
    const maxMoon = this.readableNight ? 0.65 : 0.45;
    return elevationRatio * maxMoon;
  }

  private calculateRawAmbientIntensity(): number {
    const phase = this.getPhase();
    switch (phase) {
      case 'day': return 1.1;
      case 'dawn':
      case 'sunset': return 0.75;
      case 'night': return this.readableNight ? 0.65 : 0.35;
    }
  }

  /**
   * Restituisce l'intensità della luce ambientale in base all'ora.
   */
  public getAmbientIntensity(): number {
    return this.smoothTransitions ? this.dampedAmbientIntensity : this.calculateRawAmbientIntensity();
  }

  public setHour(hour: number): void {
    this.currentHour = (hour + 24) % 24;
    this.dampedSunIntensity = this.calculateRawSunIntensity();
    this.dampedAmbientIntensity = this.calculateRawAmbientIntensity();
    globalEventBus.emit('time-changed', this.currentHour);
  }

  public getHour(): number {
    return this.currentHour;
  }

  public setHourLocked(locked: boolean): void {
    this.isHourLocked = locked;
  }

  public getIsHourLocked(): boolean {
    return this.isHourLocked;
  }

  public setTimeScale(scale: number): void {
    this.timeScale = Math.max(0.05, Math.min(10.0, scale));
  }

  public getTimeScale(): number {
    return this.timeScale;
  }

  public setReadableNight(enabled: boolean): void {
    this.readableNight = enabled;
  }

  public getReadableNight(): boolean {
    return this.readableNight;
  }

  public setSmoothTransitions(enabled: boolean): void {
    this.smoothTransitions = enabled;
  }

  public getSmoothTransitions(): boolean {
    return this.smoothTransitions;
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  /**
   * Serializzazione stato POJO.
   */
  public serializeState(): DayNightOptionsState {
    return {
      currentHour: this.currentHour,
      phase: this.getPhase(),
      timeScale: this.timeScale,
      isHourLocked: this.isHourLocked,
      readableNight: this.readableNight,
      smoothTransitions: this.smoothTransitions,
    };
  }

  public deserializeState(saved: Partial<DayNightOptionsState>): void {
    if (saved.currentHour !== undefined) this.currentHour = saved.currentHour;
    if (saved.timeScale !== undefined) this.timeScale = saved.timeScale;
    if (saved.isHourLocked !== undefined) this.isHourLocked = saved.isHourLocked;
    if (saved.readableNight !== undefined) this.readableNight = saved.readableNight;
    if (saved.smoothTransitions !== undefined) this.smoothTransitions = saved.smoothTransitions;
  }
}
