/**
 * Utilità per lo stile Toon / Cel-Shading di Brumavento.
 * Genera gradient map discreti a gradini (cel shading a bande nette)
 * e contorni con tecnica inverted-hull per personaggi e oggetti chiave.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.0
 */

import * as THREE from 'three';

export class ToonShaderUtils {
  private static cachedGradientMap3Step: THREE.DataTexture | null = null;
  private static cachedGradientMap4Step: THREE.DataTexture | null = null;

  /**
   * Genera una DataTexture 1D con gradini discreti di tonalità per cel-shading.
   * NearestFilter garantisce bande nette di luce e ombra senza sfumature realistiche.
   * @param steps Numero di livelli di luminosità (3 = ombra, mezzotono, piena luce).
   */
  public static getStepGradientMap(steps: 3 | 4 = 3): THREE.DataTexture {
    if (steps === 3 && this.cachedGradientMap3Step) {
      return this.cachedGradientMap3Step;
    }
    if (steps === 4 && this.cachedGradientMap4Step) {
      return this.cachedGradientMap4Step;
    }

    const width = steps;
    const data = new Uint8Array(width);

    if (steps === 3) {
      // 3 bande: ombra fredda (100), mezzotono (190), luce piena (255)
      data[0] = 100;
      data[1] = 190;
      data[2] = 255;
    } else {
      // 4 bande: ombra profonda (70), ombra media (140), mezzotono (205), riflesso (255)
      data[0] = 70;
      data[1] = 140;
      data[2] = 205;
      data[3] = 255;
    }

    const texture = new THREE.DataTexture(data, width, 1, THREE.RedFormat);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;

    if (steps === 3) this.cachedGradientMap3Step = texture;
    else this.cachedGradientMap4Step = texture;

    return texture;
  }

  /**
   * Crea un materiale MeshToonMaterial con gradiente a gradini applicato.
   */
  public static createToonMaterial(
    parameters: THREE.MeshToonMaterialParameters,
    steps: 3 | 4 = 3
  ): THREE.MeshToonMaterial {
    const gradientMap = this.getStepGradientMap(steps);
    return new THREE.MeshToonMaterial({
      ...parameters,
      gradientMap,
    });
  }

  /**
   * Genera una mesh di contorno cartoon usando la tecnica Inverted Hull
   * (retro delle facce estruso lungo le normali con colore scuro).
   * @param sourceMesh Mesh di riferimento
   * @param thickness Spessore del bordo cartoon (default 0.035)
   * @param outlineColor Colore del contorno (default blu notte scuro 0x162238)
   */
  public static createInvertedHullOutline(
    sourceMesh: THREE.Mesh,
    thickness = 0.035,
    outlineColor = 0x162238
  ): THREE.Mesh {
    const outlineGeom = sourceMesh.geometry.clone();

    // Sposta leggermente i vertici lungo le normali per creare la silhouette esterna
    const posAttr = outlineGeom.attributes.position;
    const normAttr = outlineGeom.attributes.normal;

    if (normAttr) {
      for (let i = 0; i < posAttr.count; i++) {
        const nx = normAttr.getX(i);
        const ny = normAttr.getY(i);
        const nz = normAttr.getZ(i);

        posAttr.setXYZ(
          i,
          posAttr.getX(i) + nx * thickness,
          posAttr.getY(i) + ny * thickness,
          posAttr.getZ(i) + nz * thickness
        );
      }
      posAttr.needsUpdate = true;
    }

    const outlineMat = new THREE.MeshBasicMaterial({
      color: outlineColor,
      side: THREE.BackSide,
    });

    const outlineMesh = new THREE.Mesh(outlineGeom, outlineMat);
    outlineMesh.name = `${sourceMesh.name}_outline`;
    outlineMesh.castShadow = false;
    outlineMesh.receiveShadow = false;

    return outlineMesh;
  }
}

