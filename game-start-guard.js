(() => {
  'use strict';
  if (window.__COFFEE_SHIP_GAME_START_GUARD__) return;
  window.__COFFEE_SHIP_GAME_START_GUARD__ = true;

  const state = {
    entered:false,
    checking:false,
    fallback:false,
    classicRequested:false,
    x:480,
    y:390,
    speed:2.7,
    keys:new Set(),
    mobile:{up:false,down:false,left:false,right:false},
    emote:'',
    emoteTimer:0,
    message:'',
    messageTimer:0,
    frame:0,
    error:null
  };

  let canvas=null;
  let ctx=null;
  let creator=null;
  let gamePanel=null;
  let startBtn=null;
  let raf=0;

  function safeJson(raw,fallback){try{return raw?JSON.parse(raw):fallback;}catch{return fallback;}}
  function px(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
  function label(text,x,y,size=16,color='#fff4d8'){
    ctx.font=`900 ${size}px ui-rounded,system-ui,sans-serif`;
    ctx.textAlign='center';
    ctx.fillStyle='#100b18';ctx.fillText(text,x+2,y+2);
    ctx.fillStyle=color;ctx.fillText(text,x,y);
  }

  function cacheElements(){
    canvas=document.getElementById('game');
    creator=document.getElementById('creator');
    gamePanel=document.getElementById('gamePanel');
    startBtn=document.getElementById('startBtn');
    if(canvas){ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;}
    return !!(canvas&&ctx&&creator&&gamePanel&&startBtn);
  }

  function avatar(){
    const saved=safeJson(localStorage.getItem('coffeeShipAvatar'),{});
    return {
      name:(document.getElementById('playerName')?.value||saved.name||'海上旅人').trim()||'海上旅人',
      hair:document.getElementById('hairColor')?.value||saved.hair||'#2b1d16',
      shirt:document.getElementById('shirtColor')?.value||saved.shirt||'#c96a4a',
      animal:saved.animal||localStorage.getItem('coffeeShipAnimal')||'human'
    };
  }

  function saveAvatar(){
    const current=avatar();
    localStorage.setItem('coffeeShipAvatar',JSON.stringify({...safeJson(localStorage.getItem('coffeeShipAvatar'),{}),...current}));
    localStorage.setItem('coffeeShipAnimal',current.animal);
    return current;
  }

  function forceGameVisible(){
    if(!cacheElements())return false;
    const current=saveAvatar();
    creator.classList.add('hidden');
    gamePanel.classList.remove('hidden');
    gamePanel.style.removeProperty('display');
    document.body.dataset.coffeeShipScene='cafe';
    window.COFFEE_SHIP_SCENE='cafe';
    window.COFFEE_SHIP_PLAYER_POS={x:state.x,y:state.y};
    const name=document.getElementById('avatarName');
    if(name&&!name.textContent.trim())name.textContent=current.name;
    document.body.classList.add('coffee-ship-entered');
    state.entered=true;
    return true;
  }

  function canvasLooksBlank(){
    if(!ctx||!canvas)return true;
    try{
      const points=[
        [20,20],[120,70],[240,130],[480,50],[720,130],[900,70],
        [100,250],[300,250],[480,288],[680,250],[850,250],
        [100,450],[300,450],[480,500],[680,450],[850,450]
      ];
      let visible=0;
      let bright=0;
      let colors=new Set();
      for(const [x,y] of points){
        const data=ctx.getImageData(Math.min(canvas.width-1,x),Math.min(canvas.height-1,y),1,1).data;
        if(data[3]>20)visible++;
        if(data[0]+data[1]+data[2]>70)bright++;
        colors.add(`${Math.round(data[0]/16)}-${Math.round(data[1]/16)}-${Math.round(data[2]/16)}-${Math.round(data[3]/32)}`);
      }
      return visible<6||bright<4||colors.size<3;
    }catch(error){
      return true;
    }
  }

  function requestClassicGame(){
    if(state.classicRequested||window.COFFEE_SHIP_GAME_API)return;
    state.classicRequested=true;
    const script=document.createElement('script');
    script.src=`game.js?v=black-screen-classic-2-${Date.now()}`;
    script.async=false;
    script.dataset.blackScreenClassic='true';
    script.onerror=()=>{state.error='主遊戲程式無法載入';startFallback();};
    document.body.appendChild(script);
  }

  function showRecoveryToast(text){
    let toast=document.getElementById('gameRecoveryToast');
    if(!toast){
      toast=document.createElement('div');
      toast.id='gameRecoveryToast';
      toast.style.cssText='position:fixed;left:50%;top:calc(12px + env(safe-area-inset-top));transform:translateX(-50%);z-index:30000;max-width:calc(100vw - 28px);padding:9px 13px;border:2px solid #79d0b1;border-radius:13px;background:rgba(21,16,32,.96);color:#fff4d8;font-weight:900;font-size:13px;text-align:center;box-shadow:0 7px 0 rgba(0,0,0,.28);pointer-events:none';
      document.body.appendChild(toast);
    }
    toast.textContent=text;
    toast.style.display='block';
    clearTimeout(toast._timer);
    toast._timer=setTimeout(()=>toast.style.display='none',3600);
  }

  function drawFloor(){
    const g=ctx.createLinearGradient(0,0,0,576);
    g.addColorStop(0,'#171126');g.addColorStop(1,'#2d1e32');ctx.fillStyle=g;ctx.fillRect(0,0,960,576);
    for(let y=70;y<576;y+=48){
      for(let x=0;x<960;x+=48){
        ctx.fillStyle=((x/48+y/48)%2===0)?'#35243b':'#2c1e33';ctx.fillRect(x,y,48,48);
        ctx.strokeStyle='rgba(255,244,216,.045)';ctx.strokeRect(x,y,48,48);
      }
    }
    px(0,0,960,66,'#0f0c1c');
    for(let i=0;i<18;i++)px(i*56+12,22,4,4,i%3===0?'#9ce8f0':'#fff4d8');
    label('COFFEE SHIP · RECOVERY CAFE',480,42,24,'#fff4d8');
  }

  function drawCafe(){
    px(115,96,370,90,'#76503e');px(115,96,370,17,'#b2794c');
    px(145,120,55,38,'#21182a');px(158,111,27,15,'#d7bb79');
    px(226,111,31,47,'#27394a');px(234,103,15,14,'#9ce8f0');
    label('MOMO PEARL COFFEE',300,155,17,'#ffe5ae');
    px(560,104,220,76,'#3a293d');px(571,115,198,54,'#21182a');label('留言板  B',670,149,18,'#79d0b1');
    const tables=[{x:245,y:315},{x:480,y:315},{x:720,y:315},{x:300,y:455},{x:650,y:455}];
    tables.forEach((table,index)=>{
      px(table.x-45,table.y-20,90,42,'#694638');px(table.x-31,table.y-11,62,23,index%2?'#9b6844':'#a56b45');
      px(table.x-7,table.y-8,14,17,'#fff4d8');px(table.x-4,table.y-5,8,6,index%2?'#6d3f26':'#9ce8f0');
      px(table.x-64,table.y-11,28,28,'#4f8f73');px(table.x+36,table.y-11,28,28,'#5a386a');
    });
    px(790,190,70,145,'#3d2a32');px(808,220,35,82,'#201724');px(836,259,5,5,'#ffe16b');
    label('甲板門  E',825,352,14,'#ffe5ae');
    px(585,365,175,19,'#5b3e4e');px(602,359,140,9,'#8460c8');label('PEAK STAGE',672,355,12,'#d7bb79');
  }

  function drawNpc(x,y,name,role,color,icon){
    ctx.globalAlpha=.35;px(x-18,y+27,36,6,'#08070d');ctx.globalAlpha=1;
    px(x-12,y+18,9,17,'#191622');px(x+3,y+18,9,17,'#191622');
    px(x-17,y-9,34,33,color);px(x-20,y-3,7,20,'#f0c7a0');px(x+13,y-3,7,20,'#f0c7a0');
    px(x-11,y-31,22,20,'#f0c7a0');px(x-15,y-40,30,14,role==='Momo'?'#f3c85a':'#22192a');
    px(x-6,y-23,4,4,'#21182a');px(x+4,y-23,4,4,'#21182a');px(x-4,y-14,8,3,'#b86766');
    label(`${icon} ${name}`,x,y-55,13,role==='Momo'?'#9ff0cf':'#fff4d8');
  }

  function drawPlayer(){
    const current=avatar();const x=state.x,y=state.y;
    ctx.globalAlpha=.35;px(x-16,y+28,32,6,'#08070d');ctx.globalAlpha=1;
    px(x-11,y+18,9,17,'#191622');px(x+2,y+18,9,17,'#191622');
    px(x-16,y-8,32,31,current.shirt);px(x-20,y-3,7,20,'#f0c7a0');px(x+13,y-3,7,20,'#f0c7a0');
    px(x-11,y-30,22,20,'#f0c7a0');px(x-15,y-39,30,14,current.hair);px(x-18,y-31,8,18,current.hair);px(x+10,y-31,8,18,current.hair);
    px(x-6,y-22,4,4,'#21182a');px(x+4,y-22,4,4,'#21182a');px(x-4,y-13,8,3,'#b86766');
    label(current.name,x,y-52,13,'#79d0b1');
    if(state.emoteTimer>0)label(state.emote||'✨',x,y-73,22,'#fff4d8');
  }

  function drawMessage(){
    const text=state.messageTimer>0?state.message:'相容模式已啟動。方向鍵移動，右側門可前往甲板。';
    px(85,500,790,54,'rgba(15,11,24,.94)');ctx.strokeStyle='#76536a';ctx.lineWidth=3;ctx.strokeRect(85,500,790,54);label(text,480,533,16,'#fff4d8');
  }

  function updateFallback(){
    state.frame++;
    let dx=0,dy=0;
    if(state.keys.has('ArrowUp')||state.keys.has('w')||state.mobile.up)dy-=state.speed;
    if(state.keys.has('ArrowDown')||state.keys.has('s')||state.mobile.down)dy+=state.speed;
    if(state.keys.has('ArrowLeft')||state.keys.has('a')||state.mobile.left)dx-=state.speed;
    if(state.keys.has('ArrowRight')||state.keys.has('d')||state.mobile.right)dx+=state.speed;
    if(dx&&dy){dx*=.707;dy*=.707;}
    state.x=Math.max(82,Math.min(870,state.x+dx));
    state.y=Math.max(205,Math.min(470,state.y+dy));
    if(state.emoteTimer>0)state.emoteTimer--;
    if(state.messageTimer>0)state.messageTimer--;
    window.COFFEE_SHIP_PLAYER_POS={x:state.x,y:state.y};
  }

  function renderFallback(){
    if(!state.fallback||!ctx)return;
    updateFallback();
    drawFloor();drawCafe();
    drawNpc(290,220,'Momo','Momo','#4f8f73','☕');
    drawNpc(670,410,'Peak','Peak','#59458a','🎻');
    drawNpc(535,250,'Bean','Bean','#d7bb79','🃏');
    label('🐈 Mugi',400,425,15,'#fff4d8');
    drawPlayer();drawMessage();
    raf=requestAnimationFrame(renderFallback);
  }

  function startFallback(){
    if(state.fallback)return;
    if(!forceGameVisible())return;
    state.fallback=true;
    document.body.classList.add('coffee-ship-recovery-mode');
    showRecoveryToast('已自動啟動相容模式，避免黑畫面');
    state.message=state.error?'主程式發生錯誤，已切換至相容模式。':'手機瀏覽器未完成畫面繪製，已切換至相容模式。';
    state.messageTimer=360;
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(renderFallback);
  }

  function verifyAfterBoarding(){
    if(state.checking)return;
    state.checking=true;
    setTimeout(()=>{
      if(!state.entered&&creator?.classList.contains('hidden'))state.entered=true;
      if(!state.entered){state.checking=false;return;}
      if(!window.COFFEE_SHIP_GAME_API)requestClassicGame();
      setTimeout(()=>{
        const blank=canvasLooksBlank();
        if(blank)startFallback();
        else showRecoveryToast('Coffee Ship 已成功載入');
        state.checking=false;
      },900);
    },180);
  }

  function handleAction(){
    if(!state.fallback)return;
    if(Math.hypot(state.x-825,state.y-300)<105){
      window.COFFEE_SHIP_DECK?.switchToDeck?.();
      return;
    }
    state.message='靠近右側的甲板門，再按互動。';state.messageTimer=150;
  }

  function bindInput(){
    window.addEventListener('keydown',event=>{
      const key=event.key?.length===1?event.key.toLowerCase():event.key;
      state.keys.add(key);
      if(!state.fallback)return;
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(event.key))event.preventDefault();
      if(key==='e')handleAction();
      if(event.code==='Space'){state.emote='✨';state.emoteTimer=90;}
    },true);
    window.addEventListener('keyup',event=>state.keys.delete(event.key?.length===1?event.key.toLowerCase():event.key),true);
    document.querySelectorAll('[data-move]').forEach(button=>{
      const direction=button.dataset.move;
      const down=()=>{if(state.fallback)state.mobile[direction]=true;};
      const up=()=>state.mobile[direction]=false;
      button.addEventListener('pointerdown',down,true);button.addEventListener('pointerup',up,true);button.addEventListener('pointerleave',up,true);button.addEventListener('pointercancel',up,true);
    });
    document.getElementById('sitBtn')?.addEventListener('click',event=>{if(state.fallback){event.preventDefault();event.stopImmediatePropagation();handleAction();}},true);
    document.getElementById('emoteBtn')?.addEventListener('click',event=>{if(state.fallback){event.preventDefault();event.stopImmediatePropagation();state.emote='✨';state.emoteTimer=90;}},true);
    document.getElementById('coffeeBtn')?.addEventListener('click',event=>{if(state.fallback){event.preventDefault();event.stopImmediatePropagation();state.message='咖啡功能已保留；重新整理後會再次嘗試完整模式。';state.messageTimer=180;}},true);
  }

  function bindBoarding(){
    startBtn?.addEventListener('click',()=>{
      state.entered=true;
      setTimeout(()=>{
        if(!creator.classList.contains('hidden')&&!window.COFFEE_SHIP_GAME_API)forceGameVisible();
        verifyAfterBoarding();
      },100);
    },false);
  }

  function installErrorWatch(){
    window.addEventListener('error',event=>{
      const source=String(event.filename||'');
      if(source.includes('game.js')||event.message?.includes('Canvas')||event.message?.includes('AudioContext')){
        state.error=event.message||'主遊戲執行錯誤';
        if(state.entered)setTimeout(startFallback,80);
      }
    },true);
    window.addEventListener('unhandledrejection',event=>{
      const message=String(event.reason?.message||event.reason||'');
      if(message.includes('game')||message.includes('canvas')){
        state.error=message;
        if(state.entered)setTimeout(startFallback,80);
      }
    });
  }

  function init(){
    if(!cacheElements())return;
    bindInput();bindBoarding();installErrorWatch();
    if(creator.classList.contains('hidden')&&!gamePanel.classList.contains('hidden')){
      state.entered=true;verifyAfterBoarding();
    }
    window.COFFEE_SHIP_GAME_GUARD={verify:verifyAfterBoarding,startFallback,isFallback:()=>state.fallback};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
