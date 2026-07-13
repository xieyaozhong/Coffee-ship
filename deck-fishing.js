(() => {
  'use strict';
  if (window.__COFFEE_SHIP_UNIFIED_FISHING_V4__) return;
  window.__COFFEE_SHIP_UNIFIED_FISHING_V4__ = true;

  const BAG_KEY = 'coffeeShipFishBag';
  const DEX_KEY = 'coffeeShipFishDex';
  const DEX_META_KEY = 'coffeeShipFishDexMeta';
  const HISTORY_KEY = 'coffeeShipRecentCatches';
  const COUNT_KEY = 'coffeeShipCatchCount';
  const MAX_HISTORY_ENTRIES = 120;
  const MAX_CASTS = 30;

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
  const SHARK_RARITY = {黑鰭礁鯊:'常見',護士鯊:'常見',雙髻鯊:'稀有',虎鯊:'稀有',大白鯊:'史詩',深海幽影鯊:'史詩',巨齒鯊:'傳說',星海巨齒鯊:'傳說'};

  const registeredPools = new Map();
  let activeTab = 'recent';
  let cooldownStartedAt = 0;
  let cooldownUntil = 0;
  let cooldownDuration = 850;
  let castSequence = 0;
  let activeCast = null;
  let statusTimer = 0;
  let lastZoneState = '';

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
    return escapeHtml(value).replace(/\n/g,'<br>');
  }

  function plainText(value) {
    const holder = document.createElement('div');
    holder.innerHTML = String(value || '');
    return holder.textContent || holder.innerText || '';
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

  function registerPool(name, rows) {
    if (!name || !Array.isArray(rows)) return false;
    const normalized = rows.filter(row => Array.isArray(row) && row.length >= 6 && row[0]).map(row => [
      String(row[0]),String(row[1] || '未知海域'),String(row[2] || '普通'),
      Math.max(0.001,Number(row[3] || 0.01)),Math.max(Number(row[3] || 0.01),Number(row[4] || row[3] || 0.01)),String(row[5] || 'fish')
    ]);
    if (!normalized.length) return false;
    registeredPools.set(name,normalized);
    window.dispatchEvent(new CustomEvent('coffee-ship:fishing-pool-changed',{detail:{name,count:normalized.length}}));
    if (activeTab === 'dex' && isHubOpen()) renderHub({preserveScroll:true});
    return true;
  }

  registerPool('base',BASE_POOL);

  function allPoolRows() {
    const unique = new Map();
    [...registeredPools.values()].flat().forEach(row => {
      if (!unique.has(row[0])) unique.set(row[0],row);
    });
    return [...unique.values()];
  }

  function chooseWeighted(map) {
    const total = Object.values(map).reduce((sum,value) => sum + value,0);
    let roll = Math.random() * total;
    for (const [key,weight] of Object.entries(map)) {
      roll -= weight;
      if (roll <= 0) return key;
    }
    return Object.keys(map)[0];
  }

  function chooseRarity() {
    const luck = Math.max(1,bonus('fishingLuck',1));
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
    const qualityBonus = Math.max(0,bonus('qualityBonus',0));
    if (qualityBonus > 0 && Math.random() < qualityBonus) {
      const boosted = QUALITY.slice(2);
      return boosted[Math.floor(Math.random() * boosted.length)];
    }
    const total = QUALITY.reduce((sum,row) => sum + row[1],0);
    let roll = Math.random() * total;
    for (const row of QUALITY) {
      roll -= row[1];
      if (roll <= 0) return row;
    }
    return QUALITY[0];
  }

  function pickRow() {
    const rows = allPoolRows();
    const rarity = chooseRarity();
    const rarityPool = rows.filter(row => row[2] === rarity);
    const pool = rarityPool.length ? rarityPool : rows;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function descriptor(item) {
    return window.COFFEE_SHIP_ICON?.iconDescriptor?.(item) || {base:item.icon || ICONS[item.kind] || '🐟'};
  }

  function pixelIcon(item, className = '') {
    const fishHtml = window.COFFEE_SHIP_FISH_ICONS?.iconHtml?.(item,className);
    if (fishHtml) return fishHtml;
    const itemHtml = window.COFFEE_SHIP_ITEM_PIXEL_ICONS?.iconHtml?.(item,className);
    if (itemHtml) return itemHtml;
    return `<span class="fh-fallback-icon" aria-hidden="true">${escapeHtml(descriptor(item).base)}</span>`;
  }

  function eventIcon(row) {
    const eventKind = row.eventKind || eventKindFor(row.title);
    if (eventKind === 'shark') {
      const eventName = String(row.eventId || '').replace(/^shark:/,'');
      const titleName = String(row.title || '').split('｜').at(-1).trim();
      const name = eventName || titleName || '未知鯊魚';
      const html = window.COFFEE_SHIP_FISH_ICONS?.iconHtml?.({name,kind:'shark',rarity:row.iconRarity || SHARK_RARITY[name] || '普通'},'fh-shark-event-icon');
      if (html) return html;
    }
    if (eventKind === 'mutant') {
      const mutantId = String(row.eventId || '').replace(/^mutant:/,'');
      const creatures = window.COFFEE_SHIP_MUTANT_HUNT?.creatures || [];
      const eventText = `${row.title || ''}\n${row.text || ''}`;
      const creature = creatures.find(item => item.id === mutantId) || creatures.find(item => eventText.includes(item.name));
      if (creature) {
        const html = window.COFFEE_SHIP_FISH_ICONS?.iconHtml?.({mutantId:creature.id,name:creature.name,kind:'mutant',rarity:row.iconRarity || creature.rarity},'fh-mutant-event-icon');
        if (html) return html;
      }
    }
    if (eventKind === 'mermaid') {
      const html = window.COFFEE_SHIP_MERMAID_ICONS?.iconHtml?.({eventId:row.eventId,title:row.title},'fh-mermaid-event-icon');
      if (html) return html;
    }
    if (eventKind === 'bottle') {
      const html = window.COFFEE_SHIP_ITEM_PIXEL_ICONS?.iconHtml?.({name:row.title,series:row.title,kind:'bottle',rarity:'稀有'},'fh-event-item-icon');
      if (html) return html;
    }
    return `<span aria-hidden="true">${escapeHtml(row.icon || '🌟')}</span>`;
  }

  function priceOf(item) {
    const rarity = {普通:2,常見:4,稀有:10,史詩:28,傳說:120,神話:500,世界級:5000}[item.rarity] || 2;
    const quality = {普通:1,優秀:1.4,完美:2,閃亮:3.5,神話:6,變異:3,祝福:2}[item.quality] || 1;
    return Math.max(1,Math.round(Math.max(.1,Number(item.weight || 1)) * rarity * quality * Math.max(1,Number(item.coffeePearlBonus || 1))));
  }

  function history() {
    const value = read(HISTORY_KEY,[]);
    return Array.isArray(value) ? value : [];
  }

  function pushHistory(entry) {
    const items = history();
    items.unshift({...entry,at:Number(entry.at || Date.now())});
    save(HISTORY_KEY,items.slice(0,MAX_HISTORY_ENTRIES));
  }

  function addToBag(item) {
    const bag = read(BAG_KEY,[]);
    const safeBag = Array.isArray(bag) ? bag : [];
    safeBag.push(item);
    save(BAG_KEY,safeBag.slice(-240));
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'fishing',item}}));
  }

  function updateDex(item) {
    if (!item.name || item.kind === 'trash' || item.kind === 'letter') return;
    const dex = read(DEX_KEY,{});
    dex[item.name] = Math.max(Number(dex[item.name] || 0),Number(item.weight || 0));
    save(DEX_KEY,dex);

    const meta = read(DEX_META_KEY,{});
    const previous = meta[item.name] || {};
    meta[item.name] = {
      icon:descriptor(item).base,
      kind:item.kind || previous.kind || 'fish',
      rarity:item.rarity || previous.rarity || '普通',
      zone:item.zone || previous.zone || '未知',
      count:Number(previous.count || 0) + 1,
      best:Math.max(Number(previous.best || 0),Number(item.weight || 0)),
      latestAt:Date.now()
    };
    save(DEX_META_KEY,meta);
  }

  function currentCastId() {
    if (activeCast && activeCast.expiresAt > Date.now()) return activeCast.id;
    return '';
  }

  function eventKindFor(title) {
    const value = String(title || '');
    if (/美人魚/.test(value)) return 'mermaid';
    if (/鯊魚/.test(value)) return 'shark';
    if (/變異|世界級/.test(value)) return 'mutant';
    if (/漂流瓶|藏寶|神父|狂歡島|海龜湯|愛麗兒|可可|拉納爾/.test(value)) return 'bottle';
    return 'special';
  }

  function pushEvent(options = {}) {
    const title = String(options.title || '特殊事件');
    const text = String(options.text || plainText(options.html || ''));
    pushHistory({
      type:'event',
      castId:options.castId || currentCastId() || `event_${Date.now()}_${++castSequence}`,
      eventId:String(options.eventId || options.id || ''),
      eventKind:options.eventKind || eventKindFor(title),
      tone:String(options.tone || ''),
      iconRarity:String(options.iconRarity || ''),
      title,
      text,
      icon:options.icon || '🌟',
      accent:options.accent || '#8460c8',
      at:Date.now()
    });
    if (isHubOpen()) renderHub({preserveScroll:activeTab !== 'recent'});
  }

  function groupCasts() {
    const groups = new Map();
    history().slice().sort((a,b) => Number(b.at || 0) - Number(a.at || 0)).forEach((row,index) => {
      const fallback = row.type === 'catch' ? `legacy_cast_${row.at || index}` : `legacy_event_${row.at || index}`;
      const id = row.castId || fallback;
      if (!groups.has(id)) groups.set(id,{id,at:Number(row.at || 0),rows:[]});
      const group = groups.get(id);
      group.at = Math.max(group.at,Number(row.at || 0));
      group.rows.push(row);
    });
    return [...groups.values()].sort((a,b) => b.at - a.at).slice(0,MAX_CASTS);
  }

  function addStyle() {
    if (document.getElementById('unifiedFishingStyleV4')) return;
    document.getElementById('unifiedFishingStyle')?.remove();
    const style = document.createElement('style');
    style.id = 'unifiedFishingStyleV4';
    style.textContent = `
      #fishingZoneStatus{position:absolute;right:18px;top:74px;z-index:31;display:flex;align-items:center;gap:8px;max-width:260px;padding:8px 11px;border:2px solid #76536a;border-radius:14px;background:rgba(18,13,29,.93);color:#d7bb79;font-size:13px;font-weight:1000;box-shadow:0 5px 0 rgba(0,0,0,.26);pointer-events:none;transition:.18s ease}
      #fishingZoneStatus.hidden{display:none!important}#fishingZoneStatus.ready{border-color:#79d0b1;color:#9ce8f0;box-shadow:0 5px 0 rgba(0,0,0,.26),0 0 20px rgba(121,208,177,.25)}#fishingZoneStatus.cooldown{border-color:#ffe16b;color:#ffe16b}.fz-dot{width:10px;height:10px;border-radius:50%;background:currentColor;box-shadow:0 0 10px currentColor}.fz-copy{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #fishingHub{position:fixed;right:14px;top:calc(72px + env(safe-area-inset-top));bottom:calc(14px + env(safe-area-inset-bottom));z-index:22000;width:min(460px,calc(100vw - 28px));display:flex;flex-direction:column;overflow:hidden;padding:12px;border:3px solid #79d0b1;border-radius:23px;background:rgba(13,9,23,.985);color:#fff4d8;box-sizing:border-box;box-shadow:0 18px 48px rgba(0,0,0,.5)}
      #fishingHub.hidden{display:none!important}.fh-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.fh-head h3{margin:0;font-size:20px}.fh-close{border:0;border-radius:12px;padding:9px 13px;background:#493249;color:#fff4d8;font-weight:1000;box-shadow:0 4px 0 rgba(0,0,0,.25)}
      .fh-control{display:grid;grid-template-columns:1fr auto;gap:9px;align-items:stretch;margin:9px 0}.fh-state{position:relative;overflow:hidden;min-height:51px;padding:8px 10px;border:2px solid #76536a;border-radius:14px;background:#181020;box-sizing:border-box}.fh-state strong,.fh-state small{position:relative;z-index:2;display:block}.fh-state small{margin-top:2px;opacity:.78}.fh-progress{position:absolute;left:0;bottom:0;height:4px;width:0;background:#79d0b1;transition:width .08s linear}.fh-cast{min-width:112px;border:0;border-radius:14px;padding:9px 12px;background:#4f8f73;color:#fff4d8;font-weight:1000;box-shadow:0 6px 0 #254c3c;touch-action:manipulation}.fh-cast:disabled{background:#493249;color:#bdaebe;box-shadow:0 5px 0 #241925;opacity:.78}
      .fh-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:9px}.fh-summary span{padding:7px 6px;border-radius:11px;background:#211728;text-align:center;font-size:12px;font-weight:950}.fh-summary strong{display:block;color:#ffe16b;font-size:15px}
      .fh-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:9px}.fh-tab{border:2px solid #76536a;border-radius:999px;padding:8px 5px;background:#211728;color:#fff4d8;font-weight:1000}.fh-tab.active{background:#79d0b1;color:#151020;border-color:#79d0b1}.fh-content{min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:1px 2px 5px}.fh-list{display:flex;flex-direction:column;gap:10px}
      .fh-cast-group{border:2px solid #76536a;border-radius:17px;background:#15101d;overflow:hidden;box-shadow:0 6px 0 rgba(0,0,0,.24)}.fh-cast-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 11px;background:#211728;color:#d7bb79;font-weight:1000}.fh-cast-head small{opacity:.7}.fh-cast-body{display:flex;flex-direction:column;gap:8px;padding:9px}
      .fh-card{border:2px solid var(--accent,#79d0b1);border-radius:14px;padding:10px;background:#181020}.fh-card.is-primary{background:linear-gradient(180deg,#1c1726,#15101d)}.fh-card-head{display:flex;align-items:flex-start;gap:9px;font-size:16px}.fh-card-head strong{flex:1;min-width:0}.fh-icon{flex:0 0 auto;font-size:26px;line-height:1}.fh-card small{display:block;margin-top:6px;line-height:1.52;opacity:.92}.fh-event-label{display:inline-flex;margin-left:auto;padding:2px 7px;border-radius:999px;background:rgba(255,255,255,.1);font-size:10px;color:#fff4d8}.fh-time{display:block;margin-top:6px;font-size:11px;opacity:.58}.fh-empty{padding:19px;border:2px dashed #76536a;border-radius:15px;text-align:center;color:#d7bb79;font-weight:1000}.fh-dex-row{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:9px;padding:10px 4px;border-bottom:1px solid rgba(255,255,255,.1)}.fh-dex-row:last-child{border-bottom:0}.fh-dex-icon{font-size:23px}.fh-dex-copy small{display:block;margin-top:2px;opacity:.68}.fh-dex-best{text-align:right;color:#ffe16b;font-weight:1000}
      #fishDexBtn{border:0;border-radius:14px;padding:10px 11px;background:#5d3f72;color:#fff4d8;font-weight:1000;box-shadow:0 6px 0 rgba(0,0,0,.27)}
      #coffeeBtn.fishing-ready{background:#4f8f73!important;color:#fff4d8!important;box-shadow:0 6px 0 #254c3c,0 0 16px rgba(121,208,177,.32)!important}#coffeeBtn.fishing-wait{background:#493249!important}
      body.fishing-hub-open{overflow:hidden!important}body.fishing-hub-open #backpackSafeOpenBtn{visibility:hidden!important;pointer-events:none!important}
      @media(max-width:760px){#fishingZoneStatus{right:10px;top:56px;max-width:220px;font-size:11px;padding:6px 8px}#fishingHub{left:8px;right:8px;top:calc(8px + env(safe-area-inset-top));bottom:calc(8px + env(safe-area-inset-bottom));width:auto;padding:10px}.fh-control{grid-template-columns:1fr 106px}.fh-summary span{font-size:10px}.fh-summary strong{font-size:14px}.fh-tabs{gap:5px}.fh-tab{font-size:12px;padding:7px 3px}body.fishing-hub-open .mobile-controls{visibility:hidden!important;pointer-events:none!important}}
    `;
    document.head.appendChild(style);
  }

  function ensureZoneStatus() {
    let status = document.getElementById('fishingZoneStatus');
    if (status) return status;
    const panel = document.getElementById('gamePanel') || document.body;
    status = document.createElement('div');
    status.id = 'fishingZoneStatus';
    status.className = 'hidden';
    status.innerHTML = '<span class="fz-dot"></span><span class="fz-copy">前往右側釣魚區</span>';
    panel.appendChild(status);
    return status;
  }

  function ensureHub() {
    let hub = document.getElementById('fishingHub');
    if (hub) return hub;
    hub = document.createElement('aside');
    hub.id = 'fishingHub';
    hub.className = 'hidden';
    hub.setAttribute('aria-live','polite');
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
    button.textContent = '🎣 紀錄';
    button.addEventListener('click',event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openHub('recent');
    },true);
    controls.appendChild(button);
  }

  function isHubOpen() {
    const hub = document.getElementById('fishingHub');
    return !!hub && !hub.classList.contains('hidden');
  }

  function timeLabel(timestamp) {
    try { return new Date(timestamp).toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'}); }
    catch { return ''; }
  }

  function stats() {
    const dex = read(DEX_KEY,{});
    const catches = Number(read(COUNT_KEY,0) || 0);
    const weights = Object.values(dex).map(Number).filter(Number.isFinite);
    return {
      catches,
      discovered:Object.keys(dex).length,
      registered:allPoolRows().length,
      best:weights.length ? Math.max(...weights) : 0
    };
  }

  function eventLabel(kind) {
    return {mermaid:'美人魚',shark:'鯊魚',mutant:'變異',bottle:'漂流瓶',special:'特殊'}[kind] || '事件';
  }

  function renderCatchCard(row) {
    const item = row.item || row;
    const value = item.kind === 'trash' ? '不可販售' : `${priceOf(item)} 珍珠`;
    return `<article class="fh-card is-primary" style="--accent:${COLORS[item.rarity] || '#79d0b1'}"><div class="fh-card-head"><span class="fh-icon fh-icon-shell">${pixelIcon(item,'fh-species-icon')}</span><strong>${escapeHtml(`${item.quality || ''} ${item.name || '未知漁獲'}`.trim())}</strong></div><small>海域：${escapeHtml(item.zone || '未知')}<br>稀有度：${escapeHtml(item.rarity || '普通')}<br>重量：${Number(item.weight || 0).toFixed(2)} kg<br>價值：${value}${item.coffeeEffectName ? `<br>咖啡加成：${escapeHtml(item.coffeeEffectName)}` : ''}</small></article>`;
  }

  function renderEventCard(row) {
    return `<article class="fh-card" data-event-id="${escapeHtml(row.eventId || '')}" data-event-tone="${escapeHtml(row.tone || '')}" data-event-kind="${escapeHtml(row.eventKind || 'special')}" style="--accent:${escapeHtml(row.accent || '#8460c8')}"><div class="fh-card-head"><span class="fh-icon">${eventIcon(row)}</span><strong>${escapeHtml(row.title || '特殊事件')}</strong><span class="fh-event-label">${escapeHtml(eventLabel(row.eventKind))}</span></div><small>${formatText(row.text || '')}</small><span class="fh-time">${timeLabel(row.at)}</span></article>`;
  }

  function renderRecent() {
    const groups = groupCasts();
    if (!groups.length) return '<div class="fh-empty">走到甲板右側的釣魚區後下竿，漁獲與同時觸發的事件會整理在同一組。</div>';
    return `<div class="fh-list">${groups.map((group,index) => {
      const catches = group.rows.filter(row => row.type !== 'event').sort((a,b) => Number(a.at || 0) - Number(b.at || 0));
      const events = group.rows.filter(row => row.type === 'event').sort((a,b) => Number(a.at || 0) - Number(b.at || 0));
      const title = catches.length ? `第 ${Math.max(1,stats().catches - index)} 竿` : '獨立事件';
      return `<section class="fh-cast-group"><div class="fh-cast-head"><span>${title}</span><small>${timeLabel(group.at)}${events.length ? ` · ${events.length} 個事件` : ''}</small></div><div class="fh-cast-body">${catches.map(renderCatchCard).join('')}${events.map(renderEventCard).join('')}</div></section>`;
    }).join('')}</div>`;
  }

  function renderEvents() {
    const rows = history().filter(row => row.type === 'event').sort((a,b) => Number(b.at || 0) - Number(a.at || 0));
    if (!rows.length) return '<div class="fh-empty">目前尚未觸發特殊事件。</div>';
    return `<div class="fh-list">${rows.map(renderEventCard).join('')}</div>`;
  }

  function renderDex() {
    const dex = read(DEX_KEY,{});
    const meta = read(DEX_META_KEY,{});
    const rows = Object.entries(dex).sort((a,b) => Number(b[1]) - Number(a[1]));
    if (!rows.length) return '<div class="fh-empty">尚未收集任何魚種。</div>';
    return `<div>${rows.map(([name,weight]) => {
      const info = meta[name] || {};
      const item = {name,kind:info.kind || 'fish',rarity:info.rarity || '普通',zone:info.zone || '未知海域'};
      return `<div class="fh-dex-row"><span class="fh-dex-icon">${pixelIcon(item,'fh-dex-species-icon')}</span><span class="fh-dex-copy"><strong>${escapeHtml(name)}</strong><small>${escapeHtml(info.rarity || '已發現')} · ${escapeHtml(info.zone || '未知海域')} · ${Number(info.count || 1)} 次</small></span><span class="fh-dex-best">${Number(weight || info.best || 0).toFixed(2)} kg</span></div>`;
    }).join('')}</div>`;
  }

  function renderHub(options = {}) {
    const hub = ensureHub();
    const oldContent = hub.querySelector('.fh-content');
    const oldScroll = options.preserveScroll ? Number(oldContent?.scrollTop || 0) : 0;
    const summary = stats();
    const content = activeTab === 'recent' ? renderRecent() : activeTab === 'events' ? renderEvents() : renderDex();
    hub.innerHTML = `
      <div class="fh-head"><h3>🎣 甲板釣魚</h3><button class="fh-close" type="button">關閉</button></div>
      <div class="fh-control"><div class="fh-state"><strong id="fhStateTitle">確認釣點中</strong><small id="fhStateDetail">請稍候</small><span id="fhProgress" class="fh-progress"></span></div><button id="fhCastBtn" class="fh-cast" type="button">下竿</button></div>
      <div class="fh-summary"><span><strong>${summary.catches}</strong>累計下竿</span><span><strong>${summary.discovered}/${summary.registered}</strong>已發現魚種</span><span><strong>${summary.best.toFixed(2)}</strong>最大重量 kg</span></div>
      <div class="fh-tabs"><button class="fh-tab ${activeTab==='recent'?'active':''}" data-fh-tab="recent">最新漁獲</button><button class="fh-tab ${activeTab==='events'?'active':''}" data-fh-tab="events">特殊事件</button><button class="fh-tab ${activeTab==='dex'?'active':''}" data-fh-tab="dex">圖鑑</button></div>
      <div class="fh-content">${content}</div>`;
    if (options.preserveScroll) hub.querySelector('.fh-content').scrollTop = oldScroll;
    syncStatus();
  }

  function openHub(tab = 'recent') {
    activeTab = tab;
    renderHub();
    const hub = ensureHub();
    hub.classList.remove('hidden');
    document.body.classList.add('fishing-hub-open');
    const content = hub.querySelector('.fh-content');
    if (content) content.scrollTop = 0;
    syncStatus();
  }

  function closeHub() {
    ensureHub().classList.add('hidden');
    document.body.classList.remove('fishing-hub-open');
  }

  function fishingState() {
    if (!isDeckOpen()) return {mode:'hidden',title:'未在甲板',detail:'請先前往甲板',ready:false,progress:0};
    if (!nearFishingSpot()) return {mode:'away',title:'尚未抵達釣魚區',detail:'走到甲板右側的發光釣點',ready:false,progress:0};
    const remaining = Math.max(0,cooldownUntil - Date.now());
    if (remaining > 0) {
      const progress = cooldownDuration ? Math.min(1,Math.max(0,(Date.now() - cooldownStartedAt) / cooldownDuration)) : 1;
      return {mode:'cooldown',title:'正在整理釣具',detail:`${(remaining / 1000).toFixed(1)} 秒後可再次下竿`,ready:false,progress};
    }
    const effect = coffeeEffect();
    return {mode:'ready',title:'釣點已就緒',detail:effect ? `${effect.icon || '☕'} ${effect.name} 效果生效中` : '可立即下竿',ready:true,progress:1};
  }

  function syncStatus() {
    const state = fishingState();
    const status = ensureZoneStatus();
    status.className = state.mode === 'hidden' ? 'hidden' : state.mode === 'ready' ? 'ready' : state.mode === 'cooldown' ? 'cooldown' : '';
    const copy = status.querySelector('.fz-copy');
    if (copy) copy.textContent = state.mode === 'ready' ? '釣魚區：可下竿' : state.mode === 'cooldown' ? state.detail : '前往右側釣魚區';

    const coffeeButton = document.getElementById('coffeeBtn');
    if (coffeeButton && isDeckOpen()) {
      coffeeButton.textContent = state.ready ? '🎣 下竿' : state.mode === 'cooldown' ? '🎣 等待' : '🎣 釣魚';
      coffeeButton.classList.toggle('fishing-ready',state.ready);
      coffeeButton.classList.toggle('fishing-wait',state.mode === 'cooldown');
    }

    const title = document.getElementById('fhStateTitle');
    const detail = document.getElementById('fhStateDetail');
    const progress = document.getElementById('fhProgress');
    const castButton = document.getElementById('fhCastBtn');
    if (title) title.textContent = state.title;
    if (detail) detail.textContent = state.detail;
    if (progress) progress.style.width = `${Math.round(state.progress * 100)}%`;
    if (castButton) {
      castButton.disabled = !state.ready;
      castButton.textContent = state.ready ? '🎣 再次下竿' : state.mode === 'cooldown' ? '整理中' : '前往釣點';
    }

    const signature = `${state.mode}|${state.ready}`;
    if (signature !== lastZoneState) {
      lastZoneState = signature;
      window.dispatchEvent(new CustomEvent('coffee-ship:fishing-state',{detail:state}));
    }
  }

  function createCastId() {
    return `cast_${Date.now()}_${++castSequence}`;
  }

  function catchOne(castId) {
    const row = pickRow();
    const quality = chooseQuality();
    const weight = (row[3] + Math.pow(Math.random(),1.65) * (row[4] - row[3])) * quality[2];
    const effect = coffeeEffect();
    const item = {
      name:row[0],zone:row[1],rarity:row[2],quality:quality[0],weight,kind:row[5] || 'fish',
      icon:ICONS[row[5]] || '🐟',at:Date.now(),castId,
      coffeePearlBonus:Math.max(1,bonus('pearlBonus',1)),coffeeEffectName:effect?.name || ''
    };
    addToBag(item);
    updateDex(item);
    save(COUNT_KEY,Number(read(COUNT_KEY,0) || 0) + 1);
    pushHistory({type:'catch',castId,item,at:item.at});
    openHub('recent');
    window.dispatchEvent(new CustomEvent('coffee-ship:fishing-result',{detail:{item,castId}}));
    setTimeout(() => {
      if (activeCast?.id === castId) activeCast = null;
      if (isHubOpen()) renderHub({preserveScroll:false});
      syncStatus();
    },950);
    window.dispatchEvent(new CustomEvent('coffee-ship:fishing-complete',{detail:{item,castId}}));
    return item;
  }

  function startFishing() {
    if (!isDeckOpen()) return false;
    if (!nearFishingSpot()) {
      window.COFFEE_SHIP_DECK?.showTip?.('🎣 請先走到右側發光的深夜釣魚區',1800);
      syncStatus();
      return false;
    }
    if (Date.now() < cooldownUntil) {
      syncStatus();
      return false;
    }

    cooldownDuration = Math.max(360,Math.round(850 * Math.max(.35,bonus('fishingSpeed',1))));
    cooldownStartedAt = Date.now();
    cooldownUntil = cooldownStartedAt + cooldownDuration;
    const castId = createCastId();
    activeCast = {id:castId,expiresAt:Date.now() + 1200};
    syncStatus();
    catchOne(castId);
    return true;
  }

  function removeLegacyUi() {
    ['fishingCard','extraFish50Card','mermaidCard','sharkCard','mutantCard','fishingMotionCanvas','fishingEventStack'].forEach(id => document.getElementById(id)?.remove());
    document.body.classList.remove('fishing-motion-active','fishing-event-stack-open','fishing-result-open');
  }

  function bind() {
    document.addEventListener('click',event => {
      if (event.target.closest?.('.fh-close')) { closeHub(); return; }
      if (event.target.closest?.('#fhCastBtn')) { startFishing(); return; }
      const tab = event.target.closest?.('[data-fh-tab]');
      if (tab) {
        activeTab = tab.dataset.fhTab;
        renderHub();
      }
    },true);

    window.addEventListener('coffee-ship:scene',event => {
      if (event.detail?.scene !== 'deck') closeHub();
      syncStatus();
    });
    window.addEventListener('resize',syncStatus,{passive:true});
    window.addEventListener('storage',event => {
      if ([HISTORY_KEY,DEX_KEY,DEX_META_KEY,COUNT_KEY].includes(event.key) && isHubOpen()) renderHub({preserveScroll:true});
    });
  }

  function init() {
    addStyle();
    ensureHub();
    ensureZoneStatus();
    ensureDexButton();
    removeLegacyUi();
    bind();
    clearInterval(statusTimer);
    statusTimer = setInterval(syncStatus,120);
    syncStatus();

    window.COFFEE_SHIP_FISHING_API = {
      startFishing,
      catchOne:startFishing,
      pushEvent,
      registerPool,
      open:openHub,
      close:closeHub,
      render:renderHub,
      nearFishingSpot,
      getState:fishingState,
      getHistory:history,
      getCurrentCastId:currentCastId,
      animation:false,
      fishDex:true,
      version:4
    };
    window.dispatchEvent(new CustomEvent('coffee-ship:fishing-api-ready',{detail:{version:4}}));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
