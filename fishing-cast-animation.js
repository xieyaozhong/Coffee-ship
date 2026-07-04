(() => {
  'use strict';
  if (window.__COFFEE_SHIP_FISHING_MOTION__) return;
  window.__COFFEE_SHIP_FISHING_MOTION__ = true;

  const W = 960;
  const H = 576;
  const WATER = { x:820, y:410 };
  const resultSelectors = ['#centralFishResultCard','#fishingCard','#fishingSpecialCard','#extraFish50Card','#sharkCard','#mutantCard'];
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const mobile = window.matchMedia?.('(max-width: 760px)')?.matches;

  let canvas = null;
  let ctx = null;
  let game = null;
  let state = null;
  let lastResultKey = '';
  let splash = [];
  let raf = 0;

  function isDeckOpen() {
    const api = window.COFFEE_SHIP_DECK;
    if (api?.isDeckOpen) return api.isDeckOpen();
    const deck = document.getElementById('deckOverlay');
    return !!deck && !deck.classList.contains('hidden');
  }

  function playerPosition() {
    return window.COFFEE_SHIP_DECK?.getPlayerPosition?.() || {x:690,y:420};
  }

  function addStyle() {
    if (document.getElementById('fishingMotionStyle')) return;
    const style = document.createElement('style');
    style.id = 'fishingMotionStyle';
    style.textContent = `
      #fishingMotionCanvas{
        position:fixed;
        z-index:34;
        pointer-events:none;
        image-rendering:auto;
        opacity:1;
      }
      body:not([data-coffee-ship-scene="deck"]) #fishingMotionCanvas{display:none}
      body.fishing-motion-active #coffeeBtn{filter:brightness(1.12);transform:translateY(1px)}
      @media(max-width:760px){#fishingMotionCanvas{z-index:33}}
    `;
    document.head.appendChild(style);
  }

  function ensureCanvas() {
    game = document.getElementById('game');
    if (!game) return false;
    canvas = document.getElementById('fishingMotionCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'fishingMotionCanvas';
      canvas.width = W;
      canvas.height = H;
      document.body.appendChild(canvas);
    }
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    syncLayout();
    return true;
  }

  function syncLayout() {
    if (!game || !canvas) return;
    const rect = game.getBoundingClientRect();
    canvas.style.left = `${rect.left}px`;
    canvas.style.top = `${rect.top}px`;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }

  function emit(phase, detail={}) {
    window.dispatchEvent(new CustomEvent('coffeeShipFishingPhase', {detail:{phase,...detail}}));
  }

  function startFishingMotion() {
    if (!isDeckOpen() || !ensureCanvas()) return;
    const now = performance.now();
    state = {phase:'cast', started:now, phaseStarted:now, result:null};
    splash = [];
    document.body.classList.add('fishing-motion-active');
    emit('cast');
  }

  function setPhase(phase, result=null) {
    if (!state) startFishingMotion();
    if (!state) return;
    state.phase = phase;
    state.phaseStarted = performance.now();
    if (result) state.result = result;
    emit(phase, result || {});
    if (phase === 'bite') createSplash(20);
  }

  function createSplash(amount) {
    const count = reducedMotion ? 4 : mobile ? Math.min(10, amount) : amount;
    for (let i=0;i<count;i++) {
      splash.push({
        x:WATER.x + (Math.random()-.5)*18,
        y:WATER.y + (Math.random()-.5)*8,
        vx:(Math.random()-.5)*4.8,
        vy:-2-Math.random()*4.5,
        life:28+Math.random()*24,
        max:52,
        size:2+Math.random()*4
      });
    }
  }

  function cleanTitle(element) {
    if (!element) return '';
    const clone = element.cloneNode(true);
    clone.querySelectorAll('.cs-species-icon,.unique-emoji').forEach(node => node.remove());
    const text = clone.textContent || '';
    return window.COFFEE_SHIP_ICON?.cleanEmoji?.(text) || text.replace(/^[^\p{L}\p{N}]+/u,'').trim();
  }

  function parseResult(card) {
    const text = card.textContent || '';
    const titleElement = card.querySelector('.central-fish-title,.mutant-name,.carnival-title') || card.firstElementChild;
    const name = cleanTitle(titleElement).replace(/^(RARE CATCH|EPIC CATCH|LEGENDARY|MYTHIC CREATURE|WORLD CLASS)\s*/i,'').trim().slice(0,60) || '神秘漁獲';
    const rarity = text.match(/稀有度：\s*(世界級|神話|傳說|史詩|稀有|常見|普通)/)?.[1] || '普通';
    const descriptor = window.COFFEE_SHIP_ICON?.iconDescriptor?.({name,rarity}) || {base:'🐟',badge:'✦',color:'#9ce8f0',hue:190};
    return {name,rarity,descriptor};
  }

  function visible(card) {
    if (!card || card.classList.contains('hidden')) return false;
    const style = getComputedStyle(card);
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0;
  }

  function watchResults() {
    for (const selector of resultSelectors) {
      const card = document.querySelector(selector);
      if (!visible(card)) continue;
      const result = parseResult(card);
      const key = `${selector}:${result.name}:${result.rarity}`;
      if (key === lastResultKey) return;
      lastResultKey = key;
      if (!state) startFishingMotion();
      setPhase('bite', result);
      setTimeout(() => {
        if (state?.result?.name === result.name) setPhase('reel', result);
      }, reducedMotion ? 80 : 310);
      return;
    }
  }

  function pointOnCast(t, from, to) {
    const control = {x:(from.x+to.x)/2 + 30, y:Math.min(from.y,to.y)-180};
    const inv=1-t;
    return {
      x:inv*inv*from.x+2*inv*t*control.x+t*t*to.x,
      y:inv*inv*from.y+2*inv*t*control.y+t*t*to.y
    };
  }

  function drawLine(from, to, control=null, alpha=1) {
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.strokeStyle='#edf7ff';
    ctx.lineWidth=2.2;
    ctx.shadowColor='rgba(156,232,240,.7)';
    ctx.shadowBlur=5;
    ctx.beginPath();
    ctx.moveTo(from.x,from.y);
    if (control) ctx.quadraticCurveTo(control.x,control.y,to.x,to.y);
    else ctx.lineTo(to.x,to.y);
    ctx.stroke();
    ctx.restore();
  }

  function drawRod(player, bend=0) {
    const hand={x:player.x+18,y:player.y-4};
    const tip={x:player.x+60+22*bend,y:player.y-58+14*bend};
    ctx.save();
    ctx.strokeStyle='#7b4a2e';ctx.lineWidth=7;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(hand.x,hand.y);ctx.quadraticCurveTo(player.x+36,player.y-35,tip.x,tip.y);ctx.stroke();
    ctx.strokeStyle='#d7bb79';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(hand.x,hand.y);ctx.lineTo(tip.x,tip.y);ctx.stroke();
    ctx.restore();
    return tip;
  }

  function drawBobber(x,y,scale=1) {
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
    ctx.fillStyle='#fff4d8';ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ff6b6b';ctx.beginPath();ctx.arc(0,-2,7,Math.PI,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#120b17';ctx.lineWidth=2;ctx.stroke();ctx.restore();
  }

  function drawRipple(x,y,r,alpha) {
    ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle='#9ce8f0';ctx.lineWidth=2.5;
    ctx.beginPath();ctx.ellipse(x,y,r,r*.3,0,0,Math.PI*2);ctx.stroke();ctx.restore();
  }

  function drawCatchIcon(result,x,y,scale=1,alpha=1) {
    const icon=result?.descriptor || {base:'🐟',badge:'✦',color:'#9ce8f0'};
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.scale(scale,scale);
    ctx.fillStyle='rgba(12,16,37,.9)';ctx.strokeStyle=icon.color || '#9ce8f0';ctx.lineWidth=4;
    ctx.beginPath();ctx.arc(0,0,31,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.font='38px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(icon.base,0,1);
    ctx.fillStyle='#151020';ctx.strokeStyle='#fff4d8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(24,23,13,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle=icon.color || '#ffe16b';ctx.font='900 15px system-ui';ctx.fillText(icon.badge,24,23);
    ctx.restore();
  }

  function drawTension(progress, rarity) {
    const colors={'普通':'#f7f1dc','常見':'#75d982','稀有':'#62c8ff','史詩':'#c084fc','傳說':'#ffe16b','神話':'#ff6b8a','世界級':'#9fffee'};
    const color=colors[rarity]||'#9ce8f0';
    const x=600,y=510,w=270,h=18;
    ctx.fillStyle='rgba(5,8,18,.78)';ctx.fillRect(x,y,w,h);
    ctx.strokeStyle='#fff4d8';ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
    const pulse=.72+.2*Math.sin(performance.now()/70);
    ctx.fillStyle=color;ctx.fillRect(x+3,y+3,(w-6)*Math.min(1,progress)*pulse,h-6);
    ctx.font='900 13px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff4d8';ctx.fillText('收線張力',x+w/2,y-7);
  }

  function updateParticles() {
    for (const p of splash) { p.x+=p.vx;p.y+=p.vy;p.vy+=.16;p.life--; }
    splash=splash.filter(p=>p.life>0);
  }

  function drawParticles() {
    for(const p of splash){
      ctx.save();ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle='#9ce8f0';ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();ctx.restore();
    }
  }

  function finish() {
    state=null;splash=[];document.body.classList.remove('fishing-motion-active');
    if(ctx)ctx.clearRect(0,0,W,H);
    emit('idle');
  }

  function drawFrame(now) {
    raf=requestAnimationFrame(drawFrame);
    if(!ctx||!canvas)return;
    syncLayout();
    ctx.clearRect(0,0,W,H);
    if(!state||!isDeckOpen())return;

    const player=playerPosition();
    const elapsed=now-state.phaseStarted;
    let rodTip=drawRod(player,state.phase==='bite'?.8:state.phase==='reel'?.55:0);

    if(state.phase==='cast'){
      const duration=reducedMotion?180:560;
      const t=Math.min(1,elapsed/duration);
      const point=pointOnCast(t,rodTip,WATER);
      drawLine(rodTip,point,{x:(rodTip.x+point.x)/2,y:Math.min(rodTip.y,point.y)-75});
      drawBobber(point.x,point.y,.8+.2*t);
      if(t>=1){createSplash(10);setPhase('wait');}
    } else if(state.phase==='wait'){
      const bob=Math.sin(now/160)*4;
      drawLine(rodTip,{x:WATER.x,y:WATER.y+bob},{x:740,y:330});
      drawBobber(WATER.x,WATER.y+bob);
      const ripple=(now/18)%55;
      drawRipple(WATER.x,WATER.y+8,ripple,1-ripple/55);
      drawRipple(WATER.x,WATER.y+8,(ripple+27)%55,1-((ripple+27)%55)/55);
      if(elapsed>5200)finish();
    } else if(state.phase==='bite'){
      const jerk=Math.sin(now/24)*12;
      drawLine(rodTip,{x:WATER.x+jerk,y:WATER.y+12},{x:745,y:300});
      drawBobber(WATER.x+jerk,WATER.y+12,.92);
      drawRipple(WATER.x,WATER.y+8,22+elapsed*.12,Math.max(0,1-elapsed/420));
      ctx.font='900 42px system-ui';ctx.textAlign='center';ctx.fillStyle='#ffe16b';ctx.fillText('!',WATER.x,WATER.y-45);
    } else if(state.phase==='reel'){
      const duration=reducedMotion?300:900;
      const t=Math.min(1,elapsed/duration);
      const eased=1-Math.pow(1-t,3);
      const catchPoint=pointOnCast(1-eased,{x:player.x+35,y:player.y-30},WATER);
      drawLine(rodTip,catchPoint,{x:730,y:270},1);
      drawCatchIcon(state.result,catchPoint.x,catchPoint.y,.72+.45*eased,Math.min(1,t*2));
      drawTension(t,state.result?.rarity);
      if(t>=1)setPhase('caught',state.result);
    } else if(state.phase==='caught'){
      const duration=reducedMotion?280:650;
      const t=Math.min(1,elapsed/duration);
      const scale=1+Math.sin(t*Math.PI)*.42;
      drawCatchIcon(state.result,player.x+65,player.y-85,scale,1-t*.15);
      ctx.font='900 18px system-ui';ctx.textAlign='center';ctx.fillStyle=state.result?.descriptor?.color||'#fff4d8';ctx.fillText(state.result?.name||'神秘漁獲',player.x+65,player.y-132);
      if(t>=1)finish();
    }

    updateParticles();drawParticles();
  }

  function bindInput() {
    window.addEventListener('keydown', event => {
      const key=event.key?.length===1?event.key.toLowerCase():event.key;
      if(isDeckOpen()&&(key==='f'||key==='c'))startFishingMotion();
    },true);
    document.getElementById('coffeeBtn')?.addEventListener('pointerdown',()=>{if(isDeckOpen())startFishingMotion();},true);
  }

  function init() {
    addStyle();
    ensureCanvas();
    bindInput();
    setInterval(watchResults,90);
    window.addEventListener('resize',syncLayout);
    window.addEventListener('scroll',syncLayout,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(syncLayout,150));
    raf=requestAnimationFrame(drawFrame);
    window.COFFEE_SHIP_FISHING_MOTION={start:startFishingMotion,setPhase,finish};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();