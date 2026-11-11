/**
 * Sistema particellare unificato a singola draw-call per Brumavento.
 * Gestisce lucciole, polline dorato del vento, spuma costiera e stelle notturne.
 * Rispetta il mobile budget (<800 particelle, 1 draw call, setDrawRange scalabile).
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.0
 */

import * as THREE from 'three';
import { QualityPreset } from '../core/Game';

interface ParticleData {
  type: 'firefly' | 'pollen' | 'foam' | 'star';
  basePos: THREE.Vector3;
  velocity: THREE.Vector3;
  phase: number;
  speed: number;
}

export class ParticleSystem {
  public group: THREE.Group;
  public points: THREE.Points;
  public geometry: THREE.BufferGeometry;
  public material: THREE.PointsMaterial;

  private totalMaxParticles = 750;
  private activeCount = 750;

  private particles: ParticleData[] = [];
  private positions: Float32Array;
  private colors: Float32Array;
  private timer = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'AtmosphericParticles';

    this.positions = new Float32Array(this.totalMaxParticles * 3);
    this.colors = new Float32Array(this.totalMaxParticles * 3);

    this.initParticles();

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    // Texture radiale morbida per particelle soffuse e rotonde (anti-quadratoni)
    let particleMap: THREE.Texture | null = null;
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(255, 245, 210, 0.85)');
        grad.addColorStop(0.65, 'rgba(255, 220, 130, 0.3)');
        grad.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        particleMap = new THREE.CanvasTexture(canvas);
      }
    }

    // Materiale particellare con vertex colors e blending additivo per bagliore magico
    this.material = new THREE.PointsMaterial({
      size: 0.14,
      map: particleMap,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false; // Copre l'intero volume dell'isola e del cielo
    this.group.add(this.points);
  }

  /**
   * Inizializza i pool delle diverse categorie di particelle d'atmosfera.
   */
  private initParticles(): void {
    const fireflyCount = 200;
    const pollenCount = 250;
    const foamCount = 150;
    const starCount = 150; // Somma: 750

    let idx = 0;

    // 1. Lucciole magiche (vicino a piante, funghi e terreno)
    for (let i = 0; i < fireflyCount; i++, idx++) {
      const radius = 3 + Math.random() * 18;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 1.0 + Math.random() * 3.5;

      this.particles.push({
        type: 'firefly',
        basePos: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.4
        ),
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 1.2,
      });

      this.positions[idx * 3] = x;
      this.positions[idx * 3 + 1] = y;
      this.positions[idx * 3 + 2] = z;

      // Colore giallo-verde caldo (0.8, 0.95, 0.3)
      this.colors[idx * 3] = 0.8;
      this.colors[idx * 3 + 1] = 0.95;
      this.colors[idx * 3 + 2] = 0.3;
    }

    // 2. Polline dorato del vento
    for (let i = 0; i < pollenCount; i++, idx++) {
      const x = (Math.random() - 0.5) * 45;
      const z = (Math.random() - 0.5) * 45;
      const y = 0.5 + Math.random() * 8;

      this.particles.push({
        type: 'pollen',
        basePos: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(0.9 + Math.random() * 0.6, 0.1, 0.5 + Math.random() * 0.4),
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.5,
      });

      this.positions[idx * 3] = x;
      this.positions[idx * 3 + 1] = y;
      this.positions[idx * 3 + 2] = z;

      // Ambra dorato
      this.colors[idx * 3] = 0.96;
      this.colors[idx * 3 + 1] = 0.82;
      this.colors[idx * 3 + 2] = 0.44;
    }

    // 3. Spuma marina costiera (lungo la costa dell'isola)
    for (let i = 0; i < foamCount; i++, idx++) {
      const coastRadius = 21 + Math.random() * 6;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * coastRadius;
      const z = Math.sin(angle) * coastRadius;
      const y = 0.05 + Math.random() * 0.3;

      this.particles.push({
        type: 'foam',
        basePos: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(0, 0, 0),
        phase: Math.random() * Math.PI * 2,
        speed: 1.5 + Math.random() * 1.5,
      });

      this.positions[idx * 3] = x;
      this.positions[idx * 3 + 1] = y;
      this.positions[idx * 3 + 2] = z;

      // Bianco azzurro spuma
      this.colors[idx * 3] = 0.85;
      this.colors[idx * 3 + 1] = 0.96;
      this.colors[idx * 3 + 2] = 1.0;
    }

    // 4. Stelle della volta celeste
    for (let i = 0; i < starCount; i++, idx++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = 0.2 + Math.random() * 1.2; // Calotta superiore
      const radius = 65 + Math.random() * 10;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi) + 10;
      const z = radius * Math.sin(phi) * Math.sin(theta);

      this.particles.push({
        type: 'star',
        basePos: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(0, 0, 0),
        phase: Math.random() * Math.PI * 2,
        speed: 1.0 + Math.random() * 2.0,
      });

      this.positions[idx * 3] = x;
      this.positions[idx * 3 + 1] = y;
      this.positions[idx * 3 + 2] = z;

      // Stelle: bianco/azzurrino
      this.colors[idx * 3] = 0.95;
      this.colors[idx * 3 + 1] = 0.95;
      this.colors[idx * 3 + 2] = 1.0;
    }
  }

  /**
   * Aggiorna le posizioni e le intensità luminose delle particelle in base al ciclo circadiano.
   * @param dt Delta time in secondi.
   * @param isNight true se è notte o crepuscolo.
   */
  public update(dt: number, isNight = false): void {
    this.timer += dt;
    const posAttr = this.geometry.attributes.position;
    const colAttr = this.geometry.attributes.color;

    for (let i = 0; i < this.activeCount; i++) {
      const p = this.particles[i];

      if (p.type === 'firefly') {
        // Movimento sinusoidale hovering dolce
        const waveY = Math.sin(this.timer * p.speed + p.phase) * 0.4;
        const waveX = Math.cos(this.timer * 0.7 + p.phase) * 0.3;
        posAttr.setX(i, p.basePos.x + waveX);
        posAttr.setY(i, p.basePos.y + waveY);

        // Bagliore pulsante: più intenso e visibile di notte
        const pulse = 0.5 + Math.sin(this.timer * 2.5 + p.phase) * 0.5;
        const brightness = isNight ? 0.9 * pulse : 0.35 * pulse;
        colAttr.setXYZ(i, 0.8 * brightness, 0.95 * brightness, 0.3 * brightness);
      } else if (p.type === 'pollen') {
        // Deriva costante con il vento da Ovest a Est
        let currentX = posAttr.getX(i) + p.velocity.x * dt;
        let currentZ = posAttr.getZ(i) + p.velocity.z * dt;

        // Wrap dei confini dell'isola per non disperdere particelle
        if (currentX > 25) currentX = -25;
        if (currentZ > 25) currentZ = -25;

        const waveY = Math.sin(this.timer * 1.5 + p.phase) * 0.15;
        posAttr.setX(i, currentX);
        posAttr.setY(i, p.basePos.y + waveY);
        posAttr.setZ(i, currentZ);
      } else if (p.type === 'foam') {
        // Onde alla battigia: si alza e si abbassa ritmicamente
        const wave = (Math.sin(this.timer * p.speed + p.phase) + 1.0) * 0.5;
        posAttr.setY(i, p.basePos.y + wave * 0.25);
        colAttr.setXYZ(i, 0.85 * wave, 0.96 * wave, 1.0 * wave);
      } else if (p.type === 'star') {
        // Le stelle brillano solo al calar del sole e di notte
        if (isNight) {
          const twinkle = 0.6 + Math.sin(this.timer * p.speed + p.phase) * 0.4;
          colAttr.setXYZ(i, 0.95 * twinkle, 0.95 * twinkle, 1.0 * twinkle);
        } else {
          // In pieno giorno le stelle sbiadiscono a nero/invisibili
          colAttr.setXYZ(i, 0, 0, 0);
        }
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  }

  /**
   * Adatta il numero di particelle in base al profilo di qualità prestazionale.
   */
  public setQuality(quality: QualityPreset): void {
    switch (quality) {
      case 'low':
        this.activeCount = 250;
        break;
      case 'medium':
        this.activeCount = 500;
        break;
      case 'high':
      default:
        this.activeCount = this.totalMaxParticles; // 750
        break;
    }
    this.geometry.setDrawRange(0, this.activeCount);
  }

  public getActiveCount(): number {
    return this.activeCount;
  }
}
