(() => {
  'use strict';

  const pool = [
    { icon:'🎭', name:'狂歡節狐狸面具', rarity:'普通', quality:'動物面具', weight:.24, note:'總是掛著狡猾的笑容。' },
    { icon:'🐺', name:'狂歡節狼面具', rarity:'稀有', quality:'動物面具', weight:.32, note:'戴上後彷彿能聽見狼嚎。' },
    { icon:'🦁', name:'狂歡節獅子面具', rarity:'稀有', quality:'動物面具', weight:.38, note:'象徵島上的王者。' },
    { icon:'🐯', name:'狂歡節老虎面具', rarity:'稀有', quality:'動物面具', weight:.35, note:'額頭畫著奇怪的血紅條紋。' },
    { icon:'🐻', name:'狂歡節熊面具', rarity:'稀有', quality:'動物面具', weight:.48, note:'厚重而充滿壓迫感。' },
    { icon:'🦉', name:'狂歡節貓頭鷹面具', rarity:'傳說', quality:'動物面具', weight:.3, note:'夜晚眼睛會微微發光。' },
    { icon:'🦌', name:'狂歡節鹿角面具', rarity:'傳說', quality:'動物面具', weight:.42, note:'長角纏滿彩帶與花朵。' },
    { icon:'🐐', name:'狂歡節山羊面具', rarity:'傳說', quality:'動物面具', weight:.4, note:'狂歡祭典主持人常佩戴。' },
    { icon:'🐗', name:'狂歡節野豬面具', rarity:'史詩', quality:'動物面具', weight:.52, note:'沾滿乾掉的彩色顏料。' },
    { icon:'🐍', name:'狂歡節蛇神面具', rarity:'神話', quality:'動物面具', weight:.28, note:'據說只有祭司才能佩戴。' },
    { icon:'🎽', name:'狂歡節衣物', rarity:'稀有', quality:'漂流衣物', weight:.08, note:'從狂歡島漂來的服裝。' },
    { icon:'🩳', name:'狂歡節短褲', rarity:'稀有', quality:'漂流衣物', weight:.06, note:'口袋裡還有彩色紙屑。' },
    { icon:'🧦', name:'狂歡節襪子', rarity:'普通', quality:'漂流衣物', weight:.04, note:'泡過海水後仍有香水味。' },
    { icon:'👕', name:'狂歡節襯衫', rarity:'普通', quality:'漂流衣物', weight:.12, note:'扣子全部不見了。' },
    { icon:'👗', name:'狂歡節洋裝', rarity:'稀有', quality:'漂流衣物', weight:.18, note:'裙擺縫著亮片。' },
    { icon:'🧤', name:'狂歡節手套', rarity:'普通', quality:'漂流衣物', weight:.04, note:'指尖沾著金粉。' },
    { icon:'👒', name:'狂歡節羽毛帽', rarity:'稀有', quality:'漂流衣物', weight:.14, note:'羽毛顏色過於鮮豔。' },
    { icon:'👠', name:'狂歡節高跟鞋', rarity:'史詩', quality:'漂流衣物', weight:.5, note:'鞋跟裡藏著小鈴鐺。' },
    { icon:'👞', name:'狂歡節皮鞋', rarity:'普通', quality:'漂流衣物', weight:.46, note:'只剩左腳。' },
    { icon:'🎀', name:'狂歡節緞帶', rarity:'普通', quality:'漂流衣物', weight:.02, note:'打了一個解不開的結。' },
    { icon:'🎈', name:'狂歡節氣球', rarity:'普通', quality:'玩具', weight:.01, note:'不知為何還沒漏氣。' },
    { icon:'🪀', name:'狂歡節悠悠球', rarity:'普通', quality:'玩具', weight:.16, note:'線濕了還能轉。' },
    { icon:'🪁', name:'狂歡節風箏', rarity:'稀有', quality:'玩具', weight:.22, note:'畫著一張笑臉。' },
    { icon:'🎠', name:'狂歡節木馬', rarity:'史詩', quality:'玩具', weight:2.6, note:'縮小版木馬，會自己搖晃。' },
    { icon:'🪆', name:'狂歡節人偶', rarity:'稀有', quality:'玩具', weight:.4, note:'打開後裡面還有一張小臉。' },
    { icon:'🤡', name:'狂歡節小丑鼻子', rarity:'普通', quality:'玩具', weight:.03, note:'按下去會發出怪聲。' },
    { icon:'🎺', name:'狂歡節喇叭', rarity:'普通', quality:'玩具', weight:.28, note:'吹出來的聲音像笑聲。' },
    { icon:'🥁', name:'狂歡節小鼓', rarity:'稀有', quality:'玩具', weight:.7, note:'鼓面還在自己震動。' },
    { icon:'🎨', name:'狂歡節顏料盤', rarity:'普通', quality:'玩具', weight:.2, note:'顏料遇水不散。' },
    { icon:'🃏', name:'狂歡節撲克牌', rarity:'稀有', quality:'玩具', weight:.08, note:'少了一張鬼牌。' },
    { icon:'💍', name:'狂歡節戒指', rarity:'稀有', quality:'飾品', weight:.02, note:'內側刻著陌生名字。' },
    { icon:'📿', name:'狂歡節項鍊', rarity:'稀有', quality:'飾品', weight:.08, note:'珠子像眼睛一樣反光。' },
    { icon:'👑', name:'狂歡節王冠', rarity:'傳說', quality:'飾品', weight:.36, note:'戴上後會聽見掌聲。' },
    { icon:'💎', name:'狂歡節寶石', rarity:'傳說', quality:'飾品', weight:.05, note:'內部有彩色漩渦。' },
    { icon:'🪶', name:'狂歡節羽毛飾品', rarity:'稀有', quality:'飾品', weight:.03, note:'羽毛會自己輕輕抖動。' }
  ];

  function pick() {
    const item = pool[Math.floor(Math.random() * pool.length)];
    return { ...item, zone:'狂歡島遺失物', kind:'treasure', at:Date.now() };
  }
  function read(k, fb) { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(fb)); } catch(e) { return fb; } }
  function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  function addToBag(item) {
    const bag = read('coffeeShipFishBag', []);
    bag.push(item || pick());
    save('coffeeShipFishBag', bag.slice(-180));
  }
  function normalizeOldCarnivalLoot() {
    const bag = read('coffeeShipFishBag', []);
    let changed = false;
    const next = bag.map(item => {
      if (!item || item.kind !== 'treasure') return item;
      if (item.name === '狂歡面具' || item.name === '狂歡節面具' || item.name === '華麗羽毛帽') {
        changed = true;
        return pick();
      }
      return item;
    });
    if (changed) save('coffeeShipFishBag', next.slice(-180));
  }
  window.COFFEE_SHIP_CARNIVAL_LOOT = { pool, pick, addToBag, normalizeOldCarnivalLoot };
  setInterval(normalizeOldCarnivalLoot, 1500);
})();