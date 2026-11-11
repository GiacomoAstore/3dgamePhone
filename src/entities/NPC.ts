/**
 * Entità NPC (Personaggi Non Giocanti) con modellazione cartoon dettagliata.
 * Nonna Bussola (abito a pieghe, scialle a maglia, occhialetti d'oro, chignon argentato)
 * e Osservatorio Astronomico (grande telescopio in ottone, treppiede tornito, tavolo cartografico).
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.3.2
 */

import * as THREE from 'three';
import { DialogueSystem } from '../systems/DialogueSystem';
import { QuestSystem } from '../systems/QuestSystem';
import { ToonShaderUtils } from '../world/ToonShaderUtils';

export class NPC {
  public group: THREE.Group;
  public id: string;
  public name: string;
  public position: THREE.Vector3;
  public interactionRadius = 3.2;

  constructor(id: string, name: string, position: THREE.Vector3) {
    this.id = id;
    this.name = name;
    this.position = position;
    this.group = new THREE.Group();
    this.group.name = `NPC_${id}`;
    this.group.position.copy(position);

    if (id === 'nonna_bussola') {
      this.createNonnaBussolaModel();
    }
  }

  /**
   * Costruisce il modello 3D cartoon di Nonna Bussola e del suo osservatorio.
   */
  private createNonnaBussolaModel(): void {
    const stepGradMap = ToonShaderUtils.getStepGradientMap(3);

    // Materiali toon a gradini
    const dressMat = new THREE.MeshToonMaterial({ color: 0x5e2a4a, gradientMap: stepGradMap }); // Prugna nobile
    const dressTrimMat = new THREE.MeshToonMaterial({ color: 0x8a3b6b, gradientMap: stepGradMap });
    const shawlMat = new THREE.MeshToonMaterial({ color: 0xfefae0, gradientMap: stepGradMap }); // Crema lana
    const shawlBorderMat = new THREE.MeshToonMaterial({ color: 0xe76f51, gradientMap: stepGradMap }); // Bordo corallo
    const hairMat = new THREE.MeshToonMaterial({ color: 0xd8e2dc, gradientMap: stepGradMap }); // Argento morbido
    const skinMat = new THREE.MeshToonMaterial({ color: 0xfde2e4, gradientMap: stepGradMap }); // Incarnato dolce
    const woodMat = new THREE.MeshToonMaterial({ color: 0x582f0e, gradientMap: stepGradMap }); // Noce antico
    const brassMat = new THREE.MeshToonMaterial({ color: 0xf4a261, gradientMap: stepGradMap }); // Ottone brillante
    const bronzeMat = new THREE.MeshToonMaterial({ color: 0xb5838d, gradientMap: stepGradMap });
    const paperMat = new THREE.MeshToonMaterial({ color: 0xfaf0ca, gradientMap: stepGradMap }); // Mappa nautica
    const glassLensMat = new THREE.MeshBasicMaterial({ color: 0xa8dadc, transparent: true, opacity: 0.65 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1d3557 });
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xf4a261, transparent: true, opacity: 0.5 });

    // ==========================================
    // 1. PERSONAGGIO: NONNA BUSSOLA
    // ==========================================
    const characterGroup = new THREE.Group();
    characterGroup.name = 'NonnaBussola_Character';

    // Gonna a campana con balze
    const skirtGeom = new THREE.CylinderGeometry(0.28, 0.52, 0.95, 14);
    const skirt = new THREE.Mesh(skirtGeom, dressMat);
    skirt.position.y = 0.52;
    skirt.castShadow = true;
    skirt.receiveShadow = true;
    characterGroup.add(skirt);

    // Bordo ricamato alla base della gonna
    const skirtTrimGeom = new THREE.CylinderGeometry(0.51, 0.53, 0.08, 14);
    const skirtTrim = new THREE.Mesh(skirtTrimGeom, dressTrimMat);
    skirtTrim.position.y = 0.08;
    characterGroup.add(skirtTrim);

    // Busto e scialle a maglia spesso sulle spalle
    const torsoGeom = new THREE.CylinderGeometry(0.22, 0.3, 0.42, 12);
    const torso = new THREE.Mesh(torsoGeom, dressMat);
    torso.position.y = 1.05;
    characterGroup.add(torso);

    const shawlGeom = new THREE.ConeGeometry(0.52, 0.48, 14);
    const shawl = new THREE.Mesh(shawlGeom, shawlMat);
    shawl.position.y = 1.08;
    shawl.castShadow = true;
    characterGroup.add(shawl);

    // Bordo corallo decorativo dello scialle
    const shawlBorder = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.035, 6, 16), shawlBorderMat);
    shawlBorder.position.y = 0.86;
    shawlBorder.rotation.x = Math.PI / 2;
    characterGroup.add(shawlBorder);

    // Testa dolce con proporzioni cartoon
    const headGeom = new THREE.SphereGeometry(0.26, 16, 14);
    const head = new THREE.Mesh(headGeom, skinMat);
    head.position.y = 1.38;
    head.castShadow = true;

    // Occhietti sorridenti e saggi
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), eyeMat);
      eye.position.set(s * 0.08, 0.02, 0.23);
      head.add(eye);

      // Occhialini tondi cerchiati d'oro
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.009, 6, 12), brassMat);
      rim.position.set(s * 0.08, 0.02, 0.25);
      head.add(rim);

      // Guancette calde
      const blush = new THREE.Mesh(new THREE.CircleGeometry(0.045, 8), blushMat);
      blush.position.set(s * 0.13, -0.05, 0.21);
      blush.rotation.y = s * 0.4;
      head.add(blush);
    }

    // Ponte metallico degli occhiali
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 6), brassMat);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.02, 0.26);
    head.add(bridge);

    // Naso carino e sorriso
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), skinMat);
    nose.position.set(0, -0.03, 0.26);
    head.add(nose);

    // Capelli argentati pettinati e chignon alto
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat);
    hairCap.position.set(0, 0.06, -0.03);
    head.add(hairCap);

    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), hairMat);
    bun.position.set(0, 0.18, -0.16);
    head.add(bun);

    // Spillone in ottone a rosa dei venti nello chignon
    const hairPin = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.38, 6), brassMat);
    hairPin.position.set(0, 0.2, -0.16);
    hairPin.rotation.z = Math.PI / 3;
    head.add(hairPin);

    characterGroup.add(head);

    // Bastone da passeggio nodoso in legno lucido
    const cane = new THREE.Group();
    cane.position.set(0.38, 0, 0.22);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.95, 8), woodMat);
    shaft.position.y = 0.48;
    shaft.castShadow = true;
    cane.add(shaft);

    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), brassMat);
    knob.position.y = 0.96;
    cane.add(knob);
    characterGroup.add(cane);

    this.group.add(characterGroup);

    // ==========================================
    // 2. OSSERVATORIO: GRANDE TELESCOPIO IN OTTONE
    // ==========================================
    const telescopeGroup = new THREE.Group();
    telescopeGroup.name = 'Observatory_Telescope';
    telescopeGroup.position.set(-1.4, 0, 0.6);

    // Robusto treppiede in legno antico con tiranti in bronzo
    const legGeom = new THREE.CylinderGeometry(0.045, 0.035, 1.5, 8);
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const leg = new THREE.Mesh(legGeom, woodMat);
      leg.position.set(Math.cos(angle) * 0.42, 0.68, Math.sin(angle) * 0.42);
      leg.rotation.x = Math.sin(angle) * 0.3;
      leg.rotation.z = -Math.cos(angle) * 0.3;
      leg.castShadow = true;
      telescopeGroup.add(leg);
    }

    // Snodo cardanico centrale e ruote dentate in ottone
    const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.25, 10), brassMat);
    mount.position.y = 1.35;
    telescopeGroup.add(mount);

    const gearWheel = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 6, 12), bronzeMat);
    gearWheel.position.set(0, 1.38, 0);
    gearWheel.rotation.x = Math.PI / 2;
    telescopeGroup.add(gearWheel);

    // Tubo ottico principale del telescopio (puntato verso le stelle a 35°)
    const tubeGroup = new THREE.Group();
    tubeGroup.position.set(0, 1.48, 0);
    tubeGroup.rotation.x = -0.45; // Elevazione celeste
    tubeGroup.rotation.y = 0.2;

    // Corpo conico ottone rastremato
    const tubeGeom = new THREE.CylinderGeometry(0.13, 0.08, 1.6, 14);
    tubeGeom.rotateX(Math.PI / 2);
    const tube = new THREE.Mesh(tubeGeom, brassMat);
    tube.castShadow = true;
    tubeGroup.add(tube);

    // Anelli decorativi in bronzo lungo il tubo
    for (const zOff of [-0.4, 0, 0.4]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.018, 6, 14), bronzeMat);
      ring.position.z = zOff;
      tubeGroup.add(ring);
    }

    // Grande lente frontale (paraluce e lente in vetro)
    const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.22, 14), bronzeMat);
    hood.rotateX(Math.PI / 2);
    hood.position.z = 0.88;
    tubeGroup.add(hood);

    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.14, 14), glassLensMat);
    lens.position.z = 0.98;
    tubeGroup.add(lens);

    // Oculare posteriore
    const eyepiece = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.25, 8), bronzeMat);
    eyepiece.rotateX(Math.PI / 2);
    eyepiece.position.z = -0.9;
    tubeGroup.add(eyepiece);

    // Mirino laterale di puntamento
    const scopeGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8);
    scopeGeom.rotateX(Math.PI / 2);
    const scope = new THREE.Mesh(scopeGeom, brassMat);
    scope.position.set(0.14, 0.1, 0);
    tubeGroup.add(scope);

    telescopeGroup.add(tubeGroup);
    this.group.add(telescopeGroup);

    // ==========================================
    // 3. TAVOLO DA LAVORO CARTOGRAFICO
    // ==========================================
    const tableGroup = new THREE.Group();
    tableGroup.position.set(1.3, 0, 0.2);

    // Piano tavolo in legno
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.8), woodMat);
    top.position.y = 0.78;
    top.castShadow = true;
    tableGroup.add(top);

    // 4 gambe tavolo
    const tableLegGeom = new THREE.CylinderGeometry(0.04, 0.035, 0.75, 6);
    for (const x of [-0.48, 0.48]) {
      for (const z of [-0.3, 0.3]) {
        const tleg = new THREE.Mesh(tableLegGeom, woodMat);
        tleg.position.set(x, 0.38, z);
        tleg.castShadow = true;
        tableGroup.add(tleg);
      }
    }

    // Grande mappa nautica srotolata sul tavolo
    const mapSheet = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.55), paperMat);
    mapSheet.rotateX(-Math.PI / 2);
    mapSheet.position.set(0, 0.83, 0);
    mapSheet.rotation.z = 0.08;
    tableGroup.add(mapSheet);

    // Compasso nautico in ottone sul tavolo
    const compassGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 10);
    const compBox = new THREE.Mesh(compassGeom, brassMat);
    compBox.position.set(0.35, 0.85, 0.15);
    tableGroup.add(compBox);

    this.group.add(tableGroup);
  }

  public interact(dialogueSystem: DialogueSystem, questSystem: QuestSystem): void {
    if (this.id === 'nonna_bussola') {
      const activeQuest = questSystem.getActiveQuestInfo();
      const fragments = questSystem.getInventoryStats().fragmentsCollected;

      if (fragments > 0 && activeQuest?.stageIndex === 2) {
        dialogueSystem.startDialogue('nonna_bussola', 'quest_1_completed');
      } else if (activeQuest?.stageIndex === 1) {
        dialogueSystem.startDialogue('nonna_bussola', 'quest_1_active');
      } else {
        dialogueSystem.startDialogue('nonna_bussola', 'start');
      }
    }
  }
}
