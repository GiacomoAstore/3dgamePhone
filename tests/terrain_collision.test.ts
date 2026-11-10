/**
 * Test per il rilevamento del terreno e prevenzione compenetrazioni.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.1.0
 */

import { describe, it, expect } from 'vitest';

describe('Rilevamento Terreno e Collisioni', () => {
  it('dovrebbe determinare se il personaggio è a terra in base alla tolleranza verticale', () => {
    const isPlayerGrounded = (playerY: number, groundY: number) => {
      const diff = playerY - groundY;
      return diff <= 0.15 && diff >= -0.3;
    };

    expect(isPlayerGrounded(2.05, 2.0)).toBe(true); // Entro tolleranza
    expect(isPlayerGrounded(2.0, 2.0)).toBe(true); // Perfettamente allineato
    expect(isPlayerGrounded(2.8, 2.0)).toBe(false); // In salto/volo
    expect(isPlayerGrounded(1.5, 2.0)).toBe(false); // Troppo sotto (richiede snap)
  });

  it('dovrebbe eseguire lo snap verso l alto per correggere la compenetrazione', () => {
    let playerY = 1.9;
    const groundY = 2.0;
    let velocityY = -5.0;

    if (playerY < groundY) {
      playerY = groundY;
      velocityY = 0;
    }

    expect(playerY).toBe(2.0);
    expect(velocityY).toBe(0);
  });

  it('dovrebbe proiettare il vettore di movimento lungo la normale della parete per lo scivolamento', () => {
    // Vettore movimento: avanti (0, 0, 1)
    const move = { x: 0, y: 0, z: 1 };
    // Parete inclinata che respinge verso destra e indietro: normale (0.707, 0, -0.707)
    const normal = { x: Math.SQRT1_2, y: 0, z: -Math.SQRT1_2 };

    // Proiezione vettoriale: move - (move . normal) * normal
    const dot = move.x * normal.x + move.y * normal.y + move.z * normal.z;
    const projected = {
      x: move.x - normal.x * dot,
      y: move.y - normal.y * dot,
      z: move.z - normal.z * dot,
    };

    // La componente deve scivolare lateralmente (x positivo)
    expect(projected.x).toBeGreaterThan(0);
    expect(projected.z).toBeGreaterThan(0);
  });
});
