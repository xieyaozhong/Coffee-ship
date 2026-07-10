(() => {
  'use strict';
  if (window.__COFFEE_SHIP_RUNTIME_CORE_V2__) return;
  window.__COFFEE_SHIP_RUNTIME_CORE_V2__ = true;

  const VERSION = 2;
  const ERROR_KEY = 'coffeeShipRuntimeErrors';
  const MAX_ERRORS = 30;
  const modalClasses = {
    'sea-merchant-open':'seaMerchantEvent',
    'pirate-gambling-open':'pirateGamblingEvent',
    'coral-roulette-open':'coralRouletteEvent',
    'mutant-hunt-open':'mutantHuntEvent',
    'auction-ship-open':'abyssAuctionEvent',
    'abyss-auction-open':'abyssAuctionEvent',
    'ocean-friends-qte-open':'oceanFriendsQte',
    'salvage-qte-open':'salvageQteEvent'
  };

  const runtime = {
    startedAt:Date.now(),
    errors:[],
    recoveries:0,
    safeMode:false,
    safeModeRaf:0,
    lastHealth:null,
    lastToastAt:0
  };

  function readJson(key,fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function writeJson(key,value) {
    try { localStorage.setItem(key,JSON.stringify(value)); }
    catch {}
  }

  function cleanErrorText(value) {
    return String(value || '未知錯誤').replace(/\s+/g,' ').slice(0,260);
  }

  function ensureRuntimeUi() {
    let host = document.getElementById('coffeeShipRuntimeToastHost');
    if (!host) {
      host = document.createElement('div');
      host.id = 'coffeeShipRuntimeToastHost';
      host.setAttribute('aria-live','polite');
      document.body.appendChild(host);
    }
    let status = document.getElementById('coffeeShipRuntimeStatus');
    if (!status) {
      status = document.createElement('button');
      status.id = 'coffeeShipRuntimeStatus';
      status.type = 'button';
      status.textContent = '🛠 執行修復';
      status.addEventListener('click',() => {
        const result = repair('manual-status');
        const health = checkHealth();
        toast(result.changed ? '已重新整理遊戲執行狀態。' : health.ok ? '遊戲核心運作正常。' : `仍有模組未就緒：${health.criticalMissing.join('、')}`,'warning',3200);
      });
      document.body.appendChild(status);
    }
    return {host,status};
  }

  function toast(message,type='info',duration=2400) {
    const {host} = ensureRuntimeUi();
    const row = document.createElement('div');
    row.className = `cs-runtime-toast ${type}`;
    row.textContent = String(message || '');
    host.appendChild(row);
    runtime.lastToastAt = Date.now();
    while (host.children.length > 3) host.firstElementChild?.remove();
    setTimeout(() => {
      row.classList.add('is-leaving');
      setTimeout(() => row.remove(),220);
    },Math.max(900,duration));
  }

  function recordError(kind,error,context={}) {
    const entry = {
      at:Date.now(),
      kind,
      message:cleanErrorText(error?.message || error?.reason || error),
      file:cleanErrorText(context.file || error?.filename || ''),
      line:Number(context.line || error?.lineno || 0),
      scene:document.body?.dataset?.coffeeShipScene || 'unknown'
    };
    runtime.errors.push(entry);
    runtime.errors = runtime.errors.slice(-MAX_ERRORS);
    const stored = readJson(ERROR_KEY,[]);
    stored.push(entry);
    writeJson(ERROR_KEY,stored.slice(-MAX_ERRORS));
    window.dispatchEvent(new CustomEvent('coffee-ship:runtime-error',{detail:entry}));
    updateStatus();
    return entry;
  }

  function visible(element) {
    if (!element || element.classList.contains('hidden')) return false;
    const style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  function checkHealth() {
    const creator = document.getElementById('creator');
    const gamePanel = document.getElementById('gamePanel');
    const canvas = document.getElementById('game');
    const modules = {
      game:!!window.COFFEE_SHIP_GAME_API,
      deck:!!window.COFFEE_SHIP_DECK,
      economy:!!window.COFFEE_SHIP_ECONOMY,
      fishing:!!window.COFFEE_SHIP_FISHING_API,
      backpack:!!window.COFFEE_SHIP_BACKPACK_MANAGER,
      database:!!window.COFFEE_SHIP_DB,
      optimizer:!!window.COFFEE_SHIP_GAME_OPTIMIZER,
      qteRouter:!!window.COFFEE_SHIP_EXPANDED_EVENTS
    };
    const criticalMissing = [];
    if (!modules.game && !runtime.safeMode) criticalMissing.push('咖啡廳核心');
    if (!modules.deck) criticalMissing.push('甲板');
    if (!modules.economy) criticalMissing.push('珍珠經濟');
    if (!canvas) criticalMissing.push('遊戲畫布');

    const domIssues = [];
    if (!creator || !gamePanel) domIssues.push('主畫面缺失');
    if (creator && gamePanel && !visible(creator) && !visible(gamePanel)) domIssues.push('所有主畫面皆隱藏');
    if (canvas && document.body?.dataset?.coffeeShipScene !== 'deck' && visible(gamePanel) && (canvas.width < 300 || canvas.height < 180)) domIssues.push('畫布尺寸異常');

    const staleModals = Object.entries(modalClasses).filter(([className,id]) => {
      if (!document.body?.classList.contains(className)) return false;
      const panel = document.getElementById(id);
      return !panel || !visible(panel);
    }).map(([className]) => className);

    const health = {
      ok:criticalMissing.length === 0 && domIssues.length === 0,
      playable:(modules.game || runtime.safeMode) && !!canvas && !!gamePanel,
      modules,
      criticalMissing,
      domIssues,
      staleModals,
      scene:document.body?.dataset?.coffeeShipScene || 'cafe',
      safeMode:runtime.safeMode,
      recentErrors:runtime.errors.slice(-5),
      uptimeMs:Date.now()-runtime.startedAt,
      version:VERSION
    };
    runtime.lastHealth = health;
    return health;
  }

  function updateStatus() {
    const {status} = ensureRuntimeUi();
    const health = checkHealth();
    status.classList.toggle('is-warning',!health.ok && health.playable);
    status.classList.toggle('is-error',!health.playable);
    if (!health.playable) status.textContent = '⚠️ 核心修復';
    else if (!health.ok) status.textContent = '🛠 執行修復';
    else status.textContent = '✅ 運作正常';
    status.setAttribute('aria-label',health.ok ? '遊戲運作正常' : '修復遊戲執行狀態');
  }

  function releaseInputs() {
    window.COFFEE_SHIP_GAME_OPTIMIZER?.releaseMovementButtons?.();
    window.dispatchEvent(new KeyboardEvent('keyup',{key:'ArrowUp',bubbles:true}));
    window.dispatchEvent(new KeyboardEvent('keyup',{key:'ArrowDown',bubbles:true}));
    window.dispatchEvent(new KeyboardEvent('keyup',{key:'ArrowLeft',bubbles:true}));
    window.dispatchEvent(new KeyboardEvent('keyup',{key:'ArrowRight',bubbles:true}));
  }

  function repair(reason='automatic') {
    let changed = false;
    const creator = document.getElementById('creator');
    const gamePanel = document.getElementById('gamePanel');
    const canvas = document.getElementById('game');
    const savedAvatar = localStorage.getItem('coffeeShipAvatar');

    releaseInputs();
    window.COFFEE_SHIP_GAME_OPTIMIZER?.recoverStorageSpace?.();

    if (creator && gamePanel && !visible(creator) && !visible(gamePanel)) {
      if (savedAvatar) gamePanel.classList.remove('hidden');
      else creator.classList.remove('hidden');
      changed = true;
    }

    if (canvas && document.body?.dataset?.coffeeShipScene !== 'deck' && gamePanel && visible(gamePanel)) {
      if (canvas.dataset.deckPaused === 'true' || canvas.width < 300 || canvas.height < 180) {
        canvas.width = 960;
        canvas.height = 576;
        canvas.removeAttribute('data-deck-paused');
        changed = true;
      }
      if (canvas.style.display === 'none') {
        canvas.style.removeProperty('display');
        changed = true;
      }
    }

    Object.entries(modalClasses).forEach(([className,id]) => {
      if (!document.body?.classList.contains(className)) return;
      const panel = document.getElementById(id);
      if (!panel || !visible(panel)) {
        document.body.classList.remove(className);
        changed = true;
      }
    });

    const startButton = document.getElementById('startBtn');
    if (startButton && creator && visible(creator) && startButton.disabled) {
      startButton.disabled = false;
      if (!startButton.textContent?.trim()) startButton.textContent = '登上 Coffee Ship';
      changed = true;
    }

    if (changed) {
      runtime.recoveries += 1;
      document.body.dataset.runtimeRecovery = String(runtime.recoveries);
      window.dispatchEvent(new CustomEvent('coffee-ship:runtime-repaired',{detail:{reason,recoveries:runtime.recoveries}}));
    }
    updateStatus();
    return {changed,health:runtime.lastHealth};
  }

  function saveAvatarFromForm() {
    const name = document.getElementById('playerName')?.value?.trim() || 'Guest';
    const hair = document.getElementById('hairColor')?.value || '#2b1d16';
    const shirt = document.getElementById('shirtColor')?.value || '#c96a4a';
    const animal = localStorage.getItem('coffeeShipAnimal') || 'human';
    const avatar = {name,hair,shirt,animal,coffeeType:''};
    try {
      localStorage.setItem('coffeeShipAvatar',JSON.stringify(avatar));
      localStorage.setItem('coffeeShipAnimal',animal);
    } catch {}
    return avatar;
  }

  function startSafeMode() {
    if (runtime.safeMode || window.COFFEE_SHIP_GAME_API) return false;
    const canvas = document.getElementById('game');
    const gamePanel = document.getElementById('gamePanel');
    if (!canvas || !gamePanel) return false;
    runtime.safeMode = true;
    document.body.classList.add('coffee-ship-safe-mode');
    canvas.classList.add('cs-safe-canvas');
    canvas.width = 960;
    canvas.height = 576;
    const ctx = canvas.getContext('2d');
    const avatar = readJson('coffeeShipAvatar',{name:'Guest',animal:'human',shirt:'#c96a4a'});
    const player = {name:avatar.name || 'Guest',x:480,y:360,speed:3,emote:'',emoteUntil:0};
    const keys = new Set();
    const mobile = {up:false,down:false,left:false,right:false};

    let badge = document.getElementById('coffeeShipSafeModeBadge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'coffeeShipSafeModeBadge';
      badge.className = 'cs-safe-mode-badge';
      badge.textContent = '安全模式・核心功能仍可使用';
      gamePanel.appendChild(badge);
    }

    function draw() {
      if (!runtime.safeMode) return;
      runtime.safeModeRaf = requestAnimationFrame(draw);
      if (document.hidden || window.COFFEE_SHIP_DECK?.isDeckOpen?.()) return;
      let dx = 0,dy = 0;
      if (keys.has('ArrowUp') || keys.has('w') || mobile.up) dy -= player.speed;
      if (keys.has('ArrowDown') || keys.has('s') || mobile.down) dy += player.speed;
      if (keys.has('ArrowLeft') || keys.has('a') || mobile.left) dx -= player.speed;
      if (keys.has('ArrowRight') || keys.has('d') || mobile.right) dx += player.speed;
      if (dx && dy) { dx *= .707; dy *= .707; }
      player.x = Math.max(70,Math.min(890,player.x+dx));
      player.y = Math.max(100,Math.min(520,player.y+dy));

      const gradient = ctx.createLinearGradient(0,0,0,576);
      gradient.addColorStop(0,'#17142a');
      gradient.addColorStop(1,'#35253b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0,0,960,576);
      ctx.fillStyle = '#70503d';
      ctx.fillRect(95,82,770,410);
      ctx.fillStyle = '#2a1e2e';
      ctx.fillRect(115,104,730,360);
      ctx.fillStyle = '#76536a';
      for (let x=130;x<835;x+=48) for (let y=120;y<450;y+=48) ctx.fillRect(x,y,2,2);
      ctx.fillStyle = '#4f8f73';
      ctx.fillRect(140,120,310,70);
      ctx.fillStyle = '#d7bb79';
      ctx.fillRect(540,125,210,55);
      ctx.font = '900 20px system-ui,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff4d8';
      ctx.fillText('Coffee Ship 安全咖啡廳',480,62);
      ctx.font = '900 44px system-ui,sans-serif';
      ctx.fillText(avatar.animal === 'cat' ? '🐱' : avatar.animal === 'dog' ? '🐶' : '🙂',player.x,player.y);
      ctx.font = '800 14px system-ui,sans-serif';
      ctx.fillStyle = '#79d0b1';
      ctx.fillText(player.name,player.x,player.y+28);
      if (player.emoteUntil > Date.now()) {
        ctx.font = '28px system-ui,sans-serif';
        ctx.fillText(player.emote,player.x,player.y-38);
      }
      ctx.font = '800 15px system-ui,sans-serif';
      ctx.fillStyle = '#d7cbd7';
      ctx.fillText('WASD／方向鍵移動・互動按鈕可前往甲板',480,540);
    }

    window.addEventListener('keydown',event => {
      const key = event.key?.length === 1 ? event.key.toLowerCase() : event.key;
      keys.add(key);
      if (event.code === 'Space') { player.emote='✨'; player.emoteUntil=Date.now()+1200; }
    });
    window.addEventListener('keyup',event => keys.delete(event.key?.length === 1 ? event.key.toLowerCase() : event.key));
    document.querySelectorAll('[data-move]').forEach(button => {
      const direction = button.dataset.move;
      const on = () => { mobile[direction] = true; };
      const off = () => { mobile[direction] = false; };
      button.addEventListener('pointerdown',on);
      button.addEventListener('pointerup',off);
      button.addEventListener('pointerleave',off);
      button.addEventListener('pointercancel',off);
    });
    document.getElementById('sitBtn')?.addEventListener('click',() => window.COFFEE_SHIP_DECK?.switchToDeck?.(),true);
    document.getElementById('coffeeBtn')?.addEventListener('click',() => toast('安全模式暫停咖啡功能，可前往甲板釣魚。','warning'),true);
    document.getElementById('emoteBtn')?.addEventListener('click',() => { player.emote='✨'; player.emoteUntil=Date.now()+1200; },true);

    window.COFFEE_SHIP_GAME_API = {
      player,
      npcs:[],
      getPearls:() => Math.max(0,Number(localStorage.getItem('coffeeShipPearls') || 0)),
      setPearls:value => localStorage.setItem('coffeeShipPearls',String(Math.max(0,Math.floor(Number(value) || 0)))),
      safeMode:true
    };
    draw();
    updateStatus();
    window.dispatchEvent(new CustomEvent('coffee-ship:safe-mode',{detail:{version:VERSION}}));
    return true;
  }

  function installStartFallback() {
    const startButton = document.getElementById('startBtn');
    if (!startButton || startButton.dataset.runtimeFallback === '1') return;
    startButton.dataset.runtimeFallback = '1';
    startButton.addEventListener('click',() => {
      const creator = document.getElementById('creator');
      const gamePanel = document.getElementById('gamePanel');
      setTimeout(() => {
        if (!creator || !gamePanel || creator.classList.contains('hidden') || !gamePanel.classList.contains('hidden')) return;
        const avatar = saveAvatarFromForm();
        creator.classList.add('hidden');
        gamePanel.classList.remove('hidden');
        const name = document.getElementById('avatarName');
        if (name) name.textContent = avatar.name;
        const started = startSafeMode();
        recordError('boot-recovery','正常登船處理未完成，已啟動安全模式。');
        toast(started ? '主核心未完成啟動，已切換安全模式；甲板與釣魚仍可使用。' : '已修復登船畫面。','warning',4200);
      },420);
    },true);
  }

  function init() {
    ensureRuntimeUi();
    installStartFallback();
    repair('initial');

    window.addEventListener('error',event => {
      const message = cleanErrorText(event.message || event.error || '資源載入錯誤');
      if (/ResizeObserver loop/i.test(message)) return;
      const entry = recordError('error',event.error || message,{file:event.filename,line:event.lineno});
      if (/game\.js|deck\.js|runtime-core|SyntaxError|ReferenceError/i.test(`${entry.file} ${entry.message}`) && Date.now()-runtime.lastToastAt > 1800) {
        toast('部分模組發生錯誤，遊戲已啟用執行保護。','error',3500);
      }
    },true);

    window.addEventListener('unhandledrejection',event => {
      const message = cleanErrorText(event.reason?.message || event.reason);
      if (/Firebase|network|fetch|Load failed/i.test(message)) return;
      recordError('promise',event.reason || message);
    });

    window.addEventListener('coffee-ship:storage-full',() => {
      toast('裝置儲存空間接近上限，已自動整理舊紀錄。','warning',3600);
      repair('storage-full');
    });

    window.addEventListener('pageshow',event => {
      if (event.persisted) setTimeout(() => repair('page-cache-return'),80);
    });
    window.addEventListener('orientationchange',() => setTimeout(() => repair('orientation'),260));
    document.addEventListener('visibilitychange',() => {
      if (!document.hidden) setTimeout(() => repair('visibility-return'),80);
    });

    setTimeout(() => {
      const health = checkHealth();
      if (!health.playable) {
        repair('boot-health');
        const creator = document.getElementById('creator');
        if (creator && creator.classList.contains('hidden')) startSafeMode();
      }
      updateStatus();
    },3200);

    setInterval(() => {
      const health = checkHealth();
      if (health.staleModals.length || health.domIssues.length) repair('periodic-health');
      else updateStatus();
    },7000);

    window.COFFEE_SHIP_RUNTIME = {
      health:checkHealth,
      repair,
      toast,
      errors:() => runtime.errors.slice(),
      startSafeMode,
      state:runtime,
      version:VERSION
    };
    document.body.dataset.runtimeVersion = String(VERSION);
    window.dispatchEvent(new CustomEvent('coffee-ship:runtime-ready',{detail:{version:VERSION}}));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();