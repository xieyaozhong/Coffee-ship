(() => {
  'use strict';

  function refreshDeckAppearance() {
    window.COFFEE_SHIP_DECK?.refreshAppearance?.();
  }

  function init() {
    refreshDeckAppearance();
    window.addEventListener('storage', refreshDeckAppearance);
    document.addEventListener('coffeeShipAvatarChanged', refreshDeckAppearance);
    document.addEventListener('coffeeShipRoleChanged', refreshDeckAppearance);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();