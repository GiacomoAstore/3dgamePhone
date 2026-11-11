/**
 * Generazione del modello 3D cartoon di Pip (protagonista).
 * Progettato con proporzioni e dettagli espressivi (viso con occhi vivi, ciuffo,
 * sciarpa svolazzante, zaino con pergamene, giacca con bottoni e lanterna rifinita).
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.3.8 (mergeGeometries per elementi in ottone della lanterna)
 */

import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ToonShaderUtils } from '../world/ToonShaderUtils';

export interface PipMeshComponents {
  root: THREE.Group;
  body: THREE.Mesh;
  head: THREE.Mesh;
  hat: THREE.Group;
  backpack: THREE.Group;
  scarfCollar: THREE.Mesh;
  scarfTail: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  lantern: THREE.Group;
  lanternLight: THREE.PointLight;
}

export class ProceduralPip {
  /**
   * Costruisce la gerarchia 3D cartoon di Pip.
   */
  public static create(): PipMeshComponents {
    const root = new THREE.Group();
    root.name = 'Pip';

    const stepGradMap = ToonShaderUtils.getStepGradientMap(3);

    // Palette cartoon calda e contrastata
    const skinMaterial = new THREE.MeshToonMaterial({
      color: 0xfbd1a2, // Incarnato pesca caldo cartoon
      gradientMap: stepGradMap,
    });

    const hairMaterial = new THREE.MeshToonMaterial({
      color: 0x5a3825, // Castano caldo
      gradientMap: stepGradMap,
    });

    const coatMaterial = new THREE.MeshToonMaterial({
      color: 0x2a9d8f, // Turchese ottanio da cartografo
      gradientMap: stepGradMap,
    });

    const coatTrimMaterial = new THREE.MeshToonMaterial({
      color: 0x21867a, // Bordi e bavero scuri
      gradientMap: stepGradMap,
    });

    const scarfMaterial = new THREE.MeshToonMaterial({
      color: 0xe76f51, // Rosso corallo caldo
      gradientMap: stepGradMap,
    });

    const leatherMaterial = new THREE.MeshToonMaterial({
      color: 0x6f4518, // Cuoio scuro per cinture e zaino
      gradientMap: stepGradMap,
    });

    const brassMaterial = new THREE.MeshToonMaterial({
      color: 0xf4a261, // Ottone dorato caldo
      gradientMap: stepGradMap,
    });

    const hatMaterial = new THREE.MeshToonMaterial({
      color: 0x264653, // Blu cartografo profondo
      gradientMap: stepGradMap,
    });

    const paperMaterial = new THREE.MeshToonMaterial({
      color: 0xfefae0, // Pergamena antica chiara
      gradientMap: stepGradMap,
    });

    const bootsMaterial = new THREE.MeshToonMaterial({
      color: 0x472d1b, // Cuoio calzature
      gradientMap: stepGradMap,
    });

    const soleMaterial = new THREE.MeshToonMaterial({
      color: 0xd4a373, // Suola a contrasto
      gradientMap: stepGradMap,
    });

    const blushMaterial = new THREE.MeshBasicMaterial({
      color: 0xf28482,
      transparent: true,
      opacity: 0.65,
    });

    const eyeWhiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeIrisMaterial = new THREE.MeshBasicMaterial({ color: 0x2a9d8f });
    const eyePupilMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const eyeSparkleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const lanternGlassMaterial = new THREE.MeshBasicMaterial({
      color: 0xffe8a1,
      transparent: true,
      opacity: 0.85,
    });

    // ==========================================
    // 1. CORPO E GIACCA DA CARTOGRAFO
    // ==========================================
    const bodyGeom = new THREE.CylinderGeometry(0.24, 0.33, 0.52, 14);
    const body = new THREE.Mesh(bodyGeom, coatMaterial);
    body.name = 'Pip_Body';
    body.position.y = 0.56;
    body.castShadow = true;

    // Bavero e risvolto del colletto
    const collarGeom = new THREE.ConeGeometry(0.35, 0.18, 12, 1, true);
    const collar = new THREE.Mesh(collarGeom, coatTrimMaterial);
    collar.position.y = 0.22;
    collar.rotation.x = Math.PI;
    body.add(collar);

    // Bottoni dorati sul petto
    for (let b = 0; b < 3; b++) {
      const btnMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.015, 8),
        brassMaterial
      );
      btnMesh.rotation.x = Math.PI / 2;
      btnMesh.position.set(0.06, 0.14 - b * 0.1, 0.28);
      body.add(btnMesh);
    }

    // Cintura in cuoio con fibbia dorata
    const beltGeom = new THREE.CylinderGeometry(0.32, 0.33, 0.06, 14);
    const belt = new THREE.Mesh(beltGeom, leatherMaterial);
    belt.position.y = -0.15;
    body.add(belt);

    const buckleGeom = new THREE.BoxGeometry(0.09, 0.07, 0.04);
    const buckle = new THREE.Mesh(buckleGeom, brassMaterial);
    buckle.position.set(0, -0.15, 0.32);
    body.add(buckle);

    // Borsello laterale in cuoio
    const pouchGeom = new THREE.BoxGeometry(0.12, 0.12, 0.08);
    const pouch = new THREE.Mesh(pouchGeom, leatherMaterial);
    pouch.position.set(0.31, -0.16, 0.08);
    pouch.rotation.z = -0.15;
    body.add(pouch);

    // Contorno toon Inverted Hull
    const bodyOutline = ToonShaderUtils.createInvertedHullOutline(body, 0.022, 0x162238);
    body.add(bodyOutline);
    root.add(body);

    // ==========================================
    // 2. ZAINO DA VIAGGIO CON MAPPE ARROTOLATE
    // ==========================================
    const backpack = new THREE.Group();
    backpack.position.set(0, 0.58, -0.26);

    const packBody = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.16), leatherMaterial);
    packBody.castShadow = true;
    backpack.add(packBody);

    // Mappe arrotolate che spuntano dalla tasca superiore dello zaino
    for (let m = 0; m < 2; m++) {
      const scrollGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.38, 8);
      const scroll = new THREE.Mesh(scrollGeom, paperMaterial);
      scroll.position.set(-0.06 + m * 0.12, 0.22, 0);
      scroll.rotation.z = -0.15 + m * 0.3;
      scroll.rotation.x = -0.15;
      backpack.add(scroll);

      // Nastro dorato/rosso che chiude il rotolo
      const ribbon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.042, 0.042, 0.03, 8),
        scarfMaterial
      );
      ribbon.position.copy(scroll.position);
      ribbon.rotation.copy(scroll.rotation);
      backpack.add(ribbon);
    }
    root.add(backpack);

    // ==========================================
    // 3. SCIARPA CORALLO AVVOLTA AL COLLO
    // ==========================================
    const scarfCollarGeom = new THREE.TorusGeometry(0.25, 0.065, 8, 16);
    scarfCollarGeom.rotateX(Math.PI / 2);
    const scarfCollar = new THREE.Mesh(scarfCollarGeom, scarfMaterial);
    scarfCollar.position.y = 0.83;
    root.add(scarfCollar);

    // Code svolazzanti della sciarpa (animate al vento e corsa)
    const scarfTail = new THREE.Group();
    scarfTail.position.set(0.08, 0.82, -0.22);

    const tail1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, 0.03), scarfMaterial);
    tail1.position.set(-0.04, -0.12, 0);
    tail1.rotation.z = 0.18;
    tail1.rotation.x = -0.25;
    scarfTail.add(tail1);

    const tail2 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.22, 0.03), scarfMaterial);
    tail2.position.set(0.05, -0.1, -0.02);
    tail2.rotation.z = -0.22;
    tail2.rotation.x = -0.35;
    scarfTail.add(tail2);

    root.add(scarfTail);

    // ==========================================
    // 4. TESTA E VISO ESPRESSIVO CARTOON
    // ==========================================
    const headGeom = new THREE.SphereGeometry(0.27, 18, 16);
    const head = new THREE.Mesh(headGeom, skinMaterial);
    head.name = 'Pip_Head';
    head.position.y = 1.05;
    head.castShadow = true;

    // Ciuffo di capelli ribelle sulla fronte
    const hairBangsGeom = new THREE.ConeGeometry(0.12, 0.16, 6);
    hairBangsGeom.rotateX(Math.PI / 4);
    const bangs = new THREE.Mesh(hairBangsGeom, hairMaterial);
    bangs.position.set(0.05, 0.16, 0.24);
    head.add(bangs);

    // Occhi grandi e vivi (sinistro e destro)
    for (const side of [-1, 1]) {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(side * 0.095, 0.03, 0.24);

      // 1. Sclera bianca
      const white = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 8), eyeWhiteMaterial);
      white.scale.set(0.85, 1.1, 0.4);
      eyeGroup.add(white);

      // 2. Iride turchese
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 8), eyeIrisMaterial);
      iris.scale.set(0.85, 1.0, 0.4);
      iris.position.z = 0.02;
      eyeGroup.add(iris);

      // 3. Pupilla nera
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), eyePupilMaterial);
      pupil.position.z = 0.035;
      eyeGroup.add(pupil);

      // 4. Punto luce bianco speculare (catchlight vivo)
      const sparkle = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 6), eyeSparkleMaterial);
      sparkle.position.set(0.012, 0.012, 0.045);
      eyeGroup.add(sparkle);

      head.add(eyeGroup);

      // Guancette rosee (blush cartoon)
      const blush = new THREE.Mesh(new THREE.CircleGeometry(0.045, 10), blushMaterial);
      blush.position.set(side * 0.14, -0.06, 0.21);
      blush.rotation.y = side * 0.4;
      head.add(blush);
    }

    // Nasino cartoon
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), skinMaterial);
    nose.position.set(0, -0.02, 0.27);
    head.add(nose);

    // Sorrisetto amichevole
    const smileGeom = new THREE.TorusGeometry(0.04, 0.008, 6, 8, Math.PI);
    const smile = new THREE.Mesh(smileGeom, hairMaterial);
    smile.position.set(0, -0.09, 0.25);
    smile.rotation.x = Math.PI / 1.8;
    head.add(smile);

    // Contorno toon Inverted Hull
    const headOutline = ToonShaderUtils.createInvertedHullOutline(head, 0.02, 0x162238);
    head.add(headOutline);
    root.add(head);

    // ==========================================
    // 5. CAPPELLO DEL CARTOGRAFO SAGOMATO
    // ==========================================
    const hat = new THREE.Group();
    hat.position.set(0, 1.25, -0.02);
    hat.rotation.x = -0.1; // Leggermente inclinato all'indietro con stile

    // Tesa sagomata a falde morbide
    const brimGeom = new THREE.CylinderGeometry(0.44, 0.44, 0.04, 18);
    const brim = new THREE.Mesh(brimGeom, hatMaterial);
    brim.scale.set(1.0, 1.0, 1.08); // Leggermente ovale
    hat.add(brim);

    // Cupola sagomata rastremata
    const crownGeom = new THREE.CylinderGeometry(0.24, 0.32, 0.34, 16);
    const crown = new THREE.Mesh(crownGeom, hatMaterial);
    crown.position.y = 0.17;
    hat.add(crown);

    // Fascia in pelle marrone
    const bandGeom = new THREE.CylinderGeometry(0.31, 0.32, 0.06, 16);
    const band = new THREE.Mesh(bandGeom, leatherMaterial);
    band.position.y = 0.04;
    hat.add(band);

    // Spilletta a rosa dei venti sulla fascia del cappello
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.02), brassMaterial);
    pin.position.set(0, 0.04, 0.33);
    pin.rotation.z = Math.PI / 4;
    hat.add(pin);

    root.add(hat);

    // ==========================================
    // 6. GAMBE E STIVALETTI DA TREKKING SAGOMATI
    // ==========================================
    const createLeg = (side: number) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.13, 0.32, 0);

      // Pantaloni alla zuava
      const pant = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.22, 10),
        coatTrimMaterial
      );
      pant.position.y = -0.02;
      pant.castShadow = true;
      legGroup.add(pant);

      // Gambetto stivale
      const bootShaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.085, 0.14, 10),
        bootsMaterial
      );
      bootShaft.position.y = -0.15;
      legGroup.add(bootShaft);

      // Scarponcino sagomato in avanti
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.22), bootsMaterial);
      foot.position.set(0, -0.22, 0.05);
      foot.castShadow = true;
      legGroup.add(foot);

      // Suola a contrasto
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.03, 0.24), soleMaterial);
      sole.position.set(0, -0.27, 0.05);
      legGroup.add(sole);

      return legGroup;
    };

    const leftLeg = createLeg(1);
    const rightLeg = createLeg(-1);
    root.add(leftLeg);
    root.add(rightLeg);

    // ==========================================
    // 7. BRACCIA ARTICOLATE CON GUANTINI
    // ==========================================
    const createArm = (side: number) => {
      const armGroup = new THREE.Group();
      armGroup.position.set(side * 0.34, 0.72, 0);

      // Spalla e manica
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.32, 10), coatMaterial);
      sleeve.position.y = -0.14;
      sleeve.castShadow = true;
      armGroup.add(sleeve);

      // Risvolto manica
      const cuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.095, 0.095, 0.05, 10),
        coatTrimMaterial
      );
      cuff.position.y = -0.27;
      armGroup.add(cuff);

      // Guantino in pelle beige
      const glove = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), leatherMaterial);
      glove.position.y = -0.32;
      armGroup.add(glove);

      return armGroup;
    };

    const leftArm = createArm(1);
    const rightArm = createArm(-1);
    root.add(leftArm);
    root.add(rightArm);

    // ==========================================
    // 8. LANTERNA MAGICA OTTOCENTESCA RIFINITA (parti metalliche unite con mergeGeometries)
    // ==========================================
    const lantern = new THREE.Group();
    lantern.name = 'Pip_Lantern';
    lantern.position.set(0.42, 0.38, 0.18);

    const brassGeoms: THREE.BufferGeometry[] = [];

    // Basamento esagonale ottone
    const baseGeom = new THREE.CylinderGeometry(0.09, 0.11, 0.05, 6);
    brassGeoms.push(baseGeom);

    // Cilindro/gabbia di vetro satinato
    const glass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.18, 12),
      lanternGlassMaterial
    );
    glass.position.y = 0.11;
    lantern.add(glass);

    // 4 montanti metallici verticali della gabbia
    for (let i = 0; i < 4; i++) {
      const strutAngle = (i * Math.PI) / 2;
      const strutGeom = new THREE.CylinderGeometry(0.01, 0.01, 0.18, 6);
      strutGeom.translate(Math.cos(strutAngle) * 0.085, 0.11, Math.sin(strutAngle) * 0.085);
      brassGeoms.push(strutGeom);
    }

    // Comignolo/cupolino superiore in ottone
    const capGeom = new THREE.ConeGeometry(0.11, 0.1, 6);
    capGeom.translate(0, 0.24, 0);
    brassGeoms.push(capGeom);

    // Manico arcuato in ferro
    const handleGeom = new THREE.TorusGeometry(0.07, 0.012, 6, 12, Math.PI);
    handleGeom.translate(0, 0.31, 0);
    brassGeoms.push(handleGeom);

    if (brassGeoms.length > 0) {
      const mergedBrass = BufferGeometryUtils.mergeGeometries(brassGeoms);
      const brassMesh = new THREE.Mesh(mergedBrass, brassMaterial);
      brassMesh.castShadow = true;
      lantern.add(brassMesh);
    }

    // Luce puntiforme calda con raggio magico
    const lanternLight = new THREE.PointLight(0xffbe0b, 1.8, 6.5, 1.4);
    lanternLight.position.set(0, 0.11, 0);
    lantern.add(lanternLight);

    root.add(lantern);

    return {
      root,
      body,
      head,
      hat,
      backpack,
      scarfCollar,
      scarfTail,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      lantern,
      lanternLight,
    };
  }

  /**
   * Mostra o nasconde i contorni toon inverted hull in base al profilo qualitativo.
   */
  public static setOutlineVisible(root: THREE.Object3D, visible: boolean): void {
    const bodyOutline = root.getObjectByName('Pip_Body_outline');
    if (bodyOutline) bodyOutline.visible = visible;
    const headOutline = root.getObjectByName('Pip_Head_outline');
    if (headOutline) headOutline.visible = visible;
  }
}
