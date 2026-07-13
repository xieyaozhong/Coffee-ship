(() => {
  'use strict';
  if (window.__COFFEE_SHIP_ITEM_PIXEL_ICONS_V1__) return;
  window.__COFFEE_SHIP_ITEM_PIXEL_ICONS_V1__ = true;

  const SIZE = 24;
  const RARITY_COLOR = {
    普通:'#d9d2bd',常見:'#75d982',稀有:'#62c8ff',史詩:'#c084fc',傳說:'#ffe16b',神話:'#ff7fa1',世界級:'#9fffee'
  };
  const SERIES_BY_STORE = {
    coffeeShipMermaidLyrics:'mermaid-lyrics',
    coffeeShipSailorLogLetters:'sailor-log',
    coffeeShipBottleLetters:'meme-bottle',
    coffeeShipLanarLetters:'lanar-bottle',
    coffeeShipArielLetters:'ariel-bottle',
    coffeeShipIslandLetters:'coco-bottle',
    coffeeShipBlackbeardLetters:'blackbeard-map',
    coffeeShipMadPriestLetters:'mad-priest-pages',
    coffeeShipCarnivalLetters:'carnival-bottle',
    coffeeShipTurtleSoupLetters:'turtle-soup'
  };
  const SERIES_RULES = [
    [/美人魚歌詞|mermaid.?lyrics/i,'mermaid-lyrics'],
    [/晨星號|水手航海日誌|sailor.?log/i,'sailor-log'],
    [/迷因百科|冷笑話漂流瓶|cold.?joke|\bjoke\b/i,'meme-bottle'],
    [/拉納爾|lanar/i,'lanar-bottle'],
    [/愛麗兒|ariel/i,'ariel-bottle'],
    [/可可漂流瓶|孤島三角戀|\bcoco\b|\bisland\b/i,'coco-bottle'],
    [/黑鬍子|blackbeard|藏寶圖/i,'blackbeard-map'],
    [/瘋狂神父|mad.?priest|神父殘頁/i,'mad-priest-pages'],
    [/狂歡島漂流瓶|carnival.?bottle/i,'carnival-bottle'],
    [/海龜湯|turtle.?soup/i,'turtle-soup']
  ];
  const canvasCache = new Map();
  const dataUrlCache = new Map();

  function hashOf(value) {
    let hash = 2166136261;
    for (const character of String(value || 'unknown-item')) {
      hash ^= character.codePointAt(0);
      hash = Math.imul(hash,16777619);
    }
    return hash >>> 0;
  }

  function cleanEmoji(value) {
    return String(value || '').replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u,'').trim();
  }

  function normalizeName(value) {
    return (cleanEmoji(value || '未知物品')
      .replace(/^(普通|優秀|完美|閃亮|神話|變異|祝福|拾獲|遺失物)\s+/,'')
      .normalize('NFC').replace(/\s+/g,' ').trim() || '未知物品');
  }

  function canonicalSeries(item = {}) {
    const explicitKeys = [item.seriesKey,item.storageKey,item.storeKey,item.key];
    for (const key of explicitKeys) {
      if (SERIES_BY_STORE[key]) return SERIES_BY_STORE[key];
    }
    const alias = String(item.v2id || item.storyId || '');
    const aliasMap = {
      joke:'meme-bottle',meme:'meme-bottle',lanar:'lanar-bottle',ariel:'ariel-bottle',island:'coco-bottle',coco:'coco-bottle',
      blackbeard:'blackbeard-map',mad_priest:'mad-priest-pages',priest:'mad-priest-pages',carnival:'carnival-bottle',
      turtle_soup:'turtle-soup',turtle:'turtle-soup',mermaid_lyrics:'mermaid-lyrics',sailor_log:'sailor-log'
    };
    if (aliasMap[alias]) return aliasMap[alias];
    const kind = String(item.kind || '').toLowerCase();
    const group = String(item.group || '').toLowerCase();
    const isLetter = kind === 'letter' || kind === 'bottle' || /letter|story/.test(group) || !!(item.series || item.storySeries || item.storageKey || item.storeKey);
    if (!isLetter) return '';
    const signature = `${item.series || ''} ${item.collection || ''} ${item.storySeries || ''} ${item.title || ''} ${item.name || ''}`;
    const recognized = SERIES_RULES.find(([pattern]) => pattern.test(signature));
    if (recognized) return recognized[1];
    const rawSeries = normalizeName(item.series || item.collection || item.storySeries || item.title || item.name || '其他漂流信件')
      .replace(/(?:第\s*)?[0-9０-９一二三四五六七八九十百]+\s*(?:封|篇|章|話|頁|部)?$/,'')
      .replace(/[#｜|·・:\-]\s*[0-9０-９]+$/,'')
      .trim();
    return `custom-${rawSeries || 'letters'}`;
  }

  function keyOf(item = {}) {
    const series = canonicalSeries(item);
    if (series) return `series:${series}`;
    return `item:${normalizeName(item.name || item.title || item.id || item.iconId)}`;
  }

  function isItem(item = {}) {
    if (!item || String(item.kind || '').toLowerCase() === 'currency') return false;
    return !window.COFFEE_SHIP_FISH_ICONS?.isBiological?.(item);
  }

  function familyOf(item = {}) {
    const series = canonicalSeries(item);
    if (series === 'blackbeard-map') return 'map';
    if (series === 'mad-priest-pages') return 'scroll';
    if (series === 'sailor-log' || series === 'turtle-soup') return 'book';
    if (series) return 'bottle';
    const name = normalizeName(`${item.name || ''} ${item.title || ''} ${item.category || ''} ${item.quality || ''}`);
    const kind = String(item.kind || '').toLowerCase();
    const group = String(item.group || '').toLowerCase();
    if (kind === 'trash' || /垃圾|塑膠|瓶蓋|破吸管|破布|廢棄|腐爛/.test(name)) return 'trash';
    if (/藏寶圖|海圖|星圖|地圖|航線圖/.test(name)) return 'map';
    if (/殘頁|卷軸|契約|羊皮紙|手札|紙條/.test(name)) return 'scroll';
    if (/日誌|筆記|百科|故事|書|歌詞|唱片/.test(name)) return 'book';
    if (/寶箱|貨箱|木箱|打撈箱|箱子/.test(name)) return 'chest';
    if (/面具/.test(name)) return 'mask';
    if (/王冠|皇冠|后冠|冠冕/.test(name)) return 'crown';
    if (/帽|頭巾|髮飾/.test(name)) return 'hat';
    if (/鞋|長靴|高跟/.test(name)) return 'shoes';
    if (/手套|拳套/.test(name)) return 'gloves';
    if (/衣|服|襯衫|披風|短褲|裙|圍巾|襪|絲帶|布料/.test(name)) return 'clothes';
    if (/氣球|悠悠球|風箏|木馬|玩偶|骰子|撲克|紙牌|雜耍球|彩罐|沙鈴/.test(name)) return 'toy';
    if (/小提琴|樂器|喇叭|鋼琴|音樂盒|鼓|笛|琴/.test(name)) return 'instrument';
    if (/戒指|項鍊|耳環|腳環|胸針|吊墜|首飾|珠鍊/.test(name)) return 'jewelry';
    if (/寶石|鑽石|水晶|晶體|晶核|珍珠|星核/.test(name)) return 'gem';
    if (/金幣|銀幣|古幣|硬幣|紀念幣|錢袋/.test(name)) return 'coin';
    if (/羅盤|導航|星盤|指南針/.test(name)) return 'compass';
    if (/鑰匙|key/i.test(name)) return 'key';
    if (/懷錶|時計|鐘錶|手錶/.test(name)) return 'clock';
    if (/沙漏/.test(name)) return 'hourglass';
    if (/船錨|錨鏈|錨/.test(name)) return 'anchor';
    if (/刀|劍|槍|鉤|權杖|鐮刀|牙|刺|砲/.test(name)) return 'weapon';
    if (kind === 'tool' || /工具|釣竿|捕獵網|封印匣|束縛燈|鎖鏈/.test(name)) return 'tool';
    if (/燈|燈籠|船燈|提燈/.test(name)) return 'lamp';
    if (/鈴/.test(name)) return 'bell';
    if (/骨|化石|甲片|殼|鱗|觸鬚|羽毛|前肢|視網膜/.test(name)) return 'material';
    if (/珊瑚|花|海草|種子|樹葉|藻/.test(name)) return 'nature';
    if (/藥|藥水|毒液|香水|墨汁|墨囊/.test(name)) return 'potion';
    if (/咖啡|杯|茶|湯|糖|餅|食物|料理/.test(name)) return 'food';
    if (/票|券|徽章|勳章|封印|護符/.test(name)) return 'badge';
    if (/瓶|罐|壺|匣/.test(name)) return 'container';
    if (kind === 'treasure' || /treasure|collection|relic/.test(group)) return 'relic';
    return 'parcel';
  }

  function hsl(hue,saturation,lightness) {
    return `hsl(${Math.round(hue)} ${saturation}% ${lightness}%)`;
  }

  function descriptor(item = {}) {
    const key = keyOf(item);
    const hash = hashOf(key);
    const hue = hash % 360;
    const secondary = (hue + 42 + ((hash >>> 8) % 128)) % 360;
    const rarity = item.rarity || '普通';
    return {
      key,
      hash,
      signature:hash.toString(16).padStart(8,'0'),
      family:familyOf(item),
      series:canonicalSeries(item),
      rarity,
      rarityColor:RARITY_COLOR[rarity] || RARITY_COLOR.普通,
      body:hsl(hue,58 + ((hash >>> 5) % 24),44 + ((hash >>> 15) % 17)),
      light:hsl(hue,72,72 + ((hash >>> 19) % 10)),
      deep:hsl(hue,56,20 + ((hash >>> 22) % 14)),
      accent:hsl(secondary,78,58 + ((hash >>> 25) % 13)),
      variant:(hash >>> 10) % 4
    };
  }

  function makePainter(context) {
    return (x,y,width = 1,height = 1,color = '#fff') => {
      context.fillStyle = color;
      context.fillRect(Math.round(x),Math.round(y),Math.round(width),Math.round(height));
    };
  }

  function signature(px,d) {
    [[3,21],[6,21],[9,21],[12,21],[15,21],[18,21],[21,21],[2,18]].forEach(([x,y],index) => {
      px(x,y,1,1,(d.hash >>> index) & 1 ? d.accent : d.light);
    });
  }

  function bottle(px,d) {
    px(9,2,6,4,d.deep); px(7,5,10,3,d.deep); px(5,8,14,12,d.deep); px(7,20,10,2,d.deep);
    px(10,3,4,3,d.accent); px(8,6,8,3,d.body); px(6,9,12,10,d.body); px(8,19,8,2,d.light);
    px(8,11,8,6,'#efe0b2'); px(9,12,6,1,d.accent); px(9,14,5,1,d.deep); px(15,5,1,3,d.light);
  }

  function book(px,d) {
    px(3,4,18,17,d.deep); px(5,5,7,15,d.body); px(12,5,7,15,d.accent); px(11,5,2,15,d.deep);
    px(6,8,4,1,d.light); px(14,8,4,1,d.light); px(6,11,4,1,d.deep); px(14,11,4,1,d.deep); px(6,17,4,1,d.light); px(14,17,4,1,d.light);
  }

  function scroll(px,d) {
    px(4,3,16,4,d.deep); px(6,6,12,14,d.deep); px(4,19,16,3,d.deep); px(5,4,14,2,d.accent); px(7,6,10,13,'#e7d0a3'); px(5,20,14,1,d.accent);
    px(9,9,6,1,d.deep); px(9,12,7,1,d.body); px(9,15,5,1,d.deep);
  }

  function map(px,d) {
    px(2,5,20,15,d.deep); px(3,6,6,13,'#dfc58d'); px(9,6,6,13,'#ead9a8'); px(15,6,6,13,'#d9bb7b');
    px(8,6,2,13,d.body); px(14,6,2,13,d.accent); px(17,9,2,2,d.deep); px(18,8,1,4,d.deep); px(5,15,3,1,d.accent); px(6,14,1,3,d.accent);
  }

  function chest(px,d) {
    px(3,7,18,14,d.deep); px(4,8,16,5,d.body); px(4,14,16,6,d.accent); px(3,12,18,3,d.deep); px(10,12,4,6,d.light); px(11,14,2,2,d.deep); px(5,5,14,3,d.deep); px(7,4,10,2,d.body);
  }

  function mask(px,d) {
    px(3,6,18,11,d.deep); px(5,5,14,14,d.body); px(2,8,4,6,d.accent); px(18,8,4,6,d.accent); px(7,9,4,3,'#11101a'); px(14,9,4,3,'#11101a'); px(9,15,6,2,d.light);
  }

  function clothes(px,d) {
    px(7,3,10,5,d.deep); px(3,5,7,6,d.deep); px(14,5,7,6,d.deep); px(6,7,12,15,d.deep); px(8,5,8,4,d.light); px(4,6,5,4,d.body); px(15,6,5,4,d.body); px(7,8,10,13,d.body); px(11,9,2,11,d.accent);
  }

  function hat(px,d) { px(7,3,10,3,d.deep); px(5,5,14,9,d.deep); px(7,6,10,7,d.body); px(2,13,20,4,d.deep); px(4,14,16,2,d.accent); px(9,8,6,2,d.light); }
  function shoes(px,d) { px(4,5,6,12,d.deep); px(3,15,9,5,d.deep); px(6,6,3,9,d.body); px(4,16,7,3,d.accent); px(14,5,6,12,d.deep); px(12,15,9,5,d.deep); px(15,6,3,9,d.body); px(13,16,7,3,d.accent); }
  function gloves(px,d) { px(4,4,7,16,d.deep); px(5,5,5,11,d.body); px(2,7,3,6,d.accent); px(9,6,3,7,d.accent); px(13,4,7,16,d.deep); px(14,5,5,11,d.body); px(19,7,3,6,d.accent); px(12,6,3,7,d.accent); }

  function toy(px,d) { px(4,4,16,16,d.deep); px(6,6,12,12,d.body); px(8,8,3,3,d.light); px(14,8,3,3,d.light); px(9,14,7,2,d.accent); px(2,10,3,4,d.accent); px(19,10,3,4,d.accent); }
  function instrument(px,d) { px(8,2,8,5,d.deep); px(6,6,12,12,d.deep); px(8,8,8,8,d.body); px(10,4,4,4,d.accent); px(11,9,2,8,d.light); px(11,17,2,5,d.deep); px(4,10,3,4,d.accent); px(17,10,3,4,d.accent); }
  function jewelry(px,d) { px(9,2,6,4,d.accent); px(6,5,12,3,d.deep); px(4,8,4,9,d.deep); px(16,8,4,9,d.deep); px(7,16,10,5,d.deep); px(6,9,2,7,d.body); px(16,9,2,7,d.body); px(9,17,6,3,d.accent); px(11,18,2,2,d.light); }
  function crown(px,d) { px(3,5,4,7,d.deep); px(9,3,4,9,d.deep); px(17,5,4,7,d.deep); px(4,10,16,10,d.deep); px(5,11,14,7,d.body); px(6,6,2,6,d.accent); px(10,4,2,8,d.light); px(18,6,2,6,d.accent); px(5,17,14,2,d.accent); }
  function gem(px,d) { px(8,2,8,3,d.deep); px(4,5,16,6,d.deep); px(6,11,12,9,d.deep); px(9,20,6,2,d.deep); px(9,4,6,2,d.light); px(6,6,12,4,d.body); px(8,11,8,8,d.accent); px(11,7,2,11,'#fff'); }
  function coin(px,d) { px(7,3,10,2,d.deep); px(4,5,16,14,d.deep); px(7,19,10,2,d.deep); px(5,7,14,10,d.body); px(7,5,10,2,d.accent); px(7,17,10,2,d.accent); px(10,8,4,8,d.light); px(8,10,8,4,d.light); px(10,10,4,4,d.body); }
  function compass(px,d) { px(7,2,10,3,d.deep); px(4,5,16,16,d.deep); px(6,7,12,12,'#d8eadf'); px(11,4,2,3,d.accent); px(11,8,2,8,d.deep); px(8,11,8,2,d.deep); px(12,8,4,4,d.body); px(8,12,4,4,d.accent); }
  function key(px,d) { px(3,4,9,9,d.deep); px(5,6,5,5,d.body); px(10,10,11,4,d.deep); px(12,11,8,2,d.accent); px(17,13,3,5,d.deep); px(14,13,3,3,d.deep); px(6,7,3,3,d.light); }
  function clock(px,d) { px(8,2,8,3,d.deep); px(5,5,14,16,d.deep); px(7,7,10,12,'#e9e0c5'); px(11,4,2,3,d.accent); px(11,8,2,6,d.deep); px(12,13,4,2,d.deep); px(8,17,8,2,d.body); }
  function hourglass(px,d) { px(5,2,14,4,d.deep); px(7,6,10,5,d.body); px(9,11,6,2,d.deep); px(7,13,10,5,d.body); px(5,18,14,4,d.deep); px(8,7,8,2,d.light); px(9,15,6,2,d.accent); }
  function anchor(px,d) { px(10,2,4,15,d.deep); px(7,5,10,3,d.deep); px(3,13,4,6,d.deep); px(17,13,4,6,d.deep); px(5,18,14,3,d.deep); px(11,4,2,12,d.body); px(8,6,8,1,d.accent); px(6,17,12,2,d.body); }
  function weapon(px,d) { px(14,2,5,4,d.deep); px(6,11,11,4,d.deep); px(3,17,6,4,d.deep); px(15,4,2,8,d.light); px(8,12,8,2,d.body); px(4,18,5,2,d.accent); px(10,14,3,4,d.deep); }
  function tool(px,d) { px(3,4,7,7,d.deep); px(6,9,12,12,d.deep); px(4,5,5,5,d.body); px(8,10,3,3,d.accent); px(10,12,7,8,d.body); px(14,3,5,9,d.deep); px(15,4,3,7,d.light); }
  function lamp(px,d) { px(9,2,6,3,d.deep); px(6,5,12,14,d.deep); px(8,7,8,10,d.body); px(10,8,4,8,'#ffe88f'); px(5,18,14,4,d.deep); px(8,19,8,2,d.accent); px(10,3,4,3,d.body); }
  function bell(px,d) { px(9,2,6,4,d.deep); px(6,5,12,12,d.deep); px(4,15,16,4,d.deep); px(8,6,8,9,d.body); px(6,16,12,2,d.accent); px(10,18,4,4,d.deep); px(11,19,2,2,d.light); }
  function material(px,d) { px(8,3,8,3,d.deep); px(5,6,14,5,d.deep); px(3,11,18,8,d.deep); px(6,19,12,3,d.deep); px(7,7,10,3,d.body); px(5,12,14,6,d.body); px(8,18,8,2,d.accent); px(9,9,2,7,d.light); px(14,11,2,6,d.accent); }
  function nature(px,d) { px(11,2,3,20,d.deep); px(4,4,8,7,d.deep); px(13,6,8,8,d.deep); px(5,5,6,5,d.body); px(14,7,6,6,d.accent); px(8,13,5,6,d.deep); px(9,14,3,4,d.light); }
  function potion(px,d) { px(9,2,6,5,d.deep); px(6,6,12,4,d.deep); px(4,10,16,11,d.deep); px(7,7,10,4,d.light); px(5,12,14,8,d.body); px(7,14,10,5,d.accent); px(10,15,2,2,'#fff'); }
  function food(px,d) { px(7,3,10,5,d.deep); px(5,7,14,12,d.deep); px(7,8,10,9,d.body); px(8,4,8,3,d.accent); px(8,11,8,2,d.light); px(3,9,3,8,d.deep); px(18,9,3,8,d.deep); px(7,18,10,3,d.deep); }
  function badge(px,d) { px(7,2,10,5,d.deep); px(5,6,14,12,d.deep); px(7,8,10,8,d.body); px(9,4,6,4,d.accent); px(10,9,4,6,d.light); px(8,11,8,2,d.light); px(7,17,4,5,d.deep); px(13,17,4,5,d.deep); }
  function container(px,d) { px(7,3,10,4,d.deep); px(5,6,14,15,d.deep); px(7,7,10,13,d.body); px(8,4,8,3,d.accent); px(8,10,8,7,d.light); px(9,12,6,3,d.accent); }
  function relic(px,d) { px(5,3,14,19,d.deep); px(7,5,10,15,d.body); px(9,7,6,4,d.accent); px(8,13,8,5,d.light); px(10,14,4,3,d.deep); px(3,8,3,9,d.accent); px(18,8,3,9,d.accent); }
  function trash(px,d) { px(6,5,12,17,d.deep); px(8,7,8,13,d.body); px(4,3,16,4,d.deep); px(8,2,8,2,d.accent); px(9,9,2,8,d.light); px(13,8,2,10,d.accent); px(5,20,14,2,d.deep); }
  function parcel(px,d) { px(3,6,18,16,d.deep); px(5,8,14,12,d.body); px(10,7,4,14,d.accent); px(4,11,16,3,d.deep); px(6,3,5,5,d.deep); px(13,3,5,5,d.deep); px(8,4,3,3,d.light); px(13,4,3,3,d.light); }

  const DRAWERS = {bottle,book,scroll,map,chest,mask,clothes,hat,shoes,gloves,toy,instrument,jewelry,crown,gem,coin,compass,key,clock,hourglass,anchor,weapon,tool,lamp,bell,material,nature,potion,food,badge,container,relic,trash,parcel};

  function renderCanvas(item = {}) {
    const d = descriptor(item);
    if (canvasCache.has(d.key)) return canvasCache.get(d.key);
    if (typeof document === 'undefined' || !document.createElement) return null;
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    canvas.setAttribute('aria-hidden','true');
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.imageSmoothingEnabled = false;
    context.clearRect(0,0,SIZE,SIZE);
    const px = makePainter(context);
    (DRAWERS[d.family] || parcel)(px,d);
    signature(px,d);
    canvasCache.set(d.key,canvas);
    return canvas;
  }

  function dataUrl(item = {}) {
    const d = descriptor(item);
    if (dataUrlCache.has(d.key)) return dataUrlCache.get(d.key);
    const canvas = renderCanvas(item);
    if (!canvas?.toDataURL) return '';
    let url = '';
    try { url = canvas.toDataURL('image/png'); } catch {}
    if (url) dataUrlCache.set(d.key,url);
    return url;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g,character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  }

  function iconHtml(item = {},className = '') {
    if (!isItem(item)) return '';
    const d = descriptor(item);
    const src = dataUrl(item);
    if (!src) return '';
    return `<span class="cs-species-icon cs-item-pixel-icon ${escapeHtml(className)}" data-icon-key="${escapeHtml(d.key)}" data-item-key="${escapeHtml(d.key)}" data-family="${escapeHtml(d.family)}" data-rarity="${escapeHtml(d.rarity)}" data-item="true" style="--item-rarity:${escapeHtml(d.rarityColor)}" aria-hidden="true"><img class="cs-item-pixel-sprite" src="${src}" alt="" width="24" height="24" draggable="false"></span>`;
  }

  function draw(context,item,x,y,size = 48) {
    const source = renderCanvas(item);
    if (!source || !context) return false;
    context.save();
    context.imageSmoothingEnabled = false;
    context.drawImage(source,Math.round(x),Math.round(y),Math.round(size),Math.round(size));
    context.restore();
    return true;
  }

  function rarityFrom(element) {
    return element?.closest('.bp-card,.story-series,.sm-offer,.aa-lot,.ofq-reward,.sq-reward')?.textContent?.match(/(世界級|神話|傳說|史詩|稀有|常見|普通)/)?.[1] || '普通';
  }

  function decorateBackpack(root) {
    root.querySelectorAll?.('.bp-title').forEach(title => {
      if (title.querySelector('.cs-fish-pixel-icon,.cs-item-pixel-icon')) return;
      const children = [...title.children];
      const icon = children[0];
      const name = normalizeName(children[1]?.textContent || title.textContent);
      if (!icon || window.COFFEE_SHIP_FISH_ICONS?.isBiological?.({name})) return;
      const card = title.closest('.bp-card');
      const series = card?.textContent?.match(/系列：\s*([^\n]+)/)?.[1] || card?.closest('[data-story-name]')?.dataset.storyName || '';
      const html = iconHtml({name,series,kind:series ? 'letter' : 'treasure',rarity:rarityFrom(title)},'bp-item-icon');
      if (html) icon.outerHTML = html;
    });
    root.querySelectorAll?.('.story-series-icon').forEach(icon => {
      if (icon.querySelector('.cs-item-pixel-icon')) return;
      const series = icon.closest('[data-story-name]')?.dataset.storyName || icon.parentElement?.textContent || '其他漂流信件';
      icon.innerHTML = iconHtml({series,name:series,kind:'letter',rarity:rarityFrom(icon)},'story-series-pixel-icon');
    });
    root.querySelectorAll?.('.story-letter-icon').forEach(icon => {
      if (icon.querySelector('.cs-item-pixel-icon')) return;
      const series = icon.closest('[data-story-name]')?.dataset.storyName || icon.closest('.story-series')?.querySelector('.story-series-main strong')?.textContent || '其他漂流信件';
      icon.innerHTML = iconHtml({series,name:series,kind:'letter',rarity:rarityFrom(icon)},'story-letter-pixel-icon');
    });
    root.querySelectorAll?.('.mermaid-lyrics-heading>span:first-child,.sailor-log-heading>span:first-child').forEach(heading => {
      if (heading.querySelector('.cs-item-pixel-icon')) return;
      const series = normalizeName(heading.textContent || '其他漂流信件');
      const html = iconHtml({name:series,series,kind:'letter',rarity:rarityFrom(heading)},'story-series-pixel-icon');
      if (html) heading.innerHTML = `${html}<span>${escapeHtml(series)}</span>`;
    });
  }

  function decorateOffers(root) {
    root.querySelectorAll?.('.sm-offer-icon,.aa-lot-icon').forEach(icon => {
      if (icon.querySelector('.cs-item-pixel-icon')) return;
      const card = icon.closest('.sm-offer,.aa-lot');
      const name = card?.querySelector('h4')?.textContent || '未知物品';
      const category = card?.querySelector('.sm-kind')?.textContent || '';
      const html = iconHtml({name,category,kind:'treasure',rarity:rarityFrom(icon)},'event-item-pixel-icon');
      if (html) icon.innerHTML = html;
    });
    root.querySelectorAll?.('.aa-result-icon').forEach(icon => {
      if (icon.querySelector('.cs-item-pixel-icon')) return;
      const result = icon.closest('.aa-result');
      const name = normalizeName(result?.querySelector('strong')?.textContent?.split('［')[0] || '拍賣收藏品');
      const html = iconHtml({name,kind:'treasure',rarity:rarityFrom(icon)},'event-item-pixel-icon');
      if (html) icon.innerHTML = html;
    });
  }

  function decorateRewardRows(root) {
    root.querySelectorAll?.('.ofq-reward strong,.sq-reward strong').forEach(line => {
      if (line.querySelector('.cs-item-pixel-icon,.cs-fish-pixel-icon')) return;
      const raw = cleanEmoji(line.textContent || '');
      const name = normalizeName(raw.split('［')[0]);
      if (window.COFFEE_SHIP_FISH_ICONS?.isBiological?.({name})) return;
      const html = iconHtml({name,kind:'treasure',rarity:rarityFrom(line)},'reward-item-pixel-icon');
      if (html) line.innerHTML = `${html}<span>${escapeHtml(raw)}</span>`;
    });
  }

  function decorateSpecialResults(root) {
    root.querySelectorAll?.('.cr-result.win').forEach(result => {
      if (result.querySelector('.cs-item-pixel-icon')) return;
      const name = result.textContent?.match(/「([^」]+)」/)?.[1];
      if (!name || !/限定掉落物|限定收藏品/.test(result.textContent || '')) return;
      const html = iconHtml({name,kind:'treasure',rarity:rarityFrom(result)},'event-item-pixel-icon');
      if (html) result.innerHTML = `<span class="item-result-line">${html}<span>${result.innerHTML}</span></span>`;
    });
    root.querySelectorAll?.('.carnival-title').forEach(title => {
      if (title.querySelector('.cs-item-pixel-icon')) return;
      const name = title.parentElement?.querySelector('.carnival-text')?.textContent?.match(/釣到了：([^\n]+)/)?.[1]?.trim();
      if (!name) return;
      const html = iconHtml({name,kind:'treasure',rarity:'稀有'},'event-item-pixel-icon');
      if (html) title.innerHTML = `${html}<span>${escapeHtml(title.textContent || '狂歡島遺失物')}</span>`;
    });
  }

  function decorate(root = document) {
    decorateBackpack(root);
    decorateOffers(root);
    decorateRewardRows(root);
    decorateSpecialResults(root);
  }

  function addStyle() {
    if (document.getElementById('coffeeShipItemPixelIconStyle')) return;
    const style = document.createElement('style');
    style.id = 'coffeeShipItemPixelIconStyle';
    style.textContent = `
      .cs-item-pixel-icon{position:relative!important;display:inline-grid!important;place-items:center!important;width:2.42em!important;height:2.42em!important;min-width:2.42em!important;margin:0 .42em 0 0!important;padding:.16em!important;overflow:visible!important;border:2px solid color-mix(in srgb,var(--item-rarity) 74%,#fff 26%)!important;border-radius:.58em!important;background:linear-gradient(180deg,rgba(39,31,43,.98),rgba(18,14,25,.98))!important;box-shadow:0 4px 0 rgba(0,0,0,.34),inset 0 0 0 1px rgba(255,255,255,.07),0 0 14px color-mix(in srgb,var(--item-rarity) 24%,transparent)!important;transform:none!important;filter:none!important;box-sizing:border-box!important;vertical-align:middle!important;pointer-events:none!important}
      .cs-item-pixel-icon::before{content:''!important;position:absolute!important;inset:2px!important;border-radius:.38em!important;background:linear-gradient(135deg,rgba(255,255,255,.08),transparent 48%)!important;pointer-events:none!important}.cs-item-pixel-icon::after{display:none!important}
      .cs-item-pixel-sprite{display:block;width:100%;height:100%;object-fit:contain;image-rendering:pixelated;image-rendering:crisp-edges;filter:drop-shadow(0 2px 0 rgba(0,0,0,.34));user-select:none}
      .cs-item-pixel-icon .cs-species-rarity-gem{left:-.28em;top:-.3em;background:#18121e;border-color:var(--item-rarity);color:var(--item-rarity)}
      .bp-title>.cs-item-pixel-icon{font-size:18px;flex:0 0 auto;margin-right:2px!important}.story-series-icon>.cs-item-pixel-icon,.story-letter-icon>.cs-item-pixel-icon{font-size:17px;margin:0!important}.story-series-icon,.story-letter-icon{display:grid;place-items:center}
      .sm-offer-icon>.cs-item-pixel-icon,.aa-lot-icon>.cs-item-pixel-icon{font-size:27px;margin:0 auto!important}.aa-result-icon>.cs-item-pixel-icon{font-size:31px;margin:0 auto!important}
      .ofq-reward strong,.sq-reward strong{display:flex;align-items:center;gap:7px}.ofq-reward .cs-item-pixel-icon,.sq-reward .cs-item-pixel-icon{font-size:16px;margin:0!important}
      .item-result-line,.carnival-title:has(.cs-item-pixel-icon){display:flex;align-items:center;justify-content:center;gap:8px}.item-result-line>.cs-item-pixel-icon,.carnival-title>.cs-item-pixel-icon{font-size:18px;margin:0!important}
      .bp-card:hover .cs-item-pixel-icon,.sm-offer:hover .cs-item-pixel-icon,.aa-lot:hover .cs-item-pixel-icon{transform:translateY(-1px)!important;filter:brightness(1.08)!important}
      @supports not (color:color-mix(in srgb,red,blue)){.cs-item-pixel-icon{border-color:var(--item-rarity)!important}}
      @media(max-width:760px){.cs-item-pixel-icon{width:2.22em!important;height:2.22em!important;min-width:2.22em!important}.bp-title>.cs-item-pixel-icon{font-size:16px}}
    `;
    document.head.appendChild(style);
  }

  function patchSharedApi() {
    const api = window.COFFEE_SHIP_ICON;
    if (!api || api.__itemPixelsV1) return;
    const previousHtml = api.iconHtml?.bind(api);
    api.iconHtml = (item,className = '') => isItem(item) ? iconHtml(item,className) : previousHtml?.(item,className) || '';
    api.itemPixelIconHtml = iconHtml;
    api.itemPixelDataUrl = dataUrl;
    api.__itemPixelsV1 = true;
  }

  function init() {
    addStyle();
    patchSharedApi();
    decorate();
    const observer = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === 1) decorate(node.matches?.('#backpackPanel,.sm-offer,.aa-lot,.aa-result,.ofq-reward,.sq-reward,.cr-result,.carnival-title') ? node.parentElement || node : node);
        }
      }
    });
    observer.observe(document.body,{subtree:true,childList:true});
  }

  window.COFFEE_SHIP_ITEM_PIXEL_ICONS = {version:1,size:SIZE,descriptor,familyOf,isItem,keyOf,canonicalSeries,dataUrl,iconHtml,draw,renderCanvas,decorate,hashOf};

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
