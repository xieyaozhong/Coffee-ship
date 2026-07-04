(() => {
  'use strict';

  const nox = { x: 610, y: 405, tx: 610, ty: 405, mood: '喵～', moodTimer: 0, wait: 0, tail: 0 };
  const bounds = { minX: 180, maxX: 790, minY: 300, maxY: 455 };

  function isCafeOpen() {
    const panel = document.getElementById('gamePanel');
    const deck = document.getElementById('deckOverlay');
    const port = document.getElementById('portOverlay');
    return panel && !panel.classList.contains('hidden') && (!deck || deck.classList.contains('hidden')) && (!port || port.classList.contains('hidden'));
  }

  function playerPos() {
    return window.COFFEE_SHIP_PLAYER_POS || { x: 480, y: 360 };
  }

  function nearPlayer() {
    const p = playerPos();
    return Math.hypot(p.x - nox.x, p.y - nox.y) < 62;
  }

  function px(ctx, x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  function label(ctx, t, x, y, color = '#fff4d8') {
    ctx.font = '900 12px ui-rounded, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#120b17';
    ctx.fillText(t, x + 2, y + 2);
    ctx.fillStyle = color;
    ctx.fillText(t, x, y);
  }

  function pickTarget() {
    nox.tx = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
    nox.ty = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
    nox.wait = 50 + Math.random() * 140;
  }

  function update() {
    nox.tail += 0.12;
    if (nox.moodTimer > 0) nox.moodTimer--;
    if (nox.wait > 0) { nox.wait--; return; }
    const dx = nox.tx - nox.x;
    const dy = nox.ty - nox.y;
    const d = Math.hypot(dx, dy);
    if (d < 6) { pickTarget(); return; }
    const speed = nearPlayer() ? 0.55 : 0.42;
    nox.x += dx / d * speed;
    nox.y += dy / d * speed;
  }

  function drawCat(ctx) {
    const x = nox.x, y = nox.y;
    const tail = Math.sin(nox.tail) * 4;
    px(ctx, x - 17, y + 16, 34, 5, 'rgba(18,11,23,.75)');
    px(ctx, x - 14, y - 8, 28, 18, '#09070d');
    px(ctx, x - 7, y - 20, 17, 16, '#09070d');
    px(ctx, x - 10, y - 25, 6, 8, '#09070d');
    px(ctx, x + 5, y - 25, 6, 8, '#09070d');
    px(ctx, x - 8, y - 22, 3, 4, '#ff9fbd');
    px(ctx, x + 7, y - 22, 3, 4, '#ff9fbd');
    px(ctx, x - 4, y - 15, 3, 3, '#ffe16b');
    px(ctx, x + 5, y - 15, 3, 3, '#ffe16b');
    px(ctx, x + 12, y - 2 + tail, 18, 5, '#09070d');
    px(ctx, x - 11, y + 8, 5, 9, '#09070d');
    px(ctx, x + 6, y + 8, 5, 9, '#09070d');
    label(ctx, '🐈‍⬛ Nox', x, y - 34, '#ffe16b');
    if (nox.moodTimer > 0) label(ctx, nox.mood, x, y - 50, '#fff4d8');
  }

  function draw() {
    if (!isCafeOpen()) return;
    const canvas = document.getElementById('game');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    update();
    drawCat(ctx);
  }

  function interact() {
    if (!isCafeOpen() || !nearPlayer()) return false;
    const lines = ['喵～', 'Nox 輕輕蹭了你一下', '🐾 黑貓繞著你走了一圈', 'Nox 的金色眼睛亮了一下', '牠好像很喜歡船上的咖啡香'];
    nox.mood = lines[Math.floor(Math.random() * lines.length)];
    nox.moodTimer = 150;
    return true;
  }

  function bind() {
    window.addEventListener('keydown', e => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if ((k === 'e' || k === ' ') && interact()) e.preventDefault();
    }, true);
    document.getElementById('sitBtn')?.addEventListener('click', e => {
      if (interact()) { e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);
  }

  function loop() { requestAnimationFrame(loop); draw(); }
  function init() { pickTarget(); bind(); loop(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();