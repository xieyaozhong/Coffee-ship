(() => {
  'use strict';
  if (window.__COFFEE_SHIP_NPC_BEHAVIOR_POLISH_V2__) return;
  window.__COFFEE_SHIP_NPC_BEHAVIOR_POLISH_V2__ = true;

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
      npc.wait = Math.min(Number(npc.wait) || 0, 45);
      npc.bounds = {x:145,y:190,w:650,h:305};
    });

    window.dispatchEvent(new CustomEvent('coffee-ship:npcs-ready'));
    return true;
  }

  function init() {
    if (patchNpcPositions()) return;
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (patchNpcPositions() || attempts >= 12) clearInterval(timer);
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();