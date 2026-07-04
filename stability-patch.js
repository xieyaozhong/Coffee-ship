(() => {
  function isDeckOpen() {
    const api = window.COFFEE_SHIP_DECK;
    if (api?.isDeckOpen) return api.isDeckOpen();
    const deck = document.getElementById('deckOverlay');
    return !!deck && !deck.classList.contains('hidden');
  }

  function isPortOpen() {
    const port = document.getElementById('portOverlay');
    return !!port && !port.classList.contains('hidden');
  }

  function keyEvent(type, key) {
    window.dispatchEvent(new KeyboardEvent(type, { key, code:key, bubbles:true, cancelable:true }));
  }

  function holdKey(button, key) {
    let down = false;
    const start = event => {
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
    const map = { up:'ArrowUp', down:'ArrowDown', left:'ArrowLeft', right:'ArrowRight' };
    document.querySelectorAll('[data-move]').forEach(button => {
      const key = map[button.dataset.move];
      if (key) holdKey(button, key);
    });

    document.getElementById('sitBtn')?.addEventListener('click', event => {
      if (isDeckOpen() && !isPortOpen()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const api = window.COFFEE_SHIP_DECK;
        if (api?.handleAction) api.handleAction();
        else {
          keyEvent('keydown', 'e');
          setTimeout(() => keyEvent('keyup', 'e'), 80);
        }
        return;
      }
      if (!isPortOpen()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      keyEvent('keydown', 'e');
      setTimeout(() => keyEvent('keyup', 'e'), 80);
    }, true);

    document.getElementById('emoteBtn')?.addEventListener('click', event => {
      if (!isDeckOpen() && !isPortOpen()) return;
      event.preventDefault();
      event.stopPropagation();
      keyEvent('keydown', ' ');
      setTimeout(() => keyEvent('keyup', ' '), 80);
    }, true);
  }

  function preventCafeMovementBehindDeck() {
    window.addEventListener('keydown', event => {
      if (!isDeckOpen() && !isPortOpen()) return;
      const k = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const blocked = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','e',' '];
      if (blocked.includes(k)) event.stopPropagation();
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
    loadScript('mobile-game-layout.js?v=deck-ui-4', 'mobileGameLayout');
    loadScript('quality-polish.js', 'qualityPolish');
    loadScript('black-cat-nox.js', 'blackCatNox');
    loadScript('mobile-deck-fix.js?v=deck-ui-4', 'mobileDeckFix');
    loadScript('deck-role-fix.js?v=deck-ui-4', 'deckRoleFix');
    loadScript('deck-fishing.js', 'deckFishing');
    loadScript('deck-fishing-specials.js', 'deckFishingSpecials');
    loadScript('extra-fish-50.js', 'extraFish50');
    loadScript('mermaid-event.js', 'mermaidEvent');
    loadScript('deck-shark-event.js', 'deckSharkEvent');
    loadScript('mutant-creatures.js', 'mutantCreatures');
    loadScript('mobile-mutant-modal-fix.js', 'mobileMutantModalFix');
    loadScript('lanar-bottle-letters.js', 'lanarBottleLetters');
    loadScript('ariel-bottle-letters.js', 'arielBottleLetters');
    loadScript('island-triangle-letters.js', 'islandTriangleLetters');
    loadScript('blackbeard-treasure-letters.js', 'blackbeardTreasureLetters');
    loadScript('mad-priest-bottles.js', 'madPriestBottles');
    loadScript('carnival-island-bottles.js', 'carnivalIslandBottles');
    loadScript('story-modal-fix.js', 'storyModalFix');
    loadScript('animation-overlap-guard.js', 'animationOverlapGuard');
    loadScript('bottle-dex-patch.js', 'bottleDexPatch');
    loadScript('fishing-rare-animation.js', 'fishingRareAnimation');
    loadScript('mobile-modal-fix.js', 'mobileModalFix');
    loadScript('mobile-shark-modal-fix.js', 'mobileSharkModalFix');
    loadScript('port.js', 'portScene');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();