(() => {
  'use strict';
  if (window.__COFFEE_SHIP_BACKPACK_MANAGER_V3__) return;
  window.__COFFEE_SHIP_BACKPACK_MANAGER_V3__ = true;

  let activeTab = 'fish';
  let lastVisible = false;

  const LETTER_META = {
    coffeeShipBottleLetters:{ icon:'😂', series:'冷笑話漂流瓶', rarity:'普通', type:'joke', count:50 },
    coffeeShipLanarLetters:{ icon:'🌊', series:'拉納爾漂流瓶', rarity:'史詩', type:'lanar', count:30 },
    coffeeShipArielLetters:{ icon:'🧜‍♀️', series:'愛麗兒漂流瓶', rarity:'史詩', type:'ariel', count:30 },
    coffeeShipIslandLetters:{ icon:'🏝️', series:'可可漂流瓶', rarity:'稀有', type:'island', count:30 },
    coffeeShipBlackbeardLetters:{ icon:'🏴‍☠️', series:'黑鬍子藏寶圖', rarity:'傳說', type:'blackbeard', count:10 },
    coffeeShipMadPriestLetters:{ icon:'📜', series:'瘋狂神父殘頁', rarity:'傳說', type:'priest', count:30 },
    coffeeShipCarnivalLetters:{ icon:'🎭', series:'狂歡島漂流瓶', rarity:'史詩', type:'carnival', count:30 },
    coffeeShipTurtleSoupLetters:{ icon:'🍲', series:'海龜湯神秘故事', rarity:'神話', type:'turtle', count:10 }
  };

  const JOKES = [
    ['魚的請鮭假','魚為什麼不上班？因為牠今天請鮭假。瓶子裡還附了一張請假單，上面只寫著：逆流太累，明天再游。'],
    ['章魚的八十分','章魚考試都考幾分？八十分。牠說不是不想考一百，是手太多，寫到最後自己先打結。'],
    ['螃蟹直走訓練','螃蟹最大的夢想，是有一天可以直著走。牠練了一整晚，隔天大家說：你只是橫得比較有自信。'],
    ['海馬的交通工具','海馬到底騎什麼？另一匹海馬。兩匹互相騎到最後都暈船，決定改搭公車。'],
    ['烏賊的生理反應','烏賊最怕考試，因為一緊張就噴墨。老師說不能帶小抄，牠說：這不是小抄，是生理反應。'],
    ['龍蝦的健身願望','龍蝦最大的願望是不要進火鍋。牠每天健身，結果只是讓自己看起來更彈牙。'],
    ['河豚有態度地圓','河豚生氣跟平常有什麼差？差很多，平常只是圓，生氣是有態度地圓。'],
    ['鯊魚的素食晚餐','鯊魚最討厭素食餐廳。牠看完菜單後沉默很久，最後點了一份海帶，吃得像在反省人生。'],
    ['海豹的蓋章工作','海豹為什麼叫海豹？因為牠每天都在蓋章。牠蓋到最後發現，原來自己才是那顆印章。'],
    ['海星的四星評論','海星最怕被評成四星。牠說少一顆不是扣分，是失去身體的一部分，請尊重評論對象。']
  ];

  function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
  function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
  function bag() { return read('coffeeShipFishBag', []); }
  function setBag(items) { save('coffeeShipFishBag', items.slice(-180)); }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function formatText(value) { return escapeHtml(value).replace(/\n/g, '<br>'); }

  function isCurrency(item) { return item && item.kind === 'currency'; }
  function isFish(item) { return item && !isCurrency(item) && (item.kind === 'fish' || item.kind === 'mutant' || (!item.kind && item.weight && !/瓶|信|圖|殘頁|面具|帽|鞋|杯|戒|鏡|玩具|布偶|手套|緞帶/.test(item.name || ''))); }
  function isLetter(item) { return item && (item.kind === 'letter' || /瓶|信|藏寶圖|殘頁|漂流瓶/.test(item.name || item.title || '')); }
  function isItem(item) { return item && !isFish(item) && !isLetter(item); }

  function letterNumber(entry, fallback, count) {
    const direct = entry?.jokeIndex ?? entry?.lanarIndex ?? entry?.arielIndex ?? entry?.cocoIndex ?? entry?.blackbeardIndex ?? entry?.priestIndex ?? entry?.carnivalIndex ?? entry?.turtleSoupIndex ?? entry?.number;
    const parsedDirect = Number(direct);
    if (Number.isFinite(parsedDirect) && parsedDirect >= 1) return ((Math.floor(parsedDirect) - 1) % count) + 1;
    const match = String(entry?.title || '').match(/(?:Day\s*|漂流瓶\s*|海龜湯\s*|殘頁\s*)?(\d{1,3})/i);
    if (match) return ((Number(match[1]) - 1) % count) + 1;
    return ((fallback - 1) % count) + 1;
  }

  function jokeNumber(entry, fallback) {
    const byText = JOKES.findIndex(([, text]) => String(entry?.text || '').includes(text.slice(0, 12)));
    if (byText >= 0) return byText + 1;
    return ((letterNumber(entry, fallback, 50) - 1) % JOKES.length) + 1;
  }

  function providerEntry(type, number) {
    const provider = window.COFFEE_SHIP_BOTTLE_PROVIDERS?.[type];
    if (provider?.getEntry) return provider.getEntry(number);
    const direct = {
      lanar:window.COFFEE_SHIP_LANAR_SERIES,
      ariel:window.COFFEE_SHIP_ARIEL_SERIES,
      island:window.COFFEE_SHIP_COCO_SERIES,
      blackbeard:window.COFFEE_SHIP_BLACKBEARD_SERIES,
      priest:window.COFFEE_SHIP_MAD_PRIEST_SERIES,
      carnival:window.COFFEE_SHIP_CARNIVAL_ISLAND_SERIES,
      turtle:window.COFFEE_SHIP_TURTLE_SOUP_SERIES
    }[type];
    return direct?.getEntry?.(number) || null;
  }

  function canonicalLetter(key, entry, index) {
    const meta = LETTER_META[key];
    if (!meta) return { ...entry, key, index };
    const original = entry && typeof entry === 'object' ? entry : {};
    let number = letterNumber(original, index + 1, meta.count);
    let canonical = null;

    if (meta.type === 'joke') {
      number = jokeNumber(original, index + 1);
      const [name, text] = JOKES[number - 1];
      canonical = {
        title:`冷笑話漂流瓶 ${String(number).padStart(2, '0')}｜${name}`,
        text,
        jokeIndex:number
      };
    } else {
      canonical = providerEntry(meta.type, number);
    }

    return {
      ...original,
      ...(canonical || {}),
      key,
      index,
      icon:meta.icon,
      series:meta.series,
      rarity:meta.rarity,
      at:original.at || 0
    };
  }

  function repairLetterStores() {
    Object.entries(LETTER_META).forEach(([key]) => {
      const list = read(key, []);
      if (!Array.isArray(list)) return;
      const repaired = list.map((entry, index) => {
        const item = canonicalLetter(key, entry, index);
        const { key:ignoredKey, index:ignoredIndex, ...stored } = item;
        return stored;
      });
      if (JSON.stringify(list) !== JSON.stringify(repaired)) save(key, repaired.slice(-120));
    });
  }

  function letterSources() {
    repairLetterStores();
    const out = [];
    Object.keys(LETTER_META).forEach(key => {
      const list = read(key, []);
      if (!Array.isArray(list)) return;
      list.forEach((entry, index) => out.push(canonicalLetter(key, entry, index)));
    });
    return out.sort((a,b) => Number(b.at || 0) - Number(a.at || 0));
  }

  function addStyle() {
    if (document.getElementById('backpackManagerStyle')) return;
    const s = document.createElement('style');
    s.id = 'backpackManagerStyle';
    s.textContent = `
      #fishDexPanel.backpack-safe-panel{position:fixed!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:min(92vw,760px)!important;max-height:78dvh!important;overflow-y:auto!important;z-index:15500!important;background:rgba(21,16,32,.98)!important;border:3px solid #76536a!important;border-radius:22px!important;padding:16px!important;color:#fff4d8!important;box-shadow:0 18px 0 rgba(0,0,0,.32)!important;display:block!important;visibility:visible!important;pointer-events:auto!important}
      #backpackManagerRoot{display:block!important;visibility:visible!important;margin:0 0 18px;padding:12px;border:2px solid #76536a;border-radius:18px;background:rgba(16,10,22,.94);position:relative;z-index:3}
      #backpackSafeOpenBtn{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:16000;border:0;border-radius:18px;padding:12px 14px;background:#3a263f;color:#fff4d8;font-weight:1000;box-shadow:0 8px 0 rgba(0,0,0,.28);border:2px solid #76536a;cursor:pointer}
      .backpack-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}.backpack-close{border:0;border-radius:14px;padding:8px 12px;background:#3a263f;color:#fff4d8;font-weight:1000;cursor:pointer;box-shadow:0 5px 0 rgba(0,0,0,.25)}
      .backpack-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 12px}.backpack-tab{border:2px solid #76536a;background:#211728;color:#fff4d8;border-radius:999px;padding:7px 11px;font-weight:900;cursor:pointer}.backpack-tab.active{background:#ffe16b;color:#211728;border-color:#ffe16b}.backpack-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}.backpack-entry{border:2px solid #76536a;background:#171020;border-radius:14px;padding:10px;color:#fff4d8;font-weight:850;overflow-wrap:anywhere}.backpack-entry small{display:block;opacity:.9;line-height:1.5;margin-top:4px}.backpack-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.discard-btn,.sell-btn{border:0;border-radius:10px;padding:7px 10px;color:#fff4d8;font-weight:950;cursor:pointer}.discard-btn{background:#c96a4a}.sell-btn{background:#4f8f73}.discard-btn:hover,.sell-btn:hover,.backpack-close:hover{filter:brightness(1.12)}.backpack-empty{border:2px dashed #76536a;border-radius:14px;padding:14px;text-align:center;color:#d7bb79;font-weight:900}.backpack-tools{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}.backpack-tool{border:0;border-radius:12px;padding:7px 10px;background:#f2a957;color:#211728;font-weight:950;cursor:pointer}.price-line{color:#ffe16b;font-weight:1000}.letter-title{display:flex;align-items:flex-start;gap:8px}.letter-icon{flex:0 0 auto;font-size:24px;line-height:1.1}.letter-copy{white-space:normal}
      @media(max-width:900px){#backpackSafeOpenBtn{right:14px;bottom:calc(110px + env(safe-area-inset-bottom));font-size:18px;padding:13px 15px}#fishDexPanel.backpack-safe-panel{top:50%!important;width:92vw!important;max-height:78dvh!important;padding:14px!important}.backpack-list{grid-template-columns:1fr}.backpack-tab{font-size:13px;padding:6px 9px}.discard-btn,.sell-btn,.backpack-tool{width:100%}.backpack-actions{gap:6px}}
    `;
    document.head.appendChild(s);
  }

  function itemTitle(item) { const icon = item.icon || (item.kind === 'mutant' ? '🧬' : isCurrency(item) ? '🦪' : isItem(item) ? '📦' : '🐟'); return `${escapeHtml(icon)} ${item.quality && item.kind !== 'currency' ? escapeHtml(item.quality) + ' ' : ''}${escapeHtml(item.name || '未知物品')}`; }
  function priceOf(item) { if (!item) return 1; if (item.kind === 'currency') return Math.max(1, Number(item.amount || 1)); const rarity = { '普通': 4, '常見': 7, '稀有': 18, '史詩': 55, '傳說': 180, '神話': 520, '世界級': 3000 }[item.rarity] || 10; const quality = { '普通': 1, '優秀': 1.25, '完美': 1.7, '閃亮': 2.4, '神話': 4, '拾獲': 1.1, '遺失物': 1.4, '變異': 3 }[item.quality] || 1; const weight = Math.max(1, Number(item.weight || 1)); const kindBoost = item.kind === 'mutant' ? 4 : item.kind === 'treasure' ? 1.8 : isFish(item) ? 1 : 1.2; return Math.max(1, Math.round(weight * rarity * quality * kindBoost)); }
  function letterPrice(letter) { const t = `${letter.series || ''} ${letter.title || ''}`; if (/黑鬍子|藏寶圖/.test(t)) return 120; if (/拉納爾|愛麗兒/.test(t)) return 95; if (/瘋狂神父|狂歡島/.test(t)) return 80; if (/哈斯|可可|莫納|孤島/.test(t)) return 70; if (/海龜湯/.test(t)) return 160; return 45; }
  function itemDetail(item) { const parts = []; if (item.zone) parts.push(`來源：${escapeHtml(item.zone)}`); if (item.rarity) parts.push(`稀有度：${escapeHtml(item.rarity)}`); if (item.weight) parts.push(`重量：${Number(item.weight).toFixed(2)} kg`); if (item.amount) parts.push(`數量：${Number(item.amount)} 珍珠`); if (item.trait) parts.push(`特性：${escapeHtml(item.trait)}`); if (item.note) parts.push(`描述：${formatText(item.note)}`); if (item.series) parts.push(`系列：${escapeHtml(item.series)}`); parts.push(`<span class="price-line">售價：${priceOf(item)} 珍珠</span>`); return parts.join('<br>'); }

  function addPearls(amount, source) { const items = bag(); items.push({ name: `${amount} 珍珠`, kind: 'currency', icon: '🦪', amount, zone: source || '販售所得', rarity: '常見', quality: '貨幣', at: Date.now() }); setBag(items); }
  function organizePearls() { const items = bag(); const total = items.filter(isCurrency).reduce((sum, item) => sum + Number(item.amount || 0), 0); const others = items.filter(item => !isCurrency(item)); if (total > 0) others.push({ name: `${total} 珍珠`, kind: 'currency', icon: '🦪', amount: total, zone: '整理珍珠', rarity: '常見', quality: '貨幣', at: Date.now() }); setBag(others); activeTab = 'item'; forceBuild(); }
  function discardBagIndex(index) { const items = bag(); items.splice(index, 1); setBag(items); forceBuild(); }
  function sellBagIndex(index) { const items = bag(); const item = items[index]; const price = priceOf(item); items.splice(index, 1); setBag(items); addPearls(price, `販售：${item?.name || '物品'}`); activeTab = 'item'; forceBuild(); }
  function discardLetter(key, index) { const list = read(key, []); list.splice(index, 1); save(key, list); forceBuild(); }
  function sellLetter(key, index) { const list = read(key, []); const canonical = canonicalLetter(key, list[index] || {}, index); const price = letterPrice(canonical); list.splice(index, 1); save(key, list); addPearls(price, `販售：${canonical.title || '信件'}`); activeTab = 'item'; forceBuild(); }
  function discardCurrentItems() { const items = bag(); const next = activeTab === 'fish' ? items.filter(item => !isFish(item)) : activeTab === 'item' ? items.filter(item => !isItem(item)) : items; if (activeTab === 'letter') Object.keys(LETTER_META).forEach(key => save(key, [])); else setBag(next); forceBuild(); }

  function renderFish(items) { const arr = items.map((item, index) => ({ item, index })).filter(row => isFish(row.item)); if (!arr.length) return '<div class="backpack-empty">目前沒有魚類。</div>'; return `<div class="backpack-list">${arr.map(({item,index}) => `<div class="backpack-entry"><strong>${itemTitle(item)}</strong><small>${itemDetail(item)}</small><div class="backpack-actions"><button class="sell-btn" data-sell-bag="${index}">販售</button><button class="discard-btn" data-discard-bag="${index}">丟棄</button></div></div>`).join('')}</div>`; }
  function renderItems(items) { const arr = items.map((item, index) => ({ item, index })).filter(row => isItem(row.item)); if (!arr.length) return '<div class="backpack-empty">目前沒有物品。</div>'; return `<div class="backpack-list">${arr.map(({item,index}) => `<div class="backpack-entry"><strong>${itemTitle(item)}</strong><small>${itemDetail(item) || '特殊物品'}</small><div class="backpack-actions"><button class="sell-btn" data-sell-bag="${index}">販售</button><button class="discard-btn" data-discard-bag="${index}">丟棄</button></div></div>`).join('')}</div>`; }
  function renderLetters() { const arr = letterSources(); if (!arr.length) return '<div class="backpack-empty">目前沒有信件。</div>'; return `<div class="backpack-list">${arr.map(letter => `<div class="backpack-entry"><strong class="letter-title"><span class="letter-icon">${escapeHtml(letter.icon)}</span><span>${escapeHtml(letter.title || letter.series)}</span></strong><small class="letter-copy">系列：${escapeHtml(letter.series)}<br>稀有度：${escapeHtml(letter.rarity)}<br>${formatText(letter.text || '')}<br><span class="price-line">售價：${letterPrice(letter)} 珍珠</span></small><div class="backpack-actions"><button class="sell-btn" data-sell-letter-key="${escapeHtml(letter.key)}" data-sell-letter-index="${letter.index}">販售</button><button class="discard-btn" data-discard-letter-key="${escapeHtml(letter.key)}" data-discard-letter-index="${letter.index}">丟棄</button></div></div>`).join('')}</div>`; }

  function panel() { return document.getElementById('fishDexPanel'); }
  function ensurePanel() { let current = panel(); if (current) return current; const host = document.getElementById('gamePanel') || document.querySelector('.shell') || document.body; current = document.createElement('aside'); current.id = 'fishDexPanel'; current.className = 'hidden'; current.setAttribute('aria-live', 'polite'); host.appendChild(current); return current; }
  function cleanupLegacyButtons(current) { Array.from(current.querySelectorAll('button')).forEach(button => { const text = (button.textContent || '').trim(); if (text === '只關閉' || text.includes('賣出背包可販售漁獲')) button.remove(); }); }
  function stripOldSections(current) { current.querySelectorAll('#backpackManagerRoot').forEach(node => node.remove()); }
  function closeBackpack() { const current = panel(); if (!current) return; current.classList.add('hidden'); current.classList.remove('backpack-safe-panel'); current.style.display = 'none'; lastVisible = false; }

  function forceBuild() {
    const current = ensurePanel();
    if (!current || current.classList.contains('hidden')) return;
    stripOldSections(current);
    cleanupLegacyButtons(current);
    current.classList.add('backpack-safe-panel');
    const root = document.createElement('section');
    root.id = 'backpackManagerRoot';
    const items = bag();
    const letters = letterSources();
    const counts = { fish:items.filter(isFish).length, item:items.filter(isItem).length, letter:letters.length };
    const pearlTotal = items.filter(isCurrency).reduce((sum,item) => sum + Number(item.amount || 0), 0);
    root.innerHTML = `<div class="backpack-head"><h3>🎒 背包管理</h3><button class="backpack-close" data-close-backpack="1">關閉</button></div><div class="backpack-tools"><button class="backpack-tool" data-organize-pearls="1">整理珍珠：${pearlTotal}</button><button class="backpack-tool" data-clear-current="1">清空目前分類</button></div><div class="backpack-tabs"><button class="backpack-tab ${activeTab==='fish'?'active':''}" data-tab="fish">魚類 ${counts.fish}</button><button class="backpack-tab ${activeTab==='item'?'active':''}" data-tab="item">物品 ${counts.item}</button><button class="backpack-tab ${activeTab==='letter'?'active':''}" data-tab="letter">信件 ${counts.letter}</button></div><div class="backpack-content">${activeTab === 'fish' ? renderFish(items) : activeTab === 'item' ? renderItems(items) : renderLetters()}</div>`;
    current.insertBefore(root, current.firstChild);
  }

  function isGameActive() { const creator = document.getElementById('creator'); const game = document.getElementById('gamePanel'); return !!game && !game.classList.contains('hidden') && (!creator || creator.classList.contains('hidden')); }
  function openBackpack() { if (!isGameActive()) return; repairLetterStores(); const current = ensurePanel(); current.classList.remove('hidden'); current.classList.add('backpack-safe-panel'); current.style.display = 'block'; current.style.visibility = 'visible'; current.style.pointerEvents = 'auto'; setTimeout(forceBuild, 30); }
  function ensureOpenButton() { if (document.getElementById('backpackSafeOpenBtn')) return; const button = document.createElement('button'); button.id = 'backpackSafeOpenBtn'; button.type = 'button'; button.textContent = '📖 背包'; button.style.display = 'none'; button.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); openBackpack(); }, true); document.body.appendChild(button); }
  function sync() { ensureOpenButton(); const button = document.getElementById('backpackSafeOpenBtn'); const active = isGameActive(); if (button) button.style.display = active ? 'block' : 'none'; if (!active) { closeBackpack(); return; } const current = panel(); const visible = !!current && !current.classList.contains('hidden'); if (visible && !lastVisible) setTimeout(forceBuild, 60); if (visible && !current.querySelector('#backpackManagerRoot')) forceBuild(); if (visible) cleanupLegacyButtons(current); lastVisible = visible; }

  function bind() {
    document.addEventListener('click', event => {
      const closeButton = event.target.closest?.('[data-close-backpack]'); if (closeButton) { closeBackpack(); event.preventDefault(); return; }
      const tab = event.target.closest?.('.backpack-tab'); if (tab) { activeTab = tab.dataset.tab; forceBuild(); event.preventDefault(); return; }
      const organize = event.target.closest?.('[data-organize-pearls]'); if (organize) { organizePearls(); event.preventDefault(); return; }
      const clearButton = event.target.closest?.('[data-clear-current]'); if (clearButton) { if (confirm('確定要清空目前分類嗎？')) discardCurrentItems(); event.preventDefault(); return; }
      const sellBagButton = event.target.closest?.('[data-sell-bag]'); if (sellBagButton) { sellBagIndex(Number(sellBagButton.dataset.sellBag)); event.preventDefault(); return; }
      const discardBagButton = event.target.closest?.('[data-discard-bag]'); if (discardBagButton) { discardBagIndex(Number(discardBagButton.dataset.discardBag)); event.preventDefault(); return; }
      const sellLetterButton = event.target.closest?.('[data-sell-letter-key]'); if (sellLetterButton) { sellLetter(sellLetterButton.dataset.sellLetterKey, Number(sellLetterButton.dataset.sellLetterIndex)); event.preventDefault(); return; }
      const discardLetterButton = event.target.closest?.('[data-discard-letter-key]'); if (discardLetterButton) { discardLetter(discardLetterButton.dataset.discardLetterKey, Number(discardLetterButton.dataset.discardLetterIndex)); event.preventDefault(); }
    }, true);
  }

  function init() {
    addStyle();
    repairLetterStores();
    ensureOpenButton();
    bind();
    sync();
    const observer = new MutationObserver(sync);
    const creator = document.getElementById('creator');
    const game = document.getElementById('gamePanel');
    if (creator) observer.observe(creator, { attributes:true, attributeFilter:['class'] });
    if (game) observer.observe(game, { attributes:true, attributeFilter:['class'] });
    window.addEventListener('coffee-ship:entered', sync);
    window.addEventListener('coffee-ship:scene', sync);
    window.addEventListener('coffee-ship:story-ready', () => { repairLetterStores(); forceBuild(); });
    window.addEventListener('storage', event => { if (LETTER_META[event.key]) { repairLetterStores(); forceBuild(); } });
    setInterval(sync, 1200);
    window.COFFEE_SHIP_BACKPACK_MANAGER = { open:openBackpack, close:closeBackpack, rebuild:forceBuild, repairLetters:repairLetterStores };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();