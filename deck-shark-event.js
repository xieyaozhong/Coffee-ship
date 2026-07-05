(() => {
  'use strict';
  if (window.__COFFEE_SHIP_SHARK_EVENT_V3__) return;
  window.__COFFEE_SHIP_SHARK_EVENT_V3__ = true;

  const sharks = [
    ['黑鰭礁鯊','常見',18,42,1],['護士鯊','常見',25,80,1],['雙髻鯊','稀有',80,230,2],['虎鯊','稀有',150,520,3],['大白鯊','史詩',420,1100,5],['深海幽影鯊','史詩',260,900,4],['巨齒鯊','傳說',9000,52000,9],['星海巨齒鯊','傳說',12000,88000,12]
  ];

  const colors = {常見:'#9ce8f0',稀有:'#79d0b1',史詩:'#e9a6b0',傳說:'#ffe16b'};

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  }

  function chance() {
    return window.COFFEE_SHIP_ECONOMY?.eventChance?.(.08,'special')
      ?? Math.min(.7, .08 * Math.max(1, Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.fishingLuck || 1)));
  }

  function pickShark() {
    const luck = window.COFFEE_SHIP_ECONOMY?.fishingModifiers?.().fishingLuck
      ?? Math.max(1, Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.fishingLuck || 1));
    const roll = Math.min(.999, Math.random() * (1 / Math.min(1.8, luck)));
    let pool = sharks.filter(shark => shark[1] === '常見');
    if (roll > .55) pool = sharks.filter(shark => shark[1] === '稀有');
    if (roll > .84) pool = sharks.filter(shark => shark[1] === '史詩');
    if (roll > .97) pool = sharks.filter(shark => shark[1] === '傳說');
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function eatBag(maxEat) {
    const bag = read('coffeeShipFishBag', []);
    const edible = bag.filter(item => item && item.kind !== 'trash' && item.kind !== 'letter' && item.kind !== 'currency');
    const keep = bag.filter(item => !item || item.kind === 'trash' || item.kind === 'letter' || item.kind === 'currency');
    const eaten = [];
    for (let index = 0; index < maxEat && edible.length; index += 1) {
      const selected = Math.floor(Math.random() * edible.length);
      eaten.push(edible.splice(selected, 1)[0]);
    }
    save('coffeeShipFishBag', keep.concat(edible).slice(-240));
    if (eaten.length) window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'shark',eaten}}));
    return eaten;
  }

  function trigger(event) {
    if (Math.random() > chance()) return;
    const shark = pickShark();
    const eaten = eatBag(shark[4]);
    const weight = shark[2] + Math.random() * (shark[3] - shark[2]);
    const loss = eaten.length
      ? `牠吃掉了 ${eaten.length} 件漁獲：${eaten.map(item => item.name || '未知漁獲').join('、')}`
      : '背包裡沒有可吃的漁獲，牠繞了一圈就離開了。';
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({
      castId:event.detail?.castId,
      eventKind:'shark',
      title:`鯊魚事件｜${shark[0]}`,
      icon:'🦈',
      accent:colors[shark[1]] || '#e9a6b0',
      text:`稀有度：${shark[1]}。體重約 ${weight.toFixed(0)} kg。${loss}`
    });
  }

  function init() {
    window.addEventListener('coffee-ship:fishing-result', trigger);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();