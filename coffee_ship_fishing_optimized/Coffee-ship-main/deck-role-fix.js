(() => {
  'use strict';

  let pos = { x: 145, y: 360 };
  const keys = new Set();
  const mobile = { up:false, down:false, left:false, right:false };
  const speed = 2.4;

  function getRole() {
    try {
      const raw = localStorage.getItem('coffeeShipRole');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function isDeckOpen() {
    const deck = document.getElementById('deckOverlay');
    return deck && !deck.classList.contains('hidden');
  }

  function px(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  function label(ctx, text, x, y, color = '#fff4d8') {
    ctx.font = '900 12px ui-rounded, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#120b17';
    ctx.fillText(text, x + 2, y + 2);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  function baseHuman(ctx, x, y, cfg) {
    px(ctx, x - 20, y + 25, 40, 7, 'rgba(18,11,23,.85)');
    px(ctx, x - 16, y - 38, 32, 27, cfg.hair || '#2b1d16');
    px(ctx, x - 12, y - 31, 24, 22, '#f0c7a0');
    px(ctx, x - 18, y - 14, 36, 44, cfg.main || '#3b2b44');
    px(ctx, x - 24, y - 7, 8, 28, cfg.sleeve || cfg.main || '#3b2b44');
    px(ctx, x + 16, y - 7, 8, 28, cfg.sleeve || cfg.main || '#3b2b44');
    px(ctx, x - 12, y + 28, 8, 18, '#22202d');
    px(ctx, x + 4, y + 28, 8, 18, '#22202d');
    px(ctx, x - 6, y - 22, 4, 4, '#21182a');
    px(ctx, x + 4, y - 22, 4, 4, '#21182a');
    px(ctx, x - 4, y - 13, 8, 3, '#b86766');
  }

  function drawMaid(ctx, x, y) {
    baseHuman(ctx, x, y, { hair:'#5a3526', main:'#151019', sleeve:'#fff4d8' });
    px(ctx, x - 21, y - 48, 42, 7, '#fff4d8');
    px(ctx, x - 16, y - 54, 9, 9, '#fff4d8');
    px(ctx, x + 7, y - 54, 9, 9, '#fff4d8');
    px(ctx, x - 13, y - 10, 26, 36, '#fff4d8');
    px(ctx, x - 17, y + 18, 34, 8, '#fff4d8');
    px(ctx, x + 25, y + 2, 20, 5, '#d7bb79');
    label(ctx, '❤️', x + 34, y - 32, '#ff8fb3');
  }

  function drawPirate(ctx, x, y) {
    baseHuman(ctx, x, y, { hair:'#3a241c', main:'#3a1f1d', sleeve:'#5a2b26' });
    px(ctx, x - 26, y - 51, 52, 9, '#111018');
    px(ctx, x - 17, y - 64, 34, 16, '#111018');
    px(ctx, x - 10, y - 58, 20, 4, '#f0a75c');
    px(ctx, x - 13, y - 23, 10, 7, '#111018');
    px(ctx, x - 18, y - 6, 36, 7, '#f0a75c');
    px(ctx, x + 25, y - 4, 4, 38, '#d7bb79');
  }

  function drawViolin(ctx, x, y) {
    baseHuman(ctx, x, y, { hair:'#1f1930', main:'#2a2032', sleeve:'#19151d' });
    px(ctx, x - 7, y - 8, 14, 32, '#fff4d8');
    px(ctx, x + 22, y - 25, 9, 48, '#7b4a2e');
    px(ctx, x + 15, y - 11, 23, 17, '#a45f34');
    px(ctx, x - 34, y - 20, 49, 4, '#fff4d8');
    label(ctx, '♪', x + 38, y - 50, '#fff4d8');
  }

  function drawSinger(ctx, x, y) {
    baseHuman(ctx, x, y, { hair:'#2b1d16', main:'#5a386a', sleeve:'#e9a6b0' });
    px(ctx, x - 18, y - 11, 36, 13, '#e9a6b0');
    px(ctx, x + 25, y - 21, 9, 9, '#22202d');
    px(ctx, x + 28, y - 12, 4, 33, '#d7bb79');
    label(ctx, '♫', x - 36, y - 46, '#e9a6b0');
  }

  function drawRole(ctx, role, x, y) {
    const name = String(role.role || '');
    if (name.includes('女僕')) drawMaid(ctx, x, y);
    else if (name.includes('海盜')) drawPirate(ctx, x, y);
    else if (name.includes('小提琴')) drawViolin(ctx, x, y);
    else if (name.includes('歌手')) drawSinger(ctx, x, y);
    else return false;
    label(ctx, `${role.icon || ''} ${role.name || 'Guest'}`, x, y - 84, '#79d0b1');
    return true;
  }

  function updateApproxPosition() {
    if (!isDeckOpen()) return;
    let dx = 0, dy = 0;
    if (keys.has('ArrowUp') || keys.has('w') || mobile.up) dy -= speed;
    if (keys.has('ArrowDown') || keys.has('s') || mobile.down) dy += speed;
    if (keys.has('ArrowLeft') || keys.has('a') || mobile.left) dx -= speed;
    if (keys.has('ArrowRight') || keys.has('d') || mobile.right) dx += speed;
    if (dx && dy) { dx *= .707; dy *= .707; }
    pos.x = Math.max(105, Math.min(850, pos.x + dx));
    pos.y = Math.max(350, Math.min(455, pos.y + dy));
  }

  function patchDeck() {
    const deck = document.getElementById('deckOverlay');
    const role = getRole();
    if (!deck || !isDeckOpen() || !role || !role.role) return;
    const ctx = deck.getContext('2d');
    if (!ctx) return;
    updateApproxPosition();
    ctx.save();
    ctx.globalAlpha = 1;
    drawRole(ctx, role, pos.x, pos.y);
    ctx.restore();
  }

  function bind() {
    window.addEventListener('keydown', e => keys.add(e.key.length === 1 ? e.key.toLowerCase() : e.key), true);
    window.addEventListener('keyup', e => keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key), true);
    document.querySelectorAll('[data-move]').forEach(btn => {
      const d = btn.dataset.move;
      btn.addEventListener('pointerdown', () => { if (d in mobile) mobile[d] = true; }, true);
      ['pointerup','pointerleave','pointercancel'].forEach(type => btn.addEventListener(type, () => { if (d in mobile) mobile[d] = false; }, true));
    });
    window.addEventListener('keydown', e => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === 'e' && isDeckOpen() && pos.x < 180) pos = { x: 145, y: 360 };
    }, true);
  }

  function loop() {
    requestAnimationFrame(loop);
    patchDeck();
  }

  function init() {
    bind();
    loop();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
