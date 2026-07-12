(() => {
  'use strict';
  if (window.__COFFEE_SHIP_LEGACY_DECK_SHIM_V4__) return;
  window.__COFFEE_SHIP_LEGACY_DECK_SHIM_V4__ = true;
  window.__COFFEE_SHIP_DECK_STABLE_V2__ = true;

  const api = window.COFFEE_SHIP_DECK || {};
  if (Number(api.version || 0) >= 4) return;

  Object.assign(api, {
    version: 0,
    pendingScene: api.pendingScene || 'cafe',
    switchToDeck() {
      api.pendingScene = 'deck';
      return true;
    },
    switchToCafe() {
      api.pendingScene = 'cafe';
      return true;
    },
    requestFishing() { return false; },
    handleAction() { return false; },
    isDeckOpen() { return api.pendingScene === 'deck'; },
    getScene() { return api.pendingScene; },
    getPlayerPosition() { return { x: 202, y: 478, dir: 'right' }; },
    nearDeckDoor() { return false; },
    nearFishingSpot() { return false; },
    showTip() {},
    syncLayout() {}
  });

  window.COFFEE_SHIP_DECK = api;
})();
