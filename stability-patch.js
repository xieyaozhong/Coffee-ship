(() => {
  'use strict';
  if (window.__COFFEE_SHIP_STAGED_LOADER_V2__) return;
  window.__COFFEE_SHIP_STAGED_LOADER_V2__ = true;

  let heavyLoaded = false;
  let controlsBound = false;

  function isDeckOpen() {
    const api = window.COFFEE_SHIP_DECK;
    if (api && typeof api.isDeckOpen === 'function') return api.isDeckOpen();
    const deck = document.getElementById('deckOverlay');
    return !!deck && !deck.classList.contains('hidden');
  }

  function isPortOpen() {
    const port = document.getElementById('portOverlay');
    return !!port && !port.classList.contains('hidden');
  }

  function isGameActive() {
    const creator = document.getElementById('creator');
    const game = document.getElementById('gamePanel');
    return !!game && !game.classList.contains('hidden') && (!creator || creator.classList.contains('hidden'));
  }

  function keyEvent(type, key) {
    window.dispatchEvent(new KeyboardEvent(type, { key, code:key, bubbles:true, cancelable:true }));
  }

  function holdKey(button, key) {
    if (!button || !key || button.dataset.sceneHoldBound === 'true') return;
    button.dataset.sceneHoldBound = 'true';
    let down = false;
    const start = event => {
      if (!isDeckOpen() && !isPortOpen()) return;
      event.preventDefault();
      event.stopPropagation();
      if (!down) { down = true; keyEvent('keydown', key); }
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
    if (controlsBound) return;
    controlsBound = true;
    const map = { up:'ArrowUp', down:'ArrowDown', left:'ArrowLeft', right:'ArrowRight' };
    document.querySelectorAll('[data-move]').forEach(button => holdKey(button, map[button.dataset.move]));

    document.getElementById('sitBtn')?.addEventListener('click', event => {
      if (isDeckOpen() && !isPortOpen()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const api = window.COFFEE_SHIP_DECK;
        if (api && typeof api.handleAction === 'function') api.handleAction();
        else { keyEvent('keydown','e'); setTimeout(()=>keyEvent('keyup','e'),80); }
        return;
      }
      if (!isPortOpen()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      keyEvent('keydown','e');
      setTimeout(()=>keyEvent('keyup','e'),80);
    }, true);

    document.getElementById('emoteBtn')?.addEventListener('click', event => {
      if (!isDeckOpen() && !isPortOpen()) return;
      event.preventDefault();
      event.stopPropagation();
      keyEvent('keydown',' ');
      setTimeout(()=>keyEvent('keyup',' '),80);
    }, true);

    window.addEventListener('keydown', event => {
      if (!isDeckOpen() && !isPortOpen()) return;
      const key = event.key && event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','e',' '].includes(key)) event.stopPropagation();
    }, true);
  }

  function updateStatusBadge() {
    const badge = document.getElementById('sceneStatusBadge');
    if (!badge) return;
    badge.style.display = isGameActive() ? 'block' : 'none';
    badge.textContent = isPortOpen() ? '⚓ Port' : (isDeckOpen() ? '🌊 Deck' : '☕ Cafe');
  }

  function addStatusBadge() {
    const panel = document.getElementById('gamePanel');
    if (!panel || document.getElementById('sceneStatusBadge')) return;
    const badge = document.createElement('div');
    badge.id = 'sceneStatusBadge';
    badge.style.cssText = 'display:none;position:absolute;left:18px;bottom:18px;z-index:11;padding:6px 10px;border-radius:10px;background:rgba(21,16,32,.86);border:2px solid #76536a;color:#fff4d8;font-weight:900;font-size:13px;pointer-events:none';
    badge.textContent = '☕ Cafe';
    panel.appendChild(badge);
    updateStatusBadge();
    window.addEventListener('coffee-ship:entered', updateStatusBadge);
    window.addEventListener('coffee-ship:scene', updateStatusBadge);
    setInterval(updateStatusBadge, 1200);
  }

  function normalizedPath(src) {
    try { return new URL(src, location.href).pathname.split('/').pop(); }
    catch { return String(src).split('?')[0].split('/').pop(); }
  }

  function alreadyLoaded(src) {
    const target = normalizedPath(src);
    return Array.from(document.scripts).some(script => normalizedPath(script.src || script.getAttribute('src') || '') === target);
  }

  function loadScript(src, flag) {
    if (alreadyLoaded(src) || document.querySelector(`script[data-${flag}="true"]`)) return Promise.resolve();
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.dataset[flag] = 'true';
      script.onload = () => resolve();
      script.onerror = () => { console.warn(`Optional module failed: ${src}`); resolve(); };
      document.body.appendChild(script);
    });
  }

  async function loadSequence(entries) {
    for (const [src, flag] of entries) await loadScript(src, flag);
  }

  function schedule(callback) {
    if ('requestIdleCallback' in window) requestIdleCallback(callback, { timeout:1200 });
    else setTimeout(callback, 220);
  }

  async function loadCoreEnhancements() {
    await loadSequence([
      ['role-sprites.js?v=boot-v2','roleSprites'],
      ['role-mobile-ability.js?v=boot-v2','roleAbility'],
      ['change-character.js?v=boot-v2','changeCharacter'],
      ['mobile-home-safe.js?v=boot-v2','mobileHomeSafe'],
      ['mobile-game-layout.js?v=boot-v2','mobileGameLayout'],
      ['quality-polish.js?v=boot-v2','qualityPolish'],
      ['black-cat-nox.js?v=boot-v2','blackCatNox'],
      ['mobile-deck-fix.js?v=boot-v2','mobileDeckFix'],
      ['deck-role-fix.js?v=boot-v2','deckRoleFix'],
      ['npc-behavior-polish.js?v=boot-v2','npcBehaviorPolish'],
      ['port.js?v=boot-v2','portScene']
    ]);
  }

  async function loadHeavyGameplay() {
    if (heavyLoaded) return;
    heavyLoaded = true;
    await loadSequence([
      ['carnival-loot-pool.js?v=boot-v2','carnivalLootPool'],
      ['carnival-loot-upgrade.js?v=boot-v2','carnivalLootUpgrade'],
      ['loot-bottle-core.js?v=boot-v2','lootBottleCore'],
      ['bottle-series-restore.js?v=boot-v2','bottleSeriesRestore'],
      ['lanar-bottles.js?v=boot-v2','lanarBottles'],
      ['ariel-chapter1-bottles.js?v=boot-v2','arielBottles'],
      ['coco-bottles.js?v=boot-v2','cocoBottles'],
      ['blackbeard-bottles.js?v=boot-v2','blackbeardBottles'],
      ['mad-priest-bottles.js?v=boot-v2','madPriestBottles'],
      ['carnival-island-bottles.js?v=boot-v2','carnivalIslandBottles'],
      ['original-emoji-restore.js?v=boot-v2','originalEmojiRestore'],
      ['ocean-friends-events.js?v=boot-v2','oceanFriendsEvents'],
      ['single-fishing-result.js?v=boot-v2','singleFishingResult'],
      ['mermaid-event.js?v=boot-v2','mermaidEvent'],
      ['deck-fishing.js?v=boot-v2','deckFishing'],
      ['fishing-cast-animation.js?v=boot-v2','fishingCastAnimation'],
      ['deck-fishing-specials.js?v=boot-v2','deckFishingSpecials'],
      ['extra-fish-50.js?v=boot-v2','extraFish50'],
      ['deck-shark-event.js?v=boot-v2','deckSharkEvent'],
      ['mutant-creatures.js?v=boot-v2','mutantCreatures'],
      ['mobile-mutant-modal-fix.js?v=boot-v2','mobileMutantModalFix'],
      ['lanar-bottle-letters.js?v=boot-v2','lanarBottleLetters'],
      ['ariel-bottle-letters.js?v=boot-v2','arielBottleLetters'],
      ['island-triangle-letters.js?v=boot-v2','islandTriangleLetters'],
      ['blackbeard-treasure-letters.js?v=boot-v2','blackbeardTreasureLetters'],
      ['story-modal-fix.js?v=boot-v2','storyModalFix'],
      ['animation-overlap-guard.js?v=boot-v2','animationOverlapGuard'],
      ['bottle-dex-patch.js?v=boot-v2','bottleDexPatch'],
      ['fishing-rare-animation.js?v=boot-v2','fishingRareAnimation'],
      ['mobile-modal-fix.js?v=boot-v2','mobileModalFix'],
      ['mobile-shark-modal-fix.js?v=boot-v2','mobileSharkModalFix']
    ]);
    window.dispatchEvent(new CustomEvent('coffee-ship:modules-ready'));
  }

  function triggerHeavyLoad() {
    if (!isGameActive()) return;
    schedule(loadHeavyGameplay);
  }

  function init() {
    bindMobileDeckControls();
    addStatusBadge();
    schedule(loadCoreEnhancements);
    window.addEventListener('coffee-ship:entered', triggerHeavyLoad, { once:true });
    if (isGameActive()) triggerHeavyLoad();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();