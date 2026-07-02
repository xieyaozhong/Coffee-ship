(() => {
  const CAT_NAME = 'Mugi';
  const lines = ['喵～', '呼嚕呼嚕…', 'Mugi 蹭了蹭你的手。', 'Mugi 看起來很滿意。', 'Mugi 在咖啡香裡打滾。'];
  const PET_DISTANCE = 92;
  const CAT_RADIUS = 18;
  const PLAYER_RADIUS = 26;

  function injectStyle() {
    const style = document.createElement('style');
    style.textContent = `
      .game-panel { position: relative; overflow: hidden; }
      .shop-cat-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 8;
      }
      .shop-cat {
        position: absolute;
        width: 38px;
        height: 30px;
        transform: translate(-50%, -50%);
        image-rendering: pixelated;
        filter: drop-shadow(0 3px 0 rgba(0,0,0,.35));
        will-change: left, top, transform;
      }
      .shop-cat.flip { transform: translate(-50%, -50%) scaleX(-1); }
      .shop-cat.pet-happy { animation: cat-hop .34s steps(2) 3; }
      @keyframes cat-hop { 0%,100% { margin-top: 0; } 50% { margin-top: -5px; } }

      .cat-pixel { position: absolute; width: 4px; height: 4px; background: var(--c); box-shadow: var(--s); }
      .cat-outline { --c:#111; }
      .cat-white { --c:#fffdf4; }
      .cat-orange { --c:#df6d13; }
      .cat-green { --c:#8b9a86; }
      .cat-eye { --c:#30384d; }

      .shop-cat-label,
      .shop-cat-bubble,
      .shop-cat-hint {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        font-family: ui-rounded, system-ui, sans-serif;
        font-weight: 900;
        text-shadow: 2px 2px 0 #120b17;
      }
      .shop-cat-label {
        top: -19px;
        color: #fff4d8;
        font-size: 12px;
      }
      .shop-cat-bubble,
      .shop-cat-hint {
        display: none;
        bottom: 33px;
        padding: 5px 8px;
        color: #fff4d8;
        background: #151020;
        border: 2px solid #76536a;
        border-radius: 8px;
        font-size: 12px;
      }
      .shop-cat.show-bubble .shop-cat-bubble { display: block; }
      .shop-cat.near-player:not(.show-bubble) .shop-cat-hint { display: block; }
    `;
    document.head.appendChild(style);
  }

  function catSpriteHtml() {
    return `
      <div class="shop-cat-label">${CAT_NAME}</div>
      <div class="shop-cat-bubble">喵～</div>
      <div class="shop-cat-hint">按 P 摸摸</div>
      <span class="cat-pixel cat-outline" style="left:0px;top:4px;width:4px;height:12px"></span>
      <span class="cat-pixel cat-outline" style="left:4px;top:0px;width:8px;height:4px"></span>
      <span class="cat-pixel cat-outline" style="left:12px;top:4px;width:4px;height:4px"></span>
      <span class="cat-pixel cat-outline" style="left:16px;top:8px;width:8px;height:4px"></span>
      <span class="cat-pixel cat-outline" style="left:24px;top:4px;width:4px;height:4px"></span>
      <span class="cat-pixel cat-outline" style="left:28px;top:0px;width:8px;height:4px"></span>
      <span class="cat-pixel cat-outline" style="left:36px;top:4px;width:4px;height:12px"></span>
      <span class="cat-pixel cat-outline" style="left:4px;top:16px;width:32px;height:4px"></span>
      <span class="cat-pixel cat-outline" style="left:4px;top:20px;width:4px;height:12px"></span>
      <span class="cat-pixel cat-outline" style="left:12px;top:28px;width:4px;height:4px"></span>
      <span class="cat-pixel cat-outline" style="left:20px;top:28px;width:12px;height:4px"></span>
      <span class="cat-pixel cat-outline" style="left:36px;top:20px;width:4px;height:12px"></span>
      <span class="cat-pixel cat-outline" style="left:40px;top:16px;width:4px;height:4px"></span>
      <span class="cat-pixel cat-outline" style="left:44px;top:12px;width:4px;height:12px"></span>
      <span class="cat-pixel cat-outline" style="left:48px;top:8px;width:4px;height:4px"></span>
      <span class="cat-pixel cat-outline" style="left:52px;top:8px;width:4px;height:12px"></span>
      <span class="cat-pixel cat-white" style="left:4px;top:4px;width:8px;height:12px"></span>
      <span class="cat-pixel cat-white" style="left:16px;top:12px;width:20px;height:4px"></span>
      <span class="cat-pixel cat-white" style="left:8px;top:20px;width:28px;height:8px"></span>
      <span class="cat-pixel cat-green" style="left:8px;top:4px;width:8px;height:12px"></span>
      <span class="cat-pixel cat-green" style="left:32px;top:20px;width:8px;height:8px"></span>
      <span class="cat-pixel cat-orange" style="left:28px;top:4px;width:8px;height:12px"></span>
      <span class="cat-pixel cat-orange" style="left:20px;top:20px;width:8px;height:4px"></span>
      <span class="cat-pixel cat-orange" style="left:52px;top:12px;width:4px;height:8px"></span>
      <span class="cat-pixel cat-eye" style="left:12px;top:12px;width:4px;height:4px"></span>
      <span class="cat-pixel cat-eye" style="left:28px;top:12px;width:4px;height:4px"></span>
    `;
  }

  function initCat() {
    const panel = document.getElementById('gamePanel');
    const canvas = document.getElementById('game');
    if (!panel || !canvas || document.querySelector('.shop-cat-layer')) return;

    const layer = document.createElement('div');
    layer.className = 'shop-cat-layer';
    const cat = document.createElement('div');
    cat.className = 'shop-cat';
    cat.innerHTML = catSpriteHtml();
    layer.appendChild(cat);
    panel.appendChild(layer);

    let x = 245;
    let y = 455;
    let targetX = 320;
    let targetY = 398;
    let lastX = x;
    let pause = 30;
    let petCooldown = false;
    let lastFrame = performance.now();
    const bubble = cat.querySelector('.shop-cat-bubble');
    const bounds = { left: 150, right: 820, top: 230, bottom: 520 };
    const blocked = [
      { x: 120, y: 96, w: 360, h: 88 },
      { x: 560, y: 104, w: 210, h: 72 },
      { x: 260, y: 370, w: 70, h: 55 },
      { x: 650, y: 370, w: 90, h: 55 },
      { x: 720, y: 250, w: 70, h: 55 },
      { x: 170, y: 250, w: 70, h: 55 }
    ];

    function playerPosition() {
      return window.COFFEE_SHIP_PLAYER_POS || { x: 480, y: 360 };
    }

    function toPanelPoint(gameX, gameY) {
      const rect = canvas.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return {
        x: rect.left - panelRect.left + (gameX / 960) * rect.width,
        y: rect.top - panelRect.top + (gameY / 576) * rect.height
      };
    }

    function circleRectHit(cx, cy, r, rect) {
      const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
      const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
      return Math.hypot(cx - nx, cy - ny) < r;
    }

    function isBlocked(nx, ny) {
      if (nx < bounds.left || nx > bounds.right || ny < bounds.top || ny > bounds.bottom) return true;
      if (blocked.some(rect => circleRectHit(nx, ny, CAT_RADIUS, rect))) return true;
      const pp = playerPosition();
      return Math.hypot(pp.x - nx, pp.y - ny) < CAT_RADIUS + PLAYER_RADIUS;
    }

    function render() {
      window.COFFEE_SHIP_SHOP_CAT = { x, y, radius: CAT_RADIUS, name: CAT_NAME };
      const p = toPanelPoint(x, y);
      cat.style.left = `${p.x}px`;
      cat.style.top = `${p.y}px`;
      cat.classList.toggle('flip', x < lastX);
      const pp = playerPosition();
      cat.classList.toggle('near-player', Math.hypot(pp.x - x, pp.y - y) < PET_DISTANCE);
    }

    function say(text) {
      bubble.textContent = text;
      cat.classList.add('show-bubble');
      setTimeout(() => cat.classList.remove('show-bubble'), 2200);
    }

    function chooseTarget() {
      const tries = 18;
      for (let i = 0; i < tries; i++) {
        const nx = bounds.left + Math.random() * (bounds.right - bounds.left);
        const ny = bounds.top + Math.random() * (bounds.bottom - bounds.top);
        if (!isBlocked(nx, ny)) {
          targetX = nx;
          targetY = ny;
          return;
        }
      }
      targetX = x;
      targetY = y;
    }

    function petCat() {
      const pp = playerPosition();
      if (Math.hypot(pp.x - x, pp.y - y) > PET_DISTANCE) return false;
      if (petCooldown) return true;
      petCooldown = true;
      pause = 120;
      cat.classList.add('pet-happy');
      say(lines[Math.floor(Math.random() * lines.length)]);
      setTimeout(() => cat.classList.remove('pet-happy'), 1100);
      setTimeout(() => { petCooldown = false; }, 1800);
      return true;
    }

    function wander(now) {
      const dt = Math.min(2, (now - lastFrame) / 16.67);
      lastFrame = now;
      const pp = playerPosition();
      const distToPlayer = Math.hypot(pp.x - x, pp.y - y);

      if (distToPlayer < CAT_RADIUS + PLAYER_RADIUS + 8) {
        pause = Math.max(pause, 20);
        const awayX = x - pp.x;
        const awayY = y - pp.y;
        const d = Math.hypot(awayX, awayY) || 1;
        const nx = x + (awayX / d) * 1.15 * dt;
        const ny = y + (awayY / d) * 1.15 * dt;
        if (!isBlocked(nx, ny)) {
          lastX = x;
          x = nx;
          y = ny;
        }
      } else if (pause > 0) {
        pause -= dt;
      } else {
        const dx = targetX - x;
        const dy = targetY - y;
        const d = Math.hypot(dx, dy);
        if (d < 6) {
          pause = 45 + Math.random() * 90;
          if (Math.random() < 0.33) say(lines[Math.floor(Math.random() * lines.length)]);
          chooseTarget();
        } else {
          const speed = 0.65;
          const nx = x + (dx / d) * speed * dt;
          const ny = y + (dy / d) * speed * dt;
          if (!isBlocked(nx, ny)) {
            lastX = x;
            x = nx;
            y = ny;
          } else {
            pause = 24;
            chooseTarget();
          }
        }
      }

      render();
      requestAnimationFrame(wander);
    }

    render();
    chooseTarget();
    setTimeout(() => say('喵～'), 1200);
    requestAnimationFrame(wander);
    window.addEventListener('resize', render);
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'p' && petCat()) e.preventDefault();
    });
    layer.addEventListener('pointerdown', () => petCat());
  }

  injectStyle();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCat);
  else initCat();
})();
