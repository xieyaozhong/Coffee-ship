(() => {
  'use strict';
  if (window.__COFFEE_SHIP_INTERFACE_POLISH_V2__) return;
  window.__COFFEE_SHIP_INTERFACE_POLISH_V2__ = true;

  let queued = false;

  function currentScene() {
    return document.body.dataset.coffeeShipScene === 'deck' ? 'deck' : 'cafe';
  }

  function ensureContextBar() {
    const topbar = document.querySelector('.game-topbar');
    if (!topbar) return null;

    let bar = document.getElementById('csGameContext');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'csGameContext';
      bar.className = 'cs-game-context';
      bar.setAttribute('aria-label', '遊戲目前狀態');
      bar.innerHTML = `
        <span id="csSceneChip" class="cs-context-chip" data-kind="scene">咖啡廳主艙</span>
        <span id="csNetworkChip" class="cs-context-chip" data-kind="network">線上連線</span>
      `;
      topbar.appendChild(bar);
    }
    return bar;
  }

  function syncContext() {
    const bar = ensureContextBar();
    if (!bar) return;

    const sceneChip = bar.querySelector('#csSceneChip');
    const networkChip = bar.querySelector('#csNetworkChip');
    const scene = currentScene();

    if (sceneChip) {
      sceneChip.textContent = scene === 'deck' ? '星空甲板 · 探索與釣魚' : '咖啡廳主艙 · 社交與休憩';
    }

    if (networkChip) {
      networkChip.textContent = navigator.onLine ? '線上連線' : '離線模式';
      networkChip.dataset.state = navigator.onLine ? 'online' : 'offline';
    }
  }

  function enhancePanels() {
    document.querySelectorAll('.coffee-menu,.message-board').forEach(panel => {
      panel.setAttribute('aria-modal', 'false');
    });

    document.querySelectorAll('.coffee-option,.login-role-card,.op-action-button').forEach(button => {
      if (!button.hasAttribute('title')) {
        const label = button.getAttribute('aria-label') || button.textContent?.trim();
        if (label) button.setAttribute('title', label.replace(/\s+/g, ' ').slice(0, 60));
      }
    });
  }

  function applyInterfaceClass() {
    document.body.classList.add('cs-interface-polish-v2');
  }

  function sync() {
    applyInterfaceClass();
    syncContext();
    enhancePanels();
  }

  function queueSync() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      sync();
    });
  }

  function init() {
    sync();

    window.addEventListener('online', queueSync);
    window.addEventListener('offline', queueSync);
    window.addEventListener('resize', queueSync, { passive: true });
    window.addEventListener('coffee-ship:scene', queueSync);
    window.addEventListener('coffee-ship:entered', queueSync);

    const panel = document.getElementById('gamePanel');
    if (panel) {
      new MutationObserver(queueSync).observe(panel, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      });
    }

    new MutationObserver(queueSync).observe(document.body, {
      attributes: true,
      attributeFilter: ['data-coffee-ship-scene']
    });

    setTimeout(sync, 0);
    setTimeout(sync, 300);
    setTimeout(sync, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
