(() => {
  'use strict';
  if (window.__COFFEE_SHIP_STAGED_LOADER_V5__) return;
  window.__COFFEE_SHIP_STAGED_LOADER_V5__ = true;

  let controlsBound = false;
  let fishingCoreReady = false;
  let fishingCoreLoading = null;
  let fishingExtrasStarted = false;
  let storyModulesStarted = false;
  let replayingFishing = false;

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

  function keyEvent(type, key, code=key) {
    window.dispatchEvent(new KeyboardEvent(type, { key, code, bubbles:true, cancelable:true }));
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

  function bindMobileControls() {
    if (controlsBound) return;
    controlsBound = true;
    const map = { up:'ArrowUp', down:'ArrowDown', left:'ArrowLeft', right:'ArrowRight' };
    document.querySelectorAll('[data-move]').forEach(button => holdKey(button, map[button.dataset.move]));

    document.getElementById('emoteBtn')?.addEventListener('click', event => {
      if (!isDeckOpen() && !isPortOpen()) return;
      event.preventDefault();
      event.stopPropagation();
      keyEvent('keydown',' ','Space');
      setTimeout(() => keyEvent('keyup',' ','Space'),70);
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
    if (alreadyLoaded(src) || document.querySelector(`script[data-${flag}="true"]`)) return Promise.resolve(true);
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.dataset[flag] = 'true';
      script.onload = () => resolve(true);
      script.onerror = () => { console.warn(`Optional module failed: ${src}`); resolve(false); };
      document.body.appendChild(script);
    });
  }

  function pause(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  async function loadSequence(entries, gap=180) {
    for (const [src, flag] of entries) {
      while (document.hidden) await pause(500);
      await loadScript(src, flag);
      if (gap) await pause(gap);
    }
  }

  function idle(callback, timeout=1200) {
    if ('requestIdleCallback' in window) requestIdleCallback(callback, { timeout });
    else setTimeout(callback, 260);
  }

  function removeLegacyFishingUi() {
    document.getElementById('fishDexBtn')?.remove();
    document.getElementById('fishingMotionCanvas')?.remove();
    document.getElementById('fishingMotionStyle')?.remove();
    document.body.classList.remove('fishing-motion-active','fishdex-open');
    const panel = document.getElementById('fishDexPanel');
    if (panel && !panel.querySelector('#backpackManagerRoot')) panel.remove();
  }

  async function loadCafeEnhancements() {
    await loadSequence([
      ['role-sprites.js?v=deck-stable-1','roleSprites'],
      ['role-mobile-ability.js?v=deck-stable-1','roleAbility'],
      ['change-character.js?v=deck-stable-1','changeCharacter'],
      ['mobile-home-safe.js?v=deck-stable-1','mobileHomeSafe'],
      ['mobile-game-layout.js?v=deck-stable-1','mobileGameLayout'],
      ['quality-polish.js?v=deck-stable-1','qualityPolish'],
      ['black-cat-nox.js?v=deck-stable-1','blackCatNox'],
      ['npc-behavior-polish.js?v=deck-stable-1','npcBehaviorPolish'],
      ['port.js?v=deck-stable-1','portScene']
    ], 100);
  }

  function replayFishingKey() {
    if (!isDeckOpen()) return;
    replayingFishing = true;
    keyEvent('keydown','f','KeyF');
    setTimeout(() => {
      keyEvent('keyup','f','KeyF');
      replayingFishing = false;
    }, 50);
  }

  async function ensureFishingCore() {
    if (fishingCoreReady) return true;
    if (fishingCoreLoading) return fishingCoreLoading;

    window.COFFEE_SHIP_DECK?.showTip?.('🎣 正在載入釣魚功能…', 2200);
    fishingCoreLoading = (async () => {
      const ok = await loadScript('deck-fishing.js?v=simple-fishing-2','deckFishing');
      fishingCoreReady = ok;
      window.COFFEE_SHIP_FISHING_READY = ok;
      fishingCoreLoading = null;
      removeLegacyFishingUi();
      if (ok) idle(loadFishingExtras, 2000);
      else window.COFFEE_SHIP_DECK?.showTip?.('釣魚功能載入失敗，請稍後重試', 2200);
      return ok;
    })();

    return fishingCoreLoading;
  }

  async function handleFishingRequest() {
    if (replayingFishing || !isDeckOpen()) return;
    const ready = await ensureFishingCore();
    if (ready) replayFishingKey();
  }

  async function loadFishingExtras() {
    if (fishingExtrasStarted) return;
    fishingExtrasStarted = true;
    await loadSequence([
      ['extra-fish-50.js?v=simple-fishing-2','extraFish50'],
      ['deck-fishing-specials.js?v=simple-fishing-2','deckFishingSpecials']
    ], 900);
    removeLegacyFishingUi();
    window.dispatchEvent(new CustomEvent('coffee-ship:fishing-extras-ready'));
  }

  async function loadStoryModules() {
    if (storyModulesStarted) return;
    storyModulesStarted = true;
    await loadSequence([
      ['loot-bottle-core.js?v=deck-stable-1','lootBottleCore'],
      ['bottle-series-restore.js?v=deck-stable-1','bottleSeriesRestore'],
      ['turtle-soup-bottles.js?v=turtle-soup-10','turtleSoupBottles'],
      ['lanar-bottles.js?v=deck-stable-1','lanarBottles'],
      ['ariel-chapter1-bottles.js?v=deck-stable-1','arielBottles'],
      ['coco-bottles.js?v=deck-stable-1','cocoBottles'],
      ['blackbeard-bottles.js?v=deck-stable-1','blackbeardBottles'],
      ['mad-priest-bottles.js?v=deck-stable-1','madPriestBottles'],
      ['carnival-island-bottles.js?v=deck-stable-1','carnivalIslandBottles'],
      ['original-emoji-restore.js?v=deck-stable-1','originalEmojiRestore'],
      ['lanar-bottle-letters.js?v=deck-stable-1','lanarBottleLetters'],
      ['ariel-bottle-letters.js?v=deck-stable-1','arielBottleLetters'],
      ['island-triangle-letters.js?v=deck-stable-1','islandTriangleLetters'],
      ['blackbeard-treasure-letters.js?v=deck-stable-1','blackbeardTreasureLetters'],
      ['story-modal-fix.js?v=deck-stable-1','storyModalFix'],
      ['bottle-dex-patch.js?v=deck-stable-1','bottleDexPatch']
    ], 850);
    window.dispatchEvent(new CustomEvent('coffee-ship:story-ready'));
  }

  function bindLazyTriggers() {
    window.addEventListener('coffee-ship:request-fishing', handleFishingRequest);

    document.addEventListener('click', event => {
      if (event.target.closest?.('#fishDexBtn')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        removeLegacyFishingUi();
        return;
      }
      if (event.target.closest?.('#backpackSafeOpenBtn')) idle(loadStoryModules, 1800);
    }, true);

    window.addEventListener('keydown', event => {
      const key = event.key?.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === 'g' && isDeckOpen()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        removeLegacyFishingUi();
      }
    }, true);
  }

  function init() {
    removeLegacyFishingUi();
    bindMobileControls();
    addStatusBadge();
    idle(loadCafeEnhancements, 800);
    bindLazyTriggers();
    const observer = new MutationObserver(removeLegacyFishingUi);
    observer.observe(document.body,{subtree:true,childList:true});
    window.COFFEE_SHIP_FEATURE_LOADER = {
      ensureFishingCore,
      loadFishingExtras,
      loadStoryModules,
      fishingReady:() => fishingCoreReady,
      fishingAnimation:false,
      fishDex:false
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();