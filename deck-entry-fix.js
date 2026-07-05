(() => {
  'use strict';
  if (window.__COFFEE_SHIP_DECK_ENTRY_FIX__) return;
  window.__COFFEE_SHIP_DECK_ENTRY_FIX__ = true;

  const CAFE_DOOR = { x:835, y:300, radius:125 };
  let entering = false;

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

  function init() {
    window.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('click', onInteraction, true);
    window.addEventListener('coffee-ship:scene', syncHint);
    const timer = setInterval(syncHint, 350);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) entering = false;
    });
    window.COFFEE_SHIP_DECK_ENTRY = { enterDeck, isNearCafeDoor };
    setTimeout(() => clearInterval(timer), 1000 * 60 * 30);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();