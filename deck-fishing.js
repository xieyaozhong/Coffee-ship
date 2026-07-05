(() => {
  'use strict';
  if (window.__COFFEE_SHIP_SIMPLE_FISHING_V2__) return;
  window.__COFFEE_SHIP_SIMPLE_FISHING_V2__ = true;

  const CATCHES = [
    ['小沙丁魚','近海','普通',0.03,0.18,'fish'],['銀鱗小魚','近海','普通',0.05,0.35,'fish'],['月光鯷魚','近海','普通',0.04,0.42,'fish'],['咖啡豆魚','近海','普通',0.08,0.55,'fish'],['奶泡魚','近海','普通',0.12,0.8,'fish'],['海風小鯛','近海','普通',0.2,0.9,'fish'],['泡泡魚','近海','普通',0.06,0.4,'fish'],['迷你飛魚','近海','普通',0.15,0.75,'fish'],['橘尾雀鯛','近海','普通',0.08,0.35,'fish'],['玻璃小魚','近海','普通',0.02,0.2,'fish'],
    ['白玉小蝦','近海','普通',0.02,0.12,'shrimp'],['海草蝦','近海','普通',0.03,0.16,'shrimp'],['晨光小蝦','近海','普通',0.02,0.14,'shrimp'],['小寄居蟹','近海','普通',0.05,0.3,'crab'],['迷你沙蟹','近海','普通',0.04,0.22,'crab'],
    ['漂流塑膠袋','海底垃圾','普通',0.01,0.06,'trash'],['生鏽瓶蓋','海底垃圾','普通',0.01,0.03,'trash'],['破吸管','海底垃圾','普通',0.01,0.04,'trash'],['皺掉的杯套','海底垃圾','普通',0.01,0.05,'trash'],
    ['港口竹筴魚','港口','常見',0.3,1.2,'fish'],['星斑鯖魚','港口','常見',0.45,1.8,'fish'],['藍線魚','港口','常見',0.25,1.1,'fish'],['焦糖鯛','港口','常見',0.6,2.3,'fish'],['木棧道石斑','港口','常見',0.8,3.6,'fish'],['船影鱸魚','港口','常見',0.9,4.2,'fish'],['碼頭烏魚','港口','常見',0.7,3.2,'fish'],['白浪比目魚','港口','常見',0.5,2.8,'fish'],['船燈秋刀魚','港口','常見',0.2,0.9,'fish'],['銅鰭魚','港口','常見',0.35,1.7,'fish'],
    ['紅螯小蟹','港口','常見',0.12,0.9,'crab'],['藍紋梭子蟹','港口','常見',0.25,1.8,'crab'],['咖啡蝦','港口','常見',0.04,0.22,'shrimp'],['斑節蝦','港口','常見',0.05,0.3,'shrimp'],['舊船繩','海底垃圾','常見',0.2,1.2,'trash'],['破木箱碎片','海底垃圾','常見',0.5,3.5,'trash'],
    ['夜光魷魚','夜海','稀有',0.5,2.8,'squid'],['珍珠河豚','夜海','稀有',0.7,3.1,'fish'],['藍寶石鮪幼魚','夜海','稀有',2.2,8.5,'fish'],['星空鰻','夜海','稀有',1.1,5.6,'fish'],['玫瑰金鯉','夜海','稀有',0.9,4.8,'fish'],['月牙水母','夜海','稀有',0.3,1.5,'jelly'],['銀河小卷','夜海','稀有',0.4,2.2,'squid'],['幽光燈籠魚','夜海','稀有',0.6,3.4,'angler'],['紫星魟幼魚','夜海','稀有',1.5,6.2,'fish'],['夜霧鯰魚','夜海','稀有',1.2,7.5,'fish'],
    ['星砂蝦','夜海','稀有',0.05,0.3,'shrimp'],['月影帝王蟹幼蟹','夜海','稀有',1.5,8,'crab'],['小安康魚','夜海','稀有',1.1,6.5,'angler'],['瓶中信','漂流物','稀有',0.2,1.2,'letter'],['海女的髮梳','漂流物','稀有',0.05,0.2,'treasure'],
    ['深海拿鐵鯊','深海','史詩',12,48,'fish'],['銀河旗魚','深海','史詩',18,72,'fish'],['古代鸚鵡螺','深海','史詩',5,25,'shell'],['月影魟魚','深海','史詩',9,38,'fish'],['黑潮大鮪魚','深海','史詩',26,120,'fish'],['冰藍皇帶魚','深海','史詩',8,35,'fish'],['紅寶石石斑','深海','史詩',10,45,'fish'],['風暴鬼頭刀','深海','史詩',6,28,'fish'],['深淵大章魚','深海','史詩',30,160,'octopus'],['星塵龍蝦','深海','史詩',2,16,'shrimp'],
    ['巨型安康魚','深海','史詩',18,95,'angler'],['深海王蟹','深海','史詩',5,28,'crab'],['虹光龍蝦','深海','史詩',1.8,12,'shrimp'],['沉船懷錶','漂流物','史詩',0.1,0.8,'treasure'],['古老瓶中信','漂流物','史詩',0.3,1.5,'letter'],
    ['傳說咖啡鯨','傳說','傳說',300,1200,'whale'],['星海龍魚','傳說','傳說',45,180,'fish'],['黃金船錨魚','傳說','傳說',20,90,'fish'],['宇宙翻車魚','傳說','傳說',150,800,'fish'],['黎明海神魚','傳說','傳說',80,360,'fish'],['黑洞巨魷','傳說','傳說',200,1500,'squid'],['彩虹王鮪','傳說','傳說',60,260,'fish'],['永夜鯨鯊','傳說','傳說',500,2200,'whale'],
    ['美人魚的微笑','傳說','傳說',10,35,'mermaid'],['人魚公主的貝殼','傳說','傳說',0.8,3.5,'mermaid'],['王冠安康魚','傳說','傳說',40,180,'angler'],['星海瓶中信','漂流物','傳說',0.4,2,'letter']
  ];

  const LETTERS = [
    {title:'普通瓶中信',text:'今晚的海很安靜，願撿到這封信的人，也能被溫柔接住。'},
    {title:'普通瓶中信',text:'我把想念裝進瓶子裡，如果它漂到你手上，請替我看一眼星星。'},
    {title:'普通瓶中信',text:'不要急著抵達終點，船上的風、咖啡與朋友，本身就是旅程。'},
    {title:'普通瓶中信',text:'如果今天很累，請記得：你已經撐過很多風浪了。'},
    {title:'普通瓶中信',text:'傳說在滿月的甲板釣魚，會遇見唱歌的人魚。'},
    {title:'普通瓶中信',text:'給未來的店長：請把 Coffee Ship 繼續開往溫柔的地方。'}
  ];

  const RARITY_WEIGHT = {普通:50,常見:31,稀有:14,史詩:4.2,傳說:.8};
  const QUALITY_TABLE = [['普通',55,1],['優秀',25,1.13],['完美',13,1.28],['閃亮',5,1.5],['神話',2,1.9]];
  const COLORS = {普通:'#fff4d8',常見:'#9ce8f0',稀有:'#79d0b1',史詩:'#e9a6b0',傳說:'#ffe16b'};
  const ICONS = {fish:'🐟',shrimp:'🦐',crab:'🦀',angler:'🐡',mermaid:'🧜‍♀️',trash:'🗑️',letter:'🍾',squid:'🦑',jelly:'🪼',shell:'🐚',octopus:'🐙',whale:'🐋',treasure:'📦'};
  const STORAGE = {count:'coffeeShipCatchCount',best:'coffeeShipBestFish',dex:'coffeeShipFishDex',bag:'coffeeShipFishBag',letters:'coffeeShipBottleLetters'};

  let cooldownUntil = 0;
  let count = Number(localStorage.getItem(STORAGE.count) || 0);
  let best = readJson(STORAGE.best, null);
  let dex = readJson(STORAGE.dex, {});
  let bag = readJson(STORAGE.bag, []);
  let savedLetters = readJson(STORAGE.letters, []);

  function readJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
  function saveAll() {
    try {
      localStorage.setItem(STORAGE.count, String(count));
      localStorage.setItem(STORAGE.dex, JSON.stringify(dex));
      localStorage.setItem(STORAGE.bag, JSON.stringify(bag.slice(-220)));
      localStorage.setItem(STORAGE.letters, JSON.stringify(savedLetters.slice(-120)));
      if (best) localStorage.setItem(STORAGE.best, JSON.stringify(best));
    } catch {}
  }
  function isDeckOpen() { const api = window.COFFEE_SHIP_DECK; if (api?.isDeckOpen) return api.isDeckOpen(); const deck = document.getElementById('deckOverlay'); return !!deck && !deck.classList.contains('hidden'); }
  function coffeeEffect() { const effect = window.COFFEE_SHIP_COFFEE_EFFECT; return effect && effect.expiresAt > Date.now() ? effect : null; }
  function bonus(name, fallback=1) { const value = coffeeEffect()?.bonuses?.[name]; return Number.isFinite(Number(value)) ? Number(value) : fallback; }

  function cleanupRemovedUi() {
    document.getElementById('fishDexBtn')?.remove();
    const panel = document.getElementById('fishDexPanel');
    if (panel && !panel.querySelector('#backpackManagerRoot')) panel.remove();
    document.getElementById('fishingMotionCanvas')?.remove();
    document.getElementById('fishingMotionStyle')?.remove();
    document.body.classList.remove('fishing-motion-active','fishdex-open');
  }

  function addStyle() {
    if (document.getElementById('deckFishingStyle')) return;
    const style = document.createElement('style');
    style.id = 'deckFishingStyle';
    style.textContent = `
      #fishDexBtn,#fishingMotionCanvas{display:none!important}
      .fishing-card{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:40;background:rgba(21,16,32,.97);border:3px solid #d7bb79;border-radius:18px;padding:16px;color:#fff4d8;text-align:center;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.28);line-height:1.55;max-width:92%;pointer-events:none}
      .fishing-card.hidden{display:none!important}
      .letter-text{margin-top:10px;padding:10px;border:2px solid #76536a;border-radius:12px;background:#1a1220;color:#fff4d8;font-weight:800;line-height:1.65;text-align:left}
      @media(max-width:760px){.fishing-card{min-width:245px;max-width:88vw;max-height:54dvh;overflow:auto;font-size:14px;padding:13px}}
    `;
    document.head.appendChild(style);
  }

  function ensureUi() {
    const panel = document.getElementById('gamePanel');
    if (!panel) return;
    if (getComputedStyle(panel).position === 'static') panel.style.position = 'relative';
    if (!document.getElementById('fishingCard')) {
      const card = document.createElement('div');
      card.id = 'fishingCard';
      card.className = 'fishing-card hidden';
      panel.appendChild(card);
    }
    cleanupRemovedUi();
  }

  function chooseWeighted(map) { const total = Object.values(map).reduce((sum, value) => sum + value, 0); let roll = Math.random() * total; for (const [key, weight] of Object.entries(map)) { roll -= weight; if (roll <= 0) return key; } return Object.keys(map)[0]; }
  function chooseRarity() {
    const luck = Math.max(1, bonus('fishingLuck', 1));
    const weights = {...RARITY_WEIGHT};
    if (luck > 1) { weights.普通 /= luck; weights.常見 /= Math.sqrt(luck); weights.稀有 *= luck; weights.史詩 *= luck * 1.12; weights.傳說 *= luck * 1.28; }
    return chooseWeighted(weights);
  }
  function chooseQuality() {
    const qualityBonus = Math.max(0, bonus('qualityBonus', 0));
    if (qualityBonus > 0 && Math.random() < qualityBonus) { const boosted = QUALITY_TABLE.slice(2); return boosted[Math.floor(Math.random() * boosted.length)]; }
    const total = QUALITY_TABLE.reduce((sum, row) => sum + row[1], 0); let roll = Math.random() * total; for (const row of QUALITY_TABLE) { roll -= row[1]; if (roll <= 0) return row; } return QUALITY_TABLE[0];
  }
  function descriptorFor(item) { return window.COFFEE_SHIP_ICON?.iconDescriptor?.(item) || {base:ICONS[item.kind] || '🐟',badge:'✦',hue:190,color:COLORS[item.rarity] || '#fff4d8',key:item.name}; }
  function iconFor(item) { return descriptorFor(item).base; }
  function iconMarkup(item) { return window.COFFEE_SHIP_ICON?.iconHtml?.(item) || `<span class="unique-emoji">${iconFor(item)}</span>`; }
  function enrichItem(item) { const icon = descriptorFor(item); return {...item,icon:icon.base,emoji:icon.base,iconKey:icon.key,iconBadge:icon.badge,iconHue:icon.hue}; }
  function priceOf(item) { const rarity = {普通:2,常見:4,稀有:10,史詩:28,傳說:120}[item.rarity] || 2; const quality = {普通:1,優秀:1.4,完美:2,閃亮:3.5,神話:6}[item.quality] || 1; return Math.max(1, Math.round((item.weight || .1) * rarity * quality * (item.coffeePearlBonus || 1))); }
  function pickLetter() { return LETTERS[Math.floor(Math.random() * LETTERS.length)]; }

  function showCard(item) {
    const card = document.getElementById('fishingCard');
    if (!card) return;
    const color = COLORS[item.rarity] || '#fff4d8';
    const effectText = item.coffeeEffectName ? `<br>咖啡加成：${item.coffeeEffectName}` : '';
    if (item.kind === 'letter') {
      const displayItem = {...item,name:item.letterTitle || item.name};
      card.innerHTML = `<div style="font-size:22px;color:${color}">${iconMarkup(displayItem)}<span>${item.letterTitle || item.name}</span></div><div>海域：${item.zone}<br>稀有度：${item.rarity}<br>已讀信件：${savedLetters.length}${effectText}</div><div class="letter-text">${item.letter}</div>`;
    } else {
      const value = item.kind === 'trash' ? '不可販售' : `${priceOf(item)} 珍珠`;
      card.innerHTML = `<div style="font-size:22px;color:${color}">${iconMarkup(item)}<span>${item.quality} ${item.name}</span></div><div>海域：${item.zone}<br>稀有度：${item.rarity}<br>重量：${item.weight.toFixed(2)} kg<br>價值：${value}${effectText}</div>`;
    }
    card.classList.remove('hidden');
    window.dispatchEvent(new CustomEvent('coffee-ship:fishing-result',{detail:{item}}));
    setTimeout(() => card.classList.add('hidden'), item.kind === 'letter' ? 7600 : 4200);
  }

  function selectCatch() {
    const bottleLuck = Math.max(0, bonus('bottleLuck', 0));
    if (bottleLuck > 0 && Math.random() < bottleLuck) { const letters = CATCHES.filter(row => row[5] === 'letter'); return letters[Math.floor(Math.random() * letters.length)]; }
    const rarity = chooseRarity();
    const pool = CATCHES.filter(row => row[2] === rarity);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function catchOne() {
    const row = selectCatch();
    const quality = chooseQuality();
    const weight = (row[3] + Math.pow(Math.random(), 1.65) * (row[4] - row[3])) * quality[2];
    const effect = coffeeEffect();
    let item = {name:row[0],zone:row[1],rarity:row[2],quality:quality[0],weight,kind:row[5],at:Date.now(),coffeePearlBonus:Math.max(1,bonus('pearlBonus',1)),coffeeEffectName:effect?.name || ''};
    if (item.kind === 'letter') { const letter = pickLetter(); item.letterTitle = letter.title; item.letter = letter.text; savedLetters.push({title:letter.title,text:letter.text,at:Date.now()}); }
    item = enrichItem(item);
    count += 1;
    dex[item.name] = Math.max(dex[item.name] || 0, Number(item.weight.toFixed(2)));
    if (item.kind !== 'letter') bag.push(item);
    if (item.kind !== 'trash' && item.kind !== 'letter' && (!best || item.weight > best.weight)) best = item;
    saveAll();
    showCard(item);
    return item;
  }

  function startFishing() {
    if (!isDeckOpen() || Date.now() < cooldownUntil) return false;
    cooldownUntil = Date.now() + 700;
    catchOne();
    return true;
  }

  function blockRemovedDex(event) {
    const key = event.key?.length === 1 ? event.key.toLowerCase() : event.key;
    if (isDeckOpen() && key === 'g') { event.preventDefault(); event.stopImmediatePropagation(); }
  }

  function bind() {
    window.addEventListener('keydown', event => {
      const key = event.key?.length === 1 ? event.key.toLowerCase() : event.key;
      if (!isDeckOpen()) return;
      if (key === 'f' || key === 'c') { event.preventDefault(); event.stopImmediatePropagation(); startFishing(); }
    }, true);
    window.addEventListener('keydown', blockRemovedDex, true);
    document.addEventListener('click', event => {
      if (event.target.closest?.('#fishDexBtn')) { event.preventDefault(); event.stopImmediatePropagation(); cleanupRemovedUi(); }
    }, true);
    document.getElementById('coffeeBtn')?.addEventListener('click', event => {
      if (!isDeckOpen()) return;
      event.preventDefault();
      event.stopPropagation();
      startFishing();
    }, true);
  }

  function init() {
    addStyle();
    ensureUi();
    bind();
    cleanupRemovedUi();
    const observer = new MutationObserver(cleanupRemovedUi);
    observer.observe(document.body,{subtree:true,childList:true});
    window.COFFEE_SHIP_FISHING_API = {startFishing,catchOne,animation:false,fishDex:false};
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();