/**
 * Overlay di debug e benchmark prestazionale con calcolo 1% low FPS, draw call,
 * triangoli WebGL, monitor multi-touch e fallback di copia (Regole utente 4, 5, 6, 7).
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.1
 */

import * as THREE from 'three';
import { TouchOverlay } from './TouchOverlay';
import type { QualityPreset } from './QualitySettingsUI';

export interface BenchmarkResult {
  device: string;
  userAgent: string;
  qualityPreset: QualityPreset;
  pixelRatio: number;
  canvasResolution: string;
  durationSeconds: number;
  totalFrames: number;
  avgFps: number;
  minFps: number;
  onePercentLowFps: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
}

export class DebugOverlay {
  private isDebugActive = false;
  private isBenchmarkMode = false;
  private container: HTMLElement | null = null;
  private statsText: HTMLElement | null = null;
  private modalContainer: HTMLElement | null = null;
  private modalTextarea: HTMLTextAreaElement | null = null;

  // Campionamento frame per FPS medio, min e 1% low
  private frameTimes: number[] = [];
  private readonly maxSamples = 600; // ~10-20 secondi a 30-60 FPS
  private benchmarkSamples: number[] = [];
  private benchmarkElapsed = 0;
  private readonly benchmarkDuration = 30.0; // 30 secondi deterministici
  private benchmarkFinished = false;
  private benchmarkReport: string | null = null;

  private renderer: THREE.WebGLRenderer;
  private touchOverlay: TouchOverlay;
  private getQualityPreset: () => QualityPreset;

  constructor(options: {
    renderer: THREE.WebGLRenderer;
    touchOverlay: TouchOverlay;
    getQualityPreset: () => QualityPreset;
  }) {
    this.renderer = options.renderer;
    this.touchOverlay = options.touchOverlay;
    this.getQualityPreset = options.getQualityPreset;

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      this.isDebugActive = params.get('debug') === '1' || params.has('debug');
      this.isBenchmarkMode = params.get('benchmark') === '1' || params.has('benchmark');
      if (this.isBenchmarkMode) {
        this.isDebugActive = true;
      }

      if (this.isDebugActive) {
        this.buildUI();
      }
    }
  }

  public getIsDebugActive(): boolean {
    return this.isDebugActive;
  }

  public getIsBenchmarkRunning(): boolean {
    return this.isBenchmarkMode && !this.benchmarkFinished;
  }

  private buildUI(): void {
    if (typeof document === 'undefined') return;

    this.container = document.createElement('div');
    this.container.id = 'debug-overlay';
    this.container.className = 'debug-panel';

    const header = document.createElement('div');
    header.className = 'debug-header';

    const title = document.createElement('span');
    title.className = 'debug-title';
    title.textContent = this.isBenchmarkMode ? '⏱️ BENCHMARK (30s)' : '🛠️ DEBUG MODE';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'debug-btn';
    copyBtn.textContent = 'Copia Report';
    copyBtn.addEventListener('click', () => {
      this.exportAndCopyReport();
    });

    header.appendChild(title);
    header.appendChild(copyBtn);

    this.statsText = document.createElement('pre');
    this.statsText.className = 'debug-pre';
    this.statsText.textContent = 'Inizializzazione statistiche...';

    this.container.appendChild(header);
    this.container.appendChild(this.statsText);
    document.body.appendChild(this.container);

    // Modal fallback per copia manuale quando navigator.clipboard è bloccato (HTTP non-sicuro)
    this.buildModalFallback();
  }

  private buildModalFallback(): void {
    if (typeof document === 'undefined') return;

    this.modalContainer = document.createElement('div');
    this.modalContainer.id = 'debug-copy-modal';
    this.modalContainer.className = 'journal-overlay hidden';

    const card = document.createElement('div');
    card.className = 'journal-card';
    card.style.maxWidth = '550px';

    const modalHeader = document.createElement('div');
    modalHeader.className = 'journal-header';

    const modalTitle = document.createElement('h3');
    modalTitle.textContent = '📋 Report Prestazionale';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => {
      this.modalContainer?.classList.add('hidden');
    });

    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeBtn);

    const desc = document.createElement('p');
    desc.style.fontSize = '13px';
    desc.style.color = '#718096';
    desc.textContent =
      'Seleziona tutto il testo qui sotto e copialo per condividerlo o incollarlo nel changelog:';

    this.modalTextarea = document.createElement('textarea');
    this.modalTextarea.className = 'debug-textarea';
    this.modalTextarea.readOnly = true;

    const selectAllBtn = document.createElement('button');
    selectAllBtn.className = 'primary-button';
    selectAllBtn.style.marginTop = '10px';
    selectAllBtn.textContent = 'Seleziona Tutto';
    selectAllBtn.addEventListener('click', () => {
      this.modalTextarea?.select();
      this.modalTextarea?.setSelectionRange(0, 99999);
    });

    card.appendChild(modalHeader);
    card.appendChild(desc);
    card.appendChild(this.modalTextarea);
    card.appendChild(selectAllBtn);
    this.modalContainer.appendChild(card);
    document.body.appendChild(this.modalContainer);
  }

  /**
   * Aggiorna i dati del frame e l'eventuale benchmark.
   * @param dt Delta time del frame in secondi.
   * @returns Coordinate camera forzate dal benchmark (se attivo), altrimenti null.
   */
  public update(dt: number): { camPos: THREE.Vector3; targetPos: THREE.Vector3 } | null {
    if (!this.isDebugActive) return null;

    // Registra frametime per calcolo 1% low
    if (dt > 0.0001) {
      this.frameTimes.push(dt);
      if (this.frameTimes.length > this.maxSamples) {
        this.frameTimes.shift();
      }
    }

    let benchmarkCamera: { camPos: THREE.Vector3; targetPos: THREE.Vector3 } | null = null;

    if (this.isBenchmarkMode && !this.benchmarkFinished) {
      this.benchmarkElapsed += dt;
      this.benchmarkSamples.push(dt);

      // Percorso deterministico per la telecamera: traiettoria circolare con ondulazione
      const angle = (this.benchmarkElapsed / this.benchmarkDuration) * Math.PI * 2 * 1.5;
      const radius = 22.0;
      const camX = Math.sin(angle) * radius;
      const camZ = Math.cos(angle) * radius;
      const camY = 6.0 + Math.sin(this.benchmarkElapsed * 0.8) * 3.0;

      benchmarkCamera = {
        camPos: new THREE.Vector3(camX, camY, camZ),
        targetPos: new THREE.Vector3(0, 1.2, 0),
      };

      if (this.benchmarkElapsed >= this.benchmarkDuration) {
        this.benchmarkFinished = true;
        this.finalizeBenchmark();
      }
    }

    // Aggiorna testo UI
    this.renderText();

    return benchmarkCamera;
  }

  private calculateStats(samples: number[]): {
    avgFps: number;
    minFps: number;
    onePercentLow: number;
  } {
    if (samples.length === 0) {
      return { avgFps: 0, minFps: 0, onePercentLow: 0 };
    }

    // FPS per frame
    const fpsValues = samples.map((d) => 1.0 / d);
    const sum = fpsValues.reduce((a, b) => a + b, 0);
    const avgFps = Math.round(sum / fpsValues.length);

    // Min FPS
    const minFps = Math.round(Math.min(...fpsValues));

    // 1% Low FPS: prendi l'1% dei frame peggiori (durata maggiore / fps più bassi)
    const sorted = [...fpsValues].sort((a, b) => a - b);
    const onePercentCount = Math.max(1, Math.floor(sorted.length * 0.01));
    const worstOnePercent = sorted.slice(0, onePercentCount);
    const onePercentLow = Math.round(
      worstOnePercent.reduce((a, b) => a + b, 0) / worstOnePercent.length
    );

    return { avgFps, minFps, onePercentLow };
  }

  private renderText(): void {
    if (!this.statsText) return;

    const stats = this.calculateStats(this.frameTimes);
    const renderInfo = this.renderer.info.render;
    const memoryInfo = this.renderer.info.memory;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const w = this.renderer.domElement.width;
    const h = this.renderer.domElement.height;
    const quality = this.getQualityPreset();

    // Rileva i touch identificati direttamente da TouchOverlay
    const activeTouches = this.touchOverlay.getActiveTouchesDebug();
    const touchesStr =
      activeTouches.length === 0
        ? 'Nessuno'
        : activeTouches.map((t) => `#${t.identifier} (${t.role})`).join(', ');

    let content = `FPS: ${stats.avgFps} | Min: ${stats.minFps} | 1% Low: ${stats.onePercentLow}\n`;
    content += `Draw Calls: ${renderInfo.calls} | Triangoli: ${renderInfo.triangles}\n`;
    content += `Geometrie: ${memoryInfo.geometries} | Texture: ${memoryInfo.textures}\n`;
    content += `Profilo: ${quality.toUpperCase()} | DPR: ${dpr.toFixed(2)} | Canvas: ${w}x${h}\n`;
    content += `Touch Attivi (TouchOverlay): ${touchesStr}\n`;

    if (this.isBenchmarkMode) {
      if (!this.benchmarkFinished) {
        content += `\nProgresso Benchmark: ${this.benchmarkElapsed.toFixed(1)}s / ${this.benchmarkDuration}s`;
      } else {
        content += `\n✅ BENCHMARK COMPLETATO! Clicca "Copia Report".`;
      }
    }

    this.statsText.textContent = content;
  }

  private finalizeBenchmark(): void {
    const stats = this.calculateStats(this.benchmarkSamples);
    const renderInfo = this.renderer.info.render;
    const memoryInfo = this.renderer.info.memory;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const w = this.renderer.domElement.width;
    const h = this.renderer.domElement.height;
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    const quality = this.getQualityPreset();

    const reportLines = [
      '========================================',
      '   BRUMAVENTO - REPORT BENCHMARK 30s    ',
      '========================================',
      `Data: ${new Date().toISOString()}`,
      `User Agent: ${userAgent}`,
      `Profilo Grafico: ${quality}`,
      `Pixel Ratio (DPR): ${dpr}`,
      `Risoluzione Canvas: ${w} x ${h}`,
      `Durata Misura: ${this.benchmarkElapsed.toFixed(2)} secondi`,
      `Frame Totali: ${this.benchmarkSamples.length}`,
      '----------------------------------------',
      `FPS Medio:      ${stats.avgFps}`,
      `FPS Minimo:     ${stats.minFps}`,
      `FPS 1% Low:     ${stats.onePercentLow}`,
      '----------------------------------------',
      `Draw Calls:     ${renderInfo.calls}`,
      `Triangoli:      ${renderInfo.triangles}`,
      `Geometrie:      ${memoryInfo.geometries}`,
      `Texture:        ${memoryInfo.textures}`,
      '========================================',
    ];

    this.benchmarkReport = reportLines.join('\n');
    this.showReport(this.benchmarkReport);
  }

  public exportAndCopyReport(): void {
    if (this.benchmarkReport) {
      this.showReport(this.benchmarkReport);
      return;
    }

    // Genera istantanea dello stato attuale
    const stats = this.calculateStats(this.frameTimes);
    const renderInfo = this.renderer.info.render;
    const memoryInfo = this.renderer.info.memory;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const w = this.renderer.domElement.width;
    const h = this.renderer.domElement.height;
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    const quality = this.getQualityPreset();

    const snapshot = [
      '========================================',
      '   BRUMAVENTO - REPORT DIAGNOSTICO      ',
      '========================================',
      `Data: ${new Date().toISOString()}`,
      `User Agent: ${userAgent}`,
      `Profilo Grafico: ${quality}`,
      `Pixel Ratio (DPR): ${dpr}`,
      `Risoluzione Canvas: ${w} x ${h}`,
      '----------------------------------------',
      `FPS Medio:      ${stats.avgFps}`,
      `FPS Minimo:     ${stats.minFps}`,
      `FPS 1% Low:     ${stats.onePercentLow}`,
      '----------------------------------------',
      `Draw Calls:     ${renderInfo.calls}`,
      `Triangoli:      ${renderInfo.triangles}`,
      `Geometrie:      ${memoryInfo.geometries}`,
      `Texture:        ${memoryInfo.textures}`,
      '========================================',
    ].join('\n');

    this.showReport(snapshot);
  }

  private showReport(text: string): void {
    // 1. Prova a copiare negli appunti di sistema
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.notifyCopied(true);
        })
        .catch(() => {
          // Se la clipboard fallisce (es. HTTP o permessi mancanti), usa il fallback con textarea
          this.openFallbackModal(text);
        });
    } else {
      this.openFallbackModal(text);
    }
  }

  private openFallbackModal(text: string): void {
    if (!this.modalContainer || !this.modalTextarea) return;
    this.modalTextarea.value = text;
    this.modalContainer.classList.remove('hidden');
    setTimeout(() => {
      this.modalTextarea?.select();
      this.modalTextarea?.focus();
    }, 100);
  }

  private notifyCopied(success: boolean): void {
    if (!this.container) return;
    const btn = this.container.querySelector('.debug-btn') as HTMLButtonElement | null;
    if (btn) {
      const prev = btn.textContent;
      btn.textContent = success ? '✅ Copiato!' : 'Visualizza';
      setTimeout(() => {
        btn.textContent = prev;
      }, 2000);
    }
  }
}
