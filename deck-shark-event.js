(() => {
  'use strict';

  const sharks = [
    ['黑鰭礁鯊','常見',18,42,1],
    ['護士鯊','常見',25,80,1],
    ['雙髻鯊','稀有',80,230,2],
    ['虎鯊','稀有',150,520,3],
    ['大白鯊','史詩',420,1100,5],
    ['深海幽影鯊','史詩',260,900,4],
    ['巨齒鯊','傳說',9000,52000,9],
    ['星海巨齒鯊','傳說',12000,88000,12]
  ];
  const colors = { '常見':'#9ce8f0', '稀有':'#79d0b1', '史詩':'#e9a6b0', '傳說':'#ffe16b' };
  let locked = false;

  function isDeckOpen() {
    const deck = document.getElementById('deckOverlay');
    return deck && !deck.classList.contains('hidden');
  }

  function addStyle() {
    if (document.getElementById('sharkEventStyle')) return;
    const style = document.createElement('style');
    style.id = 'sharkEventStyle';
    style.textContent = '.shark-card{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);z-index:45;background:rgba(16,12,22,.98);border:3px solid #e9a6b0;border-radius:18px;padding:16px;color:#fff4d8;text-align:center;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.32);pointer-events:none;line-height:1.55;max-width:92%}.shark-card.hidden{display:none}.shark-loss{margin-top:10px;padding:10px;border:2px solid #76536a;border-radius:12px;background:#1a1220;color:#ffd4d8;text-align:left}@media(max-width:760px){.shark-card{position:fixed;min-width:260px;font-size:14px;padding:13px;max-height:70dvh;overflow-y:auto}}';
    document.head.appendChild(style);
  }

  function ensureCard() {
    const panel = document.getElementById('gamePanel');
    if (!panel || document.getElementById('sharkCard')) return;
    if (getComputedStyle(panel).position === 'static') panel.style.position = 'relative';
    const card = document.createElement('div');
    card.id = 'sharkCard';
    card.className = 'shark-card hidden';
    panel.appendChild(card);
  }

  function pickShark() {
    const r = Math.random();
    let pool = sharks.filter(s => s[1] === '常見');
    if (r > .55) pool = sharks.filter(s => s[1] === '稀有');
    if (r > .84) pool = sharks.filter(s => s[1] === '史詩');
    if (r > .97) pool = sharks.filter(s => s[1] === '傳說');
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function eatBag(maxEat) {
    let bag = [];
    try { bag = JSON.parse(localStorage.getItem('coffeeShipFishBag') || '[]'); } catch (e) {}
    const edible = bag.filter(x => x && x.kind !== 'trash' && x.kind !== 'letter');
    const keep = bag.filter(x => !x || x.kind === 'trash' || x.kind === 'letter');
    const eaten = [];
    for (let i = 0; i < maxEat && edible.length; i++) {
      const idx = Math.floor(Math.random() * edible.length);
      eaten.push(edible.splice(idx, 1)[0]);
    }
    localStorage.setItem('coffeeShipFishBag', JSON.stringify(keep.concat(edible).slice(-80)));
    return eaten;
  }

  function show(shark, eaten) {
    const card = document.getElementById('sharkCard');
    if (!card) return;
    const weight = shark[2] + Math.random() * (shark[3] - shark[2]);
    const color = colors[shark[1]] || '#fff4d8';
    const list = eaten.length ? eaten.map(x => `被吃掉：${x.name || '漁獲'} ${Number(x.weight || 0).toFixed(2)}kg`).join('<br>') : '背包沒有可吃的漁獲，牠繞了一圈就離開了。';
    card.innerHTML = `<div style="font-size:24px;color:${color}">🦈 ${shark[0]}</div><div>稀有度：${shark[1]}<br>體重：約 ${weight.toFixed(0)} kg</div><div class="shark-loss">${list}</div>`;
    card.classList.remove('hidden');
    setTimeout(() => card.classList.add('hidden'), 5200);
  }

  function trigger(event) {
    if (!isDeckOpen() || locked) return false;
    if (Math.random() > 0.18) return false;
    locked = true;
    event?.preventDefault?.();
    event?.stopImmediatePropagation?.();
    setTimeout(() => {
      const shark = pickShark();
      const eaten = eatBag(shark[4]);
      show(shark, eaten);
      locked = false;
    }, 550 + Math.random() * 900);
    return true;
  }

  function bind() {
    window.addEventListener('keydown', event => {
      const k = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (k === 'f' || k === 'c') trigger(event);
    }, true);
    document.getElementById('coffeeBtn')?.addEventListener('click', event => trigger(event), true);
  }

  function init() {
    addStyle();
    ensureCard();
    bind();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
