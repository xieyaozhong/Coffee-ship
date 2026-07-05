(() => {
  'use strict';
  if (window.__COFFEE_SHIP_BACKPACK_MANAGER_V6__) return;
  window.__COFFEE_SHIP_BACKPACK_MANAGER_V6__ = true;

  const PANEL_ID = 'backpackPanel';
  const BUTTON_ID = 'backpackSafeOpenBtn';
  const BAG_KEY = 'coffeeShipFishBag';
  const LETTER_STORES = {
    coffeeShipBottleLetters:{icon:'😂',series:'冷笑話漂流瓶',rarity:'普通'},
    coffeeShipLanarLetters:{icon:'🌊',series:'拉納爾漂流瓶',rarity:'史詩'},
    coffeeShipArielLetters:{icon:'🧜‍♀️',series:'愛麗兒漂流瓶',rarity:'史詩'},
    coffeeShipIslandLetters:{icon:'🏝️',series:'可可漂流瓶',rarity:'稀有'},
    coffeeShipBlackbeardLetters:{icon:'🏴‍☠️',series:'黑鬍子藏寶圖',rarity:'傳說'},
    coffeeShipMadPriestLetters:{icon:'📜',series:'瘋狂神父殘頁',rarity:'傳說'},
    coffeeShipCarnivalLetters:{icon:'🎭',series:'狂歡島漂流瓶',rarity:'史詩'},
    coffeeShipTurtleSoupLetters:{icon:'🍲',series:'海龜湯神秘故事',rarity:'神話'}
  };

  const BIOLOGICAL_KINDS = new Set([
    'fish','mutant','shrimp','crab','squid','jelly','angler','octopus','whale',
    'shark','ray','eel','lobster','creature','animal','sea-creature','sea_creature',
    'mollusk','turtle','dolphin','seal','penguin','seahorse','urchin','starfish',
    'sea-cucumber','sea_cucumber','snake'
  ]);

  const BIOLOGICAL_GROUPS = new Set(['fish','catch','creature','animal','biological','marine-life']);
  const LEGACY_CREATURE_NAME = /(?:魚|鯊|鯨|鰻|蝦|蟹|魷魚|烏賊|章魚|水母|海馬|河豚|魟|鰩|海參|海膽|海星|海兔|海蛞蝓|海蛇|龍蝦|寄居蟹|海獅|海豹|海豚|海龜|企鵝|儒艮|海牛)$/;

  let activeTab = 'fish';

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }

  function formatText(value) {
    return escapeHtml(value).replace(/\n/g, '<br>');
  }

  function economy() {
    return window.COFFEE_SHIP_ECONOMY || null;
  }

  function walletBalance() {
    return economy()?.balance?.() ?? Math.max(0, Number(localStorage.getItem('coffeeShipPearls') || 0));
  }

  function bag() {
    economy()?.absorbBagPearls?.();
    const value = read(BAG_KEY, []);
    return Array.isArray(value) ? value.filter(item => item?.kind !== 'currency') : [];
  }

  function setBag(items) {
    save(BAG_KEY, items.filter(item => item?.kind !== 'currency').slice(-240));
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed', {detail:{source:'backpack'}}));
  }

  function isCurrency(item) {
    return item?.kind === 'currency';
  }

  function isBiologicalCatch(item) {
    if (!item || isCurrency(item)) return false;

    const kind = String(item.kind || '').trim().toLowerCase();
    const group = String(item.group || '').trim().toLowerCase();

    if (kind) return BIOLOGICAL_KINDS.has(kind);
    if (BIOLOGICAL_GROUPS.has(group)) return true;

    return LEGACY_CREATURE_NAME.test(String(item.name || '').trim());
  }

  function isFish(item) {
    return isBiologicalCatch(item);
  }

  function isItem(item) {
    return !!item && !isCurrency(item) && !isBiologicalCatch(item);
  }

  function fallbackPrice(item) {
    if (!item || item.kind === 'trash') return 0;
    const rarity = {普通:2,常見:4,稀有:10,史詩:28,傳說:120,神話:500,世界級:5000}[item.rarity] || 3;
    const quality = {普通:1,優秀:1.4,完美:2,閃亮:3.5,神話:6,拾獲:1.15,遺失物:1.4,變異:3,祝福:2}[item.quality] || 1;
    return Math.max(1, Math.round(Math.max(.1, Number(item.weight || 1)) * rarity * quality * Math.max(1, Number(item.coffeePearlBonus || 1))));
  }

  function priceOf(item) {
    return economy()?.sellPrice?.(item) ?? fallbackPrice(item);
  }

  function letterPrice(letter) {
    const text = `${letter.series || ''} ${letter.title || ''}`;
    if (/黑鬍子|藏寶圖/.test(text)) return 120;
    if (/海龜湯/.test(text)) return 160;
    if (/拉納爾|愛麗兒/.test(text)) return 95;
    if (/瘋狂神父|狂歡島/.test(text)) return 80;
    if (/可可|哈斯|莫納|孤島/.test(text)) return 70;
    return 45;
  }

  function letters() {
    const result = [];
    Object.entries(LETTER_STORES).forEach(([key, meta]) => {
      const list = read(key, []);
      if (!Array.isArray(list)) return;
      list.forEach((entry, index) => {
        if (!entry || typeof entry !== 'object') return;
        result.push({...entry,key,index,icon:meta.icon,series:meta.series,rarity:meta.rarity,at:Number(entry.at || 0)});
      });
    });
    return result.sort((a, b) => b.at - a.at);
  }

  function addStyle() {
    if (document.getElementById('backpackManagerStyleV6')) return;
    document.getElementById('backpackManagerStyleV5')?.remove();
    document.getElementById('backpackManagerStyleV4')?.remove();
    const style = document.createElement('style');
    style.id = 'backpackManagerStyleV6';
    style.textContent = `
      #${BUTTON_ID}{position:fixed;right:16px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:17000;border:2px solid #76536a;border-radius:18px;padding:11px 14px;background:#3a263f;color:#fff4d8;font-size:16px;font-weight:1000;box-shadow:0 8px 0 rgba(0,0,0,.3);cursor:pointer}
      #${PANEL_ID}{position:fixed;inset:calc(12px + env(safe-area-inset-top)) 12px calc(12px + env(safe-area-inset-bottom));z-index:30000;display:flex;flex-direction:column;overflow:hidden;padding:14px;border:3px solid #76536a;border-radius:24px;background:rgba(15,10,24,.985);color:#fff4d8;box-sizing:border-box;box-shadow:0 18px 48px rgba(0,0,0,.5)}
      #${PANEL_ID}.hidden{display:none!important}
      .bp-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.bp-head-main{display:flex;align-items:center;gap:10px;min-width:0}.bp-head h3{margin:0;font-size:22px}.bp-wallet{display:inline-flex;align-items:center;gap:5px;padding:7px 10px;border:2px solid #d7bb79;border-radius:999px;background:#2b2030;color:#ffe16b;font-weight:1000;white-space:nowrap}.bp-close{border:0;border-radius:14px;padding:10px 15px;background:#493249;color:#fff4d8;font-weight:1000;box-shadow:0 5px 0 rgba(0,0,0,.28)}
      .bp-tools{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px}.bp-tool{border:0;border-radius:13px;padding:10px;background:#f2a957;color:#211728;font-weight:1000}.bp-tool.secondary{background:#4f8f73;color:#fff4d8}.bp-tool.danger{background:#8f4f4b;color:#fff4d8}
      .bp-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}.bp-tab{border:2px solid #76536a;border-radius:999px;padding:8px 12px;background:#211728;color:#fff4d8;font-weight:1000}.bp-tab.active{background:#ffe16b;color:#211728;border-color:#ffe16b}
      .bp-content{min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:2px}.bp-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}.bp-card{border:2px solid #76536a;border-radius:16px;padding:12px;background:#181020;overflow-wrap:anywhere}.bp-title{display:flex;gap:8px;align-items:flex-start;font-size:17px}.bp-meta{display:block;margin-top:7px;line-height:1.55;opacity:.92}.bp-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}.bp-sell,.bp-delete{border:0;border-radius:11px;padding:9px;color:#fff4d8;font-weight:1000}.bp-sell{background:#4f8f73}.bp-delete{background:#c96a4a}.bp-empty{padding:20px;border:2px dashed #76536a;border-radius:16px;text-align:center;color:#d7bb79;font-weight:1000}.bp-price{color:#ffe16b;font-weight:1000}.bp-category{color:#9ce8f0;font-weight:1000}
      body.backpack-open{overflow:hidden!important}body.backpack-open .mobile-controls,body.backpack-open #fishingHub,body.backpack-open #fishingEventStack{visibility:hidden!important;pointer-events:none!important}
      @media(max-width:760px){#${BUTTON_ID}{right:14px;bottom:calc(108px + env(safe-area-inset-bottom));font-size:15px}#${PANEL_ID}{inset:calc(8px + env(safe-area-inset-top)) 8px calc(8px + env(safe-area-inset-bottom));padding:12px}.bp-head-main{flex-direction:column;align-items:flex-start;gap:5px}.bp-wallet{font-size:13px;padding:5px 8px}.bp-tools{grid-template-columns:1fr}.bp-list{grid-template-columns:1fr}.bp-actions{grid-template-columns:1fr 1fr}}
    `;
    document.head.appendChild(style);
  }

  function ensurePanel() {
    let panel = document.getElementById(PANEL_ID);
    if (panel) return panel;
    panel = document.createElement('aside');
    panel.id = PANEL_ID;
    panel.className = 'hidden';
    panel.setAttribute('aria-live', 'polite');
    document.body.appendChild(panel);
    return panel;
  }

  function ensureButton() {
    let button = document.getElementById(BUTTON_ID);
    if (button) return button;
    button = document.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      open();
    }, true);
    document.body.appendChild(button);
    return button;
  }

  function itemMeta(item) {
    const lines = [];
    lines.push(`<span class="bp-category">分類：${isBiologicalCatch(item) ? '漁獲（生物）' : '物品'}</span>`);
    if (item.zone) lines.push(`來源：${escapeHtml(item.zone)}`);
    if (item.rarity) lines.push(`稀有度：${escapeHtml(item.rarity)}`);
    if (item.quality) lines.push(`品質：${escapeHtml(item.quality)}`);
    if (item.weight) lines.push(`重量：${Number(item.weight).toFixed(2)} kg`);
    if (item.trait) lines.push(`特性：${formatText(item.trait)}`);
    if (item.coffeeEffectName) lines.push(`咖啡加成：${escapeHtml(item.coffeeEffectName)}`);
    const price = priceOf(item);
    lines.push(`<span class="bp-price">售價：${price > 0 ? price + ' 珍珠' : '不可販售'}</span>`);
    return lines.join('<br>');
  }

  function renderItems(items, filter) {
    const rows = items.map((item, index) => ({item, index})).filter(row => filter(row.item));
    if (!rows.length) return '<div class="bp-empty">目前沒有內容。</div>';
    return `<div class="bp-list">${rows.map(({item,index}) => `
      <article class="bp-card">
        <strong class="bp-title"><span>${escapeHtml(item.icon || (isBiologicalCatch(item) ? '🐟' : '📦'))}</span><span>${escapeHtml(`${item.quality ? item.quality + ' ' : ''}${item.name || '未知物品'}`)}</span></strong>
        <small class="bp-meta">${itemMeta(item)}</small>
        <div class="bp-actions"><button class="bp-sell" data-bp-sell="${index}" ${priceOf(item) <= 0 ? 'disabled' : ''}>販售</button><button class="bp-delete" data-bp-delete="${index}">丟棄</button></div>
      </article>`).join('')}</div>`;
  }

  function renderLetters() {
    const rows = letters();
    if (!rows.length) return '<div class="bp-empty">目前沒有信件。</div>';
    return `<div class="bp-list">${rows.map(letter => `
      <article class="bp-card">
        <strong class="bp-title"><span>${escapeHtml(letter.icon)}</span><span>${escapeHtml(letter.title || letter.series)}</span></strong>
        <small class="bp-meta">系列：${escapeHtml(letter.series)}<br>稀有度：${escapeHtml(letter.rarity)}<br>${formatText(letter.text || '')}<br><span class="bp-price">售價：${letterPrice(letter)} 珍珠</span></small>
        <div class="bp-actions"><button class="bp-sell" data-letter-sell="${escapeHtml(letter.key)}" data-letter-index="${letter.index}">販售</button><button class="bp-delete" data-letter-delete="${escapeHtml(letter.key)}" data-letter-index="${letter.index}">丟棄</button></div>
      </article>`).join('')}</div>`;
  }

  function currentRows() {
    const items = bag();
    if (activeTab === 'fish') return items.map((item,index) => ({item,index})).filter(row => isBiologicalCatch(row.item));
    if (activeTab === 'item') return items.map((item,index) => ({item,index})).filter(row => isItem(row.item));
    return letters();
  }

  function render() {
    economy()?.absorbBagPearls?.();
    const panel = ensurePanel();
    const items = bag();
    const fishCount = items.filter(isBiologicalCatch).length;
    const itemCount = items.filter(isItem).length;
    const letterCount = letters().length;
    const balance = walletBalance();
    const content = activeTab === 'fish' ? renderItems(items, isBiologicalCatch) : activeTab === 'item' ? renderItems(items, isItem) : renderLetters();
    panel.innerHTML = `
      <div class="bp-head"><div class="bp-head-main"><h3>🎒 背包管理</h3><span class="bp-wallet">🦪 ${balance} 珍珠</span></div><button class="bp-close" type="button">關閉</button></div>
      <div class="bp-tools"><button class="bp-tool" data-bp-absorb="1">合併舊珍珠</button><button class="bp-tool secondary" data-bp-sell-all="1">販售目前分類</button><button class="bp-tool danger" data-bp-clear="1">清空目前分類</button></div>
      <div class="bp-tabs"><button class="bp-tab ${activeTab==='fish'?'active':''}" data-bp-tab="fish">漁獲 ${fishCount}</button><button class="bp-tab ${activeTab==='item'?'active':''}" data-bp-tab="item">物品 ${itemCount}</button><button class="bp-tab ${activeTab==='letter'?'active':''}" data-bp-tab="letter">信件 ${letterCount}</button></div>
      <div class="bp-content">${content}</div>`;
    syncButton();
  }

  function isGameActive() {
    const creator = document.getElementById('creator');
    const game = document.getElementById('gamePanel');
    return !!game && !game.classList.contains('hidden') && (!creator || creator.classList.contains('hidden'));
  }

  function open() {
    if (!isGameActive()) return false;
    economy()?.absorbBagPearls?.();
    render();
    ensurePanel().classList.remove('hidden');
    document.body.classList.add('backpack-open');
    return true;
  }

  function close() {
    ensurePanel().classList.add('hidden');
    document.body.classList.remove('backpack-open');
  }

  function addPearls(amount, source) {
    const value = Math.max(0, Math.floor(Number(amount) || 0));
    if (!value) return;
    if (economy()?.earn) economy().earn(value, source || '販售所得', {source:'backpack'});
    else {
      const next = walletBalance() + value;
      localStorage.setItem('coffeeShipPearls', String(next));
      window.dispatchEvent(new CustomEvent('coffeeShipPearlsChanged',{detail:{pearls:next}}));
    }
  }

  function sellBag(index) {
    const items = bag();
    const item = items[index];
    if (!item) return;
    const price = priceOf(item);
    if (price <= 0) return;
    items.splice(index, 1);
    setBag(items);
    addPearls(price, `販售：${item.name || '物品'}`);
    render();
  }

  function deleteBag(index) {
    const items = bag();
    items.splice(index, 1);
    setBag(items);
    render();
  }

  function sellLetter(key, index) {
    const list = read(key, []);
    const meta = LETTER_STORES[key] || {};
    const letter = list[index];
    if (!letter) return;
    list.splice(index, 1);
    save(key, list);
    addPearls(letterPrice({...letter,series:meta.series}), `販售：${letter.title || meta.series || '信件'}`);
    render();
  }

  function deleteLetter(key, index) {
    const list = read(key, []);
    list.splice(index, 1);
    save(key, list);
    render();
  }

  function sellAllCurrent() {
    if (!confirm('確定要販售目前分類中的所有可販售內容嗎？')) return;
    let total = 0;
    let count = 0;

    if (activeTab === 'letter') {
      Object.entries(LETTER_STORES).forEach(([key,meta]) => {
        const list = read(key, []);
        if (!Array.isArray(list)) return;
        list.forEach(letter => { total += letterPrice({...letter,series:meta.series}); count += 1; });
        save(key, []);
      });
    } else {
      const items = bag();
      const remaining = [];
      items.forEach(item => {
        const inCurrent = activeTab === 'fish' ? isBiologicalCatch(item) : isItem(item);
        const price = inCurrent ? priceOf(item) : 0;
        if (inCurrent && price > 0) { total += price; count += 1; }
        else remaining.push(item);
      });
      setBag(remaining);
    }

    if (total > 0) addPearls(total, `批次販售 ${count} 件內容`);
    render();
  }

  function clearCurrent() {
    if (!confirm('確定要清空目前分類嗎？這不會影響珍珠錢包。')) return;
    if (activeTab === 'letter') Object.keys(LETTER_STORES).forEach(key => save(key, []));
    else {
      const items = bag();
      setBag(items.filter(item => activeTab === 'fish' ? !isBiologicalCatch(item) : !isItem(item)));
    }
    render();
  }

  function bind() {
    document.addEventListener('click', event => {
      if (!event.target.closest?.(`#${PANEL_ID}`)) return;
      if (event.target.closest('.bp-close')) { close(); return; }
      const tab = event.target.closest('[data-bp-tab]');
      if (tab) { activeTab = tab.dataset.bpTab; render(); return; }
      if (event.target.closest('[data-bp-absorb]')) { economy()?.absorbBagPearls?.('手動合併舊珍珠'); render(); return; }
      if (event.target.closest('[data-bp-sell-all]')) { sellAllCurrent(); return; }
      if (event.target.closest('[data-bp-clear]')) { clearCurrent(); return; }
      const sell = event.target.closest('[data-bp-sell]');
      if (sell) { sellBag(Number(sell.dataset.bpSell)); return; }
      const remove = event.target.closest('[data-bp-delete]');
      if (remove) { deleteBag(Number(remove.dataset.bpDelete)); return; }
      const sellLetterButton = event.target.closest('[data-letter-sell]');
      if (sellLetterButton) { sellLetter(sellLetterButton.dataset.letterSell, Number(sellLetterButton.dataset.letterIndex)); return; }
      const deleteLetterButton = event.target.closest('[data-letter-delete]');
      if (deleteLetterButton) deleteLetter(deleteLetterButton.dataset.letterDelete, Number(deleteLetterButton.dataset.letterIndex));
    }, true);
  }

  function syncButton() {
    const button = ensureButton();
    button.style.display = isGameActive() ? 'block' : 'none';
    button.textContent = `🎒 背包 · 🦪 ${walletBalance()}`;
    if (!isGameActive()) close();
  }

  function refreshOpenPanel() {
    syncButton();
    if (!ensurePanel().classList.contains('hidden')) render();
  }

  function init() {
    addStyle();
    ensurePanel();
    ensureButton();
    economy()?.absorbBagPearls?.();
    bind();
    syncButton();
    window.addEventListener('coffee-ship:entered', syncButton);
    window.addEventListener('coffee-ship:scene', syncButton);
    window.addEventListener('coffee-ship:economy-changed', refreshOpenPanel);
    window.addEventListener('coffee-ship:bag-changed', refreshOpenPanel);
    window.addEventListener('coffeeShipPearlsChanged', syncButton);
    const observer = new MutationObserver(syncButton);
    const creator = document.getElementById('creator');
    const game = document.getElementById('gamePanel');
    if (creator) observer.observe(creator,{attributes:true,attributeFilter:['class']});
    if (game) observer.observe(game,{attributes:true,attributeFilter:['class']});
    window.COFFEE_SHIP_BACKPACK_MANAGER = {
      open,
      close,
      rebuild:render,
      panel:ensurePanel,
      sellAll:sellAllCurrent,
      classify:item => isBiologicalCatch(item) ? 'catch' : isCurrency(item) ? 'currency' : 'item',
      isBiologicalCatch,
      version:6
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();