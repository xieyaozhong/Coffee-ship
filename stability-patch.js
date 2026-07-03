(() => {
  function isDeckOpen() {
    const deck = document.getElementById('deckOverlay');
    return !!deck && !deck.classList.contains('hidden');
  }

  function isPortOpen() {
    const port = document.getElementById('portOverlay');
    return !!port && !port.classList.contains('hidden');
  }

  function keyEvent(type, key) {
    window.dispatchEvent(new KeyboardEvent(type, { key, code: key, bubbles: true, cancelable: true }));
  }

  function holdKey(button, key) {
    let down = false;
    const start = (event) => {
      if (!isDeckOpen() && !isPortOpen()) return;
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
      if (!isDeckOpen() && !isPortOpen()) return;
      event.preventDefault();
      event.stopPropagation();
      keyEvent('keydown', 'e');
      setTimeout(() => keyEvent('keyup', 'e'), 80);
    }, true);

    document.getElementById('emoteBtn')?.addEventListener('click', (event) => {
      if (!isDeckOpen() && !isPortOpen()) return;
      event.preventDefault();
      event.stopPropagation();
      keyEvent('keydown', ' ');
      setTimeout(() => keyEvent('keyup', ' '), 80);
    }, true);
  }

  function preventCafeMovementBehindDeck() {
    window.addEventListener('keydown', (event) => {
      if (!isDeckOpen() && !isPortOpen()) return;
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
    setInterval(() => {
      badge.textContent = isPortOpen() ? '⚓ Port' : (isDeckOpen() ? '🌊 Deck' : '☕ Cafe');
    }, 350);
  }

  function loadScript(src, flag) {
    if (document.querySelector(`script[data-${flag}="true"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.dataset[flag] = 'true';
    document.body.appendChild(script);
  }

  function init() {
    bindMobileDeckControls();
    preventCafeMovementBehindDeck();
    addStatusBadge();
    loadScript('role-sprites.js', 'roleSprites');
    loadScript('role-mobile-ability.js', 'roleAbility');
    loadScript('change-character.js', 'changeCharacter');
    loadScript('mobile-home-safe.js', 'mobileHomeSafe');
    loadScript('mobile-game-layout.js', 'mobileGameLayout');
    loadScript('quality-polish.js', 'qualityPolish');
    loadScript('mobile-deck-fix.js', 'mobileDeckFix');
    loadScript('deck-role-fix.js', 'deckRoleFix');
    loadScript('deck-fishing.js', 'deckFishing');
    loadScript('deck-fishing-specials.js', 'deckFishingSpecials');
    loadScript('deck-shark-event.js', 'deckSharkEvent');
    loadScript('lanar-bottle-letters.js', 'lanarBottleLetters');
    loadScript('ariel-bottle-letters.js', 'arielBottleLetters');
    loadScript('mobile-modal-fix.js', 'mobileModalFix');
    loadScript('mobile-shark-modal-fix.js', 'mobileSharkModalFix');
    loadScript('port.js', 'portScene');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();