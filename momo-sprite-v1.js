(() => {
  if (window.__MOMO_SPRITE_V1__) return;
  window.__MOMO_SPRITE_V1__ = true;
  const fw = 48, fh = 60;
  const rows = { down: 0, left: 1, right: 2, up: 3 };
  const image = new Image();
  const fallback = window.drawMomo;
  let loaded = false;
  image.src = 'assets/characters/momo/momo-sprite-v1.svg?v=2';
  image.onload = () => { loaded = true; };

  function state(n) {
    const dx = (n.targetX || n.x) - n.x;
    const dy = (n.targetY || n.y) - n.y;
    const moving = (n.wait || 0) <= 0 && Math.hypot(dx, dy) > 4;
    if (moving) {
      if (Math.abs(dx) > Math.abs(dy)) n.momoDir = dx < 0 ? 'left' : 'right';
      else n.momoDir = dy < 0 ? 'up' : 'down';
    }
    return { moving, dir: n.momoDir || 'down' };
  }

  window.drawMomo = function(n) {
    if (!loaded) {
      if (typeof fallback === 'function') fallback(n);
      return;
    }
    const x = Math.round(n.x), y = Math.round(n.y);
    const s = state(n);
    const frame = s.moving ? 1 + Math.floor(Date.now() / 145) % 3 : 0;
    if (typeof drawNpcAura === 'function') drawNpcAura(n, '#d7bb79');
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, frame * fw, rows[s.dir] * fh, fw, fh, x - 48, y - 82, 96, 120);
    ctx.restore();
    drawText('☕ Momo', x, y - 91, 13, 'center', '#ffe5ae');
    if (n.emote && n.emoteTimer > 0) drawText(n.emote, x, y - 112, 20);
  };

  window.COFFEE_SHIP_MOMO_SPRITE = { image, version: 2, isReady: () => loaded };
})();

(() => {
  if (window.__COFFEE_SHIP_CHARACTER_RENDER_LOADER_V8__) return;
  window.__COFFEE_SHIP_CHARACTER_RENDER_LOADER_V8__ = true;

  function loadScript(src, onComplete) {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => onComplete?.();
    script.onerror = () => {
      console.warn(`Coffee Ship runtime failed to load: ${src}`);
      onComplete?.();
    };
    document.head.appendChild(script);
  }

  loadScript('momo-style-cast-v1.js?v=cast-8', () => {
    loadScript('unified-character-runtime-v3.js?v=unified-8', () => {
      loadScript('scene-art-runtime-v1.js?v=scene-art-4', () => {
        loadScript('fishing-ui-cleanup-v2.js?v=cleanup-4');
      });
    });
  });
})();
