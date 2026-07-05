(() => {
  'use strict';
  if (window.__COFFEE_SHIP_DECK_ENTRY_FIX_V2__) return;
  window.__COFFEE_SHIP_DECK_ENTRY_FIX_V2__ = true;
  window.__COFFEE_SHIP_DECK_ENTRY_FIX__ = true;

  const CAFE_DOOR = { x:835, y:300, radius:125 };
  let entering = false;
  let observer = null;

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

  function loadFishingEventStack() {
    if (window.__COFFEE_SHIP_FISHING_EVENT_STACK_V2__ || document.querySelector('script[data-fishing-event-stack-loader="true"]')) return;
    const script = document.createElement('script');
    script.src = `fishing-event-stack.js?v=event-stack-2-${Date.now()}`;
    script.dataset.fishingEventStackLoader = 'true';
    script.async = false;
    document.body.appendChild(script);
  }

  function addStyle() {
    if (document.getElementById('deckEntryMobileUiStyle')) return;
    const style = document.createElement('style');
    style.id = 'deckEntryMobileUiStyle';
    style.textContent = `
      .fishing-card-close{display:none;border:0;border-radius:12px;background:#5b3e4e;color:#fff4d8;font-weight:1000;cursor:pointer}
      @media(max-width:760px){
        body.fishing-result-open,body.fishdex-open{overflow:hidden!important}
        body.fishing-result-open::before,body.fishdex-open::before{content:'';position:fixed;inset:0;z-index:19980;background:rgba(8,6,15,.72);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}
        body:not(.fishing-event-stack-open) #fishingCard.fishing-card{
          position:fixed!important;left:12px!important;right:12px!important;top:auto!important;
          bottom:calc(12px + env(safe-area-inset-bottom))!important;transform:none!important;
          width:auto!important;min-width:0!important;max-width:none!important;max-height:min(58dvh,500px)!important;
          margin:0!important;padding:15px 15px 18px!important;overflow:auto!important;box-sizing:border-box!important;
          z-index:20000!important;pointer-events:auto!important;border-radius:22px!important;text-align:left!important;
        }
        body:not(.fishing-event-stack-open) #fishingCard .fishing-card-close{
          display:inline-flex!important;position:sticky;top:0;z-index:3;float:right;width:42px;height:42px;
          margin:0 0 8px 10px;align-items:center;justify-content:center;font-size:20px;
        }
        #fishDexPanel.fishdex-panel,#fishDexPanel.backpack-safe-panel{
          position:fixed!important;left:10px!important;right:10px!important;
          top:calc(10px + env(safe-area-inset-top))!important;bottom:calc(10px + env(safe-area-inset-bottom))!important;
          transform:none!important;width:auto!important;max-width:none!important;height:auto!important;max-height:none!important;
          margin:0!important;padding:14px!important;overflow-y:auto!important;box-sizing:border-box!important;
          z-index:20000!important;border-radius:22px!important;-webkit-overflow-scrolling:touch;
        }
        #fishDexPanel .fishdex-close,#fishDexPanel .backpack-close{
          position:sticky!important;top:0!important;z-index:5!important;float:right!important;
          min-width:74px!important;min-height:42px!important;margin:0 0 10px 10px!important;
        }
        body.fishing-result-open .mobile-controls,body.fishing-result-open #backpackSafeOpenBtn,
        body.fishing-result-open #sceneStatusBadge,body.fishing-result-open #deckTip,
        body.fishdex-open .mobile-controls,body.fishdex-open #backpackSafeOpenBtn,
        body.fishdex-open #sceneStatusBadge,body.fishdex-open #deckTip{
          opacity:0!important;visibility:hidden!important;pointer-events:none!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function visible(element) {
    if (!element || element.classList.contains('hidden')) return false;
    const style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  function closeFishingResult() {
    const card = document.getElementById('fishingCard');
    card?.classList.add('hidden');
    card?.classList.remove('coffee-event-source-captured');
    document.body.classList.remove('fishing-result-open');
  }

  function closeFishDex() {
    const panel = document.getElementById('fishDexPanel');
    panel?.classList.add('hidden');
    panel?.classList.remove('backpack-safe-panel');
    panel?.style.removeProperty('display');
    document.body.classList.remove('fishdex-open');
  }

  function ensureCloseButton() {
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
    const cardOpen = visible(card) && !card?.classList.contains('coffee-event-source-captured');
    const panelOpen = visible(panel);
    if (cardOpen && !window.__COFFEE_SHIP_FISHING_EVENT_STACK_V2__) ensureCloseButton();
    document.body.classList.toggle('fishing-result-open', cardOpen);
    document.body.classList.toggle('fishdex-open', panelOpen && !cardOpen);
  }

  function observeUi() {
    const gamePanel = document.getElementById('gamePanel');
    if (!gamePanel || observer) return;
    observer = new MutationObserver(syncModalState);
    observer.observe(gamePanel, {
      subtree:true,
      childList:true,
      attributes:true,
      attributeFilter:['class','style']
    });
    syncModalState();
  }

  function init() {
    addStyle();
    loadFishingEventStack();
    window.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('click', onInteraction, true);
    window.addEventListener('coffee-ship:scene', syncHint);
    const hintTimer = setInterval(syncHint, 350);
    const uiTimer = setInterval(() => {
      loadFishingEventStack();
      observeUi();
      syncModalState();
    }, 500);
    observeUi();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) entering = false;
    });
    window.COFFEE_SHIP_DECK_ENTRY = { enterDeck, isNearCafeDoor };
    window.COFFEE_SHIP_MOBILE_MODAL = {
      closeFishingResult,
      closeFishDex,
      sync:syncModalState
    };
    setTimeout(() => clearInterval(hintTimer), 1000 * 60 * 30);
    setTimeout(() => clearInterval(uiTimer), 1000 * 60 * 10);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();