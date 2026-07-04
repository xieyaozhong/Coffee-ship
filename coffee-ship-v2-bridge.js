(() => {
  'use strict';

  function db(){ return window.COFFEE_SHIP_DB; }
  function patchCarnivalPool(){
    if (!db()) return;
    window.COFFEE_SHIP_CARNIVAL_LOOT = {
      pool: db().carnivalLoot.map(row => db().itemFromRow(row, 'carnival')),
      pick: () => db().pickCarnivalItem(),
      addToBag: item => db().addItem(item || db().pickCarnivalItem()),
      normalizeOldCarnivalLoot: () => db().normalizeBag()
    };
  }
  function patchPrices(){
    if (window.COFFEE_SHIP_V2_PRICE_PATCHED) return;
    window.COFFEE_SHIP_V2_PRICE_PATCHED = true;
    const oldParse = JSON.parse;
    JSON.parse = function(text, reviver){
      const value = oldParse.call(JSON, text, reviver);
      try {
        if (Array.isArray(value) && text && text.includes('coffee') === false) {
          return value.map(x => {
            if (x && x.kind === 'treasure' && !x.price && db()) {
              const rarity = x.rarity || '普通';
              const base = db().rarityPrice[rarity] || 10;
              return { ...x, price: Math.max(1, Math.round(base * Math.max(1, Number(x.weight || 1)))) };
            }
            return x;
          });
        }
      } catch(e) {}
      return value;
    };
  }
  function init(){ patchCarnivalPool(); patchPrices(); setInterval(patchCarnivalPool, 1000); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();