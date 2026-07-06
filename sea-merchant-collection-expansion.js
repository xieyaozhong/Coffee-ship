(() => {
  'use strict';
  if (window.__COFFEE_SHIP_SEA_MERCHANT_COLLECTIONS_COMPAT_V2__) return;
  window.__COFFEE_SHIP_SEA_MERCHANT_COLLECTIONS_COMPAT_V2__ = true;

  function attach() {
    const merchant = window.COFFEE_SHIP_SEA_MERCHANT;
    if (!merchant?.collections) return false;
    window.COFFEE_SHIP_SEA_MERCHANT_COLLECTIONS = {
      items:merchant.collections,
      owned:window.COFFEE_SHIP_SEA_MERCHANT_COLLECTIONS?.owned || (() => []),
      refresh:() => {},
      version:2
    };
    return true;
  }

  if (!attach()) {
    window.addEventListener('coffee-ship:sea-merchant-ready',attach,{once:true});
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (attach() || attempts >= 12) clearInterval(timer);
    },250);
  }
})();
