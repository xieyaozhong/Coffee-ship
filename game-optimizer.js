(() => {
  'use strict';
  if (window.__COFFEE_SHIP_GAME_OPTIMIZER_V2__) return;
  window.__COFFEE_SHIP_GAME_OPTIMIZER_V2__ = true;

  const root = document.documentElement;
  const body = document.body;
  const coarsePointer = window.matchMedia?.('(pointer: coarse)');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const pressedElements = new Set();
  const transientModalClasses = [
    'sea-merchant-open','pirate-gambling-open','coral-roulette-open','mutant-hunt-open',
    'auction-ship-open','abyss-auction-open','ocean-friends-qte-open','salvage-qte-open'
  ];
  let resizeFrame = 0;

  const nativeRaf = window.requestAnimationFrame.bind(window);
  const nativeCancelRaf = window.cancelAnimationFrame.bind(window);
  const governedFrames = new Map();
  let governedFrameId = 0;
  let lastCafeFrameAt = 0;

  function isCafeGameLoop(callback) {
    if (typeof callback !== 'function') return false;
    try {
      const source = Function.prototype.toString.call(callback).replace(/\s+/g,'');
      return source.includes('update();render();requestAnimationFrame(loop)');
    } catch {
      return false;
    }
  }

  function cafeFrameInterval() {
    const panel = document.getElementById('gamePanel');
    if (document.hidden) return 1000;
    if (!panel || panel.classList.contains('hidden')) return 250;
    if (document.body?.dataset?.coffeeShipScene === 'deck') return 180;
    if (transientModalClasses.some(name => document.body?.classList.contains(name))) return 180;
    return 0;
  }

  window.requestAnimationFrame = function optimizedRequestAnimationFrame(callback) {
    if (!isCafeGameLoop(callback)) return nativeRaf(callback);
    const interval = cafeFrameInterval();
    if (!interval) return nativeRaf(callback);

    const token = -(++governedFrameId);
    const record = {nativeId:0,cancelled:false};
    const attempt = now => {
      if (record.cancelled) return;
      const currentInterval = cafeFrameInterval();
      if (!currentInterval || now-lastCafeFrameAt >= currentInterval) {
        governedFrames.delete(token);
        lastCafeFrameAt = now;
        callback(now);
        return;
      }
      record.nativeId = nativeRaf(attempt);
    };
    record.nativeId = nativeRaf(attempt);
    governedFrames.set(token,record);
    return token;
  };

  window.cancelAnimationFrame = function optimizedCancelAnimationFrame(id) {
    const record = governedFrames.get(id);
    if (!record) return nativeCancelRaf(id);
    record.cancelled = true;
    nativeCancelRaf(record.nativeId);
    governedFrames.delete(id);
  };

  function isQuotaError(error) {
    return error?.name === 'QuotaExceededError' || error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error?.code === 22 || error?.code === 1014;
  }

  function trimStoredArray(storage,key,limit) {
    try {
      const raw = storage.getItem(key);
      if (!raw || raw.length < 12000) return false;
      const value = JSON.parse(raw);
      if (!Array.isArray(value) || value.length <= limit) return false;
      Storage.prototype.__coffeeShipNativeSetItem.call(storage,key,JSON.stringify(value.slice(-limit)));
      return true;
    } catch {
      return false;
    }
  }

  function recoverStorageSpace(storage) {
    const limits = {
      coffeeShipFishBag:180,
      coffeeShipExpandedEventLog:60,
      coffeeShipFishingAdventureLog:60,
      coffeeShipMessages:50,
      coffeeShipBottleLetters:80,
      coffeeShipLanarLetters:80,
      coffeeShipArielLetters:80,
      coffeeShipIslandLetters:80,
      coffeeShipBlackbeardLetters:40,
      coffeeShipMadPriestLetters:80,
      coffeeShipCarnivalLetters:80,
      coffeeShipTurtleSoupLetters:40,
      coffeeShipRuntimeErrors:25
    };
    let changed = false;
    Object.entries(limits).forEach(([key,limit]) => {
      changed = trimStoredArray(storage,key,limit) || changed;
    });
    return changed;
  }

  if (!Storage.prototype.__coffeeShipNativeSetItem) {
    Object.defineProperty(Storage.prototype,'__coffeeShipNativeSetItem',{
      value:Storage.prototype.setItem,
      configurable:true
    });
    Storage.prototype.setItem = function guardedSetItem(key,value) {
      try {
        return Storage.prototype.__coffeeShipNativeSetItem.call(this,key,value);
      } catch (error) {
        if (this !== localStorage || !isQuotaError(error)) throw error;
        recoverStorageSpace(this);
        try {
          return Storage.prototype.__coffeeShipNativeSetItem.call(this,key,value);
        } catch (retryError) {
          window.dispatchEvent(new CustomEvent('coffee-ship:storage-full',{detail:{key:String(key),error:String(retryError?.message || retryError)}}));
          throw retryError;
        }
      }
    };
  }

  function updateViewportHeight() {
    nativeCancelRaf(resizeFrame);
    resizeFrame = nativeRaf(() => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      root.style.setProperty('--cs-app-height', `${Math.round(viewportHeight)}px`);
    });
  }

  function updateEnvironmentClasses() {
    body.classList.toggle('cs-coarse-pointer', !!coarsePointer?.matches);
    body.classList.toggle('cs-reduced-motion', !!reducedMotion?.matches);

    const cores = Number(navigator.hardwareConcurrency || 0);
    const memory = Number(navigator.deviceMemory || 0);
    const lowPower = (cores > 0 && cores <= 4) || (memory > 0 && memory <= 4) || !!reducedMotion?.matches;
    body.classList.toggle('cs-low-power', lowPower);

    const standalone = window.matchMedia?.('(display-mode: standalone)')?.matches || navigator.standalone === true;
    body.classList.toggle('cs-standalone', !!standalone);
  }

  function labelMobileControls() {
    const labels = {up:'向上移動',down:'向下移動',left:'向左移動',right:'向右移動'};
    document.querySelectorAll('.mobile-controls [data-move]').forEach(button => {
      const direction = button.dataset.move;
      if (!button.getAttribute('aria-label') && labels[direction]) button.setAttribute('aria-label',labels[direction]);
    });

    const actionLabels = {
      coffeeBtn:'開啟咖啡選單',sitBtn:'互動或坐下',messageBtn:'開啟留言板',emoteBtn:'使用表情',
      fishDexBtn:'開啟漁獲圖鑑',backpackSafeOpenBtn:'開啟背包'
    };
    Object.entries(actionLabels).forEach(([id,label]) => {
      const element = document.getElementById(id);
      if (element && !element.getAttribute('aria-label')) element.setAttribute('aria-label',label);
    });
  }

  function clearPressedElements() {
    pressedElements.forEach(element => element.classList.remove('is-pressed'));
    pressedElements.clear();
  }

  function releaseMovementButtons() {
    document.querySelectorAll('.mobile-controls [data-move]').forEach(button => {
      try { button.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerId:1})); }
      catch { button.dispatchEvent(new Event('pointercancel',{bubbles:true})); }
    });
  }

  function enablePressFeedback() {
    const selector = 'button, [role="button"]';
    document.addEventListener('pointerdown', event => {
      const button = event.target.closest?.(selector);
      if (!button || button.disabled) return;
      button.classList.add('is-pressed');
      pressedElements.add(button);
    }, {passive:true});
    document.addEventListener('pointerup',clearPressedElements,{passive:true});
    document.addEventListener('pointercancel',clearPressedElements,{passive:true});
    window.addEventListener('blur',() => { clearPressedElements(); releaseMovementButtons(); },{passive:true});
  }

  function watchDynamicUi() {
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      nativeRaf(() => {
        queued = false;
        labelMobileControls();
      });
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  function handleVisibility() {
    body.classList.toggle('cs-page-hidden',document.hidden);
    if (document.hidden) {
      clearPressedElements();
      releaseMovementButtons();
    }
  }

  function init() {
    updateViewportHeight();
    updateEnvironmentClasses();
    labelMobileControls();
    enablePressFeedback();
    watchDynamicUi();
    handleVisibility();

    window.addEventListener('resize',updateViewportHeight,{passive:true});
    window.addEventListener('orientationchange',updateViewportHeight,{passive:true});
    window.visualViewport?.addEventListener('resize',updateViewportHeight,{passive:true});
    document.addEventListener('visibilitychange',handleVisibility);
    coarsePointer?.addEventListener?.('change',updateEnvironmentClasses);
    reducedMotion?.addEventListener?.('change',updateEnvironmentClasses);

    window.COFFEE_SHIP_GAME_OPTIMIZER = {
      releaseMovementButtons,
      recoverStorageSpace:() => recoverStorageSpace(localStorage),
      frameMode:() => cafeFrameInterval() ? 'paused-background' : 'full-speed',
      version:2
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();