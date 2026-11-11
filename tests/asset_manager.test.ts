/**
 * Test per AssetManager (cache, instanziazione e gestione cel-shading cartoon).
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.3.3
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { AssetManager } from '../src/core/AssetManager';

describe('AssetManager (Cache modelli 3D e Cel-shading)', () => {
  beforeEach(() => {
    AssetManager.resetInstance();
  });

  it('dovrebbe implementare correttamente il pattern Singleton', () => {
    const instanceA = AssetManager.getInstance();
    const instanceB = AssetManager.getInstance();
    expect(instanceA).toBe(instanceB);
  });

  it('dovrebbe gestire la degradazione controllata se il modello non è in cache', () => {
    const manager = AssetManager.getInstance();
    expect(manager.hasModel('non_existent')).toBe(false);
    expect(manager.instantiate('non_existent')).toBeNull();
  });

  it('dovrebbe clonare le istanze e impostare le ombre sui figli mesh', () => {
    const manager = AssetManager.getInstance();

    // Inseriamo manualmente una scena mock in cache per testare la clonazione
    const mockScene = new THREE.Group();
    const mockMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial());
    mockScene.add(mockMesh);

    (manager as unknown as { modelCache: Map<string, THREE.Group> }).modelCache.set('mock_box', mockScene);

    expect(manager.hasModel('mock_box')).toBe(true);

    const instance1 = manager.instantiate('mock_box');
    const instance2 = manager.instantiate('mock_box');

    expect(instance1).not.toBeNull();
    expect(instance2).not.toBeNull();
    expect(instance1).not.toBe(instance2); // Son due istanze separate

    // Verifica abilitazione ombre
    let meshFound = false;
    instance1!.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshFound = true;
        expect(child.castShadow).toBe(true);
        expect(child.receiveShadow).toBe(true);
      }
    });
    expect(meshFound).toBe(true);
  });

  it('dovrebbe ottimizzare i materiali standard con ruvidità cartoon e abilitare le ombre', () => {
    const manager = AssetManager.getInstance();

    const root = new THREE.Group();
    const stdMat = new THREE.MeshStandardMaterial({ color: 0x33aa55 });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1), stdMat);
    root.add(mesh);

    const mockGradient = new THREE.DataTexture(new Uint8Array([0, 128, 255]), 3, 1);

    manager.applyCartoonShading(root, mockGradient);

    expect(stdMat.roughness).toBe(0.85);
    expect(stdMat.metalness).toBe(0.05);
    expect(mesh.castShadow).toBe(true);
    expect(mesh.receiveShadow).toBe(true);
  });
});
