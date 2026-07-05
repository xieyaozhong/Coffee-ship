(() => {
  'use strict';
  if (window.__COFFEE_SHIP_INDIAN_COFFEE_V1__) return;
  window.__COFFEE_SHIP_INDIAN_COFFEE_V1__ = true;

  const EFFECT_ID = 'indian-spice-diarrhea';
  const EFFECT_KEY = 'coffeeShipCoffeeEffect';
  const ITEM = {
    id:EFFECT_ID,
    name:'印度香料咖啡',
    icon:'🫖',
    price:30,
    duration:240,
    desc:'遊戲中的失敗香料配方。喝完後肚子立刻開始強烈抗議。',
    effectLabel:'腸胃風暴：持續腹瀉 4 分鐘',
    aura:'#b97948',
    bonuses:{diarrhea:true}
  };

  const messages = [
    '肚子突然咕嚕咕嚕……',
    '香料威力開始發作了！',
    '你感覺自己離廁所不能太遠。',
    '腸胃風暴仍在持續。',
    'Momo 默默遞來了一大杯溫水。',
    '你努力裝作一切正常。'
  ];

  let activeLastTick = false;
  let lastTrailAt = 0;
  let lastAlertAt = 0;
  let trailSide = 1;

  function coffeeApi() {
    return window.COFFEE_SHIP_COFFEE || null;
  }

  function gameApi() {
    return window.COFFEE_SHIP_GAME_API || null;
  }

  function activeEffect() {
    return coffeeApi()?.getActiveEffect?.() || window.COFFEE_SHIP_COFFEE_EFFECT || null;
  }

  function isActive() {
    const effect = activeEffect();
    return !!effect && effect.id === EFFECT_ID && Number(effect.expiresAt || 0) > Date.now();
  }

  function remaining() {
    const effect = activeEffect();
    return Math.max(0,Math.ceil((Number(effect?.expiresAt || 0) - Date.now()) / 1000));
  }

  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${String(sec).padStart(2,'0')}`;
  }

  function addStyle() {
    if (document.getElementById('indianCoffeeStyle')) return;
    const style = document.createElement('style');
    style.id = 'indianCoffeeStyle';
    style.textContent = `
      #indianCoffeeStatus{
        position:absolute;
        right:18px;
        bottom:18px;
        z-index:54;
        display:none;
        max-width:min(310px,calc(100% - 36px));
        padding:9px 12px;
        border:2px solid #d7a66b;
        border-radius:12px;
        background:rgba(45,27,24,.93);
        color:#fff4d8;
        font:900 13px/1.35 ui-rounded,system-ui,sans-serif;
        box-shadow:0 6px 0 rgba(0,0,0,.28);
        pointer-events:none;
      }
      #indianCoffeeStatus.show{display:block}
      #indianCoffeeStatus strong{color:#ffd08c}
      .indian-coffee-trail{
        position:absolute;
        z-index:53;
        width:30px;
        height:30px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:22px;
        pointer-events:none;
        transform:translate(-50%,-50%);
        animation:indianCoffeeTrail 2.2s ease-out forwards;
        filter:drop-shadow(0 2px 1px rgba(0,0,0,.45));
      }
      .indian-coffee-cramp{animation:indianCoffeeCramp .28s linear 2}
      @keyframes indianCoffeeTrail{
        0%{opacity:0;transform:translate(-50%,-35%) scale(.45)}
        18%{opacity:1;transform:translate(-50%,-50%) scale(1)}
        100%{opacity:0;transform:translate(-50%,18px) scale(.75)}
      }
      @keyframes indianCoffeeCramp{
        0%,100%{transform:translateX(0)}
        25%{transform:translateX(-3px)}
        75%{transform:translateX(3px)}
      }
      @media(max-width:760px){
        #indianCoffeeStatus{right:10px;bottom:96px;font-size:11px;padding:7px 9px}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureStatus() {
    let status = document.getElementById('indianCoffeeStatus');
    if (status) return status;
    const panel = document.getElementById('gamePanel') || document.body;
    if (getComputedStyle(panel).position === 'static') panel.style.position = 'relative';
    status = document.createElement('div');
    status.id = 'indianCoffeeStatus';
    status.setAttribute('aria-live','polite');
    panel.appendChild(status);
    return status;
  }

  function visibleCanvas() {
    const deck = document.getElementById('deckOverlay');
    if (deck && !deck.classList.contains('hidden')) return deck;
    const port = document.getElementById('portOverlay');
    if (port && !port.classList.contains('hidden')) return port;
    return document.getElementById('game');
  }

  function currentPosition() {
    if (window.COFFEE_SHIP_DECK?.isDeckOpen?.()) {
      return window.COFFEE_SHIP_DECK.getPlayerPosition?.() || window.COFFEE_SHIP_PLAYER_POS || {x:480,y:360};
    }
    return window.COFFEE_SHIP_PLAYER_POS || gameApi()?.player || {x:480,y:360};
  }

  function spawnTrail() {
    const canvas = visibleCanvas();
    const panel = document.getElementById('gamePanel');
    if (!canvas || !panel) return;
    const canvasRect = canvas.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    if (!canvasRect.width || !canvasRect.height) return;

    const pos = currentPosition();
    const scaleX = canvasRect.width / 960;
    const scaleY = canvasRect.height / 576;
    trailSide *= -1;

    const particle = document.createElement('div');
    particle.className = 'indian-coffee-trail';
    particle.textContent = '💩';
    particle.style.left = `${canvasRect.left - panelRect.left + (Number(pos.x || 480) - trailSide * 13) * scaleX}px`;
    particle.style.top = `${canvasRect.top - panelRect.top + (Number(pos.y || 360) + 26) * scaleY}px`;
    panel.appendChild(particle);
    setTimeout(() => particle.remove(),2300);
  }

  function showAlert() {
    const panel = document.getElementById('gamePanel');
    const player = gameApi()?.player;
    const text = messages[Math.floor(Math.random() * messages.length)];

    if (player) {
      player.emote = Math.random() < .72 ? '💩' : '🤢';
      player.emoteTimer = 105;
    }

    panel?.classList.remove('indian-coffee-cramp');
    void panel?.offsetWidth;
    panel?.classList.add('indian-coffee-cramp');
    setTimeout(() => panel?.classList.remove('indian-coffee-cramp'),650);

    if (window.COFFEE_SHIP_DECK?.isDeckOpen?.()) {
      window.COFFEE_SHIP_DECK.showTip?.(`🫖 ${text}`,1400);
    }

    if (navigator.vibrate) {
      try { navigator.vibrate([25,35,25]); } catch {}
    }
  }

  function restoreEffect() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(EFFECT_KEY) || 'null'); }
    catch {}
    if (!saved || saved.id !== EFFECT_ID || Number(saved.expiresAt || 0) <= Date.now()) return;

    const player = gameApi()?.player;
    if (player && (!player.coffeeEffect || player.coffeeEffect.id !== EFFECT_ID)) {
      player.coffeeEffect = {...ITEM,expiresAt:Number(saved.expiresAt)};
      player.hasCoffee = true;
      player.coffeeType = ITEM.name;
      window.COFFEE_SHIP_COFFEE_EFFECT = {
        id:ITEM.id,name:ITEM.name,icon:ITEM.icon,label:ITEM.effectLabel,aura:ITEM.aura,
        expiresAt:Number(saved.expiresAt),bonuses:{...ITEM.bonuses}
      };
      coffeeApi()?.updateBadge?.();
    }
  }

  function installCoffee() {
    const menu = coffeeApi()?.menu;
    if (!Array.isArray(menu)) return false;
    if (!menu.some(item => item?.id === EFFECT_ID)) menu.push({...ITEM});
    restoreEffect();
    return true;
  }

  function tick() {
    installCoffee();
    const active = isActive();
    const status = ensureStatus();

    if (!active) {
      status.classList.remove('show');
      if (activeLastTick) {
        activeLastTick = false;
        status.textContent = '';
      }
      return;
    }

    activeLastTick = true;
    const seconds = remaining();
    status.innerHTML = `<strong>🫖 印度香料咖啡</strong><br>腹瀉持續中 · ${formatTime(seconds)}<br>這是遊戲中的失敗香料配方。`;
    status.classList.add('show');

    const now = Date.now();
    if (now - lastTrailAt > 820) {
      lastTrailAt = now;
      spawnTrail();
    }
    if (now - lastAlertAt > 5200) {
      lastAlertAt = now;
      showAlert();
    }
  }

  function init() {
    addStyle();
    ensureStatus();
    if (!installCoffee()) {
      let attempts = 0;
      const installer = setInterval(() => {
        attempts += 1;
        if (installCoffee() || attempts > 30) clearInterval(installer);
      },250);
    }
    setInterval(tick,280);
    window.COFFEE_SHIP_INDIAN_COFFEE = {item:ITEM,isActive,remaining,install:installCoffee,version:1};
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();