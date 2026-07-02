(() => {
  'use strict';

  const canvasId = 'game';
  let lastRoleText = '';
  let sparkleTick = 0;

  function getRole() {
    try {
      const raw = localStorage.getItem('coffeeShipRole');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function isPlaying() {
    const panel = document.getElementById('gamePanel');
    return panel && !panel.classList.contains('hidden');
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

  function drawMaid(ctx, x, y) {
    px(ctx, x - 18, y - 39, 36, 7, '#fff4d8');
    px(ctx, x - 14, y - 44, 8, 8, '#fff4d8');
    px(ctx, x + 6, y - 44, 8, 8, '#fff4d8');
    px(ctx, x - 17, y - 8, 34, 31, '#201722');
    px(ctx, x - 10, y - 6, 20, 25, '#fff4d8');
    px(ctx, x - 13, y + 16, 26, 7, '#fff4d8');
    px(ctx, x - 23, y - 2, 7, 20, '#fff4d8');
    px(ctx, x + 16, y - 2, 7, 20, '#fff4d8');
    px(ctx, x + 22, y + 3, 18, 5, '#d7bb79');
    px(ctx, x + 26, y - 5, 7, 7, '#fff4d8');
    label(ctx, 'Maid', x, y - 76, '#ffb6cc');
    if (sparkleTick % 50 < 25) label(ctx, '❤️', x + 30, y - 32, '#ff8fb3');
  }

  function drawPirate(ctx, x, y) {
    px(ctx, x - 22, y - 45, 44, 9, '#111018');
    px(ctx, x - 14, y - 56, 28, 15, '#111018');
    px(ctx, x - 8, y - 52, 16, 4, '#f0a75c');
    px(ctx, x - 5, y - 49, 10, 7, '#fff4d8');
    px(ctx, x - 12, y - 19, 10, 7, '#111018');
    px(ctx, x - 11, y - 17, 28, 3, '#111018');
    px(ctx, x - 17, y - 8, 34, 33, '#3a1f1d');
    px(ctx, x - 5, y - 5, 10, 28, '#f0a75c');
    px(ctx, x + 20, y - 4, 4, 33, '#d7bb79');
    px(ctx, x + 17, y + 22, 10, 4, '#d7bb79');
    label(ctx, 'Pirate', x, y - 76, '#f0a75c');
  }

  function drawViolinist(ctx, x, y) {
    px(ctx, x - 18, y - 8, 36, 31, '#4b315f');
    px(ctx, x - 8, y - 4, 16, 25, '#d7bb79');
    px(ctx, x + 19, y - 20, 8, 42, '#7b4a2e');
    px(ctx, x + 14, y - 9, 20, 15, '#a45f34');
    px(ctx, x + 23, y - 27, 4, 8, '#d7bb79');
    px(ctx, x - 31, y - 17, 44, 4, '#fff4d8');
    label(ctx, 'Violin', x, y - 76, '#d7bb79');
    if (sparkleTick % 60 < 30) label(ctx, '♪', x + 33, y - 48, '#fff4d8');
  }

  function drawSinger(ctx, x, y) {
    px(ctx, x - 18, y - 8, 36, 31, '#5a386a');
    px(ctx, x - 12, y - 5, 24, 10, '#e9a6b0');
    px(ctx, x + 23, y - 18, 8, 8, '#22202d');
    px(ctx, x + 26, y - 10, 4, 28, '#d7bb79');
    px(ctx, x - 24, y - 4, 6, 18, '#e9a6b0');
    px(ctx, x + 18, y - 4, 6, 18, '#e9a6b0');
    label(ctx, 'Singer', x, y - 76, '#e9a6b0');
    if (sparkleTick % 48 < 24) label(ctx, '♫', x - 32, y - 45, '#e9a6b0');
  }

  function drawCostume(ctx, role, x, y) {
    const roleName = String(role.role || '');
    if (roleName.includes('女僕')) drawMaid(ctx, x, y);
    else if (roleName.includes('海盜')) drawPirate(ctx, x, y);
    else if (roleName.includes('小提琴')) drawViolinist(ctx, x, y);
    else if (roleName.includes('歌手')) drawSinger(ctx, x, y);
  }

  function draw() {
    requestAnimationFrame(draw);
    sparkleTick++;

    if (!isPlaying() || isDeckOpen()) return;
    const role = getRole();
    if (!role || !role.role) return;

    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = window.COFFEE_SHIP_PLAYER_POS || { x: 480, y: 360 };
    drawCostume(ctx, role, pos.x, pos.y);

    if (lastRoleText !== role.role) {
      lastRoleText = role.role;
      const avatarName = document.getElementById('avatarName');
      if (avatarName && role.name) avatarName.textContent = `${role.icon || ''} ${role.name}｜${role.role}`;
    }
  }

  requestAnimationFrame(draw);
})();
