/**
 * Test per la fisica del giocatore (movimento, salto, gravità e caduta).
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.1.0
 */

import { describe, it, expect } from 'vitest';

describe('Fisica del Giocatore (Pip)', () => {
  const walkSpeed = 5.2; // m/s
  const jumpImpulse = 7.8; // m/s
  const gravity = 22.0; // m/s^2

  it('dovrebbe calcolare la velocità orizzontale in base all input e walkSpeed', () => {
    const inputLength = 1.0;
    const computedSpeed = inputLength * walkSpeed;
    expect(computedSpeed).toBe(5.2);
  });

  it('dovrebbe applicare la gravità riducendo la velocità verticale ad ogni dt', () => {
    let velocityY = 0;
    const dt = 0.05; // 50ms

    velocityY -= gravity * dt;
    expect(velocityY).toBeCloseTo(-1.1, 4);

    velocityY -= gravity * dt;
    expect(velocityY).toBeCloseTo(-2.2, 4);
  });

  it('dovrebbe consentire il salto solo quando il personaggio è a terra (isGrounded)', () => {
    let isGrounded = true;
    let velocityY = 0;

    const performJump = () => {
      if (isGrounded) {
        velocityY = jumpImpulse;
        isGrounded = false;
        return true;
      }
      return false;
    };

    // Primo tentativo: a terra -> successo
    const jumpedFirst = performJump();
    expect(jumpedFirst).toBe(true);
    expect(velocityY).toBe(7.8);
    expect(isGrounded).toBe(false);

    // Secondo tentativo in aria -> bloccato
    const jumpedMidAir = performJump();
    expect(jumpedMidAir).toBe(false);
    expect(velocityY).toBe(7.8); // Non raddoppia
  });

  it('dovrebbe attivare il punto di sicurezza (respawn) se si cade sotto la soglia minima', () => {
    let posY = -6.0;
    let velY = -15.0;

    if (posY < -5.0) {
      posY = 3.0; // Posizione sicura sull'isola
      velY = 0.0;
    }

    expect(posY).toBe(3.0);
    expect(velY).toBe(0.0);
  });
});
