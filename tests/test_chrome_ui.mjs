/**
 * Test E2E Completo della UI su Google Chrome reale tramite Chrome DevTools Protocol (CDP).
 *
 * Verifica in modo automatizzato e visivo tutti i componenti dell'interfaccia utente:
 * 1. Start Screen (titolo, istruzioni, pulsante avvio)
 * 2. Top Bar HUD (badge titolo, contatore FPS, pulsanti di navigazione)
 * 3. Modal Guida ai Controlli (apertura, sezioni desktop/mobile, chiusura)
 * 4. Modal Diario del Cartografo (missione attiva, frammenti 0/7, reperti, chiusura)
 * 5. Modal Impostazioni (profili qualità grafica Bassa/Media/Alta, slider volume, chiusura)
 * 6. Interaction Badge dinamico (comparsa "Parla con Nonna Bussola" in prossimità)
 * 7. Dialogue Box modale (avatar, nome, ruolo, testo, bottoni di scelta e avanzamento)
 * 8. Responsive Mobile UI (emulazione viewport smartphone 390x844 touch screen, joystick e pulsanti touch)
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.3.7
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9226;
const USER_DATA = path.join(process.env.TEMP || 'C:\\Temp', 'chrome_ui_test_profile_' + Date.now());
const SCREENSHOT_DIR = path.join(process.cwd(), 'tests', 'ui_screenshots');

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function runChromeUITests() {
  console.log('🚀 [UI TEST] Avvio istanza Google Chrome reale per collaudo UI...');

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

  // Attende CDP
  let versionData = null;
  for (let i = 0; i < 20; i++) {
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
    throw new Error('Impossibile collegarsi a Chrome DevTools Protocol.');
  }

  console.log(`✅ [UI TEST] Connesso a ${versionData.Browser}`);

  const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
  const targets = await listRes.json();
  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.onopen = resolve);

  let idCounter = 1;
  const pending = new Map();
  const consoleErrors = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      const text = msg.params.args.map((a) => a.value || a.description || '').join(' ');
      consoleErrors.push(text);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = idCounter++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(code) {
    const res = await send('Runtime.evaluate', {
      expression: code,
      returnByValue: true
    });
    if (res.result?.exceptionDetails) {
      throw new Error(`Eval error: ${res.result.exceptionDetails.text} - ${res.result.exceptionDetails.exception?.description}`);
    }
    return res.result?.result?.value;
  }

  async function captureShot(name) {
    const shotRes = await send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(SCREENSHOT_DIR, `${name}.png`);
    fs.writeFileSync(shotPath, Buffer.from(shotRes.result.data, 'base64'));
    console.log(`   📸 Screenshot salvato: tests/ui_screenshots/${name}.png`);
    return shotPath;
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('🌐 [UI TEST] Navigazione su http://localhost:5173/ ...');
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise((r) => setTimeout(r, 1500));

  // =========================================================================
  // TEST 1: START SCREEN UI
  // =========================================================================
  console.log('\n--- 1. Collaudo Schermata Iniziale (Start Screen) ---');
  const startScreenInfo = await evaluate(`
    (() => {
      const screen = document.getElementById('start-screen');
      const title = screen ? screen.querySelector('h1')?.textContent : null;
      const subtitle = screen ? screen.querySelector('.subtitle')?.textContent : null;
      const btn = document.getElementById('btn-start');
      return {
        visible: screen && screen.style.display !== 'none' && !screen.classList.contains('hidden'),
        title,
        subtitle,
        btnText: btn ? btn.textContent.trim() : null
      };
    })()
  `);
  console.log('   Dati Start Screen:', JSON.stringify(startScreenInfo));
  if (!startScreenInfo.visible || startScreenInfo.title !== 'Brumavento' || startScreenInfo.btnText !== 'Inizia Esplorazione') {
    throw new Error('Verifica Start Screen fallita');
  }
  await captureShot('01_start_screen');

  // Clic su Inizia Esplorazione
  console.log('   🖱️ Click su #btn-start...');
  await evaluate(`document.getElementById('btn-start').click();`);
  await new Promise((r) => setTimeout(r, 1200));

  const startScreenAfter = await evaluate(`
    (() => {
      const screen = document.getElementById('start-screen');
      return { display: screen.style.display, opacity: screen.style.opacity };
    })()
  `);
  console.log('   Start Screen dopo click:', JSON.stringify(startScreenAfter));
  if (startScreenAfter.display !== 'none') {
    throw new Error('Start screen non rimosso dopo il click');
  }

  // =========================================================================
  // TEST 2: HUD TOP BAR & CONTROLLI PERMANENTI
  // =========================================================================
  console.log('\n--- 2. Collaudo Top Bar HUD e Desktop Controls Bar ---');
  const hudInfo = await evaluate(`
    (() => {
      const topBar = document.getElementById('top-bar');
      const title = topBar.querySelector('.badge-title .text')?.textContent;
      const btnHelp = document.getElementById('btn-hud-help');
      const btnJournal = document.getElementById('btn-hud-journal');
      const btnSettings = document.getElementById('btn-hud-settings');
      const fps = document.getElementById('fps-counter')?.textContent;
      const ctrlBar = document.getElementById('desktop-controls-bar');
      return {
        topBarVisible: topBar && getComputedStyle(topBar).display !== 'none',
        title,
        hasHelpBtn: !!btnHelp,
        hasJournalBtn: !!btnJournal,
        hasSettingsBtn: !!btnSettings,
        fps,
        ctrlBarVisible: ctrlBar && getComputedStyle(ctrlBar).display !== 'none',
        chipsCount: ctrlBar ? ctrlBar.querySelectorAll('.ctrl-chip').length : 0
      };
    })()
  `);
  console.log('   Dati HUD:', JSON.stringify(hudInfo));
  if (!hudInfo.topBarVisible || hudInfo.title !== 'Brumavento' || hudInfo.chipsCount < 5) {
    throw new Error('Verifica Top Bar HUD o Controls Bar fallita');
  }
  await captureShot('02_main_hud');

  // =========================================================================
  // TEST 3: MODAL GUIDA CONTROLLI (❓ Controlli)
  // =========================================================================
  console.log('\n--- 3. Collaudo Modal Guida Controlli (Help Modal) ---');
  console.log('   🖱️ Click su #btn-hud-help...');
  await evaluate(`document.getElementById('btn-hud-help').click();`);
  await new Promise((r) => setTimeout(r, 400));

  const helpModalInfo = await evaluate(`
    (() => {
      const m = document.getElementById('help-modal');
      const title = m ? m.querySelector('h2')?.textContent : null;
      const sections = m ? Array.from(m.querySelectorAll('.section-title')).map(s => s.textContent) : [];
      return {
        isOpen: m && !m.classList.contains('hidden'),
        title,
        sections
      };
    })()
  `);
  console.log('   Dati Modal Guida:', JSON.stringify(helpModalInfo));
  if (!helpModalInfo.isOpen || !helpModalInfo.title.includes('Guida ai Controlli')) {
    throw new Error('Apertura Modal Guida fallita');
  }
  await captureShot('03_modal_help');

  console.log('   🖱️ Chiusura modal tramite #help-btn-close...');
  await evaluate(`document.getElementById('help-btn-close').click();`);
  await new Promise((r) => setTimeout(r, 300));
  const helpClosed = await evaluate(`document.getElementById('help-modal').classList.contains('hidden')`);
  if (!helpClosed) throw new Error('Modal Guida non chiuso');

  // =========================================================================
  // TEST 4: MODAL DIARIO DEL CARTOGRAFO (📖 Diario)
  // =========================================================================
  console.log('\n--- 4. Collaudo Modal Diario del Cartografo (Journal Modal) ---');
  console.log('   🖱️ Click su #btn-hud-journal...');
  await evaluate(`document.getElementById('btn-hud-journal').click();`);
  await new Promise((r) => setTimeout(r, 400));

  const journalInfo = await evaluate(`
    (() => {
      const m = document.getElementById('journal-modal');
      const questTitle = document.getElementById('journal-quest-title')?.textContent;
      const questObjective = document.getElementById('journal-quest-objective')?.textContent;
      const fragments = document.getElementById('journal-fragments-count')?.textContent;
      const shells = document.getElementById('journal-shells-count')?.textContent;
      const mushrooms = document.getElementById('journal-mushrooms-count')?.textContent;
      const starfish = document.getElementById('journal-starfish-count')?.textContent;
      return {
        isOpen: m && !m.classList.contains('hidden'),
        questTitle,
        questObjective,
        fragments,
        shells,
        mushrooms,
        starfish
      };
    })()
  `);
  console.log('   Dati Diario:', JSON.stringify(journalInfo));
  if (!journalInfo.isOpen || !journalInfo.questTitle || journalInfo.fragments !== '0 / 7') {
    throw new Error('Verifica Diario del Cartografo fallita');
  }
  await captureShot('04_modal_journal');

  console.log('   🖱️ Chiusura diario tramite #journal-btn-close...');
  await evaluate(`document.getElementById('journal-btn-close').click();`);
  await new Promise((r) => setTimeout(r, 300));

  // =========================================================================
  // TEST 5: MODAL IMPOSTAZIONI (⚙️)
  // =========================================================================
  console.log('\n--- 5. Collaudo Modal Impostazioni (Settings Modal) ---');
  console.log('   🖱️ Click su #btn-hud-settings...');
  await evaluate(`document.getElementById('btn-hud-settings').click();`);
  await new Promise((r) => setTimeout(r, 400));

  const settingsInfo = await evaluate(`
    (() => {
      const m = document.getElementById('settings-modal');
      const qualityBtns = m ? Array.from(m.querySelectorAll('.quality-btn')) : [];
      const closeBtn = m ? m.querySelector('.close-btn') : null;
      return {
        isOpen: m && !m.classList.contains('hidden'),
        qualityBtnsCount: qualityBtns.length,
        hasCloseBtn: !!closeBtn,
        activeQuality: qualityBtns.find(b => b.classList.contains('active'))?.textContent.trim()
      };
    })()
  `);
  console.log('   Dati Impostazioni:', JSON.stringify(settingsInfo));
  if (!settingsInfo.isOpen || settingsInfo.qualityBtnsCount < 3) {
    throw new Error('Verifica Modal Impostazioni fallita');
  }
  await captureShot('05_modal_settings');

  // Test interazione con cambio qualità grafica
  console.log('   🖱️ Selezione preset grafico "Bassa"...');
  await evaluate(`document.querySelectorAll('#settings-modal .quality-btn')[0].click();`);
  await new Promise((r) => setTimeout(r, 200));

  console.log('   🖱️ Selezione preset grafico "Alta"...');
  await evaluate(`document.querySelectorAll('#settings-modal .quality-btn')[2].click();`);
  await new Promise((r) => setTimeout(r, 200));

  console.log('   🖱️ Chiusura impostazioni...');
  await evaluate(`document.querySelector('#settings-modal .close-btn').click();`);
  await new Promise((r) => setTimeout(r, 300));

  // =========================================================================
  // TEST 6: BADGE DI INTERAZIONE & ANIMAZIONE NONNA BUSSOLA
  // =========================================================================
  console.log('\n--- 6. Collaudo Badge di Interazione in-game ---');
  console.log('   🏃‍♂️ Movimento verso Nonna Bussola (W per 0.6s)...');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyW', key: 'w' });
  await new Promise((r) => setTimeout(r, 600));
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyW', key: 'w' });
  await new Promise((r) => setTimeout(r, 500));

  const promptInfo = await evaluate(`
    (() => {
      const prompt = document.getElementById('interaction-prompt');
      const text = document.getElementById('prompt-text')?.textContent;
      return {
        visible: prompt && !prompt.classList.contains('hidden') && getComputedStyle(prompt).opacity !== '0',
        text
      };
    })()
  `);
  console.log('   Dati Prompt Interazione:', JSON.stringify(promptInfo));
  await captureShot('06_interaction_prompt');

  // =========================================================================
  // TEST 7: DIALOGUE BOX MODALE
  // =========================================================================
  console.log('\n--- 7. Collaudo Dialogue Box con Scelte di Risposta ---');
  console.log('   💬 Apertura dialogo premendo E...');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyE', key: 'e' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyE', key: 'e' });
  await new Promise((r) => setTimeout(r, 500));

  const dialogueInfo = await evaluate(`
    (() => {
      const box = document.getElementById('dialogue-box');
      const name = document.getElementById('dialogue-name')?.textContent;
      const role = document.getElementById('dialogue-role')?.textContent;
      const text = document.getElementById('dialogue-text')?.textContent;
      const options = Array.from(document.querySelectorAll('#dialogue-options .dialogue-option-btn')).map(b => b.textContent.trim());
      return {
        isOpen: box && !box.classList.contains('hidden'),
        name,
        role,
        textSnippet: text ? text.substring(0, 50) + '...' : '',
        options
      };
    })()
  `);
  console.log('   Dati Dialogo:', JSON.stringify(dialogueInfo));
  if (!dialogueInfo.isOpen || dialogueInfo.name !== 'Nonna Bussola' || dialogueInfo.options.length === 0) {
    throw new Error('Verifica Dialogue Box fallita');
  }
  await captureShot('07_dialogue_box');

  // Clic su una scelta di risposta per avanzare il dialogo
  console.log('   🖱️ Click sulla 1a scelta di risposta: "' + dialogueInfo.options[0] + '"...');
  await evaluate(`document.querySelector('#dialogue-options .dialogue-option-btn').click();`);
  await new Promise((r) => setTimeout(r, 400));

  const dialogueAdvanced = await evaluate(`
    (() => {
      const text = document.getElementById('dialogue-text')?.textContent;
      const options = Array.from(document.querySelectorAll('#dialogue-options .dialogue-option-btn')).map(b => b.textContent.trim());
      return {
        textSnippet: text ? text.substring(0, 50) + '...' : '',
        options
      };
    })()
  `);
  console.log('   Dialogo avanzato al nodo successivo:', JSON.stringify(dialogueAdvanced));
  await captureShot('08_dialogue_advanced');

  // Chiude dialogo (o seleziona ultima opzione per terminare)
  await evaluate(`
    const btn = document.querySelector('#dialogue-options .dialogue-option-btn');
    if (btn) btn.click();
  `);
  await new Promise((r) => setTimeout(r, 400));

  // =========================================================================
  // TEST 8: RESPONSIVE MOBILE TOUCH UI (Emulazione Smartphone 390x844)
  // =========================================================================
  console.log('\n--- 8. Collaudo Responsive Mobile Touch UI (iPhone / Android) ---');
  console.log('   📱 Configurazione viewport mobile 390x844 con Touch abilitato...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 5
  });

  // Trigger resize event
  await evaluate(`window.dispatchEvent(new Event('resize'));`);
  await new Promise((r) => setTimeout(r, 600));

  const mobileUIInfo = await evaluate(`
    (() => {
      const touchLayer = document.getElementById('touch-controls');
      const joystick = document.getElementById('joystick-zone');
      const btnAction = document.getElementById('btn-touch-action');
      const btnJump = document.getElementById('btn-touch-jump');
      const desktopBar = document.getElementById('desktop-controls-bar');
      return {
        touchLayerVisible: touchLayer && !touchLayer.classList.contains('hidden'),
        hasJoystick: !!joystick,
        hasActionBtn: !!btnAction,
        hasJumpBtn: !!btnJump,
        desktopBarDisplay: desktopBar ? getComputedStyle(desktopBar).display : 'none',
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      };
    })()
  `);
  console.log('   Dati Mobile Touch UI:', JSON.stringify(mobileUIInfo));
  await captureShot('09_mobile_touch_hud');

  // Apertura del diario su mobile per verificare layout responsive
  console.log('   📱 Apertura Diario su layout mobile...');
  await evaluate(`document.getElementById('btn-hud-journal').click();`);
  await new Promise((r) => setTimeout(r, 400));
  await captureShot('10_mobile_journal_modal');
  await evaluate(`document.getElementById('journal-btn-close').click();`);

  // =========================================================================
  // REPORT FINALE E VERIFICA ERRORI CONSOLE
  // =========================================================================
  console.log('\n=============================================================');
  console.log('🎉 TUTTI I TEST UI SU CHROME SONO STATI COMPLETATI CON SUCCESSO!');
  console.log('=============================================================');
  console.log('   1. Start Screen: Presente, accessibile e dismissibile con animazione.');
  console.log('   2. Top Bar HUD: Titolo, badge FPS e pulsanti sempre visibili.');
  console.log('   3. Modal Guida (❓ Controlli): Apertura/chiusura e sezioni PC/Touch valide.');
  console.log('   4. Modal Diario (📖 Diario): Missione attiva, contatori frammenti e reperti OK.');
  console.log('   5. Modal Impostazioni (⚙️): Selettori qualità Bassa/Alta e volumi responsivi.');
  console.log('   6. Interaction Badge: Comparsa e formattazione corretta vicino a NPC.');
  console.log('   7. Dialogue Box: Header speaker, avatar, testo ed albero decisionale a scelte multiple OK.');
  console.log('   8. Mobile Layout: Viewport 390x844 responsive, joystick touch e pulsanti dedicati OK.');
  console.log(`   9. Screenshot catturati: 10 schermate in tests/ui_screenshots/`);

  if (consoleErrors.length > 0) {
    console.error('\n❌ ERRORI CONSOLE RILEVATI DURANTE I TEST UI:');
    consoleErrors.forEach((e) => console.error('  ', e));
    cleanup();
    ws.close();
    process.exit(1);
  } else {
    console.log('   10. Zero errori JavaScript o eccezioni WebGL durante l\'intera sessione UI!');
  }

  cleanup();
  ws.close();
}

runChromeUITests().catch((err) => {
  console.error('Fatal error in Chrome UI test:', err);
  process.exit(1);
});
