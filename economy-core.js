(() => {
  'use strict';
  if (window.__COFFEE_SHIP_ECONOMY_V1__) return;
  window.__COFFEE_SHIP_ECONOMY_V1__ = true;

  const WALLET_KEY = 'coffeeShipPearls';
  const BAG_KEY = 'coffeeShipFishBag';
  const LEDGER_KEY = 'coffeeShipEconomyLedger';
  const MIGRATION_KEY = 'coffeeShipPearlWalletMigratedV1';
  const MAX_LEDGER = 80;

  let internalChange = false;
  let lastBalance = readBalance();
  let lastEffectSignature = '';

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function saveJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  }

  function cleanAmount(value) {
    return Math.max(0, Math.floor(Number(value) || 0));
  }

  function readBalance() {
    return cleanAmount(localStorage.getItem(WALLET_KEY));
  }

  function ledger() {
    const value = readJson(LEDGER_KEY, []);
    return Array.isArray(value) ? value : [];
  }

  function record(delta, reason, meta = {}) {
    if (!delta) return;
    const rows = ledger();
    rows.unshift({
      delta:Math.trunc(delta),
      balance:readBalance(),
      reason:String(reason || (delta > 0 ? '獲得珍珠' : '使用珍珠')),
      meta,
      at:Date.now()
    });
    saveJson(LEDGER_KEY, rows.slice(0, MAX_LEDGER));
  }

  function emit(delta = 0, reason = '同步', meta = {}) {
    const detail = {balance:readBalance(), pearls:readBalance(), delta, reason, meta};
    window.dispatchEvent(new CustomEvent('coffee-ship:economy-changed', {detail}));
    window.dispatchEvent(new CustomEvent('coffeeShipPearlsChanged', {detail}));
  }

  function setBalance(value, reason = '調整珍珠', meta = {}) {
    const previous = readBalance();
    const next = cleanAmount(value);
    const delta = next - previous;
    internalChange = true;
    try { localStorage.setItem(WALLET_KEY, String(next)); }
    finally { internalChange = false; }
    lastBalance = next;
    if (delta) record(delta, reason, meta);
    emit(delta, reason, meta);
    return next;
  }

  function earn(amount, reason = '獲得珍珠', meta = {}) {
    const value = cleanAmount(amount);
    if (!value) return readBalance();
    return setBalance(readBalance() + value, reason, meta);
  }

  function canAfford(amount) {
    return readBalance() >= cleanAmount(amount);
  }

  function spend(amount, reason = '使用珍珠', meta = {}) {
    const value = cleanAmount(amount);
    if (!value) return {ok:true, balance:readBalance(), spent:0};
    const current = readBalance();
    if (current < value) return {ok:false, balance:current, needed:value - current, spent:0};
    const balance = setBalance(current - value, reason, meta);
    return {ok:true, balance, spent:value};
  }

  function rarityBase(rarity) {
    return ({普通:2,常見:4,稀有:10,史詩:28,傳說:120,神話:500,世界級:5000})[rarity] || 3;
  }

  function qualityMultiplier(quality) {
    return ({普通:1,優秀:1.4,完美:2,閃亮:3.5,神話:6,變異:3,祝福:2,拾獲:1.15,遺失物:1.4,貨幣:1})[quality] || 1;
  }

  function sellPrice(item) {
    if (!item) return 0;
    if (item.kind === 'currency') return cleanAmount(item.amount || 0);
    if (item.kind === 'trash') return 0;
    if (Number.isFinite(Number(item.sellPrice))) return Math.max(0, Math.round(Number(item.sellPrice)));
    if (item.kind === 'treasure' && Number.isFinite(Number(item.price))) return Math.max(1, Math.round(Number(item.price)));

    const base = rarityBase(item.rarity);
    const quality = qualityMultiplier(item.quality);
    const weight = Math.max(.1, Number(item.weight || 1));
    const coffeeBonus = Math.max(1, Number(item.coffeePearlBonus || item.pearlBonus || 1));
    return Math.max(1, Math.round(weight * base * quality * coffeeBonus));
  }

  function effect() {
    const current = window.COFFEE_SHIP_COFFEE_EFFECT;
    return current && current.expiresAt > Date.now() ? current : null;
  }

  function fishingModifiers() {
    const bonuses = effect()?.bonuses || {};
    return {
      fishingLuck:Math.max(1, Number(bonuses.fishingLuck || 1)),
      fishingSpeed:Math.max(.25, Number(bonuses.fishingSpeed || 1)),
      qualityBonus:Math.max(0, Number(bonuses.qualityBonus || 0)),
      pearlBonus:Math.max(1, Number(bonuses.pearlBonus || 1)),
      bottleLuck:Math.max(0, Number(bonuses.bottleLuck || 0)),
      eventLuck:Math.max(1, Number(bonuses.eventLuck || bonuses.fishingLuck || 1))
    };
  }

  function eventChance(baseChance, type = 'special') {
    const modifiers = fishingModifiers();
    let chance = Math.max(0, Number(baseChance || 0));
    if (type === 'bottle') chance += modifiers.bottleLuck;
    else chance *= modifiers.eventLuck;
    return Math.min(.7, chance);
  }

  function absorbBagPearls(reason = '合併背包珍珠') {
    const bag = readJson(BAG_KEY, []);
    if (!Array.isArray(bag) || !bag.length) return 0;

    let total = 0;
    const remaining = [];
    for (const item of bag) {
      if (item?.kind === 'currency' || (item?.icon === '🦪' && Number(item?.amount) > 0)) {
        total += cleanAmount(item.amount || String(item.name || '').match(/\d+/)?.[0] || 0);
      } else {
        remaining.push(item);
      }
    }

    if (!total) return 0;
    saveJson(BAG_KEY, remaining.slice(-240));
    earn(total, reason, {source:'bag-migration'});
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed', {detail:{source:'pearl-migration', amount:total}}));
    return total;
  }

  function observeExternalBalance() {
    if (internalChange) return;
    const current = readBalance();
    if (current === lastBalance) return;
    const delta = current - lastBalance;
    lastBalance = current;
    record(delta, delta < 0 ? '咖啡或商店消費' : '外部珍珠收入', {source:'legacy'});
    emit(delta, '外部餘額同步', {source:'legacy'});
  }

  function observeCoffeeEffect() {
    const current = effect();
    const signature = current ? `${current.id}|${current.expiresAt}` : '';
    if (signature === lastEffectSignature) return;
    lastEffectSignature = signature;
    window.dispatchEvent(new CustomEvent('coffee-ship:coffee-effect-changed', {
      detail:{effect:current, modifiers:fishingModifiers()}
    }));
  }

  function init() {
    if (!localStorage.getItem(MIGRATION_KEY)) {
      absorbBagPearls('舊珍珠轉入共用錢包');
      localStorage.setItem(MIGRATION_KEY, String(Date.now()));
    } else {
      absorbBagPearls();
    }

    lastBalance = readBalance();
    setInterval(() => {
      absorbBagPearls();
      observeExternalBalance();
      observeCoffeeEffect();
    }, 900);

    window.addEventListener('storage', event => {
      if (event.key === WALLET_KEY) observeExternalBalance();
      if (event.key === BAG_KEY) absorbBagPearls();
    });

    emit(0, '經濟系統已就緒');
  }

  window.COFFEE_SHIP_ECONOMY = {
    balance:readBalance,
    setBalance,
    earn,
    spend,
    canAfford,
    sellPrice,
    absorbBagPearls,
    effect,
    fishingModifiers,
    eventChance,
    ledger,
    keys:{wallet:WALLET_KEY, bag:BAG_KEY, ledger:LEDGER_KEY},
    version:1
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();