(() => {
  'use strict';
  if (window.__COFFEE_SHIP_MERMAID_EVENT_V3__) return;
  window.__COFFEE_SHIP_MERMAID_EVENT_V3__ = true;

  const encounters = [
    ['月光歌聲','美人魚在月光下浮出水面，唱了一段只有海浪聽得懂的歌。','🐚','月光貝殼','treasure'],
    ['深海珍珠','她把一顆冰涼的巨大珍珠放在船邊，微笑後潛回海裡。','💎','巨大珍珠','treasure'],
    ['魚群祝福','她輕拍海面，魚群從船底閃過。接下來一段時間，稀有魚似乎更靠近了。','✨','魚群祝福','buff'],
    ['藍色鱗片','她留下一片會發光的藍色鱗片，上面有細小的星點。','🧜‍♀️','美人魚鱗片','treasure'],
    ['失落航海圖','美人魚遞來一張被海水泡軟的圖，上面畫著不存在的島。','🗺️','失落航海圖','letter'],
    ['海潮安眠曲','她的歌聲讓海面安靜下來，連遠方的鯊魚影子也退去了。','🌊','安眠潮聲','buff'],
    ['傳說魚餌','她把一枚閃亮魚餌拋上甲板，像一顆小星星。','🎣','傳說魚餌','treasure'],
    ['皇冠碎片','她從貝殼盒中取出一枚金色碎片，像某個沉沒王國的遺物。','👑','海底皇冠碎片','treasure'],
    ['瓶中歌詞','她留下漂流瓶，裡面不是求救信，而是一段沒有結尾的歌詞。','🍾','美人魚歌詞瓶','letter'],
    ['深海藍寶','她指向海面，浪花中浮出一顆深藍色寶石。','🔷','深海藍寶','treasure'],
    ['無聲的微笑','她只是看著你，像知道愛麗兒所有沒說完的話。','💙','無聲祝福','buff'],
    ['泡沫道別','她化成一串泡泡離開，泡泡裡短暫映出一座遙遠的白色宮殿。','🫧','泡沫記憶','letter']
  ];

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  }

  function chance() {
    return window.COFFEE_SHIP_ECONOMY?.eventChance?.(.05,'special')
      ?? Math.min(.7, .05 * Math.max(1, Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.fishingLuck || 1)));
  }

  function grant(encounter) {
    if (encounter[4] === 'buff') {
      localStorage.setItem('coffeeShipMermaidBuffUntil', String(Date.now() + 10 * 60 * 1000));
      return;
    }
    const bag = read('coffeeShipFishBag', []);
    bag.push({
      name:encounter[3],zone:'美人魚事件',rarity:'傳說',quality:'祝福',
      weight:0.01 + Math.random() * 0.4,kind:encounter[4] === 'letter' ? 'letter' : 'treasure',
      icon:encounter[2],price:encounter[4] === 'treasure' ? 90 : undefined,at:Date.now()
    });
    save('coffeeShipFishBag', bag.slice(-240));
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'mermaid'}}));
  }

  function trigger(event) {
    if (Math.random() > chance()) return;
    const encounter = encounters[Math.floor(Math.random() * encounters.length)];
    grant(encounter);
    const log = read('coffeeShipMermaidEncounters', []);
    log.push({title:encounter[0],text:encounter[1],at:Date.now()});
    save('coffeeShipMermaidEncounters', log.slice(-30));
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({
      castId:event.detail?.castId,
      eventKind:'mermaid',
      title:`美人魚事件｜${encounter[0]}`,
      icon:'🧜‍♀️',
      accent:'#9ce8f0',
      text:`${encounter[1]} 獲得：${encounter[2]} ${encounter[3]}`
    });
  }

  function init() {
    window.addEventListener('coffee-ship:fishing-result', trigger);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();