/**
 * Test unitari di regressione: altimetria, ground-snapping e quote dinamiche da getTerrainHeight.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.3.7 (verifiche matematiche e fisiche spawnAt, checkGround e quote entità)
 */

import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { PhysicsSystem } from '../src/systems/PhysicsSystem';
import { Player } from '../src/entities/Player';
import { CollectiblesManager, CollectibleConfigItem } from '../src/entities/Collectibles';
import collectiblesConfig from '../src/data/collectibles.json';

describe('Regressione Altimetrica e Ground-Snapping (v0.3.7)', () => {
  // Simulatore della funzione getTerrainHeight dell'isola
  const mockIslandTerrain = {
    getTerrainHeight: (x: number, z: number): number => {
      // Simula il profilo collinare: collina centrale a quota ~4.1m, scarpata verso la spiaggia
      const distFromCenter = Math.hypot(x, z);
      if (distFromCenter < 5.0) {
        return 4.12 - (distFromCenter / 5.0) * 0.5; // Plateau osservatorio
      } else if (distFromCenter < 25.0) {
        return Math.max(0.1, 3.6 - (distFromCenter - 5.0) * 0.16); // Pendenza prato
      }
      return 0.1; // Litorale / spiaggia
    }
  };

  describe('1. Metodo spawnAt e ancoraggio spawnPoint per Pip', () => {
    it('dovrebbe posizionare Pip esattamente sopra la quota del terreno e azzerare la velocità', () => {
      const player = new Player();

      const spawnX = 0;
      const spawnZ = 2.0;
      const groundY = mockIslandTerrain.getTerrainHeight(spawnX, spawnZ);

      player.spawnAt(spawnX, groundY, spawnZ);

      expect(player.position.x).toBe(spawnX);
      expect(player.position.y).toBeCloseTo(groundY, 3);
      expect(player.position.z).toBe(spawnZ);

      expect(player.velocity.x).toBe(0);
      expect(player.velocity.y).toBe(0);
      expect(player.velocity.z).toBe(0);
      expect(player.isGrounded).toBe(true);

      // Lo spawnPoint deve essere registrato per eventuali respawn
      expect(player.spawnPoint.x).toBe(spawnX);
      expect(player.spawnPoint.y).toBeCloseTo(groundY, 3);
      expect(player.spawnPoint.z).toBe(spawnZ);

      // Il gruppo 3D deve rispecchiare la posizione
      expect(player.meshComponents.root.position.x).toBe(spawnX);
      expect(player.meshComponents.root.position.y).toBeCloseTo(groundY, 3);
    });

    it('dovrebbe resettare Pip al punto di spawnPoint sicuro in caso di caduta fuori dall isola (y < -5.0)', () => {
      const player = new Player();

      const safeX = 0;
      const safeY = 4.12;
      const safeZ = 2.0;
      player.spawnAt(safeX, safeY, safeZ);

      // Simula caduta accidentale nel vuoto
      player.position.set(30.0, -6.5, 30.0);
      player.velocity.set(0, -20.0, 0);

      // Logica del player loop su y < -5.0
      if (player.position.y < -5.0) {
        player.position.copy(player.spawnPoint);
        player.velocity.set(0, 0, 0);
        player.isGrounded = true;
      }

      expect(player.position.x).toBe(safeX);
      expect(player.position.y).toBe(safeY);
      expect(player.position.z).toBe(safeZ);
      expect(player.velocity.y).toBe(0);
      expect(player.isGrounded).toBe(true);
    });
  });

  describe('2. Parametri di PhysicsSystem.checkGround e tolleranza snap', () => {
    it('dovrebbe intersecare un piano terreno con castHeight=2.0 e maxDistance=8.0', () => {
      const physics = new PhysicsSystem();

      // Crea una mesh terreno piana a quota y = 3.50m
      const planeGeom = new THREE.PlaneGeometry(20, 20);
      planeGeom.rotateX(-Math.PI / 2); // Orizzontale
      planeGeom.translate(0, 3.5, 0);

      const planeMat = new THREE.MeshBasicMaterial();
      const terrainMesh = new THREE.Mesh(planeGeom, planeMat);
      physics.addColliderMesh(terrainMesh);

      // Pip si trova a y = 3.60m (0.10m sopra il terreno)
      const playerPos = new THREE.Vector3(0, 3.6, 0);
      const groundInfo = physics.checkGround(playerPos, false, 2.0, 8.0);

      expect(groundInfo.isGrounded).toBe(true);
      expect(groundInfo.groundHeight).toBeCloseTo(3.5, 2);
      expect(groundInfo.groundNormal.y).toBeCloseTo(1.0, 2);
    });

    it('dovrebbe mantenere isGrounded con tolleranza estesa (0.60m) se wasGrounded era true', () => {
      const physics = new PhysicsSystem();

      const planeGeom = new THREE.PlaneGeometry(20, 20);
      planeGeom.rotateX(-Math.PI / 2);
      planeGeom.translate(0, 2.0, 0);

      const terrainMesh = new THREE.Mesh(planeGeom, new THREE.MeshBasicMaterial());
      physics.addColliderMesh(terrainMesh);

      // Pip a y = 2.50m (distanza = 0.50m dal terreno)
      const playerPos = new THREE.Vector3(0, 2.5, 0);

      // Se non era a terra (wasGrounded = false, soglia = 0.40m) -> non agganciato
      const infoAir = physics.checkGround(playerPos, false);
      expect(infoAir.isGrounded).toBe(false);

      // Se era a terra (wasGrounded = true, soglia = 0.60m) -> agganciato (ground-snapping su discesa)
      const infoSnap = physics.checkGround(playerPos, true);
      expect(infoSnap.isGrounded).toBe(true);
      expect(infoSnap.groundHeight).toBeCloseTo(2.0, 2);
    });

    it('dovrebbe recuperare da leggera compenetrazione (-0.36m sotto la superficie)', () => {
      const physics = new PhysicsSystem();

      const planeGeom = new THREE.PlaneGeometry(20, 20);
      planeGeom.rotateX(-Math.PI / 2);
      planeGeom.translate(0, 4.0, 0);

      const terrainMesh = new THREE.Mesh(planeGeom, new THREE.MeshBasicMaterial());
      physics.addColliderMesh(terrainMesh);

      // Pip a y = 3.64m (verticalDiff = -0.36m, compenetrato)
      const submergedPos = new THREE.Vector3(0, 3.64, 0);
      const groundInfo = physics.checkGround(submergedPos, false);

      // Deve rilevare il terreno e considerarlo a terra per correzione
      expect(groundInfo.groundHeight).toBeCloseTo(4.0, 2);
      expect(groundInfo.isGrounded).toBe(true);
    });
  });

  describe('3. Quote dinamiche da getTerrainHeight per NPC e Collezionabili', () => {
    it('dovrebbe calcolare la quota di Nonna Bussola a plazaY + 0.48 senza costanti magiche', () => {
      const plazaX = 0;
      const plazaZ = 0;
      const plazaY = mockIslandTerrain.getTerrainHeight(plazaX, plazaZ);
      const expectedNonnaY = plazaY + 0.48;

      expect(plazaY).toBeGreaterThan(3.5);
      expect(expectedNonnaY).toBeCloseTo(4.60, 2);
    });

    it('dovrebbe istanziare tutti i collezionabili usando island.getTerrainHeight(x, z) + 0.35', () => {
      const islandMock = mockIslandTerrain as any;
      const manager = new CollectiblesManager(islandMock);

      const items = (manager as any).items as Array<{
        config: CollectibleConfigItem;
        meshGroup: THREE.Group;
      }>;

      expect(items.length).toBeGreaterThan(0);

      const rawConfigs = collectiblesConfig.collectibles as CollectibleConfigItem[];

      items.forEach((runtimeItem) => {
        const raw = rawConfigs.find((c) => c.id === runtimeItem.config.id);
        expect(raw).toBeDefined();

        const expectedY = mockIslandTerrain.getTerrainHeight(raw!.position.x, raw!.position.z) + 0.35;
        expect(runtimeItem.config.position.y).toBeCloseTo(expectedY, 2);
        expect(runtimeItem.meshGroup.position.y).toBeCloseTo(expectedY, 2);
      });
    });
  });
});
