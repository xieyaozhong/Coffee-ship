(() => {
  'use strict';
  if (window.__COFFEE_SHIP_EVENT_EFFECTS_V1__) return;
  window.__COFFEE_SHIP_EVENT_EFFECTS_V1__ = true;

  const CANVAS_ID = 'coffeeShipEventFxCanvas';
  const ROOT_IDS = [
    'oceanFriendsQte','salvageQteEvent','seaMerchantEvent','coralRouletteEvent','pirateGamblingEvent',
    'abyssAuctionEvent','mutantHuntEvent','centralFishResultCard','carnivalCard','madPriestCard','blackbeardCard',
    'islandCard','lanarCard','arielCard','mutationCard'
  ];
  const THEME_RULES = [
    {id:'mermaid',pattern:/美人魚|人魚|愛麗兒|歌詞|siren/i,hue:188,hue2:324,motif:'bubbles',motion:'rise',shape:'ring'},
    {id:'shark',pattern:/鯊|巨齒|megalodon/i,hue:205,hue2:350,motif:'shards',motion:'drift',shape:'shard'},
    {id:'mutant',pattern:/變異|突變|腐化|百眼|克蘇魯|毒刺/i,hue:326,hue2:166,motif:'spores',motion:'spiral',shape:'cross'},
    {id:'bottle',pattern:/漂流瓶|瓶中信|殘頁|藏寶圖|海龜湯|航海日誌/i,hue:42,hue2:184,motif:'motes',motion:'rise',shape:'square'},
    {id:'merchant',pattern:/商人|商船|交易|貨箱/i,hue:28,hue2:161,motif:'coins',motion:'orbit',shape:'ring'},
    {id:'auction',pattern:/拍賣|競標|得標|槌旗/i,hue:42,hue2:4,motif:'coins',motion:'rain',shape:'diamond'},
    {id:'pirate',pattern:/海盜|黑帆|賭局|骰|骷髏/i,hue:356,hue2:34,motif:'embers',motion:'burst',shape:'shard'},
    {id:'coral',pattern:/珊瑚|虹礁|輪盤/i,hue:337,hue2:172,motif:'petals',motion:'orbit',shape:'diamond'},
    {id:'friends',pattern:/海豚|海龜|海象|海洋朋友|企鵝|海豹/i,hue:180,hue2:207,motif:'bubbles',motion:'rise',shape:'ring'},
    {id:'salvage',pattern:/打撈|收線|沉船|遺物|殘骸/i,hue:31,hue2:204,motif:'sparks',motion:'wave',shape:'line'},
    {id:'storm',pattern:/風暴|雷|暴雨|雨|閃電|磁暴|巨浪|酸性海雨/i,hue:219,hue2:54,motif:'rain',motion:'rain',shape:'line'},
    {id:'ghost',pattern:/幽靈|亡者|詛咒|黑霧|鬼|無人敲響/i,hue:264,hue2:174,motif:'mist',motion:'drift',shape:'ring'},
    {id:'abyss',pattern:/深淵|黑洞|利維坦|海怪|虛空|赤紅月/i,hue:277,hue2:331,motif:'runes',motion:'spiral',shape:'cross'},
    {id:'carnival',pattern:/狂歡|祭典|花園|抽獎|氣球/i,hue:316,hue2:51,motif:'confetti',motion:'burst',shape:'square'},
    {id:'positive',pattern:/獲得|祝福|幸運|珍珠雨|幫忙|修理|小費|日出|好運|星星/i,hue:149,hue2:45,motif:'stars',motion:'rise',shape:'star'},
    {id:'negative',pattern:/損失|失敗|斷裂|腐|油污|暈船|恐慌|鼠群|厄運|反噬|逃走|麻痺/i,hue:4,hue2:279,motif:'ashes',motion:'rain',shape:'shard'},
    {id:'risk',pattern:/賭|雙倍|交換|契約|收費|挑戰|開箱/i,hue:31,hue2:349,motif:'coins',motion:'orbit',shape:'diamond'},
    {id:'strange',pattern:/奇異|倒著|第二個月亮|自己演奏|影子|看不見|明日|夢話|自動販賣機/i,hue:278,hue2:185,motif:'runes',motion:'drift',shape:'cross'}
  ];
  const MOTIFS = ['tide','bubbles','shards','spores','motes','coins','embers','petals','sparks','rain','mist','runes','confetti','stars','ashes'];
  const MOTIONS = ['drift','rise','orbit','rain','burst','wave','spiral'];
  const SHAPES = ['dot','square','diamond','line','ring','star','cross','shard'];

  let canvas = null;
  let context = null;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationFrame = 0;
  let lastFrame = 0;
  let spawnCarry = 0;
  let spawnSequence = 0;
  let activeRoot = null;
  let activeProfile = null;
  let particles = [];
  let bursts = [];
  let syncQueued = false;
  let observer = null;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)') || {matches:false,addEventListener() {}};

  function hashOf(value) {
    let hash = 2166136261;
    for (const character of String(value || 'event')) {
      hash ^= character.codePointAt(0);
      hash = Math.imul(hash,16777619);
    }
    return hash >>> 0;
  }

  function normalizeKey(value) {
    return String(value || '未知事件')
      .replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u,'')
      .normalize('NFC').replace(/\s+/g,' ').trim() || '未知事件';
  }

  function normalizeDetail(value) {
    const detail = String(value || '').split('\n')[0].trim();
    if (!detail) return '';
    return normalizeKey(detail)
      .replace(/[0-9０-９,.]+\s*(?:%|kg|珍珠|秒|竿|件)?/g,'#')
      .slice(0,96);
  }

  function themeFor(input = {}) {
    const title = typeof input === 'string' ? input : `${input.id || ''} ${input.eventKind || ''} ${input.tone || ''} ${input.title || input.name || ''}`;
    const toneThemes = new Set(['positive','negative','risk','strange','storm']);
    const semantic = THEME_RULES.find(rule => !toneThemes.has(rule.id) && rule.pattern.test(title));
    if (semantic) return semantic;
    if (input.tone) {
      const tone = THEME_RULES.find(rule => rule.id === input.tone);
      if (tone) return tone;
    }
    return THEME_RULES.find(rule => rule.pattern.test(title)) || null;
  }

  function hsl(hue,saturation,lightness,alpha = 1) {
    return alpha === 1 ? `hsl(${Math.round(hue)} ${saturation}% ${lightness}%)` : `hsl(${Math.round(hue)} ${saturation}% ${lightness}% / ${alpha})`;
  }

  function profile(input = {}) {
    const object = typeof input === 'string' ? {title:input} : input;
    const title = normalizeKey(object.title || object.name || object.id || '未知事件');
    const id = normalizeKey(object.id || object.eventId || object.eventKind || title);
    const generic = /^(特殊事件|海上事件|事件|獨立事件|交易完成|捕獵結果|持續效果生效)$/;
    const detail = generic.test(title) ? normalizeDetail(object.text || object.detail || '') : '';
    const key = `${id}|${title}${detail ? `|${detail}` : ''}`;
    const hash = hashOf(key);
    const theme = themeFor({...object,title});
    const baseHue = theme?.hue ?? hash % 360;
    const secondBase = theme?.hue2 ?? (baseHue + 84 + ((hash >>> 11) % 84)) % 360;
    const hue = (baseHue + ((hash >>> 3) % 29) - 14 + 360) % 360;
    const hue2 = (secondBase + ((hash >>> 9) % 31) - 15 + 360) % 360;
    const motif = theme?.motif || MOTIFS[(hash >>> 5) % MOTIFS.length];
    const motion = theme?.motion || MOTIONS[(hash >>> 12) % MOTIONS.length];
    const shape = theme?.shape || SHAPES[(hash >>> 18) % SHAPES.length];
    return {
      key,
      id,
      title,
      hash,
      signature:hash.toString(16).padStart(8,'0'),
      theme:theme?.id || 'unique',
      motif,
      motion,
      shape,
      hue,
      hue2,
      color:hsl(hue,78,64),
      color2:hsl(hue2,82,69),
      deep:hsl(hue,52,13),
      glow:hsl(hue,92,67,.42),
      wash:hsl(hue2,70,40,.13),
      density:12 + ((hash >>> 2) % 17),
      speed:.58 + ((hash >>> 8) % 90) / 100,
      size:2 + ((hash >>> 16) % 5),
      angle:(hash >>> 20) % 360,
      phase:(hash >>> 7) % 628 / 100
    };
  }

  function ensureCanvas() {
    if (canvas?.isConnected && context) return canvas;
    canvas = document.getElementById(CANVAS_ID) || document.createElement('canvas');
    canvas.id = CANVAS_ID;
    canvas.setAttribute('aria-hidden','true');
    if (!canvas.isConnected) document.body.appendChild(canvas);
    context = canvas.getContext('2d');
    resize();
    return canvas;
  }

  function resize() {
    if (!canvas || !context) return;
    dpr = Math.min(1.5,Math.max(1,Number(window.devicePixelRatio || 1)));
    width = Math.max(1,window.innerWidth || document.documentElement.clientWidth || 1);
    height = Math.max(1,window.innerHeight || document.documentElement.clientHeight || 1);
    canvas.width = Math.round(width*dpr);
    canvas.height = Math.round(height*dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr,0,0,dpr,0,0);
  }

  function styleProfile(element,fx) {
    if (!element || !fx) return;
    const changed = element.dataset.eventFxKey !== fx.key;
    element.dataset.eventFxKey = fx.key;
    element.dataset.eventFxTheme = fx.theme;
    element.dataset.eventFxMotif = fx.motif;
    element.dataset.eventFxMotion = fx.motion;
    element.classList.add('cs-event-fx-surface');
    element.style.setProperty('--event-fx-color',fx.color);
    element.style.setProperty('--event-fx-color-2',fx.color2);
    element.style.setProperty('--event-fx-deep',fx.deep);
    element.style.setProperty('--event-fx-glow',fx.glow);
    element.style.setProperty('--event-fx-wash',fx.wash);
    element.style.setProperty('--event-fx-angle',`${fx.angle}deg`);
    element.style.setProperty('--event-fx-speed',`${(1.35/fx.speed).toFixed(2)}s`);
    if (changed) {
      element.classList.remove('cs-event-fx-enter');
      void element.offsetWidth;
      element.classList.add('cs-event-fx-enter');
      window.setTimeout(() => element.classList.remove('cs-event-fx-enter'),820);
    }
  }

  function titleFrom(root) {
    const preferred = root.querySelector('.central-fish-title,.carnival-title,.mad-priest-title,.blackbeard-title,.island-title,.pg-feature h3,.ofq-title h3,.sq-title h3,.sm-head h3,.cr-head h3,.aa-head h3,.mh-title h3,h3,h4,strong');
    return normalizeKey(preferred?.textContent || root.getAttribute('aria-label') || root.id || '未知事件');
  }

  function rootProfile(root) {
    const title = titleFrom(root);
    return profile({id:root.id || root.className || title,title,eventKind:root.dataset.eventKind || ''});
  }

  function isVisible(element) {
    if (!element?.isConnected || element.hidden || element.classList.contains('hidden') || element.getAttribute('aria-hidden') === 'true') return false;
    const style = window.getComputedStyle?.(element);
    return !style || (style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) !== 0);
  }

  function decorateHistory(root = document) {
    root.querySelectorAll?.('.fh-card:not(.is-primary)').forEach(card => {
      const title = normalizeKey(card.querySelector('.fh-card-head strong')?.textContent || '特殊事件');
      const eventKind = normalizeKey(card.querySelector('.fh-event-label')?.textContent || 'special');
      const fx = profile({id:card.dataset.eventId || eventKind,title,eventKind:card.dataset.eventKind || eventKind,tone:card.dataset.eventTone || ''});
      card.classList.add('cs-event-history-fx');
      card.dataset.eventFxKey = fx.key;
      card.dataset.eventFxMotif = fx.motif;
      card.dataset.eventFxTheme = fx.theme;
      card.style.setProperty('--event-fx-color',fx.color);
      card.style.setProperty('--event-fx-color-2',fx.color2);
      card.style.setProperty('--event-fx-glow',fx.glow);
      card.style.setProperty('--event-fx-angle',`${fx.angle}deg`);
    });
  }

  function seeded(fx,salt = 0) {
    let value = (fx.hash ^ Math.imul(++spawnSequence + salt,2654435761)) >>> 0;
    return () => {
      value += 0x6D2B79F5;
      let result = value;
      result = Math.imul(result ^ result >>> 15,result | 1);
      result ^= result + Math.imul(result ^ result >>> 7,result | 61);
      return ((result ^ result >>> 14) >>> 0) / 4294967296;
    };
  }

  function makeParticle(fx,origin = null,forceBurst = false) {
    const random = seeded(fx,particles.length);
    const centerX = origin?.x ?? width*.5;
    const centerY = origin?.y ?? height*.5;
    const motion = forceBurst ? 'burst' : fx.motion;
    const particle = {
      fx,
      x:centerX,
      y:centerY,
      vx:0,
      vy:0,
      life:0,
      max:1050 + random()*2100,
      size:Math.max(1,fx.size*(.55 + random()*.9)),
      rotation:random()*Math.PI*2,
      spin:(random()-.5)*2.4,
      alpha:.34 + random()*.5,
      phase:random()*Math.PI*2,
      radius:35 + random()*Math.min(width,height)*.42,
      color:random()>.48 ? fx.color : fx.color2
    };
    const speed = 22 + 58*fx.speed;
    if (motion === 'rain') {
      particle.x = random()*width; particle.y = -18-random()*height*.18; particle.vx = (random()-.5)*12; particle.vy = speed*(.8+random());
    } else if (motion === 'rise') {
      particle.x = random()*width; particle.y = height+18+random()*40; particle.vx = (random()-.5)*18; particle.vy = -speed*(.45+random()*.65);
    } else if (motion === 'drift') {
      const left = random()>.5; particle.x = left ? -20 : width+20; particle.y = random()*height; particle.vx = (left?1:-1)*speed*(.35+random()*.55); particle.vy = (random()-.5)*18;
    } else if (motion === 'wave') {
      particle.x = random()*width; particle.y = height*(.2+random()*.75); particle.vx = speed*(.25+random()*.5); particle.vy = (random()-.5)*12;
    } else if (motion === 'orbit' || motion === 'spiral') {
      particle.phase = random()*Math.PI*2; particle.x = centerX+Math.cos(particle.phase)*particle.radius; particle.y = centerY+Math.sin(particle.phase)*particle.radius*.55;
      particle.vx = motion === 'spiral' ? (random()-.5)*8 : 0; particle.vy = motion === 'spiral' ? (random()-.5)*8 : 0;
    } else {
      const angle = random()*Math.PI*2; const velocity = speed*(.45+random()*1.1); particle.x = centerX; particle.y = centerY; particle.vx = Math.cos(angle)*velocity; particle.vy = Math.sin(angle)*velocity;
    }
    return particle;
  }

  function spawn(fx,count,origin = null,forceBurst = false) {
    const limit = width < 760 ? 34 : 56;
    for (let index=0; index<count && particles.length<limit; index += 1) particles.push(makeParticle(fx,origin,forceBurst));
  }

  function drawShape(particle,progress) {
    const fx = particle.fx;
    const alpha = Math.sin(Math.min(1,progress)*Math.PI)*particle.alpha;
    const size = particle.size;
    context.save();
    context.globalAlpha = Math.max(0,alpha);
    context.translate(particle.x,particle.y);
    context.rotate(particle.rotation);
    context.fillStyle = particle.color;
    context.strokeStyle = particle.color;
    context.lineWidth = Math.max(1,size*.32);
    const shape = fx.shape;
    if (shape === 'ring') {
      context.beginPath(); context.arc(0,0,size*1.05,0,Math.PI*2); context.stroke();
    } else if (shape === 'line') {
      context.beginPath(); context.moveTo(0,-size*1.8); context.lineTo(0,size*1.8); context.stroke();
    } else if (shape === 'diamond') {
      context.rotate(Math.PI/4); context.fillRect(-size*.7,-size*.7,size*1.4,size*1.4);
    } else if (shape === 'star') {
      context.beginPath(); context.moveTo(0,-size*1.5); context.lineTo(size*.4,-size*.35); context.lineTo(size*1.5,0); context.lineTo(size*.4,size*.35); context.lineTo(0,size*1.5); context.lineTo(-size*.4,size*.35); context.lineTo(-size*1.5,0); context.lineTo(-size*.4,-size*.35); context.closePath(); context.fill();
    } else if (shape === 'cross') {
      context.fillRect(-size*.3,-size*1.25,size*.6,size*2.5); context.fillRect(-size*1.25,-size*.3,size*2.5,size*.6);
    } else if (shape === 'shard') {
      context.beginPath(); context.moveTo(0,-size*1.6); context.lineTo(size*.75,size); context.lineTo(-size*.55,size*.45); context.closePath(); context.fill();
    } else if (shape === 'square') {
      context.fillRect(-size*.7,-size*.7,size*1.4,size*1.4);
    } else {
      context.beginPath(); context.arc(0,0,size*.72,0,Math.PI*2); context.fill();
    }
    context.restore();
  }

  function updateParticle(particle,delta,now) {
    particle.life += delta;
    const seconds = delta/1000;
    particle.rotation += particle.spin*seconds;
    if (particle.fx.motion === 'orbit' || particle.fx.motion === 'spiral') {
      const direction = (particle.fx.hash & 1) ? 1 : -1;
      particle.phase += direction*seconds*(.4+.55*particle.fx.speed);
      if (particle.fx.motion === 'spiral') particle.radius = Math.max(4,particle.radius-seconds*8);
      particle.x = width*.5+Math.cos(particle.phase)*particle.radius;
      particle.y = height*.5+Math.sin(particle.phase)*particle.radius*.55;
    } else {
      particle.x += particle.vx*seconds;
      particle.y += particle.vy*seconds;
      if (particle.fx.motion === 'wave') particle.y += Math.sin(now/260+particle.phase)*.7;
    }
    return particle.life < particle.max && particle.x > -80 && particle.x < width+80 && particle.y > -90 && particle.y < height+90;
  }

  function drawWash(fx,now) {
    if (!fx) return;
    const pulse = reducedMotion.matches ? 1 : .7+.3*Math.sin(now/900+fx.phase);
    const gradient = context.createRadialGradient(width*.5,height*.5,Math.min(width,height)*.12,width*.5,height*.5,Math.max(width,height)*.72);
    gradient.addColorStop(0,'transparent');
    gradient.addColorStop(1,hsl(fx.hue2,65,20,.08*pulse));
    context.fillStyle = gradient;
    context.fillRect(0,0,width,height);
  }

  function frame(now) {
    animationFrame = requestAnimationFrame(frame);
    if (document.hidden || now-lastFrame<32) return;
    const delta = Math.min(48,lastFrame ? now-lastFrame : 33);
    lastFrame = now;
    const continuous = activeRoot && isVisible(activeRoot) ? activeProfile : null;
    bursts = bursts.filter(item => item.until>now);
    if (continuous && !reducedMotion.matches) {
      spawnCarry += delta*continuous.density/1000;
      const count = Math.floor(spawnCarry);
      if (count>0) { spawn(continuous,count); spawnCarry -= count; }
    }
    context.clearRect(0,0,width,height);
    drawWash(continuous || bursts.at(-1)?.fx || null,now);
    particles = particles.filter(particle => {
      const alive = updateParticle(particle,delta,now);
      if (alive) drawShape(particle,particle.life/particle.max);
      return alive;
    });
    if (!continuous && !bursts.length && !particles.length) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      canvas?.classList.remove('is-active');
      document.body.classList.remove('cs-event-fx-live');
    }
  }

  function ensureLoop() {
    ensureCanvas();
    canvas.classList.add('is-active');
    document.body.classList.add('cs-event-fx-live');
    if (!animationFrame) { lastFrame = 0; animationFrame = requestAnimationFrame(frame); }
  }

  function burst(input = {},options = {}) {
    const fx = input.key ? input : profile(input);
    ensureCanvas();
    const origin = {x:Number(options.x ?? width*.5),y:Number(options.y ?? height*.46)};
    const count = reducedMotion.matches ? 0 : Math.min(24,10+Math.round(fx.density*.38));
    if (count) spawn(fx,count,origin,true);
    bursts.push({fx,until:performance.now()+(reducedMotion.matches?520:1450)});
    ensureLoop();
    return fx;
  }

  function activate(input,root = null) {
    const fx = input?.key ? input : profile(input);
    if (root) styleProfile(root,fx);
    const changed = activeProfile?.key !== fx.key || activeRoot !== root;
    activeRoot = root;
    activeProfile = fx;
    if (changed) burst(fx);
    else ensureLoop();
    return fx;
  }

  function stop() {
    activeRoot = null;
    activeProfile = null;
    spawnCarry = 0;
  }

  function sync() {
    syncQueued = false;
    decorateHistory();
    const visibleRoots = ROOT_IDS.map(id => document.getElementById(id)).filter(isVisible);
    const root = visibleRoots.find(element => /Qte|Event$/.test(element.id)) || visibleRoots.at(-1) || null;
    visibleRoots.forEach(element => styleProfile(element,rootProfile(element)));
    if (root) activate(rootProfile(root),root);
    else stop();
  }

  function queueSync() {
    if (syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(sync);
  }

  function dispatchEventFx(options = {}) {
    const fx = burst({id:options.eventId || options.id || options.eventKind || 'event',title:options.title || '特殊事件',eventKind:options.eventKind || '',tone:options.tone || ''});
    window.dispatchEvent(new CustomEvent('coffee-ship:event-triggered',{detail:{schema:1,key:fx.key,title:fx.title,theme:fx.theme,motif:fx.motif,motion:fx.motion,signature:fx.signature,at:Date.now()}}));
  }

  function patchFishingApi() {
    const api = window.COFFEE_SHIP_FISHING_API;
    if (!api?.pushEvent || api.__eventFxV1) return false;
    const original = api.pushEvent.bind(api);
    api.pushEvent = options => {
      const result = original(options);
      dispatchEventFx(options || {});
      queueSync();
      return result;
    };
    api.__eventFxV1 = true;
    return true;
  }

  function addStyle() {
    if (document.getElementById('coffeeShipEventFxStyle')) return;
    const style = document.createElement('style');
    style.id = 'coffeeShipEventFxStyle';
    style.textContent = `
      #${CANVAS_ID}{position:fixed;inset:0;z-index:49100;display:none;width:100%;height:100%;pointer-events:none!important;user-select:none;mix-blend-mode:screen;opacity:.92}
      #${CANVAS_ID}.is-active{display:block}
      .cs-event-fx-surface{--event-fx-color:#79d0b1;--event-fx-color-2:#9ce8f0;--event-fx-glow:rgba(121,208,177,.35);--event-fx-wash:rgba(20,80,70,.12);isolation:isolate}
      .cs-event-fx-surface>:first-child{filter:drop-shadow(0 0 18px var(--event-fx-glow));transition:filter .24s ease}
      .cs-event-fx-surface[data-event-fx-motif="rain"]>:first-child,.cs-event-fx-surface[data-event-fx-motif="shards"]>:first-child{filter:drop-shadow(0 0 15px var(--event-fx-glow)) saturate(1.08)}
      .cs-event-fx-surface[data-event-fx-motif="bubbles"]>:first-child,.cs-event-fx-surface[data-event-fx-motif="stars"]>:first-child{filter:drop-shadow(0 0 24px var(--event-fx-glow)) brightness(1.025)}
      .cs-event-fx-enter>:first-child{animation:csEventFxEnter .78s cubic-bezier(.2,.9,.25,1) both}
      .cs-event-fx-surface[data-event-fx-motion="rain"].cs-event-fx-enter>:first-child{animation-name:csEventFxRainEnter}
      .cs-event-fx-surface[data-event-fx-motion="spiral"].cs-event-fx-enter>:first-child{animation-name:csEventFxSpiralEnter}
      .cs-event-fx-surface[data-event-fx-motion="burst"].cs-event-fx-enter>:first-child{animation-name:csEventFxBurstEnter}
      .cs-event-history-fx{position:relative;overflow:hidden!important;border-color:color-mix(in srgb,var(--event-fx-color) 68%,#76536a 32%)!important;box-shadow:0 7px 0 rgba(0,0,0,.22),0 0 18px color-mix(in srgb,var(--event-fx-color) 24%,transparent),inset 0 0 24px color-mix(in srgb,var(--event-fx-color-2) 7%,transparent)!important}
      .cs-event-history-fx::before{content:'';position:absolute;inset:-35%;z-index:0;pointer-events:none;opacity:.16;transform:rotate(var(--event-fx-angle));background:repeating-linear-gradient(90deg,transparent 0 13px,var(--event-fx-color) 14px 15px,transparent 16px 27px);animation:csEventPattern 9s linear infinite}
      .cs-event-history-fx[data-event-fx-motif="bubbles"]::before{background:radial-gradient(circle at 20% 30%,var(--event-fx-color) 0 2px,transparent 3px),radial-gradient(circle at 70% 65%,var(--event-fx-color-2) 0 3px,transparent 4px);background-size:42px 42px,58px 58px}
      .cs-event-history-fx[data-event-fx-motif="stars"]::before,.cs-event-history-fx[data-event-fx-motif="confetti"]::before{background:radial-gradient(circle,var(--event-fx-color) 0 1px,transparent 2px);background-size:17px 17px}
      .cs-event-history-fx[data-event-fx-motif="runes"]::before{background:repeating-conic-gradient(from 45deg,var(--event-fx-color) 0 5deg,transparent 5deg 28deg);background-size:38px 38px}
      .cs-event-history-fx[data-event-fx-motif="coins"]::before{background:radial-gradient(circle,transparent 0 5px,var(--event-fx-color) 6px 7px,transparent 8px);background-size:35px 35px}
      .cs-event-history-fx .fh-card-head,.cs-event-history-fx>small,.cs-event-history-fx .fh-time{position:relative;z-index:1}
      @keyframes csEventFxEnter{0%{opacity:.25;transform:translateY(14px) scale(.975);filter:drop-shadow(0 0 0 transparent)}55%{opacity:1;transform:translateY(-2px) scale(1.006)}100%{transform:none}}
      @keyframes csEventFxRainEnter{0%{opacity:.2;transform:translateY(-16px);filter:blur(2px)}100%{opacity:1;transform:none}}
      @keyframes csEventFxSpiralEnter{0%{opacity:.15;transform:scale(.92) rotate(-1.5deg)}70%{transform:scale(1.012) rotate(.3deg)}100%{opacity:1;transform:none}}
      @keyframes csEventFxBurstEnter{0%{opacity:.25;transform:scale(.88)}58%{opacity:1;transform:scale(1.025)}100%{transform:none}}
      @keyframes csEventPattern{to{transform:rotate(var(--event-fx-angle)) translate3d(42px,0,0)}}
      @media(prefers-reduced-motion:reduce){#${CANVAS_ID}{opacity:.48}.cs-event-fx-enter>:first-child,.cs-event-history-fx::before{animation:none!important}.cs-event-fx-surface>:first-child{transition:none}}
    `;
    document.head.appendChild(style);
  }

  function init() {
    addStyle();
    ensureCanvas();
    patchFishingApi();
    window.addEventListener('coffee-ship:fishing-api-ready',() => { patchFishingApi(); queueSync(); });
    window.addEventListener('coffee-ship:fishing-extras-ready',queueSync);
    window.addEventListener('coffee-ship:scene',event => { if (event.detail?.scene !== 'deck') stop(); queueSync(); });
    window.addEventListener('resize',resize,{passive:true});
    document.addEventListener('visibilitychange',() => { if (!document.hidden) { resize(); queueSync(); } });
    reducedMotion.addEventListener?.('change',() => { particles = []; queueSync(); });
    observer = new MutationObserver(records => {
      let relevant = false;
      for (const record of records) {
        if (record.type === 'attributes') {
          if (record.target.id && ROOT_IDS.includes(record.target.id)) relevant = true;
        } else if (record.addedNodes.length || record.removedNodes.length) relevant = true;
        if (relevant) break;
      }
      if (relevant) queueSync();
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','aria-hidden']});
    queueSync();
  }

  window.COFFEE_SHIP_EVENT_FX = {version:1,profile,themeFor,hashOf,activate,burst,stop,decorate:decorateHistory,sync,patchFishingApi,getActive:() => activeProfile};

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
