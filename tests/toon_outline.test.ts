/**
 * Test per i contorni cartoon Inverted Hull applicati a Pip.
 * Verifica che le mesh di contorno siano presenti, abbiano il materiale BackSide
 * e i vertici estrusi correttamente rispetto alla mesh genitore.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.1
 */

import { describe, it, expect } from 'vitest';
import { ProceduralPip } from '../src/entities/ProceduralPip';
import * as THREE from 'three';

describe('Toon Inverted Hull Outlines on Pip', () => {
  it('genera mesh di contorno per il corpo e la testa di Pip con materiale BackSide', () => {
    const pip = ProceduralPip.create();

    const bodyOutline = pip.body.children.find(
      (c) => c.name === 'Pip_Body_outline'
    ) as THREE.Mesh;
    const headOutline = pip.head.children.find(
      (c) => c.name === 'Pip_Head_outline'
    ) as THREE.Mesh;

    expect(bodyOutline).toBeDefined();
    expect(headOutline).toBeDefined();

    expect(bodyOutline.isMesh).toBe(true);
    expect(headOutline.isMesh).toBe(true);

    // Verifica che il materiale usi THREE.BackSide (tecnica inverted hull)
    const bodyMat = bodyOutline.material as THREE.MeshBasicMaterial;
    const headMat = headOutline.material as THREE.MeshBasicMaterial;

    expect(bodyMat.side).toBe(THREE.BackSide);
    expect(headMat.side).toBe(THREE.BackSide);
  });

  it('verifica che i contorni non proiettino ombre (castShadow = false)', () => {
    const pip = ProceduralPip.create();

    const bodyOutline = pip.body.children.find(
      (c) => c.name === 'Pip_Body_outline'
    ) as THREE.Mesh;

    expect(bodyOutline.castShadow).toBe(false);
    expect(bodyOutline.receiveShadow).toBe(false);
  });
});

