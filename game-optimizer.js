(() => {
  'use strict';
  if (window.__COFFEE_SHIP_GAME_OPTIMIZER_V1__) return;
  window.__COFFEE_SHIP_GAME_OPTIMIZER_V1__ = true;

  const root = document.documentElement;
  const body = document.body;
  const coarsePointer = window.matchMedia?.('(pointer: coarse)');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let resizeFrame = 0;

  function updateViewportHeight() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
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
    const labels = {
      up: '向上移動',
      down: '向下移動',
      left: '向左移動',
      right: '向右移動'
    };

    document.querySelectorAll('.mobile-controls [data-move]').forEach(button => {
      const direction = button.dataset.move;
      if (!button.getAttribute('aria-label') && labels[direction]) {
        button.setAttribute('aria-label', labels[direction]);
      }
    });

    const actionLabels = {
      coffeeBtn: '開啟咖啡選單',
      sitBtn: '互動或坐下',
      messageBtn: '開啟留言板',
      emoteBtn: '使用表情',
      fishDexBtn: '開啟漁獲圖鑑',
      backpackSafeOpenBtn: '開啟背包'
    };

    Object.entries(actionLabels).forEach(([id, label]) => {
      const element = document.getElementById(id);
      if (element && !element.getAttribute('aria-label')) element.setAttribute('aria-label', label);
    });
  }

  function enablePressFeedback() {
    const selector = 'button, [role="button"]';

    document.addEventListener('pointerdown', event => {
      const button = event.target.closest?.(selector);
      if (!button || button.disabled) return;
      button.classList.add('is-pressed');
    }, { passive: true });

    const clearPressed = event => {
      const button = event.target.closest?.(selector);
      if (button) button.classList.remove('is-pressed');
    };

    document.addEventListener('pointerup', clearPressed, { passive: true });
    document.addEventListener('pointercancel', clearPressed, { passive: true });
    document.addEventListener('pointerleave', clearPressed, { passive: true, capture: true });
  }

  function watchDynamicUi() {
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        labelMobileControls();
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function handleVisibility() {
    body.classList.toggle('cs-page-hidden', document.hidden);
  }

  function init() {
    updateViewportHeight();
    updateEnvironmentClasses();
    labelMobileControls();
    enablePressFeedback();
    watchDynamicUi();
    handleVisibility();

    window.addEventListener('resize', updateViewportHeight, { passive: true });
    window.addEventListener('orientationchange', updateViewportHeight, { passive: true });
    window.visualViewport?.addEventListener('resize', updateViewportHeight, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    coarsePointer?.addEventListener?.('change', updateEnvironmentClasses);
    reducedMotion?.addEventListener?.('change', updateEnvironmentClasses);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
