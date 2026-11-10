/**
 * Entità NPC (Personaggi Non Giocanti) con Nonna Bussola e telescopio procedurale.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.2.0
 */

import * as THREE from 'three';
import { DialogueSystem } from '../systems/DialogueSystem';
import { QuestSystem } from '../systems/QuestSystem';

export class NPC {
  public group: THREE.Group;
  public id: string;
  public name: string;
  public position: THREE.Vector3;
  public interactionRadius = 2.8;

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
   * Costruisce il modello 3D procedurale di Nonna Bussola e il suo telescopio.
   */
  private createNonnaBussolaModel(): void {
    // Materiali toon a gradini
    const coatMat = new THREE.MeshToonMaterial({ color: 0x6b2d5c }); // Borgogna/prugna caldo
    const shawlMat = new THREE.MeshToonMaterial({ color: 0xfefae0 }); // Scialle crema
    const hairMat = new THREE.MeshToonMaterial({ color: 0xd3d3d3 }); // Capelli argento
    const skinMat = new THREE.MeshToonMaterial({ color: 0xfbd1a2 }); // Pelle anziana dolce
    const woodMat = new THREE.MeshToonMaterial({ color: 0x582f0e }); // Bastone legno
    const brassMat = new THREE.MeshToonMaterial({ color: 0xd4a373 }); // Ottone telescopio

    // 1. Gonna e corpo a campana
    const bodyGeom = new THREE.CylinderGeometry(0.28, 0.45, 0.9, 12);
    const body = new THREE.Mesh(bodyGeom, coatMat);
    body.position.y = 0.55;
    body.castShadow = true;
    this.group.add(body);

    // 2. Scialle sulle spalle
    const shawlGeom = new THREE.ConeGeometry(0.48, 0.45, 12);
    const shawl = new THREE.Mesh(shawlGeom, shawlMat);
    shawl.position.y = 0.85;
    shawl.castShadow = true;
    this.group.add(shawl);

    // 3. Testa sferica
    const headGeom = new THREE.SphereGeometry(0.24, 14, 12);
    const head = new THREE.Mesh(headGeom, skinMat);
    head.position.y = 1.25;
    head.castShadow = true;
    this.group.add(head);

    // Occhialini da lettura
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const leftGlass = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.06, 8), glassMat);
    leftGlass.position.set(0.08, 1.27, 0.23);
    this.group.add(leftGlass);

    const rightGlass = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.06, 8), glassMat);
    rightGlass.position.set(-0.08, 1.27, 0.23);
    this.group.add(rightGlass);

    // 4. Chignon argentato
    const bunGeom = new THREE.SphereGeometry(0.14, 10, 10);
    const bun = new THREE.Mesh(bunGeom, hairMat);
    bun.position.set(0, 1.42, -0.12);
    this.group.add(bun);

    // 5. Bastone da passeggio
    const caneGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8);
    const cane = new THREE.Mesh(caneGeom, woodMat);
    cane.position.set(0.35, 0.45, 0.2);
    cane.rotation.z = -0.12;
    cane.castShadow = true;
    this.group.add(cane);

    // 6. Telescopio dell'Osservatorio su treppiede in legno e ottone
    const telescopeGroup = new THREE.Group();
    telescopeGroup.position.set(-0.9, 0, 0.4);

    const tripodLegGeom = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6);
    for (let i = 0; i < 3; i++) {
      const leg = new THREE.Mesh(tripodLegGeom, woodMat);
      const angle = (i * Math.PI * 2) / 3;
      leg.position.set(Math.cos(angle) * 0.3, 0.5, Math.sin(angle) * 0.3);
      leg.rotation.x = Math.sin(angle) * 0.25;
      leg.rotation.z = -Math.cos(angle) * 0.25;
      leg.castShadow = true;
      telescopeGroup.add(leg);
    }

    const tubeGeom = new THREE.CylinderGeometry(0.08, 0.12, 0.8, 10);
    const tube = new THREE.Mesh(tubeGeom, brassMat);
    tube.position.y = 1.15;
    tube.rotation.x = Math.PI / 2.3;
    tube.castShadow = true;
    telescopeGroup.add(tube);

    this.group.add(telescopeGroup);
  }

  /**
   * Avvia il dialogo dinamico in base al progresso delle missioni.
   */
  public interact(dialogueSystem: DialogueSystem, questSystem: QuestSystem): void {
    if (dialogueSystem.getIsActive()) return;

    const questInfo = questSystem.getActiveQuestInfo();
    let targetNode = 'start';

    if (questInfo) {
      if (questInfo.stageIndex === 1) {
        targetNode = 'quest_1_active';
      } else if (questInfo.stageIndex >= 2) {
        targetNode = 'quest_1_completed';
      }
    }

    dialogueSystem.startDialogue(this.id, targetNode);
  }
}
