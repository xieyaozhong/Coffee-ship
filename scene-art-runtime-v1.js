(() => {
  'use strict';

  if (window.__COFFEE_SHIP_SCENE_ART_V2__) return;
  window.__COFFEE_SHIP_SCENE_ART_V2__ = true;

  const W = 960;
  const H = 576;
  const ROWS = Object.freeze({ down:0, left:1, right:2, up:3 });
  const assets = {
    cafe: { path:'assets/scenes/cafe-v2/background.txt', image:new Image(), ready:false, failed:false },
    deck: { path:'assets/scenes/deck-v1/background.txt', image:new Image(), ready:false, failed:false }
  };

  let oldDrawFloor = typeof window.drawFloor === 'function' ? window.drawFloor : null;
  let oldDrawCafe = typeof window.drawCafe === 'function' ? window.drawCafe : null;
  let cafePatchInstalled = false;

  let scene = 'cafe';
  let gameCanvas = null;
  let overlay = null;
  let dctx = null;
  let tip = null;
  let raf = 0;
  let lastFrame = 0;
  let fishingRequestLockedUntil = 0;
  const keys = new Set();
  const deckPlayer = { x:190, y:455, dir:'right', moving:false, speed:2.65, emote:null, emoteTimer:0 };
  const DOOR = Object.freeze({x:104,y:414,r:78});
  const FISH = Object.freeze({x:866,y:408,r:104});
  const blocks = Object.freeze([
    {x:210,y:330,w:250,h:128},
    {x:560,y:348,w:270,h:130}
  ]);

  const safeJson = (raw, fallback) => {
    try { return raw ? JSON.parse(raw) : fallback; }
    catch { return fallback; }
  };

  async function loadBase64Image(item, name) {
    try {
      const response = await fetch(item.path, { cache:'no-store' });
      if (!response.ok) throw new Error(`${response.status} ${item.path}`);
      const data = (await response.text()).replace(/\s+/g,'');
      await new Promise((resolve,reject) => {
        item.image.onload = resolve;
        item.image.onerror = () => reject(new Error(`${name} scene decode failed`));
        item.image.src = `data:image/webp;base64,${data}`;
      });
      item.ready = true;
      window.dispatchEvent(new CustomEvent('coffee-ship:scene-art-ready',{detail:{scene:name,version:2}}));
      if (name === 'cafe') installCafePatch();
    } catch (error) {
      item.failed = true;
      console.warn(`Coffee Ship ${name} scene art v2 failed; keeping fallback.`,error);
    }
  }

  function gameContext() {
    const canvas = document.getElementById('game');
    return canvas?.getContext?.('2d') || null;
  }

  function drawCafeBackgroundV2() {
    const context = gameContext();
    if (!context || !assets.cafe.ready) {
      oldDrawFloor?.();
      return;
    }
    context.save();
    context.imageSmoothingEnabled = false;
    context.drawImage(assets.cafe.image,0,0,W,H);
    context.restore();
  }

  function drawCafeDecorV2() {
    if (!assets.cafe.ready) oldDrawCafe?.();
  }

  function installCafePatch() {
    if (!assets.cafe.ready) return false;
    window.COFFEE_SHIP_SCENE_ART_V2.drawFloor = drawCafeBackgroundV2;
    window.COFFEE_SHIP_SCENE_ART_V2.drawCafe = drawCafeDecorV2;
    window.drawFloor = drawCafeBackgroundV2;
    window.drawCafe = drawCafeDecorV2;

    try {
      window.eval('drawFloor = window.COFFEE_SHIP_SCENE_ART_V2.drawFloor; drawCafe = window.COFFEE_SHIP_SCENE_ART_V2.drawCafe;');
      cafePatchInstalled = true;
    } catch (error) {
      console.warn('Coffee Ship cafe global renderer patch fallback is active.',error);
      cafePatchInstalled = typeof window.drawFloor === 'function';
    }

    document.body.dataset.coffeeShipCafeArt = 'v2';
    return cafePatchInstalled;
  }

  function addStyle() {
    let style = document.getElementById('coffeeShipSceneArtV2Style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'coffeeShipSceneArtV2Style';
      document.head.appendChild(style);
    }
    style.textContent = `
      #game,#deckOverlay{image-rendering:pixelated}
      #deckOverlay{position:absolute;z-index:35;display:block;pointer-events:none;border:3px solid #9a6947;border-radius:18px;background:#4b281d;box-sizing:border-box;box-shadow:0 18px 38px rgba(0,0,0,.34)}
      #deckOverlay.hidden{display:none!important}
      #deckModelV2,#deckTip{display:none!important}
      #deckSceneTip{position:absolute;z-index:48;left:50%;transform:translateX(-50%);max-width:min(86%,620px);padding:8px 13px;border:2px solid #e4b76a;border-radius:12px;background:rgba(46,25,20,.94);color:#fff0c7;font-weight:900;text-align:center;pointer-events:none;box-shadow:0 6px 0 rgba(0,0,0,.25)}
      #deckSceneTip.hidden{display:none!important}
      body[data-coffee-ship-scene="deck"] #game{visibility:hidden!important}
      body[data-coffee-ship-scene="deck"] #messageBtn,
      body[data-coffee-ship-scene="deck"] #emoteBtn{display:none!important}
      body:not([data-coffee-ship-scene="deck"]) #fishDexBtn{display:none!important}
      #operationDock #opActionButtons [data-trigger="coffeeBtn"],
      #operationDock #opActionButtons [data-trigger="sitBtn"],
      #operationDock #opActionButtons [data-trigger="messageBtn"],
      #operationDock #opActionButtons [data-trigger="emoteBtn"],
      #deckFishingBtn,#fishingBtn,.deck-fishing-button,.legacy-fishing-button{display:none!important}
      @media(max-width:760px){#deckOverlay{border-radius:14px}#deckSceneTip{font-size:12px;padding:6px 9px;max-width:calc(100% - 28px)}#operationDock #opActionButtons{display:none!important}}
    `;
  }

  function ensureOverlay() {
    const panel = document.getElementById('gamePanel');
    gameCanvas = document.getElementById('game');
    if (!panel || !gameCanvas) return false;
    if (getComputedStyle(panel).position === 'static') panel.style.position = 'relative';

    document.getElementById('deckModelV2')?.remove();
    document.getElementById('deckOverlay')?.remove();
    document.getElementById('deckSceneTip')?.remove();

    overlay = document.createElement('canvas');
    overlay.id = 'deckOverlay';
    overlay.className = 'hidden';
    overlay.width = W;
    overlay.height = H;
    panel.appendChild(overlay);
    dctx = overlay.getContext('2d',{alpha:false});
    if (!dctx) return false;
    dctx.imageSmoothingEnabled = false;

    tip = document.createElement('div');
    tip.id = 'deckSceneTip';
    tip.className = 'hidden';
    panel.appendChild(tip);
    syncLayout();
    return true;
  }

  function syncLayout() {
    if (!gameCanvas || !overlay) return;
    overlay.style.left = `${gameCanvas.offsetLeft}px`;
    overlay.style.top = `${gameCanvas.offsetTop}px`;
    overlay.style.width = `${gameCanvas.offsetWidth}px`;
    overlay.style.height = `${gameCanvas.offsetHeight}px`;
    if (tip) tip.style.top = `${Math.max(8,gameCanvas.offsetTop+10)}px`;
  }

  function setTip(message, show = true, timeout = 0) {
    if (!tip) return;
    tip.textContent = String(message || '');
    tip.classList.toggle('hidden',!show || !message);
    if (timeout > 0) {
      const expected = String(message || '');
      setTimeout(() => {
        if (scene === 'deck' && tip?.textContent === expected) tip.classList.add('hidden');
      },timeout);
    }
  }

  const nearPoint = point => Math.hypot(deckPlayer.x-point.x,deckPlayer.y-point.y) < point.r;
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
      roleIcon:role?.icon || '',
      animal,
      hair:live.hair || avatar.hair || '#2b1d16',
      shirt:live.shirt || avatar.shirt || '#c96a4a',
      skin:live.skin || avatar.skin || '#f0c7a0'
    };
  }

  function drawText(value,x,y,size=13,color='#fff0c7') {
    dctx.font = `900 ${size}px ui-rounded,system-ui,sans-serif`;
    dctx.textAlign = 'center';
    dctx.fillStyle = '#30180f';
    dctx.fillText(value,x+2,y+2);
    dctx.fillStyle = color;
    dctx.fillText(value,x,y);
  }

  function drawDeckPlayer() {
    const app = appearance();
    const cast = window.COFFEE_SHIP_UNIFIED_CAST_V3;
    const cat = app.animal === 'cat' || app.animal === 'blackcat';
    const x = Math.round(deckPlayer.x);
    const y = Math.round(deckPlayer.y);

    if (cast?.isReady?.() && cast.atlas) {
      const frame = deckPlayer.moving ? 1 + Math.floor(performance.now()/145)%3 : 0;
      const type = cat ? 'blackcat' : 'player';
      const sourceX = cast.offsets[type] + frame*24;
      const sourceY = (ROWS[deckPlayer.dir] ?? 0)*30;
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

    drawText(`${app.roleIcon ? app.roleIcon+' ' : cat ? '🐈‍⬛ ' : ''}${app.name}`,x,y-(cat?58:91));
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
    if (active) drawText(`${icon} ${label}`,point.x,point.y-14,13);
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
    drawDeckPlayer();
  }

  function updateDeckPlayer(step) {
    let dx = 0;
    let dy = 0;
    if (keys.has('arrowleft') || keys.has('a')) dx -= 1;
    if (keys.has('arrowright') || keys.has('d')) dx += 1;
    if (keys.has('arrowup') || keys.has('w')) dy -= 1;
    if (keys.has('arrowdown') || keys.has('s')) dy += 1;
    deckPlayer.moving = Boolean(dx || dy);
    if (!deckPlayer.moving) return;

    const length = Math.hypot(dx,dy) || 1;
    dx = dx/length*deckPlayer.speed*step;
    dy = dy/length*deckPlayer.speed*step;
    deckPlayer.dir = Math.abs(dx)>Math.abs(dy) ? (dx<0?'left':'right') : (dy<0?'up':'down');

    const nextX = Math.max(40,Math.min(920,deckPlayer.x+dx));
    if (!collides(nextX,deckPlayer.y)) deckPlayer.x = nextX;
    const nextY = Math.max(255,Math.min(525,deckPlayer.y+dy));
    if (!collides(deckPlayer.x,nextY)) deckPlayer.y = nextY;
  }

  function syncContextTip() {
    if (nearDeckDoor()) setTip('🚪 按 E／互動返回咖啡廳');
    else if (nearFishingSpot()) setTip('🎣 按 C／釣魚按鈕使用最新版釣魚系統');
    else setTip('',false);
  }

  function loop(now) {
    if (scene !== 'deck') { raf = 0; return; }
    raf = requestAnimationFrame(loop);
    if (now-lastFrame < 30) return;
    const step = Math.min(2.2,(lastFrame ? now-lastFrame : 33)/16.667);
    lastFrame = now;
    updateDeckPlayer(step);
    drawDeck();
    syncContextTip();
  }

  function updateTopbar(nextScene) {
    const hint = document.querySelector('.game-topbar .controls');
    if (hint) hint.textContent = nextScene === 'deck'
      ? 'WASD / 方向鍵移動 · C 釣魚 · E 互動 / 返回'
      : 'WASD / 方向鍵移動 · C 咖啡 · E 互動 · B 留言';
    const badge = document.getElementById('sceneStatusBadge');
    if (badge) badge.textContent = nextScene === 'deck' ? '🌊 Deck' : '☕ Cafe';
  }

  function pruneDuplicateControls() {
    const isDeck = scene === 'deck' || document.body.dataset.coffeeShipScene === 'deck';
    ['messageBtn','emoteBtn'].forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.hidden = isDeck;
        element.setAttribute('aria-hidden',isDeck?'true':'false');
      }
    });

    const fishDexButtons = Array.from(document.querySelectorAll('[id="fishDexBtn"]'));
    fishDexButtons.slice(1).forEach(button => button.remove());
    const fishDex = fishDexButtons[0];
    if (fishDex) {
      fishDex.hidden = !isDeck;
      fishDex.setAttribute('aria-hidden',isDeck?'false':'true');
    }

    document.querySelectorAll('#opActionButtons [data-trigger]').forEach(button => {
      const keep = button.dataset.trigger === 'fishDexBtn';
      button.hidden = !keep;
      button.setAttribute('aria-hidden',keep?'false':'true');
    });
    updateTopbar(isDeck?'deck':'cafe');
  }

  function sceneState(nextScene) {
    scene = nextScene;
    window.COFFEE_SHIP_SCENE = nextScene;
    document.body.dataset.coffeeShipScene = nextScene;
    updateTopbar(nextScene);
    pruneDuplicateControls();
    window.dispatchEvent(new CustomEvent('coffee-ship:scene',{detail:{scene:nextScene,source:'scene-art-v2'}}));
  }

  function switchToDeck() {
    if (!overlay && !ensureOverlay()) return false;
    scene = 'deck';
    deckPlayer.x = 190;
    deckPlayer.y = 455;
    deckPlayer.dir = 'right';
    deckPlayer.moving = false;
    keys.clear();
    syncLayout();
    overlay.classList.remove('hidden');
    sceneState('deck');
    setTip('🌊 甲板｜C 使用最新版釣魚，E 返回咖啡廳',true,2600);
    lastFrame = 0;
    if (!raf) raf = requestAnimationFrame(loop);
    window.COFFEE_SHIP_FEATURE_LOADER?.preloadDeckSystems?.();
    return true;
  }

  function switchToCafe() {
    scene = 'cafe';
    keys.clear();
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    overlay?.classList.add('hidden');
    setTip('',false);
    sceneState('cafe');
    installCafePatch();
    return true;
  }

  function requestFishing() {
    if (scene !== 'deck') return false;
    if (!nearFishingSpot()) {
      setTip('🎣 請先走到右側發光的釣魚區',true,1800);
      return false;
    }
    if (Date.now() < fishingRequestLockedUntil) return true;
    fishingRequestLockedUntil = Date.now()+350;

    const api = window.COFFEE_SHIP_FISHING_API;
    if (Number(api?.version || 0) >= 4) {
      return api.startFishing();
    }

    setTip('🎣 正在載入最新版釣魚系統…',true,1800);
    window.COFFEE_SHIP_FEATURE_LOADER?.preloadDeckSystems?.();
    window.dispatchEvent(new CustomEvent('coffee-ship:request-fishing',{detail:{source:'deck-v2',x:deckPlayer.x,y:deckPlayer.y,version:4}}));
    return true;
  }

  function handleAction() {
    if (scene !== 'deck') return false;
    if (nearDeckDoor()) return switchToCafe();
    if (nearFishingSpot()) return requestFishing();
    setTip('左側艙門可返回；右側發光區可釣魚。',true,1600);
    return false;
  }

  function onKeyDown(event) {
    if (scene !== 'deck') return;
    const key = event.key?.length === 1 ? event.key.toLowerCase() : String(event.key || '').toLowerCase();
    if (['arrowleft','arrowright','arrowup','arrowdown','w','a','s','d'].includes(key)) {
      keys.add(key);
      event.preventDefault();
      return;
    }
    if (key === 'c') {
      event.preventDefault();
      requestFishing();
      return;
    }
    if (key === 'e') {
      event.preventDefault();
      handleAction();
    }
  }

  function onKeyUp(event) {
    const key = event.key?.length === 1 ? event.key.toLowerCase() : String(event.key || '').toLowerCase();
    keys.delete(key);
  }

  function bindControls() {
    window.addEventListener('keydown',onKeyDown,true);
    window.addEventListener('keyup',onKeyUp,true);
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

    const observer = new MutationObserver(pruneDuplicateControls);
    observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener('coffee-ship:fishing-api-ready',pruneDuplicateControls);
  }

  function init() {
    addStyle();
    ensureOverlay();
    bindControls();
    sceneState('cafe');
    pruneDuplicateControls();
    loadBase64Image(assets.cafe,'cafe');
    loadBase64Image(assets.deck,'deck');

    window.COFFEE_SHIP_SCENE_ART_V2 = {
      version:2,
      assets,
      drawFloor:drawCafeBackgroundV2,
      drawCafe:drawCafeDecorV2,
      installCafePatch,
      isCafePatched:() => cafePatchInstalled
    };

    window.COFFEE_SHIP_DECK = {
      version:2,
      switchToDeck,
      switchToCafe,
      requestFishing,
      handleAction,
      isDeckOpen:() => scene === 'deck',
      getScene:() => scene,
      getPlayer:() => ({...deckPlayer}),
      getPlayerPosition:() => ({...deckPlayer}),
      nearDeckDoor,
      nearFishingSpot,
      showTip:(message,timeout=1800) => setTip(message,true,timeout),
      syncLayout
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
