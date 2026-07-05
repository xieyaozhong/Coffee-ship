(() => {
  'use strict';

  const CARNIVAL_LOOT = [
    // 動物面具 10
    ['🦊','狂歡節狐狸面具','普通','動物面具',.24,'總是掛著狡猾的笑容。'],
    ['🐺','狂歡節狼面具','稀有','動物面具',.32,'戴上後彷彿能聽見狼嚎。'],
    ['🦁','狂歡節獅子面具','稀有','動物面具',.38,'象徵島上的王者。'],
    ['🐯','狂歡節老虎面具','稀有','動物面具',.35,'額頭畫著奇怪的紅色條紋。'],
    ['🐻','狂歡節熊面具','稀有','動物面具',.48,'厚重而充滿壓迫感。'],
    ['🦉','狂歡節貓頭鷹面具','傳說','動物面具',.30,'夜晚眼睛會微微發光。'],
    ['🦌','狂歡節鹿角面具','傳說','動物面具',.42,'長角纏滿彩帶與花朵。'],
    ['🐐','狂歡節山羊面具','傳說','動物面具',.40,'狂歡祭典主持人常佩戴。'],
    ['🐗','狂歡節野豬面具','史詩','動物面具',.52,'沾滿乾掉的彩色顏料。'],
    ['🐍','狂歡節蛇神面具','神話','動物面具',.28,'據說只有祭司才能佩戴。'],
    // 衣物 15
    ['👙','狂歡節內衣','稀有','漂流衣物',.08,'從狂歡島漂來的衣物。'],
    ['🩲','狂歡節內褲','稀有','漂流衣物',.06,'口袋裡還有彩色紙屑。'],
    ['🧦','狂歡節襪子','普通','漂流衣物',.04,'泡過海水後仍有香水味。'],
    ['👕','狂歡節襯衫','普通','漂流衣物',.12,'扣子全部不見了。'],
    ['👔','狂歡節燕尾服','史詩','漂流衣物',.72,'胸口別著一朵枯萎的花。'],
    ['👗','狂歡節晚禮服','稀有','漂流衣物',.28,'裙擺縫著亮片。'],
    ['🧥','狂歡節披風','傳說','漂流衣物',.44,'披風內側寫滿邀請名單。'],
    ['🧤','狂歡節手套','普通','漂流衣物',.04,'指尖沾著金粉。'],
    ['🧣','狂歡節圍巾','普通','漂流衣物',.10,'聞起來像糖漿和海風。'],
    ['👒','狂歡節羽毛帽','稀有','漂流衣物',.14,'羽毛顏色過於鮮豔。'],
    ['🎩','狂歡節高帽','史詩','漂流衣物',.32,'帽底藏著一張小丑票券。'],
    ['👠','狂歡節高跟鞋','史詩','漂流衣物',.50,'鞋跟裡藏著小鈴鐺。'],
    ['👢','狂歡節長靴','稀有','漂流衣物',.78,'靴底踩著乾掉的彩紙。'],
    ['👞','狂歡節皮鞋','普通','漂流衣物',.46,'只剩左腳。'],
    ['🎀','狂歡節絲帶','普通','漂流衣物',.02,'打了一個解不開的結。'],
    // 玩具 15
    ['🎈','狂歡節氣球','普通','玩具',.01,'不知為何還沒漏氣。'],
    ['🪀','狂歡節悠悠球','普通','玩具',.16,'線濕了還能轉。'],
    ['🪁','狂歡節風箏','稀有','玩具',.22,'畫著一張笑臉。'],
    ['🎠','狂歡節木馬','史詩','玩具',2.60,'縮小版木馬，會自己搖晃。'],
    ['🪆','狂歡節人偶','稀有','玩具',.40,'打開後裡面還有一張小臉。'],
    ['🤡','狂歡節小丑鼻子','普通','玩具',.03,'按下去會發出怪聲。'],
    ['🎺','狂歡節喇叭','普通','玩具',.28,'吹出來的聲音像笑聲。'],
    ['🥁','狂歡節小鼓','稀有','玩具',.70,'鼓面還在自己震動。'],
    ['🎨','狂歡節顏料盤','普通','玩具',.20,'顏料遇水不散。'],
    ['🃏','狂歡節撲克牌','稀有','玩具',.08,'少了一張鬼牌。'],
    ['🎲','狂歡節骰子','普通','玩具',.05,'每一面都是六點。'],
    ['🧸','狂歡節玩偶熊','稀有','玩具',.36,'肚子裡有沙沙聲。'],
    ['🪅','狂歡節彩罐','稀有','玩具',.42,'裡面敲不出糖果，只掉出彩灰。'],
    ['🪇','狂歡節沙鈴','普通','玩具',.18,'搖起來像遠方的腳步聲。'],
    ['🎪','狂歡節雜耍球','普通','玩具',.12,'三顆球永遠找不到第四顆。'],
    // 飾品 10
    ['💍','狂歡節戒指','稀有','飾品',.02,'內側刻著陌生名字。'],
    ['📿','狂歡節項鍊','稀有','飾品',.08,'珠子像眼睛一樣反光。'],
    ['👑','狂歡節王冠','傳說','飾品',.36,'戴上後會聽見掌聲。'],
    ['💎','狂歡節寶石','傳說','飾品',.05,'內部有彩色漩渦。'],
    ['🪶','狂歡節羽毛飾品','稀有','飾品',.03,'羽毛會自己輕輕抖動。'],
    ['📜','狂歡節貴族徽章','稀有','飾品',.04,'背面寫著貴賓席。'],
    ['🏅','狂歡節勳章','史詩','飾品',.08,'獎給最會笑的人。'],
    ['💠','狂歡節水晶胸針','傳說','飾品',.06,'水晶中有舞會倒影。'],
    ['✨','狂歡節金色耳環','稀有','飾品',.02,'晃動時會灑出金粉。'],
    ['🔔','狂歡節銀鈴腳環','史詩','飾品',.07,'鈴聲只在夜裡響起。']
  ].map(([icon,name,rarity,quality,weight,note]) => ({ icon, name, rarity, quality, weight, note, zone:'狂歡島遺失物', kind:'treasure' }));

  const BOTTLE_SERIES = {
    coffeeShipBottleLetters: { icon:'😂🍾', series:'冷笑話漂流瓶', rarity:'普通' },
    coffeeShipLanarLetters: { icon:'🌊🧪', series:'拉納爾漂流瓶', rarity:'史詩' },
    coffeeShipArielLetters: { icon:'🧜‍♀️💔', series:'愛麗兒漂流瓶', rarity:'史詩' },
    coffeeShipIslandLetters: { icon:'🏝️💌', series:'孤島三角戀漂流瓶', rarity:'稀有' },
    coffeeShipBlackbeardLetters: { icon:'🏴‍☠️🗺️', series:'黑鬍子藏寶圖', rarity:'傳說' },
    coffeeShipMadPriestLetters: { icon:'📜🕯️', series:'瘋狂神父殘頁', rarity:'傳說' },
    coffeeShipCarnivalLetters: { icon:'🎭🍾', series:'狂歡島漂流瓶', rarity:'史詩' },
    coffeeShipTurtleSoupLetters: { icon:'🍲🐢', series:'海龜湯神秘故事', rarity:'神話' }
  };

  const itemRules = [
    [/狐狸面具/,'🦊'], [/狼面具/,'🐺'], [/獅子面具/,'🦁'], [/老虎面具/,'🐯'], [/熊面具/,'🐻'], [/貓頭鷹面具/,'🦉'], [/鹿角面具/,'🦌'], [/山羊面具/,'🐐'], [/野豬面具/,'🐗'], [/蛇神面具/,'🐍'],
    [/內衣/,'👙'], [/內褲|短褲/,'🩲'], [/襪/,'🧦'], [/襯衫/,'👕'], [/燕尾服/,'👔'], [/晚禮服|洋裝|禮服/,'👗'], [/披風/,'🧥'], [/手套/,'🧤'], [/圍巾/,'🧣'], [/羽毛帽|帽/,'👒'], [/高帽|禮帽/,'🎩'], [/高跟鞋/,'👠'], [/長靴/,'👢'], [/皮鞋/,'👞'], [/絲帶|緞帶/,'🎀'],
    [/氣球/,'🎈'], [/悠悠球/,'🪀'], [/風箏/,'🪁'], [/木馬|音樂盒/,'🎠'], [/人偶|布偶|玩偶/,'🪆'], [/小丑鼻子/,'🤡'], [/喇叭/,'🎺'], [/小鼓/,'🥁'], [/顏料/,'🎨'], [/撲克|牌/,'🃏'], [/骰子/,'🎲'], [/彩罐/,'🪅'], [/沙鈴/,'🪇'], [/雜耍球/,'🎪'],
    [/戒指/,'💍'], [/項鍊/,'📿'], [/王冠|皇冠/,'👑'], [/寶石/,'💎'], [/羽毛飾品/,'🪶'], [/徽章/,'📜'], [/勳章/,'🏅'], [/胸針/,'💠'], [/耳環/,'✨'], [/腳環|銀鈴/,'🔔'],
    [/龜殼/,'🐢'], [/吸管/,'🥤'], [/海象|角飾/,'🦭'], [/生鏽工具|醫療器具/,'🧰'], [/漂流者|遺物|皮革/,'🧩'], [/珍珠/,'🦪'], [/瓶|漂流瓶/,'🍾'], [/塑膠|垃圾|瓶蓋|吸管/,'🗑️']
  ];

  function read(k, fb){ try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(fb)); } catch(e) { return fb; } }
  function save(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} }
  function iconForItem(item){
    const name = item?.name || item?.title || '';
    const rule = itemRules.find(([re]) => re.test(name));
    if (rule) return rule[1];
    if (/狂歡/.test(name) || item?.zone === '狂歡島遺失物') return '🎭';
    return item?.icon || '📦';
  }
  function pickCarnivalLoot(){
    const base = CARNIVAL_LOOT[Math.floor(Math.random() * CARNIVAL_LOOT.length)];
    return { ...base, icon:iconForItem(base), at:Date.now() };
  }
  function addToBag(item){
    const bag = read('coffeeShipFishBag', []);
    bag.push({ ...(item || pickCarnivalLoot()), at:Date.now() });
    save('coffeeShipFishBag', bag.slice(-180));
  }
  function normalizeBag(){
    const bag = read('coffeeShipFishBag', []);
    let changed = false;
    const next = bag.map(item => {
      if (!item || typeof item !== 'object') return item;
      const copy = { ...item };
      const icon = iconForItem(copy);
      if (copy.icon !== icon) { copy.icon = icon; changed = true; }
      if (/狂歡|華麗羽毛帽|小丑|撲克|骰子|緞帶/.test(copy.name || '') && copy.zone !== '狂歡島遺失物') { copy.zone = '狂歡島遺失物'; changed = true; }
      if (/狂歡/.test(copy.name || '') && !copy.note) { copy.note = '狂歡島遺失物收藏品。'; changed = true; }
      return copy;
    });
    if (changed) save('coffeeShipFishBag', next.slice(-180));
  }
  function normalizeLetters(){
    Object.entries(BOTTLE_SERIES).forEach(([key, meta]) => {
      const list = read(key, []);
      let changed = false;
      const next = list.map(x => {
        if (!x || typeof x !== 'object') return x;
        const y = { ...x };
        if (!y.icon) { y.icon = meta.icon; changed = true; }
        if (!y.series) { y.series = meta.series; changed = true; }
        if (!y.rarity) { y.rarity = meta.rarity; changed = true; }
        if (!y.at) { y.at = Date.now(); changed = true; }
        return y;
      });
      if (changed) save(key, next.slice(-100));
    });
  }
  function createBottle(key, title, text){
    const meta = BOTTLE_SERIES[key] || { icon:'🍾', series:'漂流瓶', rarity:'普通' };
    const list = read(key, []);
    const entry = { title, text, icon:meta.icon, series:meta.series, rarity:meta.rarity, at:Date.now() };
    list.push(entry);
    save(key, list.slice(-100));
    return entry;
  }
  function boot(){
    window.COFFEE_SHIP_ITEM_ICONS = { iconForItem, itemRules };
    window.COFFEE_SHIP_BOTTLE_CORE = { bottleSeries:BOTTLE_SERIES, createBottle, normalizeLetters };
    window.COFFEE_SHIP_CARNIVAL_LOOT = { pool:CARNIVAL_LOOT, pick:pickCarnivalLoot, addToBag, normalizeOldCarnivalLoot:normalizeBag };
    normalizeBag(); normalizeLetters();
    setInterval(() => { normalizeBag(); normalizeLetters(); }, 1600);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();