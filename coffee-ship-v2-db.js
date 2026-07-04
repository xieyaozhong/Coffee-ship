(() => {
  'use strict';

  const rarityPrice = { 普通:6, 常見:10, 稀有:28, 史詩:90, 傳說:260, 神話:900, 世界級:5000 };
  const groupIcon = {
    fish:'🐟', item:'📦', bottle:'🍾', carnival:'🎭', ocean:'🌊', treasure:'💰', trash:'🗑️', pearl:'🦪', story:'📖'
  };

  const carnivalLoot = [
    ['mask_fox','🦊','狂歡節狐狸面具','動物面具','普通',.24,'總是掛著狡猾的笑容。'],
    ['mask_wolf','🐺','狂歡節狼面具','動物面具','稀有',.32,'戴上後彷彿能聽見狼嚎。'],
    ['mask_lion','🦁','狂歡節獅子面具','動物面具','稀有',.38,'象徵島上的王者。'],
    ['mask_tiger','🐯','狂歡節老虎面具','動物面具','稀有',.35,'額頭畫著紅色條紋。'],
    ['mask_bear','🐻','狂歡節熊面具','動物面具','稀有',.48,'厚重而充滿壓迫感。'],
    ['mask_owl','🦉','狂歡節貓頭鷹面具','動物面具','傳說',.3,'夜晚眼睛會微微發光。'],
    ['mask_deer','🦌','狂歡節鹿角面具','動物面具','傳說',.42,'長角纏滿彩帶與花朵。'],
    ['mask_goat','🐐','狂歡節山羊面具','動物面具','傳說',.4,'狂歡祭典主持人常佩戴。'],
    ['mask_boar','🐗','狂歡節野豬面具','動物面具','史詩',.52,'沾滿乾掉的彩色顏料。'],
    ['mask_snake','🐍','狂歡節蛇神面具','動物面具','神話',.28,'據說只有祭司才能佩戴。'],
    ['cloth_party','🎽','狂歡節衣物','漂流衣物','稀有',.08,'從狂歡島漂來的服裝。'],
    ['cloth_shorts','🩳','狂歡節短褲','漂流衣物','稀有',.06,'口袋裡還有彩色紙屑。'],
    ['cloth_socks','🧦','狂歡節襪子','漂流衣物','普通',.04,'泡過海水後仍有香水味。'],
    ['cloth_shirt','👕','狂歡節襯衫','漂流衣物','普通',.12,'扣子全部不見了。'],
    ['cloth_tailcoat','👔','狂歡節燕尾服','漂流衣物','史詩',.72,'胸口別著一朵枯萎的花。'],
    ['cloth_gown','👗','狂歡節晚禮服','漂流衣物','稀有',.28,'裙擺縫著亮片。'],
    ['cloth_cape','🧥','狂歡節披風','漂流衣物','傳說',.44,'披風內側寫滿邀請名單。'],
    ['cloth_gloves','🧤','狂歡節手套','漂流衣物','普通',.04,'指尖沾著金粉。'],
    ['cloth_scarf','🧣','狂歡節圍巾','漂流衣物','普通',.1,'聞起來像糖漿和海風。'],
    ['cloth_hat','👒','狂歡節羽毛帽','漂流衣物','稀有',.14,'羽毛顏色過於鮮豔。'],
    ['toy_balloon','🎈','狂歡節氣球','玩具','普通',.01,'不知為何還沒漏氣。'],
    ['toy_yoyo','🪀','狂歡節悠悠球','玩具','普通',.16,'線濕了還能轉。'],
    ['toy_kite','🪁','狂歡節風箏','玩具','稀有',.22,'畫著一張笑臉。'],
    ['toy_horse','🎠','狂歡節木馬','玩具','史詩',2.6,'縮小版木馬，會自己搖晃。'],
    ['toy_doll','🪆','狂歡節人偶','玩具','稀有',.4,'打開後裡面還有一張小臉。'],
    ['toy_nose','🤡','狂歡節小丑鼻子','玩具','普通',.03,'按下去會發出怪聲。'],
    ['toy_trumpet','🎺','狂歡節喇叭','玩具','普通',.28,'吹出來的聲音像笑聲。'],
    ['toy_drum','🥁','狂歡節小鼓','玩具','稀有',.7,'鼓面還在自己震動。'],
    ['toy_cards','🃏','狂歡節撲克牌','玩具','稀有',.08,'少了一張鬼牌。'],
    ['toy_dice','🎲','狂歡節骰子','玩具','普通',.05,'每一面都是六點。'],
    ['acc_ring','💍','狂歡節戒指','飾品','稀有',.02,'內側刻著陌生名字。'],
    ['acc_necklace','📿','狂歡節項鍊','飾品','稀有',.08,'珠子像眼睛一樣反光。'],
    ['acc_crown','👑','狂歡節王冠','飾品','傳說',.36,'戴上後會聽見掌聲。'],
    ['acc_gem','💎','狂歡節寶石','飾品','傳說',.05,'內部有彩色漩渦。'],
    ['acc_feather','🪶','狂歡節羽毛飾品','飾品','稀有',.03,'羽毛會自己輕輕抖動。'],
    ['acc_badge','📜','狂歡節貴族徽章','飾品','稀有',.04,'背面寫著貴賓席。'],
    ['acc_medal','🏅','狂歡節勳章','飾品','史詩',.08,'獎給最會笑的人。'],
    ['acc_brooch','💠','狂歡節水晶胸針','飾品','傳說',.06,'水晶中有舞會倒影。'],
    ['acc_earring','✨','狂歡節金色耳環','飾品','稀有',.02,'晃動時會灑出金粉。'],
    ['acc_bell','🔔','狂歡節銀鈴腳環','飾品','史詩',.07,'鈴聲只在夜裡響起。']
  ];

  const bottles = [
    ['joke','😂','冷笑話漂流瓶','普通','魚為什麼不上班？因為今天請鮭假。'],
    ['lanar','🌊','拉納爾漂流瓶','稀有','拉納爾記下海獸的影子：牠從船底游過時，整片海像被翻到背面。'],
    ['ariel','🧜‍♀️','愛麗兒漂流瓶','稀有','我曾以為失去聲音就能換來愛，後來才知道沉默只會讓不愛你的人更容易離開。'],
    ['blackbeard','🏴‍☠️','黑鬍子藏寶圖','史詩','粗糙的羊皮紙上畫著黑礁、破塔與一個巨大的 X。'],
    ['mad_priest','📜','瘋狂神父殘頁','史詩','潮聲不是潮聲，是祂在紙背後呼吸。不要回答海上的歌聲。'],
    ['carnival','🎭','狂歡島漂流瓶','稀有','如果你在海上看見燈火、聽見笑聲、聞到甜味，請立刻轉舵。'],
    ['turtle_soup','🍲','海龜湯神秘故事','傳說','一個港口的燈塔每天都準時亮起，直到某天晚了一分鐘，整座島的人都開始沉默。']
  ];

  const oceanLoot = [
    ['turtle_shell','🐢','龜殼','海洋朋友','稀有',2.8,'自然脫落的老龜殼，表面有海浪紋路。'],
    ['turtle_straw','🥤','鼻孔裡的舊吸管','海洋朋友','傳說',.03,'那根吸管終於離開了牠。'],
    ['walrus_relic','🦭','海象紀念角飾','海洋朋友','稀有',1.2,'沉重、安靜，像一段不肯說出口的記憶。'],
    ['rust_tool','🧰','生鏽工具','海洋朋友','傳說',.3,'不明用途，卻被保存得很慎重。'],
    ['drifter_relic','🧩','無名漂流者遺物','海洋朋友','神話',.5,'不知道屬於誰，也不知道為何會在海象身邊。']
  ];

  function itemFromRow(row, group='item') {
    const [id, icon, name, category, rarity, weight, note] = row;
    const price = Math.max(1, Math.round((rarityPrice[rarity] || 10) * Math.max(1, weight || 1) * (category === '飾品' ? 1.5 : category === '動物面具' ? 1.25 : 1)));
    return { id, icon, name, category, zone: category === '海洋朋友' ? '海洋朋友事件' : '狂歡島遺失物', rarity, quality: category, weight, note, kind:'treasure', price, group, at:Date.now() };
  }
  function bottleFromRow(row) {
    const [id, icon, title, rarity, text] = row;
    return { id, icon, title, text, rarity, group:'bottle', at:Date.now() };
  }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function read(k, fb) { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(fb)); } catch(e) { return fb; } }
  function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  function addItem(item) { const bag = read('coffeeShipFishBag', []); bag.push(item); save('coffeeShipFishBag', bag.slice(-220)); return item; }
  function addBottle(bottle) {
    const keyMap = { joke:'coffeeShipBottleLetters', lanar:'coffeeShipLanarLetters', ariel:'coffeeShipArielLetters', blackbeard:'coffeeShipBlackbeardLetters', mad_priest:'coffeeShipMadPriestLetters', carnival:'coffeeShipCarnivalLetters', turtle_soup:'coffeeShipTurtleSoupLetters' };
    const key = keyMap[bottle.id] || 'coffeeShipBottleLetters';
    const list = read(key, []);
    const title = `${bottle.title} ${list.length + 1}`;
    list.push({ title, text:bottle.text, icon:bottle.icon, rarity:bottle.rarity, v2id:bottle.id, at:Date.now() });
    save(key, list.slice(-100));
    return { ...bottle, title };
  }
  function pickCarnivalItem() { return itemFromRow(pick(carnivalLoot), 'carnival'); }
  function pickOceanItem() { return itemFromRow(pick(oceanLoot), 'ocean'); }
  function pickBottle() { return bottleFromRow(pick(bottles)); }
  function normalizeBag() {
    const bag = read('coffeeShipFishBag', []);
    let changed = false;
    const next = bag.map(x => {
      if (!x || x.v2) return x;
      if (x.kind === 'treasure') {
        changed = true;
        const rarity = x.rarity || '普通';
        const weight = Number(x.weight || 1);
        const price = Math.max(1, Math.round((rarityPrice[rarity] || 10) * Math.max(1, weight)));
        return { ...x, id:x.id || `legacy_${String(x.name || 'item').replace(/\s+/g,'_')}`, icon:x.icon || groupIcon.item, category:x.category || x.quality || '舊物品', note:x.note || x.trait || '舊版掉落物已由 v2.0 接管。', price, v2:true };
      }
      return x;
    });
    if (changed) save('coffeeShipFishBag', next.slice(-220));
  }

  window.COFFEE_SHIP_DB = {
    version:'2.0-safe-db', rarityPrice, groupIcon,
    carnivalLoot, bottles, oceanLoot,
    itemFromRow, bottleFromRow, pickCarnivalItem, pickOceanItem, pickBottle, addItem, addBottle, normalizeBag
  };
  setInterval(normalizeBag, 2000);
})();