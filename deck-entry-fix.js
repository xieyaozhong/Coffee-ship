(() => {
  'use strict';
  if (window.__COFFEE_SHIP_DECK_ENTRY_FIX_V5__) return;
  window.__COFFEE_SHIP_DECK_ENTRY_FIX_V5__ = true;
  window.__COFFEE_SHIP_DECK_ENTRY_FIX__ = true;

  const CAFE_DOOR = { x:835, y:300, radius:225 };
  const GUIDE_ORIGIN = { x:785, y:182 };
  const GUIDE_SIZE = { w:100, h:220 };
  const SAFE_CAFE_PARKING = { x:190, y:470 };

  let entering = false;
  let guide = null;
  let lastNear = null;

  function deckApi() {
    return window.COFFEE_SHIP_DECK || null;
  }

  function gameApi() {
    return window.COFFEE_SHIP_GAME_API || null;
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
    return window.COFFEE_SHIP_PLAYER_POS || gameApi()?.player || { x:480, y:360 };
  }

  function distanceToCafeDoor() {
    const player = playerPosition();
    return Math.hypot(Number(player.x || 0) - CAFE_DOOR.x, Number(player.y || 0) - CAFE_DOOR.y);
  }

  function isNearCafeDoor() {
    return distanceToCafeDoor() < CAFE_DOOR.radius;
  }

  function parkCafeAvatar() {
    const player = gameApi()?.player;
    if (!player) return;

    player.x = SAFE_CAFE_PARKING.x;
    player.y = SAFE_CAFE_PARKING.y;
    player.sitting = false;
    window.COFFEE_SHIP_PLAYER_POS = {x:player.x,y:player.y};

    window.dispatchEvent(new CustomEvent('coffee-ship:multiplayer-passage-cleared',{
      detail:{scene:'deck',parking:{...SAFE_CAFE_PARKING}}
    }));
  }

  function addStyle() {
    if (document.getElementById('cafeDeckDoorStyleV5')) return;
    document.getElementById('cafeDeckDoorStyle')?.remove();
    document.getElementById('cafeDeckDoorStyleV4')?.remove();

    const style = document.createElement('style');
    style.id = 'cafeDeckDoorStyleV5';
    style.textContent = `
      #cafeDeckDoorGuide{
        position:absolute;
        z-index:24;
        width:${GUIDE_SIZE.w}px;
        height:${GUIDE_SIZE.h}px;
        transform-origin:top left;
        pointer-events:none;
        color:#fff4d8;
        font-family:ui-rounded,system-ui,-apple-system,sans-serif;
      }
      #cafeDeckDoorGuide.hidden{display:none!important}

      .cafe-deck-sign{
        position:absolute;
        left:10px;
        top:0;
        width:80px;
        height:25px;
        box-sizing:border-box;
        border:2px solid #d7bb79;
        border-radius:5px;
        background:#30202b;
        color:#ffe5ae;
        font-size:12px;
        font-weight:1000;
        line-height:21px;
        text-align:center;
        letter-spacing:1px;
        box-shadow:0 3px 0 rgba(0,0,0,.32);
      }

      #cafeDeckDoorAction{
        position:absolute;
        left:8px;
        top:31px;
        width:84px;
        height:162px;
        box-sizing:border-box;
        padding:0;
        border:6px solid #76503e;
        border-radius:7px 7px 3px 3px;
        background:#241923;
        box-shadow:0 0 0 3px #3a2630,0 6px 0 rgba(0,0,0,.28);
        pointer-events:none;
        cursor:default;
        overflow:hidden;
      }
      #cafeDeckDoorAction::before{
        content:'';
        position:absolute;
        inset:8px;
        border:3px solid #6f493a;
        border-radius:3px;
        background:
          linear-gradient(90deg,transparent 47%,#54362f 47% 53%,transparent 53%),
          linear-gradient(180deg,#6f493a 0 31%,#54362f 31% 34%,#6f493a 34% 66%,#54362f 66% 69%,#6f493a 69% 100%);
      }
      #cafeDeckDoorAction::after{
        content:'';
        position:absolute;
        right:15px;
        top:77px;
        width:7px;
        height:7px;
        border:2px solid #9c744a;
        border-radius:50%;
        background:#d7bb79;
      }

      .cafe-deck-threshold{
        position:absolute;
        left:4px;
        top:193px;
        width:92px;
        height:10px;
        border-radius:50%;
        background:rgba(21,16,32,.5);
      }

      .cafe-deck-hint{
        position:absolute;
        left:-22px;
        top:203px;
        width:144px;
        color:#79d0b1;
        font-size:11px;
        font-weight:1000;
        text-align:center;
        opacity:0;
      }

      #cafeDeckDoorGuide.is-near #cafeDeckDoorAction{
        border-color:#d7bb79;
        box-shadow:0 0 0 3px #4f8f73,0 6px 0 rgba(0,0,0,.28);
        pointer-events:auto;
        cursor:pointer;
      }
      #cafeDeckDoorGuide.is-near .cafe-deck-hint{opacity:1}

      @media(max-width:760px){
        .cafe-deck-hint{font-size:10px}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureGuide() {
    if (guide?.isConnected) return guide;

    document.getElementById('cafeDeckDoorGuide')?.remove();
    guide = document.createElement('section');
    guide.id = 'cafeDeckDoorGuide';
    guide.className = 'hidden';
    guide.setAttribute('aria-label','通往甲板的門');
    guide.innerHTML = `
      <div class="cafe-deck-sign">甲板</div>
      <button id="cafeDeckDoorAction" type="button" aria-label="登上甲板"></button>
      <div class="cafe-deck-threshold" aria-hidden="true"></div>
      <div class="cafe-deck-hint">E／互動・防堵入口</div>`;

    const panel = document.getElementById('gamePanel') || document.body;
    panel.appendChild(guide);

    guide.querySelector('#cafeDeckDoorAction').addEventListener('click',event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (isNearCafeDoor()) enterDeck();
    },true);

    return guide;
  }

  function positionGuide() {
    const element = ensureGuide();
    const canvas = document.getElementById('game');
    const panel = document.getElementById('gamePanel');

    if (!canvas || !panel || !isCafeOpen()) {
      element.classList.add('hidden');
      return;
    }

    const canvasRect = canvas.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    if (!canvasRect.width || !canvasRect.height) {
      element.classList.add('hidden');
      return;
    }

    const scaleX = canvasRect.width / 960;
    const scaleY = canvasRect.height / 576;
    element.style.left = `${canvasRect.left - panelRect.left + GUIDE_ORIGIN.x * scaleX}px`;
    element.style.top = `${canvasRect.top - panelRect.top + GUIDE_ORIGIN.y * scaleY}px`;
    element.style.transform = `scale(${scaleX},${scaleY})`;
    element.classList.remove('hidden');
  }

  function enterDeck() {
    const api = deckApi();
    if (!api?.switchToDeck || isDeckOpen() || entering || !isCafeOpen() || !isNearCafeDoor()) return false;

    entering = true;
    try {
      parkCafeAvatar();
      api.switchToDeck();
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
    const button = document.getElementById('sitBtn');
    positionGuide();

    if (!isCafeOpen()) {
      element.classList.add('hidden');
      if (button?.dataset.deckDoorOriginalText) {
        button.textContent = button.dataset.deckDoorOriginalText;
        button.title = '互動／摸貓／坐下';
        button.setAttribute('aria-label','互動、摸貓或坐下');
      }
      lastNear = false;
      return;
    }

    const near = isNearCafeDoor();
    element.classList.toggle('is-near',near);

    if (button) {
      if (!button.dataset.deckDoorOriginalText) button.dataset.deckDoorOriginalText = button.textContent || '互動';
      button.textContent = near ? '🚪 甲板' : button.dataset.deckDoorOriginalText;
      button.title = near ? '登上甲板（多人防堵入口）' : '互動／摸貓／坐下';
      button.setAttribute('aria-label',near ? '登上甲板' : '互動、摸貓或坐下');
      button.classList.toggle('deck-door-ready',near);
    }

    if (near !== lastNear) {
      lastNear = near;
      window.dispatchEvent(new CustomEvent('coffee-ship:deck-door-state',{
        detail:{near,distance:distanceToCafeDoor(),radius:CAFE_DOOR.radius}
      }));
    }
  }

  function init() {
    addStyle();
    ensureGuide();
    window.addEventListener('keydown',onKeyDown,true);
    document.addEventListener('click',onInteraction,true);
    window.addEventListener('resize',positionGuide,{passive:true});
    window.addEventListener('scroll',positionGuide,{passive:true});
    window.addEventListener('coffee-ship:scene',syncHint);
    window.addEventListener('coffee-ship:entered',syncHint);

    const timer = setInterval(syncHint,140);
    document.addEventListener('visibilitychange',() => {
      if (document.hidden) entering = false;
      else syncHint();
    });

    window.COFFEE_SHIP_DECK_ENTRY = {
      enterDeck,
      isNearCafeDoor,
      distanceToCafeDoor,
      position:CAFE_DOOR,
      parking:SAFE_CAFE_PARKING,
      showGuide:syncHint,
      version:5
    };

    setTimeout(() => clearInterval(timer),1000 * 60 * 45);
    syncHint();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();