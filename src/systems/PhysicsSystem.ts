/**
 * Sistema di fisica e rilevamento del terreno con accelerazione BVH.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.1.0
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
   * Esegue un raycast verso il basso a partire dalla posizione di Pip.
   * @param position Posizione centrale del personaggio.
   * @param castHeight Altezza da cui scoccare il raggio (default 1.0m sopra i piedi).
   * @param maxDistance Distanza massima di ricerca (default 2.5m).
   */
  public checkGround(
    position: THREE.Vector3,
    castHeight = 1.0,
    maxDistance = 2.5
  ): GroundCheckResult {
    const origin = new THREE.Vector3(position.x, position.y + castHeight, position.z);
    this.raycaster.set(origin, this.downDirection);
    this.raycaster.far = maxDistance;

    const intersections = this.raycaster.intersectObjects(this.colliderMeshes, false);

    if (intersections.length > 0) {
      const hit = intersections[0];
      const groundHeight = hit.point.y;
      const distance = castHeight - (hit.point.y - position.y);
      const isGrounded = position.y - groundHeight <= 0.15 && position.y - groundHeight >= -0.3;

      return {
        isGrounded,
        groundHeight,
        groundNormal: hit.face ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0),
        distance,
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
   * Esegue una verifica orizzontale per impedire la compenetrazione con pareti e rocce ripide.
   */
  public checkHorizontalCollision(
    currentPos: THREE.Vector3,
    moveDir: THREE.Vector3,
    moveDist: number,
    capsuleRadius = 0.4
  ): THREE.Vector3 {
    if (moveDist <= 0.0001) return moveDir.clone();

    const origin = new THREE.Vector3(currentPos.x, currentPos.y + 0.4, currentPos.z);
    this.raycaster.set(origin, moveDir);
    this.raycaster.far = moveDist + capsuleRadius;

    const hits = this.raycaster.intersectObjects(this.colliderMeshes, false);
    if (hits.length > 0 && hits[0].distance < moveDist + capsuleRadius) {
      // Slitta lungo la normale della parete
      const normal = hits[0].face ? hits[0].face.normal : new THREE.Vector3(0, 1, 0);
      const projected = moveDir.clone().sub(normal.clone().multiplyScalar(moveDir.dot(normal)));
      return projected;
    }

    return moveDir.clone();
  }
}
