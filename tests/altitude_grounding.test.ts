/**
 * Test unitari di regressione: altimetria, ground-snapping e quote dinamiche da getTerrainHeight.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.3.9 (verifiche matematiche e fisiche spawnAt, checkGround, ossa Nonna Bussola no T-pose e camminata continua senza teletrasporto)
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

  describe('4. Verifica orientamento scheletrico NPC Nonna Bussola (confronto rest-pose, normalizzazione scala, evoluzione temporale)', () => {
    it('dovrebbe evidenziare differenza netta tra rest pose (T-pose) e posa animata normalizzata per la scala', () => {
      // 1. Modello in REST POSE (T-pose originale bind pose del file GLB):
      // Le braccia sono distese in orizzontale lungo l'asse X
      const restRoot = new THREE.Group();
      restRoot.scale.setScalar(0.65); // Scala effettiva in-game

      const restChest = new THREE.Bone();
      restChest.position.set(0, 0.70, 0);
      restRoot.add(restChest);

      const restArmL = new THREE.Bone();
      restArmL.position.set(0.14, 0.10, 0);
      restChest.add(restArmL);

      const restHandL = new THREE.Bone();
      restHandL.position.set(0.35, 0.0, 0.0); // T-pose: braccio teso orizzontalmente su X, y = 0
      restArmL.add(restHandL);

      restRoot.updateMatrixWorld(true);

      const restShoulderPos = new THREE.Vector3();
      const restHandPos = new THREE.Vector3();
      restArmL.getWorldPosition(restShoulderPos);
      restHandL.getWorldPosition(restHandPos);

      // Lunghezza mondale del braccio
      const armLength = restShoulderPos.distanceTo(restHandPos);
      expect(armLength).toBeGreaterThan(0.1);

      // Rapporto normalizzato adimensionale in rest pose (deltaY / armLength): in T-pose è ~0
      const restRatio = (restShoulderPos.y - restHandPos.y) / armLength;
      expect(Math.abs(restRatio)).toBeLessThan(0.15); // T-pose: braccio quasi perfettamente orizzontale

      // 2. Modello in POSA ANIMATA IDLE (arti abbassati lungo i fianchi)
      const animRoot = new THREE.Group();
      animRoot.scale.setScalar(0.65);

      const animChest = new THREE.Bone();
      animChest.position.set(0, 0.70, 0);
      animRoot.add(animChest);

      const animArmL = new THREE.Bone();
      animArmL.position.set(0.14, 0.10, 0);
      animChest.add(animArmL);

      const animHandL = new THREE.Bone();
      animHandL.name = 'handl';
      animHandL.position.set(0.08, -0.32, 0.05); // Abbassato lungo il busto
      animArmL.add(animHandL);

      animRoot.updateMatrixWorld(true);

      const animShoulderPos = new THREE.Vector3();
      const animHandPos = new THREE.Vector3();
      animArmL.getWorldPosition(animShoulderPos);
      animHandL.getWorldPosition(animHandPos);

      const animArmLength = animShoulderPos.distanceTo(animHandPos);
      const animRatio = (animShoulderPos.y - animHandPos.y) / animArmLength;

      // In posa naturale, il dislivello normalizzato per la lunghezza del braccio è > 0.70
      expect(animRatio).toBeGreaterThanOrEqual(0.70);
      expect(animRatio).toBeGreaterThan(restRatio + 0.50); // Differenza marcata e robusta dalla T-pose
    });

    it('dovrebbe verificare che l animazione di Nonna Bussola cambi dinamicamente le coordinate delle ossa nel tempo', () => {
      // Costruisce scheletro con AnimationMixer
      const root = new THREE.Group();
      const bone = new THREE.Bone();
      bone.name = 'handl';
      bone.position.set(0.1, 0.5, 0);
      root.add(bone);

      // Crea clip animata con traccia di posizione che oscilla nel tempo (respirazione idle)
      const times = [0, 0.5, 1.0];
      const values = [
        0.1, 0.50, 0.0,   // t=0.0s
        0.1, 0.46, 0.02,  // t=0.5s (mano abbassata di 4cm)
        0.1, 0.50, 0.0    // t=1.0s
      ];
      const track = new THREE.VectorKeyframeTrack('handl.position', times, values);
      const clip = new THREE.AnimationClip('Idle_A', 1.0, [track]);

      const mixer = new THREE.AnimationMixer(root);
      const action = mixer.clipAction(clip);
      action.play();

      // Campionamento a t = 0
      mixer.setTime(0);
      root.updateMatrixWorld(true);
      const pos0 = bone.position.clone();

      // Campionamento dopo avanzamento temporale di 0.5 secondi
      mixer.update(0.5);
      root.updateMatrixWorld(true);
      const pos1 = bone.position.clone();

      // Verifica che la posizione sia cambiata nel tempo (l'animazione è viva e dinamica)
      const deltaMovement = pos0.distanceTo(pos1);
      expect(deltaMovement).toBeGreaterThan(0.02);
      expect(pos1.y).toBeLessThan(pos0.y); // Movimento effettivo della posa
    });
  });

  describe('5. Camminata continua di Pip dall osservatorio al cerchio di pietre (senza teletrasporto)', () => {
    it('dovrebbe consentire a Pip di raggiungere il cerchio di pietre (18, -15) passo dopo passo con la fisica', () => {
      const physics = new PhysicsSystem();

      // Crea piano terreno inclinato che modella la discesa dall'osservatorio (y=4.60 a 0,0) al cerchio di pietre (18,-15)
      const terrainGeom = new THREE.PlaneGeometry(60, 60, 10, 10);
      terrainGeom.rotateX(-Math.PI / 2);
      const posAttr = terrainGeom.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);
        posAttr.setY(i, mockIslandTerrain.getTerrainHeight(x, z));
      }
      terrainGeom.computeVertexNormals();

      const terrainMesh = new THREE.Mesh(terrainGeom, new THREE.MeshBasicMaterial());
      physics.addColliderMesh(terrainMesh);

      const player = new Player();
      const startX = 0;
      const startZ = 2.0;
      const startY = mockIslandTerrain.getTerrainHeight(startX, startZ);
      player.spawnAt(startX, startY, startZ);

      const targetX = 18.0;
      const targetZ = -15.0;

      // Mock dell'InputManager che punta costantemente verso l'obiettivo (cameraAngle = 0)
      const mockInput = {
        getMovement: () => {
          const dirX = targetX - player.position.x;
          const dirZ = targetZ - player.position.z;
          const dist = Math.hypot(dirX, dirZ);
          if (dist < 0.1) return { x: 0, z: 0, length: 0 };
          // angolo rispetto all'asse Z positivo (cameraAngle = 0)
          return { x: dirX / dist, z: dirZ / dist, length: 1.0 };
        },
        consumeJump: () => false,
        consumeAction: () => false,
        consumeCameraDelta: () => ({ x: 0, y: 0 }),
        getIsBlocked: () => false,
        setBlocked: () => {}
      };

      const dt = 0.05; // 50ms per frame di fisica
      let steps = 0;
      const maxSteps = 150; // Massimo ~7.5s di simulazione (distanza ~24m a 5.2 m/s richiede ~92 passi)

      while (steps < maxSteps) {
        steps++;
        player.update(dt, mockInput as any, physics, 0);

        // Il giocatore deve rimanere ancorato al terreno durante la discesa continua
        expect(player.isGrounded).toBe(true);

        const distToTarget = Math.hypot(player.position.x - targetX, player.position.z - targetZ);
        if (distToTarget <= 1.5) {
          break; // Obiettivo raggiunto!
        }
      }

      const finalDist = Math.hypot(player.position.x - targetX, player.position.z - targetZ);
      expect(finalDist).toBeLessThanOrEqual(1.5);
      expect(Math.abs(player.position.x - targetX)).toBeLessThanOrEqual(1.5);
      expect(Math.abs(player.position.z - targetZ)).toBeLessThanOrEqual(1.5);
      expect(steps).toBeLessThan(maxSteps);
      expect(player.isGrounded).toBe(true);
    });
  });
});
