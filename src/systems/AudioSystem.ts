/**
 * Sistema Audio di Brumavento basato su Web Audio API procedurale.
 * Mobile-first: sblocco garantito al primo tocco, zero file audio pesanti, zero latenza.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.0
 */

import { globalEventBus } from '../core/EventBus';

export interface AudioSystemOptions {
  masterVolume?: number;
  sfxVolume?: number;
  ambientVolume?: number;
}

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private isUnlocked = false;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  // Stato volumi (0.0 - 1.0)
  private masterVol = 0.8;
  private sfxVol = 0.85;
  private ambientVol = 0.5;

  private isAmbientPlaying = false;
  private currentMusicAudio: HTMLAudioElement | null = null;

  constructor(options?: AudioSystemOptions) {
    if (options?.masterVolume !== undefined) this.masterVol = Math.max(0, Math.min(1, options.masterVolume));
    if (options?.sfxVolume !== undefined) this.sfxVol = Math.max(0, Math.min(1, options.sfxVolume));
    if (options?.ambientVolume !== undefined) this.ambientVol = Math.max(0, Math.min(1, options.ambientVolume));

    this.initContext();
    this.initEventListeners();
  }

  /**
   * Inizializza l'AudioContext supportando fallback per ambienti non-browser (test runner).
   */
  private initContext(): void {
    if (typeof window === 'undefined') return;
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      try {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(this.ambientVol, this.ctx.currentTime);
        this.ambientGain.connect(this.masterGain);

        if (this.ctx.state === 'running') {
          this.isUnlocked = true;
        }
      } catch (err) {
        console.warn('[AudioSystem] Impossibile inizializzare Web Audio:', err);
      }
    }
  }

  /**
   * Sblocca l'AudioContext in risposta al primo tocco o click (Mobile autoplay policy).
   */
  public async unlockAudio(): Promise<void> {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended' || (this.ctx.state as string) === 'interrupted') {
      try {
        await this.ctx.resume();
        this.isUnlocked = true;
        this.startSeaBreezeAmbient();
      } catch (e) {
        console.warn('[AudioSystem] Errore nello sblocco audio:', e);
      }
    } else {
      this.isUnlocked = true;
      this.startSeaBreezeAmbient();
    }
  }

  private initEventListeners(): void {
    // Sblocca al primo tocco o interazione su mobile e desktop
    if (typeof window !== 'undefined') {
      const unlockEvents = ['touchstart', 'pointerdown', 'mousedown', 'click'];
      const unlockHandler = () => {
        this.unlockAudio();
        unlockEvents.forEach((evt) => window.removeEventListener(evt, unlockHandler));
      };
      unlockEvents.forEach((evt) =>
        window.addEventListener(evt, unlockHandler, { once: true, passive: true })
      );

      // Ripristino automatico dell AudioContext quando la scheda torna visibile (iOS/Android)
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          this.handleVisibilityChange(document.visibilityState === 'visible');
        });
      }
    }

    // Iscrizione agli eventi di gioco per il feedback sonoro
    globalEventBus.on('fragment-collected', () => {
      this.playFragmentFanfare();
    });

    globalEventBus.on('item-collected', () => {
      this.playItemChime();
    });

    globalEventBus.on('lantern-toggled', (isActive: boolean) => {
      this.playLanternSound(isActive);
    });

    globalEventBus.on('player-jump', () => {
      this.playJumpSound();
    });

    globalEventBus.on('player-footstep', () => {
      this.playFootstepSound();
    });
  }

  /**
   * Suono dei passi di Pip su erba/pietra (soft thud cartoon).
   */
  public playFootstepSound(): void {
    if (!this.ctx || !this.sfxGain || !this.isUnlocked) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Piccola variazione casuale di pitch per naturalezza
    const freq = 120 + Math.random() * 25;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Suono di salto cartoon (fischio ascendente morbido).
   */
  public playJumpSound(): void {
    if (!this.ctx || !this.sfxGain || !this.isUnlocked) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  /**
   * Suono di accensione/spegnimento della Lanterna Magica.
   */
  public playLanternSound(isActive: boolean): void {
    if (!this.ctx || !this.sfxGain || !this.isUnlocked) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = isActive ? 520 : 660;
    const endFreq = isActive ? 880 : 380;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.22);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  /**
   * Chime allegro per la raccolta di collezionabili (conchiglie, funghi, stelle).
   */
  public playItemChime(): void {
    if (!this.ctx || !this.sfxGain || !this.isUnlocked) return;
    const now = this.ctx.currentTime;

    // Arpeggio a 2 toni maggiori (Mi5 -> Sol#5)
    const notes = [659.25, 830.61];
    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.32);
    });
  }

  /**
   * Fanfara trionfale per il recupero del Frammento dell'Atlante Vivo.
   */
  public playFragmentFanfare(): void {
    if (!this.ctx || !this.sfxGain || !this.isUnlocked) return;
    const now = this.ctx.currentTime;

    // Arpeggio magico ascendente brillante (Do5 -> Mi5 -> Sol5 -> Do6)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.12;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      const duration = idx === notes.length - 1 ? 0.9 : 0.45;
      gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    });
  }

  /**
   * Brezza marina e onde procedurale (rumore bianco filtrato con LFO).
   */
  public startSeaBreezeAmbient(): void {
    if (!this.ctx || !this.ambientGain || this.isAmbientPlaying || !this.isUnlocked) return;

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Rumore rosa/morbido
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.06;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filtro passa-basso con modulazione per simulare le onde
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.25, this.ctx.currentTime); // 1 onda ogni 4 secondi
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      whiteNoise.connect(filter);
      filter.connect(this.ambientGain);

      whiteNoise.start();
      lfo.start();

      this.isAmbientPlaying = true;
    } catch (err) {
      console.warn('[AudioSystem] Impossibile avviare rumore ambientale:', err);
    }
  }

  public setMasterVolume(val: number): void {
    this.masterVol = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);
    }
  }

  public setSfxVolume(val: number): void {
    this.sfxVol = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
    }
  }

  public setAmbientVolume(val: number): void {
    this.ambientVol = Math.max(0, Math.min(1, val));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.ambientVol, this.ctx.currentTime);
    }
  }

  /**
   * Riproduce una traccia musicale da file (mp3/ogg, es. musica CC0) con fallback su suono procedurale.
   * Se il file non esiste, fallisce il download o il codec non è supportato, attiva immediatamente
   * il generatore procedurale (es. brezza marina procedurale o melodia sintetica) senza bloccare il gioco.
   * @param url Percorso o URL del file audio (es. '/assets/music/theme.ogg')
   * @param fallbackProcedural Callback procedurale da eseguire in caso di errore (default: startSeaBreezeAmbient)
   * @returns true se il file audio è stato caricato e avviato con successo, false se è scattato il ripiego.
   */
  public async playMusicTrack(
    url: string,
    fallbackProcedural?: () => void
  ): Promise<boolean> {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') {
      if (fallbackProcedural) fallbackProcedural();
      else this.startSeaBreezeAmbient();
      return false;
    }

    try {
      this.stopMusicTrack();

      const audio = new Audio();
      audio.src = url;
      audio.loop = true;
      audio.volume = this.masterVol * this.ambientVol;

      // Attesa evento canplaythrough con timeout di sicurezza
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          cleanup();
          reject(new Error(`Timeout caricamento traccia audio da: ${url}`));
        }, 3000);

        const onCanPlay = () => {
          cleanup();
          resolve();
        };

        const onError = (e: Event) => {
          cleanup();
          reject(new Error(`Errore caricamento audio ${url}: ${(e as ErrorEvent).message || 'File non trovato o formato non supportato'}`));
        };

        const cleanup = () => {
          clearTimeout(timer);
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onError);
        };

        audio.addEventListener('canplaythrough', onCanPlay);
        audio.addEventListener('error', onError);
      });

      await audio.play();
      this.currentMusicAudio = audio;
      return true;
    } catch (err) {
      console.warn(`[AudioSystem] Impossibile riprodurre file audio '${url}'. Attivazione ripiego procedurale:`, err);
      if (fallbackProcedural) {
        fallbackProcedural();
      } else {
        this.startSeaBreezeAmbient();
      }
      return false;
    }
  }

  /**
   * Riproduce un effetto sonoro (SFX) da file (mp3/ogg) con fallback su suono procedurale.
   */
  public async playSoundFile(
    url: string,
    fallbackProcedural?: () => void
  ): Promise<boolean> {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') {
      if (fallbackProcedural) fallbackProcedural();
      return false;
    }

    try {
      const audio = new Audio(url);
      audio.volume = this.masterVol * this.sfxVol;
      await audio.play();
      return true;
    } catch (err) {
      console.warn(`[AudioSystem] File SFX '${url}' non disponibile. Esecuzione fallback procedurale:`, err);
      if (fallbackProcedural) fallbackProcedural();
      return false;
    }
  }

  public stopMusicTrack(): void {
    if (this.currentMusicAudio) {
      try {
        this.currentMusicAudio.pause();
        this.currentMusicAudio.currentTime = 0;
      } catch {
        // Ignora errori di stop
      }
      this.currentMusicAudio = null;
    }
  }

  public async handleVisibilityChange(isVisible: boolean): Promise<void> {
    if (isVisible && this.isUnlocked && this.ctx) {
      if (this.ctx.state === 'suspended' || (this.ctx.state as string) === 'interrupted') {
        try {
          await this.ctx.resume();
        } catch (err) {
          console.warn('[AudioSystem] Ripresa AudioContext fallita:', err);
        }
      }
    }
  }

  public getContextState(): AudioContextState | null {
    return this.ctx ? this.ctx.state : null;
  }

  public getIsUnlocked(): boolean {
    return this.isUnlocked;
  }
}
