(() => {
  'use strict';
  if (window.__COFFEE_SHIP_LOGIN_VISIBILITY_REPAIR_V1__) return;
  window.__COFFEE_SHIP_LOGIN_VISIBILITY_REPAIR_V1__ = true;

  let repairing = false;
  let observer = null;

  function repairLoginVisibility(reason='check') {
    if (repairing) return false;
    const creator = document.getElementById('creator');
    const gamePanel = document.getElementById('gamePanel');
    if (!creator || !gamePanel || creator.classList.contains('hidden')) return false;
    repairing = true;
    let changed = false;
    try {
      for (const target of [document.documentElement,document.body]) {
        for (const className of ['coffee-ship-entered','login-resetting','safe-cafe-fallback']) {
          if (target.classList.contains(className)) {
            target.classList.remove(className);
            changed = true;
          }
        }
      }
      if (!gamePanel.classList.contains('hidden')) {
        gamePanel.classList.add('hidden');
        changed = true;
      }
      const general = document.getElementById('loginGeneralPanel');
      const special = document.getElementById('loginSpecialPanel');
      const generalTab = document.querySelector('[data-login-mode="general"]');
      const specialTab = document.querySelector('[data-login-mode="special"]');
      if (general?.hidden) { general.hidden = false; changed = true; }
      if (special && !special.hidden && !specialTab?.classList.contains('is-active')) { special.hidden = true; changed = true; }
      if (generalTab && !specialTab?.classList.contains('is-active')) {
        generalTab.classList.add('is-active');
        generalTab.setAttribute('aria-selected','true');
      }
      const input = document.getElementById('playerName');
      if (input) {
        input.disabled = false;
        input.removeAttribute('aria-hidden');
        input.tabIndex = 0;
      }
      document.body.dataset.loginVisibility = 'ready';
      if (changed) window.dispatchEvent(new CustomEvent('coffee-ship:login-visibility-repaired',{detail:{reason}}));
    } finally {
      repairing = false;
    }
    return changed;
  }

  function init() {
    repairLoginVisibility('initial');
    const creator = document.getElementById('creator');
    if (creator) {
      observer = new MutationObserver(() => requestAnimationFrame(() => repairLoginVisibility('mutation')));
      observer.observe(creator,{attributes:true,attributeFilter:['class','hidden'],childList:true,subtree:false});
    }
    document.querySelectorAll('[data-login-mode]').forEach(button => {
      button.addEventListener('click',() => setTimeout(() => repairLoginVisibility('mode-change'),0));
    });
    window.addEventListener('pageshow',() => repairLoginVisibility('pageshow'));
    window.COFFEE_SHIP_LOGIN_VISIBILITY = {repair:repairLoginVisibility,version:1};
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();