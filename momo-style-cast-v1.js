(() => {
  'use strict';
  if (window.__COFFEE_SHIP_MOMO_STYLE_CAST_V1__) return;
  window.__COFFEE_SHIP_MOMO_STYLE_CAST_V1__ = true;

  const ink = '#211a29';
  const cream = '#fff4df';
  const creamShade = '#d9c9b9';
  const gold = '#d7a85c';
  const navy = '#292934';
  const plum = '#5c4a68';
  const blush = '#c77f78';
  const dirRows = { down: 0, left: 1, right: 2, up: 3 };
  const states = new WeakMap();

  function px(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function outlineRect(x, y, w, h, fill, border = ink, t = 2) {
    px(x, y, w, h, border);
    px(x + t, y + t, w - t * 2, h - t * 2, fill);
  }

  function ellipse(x, y, rx, ry, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(Math.round(x), Math.round(y), rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function actorState(a) {
    let state = states.get(a);
    if (!state) {
      state = { x: Number(a.x) || 0, y: Number(a.y) || 0, dir: a.dir || 'down', movedAt: 0 };
      states.set(a, state);
    }
    let dx = (Number(a.x) || 0) - state.x;
    let dy = (Number(a.y) || 0) - state.y;
    if (a.targetX != null && a.targetY != null && (a.wait || 0) <= 0) {
      dx = a.targetX - a.x;
      dy = a.targetY - a.y;
    }
    const moving = Math.hypot(dx, dy) > 0.7;
    if (moving) {
      state.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
      state.movedAt = Date.now();
    } else if (a.dir && dirRows[a.dir] != null) {
      state.dir = a.dir;
    }
    state.x = Number(a.x) || 0;
    state.y = Number(a.y) || 0;
    const walk = moving ? Math.floor(Date.now() / 150) % 3 : 0;
    return { dir: state.dir || 'down', moving, walk, step: moving ? (walk === 1 ? -2 : walk === 2 ? 2 : 0) : 0 };
  }

  function baseShadow(x, y, width = 38) {
    ellipse(x, y + 29, width / 2, 5, '#07060b', .3);
  }

  function face(x, y, skin, dir, hair, eye = '#39433d') {
    if (dir === 'up') {
      outlineRect(x - 12, y - 31, 24, 19, hair);
      px(x - 15, y - 28, 6, 20, hair);
      px(x + 9, y - 28, 6, 20, hair);
      return;
    }
    const side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    outlineRect(x - 11 + side, y - 30, 22, 18, skin);
    px(x - 14, y - 38, 28, 12, ink);
    px(x - 12, y - 36, 24, 10, hair);
    px(x - 15, y - 31, 6, 20, hair);
    px(x + 9, y - 31, 6, 20, hair);
    if (side === 0) {
      px(x - 6, y - 23, 3, 4, eye);
      px(x + 3, y - 23, 3, 4, eye);
      px(x - 2, y - 15, 5, 2, blush);
    } else {
      px(x + side * 4 - 2, y - 23, 3, 4, eye);
      px(x + side * 6 - 2, y - 15, 4, 2, blush);
    }
  }

  function beret(x, y, color, accent, dir, feather = false) {
    const side = dir === 'left' ? -2 : dir === 'right' ? 2 : 0;
    px(x - 17 + side, y - 43, 34, 7, ink);
    px(x - 14 + side, y - 48, 28, 10, color);
    px(x - 8 + side, y - 51, 18, 5, color);
    px(x + 8 + side, y - 46, 5, 5, accent);
    if (feather) {
      px(x + 12 + side, y - 55, 3, 11, cream);
      px(x + 15 + side, y - 57, 3, 8, creamShade);
    }
  }

  function legs(x, y, state, shoe = navy, sock = creamShade) {
    const s = state.step;
    if (state.dir === 'left' || state.dir === 'right') {
      const sign = state.dir === 'left' ? -1 : 1;
      outlineRect(x - 10 + sign * s, y + 16, 8, 15, sock);
      outlineRect(x + 2 - sign * s, y + 16, 8, 15, sock);
      outlineRect(x - 12 + sign * s, y + 28, 11, 7, shoe);
      outlineRect(x + 1 - sign * s, y + 28, 11, 7, shoe);
    } else {
      outlineRect(x - 11, y + 16 + s, 9, 15, sock);
      outlineRect(x + 2, y + 16 - s, 9, 15, sock);
      outlineRect(x - 12, y + 28 + s, 11, 7, shoe);
      outlineRect(x + 1, y + 28 - s, 11, 7, shoe);
    }
  }

  function labelAndEmote(a, label, y, color, size = 13) {
    drawText(label, Math.round(a.x), Math.round(a.y) + y, size, 'center', color);
    if (a.emote && (a.emoteTimer === undefined || a.emoteTimer > 0)) {
      drawText(a.emote, Math.round(a.x), Math.round(a.y) + y - 20, 20);
    }
  }

  function drawPeakMomoStyle(n) {
    const x = Math.round(n.x), y = Math.round(n.y), s = actorState(n);
    baseShadow(x, y, 42);
    if (typeof drawNpcAura === 'function') drawNpcAura(n, '#9d86bf');
    if ((n.playing || n.activityTimer < 80) && typeof drawCello === 'function') drawCello(x - 53, y - 13, n.activityTimer < 80);

    legs(x, y, s, '#24212d', '#d6c9cc');
    outlineRect(x - 19, y - 10, 38, 31, '#51435f');
    px(x - 16, y - 6, 32, 23, '#776682');
    outlineRect(x - 13, y - 7, 26, 27, cream);
    px(x - 9, y - 3, 18, 21, '#eee0d4');
    px(x - 16, y + 16, 32, 5, '#b99cbd');
    px(x - 18, y - 6, 6, 19, n.skin || '#f0c7a0');
    px(x + 12, y - 6, 6, 19, n.skin || '#f0c7a0');
    px(x - 7, y - 8, 14, 5, gold);
    px(x - 3, y - 7, 6, 7, plum);
    face(x, y, n.skin || '#f0c7a0', s.dir, '#9180a2', '#453c58');
    if (s.dir !== 'up') {
      px(x - 17, y - 30, 5, 27, '#9180a2');
      px(x + 12, y - 30, 5, 27, '#9180a2');
      px(x - 20, y - 17, 5, 18, '#6b5b79');
      px(x + 15, y - 17, 5, 18, '#6b5b79');
    } else {
      px(x - 18, y - 30, 36, 30, '#9180a2');
      px(x - 14, y - 2, 28, 7, '#6b5b79');
    }
    beret(x, y, '#40334d', gold, s.dir, true);
    px(x - 2, y - 46, 3, 8, gold);
    px(x - 5, y - 43, 9, 2, gold);
    labelAndEmote(n, '🎻 Peak', -64, '#ded1ff');
  }

  function drawBeanMomoStyle(n) {
    const x = Math.round(n.x), y = Math.round(n.y), s = actorState(n);
    baseShadow(x, y, 40);
    if (typeof drawNpcAura === 'function') drawNpcAura(n, '#e8b85e');
    legs(x, y, s, '#2c2027', '#e4c9aa');
    outlineRect(x - 18, y - 10, 36, 31, '#4b2f3d');
    px(x - 14, y - 7, 28, 25, '#694254');
    px(x - 12, y - 5, 12, 11, '#ead4ad');
    px(x, y - 5, 12, 11, '#7b4a55');
    px(x - 12, y + 6, 12, 11, '#7b4a55');
    px(x, y + 6, 12, 11, '#ead4ad');
    px(x - 19, y - 5, 6, 18, n.skin || '#e9b98f');
    px(x + 13, y - 5, 6, 18, n.skin || '#e9b98f');
    face(x, y, n.skin || '#e9b98f', s.dir, '#a86f46', '#574020');
    if (s.dir === 'up') px(x - 16, y - 30, 32, 22, '#a86f46');

    px(x - 21, y - 47, 18, 10, ink);
    px(x - 19, y - 45, 16, 8, '#5a3443');
    px(x + 3, y - 47, 18, 10, ink);
    px(x + 5, y - 45, 14, 8, creamShade);
    px(x - 3, y - 52, 6, 17, gold);
    px(x - 22, y - 50, 5, 5, '#f2bd55');
    px(x + 17, y - 50, 5, 5, '#f2bd55');
    px(x - 2, y - 55, 5, 5, '#f2bd55');
    px(x - 5, y - 8, 10, 5, gold);

    const side = s.dir === 'left' ? -1 : 1;
    const staffX = x + side * 27;
    px(staffX, y - 5, 4, 38, '#6d472d');
    outlineRect(staffX - 5, y - 15, 14, 11, cream);
    px(staffX - 2, y - 12, 8, 4, '#6d3f26');
    px(staffX + 1, y + 31, 4, 5, gold);
    labelAndEmote(n, '🃏 Bean', -67, '#ffe0a0');
  }

  function drawMugiMomoStyle(n) {
    const x = Math.round(n.x), y = Math.round(n.y), s = actorState(n);
    const pet = n.petTimer > 0 ? 2 : 0;
    baseShadow(x + 3, y, 38);
    if (typeof drawNpcAura === 'function') drawNpcAura(n, '#e9a6b0');
    const bodyY = y - 8 - pet;
    const facingBack = s.dir === 'up';
    const side = s.dir === 'left' ? -1 : s.dir === 'right' ? 1 : 0;

    if (side) {
      outlineRect(x - 14, bodyY + 2, 31, 17, '#fff7e8');
      outlineRect(x + side * 12 - 10, bodyY - 13, 21, 19, '#fff7e8');
      px(x + side * 11 - 8, bodyY - 17, 7, 8, side < 0 ? '#d97942' : '#34333a');
      px(x + side * 11 + 2, bodyY - 17, 7, 8, side < 0 ? '#34333a' : '#d97942');
      px(x - 2, bodyY + 3, 9, 9, '#768065');
      px(x + 8, bodyY + 8, 8, 8, '#d97942');
      px(x + side * 16 - 2, bodyY - 6, 3, 3, '#43513f');
      px(x + side * 20 - 2, bodyY - 1, 3, 2, blush);
    } else {
      outlineRect(x - 13, bodyY - 12, 26, 22, '#fff7e8');
      outlineRect(x - 15, bodyY + 5, 30, 20, '#fff7e8');
      px(x - 12, bodyY - 17, 8, 9, '#d97942');
      px(x + 4, bodyY - 17, 8, 9, '#34333a');
      px(x - 4, bodyY - 12, 8, 8, '#768065');
      if (!facingBack) {
        px(x - 7, bodyY - 5, 3, 4, '#43513f');
        px(x + 4, bodyY - 5, 3, 4, '#43513f');
        px(x - 2, bodyY + 1, 4, 2, blush);
      }
      px(x + 4, bodyY + 9, 10, 9, '#768065');
      px(x - 12, bodyY + 13, 8, 8, '#d97942');
    }

    px(x - 8, bodyY + 6, 16, 4, '#6d472d');
    px(x - 3, bodyY + 8, 6, 6, gold);
    const tailX = side < 0 ? x + 18 : side > 0 ? x - 23 : x + 17;
    px(tailX, bodyY + 3 + s.step, 6, 21, '#fff7e8');
    px(tailX, bodyY + 3 + s.step, 6, 7, '#34333a');
    px(tailX, bodyY + 10 + s.step, 6, 6, '#768065');
    px(x - 10, bodyY + 22 + s.step, 7, 5, '#d8b6a4');
    px(x + 3, bodyY + 22 - s.step, 7, 5, '#d8b6a4');
    labelAndEmote(n, '🐾 Mugi', -38, cream, 12);
  }

  function drawTraveler(a, isPlayer = false) {
    const x = Math.round(a.x), y = Math.round(a.y), s = actorState(a);
    const skin = a.skin || '#f0c7a0';
    const hair = a.hair || '#6d4c38';
    const coat = a.shirt || '#704b3e';
    baseShadow(x, y, 38);
    legs(x, y, s, '#2c2528', '#e7d2b8');
    outlineRect(x - 18, y - 9, 36, 30, navy);
    px(x - 15, y - 6, 30, 24, coat);
    outlineRect(x - 11, y - 4, 22, 22, '#4d342f');
    px(x - 8, y - 2, 16, 18, '#6c4839');
    px(x - 19, y - 4, 6, 18, skin);
    px(x + 13, y - 4, 6, 18, skin);
    px(x - 7, y - 8, 14, 5, gold);
    face(x, y, skin, s.dir, hair, '#3b493f');
    if (s.dir !== 'up') {
      px(x - 15, y - 30, 5, 18, hair);
      px(x + 10, y - 30, 5, 18, hair);
    }
    beret(x, y, '#79614e', gold, s.dir, false);
    px(x - 13, y + 13, 8, 8, creamShade);
    px(x + 5, y + 13, 8, 8, creamShade);
    px(x + 15, y + 3, 8, 15, '#4a342e');
    px(x + 17, y + 6, 4, 4, gold);
    if (a.hasCoffee) {
      outlineRect(x + 19, y - 2, 11, 13, cream);
      px(x + 22, y + 1, 6, 5, '#6d3f26');
    }
    labelAndEmote(a, a.name || 'Guest', -58, isPlayer ? '#79d0b1' : cream, 12);
  }

  function drawCafeAnimal(a, isPlayer = false) {
    const animal = animalByKey(a.animal);
    const x = Math.round(a.x), y = Math.round(a.y), s = actorState(a);
    const body = animal.body, faceColor = animal.face, accent = animal.accent;
    baseShadow(x, y, 34);
    outlineRect(x - 16, y - 19, 32, 23, body);
    outlineRect(x - 12, y - 27, 24, 20, faceColor);
    px(x - 15, y - 34, 9, 11, body);
    px(x + 6, y - 34, 9, 11, body);
    px(x - 7, y - 20, 3, 4, ink);
    px(x + 4, y - 20, 3, 4, ink);
    px(x - 2, y - 13, 5, 2, blush);
    px(x - 14, y + 1, 28, 5, '#5c3d35');
    px(x - 3, y + 2, 6, 6, gold);
    px(x - 11, y + 20 + s.step, 8, 12, '#2b2529');
    px(x + 3, y + 20 - s.step, 8, 12, '#2b2529');
    if (animal.key === 'rabbit') {
      px(x - 11, y - 48, 7, 20, body); px(x + 4, y - 48, 7, 20, body);
    } else if (animal.key === 'penguin') {
      px(x - 8, y - 17, 16, 16, faceColor); px(x - 3, y - 10, 6, 4, accent);
    } else if (animal.key === 'fox' || animal.key === 'cat') {
      px(x - 14, y - 31, 7, 8, accent); px(x + 7, y - 31, 7, 8, accent);
    }
    labelAndEmote(a, `${animal.emoji} ${a.name || 'Guest'}`, -52, isPlayer ? '#79d0b1' : cream, 12);
  }

  const fallbackPeak = window.drawPeak;
  const fallbackBean = window.drawBean;
  const fallbackCat = window.drawCat;
  const fallbackHuman = window.drawHumanAvatar;
  const fallbackAnimal = window.drawAnimalAvatar;

  window.drawPeak = drawPeakMomoStyle;
  window.drawBean = drawBeanMomoStyle;
  window.drawCat = drawMugiMomoStyle;
  window.drawHumanAvatar = drawTraveler;
  window.drawAnimalAvatar = drawCafeAnimal;

  window.drawAvatar = function(a, isPlayer = false) {
    if (typeof drawCoffeeAura === 'function') drawCoffeeAura(a);
    if (a.role === 'barista') { window.drawMomo(a); return; }
    if (a.role === 'cellist') { window.drawPeak(a); return; }
    if (a.role === 'joker') { window.drawBean(a); return; }
    if (a.role === 'cat') { window.drawCat(a); return; }
    if (a.animal && a.animal !== 'human') { window.drawAnimalAvatar(a, isPlayer); return; }
    window.drawHumanAvatar(a, isPlayer);
  };

  window.COFFEE_SHIP_MOMO_STYLE_CAST = {
    version: 1,
    characters: ['Momo', 'Peak', 'Bean', 'Mugi', 'Player', 'Animal avatars'],
    fallbacks: { fallbackPeak, fallbackBean, fallbackCat, fallbackHuman, fallbackAnimal }
  };
})();
