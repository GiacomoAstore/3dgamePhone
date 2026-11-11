/**
 * Sistema di fisica, collisioni orizzontali e rilevamento terreno con accelerazione BVH.
 * Include gestione pendenze (slope handling), scivolamento su pareti ripide e ground-snapping in discesa.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.1
 */

import * as THREE from 'three';
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh';

// Abilita il raycasting accelerato su tutte le mesh Three.js
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export interface GroundCheckResult {
  isGrounded: boolean;
  groundHeight: number;
  groundNormal: THREE.Vector3;
  distance: number;
}

export class PhysicsSystem {
  private colliderMeshes: THREE.Mesh[] = [];
  private raycaster: THREE.Raycaster;
  private downDirection = new THREE.Vector3(0, -1, 0);

  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.raycaster.firstHitOnly = true;
  }

  /**
   * Registra una mesh come superficie di collisione e ne genera il BVH.
   */
  public addColliderMesh(mesh: THREE.Mesh): void {
    if (!mesh.geometry.boundsTree) {
      mesh.geometry.boundsTree = new MeshBVH(mesh.geometry);
    }
    this.colliderMeshes.push(mesh);
  }

  /**
   * Rimuove una mesh dai collider.
   */
  public removeColliderMesh(mesh: THREE.Mesh): void {
    this.colliderMeshes = this.colliderMeshes.filter((m) => m !== mesh);
  }

  /**
   * Esegue un raycast verso il basso con supporto a ground-snapping in discesa.
   * @param position Posizione centrale del personaggio.
   * @param wasGrounded Se il personaggio era a terra nel frame precedente.
   * @param castHeight Altezza da cui scoccare il raggio.
   * @param maxDistance Distanza massima di ricerca.
   */
  public checkGround(
    position: THREE.Vector3,
    wasGrounded = false,
    castHeight = 1.0,
    maxDistance = 6.0
  ): GroundCheckResult {
    const origin = new THREE.Vector3(position.x, position.y + castHeight, position.z);
    this.raycaster.set(origin, this.downDirection);
    this.raycaster.far = maxDistance;

    const intersections = this.raycaster.intersectObjects(this.colliderMeshes, false);

    if (intersections.length > 0) {
      const hit = intersections[0];
      const groundHeight = hit.point.y;
      const verticalDiff = position.y - groundHeight;

      // Tolleranza: se era a terra estendiamo a 0.50m (ground-snapping per pendenze in discesa)
      const snapThreshold = wasGrounded ? 0.50 : 0.20;
      const isGrounded = verticalDiff <= snapThreshold && verticalDiff >= -0.4;

      return {
        isGrounded,
        groundHeight,
        groundNormal: hit.face ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0),
        distance: castHeight - verticalDiff,
      };
    }

    return {
      isGrounded: false,
      groundHeight: -999,
      groundNormal: new THREE.Vector3(0, 1, 0),
      distance: 999,
    };
  }

  /**
   * Verifica le collisioni orizzontali evitando di bloccare Pip su pendenze calpestabili.
   * Se la pendenza della superficie è < 55° (normal.y >= 0.55), non è considerata un muro.
   * Se è una parete ripida, fa scivolare il movimento sul piano della normale orizzontale.
   */
  public checkHorizontalCollision(
    currentPos: THREE.Vector3,
    moveDir: THREE.Vector3,
    moveDist: number,
    capsuleRadius = 0.35
  ): THREE.Vector3 {
    if (moveDist <= 0.0001) return moveDir.clone();

    // Raggio a mezza altezza del busto di Pip
    const origin = new THREE.Vector3(currentPos.x, currentPos.y + 0.35, currentPos.z);
    this.raycaster.set(origin, moveDir);
    this.raycaster.far = moveDist + capsuleRadius;

    const hits = this.raycaster.intersectObjects(this.colliderMeshes, false);
    if (hits.length > 0 && hits[0].distance < moveDist + capsuleRadius) {
      const normal = hits[0].face ? hits[0].face.normal : new THREE.Vector3(0, 1, 0);

      // 1. Se è una superficie calpestabile (inclinazione < 55 gradi), non bloccare il movimento!
      if (normal.y >= 0.55) {
        return moveDir.clone();
      }

      // 2. Se è una parete ripida o una roccia, proietta e scivola lungo la parete
      const horizNorm = new THREE.Vector3(normal.x, 0, normal.z);
      if (horizNorm.lengthSq() > 0.001) {
        horizNorm.normalize();
        const dot = moveDir.x * horizNorm.x + moveDir.z * horizNorm.z;
        if (dot < 0) {
          // Rimuove la componente diretta contro la parete
          const slide = moveDir.clone().sub(horizNorm.clone().multiplyScalar(dot));
          return slide;
        }
      }
    }

    return moveDir.clone();
  }
}
