(() => {
  'use strict';
  if (window.__COFFEE_SHIP_BACKPACK_MANAGER_V4__) return;
  window.__COFFEE_SHIP_BACKPACK_MANAGER_V4__ = true;

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

  function bag() {
    const value = read(BAG_KEY, []);
    return Array.isArray(value) ? value : [];
  }

  function setBag(items) {
    save(BAG_KEY, items.slice(-240));
  }

  function isCurrency(item) {
    return item?.kind === 'currency';
  }

  function isFish(item) {
    if (!item || isCurrency(item)) return false;
    if (item.kind === 'fish' || item.kind === 'mutant') return true;
    return !!item.weight && !/瓶|信|圖|殘頁|面具|帽|鞋|杯|戒|鏡|玩具|布偶|手套|緞帶|皇冠|項鍊/.test(item.name || '');
  }

  function isItem(item) {
    return !!item && !isFish(item);
  }

  function priceOf(item) {
    if (!item) return 1;
    if (isCurrency(item)) return Math.max(1, Number(item.amount || 1));
    const rarity = {普通:4,常見:7,稀有:18,史詩:55,傳說:180,神話:520,世界級:3000}[item.rarity] || 10;
    const quality = {普通:1,優秀:1.25,完美:1.7,閃亮:2.4,神話:4,拾獲:1.1,遺失物:1.4,變異:3,祝福:2}[item.quality] || 1;
    const weight = Math.max(.1, Number(item.weight || 1));
    return Math.max(1, Math.round(weight * rarity * quality));
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
        result.push({
          ...entry,
          key,
          index,
          icon:meta.icon,
          series:meta.series,
          rarity:meta.rarity,
          at:Number(entry.at || 0)
        });
      });
    });
    return result.sort((a, b) => b.at - a.at);
  }

  function addStyle() {
    if (document.getElementById('backpackManagerStyleV4')) return;
    const style = document.createElement('style');
    style.id = 'backpackManagerStyleV4';
    style.textContent = `
      #${BUTTON_ID}{position:fixed;right:16px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:17000;border:2px solid #76536a;border-radius:18px;padding:12px 15px;background:#3a263f;color:#fff4d8;font-size:17px;font-weight:1000;box-shadow:0 8px 0 rgba(0,0,0,.3);cursor:pointer}
      #${PANEL_ID}{position:fixed;inset:calc(12px + env(safe-area-inset-top)) 12px calc(12px + env(safe-area-inset-bottom));z-index:30000;display:flex;flex-direction:column;overflow:hidden;padding:14px;border:3px solid #76536a;border-radius:24px;background:rgba(15,10,24,.985);color:#fff4d8;box-sizing:border-box;box-shadow:0 18px 48px rgba(0,0,0,.5)}
      #${PANEL_ID}.hidden{display:none!important}
      .bp-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}.bp-head h3{margin:0;font-size:22px}.bp-close{border:0;border-radius:14px;padding:10px 15px;background:#493249;color:#fff4d8;font-weight:1000;box-shadow:0 5px 0 rgba(0,0,0,.28)}
      .bp-tools{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}.bp-tool{border:0;border-radius:13px;padding:10px;background:#f2a957;color:#211728;font-weight:1000}
      .bp-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}.bp-tab{border:2px solid #76536a;border-radius:999px;padding:8px 12px;background:#211728;color:#fff4d8;font-weight:1000}.bp-tab.active{background:#ffe16b;color:#211728;border-color:#ffe16b}
      .bp-content{min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:2px}
      .bp-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}.bp-card{border:2px solid #76536a;border-radius:16px;padding:12px;background:#181020;overflow-wrap:anywhere}.bp-title{display:flex;gap:8px;align-items:flex-start;font-size:17px}.bp-meta{display:block;margin-top:7px;line-height:1.55;opacity:.92}.bp-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}.bp-sell,.bp-delete{border:0;border-radius:11px;padding:9px;color:#fff4d8;font-weight:1000}.bp-sell{background:#4f8f73}.bp-delete{background:#c96a4a}.bp-empty{padding:20px;border:2px dashed #76536a;border-radius:16px;text-align:center;color:#d7bb79;font-weight:1000}.bp-price{color:#ffe16b;font-weight:1000}
      body.backpack-open{overflow:hidden!important}
      body.backpack-open .mobile-controls,body.backpack-open #fishingHub,body.backpack-open #fishingEventStack{visibility:hidden!important;pointer-events:none!important}
      @media(max-width:760px){#${BUTTON_ID}{right:14px;bottom:calc(108px + env(safe-area-inset-bottom));font-size:18px}#${PANEL_ID}{inset:calc(8px + env(safe-area-inset-top)) 8px calc(8px + env(safe-area-inset-bottom));padding:12px}.bp-tools{grid-template-columns:1fr}.bp-list{grid-template-columns:1fr}.bp-actions{grid-template-columns:1fr 1fr}}
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
    button.textContent = '📖 背包';
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
    if (item.zone) lines.push(`來源：${escapeHtml(item.zone)}`);
    if (item.rarity) lines.push(`稀有度：${escapeHtml(item.rarity)}`);
    if (item.quality) lines.push(`品質：${escapeHtml(item.quality)}`);
    if (item.weight) lines.push(`重量：${Number(item.weight).toFixed(2)} kg`);
    if (item.amount) lines.push(`數量：${Number(item.amount)} 珍珠`);
    if (item.trait) lines.push(`特性：${formatText(item.trait)}`);
    lines.push(`<span class="bp-price">售價：${priceOf(item)} 珍珠</span>`);
    return lines.join('<br>');
  }

  function renderItems(items, filter) {
    const rows = items.map((item, index) => ({item, index})).filter(row => filter(row.item));
    if (!rows.length) return '<div class="bp-empty">目前沒有內容。</div>';
    return `<div class="bp-list">${rows.map(({item,index}) => `
      <article class="bp-card">
        <strong class="bp-title"><span>${escapeHtml(item.icon || (isFish(item) ? '🐟' : isCurrency(item) ? '🦪' : '📦'))}</span><span>${escapeHtml(`${item.quality && !isCurrency(item) ? item.quality + ' ' : ''}${item.name || '未知物品'}`)}</span></strong>
        <small class="bp-meta">${itemMeta(item)}</small>
        <div class="bp-actions"><button class="bp-sell" data-bp-sell="${index}">販售</button><button class="bp-delete" data-bp-delete="${index}">丟棄</button></div>
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

  function render() {
    const panel = ensurePanel();
    const items = bag();
    const fishCount = items.filter(isFish).length;
    const itemCount = items.filter(isItem).length;
    const letterCount = letters().length;
    const pearlTotal = items.filter(isCurrency).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const content = activeTab === 'fish' ? renderItems(items, isFish) : activeTab === 'item' ? renderItems(items, isItem) : renderLetters();
    panel.innerHTML = `
      <div class="bp-head"><h3>🎒 背包管理</h3><button class="bp-close" type="button">關閉</button></div>
      <div class="bp-tools"><button class="bp-tool" data-bp-organize="1">整理珍珠：${pearlTotal}</button><button class="bp-tool" data-bp-clear="1">清空目前分類</button></div>
      <div class="bp-tabs"><button class="bp-tab ${activeTab==='fish'?'active':''}" data-bp-tab="fish">魚類 ${fishCount}</button><button class="bp-tab ${activeTab==='item'?'active':''}" data-bp-tab="item">物品 ${itemCount}</button><button class="bp-tab ${activeTab==='letter'?'active':''}" data-bp-tab="letter">信件 ${letterCount}</button></div>
      <div class="bp-content">${content}</div>`;
  }

  function isGameActive() {
    const creator = document.getElementById('creator');
    const game = document.getElementById('gamePanel');
    return !!game && !game.classList.contains('hidden') && (!creator || creator.classList.contains('hidden'));
  }

  function open() {
    if (!isGameActive()) return false;
    const panel = ensurePanel();
    render();
    panel.classList.remove('hidden');
    document.body.classList.add('backpack-open');
    return true;
  }

  function close() {
    ensurePanel().classList.add('hidden');
    document.body.classList.remove('backpack-open');
  }

  function addPearls(amount, source) {
    const items = bag();
    items.push({name:`${amount} 珍珠`,kind:'currency',icon:'🦪',amount,zone:source || '販售所得',rarity:'常見',quality:'貨幣',at:Date.now()});
    setBag(items);
  }

  function sellBag(index) {
    const items = bag();
    const item = items[index];
    if (!item) return;
    const price = priceOf(item);
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

  function organizePearls() {
    const items = bag();
    const total = items.filter(isCurrency).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const others = items.filter(item => !isCurrency(item));
    if (total > 0) others.push({name:`${total} 珍珠`,kind:'currency',icon:'🦪',amount:total,zone:'整理珍珠',rarity:'常見',quality:'貨幣',at:Date.now()});
    setBag(others);
    activeTab = 'item';
    render();
  }

  function clearCurrent() {
    if (!confirm('確定要清空目前分類嗎？')) return;
    if (activeTab === 'letter') {
      Object.keys(LETTER_STORES).forEach(key => save(key, []));
    } else {
      const items = bag();
      setBag(items.filter(item => activeTab === 'fish' ? !isFish(item) : !isItem(item)));
    }
    render();
  }

  function bind() {
    document.addEventListener('click', event => {
      if (!event.target.closest?.(`#${PANEL_ID}`)) return;
      const closeButton = event.target.closest('.bp-close');
      if (closeButton) { close(); return; }
      const tab = event.target.closest('[data-bp-tab]');
      if (tab) { activeTab = tab.dataset.bpTab; render(); return; }
      const organize = event.target.closest('[data-bp-organize]');
      if (organize) { organizePearls(); return; }
      const clearButton = event.target.closest('[data-bp-clear]');
      if (clearButton) { clearCurrent(); return; }
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
    ensureButton().style.display = isGameActive() ? 'block' : 'none';
    if (!isGameActive()) close();
  }

  function init() {
    addStyle();
    ensurePanel();
    ensureButton();
    bind();
    syncButton();
    window.addEventListener('coffee-ship:entered', syncButton);
    window.addEventListener('coffee-ship:scene', syncButton);
    const observer = new MutationObserver(syncButton);
    const creator = document.getElementById('creator');
    const game = document.getElementById('gamePanel');
    if (creator) observer.observe(creator,{attributes:true,attributeFilter:['class']});
    if (game) observer.observe(game,{attributes:true,attributeFilter:['class']});
    window.COFFEE_SHIP_BACKPACK_MANAGER = {open,close,rebuild:render,panel:ensurePanel};
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();