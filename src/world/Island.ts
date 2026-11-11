/**
 * Generazione procedurale dell'Isola della Bussola con volume solido,
 * scogliere rocciose, spiaggia dorata, sentiero, vegetazione cartoon volumetrica e osservatorio.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.3.9 (InstancedMesh per fogliame/fiori, merge geometrie balaustra e pontile, rimozione alberi procedurali con GLB attivi)
 */

import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { globalEventBus } from '../core/EventBus';
import { ToonShaderUtils } from './ToonShaderUtils';
import { AssetManager } from '../core/AssetManager';
import type { QualityPreset } from '../ui/QualitySettingsUI';

export class Island {
  public group: THREE.Group;
  public terrainMesh!: THREE.Mesh;
  public cliffMesh!: THREE.Mesh;
  private terrainMaterial!: THREE.MeshToonMaterial;
  private targetGrassColor = new THREE.Color(0x38b000); // Verde vivido primaverile
  private isColorShifting = false;
  private proceduralTreesGroup = new THREE.Group();
  private foxMixer: THREE.AnimationMixer | null = null;

  constructor(physicsSystem: PhysicsSystem) {
    this.group = new THREE.Group();
    this.group.name = 'Island_Bussola';
    this.proceduralTreesGroup.name = 'Procedural_Trees';
    this.group.add(this.proceduralTreesGroup);

    const stepGradMap = ToonShaderUtils.getStepGradientMap(3);

    this.createSolidIsland(physicsSystem, stepGradMap);
    this.createObservatoryPlaza(stepGradMap);
    this.createStoneCircle(stepGradMap);
    this.createVolumetricTrees(stepGradMap);
    this.createFoliageAndFlowers(stepGradMap);
    this.createRockBoulders(stepGradMap);
    this.createDock(stepGradMap);
    this.loadExternalModels(stepGradMap);

    globalEventBus.on('fragment-collected', () => {
      this.isColorShifting = true;
    });
  }

  /**
   * Crea l'isola come volume 3D solido (terreno sommitale + scogliere perimetrali verticali).
   * Elimina completamente l'effetto "foglio sottile sospeso nel vuoto".
   */
  private createSolidIsland(physicsSystem: PhysicsSystem, gradientMap: THREE.Texture): void {
    const radius = 28.0;
    const segmentsRad = 36;
    const segmentsCirc = 64;

    // 1. Superficie calpestabile superiore dell'isola
    const topGeom = new THREE.RingGeometry(0, radius, segmentsCirc, segmentsRad);
    topGeom.rotateX(-Math.PI / 2);

    const pos = topGeom.attributes.position;
    const count = pos.count;

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, this.getTerrainHeight(x, z));
    }

    topGeom.computeVertexNormals();

    this.terrainMaterial = new THREE.MeshToonMaterial({
      color: 0x588157, // Verde collina cartoon caldo
      gradientMap,
    });

    this.terrainMesh = new THREE.Mesh(topGeom, this.terrainMaterial);
    this.terrainMesh.name = 'Terrain_Top';
    this.terrainMesh.receiveShadow = true;
    this.terrainMesh.castShadow = true;
    this.group.add(this.terrainMesh);

    // Registra come collider per la fisica
    physicsSystem.addColliderMesh(this.terrainMesh);

    // 2. Basamento roccioso solido (Cliff Mesh) che scende sotto il livello del mare fino a -5m
    const cliffGeom = new THREE.CylinderGeometry(radius, radius * 1.08, 5.5, segmentsCirc, 4, true);
    cliffGeom.translate(0, -2.5, 0);

    const cliffMat = new THREE.MeshToonMaterial({
      color: 0x606c38, // Roccia costiera coperta da muschio
      gradientMap,
    });

    this.cliffMesh = new THREE.Mesh(cliffGeom, cliffMat);
    this.cliffMesh.name = 'Terrain_Cliff';
    this.cliffMesh.receiveShadow = true;
    this.group.add(this.cliffMesh);

    // 3. Fondale marino scuro sotto l'isola per eliminare trasparenze o vuoti
    const seabedGeom = new THREE.CircleGeometry(radius * 1.4, 32);
    seabedGeom.rotateX(-Math.PI / 2);
    const seabedMat = new THREE.MeshBasicMaterial({ color: 0x162a45 });
    const seabed = new THREE.Mesh(seabedGeom, seabedMat);
    seabed.position.y = -4.5;
    this.group.add(seabed);
  }

  /**
   * Costruisce la piazzola in pietra rialzata dell'Osservatorio astronomico sulla collina.
   */
  private createObservatoryPlaza(gradientMap: THREE.Texture): void {
    const plazaGroup = new THREE.Group();
    const plazaY = this.getTerrainHeight(0, -2.5);
    plazaGroup.position.set(0, plazaY, -2.5);

    const stoneMat = new THREE.MeshToonMaterial({ color: 0xd6ccc2, gradientMap });
    const woodMat = new THREE.MeshToonMaterial({ color: 0x7f4f24, gradientMap });

    // Basamento circolare in pietra a muratura
    const baseGeom = new THREE.CylinderGeometry(4.2, 4.4, 0.45, 24);
    const base = new THREE.Mesh(baseGeom, stoneMat);
    base.position.y = 0.22;
    base.receiveShadow = true;
    base.castShadow = true;
    plazaGroup.add(base);

    // Pavimentazione interna circolare in listoni di legno
    const floorGeom = new THREE.CylinderGeometry(3.9, 3.9, 0.08, 24);
    const floor = new THREE.Mesh(floorGeom, woodMat);
    floor.position.y = 0.48;
    floor.receiveShadow = true;
    plazaGroup.add(floor);

    // Parapetto con colonnine in pietra unite con mergeGeometries (1 sola draw call per l'intera balaustra)
    const colGeoms: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 14; i++) {
      const angle = (i * Math.PI * 2) / 14;
      // Lascia un varco d'accesso a sud verso il sentiero
      if (angle > Math.PI * 0.35 && angle < Math.PI * 0.65) continue;

      const singleColGeom = new THREE.CylinderGeometry(0.12, 0.14, 0.75, 8);
      singleColGeom.translate(Math.cos(angle) * 3.8, 0.8, Math.sin(angle) * 3.8);
      colGeoms.push(singleColGeom);
    }

    if (colGeoms.length > 0) {
      const mergedColsGeom = BufferGeometryUtils.mergeGeometries(colGeoms);
      const colsMesh = new THREE.Mesh(mergedColsGeom, stoneMat);
      colsMesh.name = 'Observatory_Railing_Merged';
      colsMesh.castShadow = true;
      colsMesh.receiveShadow = true;
      plazaGroup.add(colsMesh);
    }

    this.group.add(plazaGroup);
  }

  /**
   * Cerchio di monoliti antichi presso la scogliera orientale (luogo del 1° frammento).
   */
  private createStoneCircle(gradientMap: THREE.Texture): void {
    const circleGroup = new THREE.Group();
    const circleY = this.getTerrainHeight(18.0, -15.0);
    circleGroup.position.set(18.0, circleY, -15.0);

    const ancientStoneMat = new THREE.MeshToonMaterial({
      color: 0x8d99ae,
      gradientMap,
    });

    const runeMat = new THREE.MeshBasicMaterial({
      color: 0xffd166,
    });

    const stoneGeoms: THREE.BufferGeometry[] = [];
    const runeGeoms: THREE.BufferGeometry[] = [];

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const posX = Math.cos(angle) * 3.2;
      const posZ = Math.sin(angle) * 3.2;

      // Colonna di pietra rastremata
      const stoneGeom = new THREE.CylinderGeometry(0.28, 0.42, 2.2 + (i % 3) * 0.3, 6);
      stoneGeom.rotateY(angle + 0.3);
      stoneGeom.rotateZ((Math.sin(i * 1.7) - 0.5) * 0.15);
      stoneGeom.translate(posX, 1.1, posZ);
      stoneGeoms.push(stoneGeom);

      // Incisione runica dorata che brilla debolmente
      const runeGeom = new THREE.RingGeometry(0.08, 0.14, 6);
      runeGeom.translate(posX, 1.2, posZ + 0.38);
      runeGeoms.push(runeGeom);
    }

    if (stoneGeoms.length > 0) {
      const mergedStones = BufferGeometryUtils.mergeGeometries(stoneGeoms);
      const stonesMesh = new THREE.Mesh(mergedStones, ancientStoneMat);
      stonesMesh.name = 'StoneCircle_Monoliths_Merged';
      stonesMesh.castShadow = true;
      stonesMesh.receiveShadow = true;
      circleGroup.add(stonesMesh);
    }

    if (runeGeoms.length > 0) {
      const mergedRunes = BufferGeometryUtils.mergeGeometries(runeGeoms);
      const runesMesh = new THREE.Mesh(mergedRunes, runeMat);
      runesMesh.name = 'StoneCircle_Runes_Merged';
      circleGroup.add(runesMesh);
    }

    this.group.add(circleGroup);
  }

  /**
   * Crea alberi cartoon volumetrici e sinuosi (stile Animal Crossing / The Witness).
   * Chiome composite a sfere multiple intersecate con gradiente cel-shading chiaro e scuro.
   */
  private createVolumetricTrees(gradientMap: THREE.Texture): void {
    const treePositions = [
      { x: -9, z: -8, scale: 1.15 },
      { x: -14, z: 2, scale: 1.0 },
      { x: -11, z: 10, scale: 1.2 },
      { x: 8, z: -14, scale: 1.1 },
      { x: 13, z: 4, scale: 0.95 },
      { x: -6, z: 15, scale: 1.05 },
      { x: 6, z: 15, scale: 1.0 },
      { x: -16, z: -10, scale: 1.3 },
      { x: 11, z: 12, scale: 0.9 },
    ];

    const trunkMat = new THREE.MeshToonMaterial({ color: 0x7f4f24, gradientMap });
    const foliageDarkMat = new THREE.MeshToonMaterial({ color: 0x2d6a4f, gradientMap });
    const foliageMidMat = new THREE.MeshToonMaterial({ color: 0x40916c, gradientMap });
    const foliageLightMat = new THREE.MeshToonMaterial({ color: 0x74c69d, gradientMap });

    treePositions.forEach((pos) => {
      const tree = new THREE.Group();
      const groundY = this.getTerrainHeight(pos.x, pos.z);
      tree.position.set(pos.x, groundY, pos.z);
      tree.scale.setScalar(pos.scale);

      // 1. Tronco sinuoso organico
      const trunkGeom = new THREE.CylinderGeometry(0.24, 0.42, 2.4, 8);
      const trunk = new THREE.Mesh(trunkGeom, trunkMat);
      trunk.position.y = 1.2;
      trunk.rotation.z = (Math.random() - 0.5) * 0.12;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      tree.add(trunk);

      // 2. Radici visibili alla base
      for (let r = 0; r < 3; r++) {
        const rAngle = (r * Math.PI * 2) / 3;
        const rootGeom = new THREE.ConeGeometry(0.18, 0.6, 5);
        const rootMesh = new THREE.Mesh(rootGeom, trunkMat);
        rootMesh.position.set(Math.cos(rAngle) * 0.35, 0.15, Math.sin(rAngle) * 0.35);
        rootMesh.rotation.z = -Math.cos(rAngle) * 0.45;
        rootMesh.rotation.x = Math.sin(rAngle) * 0.45;
        rootMesh.castShadow = true;
        tree.add(rootMesh);
      }

      // 3. Chioma a batuffoli soffici intersecati (3-4 sfere a volume cartoon)
      const crown = new THREE.Group();
      crown.position.y = 2.4;

      const fGeom1 = new THREE.SphereGeometry(1.2, 14, 12);
      const sphere1 = new THREE.Mesh(fGeom1, foliageMidMat);
      sphere1.castShadow = true;
      crown.add(sphere1);

      const fGeom2 = new THREE.SphereGeometry(0.95, 12, 10);
      const sphere2 = new THREE.Mesh(fGeom2, foliageDarkMat);
      sphere2.position.set(0.45, -0.25, 0.35);
      sphere2.castShadow = true;
      crown.add(sphere2);

      const fGeom3 = new THREE.SphereGeometry(0.85, 12, 10);
      const sphere3 = new THREE.Mesh(fGeom3, foliageLightMat);
      sphere3.position.set(-0.4, 0.35, -0.25);
      sphere3.castShadow = true;
      crown.add(sphere3);

      const fGeom4 = new THREE.SphereGeometry(0.75, 10, 8);
      const sphere4 = new THREE.Mesh(fGeom4, foliageMidMat);
      sphere4.position.set(0.1, 0.6, 0.15);
      sphere4.castShadow = true;
      crown.add(sphere4);

      tree.add(crown);
      this.proceduralTreesGroup.add(tree);
    });
  }

  /**
   * Cespugli di bacche e fiori selvatici (margherite e campanule) generati tramite InstancedMesh.
   * Ottimizzazione mobile: abbatte 174 draw call individuali a sole 5 draw call aggregate.
   */
  private createFoliageAndFlowers(gradientMap: THREE.Texture): void {
    const bushMat = new THREE.MeshToonMaterial({ color: 0x52b788, gradientMap });
    const berryMat = new THREE.MeshToonMaterial({ color: 0xe63946, gradientMap });
    const petalWhiteMat = new THREE.MeshToonMaterial({ color: 0xfefae0 });
    const petalBlueMat = new THREE.MeshToonMaterial({ color: 0x48cae4 });
    const flowerCenterMat = new THREE.MeshBasicMaterial({ color: 0xffb703 });

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3(1, 1, 1);

    // 1. Cespugli (5 istanze) e relative bacche (25 istanze)
    const bushPositions = [
      { x: -3, z: 2 },
      { x: 3, z: -4 },
      { x: -7, z: -1 },
      { x: 8, z: 7 },
      { x: 14, z: -6 },
    ];

    const bushGeom = new THREE.SphereGeometry(0.65, 10, 8);
    bushGeom.scale(1.2, 0.75, 1.0);
    const bushInstanced = new THREE.InstancedMesh(bushGeom, bushMat, bushPositions.length);
    bushInstanced.name = 'Instanced_Bushes';
    bushInstanced.castShadow = true;
    bushInstanced.receiveShadow = true;

    const berryGeom = new THREE.SphereGeometry(0.07, 6, 6);
    const berryInstanced = new THREE.InstancedMesh(berryGeom, berryMat, bushPositions.length * 5);
    berryInstanced.name = 'Instanced_Berries';
    berryInstanced.castShadow = false;

    let berryIdx = 0;
    bushPositions.forEach((bp, i) => {
      const bushY = this.getTerrainHeight(bp.x, bp.z);
      position.set(bp.x, bushY + 0.45, bp.z);
      rotation.set(0, 0, 0);
      quaternion.setFromEuler(rotation);
      scale.set(1, 1, 1);
      matrix.compose(position, quaternion, scale);
      bushInstanced.setMatrixAt(i, matrix);

      // 5 bacche rosse su ciascun cespuglio
      for (let b = 0; b < 5; b++) {
        const theta = b * 1.2;
        position.set(
          bp.x + Math.cos(theta) * 0.55,
          bushY + 0.55 + Math.sin(b) * 0.15,
          bp.z + Math.sin(theta) * 0.45
        );
        matrix.compose(position, quaternion, scale);
        berryInstanced.setMatrixAt(berryIdx++, matrix);
      }
    });

    bushInstanced.instanceMatrix.needsUpdate = true;
    berryInstanced.instanceMatrix.needsUpdate = true;
    this.group.add(bushInstanced);
    this.group.add(berryInstanced);

    // 2. Fiori selvatici (24 centri e 120 petali raggruppati in 3 InstancedMesh)
    const flowerCoords = [
      { x: -5, z: 4 }, { x: -8, z: 6 }, { x: -3, z: 9 }, { x: 4, z: 5 },
      { x: 7, z: 3 }, { x: 10, z: -2 }, { x: 5, z: -8 }, { x: -2, z: -10 },
      { x: -6, z: -6 }, { x: 12, z: -9 }, { x: 15, z: -12 }, { x: 9, z: -16 },
      { x: -11, z: -4 }, { x: -13, z: 5 }, { x: -9, z: 12 }, { x: -4, z: 14 },
      { x: 3, z: 12 }, { x: 8, z: 11 }, { x: 13, z: 8 }, { x: 16, z: 2 },
      { x: -15, z: -7 }, { x: -12, z: -12 }, { x: 2, z: -14 }, { x: 6, z: -12 }
    ];

    const centerGeom = new THREE.SphereGeometry(0.045, 6, 6);
    const centerInstanced = new THREE.InstancedMesh(centerGeom, flowerCenterMat, flowerCoords.length);
    centerInstanced.name = 'Instanced_FlowerCenters';
    centerInstanced.castShadow = false;

    const petalGeom = new THREE.SphereGeometry(0.06, 6, 4);
    petalGeom.scale(1, 0.4, 1.6);

    const petalBlueInstanced = new THREE.InstancedMesh(petalGeom, petalBlueMat, 12 * 5);
    petalBlueInstanced.name = 'Instanced_PetalsBlue';
    petalBlueInstanced.castShadow = false;

    const petalWhiteInstanced = new THREE.InstancedMesh(petalGeom, petalWhiteMat, 12 * 5);
    petalWhiteInstanced.name = 'Instanced_PetalsWhite';
    petalWhiteInstanced.castShadow = false;

    let bluePetalIdx = 0;
    let whitePetalIdx = 0;

    flowerCoords.forEach((fc, f) => {
      const fy = this.getTerrainHeight(fc.x, fc.z);
      const isBlue = f % 2 === 0;

      // Centro giallo
      position.set(fc.x, fy + 0.2, fc.z);
      rotation.set(0, 0, 0);
      quaternion.setFromEuler(rotation);
      scale.set(1, 1, 1);
      matrix.compose(position, quaternion, scale);
      centerInstanced.setMatrixAt(f, matrix);

      // 5 petali a raggiera
      for (let p = 0; p < 5; p++) {
        const pAngle = (p * Math.PI * 2) / 5;
        position.set(
          fc.x + Math.cos(pAngle) * 0.08,
          fy + 0.18,
          fc.z + Math.sin(pAngle) * 0.08
        );
        rotation.set(0, pAngle, 0);
        quaternion.setFromEuler(rotation);
        matrix.compose(position, quaternion, scale);

        if (isBlue) {
          petalBlueInstanced.setMatrixAt(bluePetalIdx++, matrix);
        } else {
          petalWhiteInstanced.setMatrixAt(whitePetalIdx++, matrix);
        }
      }
    });

    centerInstanced.instanceMatrix.needsUpdate = true;
    petalBlueInstanced.instanceMatrix.needsUpdate = true;
    petalWhiteInstanced.instanceMatrix.needsUpdate = true;

    this.group.add(centerInstanced);
    this.group.add(petalBlueInstanced);
    this.group.add(petalWhiteInstanced);
  }

  /**
   * Rocce litoranee levigate a faccette arrotondate (non cubi grezzi!).
   */
  private createRockBoulders(gradientMap: THREE.Texture): void {
    const rockMat = new THREE.MeshToonMaterial({
      color: 0x6c757d,
      gradientMap,
    });

    const rockCoords = [
      { x: -18, z: 6, s: 1.8 },
      { x: -16, z: 12, s: 1.4 },
      { x: 19, z: -10, s: 2.1 },
      { x: 16, z: -18, s: 1.6 },
      { x: 2, z: 22, s: 1.9 },
      { x: -8, z: 21, s: 1.5 },
      { x: 21, z: 12, s: 1.7 },
    ];

    rockCoords.forEach((rc) => {
      const rockGeom = new THREE.DodecahedronGeometry(rc.s, 1);
      // Rende la forma organica con scaling asimmetrico
      const rock = new THREE.Mesh(rockGeom, rockMat);
      rock.scale.set(1.2, 0.7, 0.9);
      const rockY = this.getTerrainHeight(rc.x, rc.z);
      rock.position.set(rc.x, rockY + rc.s * 0.25, rc.z);
      rock.rotation.set(rc.x * 0.2, rc.z * 0.4, 0.2);
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.group.add(rock);
    });
  }

  /**
   * Pontile in legno cartoon con assi e pali uniti tramite mergeGeometries (2 sole draw calls).
   */
  private createDock(gradientMap: THREE.Texture): void {
    const dock = new THREE.Group();
    dock.name = 'Dock_Compass';
    dock.position.set(22.0, 0.35, 1.5);

    const woodMat = new THREE.MeshToonMaterial({
      color: 0x8b5a2b, // Legno caldo
      gradientMap,
    });

    const ironMat = new THREE.MeshToonMaterial({
      color: 0x3d405b,
      gradientMap,
    });

    const woodGeoms: THREE.BufferGeometry[] = [];
    const ironGeoms: THREE.BufferGeometry[] = [];

    // 1. Assi di legno del pontile (7 assi)
    for (let i = 0; i < 7; i++) {
      const plankGeom = new THREE.BoxGeometry(0.7, 0.12, 2.6);
      const rotY = (Math.sin(i * 1.5) - 0.5) * 0.04;
      plankGeom.rotateY(rotY);
      plankGeom.translate(i * 0.8, 0, 0);
      woodGeoms.push(plankGeom);
    }

    // 2. Pali portanti verticali conficcati nel fondale (6 pali)
    for (let x = 0; x <= 4.8; x += 2.4) {
      for (const z of [-1.15, 1.15]) {
        const postGeom = new THREE.CylinderGeometry(0.12, 0.14, 2.6, 8);
        postGeom.translate(x, -1.0, z);
        woodGeoms.push(postGeom);

        // Bitta d'ormeggio in cima ai pali terminali
        if (x >= 4.0) {
          const bittaGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 8);
          bittaGeom.translate(x, 0.22, z);
          ironGeoms.push(bittaGeom);
        }
      }
    }

    // Unione di tutte le geometrie in legno in 1 sola mesh
    if (woodGeoms.length > 0) {
      const mergedWood = BufferGeometryUtils.mergeGeometries(woodGeoms);
      const woodMesh = new THREE.Mesh(mergedWood, woodMat);
      woodMesh.name = 'Dock_Wood_Merged';
      woodMesh.castShadow = true;
      woodMesh.receiveShadow = true;
      dock.add(woodMesh);
    }

    // Unione delle bitte metalliche in 1 sola mesh
    if (ironGeoms.length > 0) {
      const mergedIron = BufferGeometryUtils.mergeGeometries(ironGeoms);
      const ironMesh = new THREE.Mesh(mergedIron, ironMat);
      ironMesh.name = 'Dock_Iron_Merged';
      ironMesh.castShadow = true;
      ironMesh.receiveShadow = true;
      dock.add(ironMesh);
    }

    this.group.add(dock);
  }

  /**
   * Calcola l'altezza esatta della superficie dell'isola alle coordinate (x, z).
   */
  public getTerrainHeight(x: number, z: number): number {
    const radius = 28.0;
    const dist = Math.sqrt(x * x + z * z);
    const normDist = dist / radius;

    const hillPeak = Math.max(0, 1.0 - Math.sqrt(x * x + (z + 4) * (z + 4)) / 18.0);
    const hillHeight = Math.pow(hillPeak, 1.6) * 4.2;

    const terrace = Math.cos(normDist * Math.PI) * 0.5 + 0.5;
    const noise =
      Math.sin(x * 0.3) * 0.35 + Math.cos(z * 0.3) * 0.35 + Math.sin((x + z) * 0.5) * 0.2;

    const eastSlope = Math.max(0, (x - 6.0) / 16.0);
    let height = (hillHeight + terrace * 1.5 + noise) * (1.0 - eastSlope * 0.65);

    if (normDist > 0.85) {
      const edgeBlend = (normDist - 0.85) / 0.15;
      height = THREE.MathUtils.lerp(height, 0.25, edgeBlend);
    }

    return Math.max(0.2, height);
  }

  /**
   * Carica in modo asincrono i modelli 3D cartoon (Kenney, Quaternius)
   * per sostituire o arricchire la vegetazione e gli elementi dell'isola con un impatto visivo rifinito.
   */
  private async loadExternalModels(stepGradMap: THREE.Texture): Promise<void> {
    const assetMgr = AssetManager.getInstance();

    // 1. Carica i modelli
    await Promise.all([
      assetMgr.loadModel('tree_oak', '/models/tree_oak.glb'),
      assetMgr.loadModel('tree_detailed', '/models/tree_detailed.glb'),
      assetMgr.loadModel('boat', '/models/BoatWSail.glb'),
      assetMgr.loadModel('chest', '/models/chest.glb'),
      assetMgr.loadModel('barrel', '/models/barrel.glb'),
      assetMgr.loadModel('sign', '/models/sign.glb'),
      assetMgr.loadModel('campfire', '/models/campfire_logs.glb'),
      assetMgr.loadModel('fox', '/models/Fox.glb'),
    ]);

    // 2. Barca a vela splendida ormeggiata a fianco del pontile
    const boat = assetMgr.instantiate('boat');
    if (boat) {
      boat.name = 'Dock_Boat';
      // Posizionata lungo il pontile (che si trova a x=22, z=1.5)
      boat.position.set(25.5, -0.15, 3.2);
      boat.rotation.set(0, Math.PI / 8, 0);
      boat.scale.setScalar(3.5);
      assetMgr.applyCartoonShading(boat, stepGradMap);
      this.group.add(boat);
    }

    // 3. Forziere antico al cerchio di pietre che racchiude il frammento
    const chest = assetMgr.instantiate('chest');
    if (chest) {
      chest.name = 'RuneCircle_Chest';
      const groundY = this.getTerrainHeight(18.0, -15.0);
      chest.position.set(18.0, groundY + 0.05, -15.0);
      chest.rotation.y = -Math.PI / 4;
      chest.scale.setScalar(1.6);
      assetMgr.applyCartoonShading(chest, stepGradMap);
      this.group.add(chest);
    }

    // 4. Barili al molo e all'osservatorio
    const barrelPositions = [
      { x: 23.5, y: 0.45, z: 2.2, scale: 1.6 },
      { x: 24.2, y: 0.45, z: 2.0, scale: 1.4 },
      { x: -1.2, y: 3.82, z: -3.8, scale: 1.7 },
      { x: -1.8, y: 3.82, z: -3.5, scale: 1.5 },
    ];
    barrelPositions.forEach((pos) => {
      const b = assetMgr.instantiate('barrel');
      if (b) {
        b.position.set(pos.x, pos.y, pos.z);
        b.scale.setScalar(pos.scale);
        assetMgr.applyCartoonShading(b, stepGradMap);
        this.group.add(b);
      }
    });

    // 5. Cartello di legno indicatore lungo il sentiero
    const sign = assetMgr.instantiate('sign');
    if (sign) {
      const signY = this.getTerrainHeight(7.5, 3.0);
      sign.position.set(7.5, signY, 3.0);
      sign.rotation.y = Math.PI / 4;
      sign.scale.setScalar(2.0);
      assetMgr.applyCartoonShading(sign, stepGradMap);
      this.group.add(sign);
    }

    // 6. Fuoco da campo con ceppi per l'accampamento
    const campfire = assetMgr.instantiate('campfire');
    if (campfire) {
      const campY = this.getTerrainHeight(-3.5, 3.5);
      campfire.position.set(-3.5, campY, 3.5);
      campfire.scale.setScalar(1.8);
      assetMgr.applyCartoonShading(campfire, stepGradMap);
      this.group.add(campfire);
    }

    // 7. Alberi cartoon rifiniti Kenney a sostituzione, posizionati con quota al suolo reale
    if (assetMgr.hasModel('tree_oak') || assetMgr.hasModel('tree_detailed')) {
      const treePos = [
        { x: -9, z: -8, type: 'tree_oak', scale: 4.2, rot: 0.4 },
        { x: -14, z: 2, type: 'tree_detailed', scale: 4.0, rot: 1.2 },
        { x: -11, z: 10, type: 'tree_oak', scale: 4.4, rot: 2.1 },
        { x: 8, z: -14, type: 'tree_detailed', scale: 4.1, rot: 0.8 },
        { x: 13, z: 4, type: 'tree_oak', scale: 3.9, rot: 3.0 },
        { x: -6, z: 15, type: 'tree_detailed', scale: 4.3, rot: 1.7 },
        { x: 6, z: 15, type: 'tree_oak', scale: 4.0, rot: 0.1 },
        { x: -16, z: -10, type: 'tree_detailed', scale: 4.5, rot: 2.5 },
        { x: 11, z: 12, type: 'tree_oak', scale: 3.8, rot: 1.1 },
        { x: -4, z: -14, type: 'tree_detailed', scale: 4.2, rot: 0.6 },
        { x: -3, z: 8, type: 'tree_oak', scale: 4.0, rot: 1.9 },
        { x: 4, z: -7, type: 'tree_detailed', scale: 3.8, rot: 2.8 },
      ];

      treePos.forEach((p) => {
        const t = assetMgr.instantiate(p.type);
        if (t) {
          const groundY = this.getTerrainHeight(p.x, p.z);
          t.position.set(p.x, groundY, p.z);
          t.rotation.y = p.rot;
          t.scale.setScalar(p.scale);
          assetMgr.applyCartoonShading(t, stepGradMap);
          this.group.add(t);
        }
      });
      // Rimuove fisicamente dal grafo di scena gli alberi procedurali a sfere
      if (this.proceduralTreesGroup.parent) {
        this.group.remove(this.proceduralTreesGroup);
      }
      this.proceduralTreesGroup.visible = false;
    }

    // 8. Volpina cartoon animata Quaternius vicino al boschetto
    const fox = assetMgr.instantiate('fox');
    if (fox) {
      fox.name = 'Island_Fox';
      const foxY = this.getTerrainHeight(-6.0, 7.0);
      fox.position.set(-6.0, foxY, 7.0);
      fox.rotation.y = Math.PI / 3;
      fox.scale.setScalar(0.0028); // 559 unità * 0.0028 = ~1.56m
      assetMgr.applyCartoonShading(fox, stepGradMap);
      this.group.add(fox);

      // Clip di animazione della volpe
      const anims = assetMgr.getAnimations('fox');
      if (anims.length > 0) {
        this.foxMixer = new THREE.AnimationMixer(fox);
        const idleClip = anims.find((a) => a.name.includes('Idle')) || anims[0];
        if (idleClip) {
          this.foxMixer.clipAction(idleClip).play();
        }
      }
    }
  }

  public update(dt: number): void {
    // Animazione fauna selvatica (volpe)
    if (this.foxMixer) {
      this.foxMixer.update(dt);
    }

    // Viraggio cromatico dolce al ritrovamento del frammento
    if (this.isColorShifting) {
      this.terrainMaterial.color.lerp(this.targetGrassColor, dt * 1.5);
      const c = this.terrainMaterial.color;
      const t = this.targetGrassColor;
      const diff = Math.abs(c.r - t.r) + Math.abs(c.g - t.g) + Math.abs(c.b - t.b);
      if (diff < 0.01) {
        this.terrainMaterial.color.copy(this.targetGrassColor);
        this.isColorShifting = false;
      }
    }
  }

  public setQuality(quality: QualityPreset): void {
    // In Alta: tutti gli elementi scenici proiettano ombre complete.
    // In Media e Bassa: gli elementi statici dell'isola NON proiettano ombre dinamiche,
    // azzerando la shadow pass su decine di mesh e contenendo le draw call totali sotto 100.
    const enableSceneryShadows = quality === 'high';
    this.group.traverse((c) => {
      if ((c as THREE.Mesh).isMesh || (c as THREE.InstancedMesh).isInstancedMesh) {
        c.castShadow = enableSceneryShadows;
      }
    });
  }
}
