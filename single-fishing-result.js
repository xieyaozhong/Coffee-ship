(() => {
  'use strict';

  let lockedUntil = 0;
  let activeEvent = null;
  const visibleIds = [
    'fishingCard','fishingSpecialCard','extraFish50Card','sharkCard','mutantCard','mermaidCard',
    'lanarCard','arielCard','islandCard','blackbeardCard','madPriestCard','carnivalCard'
  ];

  function now(){ return Date.now(); }
  function isDeckOpen(){ const d=document.getElementById('deckOverlay'); return d && !d.classList.contains('hidden'); }
  function isFishingInput(event){
    if (!isDeckOpen()) return false;
    if (event.type === 'keydown') {
      const k = event.key && event.key.length === 1 ? event.key.toLowerCase() : event.key;
      return k === 'f' || k === 'c';
    }
    if (event.type === 'click') {
      return !!(event.target && event.target.closest && event.target.closest('#coffeeBtn'));
    }
    return false;
  }
  function hasVisibleResult(){
    return visibleIds.some(id => { const el=document.getElementById(id); return el && !el.classList.contains('hidden'); });
  }
  function isLocked(){ return now() < lockedUntil || hasVisibleResult(); }
  function beginCast(event){
    activeEvent = event || null;
    lockedUntil = now() + 1800;
  }
  function claim(event, ms = 5200){
    if (event) event.__coffeeShipClaimed = true;
    lockedUntil = Math.max(lockedUntil, now() + ms);
  }

  // Optional API for future modules. A module may call this before generating a result.
  window.COFFEE_SHIP_CAN_FISH_CAST = function(){
    if (!isDeckOpen()) return false;
    if (isLocked()) return false;
    lockedUntil = now() + 1800;
    return true;
  };
  window.COFFEE_SHIP_CLAIM_FISH_RESULT = function(ms){ claim(activeEvent, ms || 5200); return true; };

  const oldPreventDefault = Event.prototype.preventDefault;
  Event.prototype.preventDefault = function(){
    if (activeEvent === this && isFishingInput(this)) claim(this, 5200);
    return oldPreventDefault.apply(this, arguments);
  };
  const oldStopImmediate = Event.prototype.stopImmediatePropagation;
  Event.prototype.stopImmediatePropagation = function(){
    if (activeEvent === this && isFishingInput(this)) claim(this, 5200);
    return oldStopImmediate.apply(this, arguments);
  };

  ['keydown','click'].forEach(type => {
    window.addEventListener(type, event => {
      if (!isFishingInput(event)) return;
      if (isLocked()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      beginCast(event);
      setTimeout(() => { if (activeEvent === event) activeEvent = null; }, 0);
    }, true);
  });

  // If old modules still manage to show multiple cards, keep only the first visible card.
  function reduceVisibleResults(){
    let keeper = null;
    for (const id of visibleIds) {
      const el = document.getElementById(id);
      if (!el || el.classList.contains('hidden')) continue;
      if (!keeper) { keeper = el; continue; }
      el.classList.add('hidden');
    }
  }

  setInterval(() => {
    reduceVisibleResults();
    if (!hasVisibleResult() && now() > lockedUntil) lockedUntil = 0;
  }, 120);
})();
