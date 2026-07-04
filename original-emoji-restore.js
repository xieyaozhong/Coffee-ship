(() => {
  'use strict';

  const bottleIcons = {
    coffeeShipBottleLetters:'😂',
    coffeeShipLanarLetters:'🌊',
    coffeeShipArielLetters:'🧜‍♀️',
    coffeeShipIslandLetters:'🏝️',
    coffeeShipBlackbeardLetters:'🏴‍☠️',
    coffeeShipMadPriestLetters:'📜',
    coffeeShipCarnivalLetters:'🎭',
    coffeeShipTurtleSoupLetters:'🍲'
  };
  const bottleSeries = {
    coffeeShipBottleLetters:'冷笑話漂流瓶',
    coffeeShipLanarLetters:'拉納爾漂流瓶',
    coffeeShipArielLetters:'愛麗兒漂流瓶',
    coffeeShipIslandLetters:'可可漂流瓶',
    coffeeShipBlackbeardLetters:'黑鬍子藏寶圖',
    coffeeShipMadPriestLetters:'瘋狂神父殘頁',
    coffeeShipCarnivalLetters:'狂歡島漂流瓶',
    coffeeShipTurtleSoupLetters:'海龜湯神秘故事'
  };
  const itemRules = [
    [/冷笑話/, '😂'], [/拉納爾/, '🌊'], [/愛麗兒/, '🧜‍♀️'], [/哈斯|可可|莫納|孤島/, '🏝️'], [/黑鬍子|藏寶圖/, '🏴‍☠️'], [/瘋狂神父|神父|殘頁/, '📜'], [/狂歡島漂流瓶/, '🎭'], [/海龜湯/, '🍲'],
    [/狐狸面具/, '🦊'], [/狼面具/, '🐺'], [/獅子面具/, '🦁'], [/老虎面具/, '🐯'], [/熊面具/, '🐻'], [/貓頭鷹面具/, '🦉'], [/鹿角面具/, '🦌'], [/山羊面具/, '🐐'], [/野豬面具/, '🐗'], [/蛇神面具/, '🐍'], [/面具/, '🎭'],
    [/內衣/, '👙'], [/內褲|短褲/, '🩲'], [/襪/, '🧦'], [/襯衫/, '👕'], [/燕尾服/, '👔'], [/晚禮服|洋裝|禮服/, '👗'], [/披風/, '🧥'], [/手套/, '🧤'], [/圍巾/, '🧣'], [/羽毛帽|帽/, '👒'], [/高帽|禮帽/, '🎩'], [/高跟鞋/, '👠'], [/長靴/, '👢'], [/皮鞋/, '👞'], [/絲帶|緞帶/, '🎀'],
    [/氣球/, '🎈'], [/悠悠球/, '🪀'], [/風箏/, '🪁'], [/木馬|音樂盒/, '🎠'], [/人偶|布偶|玩偶/, '🪆'], [/小丑鼻子/, '🤡'], [/喇叭/, '🎺'], [/小鼓/, '🥁'], [/顏料/, '🎨'], [/撲克|牌/, '🃏'], [/骰子/, '🎲'], [/玩偶熊/, '🧸'], [/彩罐/, '🪅'], [/沙鈴/, '🪇'], [/雜耍球/, '🎪'],
    [/戒指/, '💍'], [/項鍊/, '📿'], [/王冠|皇冠/, '👑'], [/寶石/, '💎'], [/羽毛飾品/, '🪶'], [/徽章/, '🏵️'], [/勳章/, '🏅'], [/胸針/, '💠'], [/耳環/, '✨'], [/腳環|銀鈴/, '🔔'],
    [/龜殼|海龜/, '🐢'], [/吸管/, '🥤'], [/海象牙|海象角|海象/, '🦷'], [/手術刀|生鏽工具|醫療器具/, '🔪'], [/人皮|漂流者|遺物|皮革/, '🧩'], [/珍珠/, '🦪'], [/垃圾|塑膠|瓶蓋/, '🗑️']
  ];
  function read(k, fb){ try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(fb)); } catch(e){ return fb; } }
  function save(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
  function cleanEmoji(text){ return String(text || '').replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '').trim(); }
  function iconFor(name, fallback){ const rule = itemRules.find(([re]) => re.test(name || '')); return rule ? rule[1] : (fallback || '📦'); }
  function normalizeBottles(){
    Object.keys(bottleIcons).forEach(key => {
      const list = read(key, []);
      if(!Array.isArray(list)) return;
      let changed = false;
      const next = list.map(x => {
        if(!x || typeof x !== 'object') return x;
        const y = { ...x };
        if(y.icon !== bottleIcons[key]) { y.icon = bottleIcons[key]; changed = true; }
        if(y.series !== bottleSeries[key]) { y.series = bottleSeries[key]; changed = true; }
        return y;
      });
      if(changed) save(key, next.slice(-120));
    });
  }
  function normalizeBag(){
    const bag = read('coffeeShipFishBag', []);
    if(!Array.isArray(bag)) return;
    let changed = false;
    const next = bag.map(x => {
      if(!x || typeof x !== 'object') return x;
      const name = cleanEmoji(x.name || x.title || '');
      const icon = iconFor(`${name} ${x.zone || ''} ${x.quality || ''}`, x.icon);
      if(x.icon !== icon || x.emoji !== icon || (x.name && x.name !== name)) {
        changed = true;
        return { ...x, icon, emoji:icon, name:name || x.name };
      }
      return x;
    });
    if(changed) save('coffeeShipFishBag', next.slice(-220));
  }
  function patchRuntime(){
    if(window.COFFEE_SHIP_BOTTLE_RESTORE?.META?.priest) window.COFFEE_SHIP_BOTTLE_RESTORE.META.priest.icon = '📜';
    if(window.COFFEE_SHIP_DB?.bottles) {
      window.COFFEE_SHIP_DB.bottles.forEach(row => {
        if(!Array.isArray(row)) return;
        const id = row[0];
        if(id === 'mad_priest' || id === 'priest') row[1] = '📜';
        if(id === 'island') row[1] = '🏝️';
        if(id === 'joke') row[1] = '😂';
        if(id === 'lanar') row[1] = '🌊';
        if(id === 'ariel') row[1] = '🧜‍♀️';
        if(id === 'blackbeard') row[1] = '🏴‍☠️';
        if(id === 'carnival') row[1] = '🎭';
        if(id === 'turtle_soup') row[1] = '🍲';
      });
    }
    if(window.COFFEE_SHIP_EMOJI) {
      window.COFFEE_SHIP_EMOJI.uniqueEmoji.mad_priest = '📜';
      window.COFFEE_SHIP_EMOJI.uniqueEmoji.island = '🏝️';
      window.COFFEE_SHIP_EMOJI.uniqueEmoji.joke = '😂';
      window.COFFEE_SHIP_EMOJI.uniqueEmoji.lanar = '🌊';
      window.COFFEE_SHIP_EMOJI.uniqueEmoji.ariel = '🧜‍♀️';
      window.COFFEE_SHIP_EMOJI.uniqueEmoji.blackbeard = '🏴‍☠️';
      window.COFFEE_SHIP_EMOJI.uniqueEmoji.carnival = '🎭';
      window.COFFEE_SHIP_EMOJI.uniqueEmoji.turtle_soup = '🍲';
    }
  }
  function init(){ patchRuntime(); normalizeBottles(); normalizeBag(); setInterval(() => { patchRuntime(); normalizeBottles(); normalizeBag(); }, 1200); }
  window.COFFEE_SHIP_ORIGINAL_EMOJI = { bottleIcons, bottleSeries, itemRules, normalizeBottles, normalizeBag };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();