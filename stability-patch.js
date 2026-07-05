(() => {
  'use strict';
  if (window.__COFFEE_SHIP_STAGED_LOADER_V7__) return;
  window.__COFFEE_SHIP_STAGED_LOADER_V7__ = true;

  let controlsBound = false;
  let fishingCoreReady = false;
  let fishingCoreLoading = null;
  let fishingExtrasStarted = false;
  let fishingExtrasPromise = null;
  let storyModulesStarted = false;
  let storyModulesPromise = null;
  let deckPreloadStarted = false;

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

  function keyEvent(type,key,code=key) {
    window.dispatchEvent(new KeyboardEvent(type,{key,code,bubbles:true,cancelable:true}));
  }

  function holdKey(button,key) {
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

  function loadScript(src,flag) {
    if (alreadyLoaded(src) || document.querySelector(`script[data-${flag}="true"]`)) return Promise.resolve(true);
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.dataset[flag] = 'true';
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.warn(`Optional module failed: ${src}`);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  function pause(ms) {
    return new Promise(resolve => setTimeout(resolve,ms));
  }

  async function loadSequence(entries,gap=100) {
    for (const [src,flag] of entries) {
      while (document.hidden) await pause(400);
      await loadScript(src,flag);
      if (gap) await pause(gap);
    }
  }

  function idle(callback,timeout=1200) {
    if ('requestIdleCallback' in window) requestIdleCallback(callback,{timeout});
    else setTimeout(callback,260);
  }

  async function loadCafeEnhancements() {
    await loadSequence([
      ['role-sprites.js?v=stable-7','roleSprites'],
      ['role-mobile-ability.js?v=stable-7','roleAbility'],
      ['change-character.js?v=stable-7','changeCharacter'],
      ['mobile-home-safe.js?v=stable-7','mobileHomeSafe'],
      ['mobile-game-layout.js?v=stable-7','mobileGameLayout'],
      ['quality-polish.js?v=stable-7','qualityPolish'],
      ['black-cat-nox.js?v=stable-7','blackCatNox'],
      ['npc-behavior-polish.js?v=stable-7','npcBehaviorPolish'],
      ['port.js?v=stable-7','portScene']
    ],80);
  }

  async function ensureFishingCore() {
    if (window.COFFEE_SHIP_FISHING_API?.version >= 4) {
      fishingCoreReady = true;
      return true;
    }
    if (fishingCoreReady && window.COFFEE_SHIP_FISHING_API) return true;
    if (fishingCoreLoading) return fishingCoreLoading;

    fishingCoreLoading = (async () => {
      const ok = await loadScript('deck-fishing.js?v=unified-fishing-4','deckFishing');
      fishingCoreReady = ok && Number(window.COFFEE_SHIP_FISHING_API?.version || 0) >= 4;
      fishingCoreLoading = null;
      window.COFFEE_SHIP_FISHING_READY = fishingCoreReady;
      return fishingCoreReady;
    })();
    return fishingCoreLoading;
  }

  async function loadFishingExtras() {
    if (fishingExtrasPromise) return fishingExtrasPromise;
    fishingExtrasStarted = true;
    fishingExtrasPromise = (async () => {
      await loadSequence([
        ['extra-fish-50.js?v=unified-fishing-4','extraFish50'],
        ['loot-bottle-core.js?v=unified-fishing-4','lootBottleCore'],
        ['bottle-series-restore.js?v=unified-fishing-4','bottleSeriesRestore'],
        ['mermaid-event.js?v=unified-fishing-4','mermaidEvent'],
        ['deck-shark-event.js?v=unified-fishing-4','deckSharkEvent'],
        ['mutant-creatures.js?v=unified-fishing-4','mutantCreatures'],
        ['fishing-event-stack.js?v=unified-fishing-4','fishingEventBridge']
      ],70);
      window.dispatchEvent(new CustomEvent('coffee-ship:fishing-extras-ready',{detail:{version:4}}));
      return true;
    })();
    return fishingExtrasPromise;
  }

  async function loadStoryModules() {
    if (storyModulesPromise) return storyModulesPromise;
    storyModulesStarted = true;
    storyModulesPromise = (async () => {
      await loadSequence([
        ['turtle-soup-bottles.js?v=story-7','turtleSoupBottles'],
        ['lanar-bottles.js?v=story-7','lanarBottles'],
        ['ariel-chapter1-bottles.js?v=story-7','arielBottles'],
        ['coco-bottles.js?v=story-7','cocoBottles'],
        ['blackbeard-bottles.js?v=story-7','blackbeardBottles'],
        ['mad-priest-bottles.js?v=story-7','madPriestBottles'],
        ['carnival-island-bottles.js?v=story-7','carnivalIslandBottles'],
        ['original-emoji-restore.js?v=story-7','originalEmojiRestore'],
        ['lanar-bottle-letters.js?v=story-7','lanarBottleLetters'],
        ['ariel-bottle-letters.js?v=story-7','arielBottleLetters'],
        ['island-triangle-letters.js?v=story-7','islandTriangleLetters'],
        ['blackbeard-treasure-letters.js?v=story-7','blackbeardTreasureLetters'],
        ['story-modal-fix.js?v=story-7','storyModalFix'],
        ['bottle-dex-patch.js?v=story-7','bottleDexPatch']
      ],420);
      window.dispatchEvent(new CustomEvent('coffee-ship:story-ready',{detail:{version:7}}));
      return true;
    })();
    return storyModulesPromise;
  }

  async function preloadDeckSystems() {
    if (deckPreloadStarted) return;
    deckPreloadStarted = true;
    const coreReady = await ensureFishingCore();
    if (!coreReady) {
      deckPreloadStarted = false;
      return;
    }
    await loadFishingExtras();
    idle(loadStoryModules,1800);
  }

  async function handleFishingRequest() {
    if (!isDeckOpen()) return;
    const coreReady = await ensureFishingCore();
    if (!coreReady) {
      window.COFFEE_SHIP_DECK?.showTip?.('釣魚功能載入失敗，請重新整理後再試',2200);
      return;
    }
    await loadFishingExtras();
    window.COFFEE_SHIP_FISHING_API.startFishing();
  }

  function bindLazyTriggers() {
    window.addEventListener('coffee-ship:request-fishing',handleFishingRequest);
    window.addEventListener('coffee-ship:scene',event => {
      if (event.detail?.scene === 'deck') preloadDeckSystems();
      else deckPreloadStarted = false;
    });
    document.addEventListener('click',event => {
      if (event.target.closest?.('#backpackSafeOpenBtn')) idle(loadStoryModules,800);
      if (event.target.closest?.('#fishDexBtn')) preloadDeckSystems();
    },true);
  }

  function init() {
    bindMobileControls();
    addStatusBadge();
    idle(loadCafeEnhancements,800);
    bindLazyTriggers();
    if (isDeckOpen()) preloadDeckSystems();
    window.COFFEE_SHIP_FEATURE_LOADER = {
      ensureFishingCore,
      loadFishingExtras,
      loadStoryModules,
      preloadDeckSystems,
      fishingReady:() => fishingCoreReady,
      fishingAnimation:false,
      fishDex:true,
      version:7
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();