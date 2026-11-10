/**
 * Ambiente di gioco: illuminazione toon, cielo, mare animato e nebbia di Three.js.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.1.0
 */

import * as THREE from 'three';

export class Environment {
  public scene: THREE.Scene;
  public sunLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public seaMesh: THREE.Mesh;
  public fog: THREE.FogExp2;

  private waveTimer = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // 1. Nebbia semplice di Three.js (grigio-azzurra iniziale, come da design)
    this.fog = new THREE.FogExp2(0xa3b8cc, 0.018);
    this.scene.fog = this.fog;
    this.scene.background = new THREE.Color(0xa3b8cc);

    // 2. Luce emisferica calda (cielo azzurro polvere / riflesso mare)
    this.hemiLight = new THREE.HemisphereLight(0xe8f0fe, 0x506575, 1.1);
    this.scene.add(this.hemiLight);

    // 3. Sole Toon (luce direzionale dorata)
    this.sunLight = new THREE.DirectionalLight(0xfff1cc, 1.4);
    this.sunLight.position.set(30, 45, 25);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 120;
    this.sunLight.shadow.camera.left = -25;
    this.sunLight.shadow.camera.right = 25;
    this.sunLight.shadow.camera.top = 25;
    this.sunLight.shadow.camera.bottom = -25;
    this.sunLight.shadow.bias = -0.001;
    this.scene.add(this.sunLight);

    // 4. Mare calmo cartoon con vertici animabili
    const seaGeom = new THREE.PlaneGeometry(240, 240, 32, 32);
    seaGeom.rotateX(-Math.PI / 2);

    const seaMaterial = new THREE.MeshToonMaterial({
      color: 0x4895ef, // Turchese mare
      transparent: true,
      opacity: 0.88,
      wireframe: false,
    });

    this.seaMesh = new THREE.Mesh(seaGeom, seaMaterial);
    this.seaMesh.position.y = -0.4; // Livello dell'acqua
    this.seaMesh.receiveShadow = true;
    this.scene.add(this.seaMesh);
  }

  /**
   * Aggiorna l'animazione delle onde morbide del mare.
   * @param dt Delta time in secondi.
   */
  public update(dt: number): void {
    this.waveTimer += dt * 1.5;
    const posAttr = this.seaMesh.geometry.attributes.position;
    const count = posAttr.count;

    for (let i = 0; i < count; i++) {
      const u = posAttr.getX(i);
      const w = posAttr.getZ(i);
      // Onde sinusoidali dolci per effetto cartoon rilassante
      const wave =
        Math.sin(u * 0.15 + this.waveTimer) * 0.12 +
        Math.cos(w * 0.15 + this.waveTimer * 0.8) * 0.08;
      posAttr.setY(i, wave);
    }
    posAttr.needsUpdate = true;
    this.seaMesh.geometry.computeVertexNormals();
  }

  /**
   * Modifica la densità della nebbia (es. quando Pip purifica una zona).
   */
  public setFogDensity(density: number): void {
    this.fog.density = density;
  }
}
