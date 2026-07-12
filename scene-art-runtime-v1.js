(() => {
  'use strict';
  if (window.__COFFEE_SHIP_SCENE_ART_V1__) return;
  window.__COFFEE_SHIP_SCENE_ART_V1__ = true;

  const W = 960, H = 576;
  const sceneImages = {
    cafe: { paths:['assets/scenes/cafe-v1/part-1.txt','assets/scenes/cafe-v1/part-2.txt'], image:new Image(), ready:false },
    deck: { paths:['assets/scenes/deck-v1/background.txt'], image:new Image(), ready:false }
  };

  async function loadImage(item, name) {
    try {
      const data = (await Promise.all(item.paths.map(async path => {
        const response = await fetch(path, { cache:'force-cache' });
        if (!response.ok) throw new Error(`${response.status} ${path}`);
        return (await response.text()).trim();
      }))).join('');
      await new Promise((resolve, reject) => {
        item.image.onload = resolve;
        item.image.onerror = reject;
        item.image.src = `data:image/webp;base64,${data}`;
      });
      item.ready = true;
      window.dispatchEvent(new CustomEvent('coffee-ship:scene-art-ready',{detail:{scene:name}}));
    } catch (error) {
      console.warn(`Coffee Ship ${name} scene art failed; keeping fallback scene.`, error);
    }
  }

  function addStyle() {
    if (document.getElementById('coffeeShipSceneArtV1Style')) return;
    const style = document.createElement('style');
    style.id = 'coffeeShipSceneArtV1Style';
    style.textContent = `
      #game,#deckOverlay{background:#3a2219;image-rendering:pixelated}
      #deckOverlay{position:absolute;z-index:25;pointer-events:none;border-radius:18px}
      #deckOverlay.hidden{display:none!important}
      #deckSceneTip{position:absolute;z-index:48;left:50%;transform:translateX(-50%);max-width:min(86%,620px);padding:8px 13px;border:2px solid #e4b76a;border-radius:12px;background:rgba(46,25,20,.92);color:#fff0c7;font-weight:900;text-align:center;pointer-events:none;box-shadow:0 6px 0 rgba(0,0,0,.25)}
      #deckSceneTip.hidden{display:none!important}
      body[data-coffee-ship-scene="deck"] #game{visibility:hidden!important}
      body[data-coffee-ship-scene="deck"] #messageBtn{display:none!important}
      #cafeDeckDoorAction{background:transparent!important;border-color:transparent!important;box-shadow:none!important}
      #cafeDeckDoorAction::before,#cafeDeckDoorAction::after,.cafe-deck-threshold{display:none!important}
      #cafeDeckDoorGuide.is-near #cafeDeckDoorAction{border:2px solid rgba(255,229,174,.82)!important;background:rgba(215,168,92,.08)!important;box-shadow:0 0 18px rgba(255,214,142,.42)!important}
      .cafe-deck-sign{background:rgba(67,38,26,.92)!important;border-color:#e4b76a!important}
      .cafe-deck-hint{color:#fff0c7!important;text-shadow:0 2px 3px #3d1f17}
      @media(max-width:760px){#deckOverlay{border-radius:14px}#deckSceneTip{font-size:12px;padding:6px 9px;max-width:calc(100% - 28px)}}
    `;
    document.head.appendChild(style);
  }

  function installCafeArt() {
    if (typeof window.drawFloor !== 'function' || typeof window.drawCafe !== 'function') {
      setTimeout(installCafeArt, 120); return;
    }
    if (window.__COFFEE_SHIP_CAFE_ART_INSTALLED__) return;
    window.__COFFEE_SHIP_CAFE_ART_INSTALLED__ = true;
    const oldFloor = window.drawFloor;
    const oldCafe = window.drawCafe;
    window.drawFloor = function() {
      if (!sceneImages.cafe.ready) return oldFloor();
      ctx.save(); ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sceneImages.cafe.image, 0, 0, W, H); ctx.restore();
    };
    window.drawCafe = function() {
      if (!sceneImages.cafe.ready) return oldCafe();
      if (typeof drawText === 'function') drawText('B 留言', 808, 330, 11, 'center', '#ffe5ae');
    };
  }

  function createDeckController() {
    if (window.__COFFEE_SHIP_DECK_ART_CONTROLLER__) return;
    window.__COFFEE_SHIP_DECK_ART_CONTROLLER__ = true;

    let scene = 'cafe', canvas, overlay, dctx, tip, raf = 0, last = 0;
    const keys = new Set();
    const mobile = {up:false,down:false,left:false,right:false};
    const deckPlayer = {x:190,y:455,dir:'right',moving:false,speed:2.65,emote:null,emoteTimer:0};
    const DOOR = {x:104,y:414,r:78};
    const FISH = {x:866,y:408,r:100};
    const blocks = [{x:210,y:330,w:250,h:128},{x:560,y:348,w:270,h:130}];

    const safeJson = (raw, fallback) => { try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
    function appearance() {
      const live = window.COFFEE_SHIP_GAME_API?.player || window.COFFEE_SHIP_PLAYER_POS || {};
      const avatar = safeJson(localStorage.getItem('coffeeShipAvatar'), {}) || {};
      const role = safeJson(localStorage.getItem('coffeeShipRole'), null);
      const animal = role?.specialHuman ? 'human' : (live.animal || avatar.animal || localStorage.getItem('coffeeShipAnimal') || 'human');
      return {
        name: role?.name || live.name || avatar.name || 'Guest',
        roleIcon: role?.icon || '', animal,
        hair: live.hair || avatar.hair || '#2b1d16',
        shirt: live.shirt || avatar.shirt || '#c96a4a',
        skin: live.skin || avatar.skin || '#f0c7a0'
      };
    }

    function ensureOverlay() {
      const panel = document.getElementById('gamePanel');
      canvas = document.getElementById('game');
      if (!panel || !canvas) return false;
      if (getComputedStyle(panel).position === 'static') panel.style.position = 'relative';
      overlay = document.getElementById('deckOverlay');
      if (!overlay) {
        overlay = document.createElement('canvas'); overlay.id='deckOverlay'; overlay.className='hidden';
        overlay.width=W; overlay.height=H; panel.appendChild(overlay);
      }
      dctx = overlay.getContext('2d'); dctx.imageSmoothingEnabled=false;
      tip = document.getElementById('deckSceneTip');
      if (!tip) { tip=document.createElement('div'); tip.id='deckSceneTip'; tip.className='hidden'; panel.appendChild(tip); }
      syncLayout(); return true;
    }
    function syncLayout() {
      if (!canvas || !overlay) return;
      overlay.style.left=`${canvas.offsetLeft}px`; overlay.style.top=`${canvas.offsetTop}px`;
      overlay.style.width=`${canvas.offsetWidth}px`; overlay.style.height=`${canvas.offsetHeight}px`;
      if (tip) tip.style.top=`${Math.max(8,canvas.offsetTop+10)}px`;
    }
    function setTip(value, show=true) { if (!tip) return; tip.textContent=value; tip.classList.toggle('hidden',!show||!value); }
    const near = (p) => Math.hypot(deckPlayer.x-p.x,deckPlayer.y-p.y)<p.r;
    function collides(x,y) { return blocks.some(b => x+15>b.x&&x-15<b.x+b.w&&y+10>b.y&&y-28<b.y+b.h); }
    function update(step) {
      let dx=0,dy=0;
      if(keys.has('arrowleft')||keys.has('a')||mobile.left)dx--;
      if(keys.has('arrowright')||keys.has('d')||mobile.right)dx++;
      if(keys.has('arrowup')||keys.has('w')||mobile.up)dy--;
      if(keys.has('arrowdown')||keys.has('s')||mobile.down)dy++;
      deckPlayer.moving=!!(dx||dy);
      if(!deckPlayer.moving)return;
      const len=Math.hypot(dx,dy)||1; dx=dx/len*deckPlayer.speed*step; dy=dy/len*deckPlayer.speed*step;
      deckPlayer.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');
      const nx=Math.max(40,Math.min(920,deckPlayer.x+dx)); if(!collides(nx,deckPlayer.y))deckPlayer.x=nx;
      const ny=Math.max(255,Math.min(525,deckPlayer.y+dy)); if(!collides(deckPlayer.x,ny))deckPlayer.y=ny;
    }
    function text(value,x,y,size=13,color='#fff0c7') {
      dctx.font=`900 ${size}px ui-rounded,system-ui,sans-serif`; dctx.textAlign='center';
      dctx.fillStyle='#30180f'; dctx.fillText(value,x+2,y+2); dctx.fillStyle=color; dctx.fillText(value,x,y);
    }
    function drawPlayer() {
      const app=appearance(), cast=window.COFFEE_SHIP_UNIFIED_CAST_V3;
      const cat=app.animal==='cat'||app.animal==='blackcat';
      const x=Math.round(deckPlayer.x), y=Math.round(deckPlayer.y);
      if(cast?.isReady?.()&&cast.atlas) {
        const rows={down:0,left:1,right:2,up:3}; const frame=deckPlayer.moving?1+Math.floor(performance.now()/145)%3:0;
        const type=cat?'blackcat':'player', sw=24,sh=30;
        const sx=cast.offsets[type]+frame*sw, sy=(rows[deckPlayer.dir]??0)*sh;
        const w=cat?72:96,h=cat?90:120,anchor=cat?63:82;
        dctx.save();dctx.imageSmoothingEnabled=false;dctx.drawImage(cast.atlas,sx,sy,sw,sh,x-w/2,y-anchor,w,h);dctx.restore();
      } else {
        dctx.fillStyle='rgba(40,20,14,.25)';dctx.beginPath();dctx.ellipse(x,y+26,20,6,0,0,Math.PI*2);dctx.fill();
        dctx.fillStyle=app.shirt;dctx.fillRect(x-16,y-8,32,34);dctx.fillStyle=app.skin;dctx.fillRect(x-11,y-29,22,21);dctx.fillStyle=app.hair;dctx.fillRect(x-14,y-37,28,12);
      }
      text(`${app.roleIcon?app.roleIcon+' ':cat?'🐈‍⬛ ':''}${app.name}`,x,y-(cat?58:91));
    }
    function hotspot(p,icon,label) {
      const active=near(p),pulse=3+Math.sin(performance.now()/240)*2;
      dctx.save();dctx.globalAlpha=active?.82:.3;dctx.strokeStyle=active?'#ffe1a0':'#fff4df';dctx.lineWidth=active?4:2;
      dctx.beginPath();dctx.ellipse(p.x,p.y+20,32+pulse,11+pulse*.25,0,0,Math.PI*2);dctx.stroke();dctx.restore();
      if(active)text(`${icon} ${label}`,p.x,p.y-14,13);
    }
    function draw() {
      if(sceneImages.deck.ready){dctx.imageSmoothingEnabled=false;dctx.drawImage(sceneImages.deck.image,0,0,W,H);}
      else {const g=dctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#70caf3');g.addColorStop(.48,'#168dcc');g.addColorStop(.49,'#9a613e');g.addColorStop(1,'#4a281c');dctx.fillStyle=g;dctx.fillRect(0,0,W,H);}
      hotspot(DOOR,'🚪','返回咖啡廳');hotspot(FISH,'🎣','開始釣魚');drawPlayer();
    }
    function loop(now){if(scene!=='deck'){raf=0;return;}raf=requestAnimationFrame(loop);if(now-last<30)return;const step=Math.min(2.2,(last?now-last:33)/16.667);last=now;update(step);draw();if(near(DOOR))setTip('🚪 按 E／互動返回咖啡廳');else if(near(FISH))setTip('🎣 按 F／咖啡鍵開始釣魚');else setTip('',false);}
    function sceneState(next){window.COFFEE_SHIP_SCENE=next;document.body.dataset.coffeeShipScene=next;window.dispatchEvent(new CustomEvent('coffee-ship:scene',{detail:{scene:next}}));}
    function switchToDeck(){if(!ensureOverlay())return false;scene='deck';deckPlayer.x=190;deckPlayer.y=455;deckPlayer.dir='right';keys.clear();syncLayout();overlay.classList.remove('hidden');sceneState('deck');setTip('🌊 甲板｜左側艙門返回，右側海面釣魚');last=0;if(!raf)raf=requestAnimationFrame(loop);return true;}
    function switchToCafe(){scene='cafe';keys.clear();if(raf){cancelAnimationFrame(raf);raf=0;}overlay?.classList.add('hidden');setTip('',false);sceneState('cafe');return true;}
    function requestFishing(){if(scene!=='deck')return false;if(!near(FISH)){setTip('🎣 請走到右側救生圈附近');return false;}window.dispatchEvent(new CustomEvent('coffee-ship:request-fishing',{detail:{source:'deck',x:deckPlayer.x,y:deckPlayer.y}}));setTip('🎣 正在準備釣魚…');return true;}
    function action(){if(scene!=='deck')return false;if(near(DOOR))return switchToCafe();if(near(FISH))return requestFishing();return false;}

    addEventListener('resize',syncLayout);addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(scene!=='deck')return;if(['arrowleft','arrowright','arrowup','arrowdown','w','a','s','d'].includes(k)){keys.add(k);e.preventDefault();}if(k==='e'){action();e.preventDefault();}if(k==='f'||k==='c'){requestFishing();e.preventDefault();}});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
    document.addEventListener('pointerdown',e=>{if(scene!=='deck')return;const move=e.target.closest?.('[data-move]');if(move){mobile[move.dataset.move]=true;e.preventDefault();}});document.addEventListener('pointerup',()=>Object.keys(mobile).forEach(k=>mobile[k]=false));
    document.addEventListener('click',e=>{if(scene!=='deck')return;if(e.target.closest?.('#sitBtn')){action();e.preventDefault();}if(e.target.closest?.('#coffeeBtn')){requestFishing();e.preventDefault();}} ,true);

    window.COFFEE_SHIP_DECK={switchToDeck,switchToCafe,requestFishing,handleAction:action,isDeckOpen:()=>scene==='deck',getScene:()=>scene,getPlayer:()=>({...deckPlayer})};
  }

  addStyle();installCafeArt();createDeckController();loadImage(sceneImages.cafe,'cafe');loadImage(sceneImages.deck,'deck');
  window.COFFEE_SHIP_SCENE_ART_V1={sceneImages};
})();
