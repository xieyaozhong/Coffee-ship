(() => {
  'use strict';

  let activeTab = 'fish';

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch (e) { return fallback; }
  }
  function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function bag() { return read('coffeeShipFishBag', []); }
  function setBag(items) { save('coffeeShipFishBag', items.slice(-120)); }

  function isFish(item) {
    return !item || item.kind === 'fish' || item.kind === 'mutant' || (!item.kind && item.weight && !/瓶|信|圖|殘頁|面具|帽|鞋|杯|戒|鏡|玩具|布偶|手套|緞帶/.test(item.name || ''));
  }
  function isLetter(item) {
    return item && (item.kind === 'letter' || /瓶|信|藏寶圖|殘頁|漂流瓶/.test(item.name || item.title || ''));
  }
  function isItem(item) { return item && !isFish(item) && !isLetter(item); }

  function letterSources() {
    const sources = [
      ['coffeeShipBottleLetters','🍾'], ['coffeeShipLanarLetters','🌊'], ['coffeeShipArielLetters','🧜‍♀️'],
      ['coffeeShipIslandLetters','🏝️'], ['coffeeShipBlackbeardLetters','🏴‍☠️'], ['coffeeShipMadPriestLetters','📜'],
      ['coffeeShipCarnivalLetters','🎭']
    ];
    const out = [];
    sources.forEach(([key, icon]) => read(key, []).forEach((x, i) => out.push({ key, index: i, icon, title: x.title, text: x.text, at: x.at || 0 })));
    return out.sort((a,b)=>b.at-a.at);
  }

  function addStyle() {
    if (document.getElementById('backpackManagerStyle')) return;
    const s = document.createElement('style');
    s.id = 'backpackManagerStyle';
    s.textContent = `
      .backpack-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 12px}.backpack-tab{border:2px solid #76536a;background:#211728;color:#fff4d8;border-radius:999px;padding:7px 11px;font-weight:900;cursor:pointer}.backpack-tab.active{background:#ffe16b;color:#211728;border-color:#ffe16b}.backpack-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}.backpack-entry{border:2px solid #76536a;background:#171020;border-radius:14px;padding:10px;color:#fff4d8;font-weight:850}.backpack-entry small{display:block;opacity:.86;line-height:1.45;margin-top:4px}.discard-btn{margin-top:8px;border:0;border-radius:10px;padding:7px 10px;background:#c96a4a;color:#fff4d8;font-weight:950;cursor:pointer}.discard-btn:hover{filter:brightness(1.12)}.backpack-empty{border:2px dashed #76536a;border-radius:14px;padding:14px;text-align:center;color:#d7bb79;font-weight:900}
      @media(max-width:760px){.backpack-list{grid-template-columns:1fr}.backpack-tab{font-size:13px;padding:6px 9px}.discard-btn{width:100%}}
    `;
    document.head.appendChild(s);
  }

  function itemTitle(item) {
    const icon = item.icon || (item.kind === 'mutant' ? '🧬' : '🐟');
    return `${icon} ${item.quality ? item.quality + ' ' : ''}${item.name || '未知物品'}`;
  }
  function itemDetail(item) {
    const parts = [];
    if (item.zone) parts.push(`來源：${item.zone}`);
    if (item.rarity) parts.push(`稀有度：${item.rarity}`);
    if (item.weight) parts.push(`重量：${Number(item.weight).toFixed(2)} kg`);
    if (item.trait) parts.push(`特性：${item.trait}`);
    return parts.join('<br>');
  }

  function discardBagIndex(index) {
    const items = bag();
    items.splice(index, 1);
    setBag(items);
    refresh(true);
  }
  function discardLetter(key, index) {
    const list = read(key, []);
    list.splice(index, 1);
    save(key, list);
    refresh(true);
  }

  function renderFish(items) {
    const arr = items.map((item, index) => ({ item, index })).filter(x => isFish(x.item));
    if (!arr.length) return '<div class="backpack-empty">目前沒有魚類。</div>';
    return `<div class="backpack-list">${arr.map(({item,index}) => `<div class="backpack-entry"><strong>${itemTitle(item)}</strong><small>${itemDetail(item)}</small><button class="discard-btn" data-discard-bag="${index}">丟棄</button></div>`).join('')}</div>`;
  }
  function renderItems(items) {
    const arr = items.map((item, index) => ({ item, index })).filter(x => isItem(x.item));
    if (!arr.length) return '<div class="backpack-empty">目前沒有物品。</div>';
    return `<div class="backpack-list">${arr.map(({item,index}) => `<div class="backpack-entry"><strong>${itemTitle(item)}</strong><small>${itemDetail(item) || '特殊物品'}</small><button class="discard-btn" data-discard-bag="${index}">丟棄</button></div>`).join('')}</div>`;
  }
  function renderLetters() {
    const arr = letterSources();
    if (!arr.length) return '<div class="backpack-empty">目前沒有信件。</div>';
    return `<div class="backpack-list">${arr.map(l => `<div class="backpack-entry"><strong>${l.icon} ${l.title}</strong><small>${l.text || ''}</small><button class="discard-btn" data-discard-letter-key="${l.key}" data-discard-letter-index="${l.index}">丟棄</button></div>`).join('')}</div>`;
  }

  function targetPanel() { return document.getElementById('fishDexPanel'); }
  function refresh(force) {
    const panel = targetPanel();
    if (!panel || panel.classList.contains('hidden')) return;
    const stamp = `${activeTab}-${JSON.stringify(bag()).length}-${letterSources().length}`;
    if (!force && panel.dataset.backpackManagerStamp === stamp) return;
    panel.dataset.backpackManagerStamp = stamp;
    let root = panel.querySelector('#backpackManagerRoot');
    if (!root) {
      root = document.createElement('section');
      root.id = 'backpackManagerRoot';
      root.innerHTML = '<h3>🎒 背包管理</h3><div class="backpack-tabs"></div><div class="backpack-content"></div>';
      panel.insertBefore(root, panel.firstChild?.nextSibling || panel.firstChild);
    }
    const items = bag();
    const counts = { fish: items.filter(isFish).length, item: items.filter(isItem).length, letter: letterSources().length };
    root.querySelector('.backpack-tabs').innerHTML = `
      <button class="backpack-tab ${activeTab==='fish'?'active':''}" data-tab="fish">魚類 ${counts.fish}</button>
      <button class="backpack-tab ${activeTab==='item'?'active':''}" data-tab="item">物品 ${counts.item}</button>
      <button class="backpack-tab ${activeTab==='letter'?'active':''}" data-tab="letter">信件 ${counts.letter}</button>
    `;
    root.querySelector('.backpack-content').innerHTML = activeTab === 'fish' ? renderFish(items) : activeTab === 'item' ? renderItems(items) : renderLetters();
  }

  function bind() {
    document.addEventListener('click', e => {
      const tab = e.target.closest?.('.backpack-tab');
      if (tab) { activeTab = tab.dataset.tab; refresh(true); return; }
      const bagBtn = e.target.closest?.('[data-discard-bag]');
      if (bagBtn) { discardBagIndex(Number(bagBtn.dataset.discardBag)); return; }
      const letterBtn = e.target.closest?.('[data-discard-letter-key]');
      if (letterBtn) { discardLetter(letterBtn.dataset.discardLetterKey, Number(letterBtn.dataset.discardLetterIndex)); }
    }, true);
  }

  function init() { addStyle(); bind(); setInterval(() => refresh(false), 350); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();