(() => {
  'use strict';
  if (window.__COFFEE_SHIP_STAGED_LOADER_V6__) return;
  window.__COFFEE_SHIP_STAGED_LOADER_V6__ = true;

  let controlsBound = false;
  let fishingCoreReady = false;
  let fishingCoreLoading = null;
  let fishingExtrasStarted = false;
  let storyModulesStarted = false;

  function isDeckOpen() {
    return !!window.COFFEE_SHIP_DECK?.isDeckOpen?.();
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

  function keyEvent(type, key, code = key) {
    window.dispatchEvent(new KeyboardEvent(type,{key,code,bubbles:true,cancelable:true}));
  }

  function holdKey(button, key) {
    if (!button || !key || button.dataset.sceneHoldBound === 'true') return;
    button.dataset.sceneHoldBound = 'true';
    let pressed = false;
    const start = event => {
      if (!isDeckOpen() && !isPortOpen()) return;
      event.preventDefault();
      event.stopPropagation();
      if (!pressed) {
        pressed = true;
        keyEvent('keydown',key);
      }
    };
    const end = () => {
      if (!pressed) return;
      pressed = false;
      keyEvent('keyup',key);
    };
    button.addEventListener('pointerdown',start,true);
    button.addEventListener('pointerup',end,true);
    button.addEventListener('pointerleave',end,true);
    button.addEventListener('pointercancel',end,true);
  }

  function bindMobileControls() {
    if (controlsBound) return;
    controlsBound = true;
    const map = {up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'};
    document.querySelectorAll('[data-move]').forEach(button => holdKey(button,map[button.dataset.move]));
    document.getElementById('emoteBtn')?.addEventListener('click',event => {
      if (!isDeckOpen() && !isPortOpen()) return;
      event.preventDefault();
      event.stopPropagation();
      keyEvent('keydown',' ','Space');
      setTimeout(() => keyEvent('keyup',' ','Space'),70);
    },true);
  }

  function updateStatusBadge() {
    const badge = document.getElementById('sceneStatusBadge');
    if (!badge) return;
    badge.style.display = isGameActive() ? 'block' : 'none';
    badge.textContent = isPortOpen() ? '⚓ Port' : isDeckOpen() ? '🌊 Deck' : '☕ Cafe';
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
    window.addEventListener('coffee-ship:entered',updateStatusBadge);
    window.addEventListener('coffee-ship:scene',updateStatusBadge);
  }

  function fileName(src) {
    try { return new URL(src,location.href).pathname.split('/').pop(); }
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
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  function pause(ms) {
    return new Promise(resolve => setTimeout(resolve,ms));
  }

  async function loadSequence(entries, gap = 180) {
    for (const [src, flag] of entries) {
      while (document.hidden) await pause(500);
      await loadScript(src,flag);
      if (gap) await pause(gap);
    }
  }

  function idle(callback, timeout = 1200) {
    if ('requestIdleCallback' in window) requestIdleCallback(callback,{timeout});
    else setTimeout(callback,260);
  }

  async function loadCafeEnhancements() {
    await loadSequence([
      ['role-sprites.js?v=stable-6','roleSprites'],
      ['role-mobile-ability.js?v=stable-6','roleAbility'],
      ['change-character.js?v=stable-6','changeCharacter'],
      ['mobile-home-safe.js?v=stable-6','mobileHomeSafe'],
      ['mobile-game-layout.js?v=stable-6','mobileGameLayout'],
      ['quality-polish.js?v=stable-6','qualityPolish'],
      ['black-cat-nox.js?v=stable-6','blackCatNox'],
      ['npc-behavior-polish.js?v=stable-6','npcBehaviorPolish'],
      ['port.js?v=stable-6','portScene']
    ],100);
  }

  async function ensureFishingCore() {
    if (fishingCoreReady && window.COFFEE_SHIP_FISHING_API) return true;
    if (fishingCoreLoading) return fishingCoreLoading;
    window.COFFEE_SHIP_DECK?.showTip?.('🎣 正在準備釣魚系統…',2200);
    fishingCoreLoading = (async () => {
      const ok = await loadScript('deck-fishing.js?v=unified-fishing-3','deckFishing');
      fishingCoreReady = ok && !!window.COFFEE_SHIP_FISHING_API;
      fishingCoreLoading = null;
      window.COFFEE_SHIP_FISHING_READY = fishingCoreReady;
      if (fishingCoreReady) idle(loadFishingExtras,1000);
      return fishingCoreReady;
    })();
    return fishingCoreLoading;
  }

  async function handleFishingRequest() {
    if (!isDeckOpen()) return;
    const ready = await ensureFishingCore();
    if (!ready) {
      window.COFFEE_SHIP_DECK?.showTip?.('釣魚功能載入失敗，請重新整理後再試',2200);
      return;
    }
    window.COFFEE_SHIP_FISHING_API.startFishing();
  }

  async function loadFishingExtras() {
    if (fishingExtrasStarted) return;
    fishingExtrasStarted = true;
    await loadSequence([
      ['extra-fish-50.js?v=unified-fishing-3','extraFish50'],
      ['deck-fishing-specials.js?v=unified-fishing-3','deckFishingSpecials'],
      ['mermaid-event.js?v=unified-fishing-3','mermaidEvent'],
      ['deck-shark-event.js?v=unified-fishing-3','deckSharkEvent'],
      ['mutant-creatures.js?v=unified-fishing-3','mutantCreatures'],
      ['fishing-event-stack.js?v=unified-fishing-3','fishingEventBridge']
    ],260);
    window.dispatchEvent(new CustomEvent('coffee-ship:fishing-extras-ready'));
  }

  async function loadStoryModules() {
    if (storyModulesStarted) return;
    storyModulesStarted = true;
    await loadSequence([
      ['loot-bottle-core.js?v=story-6','lootBottleCore'],
      ['bottle-series-restore.js?v=story-6','bottleSeriesRestore'],
      ['turtle-soup-bottles.js?v=story-6','turtleSoupBottles'],
      ['lanar-bottles.js?v=story-6','lanarBottles'],
      ['ariel-chapter1-bottles.js?v=story-6','arielBottles'],
      ['coco-bottles.js?v=story-6','cocoBottles'],
      ['blackbeard-bottles.js?v=story-6','blackbeardBottles'],
      ['mad-priest-bottles.js?v=story-6','madPriestBottles'],
      ['carnival-island-bottles.js?v=story-6','carnivalIslandBottles'],
      ['original-emoji-restore.js?v=story-6','originalEmojiRestore'],
      ['lanar-bottle-letters.js?v=story-6','lanarBottleLetters'],
      ['ariel-bottle-letters.js?v=story-6','arielBottleLetters'],
      ['island-triangle-letters.js?v=story-6','islandTriangleLetters'],
      ['blackbeard-treasure-letters.js?v=story-6','blackbeardTreasureLetters'],
      ['story-modal-fix.js?v=story-6','storyModalFix'],
      ['bottle-dex-patch.js?v=story-6','bottleDexPatch']
    ],600);
    window.dispatchEvent(new CustomEvent('coffee-ship:story-ready'));
  }

  function bindLazyTriggers() {
    window.addEventListener('coffee-ship:request-fishing',handleFishingRequest);
    document.addEventListener('click',event => {
      if (event.target.closest?.('#backpackSafeOpenBtn')) idle(loadStoryModules,1000);
    },true);
  }

  function init() {
    bindMobileControls();
    addStatusBadge();
    idle(loadCafeEnhancements,800);
    bindLazyTriggers();
    window.COFFEE_SHIP_FEATURE_LOADER = {
      ensureFishingCore,
      loadFishingExtras,
      loadStoryModules,
      fishingReady:() => fishingCoreReady,
      fishingAnimation:false,
      fishDex:true
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();