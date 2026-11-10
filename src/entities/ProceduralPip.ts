/**
 * Generazione procedurale del modello 3D di Pip (protagonista).
 * Realizzato con primitive Three.js e materiali toon a gradini.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.1.0
 */

import * as THREE from 'three';

export interface PipMeshComponents {
  root: THREE.Group;
  body: THREE.Mesh;
  head: THREE.Mesh;
  hat: THREE.Group;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  lantern: THREE.Group;
  lanternLight: THREE.PointLight;
}

export class ProceduralPip {
  /**
   * Costruisce la gerarchia 3D di Pip con proporzioni buffe e stile cartoon.
   */
  public static create(): PipMeshComponents {
    const root = new THREE.Group();
    root.name = 'Pip';

    // Palette cartoon di Pip
    const coatMaterial = new THREE.MeshToonMaterial({
      color: 0x2a9d8f, // Turchese ottanio
    });

    const skinMaterial = new THREE.MeshToonMaterial({
      color: 0xf4a261, // Tonalità pesca calda
    });

    const hatMaterial = new THREE.MeshToonMaterial({
      color: 0x264653, // Blu scuro cartografo
    });

    const hatBandMaterial = new THREE.MeshToonMaterial({
      color: 0xe76f51, // Fascia corallo
    });

    const bootsMaterial = new THREE.MeshToonMaterial({
      color: 0x6b4226, // Cuoio marrone
    });

    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0x111111,
    });

    const brassMaterial = new THREE.MeshToonMaterial({
      color: 0xe9c46a, // Ottone dorato
    });

    const lanternGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffe8a1, // Luce calda della lanterna
    });

    // 1. Corpo a forma di cilindro arrotondato (cappotto)
    const bodyGeom = new THREE.CylinderGeometry(0.24, 0.32, 0.5, 12);
    const body = new THREE.Mesh(bodyGeom, coatMaterial);
    body.position.y = 0.55;
    body.castShadow = true;
    root.add(body);

    // 2. Testa sferica morbida
    const headGeom = new THREE.SphereGeometry(0.25, 16, 14);
    const head = new THREE.Mesh(headGeom, skinMaterial);
    head.position.y = 0.95;
    head.castShadow = true;
    root.add(head);

    // Occhi cartoon
    const eyeGeom = new THREE.SphereGeometry(0.04, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeom, eyeMaterial);
    leftEye.position.set(0.09, 0.96, 0.22);
    root.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeom, eyeMaterial);
    rightEye.position.set(-0.09, 0.96, 0.22);
    root.add(rightEye);

    // 3. Cappello del Cartografo (tesa larga + cono)
    const hat = new THREE.Group();
    hat.position.set(0, 1.12, 0);

    const brimGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.04, 16);
    const brim = new THREE.Mesh(brimGeom, hatMaterial);
    hat.add(brim);

    const crownGeom = new THREE.ConeGeometry(0.26, 0.35, 14);
    const crown = new THREE.Mesh(crownGeom, hatMaterial);
    crown.position.y = 0.17;
    hat.add(crown);

    const bandGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 14);
    const band = new THREE.Mesh(bandGeom, hatBandMaterial);
    band.position.y = 0.03;
    hat.add(band);

    root.add(hat);

    // 4. Gambette e stivaletti
    const legGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.26, 8);
    const leftLeg = new THREE.Mesh(legGeom, bootsMaterial);
    leftLeg.position.set(0.12, 0.16, 0);
    leftLeg.castShadow = true;
    root.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeom, bootsMaterial);
    rightLeg.position.set(-0.12, 0.16, 0);
    rightLeg.castShadow = true;
    root.add(rightLeg);

    // 5. Braccia
    const armGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.32, 8);
    const leftArm = new THREE.Mesh(armGeom, coatMaterial);
    leftArm.position.set(0.32, 0.55, 0);
    root.add(leftArm);

    const rightArm = new THREE.Mesh(armGeom, coatMaterial);
    rightArm.position.set(-0.32, 0.55, 0);
    root.add(rightArm);

    // 6. Lanterna Magica (impugnata nella mano destra o a tracolla)
    const lantern = new THREE.Group();
    lantern.position.set(0.38, 0.42, 0.15);

    const lanternBodyGeom = new THREE.CylinderGeometry(0.07, 0.09, 0.16, 8);
    const lanternCore = new THREE.Mesh(lanternBodyGeom, lanternGlowMaterial);
    lantern.add(lanternCore);

    const lanternCapGeom = new THREE.ConeGeometry(0.1, 0.08, 8);
    const lanternCap = new THREE.Mesh(lanternCapGeom, brassMaterial);
    lanternCap.position.y = 0.11;
    lantern.add(lanternCap);

    // Piccola luce puntiforme emessa dalla lanterna
    const lanternLight = new THREE.PointLight(0xffbe0b, 1.2, 5.0, 1.5);
    lanternLight.position.set(0, 0, 0);
    lantern.add(lanternLight);

    root.add(lantern);

    return {
      root,
      body,
      head,
      hat,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      lantern,
      lanternLight,
    };
  }
}
