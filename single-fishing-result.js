(() => {
  'use strict';

  let lockedUntil = 0;
  const visibleIds = [
    'fishingCard','fishingSpecialCard','extraFish50Card','sharkCard','mutantCard',
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
    if (event.type === 'click' || event.type === 'pointerdown' || event.type === 'touchstart') {
      return !!(event.target && event.target.closest && event.target.closest('#coffeeBtn'));
    }
    return false;
  }
  function hasVisibleResult(){
    return visibleIds.some(id => { const el=document.getElementById(id); return el && !el.classList.contains('hidden'); });
  }
  function beginCast(){ lockedUntil = now() + 2400; }
  function isLocked(){ return now() < lockedUntil || hasVisibleResult(); }

  window.COFFEE_SHIP_CAN_FISH_CAST = function(){
    if (!isDeckOpen()) return false;
    if (isLocked()) return false;
    beginCast();
    return true;
  };

  ['keydown','click','pointerdown','touchstart'].forEach(type => {
    window.addEventListener(type, event => {
      if (!isFishingInput(event)) return;
      if (isLocked()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      beginCast();
    }, true);
  });

  setInterval(() => {
    if (!hasVisibleResult() && now() > lockedUntil) lockedUntil = 0;
  }, 250);
})();