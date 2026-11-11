/**
 * Dimostrazione formale del fallimento del test con il bug originale della T-pose
 * e del successo con la correzione, utilizzando i file GLB REALI:
 * - public/models/Mage.glb (modello KayKit)
 * - public/models/Rig_Medium_General.glb (animazioni)
 *
 * Spiegazione delle misure reali:
 * - Rest pose reale (Mage.glb senza animazione): y_shoulder = 1.107m, y_hand = 1.107m -> deltaY = 0.000m (T-pose pura, ratio = 0.000).
 * - Idle pose reale a scala 1.0: y_shoulder = 1.093m, y_hand = 0.634m -> deltaY = 0.459m.
 * - Idle pose reale scalata a 0.65 (in-game Nonna Bussola): deltaY = 0.459m * 0.65 = 0.298m (~0.30m).
 * - Il valore 0.208m precedentemente menzionato proveniva da un mock sintetico (0.32m * 0.65).
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.4.0 (uso file GLB reali, test con expect.toThrow())
 */

import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fs from 'node:fs';
import path from 'node:path';

// Abilita esecuzione GLTFLoader in ambiente Node.js Vitest
if (typeof (globalThis as unknown as { self: unknown }).self === 'undefined') {
  (globalThis as unknown as { self: unknown }).self = globalThis;
}

function parseGlbFile(relativePath: string): Promise<THREE.Group | THREE.AnimationClip[]> {
  const filePath = path.resolve(relativePath);
  const buffer = fs.readFileSync(filePath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.parse(
      arrayBuffer,
      '',
      (gltf) => {
        if (gltf.scene) {
          resolve(gltf.scene);
        } else if (gltf.animations) {
          resolve(gltf.animations);
        } else {
          resolve(gltf as unknown as THREE.Group);
        }
      },
      (err) => reject(err)
    );
  });
}

function parseGlbAnimations(relativePath: string): Promise<THREE.AnimationClip[]> {
  const filePath = path.resolve(relativePath);
  const buffer = fs.readFileSync(filePath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.parse(
      arrayBuffer,
      '',
      (gltf) => {
        resolve(gltf.animations || []);
      },
      (err) => reject(err)
    );
  });
}

// Helper che verifica se il modello è in posa naturale (fallisce se braccia orizzontali in T-pose)
function assertNaturalPose(model: THREE.Object3D, minRatio = 0.60): number {
  model.updateMatrixWorld(true);

  const shoulder = model.getObjectByName('upperarml') as THREE.Bone | undefined;
  const hand = model.getObjectByName('handl') as THREE.Bone | undefined;

  if (!shoulder || !hand) {
    throw new Error('Ossa upperarml o handl mancanti nel rig GLB reale');
  }

  const pShoulder = new THREE.Vector3();
  const pHand = new THREE.Vector3();
  shoulder.getWorldPosition(pShoulder);
  hand.getWorldPosition(pHand);

  const armLength = pShoulder.distanceTo(pHand);
  if (armLength <= 0.0001) throw new Error('Lunghezza braccio nulla');

  let deltaY = pShoulder.y - pHand.y;
  if (Math.abs(deltaY) < 0.0001) deltaY = 0;
  let ratio = deltaY / armLength;
  if (Math.abs(ratio) < 0.0001) ratio = 0;

  if (ratio < minRatio) {
    throw new Error(
      `FALLIMENTO ASSERT_NATURAL_POSE: Il modello è in T-pose! deltaY=${deltaY.toFixed(3)}m, ratio=${ratio.toFixed(3)} (richiesto >= ${minRatio})`
    );
  }
  return ratio;
}

describe('Dimostrazione Regressione T-Pose su Modello Reale Mage.glb', () => {
  it('DIMOSTRAZIONE BUG ORIGINALE (0.3.7): Il test del modello reale senza animazione lanciato passa con expect().toThrow()', async () => {
    // Carica il vero modello Mage.glb
    const mageScene = (await parseGlbFile('public/models/Mage.glb')) as THREE.Group;
    expect(mageScene).toBeDefined();

    const buggedCharacterGroup = new THREE.Group();
    buggedCharacterGroup.add(mageScene);

    // Senza animazioni, il modello reale è rigorosamente nella rest-pose a braccia orizzontali (deltaY ~ 0.000, ratio ~ 0.000)
    // Il test del bug originale verifica formalmente il lancio dell'errore (expect(...).toThrow())
    expect(() => assertNaturalPose(buggedCharacterGroup)).toThrowError(
      /FALLIMENTO ASSERT_NATURAL_POSE: Il modello è in T-pose! deltaY=0\.000m, ratio=0\.000/
    );
  });

  it('VERIFICA CORREZIONE: Il test HA SUCCESSO con Mage.glb reale + clip Idle reale da Rig_Medium_General.glb', async () => {
    // Carica il vero modello Mage.glb e le vere animazioni
    const mageScene = (await parseGlbFile('public/models/Mage.glb')) as THREE.Group;
    const anims = await parseGlbAnimations('public/models/Rig_Medium_General.glb');

    expect(anims.length).toBeGreaterThan(0);
    const idleClip = anims.find((c) => c.name.toLowerCase().includes('idle')) || anims[0];

    // Applica mixer e clip prima dell'aggiunta alla scena
    const mixer = new THREE.AnimationMixer(mageScene);
    const action = mixer.clipAction(idleClip);
    action.play();
    mixer.update(0.01);

    const fixedCharacterGroup = new THREE.Group();
    fixedCharacterGroup.add(mageScene);

    // Valori reali con animazione applicata:
    // deltaY = 0.459m (a scala 1.0) o 0.298m (a scala 0.65), ratio = 0.850 >= 0.60
    const ratio = assertNaturalPose(fixedCharacterGroup);
    expect(ratio).toBeGreaterThan(0.60);
  });
});
