(() => {
  'use strict';

  if (window.__COFFEE_SHIP_UNIFIED_CHARACTER_RUNTIME_V3__) return;
  window.__COFFEE_SHIP_UNIFIED_CHARACTER_RUNTIME_V3__ = true;

  const FRAME_WIDTH = 24;
  const FRAME_HEIGHT = 30;
  const CHARACTER_ATLAS_WIDTH = FRAME_WIDTH * 4;
  const ROWS = Object.freeze({ down: 0, left: 1, right: 2, up: 3 });
  const OFFSETS = Object.freeze({
    momo: 0,
    peak: CHARACTER_ATLAS_WIDTH,
    bean: CHARACTER_ATLAS_WIDTH * 2,
    player: CHARACTER_ATLAS_WIDTH * 3,
    blackcat: CHARACTER_ATLAS_WIDTH * 4
  });
  const PARTS = Object.freeze([
    'assets/characters/unified-v3/part-1.txt',
    'assets/characters/unified-v3/part-2.txt',
    'assets/characters/unified-v3/part-3.txt',
    'assets/characters/unified-v3/part-4.txt'
  ]);

  const fallback = {
    drawMomo: window.drawMomo,
    drawPeak: window.drawPeak,
    drawBean: window.drawBean,
    drawCat: window.drawCat,
    drawHumanAvatar: window.drawHumanAvatar,
    drawAnimalAvatar: window.drawAnimalAvatar,
    drawAvatar: window.drawAvatar
  };

  const movementStates = new WeakMap();
  const atlas = new Image();
  atlas.decoding = 'async';
  let ready = false;
  let failed = false;

  function getMotion(actor) {
    let state = movementStates.get(actor);
    const now = performance.now();
    const x = Number(actor?.x) || 0;
    const y = Number(actor?.y) || 0;

    if (!state) {
      state = {
        x,
        y,
        dir: ROWS[actor?.dir] !== undefined ? actor.dir : 'down',
        movedAt: 0
      };
      movementStates.set(actor, state);
    }

    let dx = x - state.x;
    let dy = y - state.y;

    if (Number.isFinite(actor?.targetX) && Number.isFinite(actor?.targetY) && (actor.wait || 0) <= 0) {
      const targetDx = actor.targetX - x;
      const targetDy = actor.targetY - y;
      if (Math.hypot(targetDx, targetDy) > 3) {
        dx = targetDx;
        dy = targetDy;
      }
    }

    if (Math.hypot(dx, dy) > 0.45) {
      state.dir = Math.abs(dx) > Math.abs(dy)
        ? (dx < 0 ? 'left' : 'right')
        : (dy < 0 ? 'up' : 'down');
      state.movedAt = now;
    } else if (ROWS[actor?.dir] !== undefined) {
      state.dir = actor.dir;
    }

    state.x = x;
    state.y = y;

    const moving = now - state.movedAt < 190;
    return {
      dir: state.dir || 'down',
      frame: moving ? 1 + Math.floor(now / 145) % 3 : 0
    };
  }

  function drawFrame(character, actor, options) {
    if (!ready) return false;

    const motion = getMotion(actor);
    const sourceX = OFFSETS[character] + motion.frame * FRAME_WIDTH;
    const sourceY = (ROWS[motion.dir] ?? 0) * FRAME_HEIGHT;
    const x = Math.round(Number(actor?.x) || 0);
    const y = Math.round(Number(actor?.y) || 0);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      atlas,
      sourceX,
      sourceY,
      FRAME_WIDTH,
      FRAME_HEIGHT,
      Math.round(x - options.width / 2),
      Math.round(y - options.anchorY),
      options.width,
      options.height
    );
    ctx.restore();
    return true;
  }

  function drawLabel(actor, text, yOffset, color, size = 13) {
    if (typeof drawText !== 'function') return;
    const x = Math.round(Number(actor?.x) || 0);
    const y = Math.round(Number(actor?.y) || 0);
    drawText(text, x, y + yOffset, size, 'center', color);
    if (actor?.emote && (actor.emoteTimer === undefined || actor.emoteTimer > 0)) {
      drawText(actor.emote, x, y + yOffset - 21, 20, 'center', '#fff4df');
    }
  }

  function drawMomoV3(actor) {
    if (!ready) {
      fallback.drawMomo?.(actor);
      return;
    }
    if (typeof drawNpcAura === 'function') drawNpcAura(actor, '#d7bb79');
    drawFrame('momo', actor, { width: 96, height: 120, anchorY: 82 });
    drawLabel(actor, '☕ Momo', -91, '#ffe5ae');
  }

  function drawPeakV3(actor) {
    if (!ready) {
      fallback.drawPeak?.(actor);
      return;
    }
    if (typeof drawNpcAura === 'function') drawNpcAura(actor, '#9d86bf');
    if ((actor?.playing || actor?.activityTimer < 80) && typeof drawCello === 'function') {
      drawCello(Math.round(actor.x) - 52, Math.round(actor.y) - 13, actor.activityTimer < 80);
    }
    drawFrame('peak', actor, { width: 96, height: 120, anchorY: 82 });
    drawLabel(actor, '🎻 Peak', -91, '#ded1ff');
  }

  function drawBeanV3(actor) {
    if (!ready) {
      fallback.drawBean?.(actor);
      return;
    }
    if (typeof drawNpcAura === 'function') drawNpcAura(actor, '#e8b85e');
    drawFrame('bean', actor, { width: 96, height: 120, anchorY: 82 });
    drawLabel(actor, '🃏 Bean', -91, '#ffe0a0');
  }

  function drawPlayerV3(actor, isPlayer = false) {
    if (!ready) {
      fallback.drawHumanAvatar?.(actor, isPlayer);
      return;
    }
    drawFrame('player', actor, { width: 96, height: 120, anchorY: 82 });
    drawLabel(actor, actor?.name || 'Guest', -91, isPlayer ? '#79d0b1' : '#fff4df');
  }

  function drawBlackCatV3(actor, isPlayer = false) {
    if (!ready) {
      if (actor?.role === 'cat') fallback.drawCat?.(actor);
      else fallback.drawAnimalAvatar?.(actor, isPlayer);
      return;
    }
    if (actor?.role === 'cat' && typeof drawNpcAura === 'function') drawNpcAura(actor, '#d7a85c');
    drawFrame('blackcat', actor, { width: 72, height: 90, anchorY: 63 });
    const name = actor?.name || (actor?.role === 'cat' ? 'Mugi' : 'Guest');
    drawLabel(actor, `🐈‍⬛ ${name}`, -57, isPlayer ? '#79d0b1' : '#ffe5ae', 12);
  }

  window.drawMomo = drawMomoV3;
  window.drawPeak = drawPeakV3;
  window.drawBean = drawBeanV3;
  window.drawCat = (actor) => drawBlackCatV3(actor, false);
  window.drawHumanAvatar = drawPlayerV3;
  window.drawAnimalAvatar = function(actor, isPlayer = false) {
    if (actor?.animal === 'cat' || actor?.animal === 'blackcat') {
      drawBlackCatV3(actor, isPlayer);
      return;
    }
    fallback.drawAnimalAvatar?.(actor, isPlayer);
  };

  window.drawAvatar = function(actor, isPlayer = false) {
    if (typeof drawCoffeeAura === 'function') drawCoffeeAura(actor);

    if (actor?.role === 'barista') return drawMomoV3(actor);
    if (actor?.role === 'cellist') return drawPeakV3(actor);
    if (actor?.role === 'joker') return drawBeanV3(actor);
    if (actor?.role === 'cat') return drawBlackCatV3(actor, false);
    if (actor?.animal && actor.animal !== 'human') return window.drawAnimalAvatar(actor, isPlayer);
    return drawPlayerV3(actor, isPlayer);
  };

  async function loadAtlas() {
    try {
      const pieces = await Promise.all(PARTS.map(async (path) => {
        const response = await fetch(path, { cache: 'force-cache' });
        if (!response.ok) throw new Error(`${response.status} ${path}`);
        return (await response.text()).trim();
      }));

      await new Promise((resolve, reject) => {
        atlas.onload = resolve;
        atlas.onerror = () => reject(new Error('Unified character atlas decode failed'));
        atlas.src = `data:image/png;base64,${pieces.join('')}`;
      });

      if (atlas.naturalWidth !== 480 || atlas.naturalHeight !== 120) {
        throw new Error(`Unexpected unified atlas size ${atlas.naturalWidth}x${atlas.naturalHeight}`);
      }

      ready = true;
      window.COFFEE_SHIP_UNIFIED_CAST_V3.ready = true;
      window.COFFEE_SHIP_MOMO_SPRITE = { image: atlas, version: 3, isReady: () => ready };
      window.dispatchEvent(new CustomEvent('coffee-ship:character-atlas-ready', {
        detail: { version: 3, characters: Object.keys(OFFSETS) }
      }));
    } catch (error) {
      failed = true;
      window.COFFEE_SHIP_UNIFIED_CAST_V3.failed = true;
      console.warn('Coffee Ship unified character atlas v3 failed; keeping fallback renderers.', error);
    }
  }

  window.COFFEE_SHIP_UNIFIED_CAST_V3 = {
    version: 3,
    ready: false,
    failed: false,
    atlas,
    offsets: OFFSETS,
    isReady: () => ready,
    didFail: () => failed,
    fallbacks: fallback
  };

  loadAtlas();
})();
