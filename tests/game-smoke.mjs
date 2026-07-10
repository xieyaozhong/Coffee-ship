import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = process.env.COFFEE_SHIP_URL || 'http://127.0.0.1:4173/index.html';
const RESULT_DIR = path.resolve('test-results');
const CASE_TIMEOUT_MS = 45_000;
await fs.mkdir(RESULT_DIR,{recursive:true});

const ignoredMessages = [
  /favicon\.ico/i,
  /Firebase background init failed/i,
  /Firebase 暫時無法載入/i,
  /player sync failed/i,
  /multiplayer role sync failed/i,
  /ResizeObserver loop/i,
  /net::ERR_(FAILED|ABORTED|BLOCKED_BY_CLIENT|NAME_NOT_RESOLVED|INTERNET_DISCONNECTED|CONNECTION_REFUSED)/i,
  /Failed to load resource.*firebase/i
];

function ignored(message) {
  return ignoredMessages.some(pattern => pattern.test(String(message || '')));
}

async function runCase(browser,config) {
  const stageFile = path.join(RESULT_DIR,`${config.name}-stages.log`);
  let stage = 'create context';
  async function checkpoint(next,extra='') {
    stage = next;
    const line = `[${new Date().toISOString()}] ${config.name}: ${next}${extra ? ` | ${extra}` : ''}`;
    console.log(line);
    await fs.appendFile(stageFile,`${line}\n`);
  }

  await checkpoint(stage);
  const context = await browser.newContext({
    viewport:config.viewport,
    isMobile:config.mobile,
    hasTouch:config.mobile,
    deviceScaleFactor:config.mobile ? 2 : 1,
    locale:'zh-TW',
    colorScheme:'dark',
    serviceWorkers:'block'
  });

  await context.addInitScript(() => {
    try { localStorage.clear(); } catch {}
    try { sessionStorage.clear(); } catch {}
  });

  await context.route('**/*',route => {
    let url;
    try { url = new URL(route.request().url()); }
    catch { return route.continue(); }
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.protocol === 'data:' || url.protocol === 'blob:') {
      return route.continue();
    }
    return route.abort('blockedbyclient');
  });

  const page = await context.newPage();
  page.setDefaultTimeout(9_000);
  page.setDefaultNavigationTimeout(15_000);
  const errors = [];
  const warnings = [];
  let deadlineExpired = false;
  const deadline = setTimeout(() => {
    deadlineExpired = true;
    page.close({runBeforeUnload:false}).catch(() => {});
  },CASE_TIMEOUT_MS);

  page.on('pageerror',error => {
    if (!ignored(error.message)) errors.push(`pageerror: ${error.stack || error.message}`);
  });
  page.on('console',message => {
    const text = message.text();
    if (message.type() === 'error' && !ignored(text)) errors.push(`console: ${text}`);
    if (message.type() === 'warning' && !ignored(text)) warnings.push(text);
  });

  try {
    await checkpoint('navigate');
    await page.goto(BASE_URL,{waitUntil:'commit'});

    await checkpoint('wait runtime');
    await page.waitForFunction(() => !!window.COFFEE_SHIP_RUNTIME && !!window.COFFEE_SHIP_DECK && !!document.getElementById('startBtn'),null,{timeout:20_000});

    await checkpoint('enter game');
    await page.locator('#playerName').fill(config.mobile ? 'Mobile Tester' : 'Desktop Tester');
    await page.locator('#startBtn').click();
    await page.waitForFunction(() => {
      const panel = document.getElementById('gamePanel');
      return panel && !panel.classList.contains('hidden');
    });

    await checkpoint('read initial health');
    const initial = await page.evaluate(() => ({
      health:window.COFFEE_SHIP_RUNTIME.health(),
      x:window.COFFEE_SHIP_GAME_API?.player?.x,
      canvas:{width:document.getElementById('game')?.width,height:document.getElementById('game')?.height},
      scene:window.COFFEE_SHIP_DECK?.getScene?.()
    }));

    if (!initial.health.playable) throw new Error(`runtime not playable: ${JSON.stringify(initial.health)}`);
    if (!initial.canvas.width || !initial.canvas.height) throw new Error(`invalid canvas: ${JSON.stringify(initial.canvas)}`);
    if (initial.scene !== 'cafe') throw new Error(`unexpected initial scene: ${initial.scene}`);

    await checkpoint('move player');
    if (config.mobile) {
      const right = page.locator('[data-move="right"]');
      await right.dispatchEvent('pointerdown',{pointerId:7,pointerType:'touch',isPrimary:true});
      await page.waitForTimeout(420);
      await right.dispatchEvent('pointerup',{pointerId:7,pointerType:'touch',isPrimary:true});
    } else {
      await page.keyboard.down('ArrowRight');
      await page.waitForTimeout(420);
      await page.keyboard.up('ArrowRight');
    }

    const movedX = await page.evaluate(() => window.COFFEE_SHIP_GAME_API?.player?.x);
    if (!(Number(movedX) > Number(initial.x))) throw new Error(`player did not move: before=${initial.x}, after=${movedX}`);

    await checkpoint('open deck');
    await page.evaluate(() => window.COFFEE_SHIP_DECK.switchToDeck());
    await page.waitForFunction(() => document.body.dataset.coffeeShipScene === 'deck');
    const deckState = await page.evaluate(() => ({
      open:window.COFFEE_SHIP_DECK.isDeckOpen(),
      overlayHidden:document.getElementById('deckOverlay')?.classList.contains('hidden'),
      cafeCanvasWidth:document.getElementById('game')?.width
    }));
    if (!deckState.open || deckState.overlayHidden) throw new Error(`deck failed: ${JSON.stringify(deckState)}`);

    await checkpoint('return cafe');
    await page.evaluate(() => window.COFFEE_SHIP_DECK.switchToCafe());
    await page.waitForFunction(() => document.body.dataset.coffeeShipScene === 'cafe');
    await page.waitForTimeout(250);
    const restoredCanvas = await page.evaluate(() => ({
      width:document.getElementById('game')?.width,
      height:document.getElementById('game')?.height,
      health:window.COFFEE_SHIP_RUNTIME.health()
    }));
    if (restoredCanvas.width < 900 || restoredCanvas.height < 500) throw new Error(`canvas did not restore: ${JSON.stringify(restoredCanvas)}`);

    await checkpoint('capture result');
    await page.screenshot({path:path.join(RESULT_DIR,`${config.name}-passed.png`),fullPage:false,animations:'disabled'});
    if (errors.length) throw new Error(`browser errors:\n${errors.join('\n')}`);

    await checkpoint('passed');
    return {
      name:config.name,
      health:restoredCanvas.health,
      warnings:warnings.slice(-10),
      movedFrom:initial.x,
      movedTo:movedX,
      deckState
    };
  } catch (error) {
    clearTimeout(deadline);
    const finalError = deadlineExpired ? new Error(`${config.name} exceeded ${CASE_TIMEOUT_MS}ms at stage: ${stage}`) : error;
    if (!page.isClosed()) {
      await Promise.race([
        page.screenshot({path:path.join(RESULT_DIR,`${config.name}-failed.png`),fullPage:false,animations:'disabled'}).catch(() => {}),
        new Promise(resolve => setTimeout(resolve,3000))
      ]);
    }
    const report = {
      name:config.name,
      stage,
      error:finalError.stack || finalError.message || String(finalError),
      originalError:error?.stack || error?.message || String(error),
      errors,
      warnings,
      url:page.isClosed() ? 'page-closed-by-deadline' : page.url(),
      html:page.isClosed() ? '' : await page.locator('body').innerText({timeout:2000}).catch(() => '')
    };
    await fs.writeFile(path.join(RESULT_DIR,`${config.name}-failure.json`),JSON.stringify(report,null,2));
    throw finalError;
  } finally {
    clearTimeout(deadline);
    await Promise.race([context.close().catch(() => {}),new Promise(resolve => setTimeout(resolve,3000))]);
  }
}

const browser = await chromium.launch({headless:true});
const results = [];
try {
  results.push(await runCase(browser,{name:'desktop',viewport:{width:1440,height:1000},mobile:false}));
  results.push(await runCase(browser,{name:'mobile',viewport:{width:390,height:844},mobile:true}));
  await fs.writeFile(path.join(RESULT_DIR,'summary.json'),JSON.stringify({ok:true,results},null,2));
  console.log(JSON.stringify({ok:true,results},null,2));
} catch (error) {
  await fs.writeFile(path.join(RESULT_DIR,'summary.json'),JSON.stringify({ok:false,error:error.stack || String(error),results},null,2));
  console.error(error);
  process.exitCode = 1;
} finally {
  await Promise.race([browser.close().catch(() => {}),new Promise(resolve => setTimeout(resolve,3000))]);
}
