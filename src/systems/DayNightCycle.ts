/**
 * Gestione del Ciclo Giorno / Notte con orbita di Sole e Luna e color grading d'atmosfera.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.0
 */

import * as THREE from 'three';
import { globalEventBus } from '../core/EventBus';

export type TimeOfDayPhase = 'dawn' | 'day' | 'sunset' | 'night';

export interface DayNightConfig {
  cycleDurationSeconds: number; // Durata di un giorno completo (es. 480s = 8 minuti)
  initialHour: number; // Ora iniziale (0.0 - 24.0, es. 10.5 = 10:30)
}

export interface DayNightState {
  currentHour: number;
  normalizedTime: number; // 0.0 (mezzanotte) - 0.5 (mezzogiorno) - 1.0 (mezzanotte)
  phase: TimeOfDayPhase;
  sunPosition: { x: number; y: number; z: number };
  moonPosition: { x: number; y: number; z: number };
  sunIntensity: number;
  moonIntensity: number;
  ambientIntensity: number;
  skyColorHex: string;
  fogColorHex: string;
}

export class DayNightCycle {
  private cycleDuration = 480; // 8 minuti per un'intera giornata
  private currentHour = 10.5; // Inizia a metà mattina

  private sunOrbitalRadius = 55;
  private isPaused = false;

  // Palette orarie per il cielo e la nebbia
  private colors = {
    dawnSky: new THREE.Color(0xf4a261), // Rosa antico / pesca
    dawnFog: new THREE.Color(0xf6bd60),
    daySky: new THREE.Color(0x8ecae6), // Turchese vivo solare
    dayFog: new THREE.Color(0xa3b8cc),
    sunsetSky: new THREE.Color(0xe76f51), // Arancio corallo caldo
    sunsetFog: new THREE.Color(0xd97757),
    nightSky: new THREE.Color(0x111c2e), // Blu notte profondo
    nightFog: new THREE.Color(0x182436),
  };

  constructor(config?: Partial<DayNightConfig>) {
    if (config?.cycleDurationSeconds) this.cycleDuration = Math.max(30, config.cycleDurationSeconds);
    if (config?.initialHour !== undefined) this.currentHour = (config.initialHour + 24) % 24;
  }

  /**
   * Avanza il tempo nel ciclo giorno/notte.
   * @param dt Delta time in secondi.
   */
  public update(dt: number): void {
    if (this.isPaused) return;

    // Incrementa l'ora: (24 ore / durataCicloInSecondi) * dt
    const hoursPerSecond = 24.0 / this.cycleDuration;
    this.currentHour = (this.currentHour + hoursPerSecond * dt) % 24.0;
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

    if (hour >= 5.0 && hour < 8.0) {
      // Transizione Notte -> Alba -> Giorno
      const t = (hour - 5.0) / 3.0;
      result.copy(this.colors.nightSky).lerp(this.colors.dawnSky, t);
    } else if (hour >= 8.0 && hour < 17.5) {
      // Giorno pieno (più turchese se l'isola è stata risvegliata)
      const targetDayColor = isRestored ? new THREE.Color(0x64b5f6) : this.colors.daySky;
      result.copy(targetDayColor);
    } else if (hour >= 17.5 && hour < 20.5) {
      // Transizione Giorno -> Tramonto -> Notte
      const t = (hour - 17.5) / 3.0;
      result.copy(this.colors.daySky).lerp(this.colors.sunsetSky, t);
    } else {
      // Notte profonda
      const t = hour >= 20.5 ? (hour - 20.5) / 3.5 : 1.0;
      result.copy(this.colors.sunsetSky).lerp(this.colors.nightSky, Math.min(1.0, t));
    }

    return result;
  }

  /**
   * Restituisce l'intensità del sole (0 di notte, massima a mezzogiorno).
   */
  public getSunIntensity(): number {
    const sunPos = this.getSunPosition();
    if (sunPos.y <= 0) return 0.0;
    // Elevazione sopra l'orizzonte
    const elevationRatio = Math.min(1.0, sunPos.y / 35.0);
    return elevationRatio * 1.6;
  }

  /**
   * Restituisce l'intensità della luce lunare (massima a mezzanotte).
   */
  public getMoonIntensity(): number {
    const moonPos = this.getMoonPosition();
    if (moonPos.y <= 0) return 0.0;
    const elevationRatio = Math.min(1.0, moonPos.y / 35.0);
    return elevationRatio * 0.45;
  }

  /**
   * Restituisce l'intensità della luce ambientale in base all'ora.
   */
  public getAmbientIntensity(): number {
    const phase = this.getPhase();
    switch (phase) {
      case 'day': return 1.1;
      case 'dawn':
      case 'sunset': return 0.75;
      case 'night': return 0.35;
    }
  }

  public setHour(hour: number): void {
    this.currentHour = (hour + 24) % 24;
    globalEventBus.emit('time-changed', this.currentHour);
  }

  public getHour(): number {
    return this.currentHour;
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  /**
   * Serializzazione stato POJO.
   */
  public serializeState() {
    return {
      currentHour: this.currentHour,
      phase: this.getPhase(),
      cycleDuration: this.cycleDuration,
    };
  }

  public deserializeState(saved: { currentHour: number; cycleDuration?: number }): void {
    if (saved.currentHour !== undefined) this.currentHour = saved.currentHour;
    if (saved.cycleDuration) this.cycleDuration = saved.cycleDuration;
  }
}
