(() => {
  'use strict';
  if (window.__COFFEE_SHIP_BACKPACK_PANEL_GUARD__) return;
  window.__COFFEE_SHIP_BACKPACK_PANEL_GUARD__ = true;

  const nativeRemove = Element.prototype.remove;

  Element.prototype.remove = function guardedRemove() {
    if (this instanceof HTMLElement && this.id === 'fishDexPanel') {
      return;
    }
    return nativeRemove.call(this);
  };

  function recoverBackpackPanel() {
    const panel = document.getElementById('fishDexPanel');
    const manager = window.COFFEE_SHIP_BACKPACK_MANAGER;
    if (!panel || !manager) return;

    const root = panel.querySelector('#backpackManagerRoot');
    if (!root && !panel.classList.contains('hidden')) {
      manager.rebuild?.();
    }
  }

  document.addEventListener('click', event => {
    if (!event.target.closest?.('#backpackSafeOpenBtn')) return;
    setTimeout(recoverBackpackPanel, 50);
    setTimeout(recoverBackpackPanel, 180);
  }, true);

  window.COFFEE_SHIP_BACKPACK_PANEL_GUARD = {
    recover: recoverBackpackPanel,
    nativeRemove
  };
})();