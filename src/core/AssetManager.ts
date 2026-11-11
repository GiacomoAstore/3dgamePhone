/**
 * AssetManager - Gestore centralizzato per il caricamento e la cache dei modelli 3D GLTF/GLB e animazioni.
 *
 * Supporta caricamento asincrono, instanziazione tramite clonazione,
 * conversione automatica a cel-shading cartoon e fallback controllato.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.3.3
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

export interface ModelAssetInfo {
  id: string;
  url: string;
  author: 'Kenney' | 'Quaternius' | 'KayKit';
  license: 'CC0-1.0';
}

export class AssetManager {
  private static instance: AssetManager | null = null;
  private loader: GLTFLoader;
  private modelCache: Map<string, THREE.Group> = new Map();
  private animationCache: Map<string, THREE.AnimationClip[]> = new Map();
  private loadPromises: Map<string, Promise<THREE.Group>> = new Map();
  private isAvailable: boolean = true;

  private constructor() {
    this.loader = new GLTFLoader();
    // Verifica se siamo in ambiente browser completo con location valida
    const isBrowser =
      typeof window !== 'undefined' &&
      window.location &&
      window.location.protocol &&
      (window.location.protocol === 'http:' || window.location.protocol === 'https:');
    if (!isBrowser) {
      this.isAvailable = false;
    }
  }

  /**
   * Restituisce l'istanza singleton dell'AssetManager.
   */
  public static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  /**
   * Resetta l'istanza singleton (utile per i test di isolamento).
   */
  public static resetInstance(): void {
    AssetManager.instance = null;
  }

  /**
   * Carica un modello GLTF/GLB e ne inserisce la scena e le animazioni in cache.
   * In caso di errore o ambiente headless, degrada in modo controllato senza lanciare eccezioni fatali.
   *
   * @param id Identificatore univoco del modello (es. 'tree_oak', 'Rogue_Hooded')
   * @param url Percorso relativo al modello (es. '/models/tree_oak.glb')
   */
  public async loadModel(id: string, url: string): Promise<THREE.Group | null> {
    if (this.modelCache.has(id)) {
      return this.modelCache.get(id)!;
    }

    if (this.loadPromises.has(id)) {
      return this.loadPromises.get(id)!;
    }

    if (!this.isAvailable) {
      return null;
    }

    const promise = new Promise<THREE.Group>((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          this.modelCache.set(id, gltf.scene);
          if (gltf.animations && gltf.animations.length > 0) {
            this.animationCache.set(id, gltf.animations);
          }
          resolve(gltf.scene);
        },
        undefined,
        (error) => {
          console.warn(
            `[AssetManager] Impossibile caricare il modello '${id}' da '${url}':`,
            error
          );
          reject(error);
        }
      );
    });

    this.loadPromises.set(id, promise);

    try {
      return await promise;
    } catch {
      return null;
    }
  }

  /**
   * Carica un file contenente tracce di animazione GLTF/GLB e ne salva le clip in cache.
   *
   * @param id Identificatore della libreria di animazioni (es. 'anims_movement')
   * @param url Percorso al file GLB contenente le animazioni
   */
  public async loadAnimations(id: string, url: string): Promise<THREE.AnimationClip[]> {
    if (this.animationCache.has(id)) {
      return this.animationCache.get(id)!;
    }

    if (!this.isAvailable) {
      return [];
    }

    return new Promise<THREE.AnimationClip[]>((resolve) => {
      this.loader.load(
        url,
        (gltf) => {
          const anims = gltf.animations || [];
          this.animationCache.set(id, anims);
          resolve(anims);
        },
        undefined,
        (error) => {
          console.warn(
            `[AssetManager] Impossibile caricare animazioni '${id}' da '${url}':`,
            error
          );
          resolve([]);
        }
      );
    });
  }

  /**
   * Instanzia una copia clonata del modello per l'inserimento nella scena di gioco.
   *
   * @param id Identificatore del modello caricato
   * @returns Un clone di THREE.Group oppure null se il modello non è in cache
   */
  public instantiate(id: string): THREE.Group | null {
    const original = this.modelCache.get(id);
    if (!original) {
      return null;
    }
    const clone = SkeletonUtils.clone(original) as THREE.Group;
    // Assicura abilitazione ombre sulle mesh child
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }

  /**
   * Restituisce le clip di animazione associate a un modello o libreria.
   */
  public getAnimations(id: string): THREE.AnimationClip[] {
    return this.animationCache.get(id) || [];
  }

  /**
   * Verifica se un modello è già presente in cache.
   */
  public hasModel(id: string): boolean {
    return this.modelCache.has(id);
  }

  /**
   * Ottimizza i materiali per una resa cartoon morbida (alta ruvidità, bassa riflettanza metallica)
   * mantenendo le texture atlasi e i pesi di skinning originali.
   *
   * @param object Nodo radice del modello 3D
   * @param gradientMap Mappa gradiente 1D a gradini per cel-shading (opzionale)
   */
  public applyCartoonShading(object: THREE.Object3D, gradientMap?: THREE.Texture): void {
    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.roughness = 0.85;
              mat.metalness = 0.05;
              if (gradientMap && 'gradientMap' in mat) {
                (mat as unknown as { gradientMap: THREE.Texture }).gradientMap = gradientMap;
              }
            } else if (mat instanceof THREE.MeshToonMaterial) {
              if (gradientMap) {
                mat.gradientMap = gradientMap;
              }
            }
          });
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      }
    });
  }
}
