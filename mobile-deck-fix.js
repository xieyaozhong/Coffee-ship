(() => {
  'use strict';

  function getPlayerPos() {
    return window.COFFEE_SHIP_PLAYER_POS || { x: 480, y: 360 };
  }

  function isNearCafeDeckDoor() {
    const p = getPlayerPos();
    return Math.hypot(p.x - 835, p.y - 300) < 125;
  }

  function isDeckOpen() {
    const deck = document.getElementById('deckOverlay');
    return !!deck && !deck.classList.contains('hidden');
  }

  function isPortOpen() {
    const port = document.getElementById('portOverlay');
    return !!port && !port.classList.contains('hidden');
  }

  function fireE() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', code: 'KeyE', bubbles: true, cancelable: true }));
    setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'e', code: 'KeyE', bubbles: true, cancelable: true })), 90);
  }

  function addTip() {
    const panel = document.getElementById('gamePanel');
    if (!panel || document.getElementById('mobileDeckDoorTip')) return;
    const tip = document.createElement('div');
    tip.id = 'mobileDeckDoorTip';
    tip.textContent = '🚪 按「摸」前往甲板';
    tip.style.cssText = 'display:none;position:absolute;right:18px;top:74px;z-index:14;padding:6px 10px;border-radius:10px;background:rgba(21,16,32,.9);border:2px solid #76536a;color:#fff4d8;font-weight:900;font-size:13px;pointer-events:none';
    panel.appendChild(tip);
    setInterval(() => {
      const show = !document.getElementById('gamePanel')?.classList.contains('hidden') && !isDeckOpen() && !isPortOpen() && isNearCafeDeckDoor();
      tip.style.display = show ? 'block' : 'none';
    }, 250);
  }

  function patchButton() {
    const btn = document.getElementById('sitBtn');
    if (!btn || btn.dataset.deckFix === 'true') return;
    btn.dataset.deckFix = 'true';
    btn.addEventListener('click', event => {
      if (!isDeckOpen() && !isPortOpen() && isNearCafeDeckDoor()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        fireE();
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
