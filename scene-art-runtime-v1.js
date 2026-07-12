(() => {
  'use strict';

  if (window.__COFFEE_SHIP_SCENE_ART_V3__) return;
  window.__COFFEE_SHIP_SCENE_ART_V3__ = true;
  window.__COFFEE_SHIP_SCENE_ART_V2__ = true;

  const W = 960;
  const H = 576;
  const ROWS = Object.freeze({ down:0, left:1, right:2, up:3 });
  const assets = {
    cafe:{ paths:['assets/scenes/cafe-v1/part-1.txt','assets/scenes/cafe-v1/part-2.txt'], image:new Image(), ready:false, failed:false },
    deck:{ paths:['assets/scenes/deck-v1/background.txt'], image:new Image(), ready:false, failed:false }
  };

  const fallback = {
    drawFloor:typeof window.drawFloor === 'function' ? window.drawFloor : null,
    drawCafe:typeof window.drawCafe === 'function' ? window.drawCafe : null
  };

  let scene = 'cafe';
  let canvas = null;
  let overlay = null;
  let dctx = null;
  let tip = null;
  let raf = 0;
  let lastFrame = 0;
  let fishingLockUntil = 0;
  let cafePatched = false;
  const keys = new Set();
  const player = {x:190,y:455,dir:'right',moving:false,speed:2.65};
  const DOOR = Object.freeze({x:104,y:414,r:78});
  const FISH = Object.freeze({x:866,y:408,r:104});
  const blocks = Object.freeze([
    {x:210,y:330,w:250,h:128},
    {x:560,y:348,w:270,h:130}
  ]);

  const safeJson = (raw,fallbackValue) => {
    try { return raw ? JSON.parse(raw) : fallbackValue; }
    catch { return fallbackValue; }
  };

  async function loadImage(item,name) {
    try {
      const chunks = await Promise.all(item.paths.map(async path => {
        const response = await fetch(path,{cache:'no-store'});
        if (!response.ok) throw new Error(`${response.status} ${path}`);
        return (await response.text()).replace(/\s+/g,'');
      }));
      await new Promise((resolve,reject) => {
        item.image.onload = resolve;
        item.image.onerror = () => reject(new Error(`${name} image decode failed`));
        item.image.src = `data:image/webp;base64,${chunks.join('')}`;
      });
      item.ready = true;
      window.dispatchEvent(new CustomEvent('coffee-ship:scene-art-ready',{detail:{scene:name,version:3}}));
      if (name === 'cafe') installCafePatch();
    } catch (error) {
      item.failed = true;
      console.warn(`Coffee Ship ${name} scene image failed.`,error);
    }
  }

  function drawCafeFloor() {
    const context = document.getElementById('game')?.getContext?.('2d');
    if (!context || !assets.cafe.ready) {
      fallback.drawFloor?.();
      return;
    }
    context.save();
    context.imageSmoothingEnabled = false;
    context.drawImage(assets.cafe.image,0,0,W,H);
    context.restore();
  }

  function drawCafeDecor() {
    if (!assets.cafe.ready) fallback.drawCafe?.();
  }

  function installCafePatch() {
    if (!assets.cafe.ready) return false;
    window.drawFloor = drawCafeFloor;
    window.drawCafe = drawCafeDecor;
    try {
      window.eval('drawFloor = window.drawFloor; drawCafe = window.drawCafe;');
    } catch (error) {
      console.warn('Coffee Ship cafe renderer uses window fallback.',error);
    }
    cafePatched = true;
    document.body.dataset.coffeeShipCafeArt = 'v3-ready';
    return true;
  }

  function addStyle() {
    if (document.getElementById('coffeeShipSceneArtV3Style')) return;
    const style = document.createElement('style');
    style.id = 'coffeeShipSceneArtV3Style';
    style.textContent = `
      #game,#deckOverlay{image-rendering:pixelated}
      #deckOverlay{position:absolute;z-index:35;pointer-events:none;border:3px solid #9a6947;border-radius:18px;background:#4b281d;box-sizing:border-box;box-shadow:0 18px 38px rgba(0,0,0,.34)}
      #deckOverlay.hidden{display:none!important}
      #deckModelV2,#deckTip{display:none!important}
      #deckSceneTip{position:absolute;z-index:48;left:50%;transform:translateX(-50%);max-width:min(86%,620px);padding:8px 13px;border:2px solid #e4b76a;border-radius:12px;background:rgba(46,25,20,.94);color:#fff0c7;font-weight:900;text-align:center;pointer-events:none;box-shadow:0 6px 0 rgba(0,0,0,.25)}
      #deckSceneTip.hidden{display:none!important}
      body[data-coffee-ship-scene="deck"] #game{visibility:hidden!important}
      body[data-coffee-ship-scene="deck"] #messageBtn,
      body[data-coffee-ship-scene="deck"] #emoteBtn{display:none!important}
      body:not([data-coffee-ship-scene="deck"]) #fishDexBtn{display:none!important}
      #operationDock #opActionButtons{display:none!important}
      #deckFishingBtn,#fishingBtn,.deck-fishing-button,.legacy-fishing-button,.fishing-shortcut-button{display:none!important}
      @media(max-width:760px){#deckOverlay{border-radius:14px}#deckSceneTip{font-size:12px;padding:6px 9px;max-width:calc(100% - 28px)}}
    `;
    document.head.appendChild(style);
  }

  function ensureOverlay() {
    const panel = document.getElementById('gamePanel');
    canvas = document.getElementById('game');
    if (!panel || !canvas) return false;
    if (getComputedStyle(panel).position === 'static') panel.style.position = 'relative';

    document.getElementById('deckModelV2')?.remove();
    overlay = document.getElementById('deckOverlay');
    if (!overlay) {
      overlay = document.createElement('canvas');
      overlay.id = 'deckOverlay';
      overlay.className = 'hidden';
      overlay.width = W;
      overlay.height = H;
      panel.appendChild(overlay);
    }
    dctx = overlay.getContext('2d',{alpha:false});
    if (!dctx) return false;
    dctx.imageSmoothingEnabled = false;

    tip = document.getElementById('deckSceneTip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'deckSceneTip';
      tip.className = 'hidden';
      panel.appendChild(tip);
    }
    syncLayout();
    return true;
  }

  function syncLayout() {
    if (!canvas || !overlay) return;
    overlay.style.left = `${canvas.offsetLeft}px`;
    overlay.style.top = `${canvas.offsetTop}px`;
    overlay.style.width = `${canvas.offsetWidth}px`;
    overlay.style.height = `${canvas.offsetHeight}px`;
    if (tip) tip.style.top = `${Math.max(8,canvas.offsetTop+10)}px`;
  }

  function setTip(message,timeout=0) {
    if (!tip) return;
    const value = String(message || '');
    if (tip.textContent !== value) tip.textContent = value;
    tip.classList.toggle('hidden',!value);
    if (value && timeout > 0) {
      setTimeout(() => {
        if (scene === 'deck' && tip?.textContent === value) tip.classList.add('hidden');
      },timeout);
    }
  }

  const nearPoint = point => Math.hypot(player.x-point.x,player.y-point.y) < point.r;
  const nearDeckDoor = () => nearPoint(DOOR);
  const nearFishingSpot = () => nearPoint(FISH);

  function collides(x,y) {
    return blocks.some(block => x+15>block.x && x-15<block.x+block.w && y+10>block.y && y-28<block.y+block.h);
  }

  function appearance() {
    const live = window.COFFEE_SHIP_GAME_API?.player || window.COFFEE_SHIP_PLAYER_POS || {};
    const avatar = safeJson(localStorage.getItem('coffeeShipAvatar'),{}) || {};
    const role = safeJson(localStorage.getItem('coffeeShipRole'),null);
    const animal = role?.specialHuman ? 'human' : (live.animal || avatar.animal || localStorage.getItem('coffeeShipAnimal') || 'human');
    return {
      name:role?.name || live.name || avatar.name || 'Guest',
      icon:role?.icon || '',animal,
      hair:live.hair || avatar.hair || '#2b1d16',
      shirt:live.shirt || avatar.shirt || '#c96a4a',
      skin:live.skin || avatar.skin || '#f0c7a0'
    };
  }

  function text(value,x,y,size=13,color='#fff0c7') {
    dctx.font = `900 ${size}px ui-rounded,system-ui,sans-serif`;
    dctx.textAlign = 'center';
    dctx.fillStyle = '#30180f';
    dctx.fillText(value,x+2,y+2);
    dctx.fillStyle = color;
    dctx.fillText(value,x,y);
  }

  function drawPlayer() {
    const app = appearance();
    const cast = window.COFFEE_SHIP_UNIFIED_CAST_V3;
    const cat = app.animal === 'cat' || app.animal === 'blackcat';
    const x = Math.round(player.x);
    const y = Math.round(player.y);

    if (cast?.isReady?.() && cast.atlas) {
      const frame = player.moving ? 1 + Math.floor(performance.now()/145)%3 : 0;
      const type = cat ? 'blackcat' : 'player';
      const sourceX = cast.offsets[type] + frame*24;
      const sourceY = (ROWS[player.dir] ?? 0)*30;
      const width = cat ? 72 : 96;
      const height = cat ? 90 : 120;
      const anchorY = cat ? 63 : 82;
      dctx.save();
      dctx.imageSmoothingEnabled = false;
      dctx.drawImage(cast.atlas,sourceX,sourceY,24,30,x-width/2,y-anchorY,width,height);
      dctx.restore();
    } else {
      dctx.fillStyle = 'rgba(40,20,14,.25)';
      dctx.beginPath();
      dctx.ellipse(x,y+26,20,6,0,0,Math.PI*2);
      dctx.fill();
      dctx.fillStyle = app.shirt;
      dctx.fillRect(x-16,y-8,32,34);
      dctx.fillStyle = app.skin;
      dctx.fillRect(x-11,y-29,22,21);
      dctx.fillStyle = app.hair;
      dctx.fillRect(x-14,y-37,28,12);
    }
    text(`${app.icon ? app.icon+' ' : cat ? '🐈‍⬛ ' : ''}${app.name}`,x,y-(cat?58:91));
  }

  function drawHotspot(point,icon,label) {
    const active = nearPoint(point);
    const pulse = 3 + Math.sin(performance.now()/240)*2;
    dctx.save();
    dctx.globalAlpha = active ? .86 : .28;
    dctx.strokeStyle = active ? '#ffe1a0' : '#fff4df';
    dctx.lineWidth = active ? 4 : 2;
    dctx.beginPath();
    dctx.ellipse(point.x,point.y+20,32+pulse,11+pulse*.25,0,0,Math.PI*2);
    dctx.stroke();
    dctx.restore();
    if (active) text(`${icon} ${label}`,point.x,point.y-14,13);
  }

  function drawDeck() {
    if (!dctx) return;
    if (assets.deck.ready) {
      dctx.imageSmoothingEnabled = false;
      dctx.drawImage(assets.deck.image,0,0,W,H);
    } else {
      const gradient = dctx.createLinearGradient(0,0,0,H);
      gradient.addColorStop(0,'#70caf3');
      gradient.addColorStop(.48,'#168dcc');
      gradient.addColorStop(.49,'#9a613e');
      gradient.addColorStop(1,'#4a281c');
      dctx.fillStyle = gradient;
      dctx.fillRect(0,0,W,H);
    }
    drawHotspot(DOOR,'🚪','返回咖啡廳');
    drawHotspot(FISH,'🎣','開始釣魚');
    drawPlayer();
  }

  function updatePlayer(step) {
    let dx = 0;
    let dy = 0;
    if (keys.has('arrowleft') || keys.has('a')) dx -= 1;
    if (keys.has('arrowright') || keys.has('d')) dx += 1;
    if (keys.has('arrowup') || keys.has('w')) dy -= 1;
    if (keys.has('arrowdown') || keys.has('s')) dy += 1;
    player.moving = Boolean(dx || dy);
    if (!player.moving) return;
    const length = Math.hypot(dx,dy) || 1;
    dx = dx/length*player.speed*step;
    dy = dy/length*player.speed*step;
    player.dir = Math.abs(dx)>Math.abs(dy) ? (dx<0?'left':'right') : (dy<0?'up':'down');
    const nextX = Math.max(40,Math.min(920,player.x+dx));
    if (!collides(nextX,player.y)) player.x = nextX;
    const nextY = Math.max(255,Math.min(525,player.y+dy));
    if (!collides(player.x,nextY)) player.y = nextY;
  }

  function updateHint() {
    if (nearDeckDoor()) setTip('🚪 按 E／互動返回咖啡廳');
    else if (nearFishingSpot()) setTip('🎣 按 C／釣魚按鈕下竿');
    else setTip('');
  }

  function loop(now) {
    if (scene !== 'deck') { raf = 0; return; }
    raf = requestAnimationFrame(loop);
    if (now-lastFrame < 30) return;
    const step = Math.min(2.2,(lastFrame ? now-lastFrame : 33)/16.667);
    lastFrame = now;
    updatePlayer(step);
    drawDeck();
    updateHint();
  }

  function setTextIfChanged(element,value) {
    if (element && element.textContent !== value) element.textContent = value;
  }

  function syncSceneUi(nextScene) {
    const deckOpen = nextScene === 'deck';
    setTextIfChanged(document.querySelector('.game-topbar .controls'),deckOpen
      ? 'WASD / 方向鍵移動 · C 釣魚 · E 互動 / 返回'
      : 'WASD / 方向鍵移動 · C 咖啡 · E 互動 · B 留言');
    const badge = document.getElementById('sceneStatusBadge');
    setTextIfChanged(badge,deckOpen ? '🌊 Deck' : '☕ Cafe');
    ['messageBtn','emoteBtn'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.hidden = deckOpen;
    });
    const dexButtons = Array.from(document.querySelectorAll('[id="fishDexBtn"]'));
    dexButtons.slice(1).forEach(button => button.remove());
    if (dexButtons[0]) dexButtons[0].hidden = !deckOpen;
  }

  function setScene(nextScene) {
    scene = nextScene;
    window.COFFEE_SHIP_SCENE = nextScene;
    document.body.dataset.coffeeShipScene = nextScene;
    syncSceneUi(nextScene);
    window.dispatchEvent(new CustomEvent('coffee-ship:scene',{detail:{scene:nextScene,source:'scene-art-v3'}}));
  }

  function switchToDeck() {
    if (!overlay && !ensureOverlay()) return false;
    player.x = 190;
    player.y = 455;
    player.dir = 'right';
    player.moving = false;
    keys.clear();
    syncLayout();
    overlay.classList.remove('hidden');
    setScene('deck');
    setTip('🌊 甲板｜C 釣魚，E 返回咖啡廳',2200);
    lastFrame = 0;
    if (!raf) raf = requestAnimationFrame(loop);
    window.COFFEE_SHIP_FEATURE_LOADER?.preloadDeckSystems?.();
    return true;
  }

  function switchToCafe() {
    keys.clear();
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    overlay?.classList.add('hidden');
    setTip('');
    setScene('cafe');
    installCafePatch();
    return true;
  }

  function requestFishing() {
    if (scene !== 'deck') return false;
    if (!nearFishingSpot()) {
      setTip('🎣 請先走到右側發光的釣魚區',1800);
      return false;
    }
    if (Date.now() < fishingLockUntil) return true;
    fishingLockUntil = Date.now()+350;
    const api = window.COFFEE_SHIP_FISHING_API;
    if (Number(api?.version || 0) >= 4) return api.startFishing();
    setTip('🎣 正在載入最新版釣魚系統…',1800);
    window.COFFEE_SHIP_FEATURE_LOADER?.preloadDeckSystems?.();
    window.dispatchEvent(new CustomEvent('coffee-ship:request-fishing',{detail:{source:'deck-v3',version:4}}));
    return true;
  }

  function handleAction() {
    if (scene !== 'deck') return false;
    if (nearDeckDoor()) return switchToCafe();
    if (nearFishingSpot()) return requestFishing();
    setTip('左側艙門可返回；右側發光區可釣魚。',1500);
    return false;
  }

  function bindControls() {
    window.addEventListener('keydown',event => {
      if (scene !== 'deck') return;
      const key = String(event.key || '').toLowerCase();
      if (['arrowleft','arrowright','arrowup','arrowdown','w','a','s','d'].includes(key)) {
        keys.add(key);
        event.preventDefault();
      } else if (key === 'c') {
        event.preventDefault();
        requestFishing();
      } else if (key === 'e') {
        event.preventDefault();
        handleAction();
      }
    },true);
    window.addEventListener('keyup',event => keys.delete(String(event.key || '').toLowerCase()),true);
    window.addEventListener('resize',syncLayout,{passive:true});
    window.addEventListener('orientationchange',() => setTimeout(syncLayout,120));
    document.addEventListener('click',event => {
      if (scene !== 'deck') return;
      if (event.target.closest?.('#coffeeBtn')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        requestFishing();
      } else if (event.target.closest?.('#sitBtn')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        handleAction();
      }
    },true);
  }

  function init() {
    addStyle();
    ensureOverlay();
    bindControls();
    setScene('cafe');
    loadImage(assets.cafe,'cafe');
    loadImage(assets.deck,'deck');
    window.COFFEE_SHIP_SCENE_ART_V2 = {
      version:3,assets,drawFloor:drawCafeFloor,drawCafe:drawCafeDecor,
      installCafePatch,isCafePatched:() => cafePatched
    };
    window.COFFEE_SHIP_DECK = {
      version:3,switchToDeck,switchToCafe,requestFishing,handleAction,
      isDeckOpen:() => scene === 'deck',getScene:() => scene,
      getPlayer:() => ({...player}),getPlayerPosition:() => ({...player}),
      nearDeckDoor,nearFishingSpot,showTip:(message,timeout=1800) => setTip(message,timeout),syncLayout
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
