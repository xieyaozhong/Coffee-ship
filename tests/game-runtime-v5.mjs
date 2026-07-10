import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl=process.env.COFFEE_SHIP_URL||'http://127.0.0.1:4173/index.html';
const out=path.resolve('test-results');
await fs.mkdir(out,{recursive:true});

const timeout=(promise,ms,label)=>Promise.race([
  promise,
  new Promise((_,reject)=>setTimeout(()=>reject(new Error(`${label} timeout after ${ms}ms`)),ms))
]);

const ignored=text=>/firebase|blocked_by_client|err_failed|favicon|multiplayer role sync|player sync|resizeobserver/i.test(String(text||''));

async function run(browser,{name,viewport,mobile}){
  const log=[];
  const errors=[];
  const stage=async(value,detail={})=>{
    const row={at:new Date().toISOString(),stage:value,...detail};
    log.push(row);
    console.log(`[${name}] ${value}`,Object.keys(detail).length?JSON.stringify(detail):'');
    await fs.writeFile(path.join(out,`${name}-v5-stages.json`),JSON.stringify(log,null,2));
  };

  const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,locale:'zh-TW',serviceWorkers:'block'});
  await context.addInitScript(()=>{localStorage.clear();sessionStorage.clear();});
  await context.route('**/*',route=>{
    try{
      const url=new URL(route.request().url());
      if(['127.0.0.1','localhost'].includes(url.hostname)||['data:','blob:'].includes(url.protocol))return route.continue();
      return route.abort('blockedbyclient');
    }catch{return route.continue();}
  });
  const page=await context.newPage();
  page.setDefaultTimeout(10000);
  page.on('pageerror',error=>{if(!ignored(error.message))errors.push(error.stack||error.message);});
  page.on('console',message=>{if(message.type()==='error'&&!ignored(message.text()))errors.push(message.text());});

  try{
    await stage('navigate');
    await page.goto(baseUrl,{waitUntil:'commit',timeout:15000});
    await stage('wait-core');
    await page.waitForFunction(()=>window.COFFEE_SHIP_BOARDING?.version>=5&&window.COFFEE_SHIP_RUNTIME&&window.COFFEE_SHIP_DECK&&window.COFFEE_SHIP_GAME_API,null,{timeout:20000});

    const login=await page.evaluate(()=>{
      const input=document.getElementById('playerName');
      const button=document.getElementById('startBtn');
      const rect=input?.getBoundingClientRect();
      const style=input?getComputedStyle(input):null;
      return{
        visible:!!input&&rect.width>1&&rect.height>1&&style.display!=='none'&&style.visibility!=='hidden',
        buttonVersion:button?.dataset.boardingCore,
        boardingVersion:window.COFFEE_SHIP_BOARDING?.version,
        trace:window.COFFEE_SHIP_BOARDING_TRACE
      };
    });
    await stage('login-ready',login);
    if(!login.visible||login.buttonVersion!=='5')throw new Error(`login core invalid: ${JSON.stringify(login)}`);

    const queued=await page.evaluate(testName=>{
      const input=document.getElementById('playerName');
      input.value=testName;
      input.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:testName}));
      const button=document.getElementById('startBtn');
      const returned=button.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,cancelable:true,pointerId:55,pointerType:'touch',isPrimary:true}));
      return{returned,state:window.COFFEE_SHIP_BOARDING.state(),trace:window.COFFEE_SHIP_BOARDING_TRACE};
    },mobile?'Mobile Tester':'Desktop Tester');
    await stage('boarding-queued',queued);

    await page.waitForFunction(()=>!document.getElementById('gamePanel')?.classList.contains('hidden')&&document.body.dataset.boardingStage!=='failed',null,{timeout:12000});
    const boarded=await page.evaluate(()=>({
      state:window.COFFEE_SHIP_BOARDING.state(),
      trace:window.COFFEE_SHIP_BOARDING_TRACE,
      avatar:JSON.parse(localStorage.getItem('coffeeShipAvatar')||'null'),
      health:window.COFFEE_SHIP_RUNTIME.health(),
      scene:window.COFFEE_SHIP_DECK.getScene(),
      x:window.COFFEE_SHIP_GAME_API.player.x,
      canvas:[document.getElementById('game').width,document.getElementById('game').height]
    }));
    await stage('boarded',boarded);
    if(!boarded.health.playable||boarded.scene!=='cafe'||!boarded.avatar)throw new Error(`boarding invalid: ${JSON.stringify(boarded)}`);

    if(mobile){
      await page.evaluate(()=>document.querySelector('[data-move="right"]')?.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:77,pointerType:'touch',isPrimary:true})));
      await page.waitForTimeout(500);
      await page.evaluate(()=>document.querySelector('[data-move="right"]')?.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:77,pointerType:'touch',isPrimary:true})));
    }else{
      await page.evaluate(()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})));
      await page.waitForTimeout(500);
      await page.evaluate(()=>window.dispatchEvent(new KeyboardEvent('keyup',{key:'ArrowRight',bubbles:true})));
    }
    const movedX=await page.evaluate(()=>window.COFFEE_SHIP_GAME_API.player.x);
    await stage('moved',{from:boarded.x,to:movedX});
    if(!(movedX>boarded.x))throw new Error(`player did not move: ${boarded.x} -> ${movedX}`);

    await page.evaluate(()=>window.COFFEE_SHIP_DECK.switchToDeck());
    await page.waitForFunction(()=>document.body.dataset.coffeeShipScene==='deck',null,{timeout:10000});
    const deck=await page.evaluate(()=>({open:window.COFFEE_SHIP_DECK.isDeckOpen(),hidden:document.getElementById('deckOverlay')?.classList.contains('hidden')}));
    await stage('deck-open',deck);
    if(!deck.open||deck.hidden)throw new Error(`deck invalid: ${JSON.stringify(deck)}`);

    await page.evaluate(()=>window.COFFEE_SHIP_DECK.switchToCafe());
    await page.waitForFunction(()=>document.body.dataset.coffeeShipScene==='cafe',null,{timeout:10000});
    await page.waitForTimeout(250);
    const restored=await page.evaluate(()=>({
      canvas:[document.getElementById('game').width,document.getElementById('game').height],
      health:window.COFFEE_SHIP_RUNTIME.health()
    }));
    await stage('cafe-restored',restored);
    if(restored.canvas[0]<900||restored.canvas[1]<500||!restored.health.playable)throw new Error(`restore invalid: ${JSON.stringify(restored)}`);
    if(errors.length)throw new Error(`browser errors: ${errors.join(' | ')}`);

    await page.screenshot({path:path.join(out,`${name}-v5-passed.png`),animations:'disabled',timeout:8000});
    await stage('passed');
    return{name,login,queued,boarded,movedX,deck,restored};
  }catch(error){
    await stage('failed',{message:error.message,errors});
    await page.screenshot({path:path.join(out,`${name}-v5-failed.png`),animations:'disabled',timeout:5000}).catch(()=>{});
    throw error;
  }finally{
    await context.close().catch(()=>{});
  }
}

let browser;
const results=[];
try{
  browser=await timeout(chromium.launch({headless:true,timeout:15000,args:['--no-sandbox','--disable-dev-shm-usage']}),20000,'browser launch');
  results.push(await timeout(run(browser,{name:'desktop',viewport:{width:1440,height:1000},mobile:false}),45000,'desktop'));
  results.push(await timeout(run(browser,{name:'mobile',viewport:{width:390,height:844},mobile:true}),45000,'mobile'));
  await fs.writeFile(path.join(out,'v5-summary.json'),JSON.stringify({ok:true,results},null,2));
  console.log(JSON.stringify({ok:true,results},null,2));
}catch(error){
  await fs.writeFile(path.join(out,'v5-summary.json'),JSON.stringify({ok:false,error:error.stack||String(error),results},null,2));
  console.error(error);
  process.exitCode=1;
}finally{
  await browser?.close().catch(()=>{});
}
setTimeout(()=>process.exit(process.exitCode||0),25);
