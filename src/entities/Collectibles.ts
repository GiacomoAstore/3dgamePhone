/**
 * Gestione degli oggetti raccoglibili e del Frammento dell'Atlante Vivo.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.3.8 (mergeGeometries per cerchio pietre del frammento)
 */

import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import collectiblesConfig from '../data/collectibles.json';
import { QuestSystem } from '../systems/QuestSystem';
import { globalEventBus } from '../core/EventBus';
import type { Island } from '../world/Island';

export interface CollectibleConfigItem {
  id: string;
  type: 'fragment' | 'seashell' | 'mushroom' | 'starfish';
  nameKey: string;
  position: { x: number; y: number; z: number };
  requiresLantern: boolean;
}

export interface RuntimeCollectible {
  config: CollectibleConfigItem;
  meshGroup: THREE.Group;
  parchmentMesh?: THREE.Mesh;
  auraLight?: THREE.PointLight;
  isCollected: boolean;
}

export class CollectiblesManager {
  public group: THREE.Group;
  private items: RuntimeCollectible[] = [];
  private animTimer = 0;

  constructor(island?: Island) {
    this.group = new THREE.Group();
    this.group.name = 'Collectibles_Group';

    this.spawnAll(island);
  }

  private spawnAll(island?: Island): void {
    const list = collectiblesConfig.collectibles as CollectibleConfigItem[];
    for (const rawItem of list) {
      const item: CollectibleConfigItem = {
        ...rawItem,
        position: {
          x: rawItem.position.x,
          y: island
            ? island.getTerrainHeight(rawItem.position.x, rawItem.position.z) + 0.35
            : rawItem.position.y,
          z: rawItem.position.z,
        },
      };
      if (item.type === 'fragment') {
        this.spawnFragment(item);
      } else if (item.type === 'seashell') {
        this.spawnSeashell(item);
      } else if (item.type === 'mushroom') {
        this.spawnMushroom(item);
      } else if (item.type === 'starfish') {
        this.spawnStarfish(item);
      }
    }
  }

  /**
   * Genera il 1° Frammento dell'Atlante Vivo con indizio a bagliore tenue e cerchio di pietre.
   */
  private spawnFragment(config: CollectibleConfigItem): void {
    const root = new THREE.Group();
    root.position.set(config.position.x, config.position.y, config.position.z);

    // Cerchio di antiche pietre sagomate unito con mergeGeometries (1 sola draw call per le pietre)
    const stoneMat = new THREE.MeshToonMaterial({ color: 0x5a6575 });
    const stoneGeoms: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const stoneGeom = new THREE.BoxGeometry(0.38, 0.85, 0.32);
      stoneGeom.rotateY(angle);
      stoneGeom.translate(Math.cos(angle) * 1.5, -0.4, Math.sin(angle) * 1.5);
      stoneGeoms.push(stoneGeom);
    }
    if (stoneGeoms.length > 0) {
      const mergedStones = BufferGeometryUtils.mergeGeometries(stoneGeoms);
      const stonesMesh = new THREE.Mesh(mergedStones, stoneMat);
      stonesMesh.castShadow = true;
      root.add(stonesMesh);
    }

    // Pergamena dorata fluttuante
    const parchmentGeom = new THREE.PlaneGeometry(0.55, 0.75);
    parchmentGeom.rotateY(Math.PI / 4);

    const parchmentMat = new THREE.MeshToonMaterial({
      color: 0xffd166,
      side: THREE.DoubleSide,
      emissive: 0xffaa00,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.25, // Di base semitrasparente/spettrale come indizio
    });

    const parchment = new THREE.Mesh(parchmentGeom, parchmentMat);
    root.add(parchment);

    // Luce d'aura (bagliore tenue quando spenta, intensa quando attiva la lanterna)
    const auraLight = new THREE.PointLight(0xffbe0b, 0.4, 3.5, 1.5);
    auraLight.position.set(0, 0, 0);
    root.add(auraLight);

    this.group.add(root);

    this.items.push({
      config,
      meshGroup: root,
      parchmentMesh: parchment,
      auraLight,
      isCollected: false,
    });
  }

  private spawnSeashell(config: CollectibleConfigItem): void {
    const root = new THREE.Group();
    root.position.set(config.position.x, config.position.y, config.position.z);

    const shellMat = new THREE.MeshToonMaterial({ color: 0xffccd5 });
    const shellGeom = new THREE.ConeGeometry(0.18, 0.25, 6);
    const m = new THREE.Mesh(shellGeom, shellMat);
    m.rotation.z = Math.PI / 2.5;
    m.castShadow = true;
    root.add(m);

    this.group.add(root);
    this.items.push({ config, meshGroup: root, isCollected: false });
  }

  private spawnMushroom(config: CollectibleConfigItem): void {
    const root = new THREE.Group();
    root.position.set(config.position.x, config.position.y, config.position.z);

    const capMat = new THREE.MeshToonMaterial({
      color: 0x06d6a0,
      emissive: 0x06d6a0,
      emissiveIntensity: 0.35,
    });
    const stemMat = new THREE.MeshToonMaterial({ color: 0xf8f9fa });

    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), capMat);
    cap.position.y = 0.22;
    root.add(cap);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.2, 6), stemMat);
    stem.position.y = 0.1;
    root.add(stem);

    this.group.add(root);
    this.items.push({ config, meshGroup: root, isCollected: false });
  }

  private spawnStarfish(config: CollectibleConfigItem): void {
    const root = new THREE.Group();
    root.position.set(config.position.x, config.position.y, config.position.z);

    const starMat = new THREE.MeshToonMaterial({ color: 0xf77f00 });
    for (let i = 0; i < 5; i++) {
      const arm = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 4), starMat);
      const ang = (i * Math.PI * 2) / 5;
      arm.position.set(Math.cos(ang) * 0.12, 0.02, Math.sin(ang) * 0.12);
      arm.rotation.x = Math.PI / 2;
      arm.rotation.z = -ang;
      root.add(arm);
    }

    this.group.add(root);
    this.items.push({ config, meshGroup: root, isCollected: false });
  }

  /**
   * Aggiorna animazioni e verifica la raccolta da parte di Pip.
   */
  public update(
    dt: number,
    playerPos: THREE.Vector3,
    isLanternActive: boolean,
    questSystem: QuestSystem
  ): void {
    this.animTimer += dt * 3.0;

    for (const item of this.items) {
      if (item.isCollected) continue;

      if (item.config.type === 'fragment') {
        // Rotazione e fluttuazione
        item.meshGroup.rotation.y += dt * 1.2;
        item.meshGroup.position.y = item.config.position.y + Math.sin(this.animTimer) * 0.14;

        if (isLanternActive) {
          // Con Lanterna attiva: piena luminosità dorata e raccolta possibile
          if (item.parchmentMesh) {
            (item.parchmentMesh.material as THREE.MeshToonMaterial).opacity = 1.0;
            (item.parchmentMesh.material as THREE.MeshToonMaterial).emissiveIntensity = 0.85;
          }
          if (item.auraLight) {
            item.auraLight.intensity = 2.0;
            item.auraLight.distance = 5.0;
          }

          const dist = playerPos.distanceTo(item.meshGroup.position);
          if (dist <= 1.8) {
            item.isCollected = true;
            this.group.remove(item.meshGroup);
            questSystem.collectFragment(1);
            globalEventBus.emit('banner-show', {
              text: "✨ Frammento dell'Atlante Vivo recuperato! La nebbia si ritira...",
              duration: 4500,
            });
          }
        } else {
          // Senza lanterna: bagliore tenue e debole pulsazione (indizio per il giocatore)
          const pulse = 0.2 + Math.sin(this.animTimer * 1.5) * 0.12;
          if (item.parchmentMesh) {
            (item.parchmentMesh.material as THREE.MeshToonMaterial).opacity = pulse;
            (item.parchmentMesh.material as THREE.MeshToonMaterial).emissiveIntensity = pulse * 0.5;
          }
          if (item.auraLight) {
            item.auraLight.intensity = 0.35 + pulse * 0.3;
            item.auraLight.distance = 2.8;
          }
        }
      } else {
        // Collezionabili ordinari (conchiglie, funghi, stelle)
        const dist = playerPos.distanceTo(item.meshGroup.position);
        if (dist <= 1.5) {
          item.isCollected = true;
          this.group.remove(item.meshGroup);
          questSystem.collectItem(item.config.type as 'seashell' | 'mushroom' | 'starfish');

          const typeName =
            item.config.type === 'seashell'
              ? 'Conchiglia Marina'
              : item.config.type === 'mushroom'
                ? 'Fungo Luminoso'
                : 'Stella Marina';

          globalEventBus.emit('banner-show', {
            text: `Raccolto: ${typeName}!`,
            duration: 2500,
          });
        }
      }
    }
  }

  public getItems(): RuntimeCollectible[] {
    return this.items;
  }

  /**
   * Ripristina lo stato dei collezionabili rimovendo quelli già raccolti nel salvataggio.
   */
  public restoreCollectedItems(collectedFragmentCount: number, collectedIds?: string[]): void {
    for (const item of this.items) {
      if (item.config.type === 'fragment' && collectedFragmentCount > 0) {
        item.isCollected = true;
        if (item.meshGroup.parent) {
          this.group.remove(item.meshGroup);
        }
      } else if (collectedIds && collectedIds.includes(item.config.id)) {
        item.isCollected = true;
        if (item.meshGroup.parent) {
          this.group.remove(item.meshGroup);
        }
      }
    }
  }

  /**
   * Ripristina tutti i collezionabili nella scena (per Nuova Partita).
   */
  public resetAll(): void {
    for (const item of this.items) {
      item.isCollected = false;
      if (!item.meshGroup.parent) {
        this.group.add(item.meshGroup);
      }
    }
  }

  public setQuality(quality: 'low' | 'medium' | 'high'): void {
    const enableShadows = quality === 'high';
    this.group.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        c.castShadow = enableShadows;
      }
    });
  }
}
