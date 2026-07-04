(() => {
  'use strict';
  if (window.__COFFEE_SHIP_NPC_BEHAVIOR_POLISH__) return;
  window.__COFFEE_SHIP_NPC_BEHAVIOR_POLISH__ = true;

  const SAFE_CONFIG = {
    Momo: {
      x:230, y:236,
      roam:[{x:230,y:236},{x:390,y:236},{x:480,y:260},{x:430,y:315},{x:390,y:465},{x:560,y:245}]
    },
    Peak: {
      x:600, y:295,
      roam:[{x:600,y:295},{x:505,y:270},{x:475,y:455},{x:600,y:455},{x:785,y:300},{x:780,y:455}]
    },
    Bean: {
      x:755, y:230,
      roam:[{x:755,y:230},{x:580,y:240},{x:480,y:300},{x:515,y:455},{x:770,y:455},{x:355,y:300}]
    },
    Mugi: {
      x:250, y:452,
      roam:[{x:250,y:452},{x:430,y:455},{x:590,y:455},{x:790,y:310},{x:510,y:260},{x:270,y:285},{x:720,y:225}]
    }
  };

  let patched = false;
  let auraCanvas = null;
  let auraCtx = null;
  let gameCanvas = null;
  const motes = Array.from({length:10},(_,index)=>({angle:index*Math.PI*.2,radius:24+index%3*7,speed:.004+index%4*.0015}));

  function patchNpcPositions() {
    const npcs = window.COFFEE_SHIP_NPCS;
    if (!Array.isArray(npcs) || !npcs.length) return false;
    npcs.forEach(npc => {
      const config = SAFE_CONFIG[npc.name];
      if (!config) return;
      npc.x = config.x;
      npc.y = config.y;
      npc.targetX = config.roam[1].x;
      npc.targetY = config.roam[1].y;
      npc.roam = config.roam.map(point => ({...point}));
      npc.wait = Math.min(Number(npc.wait)||0,45);
      npc.bounds = {x:145,y:190,w:650,h:305};
    });
    patched = true;
    return true;
  }

  function ensureAuraCanvas() {
    const panel = document.getElementById('gamePanel');
    gameCanvas = document.getElementById('game');
    if (!panel || !gameCanvas) return false;
    auraCanvas = document.getElementById('deckCoffeeAuraCanvas');
    if (!auraCanvas) {
      auraCanvas = document.createElement('canvas');
      auraCanvas.id = 'deckCoffeeAuraCanvas';
      auraCanvas.width = 960;
      auraCanvas.height = 576;
      auraCanvas.style.cssText = 'position:absolute;z-index:13;pointer-events:none;display:none;image-rendering:auto';
      panel.appendChild(auraCanvas);
    }
    auraCtx = auraCanvas.getContext('2d');
    syncAuraLayout();
    return true;
  }

  function syncAuraLayout() {
    if (!auraCanvas || !gameCanvas) return;
    auraCanvas.style.left = `${gameCanvas.offsetLeft}px`;
    auraCanvas.style.top = `${gameCanvas.offsetTop}px`;
    auraCanvas.style.width = `${gameCanvas.offsetWidth}px`;
    auraCanvas.style.height = `${gameCanvas.offsetHeight}px`;
  }

  function activeEffect() {
    const effect = window.COFFEE_SHIP_COFFEE_EFFECT;
    return effect && effect.expiresAt > Date.now() ? effect : null;
  }

  function deckOpen() {
    return !!window.COFFEE_SHIP_DECK?.isDeckOpen?.();
  }

  function drawAura(now) {
    requestAnimationFrame(drawAura);
    if (!auraCtx && !ensureAuraCanvas()) return;
    auraCtx.clearRect(0,0,960,576);
    const effect = activeEffect();
    if (!deckOpen() || !effect) {
      auraCanvas.style.display = 'none';
      return;
    }
    auraCanvas.style.display = 'block';
    syncAuraLayout();
    const player = window.COFFEE_SHIP_DECK?.getPlayerPosition?.();
    if (!player) return;
    const x = player.x;
    const y = player.y;
    const pulse = 5 + Math.sin(now/170)*4;

    auraCtx.save();
    auraCtx.globalAlpha = .35;
    auraCtx.strokeStyle = effect.aura || '#9ce8f0';
    auraCtx.lineWidth = 4;
    auraCtx.beginPath();
    auraCtx.ellipse(x,y+25,30+pulse,10+pulse*.3,0,0,Math.PI*2);
    auraCtx.stroke();
    auraCtx.globalAlpha = .14;
    auraCtx.beginPath();
    auraCtx.arc(x,y-3,35+pulse,0,Math.PI*2);
    auraCtx.stroke();

    motes.forEach((mote,index) => {
      const angle = mote.angle + now*mote.speed;
      const mx = x + Math.cos(angle)*(mote.radius+pulse*.5);
      const my = y - 5 + Math.sin(angle)*(mote.radius*.55);
      auraCtx.globalAlpha = .35 + (index%3)*.16;
      auraCtx.fillStyle = effect.aura || '#9ce8f0';
      auraCtx.fillRect(Math.round(mx),Math.round(my),3+(index%2),3+(index%2));
    });

    auraCtx.globalAlpha = 1;
    auraCtx.font = '900 16px system-ui';
    auraCtx.textAlign = 'center';
    auraCtx.fillStyle = '#080b14';
    auraCtx.fillText(`${effect.icon} ${effect.name}`,x+2,y-76+2);
    auraCtx.fillStyle = effect.aura || '#fff4d8';
    auraCtx.fillText(`${effect.icon} ${effect.name}`,x,y-76);
    auraCtx.restore();
  }

  function init() {
    if (!patchNpcPositions()) {
      let attempts = 0;
      const timer = setInterval(() => {
        attempts += 1;
        if (patchNpcPositions() || attempts > 30) clearInterval(timer);
      },200);
    }
    ensureAuraCanvas();
    window.addEventListener('resize',syncAuraLayout);
    window.addEventListener('orientationchange',()=>setTimeout(syncAuraLayout,120));
    requestAnimationFrame(drawAura);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
