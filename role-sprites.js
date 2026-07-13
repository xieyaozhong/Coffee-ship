(() => {
  'use strict';

  if (window.__COFFEE_SHIP_WORLD_RENDERER_V1__) {
    window.__COFFEE_SHIP_ROLE_SPRITES_LEGACY_DISABLED__ = true;
    return;
  }

  const canvasId = 'game';
  let lastRoleText = '';
  let tick = 0;

  function getRole() {
    try {
      const raw = localStorage.getItem('coffeeShipRole');
      return raw ? JSON.parse(raw) : null;
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

  function baseHuman(ctx, x, y, cfg) {
    const bob = Math.floor(tick / 24) % 2;
    px(ctx, x - 18, y + 22, 36, 6, 'rgba(18,11,23,.85)');
    px(ctx, x - 15, y - 35 - bob, 30, 26, cfg.hair || '#2b1d16');
    px(ctx, x - 11, y - 29 - bob, 22, 20, cfg.skin || '#f0c7a0');
    px(ctx, x - 17, y - 14 - bob, 34, 42, cfg.main || '#3b2b44');
    px(ctx, x - 22, y - 8 - bob, 8, 27, cfg.sleeve || cfg.main || '#3b2b44');
    px(ctx, x + 14, y - 8 - bob, 8, 27, cfg.sleeve || cfg.main || '#3b2b44');
    px(ctx, x - 11, y + 25 - bob, 8, 18, cfg.leg || '#22202d');
    px(ctx, x + 3, y + 25 - bob, 8, 18, cfg.leg || '#22202d');
    px(ctx, x - 6, y - 21 - bob, 4, 4, '#21182a');
    px(ctx, x + 4, y - 21 - bob, 4, 4, '#21182a');
    px(ctx, x - 4, y - 13 - bob, 8, 3, '#b86766');
    return bob;
  }

  function drawMaid(ctx, x, y) {
    const bob = baseHuman(ctx, x, y, { hair:'#5a3526', main:'#151019', sleeve:'#fff4d8', leg:'#19151d' });
    px(ctx, x - 20, y - 45 - bob, 40, 7, '#fff4d8');
    px(ctx, x - 15, y - 51 - bob, 9, 9, '#fff4d8');
    px(ctx, x + 6, y - 51 - bob, 9, 9, '#fff4d8');
    px(ctx, x - 12, y - 10 - bob, 24, 34, '#fff4d8');
    px(ctx, x - 16, y + 17 - bob, 32, 8, '#fff4d8');
    px(ctx, x - 8, y - 7 - bob, 16, 7, '#ffb6cc');
    px(ctx, x + 23, y + 1 - bob, 20, 5, '#d7bb79');
    px(ctx, x + 28, y - 8 - bob, 8, 9, '#fff4d8');
    px(ctx, x + 31, y - 13 - bob, 2, 5, '#6d3f26');
    label(ctx, 'Maid', x, y - 79, '#ffb6cc');
    if (tick % 50 < 25) label(ctx, '❤️', x + 33, y - 36, '#ff8fb3');
  }

  function drawPirate(ctx, x, y) {
    const bob = baseHuman(ctx, x, y, { hair:'#3a241c', main:'#3a1f1d', sleeve:'#5a2b26', leg:'#19151d' });
    px(ctx, x - 25, y - 48 - bob, 50, 9, '#111018');
    px(ctx, x - 16, y - 61 - bob, 32, 16, '#111018');
    px(ctx, x - 10, y - 56 - bob, 20, 4, '#f0a75c');
    px(ctx, x - 5, y - 53 - bob, 10, 7, '#fff4d8');
    px(ctx, x - 12, y - 22 - bob, 10, 7, '#111018');
    px(ctx, x - 13, y - 20 - bob, 30, 3, '#111018');
    px(ctx, x - 18, y - 7 - bob, 36, 7, '#f0a75c');
    px(ctx, x - 4, y - 9 - bob, 8, 36, '#f0a75c');
    px(ctx, x + 23, y - 4 - bob, 4, 36, '#d7bb79');
    px(ctx, x + 18, y + 25 - bob, 12, 4, '#d7bb79');
    label(ctx, 'Pirate', x, y - 79, '#f0a75c');
  }

  function drawViolinist(ctx, x, y) {
    const bob = baseHuman(ctx, x, y, { hair:'#1f1930', main:'#2a2032', sleeve:'#19151d', leg:'#111018' });
    px(ctx, x - 12, y - 10 - bob, 24, 34, '#2a2032');
    px(ctx, x - 7, y - 8 - bob, 14, 30, '#fff4d8');
    px(ctx, x - 4, y - 4 - bob, 8, 26, '#d7bb79');
    px(ctx, x + 20, y - 23 - bob, 9, 45, '#7b4a2e');
    px(ctx, x + 14, y - 11 - bob, 22, 16, '#a45f34');
    px(ctx, x + 24, y - 31 - bob, 4, 8, '#d7bb79');
    px(ctx, x - 32, y - 19 - bob, 47, 4, '#fff4d8');
    label(ctx, 'Violin', x, y - 79, '#d7bb79');
    if (tick % 60 < 30) label(ctx, '♪', x + 36, y - 50, '#fff4d8');
  }

  function drawSinger(ctx, x, y) {
    const bob = baseHuman(ctx, x, y, { hair:'#2b1d16', main:'#5a386a', sleeve:'#e9a6b0', leg:'#21182a' });
    px(ctx, x - 17, y - 11 - bob, 34, 13, '#e9a6b0');
    px(ctx, x - 11, y + 2 - bob, 22, 24, '#5a386a');
    px(ctx, x - 18, y + 17 - bob, 36, 7, '#e9a6b0');
    px(ctx, x + 24, y - 20 - bob, 9, 9, '#22202d');
    px(ctx, x + 27, y - 11 - bob, 4, 31, '#d7bb79');
    px(ctx, x - 25, y - 4 - bob, 7, 21, '#e9a6b0');
    label(ctx, 'Singer', x, y - 79, '#e9a6b0');
    if (tick % 48 < 24) label(ctx, '♫', x - 35, y - 46, '#e9a6b0');
  }

  function drawRole(ctx, role, x, y) {
    const roleName = String(role.role || '');
    if (roleName.includes('女僕')) drawMaid(ctx, x, y);
    else if (roleName.includes('海盜')) drawPirate(ctx, x, y);
    else if (roleName.includes('小提琴')) drawViolinist(ctx, x, y);
    else if (roleName.includes('歌手')) drawSinger(ctx, x, y);
  }

  function draw() {
    requestAnimationFrame(draw);
    tick++;
    if (!isPlaying() || isDeckOpen()) return;
    const role = getRole();
    if (!role || !role.role) return;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = window.COFFEE_SHIP_PLAYER_POS || { x: 480, y: 360 };
    drawRole(ctx, role, pos.x, pos.y);
    if (lastRoleText !== role.role) {
      lastRoleText = role.role;
      const avatarName = document.getElementById('avatarName');
      if (avatarName && role.name) avatarName.textContent = `${role.icon || ''} ${role.name}｜${role.role}`;
    }
  }

  requestAnimationFrame(draw);
})();
