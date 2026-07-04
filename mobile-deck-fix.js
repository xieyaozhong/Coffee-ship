(() => {
  'use strict';

  function deckApi() {
    return window.COFFEE_SHIP_DECK || null;
  }

  function getPlayerPos() {
    return window.COFFEE_SHIP_PLAYER_POS || { x: 480, y: 360 };
  }

  function isNearCafeDeckDoor() {
    const p = getPlayerPos();
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

  function fireE() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key:'e', code:'KeyE', bubbles:true, cancelable:true }));
    setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key:'e', code:'KeyE', bubbles:true, cancelable:true }));
    }, 90);
  }

  function goToDeck() {
    const api = deckApi();
    if (api?.switchToDeck) {
      api.switchToDeck();
      return;
    }
    fireE();
  }

  function backToCafe() {
    const api = deckApi();
    if (api?.switchToCafe) {
      api.switchToCafe();
      return;
    }
    const returnButton = document.getElementById('deckMobileReturnBtn');
    if (returnButton) {
      returnButton.click();
      return;
    }
    fireE();
  }

  function addTip() {
    const panel = document.getElementById('gamePanel');
    if (!panel || document.getElementById('mobileDeckDoorTip')) return;
    const tip = document.createElement('div');
    tip.id = 'mobileDeckDoorTip';
    tip.style.cssText = 'display:none;position:absolute;right:18px;top:74px;z-index:14000;padding:6px 10px;border-radius:10px;background:rgba(21,16,32,.9);border:2px solid #76536a;color:#fff4d8;font-weight:900;font-size:13px;pointer-events:none';
    panel.appendChild(tip);

    setInterval(() => {
      const gameVisible = !panel.classList.contains('hidden');
      if (!gameVisible || isPortOpen()) {
        tip.style.display = 'none';
        return;
      }
      if (isDeckOpen()) {
        tip.textContent = '🚪 右下角可直接回咖啡廳';
        tip.style.display = 'block';
        return;
      }
      const show = isNearCafeDeckDoor();
      tip.textContent = '🚪 按「摸／坐」前往甲板';
      tip.style.display = show ? 'block' : 'none';
    }, 250);
  }

  function patchButton() {
    const btn = document.getElementById('sitBtn');
    if (!btn || btn.dataset.deckFix === 'v3') return;
    btn.dataset.deckFix = 'v3';
    btn.addEventListener('click', event => {
      if (isDeckOpen() && !isPortOpen()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        backToCafe();
        return;
      }
      if (!isDeckOpen() && !isPortOpen() && isNearCafeDeckDoor()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        goToDeck();
      }
    }, true);
  }

  function init() {
    addTip();
    patchButton();
    setInterval(patchButton, 800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();