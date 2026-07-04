(() => {
  'use strict';
  if (window.__COFFEE_SHIP_RARE_CANVAS_V2__) return;
  window.__COFFEE_SHIP_RARE_CANVAS_V2__ = true;

  const tiers = {
    '稀有':{label:'RARE CATCH',color:'#62c8ff',duration:1900,particles:22},
    '史詩':{label:'EPIC CATCH',color:'#c084fc',duration:2400,particles:30},
    '傳說':{label:'LEGENDARY',color:'#ffe16b',duration:3100,particles:40},
    '神話':{label:'MYTHIC CREATURE',color:'#ff6b8a',duration:3900,particles:48},
    '世界級':{label:'WORLD CLASS',color:'#9fffee',duration:5000,particles:58}
  };
  const selectors = ['#centralFishResultCard','#fishingCard','#fishingSpecialCard','#extraFish50Card','#sharkCard','#mutantCard'];
  const excludedIds = new Set(['lanarCard','arielCard','islandCard','blackbeardCard','madPriestCard','carnivalCard']);
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const mobile = window.matchMedia?.('(max-width:760px)')?.matches;

  let canvas = null;
  let ctx = null;
  let state = null;
  let particles = [];
  let seen = new Map();
  let raf = 0;

  function addStyle() {
    if (document.getElementById('fishingRareCanvasStyle')) return;
    const style = document.createElement('style');
    style.id = 'fishingRareCanvasStyle';
    style.textContent = `
      #fishingRareCanvas{position:fixed;inset:0;z-index:12000;width:100vw;height:100dvh;pointer-events:none}
      body.rare-catch-playing .central-fish-card,
      body.rare-catch-playing #fishingCard,
      body.rare-catch-playing #fishingSpecialCard,
      body.rare-catch-playing #extraFish50Card,
      body.rare-catch-playing #sharkCard,
      body.rare-catch-playing #mutantCard{z-index:14050!important;position:fixed!important;pointer-events:none!important}
    `;
    document.head.appendChild(style);
  }

  function ensureCanvas() {
    canvas=document.getElementById('fishingRareCanvas');
    if(!canvas){
      canvas=document.createElement('canvas');
      canvas.id='fishingRareCanvas';
      document.body.appendChild(canvas);
    }
    ctx=canvas.getContext('2d');
    resize();
  }

  function resize() {
    if(!canvas)return;
    const dpr=Math.min(window.devicePixelRatio||1,mobile?1.25:1.75);
    canvas.width=Math.max(1,Math.round(innerWidth*dpr));
    canvas.height=Math.max(1,Math.round(innerHeight*dpr));
    canvas.style.width=`${innerWidth}px`;
    canvas.style.height=`${innerHeight}px`;
    ctx?.setTransform(dpr,0,0,dpr,0,0);
  }

  function visible(card) {
    if(!card||card.classList.contains('hidden')||excludedIds.has(card.id))return false;
    const style=getComputedStyle(card);
    return style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity||1)>0;
  }

  function cleanTitle(element) {
    if(!element)return'';
    const clone=element.cloneNode(true);
    clone.querySelectorAll('.cs-species-icon,.unique-emoji').forEach(node=>node.remove());
    const raw=clone.textContent||'';
    return window.COFFEE_SHIP_ICON?.cleanEmoji?.(raw)||raw.replace(/^[^\p{L}\p{N}]+/u,'').trim();
  }

  function parseCard(card) {
    const text=card.textContent||'';
    let rarity=text.match(/稀有度：\s*(世界級|神話|傳說|史詩|稀有|常見|普通)/)?.[1]||'';
    if(card.id==='sharkCard'&&rarity==='傳說')rarity='神話';
    if(!rarity&&/鯊魚事件|雙頭巨齒鯊/.test(text))rarity='神話';
    if(!tiers[rarity])return null;
    const titleElement=card.querySelector('.central-fish-title,.mutant-name,.carnival-title')||card.firstElementChild;
    const name=cleanTitle(titleElement).replace(/^(RARE CATCH|EPIC CATCH|LEGENDARY|MYTHIC CREATURE|WORLD CLASS)\s*/i,'').trim().slice(0,64)||'神秘漁獲';
    const icon=window.COFFEE_SHIP_ICON?.iconDescriptor?.({name,rarity})||{base:'🐟',badge:'✦',color:tiers[rarity].color,hue:190};
    return {name,rarity,icon};
  }

  function spawnParticles(result) {
    const cfg=tiers[result.rarity];
    const count=reducedMotion?8:mobile?Math.min(30,cfg.particles):cfg.particles;
    particles=[];
    for(let i=0;i<count;i++){
      const angle=Math.random()*Math.PI*2;
      const speed=1.2+Math.random()*(result.rarity==='世界級'?5.8:4.2);
      particles.push({
        x:innerWidth/2+(Math.random()-.5)*50,
        y:innerHeight/2+(Math.random()-.5)*40,
        vx:Math.cos(angle)*speed,
        vy:Math.sin(angle)*speed-1,
        life:70+Math.random()*70,
        max:140,
        size:2+Math.random()*5,
        glyph:i%5===0?result.icon.badge:'',
        spin:(Math.random()-.5)*.08,
        rotation:Math.random()*Math.PI*2
      });
    }
  }

  function play(result) {
    const key=`${result.rarity}:${result.name}`;
    const now=Date.now();
    if((seen.get(key)||0)>now)return;
    seen.set(key,now+10000);
    if(!canvas)ensureCanvas();
    state={...result,started:performance.now(),duration:tiers[result.rarity].duration};
    spawnParticles(result);
    document.body.classList.add('rare-catch-playing');
  }

  function clear() {
    state=null;particles=[];
    document.body.classList.remove('rare-catch-playing');
    ctx?.clearRect(0,0,innerWidth,innerHeight);
  }

  function drawBackground(progress,result) {
    const cfg=tiers[result.rarity];
    const alpha=Math.min(.9,Math.sin(Math.min(1,progress)*Math.PI)*.78+.12);
    const gradient=ctx.createRadialGradient(innerWidth/2,innerHeight/2,20,innerWidth/2,innerHeight/2,Math.max(innerWidth,innerHeight)*.72);
    gradient.addColorStop(0,`${cfg.color}${result.rarity==='世界級'?'66':'44'}`);
    gradient.addColorStop(.45,'rgba(8,10,28,.72)');
    gradient.addColorStop(1,'rgba(0,0,0,.92)');
    ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=gradient;ctx.fillRect(0,0,innerWidth,innerHeight);ctx.restore();
  }

  function drawRings(elapsed,result) {
    const cfg=tiers[result.rarity];
    const count=result.rarity==='世界級'?4:3;
    ctx.save();ctx.strokeStyle=cfg.color;ctx.lineWidth=result.rarity==='世界級'?4:3;
    for(let i=0;i<count;i++){
      const cycle=((elapsed/1150)+i/count)%1;
      const radius=45+cycle*Math.min(innerWidth,innerHeight)*.43;
      ctx.globalAlpha=(1-cycle)*.72;
      ctx.beginPath();ctx.arc(innerWidth/2,innerHeight/2,radius,0,Math.PI*2);ctx.stroke();
    }
    ctx.restore();
  }

  function drawIcon(result,elapsed) {
    const pop=Math.min(1,elapsed/650);
    const overshoot=pop<.72?pop/0.72*1.14:1.14-(pop-.72)/.28*.14;
    const pulse=1+Math.sin(elapsed/150)*.04;
    const size=Math.min(170,Math.max(90,innerWidth*.14))*overshoot*pulse;
    const x=innerWidth/2,y=innerHeight/2+5;
    ctx.save();ctx.translate(x,y);
    ctx.shadowColor=result.icon.color;ctx.shadowBlur=result.rarity==='世界級'?60:35;
    ctx.fillStyle='rgba(12,16,37,.92)';ctx.strokeStyle=result.icon.color;ctx.lineWidth=5;
    ctx.beginPath();ctx.arc(0,0,size*.46,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.shadowBlur=0;ctx.font=`${size*.58}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(result.icon.base,0,2);
    const bx=size*.33,by=size*.32,br=size*.14;
    ctx.fillStyle='#151020';ctx.strokeStyle='#fff4d8';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(bx,by,br,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle=result.icon.color;ctx.font=`900 ${size*.15}px system-ui`;ctx.fillText(result.icon.badge,bx,by+1);
    ctx.restore();
  }

  function drawText(result,elapsed) {
    const cfg=tiers[result.rarity];
    const fade=Math.min(1,elapsed/420);
    ctx.save();ctx.globalAlpha=fade;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.shadowColor='#000';ctx.shadowBlur=8;ctx.fillStyle=cfg.color;
    ctx.font=`1000 ${Math.max(28,Math.min(72,innerWidth*.065))}px system-ui`;
    ctx.fillText(cfg.label,innerWidth/2,Math.max(80,innerHeight*.17));
    ctx.fillStyle='#fff4d8';ctx.font=`900 ${Math.max(17,Math.min(34,innerWidth*.036))}px system-ui`;
    const maxWidth=innerWidth*.88;
    ctx.fillText(result.name,innerWidth/2,innerHeight*.75,maxWidth);
    if(result.rarity==='世界級'){
      ctx.fillStyle='#9fffee';ctx.font='900 15px system-ui';ctx.fillText('全海域世界級發現',innerWidth/2,innerHeight*.82);
    }
    ctx.restore();
  }

  function drawParticles() {
    for(const p of particles){
      p.x+=p.vx;p.y+=p.vy;p.vy+=.025;p.vx*=.995;p.life--;p.rotation+=p.spin;
      const alpha=Math.max(0,p.life/p.max);
      ctx.save();ctx.globalAlpha=alpha;ctx.translate(p.x,p.y);ctx.rotate(p.rotation);
      if(p.glyph){ctx.fillStyle='#fff4d8';ctx.font=`900 ${12+p.size*2}px system-ui`;ctx.textAlign='center';ctx.fillText(p.glyph,0,0);}
      else{ctx.fillStyle=state?.icon?.color||'#fff';ctx.beginPath();ctx.arc(0,0,p.size,0,Math.PI*2);ctx.fill();}
      ctx.restore();
    }
    particles=particles.filter(p=>p.life>0);
  }

  function frame(now) {
    raf=requestAnimationFrame(frame);
    if(!ctx||!state)return;
    ctx.clearRect(0,0,innerWidth,innerHeight);
    const elapsed=now-state.started;
    const progress=Math.min(1,elapsed/state.duration);
    drawBackground(progress,state);
    if(!reducedMotion)drawRings(elapsed,state);
    drawParticles();
    drawIcon(state,elapsed);
    drawText(state,elapsed);
    if(progress>=1)clear();
  }

  function watch() {
    const now=Date.now();
    for(const [key,until] of seen)if(until<now)seen.delete(key);
    for(const selector of selectors){
      const card=document.querySelector(selector);
      if(!visible(card))continue;
      const result=parseCard(card);
      if(result)play(result);
      break;
    }
  }

  function init() {
    addStyle();ensureCanvas();
    window.addEventListener('resize',resize);
    setInterval(watch,110);
    raf=requestAnimationFrame(frame);
    window.COFFEE_SHIP_RARE_ANIMATION={play,clear};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();