(() => {
  'use strict';
  if (window.__COFFEE_SHIP_FISHING_UI_COORDINATOR__) return;
  window.__COFFEE_SHIP_FISHING_UI_COORDINATOR__ = true;

  let scene = window.COFFEE_SHIP_SCENE || 'cafe';
  let fishingState = null;
  let syncQueued = false;

  function isDeck() {
    return scene === 'deck' || !!window.COFFEE_SHIP_DECK?.isDeckOpen?.();
  }

  function sync() {
    syncQueued = false;
    const deckOpen = isDeck();
    const coffee = document.getElementById('coffeeBtn');
    const log = document.getElementById('fishDexBtn');

    if (log) {
      log.style.display = deckOpen ? '' : 'none';
      log.setAttribute('aria-hidden',deckOpen ? 'false' : 'true');
    }

    if (coffee) {
      if (!deckOpen) {
        coffee.textContent = '☕';
        coffee.title = '點咖啡';
        coffee.setAttribute('aria-label','點咖啡');
        coffee.classList.remove('fishing-ready','fishing-wait');
      } else if (!fishingState) {
        coffee.textContent = '🎣 釣魚';
        coffee.title = '前往右側釣魚區後下竿';
        coffee.setAttribute('aria-label','釣魚');
      }
    }
  }

  function queueSync() {
    if (syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(sync);
  }

  function init() {
    window.addEventListener('coffee-ship:scene',event => {
      scene = event.detail?.scene || window.COFFEE_SHIP_SCENE || 'cafe';
      if (scene !== 'deck') fishingState = null;
      queueSync();
    });

    window.addEventListener('coffee-ship:fishing-state',event => {
      fishingState = event.detail || null;
      queueSync();
    });

    window.addEventListener('coffee-ship:fishing-api-ready',queueSync);

    const observer = new MutationObserver(queueSync);
    observer.observe(document.body,{subtree:true,childList:true});
    queueSync();

    window.COFFEE_SHIP_FISHING_UI = {sync:queueSync,getScene:() => scene};
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();