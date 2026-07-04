(() => {
  const W = 960;
  const H = 576;
  let scene = 'cafe';
  let overlay;
  let ctx;
  let mobileReturnBtn;
  let deckPlayer = { x: 150, y: 360, speed: 2.4, emote: null, emoteTimer: 0 };
  const keys = new Set();
  let wave = 0;
  let fade = 0;
  let shootingStars = [];
  let deckShownOnce = false;

  function addStyle() {
    if (document.getElementById('deckSceneStyle')) return;
    const style = document.createElement('style');
    style.id = 'deckSceneStyle';
    style.textContent = `
      .deck-overlay {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 9;
        pointer-events: none;
        image-rendering: pixelated;
      }
      .deck-overlay.hidden { display: none; }
      .deck-tip {
        position: absolute;
        left: 50%;
        top: 78px;
        transform: translateX(-50%);
        z-index: 10;
        color: #fff4d8;
        background: rgba(21,16,32,.9);
        border: 2px solid #76536a;
        border-radius: 12px;
        padding: 8px 12px;
        font-weight: 900;
        pointer-events: none;
        box-shadow: 0 6px 0 rgba(0,0,0,.25);
      }
      .deck-tip.hidden { display: none; }
      .deck-mobile-return {
        display: none;
        position: absolute;
        right: 18px;
        bottom: 18px;
        z-index: 16000;
        min-height: 48px;
        padding: 11px 16px;
        border: 2px solid #ffe5ae;
        border-radius: 14px;
        background: #f0a75c;
        color: #2b1713;
        font-size: 16px;
        font-weight: 1000;
        box-shadow: 0 6px 0 #9b5d31;
        pointer-events: auto;
        touch-action: manipulation;
      }
      @media (max-width:760px) {
        .mobile-controls { position: relative; z-index: 20; }
        .game-topbar { position: relative; z-index: 20; }
        .deck-mobile-return.show { display: block; }
        .deck-tip { top: 64px; max-width: calc(100% - 32px); text-align: center; }
      }
    `;
    document.head.appendChild(style);
  }

  function makeOverlay() {
    const panel = document.getElementById('gamePanel');
    const game = document.getElementById('game');
    if (!panel || !game) return;
    if (getComputedStyle(panel).position === 'static') panel.style.position = 'relative';

    overlay = document.getElementById('deckOverlay');
    if (!overlay) {
      overlay = document.createElement('canvas');
      overlay.id = 'deckOverlay';
      overlay.className = 'deck-overlay hidden';
      overlay.width = W;
      overlay.height = H;
      panel.appendChild(overlay);
    }
    ctx = overlay.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let tip = document.getElementById('deckTip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'deckTip';
      tip.className = 'deck-tip hidden';
      tip.textContent = '🚪 靠近右側門按 E 前往甲板';
      panel.appendChild(tip);
    }

    mobileReturnBtn = document.getElementById('deckMobileReturnBtn');
    if (!mobileReturnBtn) {
      mobileReturnBtn = document.createElement('button');
      mobileReturnBtn.type = 'button';
      mobileReturnBtn.id = 'deckMobileReturnBtn';
      mobileReturnBtn.className = 'deck-mobile-return';
      mobileReturnBtn.textContent = '🚪 回咖啡廳';
      mobileReturnBtn.setAttribute('aria-label', '回到咖啡廳');
      mobileReturnBtn.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        switchToCafe();
      }, true);
      panel.appendChild(mobileReturnBtn);
    }
  }

  function setTip(text, show) {
    const tip = document.getElementById('deckTip');
    if (!tip) return;
    tip.textContent = text;
    tip.classList.toggle('hidden', !show);
  }

  function updateSceneState(nextScene) {
    window.COFFEE_SHIP_SCENE = nextScene;
    document.body.dataset.coffeeShipScene = nextScene;
    const badge = document.getElementById('sceneStatusBadge');
    if (badge) badge.textContent = nextScene === 'deck' ? '🌊 Deck' : '☕ Cafe';
  }

  function playerPos() {
    return window.COFFEE_SHIP_PLAYER_POS || { x: 480, y: 360 };
  }

  function nearCafeDoor() {
    const p = playerPos();
    return Math.hypot(p.x - 835, p.y - 300) < 95;
  }

  function switchToDeck() {
    if (!overlay) makeOverlay();
    if (!overlay) return;
    scene = 'deck';
    keys.clear();
    overlay.classList.remove('hidden');
    mobileReturnBtn?.classList.add('show');
    deckPlayer.x = 145;
    deckPlayer.y = 360;
    fade = 1;
    updateSceneState('deck');
    if (!deckShownOnce) {
      deckShownOnce = true;
      setTip('🌊 Welcome to the Deck｜手機可按右下角「回咖啡廳」', true);
      setTimeout(() => { if (scene === 'deck') setTip('', false); }, 4200);
    }
  }

  function switchToCafe() {
    scene = 'cafe';
    keys.clear();
    overlay?.classList.add('hidden');
    mobileReturnBtn?.classList.remove('show');
    setTip('', false);
    updateSceneState('cafe');
  }

  function px(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  function text(t, x, y, size = 16, color = '#fff4d8') {
    ctx.font = `900 ${size}px ui-rounded, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#120b17';
    ctx.fillText(t, x + 2, y + 2);
    ctx.fillStyle = color;
    ctx.fillText(t, x, y);
  }

  function drawSky() {
    ctx.fillStyle = '#0c1025';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#121a3b';
    ctx.fillRect(0, 220, W, 150);

    for (let i = 0; i < 80; i++) {
      const x = (i * 113) % W;
      const y = 30 + ((i * 47) % 180);
      const blink = Math.sin((Date.now() / 600) + i) > 0.35;
      px(x, y, blink ? 3 : 2, blink ? 3 : 2, blink ? '#fff4d8' : '#8fa4d8');
    }
    px(730, 64, 46, 46, '#fff4d8');
    px(748, 58, 36, 54, '#0c1025');

    if (Math.random() < 0.006) shootingStars.push({ x: Math.random() * 560 + 140, y: Math.random() * 120 + 40, life: 60 });
    shootingStars.forEach(s => {
      px(s.x, s.y, 22, 3, '#fff4d8');
      px(s.x - 16, s.y + 4, 14, 2, '#7dc7ff');
      s.x += 7;
      s.y += 2;
      s.life--;
    });
    shootingStars = shootingStars.filter(s => s.life > 0);
  }

  function drawSea() {
    wave += 0.05;
    ctx.fillStyle = '#0a3551';
    ctx.fillRect(0, 285, W, 291);
    for (let row = 0; row < 8; row++) {
      const y = 310 + row * 30;
      for (let x = -80; x < W + 80; x += 70) {
        const ox = Math.sin(wave + row) * 20;
        text('≈≈≈', x + ox, y, 18, row % 2 ? '#5fc6d8' : '#9ce8f0');
      }
    }
  }

  function drawDeck() {
    const sway = Math.sin(Date.now() / 900) * 2;
    px(80, 330 + sway, 800, 150, '#6e4938');
    px(80, 330 + sway, 800, 16, '#a56b45');
    for (let x = 95; x < 870; x += 48) px(x, 350 + sway, 4, 124, '#4e332d');
    px(80, 312 + sway, 800, 22, '#3d2a32');
    for (let x = 105; x < 850; x += 70) px(x, 302 + sway, 20, 18, '#ffe5ae');

    px(88, 350 + sway, 50, 90, '#221728');
    px(103, 380 + sway, 20, 34, '#a56b45');
    text('🚪', 113, 370 + sway, 28);
    text('回咖啡廳', 125, 455 + sway, 14, '#ffe5ae');

    px(620, 388 + sway, 95, 38, '#694638');
    px(640, 374 + sway, 26, 18, '#79d0b1');
    px(690, 374 + sway, 26, 18, '#79d0b1');
    px(632, 398 + sway, 18, 16, '#fff4d8');
    text('甲板咖啡桌', 670, 455 + sway, 14, '#fff4d8');

    text('⚓', 815, 405 + sway, 38, '#d7bb79');
    text('🌊 Deck', 480, 318 + sway, 26, '#fff4d8');
    text('海景與星空', 480, 348 + sway, 16, '#9ce8f0');
  }

  function drawDeckPlayer() {
    const x = Math.round(deckPlayer.x), y = Math.round(deckPlayer.y);
    px(x - 12, y + 18, 24, 5, '#120b17');
    px(x - 11, y - 26, 22, 20, '#f0c7a0');
    px(x - 14, y - 34, 28, 12, '#2b1d16');
    px(x - 14, y - 6, 28, 28, '#c96a4a');
    px(x - 9, y + 21, 7, 15, '#2a2634');
    px(x + 3, y + 21, 7, 15, '#2a2634');
    px(x - 5, y - 18, 4, 4, '#21182a');
    px(x + 5, y - 18, 4, 4, '#21182a');
    text('你', x, y - 46, 13, '#79d0b1');
    if (deckPlayer.emoteTimer > 0) text(deckPlayer.emote, x, y - 66, 22, '#fff4d8');
  }

  function drawDoorHint() {
    if (scene !== 'cafe') return;
    const show = nearCafeDoor();
    setTip('🚪 按 E 前往右側甲板', show);
  }

  function updateDeckPlayer() {
    let dx = 0, dy = 0;
    if (keys.has('ArrowUp') || keys.has('w')) dy -= deckPlayer.speed;
    if (keys.has('ArrowDown') || keys.has('s')) dy += deckPlayer.speed;
    if (keys.has('ArrowLeft') || keys.has('a')) dx -= deckPlayer.speed;
    if (keys.has('ArrowRight') || keys.has('d')) dx += deckPlayer.speed;
    if (dx && dy) { dx *= .707; dy *= .707; }
    deckPlayer.x = Math.max(105, Math.min(850, deckPlayer.x + dx));
    deckPlayer.y = Math.max(350, Math.min(455, deckPlayer.y + dy));
    if (deckPlayer.emoteTimer > 0) deckPlayer.emoteTimer--;
  }

  function loop() {
    if (scene === 'deck' && ctx) {
      updateDeckPlayer();
      drawSky();
      drawSea();
      drawDeck();
      drawDeckPlayer();
      if (Math.hypot(deckPlayer.x - 113, deckPlayer.y - 395) < 70) {
        setTip('🚪 按 E 或右下角按鈕回咖啡廳', true);
      } else {
        setTip('', false);
      }
      if (fade > 0) {
        ctx.globalAlpha = fade;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
        fade -= 0.04;
      }
    } else {
      drawDoorHint();
    }
    requestAnimationFrame(loop);
  }

  function onKeyDown(e) {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    keys.add(k);
    if (scene === 'deck' && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    if (k === 'e') {
      if (scene === 'cafe' && nearCafeDoor()) {
        e.preventDefault();
        switchToDeck();
      } else if (scene === 'deck' && Math.hypot(deckPlayer.x - 113, deckPlayer.y - 395) < 70) {
        e.preventDefault();
        switchToCafe();
      }
    }
    if (scene === 'deck' && e.code === 'Space') {
      deckPlayer.emote = '✨';
      deckPlayer.emoteTimer = 80;
    }
  }

  function onKeyUp(e) {
    keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
  }

  function init() {
    addStyle();
    makeOverlay();
    updateSceneState('cafe');
    window.COFFEE_SHIP_DECK = {
      switchToDeck,
      switchToCafe,
      isDeckOpen: () => scene === 'deck',
      getScene: () => scene
    };
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    loop();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();