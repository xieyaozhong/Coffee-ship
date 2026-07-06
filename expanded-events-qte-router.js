(() => {
  'use strict';
  if (window.__COFFEE_SHIP_EXPANDED_EVENTS_QTE_ROUTER_V1__) return;
  window.__COFFEE_SHIP_EXPANDED_EVENTS_QTE_ROUTER_V1__ = true;

  let patchedApi = null;
  let replacement = null;

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

  function route(category,castId,delay=0) {
    const api = window.COFFEE_SHIP_EXPANDED_EVENTS;
    setTimeout(() => {
      if (category === 'ocean') {
        if (typeof api?.runOceanQte === 'function') api.runOceanQte(castId);
        else window.COFFEE_SHIP_OCEAN_FRIENDS_QTE?.open?.();
        return;
      }
      if (category === 'salvage') {
        if (typeof window.COFFEE_SHIP_SALVAGE_QTE?.schedule === 'function') window.COFFEE_SHIP_SALVAGE_QTE.schedule(castId);
        else window.COFFEE_SHIP_SALVAGE_QTE?.open?.(castId);
        return;
      }
      api?.runCategory?.(category,castId);
    },delay);
  }

  function patch() {
    const api = window.COFFEE_SHIP_EXPANDED_EVENTS;
    if (!api || typeof api.trigger !== 'function' || typeof api.runCategory !== 'function') return false;
    if (patchedApi === api && api.__expandedQteRouterV1 && api.trigger === replacement) return true;

    if (patchedApi && replacement) window.removeEventListener('coffee-ship:fishing-result',replacement);
    if (typeof api.trigger === 'function') window.removeEventListener('coffee-ship:fishing-result',api.trigger);

    const previousTrigger = api.trigger;
    replacement = event => {
      if (Math.random() > eventChance()) return;
      const castId = event.detail?.castId || window.COFFEE_SHIP_FISHING_API?.getCurrentCastId?.() || `expanded_qte_${Date.now()}`;
      const first = chooseCategory();
      route(first,castId,first === 'ocean' || first === 'salvage' ? 90 : 0);

      const current = modifiers();
      const secondaryChance = Math.min(.32,.12*current.fishingLuck+current.bottleLuck*.15);
      if (Math.random() < secondaryChance) {
        const second = chooseCategory(first);
        route(second,castId,second === 'ocean' || second === 'salvage' ? 760 : 450);
      }
    };

    api.triggerBeforeQteRouter = previousTrigger;
    api.trigger = replacement;
    api.runSalvageQte = castId => window.COFFEE_SHIP_SALVAGE_QTE?.schedule?.(castId || `salvage_qte_${Date.now()}`);
    api.__expandedQteRouterV1 = true;
    api.version = Math.max(3,Number(api.version || 0));
    window.addEventListener('coffee-ship:fishing-result',replacement);
    patchedApi = api;
    window.dispatchEvent(new CustomEvent('coffee-ship:expanded-qte-router-ready',{detail:{ocean:'horizontal',salvage:'vertical',version:1}}));
    return true;
  }

  function init() {
    patch();
    window.addEventListener('coffee-ship:fishing-extras-ready',patch);
    window.addEventListener('coffee-ship:ocean-friends-qte-ready',patch);
    window.addEventListener('coffee-ship:salvage-qte-ready',patch);
    window.addEventListener('coffee-ship:scene',event => {
      if (event.detail?.scene === 'deck') patch();
    });
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      patch();
      if (attempts >= 300 && patchedApi && patchedApi.trigger === replacement) clearInterval(timer);
    },500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();