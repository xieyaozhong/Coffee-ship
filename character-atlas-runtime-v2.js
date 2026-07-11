(() => {
  'use strict';

  if (window.__COFFEE_SHIP_CHARACTER_ATLAS_V2__) return;
  window.__COFFEE_SHIP_CHARACTER_ATLAS_V2__ = true;

  const FRAME_WIDTH = 48;
  const FRAME_HEIGHT = 60;
  const ROWS = Object.freeze({ down: 0, left: 1, right: 2, up: 3 });
  const movementStates = new WeakMap();
  const assets = {
    player: { image: null, ready: false, failed: false },
    blackcat: { image: null, ready: false, failed: false }
  };

  const fallback = {
    drawAvatar: window.drawAvatar,
    drawHumanAvatar: window.drawHumanAvatar,
    drawAnimalAvatar: window.drawAnimalAvatar,
    drawCat: window.drawCat
  };

  const assetChunks = {
    player: [
      'assets/characters/player/v2/part-1.txt',
      'assets/characters/player/v2/part-2.txt',
      'assets/characters/player/v2/part-3.txt',
      'assets/characters/player/v2/part-4.txt'
    ],
    blackcat: [
      'assets/characters/blackcat/v2/part-1.txt',
      'assets/characters/blackcat/v2/part-2.txt',
      'assets/characters/blackcat/v2/part-3.txt'
    ]
  };

  async function loadChunkedImage(name, paths) {
    try {
      const chunks = await Promise.all(paths.map(async (path) => {
        const response = await fetch(path, { cache: 'force-cache' });
        if (!response.ok) throw new Error(`${response.status} ${path}`);
        return (await response.text()).trim();
      }));

      const image = new Image();
      image.decoding = 'async';
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error(`${name} atlas decode failed`));
        image.src = `data:image/webp;base64,${chunks.join('')}`;
      });

      if (image.naturalWidth !== 192 || image.naturalHeight !== 240) {
        throw new Error(`${name} atlas has unexpected size ${image.naturalWidth}x${image.naturalHeight}`);
      }

      assets[name].image = image;
      assets[name].ready = true;
      window.dispatchEvent(new CustomEvent('coffee-ship:character-atlas-ready', { detail: { name } }));
    } catch (error) {
      assets[name].failed = true;
      console.warn(`Coffee Ship ${name} atlas failed; keeping fallback renderer.`, error);
    }
  }

  function actorMotion(actor) {
    let state = movementStates.get(actor);
    const now = performance.now();
    const x = Number(actor?.x) || 0;
    const y = Number(actor?.y) || 0;

    if (!state) {
      state = { x, y, dir: ROWS[actor?.dir] !== undefined ? actor.dir : 'down', movedAt: 0 };
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

  function drawAtlasFrame(image, actor, options) {
    const x = Math.round(actor.x);
    const y = Math.round(actor.y);
    const motion = actorMotion(actor);
    const row = ROWS[motion.dir] ?? 0;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      image,
      motion.frame * FRAME_WIDTH,
      row * FRAME_HEIGHT,
      FRAME_WIDTH,
      FRAME_HEIGHT,
      Math.round(x - options.width / 2),
      Math.round(y - options.anchorY),
      options.width,
      options.height
    );
    ctx.restore();

    return { x, y };
  }

  function drawLabel(actor, text, yOffset, color, size = 13) {
    const x = Math.round(actor.x);
    const y = Math.round(actor.y);
    if (typeof drawText === 'function') {
      drawText(text, x, y + yOffset, size, 'center', color);
      if (actor.emote && (actor.emoteTimer === undefined || actor.emoteTimer > 0)) {
        drawText(actor.emote, x, y + yOffset - 21, 20, 'center', '#fff4df');
      }
    }
  }

  function drawPlayerAtlas(actor, isPlayer = false) {
    if (!assets.player.ready) {
      if (typeof fallback.drawHumanAvatar === 'function') fallback.drawHumanAvatar(actor, isPlayer);
      return;
    }

    drawAtlasFrame(assets.player.image, actor, { width: 96, height: 120, anchorY: 82 });
    drawLabel(actor, actor.name || 'Guest', -91, isPlayer ? '#79d0b1' : '#fff4df', 13);
  }

  function drawBlackCatAtlas(actor, isPlayer = false) {
    if (!assets.blackcat.ready) {
      if (actor.role === 'cat' && typeof fallback.drawCat === 'function') fallback.drawCat(actor);
      else if (typeof fallback.drawAnimalAvatar === 'function') fallback.drawAnimalAvatar(actor, isPlayer);
      return;
    }

    if (actor.role === 'cat' && typeof drawNpcAura === 'function') drawNpcAura(actor, '#d7a85c');
    drawAtlasFrame(assets.blackcat.image, actor, { width: 72, height: 90, anchorY: 63 });
    const name = actor.name || (actor.role === 'cat' ? 'Mugi' : 'Guest');
    drawLabel(actor, `🐈‍⬛ ${name}`, -57, isPlayer ? '#79d0b1' : '#ffe5ae', 12);
  }

  window.drawHumanAvatar = drawPlayerAtlas;
  window.drawCat = (actor) => drawBlackCatAtlas(actor, false);
  window.drawAnimalAvatar = function(actor, isPlayer = false) {
    if (actor?.animal === 'cat' || actor?.animal === 'blackcat') {
      drawBlackCatAtlas(actor, isPlayer);
      return;
    }
    if (typeof fallback.drawAnimalAvatar === 'function') fallback.drawAnimalAvatar(actor, isPlayer);
  };

  window.drawAvatar = function(actor, isPlayer = false) {
    if (typeof drawCoffeeAura === 'function') drawCoffeeAura(actor);

    if (actor.role === 'barista') {
      if (typeof window.drawMomo === 'function') window.drawMomo(actor);
      return;
    }
    if (actor.role === 'cellist') {
      if (typeof window.drawPeak === 'function') window.drawPeak(actor);
      return;
    }
    if (actor.role === 'joker') {
      if (typeof window.drawBean === 'function') window.drawBean(actor);
      return;
    }
    if (actor.role === 'cat') {
      drawBlackCatAtlas(actor, false);
      return;
    }
    if (actor.animal && actor.animal !== 'human') {
      window.drawAnimalAvatar(actor, isPlayer);
      return;
    }
    drawPlayerAtlas(actor, isPlayer);
  };

  Promise.allSettled([
    loadChunkedImage('player', assetChunks.player),
    loadChunkedImage('blackcat', assetChunks.blackcat)
  ]).then(() => {
    window.COFFEE_SHIP_CHARACTER_ATLAS_V2.ready = assets.player.ready && assets.blackcat.ready;
  });

  window.COFFEE_SHIP_CHARACTER_ATLAS_V2 = {
    version: 2,
    ready: false,
    assets,
    isReady: (name) => Boolean(assets[name]?.ready),
    fallbacks: fallback
  };
})();
