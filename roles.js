(() => {
  'use strict';

  const W = 960;
  const H = 576;
  let active = false;
  let overlay;
  let ctx;
  let player = { x: 150, y: 395, speed: 2.4, emote: null, emoteTimer: 0 };
  const keys = new Set();
  const mobile = { up:false, down:false, left:false, right:false };
  let wave = 0;
  let light = 0;

  function isDeckOpen() {
    const deck = document.getElementById('deckOverlay');
    return deck && !deck.classList.contains('hidden');
  }

  function isPortOpen() {
    return active;
  }

  function getDeckPlayerGuess() {
    return { x: 840, y: 405 };
  }

  function nearDeckPortGate() {
    if (!isDeckOpen()) return false;
    return true;
  }

  function addStyle() {
    if (document.getElementById('portStyle')) return;
    const style = document.createElement('style');
    style.id = 'portStyle';
    style.textContent = `
      .port-overlay{position:absolute;left:0;top:0;width:100%;height:100%;z-index:13;pointer-events:none;image-rendering:pixelated}.port-overlay.hidden{display:none}
      .port-tip{position:absolute;left:50%;top:118px;transform:translateX(-50%);z-index:14;color:#fff4d8;background:rgba(21,16,32,.92);border:2px solid #76536a;border-radius:12px;padding:8px 12px;font-weight:900;pointer-events:none;box-shadow:0 6px 0 rgba(0,0,0,.25);max-width:90%;text-align:center}.port-tip.hidden{display:none}
      .port-gate{position:absolute;right:18px;top:50%;z-index:12;transform:translateY(-50%);font-size:34px;text-shadow:2px 2px 0 #120b17;pointer-events:none;animation:port-pulse 1.4s ease-in-out infinite}.port-gate.hidden{display:none}@keyframes port-pulse{0%,100%{opacity:.72;transform:translateY(-50%) scale(1)}50%{opacity:1;transform:translateY(-50%) scale(1.08)}}
    `;
    document.head.appendChild(style);
  }

  function makeOverlay() {
    const panel = document.getElementById('gamePanel');
    if (!panel || document.getElementById('portOverlay')) return;
    if (getComputedStyle(panel).position === 'static') panel.style.position = 'relative';
    overlay = document.createElement('canvas');
    overlay.id = 'portOverlay';
    overlay.className = 'port-overlay hidden';
    overlay.width = W;
    overlay.height = H;
    ctx = overlay.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    panel.appendChild(overlay);

    const tip = document.createElement('div');
    tip.id = 'portTip';
    tip.className = 'port-tip hidden';
    panel.appendChild(tip);

    const gate = document.createElement('div');
    gate.id = 'portGate';
    gate.className = 'port-gate hidden';
    gate.textContent = '⚓';
    panel.appendChild(gate);
  }

  function setTip(text, show) {
    const tip = document.getElementById('portTip');
    if (!tip) return;
    tip.textContent = text;
    tip.classList.toggle('hidden', !show);
  }

  function setGate(show) {
    const gate = document.getElementById('portGate');
    if (gate) gate.classList.toggle('hidden', !show);
  }

  function px(x,y,w,h,c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
  function text(t,x,y,size=16,c='#fff4d8') {
    ctx.font = `900 ${size}px ui-rounded, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#120b17'; ctx.fillText(t,x+2,y+2);
    ctx.fillStyle = c; ctx.fillText(t,x,y);
  }

  function openPort() {
    if (!overlay) return;
    active = true;
    window.COFFEE_SHIP_SCENE = 'port';
    overlay.classList.remove('hidden');
    setGate(false);
    player.x = 130;
    player.y = 410;
    setTip('⚓ Port｜港口開放了。左側按 E 回甲板，右側未來可前往小島。', true);
    setTimeout(() => { if (active) setTip('', false); }, 4200);
  }

  function closePort() {
    active = false;
    window.COFFEE_SHIP_SCENE = 'deck';
    overlay?.classList.add('hidden');
    setTip('', false);
    keys.clear();
    Object.keys(mobile).forEach(k => mobile[k] = false);
  }

  function drawSky() {
    px(0,0,W,H,'#081426');
    px(0,210,W,170,'#102842');
    for (let i=0;i<65;i++) {
      const x=(i*97)%W;
      const y=28+((i*43)%165);
      const on=Math.sin(Date.now()/700+i)>.15;
      px(x,y,on?3:2,on?3:2,on?'#fff4d8':'#7ba0c8');
    }
    px(695,78,52,52,'#ffe9a8');
    px(720,68,42,62,'#081426');
    light += .025;
    px(760,165,26,76,'#f0a75c');
    px(752,152,42,18,'#d7bb79');
    px(770,132,16,22, Math.sin(light) > 0 ? '#fff4d8' : '#f0a75c');
    text('燈塔',772,258,14,'#ffe5ae');
  }

  function drawSea() {
    wave += .04;
    px(0,270,W,306,'#0a3551');
    for (let row=0; row<9; row++) {
      for (let x=-80; x<W+80; x+=76) {
        text('≈≈≈', x + Math.sin(wave+row)*24, 298+row*29, 18, row%2?'#5fc6d8':'#9ce8f0');
      }
    }
    px(120,250,190,40,'#1b1a25');
    px(150,230,90,35,'#3d2a32');
    text('Coffee Ship',210,256,16,'#fff4d8');
    px(158,218,38,12,'#ffe5ae');
  }

  function drawPier() {
    px(75,360,810,120,'#6e4938');
    px(75,360,810,18,'#a56b45');
    for (let x=88; x<870; x+=52) px(x,382,6,94,'#4e332d');
    for (let x=115; x<850; x+=95) {
      px(x,335,18,44,'#3d2a32');
      px(x+4,325,10,12,'#ffe5ae');
    }
    px(88,384,50,72,'#221728');
    text('← 甲板',125,470,14,'#ffe5ae');
    px(810,384,58,72,'#221728');
    text('小島 soon',838,470,14,'#9ce8f0');
    text('⚓ Port',480,344,28,'#fff4d8');
    text('木棧道、燈塔與夜海',480,374,16,'#9ce8f0');
    text('🪑',355,420,28); text('🎣',575,420,28); text('🦜',665,330,28);
  }

  function drawPlayer() {
    const x = Math.round(player.x), y = Math.round(player.y);
    px(x-12,y+18,24,5,'#120b17');
    px(x-11,y-26,22,20,'#f0c7a0');
    px(x-14,y-34,28,12,'#2b1d16');
    px(x-14,y-6,28,28,'#c96a4a');
    px(x-9,y+21,7,15,'#2a2634');
    px(x+3,y+21,7,15,'#2a2634');
    px(x-5,y-18,4,4,'#21182a'); px(x+5,y-18,4,4,'#21182a');
    text('你',x,y-46,13,'#79d0b1');
    if (player.emoteTimer>0) text(player.emote,x,y-66,22,'#fff4d8');
  }

  function updatePlayer() {
    let dx=0, dy=0;
    if (keys.has('ArrowUp') || keys.has('w') || mobile.up) dy-=player.speed;
    if (keys.has('ArrowDown') || keys.has('s') || mobile.down) dy+=player.speed;
    if (keys.has('ArrowLeft') || keys.has('a') || mobile.left) dx-=player.speed;
    if (keys.has('ArrowRight') || keys.has('d') || mobile.right) dx+=player.speed;
    if (dx && dy) { dx*=.707; dy*=.707; }
    player.x = Math.max(105, Math.min(850, player.x + dx));
    player.y = Math.max(370, Math.min(455, player.y + dy));
    if (player.emoteTimer>0) player.emoteTimer--;
  }

  function loop() {
    if (active && ctx) {
      updatePlayer();
      drawSky(); drawSea(); drawPier(); drawPlayer();
      const nearBack = Math.hypot(player.x-115, player.y-415)<70;
      setTip(nearBack ? '🚪 按 E 回甲板' : '', nearBack);
    } else {
      setGate(isDeckOpen());
    }
    requestAnimationFrame(loop);
  }

  function block(e) { e.preventDefault(); e.stopImmediatePropagation(); }
  function onKeyDown(e) {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (active) {
      keys.add(k);
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','e',' '].includes(k) || e.code==='Space') block(e);
      if (k==='e' && Math.hypot(player.x-115, player.y-415)<70) closePort();
      if (e.code==='Space') { player.emote='⚓'; player.emoteTimer=80; }
      return;
    }
    if (isDeckOpen() && k==='e') {
      block(e);
      openPort();
    }
  }

  function onKeyUp(e) { keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key); }

  function bindMobile() {
    const map = { up:'ArrowUp', down:'ArrowDown', left:'ArrowLeft', right:'ArrowRight' };
    document.querySelectorAll('[data-move]').forEach(btn => {
      const d = btn.dataset.move;
      btn.addEventListener('pointerdown', e => { if (active) { mobile[d]=true; e.preventDefault(); e.stopPropagation(); } }, true);
      ['pointerup','pointerleave','pointercancel'].forEach(type => btn.addEventListener(type, () => { mobile[d]=false; }, true));
    });
    document.getElementById('sitBtn')?.addEventListener('click', e => {
      if (active) { e.preventDefault(); e.stopPropagation(); Math.hypot(player.x-115, player.y-415)<70 ? closePort() : (player.emote='🌊', player.emoteTimer=80); }
      else if (isDeckOpen()) { e.preventDefault(); e.stopPropagation(); openPort(); }
    }, true);
    document.getElementById('emoteBtn')?.addEventListener('click', e => { if (active) { e.preventDefault(); e.stopPropagation(); player.emote='⚓'; player.emoteTimer=80; } }, true);
  }

  function init() {
    addStyle();
    makeOverlay();
    bindMobile();
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    loop();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
