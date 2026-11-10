/**
 * Loop principale e coordinatore del motore di gioco di Brumavento (Fase 3).
 * Integra sistemi, dialoghi, missioni, ciclo circadiano, audio procedurale,
 * consumo dell'azione con priorità rigorosa e gestione dinamica della qualità grafica.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.0
 */

import * as THREE from 'three';
import { StateManager, GameState } from './GameState';
import { globalEventBus } from './EventBus';
import { TouchOverlay } from '../ui/TouchOverlay';
import { InputManager } from '../systems/InputManager';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { CameraController } from '../systems/CameraController';
import { DialogueSystem } from '../systems/DialogueSystem';
import { QuestSystem } from '../systems/QuestSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { ActionPriorityDispatcher } from '../systems/ActionPriorityDispatcher';
import { AudioSystem } from '../systems/AudioSystem';
import { LocalizationSystem } from '../systems/LocalizationSystem';
import { Environment } from '../world/Environment';
import { Island } from '../world/Island';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { CollectiblesManager } from '../entities/Collectibles';
import { DialogueBox } from '../ui/DialogueBox';
import { JournalUI } from '../ui/JournalUI';
import { QualitySettingsUI } from '../ui/QualitySettingsUI';
import { NotificationBanner } from '../ui/NotificationBanner';

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

  // Sistemi logici e audio
  public dialogueSystem: DialogueSystem;
  public questSystem: QuestSystem;
  public interactionSystem: InteractionSystem;
  public audioSystem: AudioSystem;

  // Mondo ed entità
  public environment!: Environment;
  public island!: Island;
  public player!: Player;
  public nonnaBussola!: NPC;
  public collectiblesManager!: CollectiblesManager;

  // UI
  public dialogueBox!: DialogueBox;
  public journalUI!: JournalUI;
  public qualitySettingsUI!: QualitySettingsUI;
  public notificationBanner!: NotificationBanner;

  private clock: THREE.Clock;
  private isRunning = false;

  // Monitoraggio FPS e degradazione automatica per hardware modesti
  private fpsCounterElement: HTMLElement | null;
  private frameCount = 0;
  private fpsTimeAccumulator = 0;
  private currentFps = 60;
  private lowFpsDuration = 0;
  private autoDegradeCooldown = 0;

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

    // 3. Sistemi core e input
    this.physicsSystem = new PhysicsSystem();
    this.touchOverlay = new TouchOverlay();
    this.inputManager = new InputManager(this.touchOverlay);

    // 4. Sistemi logici e audio
    this.dialogueSystem = new DialogueSystem();
    this.questSystem = new QuestSystem();
    this.interactionSystem = new InteractionSystem();
    this.audioSystem = new AudioSystem();

    // 5. Creazione Mondo e Isola
    this.environment = new Environment(this.scene);
    this.island = new Island(this.physicsSystem);
    this.scene.add(this.island.group);

    // 6. Entità
    this.player = new Player();
    this.scene.add(this.player.meshComponents.root);
    this.player.position.set(0, 5, 0);

    // Nonna Bussola all'osservatorio
    this.nonnaBussola = new NPC('nonna_bussola', 'Nonna Bussola', new THREE.Vector3(0, 3.8, -2));
    this.scene.add(this.nonnaBussola.group);

    this.interactionSystem.registerTarget({
      id: 'nonna_bussola',
      name: 'Nonna Bussola',
      position: this.nonnaBussola.position,
      radius: this.nonnaBussola.interactionRadius,
      type: 'npc',
      hintText: LocalizationSystem.t('ui.prompt_talk', { name: 'Nonna Bussola' }),
    });

    // Indizio cerchio di pietre per il frammento
    this.interactionSystem.registerTarget({
      id: 'stone_circle_hint',
      name: 'Cerchio di Pietre',
      position: new THREE.Vector3(18.0, 1.8, -15.0),
      radius: 3.5,
      type: 'hint',
      hintText: 'Un bagliore pulsa qui... Accendi la Lanterna (E / 🏮) per rivelarlo!',
    });

    // Collezionabili e frammento magico
    this.collectiblesManager = new CollectiblesManager();
    this.scene.add(this.collectiblesManager.group);

    // 7. Componenti UI
    this.dialogueBox = new DialogueBox(this.dialogueSystem);
    this.journalUI = new JournalUI(this.questSystem);
    this.notificationBanner = new NotificationBanner();
    this.qualitySettingsUI = new QualitySettingsUI({
      onQualityChange: (quality) => this.setQuality(quality),
      audioSystem: this.audioSystem,
      dayNightCycle: this.environment.dayNightCycle,
    });

    // Pulsante Impostazioni Top Bar
    const btnSettings = document.getElementById('btn-hud-settings');
    btnSettings?.addEventListener('click', () => this.qualitySettingsUI.toggle());
    btnSettings?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.qualitySettingsUI.toggle();
    });

    // 8. Eventi di sospensione comandi e resize
    this.initPauseAndBlockListeners();
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private initPauseAndBlockListeners(): void {
    // Sospende gli input durante i dialoghi o con il diario/impostazioni aperti
    globalEventBus.on('dialogue-started', () => {
      this.inputManager.setBlocked(true);
      this.stateManager.setState(GameState.DIALOGUE);
    });

    globalEventBus.on('dialogue-closed', () => {
      if (!this.journalUI.getIsOpen() && !this.qualitySettingsUI.getIsOpen()) {
        this.inputManager.setBlocked(false);
        this.stateManager.setState(GameState.PLAYING);
      }
    });

    globalEventBus.on('journal-opened', () => {
      this.inputManager.setBlocked(true);
      this.stateManager.setState(GameState.PAUSED);
    });

    globalEventBus.on('journal-closed', () => {
      if (!this.dialogueSystem.getIsActive() && !this.qualitySettingsUI.getIsOpen()) {
        this.inputManager.setBlocked(false);
        this.stateManager.setState(GameState.PLAYING);
      }
    });

    globalEventBus.on('settings-opened', () => {
      this.inputManager.setBlocked(true);
      this.stateManager.setState(GameState.PAUSED);
    });

    globalEventBus.on('settings-closed', () => {
      if (!this.dialogueSystem.getIsActive() && !this.journalUI.getIsOpen()) {
        this.inputManager.setBlocked(false);
        this.stateManager.setState(GameState.PLAYING);
      }
    });
  }

  /**
   * Configura il renderer con vincoli mobile-first.
   */
  private initRenderer(canvas: HTMLCanvasElement): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

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
    this.update(dt);

    // Rendering a schermo (render)
    this.render();

    // Calcolo FPS e monitoraggio prestazioni
    this.updateFps(dt);
  };

  /**
   * Logica di aggiornamento disaccoppiata dal render.
   */
  private update(dt: number): void {
    // 1. Aggiorna ambiente (sole, luna, onde, particelle) e isola
    this.environment.update(dt);
    this.island.update(dt);

    // 2. Aggiorna quest system (timer suggerimenti)
    this.questSystem.update(dt);

    // 3. Aggiorna interazioni con target
    const activeTarget = this.interactionSystem.update(
      this.player.position,
      this.player.isLanternActive
    );

    // 4. Consumo dell'azione a priorità unificata (Dialogo -> Interazione -> Lanterna)
    const hasAction = this.inputManager.consumeAction();
    ActionPriorityDispatcher.dispatch(hasAction, {
      isDialogueActive: this.dialogueSystem.getIsActive(),
      activeTarget,
      onAdvanceDialogue: () => {
        this.dialogueBox.advance();
      },
      onInteract: (target) => {
        if (target.type === 'npc' && target.id === 'nonna_bussola') {
          this.nonnaBussola.interact(this.dialogueSystem, this.questSystem);
        }
      },
      onToggleLantern: () => {
        this.player.isLanternActive = !this.player.isLanternActive;
        this.player.meshComponents.lanternLight.intensity = this.player.isLanternActive ? 1.5 : 0.0;
        globalEventBus.emit('lantern-toggled', this.player.isLanternActive);
      },
    });

    // 5. Aggiorna collezionabili e pickup
    this.collectiblesManager.update(
      dt,
      this.player.position,
      this.player.isLanternActive,
      this.questSystem
    );

    // 6. Aggiorna Pip con input, collisioni e orientamento camera
    this.player.update(dt, this.inputManager, this.physicsSystem, this.cameraController.yaw);

    // 7. Aggiorna telecamera orbitale
    this.cameraController.update(dt, this.player.position, this.inputManager);
  }

  /**
   * Disegno del frame su WebGL.
   */
  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Calcola il framerate istantaneo e attiva l'auto-degrade se le prestazioni scendono troppo a lungo.
   */
  private updateFps(dt: number): void {
    this.frameCount++;
    this.fpsTimeAccumulator += dt;

    if (this.autoDegradeCooldown > 0) {
      this.autoDegradeCooldown -= dt;
    }

    if (this.fpsTimeAccumulator >= 0.5) {
      this.currentFps = Math.round(this.frameCount / this.fpsTimeAccumulator);
      this.frameCount = 0;
      this.fpsTimeAccumulator = 0;

      if (this.fpsCounterElement) {
        this.fpsCounterElement.textContent = `${this.currentFps} FPS`;
      }
      globalEventBus.emit('fps-updated', this.currentFps);

      // Rilevamento FPS bassi persistenti (< 26 FPS per oltre 5 secondi)
      if (this.currentFps < 26 && this.autoDegradeCooldown <= 0) {
        this.lowFpsDuration += 0.5;
        if (this.lowFpsDuration >= 5.0) {
          this.lowFpsDuration = 0;
          this.autoDegradeCooldown = 20.0; // Cooldown di sicurezza
          const newPreset = this.qualitySettingsUI.autoDegradeQuality();
          if (newPreset) {
            const msg = LocalizationSystem.t('ui.notification_quality_degraded', {
              level: newPreset.toUpperCase(),
            });
            this.notificationBanner.show(msg);
          }
        }
      } else {
        this.lowFpsDuration = Math.max(0, this.lowFpsDuration - 0.25);
      }
    }
  }

  /**
   * Applicazione del profilo di qualità grafica (Bassa, Media, Alta).
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
        this.renderer.shadowMap.type = THREE.BasicShadowMap;
        break;
      case 'high':
      default:
        this.renderer.setPixelRatio(Math.min(dpr, 2.0));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        break;
    }

    if (this.environment) {
      this.environment.setQuality(quality);
    }
  }

  public getCurrentFps(): number {
    return this.currentFps;
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
