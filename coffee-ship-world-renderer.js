(() => {
  'use strict';

  if (window.__COFFEE_SHIP_WORLD_RENDERER_V1__) return;
  window.__COFFEE_SHIP_WORLD_RENDERER_V1__ = true;

  const WIDTH = 960;
  const HEIGHT = 576;
  const FRAME_INTERVAL = 1000 / 30;
  const PALETTE = Object.freeze({
    ink:'#071113',
    inkSoft:'#0b1b1e',
    harbor:'#10272a',
    harborLight:'#17383b',
    sea:'#164753',
    seaLight:'#2c7180',
    wood:'#604334',
    woodLight:'#95684b',
    woodDark:'#35251f',
    brass:'#d6b36e',
    brassDark:'#856638',
    cream:'#f1eadc',
    muted:'#aaa995',
    glass:'#78b8ad',
    coral:'#bb6c57',
    plum:'#675877',
    sage:'#668d7c',
    outline:'#171516'
  });

  const motion = new WeakMap();
  const stars = Array.from({length:72},(_,index)=>({
    x:(index * 137 + 41) % WIDTH,
    y:18 + ((index * 71) % 188),
    size:index % 9 === 0 ? 3 : index % 3 === 0 ? 2 : 1,
    phase:index * .63
  }));

  let canvas = null;
  let ctx = null;
  let gameCanvas = null;
  let frameId = 0;
  let lastFrame = 0;
  let active = true;

  const blockedJournalKeys=new Set(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','c','e','b',' ']);
  function guardJournalInput(event){
    if(!document.body?.classList.contains('voyage-journal-open'))return;
    const key=String(event.key||'').toLowerCase();
    if(!blockedJournalKeys.has(key)&&event.code!=='Space')return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  window.addEventListener('keydown',guardJournalInput,true);
  window.addEventListener('keyup',guardJournalInput,true);

  function safeJson(raw,fallback){
    try{return raw?JSON.parse(raw):fallback;}catch{return fallback;}
  }

  function px(context,x,y,w,h,color){
    context.fillStyle=color;
    context.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
  }

  function line(context,x1,y1,x2,y2,color,width=1){
    context.strokeStyle=color;
    context.lineWidth=width;
    context.beginPath();
    context.moveTo(Math.round(x1)+.5,Math.round(y1)+.5);
    context.lineTo(Math.round(x2)+.5,Math.round(y2)+.5);
    context.stroke();
  }

  function roundedPath(context,x,y,w,h,r){
    const radius=Math.max(0,Math.min(r,w/2,h/2));
    context.beginPath();
    context.moveTo(x+radius,y);
    context.lineTo(x+w-radius,y);
    context.quadraticCurveTo(x+w,y,x+w,y+radius);
    context.lineTo(x+w,y+h-radius);
    context.quadraticCurveTo(x+w,y+h,x+w-radius,y+h);
    context.lineTo(x+radius,y+h);
    context.quadraticCurveTo(x,y+h,x,y+h-radius);
    context.lineTo(x,y+radius);
    context.quadraticCurveTo(x,y,x+radius,y);
    context.closePath();
  }

  function roundedRect(context,x,y,w,h,r,fill,stroke='',lineWidth=1){
    roundedPath(context,x,y,w,h,r);
    if(fill){context.fillStyle=fill;context.fill();}
    if(stroke){context.strokeStyle=stroke;context.lineWidth=lineWidth;context.stroke();}
  }

  function text(context,value,x,y,size=12,color=PALETTE.cream,align='center',weight=700){
    context.save();
    context.font=`${weight} ${size}px Inter, "Noto Sans TC", system-ui, sans-serif`;
    context.textAlign=align;
    context.textBaseline='alphabetic';
    context.fillStyle='rgba(3,9,10,.8)';
    context.fillText(String(value),Math.round(x)+1,Math.round(y)+1);
    context.fillStyle=color;
    context.fillText(String(value),Math.round(x),Math.round(y));
    context.restore();
  }

  function currentScene(){
    if(window.COFFEE_SHIP_PORT?.isOpen?.())return'port';
    const port=document.getElementById('portOverlay');
    if(port&&!port.classList.contains('hidden'))return'port';
    if(window.COFFEE_SHIP_DECK?.isDeckOpen?.())return'deck';
    return'cafe';
  }

  function roleForPlayer(actor){
    if(actor!==window.COFFEE_SHIP_GAME_API?.player&&!actor?.__localPlayer)return null;
    return safeJson(localStorage.getItem('coffeeShipRole'),null);
  }

  function actorMotion(actor,time){
    let state=motion.get(actor);
    const x=Number(actor?.x)||0;
    const y=Number(actor?.y)||0;
    if(!state){
      state={x,y,dir:actor?.dir||'down',movedAt:0,frame:0};
      motion.set(actor,state);
    }
    const dx=x-state.x;
    const dy=y-state.y;
    if(Math.hypot(dx,dy)>.4){
      state.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');
      state.movedAt=time;
    }else if(['up','down','left','right'].includes(actor?.dir)){
      state.dir=actor.dir;
    }
    state.x=x;
    state.y=y;
    const moving=time-state.movedAt<180;
    state.frame=moving?Math.floor(time/145)%4:0;
    return{dir:state.dir,moving,frame:state.frame};
  }

  function drawShadow(context,x,y,width=34){
    context.save();
    context.globalAlpha=.28;
    context.fillStyle='#020809';
    context.beginPath();
    context.ellipse(Math.round(x),Math.round(y)+5,width/2,6,0,0,Math.PI*2);
    context.fill();
    context.restore();
  }

  function drawNameplate(context,actor,x,y,color=PALETTE.cream,compact=false){
    const name=String(actor?.name||'Guest').slice(0,18);
    context.save();
    context.font=`700 ${compact?10:11}px Inter, "Noto Sans TC", system-ui, sans-serif`;
    const width=Math.max(42,Math.ceil(context.measureText(name).width)+18);
    roundedRect(context,x-width/2,y-(compact?12:14),width,compact?18:20,9,'rgba(5,17,19,.82)','rgba(241,234,220,.12)',1);
    context.restore();
    text(context,name,x,y+(compact?1:0),compact?10:11,color,'center',700);
  }

  function drawInteractionRing(context,actor,x,y,time){
    const player=window.COFFEE_SHIP_GAME_API?.player;
    if(!player||actor===player||!actor?.role)return;
    if(Math.hypot(Number(player.x)-Number(actor.x),Number(player.y)-Number(actor.y))>92)return;
    context.save();
    context.globalAlpha=.65+.18*Math.sin(time/220);
    context.strokeStyle=PALETTE.brass;
    context.lineWidth=2;
    context.beginPath();
    context.ellipse(x,y+4,23,8,0,0,Math.PI*2);
    context.stroke();
    context.restore();
  }

  function humanPalette(actor){
    const special=roleForPlayer(actor);
    const specialRole=String(special?.role||'');
    const role=actor?.role;
    const base={
      skin:actor?.skin||'#d9ac8c',
      hair:actor?.hair||'#2b211d',
      shirt:actor?.shirt||PALETTE.coral,
      coat:actor?.coat||actor?.shirt||PALETTE.harborLight,
      accent:actor?.accent||PALETTE.brass,
      trousers:'#24292b'
    };
    if(role==='barista')return{...base,hair:'#d0a857',shirt:'#e8e0cf',coat:PALETTE.sage,accent:PALETTE.brass,trousers:'#243033'};
    if(role==='cellist')return{...base,hair:'#171719',shirt:'#d7cdbb',coat:'#3d3549',accent:'#a992be',trousers:'#1b1d22'};
    if(role==='joker')return{...base,hair:'#493326',shirt:'#c49358',coat:'#a46a4d',accent:'#6ea391',trousers:'#303034'};
    if(special?.id==='pirate'||special?.code==='PIRATE2026'||specialRole.includes('海盜'))return{...base,coat:'#3a2930',shirt:'#8f4f46',accent:PALETTE.brass};
    if(special?.id==='maid'||special?.code==='MAID2026'||specialRole.includes('女僕'))return{...base,coat:'#2d3436',shirt:'#e6ddce',accent:PALETTE.glass};
    if(special?.id==='violin'||special?.code==='VIOLIN2026'||specialRole.includes('小提琴'))return{...base,coat:'#40384a',shirt:'#d8cfbd',accent:'#a992be'};
    if(special?.id==='singer'||special?.code==='SINGER2026'||specialRole.includes('歌手'))return{...base,coat:'#263b40',shirt:'#d8cfbd',accent:PALETTE.coral};
    return base;
  }

  function drawHuman(context,actor,options={}){
    const time=options.time||performance.now();
    const x=Math.round(Number(actor?.x)||0);
    const y=Math.round(Number(actor?.y)||0);
    const move=actorMotion(actor,time);
    const colors=humanPalette(actor);
    const specialRole=String(roleForPlayer(actor)?.role||'');
    const bob=move.moving&&move.frame%2===1?-2:0;
    const stride=move.moving?(move.frame===1?3:move.frame===3?-3:0):0;
    const dir=move.dir;

    drawShadow(context,x,y,38);
    drawInteractionRing(context,actor,x,y,time);

    px(context,x-12-stride,y-17,9,21,PALETTE.outline);
    px(context,x+3+stride,y-17,9,21,PALETTE.outline);
    px(context,x-10-stride,y-15,7,17,colors.trousers);
    px(context,x+3+stride,y-15,7,17,colors.trousers);
    px(context,x-11-stride,y+1,9,5,PALETTE.woodDark);
    px(context,x+2+stride,y+1,9,5,PALETTE.woodDark);

    px(context,x-18,y-49+bob,36,36,PALETTE.outline);
    px(context,x-15,y-46+bob,30,31,colors.coat);
    px(context,x-10,y-44+bob,20,27,colors.shirt);
    px(context,x-4,y-44+bob,8,27,colors.accent);
    px(context,x-22,y-43+bob,7,24,PALETTE.outline);
    px(context,x+15,y-43+bob,7,24,PALETTE.outline);
    px(context,x-20,y-41+bob,5,20,colors.skin);
    px(context,x+15,y-41+bob,5,20,colors.skin);

    px(context,x-14,y-73+bob,28,25,PALETTE.outline);
    px(context,x-11,y-70+bob,22,20,colors.skin);
    px(context,x-15,y-79+bob,30,14,PALETTE.outline);
    px(context,x-12,y-76+bob,24,11,colors.hair);
    if(dir==='left')px(context,x-15,y-70+bob,6,18,colors.hair);
    else if(dir==='right')px(context,x+9,y-70+bob,6,18,colors.hair);
    else{px(context,x-15,y-70+bob,6,16,colors.hair);px(context,x+9,y-70+bob,6,16,colors.hair);}

    if(dir!=='up'){
      const eyeY=y-62+bob;
      if(dir==='left')px(context,x-7,eyeY,3,3,PALETTE.outline);
      else if(dir==='right')px(context,x+4,eyeY,3,3,PALETTE.outline);
      else{px(context,x-7,eyeY,3,3,PALETTE.outline);px(context,x+4,eyeY,3,3,PALETTE.outline);px(context,x-3,eyeY+7,6,2,'#9a5e55');}
    }

    if(actor?.role==='barista'){
      px(context,x-11,y-45+bob,22,25,'#eee5d2');
      px(context,x-3,y-45+bob,6,25,PALETTE.brass);
      px(context,x+20,y-39+bob,23,4,PALETTE.brassDark);
      px(context,x+28,y-50+bob,11,12,PALETTE.cream);
      px(context,x+30,y-47+bob,7,5,PALETTE.wood);
    }
    if(actor?.role==='cellist'){
      px(context,x-34,y-44+bob,14,35,PALETTE.woodDark);
      px(context,x-37,y-37+bob,20,21,'#9a5b39');
      px(context,x-30,y-55+bob,4,17,PALETTE.brassDark);
      line(context,x-16,y-51+bob,x-10,y-5+bob,PALETTE.cream,2);
    }
    if(actor?.role==='joker'){
      px(context,x-12,y-78+bob,10,5,PALETTE.coral);
      px(context,x+2,y-78+bob,10,5,PALETTE.glass);
    }
    if(specialRole.includes('海盜')){
      px(context,x-19,y-81+bob,38,6,PALETTE.outline);
      px(context,x-14,y-91+bob,28,12,PALETTE.outline);
      px(context,x-11,y-88+bob,22,7,'#3a2930');
      px(context,x-10,y-81+bob,20,3,PALETTE.brass);
      px(context,x+3,y-62+bob,9,3,PALETTE.outline);
    }else if(specialRole.includes('女僕')){
      px(context,x-14,y-80+bob,28,6,PALETTE.cream);
      px(context,x-18,y-47+bob,36,7,PALETTE.cream);
      px(context,x-9,y-40+bob,18,22,'#d8cfbd');
      px(context,x-3,y-36+bob,6,12,PALETTE.glass);
    }else if(specialRole.includes('小提琴')){
      px(context,x-33,y-43+bob,13,27,PALETTE.woodDark);
      px(context,x-36,y-36+bob,19,16,'#a2603d');
      line(context,x-16,y-49+bob,x-10,y-7+bob,PALETTE.cream,2);
    }else if(specialRole.includes('歌手')){
      px(context,x+22,y-47+bob,4,31,PALETTE.brassDark);
      px(context,x+18,y-52+bob,12,9,PALETTE.outline);
      px(context,x+20,y-50+bob,8,5,PALETTE.coral);
    }

    if(actor?.hasCoffee){
      px(context,x+21,y-34+bob,12,15,PALETTE.cream);
      px(context,x+24,y-31+bob,7,6,PALETTE.wood);
      line(context,x+33,y-31+bob,x+36,y-31+bob,PALETTE.brass,2);
    }

    if(actor?.emote&&(actor.emoteTimer===undefined||actor.emoteTimer>0)){
      text(context,actor.emote,x,y-99+bob,17,PALETTE.cream);
    }
    if(options.label!==false)drawNameplate(context,actor,x,y-96+bob,options.isPlayer?PALETTE.glass:PALETTE.cream);
  }

  function animalColors(key,actor){
    const map={
      cat:{body:'#d7d1c3',face:'#eee7d9',accent:'#9b6748'},
      blackcat:{body:'#1c2224',face:'#2d3538',accent:PALETTE.brass},
      dog:{body:'#a8754d',face:'#d3a474',accent:'#594235'},
      rabbit:{body:'#ddd8cf',face:'#f1ede4',accent:'#bd8f93'},
      fox:{body:'#b8633d',face:'#efe1cc',accent:'#3d2c27'},
      bear:{body:'#79533c',face:'#aa7954',accent:'#3d2b24'},
      penguin:{body:'#242b30',face:'#eee8d9',accent:PALETTE.brass},
      pig:{body:'#c98791',face:'#e5acb1',accent:'#9d5e68'}
    };
    return map[key]||{body:actor?.shirt||PALETTE.coral,face:'#d9ac8c',accent:PALETTE.outline};
  }

  function drawAnimal(context,actor,options={}){
    const time=options.time||performance.now();
    const x=Math.round(Number(actor?.x)||0);
    const y=Math.round(Number(actor?.y)||0);
    const move=actorMotion(actor,time);
    const key=actor?.role==='cat'?(actor?.animal||'cat'):(actor?.animal||'cat');
    const colors=animalColors(key,actor);
    const bob=move.moving&&move.frame%2?-2:0;
    const stride=move.moving?(move.frame===1?2:move.frame===3?-2:0):0;

    drawShadow(context,x,y,34);
    drawInteractionRing(context,actor,x,y,time);
    px(context,x-14-stride,y-13,9,17,PALETTE.outline);
    px(context,x+5+stride,y-13,9,17,PALETTE.outline);
    px(context,x-12-stride,y-11,7,14,colors.body);
    px(context,x+5+stride,y-11,7,14,colors.body);
    px(context,x-19,y-46+bob,38,35,PALETTE.outline);
    px(context,x-16,y-43+bob,32,30,actor?.shirt||colors.body);
    px(context,x-14,y-40+bob,28,21,colors.face);
    px(context,x-16,y-61+bob,32,23,PALETTE.outline);
    px(context,x-13,y-58+bob,26,19,colors.body);

    if(key==='rabbit'){
      px(context,x-12,y-78+bob,8,21,PALETTE.outline);px(context,x+4,y-78+bob,8,21,PALETTE.outline);
      px(context,x-10,y-75+bob,5,17,colors.body);px(context,x+5,y-75+bob,5,17,colors.body);
    }else if(key==='dog'){
      px(context,x-19,y-57+bob,8,20,PALETTE.outline);px(context,x+11,y-57+bob,8,20,PALETTE.outline);
      px(context,x-17,y-55+bob,6,16,colors.accent);px(context,x+11,y-55+bob,6,16,colors.accent);
    }else{
      px(context,x-15,y-67+bob,11,12,PALETTE.outline);px(context,x+4,y-67+bob,11,12,PALETTE.outline);
      px(context,x-12,y-64+bob,7,8,colors.body);px(context,x+5,y-64+bob,7,8,colors.body);
    }

    if(move.dir!=='up'){
      px(context,x-8,y-51+bob,3,3,PALETTE.outline);px(context,x+5,y-51+bob,3,3,PALETTE.outline);
      px(context,x-2,y-44+bob,4,3,colors.accent);
    }
    if(['cat','blackcat','fox'].includes(key)){
      px(context,x+16,y-28+bob,17,6,PALETTE.outline);
      px(context,x+16,y-26+bob,14,3,colors.accent);
    }
    if(actor?.emote&&(actor.emoteTimer===undefined||actor.emoteTimer>0))text(context,actor.emote,x,y-88+bob,16,PALETTE.cream);
    if(options.label!==false)drawNameplate(context,actor,x,y-84+bob,options.isPlayer?PALETTE.glass:PALETTE.cream,true);
  }

  function drawCharacter(context,actor,options={}){
    if(!actor)return;
    if(actor.hasCoffee||actor.coffeeEffectColor){
      const x=Math.round(Number(actor.x)||0),y=Math.round(Number(actor.y)||0);
      context.save();
      context.globalAlpha=.18+.04*Math.sin((options.time||performance.now())/260);
      context.strokeStyle=actor.coffeeEffectColor||PALETTE.brass;
      context.lineWidth=3;
      context.beginPath();context.ellipse(x,y+3,27,9,0,0,Math.PI*2);context.stroke();
      context.restore();
    }
    const animal=actor.role==='cat'?(actor.animal||'cat'):(actor.animal||'human');
    if(animal&&animal!=='human')drawAnimal(context,actor,options);
    else drawHuman(context,actor,options);
  }

  function drawStars(context,time,maxY=210){
    px(context,0,0,WIDTH,maxY,PALETTE.ink);
    for(const star of stars){
      if(star.y>maxY)continue;
      const alpha=.42+.34*Math.sin(time/850+star.phase);
      context.save();context.globalAlpha=alpha;px(context,star.x,star.y,star.size,star.size,PALETTE.cream);context.restore();
    }
  }

  function drawSea(context,time,top=170,bottom=HEIGHT){
    const gradient=context.createLinearGradient(0,top,0,bottom);
    gradient.addColorStop(0,'#15434e');
    gradient.addColorStop(.55,'#0d3038');
    gradient.addColorStop(1,'#081d22');
    context.fillStyle=gradient;context.fillRect(0,top,WIDTH,bottom-top);
    for(let row=0;row<11;row++){
      const y=top+18+row*31;
      const shift=Math.sin(time/760+row*.8)*24;
      for(let x=-80;x<WIDTH+80;x+=92){
        const width=22+(row%3)*8;
        px(context,x+shift+(row%2)*31,y,width,2,row%2?rgba(PALETTE.glass,.28):rgba(PALETTE.cream,.13));
      }
    }
  }

  function rgba(hex,alpha){
    const raw=String(hex||'#000000').replace('#','');
    const value=raw.length===3?raw.split('').map(char=>char+char).join(''):raw;
    const number=parseInt(value,16)||0;
    return`rgba(${(number>>16)&255},${(number>>8)&255},${number&255},${alpha})`;
  }

  function drawPorthole(context,x,y,r,time){
    context.save();
    context.fillStyle=PALETTE.brassDark;context.beginPath();context.arc(x,y,r+5,0,Math.PI*2);context.fill();
    context.fillStyle=PALETTE.brass;context.beginPath();context.arc(x,y,r+2,0,Math.PI*2);context.fill();
    context.fillStyle='#123945';context.beginPath();context.arc(x,y,r-2,0,Math.PI*2);context.fill();
    context.strokeStyle=rgba(PALETTE.glass,.45);context.lineWidth=2;context.beginPath();context.arc(x+Math.sin(time/900)*3,y,r-7,0,Math.PI);context.stroke();
    context.restore();
  }

  function drawCafe(context,time){
    drawStars(context,time,168);
    drawSea(context,time,118,HEIGHT);
    roundedRect(context,28,34,904,514,34,PALETTE.woodDark,PALETTE.brassDark,3);
    roundedRect(context,40,46,880,490,27,'#0c2124',rgba(PALETTE.brass,.28),2);

    const wall=context.createLinearGradient(0,54,0,196);
    wall.addColorStop(0,'#10282b');wall.addColorStop(1,'#173336');
    context.fillStyle=wall;context.fillRect(54,58,852,142);
    px(context,54,194,852,9,PALETTE.brassDark);
    for(let x=83;x<900;x+=116)drawPorthole(context,x,112,27,time+x);

    const floor=context.createLinearGradient(0,201,0,530);
    floor.addColorStop(0,'#5b3e31');floor.addColorStop(1,'#3c2b25');
    context.fillStyle=floor;context.fillRect(54,203,852,327);
    for(let y=214;y<530;y+=28)line(context,54,y,906,y,rgba(PALETTE.cream,.085),1);
    for(let x=60;x<906;x+=72)line(context,x,203,x-24,530,rgba(PALETTE.outline,.22),1);
    px(context,54,524,852,8,PALETTE.woodDark);

    roundedRect(context,112,84,382,106,13,PALETTE.woodDark,PALETTE.brassDark,2);
    roundedRect(context,122,94,362,84,9,PALETTE.wood,rgba(PALETTE.brass,.38),1);
    px(context,122,94,362,14,PALETTE.woodLight);
    for(let x=145;x<468;x+=52){
      roundedRect(context,x,118,38,43,6,'#0c2225',rgba(PALETTE.brass,.25),1);
      px(context,x+9,126,20,22,x%104===41?PALETTE.sage:PALETTE.coral);
    }
    text(context,'MOMO · NIGHT BAR',303,172,12,PALETTE.brass,'center',750);

    roundedRect(context,548,84,236,96,11,'#132528',PALETTE.brassDark,2);
    roundedRect(context,560,96,212,70,7,'#0a181a',rgba(PALETTE.glass,.24),1);
    text(context,'SHIP LOG',666,120,10,PALETTE.brass,'center',800);
    for(let index=0;index<3;index++){
      px(context,579,134+index*9,78+index*23,2,rgba(PALETTE.cream,.36));
      px(context,700,134+index*9,50-index*6,2,rgba(PALETTE.glass,.4));
    }

    drawCafeTable(context,290,400,0);
    drawCafeTable(context,680,400,1);
    drawCafeTable(context,730,276,2);
    drawCafeTable(context,195,276,3);

    roundedRect(context,602,328,164,44,9,PALETTE.woodDark,PALETTE.brassDark,2);
    px(context,613,336,142,10,PALETTE.plum);
    text(context,'LIVE · 22:00',684,363,9,PALETTE.brass,'center',800);

    roundedRect(context,794,176,92,177,8,'#102225',PALETTE.brassDark,3);
    roundedRect(context,806,190,68,147,5,PALETTE.wood,rgba(PALETTE.brass,.42),2);
    for(let y=205;y<330;y+=37)px(context,814,y,52,3,PALETTE.woodDark);
    px(context,856,260,7,7,PALETTE.brass);
    roundedRect(context,800,150,80,22,5,PALETTE.woodDark,PALETTE.brassDark,1);
    text(context,'DECK',840,165,9,PALETTE.brass,'center',800);

    roundedRect(context,68,238,34,224,9,'#26383a',rgba(PALETTE.brass,.26),2);
    roundedRect(context,858,366,34,96,9,'#26383a',rgba(PALETTE.brass,.26),2);
    px(context,70,468,820,20,rgba(PALETTE.ink,.25));
    text(context,'COFFEE SHIP · MAIN SALON',480,517,10,rgba(PALETTE.cream,.48),'center',750);
  }

  function drawCafeTable(context,x,y,index){
    context.save();
    context.fillStyle='rgba(3,9,10,.25)';context.beginPath();context.ellipse(x,y+15,48,14,0,0,Math.PI*2);context.fill();
    roundedRect(context,x-40,y-22,80,40,10,PALETTE.woodDark,PALETTE.brassDark,2);
    roundedRect(context,x-35,y-18,70,30,8,index%2?PALETTE.wood:'#6e4936',rgba(PALETTE.cream,.08),1);
    px(context,x-5,y-13,10,15,PALETTE.cream);
    px(context,x-3,y-11,6,6,index%2?PALETTE.glass:PALETTE.coral);
    roundedRect(context,x-17,y+28,34,23,7,PALETTE.harborLight,rgba(PALETTE.glass,.28),1);
    context.restore();
  }

  function drawDeck(context,time){
    drawStars(context,time,258);
    drawSea(context,time,194,HEIGHT);
    context.save();
    context.fillStyle='rgba(223,189,123,.12)';context.beginPath();context.arc(158,116,54,0,Math.PI*2);context.fill();
    context.fillStyle=PALETTE.cream;context.beginPath();context.arc(158,116,35,0,Math.PI*2);context.fill();
    context.fillStyle=PALETTE.ink;context.beginPath();context.arc(174,105,36,0,Math.PI*2);context.fill();
    context.restore();

    roundedRect(context,50,304,860,226,28,PALETTE.woodDark,PALETTE.brassDark,3);
    const deckGradient=context.createLinearGradient(0,330,0,516);
    deckGradient.addColorStop(0,'#76503d');deckGradient.addColorStop(1,'#4b352c');
    context.fillStyle=deckGradient;context.fillRect(69,326,822,190);
    for(let y=338;y<516;y+=22)line(context,69,y,891,y,rgba(PALETTE.cream,.11),1);
    for(let x=77;x<891;x+=66)line(context,x,326,x-12,516,rgba(PALETTE.outline,.23),1);

    for(let x=74;x<890;x+=40){
      px(context,x,302,5,42,PALETTE.brassDark);
      line(context,x+2,309,x+42,309,rgba(PALETTE.brass,.55),2);
    }
    px(context,476,118,8,215,PALETTE.woodDark);
    px(context,479,118,3,215,PALETTE.brassDark);
    line(context,480,132,205,301,rgba(PALETTE.cream,.35),2);
    line(context,480,132,760,301,rgba(PALETTE.cream,.35),2);
    for(let index=0;index<9;index++){
      const x=315+index*38;const y=214+Math.abs(index-4)*5;
      context.fillStyle=index%3===0?PALETTE.coral:index%3===1?PALETTE.brass:PALETTE.glass;
      context.beginPath();context.moveTo(x,y);context.lineTo(x+12,y+5);context.lineTo(x,y+11);context.closePath();context.fill();
    }

    roundedRect(context,72,332,110,97,11,'#13272a',PALETTE.brassDark,2);
    roundedRect(context,84,345,86,70,7,PALETTE.wood,rgba(PALETTE.brass,.32),1);
    text(context,'SALOON',127,388,9,PALETTE.brass,'center',800);

    roundedRect(context,316,350,328,88,12,PALETTE.woodDark,PALETTE.brassDark,2);
    roundedRect(context,328,361,304,60,8,'#183437',rgba(PALETTE.glass,.25),1);
    for(let x=350;x<620;x+=55){
      px(context,x,373,28,26,PALETTE.cream);
      px(context,x+4,378,20,10,x%110===20?PALETTE.coral:PALETTE.glass);
    }
    text(context,'TIDE BAR',480,415,9,PALETTE.brass,'center',800);

    roundedRect(context,190,356,112,72,10,PALETTE.woodDark,PALETTE.brassDark,2);
    roundedRect(context,660,356,96,72,10,PALETTE.woodDark,PALETTE.brassDark,2);
    roundedRect(context,754,332,138,98,10,'#142b2e',PALETTE.brassDark,2);
    for(let index=0;index<4;index++){
      line(context,777+index*27,349,777+index*27,406,rgba(PALETTE.cream,.5),2);
      px(context,773+index*27,398,9,9,index%2?PALETTE.glass:PALETTE.brass);
    }
    text(context,'FISHING BAY',823,422,9,PALETTE.glass,'center',800);

    drawHotspot(context,132,450,'RETURN',PALETTE.brass,time);
    drawHotspot(context,480,480,'PORT',PALETTE.coral,time+220);
    drawHotspot(context,824,474,'CAST',PALETTE.glass,time+400);
    px(context,70,507,820,9,PALETTE.woodDark);
    px(context,70,507,820,3,PALETTE.brassDark);
  }

  function drawHotspot(context,x,y,label,color,time){
    const pulse=2+Math.sin(time/230)*2;
    context.save();
    context.globalAlpha=.62;
    context.strokeStyle=color;
    context.lineWidth=2;
    context.beginPath();context.ellipse(x,y+6,24+pulse,8+pulse*.25,0,0,Math.PI*2);context.stroke();
    context.restore();
    roundedRect(context,x-31,y-29,62,16,8,'rgba(5,17,19,.74)',rgba(color,.35),1);
    text(context,label,x,y-18,8,color,'center',800);
  }

  function drawPort(context,time){
    drawStars(context,time,235);
    drawSea(context,time,190,HEIGHT);
    px(context,760,126,38,151,PALETTE.cream);
    px(context,752,115,54,18,PALETTE.brassDark);
    px(context,769,84,20,34,PALETTE.woodDark);
    context.save();context.globalAlpha=.12+.05*Math.sin(time/450);context.fillStyle=PALETTE.brass;
    context.beginPath();context.moveTo(779,100);context.lineTo(568,258);context.lineTo(836,258);context.closePath();context.fill();context.restore();

    roundedRect(context,55,332,850,148,18,PALETTE.woodDark,PALETTE.brassDark,3);
    px(context,67,345,826,125,PALETTE.wood);
    for(let y=360;y<470;y+=24)line(context,67,y,893,y,rgba(PALETTE.cream,.1),1);
    for(let x=83;x<893;x+=56)px(context,x,345,5,125,rgba(PALETTE.outline,.28));
    for(let x=96;x<888;x+=112){
      px(context,x,309,13,44,PALETTE.woodDark);
      roundedRect(context,x-3,294,19,18,5,PALETTE.brass,PALETTE.brassDark,1);
      px(context,x+2,298,9,9,PALETTE.cream);
    }
    roundedRect(context,83,374,78,76,9,'#102326',PALETTE.brassDark,2);
    text(context,'DECK',122,418,9,PALETTE.brass,'center',800);
    roundedRect(context,800,374,73,76,9,'#102326',PALETTE.brassDark,2);
    text(context,'ISLAND',836,418,9,PALETTE.muted,'center',800);
    roundedRect(context,362,310,236,42,10,'rgba(7,17,19,.82)',rgba(PALETTE.brass,.3),1);
    text(context,'PORT OF STILL WATER',480,336,13,PALETTE.cream,'center',750);
    drawHotspot(context,116,414,'RETURN',PALETTE.brass,time);
  }

  function drawAtmosphere(context,time){
    const gradient=context.createRadialGradient(480,310,80,480,310,480);
    gradient.addColorStop(0,'rgba(255,255,255,0)');
    gradient.addColorStop(1,'rgba(1,7,8,.3)');
    context.fillStyle=gradient;context.fillRect(0,0,WIDTH,HEIGHT);
    context.save();context.globalAlpha=.07;
    for(let y=0;y<HEIGHT;y+=4)px(context,0,y,WIDTH,1,'#000');
    context.restore();
  }

  function drawWorldEffects(context,world){
    for(const particle of world?.particles||[]){
      context.save();context.globalAlpha=Math.min(1,Number(particle.life||0)/15);
      if(particle.glyph)text(context,particle.glyph,particle.x,particle.y,11,particle.color||PALETTE.brass);
      else px(context,particle.x,particle.y,3,3,particle.color||PALETTE.brass);
      context.restore();
    }
    for(const bubble of world?.bubbles||[]){
      const value=String(bubble.text||'');
      const width=Math.min(270,Math.max(76,value.length*13));
      context.save();context.globalAlpha=Math.min(1,Number(bubble.life||0)/25);
      roundedRect(context,bubble.x-width/2,bubble.y-24,width,28,9,'rgba(5,17,19,.88)','rgba(241,234,220,.16)',1);
      text(context,value,bubble.x,bubble.y-6,11,PALETTE.cream);
      context.restore();
    }
  }

  function drawWorldMessage(context,world){
    if(!world?.message||Number(world.messageTimer||0)<=0)return;
    const alpha=Math.min(1,Number(world.messageTimer)/24);
    context.save();context.globalAlpha=alpha;
    roundedRect(context,118,500,724,46,13,'rgba(5,17,19,.91)','rgba(214,179,110,.3)',1);
    px(context,134,513,4,19,PALETTE.brass);
    text(context,String(world.message).slice(0,88),151,528,12,PALETTE.cream,'left',650);
    context.restore();
  }

  function drawCafeActors(context,time){
    const api=window.COFFEE_SHIP_GAME_API;
    if(!api)return;
    const player=api.player;
    const remotes=Object.values(api.getRemotePlayers?.()||{});
    const actors=[...(api.npcs||[]),...remotes,player].filter(Boolean).sort((a,b)=>(Number(a.y)||0)-(Number(b.y)||0));
    for(const actor of actors)drawCharacter(context,actor,{time,isPlayer:actor===player});
    drawWorldEffects(context,api.world);
    drawWorldMessage(context,api.world);
  }

  function deckActor(){
    const position=window.COFFEE_SHIP_DECK?.getPlayer?.()||window.COFFEE_SHIP_DECK?.getPlayerPosition?.()||{x:202,y:478,dir:'right'};
    const base=window.COFFEE_SHIP_GAME_API?.player||safeJson(localStorage.getItem('coffeeShipAvatar'),{})||{};
    return{...base,...position,name:base.name||'Guest',dir:position.dir||'right',__localPlayer:true};
  }

  function portActor(){
    const position=window.COFFEE_SHIP_PORT?.getPlayer?.()||{x:130,y:410,dir:'right'};
    const base=window.COFFEE_SHIP_GAME_API?.player||safeJson(localStorage.getItem('coffeeShipAvatar'),{})||{};
    return{...base,...position,name:base.name||'Guest',__localPlayer:true};
  }

  function render(time){
    frameId=requestAnimationFrame(render);
    if(!active||document.hidden||time-lastFrame<FRAME_INTERVAL)return;
    lastFrame=time;
    const gamePanel=document.getElementById('gamePanel');
    const entered=document.body.classList.contains('coffee-ship-entered')&&gamePanel&&!gamePanel.classList.contains('hidden');
    if(!entered){if(canvas)canvas.classList.add('hidden');return;}
    if(!canvas||!ctx)ensureCanvas();
    if(!canvas||!ctx)return;
    canvas.classList.remove('hidden');
    const scene=currentScene();
    document.body.dataset.coffeeShipWorldArt=scene;
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    if(scene==='deck'){
      drawDeck(ctx,time);
      drawCharacter(ctx,deckActor(),{time,isPlayer:true});
    }else if(scene==='port'){
      drawPort(ctx,time);
      drawCharacter(ctx,portActor(),{time,isPlayer:true});
    }else{
      drawCafe(ctx,time);
      drawCafeActors(ctx,time);
    }
    drawAtmosphere(ctx,time);
  }

  function syncLayout(){
    if(!canvas||!gameCanvas)return;
    canvas.style.left=`${gameCanvas.offsetLeft}px`;
    canvas.style.top=`${gameCanvas.offsetTop}px`;
    canvas.style.width=`${gameCanvas.offsetWidth}px`;
    canvas.style.height=`${gameCanvas.offsetHeight}px`;
  }

  function ensureCanvas(){
    const panel=document.getElementById('gamePanel');
    gameCanvas=document.getElementById('game');
    if(!panel||!gameCanvas)return false;
    canvas=document.getElementById('worldCanvasV1');
    if(!canvas){
      canvas=document.createElement('canvas');
      canvas.id='worldCanvasV1';
      canvas.className='cs-world-canvas hidden';
      canvas.width=WIDTH;
      canvas.height=HEIGHT;
      canvas.setAttribute('aria-label','Coffee Ship 統一遊戲世界');
      panel.appendChild(canvas);
    }
    ctx=canvas.getContext('2d',{alpha:false});
    if(!ctx)return false;
    ctx.imageSmoothingEnabled=false;
    if(getComputedStyle(panel).position==='static')panel.style.position='relative';
    document.body.classList.add('cs-world-renderer-active');
    syncLayout();
    return true;
  }

  function init(){
    if(!ensureCanvas())return;
    window.addEventListener('resize',syncLayout,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(syncLayout,100));
    window.addEventListener('coffee-ship:entered',()=>{syncLayout();active=true;});
    window.addEventListener('coffee-ship:scene',()=>{syncLayout();active=true;});
    const observer=new MutationObserver(syncLayout);
    observer.observe(document.getElementById('gamePanel'),{attributes:true,childList:true,subtree:false,attributeFilter:['class','style']});
    observer.observe(gameCanvas,{attributes:true,attributeFilter:['class','style','width','height']});
    frameId=requestAnimationFrame(render);
    window.COFFEE_SHIP_WORLD_RENDERER={
      version:1,
      canvas,
      palette:PALETTE,
      drawCharacter,
      currentScene,
      syncLayout,
      pause(){active=false;},
      resume(){active=true;},
      destroy(){active=false;if(frameId)cancelAnimationFrame(frameId);observer.disconnect();canvas?.remove();document.body.classList.remove('cs-world-renderer-active');}
    };
    window.dispatchEvent(new CustomEvent('coffee-ship:world-renderer-ready',{detail:{version:1,scenes:['cafe','deck','port']}}));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
