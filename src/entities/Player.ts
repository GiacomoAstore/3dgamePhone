/**
 * Entità Giocatore (Pip) con fisica, controller di movimento e animazioni procedurali.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.0
 */

import * as THREE from 'three';
import { ProceduralPip, PipMeshComponents } from './ProceduralPip';
import { InputManager } from '../systems/InputManager';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { globalEventBus } from '../core/EventBus';
import type { QualityPreset } from '../ui/QualitySettingsUI';

export class Player {
  public meshComponents: PipMeshComponents;
  public position: THREE.Vector3 = new THREE.Vector3(0, 2, 0);
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

  constructor() {
    this.meshComponents = ProceduralPip.create();
    this.meshComponents.root.position.copy(this.position);
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

    // Se per qualche motivo si cade sotto il mare (y < -5), respawn sull'isola
    if (this.position.y < -5.0) {
      this.position.set(0, 3, 0);
      this.velocity.set(0, 0, 0);
    }

    // 6. Aggiorna posizione visiva del gruppo 3D
    this.meshComponents.root.position.copy(this.position);

    // 7. Animazioni procedurali di camminata/salto
    this.updateProceduralAnimation(clampedDt, inputMove.length);
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
   * Adatta la visibilità del contorno toon al profilo qualitativo (disattivato su 'low').
   */
  public setQuality(quality: QualityPreset): void {
    ProceduralPip.setOutlineVisible(this.meshComponents.root, quality !== 'low');
  }
}
