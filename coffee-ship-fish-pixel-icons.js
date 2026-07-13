(() => {
  'use strict';
  if (window.__COFFEE_SHIP_FISH_PIXEL_ICONS_V1__) return;
  window.__COFFEE_SHIP_FISH_PIXEL_ICONS_V1__ = true;

  const SIZE = 24;
  const BIOLOGICAL_KINDS = new Set([
    'fish','shark','shrimp','crab','lobster','angler','squid','jelly','shell','octopus','whale','mutant'
  ]);
  const NON_BIOLOGICAL_KINDS = new Set([
    'trash','letter','bottle','treasure','item','relic','toy','mask','clothes','accessory','pearl'
  ]);
  const RARITY_COLOR = {
    普通:'#d9d2bd',常見:'#75d982',稀有:'#62c8ff',史詩:'#c084fc',傳說:'#ffe16b',神話:'#ff7fa1',世界級:'#9fffee'
  };
  const canvasCache = new Map();
  const dataUrlCache = new Map();

  function hashOf(value) {
    let hash = 2166136261;
    for (const character of String(value || 'unknown-fish')) {
      hash ^= character.codePointAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function normalizeName(value) {
    return String(value || '未知魚種')
      .replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '')
      .replace(/^(普通|優秀|完美|閃亮|神話|變異|祝福)\s+/, '')
      .trim() || '未知魚種';
  }

  function familyOf(item = {}) {
    const name = normalizeName(item.name || item.title || item.id);
    const kind = String(item.kind || '').toLowerCase();
    if (/海馬/.test(name)) return 'seahorse';
    if (/鯊/.test(name) || kind === 'shark') return 'shark';
    if (/鯨/.test(name)) return 'whale';
    if (/翻車魚/.test(name)) return 'sunfish';
    if (/魟|鰩/.test(name)) return 'ray';
    if (/比目魚|扁魚/.test(name)) return 'flatfish';
    if (/旗魚|劍魚|尖嘴/.test(name)) return 'swordfish';
    if (/河豚|魨/.test(name)) return 'puffer';
    if (/鮟鱇|燈籠魚/.test(name) || kind === 'angler') return 'angler';
    if (/鰻|皇帶|海龍|龍魚|海蛇/.test(name)) return 'eel';
    if (/飛魚|飛鱗/.test(name)) return 'flyingfish';
    if (/龍蝦/.test(name) || kind === 'lobster') return 'lobster';
    if (/蝦/.test(name) || kind === 'shrimp') return 'shrimp';
    if (/蟹/.test(name) || kind === 'crab') return 'crab';
    if (/章魚/.test(name) || kind === 'octopus') return 'octopus';
    if (/魷魚|小卷|烏賊/.test(name) || kind === 'squid') return 'squid';
    if (/水母/.test(name) || kind === 'jelly') return 'jelly';
    if (/鸚鵡螺|海螺|貝殼|菊石/.test(name) || kind === 'shell') return 'shell';
    return 'fish';
  }

  function isBiological(item = {}) {
    const kind = String(item.kind || '').toLowerCase();
    if (NON_BIOLOGICAL_KINDS.has(kind)) return false;
    if (BIOLOGICAL_KINDS.has(kind)) return true;
    const name = normalizeName(item.name || item.title || item.id);
    return /魚|鯊|鯨|鰻|鯛|鯉|鱸|鯖|鮪|鱈|鯰|鰆|鯔|鯡|魟|鰩|魨|河豚|章魚|魷|小卷|水母|蝦|蟹|鸚鵡螺|海馬|鮟鱇|翻車/.test(name);
  }

  function hsl(hue, saturation, lightness) {
    return `hsl(${Math.round(hue)} ${saturation}% ${lightness}%)`;
  }

  function descriptor(item = {}) {
    const name = normalizeName(item.name || item.title || item.id);
    const kind = String(item.kind || 'fish').toLowerCase();
    const key = name.normalize('NFC').replace(/\s+/g,' ');
    const hash = hashOf(key);
    const hue = hash % 360;
    const secondaryHue = (hue + 36 + ((hash >>> 9) % 116)) % 360;
    const rarity = item.rarity || '普通';
    return {
      key,
      name,
      kind,
      hash,
      signature:hash.toString(16).padStart(8, '0'),
      family:familyOf({name,kind}),
      rarity,
      rarityColor:RARITY_COLOR[rarity] || RARITY_COLOR.普通,
      body:hsl(hue, 62 + ((hash >>> 5) % 22), 48 + ((hash >>> 13) % 14)),
      light:hsl(hue, 72, 72 + ((hash >>> 17) % 10)),
      deep:hsl(hue, 60, 24 + ((hash >>> 19) % 12)),
      accent:hsl(secondaryHue, 76, 58 + ((hash >>> 22) % 14)),
      pattern:(hash >>> 3) % 6,
      variant:(hash >>> 12) % 4
    };
  }

  function makePainter(context) {
    return (x, y, width = 1, height = 1, color = '#fff') => {
      context.fillStyle = color;
      context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
    };
  }

  function addEye(px, x, y) {
    px(x, y, 2, 2, '#17131d');
    px(x, y, 1, 1, '#fff9df');
  }

  function addSignature(px, d, positions) {
    positions.forEach(([x,y], index) => {
      const bit = (d.hash >>> index) & 1;
      px(x, y, 1, 1, bit ? d.accent : d.light);
    });
  }

  function addFishPattern(px, d) {
    if (d.pattern === 0) {
      px(10,8,1,8,d.accent); px(14,7,1,10,d.accent);
    } else if (d.pattern === 1) {
      px(9,9,2,2,d.accent); px(13,12,2,2,d.light); px(16,8,1,2,d.accent);
    } else if (d.pattern === 2) {
      px(8,10,10,2,d.light); px(10,13,7,1,d.accent);
    } else if (d.pattern === 3) {
      px(9,8,2,1,d.light); px(12,10,2,1,d.accent); px(15,12,2,1,d.light); px(10,14,2,1,d.accent);
    } else if (d.pattern === 4) {
      px(8,7,5,2,d.accent); px(13,14,5,2,d.deep);
    } else {
      px(9,8,1,1,d.light); px(11,10,1,1,d.light); px(13,12,1,1,d.light); px(15,14,1,1,d.light);
    }
    addSignature(px,d,[[9,15],[11,15],[13,15],[15,15],[17,14],[12,7],[14,7],[16,8]]);
  }

  function addNameTraits(px, d) {
    if (/百眼/.test(d.name)) {
      [[7,8],[10,7],[13,8],[8,11],[11,10],[14,11],[9,14],[13,14]].forEach(([x,y]) => {
        px(x,y,2,1,'#fff9df'); px(x + 1,y,1,1,'#17131d');
      });
    }
    if (/雙頭/.test(d.name)) { addEye(px,18,13); px(20,14,2,1,d.accent); }
    if (/骷髏|骨/.test(d.name)) {
      px(8,10,9,1,'#e9fff4'); px(10,8,1,5,'#e9fff4'); px(13,8,1,5,'#e9fff4'); px(16,9,1,3,'#e9fff4');
    }
    if (/水晶|寶石|玻璃/.test(d.name)) {
      px(5,4,1,2,'#fff'); px(6,3,1,1,d.light); px(19,6,1,2,'#fff'); px(20,5,1,1,d.accent);
    }
    if (/熔岩|紅蓮|火/.test(d.name)) {
      px(8,9,1,3,'#ffdc69'); px(9,11,2,1,'#ff7648'); px(14,8,1,3,'#ffdc69'); px(15,10,2,1,'#ff7648');
    }
    if (/黑洞|虛空/.test(d.name)) {
      px(10,9,5,5,'#08070d'); px(11,10,3,3,'#321b5f'); px(12,11,1,1,'#05040a');
    }
    if (/星|銀河|宇宙/.test(d.name)) {
      px(2,3,1,1,'#fff9df'); px(3,2,1,3,d.light); px(2,3,3,1,d.light); px(21,19,1,1,d.accent);
    }
    if (/月/.test(d.name)) {
      px(3,4,3,4,d.light); px(5,4,2,3,'rgba(0,0,0,.55)');
    }
  }

  function drawFish(px, d) {
    px(2,7,3,3,d.deep); px(2,14,3,3,d.deep); px(4,9,3,6,d.deep);
    px(6,7,11,10,d.deep); px(17,8,3,8,d.deep); px(20,10,2,4,d.deep);
    px(3,8,2,2,d.accent); px(3,14,2,2,d.accent); px(5,10,2,4,d.accent);
    px(7,8,10,8,d.body); px(17,9,3,6,d.body); px(20,11,1,2,d.body);
    px(9,6,5,2,d.deep); px(10,6,3,1,d.accent);
    px(11,16,5,2,d.deep); px(12,16,3,1,d.accent);
    addFishPattern(px,d); addEye(px,18,10);
  }

  function drawShark(px, d) {
    px(1,8,4,3,d.deep); px(1,14,4,3,d.deep); px(4,10,3,5,d.deep);
    px(6,8,13,8,d.deep); px(18,9,4,6,d.deep); px(21,11,2,2,d.deep);
    px(7,9,12,6,d.body); px(18,10,4,4,d.body); px(4,11,3,3,d.accent);
    px(11,4,4,4,d.deep); px(12,5,3,3,d.body); px(11,15,5,3,d.deep);
    px(9,13,10,2,d.light); px(21,13,1,1,'#fff9df'); addEye(px,19,10);
    addSharkTraits(px,d);
    addSignature(px,d,[[8,10],[10,10],[12,10],[14,10],[16,10],[9,12],[13,12],[17,12]]);
  }

  function addSharkTraits(px, d) {
    if (/黑鰭礁鯊/.test(d.name)) {
      px(11,4,4,2,'#11131a'); px(1,8,2,2,'#11131a'); px(1,15,2,2,'#11131a'); px(12,16,4,2,'#11131a');
    } else if (/護士鯊/.test(d.name)) {
      px(20,14,1,3,d.accent); px(22,14,1,2,d.accent); px(8,15,9,2,d.light); px(5,14,4,2,d.body);
    } else if (/雙髻鯊/.test(d.name)) {
      px(17,7,7,4,d.deep); px(18,8,5,3,d.body); addEye(px,17,8); addEye(px,22,8); px(20,11,3,2,d.light);
    } else if (/虎鯊/.test(d.name)) {
      [9,12,15,18].forEach((x,index) => px(x,8 + (index % 2),1,6 - (index % 2),d.deep)); px(7,10,2,1,d.accent);
    } else if (/大白鯊/.test(d.name)) {
      px(8,13,13,3,'#eef5eb'); px(19,13,3,2,'#eef5eb'); px(21,12,2,1,'#ef6c67'); px(20,13,2,1,'#17131d');
    } else if (/深海幽影鯊/.test(d.name)) {
      px(7,9,12,5,'#111126'); px(9,10,8,3,'#21184a'); px(8,14,10,1,'#70f5ef'); px(19,10,1,1,'#b9ffff');
    } else if (/星海巨齒鯊/.test(d.name)) {
      px(7,9,13,6,'#1c1742'); [[8,10],[11,12],[14,9],[16,13],[18,11]].forEach(([x,y],index) => px(x,y,index === 2 ? 2 : 1,1,index % 2 ? '#8fe8ff' : '#fff3a8'));
      px(19,13,4,2,'#f4f0de'); px(20,12,1,1,'#f4f0de'); px(22,12,1,1,'#f4f0de');
    } else if (/巨齒鯊/.test(d.name)) {
      px(18,9,5,7,d.deep); px(19,10,4,5,d.body); px(19,13,4,2,'#17131d'); px(19,12,1,1,'#fff9df'); px(21,12,1,1,'#fff9df'); px(22,14,1,1,'#fff9df');
    }
  }

  function drawWhale(px, d) {
    px(1,8,4,3,d.deep); px(1,14,4,3,d.deep); px(4,10,3,5,d.deep);
    px(6,7,13,10,d.deep); px(18,8,4,8,d.deep); px(21,10,2,4,d.deep);
    px(7,8,12,8,d.body); px(18,9,4,6,d.body); px(7,13,14,3,d.light);
    px(12,16,5,2,d.deep); px(13,16,3,1,d.accent); px(21,7,1,2,d.light); px(22,6,1,1,d.light);
    addEye(px,19,9); addSignature(px,d,[[8,9],[10,9],[12,9],[14,9],[16,9],[9,11],[13,11],[17,11]]);
  }

  function drawRay(px, d) {
    px(10,4,4,2,d.deep); px(7,6,10,2,d.deep); px(4,8,16,2,d.deep); px(2,10,20,4,d.deep);
    px(4,14,16,2,d.deep); px(7,16,10,2,d.deep); px(11,18,2,5,d.deep);
    px(10,6,4,1,d.light); px(7,8,10,1,d.body); px(4,10,16,4,d.body); px(7,14,10,1,d.accent); px(10,16,4,1,d.body);
    addEye(px,15,9); addSignature(px,d,[[6,11],[8,11],[10,11],[12,11],[14,11],[16,11],[9,13],[13,13]]);
  }

  function drawEel(px, d) {
    px(2,7,8,3,d.deep); px(8,9,5,4,d.deep); px(11,11,6,4,d.deep); px(15,13,7,4,d.deep);
    px(2,8,7,1,d.accent); px(8,10,4,2,d.body); px(12,12,4,2,d.body); px(16,14,6,2,d.body);
    px(1,6,3,2,d.deep); px(1,9,3,2,d.deep); addEye(px,19,14);
    addSignature(px,d,[[5,8],[7,8],[9,10],[11,11],[13,13],[15,14],[17,15],[20,15]]);
  }

  function drawFlatfish(px, d) {
    px(3,9,3,6,d.deep); px(5,7,13,10,d.deep); px(17,8,4,8,d.deep); px(20,10,3,4,d.deep);
    px(6,8,11,8,d.body); px(17,9,3,6,d.body); px(4,10,2,4,d.accent);
    px(7,6,8,1,d.accent); px(8,17,7,1,d.accent); addEye(px,16,9); addEye(px,18,11);
    addSignature(px,d,[[8,10],[10,9],[12,11],[14,13],[9,14],[11,12],[13,8],[15,15]]);
  }

  function drawSwordfish(px, d) {
    drawFish(px,d); px(21,11,3,1,d.deep); px(21,12,3,1,d.accent); px(11,4,5,2,d.deep); px(12,5,3,1,d.accent);
  }

  function drawPuffer(px, d) {
    px(8,5,8,2,d.deep); px(5,7,14,2,d.deep); px(3,9,18,7,d.deep); px(5,16,14,2,d.deep); px(8,18,8,2,d.deep);
    px(4,7,2,1,d.accent); px(2,11,2,1,d.accent); px(20,8,2,1,d.accent); px(21,15,2,1,d.accent);
    px(6,8,12,9,d.body); px(4,10,16,5,d.body); px(8,17,8,1,d.light); addEye(px,16,9);
    addSignature(px,d,[[7,10],[10,8],[13,9],[9,12],[12,13],[15,12],[8,15],[16,15]]);
  }

  function drawAngler(px, d) {
    drawPuffer(px,d); px(14,4,1,3,d.deep); px(14,3,5,1,d.deep); px(18,2,2,2,d.accent); px(19,2,1,1,'#fffbd0');
    px(18,14,3,1,'#fff9df'); px(18,15,1,1,'#fff9df'); px(20,15,1,1,'#fff9df');
  }

  function drawSunfish(px, d) {
    px(7,3,8,3,d.deep); px(5,6,12,13,d.deep); px(7,19,8,3,d.deep); px(16,8,5,9,d.deep); px(20,10,3,5,d.deep);
    px(6,7,10,11,d.body); px(8,5,6,2,d.accent); px(8,18,6,2,d.accent); px(16,9,4,7,d.body); addEye(px,17,9);
    addSignature(px,d,[[8,8],[10,8],[12,8],[14,9],[8,11],[11,12],[14,13],[9,16]]);
  }

  function drawFlyingFish(px, d) {
    drawFish(px,d); px(8,3,7,4,d.deep); px(9,4,5,3,d.light); px(8,17,7,4,d.deep); px(9,17,5,3,d.accent);
  }

  function drawSeahorse(px, d) {
    px(13,3,5,3,d.deep); px(11,5,8,4,d.deep); px(10,8,6,7,d.deep); px(8,13,7,5,d.deep); px(8,17,4,4,d.deep); px(4,18,6,4,d.deep);
    px(14,4,3,2,d.body); px(12,6,5,3,d.body); px(11,9,4,5,d.accent); px(9,14,4,4,d.body); px(9,18,2,2,d.light); px(5,19,4,2,d.accent);
    px(9,5,3,1,d.deep); px(8,4,2,1,d.accent); addEye(px,15,5);
    addSignature(px,d,[[12,8],[13,10],[12,12],[11,14],[10,16],[9,18],[7,20],[5,20]]);
  }

  function drawSquid(px, d) {
    px(8,3,8,2,d.deep); px(6,5,12,10,d.deep); px(8,15,8,3,d.deep);
    px(7,6,10,8,d.body); px(9,4,6,2,d.light); px(9,14,6,2,d.accent); addEye(px,9,8); addEye(px,14,8);
    [[8,17,7,20],[10,17,10,21],[13,17,13,20],[15,17,16,20]].forEach(([x,y,endX,endY]) => {
      px(x,y,2,3,d.deep); px(endX,endY,1,3,d.accent);
    });
    addSignature(px,d,[[8,11],[10,11],[12,11],[14,11],[9,13],[11,13],[13,13],[15,13]]);
  }

  function drawOctopus(px, d) {
    px(7,4,10,2,d.deep); px(5,6,14,9,d.deep); px(7,15,10,3,d.deep);
    px(6,7,12,7,d.body); px(8,5,8,2,d.light); px(8,14,8,2,d.accent); addEye(px,8,9); addEye(px,14,9);
    [5,8,11,14,17].forEach((x,index) => { px(x,17,3,2,d.deep); px(x + (index % 2),19,2,3,index % 2 ? d.accent : d.body); });
    addSignature(px,d,[[7,12],[9,12],[11,12],[13,12],[15,12],[8,14],[12,14],[16,14]]);
  }

  function drawJelly(px, d) {
    px(6,4,12,2,d.deep); px(4,6,16,8,d.deep); px(6,14,12,2,d.deep);
    px(5,7,14,6,d.body); px(7,5,10,2,d.light); px(7,12,10,2,d.accent); addEye(px,8,9); addEye(px,14,9);
    [6,10,14,18].forEach((x,index) => { px(x,15,2,5,index % 2 ? d.accent : d.deep); px(x + (index % 2 ? 1 : -1),20,2,2,d.deep); });
    addSignature(px,d,[[7,7],[9,7],[11,7],[13,7],[15,7],[8,11],[12,11],[16,11]]);
  }

  function drawShrimp(px, d) {
    px(4,5,4,4,d.deep); px(2,4,3,2,d.deep); px(3,9,3,5,d.deep); px(5,12,5,5,d.deep); px(9,14,6,4,d.deep); px(14,12,6,5,d.deep); px(18,10,4,4,d.deep);
    px(5,6,3,2,d.accent); px(4,10,2,3,d.body); px(6,13,4,3,d.body); px(10,15,5,2,d.light); px(15,13,5,3,d.body); px(19,11,2,2,d.accent); addEye(px,18,10);
    px(20,9,3,1,d.deep); px(21,7,1,2,d.deep); px(8,17,1,3,d.accent); px(12,18,1,3,d.accent); px(16,17,1,3,d.accent);
    addSignature(px,d,[[6,11],[8,13],[10,15],[12,15],[14,15],[16,14],[18,13],[20,12]]);
  }

  function drawCrab(px, d) {
    px(6,8,12,9,d.deep); px(8,6,3,3,d.deep); px(13,6,3,3,d.deep); px(2,8,5,3,d.deep); px(1,6,3,3,d.deep); px(17,8,5,3,d.deep); px(20,6,3,3,d.deep);
    px(7,9,10,7,d.body); px(9,7,1,2,d.light); px(14,7,1,2,d.light); px(3,9,3,1,d.accent); px(18,9,3,1,d.accent); addEye(px,9,9); addEye(px,14,9);
    [5,8,13,16].forEach((x,index) => { px(x,16,2,3,d.deep); px(x + (index < 2 ? -1 : 1),19,2,1,d.accent); });
    addSignature(px,d,[[8,12],[10,12],[12,12],[14,12],[9,14],[11,14],[13,14],[15,14]]);
  }

  function drawLobster(px, d) {
    drawShrimp(px,d); px(18,7,4,3,d.deep); px(20,5,3,3,d.deep); px(18,8,3,1,d.accent); px(21,6,2,1,d.accent);
  }

  function drawShell(px, d) {
    px(7,4,10,2,d.deep); px(4,6,16,3,d.deep); px(2,9,20,8,d.deep); px(4,17,16,3,d.deep); px(7,20,10,2,d.deep);
    px(5,7,14,2,d.body); px(3,10,18,6,d.body); px(5,16,14,2,d.accent); px(8,5,8,2,d.light);
    px(11,8,3,9,d.deep); px(12,10,2,5,d.light); px(8,10,2,5,d.accent); px(16,10,2,5,d.accent);
    addSignature(px,d,[[5,11],[7,9],[9,7],[15,7],[17,9],[19,11],[6,15],[18,15]]);
  }

  const DRAWERS = {
    fish:drawFish,shark:drawShark,whale:drawWhale,ray:drawRay,eel:drawEel,flatfish:drawFlatfish,
    swordfish:drawSwordfish,puffer:drawPuffer,angler:drawAngler,sunfish:drawSunfish,flyingfish:drawFlyingFish,
    seahorse:drawSeahorse,squid:drawSquid,octopus:drawOctopus,jelly:drawJelly,shrimp:drawShrimp,
    crab:drawCrab,lobster:drawLobster,shell:drawShell
  };

  function renderCanvas(item = {}) {
    const d = descriptor(item);
    if (canvasCache.has(d.key)) return canvasCache.get(d.key);
    if (!document?.createElement) return null;
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    canvas.setAttribute('aria-hidden','true');
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.imageSmoothingEnabled = false;
    context.clearRect(0,0,SIZE,SIZE);
    const px = makePainter(context);
    (DRAWERS[d.family] || drawFish)(px,d);
    addNameTraits(px,d);
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
    return String(value || '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  }

  function iconHtml(item = {}, className = '') {
    if (!isBiological(item)) return '';
    const d = descriptor(item);
    const src = dataUrl(item);
    if (!src) return '';
    return `<span class="cs-species-icon cs-fish-pixel-icon ${escapeHtml(className)}" data-icon-key="${escapeHtml(d.key)}" data-fish-key="${escapeHtml(d.key)}" data-family="${escapeHtml(d.family)}" data-rarity="${escapeHtml(d.rarity)}" style="--fish-rarity:${escapeHtml(d.rarityColor)}" aria-hidden="true"><img class="cs-fish-pixel-sprite" src="${src}" alt="" width="24" height="24" draggable="false"></span>`;
  }

  function draw(context, item, x, y, size = 48) {
    const source = renderCanvas(item);
    if (!source || !context) return false;
    context.save();
    context.imageSmoothingEnabled = false;
    context.drawImage(source,Math.round(x),Math.round(y),Math.round(size),Math.round(size));
    context.restore();
    return true;
  }

  function titleItem(element) {
    const clone = element.cloneNode(true);
    clone.querySelectorAll('.cs-species-icon,.unique-emoji').forEach(node => node.remove());
    const name = normalizeName(clone.textContent || '');
    const container = element.closest('.central-fish-card,.fishing-card,.mutant-card,.backpack-entry,.fish-entry,.fh-card,.fh-dex-row,.bp-card');
    const text = container?.textContent || '';
    const rarity = text.match(/稀有度：\s*(世界級|神話|傳說|史詩|稀有|常見|普通)/)?.[1] || '普通';
    const kind = /章魚/.test(name) ? 'octopus' : /魷|小卷/.test(name) ? 'squid' : /蝦/.test(name) ? 'shrimp' : /蟹/.test(name) ? 'crab' : /水母/.test(name) ? 'jelly' : /鯨/.test(name) ? 'whale' : 'fish';
    return {name,rarity,kind};
  }

  function decorateLegacy(root = document) {
    root.querySelectorAll?.('.cs-species-icon:not(.cs-fish-pixel-icon)').forEach(icon => {
      if (icon.dataset.item === 'true') return;
      const title = icon.closest('strong,.central-fish-title,.carnival-title,.mutant-name,.fh-card-head,.fh-dex-row');
      if (!title) return;
      const item = titleItem(title);
      if (!isBiological(item)) return;
      const html = iconHtml(item,'cs-fish-legacy-icon');
      if (html) icon.outerHTML = html;
    });
    decorateMutants(root);
  }

  function decorateMutants(root = document) {
    root.querySelectorAll?.('.mh-creature-icon,.mh-encounter-icon,.mh-side:first-child>span,.mh-result-icon').forEach(container => {
      if (container.querySelector('.cs-fish-pixel-icon')) return;
      const panel = container.closest('#mutantHuntEvent');
      if (!panel) return;
      const resultName = panel.querySelector('.mh-title p')?.textContent?.match(/^(.+?)捕獵結果/)?.[1];
      const encounterName = container.closest('.mh-encounter-card')?.querySelector('h4')?.textContent;
      const headingName = panel.querySelector('.mh-title h3')?.textContent;
      const name = normalizeName(resultName || encounterName || headingName || '未知變異生物');
      const rarity = panel.textContent?.match(/(世界級|神話|傳說|史詩|稀有|常見|普通)變異生物/)?.[1] || '神話';
      const html = iconHtml({name,kind:'mutant',rarity},'mh-pixel-species-icon');
      if (html) container.innerHTML = html;
    });
  }

  function patchLegacyApi() {
    const api = window.COFFEE_SHIP_ICON;
    if (!api || api.__fishPixelV1) return;
    const previousHtml = api.iconHtml?.bind(api);
    api.iconHtml = (item,className = '') => isBiological(item) ? iconHtml(item,className) : previousHtml?.(item,className) || '';
    api.fishPixelIconHtml = iconHtml;
    api.fishPixelDataUrl = dataUrl;
    api.__fishPixelV1 = true;
    if (window.COFFEE_SHIP_EMOJI) window.COFFEE_SHIP_EMOJI.fishPixelIconHtml = iconHtml;
  }

  function addStyle() {
    if (document.getElementById('coffeeShipFishPixelIconStyle')) return;
    const style = document.createElement('style');
    style.id = 'coffeeShipFishPixelIconStyle';
    style.textContent = `
      .cs-fish-pixel-icon{
        position:relative!important;display:inline-grid!important;place-items:center!important;
        width:2.42em!important;height:2.42em!important;min-width:2.42em!important;margin:0 .42em 0 0!important;
        padding:.16em!important;overflow:visible!important;border:2px solid color-mix(in srgb,var(--fish-rarity) 74%,#fff 26%)!important;
        border-radius:.58em!important;background:linear-gradient(180deg,rgba(24,38,48,.98),rgba(9,19,27,.98))!important;
        box-shadow:0 4px 0 rgba(0,0,0,.34),inset 0 0 0 1px rgba(255,255,255,.07),0 0 14px color-mix(in srgb,var(--fish-rarity) 24%,transparent)!important;
        transform:none!important;filter:none!important;box-sizing:border-box!important;vertical-align:middle!important;
      }
      .cs-fish-pixel-icon::before{content:''!important;position:absolute!important;inset:2px!important;border-radius:.38em!important;background:linear-gradient(135deg,rgba(255,255,255,.08),transparent 48%)!important;pointer-events:none!important}
      .cs-fish-pixel-icon::after{display:none!important}
      .cs-fish-pixel-sprite{display:block;width:100%;height:100%;object-fit:contain;image-rendering:pixelated;image-rendering:crisp-edges;filter:drop-shadow(0 2px 0 rgba(0,0,0,.34));user-select:none}
      .cs-fish-pixel-icon .cs-species-rarity-gem{left:-.28em;top:-.3em;background:#0c1820;border-color:var(--fish-rarity);color:var(--fish-rarity)}
      .fh-icon .cs-fish-pixel-icon,.fh-dex-icon .cs-fish-pixel-icon,.fh-icon-shell .cs-fish-pixel-icon{margin:0!important;font-size:20px}
      .fh-icon .fh-shark-event-icon{font-size:18px;margin:0!important}
      .fh-dex-icon .cs-fish-pixel-icon{font-size:18px}
      .bp-title>.cs-fish-pixel-icon{font-size:18px;flex:0 0 auto;margin-right:2px!important}
      .central-fish-title>.cs-fish-pixel-icon,.mutant-name>.cs-fish-pixel-icon{font-size:22px}
      .mh-creature-icon>.cs-fish-pixel-icon{font-size:18px;margin:0!important}
      .mh-encounter-icon>.cs-fish-pixel-icon{font-size:28px;margin:0!important}
      .mh-side:first-child>span>.cs-fish-pixel-icon{font-size:27px;margin:0!important}
      .mh-result-icon>.cs-fish-pixel-icon{font-size:32px;margin:0 auto!important}
      .fh-card:hover .cs-fish-pixel-icon,.fh-dex-row:hover .cs-fish-pixel-icon,.bp-card:hover .cs-fish-pixel-icon{transform:translateY(-1px)!important;filter:brightness(1.08)!important}
      @supports not (color:color-mix(in srgb,red,blue)){.cs-fish-pixel-icon{border-color:var(--fish-rarity)!important}}
      @media(max-width:760px){.cs-fish-pixel-icon{width:2.22em!important;height:2.22em!important;min-width:2.22em!important}.bp-title>.cs-fish-pixel-icon{font-size:16px}}
    `;
    document.head.appendChild(style);
  }

  function init() {
    addStyle();
    patchLegacyApi();
    decorateLegacy();
    const observer = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.matches?.('.cs-species-icon:not(.cs-fish-pixel-icon)')) decorateLegacy(node.parentElement || document);
          else decorateLegacy(node);
        }
      }
    });
    observer.observe(document.body,{subtree:true,childList:true});
    window.addEventListener('coffee-ship:fishing-pool-changed',() => setTimeout(() => decorateLegacy(),0));
  }

  window.COFFEE_SHIP_FISH_ICONS = {
    version:1,
    size:SIZE,
    descriptor,
    familyOf,
    isBiological,
    dataUrl,
    iconHtml,
    draw,
    renderCanvas,
    decorateLegacy,
    hashOf
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
