(() => {
  'use strict';
  const fish = [
    ['小沙丁魚','普通',0.03,0.18],['銀鱗小魚','普通',0.05,0.35],['月光鯷魚','普通',0.04,0.42],['咖啡豆魚','普通',0.08,0.55],['奶泡魚','普通',0.12,0.8],
    ['港口竹筴魚','常見',0.3,1.2],['星斑鯖魚','常見',0.45,1.8],['藍線魚','常見',0.25,1.1],['焦糖鯛','常見',0.6,2.3],['木棧道石斑','常見',0.8,3.6],
    ['夜光魷魚','稀有',0.5,2.8],['珍珠河豚','稀有',0.7,3.1],['藍寶石鮪幼魚','稀有',2.2,8.5],['星空鰻','稀有',1.1,5.6],['玫瑰金鯉','稀有',0.9,4.8],
    ['深海拿鐵鯊','史詩',12,48],['銀河旗魚','史詩',18,72],['古代鸚鵡螺','史詩',5,25],['月影魟魚','史詩',9,38],['黑潮大鮪魚','史詩',26,120],
    ['傳說咖啡鯨','傳說',300,1200],['星海龍魚','傳說',45,180],['黃金船錨魚','傳說',20,90],['宇宙翻車魚','傳說',150,800]
  ];
  const rarity = { '普通':52, '常見':32, '稀有':12, '史詩':3.4, '傳說':0.6 };
  const colors = { '普通':'#fff4d8', '常見':'#9ce8f0', '稀有':'#79d0b1', '史詩':'#e9a6b0', '傳說':'#ffe16b' };
  let busy = false;
  let cooldown = 0;
  let noticeTimer = 0;
  let notice = '';
  let noticeColor = '#fff4d8';
  let count = Number(localStorage.getItem('coffeeShipCatchCount') || 0);
  let best = null;
  try { best = JSON.parse(localStorage.getItem('coffeeShipBestFish') || 'null'); } catch(e) {}

  function isDeckOpen() {
    const deck = document.getElementById('deckOverlay');
    return deck && !deck.classList.contains('hidden');
  }
  function getDeckCtx() {
    const deck = document.getElementById('deckOverlay');
    return deck ? deck.getContext('2d') : null;
  }
  function addStyle() {
    if (document.getElementById('deckFishingStyle')) return;
    const s = document.createElement('style');
    s.id = 'deckFishingStyle';
    s.textContent = '.fishing-card{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:30;background:rgba(21,16,32,.96);border:3px solid #d7bb79;border-radius:18px;padding:16px;color:#fff4d8;text-align:center;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.28);pointer-events:none}.fishing-card.hidden{display:none}@media(max-width:760px){.fishing-card{min-width:245px;font-size:14px;padding:13px}}';
    document.head.appendChild(s);
  }
  function ensureCard() {
    const panel = document.getElementById('gamePanel');
    if (!panel || document.getElementById('fishingCard')) return;
    if (getComputedStyle(panel).position === 'static') panel.style.position = 'relative';
    const card = document.createElement('div');
    card.id = 'fishingCard';
    card.className = 'fishing-card hidden';
    panel.appendChild(card);
  }
  function chooseRarity() {
    const total = Object.values(rarity).reduce((a,b)=>a+b,0);
    let r = Math.random() * total;
    for (const [k,w] of Object.entries(rarity)) { r -= w; if (r <= 0) return k; }
    return '普通';
  }
  function showCard(item) {
    const card = document.getElementById('fishingCard');
    if (!card) return;
    const bestText = best ? `最大紀錄：${best.name} ${best.weight.toFixed(2)} kg` : '最大紀錄：尚無';
    card.innerHTML = `<div style="font-size:22px;color:${colors[item.rarity]}">釣到了 ${item.name}</div><div style="margin-top:8px;line-height:1.6">稀有度：${item.rarity}<br>重量：${item.weight.toFixed(2)} kg<br>總釣獲：${count} 隻<br>${bestText}</div>`;
    card.classList.remove('hidden');
    setTimeout(()=>card.classList.add('hidden'), 3600);
  }
  function catchFish() {
    const r = chooseRarity();
    const list = fish.filter(f => f[1] === r);
    const f = list[Math.floor(Math.random() * list.length)];
    const weight = f[2] + Math.pow(Math.random(), 1.7) * (f[3] - f[2]);
    const item = { name:f[0], rarity:r, weight, at:Date.now() };
    count += 1;
    localStorage.setItem('coffeeShipCatchCount', String(count));
    if (!best || item.weight > best.weight) { best = item; localStorage.setItem('coffeeShipBestFish', JSON.stringify(best)); }
    notice = `${item.name} ${item.weight.toFixed(2)}kg`;
    noticeColor = colors[item.rarity] || '#fff4d8';
    noticeTimer = 260;
    showCard(item);
  }
  function startFishing() {
    if (!isDeckOpen() || busy || cooldown > 0) return;
    busy = true;
    cooldown = 180;
    notice = '拋竿中...';
    noticeColor = '#9ce8f0';
    noticeTimer = 120;
    setTimeout(() => { if (isDeckOpen()) catchFish(); busy = false; }, 900 + Math.random() * 1600);
  }
  function draw() {
    if (!isDeckOpen()) return;
    const ctx = getDeckCtx();
    if (!ctx) return;
    ctx.save();
    ctx.font = '900 24px ui-rounded, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#120b17'; ctx.fillText('釣魚點', 820+2, 336+2);
    ctx.fillStyle = '#9ce8f0'; ctx.fillText('釣魚點', 820, 336);
    ctx.font = '900 13px ui-rounded, system-ui, sans-serif';
    ctx.fillStyle = '#120b17'; ctx.fillText('按 F 或手機按咖啡鍵', 820+2, 360+2);
    ctx.fillStyle = '#fff4d8'; ctx.fillText('按 F 或手機按咖啡鍵', 820, 360);
    if (noticeTimer > 0) {
      ctx.font = '900 15px ui-rounded, system-ui, sans-serif';
      ctx.fillStyle = '#120b17'; ctx.fillText(notice, 690+2, 334+2);
      ctx.fillStyle = noticeColor; ctx.fillText(notice, 690, 334);
      noticeTimer--;
    }
    ctx.restore();
  }
  function bind() {
    window.addEventListener('keydown', e => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (isDeckOpen() && (k === 'f' || k === 'c')) { e.preventDefault(); startFishing(); }
    }, true);
    document.getElementById('coffeeBtn')?.addEventListener('click', e => {
      if (!isDeckOpen()) return;
      e.preventDefault(); e.stopPropagation(); startFishing();
    }, true);
  }
  function loop() { requestAnimationFrame(loop); if (cooldown > 0) cooldown--; draw(); }
  function init() { addStyle(); ensureCard(); bind(); loop(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
