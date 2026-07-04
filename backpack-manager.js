(() => {
  'use strict';

  let activeTab = 'fish';
  let lastVisible = false;

  function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch (e) { return fallback; } }
  function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function bag() { return read('coffeeShipFishBag', []); }
  function setBag(items) { save('coffeeShipFishBag', items.slice(-180)); }

  function isCurrency(item) { return item && item.kind === 'currency'; }
  function isFish(item) { return item && !isCurrency(item) && (item.kind === 'fish' || item.kind === 'mutant' || (!item.kind && item.weight && !/瓶|信|圖|殘頁|面具|帽|鞋|杯|戒|鏡|玩具|布偶|手套|緞帶/.test(item.name || ''))); }
  function isLetter(item) { return item && (item.kind === 'letter' || /瓶|信|藏寶圖|殘頁|漂流瓶/.test(item.name || item.title || '')); }
  function isItem(item) { return item && !isFish(item) && !isLetter(item); }

  function letterSources() {
    const sources = [['coffeeShipBottleLetters','🍾'],['coffeeShipLanarLetters','🌊'],['coffeeShipArielLetters','🧜‍♀️'],['coffeeShipIslandLetters','🏝️'],['coffeeShipBlackbeardLetters','🏴‍☠️'],['coffeeShipMadPriestLetters','📜'],['coffeeShipCarnivalLetters','🎭']];
    const out = [];
    sources.forEach(([key, icon]) => read(key, []).forEach((x, i) => out.push({ key, index: i, icon, title: x.title, text: x.text, at: x.at || 0 })));
    return out.sort((a,b)=>b.at-a.at);
  }

  function addStyle() {
    if (document.getElementById('backpackManagerStyle')) return;
    const s = document.createElement('style');
    s.id = 'backpackManagerStyle';
    s.textContent = `
      #backpackManagerRoot{display:block!important;visibility:visible!important;margin:14px 0 18px;padding:12px;border:2px solid #76536a;border-radius:18px;background:rgba(16,10,22,.94);position:relative;z-index:3}
      #backpackSafeOpenBtn{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:16000;border:0;border-radius:18px;padding:12px 14px;background:#3a263f;color:#fff4d8;font-weight:1000;box-shadow:0 8px 0 rgba(0,0,0,.28);border:2px solid #76536a;cursor:pointer}
      .backpack-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 12px}.backpack-tab{border:2px solid #76536a;background:#211728;color:#fff4d8;border-radius:999px;padding:7px 11px;font-weight:900;cursor:pointer}.backpack-tab.active{background:#ffe16b;color:#211728;border-color:#ffe16b}.backpack-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}.backpack-entry{border:2px solid #76536a;background:#171020;border-radius:14px;padding:10px;color:#fff4d8;font-weight:850}.backpack-entry small{display:block;opacity:.86;line-height:1.45;margin-top:4px}.backpack-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.discard-btn,.sell-btn{border:0;border-radius:10px;padding:7px 10px;color:#fff4d8;font-weight:950;cursor:pointer}.discard-btn{background:#c96a4a}.sell-btn{background:#4f8f73}.discard-btn:hover,.sell-btn:hover{filter:brightness(1.12)}.backpack-empty{border:2px dashed #76536a;border-radius:14px;padding:14px;text-align:center;color:#d7bb79;font-weight:900}.backpack-tools{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}.backpack-tool{border:0;border-radius:12px;padding:7px 10px;background:#f2a957;color:#211728;font-weight:950;cursor:pointer}.price-line{color:#ffe16b;font-weight:1000}
      @media(max-width:900px){#backpackSafeOpenBtn{right:14px;bottom:calc(110px + env(safe-area-inset-bottom));font-size:18px;padding:13px 15px}.backpack-list{grid-template-columns:1fr}.backpack-tab{font-size:13px;padding:6px 9px}.discard-btn,.sell-btn,.backpack-tool{width:100%}.backpack-actions{gap:6px}}
    `;
    document.head.appendChild(s);
  }

  function itemTitle(item) { const icon = item.icon || (item.kind === 'mutant' ? '🧬' : isCurrency(item) ? '🦪' : isItem(item) ? '📦' : '🐟'); return `${icon} ${item.quality && item.kind !== 'currency' ? item.quality + ' ' : ''}${item.name || '未知物品'}`; }
  function priceOf(item) { if (!item) return 1; if (item.kind === 'currency') return Math.max(1, Number(item.amount || 1)); const rarity = { '普通': 4, '常見': 7, '稀有': 18, '史詩': 55, '傳說': 180, '神話': 520, '世界級': 3000 }[item.rarity] || 10; const quality = { '普通': 1, '優秀': 1.25, '完美': 1.7, '閃亮': 2.4, '神話': 4, '拾獲': 1.1, '遺失物': 1.4, '變異': 3 }[item.quality] || 1; const weight = Math.max(1, Number(item.weight || 1)); const kindBoost = item.kind === 'mutant' ? 4 : item.kind === 'treasure' ? 1.8 : isFish(item) ? 1 : 1.2; return Math.max(1, Math.round(weight * rarity * quality * kindBoost)); }
  function letterPrice(letter) { const t = `${letter.title || ''} ${letter.text || ''}`; if (/黑鬍子|藏寶圖/.test(t)) return 120; if (/拉納爾|愛麗兒/.test(t)) return 95; if (/瘋狂神父|狂歡島/.test(t)) return 80; if (/哈斯|可可|莫納|孤島/.test(t)) return 70; return 45; }
  function itemDetail(item) { const parts = []; if (item.zone) parts.push(`來源：${item.zone}`); if (item.rarity) parts.push(`稀有度：${item.rarity}`); if (item.weight) parts.push(`重量：${Number(item.weight).toFixed(2)} kg`); if (item.amount) parts.push(`數量：${Number(item.amount)} 珍珠`); if (item.trait) parts.push(`特性：${item.trait}`); parts.push(`<span class="price-line">售價：${priceOf(item)} 珍珠</span>`); return parts.join('<br>'); }

  function addPearls(amount, source) { const items = bag(); items.push({ name: `${amount} 珍珠`, kind: 'currency', icon: '🦪', amount, zone: source || '販售所得', rarity: '常見', quality: '貨幣', at: Date.now() }); setBag(items); }
  function organizePearls() { const items = bag(); const total = items.filter(isCurrency).reduce((s, x) => s + Number(x.amount || 0), 0); const others = items.filter(x => !isCurrency(x)); if (total > 0) others.push({ name: `${total} 珍珠`, kind: 'currency', icon: '🦪', amount: total, zone: '整理珍珠', rarity: '常見', quality: '貨幣', at: Date.now() }); setBag(others); activeTab = 'item'; forceBuild(); }
  function discardBagIndex(index) { const items = bag(); items.splice(index, 1); setBag(items); forceBuild(); }
  function sellBagIndex(index) { const items = bag(); const item = items[index]; const price = priceOf(item); items.splice(index, 1); setBag(items); addPearls(price, `販售：${item?.name || '物品'}`); activeTab = 'item'; forceBuild(); }
  function discardLetter(key, index) { const list = read(key, []); list.splice(index, 1); save(key, list); forceBuild(); }
  function sellLetter(key, index) { const list = read(key, []); const letter = list[index]; const price = letterPrice(letter || {}); list.splice(index, 1); save(key, list); addPearls(price, `販售：${letter?.title || '信件'}`); activeTab = 'item'; forceBuild(); }
  function discardCurrentItems() { const items = bag(); const next = activeTab === 'fish' ? items.filter(x => !isFish(x)) : activeTab === 'item' ? items.filter(x => !isItem(x)) : items; if (activeTab === 'letter') ['coffeeShipBottleLetters','coffeeShipLanarLetters','coffeeShipArielLetters','coffeeShipIslandLetters','coffeeShipBlackbeardLetters','coffeeShipMadPriestLetters','coffeeShipCarnivalLetters'].forEach(k => save(k, [])); else setBag(next); forceBuild(); }

  function renderFish(items) { const arr = items.map((item, index) => ({ item, index })).filter(x => isFish(x.item)); if (!arr.length) return '<div class="backpack-empty">目前沒有魚類。</div>'; return `<div class="backpack-list">${arr.map(({item,index}) => `<div class="backpack-entry"><strong>${itemTitle(item)}</strong><small>${itemDetail(item)}</small><div class="backpack-actions"><button class="sell-btn" data-sell-bag="${index}">販售</button><button class="discard-btn" data-discard-bag="${index}">丟棄</button></div></div>`).join('')}</div>`; }
  function renderItems(items) { const arr = items.map((item, index) => ({ item, index })).filter(x => isItem(x.item)); if (!arr.length) return '<div class="backpack-empty">目前沒有物品。</div>'; return `<div class="backpack-list">${arr.map(({item,index}) => `<div class="backpack-entry"><strong>${itemTitle(item)}</strong><small>${itemDetail(item) || '特殊物品'}</small><div class="backpack-actions"><button class="sell-btn" data-sell-bag="${index}">販售</button><button class="discard-btn" data-discard-bag="${index}">丟棄</button></div></div>`).join('')}</div>`; }
  function renderLetters() { const arr = letterSources(); if (!arr.length) return '<div class="backpack-empty">目前沒有信件。</div>'; return `<div class="backpack-list">${arr.map(l => `<div class="backpack-entry"><strong>${l.icon} ${l.title}</strong><small>${l.text || ''}<br><span class="price-line">售價：${letterPrice(l)} 珍珠</span></small><div class="backpack-actions"><button class="sell-btn" data-sell-letter-key="${l.key}" data-sell-letter-index="${l.index}">販售</button><button class="discard-btn" data-discard-letter-key="${l.key}" data-discard-letter-index="${l.index}">丟棄</button></div></div>`).join('')}</div>`; }

  function panel() { return document.getElementById('fishDexPanel'); }
  function cleanupLegacyButtons(p) { Array.from(p.querySelectorAll('button')).forEach(btn => { const text=(btn.textContent||'').trim(); if (text === '只關閉' || text.includes('賣出背包可販售漁獲')) btn.remove(); }); }
  function stripOldSections(p) { p.querySelectorAll('#backpackManagerRoot').forEach(x => x.remove()); }
  function forceBuild() {
    const p = panel();
    if (!p || p.classList.contains('hidden')) return;
    stripOldSections(p);
    cleanupLegacyButtons(p);
    const root = document.createElement('section');
    root.id = 'backpackManagerRoot';
    const items = bag();
    const counts = { fish: items.filter(isFish).length, item: items.filter(isItem).length, letter: letterSources().length };
    const pearlTotal = items.filter(isCurrency).reduce((s,x)=>s+Number(x.amount||0),0);
    root.innerHTML = `<h3>🎒 背包管理</h3><div class="backpack-tools"><button class="backpack-tool" data-organize-pearls="1">整理珍珠：${pearlTotal}</button><button class="backpack-tool" data-clear-current="1">清空目前分類</button></div><div class="backpack-tabs"><button class="backpack-tab ${activeTab==='fish'?'active':''}" data-tab="fish">魚類 ${counts.fish}</button><button class="backpack-tab ${activeTab==='item'?'active':''}" data-tab="item">物品 ${counts.item}</button><button class="backpack-tab ${activeTab==='letter'?'active':''}" data-tab="letter">信件 ${counts.letter}</button></div><div class="backpack-content">${activeTab === 'fish' ? renderFish(items) : activeTab === 'item' ? renderItems(items) : renderLetters()}</div>`;
    p.insertBefore(root, p.firstChild);
  }
  function openBackpack() {
    const p = panel();
    if (!p) return;
    p.classList.remove('hidden');
    p.style.display = '';
    p.style.visibility = 'visible';
    p.style.pointerEvents = 'auto';
    setTimeout(forceBuild, 30);
  }
  function ensureOpenButton() {
    if (document.getElementById('backpackSafeOpenBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'backpackSafeOpenBtn';
    btn.type = 'button';
    btn.textContent = '📖 背包';
    btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openBackpack(); }, true);
    document.body.appendChild(btn);
  }
  function sync() { ensureOpenButton(); const p = panel(); const visible = !!p && !p.classList.contains('hidden'); if (visible && !lastVisible) setTimeout(forceBuild, 60); if (visible && !p.querySelector('#backpackManagerRoot')) forceBuild(); if (visible) cleanupLegacyButtons(p); lastVisible = visible; }

  function bind() {
    document.addEventListener('click', e => {
      const tab = e.target.closest?.('.backpack-tab'); if (tab) { activeTab = tab.dataset.tab; forceBuild(); e.preventDefault(); return; }
      const org = e.target.closest?.('[data-organize-pearls]'); if (org) { organizePearls(); e.preventDefault(); return; }
      const clearBtn = e.target.closest?.('[data-clear-current]'); if (clearBtn) { if (confirm('確定要清空目前分類嗎？')) discardCurrentItems(); e.preventDefault(); return; }
      const sellBagBtn = e.target.closest?.('[data-sell-bag]'); if (sellBagBtn) { sellBagIndex(Number(sellBagBtn.dataset.sellBag)); e.preventDefault(); return; }
      const bagBtn = e.target.closest?.('[data-discard-bag]'); if (bagBtn) { discardBagIndex(Number(bagBtn.dataset.discardBag)); e.preventDefault(); return; }
      const sellLetterBtn = e.target.closest?.('[data-sell-letter-key]'); if (sellLetterBtn) { sellLetter(sellLetterBtn.dataset.sellLetterKey, Number(sellLetterBtn.dataset.sellLetterIndex)); e.preventDefault(); return; }
      const letterBtn = e.target.closest?.('[data-discard-letter-key]'); if (letterBtn) { discardLetter(letterBtn.dataset.discardLetterKey, Number(letterBtn.dataset.discardLetterIndex)); e.preventDefault(); }
    }, true);
  }

  function init() { addStyle(); ensureOpenButton(); bind(); setInterval(sync, 120); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();