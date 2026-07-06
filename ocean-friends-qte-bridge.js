(() => {
  'use strict';
  if (window.__COFFEE_SHIP_OCEAN_FRIENDS_QTE_BRIDGE_V1__) return;
  window.__COFFEE_SHIP_OCEAN_FRIENDS_QTE_BRIDGE_V1__ = true;

  function modifiers() {
    return window.COFFEE_SHIP_ECONOMY?.fishingModifiers?.() || {
      fishingLuck:Math.max(1,Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.fishingLuck || 1)),
      bottleLuck:Math.max(0,Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.bottleLuck || 0))
    };
  }

  function eventChance() {
    const current = modifiers();
    const base = .27+Math.min(.08,current.bottleLuck*.25);
    return window.COFFEE_SHIP_ECONOMY?.eventChance?.(base,'special') ?? Math.min(.62,base*current.fishingLuck);
  }

  function chooseCategory(exclude='') {
    const rows = [['ocean',34],['salvage',35],['carnival',23],['world',8]].filter(row => row[0] !== exclude);
    let roll = Math.random()*rows.reduce((sum,row) => sum+row[1],0);
    for (const [name,weight] of rows) {
      roll -= weight;
      if (roll <= 0) return name;
    }
    return rows[0][0];
  }

  function openOcean(attempt=0) {
    const opened = window.COFFEE_SHIP_OCEAN_FRIENDS_QTE?.open?.() || false;
    if (!opened && attempt < 90 && window.COFFEE_SHIP_DECK?.isDeckOpen?.()) {
      setTimeout(() => openOcean(attempt+1),700);
    }
    return opened;
  }

  function patch() {
    const api = window.COFFEE_SHIP_EXPANDED_EVENTS;
    if (!api || typeof api.trigger !== 'function' || typeof api.runCategory !== 'function') return false;
    if (api.__oceanFriendsQtePatched) return true;

    const originalTrigger = api.trigger;
    const runCategory = api.runCategory.bind(api);
    window.removeEventListener('coffee-ship:fishing-result',originalTrigger);

    const replacement = event => {
      if (Math.random() > eventChance()) return;
      const castId = event.detail?.castId || window.COFFEE_SHIP_FISHING_API?.getCurrentCastId?.();
      const first = chooseCategory();
      if (first === 'ocean') setTimeout(() => openOcean(0),80);
      else runCategory(first,castId);

      const current = modifiers();
      const secondaryChance = Math.min(.32,.12*current.fishingLuck+current.bottleLuck*.15);
      if (Math.random() < secondaryChance) {
        const second = chooseCategory(first);
        if (second === 'ocean') setTimeout(() => openOcean(0),700);
        else setTimeout(() => runCategory(second,castId),450);
      }
    };

    api.originalTrigger = originalTrigger;
    api.trigger = replacement;
    api.runOceanQte = () => openOcean(0);
    api.__oceanFriendsQtePatched = true;
    api.version = Math.max(2,Number(api.version || 0));
    window.addEventListener('coffee-ship:fishing-result',replacement);
    window.dispatchEvent(new CustomEvent('coffee-ship:ocean-friends-qte-bridge-ready',{detail:{version:1}}));
    return true;
  }

  function init() {
    patch();
    window.addEventListener('coffee-ship:fishing-extras-ready',patch);
    window.addEventListener('coffee-ship:scene',event => {
      if (event.detail?.scene === 'deck') patch();
    });
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (patch() || attempts >= 240) clearInterval(timer);
    },500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();