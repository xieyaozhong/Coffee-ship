(() => {
  'use strict';
  if (window.__COFFEE_SHIP_STAGED_LOADER_V3__) return;
  window.__COFFEE_SHIP_STAGED_LOADER_V3__ = true;

  let controlsBound = false;
  let deckModulesStarted = false;
  let storyModulesStarted = false;

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
  }

  function fileName(src) {
    try { return new URL(src, location.href).pathname.split('/').pop(); }
    catch { return String(src).split('?')[0].split('/').pop(); }
  }

  function alreadyLoaded(src) {
    const target = fileName(src);
    return Array.from(document.scripts).some(script => fileName(script.src || script.getAttribute('src') || '') === target);
  }

  function loadScript(src, flag) {
    if (alreadyLoaded(src) || document.querySelector(`script[data-${flag}="true"]`)) return Promise.resolve();
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.dataset[flag] = 'true';
      script.onload = resolve;
      script.onerror = () => { console.warn(`Optional module failed: ${src}`); resolve(); };
      document.body.appendChild(script);
    });
  }

  function pause(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  async function loadSequence(entries, gap=120) {
    for (const [src, flag] of entries) {
      if (document.hidden) await pause(500);
      await loadScript(src, flag);
      if (gap) await pause(gap);
    }
  }

  function idle(callback, timeout=1200) {
    if ('requestIdleCallback' in window) requestIdleCallback(callback, { timeout });
    else setTimeout(callback, 260);
  }

  async function loadCafeEnhancements() {
    await loadSequence([
      ['role-sprites.js?v=stable-npc-1','roleSprites'],
      ['role-mobile-ability.js?v=stable-npc-1','roleAbility'],
      ['change-character.js?v=stable-npc-1','changeCharacter'],
      ['mobile-home-safe.js?v=stable-npc-1','mobileHomeSafe'],
      ['mobile-game-layout.js?v=stable-npc-1','mobileGameLayout'],
      ['quality-polish.js?v=stable-npc-1','qualityPolish'],
      ['black-cat-nox.js?v=stable-npc-1','blackCatNox'],
      ['mobile-deck-fix.js?v=stable-npc-1','mobileDeckFix'],
      ['deck-role-fix.js?v=stable-npc-1','deckRoleFix'],
      ['port.js?v=stable-npc-1','portScene']
    ], 80);
  }

  async function loadStoryModules() {
    if (storyModulesStarted) return;
    storyModulesStarted = true;
    await loadSequence([
      ['carnival-loot-pool.js?v=stable-npc-1','carnivalLootPool'],
      ['carnival-loot-upgrade.js?v=stable-npc-1','carnivalLootUpgrade'],
      ['loot-bottle-core.js?v=stable-npc-1','lootBottleCore'],
      ['bottle-series-restore.js?v=stable-npc-1','bottleSeriesRestore'],
      ['lanar-bottles.js?v=stable-npc-1','lanarBottles'],
      ['ariel-chapter1-bottles.js?v=stable-npc-1','arielBottles'],
      ['coco-bottles.js?v=stable-npc-1','cocoBottles'],
      ['blackbeard-bottles.js?v=stable-npc-1','blackbeardBottles'],
      ['mad-priest-bottles.js?v=stable-npc-1','madPriestBottles'],
      ['carnival-island-bottles.js?v=stable-npc-1','carnivalIslandBottles'],
      ['original-emoji-restore.js?v=stable-npc-1','originalEmojiRestore'],
      ['ocean-friends-events.js?v=stable-npc-1','oceanFriendsEvents'],
      ['single-fishing-result.js?v=stable-npc-1','singleFishingResult'],
      ['lanar-bottle-letters.js?v=stable-npc-1','lanarBottleLetters'],
      ['ariel-bottle-letters.js?v=stable-npc-1','arielBottleLetters'],
      ['island-triangle-letters.js?v=stable-npc-1','islandTriangleLetters'],
      ['blackbeard-treasure-letters.js?v=stable-npc-1','blackbeardTreasureLetters'],
      ['story-modal-fix.js?v=stable-npc-1','storyModalFix'],
      ['bottle-dex-patch.js?v=stable-npc-1','bottleDexPatch']
    ], 420);
    window.dispatchEvent(new CustomEvent('coffee-ship:story-ready'));
  }

  async function loadDeckModules() {
    if (deckModulesStarted) return;
    deckModulesStarted = true;
    await loadSequence([
      ['deck-fishing.js?v=stable-npc-1','deckFishing'],
      ['fishing-cast-animation.js?v=stable-npc-1','fishingCastAnimation'],
      ['deck-fishing-specials.js?v=stable-npc-1','deckFishingSpecials'],
      ['extra-fish-50.js?v=stable-npc-1','extraFish50'],
      ['mermaid-event.js?v=stable-npc-1','mermaidEvent'],
      ['deck-shark-event.js?v=stable-npc-1','deckSharkEvent'],
      ['mutant-creatures.js?v=stable-npc-1','mutantCreatures'],
      ['mobile-mutant-modal-fix.js?v=stable-npc-1','mobileMutantModalFix'],
      ['animation-overlap-guard.js?v=stable-npc-1','animationOverlapGuard'],
      ['fishing-rare-animation.js?v=stable-npc-1','fishingRareAnimation'],
      ['mobile-modal-fix.js?v=stable-npc-1','mobileModalFix'],
      ['mobile-shark-modal-fix.js?v=stable-npc-1','mobileSharkModalFix']
    ], 260);
    idle(loadStoryModules, 2000);
    window.dispatchEvent(new CustomEvent('coffee-ship:deck-modules-ready'));
  }

  function requestDeckModules() {
    if (deckModulesStarted) return;
    idle(loadDeckModules, 900);
  }

  function bindLazyTriggers() {
    const watch = setInterval(() => {
      updateStatusBadge();
      if (isDeckOpen()) {
        clearInterval(watch);
        requestDeckModules();
      }
    }, 900);

    document.addEventListener('click', event => {
      if (event.target.closest?.('#backpackSafeOpenBtn, #fishDexBtn')) idle(loadStoryModules, 1200);
    }, true);

    window.addEventListener('keydown', event => {
      const key = event.key?.length===1 ? event.key.toLowerCase() : event.key;
      if ((key==='f'||key==='g') && isDeckOpen()) requestDeckModules();
    }, true);
  }

  function init() {
    bindMobileDeckControls();
    addStatusBadge();
    idle(loadCafeEnhancements, 700);
    bindLazyTriggers();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();