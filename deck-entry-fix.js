(() => {
  'use strict';
  if (window.__COFFEE_SHIP_DECK_ENTRY_FIX__) return;
  window.__COFFEE_SHIP_DECK_ENTRY_FIX__ = true;

  const CAFE_DOOR = { x:835, y:300, radius:125 };
  let entering = false;
  let modalObserver = null;

  function deckApi() {
    return window.COFFEE_SHIP_DECK || null;
  }

  function isDeckOpen() {
    return !!deckApi()?.isDeckOpen?.();
  }

  function playerPosition() {
    return window.COFFEE_SHIP_PLAYER_POS || { x:480, y:360 };
  }

  function isNearCafeDoor() {
    const player = playerPosition();
    return Math.hypot(player.x - CAFE_DOOR.x, player.y - CAFE_DOOR.y) < CAFE_DOOR.radius;
  }

  function enterDeck() {
    const api = deckApi();
    if (!api?.switchToDeck || isDeckOpen() || entering || !isNearCafeDoor()) return false;

    entering = true;
    try {
      api.switchToDeck();
      window.dispatchEvent(new CustomEvent('coffee-ship:scene', {
        detail: { scene:'deck', source:'cafe-door' }
      }));
      return true;
    } finally {
      setTimeout(() => { entering = false; }, 500);
    }
  }

  function onKeyDown(event) {
    const key = event.key?.length === 1 ? event.key.toLowerCase() : event.key;
    if (key !== 'e' || isDeckOpen() || !isNearCafeDoor()) return;
    if (enterDeck()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  function onInteraction(event) {
    if (!event.target.closest?.('#sitBtn') || isDeckOpen() || !isNearCafeDoor()) return;
    if (enterDeck()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  function syncHint() {
    if (isDeckOpen()) return;
    const button = document.getElementById('sitBtn');
    if (!button) return;
    const near = isNearCafeDoor();
    button.title = near ? '前往甲板' : '互動／摸貓／坐下';
    button.setAttribute('aria-label', near ? '前往甲板' : '互動、摸貓或坐下');
  }

  function addMobileFishingStyle() {
    if (document.getElementById('mobileFishingUiFixStyle')) return;
    const style = document.createElement('style');
    style.id = 'mobileFishingUiFixStyle';
    style.textContent = `
      .fishing-card-close{
        display:none;
        border:0;
        border-radius:12px;
        background:#5b3e4e;
        color:#fff4d8;
        font-weight:1000;
        cursor:pointer;
      }
      @media(max-width:760px){
        body.fishing-result-open,
        body.fishdex-open{
          overflow:hidden!important;
          touch-action:none;
        }
        body.fishing-result-open::before,
        body.fishdex-open::before{
          content:'';
          position:fixed;
          inset:0;
          z-index:19980;
          background:rgba(8,6,15,.72);
          backdrop-filter:blur(2px);
          -webkit-backdrop-filter:blur(2px);
        }
        #fishingCard.fishing-card{
          position:fixed!important;
          left:12px!important;
          right:12px!important;
          top:auto!important;
          bottom:calc(12px + env(safe-area-inset-bottom))!important;
          transform:none!important;
          width:auto!important;
          min-width:0!important;
          max-width:none!important;
          max-height:min(58dvh,500px)!important;
          margin:0!important;
          padding:15px 15px 18px!important;
          overflow-x:hidden!important;
          overflow-y:auto!important;
          overscroll-behavior:contain;
          -webkit-overflow-scrolling:touch;
          box-sizing:border-box!important;
          z-index:20000!important;
          pointer-events:auto!important;
          border-radius:22px!important;
          text-align:left!important;
          line-height:1.45!important;
          font-size:15px!important;
        }
        #fishingCard.fishing-card.hidden{
          display:none!important;
        }
        #fishingCard .fishing-card-close{
          display:inline-flex!important;
          position:sticky;
          top:0;
          z-index:3;
          float:right;
          width:42px;
          height:42px;
          margin:0 0 8px 10px;
          align-items:center;
          justify-content:center;
          font-size:20px;
          box-shadow:0 4px 0 rgba(0,0,0,.28);
        }
        #fishingCard>div:first-of-type{
          padding-top:4px;
          padding-right:4px;
          font-size:20px!important;
          line-height:1.35!important;
        }
        #fishingCard .unique-emoji{
          max-width:70px!important;
          max-height:70px!important;
        }
        #fishingCard .letter-text{
          max-height:25dvh;
          overflow:auto;
          font-size:14px;
        }
        #fishDexPanel.fishdex-panel,
        #fishDexPanel.backpack-safe-panel{
          position:fixed!important;
          left:10px!important;
          right:10px!important;
          top:calc(10px + env(safe-area-inset-top))!important;
          bottom:calc(10px + env(safe-area-inset-bottom))!important;
          transform:none!important;
          width:auto!important;
          max-width:none!important;
          height:auto!important;
          max-height:none!important;
          margin:0!important;
          padding:14px!important;
          overflow-y:auto!important;
          overscroll-behavior:contain;
          -webkit-overflow-scrolling:touch;
          box-sizing:border-box!important;
          z-index:20000!important;
          border-radius:22px!important;
        }
        #fishDexPanel .fishdex-close,
        #fishDexPanel .backpack-close{
          position:sticky!important;
          top:0!important;
          z-index:5!important;
          float:right!important;
          min-width:74px!important;
          min-height:42px!important;
          margin:0 0 10px 10px!important;
        }
        body.fishing-result-open .mobile-controls,
        body.fishing-result-open #backpackSafeOpenBtn,
        body.fishing-result-open #sceneStatusBadge,
        body.fishing-result-open #deckTip,
        body.fishdex-open .mobile-controls,
        body.fishdex-open #backpackSafeOpenBtn,
        body.fishdex-open #sceneStatusBadge,
        body.fishdex-open #deckTip{
          opacity:0!important;
          visibility:hidden!important;
          pointer-events:none!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function isVisible(element) {
    if (!element || element.classList.contains('hidden')) return false;
    const style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  function closeFishingResult() {
    const card = document.getElementById('fishingCard');
    card?.classList.add('hidden');
    document.body.classList.remove('fishing-result-open');
  }

  function closeFishDex() {
    const panel = document.getElementById('fishDexPanel');
    panel?.classList.add('hidden');
    panel?.classList.remove('backpack-safe-panel');
    panel?.style.removeProperty('display');
    document.body.classList.remove('fishdex-open');
  }

  function ensureFishingCloseButton() {
    const card = document.getElementById('fishingCard');
    if (!card || card.querySelector('.fishing-card-close')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'fishing-card-close';
    button.setAttribute('aria-label', '關閉釣魚結果');
    button.textContent = '✕';
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeFishingResult();
    }, true);
    card.prepend(button);
  }

  function syncModalState() {
    const card = document.getElementById('fishingCard');
    const panel = document.getElementById('fishDexPanel');
    const cardOpen = isVisible(card);
    const panelOpen = isVisible(panel);

    if (cardOpen) ensureFishingCloseButton();
    document.body.classList.toggle('fishing-result-open', cardOpen);
    document.body.classList.toggle('fishdex-open', panelOpen && !cardOpen);
  }

  function observeFishingUi() {
    const gamePanel = document.getElementById('gamePanel');
    if (!gamePanel || modalObserver) return;
    modalObserver = new MutationObserver(syncModalState);
    modalObserver.observe(gamePanel, {
      subtree:true,
      childList:true,
      attributes:true,
      attributeFilter:['class','style']
    });
    syncModalState();
  }

  function onGlobalClick(event) {
    const close = event.target.closest?.('.fishdex-close,.backpack-close,[data-close-backpack]');
    if (!close) return;
    setTimeout(syncModalState, 0);
  }

  function init() {
    addMobileFishingStyle();
    window.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('click', onInteraction, true);
    document.addEventListener('click', onGlobalClick, true);
    window.addEventListener('coffee-ship:scene', syncHint);
    const timer = setInterval(syncHint, 350);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) entering = false;
    });
    observeFishingUi();
    const uiTimer = setInterval(() => {
      observeFishingUi();
      syncModalState();
    }, 500);
    setTimeout(() => clearInterval(uiTimer), 1000 * 60 * 10);
    window.COFFEE_SHIP_DECK_ENTRY = { enterDeck, isNearCafeDoor };
    window.COFFEE_SHIP_MOBILE_MODAL = {
      closeFishingResult,
      closeFishDex,
      sync:syncModalState
    };
    setTimeout(() => clearInterval(timer), 1000 * 60 * 30);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();