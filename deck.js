(() => {
  'use strict';

  const W = 960;
  const H = 576;
  const DOOR = { x:118, y:398, radius:72 };
  const FISHING_SPOT = { x:820, y:410 };
  const keys = new Set();
  const animalOptions = {
    human:{emoji:'🙂',body:'#c96a4a',face:'#f0c7a0',accent:'#2b1d16'},
    cat:{emoji:'🐱',body:'#fffdf4',face:'#fffdf4',accent:'#df6d13'},
    dog:{emoji:'🐶',body:'#c08a55',face:'#e3b47c',accent:'#5b3928'},
    rabbit:{emoji:'🐰',body:'#f4efe4',face:'#fff8ef',accent:'#e9a6b0'},
    fox:{emoji:'🦊',body:'#df6d13',face:'#fff0d7',accent:'#2f1b16'},
    bear:{emoji:'🐻',body:'#8a5a3c',face:'#c89162',accent:'#3b241c'},
    penguin:{emoji:'🐧',body:'#1f2430',face:'#f7f3e8',accent:'#e8a23c'},
    pig:{emoji:'🐷',body:'#f4a8bb',face:'#ffc4d0',accent:'#d96f8d'}
  };

  let scene = 'cafe';
  let overlay = null;
  let ctx = null;
  let gameCanvas = null;
  let deckPlayer = { x:155, y:400, speed:2.4, emote:null, emoteTimer:0, dir:'right' };
  let wave = 0;
  let fade = 0;
  let shootingStars = [];
  let appearanceCache = null;
  let appearanceSignature = '';

  function parseJson(raw, fallback) {
    try { return raw ? JSON.parse(raw) : fallback; }
    catch (error) { return fallback; }
  }

  function getAppearance(force=false) {
    const avatarRaw = localStorage.getItem('coffeeShipAvatar') || '';
    const roleRaw = localStorage.getItem('coffeeShipRole') || '';
    const animalRaw = localStorage.getItem('coffeeShipAnimal') || '';
    const signature = `${avatarRaw}|${roleRaw}|${animalRaw}`;
    if (!force && appearanceCache && signature === appearanceSignature) return appearanceCache;

    const avatar = parseJson(avatarRaw, {}) || {};
    const role = parseJson(roleRaw, null);
    const animal = avatar.animal || animalRaw || 'human';
    appearanceSignature = signature;
    appearanceCache = {
      name:role?.name || avatar.name || 'Guest',
      role:role?.role || '',
      roleIcon:role?.icon || '',
      animal,
      hair:avatar.hair || '#2b1d16',
      shirt:avatar.shirt || '#c96a4a',
      skin:avatar.skin || '#f0c7a0',
      coffeeType:avatar.coffeeType || '美式'
    };
    return appearanceCache;
  }

  function addStyle() {
    let style = document.getElementById('deckSceneStyle');
    if (!style) {
      style = document.createElement('style');
      style.id = 'deckSceneStyle';
      document.head.appendChild(style);
    }
    style.textContent = `
      .deck-overlay {
        position:absolute;
        z-index:9;
        display:block;
        pointer-events:none;
        image-rendering:pixelated;
        border-radius:18px;
        border:3px solid #76536a;
        background:#08111f;
      }
      .deck-overlay.hidden{display:none}
      .deck-tip{
        position:absolute;
        left:50%;
        transform:translateX(-50%);
        z-index:30;
        max-width:min(86%,620px);
        color:#fff4d8;
        background:rgba(12,16,37,.94);
        border:2px solid #79d0b1;
        border-radius:12px;
        padding:8px 13px;
        font-weight:900;
        text-align:center;
        pointer-events:none;
        box-shadow:0 6px 0 rgba(0,0,0,.28)
      }
      .deck-tip.hidden{display:none}
      #deckMobileReturnBtn{display:none!important}
      @media(max-width:760px){
        .deck-overlay{border-radius:15px}
        .deck-tip{font-size:13px;padding:6px 10px;max-width:calc(100% - 28px)}
      }
    `;
  }

  function removeLegacyReturnButton() {
    document.getElementById('deckMobileReturnBtn')?.remove();
  }

  function makeOverlay() {
    const panel = document.getElementById('gamePanel');
    gameCanvas = document.getElementById('game');
    if (!panel || !gameCanvas) return;
    if (getComputedStyle(panel).position === 'static') panel.style.position = 'relative';

    overlay = document.getElementById('deckOverlay');
    if (!overlay) {
      overlay = document.createElement('canvas');
      overlay.id = 'deckOverlay';
      overlay.className = 'deck-overlay hidden';
      overlay.width = W;
      overlay.height = H;
      panel.appendChild(overlay);
    }
    ctx = overlay.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let tip = document.getElementById('deckTip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'deckTip';
      tip.className = 'deck-tip hidden';
      panel.appendChild(tip);
    }

    removeLegacyReturnButton();
    syncOverlayLayout();
  }

  function syncOverlayLayout() {
    const panel = document.getElementById('gamePanel');
    if (!panel || !gameCanvas || !overlay) return;
    overlay.style.left = `${gameCanvas.offsetLeft}px`;
    overlay.style.top = `${gameCanvas.offsetTop}px`;
    overlay.style.width = `${gameCanvas.offsetWidth}px`;
    overlay.style.height = `${gameCanvas.offsetHeight}px`;
    const tip = document.getElementById('deckTip');
    if (tip) tip.style.top = `${Math.max(8, gameCanvas.offsetTop + 10)}px`;
  }

  function setTip(text, show=true) {
    const tip = document.getElementById('deckTip');
    if (!tip) return;
    tip.textContent = text;
    tip.classList.toggle('hidden', !show);
  }

  function updateSceneState(nextScene) {
    window.COFFEE_SHIP_SCENE = nextScene;
    document.body.dataset.coffeeShipScene = nextScene;
    const badge = document.getElementById('sceneStatusBadge');
    if (badge) badge.textContent = nextScene === 'deck' ? '🌊 Deck' : '☕ Cafe';
    updateControlLabels();
  }

  function updateControlLabels() {
    const coffee = document.getElementById('coffeeBtn');
    const action = document.getElementById('sitBtn');
    const message = document.getElementById('messageBtn');
    const emote = document.getElementById('emoteBtn');
    if (scene === 'deck') {
      if (coffee) { coffee.title='釣魚'; coffee.setAttribute('aria-label','釣魚'); }
      if (action) { action.title='互動／進入咖啡廳'; action.setAttribute('aria-label','互動或進入咖啡廳'); }
      if (message) message.setAttribute('aria-hidden','true');
      if (emote) emote.title='表情';
    } else {
      if (coffee) { coffee.title='點咖啡'; coffee.setAttribute('aria-label','點咖啡'); }
      if (action) { action.title='互動／摸貓／坐下'; action.setAttribute('aria-label','互動、摸貓或坐下'); }
      if (message) message.removeAttribute('aria-hidden');
    }
  }

  function playerPos() {
    return window.COFFEE_SHIP_PLAYER_POS || {x:480,y:360};
  }

  function nearCafeDoor() {
    const p = playerPos();
    return Math.hypot(p.x - 835, p.y - 300) < 110;
  }

  function nearDeckDoor() {
    return Math.hypot(deckPlayer.x - DOOR.x, deckPlayer.y - DOOR.y) < DOOR.radius;
  }

  function switchToDeck() {
    if (!overlay) makeOverlay();
    if (!overlay) return;
    scene = 'deck';
    keys.clear();
    getAppearance(true);
    deckPlayer.x = 165;
    deckPlayer.y = 400;
    deckPlayer.dir = 'right';
    fade = 1;
    overlay.classList.remove('hidden');
    syncOverlayLayout();
    updateSceneState('deck');
    setTip('🌊 甲板｜左側艙門可回咖啡廳，右側海面可釣魚', true);
    setTimeout(() => { if (scene === 'deck' && !nearDeckDoor()) setTip('', false); }, 3600);
  }

  function switchToCafe() {
    scene = 'cafe';
    keys.clear();
    overlay?.classList.add('hidden');
    setTip('', false);
    updateSceneState('cafe');
  }

  function handleAction() {
    if (scene !== 'deck') return false;
    if (nearDeckDoor()) {
      switchToCafe();
      return true;
    }
    if (Math.hypot(deckPlayer.x - FISHING_SPOT.x, deckPlayer.y - FISHING_SPOT.y) < 105) {
      setTip('🎣 按釣魚按鈕開始垂釣', true);
      setTimeout(() => { if (scene === 'deck') setTip('', false); }, 1800);
      return true;
    }
    setTip('靠近左側艙門可回咖啡廳；右側是釣魚區。', true);
    setTimeout(() => { if (scene === 'deck') setTip('', false); }, 1800);
    return true;
  }

  function px(x,y,w,h,color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x),Math.round(y),w,h);
  }

  function text(value,x,y,size=16,color='#fff4d8',align='center') {
    ctx.font = `900 ${size}px ui-rounded,system-ui,sans-serif`;
    ctx.textAlign = align;
    ctx.fillStyle = '#080b14';
    ctx.fillText(value,x+2,y+2);
    ctx.fillStyle = color;
    ctx.fillText(value,x,y);
  }

  function drawSky() {
    const gradient = ctx.createLinearGradient(0,0,0,330);
    gradient.addColorStop(0,'#070b1c');
    gradient.addColorStop(.55,'#121b42');
    gradient.addColorStop(1,'#263b63');
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,W,335);

    for (let i=0;i<92;i++) {
      const x=(i*113)%W;
      const y=22+((i*47)%215);
      const blink=Math.sin(Date.now()/650+i)>.38;
      px(x,y,blink?3:2,blink?3:2,blink?'#fff4d8':'#8198cd');
    }

    px(744,54,56,56,'#fff4d8');
    px(766,45,48,66,'#070b1c');
    if(Math.random()<.006) shootingStars.push({x:Math.random()*480+180,y:Math.random()*105+35,life:58});
    shootingStars.forEach(star=>{
      px(star.x,star.y,25,3,'#fff4d8');
      px(star.x-18,star.y+4,15,2,'#79d0b1');
      star.x+=7; star.y+=2; star.life--;
    });
    shootingStars=shootingStars.filter(star=>star.life>0);
  }

  function drawSea() {
    wave += .045;
    const seaGradient=ctx.createLinearGradient(0,278,0,H);
    seaGradient.addColorStop(0,'#15537a');
    seaGradient.addColorStop(.45,'#0b3b5d');
    seaGradient.addColorStop(1,'#071f38');
    ctx.fillStyle=seaGradient;
    ctx.fillRect(0,278,W,H-278);
    for(let row=0;row<9;row++){
      const y=292+row*31;
      for(let x=-80;x<W+80;x+=74){
        const ox=Math.sin(wave+row*.8)*20;
        text('≈≈',x+ox,y,17,row%2?'#5fc6d8':'#9ce8f0');
      }
    }
  }

  function drawDeckScene() {
    const sway=Math.sin(Date.now()/1000)*1.5;
    // hull and deck floor
    px(65,326+sway,830,170,'#4b2f2d');
    px(78,338+sway,804,142,'#7b513d');
    px(78,338+sway,804,14,'#b2794c');
    for(let x=90;x<875;x+=42){px(x,352+sway,3,126,'#54362f');}
    // rail
    px(72,306+sway,816,18,'#30202b');
    for(let x=92;x<875;x+=66){px(x,286+sway,8,34,'#d7bb79');px(x+8,293+sway,42,5,'#76503e');}
    // mast, ropes, sail shadow
    px(470,110,14,225,'#76503e');
    px(478,128,5,205,'#b2794c');
    ctx.strokeStyle='#d7bb79';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(478,128);ctx.lineTo(180,316);ctx.moveTo(478,128);ctx.lineTo(805,316);ctx.stroke();
    px(405,124,142,10,'#5b3e4e');
    text('COFFEE SHIP',477,154,18,'#ffe5ae');
    // cabin and door
    px(80,342+sway,92,120,'#241923');
    px(91,355+sway,70,98,'#3a2630');
    px(102,365+sway,45,70,'#6f493a');
    px(110,374+sway,29,48,'#2a1c31');
    px(133,397+sway,5,5,'#ffe16b');
    text('艙門',126,455+sway,14,'#ffe5ae');
    if(nearDeckDoor()) text('E／互動',126,477+sway,13,'#79d0b1');
    // coffee lounge
    px(344,382+sway,188,46,'#604034');
    px(362,369+sway,54,18,'#79d0b1');
    px(462,369+sway,54,18,'#79d0b1');
    px(420,389+sway,34,28,'#fff4d8');
    px(427,394+sway,20,12,'#6d3f26');
    text('夜風咖啡桌',438,451+sway,14,'#fff4d8');
    // lanterns
    [250,590,735].forEach((x,index)=>{
      px(x,314+sway,5,43,'#d7bb79');
      px(x-9,329+sway,23,26,'#3a293d');
      px(x-5,334+sway,15,15,index===1?'#9ce8f0':'#ffe16b');
    });
    // fishing station
    px(770,366+sway,108,72,'#243342');
    px(782,378+sway,82,48,'#10283b');
    text('🎣',820,399+sway,34,'#fff4d8');
    text('深夜釣魚區',820,454+sway,14,'#9ce8f0');
    // life ring and anchor
    text('🛟',650,403+sway,31,'#fff4d8');
    text('⚓',715,432+sway,34,'#d7bb79');
    // title
    text('🌊 星空甲板',480,312+sway,24,'#fff4d8');
  }

  function drawHuman(appearance,x,y) {
    const bob=Math.floor(Date.now()/260)%2;
    px(x-13,y+18,26,5,'#080b14');
    px(x-13,y-31-bob,26,13,appearance.hair);
    px(x-10,y-24-bob,20,18,appearance.skin);
    px(x-14,y-7-bob,28,29,appearance.shirt);
    px(x-19,y-3-bob,6,19,appearance.skin);
    px(x+13,y-3-bob,6,19,appearance.skin);
    px(x-10,y+20-bob,8,15,'#242331');
    px(x+2,y+20-bob,8,15,'#242331');
    px(x-5,y-18-bob,3,3,'#21182a');
    px(x+4,y-18-bob,3,3,'#21182a');
    px(x-3,y-11-bob,6,2,'#b86766');
  }

  function drawAnimal(appearance,x,y) {
    const animal=animalOptions[appearance.animal]||animalOptions.human;
    if(appearance.animal==='human'){drawHuman(appearance,x,y);return;}
    const bob=Math.floor(Date.now()/260)%2;
    px(x-13,y+18,26,5,'#080b14');
    px(x-15,y-22-bob,30,24,animal.body);
    px(x-11,y-18-bob,22,17,animal.face);
    if(appearance.animal==='rabbit'){
      px(x-12,y-42-bob,7,22,animal.body);px(x+5,y-42-bob,7,22,animal.body);
      px(x-10,y-38-bob,3,16,animal.accent);px(x+7,y-38-bob,3,16,animal.accent);
    } else if(appearance.animal==='penguin'){
      px(x-13,y-30-bob,26,12,animal.body);px(x-8,y-18-bob,16,16,animal.face);px(x-3,y-9-bob,6,4,animal.accent);
    } else if(appearance.animal==='pig'){
      px(x-15,y-29-bob,8,8,animal.body);px(x+7,y-29-bob,8,8,animal.body);px(x-6,y-8-bob,12,7,animal.accent);
    } else if(appearance.animal==='dog'){
      px(x-19,y-19-bob,7,17,animal.accent);px(x+12,y-19-bob,7,17,animal.accent);
    } else if(appearance.animal==='bear'){
      px(x-17,y-27-bob,8,8,animal.body);px(x+9,y-27-bob,8,8,animal.body);
    } else {
      px(x-15,y-29-bob,9,10,animal.body);px(x+6,y-29-bob,9,10,animal.body);
    }
    px(x-6,y-12-bob,4,4,'#21182a');px(x+4,y-12-bob,4,4,'#21182a');px(x-3,y-5-bob,6,3,'#b86766');
    px(x-13,y+2-bob,26,24,appearance.shirt||animal.body);
    px(x-12,y+24-bob,7,12,'#242331');px(x+5,y+24-bob,7,12,'#242331');
  }

  function drawRole(appearance,x,y) {
    const role=String(appearance.role||'');
    if(!role) return false;
    drawHuman(appearance,x,y);
    if(role.includes('女僕')){
      px(x-18,y-38,36,6,'#fff4d8');px(x-11,y-7,22,27,'#fff4d8');px(x-15,y+14,30,7,'#fff4d8');text('♡',x+27,y-27,17,'#ff8fb3');
    } else if(role.includes('海盜')){
      px(x-23,y-45,46,8,'#111018');px(x-14,y-57,28,14,'#111018');px(x-9,y-52,18,4,'#f0a75c');px(x-12,y-17,9,6,'#111018');px(x-16,y-4,32,6,'#f0a75c');
    } else if(role.includes('小提琴')){
      px(x+18,y-24,8,43,'#7b4a2e');px(x+12,y-12,21,15,'#a45f34');px(x-30,y-19,43,4,'#fff4d8');text('♪',x+34,y-42,18,'#fff4d8');
    } else if(role.includes('歌手')){
      px(x+21,y-20,8,8,'#22202d');px(x+24,y-12,4,30,'#d7bb79');text('♫',x-31,y-40,18,'#e9a6b0');
    } else return false;
    return true;
  }

  function drawDeckPlayer() {
    const appearance=getAppearance();
    const x=Math.round(deckPlayer.x), y=Math.round(deckPlayer.y);
    if(!drawRole(appearance,x,y)) drawAnimal(appearance,x,y);
    const prefix=appearance.roleIcon?`${appearance.roleIcon} `:(animalOptions[appearance.animal]?.emoji?`${animalOptions[appearance.animal].emoji} `:'');
    text(`${prefix}${appearance.name}`,x,y-52,13,'#79d0b1');
    if(deckPlayer.emote&&deckPlayer.emoteTimer>0)text(deckPlayer.emote,x,y-72,21,'#fff4d8');
  }

  function updateDeckPlayer() {
    let dx=0,dy=0;
    if(keys.has('ArrowUp')||keys.has('w'))dy-=deckPlayer.speed;
    if(keys.has('ArrowDown')||keys.has('s'))dy+=deckPlayer.speed;
    if(keys.has('ArrowLeft')||keys.has('a'))dx-=deckPlayer.speed;
    if(keys.has('ArrowRight')||keys.has('d'))dx+=deckPlayer.speed;
    if(dx&&dy){dx*=.707;dy*=.707;}
    if(dx<0)deckPlayer.dir='left';else if(dx>0)deckPlayer.dir='right';
    deckPlayer.x=Math.max(105,Math.min(850,deckPlayer.x+dx));
    deckPlayer.y=Math.max(360,Math.min(458,deckPlayer.y+dy));
    if(deckPlayer.emoteTimer>0)deckPlayer.emoteTimer--;
  }

  function updateContextTip() {
    if(scene!=='deck')return;
    if(nearDeckDoor()) setTip('🚪 按 E／互動進入咖啡廳',true);
    else if(Math.hypot(deckPlayer.x-FISHING_SPOT.x,deckPlayer.y-FISHING_SPOT.y)<100)setTip('🎣 按釣魚開始垂釣',true);
    else setTip('',false);
  }

  function loop() {
    if(scene==='deck'&&ctx){
      updateDeckPlayer();
      drawSky();drawSea();drawDeckScene();drawDeckPlayer();updateContextTip();
      if(fade>0){ctx.globalAlpha=fade;ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;fade-=.045;}
    }
    requestAnimationFrame(loop);
  }

  function onKeyDown(event) {
    const k=event.key.length===1?event.key.toLowerCase():event.key;
    if(scene==='deck'&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','w','a','s','d'].includes(k))event.preventDefault();
    keys.add(k);
    if(k==='e'){
      if(scene==='cafe'&&nearCafeDoor()){event.preventDefault();switchToDeck();}
      else if(scene==='deck'){event.preventDefault();handleAction();}
    }
    if(scene==='deck'&&event.code==='Space'){
      deckPlayer.emote='✨';deckPlayer.emoteTimer=80;
    }
  }

  function onKeyUp(event) { keys.delete(event.key.length===1?event.key.toLowerCase():event.key); }

  function init() {
    addStyle();
    makeOverlay();
    updateSceneState('cafe');
    window.COFFEE_SHIP_DECK={
      switchToDeck,switchToCafe,handleAction,
      isDeckOpen:()=>scene==='deck',
      getScene:()=>scene,
      getPlayerPosition:()=>({...deckPlayer}),
      nearDeckDoor,
      refreshAppearance:()=>getAppearance(true),
      syncLayout:syncOverlayLayout
    };
    window.addEventListener('keydown',onKeyDown,true);
    window.addEventListener('keyup',onKeyUp,true);
    window.addEventListener('resize',syncOverlayLayout);
    window.addEventListener('orientationchange',()=>setTimeout(syncOverlayLayout,120));
    window.addEventListener('storage',()=>getAppearance(true));
    new ResizeObserver(syncOverlayLayout).observe(gameCanvas);
    loop();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();