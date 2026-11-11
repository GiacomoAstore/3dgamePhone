/**
 * Profiling diagnostico delle Draw Call e gerarchia mesh in Chrome WebGL.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9227;
const USER_DATA = path.join(process.env.TEMP || 'C:\\Temp', 'chrome_draw_call_profile_' + Date.now());

async function profile() {
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu-sandbox',
    '--no-sandbox',
    `--user-data-dir=${USER_DATA}`,
    'http://localhost:5173/'
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
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = idCounter++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Runtime.enable');
  await new Promise((r) => setTimeout(r, 2000));

  // Avvia il gioco
  await send('Runtime.evaluate', { expression: `document.getElementById('btn-start')?.click();` });
  await new Promise((r) => setTimeout(r, 3000));

  const profileData = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.game;
        if (!g) return { error: 'No game' };

        const categories = {
          procedural_flowers: 0,
          procedural_bushes: 0,
          procedural_rocks: 0,
          procedural_trees: 0,
          kenney_trees: 0,
          kenney_rocks: 0,
          kenney_props: 0,
          characters: 0,
          dock_and_plaza_structures: 0,
          island_terrain_and_cliff: 0,
          collectibles: 0,
          toon_outlines: 0,
          other: 0
        };

        let totalMeshes = 0;
        let shadowCasters = 0;

        g.scene.traverse((obj) => {
          if (obj.isMesh || obj.isSkinnedMesh) {
            totalMeshes++;
            if (obj.castShadow) shadowCasters++;

            const name = (obj.name || '').toLowerCase();
            const matName = (obj.material?.name || '').toLowerCase();
            const geom = obj.geometry?.type || '';

            // Verifica se è un contorno toon
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

            if (pathStr.includes('procedural_trees')) {
              categories.procedural_trees++;
            } else if (pathStr.includes('tree_oak') || pathStr.includes('tree_detailed')) {
              categories.kenney_trees++;
            } else if (pathStr.includes('rock_largea')) {
              categories.kenney_rocks++;
            } else if (geom === 'DodecahedronGeometry') {
              categories.procedural_rocks++;
            } else if (pathStr.includes('chest') || pathStr.includes('barrel') || pathStr.includes('sign') || pathStr.includes('campfire') || pathStr.includes('boat') || pathStr.includes('flower_purple') || pathStr.includes('mushroom_red')) {
              categories.kenney_props++;
            } else if (pathStr.includes('player') || pathStr.includes('pip') || pathStr.includes('npc') || pathStr.includes('nonna') || pathStr.includes('fox') || obj.isSkinnedMesh) {
              categories.characters++;
            } else if (pathStr.includes('dock') || pathStr.includes('plaza') || pathStr.includes('observatory') || pathStr.includes('stonecircle') || pathStr.includes('monolith')) {
              categories.dock_and_plaza_structures++;
            } else if (name === 'terrain_top' || name === 'terrain_cliff' || name.includes('seabed') || pathStr.includes('sea')) {
              categories.island_terrain_and_cliff++;
            } else if (pathStr.includes('collectible') || name.includes('fragment') || name.includes('pedestal')) {
              categories.collectibles++;
            } else if (geom === 'CylinderGeometry' && obj.scale.y < 0.2) {
              // Petalo di fiore procedurale
              categories.procedural_flowers++;
            } else if (geom === 'SphereGeometry' && obj.geometry.parameters?.radius < 0.05) {
              // Centro fiore
              categories.procedural_flowers++;
            } else if (geom === 'SphereGeometry' && obj.geometry.parameters?.radius > 0.06 && obj.geometry.parameters?.radius < 0.08) {
              // Bacca cespuglio
              categories.procedural_bushes++;
            } else if (geom === 'SphereGeometry' && obj.geometry.parameters?.radius > 0.6 && obj.geometry.parameters?.radius < 0.7) {
              // Corpo cespuglio
              categories.procedural_bushes++;
            } else {
              categories.other++;
            }
          }
        });

        return {
          renderCalls: g.renderer.info.render.calls,
          triangles: g.renderer.info.render.triangles,
          totalMeshes,
          shadowCasters,
          categories
        };
      })()
    `,
    returnByValue: true
  });

  console.log('RISULTATO PROFILING DRAW CALL ACCURATO:');
  console.log(JSON.stringify(profileData.result?.result?.value, null, 2));

  cleanup();
  ws.close();
}

profile().catch(console.error);
