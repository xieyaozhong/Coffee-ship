(() => {
  function isDeckOpen() {
    const deck = document.getElementById('deckOverlay');
    return !!deck && !deck.classList.contains('hidden');
  }

  function keyEvent(type, key) {
    window.dispatchEvent(new KeyboardEvent(type, { key, code: key, bubbles: true, cancelable: true }));
  }

  function holdKey(button, key) {
    let down = false;
    const start = (event) => {
      if (!isDeckOpen()) return;
      event.preventDefault();
      event.stopPropagation();
      if (!down) {
        down = true;
        keyEvent('keydown', key);
      }
    };
    const end = () => {
      if (!down) return;
      down = false;
      keyEvent('keyup', key);
    };
    button.addEventListener('pointerdown', start, true);
    button.addEventListener('pointerup', end, true);
    button.addEventListener('pointerleave', end, true);
    button.addEventListener('pointercancel', end, true);
  }

  function bindMobileDeckControls() {
    const map = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
    document.querySelectorAll('[data-move]').forEach(button => {
      const key = map[button.dataset.move];
      if (key) holdKey(button, key);
    });

    document.getElementById('sitBtn')?.addEventListener('click', (event) => {
      if (!isDeckOpen()) return;
      event.preventDefault();
      event.stopPropagation();
      keyEvent('keydown', 'e');
      setTimeout(() => keyEvent('keyup', 'e'), 80);
    }, true);

    document.getElementById('emoteBtn')?.addEventListener('click', (event) => {
      if (!isDeckOpen()) return;
      event.preventDefault();
      event.stopPropagation();
      keyEvent('keydown', ' ');
      setTimeout(() => keyEvent('keyup', ' '), 80);
    }, true);
  }

  function preventCafeMovementBehindDeck() {
    window.addEventListener('keydown', (event) => {
      if (!isDeckOpen()) return;
      const k = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const blocked = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'e', ' '];
      if (blocked.includes(k)) {
        event.stopPropagation();
      }
    }, true);
  }

  function addStatusBadge() {
    const panel = document.getElementById('gamePanel');
    if (!panel || document.getElementById('sceneStatusBadge')) return;
    const badge = document.createElement('div');
    badge.id = 'sceneStatusBadge';
    badge.style.cssText = 'position:absolute;left:18px;bottom:18px;z-index:11;padding:6px 10px;border-radius:10px;background:rgba(21,16,32,.86);border:2px solid #76536a;color:#fff4d8;font-weight:900;font-size:13px;pointer-events:none';
    badge.textContent = '☕ Cafe';
    panel.appendChild(badge);
    setInterval(() => { badge.textContent = isDeckOpen() ? '🌊 Deck' : '☕ Cafe'; }, 350);
  }

  function init() {
    bindMobileDeckControls();
    preventCafeMovementBehindDeck();
    addStatusBadge();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
