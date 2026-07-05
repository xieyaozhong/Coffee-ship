(() => {
  'use strict';
  if (window.__COFFEE_SHIP_DECK_ENTRY_FIX_V3__) return;
  window.__COFFEE_SHIP_DECK_ENTRY_FIX_V3__ = true;
  window.__COFFEE_SHIP_DECK_ENTRY_FIX__ = true;

  const CAFE_DOOR = { x:835, y:300, radius:125 };
  const GUIDE_ORIGIN = { x:700, y:104 };
  const GUIDE_SIZE = { w:170, h:285 };
  let entering = false;
  let guide = null;
  let toastTimer = 0;
  let lastNear = null;

  function deckApi() {
    return window.COFFEE_SHIP_DECK || null;
  }

  function isDeckOpen() {
    return !!deckApi()?.isDeckOpen?.();
  }

  function isPortOpen() {
    const port = document.getElementById('portOverlay');
    return !!port && !port.classList.contains('hidden');
  }

  function isGameActive() {
    const creator = document.getElementById('creator');
    const game = document.getElementById('gamePanel');
    return !!game && !game.classList.contains('hidden') && (!creator || creator.classList.contains('hidden'));
  }

  function isCafeOpen() {
    return isGameActive() && !isDeckOpen() && !isPortOpen();
  }

  function playerPosition() {
    return window.COFFEE_SHIP_PLAYER_POS || window.COFFEE_SHIP_GAME_API?.player || { x:480, y:360 };
  }

  function isNearCafeDoor() {
    const player = playerPosition();
    return Math.hypot(Number(player.x || 0) - CAFE_DOOR.x, Number(player.y || 0) - CAFE_DOOR.y) < CAFE_DOOR.radius;
  }

  function addStyle() {
    if (document.getElementById('cafeDeckDoorStyle')) return;
    const style = document.createElement('style');
    style.id = 'cafeDeckDoorStyle';
    style.textContent = `
      #cafeDeckDoorGuide{
        position:fixed;z-index:12000;width:${GUIDE_SIZE.w}px;height:${GUIDE_SIZE.h}px;
        transform-origin:top left;pointer-events:none;display:block;color:#fff4d8;
        font-family:ui-rounded,system-ui,-apple-system,sans-serif;filter:drop-shadow(0 10px 12px rgba(0,0,0,.35));
      }
      #cafeDeckDoorGuide.hidden{display:none!important}
      .deck-door-route{
        position:absolute;left:-112px;top:151px;width:205px;height:52px;border-radius:999px;
        border:2px dashed rgba(156,232,240,.54);background:linear-gradient(90deg,rgba(121,208,177,0),rgba(121,208,177,.18),rgba(156,232,240,.36));
        box-shadow:0 0 18px rgba(121,208,177,.22) inset;overflow:hidden;
      }
      .deck-door-route::before{
        content:'›  ›  ›';position:absolute;right:12px;top:4px;color:#9ce8f0;font-size:34px;font-weight:1000;
        letter-spacing:7px;text-shadow:0 0 12px rgba(156,232,240,.9);animation:deckRouteMove 1.25s linear infinite;
      }
      .deck-door-sign{
        position:absolute;left:32px;top:0;width:134px;min-height:58px;padding:8px 8px 7px;box-sizing:border-box;
        border:3px solid #d7bb79;border-radius:13px;background:linear-gradient(180deg,#4c334a,#2b1c31);
        box-shadow:0 6px 0 #18101e,0 0 22px rgba(215,187,121,.28);text-align:center;
      }
      .deck-door-sign::before,.deck-door-sign::after{content:'';position:absolute;top:-17px;width:4px;height:18px;background:#d7bb79}
      .deck-door-sign::before{left:25px}.deck-door-sign::after{right:25px}
      .deck-door-sign strong{display:block;font-size:18px;line-height:1.1;letter-spacing:1px;text-shadow:2px 2px 0 #120b17}
      .deck-door-sign small{display:block;margin-top:3px;color:#9ce8f0;font-size:9px;font-weight:1000;letter-spacing:2px}
      .deck-door-frame{
        position:absolute;left:72px;top:69px;width:90px;height:163px;box-sizing:border-box;
        border:8px solid #76503e;border-radius:45px 45px 11px 11px;background:#171421;
        box-shadow:0 0 0 4px #d7bb79,0 0 0 8px #3d2a32,0 0 26px rgba(156,232,240,.35);
        overflow:hidden;
      }
      .deck-door-frame::before{
        content:'';position:absolute;inset:8px;border-radius:32px 32px 5px 5px;
        background:linear-gradient(180deg,#163148 0%,#1d4960 45%,#0d2030 46%,#101522 100%);
        box-shadow:inset 0 0 0 3px rgba(156,232,240,.38);
      }
      .deck-door-sea{
        position:absolute;left:15px;right:15px;top:24px;height:62px;border-radius:27px 27px 8px 8px;
        background:linear-gradient(180deg,#152a53 0 45%,#217b9b 46% 60%,#153c59 61% 100%);
        box-shadow:inset 0 0 0 3px #9ce8f0,0 0 15px rgba(156,232,240,.45);
      }
      .deck-door-sea::before{content:'✦   ·   ✦';position:absolute;left:9px;top:4px;color:#fff4d8;font-size:9px;letter-spacing:3px}
      .deck-door-sea::after{content:'≈ ≈ ≈';position:absolute;left:8px;bottom:4px;color:#9ce8f0;font-size:13px;font-weight:1000;letter-spacing:1px}
      .deck-door-wheel{position:absolute;left:28px;bottom:29px;width:28px;height:28px;border:4px solid #d7bb79;border-radius:50%;box-shadow:0 0 10px rgba(215,187,121,.45)}
      .deck-door-wheel::before,.deck-door-wheel::after{content:'';position:absolute;left:11px;top:-6px;width:4px;height:40px;background:#d7bb79;border-radius:3px}
      .deck-door-wheel::after{transform:rotate(90deg)}
      .deck-door-lamp{position:absolute;right:0;top:95px;width:21px;height:31px;border:3px solid #76503e;border-radius:8px 8px 11px 11px;background:#ffe16b;box-shadow:0 0 18px rgba(255,225,107,.85);animation:deckLampPulse 1.7s ease-in-out infinite}
      .deck-door-mat{position:absolute;left:60px;top:239px;width:112px;height:28px;border:3px solid #76536a;border-radius:50%;background:#211728;box-shadow:0 6px 0 rgba(0,0,0,.28)}
      .deck-door-mat::after{content:'⚓  DECK';position:absolute;inset:3px 0 0;text-align:center;color:#d7bb79;font-size:12px;font-weight:1000;letter-spacing:1px}
      #cafeDeckDoorAction{
        position:absolute;left:22px;top:270px;width:148px;min-height:43px;padding:8px 9px;border:3px solid #76536a;border-radius:14px;
        background:#302137;color:#fff4d8;font-size:14px;font-weight:1000;box-shadow:0 6px 0 #160f1d;
        pointer-events:auto;cursor:pointer;white-space:nowrap;touch-action:manipulation;
      }
      #cafeDeckDoorGuide.is-near .deck-door-frame{box-shadow:0 0 0 4px #ffe16b,0 0 0 8px #4f8f73,0 0 38px rgba(121,208,177,.82);animation:deckDoorReady 1.15s ease-in-out infinite}
      #cafeDeckDoorGuide.is-near .deck-door-route{border-color:rgba(255,225,107,.86);background:linear-gradient(90deg,rgba(255,225,107,0),rgba(255,225,107,.25),rgba(121,208,177,.45))}
      #cafeDeckDoorGuide.is-near #cafeDeckDoorAction{border-color:#ffe16b;background:#4f8f73;color:#fffdf4;box-shadow:0 6px 0 #254c3c,0 0 20px rgba(121,208,177,.55);animation:deckActionReady .85s ease-in-out infinite alternate}
      #cafeDeckDoorToast{
        position:fixed;left:50%;bottom:calc(118px + env(safe-area-inset-bottom));z-index:31000;max-width:min(84vw,420px);
        transform:translateX(-50%);padding:11px 15px;border:2px solid #d7bb79;border-radius:14px;background:rgba(21,16,32,.97);
        color:#fff4d8;font-weight:1000;text-align:center;box-shadow:0 8px 0 rgba(0,0,0,.3);pointer-events:none;
      }
      #cafeDeckDoorToast.hidden{display:none!important}
      @keyframes deckRouteMove{0%{transform:translateX(-18px);opacity:.45}50%{opacity:1}100%{transform:translateX(12px);opacity:.45}}
      @keyframes deckLampPulse{0%,100%{filter:brightness(.82)}50%{filter:brightness(1.35)}}
      @keyframes deckDoorReady{0%,100%{filter:brightness(.95)}50%{filter:brightness(1.16)}}
      @keyframes deckActionReady{from{transform:translateY(0)}to{transform:translateY(-3px)}}
      @media(max-width:760px){#cafeDeckDoorToast{bottom:calc(150px + env(safe-area-inset-bottom));font-size:14px}}
      @media(prefers-reduced-motion:reduce){.deck-door-route::before,.deck-door-lamp,#cafeDeckDoorGuide.is-near .deck-door-frame,#cafeDeckDoorGuide.is-near #cafeDeckDoorAction{animation:none!important}}
    `;
    document.head.appendChild(style);
  }

  function ensureGuide() {
    if (guide?.isConnected) return guide;
    guide = document.createElement('section');
    guide.id = 'cafeDeckDoorGuide';
    guide.className = 'hidden';
    guide.setAttribute('aria-label','通往甲板的艙門');
    guide.innerHTML = `
      <div class="deck-door-route" aria-hidden="true"></div>
      <div class="deck-door-sign"><strong>⚓ 前往甲板</strong><small>DECK ACCESS</small></div>
      <div class="deck-door-frame" aria-hidden="true">
        <div class="deck-door-sea"></div>
        <div class="deck-door-wheel"></div>
      </div>
      <div class="deck-door-lamp" aria-hidden="true"></div>
      <div class="deck-door-mat" aria-hidden="true"></div>
      <button id="cafeDeckDoorAction" type="button">沿著箭頭走近艙門</button>`;
    document.body.appendChild(guide);
    guide.querySelector('#cafeDeckDoorAction').addEventListener('click',event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (isNearCafeDoor()) enterDeck();
      else showToast('請先走到咖啡廳右側發光的「前往甲板」艙門');
    },true);
    return guide;
  }

  function ensureToast() {
    let toast = document.getElementById('cafeDeckDoorToast');
    if (toast) return toast;
    toast = document.createElement('div');
    toast.id = 'cafeDeckDoorToast';
    toast.className = 'hidden';
    toast.setAttribute('role','status');
    document.body.appendChild(toast);
    return toast;
  }

  function showToast(text) {
    const toast = ensureToast();
    toast.textContent = text;
    toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'),2200);
  }

  function positionGuide() {
    const element = ensureGuide();
    const canvas = document.getElementById('game');
    if (!canvas || !isCafeOpen()) {
      element.classList.add('hidden');
      return;
    }
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      element.classList.add('hidden');
      return;
    }
    const scaleX = rect.width / 960;
    const scaleY = rect.height / 576;
    element.style.left = `${rect.left + GUIDE_ORIGIN.x * scaleX}px`;
    element.style.top = `${rect.top + GUIDE_ORIGIN.y * scaleY}px`;
    element.style.transform = `scale(${scaleX},${scaleY})`;
    element.classList.remove('hidden');
  }

  function enterDeck() {
    const api = deckApi();
    if (!api?.switchToDeck || isDeckOpen() || entering || !isNearCafeDoor()) return false;
    entering = true;
    showToast('⚓ 正在前往甲板…');
    try {
      api.switchToDeck();
      window.dispatchEvent(new CustomEvent('coffee-ship:scene',{detail:{scene:'deck',source:'cafe-door'}}));
      ensureGuide().classList.add('hidden');
      return true;
    } finally {
      setTimeout(() => { entering = false; },500);
    }
  }

  function onKeyDown(event) {
    const key = event.key?.length === 1 ? event.key.toLowerCase() : event.key;
    if (key !== 'e' || !isCafeOpen() || !isNearCafeDoor()) return;
    if (enterDeck()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  function onInteraction(event) {
    if (!event.target.closest?.('#sitBtn') || !isCafeOpen() || !isNearCafeDoor()) return;
    if (enterDeck()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  function syncHint() {
    const element = ensureGuide();
    positionGuide();
    const button = document.getElementById('sitBtn');
    if (!isCafeOpen()) {
      element.classList.add('hidden');
      if (button && button.dataset.deckDoorOriginalText) button.textContent = button.dataset.deckDoorOriginalText;
      return;
    }

    const near = isNearCafeDoor();
    element.classList.toggle('is-near',near);
    const action = element.querySelector('#cafeDeckDoorAction');
    if (action) action.textContent = near ? '🚪 登上甲板' : '沿著箭頭走近艙門';

    if (button) {
      if (!button.dataset.deckDoorOriginalText) button.dataset.deckDoorOriginalText = button.textContent || '互動';
      button.textContent = near ? '🚪 甲板' : button.dataset.deckDoorOriginalText;
      button.title = near ? '登上甲板' : '互動／摸貓／坐下';
      button.setAttribute('aria-label',near ? '登上甲板' : '互動、摸貓或坐下');
      button.classList.toggle('deck-door-ready',near);
    }

    if (near !== lastNear) {
      lastNear = near;
      if (near) showToast('已抵達艙門：按 E 或「🚪 甲板」登上甲板');
    }
  }

  function init() {
    addStyle();
    ensureGuide();
    ensureToast();
    window.addEventListener('keydown',onKeyDown,true);
    document.addEventListener('click',onInteraction,true);
    window.addEventListener('resize',positionGuide,{passive:true});
    window.addEventListener('scroll',positionGuide,{passive:true});
    window.addEventListener('coffee-ship:scene',syncHint);
    window.addEventListener('coffee-ship:entered',syncHint);
    const timer = setInterval(syncHint,180);
    document.addEventListener('visibilitychange',() => {
      if (document.hidden) entering = false;
      else syncHint();
    });
    window.COFFEE_SHIP_DECK_ENTRY = {
      enterDeck,
      isNearCafeDoor,
      position:CAFE_DOOR,
      showGuide:syncHint
    };
    setTimeout(() => clearInterval(timer),1000 * 60 * 45);
    syncHint();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();