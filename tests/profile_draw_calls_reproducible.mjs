/**
 * Misurazione diagnostica precisa e riproducibile delle draw call per i profili
 * Bassa, Media e Alta (con e senza shadow pass, e spiegazione 93 vs 90).
 */

import { spawn } from 'child_process';

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9231;

async function run() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu-sandbox',
    '--no-sandbox',
    'about:blank'
  ]);

  const cleanup = () => {
    try { chrome.kill(); } catch {}
  };
  process.on('exit', cleanup);

  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }

  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let id = 1;
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const cur = id++;
      const handler = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id === cur) {
          ws.removeEventListener('message', handler);
          resolve(msg);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: cur, method, params }));
    });

  await send('Page.navigate', { url: 'http://localhost:5173/?debug=1' });
  await new Promise((r) => setTimeout(r, 2500));
  await send('Runtime.evaluate', { expression: `document.getElementById('btn-start')?.click()` });
  await new Promise((r) => setTimeout(r, 3500));

  const result = await send('Runtime.evaluate', {
    expression: `(() => {
      const g = window.game;
      if (!g) return { error: 'Game non pronto' };

      const sample = (quality) => {
        g.setQuality(quality);

        // 1. Misura del solo forward pass (scene camera)
        g.renderer.info.autoReset = true;
        g.renderer.render(g.scene, g.camera);
        const forwardPassCalls = g.renderer.info.render.calls;
        const triangles = g.renderer.info.render.triangles;

        // 2. Misura del TOTALE (shadow pass + forward pass) con autoReset disattivato
        g.renderer.info.autoReset = false;
        g.renderer.info.reset();
        g.renderer.render(g.scene, g.camera);
        const totalCalls = g.renderer.info.render.calls;
        const shadowPassCalls = totalCalls - forwardPassCalls;

        let shadowCasters = 0;
        let totalMeshes = 0;
        g.scene.traverse((o) => {
          if (o.isMesh || o.isSkinnedMesh || o.isInstancedMesh) {
            totalMeshes++;
            if (o.castShadow) shadowCasters++;
          }
        });

        return {
          profile: quality,
          forwardPassCalls,
          shadowPassCalls,
          totalCalls,
          triangles,
          shadowCasters,
          totalMeshes,
          shadowMapEnabled: g.renderer.shadowMap.enabled,
          shadowMapType: g.renderer.shadowMap.type
        };
      };

      // Misura anche prima e dopo aver togglato gli outline per spiegare il 93 vs 90
      g.setQuality('high');
      // Forziamo outline attivi su Pip
      let outlinesActiveCalls = 0;
      let outlinesActiveTriangles = 0;
      g.player.meshComponents.root.traverse(o => {
        if (o.name && o.name.toLowerCase().includes('outline')) o.visible = true;
      });
      g.renderer.info.autoReset = true;
      g.renderer.render(g.scene, g.camera);
      outlinesActiveCalls = g.renderer.info.render.calls;
      outlinesActiveTriangles = g.renderer.info.render.triangles;

      g.player.meshComponents.root.traverse(o => {
        if (o.name && o.name.toLowerCase().includes('outline')) o.visible = false;
      });
      g.renderer.info.autoReset = true;
      g.renderer.render(g.scene, g.camera);
      const outlinesDisabledCalls = g.renderer.info.render.calls;
      const outlinesDisabledTriangles = g.renderer.info.render.triangles;

      return {
        measurements: {
          bassa: sample('low'),
          media: sample('medium'),
          alta: sample('high')
        },
        reproducibleExplanation93vs90: {
          outlinesActiveCalls,
          outlinesActiveTriangles,
          outlinesDisabledCalls,
          outlinesDisabledTriangles,
          deltaCalls: outlinesActiveCalls - outlinesDisabledCalls,
          deltaTriangles: outlinesActiveTriangles - outlinesDisabledTriangles
        }
      };
    })()`,
    returnByValue: true
  });

  console.log('RISULTATI_MISURAZIONE_UFFICIOSA:');
  console.log(JSON.stringify(result.result?.result?.value, null, 2));

  cleanup();
  ws.close();
  process.exit(0);
}

run().catch(console.error);
