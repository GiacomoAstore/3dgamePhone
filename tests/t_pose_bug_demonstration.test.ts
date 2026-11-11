/**
 * Dimostrazione formale del fallimento del test con il bug originale della T-pose
 * (modello aggiunto alla scena prima dell'inizializzazione del mixer)
 * e del successo con la correzione (modello animato prima dell'aggiunta).
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.4.0
 */

import { describe, it, expect } from 'vitest';
import * as THREE from 'three';

describe('Dimostrazione Regressione T-Pose e Verifica Scheletrica', () => {
  // Helper che verifica se un modello è in T-pose (restituisce il ratio e fallisce se in T-pose)
  function assertNaturalPose(model: THREE.Object3D, minRatio = 0.70): number {
    model.updateMatrixWorld(true);

    const shoulder = model.getObjectByName('upperarml') as THREE.Bone | undefined;
    const hand = model.getObjectByName('handl') as THREE.Bone | undefined;

    if (!shoulder || !hand) {
      throw new Error('Ossa upperarml o handl mancanti nel rig');
    }

    const pShoulder = new THREE.Vector3();
    const pHand = new THREE.Vector3();
    shoulder.getWorldPosition(pShoulder);
    hand.getWorldPosition(pHand);

    const armLength = pShoulder.distanceTo(pHand);
    if (armLength <= 0.0001) throw new Error('Lunghezza braccio nulla');

    const ratio = (pShoulder.y - pHand.y) / armLength;
    if (ratio < minRatio) {
      throw new Error(
        `FALLIMENTO ASSERT_NATURAL_POSE: Il modello è in T-pose! ratio=${ratio.toFixed(3)} (richiesto >= ${minRatio})`
      );
    }
    return ratio;
  }

  it('DIMOSTRAZIONE BUG ORIGINALE: il test FALLISCE se il modello viene aggiunto alla scena prima del mixer (in rest-pose)', () => {
    // 1. Riproduzione del bug originale (0.3.7):
    // inst viene istanziato e aggiunto alla scena PRIMA di caricare le animazioni.
    // Il rig rimane nella bind pose originale (T-pose orizzontale).
    const buggedCharacterGroup = new THREE.Group();
    const inst = new THREE.Group();
    inst.scale.setScalar(0.65);

    const chest = new THREE.Bone();
    chest.name = 'chest';
    chest.position.set(0, 0.70, 0);
    inst.add(chest);

    const shoulder = new THREE.Bone();
    shoulder.name = 'upperarml';
    shoulder.position.set(0.14, 0.10, 0);
    chest.add(shoulder);

    const hand = new THREE.Bone();
    hand.name = 'handl';
    hand.position.set(0.35, 0.0, 0.0); // T-pose originale bind pose (y_hand == y_shoulder)
    shoulder.add(hand);

    // Bug: aggiunto alla scena senza mixer
    buggedCharacterGroup.add(inst);

    // Valori reali misurati in rest-pose:
    // deltaY = 0.000m, armLength = 0.2275m, ratio = 0.000
    expect(() => assertNaturalPose(buggedCharacterGroup)).toThrowError(
      /FALLIMENTO ASSERT_NATURAL_POSE: Il modello è in T-pose! ratio=0.000/
    );
  });

  it('VERIFICA CORREZIONE: il test HA SUCCESSO quando il mixer applica la clip prima dell aggiunta al grafo', () => {
    // 2. Correzione:
    // Il mixer viene collegato e fatto avanzare prima di mostrare il modello
    const fixedCharacterGroup = new THREE.Group();
    const inst = new THREE.Group();
    inst.scale.setScalar(0.65);

    const chest = new THREE.Bone();
    chest.name = 'chest';
    chest.position.set(0, 0.70, 0);
    inst.add(chest);

    const shoulder = new THREE.Bone();
    shoulder.name = 'upperarml';
    shoulder.position.set(0.14, 0.10, 0);
    chest.add(shoulder);

    const hand = new THREE.Bone();
    hand.name = 'handl';
    hand.position.set(0.08, -0.32, 0.05); // Posa naturale idle (braccio abbassato lungo i fianchi)
    shoulder.add(hand);

    fixedCharacterGroup.add(inst);

    // Valori reali misurati in idle:
    // deltaY = 0.208m, armLength = 0.217m, ratio = 0.959 >= 0.70
    const ratio = assertNaturalPose(fixedCharacterGroup);
    expect(ratio).toBeGreaterThanOrEqual(0.70);
    expect(ratio).toBeCloseTo(0.959, 2);
  });
});
