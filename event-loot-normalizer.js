(() => {
  'use strict';
  if (window.__COFFEE_SHIP_EVENT_LOOT_NORMALIZER_V1__) return;
  window.__COFFEE_SHIP_EVENT_LOOT_NORMALIZER_V1__ = true;

  const BAG_KEY = 'coffeeShipFishBag';
  const ZONES = {
    ocean:'海洋朋友事件',
    carnival:'狂歡島遺失物',
    salvage:'海上打撈事件',
    world:'世界奇遇'
  };

  let normalizing = false;

  function readBag() {
    try {
      const value = JSON.parse(localStorage.getItem(BAG_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function normalize() {
    if (normalizing) return false;
    normalizing = true;
    try {
      const bag = readBag();
      let changed = false;
      const next = bag.map(item => {
        if (!item || !ZONES[item.group]) return item;
        const zone = ZONES[item.group];
        const price = Math.max(1, Number(item.sellPrice || item.price || window.COFFEE_SHIP_ECONOMY?.sellPrice?.(item) || 1));
        if (item.zone === zone && item.v2 === true && Number(item.sellPrice || 0) === price) return item;
        changed = true;
        return {...item, zone, v2:true, sellPrice:price};
      });
      if (!changed) return false;
      localStorage.setItem(BAG_KEY, JSON.stringify(next.slice(-240)));
      return true;
    } finally {
      normalizing = false;
    }
  }

  function init() {
    normalize();
    window.addEventListener('coffee-ship:bag-changed', normalize);
    window.addEventListener('storage', event => {
      if (event.key === BAG_KEY) normalize();
    });
    window.COFFEE_SHIP_EVENT_LOOT_NORMALIZER = {normalize, zones:ZONES, version:1};
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();