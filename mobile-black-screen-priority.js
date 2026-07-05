(() => {
  'use strict';
  if (window.__COFFEE_SHIP_MOBILE_BLACK_SCREEN_PRIORITY__) return;
  window.__COFFEE_SHIP_MOBILE_BLACK_SCREEN_PRIORITY__ = true;

  const state = {
    active:false,
    entered:false,
    x:480,
    y:390,
    speed:2.8,
    keys:new Set(),
    mobile:{up:false,down:false,left:false,right:false},
    message:'',
    messageTimer:0,
    emote:'',
    emoteTimer:0,
    lastFrame:0
  };

  let canvas=null;
  let ctx=null;
  let creator=null;
  let gamePanel=null;
  let startBtn=null;
  let raf=0;

  function safeRead(key,fallback){
    try{
      const raw=localStorage.getItem(key);
      return raw?JSON.parse(raw):fallback;
    }catch{return fallback;}
  }

  function safeWrite(key,value){
    try{localStorage.setItem(key,JSON.stringify(value));}catch{}
  }

  function cache(){
    creator=document.getElementById('creator');
    gamePanel=document.getElementById('gamePanel');
    startBtn=document.getElementById('startBtn');
    canvas=document.getElementById('game');
    ctx=canvas?.getContext?.('2d')||null;
    if(ctx)ctx.imageSmoothingEnabled=false;
    return !!(creator&&gamePanel&&startBtn&&canvas&&ctx);
  }

  function currentAvatar(){
    const saved=safeRead('coffeeShipAvatar',{});
    const name=(document.getElementById('playerName')?.value||saved.name||'海上旅人').trim()||'海上旅人';
    return {
      name,
      hair:document.getElementById('hairColor')?.value||saved.hair||'#2b1d16',
      shirt:document.getElementById('shirtColor')?.value||saved.shirt||'#c96a4a',
      animal:saved.animal||'human'
    };
  }

  function px(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
  function text(value,x,y,size=16,color='#fff4d8'){
    ctx.font=`900 ${size}px ui-rounded,system-ui,sans-serif`;
    ctx.textAlign='center';
    ctx.fillStyle='#100b18';ctx.fillText(value,x+2,y+2);
    ctx.fillStyle=color;ctx.fillText(value,x,y);
  }

  function status(message,timeout=2600){
    let node=document.getElementById('safeCafeStatus');
    if(!node){
      node=document.createElement('div');
      node.id='safeCafeStatus';
      gamePanel?.appendChild(node);
    }
    node.textContent=message;
    node.classList.remove('hidden');
    clearTimeout(node._hideTimer);
    node._hideTimer=setTimeout(()=>node.classList.add('hidden'),timeout);
  }

  function forceVisible(){
    if(!cache())return false;
    const avatar=currentAvatar();
    safeWrite('coffeeShipAvatar',avatar);
    creator.classList.add('hidden');
    gamePanel.classList.remove('hidden');
    gamePanel.removeAttribute('style');
    document.body.classList.add('coffee-ship-entered');
    document.body.dataset.coffeeShipScene='cafe';
    window.COFFEE_SHIP_SCENE='cafe';
    window.COFFEE_SHIP_PLAYER_POS={x:state.x,y:state.y};
    const avatarName=document.getElementById('avatarName');
    if(avatarName)avatarName.textContent=avatar.name;
    return true;
  }

  function canvasIsBlank(){
    if(!ctx||!canvas)return true;
    try{
      const samples=[[12,12],[120,80],[280,120],[480,70],[720,140],[930,80],[100,300],[360,300],[600,300],[850,300],[100,520],[480,520],[850,520]];
      let opaque=0;
      let light=0;
      const colors=new Set();
      for(const [x,y] of samples){
        const d=ctx.getImageData(Math.min(canvas.width-1,x),Math.min(canvas.height-1,y),1,1).data;
        if(d[3]>16)opaque++;
        if(d[0]+d[1]+d[2]>90)light++;
        colors.add(`${d[0]>>4}-${d[1]>>4}-${d[2]>>4}-${d[3]>>5}`);
      }
      return opaque<5||light<3||colors.size<3;
    }catch{return true;}
  }

  function drawFloor(){
    const gradient=ctx.createLinearGradient(0,0,0,576);
    gradient.addColorStop(0,'#181129');
    gradient.addColorStop(1,'#2d1e32');
    ctx.fillStyle=gradient;ctx.fillRect(0,0,960,576);
    for(let y=66;y<576;y+=48){
      for(let x=0;x<960;x+=48){
        ctx.fillStyle=((x/48+y/48)%2===0)?'#35243b':'#2c1e33';
        ctx.fillRect(x,y,48,48);
        ctx.strokeStyle='rgba(255,244,216,.05)';ctx.strokeRect(x,y,48,48);
      }
    }
    px(0,0,960,66,'#0f0c1c');
    for(let i=0;i<18;i++)px(i*56+12,22,4,4,i%3===0?'#9ce8f0':'#fff4d8');
    text('COFFEE SHIP',480,43,25,'#fff4d8');
  }

  function drawCafe(){
    px(112,92,380,96,'#76503e');px(112,92,380,18,'#b2794c');
    px(145,121,50,35,'#21182a');px(158,111,24,14,'#d7bb79');
    px(228,110,30,47,'#27394a');px(235,102,16,14,'#9ce8f0');
    text('MOMO PEARL COFFEE',302,158,17,'#ffe5ae');
    px(558,102,226,78,'#3a293d');px(570,114,202,54,'#21182a');text('留言板  B',671,149,18,'#79d0b1');

    const tables=[{x:235,y:315},{x:478,y:315},{x:720,y:315},{x:300,y:448},{x:650,y:448}];
    tables.forEach((table,index)=>{
      px(table.x-44,table.y-20,88,42,'#694638');
      px(table.x-30,table.y-11,60,23,index%2?'#9b6844':'#a56b45');
      px(table.x-7,table.y-8,14,17,'#fff4d8');
      px(table.x-4,table.y-5,8,6,index%2?'#6d3f26':'#9ce8f0');
      px(table.x-63,table.y-12,27,29,'#4f8f73');
      px(table.x+36,table.y-12,27,29,'#5a386a');
    });

    px(792,188,70,150,'#3d2a32');px(809,218,36,86,'#201724');px(837,260,5,5,'#ffe16b');
    text('甲板門  E',826,357,14,'#ffe5ae');
    px(585,365,176,20,'#5b3e4e');px(602,358,142,9,'#8460c8');text('PEAK STAGE',673,354,12,'#d7bb79');
  }

  function drawNpc(x,y,name,color,icon,hair='#241a2b'){
    ctx.globalAlpha=.34;px(x-18,y+28,36,6,'#08070d');ctx.globalAlpha=1;
    px(x-11,y+18,9,17,'#191622');px(x+2,y+18,9,17,'#191622');
    px(x-17,y-9,34,33,color);px(x-20,y-3,7,20,'#f0c7a0');px(x+13,y-3,7,20,'#f0c7a0');
    px(x-11,y-31,22,20,'#f0c7a0');px(x-15,y-40,30,14,hair);
    px(x-6,y-23,4,4,'#21182a');px(x+4,y-23,4,4,'#21182a');px(x-4,y-14,8,3,'#b86766');
    text(`${icon} ${name}`,x,y-56,13,name==='Momo'?'#9ff0cf':'#fff4d8');
  }

  function drawMugi(){
    const x=406,y=423;
    ctx.globalAlpha=.34;px(x-18,y+14,38,5,'#08070d');ctx.globalAlpha=1;
    px(x-15,y-7,27,15,'#fffdf4');px(x-13,y-13,8,8,'#111');px(x+3,y-13,9,8,'#df6d13');
    px(x+7,y+4,28,11,'#fffdf4');px(x+18,y+5,8,8,'#df6d13');px(x+33,y-2,4,16,'#111');
    px(x-9,y-4,3,3,'#30384d');px(x+4,y-4,3,3,'#30384d');
    text('🐾 Mugi',x+7,y-25,12,'#fff4d8');
  }

  function drawPlayer(){
    const avatar=currentAvatar();
    const x=state.x,y=state.y;
    ctx.globalAlpha=.34;px(x-17,y+29,34,6,'#08070d');ctx.globalAlpha=1;
    px(x-11,y+18,9,17,'#191622');px(x+2,y+18,9,17,'#191622');
    px(x-16,y-8,32,31,avatar.shirt);px(x-20,y-3,7,20,'#f0c7a0');px(x+13,y-3,7,20,'#f0c7a0');
    px(x-11,y-30,22,20,'#f0c7a0');px(x-15,y-39,30,14,avatar.hair);px(x-18,y-31,8,18,avatar.hair);px(x+10,y-31,8,18,avatar.hair);
    px(x-6,y-22,4,4,'#21182a');px(x+4,y-22,4,4,'#21182a');px(x-4,y-13,8,3,'#b86766');
    text(avatar.name,x,y-53,13,'#79d0b1');
    if(state.emoteTimer>0)text(state.emote||'✨',x,y-75,22,'#fff4d8');
  }

  function drawMessage(){
    const message=state.messageTimer>0?state.message:'方向鍵移動；靠近右側甲板門按「互動」。';
    px(84,501,792,54,'rgba(15,11,24,.95)');
    ctx.strokeStyle='#76536a';ctx.lineWidth=3;ctx.strokeRect(84,501,792,54);
    text(message,480,534,16,'#fff4d8');
  }

  function update(){
    let dx=0,dy=0;
    if(state.keys.has('ArrowUp')||state.keys.has('w')||state.mobile.up)dy-=state.speed;
    if(state.keys.has('ArrowDown')||state.keys.has('s')||state.mobile.down)dy+=state.speed;
    if(state.keys.has('ArrowLeft')||state.keys.has('a')||state.mobile.left)dx-=state.speed;
    if(state.keys.has('ArrowRight')||state.keys.has('d')||state.mobile.right)dx+=state.speed;
    if(dx&&dy){dx*=.707;dy*=.707;}
    state.x=Math.max(76,Math.min(875,state.x+dx));
    state.y=Math.max(205,Math.min(474,state.y+dy));
    if(state.messageTimer>0)state.messageTimer--;
    if(state.emoteTimer>0)state.emoteTimer--;
    window.COFFEE_SHIP_PLAYER_POS={x:state.x,y:state.y};
  }

  function frame(now){
    if(!state.active)return;
    state.lastFrame=now;
    update();
    drawFloor();drawCafe();
    drawNpc(292,220,'Momo','#4f8f73','☕','#f3c85a');
    drawNpc(672,410,'Peak','#59458a','🎻');
    drawNpc(532,247,'Bean','#d7bb79','🃏','#6d3f26');
    drawMugi();drawPlayer();drawMessage();
    raf=requestAnimationFrame(frame);
  }

  function startFallback(reason='主遊戲未完成繪圖'){
    if(state.active)return;
    if(!forceVisible())return;
    state.active=true;
    document.body.classList.add('safe-cafe-fallback');
    status('已修復黑畫面，啟動安全咖啡廳');
    state.message=`${reason}，已自動切換安全模式。`;
    state.messageTimer=300;
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(frame);
  }

  function verify(){
    if(!state.entered)return;
    forceVisible();
    setTimeout(()=>{
      if(canvasIsBlank())startFallback();
      else status('Coffee Ship 已成功載入',1600);
    },800);
  }

  function interact(){
    if(!state.active)return;
    if(Math.hypot(state.x-826,state.y-290)<120){
      const deck=window.COFFEE_SHIP_DECK;
      if(deck?.switchToDeck){
        state.active=false;
        cancelAnimationFrame(raf);
        document.body.classList.remove('safe-cafe-fallback');
        deck.switchToDeck();
      }else{
        state.message='甲板模組仍在載入，請稍後再按一次。';state.messageTimer=150;
      }
      return;
    }
    state.message='靠近右側的甲板門後再按互動。';state.messageTimer=150;
  }

  function bindMovement(){
    window.addEventListener('keydown',event=>{
      const key=event.key?.length===1?event.key.toLowerCase():event.key;
      state.keys.add(key);
      if(!state.active)return;
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(event.key))event.preventDefault();
      if(key==='e')interact();
      if(event.code==='Space'){state.emote='✨';state.emoteTimer=90;}
    },true);
    window.addEventListener('keyup',event=>state.keys.delete(event.key?.length===1?event.key.toLowerCase():event.key),true);

    document.querySelectorAll('[data-move]').forEach(button=>{
      const direction=button.dataset.move;
      const down=()=>{if(state.active)state.mobile[direction]=true;};
      const up=()=>state.mobile[direction]=false;
      button.addEventListener('pointerdown',down,true);
      button.addEventListener('pointerup',up,true);
      button.addEventListener('pointerleave',up,true);
      button.addEventListener('pointercancel',up,true);
    });

    document.getElementById('sitBtn')?.addEventListener('click',event=>{
      if(!state.active)return;
      event.preventDefault();event.stopImmediatePropagation();interact();
    },true);
    document.getElementById('emoteBtn')?.addEventListener('click',event=>{
      if(!state.active)return;
      event.preventDefault();event.stopImmediatePropagation();state.emote='✨';state.emoteTimer=90;
    },true);
    document.getElementById('coffeeBtn')?.addEventListener('click',event=>{
      if(!state.active)return;
      event.preventDefault();event.stopImmediatePropagation();
      if(window.COFFEE_SHIP_GAME_API?.openCoffeeMenu)window.COFFEE_SHIP_GAME_API.openCoffeeMenu(true);
      else{state.message='咖啡選單仍在載入；安全咖啡廳可以先自由移動。';state.messageTimer=170;}
    },true);
  }

  function bindBoarding(){
    startBtn.addEventListener('click',()=>{
      state.entered=true;
      document.body.classList.add('coffee-ship-entered');
      setTimeout(()=>{
        forceVisible();
        try{
          ctx.fillStyle='#21182a';ctx.fillRect(0,0,960,576);
          text('正在登上 Coffee Ship…',480,288,24,'#fff4d8');
        }catch{}
        verify();
      },70);
    },true);
  }

  function init(){
    if(!cache())return;
    bindMovement();bindBoarding();
    if(creator.classList.contains('hidden')&&!gamePanel.classList.contains('hidden')){
      state.entered=true;
      document.body.classList.add('coffee-ship-entered');
      verify();
    }
    window.addEventListener('error',event=>{
      if(state.entered&&!state.active&&String(event.filename||'').includes('game.js'))startFallback('主遊戲程式發生錯誤');
    },true);
    window.COFFEE_SHIP_SAFE_CORE={verify,startFallback,isActive:()=>state.active};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
