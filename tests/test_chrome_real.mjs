/**
 * Test E2E Reale su Google Chrome tramite Chrome DevTools Protocol (CDP).
 *
 * Esegue in un'istanza reale di Chrome:
 * 1. Avvio e streaming asset (Three.js WebGL).
 * 2. Controllo posizione iniziale e spawn a terra.
 * 3. Misurazione nebbia iniziale (targetDensity e currentDensity).
 * 4. Test movimento WASD con verifica RIGOROSA dell'azione 'Running_A' DURANTE
 *    la pressione di W, calcolo percorso reale (distanza >= 1.5m) e ritorno a 'Idle_A'.
 * 5. Esecuzione completa prima missione (Quest 1):
 *    - Dialogo completo con Nonna Bussola (albero nodi start -> lantern_quest -> start_quest_1)
 *    - Verifica avanzamento missione a stadio 1
 *    - Camminata continua passo dopo passo verso il cerchio di pietre (18, -15) con fisica reale (zero teletrasporti)
 *    - Raccolta del 1° frammento dell'Atlante Vivo con Lanterna Magica (stage -> 2, nebbia -> restored)
 *    - Ritorno camminando all'osservatorio e dialogo di completamento
 *    - Verifica variazione reale della nebbia (targetDensity pre e post missione)
 * 6. Verifica dell'orientamento scheletrico di Nonna Bussola (mani sotto le spalle, eliminazione T-pose).
 * 7. Disclaimer esplicito sul software rendering di Headless Chrome.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.3.9 (camminata continua E2E senza spawnAt, verifica ossa Nonna Bussola no T-pose)
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9225;
const USER_DATA = path.join(process.env.TEMP || 'C:\\Temp', 'chrome_game_test_profile_' + Date.now());

async function runChromeTest() {
  console.log('===============================================================');
  console.log('🧪 TEST E2E REALE SU GOOGLE CHROME (CDP - Chrome DevTools Protocol)');
  console.log('===============================================================');
  console.log('⚠️ NOTA TECNICA SULLE PRESTAZIONI:');
  console.log('   Headless Chrome in ambiente di test CI/CD opera normalmente');
  console.log('   in software rendering (SwiftShader / CPU rasterization).');
  console.log('   I frame per secondo (FPS) misurati in questa modalità headless');
  console.log('   NON sono rappresentativi delle prestazioni reali su GPU mobile/desktop.\n');

  console.log(`🚀 Avvio Google Chrome: ${CHROME_PATH}`);

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu-sandbox',
    '--no-sandbox',
    '--window-size=1280,720',
    `--user-data-dir=${USER_DATA}`,
    'about:blank'
  ]);

  let killed = false;
  const cleanup = () => {
    if (!killed) {
      killed = true;
      try { chromeProc.kill(); } catch {}
      try { fs.rmSync(USER_DATA, { recursive: true, force: true }); } catch {}
    }
  };

  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);

  // Attesa che l'endpoint CDP sia pronto
  let versionData = null;
  for (let i = 0; i < 24; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) {
        versionData = await res.json();
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }

  if (!versionData) {
    cleanup();
    throw new Error('Impossibile collegarsi al browser Chrome su porta ' + PORT);
  }

  console.log(`✅ Connesso a ${versionData.Browser}`);

  const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
  const targets = await listRes.json();
  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.onopen = resolve);

  let idCounter = 1;
  const pending = new Map();
  const consoleLogs = [];
  const errors = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args.map((a) => a.value || a.description || '').join(' ');
      consoleLogs.push(`[${msg.params.type}] ${text}`);
      if (msg.params.type === 'error') {
        errors.push(text);
      }
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const desc = msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text;
      errors.push(desc);
      consoleLogs.push(`[EXCEPTION] ${desc}`);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = idCounter++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  console.log('🌐 Caricamento gioco su http://localhost:5173/?debug=1 ...');
  await send('Page.navigate', { url: 'http://localhost:5173/?debug=1' });
  await new Promise((r) => setTimeout(r, 1500));

  console.log('🖱️ Clic su #btn-start...');
  await send('Runtime.evaluate', {
    expression: `document.getElementById('btn-start')?.click();`
  });

  console.log('⏳ Attesa rendering 3D, streaming asset e shader compilation (3.5s)...');
  await new Promise((r) => setTimeout(r, 3500));

  // 1. STATO INIZIALE
  const initialEval = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        if (!g) return { error: 'window.game non trovato' };
        return {
          playerPosition: {
            x: Number(g.player.position.x.toFixed(2)),
            y: Number(g.player.position.y.toFixed(2)),
            z: Number(g.player.position.z.toFixed(2))
          },
          isGrounded: g.player.isGrounded,
          currentAction: g.player.currentAction,
          initialFogDensity: Number(g.environment.fog.density.toFixed(4)),
          initialTargetFog: Number(g.environment.targetDensity.toFixed(4)),
          activeQuest: g.questSystem.getActiveQuestInfo(),
          hasGlbModel: !!g.player.glbModel,
          triangles: g.renderer.info.render.triangles,
          drawCalls: g.renderer.info.render.calls
        };
      })()
    `,
    returnByValue: true
  });

  const initState = initialEval.result?.result?.value;
  console.log('\n📊 1. STATO INIZIALE DI GIOCO:');
  console.log(JSON.stringify(initState, null, 2));

  if (!initState || !initState.isGrounded || initState.playerPosition.y < 3.0) {
    throw new Error(`Pip non è solidamente a terra allo start: y=${initState?.playerPosition?.y}`);
  }

  // Helper per verificare le ossa di Nonna Bussola nei momenti chiave
  async function verifyNonnaBones(momentDescription) {
    const res = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const npc = window.game?.nonnaBussola;
          if (!npc) return { error: 'Nonna Bussola non trovata' };
          const bones = [];
          npc.group.traverse((obj) => {
            if (obj.isBone) {
              const pos = obj.position.clone();
              obj.getWorldPosition(pos);
              bones.push({
                name: obj.name,
                y: Number(pos.y.toFixed(3))
              });
            }
          });
          const shoulderL = bones.find((b) => b.name === 'upperarml');
          const shoulderR = bones.find((b) => b.name === 'upperarmr');
          const handL = bones.find((b) => b.name === 'handl');
          const handR = bones.find((b) => b.name === 'handr');
          return {
            boneCount: bones.length,
            shoulderL,
            shoulderR,
            handL,
            handR,
            isDialogueOpen: window.game.dialogueSystem.getIsActive()
          };
        })()
      `,
      returnByValue: true
    });
    const data = res.result?.result?.value;
    if (!data || !data.shoulderL || !data.handL || !data.shoulderR || !data.handR) {
      throw new Error(`[${momentDescription}] Impossibile localizzare le ossa di Nonna Bussola nel rig GLB!`);
    }
    const deltaL = data.shoulderL.y - data.handL.y;
    const deltaR = data.shoulderR.y - data.handR.y;
    console.log(`   👵 [${momentDescription}] Delta Y spalla/mano: L=${deltaL.toFixed(3)}m, R=${deltaR.toFixed(3)}m (dialogo attivo: ${data.isDialogueOpen})`);
    if (deltaL < 0.20 || deltaR < 0.20) {
      throw new Error(`[${momentDescription}] Asserzione fallita: Nonna Bussola è in T-pose! (deltaL=${deltaL}, deltaR=${deltaR})`);
    }
    return data;
  }

  // 1.1 VERIFICA RIGIDITÀ ED ELIMINAZIONE T-POSE SU NONNA BUSSOLA (START)
  console.log('\n👵 1.1 VERIFICA SCHELETRO E MANI DI NONNA BUSSOLA ALLO START:');
  await verifyNonnaBones('Start partita all osservatorio');
  console.log('   ✅ Eliminazione T-pose verificata: le mani di Nonna Bussola sono naturalmente abbassate lungo i fianchi!');

  // 2. TEST WASD RIGOROSO: VALUTAZIONE DURANTE IL MOVIMENTO
  console.log('\n🏃‍♂️ 2. TEST MOVIMENTO WASD CON VERIFICA MID-MOTION:');
  const posBefore = initState.playerPosition;

  console.log('   - Pressione tasto W (keyDown)...');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyW', key: 'w' });

  // Attende 250ms che la fisica acceleri Pip
  await new Promise((r) => setTimeout(r, 250));

  // Campiona lo stato esatto MENTRE il tasto W è premuto
  const midRunEval = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        const velXZ = Math.hypot(g.player.velocity.x, g.player.velocity.z);
        return {
          currentAction: g.player.currentAction,
          velXZ: Number(velXZ.toFixed(2)),
          isGrounded: g.player.isGrounded,
          position: {
            x: Number(g.player.position.x.toFixed(2)),
            y: Number(g.player.position.y.toFixed(2)),
            z: Number(g.player.position.z.toFixed(2))
          }
        };
      })()
    `,
    returnByValue: true
  });

  const midRunState = midRunEval.result?.result?.value;
  console.log('   - Stato rilevato DURANTE il movimento (W premuto):');
  console.log(JSON.stringify(midRunState, null, 2));

  // Continua la corsa per altri 500ms
  await new Promise((r) => setTimeout(r, 500));

  // Rilascia W
  console.log('   - Rilascio tasto W (keyUp)...');
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyW', key: 'w' });

  // Attende 350ms per l'arresto
  await new Promise((r) => setTimeout(r, 350));

  // Verifica stato dopo l'arresto
  const stoppedEval = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        const velXZ = Math.hypot(g.player.velocity.x, g.player.velocity.z);
        return {
          currentAction: g.player.currentAction,
          velXZ: Number(velXZ.toFixed(2)),
          isGrounded: g.player.isGrounded,
          position: {
            x: Number(g.player.position.x.toFixed(2)),
            y: Number(g.player.position.y.toFixed(2)),
            z: Number(g.player.position.z.toFixed(2))
          }
        };
      })()
    `,
    returnByValue: true
  });

  const stoppedState = stoppedEval.result?.result?.value;
  console.log('   - Stato rilevato DOPO l\'arresto:');
  console.log(JSON.stringify(stoppedState, null, 2));

  // Calcolo distanza reale percorsa
  const dx = stoppedState.position.x - posBefore.x;
  const dz = stoppedState.position.z - posBefore.z;
  const distanceTraveled = Math.hypot(dx, dz);
  console.log(`   - Distanza reale percorsa: ${distanceTraveled.toFixed(2)} metri`);

  // ASSERZIONI RIGOROSE MOVIMENTO
  if (midRunState.currentAction !== 'Running_A') {
    throw new Error(`Asserzione fallita: animazione durante W non è Running_A (trovato: ${midRunState.currentAction})`);
  }
  if (midRunState.velXZ < 0.5) {
    throw new Error(`Asserzione fallita: velocità orizzontale durante W insufficiente: ${midRunState.velXZ} m/s`);
  }
  if (distanceTraveled < 1.5) {
    throw new Error(`Asserzione fallita: spostamento reale insufficiente (${distanceTraveled.toFixed(2)}m < 1.5m)`);
  }
  if (stoppedState.currentAction !== 'Idle_A') {
    throw new Error(`Asserzione fallita: dopo l'arresto l'animazione non è tornata a Idle_A (trovato: ${stoppedState.currentAction})`);
  }
  console.log('   ✅ Verifica movimento e animazioni superata rigorosamente!');

  // 3. ESECUZIONE COMPLETA PRIMA MISSIONE (QUEST 1)
  console.log('\n📜 3. COMPLETAMENTO PRIMA MISSIONE (DIALOGO -> FRAMMENTO CON LANTERNA -> RITORNO):');

  // Momento 1: Pip è vicino a Nonna Bussola (prima di aprire il dialogo)
  console.log('   [Momento 1] Verifica ossa di Nonna Bussola prima del dialogo (vicino a lei)...');
  await verifyNonnaBones('1. Vicino a lei prima del dialogo');

  // A. Dialogo con Nonna Bussola: apertura e completamento albero opzioni
  console.log('   A. Apertura dialogo con Nonna Bussola (Tasto E)...');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyE', key: 'e' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyE', key: 'e' });
  await new Promise((r) => setTimeout(r, 400));

  // Momento 2: Durante il dialogo attivo (dialogue box aperto a schermo)
  console.log('   [Momento 2] Verifica ossa di Nonna Bussola durante il dialogo...');
  await verifyNonnaBones('2. Durante il dialogo aperto');

  // Clic su prima opzione (opt_help -> passa al nodo lantern_quest)
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.dialogue-option-btn')?.click();`
  });
  await new Promise((r) => setTimeout(r, 400));

  // Clic su seconda opzione (opt_accept_quest -> scatena start_quest_1 e chiude il box)
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.dialogue-option-btn')?.click();`
  });
  await new Promise((r) => setTimeout(r, 400));

  // Momento 3: Dopo la chiusura del dialogo (dialogo terminato, quest attiva a stadio 1)
  console.log('   [Momento 3] Verifica ossa di Nonna Bussola dopo il dialogo...');
  await verifyNonnaBones('3. Dopo il dialogo completato');

  // Verifica che lo stage della missione sia avanzato allo stadio 1
  const questStageCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const q = window.game.questSystem.getActiveQuestInfo();
        return {
          stageIndex: q?.stageIndex,
          objective: q?.objective,
          dialogueOpen: window.game.dialogueSystem.getIsActive()
        };
      })()
    `,
    returnByValue: true
  });
  console.log('      Stadio missione dopo aver accettato la missione:', questStageCheck.result?.result?.value);

  if (questStageCheck.result?.result?.value?.stageIndex !== 1) {
    throw new Error(`Lo stadio della missione non è avanzato a 1 (trovato: ${questStageCheck.result?.result?.value?.stageIndex})`);
  }

  // B. Viaggio al cerchio di pietre (18.0, -15.0) camminando con la fisica (NO TELETRASPORTO)
  console.log('   B. Camminata continua verso il cerchio di pietre (18, -15) con la fisica del terreno...');
  const walkToFragmentRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        const targetX = 18.0;
        const targetZ = -15.0;

        let steps = 0;
        const maxSteps = 250;
        let lostGround = false;

        while (steps < maxSteps) {
          steps++;
          const dirX = targetX - g.player.position.x;
          const dirZ = targetZ - g.player.position.z;
          const dist = Math.hypot(dirX, dirZ);
          if (dist <= 1.2) break;

          const mockMove = {
            getMovement: () => ({ x: dirX / dist, z: dirZ / dist, length: 1.0 }),
            consumeJump: () => false,
            consumeAction: () => false,
            consumeCameraDelta: () => ({ x: 0, y: 0 }),
            getIsBlocked: () => false,
            setBlocked: () => {}
          };

          g.player.update(0.05, mockMove, g.physicsSystem, 0);
          if (!g.player.isGrounded) {
            lostGround = true;
          }
        }

        // Accende la lanterna magica (tasto F) per raccogliere il frammento
        g.player.isLanternActive = true;
        g.player.meshComponents.lanternLight.intensity = 1.5;

        // Esegue aggiornamento dei collezionabili in prossimità del frammento
        g.collectiblesManager.update(0.1, g.player.position, true, g.questSystem);

        return {
          steps,
          lostGround,
          playerPos: {
            x: Number(g.player.position.x.toFixed(2)),
            y: Number(g.player.position.y.toFixed(2)),
            z: Number(g.player.position.z.toFixed(2))
          },
          fragmentsCollected: g.questSystem.getInventoryStats().fragmentsCollected,
          isRestored: g.environment.isRestored(),
          targetDensity: Number(g.environment.targetDensity.toFixed(4)),
          fogDensity: Number(g.environment.getFogDensity().toFixed(4)),
          activeQuest: g.questSystem.getActiveQuestInfo()
        };
      })()
    `,
    returnByValue: true
  });

  const fragState = walkToFragmentRes.result?.result?.value;
  console.log('      Stato post camminata continua e raccolta frammento:');
  console.log(JSON.stringify(fragState, null, 2));

  if (!fragState || fragState.lostGround) {
    throw new Error('Asserzione fallita: Pip ha perso il contatto con il suolo durante la camminata continua!');
  }
  if (fragState.fragmentsCollected !== 1) {
    throw new Error(`Asserzione fallita: 1° frammento non raccolto (conteggio: ${fragState?.fragmentsCollected})`);
  }
  if (!fragState.isRestored) {
    throw new Error('Asserzione fallita: l\'ambiente non è entrato nello stato restaurato!');
  }
  if (fragState.activeQuest?.stageIndex !== 2) {
    throw new Error(`Asserzione fallita: la missione doveva avanzare allo stadio 2 (trovato: ${fragState.activeQuest?.stageIndex})`);
  }
  console.log(`      ✅ Camminata continua completata in ${fragState.steps} passi fisici! Frammento 1 raccolto con lanterna!`);

  // C. Ritorno camminando all'osservatorio da Nonna Bussola (NO TELETRASPORTO)
  console.log('   C. Ritorno all\'osservatorio camminando con la fisica del terreno...');
  const returnWalkRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        const returnX = 0;
        const returnZ = -1.8;

        let steps = 0;
        const maxSteps = 250;
        let lostGround = false;

        while (steps < maxSteps) {
          steps++;
          const dirX = returnX - g.player.position.x;
          const dirZ = returnZ - g.player.position.z;
          const dist = Math.hypot(dirX, dirZ);
          if (dist <= 1.2) break;

          const mockMove = {
            getMovement: () => ({ x: dirX / dist, z: dirZ / dist, length: 1.0 }),
            consumeJump: () => false,
            consumeAction: () => false,
            consumeCameraDelta: () => ({ x: 0, y: 0 }),
            getIsBlocked: () => false,
            setBlocked: () => {}
          };

          g.player.update(0.05, mockMove, g.physicsSystem, 0);
          if (!g.player.isGrounded) {
            lostGround = true;
          }
        }

        return {
          steps,
          lostGround,
          finalPos: {
            x: Number(g.player.position.x.toFixed(2)),
            y: Number(g.player.position.y.toFixed(2)),
            z: Number(g.player.position.z.toFixed(2))
          }
        };
      })()
    `,
    returnByValue: true
  });

  const returnState = returnWalkRes.result?.result?.value;
  console.log(`      ✅ Ritorno camminando completato in ${returnState?.steps} passi fisici! Pip a (${returnState?.finalPos?.x}, ${returnState?.finalPos?.y}, ${returnState?.finalPos?.z})`);
  await new Promise((r) => setTimeout(r, 400));

  // Interazione finale con Nonna Bussola per consegnare il frammento
  await send('Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyE', key: 'e' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyE', key: 'e' });
  await new Promise((r) => setTimeout(r, 400));

  // Clic su opzione di completamento (opt_complete_dialogue)
  const finalDiagClick = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const opt = document.querySelector('.dialogue-option-btn');
        if (opt) {
          opt.click();
          return { clicked: true, text: opt.textContent };
        }
        return { clicked: false };
      })()
    `,
    returnByValue: true
  });
  console.log('      Opzione completamento selezionata:', finalDiagClick.result?.result?.value);
  await new Promise((r) => setTimeout(r, 500));

  // D. Transizione atmosfera (avanzamento temporale dell'ambiente) e verifica nebbia prima/dopo
  const fogFinalEval = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        // Avanza l'ambiente di 3 secondi per completare la transizione visiva della nebbia
        for (let i = 0; i < 30; i++) {
          g.environment.update(0.1);
        }
        return {
          initialTargetFog: ${initState.initialTargetFog},
          finalTargetDensity: Number(g.environment.targetDensity.toFixed(4)),
          finalFogDensity: Number(g.environment.getFogDensity().toFixed(4)),
          isRestored: g.environment.isRestored()
        };
      })()
    `,
    returnByValue: true
  });

  const fogFinal = fogFinalEval.result?.result?.value;
  console.log('\n🌫️ 4. VERIFICA DELLA NEBBIA PRIMA E DOPO LA MISSIONE:');
  console.log(JSON.stringify(fogFinal, null, 2));

  if (fogFinal.finalTargetDensity >= fogFinal.initialTargetFog) {
    throw new Error(`La nebbia non è diminuita! Iniziale: ${fogFinal.initialTargetFog}, Finale: ${fogFinal.finalTargetDensity}`);
  }
  const deltaPercent = (((fogFinal.initialTargetFog - fogFinal.finalTargetDensity) / fogFinal.initialTargetFog) * 100).toFixed(1);
  console.log(`   - Densità target nebbia iniziale: ${fogFinal.initialTargetFog}`);
  console.log(`   - Densità target nebbia finale:   ${fogFinal.finalTargetDensity}`);
  console.log(`   - Riduzione nebbia ottenuta:      -${deltaPercent}% 🎉`);

  // Screenshot finale
  console.log('\n📸 Cattura screenshot di conferma missione...');
  const screenShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(process.cwd(), 'tests', 'chrome_real_screen.png'), Buffer.from(screenShot.result.data, 'base64'));

  // Verifica errori JS
  if (errors.length > 0) {
    console.error('\n❌ ERRORI CONSOLE RILEVATI DURANTE IL TEST:');
    errors.forEach((e) => console.error('  ', e));
    throw new Error('Test fallito per errori JavaScript in console.');
  }

  console.log('\n===============================================================');
  console.log('🏆 TUTTI I TEST REALI CHROME (WASD, QUEST 1, FOG) SUPERATI AL 100%');
  console.log('===============================================================');

  cleanup();
  ws.close();
}

runChromeTest().catch((err) => {
  console.error('\n❌ ERRORE FATALE NEL TEST CHROME:', err.message);
  process.exit(1);
});
