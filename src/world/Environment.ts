/**
 * Ambiente di gioco: illuminazione toon, cielo, mare animato e nebbia dinamica.
 * Include transizione animata e viraggio cromatico al ripristino dell'isola.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.2.0
 */

import * as THREE from 'three';
import { globalEventBus } from '../core/EventBus';

export class Environment {
  public scene: THREE.Scene;
  public sunLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public seaMesh: THREE.Mesh;
  public fog: THREE.FogExp2;

  private waveTimer = 0;

  // Gestione transizione nebbia e colori
  private currentDensity = 0.018;
  private targetDensity = 0.018;

  private restoredSkyColor = new THREE.Color(0x8ecae6); // Turchese dorato caldo e luminoso
  private currentSkyColor = new THREE.Color(0xa3b8cc);

  private isTransitioning = false;
  private transitionProgress = 0; // 0 (nebbioso) a 1 (risvegliato)

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // 1. Nebbia semplice iniziale
    this.fog = new THREE.FogExp2(0xa3b8cc, this.currentDensity);
    this.scene.fog = this.fog;
    this.scene.background = this.currentSkyColor.clone();

    // 2. Luce emisferica
    this.hemiLight = new THREE.HemisphereLight(0xe8f0fe, 0x506575, 1.1);
    this.scene.add(this.hemiLight);

    // 3. Sole Toon (luce direzionale dorata)
    this.sunLight = new THREE.DirectionalLight(0xfff1cc, 1.4);
    this.sunLight.position.set(30, 45, 25);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 120;
    this.sunLight.shadow.camera.left = -25;
    this.sunLight.shadow.camera.right = 25;
    this.sunLight.shadow.camera.top = 25;
    this.sunLight.shadow.camera.bottom = -25;
    this.sunLight.shadow.bias = -0.001;
    this.scene.add(this.sunLight);

    // 4. Mare calmo cartoon con vertici animati
    const seaGeom = new THREE.PlaneGeometry(240, 240, 32, 32);
    seaGeom.rotateX(-Math.PI / 2);

    const seaMaterial = new THREE.MeshToonMaterial({
      color: 0x4895ef,
      transparent: true,
      opacity: 0.88,
    });

    this.seaMesh = new THREE.Mesh(seaGeom, seaMaterial);
    this.seaMesh.position.y = -0.4;
    this.seaMesh.receiveShadow = true;
    this.scene.add(this.seaMesh);

    this.initEventListeners();
  }

  private initEventListeners(): void {
    // Riceve evento di ritrovamento frammento
    globalEventBus.on<{ fragmentIndex: number; collected: number; total: number }>(
      'fragment-collected',
      ({ collected, total }) => {
        this.triggerIslandRestoration(collected, total);
      }
    );
  }

  /**
   * Attiva l'effetto visibile di ritirata della nebbia e viraggio cromatico.
   */
  public triggerIslandRestoration(collected: number, total: number): void {
    // Progresso globale (1/7 = ~0.1428)
    const progress = collected / total;

    // Formula calibrazione: scende nettamente a 0.008 sull'isola iniziale per effetto marcato
    this.targetDensity = Math.max(
      0.005,
      0.018 * (1 - progress * 0.7) - (collected >= 1 ? 0.008 : 0)
    );
    this.isTransitioning = true;
  }

  /**
   * Aggiorna onde del mare e interpolazione animata della nebbia.
   */
  public update(dt: number): void {
    // 1. Animazione onde del mare
    this.waveTimer += dt * 1.5;
    const posAttr = this.seaMesh.geometry.attributes.position;
    const count = posAttr.count;

    for (let i = 0; i < count; i++) {
      const u = posAttr.getX(i);
      const w = posAttr.getZ(i);
      const wave =
        Math.sin(u * 0.15 + this.waveTimer) * 0.12 +
        Math.cos(w * 0.15 + this.waveTimer * 0.8) * 0.08;
      posAttr.setY(i, wave);
    }
    posAttr.needsUpdate = true;
    this.seaMesh.geometry.computeVertexNormals();

    // 2. Interpolazione animata della nebbia e dei colori caldi
    if (this.isTransitioning) {
      this.transitionProgress += dt * 0.35; // Transizione dolce su circa 3 secondi
      if (this.transitionProgress >= 1.0) {
        this.transitionProgress = 1.0;
        this.isTransitioning = false;
      }

      // Densità nebbia
      this.currentDensity = THREE.MathUtils.lerp(this.currentDensity, this.targetDensity, dt * 1.8);
      this.fog.density = this.currentDensity;

      // Viraggio cromatico cielo e nebbia
      this.currentSkyColor.lerp(this.restoredSkyColor, dt * 1.5);
      this.fog.color.copy(this.currentSkyColor);
      (this.scene.background as THREE.Color).copy(this.currentSkyColor);

      // Riscaldamento luce solare
      this.sunLight.intensity = THREE.MathUtils.lerp(1.4, 1.85, this.transitionProgress);
    }
  }

  public getFogDensity(): number {
    return this.fog.density;
  }

  public isRestored(): boolean {
    return this.transitionProgress > 0.5;
  }
}
