/**
 * Ambiente di gioco di Brumavento: illuminazione toon, ciclo giorno/notte,
 * cielo dinamico, mare animato, nebbia progressiva e sistema particellare.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.3.9 (environment.json come unica fonte di verità per targetDensity della nebbia: 0.008)
 */

import * as THREE from 'three';
import envConfig from '../data/environment.json';
import { globalEventBus } from '../core/EventBus';
import { DayNightCycle } from '../systems/DayNightCycle';
import { ParticleSystem } from './ParticleSystem';
import { QualityPreset } from '../core/Game';

export class Environment {
  public scene: THREE.Scene;
  public sunLight: THREE.DirectionalLight;
  public moonLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public seaMesh: THREE.Mesh;
  public fog: THREE.FogExp2;

  // Corpi celesti
  public sunMesh: THREE.Mesh;
  public moonMesh: THREE.Mesh;

  // Sistemi d'atmosfera
  public dayNightCycle: DayNightCycle;
  public particleSystem: ParticleSystem;

  private waveTimer = 0;

  // Configurazione riutilizzabile da environment.json per tutte le isole future
  private readonly config = envConfig.atmosphere;

  private currentDensity = envConfig.atmosphere.fog.initialDensity;
  private targetDensity = envConfig.atmosphere.fog.initialDensity;

  private isRestoredState = false;
  private isTransitioning = false;
  private transitionProgress = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // 1. Ciclo Giorno / Notte e Particelle
    this.dayNightCycle = new DayNightCycle();
    this.particleSystem = new ParticleSystem();
    this.scene.add(this.particleSystem.group);

    // 2. Nebbia esponenziale
    this.fog = new THREE.FogExp2(this.config.fog.initialColor, this.currentDensity);
    this.scene.fog = this.fog;
    this.scene.background = new THREE.Color(this.config.fog.initialColor);

    // 3. Luce emisferica d'ambiente
    this.hemiLight = new THREE.HemisphereLight(0xe8f0fe, 0x3a4b5c, 1.1);
    this.scene.add(this.hemiLight);

    // 4. Sole Toon (luce direzionale dorata)
    this.sunLight = new THREE.DirectionalLight(
      this.config.sun.color,
      this.config.sun.initialIntensity
    );
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 140;
    this.sunLight.shadow.camera.left = -30;
    this.sunLight.shadow.camera.right = 30;
    this.sunLight.shadow.camera.top = 30;
    this.sunLight.shadow.camera.bottom = -30;
    this.sunLight.shadow.bias = -0.001;
    this.scene.add(this.sunLight);

    // Sfera visibile del Sole
    const sunGeom = new THREE.SphereGeometry(2.5, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff0a8 });
    this.sunMesh = new THREE.Mesh(sunGeom, sunMat);
    this.scene.add(this.sunMesh);

    // 5. Luce lunare notturna (luce direzionale argentata morbida, senza ombre per risparmiare draw call)
    this.moonLight = new THREE.DirectionalLight(0xaed0ee, 0.0);
    this.moonLight.castShadow = false;
    this.scene.add(this.moonLight);

    // Sfera visibile della Luna
    const moonGeom = new THREE.SphereGeometry(1.8, 16, 16);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xe8f2ff });
    this.moonMesh = new THREE.Mesh(moonGeom, moonMat);
    this.scene.add(this.moonMesh);

    // 6. Mare calmo cartoon con vertici animati
    const seaGeom = new THREE.PlaneGeometry(240, 240, 32, 32);
    seaGeom.rotateX(-Math.PI / 2);

    const seaMaterial = new THREE.MeshToonMaterial({
      color: new THREE.Color(this.config.sea.color),
      transparent: true,
      opacity: this.config.sea.opacity,
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
   * La densità target è letta direttamente dal file di configurazione environment.json (unica fonte di verità).
   */
  public triggerIslandRestoration(_collected: number, _total: number): void {
    // Lettura diretta da environment.json: restoredDensity = 0.008
    this.targetDensity = this.config.fog.restoredDensity;
    this.isTransitioning = true;
    this.isRestoredState = true;
  }

  /**
   * Aggiorna sole, luna, illuminazione, nebbia, onde e particelle.
   */
  public update(dt: number): void {
    // 1. Avanzamento del ciclo giorno / notte
    this.dayNightCycle.update(dt);

    const sunPos = this.dayNightCycle.getSunPosition();
    const moonPos = this.dayNightCycle.getMoonPosition();

    // Posizionamento luci e mesh celesti
    this.sunLight.position.copy(sunPos);
    this.sunMesh.position.copy(sunPos);

    this.moonLight.position.copy(moonPos);
    this.moonMesh.position.copy(moonPos);

    // Intensità in base all'arco celeste
    this.sunLight.intensity = this.dayNightCycle.getSunIntensity();
    this.moonLight.intensity = this.dayNightCycle.getMoonIntensity();
    this.hemiLight.intensity = this.dayNightCycle.getAmbientIntensity();

    // 2. Colore del cielo e della nebbia interpolato
    const currentSkyColor = this.dayNightCycle.getInterpolatedSkyColor(this.isRestoredState);
    (this.scene.background as THREE.Color).copy(currentSkyColor);
    this.fog.color.copy(currentSkyColor);

    // 3. Animazione onde del mare
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

    // 4. Transizione ritirata nebbia al ritrovamento dei frammenti
    if (this.isTransitioning) {
      this.transitionProgress += dt * 0.35;
      if (this.transitionProgress >= 1.0) {
        this.transitionProgress = 1.0;
        this.isTransitioning = false;
      }
      this.currentDensity = THREE.MathUtils.lerp(this.currentDensity, this.targetDensity, dt * 1.8);
      this.fog.density = this.currentDensity;
    }

    // 5. Aggiornamento particelle atmosferiche (lucciole, polline, spuma, stelle)
    const isNightPhase =
      this.dayNightCycle.getPhase() === 'night' || this.dayNightCycle.getPhase() === 'sunset';
    this.particleSystem.update(dt, isNightPhase);
  }

  /**
   * Adatta la qualità dell'ambiente in base al preset grafico.
   */
  public setQuality(quality: QualityPreset): void {
    this.particleSystem.setQuality(quality);
    if (quality === 'low') {
      this.sunLight.castShadow = false;
    } else {
      this.sunLight.castShadow = true;
    }
  }

  public getFogDensity(): number {
    return this.fog.density;
  }

  public isRestored(): boolean {
    return this.isRestoredState;
  }
}
