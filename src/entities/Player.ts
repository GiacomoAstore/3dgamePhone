/**
 * Entità Giocatore (Pip) con fisica, controller di movimento e animazioni procedurali.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.3.9 (rimozione mesh primitive con modello GLB attivo e disattivazione ombre su profilo Bassa)
 */

import * as THREE from 'three';
import { ProceduralPip, PipMeshComponents } from './ProceduralPip';
import { InputManager } from '../systems/InputManager';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { globalEventBus } from '../core/EventBus';
import { AssetManager } from '../core/AssetManager';
import type { QualityPreset } from '../ui/QualitySettingsUI';

export class Player {
  public meshComponents: PipMeshComponents;
  public position: THREE.Vector3 = new THREE.Vector3(0, 4.8, 1.5);
  public spawnPoint: THREE.Vector3 = new THREE.Vector3(0, 4.8, 1.5);
  public velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  // Parametri di movimento (senza numeri magici, configurati qui)
  public readonly walkSpeed = 5.2; // m/s
  public readonly jumpImpulse = 7.8; // m/s
  public readonly gravity = 22.0; // m/s^2
  public readonly turnSpeed = 12.0;

  public isGrounded = false;
  public isLanternActive = true;

  private animTimer = 0;
  private currentAngle = 0;
  private mixer: THREE.AnimationMixer | null = null;
  private actions: Map<string, THREE.AnimationAction> = new Map();
  private currentAction = 'Idle_A';
  private glbModel: THREE.Group | null = null;

  constructor() {
    this.meshComponents = ProceduralPip.create();
    this.meshComponents.root.position.copy(this.position);
    this.loadGLBCharacter();
  }

  /**
   * Posiziona Pip al punto di spawn specificato e ne aggiorna coordinate e mesh.
   */
  public spawnAt(x: number, y: number, z: number): void {
    this.spawnPoint.set(x, y, z);
    this.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.isGrounded = true;
    this.meshComponents.root.position.copy(this.position);
  }

  /**
   * Carica in modo asincrono il modello 3D cartoon di Pip (KayKit Rogue Hooded)
   * e le tracce di animazione per movimento, idle e salto.
   */
  private async loadGLBCharacter(): Promise<void> {
    const assetMgr = AssetManager.getInstance();
    const model = await assetMgr.loadModel('pip_rogue', '/models/Rogue_Hooded.glb');
    const moveAnims = await assetMgr.loadAnimations(
      'pip_move',
      '/models/Rig_Medium_MovementBasic.glb'
    );
    const generalAnims = await assetMgr.loadAnimations(
      'pip_general',
      '/models/Rig_Medium_General.glb'
    );

    if (model) {
      const inst = assetMgr.instantiate('pip_rogue');
      if (inst) {
        inst.scale.setScalar(0.7);
        inst.position.set(0, 0, 0);
        assetMgr.applyCartoonShading(inst);
        this.glbModel = inst;
        this.meshComponents.root.add(inst);

        // Rimuove e nasconde TUTTE le parti primitive procedurali per non occupare draw call
        const toRemove = [
          this.meshComponents.body,
          this.meshComponents.head,
          this.meshComponents.hat,
          this.meshComponents.leftArm,
          this.meshComponents.rightArm,
          this.meshComponents.leftLeg,
          this.meshComponents.rightLeg,
          this.meshComponents.scarfTail,
        ];
        toRemove.forEach((part) => {
          if (part && part.parent) {
            part.parent.remove(part);
          }
          if (part) part.visible = false;
        });

        // Aggancia la lanterna allo slot naturale della mano destra
        const handslot = inst.getObjectByName('handslotr');
        if (handslot && this.meshComponents.lantern) {
          handslot.add(this.meshComponents.lantern);
          this.meshComponents.lantern.position.set(0, -0.1, 0.05);
          this.meshComponents.lantern.scale.setScalar(1.3);
        }

        // Setup animazioni con loop corretto
        this.mixer = new THREE.AnimationMixer(inst);
        const allClips = [...moveAnims, ...generalAnims];
        for (const clip of allClips) {
          const action = this.mixer.clipAction(clip);
          action.setLoop(THREE.LoopRepeat, Infinity);
          this.actions.set(clip.name, action);
        }

        const idleAct = this.actions.get('Idle_A');
        if (idleAct) {
          idleAct.play();
          this.currentAction = 'Idle_A';
        }
      }
    }
  }

  /**
   * Aggiorna lo stato di Pip in base a input e delta time.
   * @param dt Delta time in secondi.
   * @param inputManager Gestore degli input.
   * @param physicsSystem Sistema di rilevamento del terreno.
   * @param cameraAngle Angolo di imbardata della telecamera (in radianti).
   */
  public update(
    dt: THREE.Clock | number,
    inputManager: InputManager,
    physicsSystem: PhysicsSystem,
    cameraAngle: number
  ): void {
    const delta = typeof dt === 'number' ? dt : dt.getDelta();
    // Clamping del delta per prevenire salti fisici in caso di lag o freeze
    const clampedDt = Math.min(delta, 0.08);

    // 1. Calcolo direzione di movimento relativa alla telecamera
    const inputMove = inputManager.getMovement();
    const moveVector = new THREE.Vector3(0, 0, 0);

    if (inputMove.length > 0.05) {
      // Proietta l'input rispetto all'orientamento orizzontale della camera
      const moveAngle = Math.atan2(inputMove.x, inputMove.z) + cameraAngle;
      moveVector.x = Math.sin(moveAngle) * inputMove.length * this.walkSpeed;
      moveVector.z = Math.cos(moveAngle) * inputMove.length * this.walkSpeed;

      // Rotazione morbida verso la direzione di marcia
      const targetAngle = moveAngle;
      const angleDiff = Math.atan2(
        Math.sin(targetAngle - this.currentAngle),
        Math.cos(targetAngle - this.currentAngle)
      );
      this.currentAngle += angleDiff * Math.min(1.0, this.turnSpeed * clampedDt);
      this.meshComponents.root.rotation.y = this.currentAngle;
    }

    // 3. Verifica collisioni orizzontali
    const horizDir = new THREE.Vector3(moveVector.x, 0, moveVector.z);
    const horizLen = horizDir.length() * clampedDt;
    if (horizLen > 0.001) {
      horizDir.normalize();
      const slideDir = physicsSystem.checkHorizontalCollision(this.position, horizDir, horizLen);
      this.position.x += slideDir.x * horizLen;
      this.position.z += slideDir.z * horizLen;
      this.velocity.x = slideDir.x * (horizLen / clampedDt);
      this.velocity.z = slideDir.z * (horizLen / clampedDt);
    } else {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }

    // 4. Salto e Gravità verticale
    const wasGrounded = this.isGrounded;
    if (this.isGrounded) {
      if (inputManager.consumeJump()) {
        this.velocity.y = this.jumpImpulse;
        this.isGrounded = false;
        globalEventBus.emit('player-jump');
      } else {
        this.velocity.y = 0;
      }
    } else {
      this.velocity.y -= this.gravity * clampedDt;
    }

    this.position.y += this.velocity.y * clampedDt;

    // 5. Rilevamento terreno e aggancio a terra con ground-snapping
    const groundInfo = physicsSystem.checkGround(this.position, wasGrounded);
    if (groundInfo.isGrounded && this.velocity.y <= 0) {
      this.position.y = groundInfo.groundHeight;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else if (this.position.y < groundInfo.groundHeight) {
      // Protezione anti-compenetrazione
      this.position.y = groundInfo.groundHeight;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // Se per qualche motivo si cade sotto il mare (y < -5), respawn sull'isola al punto sicuro
    if (this.position.y < -5.0) {
      this.position.copy(this.spawnPoint);
      this.velocity.set(0, 0, 0);
      this.isGrounded = true;
    }

    // 6. Aggiorna posizione visiva del gruppo 3D
    this.meshComponents.root.position.copy(this.position);

    // 7. Animazioni scheletriche (modello 3D GLB) o procedurali di fallback
    if (this.mixer) {
      this.mixer.update(clampedDt);
      let desiredAction = 'Idle_A';
      if (!this.isGrounded) {
        desiredAction = 'Jump_Idle';
      } else if (inputMove.length > 0.05) {
        desiredAction = inputMove.length > 0.7 ? 'Running_A' : 'Walking_A';
        // Genera passi audio
        const prevTimer = this.animTimer;
        this.animTimer += clampedDt * 11.0;
        if (Math.floor(this.animTimer / Math.PI) > Math.floor(prevTimer / Math.PI)) {
          globalEventBus.emit('player-footstep');
        }
      }

      if (this.currentAction !== desiredAction && this.actions.has(desiredAction)) {
        const prev = this.actions.get(this.currentAction);
        const next = this.actions.get(desiredAction);
        if (prev && next) {
          prev.fadeOut(0.15);
          next.reset().fadeIn(0.15).play();
          this.currentAction = desiredAction;
        }
      }
    } else {
      this.updateProceduralAnimation(clampedDt, inputMove.length);
    }
  }

  /**
   * Applica oscillazioni procedurali a gambe, braccia e corpo in base al movimento.
   */
  private updateProceduralAnimation(dt: number, speedRatio: number): void {
    if (this.isGrounded) {
      if (speedRatio > 0.1) {
        // Corsa/camminata
        const prevTimer = this.animTimer;
        this.animTimer += dt * 11.0;

        // Emette l'evento del passo a ogni mezza oscillazione della falcata
        if (Math.floor(this.animTimer / Math.PI) > Math.floor(prevTimer / Math.PI)) {
          globalEventBus.emit('player-footstep');
        }

        const swing = Math.sin(this.animTimer) * 0.45;
        this.meshComponents.leftLeg.rotation.x = swing;
        this.meshComponents.rightLeg.rotation.x = -swing;
        this.meshComponents.leftArm.rotation.x = -swing * 0.8;
        this.meshComponents.rightArm.rotation.x = swing * 0.8;
        // Piccolo rimbalzo verticale del corpo
        this.meshComponents.body.position.y = 0.56 + Math.abs(Math.sin(this.animTimer)) * 0.05;
        // Sciarpa svolazzante indietro nella corsa
        this.meshComponents.scarfTail.rotation.x = -0.45 + Math.sin(this.animTimer * 1.5) * 0.15;
      } else {
        // Idle (respiro dolce)
        this.animTimer += dt * 2.5;
        const breath = Math.sin(this.animTimer) * 0.02;
        this.meshComponents.body.position.y = 0.56 + breath;
        this.meshComponents.head.position.y = 1.05 + breath * 1.2;
        this.meshComponents.leftLeg.rotation.x = 0;
        this.meshComponents.rightLeg.rotation.x = 0;
        this.meshComponents.leftArm.rotation.x = 0;
        this.meshComponents.rightArm.rotation.x = 0;
        this.meshComponents.scarfTail.rotation.x = -0.15 + Math.sin(this.animTimer * 0.8) * 0.06;
      }
    } else {
      // In aria (salto): gambe leggermente piegate e braccia aperte
      this.meshComponents.leftLeg.rotation.x = 0.25;
      this.meshComponents.rightLeg.rotation.x = -0.25;
      this.meshComponents.leftArm.rotation.z = 0.35;
      this.meshComponents.rightArm.rotation.z = -0.35;
      this.meshComponents.scarfTail.rotation.x = 0.3;
    }
  }

  /**
   * Adatta la visibilità del contorno toon e le ombre del modello GLB al profilo qualitativo (disattivato su 'low').
   */
  public setQuality(quality: QualityPreset): void {
    ProceduralPip.setOutlineVisible(this.meshComponents.root, quality !== 'low');
    if (this.glbModel) {
      this.glbModel.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          c.castShadow = quality !== 'low';
        }
      });
    }
  }
}
