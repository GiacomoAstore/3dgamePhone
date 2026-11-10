/**
 * Pannello delle Impostazioni Grafiche e Audio di Brumavento.
 * Gestisce slider volumi, profili di qualità prestazionale e pausa comandi.
 * Rispetta le regole: mobile-first, accessibilità touch, textContent rigoroso.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.0
 */

import { AudioSystem } from '../systems/AudioSystem';
import { QualityPreset } from '../core/Game';
import { globalEventBus } from '../core/EventBus';

export interface QualitySettingsOptions {
  onQualityChange: (quality: QualityPreset) => void;
  audioSystem: AudioSystem;
}

export class QualitySettingsUI {
  private container: HTMLElement;
  private card: HTMLElement;
  private isOpen = false;

  private currentQuality: QualityPreset = 'high';
  private audioSystem: AudioSystem;
  private onQualityChange: (quality: QualityPreset) => void;

  // Riferimenti elementi UI
  private lowBtn!: HTMLButtonElement;
  private medBtn!: HTMLButtonElement;
  private highBtn!: HTMLButtonElement;

  private masterValLabel!: HTMLSpanElement;
  private ambientValLabel!: HTMLSpanElement;
  private sfxValLabel!: HTMLSpanElement;

  constructor(options: QualitySettingsOptions) {
    this.audioSystem = options.audioSystem;
    this.onQualityChange = options.onQualityChange;

    // Crea gli elementi del modal in modo sicuro (senza innerHTML)
    this.container = document.createElement('div');
    this.container.id = 'settings-modal';
    this.container.className = 'journal-overlay hidden';

    this.card = document.createElement('div');
    this.card.className = 'journal-card settings-card';

    this.buildHeader();
    this.buildQualitySection();
    this.buildAudioSection();

    this.container.appendChild(this.card);
    document.body.appendChild(this.container);

    this.initEvents();
  }

  private buildHeader(): void {
    const header = document.createElement('div');
    header.className = 'journal-header';

    const title = document.createElement('h2');
    title.textContent = '⚙️ Impostazioni';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.setAttribute('aria-label', 'Chiudi impostazioni');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(title);
    header.appendChild(closeBtn);
    this.card.appendChild(header);
  }

  private buildQualitySection(): void {
    const section = document.createElement('section');
    section.className = 'journal-section';

    const title = document.createElement('h4');
    title.className = 'section-title';
    title.textContent = '🖥️ Qualità Grafica';

    const subtitle = document.createElement('p');
    subtitle.className = 'settings-desc';
    subtitle.textContent = 'Seleziona il profilo ideale per il tuo dispositivo (FPS stabili su smartphone):';

    const btnGroup = document.createElement('div');
    btnGroup.className = 'quality-btn-group';

    this.lowBtn = document.createElement('button');
    this.lowBtn.className = 'quality-btn';
    this.lowBtn.textContent = 'Bassa (1.0x, ombre off)';
    this.lowBtn.addEventListener('click', () => this.selectQuality('low'));

    this.medBtn = document.createElement('button');
    this.medBtn.className = 'quality-btn';
    this.medBtn.textContent = 'Media (1.4x)';
    this.medBtn.addEventListener('click', () => this.selectQuality('medium'));

    this.highBtn = document.createElement('button');
    this.highBtn.className = 'quality-btn active';
    this.highBtn.textContent = 'Alta (2.0x, PCF Soft)';
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
    const section = document.createElement('section');
    section.className = 'journal-section';

    const title = document.createElement('h4');
    title.className = 'section-title';
    title.textContent = '🔊 Volumi Audio';

    // Master
    const masterRow = this.createSliderRow('Volume Generale', '80%', (val) => {
      this.audioSystem.setMasterVolume(val / 100);
      this.masterValLabel.textContent = `${val}%`;
    });
    this.masterValLabel = masterRow.label;

    // Ambiente / Musica
    const ambientRow = this.createSliderRow('Brezza & Onde', '50%', (val) => {
      this.audioSystem.setAmbientVolume(val / 100);
      this.ambientValLabel.textContent = `${val}%`;
    });
    this.ambientValLabel = ambientRow.label;

    // Effetti / SFX
    const sfxRow = this.createSliderRow('Effetti & Passi', '85%', (val) => {
      this.audioSystem.setSfxVolume(val / 100);
      this.sfxValLabel.textContent = `${val}%`;
    });
    this.sfxValLabel = sfxRow.label;

    section.appendChild(title);
    section.appendChild(masterRow.container);
    section.appendChild(ambientRow.container);
    section.appendChild(sfxRow.container);
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
    // Chiudi toccando lo sfondo semi-trasparente
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });
  }

  public selectQuality(quality: QualityPreset): void {
    this.currentQuality = quality;

    this.lowBtn.classList.toggle('active', quality === 'low');
    this.medBtn.classList.toggle('active', quality === 'medium');
    this.highBtn.classList.toggle('active', quality === 'high');

    this.onQualityChange(quality);
    globalEventBus.emit('quality-changed', quality);
  }

  public open(): void {
    if (this.isOpen) return;
    this.isOpen = true;
    this.container.classList.remove('hidden');
    globalEventBus.emit('settings-opened');
  }

  public close(): void {
    if (!this.isOpen) return;
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
