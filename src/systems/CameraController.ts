/**
 * Controllore telecamera in terza persona orbitale con smooth follow.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.1.0
 */

import * as THREE from 'three';
import { InputManager } from './InputManager';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  public yaw = 0; // Rotazione orizzontale
  public pitch = 0.35; // Inclinazione verticale (~20 gradi)

  public distance = 5.8; // Distanza dal personaggio
  public targetHeight = 1.3; // Punto di mira (altezza torace/testa di Pip)

  private readonly minPitch = -0.1; // Limite inferiore (non scendere sotto il terreno)
  private readonly maxPitch = 1.25; // Limite superiore (~70 gradi)

  private currentTarget = new THREE.Vector3();
  private desiredCameraPos = new THREE.Vector3();

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  /**
   * Aggiorna posizione e orientamento della telecamera.
   * @param dt Delta time in secondi.
   * @param playerPos Posizione attuale del giocatore.
   * @param inputManager Gestore degli input per rotazione mouse/touch.
   */
  public update(dt: number, playerPos: THREE.Vector3, inputManager: InputManager): void {
    const delta = inputManager.consumeCameraDelta();
    this.yaw -= delta.x;
    this.pitch -= delta.y;

    // Clamping dell'angolo di pitch
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));

    // Punto focale verso cui guarda la telecamera
    const targetPoint = new THREE.Vector3(
      playerPos.x,
      playerPos.y + this.targetHeight,
      playerPos.z
    );

    // Inseguimento morbido del target (lerp)
    const smoothFactor = Math.min(1.0, dt * 10.0);
    this.currentTarget.lerp(targetPoint, smoothFactor);

    // Calcolo posizione sferica orbitale
    const horizontalDist = this.distance * Math.cos(this.pitch);
    const verticalDist = this.distance * Math.sin(this.pitch);

    this.desiredCameraPos.x = this.currentTarget.x + horizontalDist * Math.sin(this.yaw);
    this.desiredCameraPos.y = this.currentTarget.y + verticalDist;
    this.desiredCameraPos.z = this.currentTarget.z + horizontalDist * Math.cos(this.yaw);

    // Smorzamento del movimento della camera
    this.camera.position.lerp(this.desiredCameraPos, Math.min(1.0, dt * 12.0));
    this.camera.lookAt(this.currentTarget);
  }
}
