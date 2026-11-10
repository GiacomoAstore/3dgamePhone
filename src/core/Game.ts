/**
 * Loop principale e coordinatore del motore di gioco di Brumavento.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.1.0
 */

import * as THREE from 'three';
import { StateManager, GameState } from './GameState';
import { globalEventBus } from './EventBus';
import { TouchOverlay } from '../ui/TouchOverlay';
import { InputManager } from '../systems/InputManager';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { CameraController } from '../systems/CameraController';
import { Environment } from '../world/Environment';
import { Island } from '../world/Island';
import { Player } from '../entities/Player';

export type QualityPreset = 'low' | 'medium' | 'high';

export class Game {
  public renderer!: THREE.WebGLRenderer;
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;

  public stateManager: StateManager;
  public touchOverlay: TouchOverlay;
  public inputManager: InputManager;
  public physicsSystem: PhysicsSystem;
  public cameraController: CameraController;

  public environment!: Environment;
  public island!: Island;
  public player!: Player;

  private clock: THREE.Clock;
  private isRunning = false;

  // Monitoraggio FPS e prestazioni
  private fpsCounterElement: HTMLElement | null;
  private frameCount = 0;
  private fpsTimeAccumulator = 0;
  private currentFps = 60;

  constructor(canvas: HTMLCanvasElement) {
    this.stateManager = new StateManager();
    this.clock = new THREE.Clock();
    this.fpsCounterElement = document.getElementById('fps-counter');

    // 1. Inizializzazione Three.js WebGL Renderer
    this.initRenderer(canvas);

    // 2. Scena e Telecamera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
    this.cameraController = new CameraController(this.camera);

    // 3. Sistemi core
    this.physicsSystem = new PhysicsSystem();
    this.touchOverlay = new TouchOverlay();
    this.inputManager = new InputManager(this.touchOverlay);

    // 4. Creazione Mondo e Personaggio
    this.environment = new Environment(this.scene);
    this.island = new Island(this.physicsSystem);
    this.scene.add(this.island.group);

    this.player = new Player();
    this.scene.add(this.player.meshComponents.root);

    // Posiziona Pip sul centro della collina
    this.player.position.set(0, 5, 0);

    // 5. Eventi di ridimensionamento finestra/orientamento
    window.addEventListener('resize', () => this.onWindowResize());

    // 6. Configurazione iniziale qualità (predisposizione)
    this.setQuality('high');
  }

  /**
   * Configura il renderer con vincoli mobile-first (pixel ratio clampato a 2).
   */
  private initRenderer(canvas: HTMLCanvasElement): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Mobile Budget: Clamping rigido del Device Pixel Ratio a 2.0 (ADR 003)
    const clampedDPR = Math.min(window.devicePixelRatio || 1, 2.0);
    this.renderer.setPixelRatio(clampedDPR);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
  }

  /**
   * Avvia il ciclo di gioco continuo.
   */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this.stateManager.setState(GameState.PLAYING);
    this.loop();
  }

  /**
   * Loop principale con requestAnimationFrame e tempo a passo controllato.
   */
  private loop = (): void => {
    if (!this.isRunning) return;
    requestAnimationFrame(this.loop);

    const dt = this.clock.getDelta();

    // Aggiornamento logica di gioco (update)
    if (this.stateManager.getState() === GameState.PLAYING) {
      this.update(dt);
    }

    // Rendering a schermo (render)
    this.render();

    // Calcolo FPS
    this.updateFps(dt);
  };

  /**
   * Logica di aggiornamento disaccoppiata dal render.
   */
  private update(dt: number): void {
    // 1. Aggiorna animazioni dell'ambiente (onde)
    this.environment.update(dt);

    // 2. Aggiorna Pip con input, collisioni e orientamento camera
    this.player.update(dt, this.inputManager, this.physicsSystem, this.cameraController.yaw);

    // 3. Aggiorna telecamera orbitale
    this.cameraController.update(dt, this.player.position, this.inputManager);
  }

  /**
   * Disegno del frame su WebGL.
   */
  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Calcola il framerate istantaneo e aggiorna il badge di debug.
   */
  private updateFps(dt: number): void {
    this.frameCount++;
    this.fpsTimeAccumulator += dt;

    if (this.fpsTimeAccumulator >= 0.5) {
      this.currentFps = Math.round(this.frameCount / this.fpsTimeAccumulator);
      this.frameCount = 0;
      this.fpsTimeAccumulator = 0;

      if (this.fpsCounterElement) {
        this.fpsCounterElement.textContent = `${this.currentFps} FPS`;
      }
      globalEventBus.emit('fps-updated', this.currentFps);
    }
  }

  /**
   * Predisposizione profili di qualità grafica (Bassa, Media, Alta).
   */
  public setQuality(quality: QualityPreset): void {
    const dpr = window.devicePixelRatio || 1;
    switch (quality) {
      case 'low':
        this.renderer.setPixelRatio(1.0);
        this.renderer.shadowMap.enabled = false;
        break;
      case 'medium':
        this.renderer.setPixelRatio(Math.min(dpr, 1.4));
        this.renderer.shadowMap.enabled = true;
        break;
      case 'high':
      default:
        this.renderer.setPixelRatio(Math.min(dpr, 2.0));
        this.renderer.shadowMap.enabled = true;
        break;
    }
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
