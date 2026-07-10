import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const URL = process.env.COFFEE_SHIP_URL || 'http://127.0.0.1:4173/index.html';
const OUT = path.resolve('test-results');
const CASE_TIMEOUT = 55_000;
await fs.mkdir(OUT,{recursive:true});
await fs.writeFile(path.join(OUT,'runner-stage.log'),`[${new Date().toISOString()}] runner-start\n`);

const ignored = text => [
  /firebase/i,/multiplayer role sync failed/i,/player sync failed/i,
  /ERR_(BLOCKED_BY_CLIENT|FAILED|ABORTED)/i,/ResizeObserver loop/i,/favicon/i
].some(pattern => pattern.test(String(text || '')));

const timeoutAfter = (ms,label) => new Promise((_,reject) => {
  const timer = setTimeout(() => reject(new Error(`${label} exceeded ${ms}ms`)),ms);
  timer.unref?.();
});

const settleWithin = async (promise,ms) => {
  try { return await Promise.race([promise,new Promise(resolve => setTimeout(resolve,ms))]); }
  catch { return undefined; }
};

async function testCase(browser,{name,viewport,mobile}) {
  const stages = [];
  const errors = [];
  const warnings = [];
  let context;
  let page;

  const stage = async value => {
    stages.push({at:new Date().toISOString(),value});
    const line=`[${new Date().toISOString()}] ${name}: ${value}`;
    console.log(line);
    await fs.writeFile(path.join(OUT,`${name}-stages.json`),JSON.stringify(stages,null,2));
    await fs.appendFile(path.join(OUT,'runner-stage.log'),`${line}\n`);
  };

  const execute = async () => {
    await stage('create-context');
    context = await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,locale:'zh-TW',serviceWorkers:'block'});
    await context.addInitScript(() => { try{localStorage.clear();sessionStorage.clear();}catch{} });
    await context.route('**/*',route => {
      try {
        const target = new URL(route.request().url());
        if (['127.0.0.1','localhost'].includes(target.hostname) || ['data:','blob:'].includes(target.protocol)) return route.continue();
        return route.abort('blockedbyclient');
      } catch { return route.continue(); }
    });

    await stage('create-page');
    page = await context.newPage();
    page.setDefaultTimeout(12000);
    page.on('pageerror',error => { if(!ignored(error.message)) errors.push(error.stack || error.message); });
    page.on('console',message => {
      const text=message.text();
      if(message.type()==='error'&&!ignored(text)) errors.push(text);
      if(message.type()==='warning'&&!ignored(text)) warnings.push(text);
    });

    await stage('navigate');
    await page.goto(URL,{waitUntil:'commit',timeout:15000});
    await stage('wait-runtime');
    await page.waitForFunction(() => !!window.COFFEE_SHIP_RUNTIME && !!window.COFFEE_SHIP_DECK && !!window.COFFEE_SHIP_GAME_API && !!window.COFFEE_SHIP_BOARDING,{timeout:20000});

    await stage('login-layout');
    const layout = await page.evaluate(() => {
      const input=document.getElementById('playerName');
      const rect=input?.getBoundingClientRect();
      const style=input?getComputedStyle(input):null;
      return {
        visible:!!input&&rect.width>1&&rect.height>1&&style.display!=='none'&&style.visibility!=='hidden'&&style.opacity!=='0',
        rect:rect?{x:rect.x,y:rect.y,width:rect.width,height:rect.height}:null,
        display:style?.display,
        visibility:style?.visibility,
        creatorClass:document.getElementById('creator')?.className,
        bodyClass:document.body.className,
        hasAvatar:!!localStorage.getItem('coffeeShipAvatar'),
        boardingVersion:window.COFFEE_SHIP_BOARDING?.version,
        buttonVersion:document.getElementById('startBtn')?.dataset?.boardingCore
      };
    });
    await fs.writeFile(path.join(OUT,`${name}-layout.json`),JSON.stringify(layout,null,2));
    if(!layout.visible) throw new Error(`login input is not visible: ${JSON.stringify(layout)}`);
    if(Number(layout.boardingVersion)<4 || layout.buttonVersion!=='4') throw new Error(`boarding core not attached: ${JSON.stringify(layout)}`);

    await stage('board');
    const boardResult=await page.evaluate(testName => {
      const input=document.getElementById('playerName');
      input.value=testName;
      input.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:testName}));
      const button=document.getElementById('startBtn');
      const dispatched=button?.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,cancelable:true,pointerId:21,pointerType:'touch',isPrimary:true}));
      return {
        dispatched,
        creatorHidden:document.getElementById('creator')?.classList.contains('hidden'),
        gameHidden:document.getElementById('gamePanel')?.classList.contains('hidden'),
        avatar:localStorage.getItem('coffeeShipAvatar'),
        boardingState:window.COFFEE_SHIP_BOARDING?.state?.()
      };
    },mobile?'Mobile Tester':'Desktop Tester');
    await fs.writeFile(path.join(OUT,`${name}-boarding.json`),JSON.stringify(boardResult,null,2));
    await page.waitForFunction(() => !document.getElementById('gamePanel')?.classList.contains('hidden'),{timeout:12000});

    await stage('health');
    const initial = await page.evaluate(() => ({
      health:window.COFFEE_SHIP_RUNTIME.health(),
      x:window.COFFEE_SHIP_GAME_API?.player?.x,
      scene:window.COFFEE_SHIP_DECK.getScene(),
      canvas:[document.getElementById('game')?.width,document.getElementById('game')?.height]
    }));
    if(!initial.health.playable) throw new Error(`runtime not playable: ${JSON.stringify(initial.health)}`);
    if(initial.scene!=='cafe') throw new Error(`expected cafe, got ${initial.scene}`);

    await stage('move');
    if(mobile){
      await page.evaluate(() => {
        const button=document.querySelector('[data-move="right"]');
        button?.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:11,pointerType:'touch',isPrimary:true}));
      });
      await page.waitForTimeout(500);
      await page.evaluate(() => document.querySelector('[data-move="right"]')?.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:11,pointerType:'touch',isPrimary:true})));
    }else{
      await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})));
      await page.waitForTimeout(500);
      await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keyup',{key:'ArrowRight',bubbles:true})));
    }
    const movedX=await page.evaluate(() => window.COFFEE_SHIP_GAME_API?.player?.x);
    if(!(Number(movedX)>Number(initial.x))) throw new Error(`player did not move: ${initial.x} -> ${movedX}`);

    await stage('deck');
    await page.evaluate(() => window.COFFEE_SHIP_DECK.switchToDeck());
    await page.waitForFunction(() => document.body.dataset.coffeeShipScene==='deck',{timeout:10000});
    const deck=await page.evaluate(() => ({open:window.COFFEE_SHIP_DECK.isDeckOpen(),hidden:document.getElementById('deckOverlay')?.classList.contains('hidden')}));
    if(!deck.open||deck.hidden) throw new Error(`deck did not open: ${JSON.stringify(deck)}`);

    await stage('cafe-return');
    await page.evaluate(() => window.COFFEE_SHIP_DECK.switchToCafe());
    await page.waitForFunction(() => document.body.dataset.coffeeShipScene==='cafe',{timeout:10000});
    await page.waitForTimeout(300);
    const final=await page.evaluate(() => ({
      width:document.getElementById('game')?.width,
      height:document.getElementById('game')?.height,
      health:window.COFFEE_SHIP_RUNTIME.health()
    }));
    if(final.width<900||final.height<500) throw new Error(`canvas not restored: ${JSON.stringify(final)}`);
    if(errors.length) throw new Error(`browser errors: ${errors.join(' | ')}`);

    await stage('screenshot');
    await page.screenshot({path:path.join(OUT,`${name}-passed.png`),animations:'disabled',timeout:10000});
    await stage('passed');
    return {name,layout,boardResult,initial,movedX,deck,final,warnings:warnings.slice(-10)};
  };

  try {
    return await Promise.race([execute(),timeoutAfter(CASE_TIMEOUT,`${name} case`)]);
  } catch(error) {
    await stage(`failed:${error.message}`).catch(()=>{});
    if(page && !page.isClosed()) await settleWithin(page.screenshot({path:path.join(OUT,`${name}-failed.png`),animations:'disabled',timeout:5000}).catch(()=>{}),6000);
    await fs.writeFile(path.join(OUT,`${name}-failure.json`),JSON.stringify({stage:stages.at(-1)?.value,error:error.stack||String(error),errors,warnings},null,2));
    throw error;
  } finally {
    if(context) await settleWithin(context.close().catch(()=>{}),5000);
  }
}

let browser;
const results=[];
try{
  await fs.appendFile(path.join(OUT,'runner-stage.log'),`[${new Date().toISOString()}] browser-launch\n`);
  browser=await chromium.launch({headless:true,timeout:15000,args:['--no-sandbox','--disable-dev-shm-usage']});
  await fs.appendFile(path.join(OUT,'runner-stage.log'),`[${new Date().toISOString()}] browser-launched\n`);
  results.push(await testCase(browser,{name:'desktop',viewport:{width:1440,height:1000},mobile:false}));
  results.push(await testCase(browser,{name:'mobile',viewport:{width:390,height:844},mobile:true}));
  await fs.writeFile(path.join(OUT,'summary.json'),JSON.stringify({ok:true,results},null,2));
  console.log(JSON.stringify({ok:true,results},null,2));
}catch(error){
  await fs.writeFile(path.join(OUT,'summary.json'),JSON.stringify({ok:false,error:error.stack||String(error),results},null,2));
  console.error(error);
  process.exitCode=1;
}finally{
  if(browser) await settleWithin(browser.close().catch(()=>{}),5000);
  await fs.appendFile(path.join(OUT,'runner-stage.log'),`[${new Date().toISOString()}] runner-finished code=${process.exitCode||0}\n`);
}

setTimeout(() => process.exit(process.exitCode || 0),25);
