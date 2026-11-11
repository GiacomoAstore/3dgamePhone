/**
 * Misurazione formale, precisa e riproducibile dei profili grafici di Brumavento.
 * Per ogni profilo (Bassa, Media, Alta) stampa:
 * - profilo
 * - contorni visibili (outline meshes)
 * - shadow casters (mesh con castShadow = true)
 * - draw call forward
 * - draw call shadow pass
 * - draw call totali (forward + shadow)
 * - triangoli renderizzati
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.4.0
 */

import { spawn } from 'child_process';
import path from 'path';

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9232;
const USER_DATA = path.join(process.env.TEMP || 'C:\\Temp', 'chrome_prof_' + Date.now());

async function run() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu-sandbox',
    '--no-sandbox',
    `--user-data-dir=${USER_DATA}`
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
  await new Promise((r) => setTimeout(r, 2000));
  await send('Runtime.evaluate', { expression: `document.getElementById('btn-start')?.click()` });
  // Attesa streaming asset completo (modelli Kenney, instancing, alberi, props)
  await new Promise((r) => setTimeout(r, 4000));

  const result = await send('Runtime.evaluate', {
    expression: `(() => {
      const g = window.game;
      if (!g) return { error: 'Game non pronto' };

      const sample = (quality) => {
        g.setQuality(quality);

        // 1. Misura del solo forward pass
        g.renderer.info.autoReset = true;
        g.renderer.render(g.scene, g.camera);
        const forwardCalls = g.renderer.info.render.calls;
        const triangles = g.renderer.info.render.triangles;

        // 2. Misura del TOTALE (shadow pass + forward pass) con autoReset disattivato
        g.renderer.info.autoReset = false;
        g.renderer.info.reset();
        g.renderer.render(g.scene, g.camera);
        const totalCalls = g.renderer.info.render.calls;
        const shadowCalls = totalCalls - forwardCalls;

        let shadowCasters = 0;
        let visibleOutlines = 0;
        let totalMeshes = 0;

        g.scene.traverse((o) => {
          if (o.isMesh || o.isSkinnedMesh || o.isInstancedMesh) {
            totalMeshes++;
            if (o.castShadow) shadowCasters++;
            if (o.name && o.name.toLowerCase().includes('outline') && o.visible) {
              visibleOutlines++;
            }
          }
        });

        return {
          profilo: quality,
          contorniVisibili: visibleOutlines,
          shadowCasters,
          drawCallsForward: forwardCalls,
          drawCallsShadow: shadowCalls,
          drawCallsTotali: totalCalls,
          triangoli: triangles,
          shadowMapAttiva: g.renderer.shadowMap.enabled
        };
      };

      return {
        bassa: sample('low'),
        media: sample('medium'),
        alta: sample('high')
      };
    })()`,
    returnByValue: true
  });

  const data = result.result?.result?.value;
  console.log('========================================================================================');
  console.log('📊 REPORT MISURAZIONE PROFILI GRAFICI (Chrome DevTools Protocol)');
  console.log('========================================================================================');
  console.table(data);

  console.log('\nJSON completo:');
  console.log(JSON.stringify(data, null, 2));

  cleanup();
  ws.close();
  process.exit(0);
}

run().catch(console.error);
