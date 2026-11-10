/**
 * Pannello delle Impostazioni Grafiche, Audio e Ciclo Circadiano di Brumavento.
 * Gestisce:
 * - Profilo iniziale automatico in base alle capacità del dispositivo (mobile vs desktop)
 * - Persistenza della scelta utente su localStorage
 * - Abbassamento automatico della qualità grafica in caso di framerate basso
 * - Regolazione volumi e opzioni del ciclo giorno/notte
 * - Rispetto rigoroso di i18n via it.json e manipolazione DOM tramite textContent
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.0
 */

import { AudioSystem } from '../systems/AudioSystem';
import { DayNightCycle } from '../systems/DayNightCycle';
import type { QualityPreset } from '../core/Game';
import { globalEventBus } from '../core/EventBus';
import { LocalizationSystem } from '../systems/LocalizationSystem';

export type { QualityPreset };

export interface QualitySettingsOptions {
  onQualityChange: (quality: QualityPreset) => void;
  audioSystem: AudioSystem;
  dayNightCycle?: DayNightCycle;
}

export interface SavedSettings {
  quality: QualityPreset;
  masterVol: number;
  ambientVol: number;
  sfxVol: number;
  isHourLocked?: boolean;
  readableNight?: boolean;
  smoothTransitions?: boolean;
}

const STORAGE_KEY = 'brumavento_settings';

export class QualitySettingsUI {
  private container?: HTMLElement;
  private card?: HTMLElement;
  private isOpen = false;

  private currentQuality: QualityPreset = 'high';
  private previousQuality: QualityPreset | null = null;
  private audioSystem: AudioSystem;
  private dayNightCycle?: DayNightCycle;
  private onQualityChange: (quality: QualityPreset) => void;

  // Riferimenti elementi UI
  private lowBtn?: HTMLButtonElement;
  private medBtn?: HTMLButtonElement;
  private highBtn?: HTMLButtonElement;

  private masterValLabel!: HTMLSpanElement;
  private ambientValLabel!: HTMLSpanElement;
  private sfxValLabel!: HTMLSpanElement;

  private lockHourBtn!: HTMLButtonElement;
  private readableNightBtn!: HTMLButtonElement;
  private smoothTransitionsBtn!: HTMLButtonElement;

  constructor(options: QualitySettingsOptions) {
    this.audioSystem = options.audioSystem;
    this.dayNightCycle = options.dayNightCycle;
    this.onQualityChange = options.onQualityChange;

    // 1. Carica preferenze salvate o rileva automaticamente il profilo per il dispositivo
    const saved = QualitySettingsUI.loadSettings();
    if (saved) {
      this.currentQuality = saved.quality;
      this.audioSystem.setMasterVolume(saved.masterVol);
      this.audioSystem.setAmbientVolume(saved.ambientVol);
      this.audioSystem.setSfxVolume(saved.sfxVol);
      if (this.dayNightCycle) {
        if (saved.isHourLocked !== undefined) this.dayNightCycle.setHourLocked(saved.isHourLocked);
        if (saved.readableNight !== undefined) this.dayNightCycle.setReadableNight(saved.readableNight);
        if (saved.smoothTransitions !== undefined) this.dayNightCycle.setSmoothTransitions(saved.smoothTransitions);
      }
    } else {
      this.currentQuality = QualitySettingsUI.detectOptimalQuality();
    }

    // 2. Crea gli elementi del modal in modo sicuro (senza innerHTML) solo se siamo in ambiente browser con DOM
    if (typeof document !== 'undefined') {
      this.container = document.createElement('div');
      this.container.id = 'settings-modal';
      this.container.className = 'journal-overlay hidden';

      this.card = document.createElement('div');
      this.card.className = 'journal-card settings-card';

      this.buildHeader();
      this.buildQualitySection();
      this.buildAudioSection();
      if (this.dayNightCycle) {
        this.buildDayNightSection();
      }

      this.container.appendChild(this.card);
      document.body.appendChild(this.container);

      this.initEvents();
    }

    // Applica subito il profilo iniziale
    this.selectQuality(this.currentQuality, false);
  }

  /**
   * Rileva il profilo qualitativo ottimale in base alle caratteristiche del dispositivo.
   */
  public static detectOptimalQuality(): QualityPreset {
    if (typeof window === 'undefined') return 'high';

    const isTouch = 'ontouchstart' in window || (navigator && navigator.maxTouchPoints > 0);
    const isSmallScreen = window.innerWidth <= 850;
    const dpr = window.devicePixelRatio || 1;

    // Dispositivo mobile con schermo ad alta densità o CPU modesta -> 'medium'
    if (isTouch || isSmallScreen) {
      if (dpr > 2.5) {
        return 'medium';
      }
      return 'medium';
    }

    // Desktop standard con GPU -> 'high'
    return 'high';
  }

  /**
   * Carica le impostazioni da localStorage in modo sicuro.
   */
  public static loadSettings(): SavedSettings | null {
    const storage =
      typeof localStorage !== 'undefined'
        ? localStorage
        : typeof window !== 'undefined'
          ? window.localStorage
          : null;
    if (!storage) return null;
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SavedSettings;
    } catch {
      return null;
    }
  }

  /**
   * Salva le impostazioni correnti in localStorage.
   */
  public saveSettings(): void {
    const storage =
      typeof localStorage !== 'undefined'
        ? localStorage
        : typeof window !== 'undefined'
          ? window.localStorage
          : null;
    if (!storage) return;
    try {
      const data: SavedSettings = {
        quality: this.currentQuality,
        masterVol: 0.8,
        ambientVol: 0.5,
        sfxVol: 0.85,
        isHourLocked: this.dayNightCycle?.getIsHourLocked(),
        readableNight: this.dayNightCycle?.getReadableNight(),
        smoothTransitions: this.dayNightCycle?.getSmoothTransitions(),
      };
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('[QualitySettingsUI] Impossibile salvare preferenze:', err);
    }
  }

  private buildHeader(): void {
    if (!this.card) return;
    const header = document.createElement('div');
    header.className = 'journal-header';

    const title = document.createElement('h2');
    title.textContent = `⚙️ ${LocalizationSystem.t('ui.settings_title')}`;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.setAttribute('aria-label', LocalizationSystem.t('ui.btn_close'));
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(title);
    header.appendChild(closeBtn);
    this.card.appendChild(header);
  }

  private buildQualitySection(): void {
    if (!this.card) return;
    const section = document.createElement('section');
    section.className = 'journal-section';

    const title = document.createElement('h4');
    title.className = 'section-title';
    title.textContent = `🖥️ ${LocalizationSystem.t('ui.quality_header')}`;

    const subtitle = document.createElement('p');
    subtitle.className = 'settings-desc';
    subtitle.textContent = LocalizationSystem.t('ui.quality_desc');

    const btnGroup = document.createElement('div');
    btnGroup.className = 'quality-btn-group';

    this.lowBtn = document.createElement('button');
    this.lowBtn.className = 'quality-btn';
    this.lowBtn.textContent = LocalizationSystem.t('ui.quality_low');
    this.lowBtn.addEventListener('click', () => this.selectQuality('low'));

    this.medBtn = document.createElement('button');
    this.medBtn.className = 'quality-btn';
    this.medBtn.textContent = LocalizationSystem.t('ui.quality_medium');
    this.medBtn.addEventListener('click', () => this.selectQuality('medium'));

    this.highBtn = document.createElement('button');
    this.highBtn.className = 'quality-btn active';
    this.highBtn.textContent = LocalizationSystem.t('ui.quality_high');
    this.highBtn.addEventListener('click', () => this.selectQuality('high'));

    btnGroup.appendChild(this.lowBtn);
    btnGroup.appendChild(this.medBtn);
    btnGroup.appendChild(this.highBtn);

    section.appendChild(title);
    section.appendChild(subtitle);
    section.appendChild(btnGroup);
    this.card.appendChild(section);
  }

  private buildAudioSection(): void {
    if (!this.card) return;
    const section = document.createElement('section');
    section.className = 'journal-section';

    const title = document.createElement('h4');
    title.className = 'section-title';
    title.textContent = `🔊 ${LocalizationSystem.t('ui.audio_header')}`;

    // Master
    const masterRow = this.createSliderRow(LocalizationSystem.t('ui.vol_master'), '80%', (val) => {
      this.audioSystem.setMasterVolume(val / 100);
      this.masterValLabel.textContent = `${val}%`;
      this.saveSettings();
    });
    this.masterValLabel = masterRow.label;

    // Ambiente / Onde
    const ambientRow = this.createSliderRow(LocalizationSystem.t('ui.vol_ambient'), '50%', (val) => {
      this.audioSystem.setAmbientVolume(val / 100);
      this.ambientValLabel.textContent = `${val}%`;
      this.saveSettings();
    });
    this.ambientValLabel = ambientRow.label;

    // Effetti / SFX
    const sfxRow = this.createSliderRow(LocalizationSystem.t('ui.vol_sfx'), '85%', (val) => {
      this.audioSystem.setSfxVolume(val / 100);
      this.sfxValLabel.textContent = `${val}%`;
      this.saveSettings();
    });
    this.sfxValLabel = sfxRow.label;

    section.appendChild(title);
    section.appendChild(masterRow.container);
    section.appendChild(ambientRow.container);
    section.appendChild(sfxRow.container);
    this.card.appendChild(section);
  }

  private buildDayNightSection(): void {
    if (!this.dayNightCycle || !this.card) return;
    const section = document.createElement('section');
    section.className = 'journal-section';

    const title = document.createElement('h4');
    title.className = 'section-title';
    title.textContent = `🌅 ${LocalizationSystem.t('ui.daynight_header')}`;

    const optionsGroup = document.createElement('div');
    optionsGroup.className = 'quality-btn-group';

    // 1. Blocco dell'ora
    this.lockHourBtn = document.createElement('button');
    this.lockHourBtn.className = `quality-btn ${this.dayNightCycle.getIsHourLocked() ? 'active' : ''}`;
    this.lockHourBtn.textContent = LocalizationSystem.t('ui.daynight_pause');
    this.lockHourBtn.addEventListener('click', () => {
      const isLocked = !this.dayNightCycle!.getIsHourLocked();
      this.dayNightCycle!.setHourLocked(isLocked);
      this.lockHourBtn.classList.toggle('active', isLocked);
      this.saveSettings();
    });

    // 2. Notti Chiare (schermi piccoli)
    this.readableNightBtn = document.createElement('button');
    this.readableNightBtn.className = `quality-btn ${this.dayNightCycle.getReadableNight() ? 'active' : ''}`;
    this.readableNightBtn.textContent = LocalizationSystem.t('ui.daynight_readable_night');
    this.readableNightBtn.addEventListener('click', () => {
      const readable = !this.dayNightCycle!.getReadableNight();
      this.dayNightCycle!.setReadableNight(readable);
      this.readableNightBtn.classList.toggle('active', readable);
      this.saveSettings();
    });

    // 3. Transizioni Morbide
    this.smoothTransitionsBtn = document.createElement('button');
    this.smoothTransitionsBtn.className = `quality-btn ${this.dayNightCycle.getSmoothTransitions() ? 'active' : ''}`;
    this.smoothTransitionsBtn.textContent = LocalizationSystem.t('ui.daynight_smooth');
    this.smoothTransitionsBtn.addEventListener('click', () => {
      const smooth = !this.dayNightCycle!.getSmoothTransitions();
      this.dayNightCycle!.setSmoothTransitions(smooth);
      this.smoothTransitionsBtn.classList.toggle('active', smooth);
      this.saveSettings();
    });

    optionsGroup.appendChild(this.lockHourBtn);
    optionsGroup.appendChild(this.readableNightBtn);
    optionsGroup.appendChild(this.smoothTransitionsBtn);

    section.appendChild(title);
    section.appendChild(optionsGroup);
    this.card.appendChild(section);
  }

  private createSliderRow(
    name: string,
    initialVal: string,
    onChange: (val: number) => void
  ): { container: HTMLElement; slider: HTMLInputElement; label: HTMLSpanElement } {
    const row = document.createElement('div');
    row.className = 'slider-row';

    const header = document.createElement('div');
    header.className = 'slider-header';

    const title = document.createElement('span');
    title.className = 'slider-title';
    title.textContent = name;

    const label = document.createElement('span');
    label.className = 'slider-val';
    label.textContent = initialVal;

    header.appendChild(title);
    header.appendChild(label);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.value = initialVal.replace('%', '');
    slider.className = 'settings-slider';

    slider.addEventListener('input', () => {
      onChange(parseInt(slider.value, 10));
    });

    row.appendChild(header);
    row.appendChild(slider);

    return { container: row, slider, label };
  }

  private initEvents(): void {
    if (!this.container) return;
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });
  }

  public selectQuality(quality: QualityPreset, save = true): void {
    this.currentQuality = quality;

    if (this.lowBtn) this.lowBtn.classList.toggle('active', quality === 'low');
    if (this.medBtn) this.medBtn.classList.toggle('active', quality === 'medium');
    if (this.highBtn) this.highBtn.classList.toggle('active', quality === 'high');

    this.onQualityChange(quality);
    globalEventBus.emit('quality-changed', quality);

    if (save) {
      this.saveSettings();
    }
  }

  /**
   * Abbassamento automatico di un livello in caso di framerate basso persistente.
   * Restituisce il nuovo livello, oppure null se la qualità è già al minimo ('low').
   */
  public autoDegradeQuality(): QualityPreset | null {
    if (this.currentQuality === 'high') {
      this.previousQuality = 'high';
      this.selectQuality('medium', true);
      return 'medium';
    }
    if (this.currentQuality === 'medium') {
      this.previousQuality = 'medium';
      this.selectQuality('low', true);
      return 'low';
    }
    return null;
  }

  /**
   * Ripristina il profilo precedente se l'utente annulla la degradazione automatica.
   */
  public revertQualityDrop(): QualityPreset | null {
    if (this.previousQuality) {
      const restored = this.previousQuality;
      this.previousQuality = null;
      this.selectQuality(restored, true);
      return restored;
    }
    return null;
  }

  public open(): void {
    if (this.isOpen || !this.container) return;
    this.isOpen = true;
    this.container.classList.remove('hidden');
    globalEventBus.emit('settings-opened');
  }

  public close(): void {
    if (!this.isOpen || !this.container) return;
    this.isOpen = false;
    this.container.classList.add('hidden');
    globalEventBus.emit('settings-closed');
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }

  public getCurrentQuality(): QualityPreset {
    return this.currentQuality;
  }
}
