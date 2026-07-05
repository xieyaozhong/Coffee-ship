(() => {
  'use strict';
  if (window.__COFFEE_SHIP_UNIFIED_FISHING_V3__) return;
  window.__COFFEE_SHIP_UNIFIED_FISHING_V3__ = true;

  const BAG_KEY = 'coffeeShipFishBag';
  const DEX_KEY = 'coffeeShipFishDex';
  const HISTORY_KEY = 'coffeeShipRecentCatches';
  const COUNT_KEY = 'coffeeShipCatchCount';
  const MAX_HISTORY = 30;

  const BASE_POOL = [
    ['小沙丁魚','近海','普通',0.03,0.18,'fish'],['銀鱗小魚','近海','普通',0.05,0.35,'fish'],['月光鯷魚','近海','普通',0.04,0.42,'fish'],['咖啡豆魚','近海','普通',0.08,0.55,'fish'],['奶泡魚','近海','普通',0.12,0.8,'fish'],['海風小鯛','近海','普通',0.2,0.9,'fish'],['泡泡魚','近海','普通',0.06,0.4,'fish'],['迷你飛魚','近海','普通',0.15,0.75,'fish'],['橘尾雀鯛','近海','普通',0.08,0.35,'fish'],['玻璃小魚','近海','普通',0.02,0.2,'fish'],
    ['白玉小蝦','近海','普通',0.02,0.12,'shrimp'],['海草蝦','近海','普通',0.03,0.16,'shrimp'],['晨光小蝦','近海','普通',0.02,0.14,'shrimp'],['小寄居蟹','近海','普通',0.05,0.3,'crab'],['迷你沙蟹','近海','普通',0.04,0.22,'crab'],
    ['漂流塑膠袋','海底垃圾','普通',0.01,0.06,'trash'],['生鏽瓶蓋','海底垃圾','普通',0.01,0.03,'trash'],['破吸管','海底垃圾','普通',0.01,0.04,'trash'],['皺掉的杯套','海底垃圾','普通',0.01,0.05,'trash'],
    ['港口竹筴魚','港口','常見',0.3,1.2,'fish'],['星斑鯖魚','港口','常見',0.45,1.8,'fish'],['藍線魚','港口','常見',0.25,1.1,'fish'],['焦糖鯛','港口','常見',0.6,2.3,'fish'],['木棧道石斑','港口','常見',0.8,3.6,'fish'],['船影鱸魚','港口','常見',0.9,4.2,'fish'],['碼頭烏魚','港口','常見',0.7,3.2,'fish'],['白浪比目魚','港口','常見',0.5,2.8,'fish'],['船燈秋刀魚','港口','常見',0.2,0.9,'fish'],['銅鰭魚','港口','常見',0.35,1.7,'fish'],
    ['夜光魷魚','夜海','稀有',0.5,2.8,'squid'],['珍珠河豚','夜海','稀有',0.7,3.1,'fish'],['藍寶石鮪幼魚','夜海','稀有',2.2,8.5,'fish'],['星空鰻','夜海','稀有',1.1,5.6,'fish'],['玫瑰金鯉','夜海','稀有',0.9,4.8,'fish'],['月牙水母','夜海','稀有',0.3,1.5,'jelly'],['銀河小卷','夜海','稀有',0.4,2.2,'squid'],['幽光燈籠魚','夜海','稀有',0.6,3.4,'angler'],['紫星魟幼魚','夜海','稀有',1.5,6.2,'fish'],['夜霧鯰魚','夜海','稀有',1.2,7.5,'fish'],
    ['深海拿鐵鯊','深海','史詩',12,48,'fish'],['銀河旗魚','深海','史詩',18,72,'fish'],['古代鸚鵡螺','深海','史詩',5,25,'shell'],['月影魟魚','深海','史詩',9,38,'fish'],['黑潮大鮪魚','深海','史詩',26,120,'fish'],['冰藍皇帶魚','深海','史詩',8,35,'fish'],['紅寶石石斑','深海','史詩',10,45,'fish'],['風暴鬼頭刀','深海','史詩',6,28,'fish'],['深淵大章魚','深海','史詩',30,160,'octopus'],['星塵龍蝦','深海','史詩',2,16,'shrimp'],
    ['傳說咖啡鯨','傳說','傳說',300,1200,'whale'],['星海龍魚','傳說','傳說',45,180,'fish'],['黃金船錨魚','傳說','傳說',20,90,'fish'],['宇宙翻車魚','傳說','傳說',150,800,'fish'],['黎明海神魚','傳說','傳說',80,360,'fish'],['黑洞巨魷','傳說','傳說',200,1500,'squid'],['彩虹王鮪','傳說','傳說',60,260,'fish'],['永夜鯨鯊','傳說','傳說',500,2200,'whale']
  ];

  const RARITY_WEIGHT = {普通:49,常見:31,稀有:14,史詩:5,傳說:1};
  const QUALITY = [['普通',55,1],['優秀',25,1.15],['完美',13,1.3],['閃亮',5,1.55],['神話',2,1.9]];
  const ICONS = {fish:'🐟',shrimp:'🦐',crab:'🦀',angler:'🐡',trash:'🗑️',letter:'🍾',squid:'🦑',jelly:'🪼',shell:'🐚',octopus:'🐙',whale:'🐋',treasure:'📦',mutant:'🧬'};
  const COLORS = {普通:'#fff4d8',常見:'#9ce8f0',稀有:'#79d0b1',史詩:'#e9a6b0',傳說:'#ffe16b',神話:'#ffffff',世界級:'#ff5f9e'};

  const registeredPools = new Map([['base', BASE_POOL]]);
  let activeTab = 'recent';
  let cooldownUntil = 0;

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

  function isDeckOpen() {
    return !!window.COFFEE_SHIP_DECK?.isDeckOpen?.();
  }

  function nearFishingSpot() {
    return !!window.COFFEE_SHIP_DECK?.nearFishingSpot?.();
  }

  function coffeeEffect() {
    const effect = window.COFFEE_SHIP_COFFEE_EFFECT;
    return effect && effect.expiresAt > Date.now() ? effect : null;
  }

  function bonus(name, fallback = 1) {
    const value = coffeeEffect()?.bonuses?.[name];
    return Number.isFinite(Number(value)) ? Number(value) : fallback;
  }

  function chooseWeighted(map) {
    const total = Object.values(map).reduce((sum, value) => sum + value, 0);
    let roll = Math.random() * total;
    for (const [key, weight] of Object.entries(map)) {
      roll -= weight;
      if (roll <= 0) return key;
    }
    return Object.keys(map)[0];
  }

  function chooseRarity() {
    const luck = Math.max(1, bonus('fishingLuck', 1));
    const weights = {...RARITY_WEIGHT};
    if (luck > 1) {
      weights.普通 /= luck;
      weights.常見 /= Math.sqrt(luck);
      weights.稀有 *= luck;
      weights.史詩 *= luck * 1.12;
      weights.傳說 *= luck * 1.28;
    }
    return chooseWeighted(weights);
  }

  function chooseQuality() {
    const total = QUALITY.reduce((sum, row) => sum + row[1], 0);
    let roll = Math.random() * total;
    for (const row of QUALITY) {
      roll -= row[1];
      if (roll <= 0) return row;
    }
    return QUALITY[0];
  }

  function allPoolRows() {
    return [...registeredPools.values()].flat();
  }

  function pickRow() {
    const rarity = chooseRarity();
    const pool = allPoolRows().filter(row => row[2] === rarity);
    const source = pool.length ? pool : allPoolRows();
    return source[Math.floor(Math.random() * source.length)];
  }

  function descriptor(item) {
    return window.COFFEE_SHIP_ICON?.iconDescriptor?.(item) || {base:item.icon || ICONS[item.kind] || '🐟'};
  }

  function priceOf(item) {
    const rarity = {普通:2,常見:4,稀有:10,史詩:28,傳說:120,神話:500,世界級:5000}[item.rarity] || 2;
    const quality = {普通:1,優秀:1.4,完美:2,閃亮:3.5,神話:6,變異:3,祝福:2}[item.quality] || 1;
    return Math.max(1, Math.round(Math.max(.1, Number(item.weight || 1)) * rarity * quality * Math.max(1, Number(item.coffeePearlBonus || 1))));
  }

  function history() {
    const value = read(HISTORY_KEY, []);
    return Array.isArray(value) ? value : [];
  }

  function pushHistory(entry) {
    const items = history();
    items.unshift({...entry,at:entry.at || Date.now()});
    save(HISTORY_KEY, items.slice(0, MAX_HISTORY));
  }

  function addToBag(item) {
    const bag = read(BAG_KEY, []);
    bag.push(item);
    save(BAG_KEY, bag.slice(-240));
  }

  function updateDex(item) {
    if (!item.name || item.kind === 'trash' || item.kind === 'letter') return;
    const dex = read(DEX_KEY, {});
    dex[item.name] = Math.max(Number(dex[item.name] || 0), Number(item.weight || 0));
    save(DEX_KEY, dex);
  }

  function addStyle() {
    if (document.getElementById('unifiedFishingStyle')) return;
    const style = document.createElement('style');
    style.id = 'unifiedFishingStyle';
    style.textContent = `
      #fishingHub{position:fixed;right:14px;top:calc(72px + env(safe-area-inset-top));bottom:calc(14px + env(safe-area-inset-bottom));z-index:22000;width:min(430px,calc(100vw - 28px));display:flex;flex-direction:column;overflow:hidden;padding:11px;border:3px solid #79d0b1;border-radius:22px;background:rgba(13,9,23,.98);color:#fff4d8;box-sizing:border-box;box-shadow:0 16px 45px rgba(0,0,0,.48)}
      #fishingHub.hidden{display:none!important}.fh-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}.fh-head h3{margin:0;font-size:20px}.fh-close{border:0;border-radius:12px;padding:9px 13px;background:#493249;color:#fff4d8;font-weight:1000}.fh-tabs{display:flex;gap:8px;margin-bottom:8px}.fh-tab{flex:1;border:2px solid #76536a;border-radius:999px;padding:8px;background:#211728;color:#fff4d8;font-weight:1000}.fh-tab.active{background:#79d0b1;color:#151020;border-color:#79d0b1}.fh-content{min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}.fh-list{display:flex;flex-direction:column;gap:9px}.fh-card{border:2px solid var(--accent,#79d0b1);border-radius:15px;padding:11px;background:#181020;box-shadow:0 5px 0 rgba(0,0,0,.24)}.fh-card-head{display:flex;align-items:flex-start;gap:9px;font-size:17px}.fh-icon{font-size:27px;line-height:1}.fh-card small{display:block;margin-top:6px;line-height:1.5;opacity:.92}.fh-time{display:block;margin-top:6px;font-size:12px;opacity:.62}.fh-empty{padding:18px;border:2px dashed #76536a;border-radius:15px;text-align:center;color:#d7bb79;font-weight:1000}.fh-event{white-space:normal;line-height:1.55}.fh-dex-row{display:grid;grid-template-columns:1fr auto;gap:10px;border-bottom:1px solid rgba(255,255,255,.1);padding:10px 4px}.fh-dex-row:last-child{border-bottom:0}#fishDexBtn{border:0;border-radius:14px;padding:10px 12px;background:#5d3f72;color:#fff4d8;font-weight:1000;box-shadow:0 6px 0 rgba(0,0,0,.27)}
      body.fishing-hub-open{overflow:hidden!important}body.fishing-hub-open #backpackSafeOpenBtn{visibility:hidden!important;pointer-events:none!important}
      @media(max-width:760px){#fishingHub{left:8px;right:8px;top:calc(8px + env(safe-area-inset-top));bottom:calc(8px + env(safe-area-inset-bottom));width:auto}.fh-card{padding:10px}body.fishing-hub-open .mobile-controls{visibility:hidden!important;pointer-events:none!important}}
    `;
    document.head.appendChild(style);
  }

  function ensureHub() {
    let hub = document.getElementById('fishingHub');
    if (hub) return hub;
    hub = document.createElement('aside');
    hub.id = 'fishingHub';
    hub.className = 'hidden';
    hub.setAttribute('aria-live', 'polite');
    document.body.appendChild(hub);
    return hub;
  }

  function ensureDexButton() {
    if (document.getElementById('fishDexBtn')) return;
    const controls = document.querySelector('.mobile-controls');
    if (!controls) return;
    const button = document.createElement('button');
    button.id = 'fishDexBtn';
    button.type = 'button';
    button.textContent = '漁獲';
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openHub('recent');
    }, true);
    controls.appendChild(button);
  }

  function timeLabel(timestamp) {
    try { return new Date(timestamp).toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'}); }
    catch { return ''; }
  }

  function renderRecent() {
    const rows = history().sort((a,b) => Number(b.at || 0) - Number(a.at || 0));
    if (!rows.length) return '<div class="fh-empty">到右側釣魚區釣魚後，最新漁獲會顯示在這裡。</div>';
    return `<div class="fh-list">${rows.map(row => {
      if (row.type === 'event') {
        return `<article class="fh-card" style="--accent:${escapeHtml(row.accent || '#8460c8')}"><div class="fh-card-head"><span class="fh-icon">${escapeHtml(row.icon || '🌟')}</span><strong>${escapeHtml(row.title || '特殊事件')}</strong></div><small class="fh-event">${row.html || escapeHtml(row.text || '')}</small><span class="fh-time">${timeLabel(row.at)}</span></article>`;
      }
      const item = row.item || row;
      const icon = descriptor(item).base;
      const value = item.kind === 'trash' ? '不可販售' : `${priceOf(item)} 珍珠`;
      return `<article class="fh-card" style="--accent:${COLORS[item.rarity] || '#79d0b1'}"><div class="fh-card-head"><span class="fh-icon">${escapeHtml(icon)}</span><strong>${escapeHtml(`${item.quality || ''} ${item.name || '未知漁獲'}`.trim())}</strong></div><small>海域：${escapeHtml(item.zone || '未知')}<br>稀有度：${escapeHtml(item.rarity || '普通')}<br>重量：${Number(item.weight || 0).toFixed(2)} kg<br>價值：${value}${item.coffeeEffectName ? `<br>咖啡加成：${escapeHtml(item.coffeeEffectName)}` : ''}</small><span class="fh-time">${timeLabel(row.at || item.at)}</span></article>`;
    }).join('')}</div>`;
  }

  function renderDex() {
    const dex = read(DEX_KEY, {});
    const rows = Object.entries(dex).sort((a,b) => Number(b[1]) - Number(a[1]));
    if (!rows.length) return '<div class="fh-empty">尚未收集任何魚種。</div>';
    return `<div>${rows.map(([name,weight]) => `<div class="fh-dex-row"><strong>${escapeHtml(name)}</strong><span>${Number(weight).toFixed(2)} kg</span></div>`).join('')}</div>`;
  }

  function renderHub() {
    const hub = ensureHub();
    hub.innerHTML = `<div class="fh-head"><h3>🎣 釣魚紀錄</h3><button class="fh-close" type="button">關閉</button></div><div class="fh-tabs"><button class="fh-tab ${activeTab==='recent'?'active':''}" data-fh-tab="recent">最新漁獲</button><button class="fh-tab ${activeTab==='dex'?'active':''}" data-fh-tab="dex">圖鑑</button></div><div class="fh-content">${activeTab === 'recent' ? renderRecent() : renderDex()}</div>`;
  }

  function openHub(tab = 'recent') {
    activeTab = tab;
    renderHub();
    ensureHub().classList.remove('hidden');
    document.body.classList.add('fishing-hub-open');
  }

  function closeHub() {
    ensureHub().classList.add('hidden');
    document.body.classList.remove('fishing-hub-open');
  }

  function pushEvent(options = {}) {
    pushHistory({
      type:'event',
      title:options.title || '特殊事件',
      text:options.text || '',
      html:options.html || '',
      icon:options.icon || '🌟',
      accent:options.accent || '#8460c8',
      at:Date.now()
    });
    if (!document.getElementById('fishingHub')?.classList.contains('hidden')) renderHub();
  }

  function catchOne() {
    const row = pickRow();
    const quality = chooseQuality();
    const weight = (row[3] + Math.pow(Math.random(),1.65) * (row[4] - row[3])) * quality[2];
    const effect = coffeeEffect();
    const item = {
      name:row[0],zone:row[1],rarity:row[2],quality:quality[0],weight,kind:row[5] || 'fish',
      icon:ICONS[row[5]] || '🐟',at:Date.now(),coffeePearlBonus:Math.max(1,bonus('pearlBonus',1)),coffeeEffectName:effect?.name || ''
    };
    addToBag(item);
    updateDex(item);
    save(COUNT_KEY, Number(read(COUNT_KEY, 0) || 0) + 1);
    pushHistory({type:'catch',item,at:item.at});
    openHub('recent');
    window.dispatchEvent(new CustomEvent('coffee-ship:fishing-result',{detail:{item}}));
    return item;
  }

  function startFishing() {
    if (!isDeckOpen()) return false;
    if (!nearFishingSpot()) {
      window.COFFEE_SHIP_DECK?.showTip?.('🎣 請先走到右側的深夜釣魚區',1800);
      return false;
    }
    if (Date.now() < cooldownUntil) return false;
    cooldownUntil = Date.now() + 650;
    catchOne();
    return true;
  }

  function registerPool(name, rows) {
    if (!name || !Array.isArray(rows) || !rows.length) return false;
    registeredPools.set(name, rows);
    return true;
  }

  function removeLegacyUi() {
    ['fishingCard','extraFish50Card','mermaidCard','sharkCard','mutantCard','fishingMotionCanvas','fishingEventStack'].forEach(id => document.getElementById(id)?.remove());
    document.body.classList.remove('fishing-motion-active','fishing-event-stack-open','fishing-result-open');
  }

  function bind() {
    document.addEventListener('click', event => {
      if (event.target.closest?.('.fh-close')) { closeHub(); return; }
      const tab = event.target.closest?.('[data-fh-tab]');
      if (tab) { activeTab = tab.dataset.fhTab; renderHub(); }
    }, true);
    window.addEventListener('coffee-ship:scene', event => {
      if (event.detail?.scene !== 'deck') closeHub();
    });
  }

  function init() {
    addStyle();
    ensureHub();
    ensureDexButton();
    removeLegacyUi();
    bind();
    window.COFFEE_SHIP_FISHING_API = {
      startFishing,
      catchOne,
      pushEvent,
      registerPool,
      open:openHub,
      close:closeHub,
      render:renderHub,
      nearFishingSpot,
      animation:false,
      fishDex:true
    };
    window.dispatchEvent(new CustomEvent('coffee-ship:fishing-api-ready'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();