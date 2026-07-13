(() => {
  'use strict';
  if (window.__COFFEE_SHIP_BACKPACK_STORY_SERIES_V1__) return;
  window.__COFFEE_SHIP_BACKPACK_STORY_SERIES_V1__ = true;

  const PANEL_ID = 'backpackPanel';
  const BAG_KEY = 'coffeeShipFishBag';
  const MAX_BAG = 240;
  const STORES = {
    coffeeShipMermaidLyrics:{icon:'🎼',series:'美人魚歌詞漂流瓶',rarity:'史詩',total:11,color:'#9ce8f0'},
    coffeeShipSailorLogLetters:{icon:'📓',series:'晨星號水手航海日誌',rarity:'普通',total:30,color:'#d7bb79'},
    coffeeShipBottleLetters:{icon:'😂',series:'冷笑話漂流瓶',rarity:'普通',color:'#d7bb79'},
    coffeeShipLanarLetters:{icon:'🌊',series:'拉納爾漂流瓶',rarity:'史詩',color:'#79d0b1'},
    coffeeShipArielLetters:{icon:'🧜‍♀️',series:'愛麗兒漂流瓶',rarity:'史詩',color:'#9ce8f0'},
    coffeeShipIslandLetters:{icon:'🏝️',series:'可可漂流瓶',rarity:'稀有',color:'#f2a957'},
    coffeeShipBlackbeardLetters:{icon:'🏴‍☠️',series:'黑鬍子藏寶圖',rarity:'傳說',color:'#ffe16b'},
    coffeeShipMadPriestLetters:{icon:'📜',series:'瘋狂神父殘頁',rarity:'傳說',color:'#e9a6b0'},
    coffeeShipCarnivalLetters:{icon:'🎭',series:'狂歡島漂流瓶',rarity:'史詩',color:'#b9a4e6'},
    coffeeShipTurtleSoupLetters:{icon:'🍲',series:'海龜湯神秘故事',rarity:'神話',color:'#ffffff'}
  };

  const COLORS = {普通:'#d7bb79',常見:'#d7bb79',稀有:'#79d0b1',史詩:'#e9a6b0',傳說:'#ffe16b',神話:'#ffffff',世界級:'#ff72bc'};
  const expanded = new Set();
  let queued = false;
  let enhancing = false;
  let observer = null;

  function read(key,fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function save(key,value) {
    try { localStorage.setItem(key,JSON.stringify(value)); }
    catch {}
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt',"'":'&#39;','"':'&quot;'}[char]));
  }

  function storyIcon(item, className = '') {
    const html = window.COFFEE_SHIP_ITEM_PIXEL_ICONS?.iconHtml?.({...item,kind:'letter'},className);
    return html || `<span aria-hidden="true">${escapeHtml(item.icon || '✉️')}</span>`;
  }

  function formatText(value) {
    return escapeHtml(value).replace(/\n/g,'<br>');
  }

  function formatPearls(value) {
    return Math.max(0,Math.floor(Number(value) || 0)).toLocaleString('zh-TW');
  }

  function bag() {
    const value = read(BAG_KEY,[]);
    return Array.isArray(value) ? value : [];
  }

  function isLetterItem(item) {
    const kind = String(item?.kind || '').trim().toLowerCase();
    const group = String(item?.group || '').trim().toLowerCase();
    return kind === 'letter' || group === 'letter' || group === 'bottle-letter' || group === 'story-letter';
  }

  function itemPrice(item) {
    const explicit = Number(item?.sellPrice);
    if (Number.isFinite(explicit) && explicit >= 0) return Math.floor(explicit);
    return Math.max(0,Number(window.COFFEE_SHIP_ECONOMY?.sellPrice?.(item) || 45));
  }

  function letterPrice(letter) {
    const explicit = Number(letter?.sellPrice);
    if (Number.isFinite(explicit) && explicit >= 0) return Math.floor(explicit);
    const text = `${letter?.series || ''} ${letter?.title || ''}`;
    if (/海龜湯/.test(text)) return 160;
    if (/黑鬍子|藏寶圖/.test(text)) return 120;
    if (/美人魚歌詞/.test(text)) return 110;
    if (/拉納爾|愛麗兒/.test(text)) return 95;
    if (/瘋狂神父|狂歡島/.test(text)) return 80;
    if (/可可|哈斯|莫納|孤島/.test(text)) return 70;
    if (/航海日誌/.test(text)) return 55;
    return 45;
  }

  function addRow(map,series,meta,row) {
    if (!map.has(series)) map.set(series,{series,meta:{...meta,series},rows:[]});
    map.get(series).rows.push(row);
  }

  function groups() {
    const map = new Map();
    Object.entries(STORES).forEach(([key,meta]) => {
      const list = read(key,[]);
      if (!Array.isArray(list)) return;
      list.forEach((entry,index) => {
        if (!entry || typeof entry !== 'object') return;
        const series = String(entry.series || meta.series);
        const number = Number(entry.number || entry.chapter || entry.part || 0);
        addRow(map,series,{...meta,key},{
          storage:'store',key,index,id:entry.id || '',number,
          icon:entry.icon || meta.icon,title:entry.title || (number ? `${series} ${String(number).padStart(2,'0')}` : series),
          series,rarity:entry.rarity || meta.rarity,author:entry.author || '',
          text:entry.text || entry.content || entry.body || '',at:Number(entry.at || entry.createdAt || 0),
          price:letterPrice({...entry,series})
        });
      });
    });

    bag().forEach((entry,index) => {
      if (!isLetterItem(entry)) return;
      const series = String(entry.series || entry.collection || entry.storySeries || '其他漂流信件');
      const rarity = entry.rarity || '普通';
      const meta = {icon:entry.icon || '✉️',series,rarity,total:Number(entry.total || 0),color:COLORS[rarity] || '#d7bb79'};
      const number = Number(entry.number || entry.chapter || entry.part || 0);
      addRow(map,series,meta,{
        storage:'bag',index,id:entry.id || '',number,
        icon:entry.icon || meta.icon,title:entry.title || entry.name || (number ? `${series} ${String(number).padStart(2,'0')}` : series),
        series,rarity,author:entry.author || '',text:entry.text || entry.content || entry.body || entry.trait || '',
        at:Number(entry.at || 0),price:itemPrice(entry)
      });
    });

    return [...map.values()].map(group => {
      group.rows.sort((a,b) => a.number && b.number && a.number !== b.number ? a.number-b.number : b.at-a.at);
      group.collected = new Set(group.rows.map(row => row.id || (row.number ? `number:${row.number}` : `${row.title}|${row.text}`))).size;
      group.newest = Math.max(...group.rows.map(row => row.at),0);
      group.total = Number(group.meta.total || 0);
      return group;
    }).sort((a,b) => b.newest-a.newest || a.series.localeCompare(b.series,'zh-Hant'));
  }

  function signature(rows) {
    return rows.map(group => `${group.series}:${group.rows.map(row => `${row.storage}:${row.key || ''}:${row.index}:${row.id}:${row.at}:${row.price}`).join(',')}`).join('|');
  }

  function rowActions(row) {
    if (row.storage === 'bag') {
      return `<button class="bp-sell story-sell" data-bp-sell="${row.index}" ${row.price <= 0 ? 'disabled' : ''}>販售 +${formatPearls(row.price)} 珍珠</button><button class="bp-delete" data-bp-delete="${row.index}">丟棄</button>`;
    }
    return `<button class="bp-sell story-sell" data-letter-sell="${escapeHtml(row.key)}" data-letter-index="${row.index}">販售 +${formatPearls(row.price)} 珍珠</button><button class="bp-delete" data-letter-delete="${escapeHtml(row.key)}" data-letter-index="${row.index}">丟棄</button>`;
  }

  function renderCard(row,color) {
    const info = [];
    if (row.author) info.push(`作者：${escapeHtml(row.author)}`);
    if (row.number) info.push(`章節：${String(row.number).padStart(2,'0')}`);
    info.push(`系列：${escapeHtml(row.series)}`);
    return `<details class="story-letter" style="--story-color:${color}"><summary><span class="story-letter-icon">${storyIcon({...row,name:row.series,seriesKey:row.key},'story-letter-pixel-icon')}</span><span class="story-letter-title"><strong>${escapeHtml(row.title)}</strong><small>${escapeHtml([row.number ? `第 ${String(row.number).padStart(2,'0')} 篇` : '',row.author,row.rarity].filter(Boolean).join('・'))}</small></span><span class="story-letter-price">🦪 ${formatPearls(row.price)}</span></summary><div class="story-letter-body"><div class="story-letter-info">${info.join('<span>・</span>')}</div><div class="story-letter-text">${formatText(row.text || '這封信沒有留下可辨識的內容。')}</div><div class="story-letter-actions">${rowActions(row)}</div></div></details>`;
  }

  function renderUnified(rows) {
    if (!rows.length) return '<div class="bp-empty">目前沒有信件或故事收藏。</div>';
    return `<div class="story-series-list">${rows.map(group => {
      const open = expanded.has(group.series);
      const color = group.meta.color || COLORS[group.meta.rarity] || '#d7bb79';
      const progress = group.total > 0 ? `${group.collected}/${group.total} 已收集` : `${group.rows.length} 封收藏`;
      const copies = group.rows.length !== group.collected ? `・共 ${group.rows.length} 封` : '';
      return `<section class="story-series" style="--story-color:${color}" data-story-name="${escapeHtml(group.series)}"><button class="story-series-head" type="button" data-story-toggle="${escapeHtml(group.series)}" aria-expanded="${open}"><span class="story-series-main"><span class="story-series-icon">${storyIcon({name:group.series,series:group.series,seriesKey:group.meta.key,icon:group.meta.icon,rarity:group.meta.rarity},'story-series-pixel-icon')}</span><span><strong>${escapeHtml(group.series)}</strong><small>${progress}${copies}</small></span></span><span class="story-series-state">${open ? '收合' : '展開'} <b>⌄</b></span></button><div class="story-series-body" ${open ? '' : 'hidden'}><p>點擊信件標題閱讀全文；販售按鈕會清楚顯示本封售價。</p><div class="story-letter-list">${group.rows.map(row => renderCard(row,color)).join('')}</div></div></section>`;
    }).join('')}</div>`;
  }

  function updateCounts(panel,rows) {
    const items = bag();
    const letterCount = rows.reduce((sum,group) => sum+group.rows.length,0);
    const itemCount = items.filter(item => item && item.kind !== 'currency' && !isLetterItem(item) && !window.COFFEE_SHIP_BACKPACK_MANAGER?.isBiologicalCatch?.(item)).length;
    const letterTab = panel.querySelector('[data-bp-tab="letter"]');
    const itemTab = panel.querySelector('[data-bp-tab="item"]');
    const mermaidCount = rows.find(group => group.series === STORES.coffeeShipMermaidLyrics.series)?.rows.length || 0;
    if (letterTab) {
      letterTab.textContent = `信件 ${letterCount}`;
      letterTab.dataset.mermaidBaseCount = String(Math.max(0,letterCount-mermaidCount));
    }
    if (itemTab) itemTab.textContent = `物品 ${itemCount}`;
  }

  function pruneLetterItemsFromItemTab(panel) {
    const itemTab = panel.querySelector('[data-bp-tab="item"]');
    if (!itemTab?.classList.contains('active')) return;
    const items = bag();
    panel.querySelectorAll('.bp-content .bp-card').forEach(card => {
      const button = card.querySelector('[data-bp-sell],[data-bp-delete]');
      const index = Number(button?.dataset.bpSell ?? button?.dataset.bpDelete);
      if (Number.isInteger(index) && isLetterItem(items[index])) card.remove();
    });
    const list = panel.querySelector('.bp-content .bp-list');
    if (list && !list.children.length) list.outerHTML = '<div class="bp-empty">目前沒有物品。</div>';
  }

  function prepareBatchButtons(panel) {
    const letterActive = panel.querySelector('[data-bp-tab="letter"]')?.classList.contains('active');
    if (!letterActive) return;
    const sell = panel.querySelector('[data-bp-sell-all]');
    const clear = panel.querySelector('[data-bp-clear]');
    if (sell) {
      sell.removeAttribute('data-bp-sell-all');
      sell.dataset.storySellAll = '1';
      sell.textContent = '販售所有信件';
    }
    if (clear) {
      clear.removeAttribute('data-bp-clear');
      clear.dataset.storyClear = '1';
      clear.textContent = '清空所有信件';
    }
  }

  function enhance() {
    if (enhancing) return;
    const panel = document.getElementById(PANEL_ID);
    if (!panel || panel.classList.contains('hidden')) return;
    enhancing = true;
    try {
      const rows = groups();
      updateCounts(panel,rows);
      pruneLetterItemsFromItemTab(panel);
      const letterActive = panel.querySelector('[data-bp-tab="letter"]')?.classList.contains('active');
      if (!letterActive) return;
      prepareBatchButtons(panel);
      const content = panel.querySelector('.bp-content');
      if (!content) return;
      const sig = signature(rows);
      const existing = content.querySelector('.story-series-list');
      if (existing?.dataset.signature === sig) return;
      content.innerHTML = renderUnified(rows);
      const unified = content.querySelector('.story-series-list');
      if (unified) unified.dataset.signature = sig;
    } finally {
      enhancing = false;
    }
  }

  function queueEnhance() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      enhance();
    });
  }

  function addPearls(amount,reason) {
    const value = Math.max(0,Math.floor(Number(amount) || 0));
    if (!value) return;
    if (window.COFFEE_SHIP_ECONOMY?.earn) window.COFFEE_SHIP_ECONOMY.earn(value,reason,{source:'story-backpack'});
    else localStorage.setItem('coffeeShipPearls',String(Number(localStorage.getItem('coffeeShipPearls') || 0)+value));
  }

  function sellAll() {
    if (!confirm('確定要販售所有信件與故事收藏嗎？')) return;
    let total = 0;
    let count = 0;
    Object.entries(STORES).forEach(([key,meta]) => {
      const list = read(key,[]);
      if (!Array.isArray(list)) return;
      list.forEach(entry => { total += letterPrice({...entry,series:entry?.series || meta.series}); count += 1; });
      save(key,[]);
    });
    const remaining = [];
    bag().forEach(item => {
      if (isLetterItem(item) && itemPrice(item) > 0) { total += itemPrice(item); count += 1; }
      else remaining.push(item);
    });
    save(BAG_KEY,remaining.slice(-MAX_BAG));
    addPearls(total,`批次販售 ${count} 封信件`);
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'story-sell-all',count}}));
    window.COFFEE_SHIP_BACKPACK_MANAGER?.rebuild?.();
    queueEnhance();
  }

  function clearAll() {
    if (!confirm('確定要清空所有信件與故事收藏嗎？此操作不會增加珍珠。')) return;
    Object.keys(STORES).forEach(key => save(key,[]));
    save(BAG_KEY,bag().filter(item => !isLetterItem(item)).slice(-MAX_BAG));
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'story-clear'}}));
    window.COFFEE_SHIP_BACKPACK_MANAGER?.rebuild?.();
    queueEnhance();
  }

  function addStyle() {
    if (document.getElementById('backpackStorySeriesStyleV1')) return;
    const style = document.createElement('style');
    style.id = 'backpackStorySeriesStyleV1';
    style.textContent = `
      .sailor-log-section,.mermaid-lyrics-section{display:none!important}.story-series-list{display:flex;flex-direction:column;gap:10px}.story-series{border:2px solid var(--story-color,#76536a);border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(24,16,32,.97));overflow:hidden;box-shadow:0 6px 0 rgba(0,0,0,.23)}.story-series-head{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px;border:0;background:transparent;color:#fff4d8;text-align:left}.story-series-main{display:flex;align-items:center;gap:10px;min-width:0}.story-series-icon{font-size:27px}.story-series-main>span:last-child{min-width:0}.story-series-main strong{display:block;color:var(--story-color,#ffe16b);font-size:17px}.story-series-main small{display:block;margin-top:3px;color:#cabdca;font-size:11px}.story-series-state{display:flex;align-items:center;gap:6px;color:#ffe16b;font-size:12px;font-weight:1000;white-space:nowrap}.story-series-state b{font-size:16px;transition:transform .18s ease}.story-series-head[aria-expanded="true"] .story-series-state b{transform:rotate(180deg)}.story-series-body{padding:0 11px 12px}.story-series-body[hidden]{display:none!important}.story-series-body>p{margin:0 0 9px;padding:8px 10px;border-radius:10px;background:rgba(0,0,0,.18);color:#c8bac9;font-size:11px}.story-letter-list{display:flex;flex-direction:column;gap:8px}.story-letter{border:2px solid rgba(255,255,255,.1);border-radius:14px;background:#181020;overflow:hidden}.story-letter[open]{border-color:var(--story-color,#76536a)}.story-letter summary{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:9px;padding:11px;cursor:pointer;list-style:none}.story-letter summary::-webkit-details-marker{display:none}.story-letter-icon{font-size:23px}.story-letter-title{min-width:0}.story-letter-title strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.story-letter-title small{display:block;margin-top:3px;color:#b8abbc;font-size:10px}.story-letter-price{padding:4px 8px;border-radius:999px;background:#2a2130;color:#ffe16b;font-size:10px;font-weight:1000;white-space:nowrap}.story-letter-body{padding:0 11px 11px;border-top:1px solid rgba(255,255,255,.08)}.story-letter-info{margin:9px 0 7px;color:#b8abbc;font-size:11px}.story-letter-text{padding:10px;border-radius:11px;background:rgba(0,0,0,.2);color:#eee1d4;line-height:1.72;font-size:13px}.story-letter-actions{display:grid;grid-template-columns:1.35fr .65fr;gap:8px;margin-top:10px}.story-letter-actions button{min-height:44px}.story-sell{background:#4f8f73!important;color:#fff4d8!important}.story-letter-actions .bp-delete{background:#c96a4a!important;color:#fff4d8!important}@media(max-width:760px){.story-series-head{padding:11px 10px}.story-series-icon{font-size:24px}.story-series-main strong{font-size:15px}.story-letter summary{grid-template-columns:auto minmax(0,1fr);padding:10px}.story-letter-price{grid-column:2;justify-self:start}.story-letter-actions{grid-template-columns:1fr 1fr}}@media(prefers-reduced-motion:reduce){.story-series-state b{transition:none}}
    `;
    document.head.appendChild(style);
  }

  function bind() {
    document.addEventListener('click',event => {
      const toggle = event.target.closest?.('[data-story-toggle]');
      if (toggle) {
        event.preventDefault();
        const name = toggle.dataset.storyToggle;
        const open = !expanded.has(name);
        if (open) expanded.add(name); else expanded.delete(name);
        toggle.setAttribute('aria-expanded',String(open));
        const body = toggle.closest('.story-series')?.querySelector('.story-series-body');
        if (body) body.hidden = !open;
        const state = toggle.querySelector('.story-series-state');
        if (state) state.firstChild.textContent = open ? '收合 ' : '展開 ';
        return;
      }
      if (event.target.closest?.('[data-story-sell-all]')) { event.preventDefault(); sellAll(); return; }
      if (event.target.closest?.('[data-story-clear]')) { event.preventDefault(); clearAll(); }
    },true);
  }

  function attachObserver() {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return false;
    observer?.disconnect();
    observer = new MutationObserver(queueEnhance);
    observer.observe(panel,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    queueEnhance();
    return true;
  }

  function init() {
    addStyle();
    bind();
    if (!attachObserver()) {
      const root = new MutationObserver(() => {
        if (attachObserver()) root.disconnect();
      });
      root.observe(document.body,{childList:true,subtree:true});
    }
    window.addEventListener('coffee-ship:bag-changed',queueEnhance);
    window.addEventListener('coffee-ship:economy-changed',queueEnhance);
    window.addEventListener('coffee-ship:backpack-ready',queueEnhance);
    window.COFFEE_SHIP_BACKPACK_STORIES = {groups,refresh:queueEnhance,stores:STORES,version:1};
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
