(() => {
  'use strict';
  if (window.__COFFEE_SHIP_CAFE_MODEL_UI_V1__) return;
  window.__COFFEE_SHIP_CAFE_MODEL_UI_V1__ = true;

  function modelWindow(x,y,w,h,sea='#4db4c8'){
    drawPixelRect(x,y,w,h,'#4e3340');
    drawPixelRect(x+8,y+8,w-16,h-16,'#0d2333');
    drawPixelRect(x+14,y+14,w-28,h-28,sea);
    drawPixelRect(x+14,y+14,w-28,18,'rgba(255,255,255,.12)');
    drawPixelRect(x+w/2-4,y+8,8,h-16,'#4e3340');
    drawPixelRect(x+8,y+h/2-4,w-16,8,'#4e3340');
    for(let i=0;i<3;i++) drawPixelRect(x+26+i*28,y+h-28-(i%2)*5,30,3,i%2?'#d7f4ff':'#8ce4f6');
    drawPixelRect(x+20,y+20,18,6,'#fff4d8');
  }

  function modelLantern(x,y){
    drawPixelRect(x-2,y-16,4,14,'#d7bb79');
    drawPixelRect(x-12,y-2,24,24,'#5c4050');
    drawPixelRect(x-8,y+2,16,16,'#f6d58a');
    drawPixelRect(x-5,y+5,10,10,'#fff4d8');
  }

  function modelRug(x,y,w,h,base,border,accent){
    drawPixelRect(x,y,w,h,border);
    drawPixelRect(x+8,y+8,w-16,h-16,base);
    for(let i=0;i<4;i++) drawPixelRect(x+18+i*34,y+h-4,16,4,accent);
    for(let i=0;i<4;i++) drawPixelRect(x+w-34-i*34,y,16,4,accent);
    drawPixelRect(x+26,y+h/2-3,w-52,6,accent);
  }

  function modelPlant(x,y){
    drawPixelRect(x-12,y,24,16,'#6d4d3a');
    drawPixelRect(x-8,y+4,16,12,'#8e654c');
    drawPixelRect(x-2,y-18,4,24,'#4a7b52');
    drawPixelRect(x-12,y-14,8,10,'#79d0b1');
    drawPixelRect(x+4,y-14,8,10,'#79d0b1');
    drawPixelRect(x-16,y-4,10,8,'#5ebc88');
    drawPixelRect(x+6,y-4,10,8,'#5ebc88');
  }

  function modelShelf(x,y,w=120,h=18){
    drawPixelRect(x,y,w,h,'#6e4a39');
    drawPixelRect(x,y,w,4,'#b27a4d');
    for(let i=0;i<4;i++) drawPixelRect(x+12+i*24,y-14,12,14,i%2?'#9ce8f0':'#e9a6b0');
    drawPixelRect(x+w-22,y-18,14,18,'#d7bb79');
  }

  function modelCup(x,y,color='#9ce8f0'){
    drawPixelRect(x,y,10,10,color);
    drawPixelRect(x+10,y+2,4,6,'#fff4d8');
    drawPixelRect(x+2,y-4,6,4,'#fff4d8');
  }

  function modelPastryCase(x,y){
    drawPixelRect(x,y,72,26,'#4e3340');
    drawPixelRect(x+4,y+4,64,18,'#8ce4f6');
    drawPixelRect(x+8,y+16,12,4,'#ffd58f');
    drawPixelRect(x+26,y+14,12,6,'#ffbdd1');
    drawPixelRect(x+46,y+15,12,5,'#d7bb79');
  }

  function modelMenuSign(x,y,title,subtitle){
    drawPixelRect(x,y,96,38,'#38263c');
    drawPixelRect(x+6,y+6,84,26,'#201724');
    drawText(title,x+48,y+18,11,'center','#ffe5ae');
    drawText(subtitle,x+48,y+30,8,'center','#d7bb79');
  }

  drawFloor = function(){
    ctx.fillStyle='#1a1220';ctx.fillRect(0,0,world.w,world.h);
    drawPixelRect(0,0,world.w,78,'#120d17');
    drawPixelRect(0,78,world.w,10,'#3c2943');
    for(let i=0;i<4;i++) modelWindow(90+i*205,92,150,88,i%2?'#5ec8d8':'#4db4c8');
    drawPixelRect(0,88,world.w,18,'#231628');
    for(let i=0;i<12;i++) drawPixelRect(20+i*78,58,36,8,i%2?'#d7bb79':'#b88958');
    for(let y=0;y<world.h;y+=world.tile){
      for(let x=0;x<world.w;x+=world.tile){
        ctx.fillStyle=((x/world.tile+y/world.tile)%2===0)?'#33213a':'#2c1d33';
        ctx.fillRect(x,y,world.tile,world.tile);
        ctx.strokeStyle='rgba(84,58,95,.55)';
        ctx.strokeRect(x,y,world.tile,world.tile);
      }
    }
    modelRug(158,178,640,286,'#4d3358','#6f4f7d','#f2d18f');
    modelRug(600,334,170,40,'#4a2f41','#65445a','#d7bb79');
    drawPixelRect(0,0,world.w,18,'#0d0911');
    drawPixelRect(0,world.h-18,world.w,18,'#0d0911');
    drawPixelRect(0,0,18,world.h,'#0d0911');
    drawPixelRect(world.w-18,0,18,world.h,'#0d0911');
    for(let i=0;i<5;i++) modelLantern(120+i*180,54);
    drawText('COFFEE SHIP',480,43,27);
    drawText('Floating Café Lounge',480,63,12,'center','#d7bb79');
  };

  drawCafe = function(){
    drawPixelRect(counter.x-18,counter.y-12,counter.w+36,counter.h+20,'#2c1b24');
    drawPixelRect(counter.x,counter.y,counter.w,counter.h,'#724a39');
    drawPixelRect(counter.x,counter.y,counter.w,18,'#bd8150');
    drawPixelRect(counter.x+22,counter.y+20,counter.w-44,counter.h-28,'#5d3b2f');
    modelShelf(145,118,134);modelShelf(292,118,112);
    modelCup(192,134,'#9ce8f0');modelCup(224,134,'#ffe16b');modelCup(348,134,'#e9a6b0');
    drawPixelRect(180,122,42,34,'#21182a');drawPixelRect(190,112,22,14,'#d7bb79');
    drawPixelRect(244,112,28,45,'#27394a');drawPixelRect(250,103,16,13,'#9ce8f0');
    drawPixelRect(308,126,26,30,'#382735');drawPixelRect(312,114,18,14,'#f0a75c');
    modelPastryCase(408,124);
    drawText('MOMO COFFEE',counter.x+counter.w/2,counter.y+58,17,'center','#ffe5ae');
    drawText('fresh beans · sea breeze · warm music',counter.x+counter.w/2,counter.y+75,10,'center','#d7bb79');

    drawPixelRect(board.x-16,board.y-14,board.w+32,board.h+28,'#2b1e2f');
    drawPixelRect(board.x,board.y,board.w,board.h,'#3a293d');
    drawPixelRect(board.x+10,board.y+10,board.w-20,board.h-20,'#21182a');
    drawPixelRect(board.x+22,board.y+16,board.w-44,6,'#694638');
    drawText(cloudReady?'雲端留言  B':'留言板  B',board.x+board.w/2,board.y+40,18,'center',cloudReady?'#79d0b1':'#f0a75c');
    drawText('Share your voyage',board.x+board.w/2,board.y+58,10,'center','#fff4d8');

    drawPixelRect(116,180,40,150,'#3d2a32');drawPixelRect(120,176,32,8,'#8d5c41');
    drawPixelRect(804,180,40,150,'#3d2a32');drawPixelRect(808,176,32,8,'#8d5c41');
    modelPlant(92,168);modelPlant(868,168);modelPlant(878,486);
    drawPixelRect(850,100,54,54,'#6d4d3a');drawPixelRect(860,110,34,34,'#f7f3e8');drawText('☕',877,136,18);
    drawPixelRect(42,436,52,52,'#6d4d3a');drawPixelRect(52,446,32,32,'#f7f3e8');drawText('⚓',68,471,18);
    modelMenuSign(72,118,'今日甜點','cake · cookie');
    modelMenuSign(786,410,'航海活動','fish · story');
    drawPixelRect(72,196,46,102,'#493249');drawPixelRect(78,202,34,90,'#251927');
    drawPixelRect(842,196,46,102,'#493249');drawPixelRect(848,202,34,90,'#251927');
    for(let i=0;i<4;i++){
      drawPixelRect(84,214+i*18,22,10,i%2?'#79d0b1':'#e9a6b0');
      drawPixelRect(854,214+i*18,22,10,i%2?'#9ce8f0':'#ffe16b');
    }

    tables.forEach((t,index)=>{
      drawPixelRect(t.x-40,t.y-24,80,48,'#674435');
      drawPixelRect(t.x-30,t.y-14,60,28,index%2?'#9b6844':'#a56b45');
      drawPixelRect(t.x-6,t.y+20,12,12,'#493249');
      modelCup(t.x-18,t.y-10,index%2?'#9ce8f0':'#e9a6b0');
      modelCup(t.x+4,t.y-8,index%2?'#ffe16b':'#9ce8f0');
      if(index===0||index===1) drawPixelRect(t.x-24,t.y-20,10,8,'#79d0b1');
    });
    chairs.forEach((c,index)=>{
      drawPixelRect(c.x-16,c.y-14,32,28,index%2?'#5a386a':'#4f8f73');
      drawPixelRect(c.x-12,c.y-22,24,10,index%2?'#8460c8':'#79d0b1');
      drawPixelRect(c.x-14,c.y+14,4,8,'#251927');drawPixelRect(c.x+10,c.y+14,4,8,'#251927');
    });

    drawPixelRect(600,332,170,32,'#5b3e4e');drawPixelRect(610,337,150,19,'#704c5c');
    drawPixelRect(625,337,120,9,'#8460c8');drawText('PEAK STAGE',685,334,12,'center','#d7bb79');
    drawPixelRect(623,349,122,6,'#2f2133');
    drawPixelRect(398,496,164,34,'#4f3545');drawPixelRect(408,502,144,22,'#7c5365');
    drawText('前往漂浮甲板',480,520,16,'center','#fff4d8');
    drawPixelRect(468,488,24,10,'#d7bb79');drawPixelRect(476,478,8,12,'#d7bb79');
    drawPixelRect(160,458,110,18,'#38263c');drawText("today's blend",214,471,11,'center','#d7bb79');
    drawPixelRect(690,458,110,18,'#38263c');drawText('sea story night',744,471,11,'center','#d7bb79');
  };

  renderCoffeeOptions = function(){
    const balance=getPearls();
    const note=coffeeMenu.querySelector('.board-note');
    if(note) note.innerHTML=`目前持有 <strong class="coffee-pearl-balance">🦪 ${balance} 珍珠</strong>。每杯咖啡都會帶來一種限時人物效果。`;
    coffeeOptions.innerHTML=coffeeMenuItems.map((item,i)=>{
      const affordable=balance>=item.price;
      return `<button class="coffee-option ${affordable?'':'is-unaffordable'}" data-coffee-index="${i}" aria-disabled="${affordable?'false':'true'}">
        <div class="coffee-option-top"><div class="coffee-option-title"><span class="coffee-option-icon">${item.icon}</span><span class="coffee-option-copy"><strong>${item.name}</strong><span>${item.desc}</span></span></div><span class="coffee-option-price">🦪 ${item.price}</span></div>
        <em>${item.effectLabel}</em>
        <div class="coffee-option-bottom"><div class="coffee-option-meta"><span class="coffee-chip">${Math.round(item.duration/60)} 分鐘</span><span class="coffee-chip">效果咖啡</span></div><small>${affordable?'可購買':'珍珠不足'}</small></div>
      </button>`;
    }).join('');
  };

  renderMessages = function(){
    if(!messagesList) return;
    const statusClass=cloudReady&&firebaseConnected?'online':firebaseLoading?'connecting':'offline';
    const messages=getMessages().slice().sort((a,b)=>getMessageTime(b)-getMessageTime(a));
    const statusHtml=`<div class="board-status ${statusClass}">${escapeHtml(boardStatusText)}</div>`;
    if(!messages.length){
      messagesList.innerHTML=statusHtml+`<div class="empty-board">目前還沒有留言。Firebase 成功連線後，不同裝置會同步看到。</div>`;
      return;
    }
    messagesList.innerHTML=statusHtml+messages.map(m=>{
      const name=escapeHtml(m.name||'Guest');
      const avatar=escapeHtml((m.name||'G').slice(0,1).toUpperCase());
      return `<article class="message-card"><div class="message-avatar">${avatar}</div><div class="message-main"><div class="message-meta"><strong>${name}</strong><span>${escapeHtml(formatTime(getMessageTime(m)))}</span></div><div class="message-text">${escapeHtml(m.text||'')}</div></div></article>`;
    }).join('');
  };

  window.dispatchEvent(new CustomEvent('coffee-ship:cafe-model-ready',{detail:{version:1}}));
})();