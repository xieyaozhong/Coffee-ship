(() => {
  const CAT_NAME = '店貓 Mugi';
  const lines = ['喵～', 'Mugi 在吧台旁巡邏。', 'Mugi 想偷聞拿鐵。', 'Mugi 打了一個小哈欠。', 'Mugi 躺在暖光裡。'];

  function injectStyle() {
    const style = document.createElement('style');
    style.textContent = `
      .game-panel { position: relative; overflow: hidden; }
      .shop-cat-layer {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 8;
      }
      .shop-cat {
        position: absolute;
        width: 58px;
        height: 44px;
        transform: translate(-50%, -50%);
        transition: left 1.6s linear, top 1.6s linear;
        image-rendering: pixelated;
        filter: drop-shadow(0 4px 0 rgba(0,0,0,.35));
      }
      .shop-cat-body {
        position: absolute;
        left: 13px;
        top: 18px;
        width: 34px;
        height: 18px;
        background: #d99a62;
        border: 3px solid #241521;
        border-radius: 12px 14px 10px 10px;
        box-sizing: border-box;
      }
      .shop-cat-head {
        position: absolute;
        left: 3px;
        top: 8px;
        width: 25px;
        height: 24px;
        background: #e7ad72;
        border: 3px solid #241521;
        border-radius: 9px;
        box-sizing: border-box;
      }
      .shop-cat-head::before,
      .shop-cat-head::after {
        content: '';
        position: absolute;
        top: -9px;
        width: 10px;
        height: 10px;
        background: #e7ad72;
        border-left: 3px solid #241521;
        border-top: 3px solid #241521;
        transform: rotate(45deg);
        box-sizing: border-box;
      }
      .shop-cat-head::before { left: 0; }
      .shop-cat-head::after { right: 0; }
      .shop-cat-eye {
        position: absolute;
        top: 8px;
        width: 4px;
        height: 4px;
        background: #241521;
      }
      .shop-cat-eye.left { left: 6px; }
      .shop-cat-eye.right { right: 6px; }
      .shop-cat-tail {
        position: absolute;
        right: 2px;
        top: 10px;
        width: 18px;
        height: 18px;
        border-top: 5px solid #d99a62;
        border-right: 5px solid #241521;
        border-radius: 50%;
        transform: rotate(25deg);
      }
      .shop-cat.sleeping .shop-cat-eye {
        height: 2px;
        top: 10px;
      }
      .shop-cat.flip { transform: translate(-50%, -50%) scaleX(-1); }
      .shop-cat-label,
      .shop-cat-bubble {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        font-family: ui-rounded, system-ui, sans-serif;
        font-weight: 800;
        text-shadow: 2px 2px 0 #120b17;
      }
      .shop-cat-label {
        top: -20px;
        color: #fff4d8;
        font-size: 13px;
      }
      .shop-cat-bubble {
        display: none;
        bottom: 44px;
        padding: 6px 9px;
        color: #fff4d8;
        background: #151020;
        border: 2px solid #76536a;
        border-radius: 8px;
        font-size: 13px;
      }
      .shop-cat.show-bubble .shop-cat-bubble { display: block; }
    `;
    document.head.appendChild(style);
  }

  function initCat() {
    const panel = document.getElementById('gamePanel');
    const canvas = document.getElementById('game');
    if (!panel || !canvas || document.querySelector('.shop-cat-layer')) return;

    const layer = document.createElement('div');
    layer.className = 'shop-cat-layer';
    const cat = document.createElement('div');
    cat.className = 'shop-cat';
    cat.innerHTML = `
      <div class="shop-cat-label">${CAT_NAME}</div>
      <div class="shop-cat-bubble">喵～</div>
      <div class="shop-cat-tail"></div>
      <div class="shop-cat-body"></div>
      <div class="shop-cat-head"><span class="shop-cat-eye left"></span><span class="shop-cat-eye right"></span></div>
    `;
    layer.appendChild(cat);
    panel.appendChild(layer);

    let x = 245;
    let y = 455;
    let lastX = x;
    let sleeping = false;
    const bubble = cat.querySelector('.shop-cat-bubble');

    function toPanelPoint(gameX, gameY) {
      const rect = canvas.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return {
        x: rect.left - panelRect.left + (gameX / 960) * rect.width,
        y: rect.top - panelRect.top + (gameY / 576) * rect.height
      };
    }

    function render() {
      const p = toPanelPoint(x, y);
      cat.style.left = `${p.x}px`;
      cat.style.top = `${p.y}px`;
      cat.classList.toggle('flip', x < lastX);
      cat.classList.toggle('sleeping', sleeping);
    }

    function say(text) {
      bubble.textContent = text;
      cat.classList.add('show-bubble');
      setTimeout(() => cat.classList.remove('show-bubble'), 2200);
    }

    function chooseNext() {
      lastX = x;
      const spots = [
        { x: 210, y: 430 },
        { x: 320, y: 398 },
        { x: 505, y: 505 },
        { x: 665, y: 432 },
        { x: 780, y: 368 },
        { x: 185, y: 265 },
        { x: 455, y: 235 }
      ];
      const spot = spots[Math.floor(Math.random() * spots.length)];
      x = spot.x;
      y = spot.y;
      sleeping = Math.random() < 0.25;
      render();
      if (Math.random() < 0.55) say(lines[Math.floor(Math.random() * lines.length)]);
    }

    render();
    setTimeout(() => say('Mugi 登船了。'), 1200);
    setInterval(chooseNext, 4200);
    window.addEventListener('resize', render);
  }

  injectStyle();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCat);
  else initCat();
})();
