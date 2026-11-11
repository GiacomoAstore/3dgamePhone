/**
 * Profiling diagnostico delle Draw Call e gerarchia mesh in Chrome WebGL.
 * Confronta profilo Alta vs profilo Bassa.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9228;
const USER_DATA = path.join(process.env.TEMP || 'C:\\Temp', 'chrome_draw_call_profile_' + Date.now());

async function profile() {
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu-sandbox',
    '--no-sandbox',
    '--window-size=1280,720',
    `--user-data-dir=${USER_DATA}`,
    'about:blank'
  ]);

  const cleanup = () => {
    try { chromeProc.kill(); } catch {}
    try { fs.rmSync(USER_DATA, { recursive: true, force: true }); } catch {}
  };

  process.on('exit', cleanup);

  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }

  const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
  const targets = await listRes.json();
  const page = targets.find((t) => t.type === 'page') || targets[0];

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.onopen = r);

  let idCounter = 1;
  const pending = new Map();
  const consoleLogs = [];
  const errors = [];
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args.map((a) => a.value || a.description || '').join(' ');
      consoleLogs.push(`[${msg.params.type}] ${text}`);
      console.log(`[BROWSER CONSOLE ${msg.params.type}] ${text}`);
      if (msg.params.type === 'error') errors.push(text);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const desc = msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text;
      errors.push(desc);
      console.log(`[BROWSER EXCEPTION] ${desc}`);
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
  await new Promise((r) => setTimeout(r, 2000));

  const loc = await send('Runtime.evaluate', { expression: 'document.location.href' });
  console.log('Location:', loc.result?.result?.value);

  // Attende che window.game sia pronto
  for (let i = 0; i < 30; i++) {
    const check = await send('Runtime.evaluate', { expression: '!!window.game' });
    if (check.result?.result?.value) {
      console.log('window.game pronto al tentativo', i);
      break;
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  // Avvia il gioco
  await send('Runtime.evaluate', { expression: `document.getElementById('btn-start')?.click();` });
  await new Promise((r) => setTimeout(r, 3500));

  // Funzione di campionamento
  async function sampleProfile(profileName) {
    const res = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const g = window.game;
          if (!g) return { error: 'No game' };

          const categories = {
            instanced_foliage_and_flowers: 0,
            procedural_trees: 0,
            kenney_trees: 0,
            procedural_rocks: 0,
            kenney_props: 0,
            characters: 0,
            dock_and_plaza_structures: 0,
            island_terrain_and_cliff: 0,
            collectibles: 0,
            toon_outlines: 0,
            other: 0
          };

          let totalMeshes = 0;
          let instancedCount = 0;
          let shadowCasters = 0;

          g.scene.traverse((obj) => {
            if (obj.isMesh || obj.isSkinnedMesh || obj.isInstancedMesh) {
              totalMeshes++;
              if (obj.isInstancedMesh) instancedCount++;
              if (obj.castShadow) shadowCasters++;

              const name = (obj.name || '').toLowerCase();
              const matName = (obj.material?.name || '').toLowerCase();
              const geom = obj.geometry?.type || '';

              if (name.includes('outline') || matName.includes('outline') || (obj.material && obj.material.side === 1 && obj.material.isMeshBasicMaterial)) {
                categories.toon_outlines++;
                return;
              }

              let ancestor = obj;
              let path = [];
              while (ancestor) {
                if (ancestor.name) path.push(ancestor.name.toLowerCase());
                ancestor = ancestor.parent;
              }
              const pathStr = path.join('/');

              if (name.includes('instanced') || pathStr.includes('instanced')) {
                categories.instanced_foliage_and_flowers++;
              } else if (pathStr.includes('procedural_trees')) {
                categories.procedural_trees++;
              } else if (pathStr.includes('tree_oak') || pathStr.includes('tree_detailed')) {
                categories.kenney_trees++;
              } else if (geom === 'DodecahedronGeometry') {
                categories.procedural_rocks++;
              } else if (pathStr.includes('chest') || pathStr.includes('barrel') || pathStr.includes('sign') || pathStr.includes('campfire') || pathStr.includes('boat')) {
                categories.kenney_props++;
              } else if (pathStr.includes('player') || pathStr.includes('pip') || pathStr.includes('npc') || pathStr.includes('nonna') || pathStr.includes('fox') || obj.isSkinnedMesh) {
                categories.characters++;
              } else if (pathStr.includes('dock') || pathStr.includes('plaza') || pathStr.includes('observatory') || pathStr.includes('stonecircle') || pathStr.includes('monolith')) {
                categories.dock_and_plaza_structures++;
              } else if (name === 'terrain_top' || name === 'terrain_cliff' || name.includes('seabed') || pathStr.includes('sea')) {
                categories.island_terrain_and_cliff++;
              } else if (pathStr.includes('collectible') || name.includes('fragment') || name.includes('pedestal')) {
                categories.collectibles++;
              } else {
                categories.other++;
              }
            }
          });

          return {
            profile: '${profileName}',
            shadowMapEnabled: g.renderer.shadowMap.enabled,
            renderCalls: g.renderer.info.render.calls,
            triangles: g.renderer.info.render.triangles,
            totalMeshes,
            instancedCount,
            shadowCasters,
            categories
          };
        })()
      `,
      returnByValue: true
    });
    return res.result?.result?.value;
  }

  // 1. Misura su profilo Alta (Default)
  const highData = await sampleProfile('Alta');

  // 2. Passa a profilo Bassa
  await send('Runtime.evaluate', { expression: `window.game.setQuality('low');` });
  await new Promise((r) => setTimeout(r, 600));

  // 3. Misura su profilo Bassa
  const lowData = await sampleProfile('Bassa');

  console.log('RISULTATO PROFILING DRAW CALL (ALTA):');
  console.log(JSON.stringify(highData, null, 2));

  console.log('\nRISULTATO PROFILING DRAW CALL (BASSA):');
  console.log(JSON.stringify(lowData, null, 2));

  const callsDetail = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        g.setQuality('high');
        g.renderer.info.reset();
        g.renderer.render(g.scene, g.camera);
        const callsHigh = g.renderer.info.render.calls;

        g.setQuality('low');
        g.renderer.info.reset();
        g.renderer.render(g.scene, g.camera);
        const callsLow = g.renderer.info.render.calls;

        return { callsHigh, callsLow };
      })()
    `,
    returnByValue: true
  });
  console.log('CHIAMATE PRECISE INFO.RESET():', callsDetail.result?.result?.value);

  if (errors.length > 0) {
    console.log('\nERRORI CONSOLE:', errors);
  }

  cleanup();
  ws.close();
}

profile().catch(console.error);
