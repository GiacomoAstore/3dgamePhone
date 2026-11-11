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

  it('dovrebbe considerare camminabili pendenze con normale.y >= 0.55 e respingere muri ripidi', () => {
    const isWalkableSlope = (normalY: number) => normalY >= 0.55;

    // Pendenza moderata (es. ~30 gradi, normale Y ~0.866): camminabile
    expect(isWalkableSlope(0.866)).toBe(true);

    // Pendenza limite (es. ~50 gradi, normale Y ~0.64): camminabile
    expect(isWalkableSlope(0.64)).toBe(true);

    // Muro quasi verticale (es. ~75 gradi, normale Y ~0.25): ostacolo/muro
    expect(isWalkableSlope(0.25)).toBe(false);

    // Parete a 90 gradi (normale Y = 0.0): ostacolo/muro
    expect(isWalkableSlope(0.0)).toBe(false);
  });

  it('dovrebbe applicare ground snapping se il giocatore era già a terra e scende un pendio', () => {
    const maxStepUp = 0.35;
    const snapDownTolerance = 0.5;

    const checkSnap = (wasGrounded: boolean, velocityY: number, groundDeltaY: number) => {
      // groundDeltaY = groundY - (playerY - playerHeight)
      if (groundDeltaY >= -snapDownTolerance && groundDeltaY <= maxStepUp) {
        if (groundDeltaY < 0 && (!wasGrounded || velocityY > 0)) {
          return false; // in caduta libera o salto attivo verso l'alto senza snap
        }
        return true; // ground snapped
      }
      return false;
    };

    // Scendendo un pendio: groundDeltaY = -0.25m, era a terra, non sta saltando
    expect(checkSnap(true, 0, -0.25)).toBe(true);

    // Cadendo da una scogliera alta: groundDeltaY = -1.2m
    expect(checkSnap(true, 0, -1.2)).toBe(false);

    // Saltando in aria: se non era a terra e c'è dislivello negativo
    expect(checkSnap(false, -1.0, -0.3)).toBe(false);
  });
});
