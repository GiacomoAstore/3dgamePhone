/**
 * Generazione procedurale dell'Isola di partenza (Isola della Bussola).
 * Terreno collinare low-poly, rocce, alberi cartoon e pontile.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.1.0
 */

import * as THREE from 'three';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { globalEventBus } from '../core/EventBus';

export class Island {
  public group: THREE.Group;
  public terrainMesh!: THREE.Mesh;
  private terrainMaterial!: THREE.MeshToonMaterial;
  private targetGrassColor = new THREE.Color(0x38b000); // Verde brillante e vivido
  private isColorShifting = false;

  constructor(physicsSystem: PhysicsSystem) {
    this.group = new THREE.Group();
    this.group.name = 'Island_Bussola';

    this.createTerrain(physicsSystem);
    this.createVegetation();
    this.createRocks();
    this.createDock();

    globalEventBus.on('fragment-collected', () => {
      this.isColorShifting = true;
    });
  }

  /**
   * Crea il terreno dell'isola sagomato a gradoni e collinette morbide.
   */
  private createTerrain(physicsSystem: PhysicsSystem): void {
    const size = 70;
    const segments = 48;
    const geom = new THREE.PlaneGeometry(size, size, segments, segments);
    geom.rotateX(-Math.PI / 2);

    const pos = geom.attributes.position;
    const count = pos.count;

    // Sagoma l'isola con decadimento radiale verso il mare
    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const distFromCenter = Math.sqrt(x * x + z * z);
      const maxRadius = 30.0;

      if (distFromCenter < maxRadius) {
        // Collina centrale morbida con altipiani
        const baseShape = Math.cos((distFromCenter / maxRadius) * (Math.PI / 2));
        const noise =
          Math.sin(x * 0.25) * 0.6 + Math.cos(z * 0.25) * 0.6 + Math.sin((x + z) * 0.4) * 0.3;
        const height = Math.max(-0.8, baseShape * 4.2 + noise);
        pos.setY(i, height);
      } else {
        // Fondale sotto il livello del mare
        pos.setY(i, -1.8);
      }
    }

    geom.computeVertexNormals();

    this.terrainMaterial = new THREE.MeshToonMaterial({
      color: 0x588157, // Verde collina cartoon
      bumpScale: 0.05,
    });

    this.terrainMesh = new THREE.Mesh(geom, this.terrainMaterial);
    this.terrainMesh.name = 'Terrain_Mesh';
    this.terrainMesh.receiveShadow = true;
    this.terrainMesh.castShadow = true;
    this.group.add(this.terrainMesh);

    // Registra il terreno come superficie di collisione BVH
    physicsSystem.addColliderMesh(this.terrainMesh);
  }

  /**
   * Aggiunge alberi cartoon low-poly sparsi per l'isola.
   */
  private createVegetation(): void {
    const treePositions = [
      { x: -8, z: -6 },
      { x: -12, z: 4 },
      { x: 10, z: -10 },
      { x: 14, z: 2 },
      { x: -5, z: 12 },
      { x: 6, z: 14 },
      { x: -15, z: -8 },
      { x: 12, z: 12 },
    ];

    const trunkGeom = new THREE.CylinderGeometry(0.2, 0.28, 1.4, 6);
    const trunkMat = new THREE.MeshToonMaterial({ color: 0x8b5a2b });

    const leavesGeom = new THREE.DodecahedronGeometry(1.1);
    const leavesMat = new THREE.MeshToonMaterial({ color: 0x3a5a40 });

    for (const p of treePositions) {
      const tree = new THREE.Group();
      // Calcola elevazione approssimata sul terreno
      const dist = Math.sqrt(p.x * p.x + p.z * p.z);
      const y = Math.max(0.5, (1 - dist / 30) * 3.5);

      const trunk = new THREE.Mesh(trunkGeom, trunkMat);
      trunk.position.y = 0.7;
      trunk.castShadow = true;
      tree.add(trunk);

      const leaves = new THREE.Mesh(leavesGeom, leavesMat);
      leaves.position.y = 1.9;
      leaves.castShadow = true;
      tree.add(leaves);

      tree.position.set(p.x, y, p.z);
      this.group.add(tree);
    }
  }

  /**
   * Posiziona massi e rocce low-poly attorno all'isola e sulla spiaggia.
   */
  private createRocks(): void {
    const rockPositions = [
      { x: -18, z: -14, s: 1.6 },
      { x: 20, z: -8, s: 2.1 },
      { x: -6, z: -22, s: 1.8 },
      { x: 16, z: 18, s: 1.4 },
      { x: -22, z: 12, s: 2.4 },
    ];

    const rockMat = new THREE.MeshToonMaterial({ color: 0x778da9 });

    for (const r of rockPositions) {
      const rockGeom = new THREE.DodecahedronGeometry(r.s, 0);
      const rock = new THREE.Mesh(rockGeom, rockMat);
      rock.position.set(r.x, 0.3, r.z);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.group.add(rock);
    }
  }

  /**
   * Pontile in legno dove approda la barca del Capitano Marea.
   */
  private createDock(): void {
    const dockGroup = new THREE.Group();
    const woodMat = new THREE.MeshToonMaterial({ color: 0xb08968 });

    // Tavole del pontile
    const plankGeom = new THREE.BoxGeometry(2.4, 0.16, 6.0);
    const plank = new THREE.Mesh(plankGeom, woodMat);
    plank.position.set(0, 0.1, 0);
    plank.castShadow = true;
    plank.receiveShadow = true;
    dockGroup.add(plank);

    // Pali di sostegno immersi nel mare
    const postGeom = new THREE.CylinderGeometry(0.12, 0.12, 2.0, 6);
    const postPositions = [
      { x: -1.0, z: -2.4 },
      { x: 1.0, z: -2.4 },
      { x: -1.0, z: 2.4 },
      { x: 1.0, z: 2.4 },
    ];

    for (const p of postPositions) {
      const post = new THREE.Mesh(postGeom, woodMat);
      post.position.set(p.x, -0.7, p.z);
      post.castShadow = true;
      dockGroup.add(post);
    }

    dockGroup.position.set(0, 0, 24);
    this.group.add(dockGroup);
  }

  public update(dt: number): void {
    if (this.isColorShifting) {
      this.terrainMaterial.color.lerp(this.targetGrassColor, dt * 1.2);
    }
  }
}
