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

  async function loginLayout() {
    return page.evaluate(() => {
      function info(element) {
        if (!element) return null;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return {
          tag:element.tagName,
          id:element.id,
          className:element.className,
          hidden:!!element.hidden,
          display:style.display,
          visibility:style.visibility,
          opacity:style.opacity,
          position:style.position,
          pointerEvents:style.pointerEvents,
          width:rect.width,
          height:rect.height,
          top:rect.top,
          left:rect.left,
          overflow:style.overflow
        };
      }
      const input = document.getElementById('playerName');
      const ancestors = [];
      let current = input;
      while (current && ancestors.length < 12) {
        ancestors.push(info(current));
        current = current.parentElement;
      }
      return {
        body:info(document.body),
        html:info(document.documentElement),
        bodyClasses:[...document.body.classList],
        htmlClasses:[...document.documentElement.classList],
        creator:info(document.getElementById('creator')),
        gamePanel:info(document.getElementById('gamePanel')),
        generalPanel:info(document.getElementById('loginGeneralPanel')),
        formHolder:info(document.getElementById('loginFormHolder')),
        input:info(input),
        ancestors,
        hasAvatar:!!localStorage.getItem('coffeeShipAvatar'),
        loginVisibilityApi:!!window.COFFEE_SHIP_LOGIN_VISIBILITY
      };
    });
  }

  try {
    await checkpoint('navigate');
    await page.goto(BASE_URL,{waitUntil:'commit'});

    await checkpoint('wait runtime');
    await page.waitForFunction(() => !!window.COFFEE_SHIP_RUNTIME && !!window.COFFEE_SHIP_DECK && !!document.getElementById('startBtn'),null,{timeout:20_000});

    await checkpoint('inspect login');
    const beforeRepair = await loginLayout();
    await page.evaluate(() => window.COFFEE_SHIP_LOGIN_VISIBILITY?.repair?.('remote-test'));
    await page.waitForTimeout(120);
    const afterRepair = await loginLayout();
    await fs.writeFile(path.join(RESULT_DIR,`${config.name}-login-layout.json`),JSON.stringify({beforeRepair,afterRepair},null,2));
    const loginVisible = Number(afterRepair.input?.width || 0) > 1 && Number(afterRepair.input?.height || 0) > 1 && afterRepair.input?.display !== 'none' && afterRepair.input?.visibility !== 'hidden';

    await checkpoint('enter game',`loginVisible=${loginVisible}`);
    const testerName = config.mobile ? 'Mobile Tester' : 'Desktop Tester';
    if (loginVisible) {
      await page.locator('#playerName').fill(testerName,{force:true});
      await page.locator('#startBtn').click({force:true});
    } else {
      await page.evaluate(name => {
        const input = document.getElementById('playerName');
        if (input) {
          input.value = name;
          input.dispatchEvent(new Event('input',{bubbles:true}));
        }
        document.getElementById('startBtn')?.click();
      },testerName);
    }
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

    await checkpoint('passed',`loginVisible=${loginVisible}`);
    return {
      name:config.name,
      loginVisible,
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
  const hiddenLogins = results.filter(result => !result.loginVisible).map(result => result.name);
  const summary = {ok:hiddenLogins.length === 0,hiddenLogins,results};
  await fs.writeFile(path.join(RESULT_DIR,'summary.json'),JSON.stringify(summary,null,2));
  console.log(JSON.stringify(summary,null,2));
  if (hiddenLogins.length) throw new Error(`login UI hidden in: ${hiddenLogins.join(', ')}`);
} catch (error) {
  if (!results.length) await fs.writeFile(path.join(RESULT_DIR,'summary.json'),JSON.stringify({ok:false,error:error.stack || String(error),results},null,2));
  console.error(error);
  process.exitCode = 1;
} finally {
  await Promise.race([browser.close().catch(() => {}),new Promise(resolve => setTimeout(resolve,3000))]);
}
