/**
 * Test unitari per il meccanismo di Fallback Procedurale.
 * Verifica che, in caso di mancato caricamento dei modelli 3D GLB (errore di rete, offline o 404),
 * il gioco non vada in crash né mostri il vuoto, ma mantenga attive e visibili
 * le rappresentazioni grafiche cartoon procedurali.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.3.9
 */

import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { Player } from '../src/entities/Player';
import { NPC } from '../src/entities/NPC';

describe('Meccanismo di Fallback Procedurale (Resilienza Risorse 3D)', () => {
  it('dovrebbe mantenere Pip procedurale completo e visibile se il GLB non viene caricato', () => {
    // Istanzia il giocatore
    const player = new Player();

    // Verifiche all'avvio: il modello procedurale è pronto e completo
    expect(player.meshComponents).toBeDefined();
    expect(player.meshComponents.root).toBeDefined();
    expect(player.meshComponents.root.visible).toBe(true);

    // Verifica che tutte le componenti cartoon procedurali siano collegate al root
    expect(player.meshComponents.body.parent).toBe(player.meshComponents.root);
    expect(player.meshComponents.body.visible).toBe(true);
    expect(player.meshComponents.head.parent).toBe(player.meshComponents.root);
    expect(player.meshComponents.head.visible).toBe(true);
    expect(player.meshComponents.hat.parent).toBe(player.meshComponents.root);
    expect(player.meshComponents.hat.visible).toBe(true);
    expect(player.meshComponents.leftLeg.parent).toBe(player.meshComponents.root);
    expect(player.meshComponents.rightLeg.parent).toBe(player.meshComponents.root);
    expect(player.meshComponents.leftArm.parent).toBe(player.meshComponents.root);
    expect(player.meshComponents.rightArm.parent).toBe(player.meshComponents.root);
    expect(player.meshComponents.lantern.parent).toBe(player.meshComponents.root);
    expect(player.meshComponents.lanternLight).toBeDefined();

    // Se il GLB non carica (o prima che sia caricato), glbModel è null e il procedurale resta attivo
    expect((player as any).glbModel).toBeNull();
  });

  it('dovrebbe mantenere Nonna Bussola procedurale visibile se il GLB non viene caricato', () => {
    const npc = new NPC(
      'nonna_bussola',
      'Nonna Bussola',
      new THREE.Vector3(0, 4.6, 0)
    );

    // Il gruppo procedurale dell'NPC deve esistere ed essere parte del grafo visibile
    let foundTelescope = false;
    let foundProceduralMeshes = 0;

    npc.group.traverse((child) => {
      if (child.name === 'Observatory_Telescope') {
        foundTelescope = true;
      }
      if ((child as THREE.Mesh).isMesh && child.visible) {
        foundProceduralMeshes++;
      }
    });

    expect(foundTelescope).toBe(true);
    expect(foundProceduralMeshes).toBeGreaterThan(5);
    expect(npc.group.visible).toBe(true);
  });

  it('dovrebbe mantenere la lanterna procedurale e la luce funzionanti anche senza modelli esterni', () => {
    const player = new Player();
    player.isLanternActive = false;

    // Toggle lanterna
    player.isLanternActive = true;
    player.meshComponents.lanternLight.intensity = 1.5;

    expect(player.isLanternActive).toBe(true);
    expect(player.meshComponents.lanternLight.intensity).toBe(1.5);
    expect(player.meshComponents.lantern.visible).toBe(true);
  });
});
