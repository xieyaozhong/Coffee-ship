(() => {
  'use strict';

  function deckApi() {
    return window.COFFEE_SHIP_DECK || null;
  }

  function getCafePlayerPos() {
    return window.COFFEE_SHIP_PLAYER_POS || { x:480, y:360 };
  }

  function isNearCafeDeckDoor() {
    const p = getCafePlayerPos();
    return Math.hypot(p.x - 835, p.y - 300) < 125;
  }

  function isDeckOpen() {
    const api = deckApi();
    if (api?.isDeckOpen) return api.isDeckOpen();
    const deck = document.getElementById('deckOverlay');
    return !!deck && !deck.classList.contains('hidden');
  }

  function isPortOpen() {
    const port = document.getElementById('portOverlay');
    return !!port && !port.classList.contains('hidden');
  }

  function nearDeckDoor() {
    const api = deckApi();
    return !!api?.nearDeckDoor?.();
  }

  function fireE() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key:'e', code:'KeyE', bubbles:true, cancelable:true }));
    setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key:'e', code:'KeyE', bubbles:true, cancelable:true }));
    }, 90);
  }

  function enterDeck() {
    const api = deckApi();
    if (api?.switchToDeck) api.switchToDeck();
    else fireE();
  }

  function useDeckAction() {
    const api = deckApi();
    if (api?.handleAction) api.handleAction();
    else fireE();
  }

  function addTip() {
    const panel = document.getElementById('gamePanel');
    if (!panel || document.getElementById('mobileDeckDoorTip')) return;
    const tip = document.createElement('div');
    tip.id = 'mobileDeckDoorTip';
    tip.style.cssText = 'display:none;position:absolute;left:50%;transform:translateX(-50%);z-index:14000;padding:6px 10px;border-radius:10px;background:rgba(21,16,32,.92);border:2px solid #79d0b1;color:#fff4d8;font-weight:900;font-size:13px;pointer-events:none;white-space:nowrap';
    panel.appendChild(tip);

    function syncTipPosition() {
      const game = document.getElementById('game');
      if (!game) return;
      tip.style.top = `${Math.max(8, game.offsetTop + 10)}px`;
    }

    syncTipPosition();
    window.addEventListener('resize', syncTipPosition);

    setInterval(() => {
      const gameVisible = !panel.classList.contains('hidden');
      if (!gameVisible || isPortOpen()) {
        tip.style.display = 'none';
        return;
      }
      if (isDeckOpen()) {
        tip.textContent = nearDeckDoor() ? '🚪 按「互動」進入咖啡廳' : '🌊 左側艙門可回咖啡廳';
        tip.style.display = nearDeckDoor() ? 'block' : 'none';
        return;
      }
      const show = isNearCafeDeckDoor();
      tip.textContent = '🚪 按「互動」前往甲板';
      tip.style.display = show ? 'block' : 'none';
    }, 220);
  }

  function patchButton() {
    const btn = document.getElementById('sitBtn');
    if (!btn || btn.dataset.deckFix === 'v4') return;
    btn.dataset.deckFix = 'v4';
    btn.addEventListener('click', event => {
      if (isPortOpen()) return;
      if (isDeckOpen()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        useDeckAction();
        return;
      }
      if (isNearCafeDeckDoor()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        enterDeck();
      }
    }, true);
  }

  function init() {
    document.getElementById('deckMobileReturnBtn')?.remove();
    addTip();
    patchButton();
    setInterval(patchButton, 800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();