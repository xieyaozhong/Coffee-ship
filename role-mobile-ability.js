const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const creator = document.getElementById('creator');
const gamePanel = document.getElementById('gamePanel');
const startBtn = document.getElementById('startBtn');
const statusText = document.getElementById('statusText');
const moodDot = document.getElementById('moodDot');
const avatarName = document.getElementById('avatarName');
const coffeeBadge = document.getElementById('coffeeBadge');
const messageBoard = document.getElementById('messageBoard');
const messagesList = document.getElementById('messagesList');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const closeBoardBtn = document.getElementById('closeBoardBtn');
const coffeeMenu = document.getElementById('coffeeMenu');
const coffeeOptions = document.getElementById('coffeeOptions');
const closeCoffeeMenuBtn = document.getElementById('closeCoffeeMenuBtn');

const keys = new Set();
const mobile = { up:false, down:false, left:false, right:false };
let audioCtx = null;
let celloTimer = 0;
let firebaseConnected = false;
let firebaseLoading = false;
let cloudReady = false;
let boardStatusText = '遊戲已啟動，留言板正在背景連線…';
let cachedMessages = [];
let remotePlayers = {};
let firebaseApi = null;
let db = null;
let messagesRef = null;
let playersRef = null;
let myPlayerRef = null;
let lastPlayerSync = 0;
let lastSyncedState = '';
let myPlayerId = localStorage.getItem('coffeeShipPlayerId') || `player_${Date.now()}_${Math.random().toString(16).slice(2)}`;
localStorage.setItem('coffeeShipPlayerId', myPlayerId);

const animalOptions = [
  {key:'human', label:'人類', emoji:'🙂', body:'#c96a4a', face:'#f0c7a0', accent:'#2b1d16'},
  {key:'cat', label:'貓咪', emoji:'🐱', body:'#fffdf4', face:'#fffdf4', accent:'#df6d13'},
  {key:'dog', label:'小狗', emoji:'🐶', body:'#c08a55', face:'#e3b47c', accent:'#5b3928'},
  {key:'rabbit', label:'兔子', emoji:'🐰', body:'#f4efe4', face:'#fff8ef', accent:'#e9a6b0'},
  {key:'fox', label:'狐狸', emoji:'🦊', body:'#df6d13', face:'#fff0d7', accent:'#2f1b16'},
  {key:'bear', label:'小熊', emoji:'🐻', body:'#8a5a3c', face:'#c89162', accent:'#3b241c'},
  {key:'penguin', label:'企鵝', emoji:'🐧', body:'#1f2430', face:'#f7f3e8', accent:'#e8a23c'},
  {key:'pig', label:'小豬', emoji:'🐷', body:'#f4a8bb', face:'#ffc4d0', accent:'#d96f8d'}
];
const randomNames = ['拿鐵旅人','漂流豆豆','星光客人','小小船員','焦糖小豬','雲朵咖啡','午夜兔兔','微笑熊熊','企鵝店客','狐狸旅伴','奶泡小狗','三花朋友'];
let selectedAnimal = localStorage.getItem('coffeeShipAnimal') || 'human';

const world = { tile:48, w:960, h:576, message:'Coffee Ship 已啟動。Mugi 現在是正式店貓 NPC。', messageTimer:300, particles:[], bubbles:[] };
const player = { name:'Guest', x:480, y:360, speed:2.4, dir:'down', radius:17, hair:'#2b1d16', shirt:'#c96a4a', skin:'#f0c7a0', coffeeType:'美式', animal:selectedAnimal, hasCoffee:false, sitting:false, emote:null, emoteTimer:0 };

const coffeeMenuItems = [
  {name:'船長美式', icon:'☕', desc:'清爽、直接，適合剛登船的客人。', price:'80 beans'},
  {name:'星光拿鐵', icon:'🌙', desc:'奶泡柔和，喝起來像夜晚甲板的光。', price:'120 beans'},
  {name:'焦糖海鹽拿鐵', icon:'🍯', desc:'甜味和海風感，Momo 最推薦。', price:'135 beans'},
  {name:'深海義式濃縮', icon:'⚓', desc:'短小、濃烈，適合需要醒腦的旅人。', price:'90 beans'},
  {name:'漂流手沖', icon:'🌊', desc:'慢慢沖、慢慢喝，適合在窗邊留言。', price:'150 beans'},
  {name:'雲朵可可咖啡', icon:'☁️', desc:'咖啡加可可，甜一點，心情也軟一點。', price:'130 beans'}
];

const npcBounds = { momo:{x:155,y:194,w:298,h:76}, peak:{x:600,y:286,w:185,h:92}, bean:{x:610,y:150,w:250,h:155}, mugi:{x:150,y:230,w:680,h:292} };
const npcs = [
  {name:'Momo', role:'barista', x:235, y:214, targetX:330, targetY:214, speed:.72, radius:20, skin:'#f4c7a9', hair:'#f3c85a', shirt:'#78d2bd', apron:'#fff4d8', emote:'☕', emoteTimer:160, wait:0, bounds:npcBounds.momo, coffee:true},
  {name:'Peak', role:'cellist', x:705, y:332, targetX:690, targetY:332, speed:.5, radius:21, skin:'#f0c7a0', hair:'#1f1930', shirt:'#8460c8', emote:'♪', emoteTimer:160, wait:80, bounds:npcBounds.peak, playing:true},
  {name:'Bean', role:'joker', x:755, y:180, targetX:755, targetY:238, speed:.6, radius:18, skin:'#e9b98f', hair:'#6d3f26', shirt:'#d7bb79', emote:'🙂', emoteTimer:130, wait:100, bounds:npcBounds.bean},
  {name:'Mugi', role:'cat', x:250, y:452, targetX:330, targetY:400, speed:.82, radius:11, emote:'🐾', emoteTimer:110, wait:40, bounds:npcBounds.mugi, petTimer:0, sleepTimer:0, flip:false}
];
const moods = ['☕','✨','💭','🙂','🌙','♪','😆'];
const catMoods = ['喵～','呼嚕呼嚕…','Mugi 蹭了蹭你的手。','Mugi 伸了一個懶腰。','Mugi 坐在咖啡香旁邊。'];
const beanJokes = ['Bean：為什麼咖啡不會迷路？因為它知道自己要去哪一杯。','Bean：我剛剛跟拿鐵吵架，因為它太會奶了。','Bean：這艘船不怕沉，因為大家都會浮誇。','Bean：我不是豆子，我是有理想的咖啡因。'];
const peakLines = ['Peak 輕輕拉了一段溫柔的大提琴旋律。','Peak 的大提琴聲在船艙裡慢慢散開。','Peak 點頭示意，音符像熱咖啡一樣冒出來。'];
const chairs = [{x:260,y:360},{x:324,y:360},{x:650,y:360},{x:714,y:360},{x:745,y:236},{x:210,y:236}];
const tables = [{x:290,y:400},{x:680,y:400},{x:730,y:276},{x:195,y:276}];
const counter = {x:120,y:96,w:360,h:88};
const board = {x:560,y:104,w:210,h:72};
const blocks = [counter, {x:98,y:96,w:28,h:300}, {x:834,y:96,w:28,h:300}, {x:560,y:104,w:210,h:72}];
const catBlockRects = [{x:260,y:370,w:70,h:55},{x:650,y:370,w:90,h:55},{x:720,y:250,w:70,h:55},{x:170,y:250,w:70,h:55}];

function rectsOverlap(a,b){return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;}
function near(px,py,ox,oy,dist=70){return Math.hypot(px-ox, py-oy) < dist;}
function say(text, time=240){world.message = text; world.messageTimer = time;}
function chooseTarget(n){n.targetX = n.bounds.x + 30 + Math.random() * Math.max(10, n.bounds.w - 60); n.targetY = n.bounds.y + 26 + Math.random() * Math.max(10, n.bounds.h - 52);}
function pushBubble(n, text, life=140){world.bubbles.push({x:n.x, y:n.y-(n.role==='cat'?42:64), text, life});}
function drawPixelRect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function drawText(text,x,y,size=16,align='center',color='#fff4d8'){ctx.font = `700 ${size}px ui-rounded, system-ui, sans-serif`; ctx.textAlign = align; ctx.fillStyle = '#120b17'; ctx.fillText(text,x+2,y+2); ctx.fillStyle = color; ctx.fillText(text,x,y);}
function playerHitboxAt(x,y){return {x:x-player.radius,y:y-32,w:player.radius*2,h:62};}
function npcHitbox(n){return n.role==='cat' ? {x:n.x-13,y:n.y-18,w:30,h:28} : {x:n.x-n.radius,y:n.y-34,w:n.radius*2,h:64};}
function animalByKey(key){return animalOptions.find(a=>a.key===key) || animalOptions[0];}

function drawFloor(){
  ctx.fillStyle='#28192b'; ctx.fillRect(0,0,world.w,world.h);
  for(let y=0;y<world.h;y+=world.tile){for(let x=0;x<world.w;x+=world.tile){ctx.fillStyle=((x/world.tile+y/world.tile)%2===0)?'#302137':'#2a1c31';ctx.fillRect(x,y,world.tile,world.tile);ctx.strokeStyle='#3b2941';ctx.strokeRect(x,y,world.tile,world.tile);}}
  ctx.fillStyle='#151020'; ctx.fillRect(0,0,world.w,66); for(let i=0;i<18;i++) drawPixelRect(i*56+12,22,4,4,'#fff4d8'); drawText('COFFEE SHIP',480,42,26);
}
function drawCafe(){
  drawPixelRect(counter.x,counter.y,counter.w,counter.h,'#76503e'); drawPixelRect(counter.x,counter.y,counter.w,18,'#a56b45'); drawPixelRect(180,122,42,34,'#21182a'); drawPixelRect(190,112,22,14,'#d7bb79'); drawText('BAR', counter.x+counter.w/2, counter.y+58, 18, 'center', '#ffe5ae');
  drawPixelRect(board.x,board.y,board.w,board.h,'#3a293d'); drawPixelRect(board.x+10,board.y+10,board.w-20,board.h-20,'#21182a'); drawText(cloudReady ? '雲端留言  B' : '留言板  B', board.x+board.w/2, board.y+44, 18, 'center', cloudReady ? '#79d0b1' : '#f0a75c');
  drawPixelRect(116,190,40,130,'#3d2a32'); drawPixelRect(804,190,40,130,'#3d2a32');
  tables.forEach(t=>{drawPixelRect(t.x-40,t.y-22,80,44,'#694638');drawPixelRect(t.x-28,t.y-12,56,24,'#9b6844');drawPixelRect(t.x-7,t.y-8,14,16,'#fff4d8');});
  chairs.forEach(c=>{drawPixelRect(c.x-16,c.y-14,32,28,'#4f8f73');drawPixelRect(c.x-12,c.y-22,24,10,'#79d0b1');});
  drawPixelRect(625,345,120,16,'#5b3e4e'); drawText('STAGE',685,344,13,'center','#d7bb79'); drawPixelRect(400,500,160,28,'#5b3e4e'); drawText('漂浮咖啡船甲板',480,520,15);
}
function drawCello(x,y){drawPixelRect(x+15,y-4,6,52,'#4d2b22'); drawPixelRect(x+4,y+10,26,28,'#8b4d2e'); drawPixelRect(x+8,y+4,18,14,'#a45f34'); drawPixelRect(x+12,y+36,10,18,'#6d3f26'); drawPixelRect(x+18,y-18,4,18,'#d7bb79'); drawPixelRect(x+38,y+2,4,46,'#fff4d8');}
function drawAnimalAvatar(a,isPlayer=false){
  const animal = animalByKey(a.animal); const x=Math.round(a.x), y=Math.round(a.y); const body=animal.body, face=animal.face, accent=animal.accent;
  drawPixelRect(x-13,y+17,26,5,'#120b17');
  drawPixelRect(x-15,y-20,30,24,body); drawPixelRect(x-11,y-16,22,17,face);
  if(animal.key==='rabbit'){drawPixelRect(x-12,y-40,7,22,body);drawPixelRect(x+5,y-40,7,22,body);drawPixelRect(x-10,y-36,3,16,accent);drawPixelRect(x+7,y-36,3,16,accent);} 
  else if(animal.key==='penguin'){drawPixelRect(x-13,y-28,26,12,body);drawPixelRect(x-8,y-16,16,16,face);drawPixelRect(x-3,y-7,6,4,accent);} 
  else if(animal.key==='pig'){drawPixelRect(x-16,y-26,9,9,body);drawPixelRect(x+7,y-26,9,9,body);drawPixelRect(x-6,y-6,12,7,accent);drawPixelRect(x-3,y-4,2,2,'#7a4050');drawPixelRect(x+3,y-4,2,2,'#7a4050');}
  else {drawPixelRect(x-15,y-29,9,11,body);drawPixelRect(x+6,y-29,9,11,body);}
  if(animal.key==='fox'){drawPixelRect(x-15,y-22,8,10,accent);drawPixelRect(x+7,y-22,8,10,accent);drawPixelRect(x+14,y+2,14,8,accent);}
  if(animal.key==='dog'){drawPixelRect(x-19,y-18,7,17,accent);drawPixelRect(x+12,y-18,7,17,accent);}
  if(animal.key==='bear'){drawPixelRect(x-17,y-25,8,8,body);drawPixelRect(x+9,y-25,8,8,body);}
  if(animal.key==='cat'){drawPixelRect(x-14,y-26,8,8,accent);drawPixelRect(x+6,y-26,8,8,'#8b9a86');drawPixelRect(x+13,y+2,12,6,accent);}
  drawPixelRect(x-6,y-10,4,4,'#21182a'); drawPixelRect(x+4,y-10,4,4,'#21182a'); drawPixelRect(x-3,y-3,6,3,'#b86766');
  drawPixelRect(x-13,y+2,26,24,body); drawPixelRect(x-8,y+5,16,16,face); drawPixelRect(x-12,y+24,7,12,'#2a2634'); drawPixelRect(x+5,y+24,7,12,'#2a2634');
  if(a.hasCoffee){drawPixelRect(x+15,y+8,10,12,'#fff4d8'); drawPixelRect(x+17,y+10,6,5,'#6d3f26');}
  drawText(`${animal.emoji} ${a.name||'Guest'}`, x, y-47, 12, 'center', isPlayer ? '#79d0b1' : '#fff4d8');
  if(a.emote && (a.emoteTimer===undefined || a.emoteTimer>0)) drawText(a.emote, x, y-67, 20);
}
function drawCat(n){
  const x=Math.round(n.x), y=Math.round(n.y); const s = n.petTimer>0 ? 1 : 0;
  drawPixelRect(x-14,y+7,28,5,'#120b17'); drawPixelRect(x-15,y-8-s,26,15,'#111'); drawPixelRect(x-11,y-12-s,7,6,'#111'); drawPixelRect(x+4,y-12-s,7,6,'#111');
  drawPixelRect(x-13,y-6-s,22,11,'#fffdf4'); drawPixelRect(x-12,y-10-s,7,7,'#8b9a86'); drawPixelRect(x+3,y-10-s,8,8,'#df6d13'); drawPixelRect(x-10,y-3-s,3,3,'#30384d'); drawPixelRect(x+4,y-3-s,3,3,'#30384d'); drawPixelRect(x-3,y+2-s,4,2,'#b86766');
  drawPixelRect(x+4,y+4-s,24,11,'#fffdf4'); drawPixelRect(x+13,y+4-s,7,7,'#df6d13'); drawPixelRect(x+21,y+7-s,8,8,'#8b9a86'); const tailUp=Math.floor(Date.now()/420)%2===0; drawPixelRect(x+27,y+(tailUp?-1:3)-s,5,14,'#111'); drawPixelRect(x+28,y+(tailUp?0:4)-s,3,10,'#df6d13'); drawPixelRect(x+5,y+14-s,5,5,'#111'); drawPixelRect(x+20,y+14-s,5,5,'#111');
  drawText(n.name, x+5, y-28, 11, 'center', '#fff4d8'); if(n.emote && n.emoteTimer>0) drawText(n.emote, x+6, y-44, 18);
}
function drawAvatar(a, isPlayer=false){
  if(a.role==='cat'){drawCat(a); return;} if(a.animal && a.animal !== 'human'){drawAnimalAvatar(a,isPlayer); return;}
  const x=Math.round(a.x), y=Math.round(a.y);
  if(a.role==='barista'){drawPixelRect(x-19,y-16,38,44,a.apron||'#fff4d8'); drawPixelRect(x-15,y-12,30,10,'#f8e9b4');}
  if(a.role==='cellist') drawCello(x-48,y-10);
  drawPixelRect(x-11,y+16,22,6,'#120b17'); drawPixelRect(x-10,y-28,20,18,a.skin||'#f0c7a0'); drawPixelRect(x-13,y-36,26,12,a.hair||'#2b1d16'); drawPixelRect(x-16,y-28,7,16,a.hair||'#2b1d16'); drawPixelRect(x+9,y-28,7,16,a.hair||'#2b1d16'); if(a.role==='barista') drawPixelRect(x-10,y-40,20,5,'#ffe5ae');
  drawPixelRect(x-14,y-8,28,28,a.shirt||'#c96a4a'); drawPixelRect(x-20,y-4,6,18,a.skin||'#f0c7a0'); drawPixelRect(x+14,y-4,6,18,a.skin||'#f0c7a0'); drawPixelRect(x-10,y+20,8,16,'#2a2634'); drawPixelRect(x+2,y+20,8,16,'#2a2634'); drawPixelRect(x-5,y-20,4,4,'#21182a'); drawPixelRect(x+5,y-20,4,4,'#21182a'); drawPixelRect(x-4,y-12,8,3,'#b86766');
  if(a.hasCoffee || a.coffee){drawPixelRect(x+17,y+3,10,12,'#fff4d8'); drawPixelRect(x+19,y+5,6,5,'#6d3f26');}
  drawText(a.name||'Guest', x, y-44, 13, 'center', isPlayer?'#79d0b1':'#fff4d8'); if(a.emote && (a.emoteTimer===undefined || a.emoteTimer>0)) drawText(a.emote, x, y-64, 22);
}
function drawMessage(){if(world.messageTimer<=0) return; ctx.globalAlpha=Math.min(1,world.messageTimer/30); drawPixelRect(90,455,780,76,'#151020'); ctx.strokeStyle='#76536a'; ctx.lineWidth=3; ctx.strokeRect(90,455,780,76); drawText(world.message,480,500,18); ctx.globalAlpha=1;}
function drawBubbles(){world.bubbles.forEach(b=>{ctx.globalAlpha=Math.min(1,b.life/25); const w=Math.min(260,Math.max(48,String(b.text).length*15)); drawPixelRect(b.x-w/2,b.y-18,w,32,'#151020'); ctx.strokeStyle='#76536a'; ctx.lineWidth=2; ctx.strokeRect(Math.round(b.x-w/2),Math.round(b.y-18),w,32); drawText(b.text,b.x,b.y+4,15,'center','#fff4d8'); ctx.globalAlpha=1; b.y-=.18; b.life--;}); world.bubbles=world.bubbles.filter(b=>b.life>0);}
function spawnSparkles(){for(let i=0;i<18;i++) world.particles.push({x:player.x,y:player.y-28,vx:(Math.random()-.5)*3,vy:-Math.random()*2-1,life:45});}
function drawParticles(){world.particles.forEach(p=>{drawPixelRect(p.x,p.y,4,4,'#ffe5ae');p.x+=p.vx;p.y+=p.vy;p.life--;}); world.particles=world.particles.filter(p=>p.life>0);}

function circleRectHit(cx,cy,r,rect){const nx=Math.max(rect.x,Math.min(cx,rect.x+rect.w)); const ny=Math.max(rect.y,Math.min(cy,rect.y+rect.h)); return Math.hypot(cx-nx,cy-ny)<r;}
function tryMove(dx,dy){if(player.sitting&&(dx||dy)) player.sitting=false; const next=playerHitboxAt(player.x+dx,player.y+dy); if(next.x<70||next.x+next.w>890||next.y<74||next.y+next.h>545) return; for(const b of blocks) if(rectsOverlap(next,b)) return; for(const n of npcs) if(rectsOverlap(next,npcHitbox(n))) return; for(const r of Object.values(remotePlayers)) if(r && rectsOverlap(next, playerHitboxAt(r.x||0,r.y||0))) return; player.x+=dx; player.y+=dy; window.COFFEE_SHIP_PLAYER_POS={x:player.x,y:player.y};}
function npcCanMove(n,nx,ny){if(nx<n.bounds.x+18||nx>n.bounds.x+n.bounds.w-18||ny<n.bounds.y+24||ny>n.bounds.y+n.bounds.h-16) return false; const box=npcHitbox({...n,x:nx,y:ny}); for(const b of blocks) if(rectsOverlap(box,b)) return false; if(n.role==='cat' && catBlockRects.some(r=>circleRectHit(nx,ny,n.radius+4,r))) return false; if(rectsOverlap(box,playerHitboxAt(player.x,player.y))) return false; for(const other of npcs){if(other!==n && rectsOverlap(box,npcHitbox(other))) return false;} return true;}
function updateNpc(n){
  if(n.emoteTimer>0){n.emoteTimer--; if(n.emoteTimer===0) n.emote=null;} if(n.petTimer>0) n.petTimer--; if(n.sleepTimer>0) n.sleepTimer--;
  const dToPlayer=Math.hypot(player.x-n.x,player.y-n.y);
  if(n.role==='barista' && dToPlayer<112){n.emote=player.hasCoffee?'☕':'？'; n.emoteTimer=60; if(Math.random()<0.008) pushBubble(n,player.hasCoffee?'請慢用':'要喝什麼？',110); return;}
  if(n.role==='cat'){
    if(dToPlayer<58){n.wait=Math.max(n.wait,25); if(Math.random()<0.01){n.emote='喵'; n.emoteTimer=80;}}
    if(Math.random()<0.0008){n.sleepTimer=260; n.emote='💤'; n.emoteTimer=200; pushBubble(n,'Mugi 眯起眼睛休息。',130);}
    if(n.sleepTimer>0) return;
  }
  if(n.wait>0){n.wait--; return;}
  const dx=n.targetX-n.x, dy=n.targetY-n.y, dist=Math.hypot(dx,dy);
  if(dist<4){n.wait=(n.role==='cat'?70:55)+Math.floor(Math.random()*(n.role==='cat'?120:115)); chooseTarget(n); if(Math.random()<.35){n.emote=n.role==='cat'?'🐾':moods[Math.floor(Math.random()*moods.length)]; n.emoteTimer=90;} return;}
  const nx=n.x+dx/dist*n.speed, ny=n.y+dy/dist*n.speed;
  if(npcCanMove(n,nx,ny)){n.flip=nx<n.x; n.x=nx; n.y=ny;} else {n.wait=25; chooseTarget(n);}
}
function socialTick(){for(const a of npcs){for(const b of npcs){if(a!==b && near(a.x,a.y,b.x,b.y,74) && Math.random()<0.0016){if(a.role==='cat'){a.emote='喵'; a.emoteTimer=90; pushBubble(a,b.role==='cellist'?'♪ 喵':'喵～',105); continue;} a.emote=a.role==='cellist'?'♪':a.role==='joker'?'😆':'☕'; b.emote=b.role==='cat'?'🐾':(b.role==='joker'?'😂':'✨'); a.emoteTimer=b.emoteTimer=95; pushBubble(a,a.role==='joker'?'聽我說':a.role==='cellist'?'來一段嗎':'咖啡好了',105);}}}}
function getClosestNpc(dist=82){return npcs.find(n=>near(player.x,player.y,n.x,n.y,n.role==='cat'?70:dist));}

function startAudio(){if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)(); if(audioCtx.state==='suspended') audioCtx.resume();}
function playTone(freq,start,duration,gain=0.05){if(!audioCtx) return; const osc=audioCtx.createOscillator(), osc2=audioCtx.createOscillator(), g=audioCtx.createGain(), filter=audioCtx.createBiquadFilter(); osc.type='sawtooth'; osc2.type='triangle'; osc.frequency.setValueAtTime(freq,start); osc2.frequency.setValueAtTime(freq/2,start); filter.type='lowpass'; filter.frequency.setValueAtTime(620,start); g.gain.setValueAtTime(0.0001,start); g.gain.exponentialRampToValueAtTime(gain,start+.08); g.gain.exponentialRampToValueAtTime(0.0001,start+duration); osc.connect(filter); osc2.connect(filter); filter.connect(g); g.connect(audioCtx.destination); osc.start(start); osc2.start(start); osc.stop(start+duration+.05); osc2.stop(start+duration+.05);}
function playCelloPhrase(loud=true){startAudio(); const peak=npcs.find(n=>n.role==='cellist'); if(peak){peak.emote='♪'; peak.emoteTimer=130;} const now=audioCtx.currentTime+.03; [196,220,247,220,196,164.8,174.6,196].forEach((f,i)=>playTone(f,now+i*.34,.42,loud?.055:.028)); celloTimer=520;}

function closeCoffeeMenu(){coffeeMenu.classList.add('hidden');}
function openCoffeeMenu(force=false){const momo=npcs.find(n=>n.role==='barista'); const closeToMomo=momo&&near(player.x,player.y,momo.x,momo.y,135); const closeToCounter=near(player.x,player.y,counter.x+counter.w/2,counter.y+counter.h+35,170); if(!force&&!closeToMomo&&!closeToCounter){say('要靠近吧台或 Momo，才能點咖啡喔。');return;} renderCoffeeOptions(); coffeeMenu.classList.remove('hidden'); if(momo){momo.emote='☕';momo.emoteTimer=120;pushBubble(momo,'想喝什麼？',100);} say('Momo 把咖啡單遞給你。',180);}
function renderCoffeeOptions(){coffeeOptions.innerHTML=coffeeMenuItems.map((item,i)=>`<button class="coffee-option" data-coffee-index="${i}"><strong>${item.icon} ${item.name}</strong><span>${item.desc}</span><small>${item.price}</small></button>`).join('');}
function chooseCoffee(item){player.coffeeType=item.name; player.hasCoffee=true; player.emote=item.icon+'✨'; player.emoteTimer=110; coffeeBadge.textContent=`手上有一杯${item.name}`; const momo=npcs.find(n=>n.role==='barista'); if(momo){momo.emote='☕';momo.emoteTimer=120;pushBubble(momo,'請慢用',120);} closeCoffeeMenu(); say(`Momo 為 ${player.name} 做好了一杯「${item.name}」。${item.desc}`,300); spawnSparkles(); syncPlayer(true);}
function orderCoffee(){openCoffeeMenu();}
function sitDown(){const chair=chairs.find(c=>near(player.x,player.y,c.x,c.y,52)); if(chair){player.x=chair.x;player.y=chair.y-10;player.sitting=true;player.emote='💭';player.emoteTimer=120;say(`${player.name} 坐下來休息。這裡很適合慢慢整理心情。`); syncPlayer(true);} else say('靠近椅子後按 E 就能坐下。靠近 NPC 按 E 則能互動。');}
function emote(){player.emote=player.hasCoffee?'☕✨':'✨'; player.emoteTimer=95; say(`${player.name} 發出了一個小小的表情。`); spawnSparkles(); syncPlayer(true);}
function petCat(n){n.petTimer=90; n.emote='♡'; n.emoteTimer=120; n.wait=100; const text=catMoods[Math.floor(Math.random()*catMoods.length)]; pushBubble(n,text,130); say(`${player.name} 摸了摸 Mugi。${text}`,220); spawnSparkles();}
function interact(){const n=getClosestNpc(96); if(n){if(n.role==='cat'){petCat(n);return;} if(n.role==='barista'){openCoffeeMenu(true);return;} if(n.role==='cellist'){startAudio();playCelloPhrase();n.emote='♪';n.emoteTimer=120;say(peakLines[Math.floor(Math.random()*peakLines.length)],220);return;} if(n.role==='joker'){n.emote='😆';n.emoteTimer=120;say(beanJokes[Math.floor(Math.random()*beanJokes.length)],260);return;}} sitDown();}

function getLocalMessages(){try{return JSON.parse(localStorage.getItem('coffeeShipMessages')||'[]');}catch(e){return [];}}
function saveLocalMessages(messages){localStorage.setItem('coffeeShipMessages',JSON.stringify(messages.slice(-80)));}
function getMessages(){return cloudReady?cachedMessages:getLocalMessages();}
function getMessageTime(m){return Number(m.clientCreatedAt||m.createdAt||m.timeRaw||0);}
function cleanMessageText(text){return String(text||'').replace(/[\u0000-\u001F\u007F]/g,' ').replace(/\s+/g,' ').trim().slice(0,120);}
function cleanName(name){return cleanMessageText(name||'Guest').slice(0,16)||'Guest';}
function escapeHtml(text=''){return String(text).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]||ch));}
function formatTime(value){if(!value) return '剛剛'; const d=new Date(value); if(Number.isNaN(d.getTime())) return '剛剛'; return d.toLocaleString('zh-TW',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});}
function renderMessages(){if(!messagesList) return; const statusClass=cloudReady&&firebaseConnected?'online':(firebaseLoading?'connecting':'offline'); const messages=getMessages().slice().sort((a,b)=>getMessageTime(b)-getMessageTime(a)); const statusHtml=`<div class="board-status ${statusClass}">${escapeHtml(boardStatusText)}</div>`; if(!messages.length){messagesList.innerHTML=statusHtml+`<div class="empty-board">目前還沒有留言。Firebase 成功連線後，不同裝置會同步看到。</div>`; return;} messagesList.innerHTML=statusHtml+messages.map(m=>`<article class="message-card"><div class="message-meta"><strong>${escapeHtml(m.name||'Guest')}</strong><span>${escapeHtml(formatTime(getMessageTime(m)))}</span></div><div class="message-text">${escapeHtml(m.text||'')}</div></article>`).join('');}
async function addMessage(text){const safeText=cleanMessageText(text); if(!safeText) throw new Error('empty message'); const now=Date.now(); const msg={name:cleanName(player.name),text:safeText,clientCreatedAt:now,createdAt:now,source:'coffee-ship-web'}; if(cloudReady&&messagesRef&&firebaseApi){await firebaseApi.push(messagesRef,{...msg,createdAt:firebaseApi.serverTimestamp()});} else {const messages=getLocalMessages(); messages.push({...msg,timeRaw:now}); saveLocalMessages(messages); renderMessages();}}
function openBoard(force=false){const closeEnough=near(player.x,player.y,board.x+board.w/2,board.y+board.h+36,170); if(!force&&!closeEnough){say('要靠近牆上的留言板，才能留下訊息喔。');return;} renderMessages(); messageBoard.classList.remove('hidden'); say(cloudReady?(firebaseConnected?'你打開了 Coffee Ship 的雲端留言板。':'留言板正在背景連線中。'):'目前先用本機留言板，Firebase 連線成功後會自動同步。'); setTimeout(()=>messageInput.focus(),30);}
function closeBoard(){messageBoard.classList.add('hidden'); canvas.focus&&canvas.focus();}

function updateOnlineStatus(){if(!statusText) return; statusText.textContent=cloudReady?`雲端已連線 · ${1+Object.keys(remotePlayers).length} 人在線`:(firebaseLoading?'Firebase 背景連線中':'本機模式'); if(moodDot) moodDot.style.background=cloudReady?'#79d0b1':'#f0a75c';}
function currentPlayerState(){return {name:player.name||'Guest',x:Math.round(player.x),y:Math.round(player.y),hair:player.hair,shirt:player.shirt,skin:player.skin,animal:player.animal||'human',coffeeType:player.coffeeType||'',hasCoffee:!!player.hasCoffee,sitting:!!player.sitting,emote:player.emote||'',clientUpdatedAt:Date.now(),updatedAt:firebaseApi?firebaseApi.serverTimestamp():Date.now()};}
async function syncPlayer(force=false){if(!cloudReady||!myPlayerRef||!firebaseApi) return; const state=currentPlayerState(); const stateKey=JSON.stringify({...state,updatedAt:0,clientUpdatedAt:0}); const now=Date.now(); if(!force&&stateKey===lastSyncedState&&now-lastPlayerSync<1200) return; if(!force&&now-lastPlayerSync<180) return; lastSyncedState=stateKey; lastPlayerSync=now; try{await firebaseApi.set(myPlayerRef,state);}catch(err){console.warn('player sync failed',err);}}
function setupCloudPlayer(){if(!cloudReady||!playersRef||!db||!firebaseApi) return; myPlayerRef=firebaseApi.ref(db,`coffeeShip/players/${myPlayerId}`); try{firebaseApi.onDisconnect(myPlayerRef).remove();}catch(e){} syncPlayer(true); updateOnlineStatus();}
function isFirebaseConfigured(){const cfg=window.COFFEE_SHIP_FIREBASE_CONFIG; return cfg&&cfg.apiKey&&cfg.databaseURL&&!cfg.apiKey.includes('PASTE_')&&!cfg.databaseURL.includes('PASTE_');}
async function initFirebaseInBackground(){if(firebaseLoading||cloudReady||!isFirebaseConfigured()){renderMessages();return;} firebaseLoading=true; boardStatusText='Firebase 背景連線中；遊戲可正常遊玩。'; renderMessages(); updateOnlineStatus(); const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error('Firebase 載入逾時')),8000)); try{const [appMod,dbMod]=await Promise.race([Promise.all([import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),import('https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js')]),timeout]); const app=appMod.initializeApp(window.COFFEE_SHIP_FIREBASE_CONFIG); db=dbMod.getDatabase(app); firebaseApi=dbMod; messagesRef=dbMod.ref(db,'coffeeShip/messages'); playersRef=dbMod.ref(db,'coffeeShip/players'); cloudReady=true; firebaseLoading=false; boardStatusText='Firebase 已載入，正在確認資料庫連線…'; dbMod.onValue(dbMod.ref(db,'.info/connected'),snap=>{firebaseConnected=snap.val()===true; boardStatusText=firebaseConnected?'雲端留言板已連線：不同裝置會即時看到同一批留言。':'正在重新連線 Firebase…請確認 Realtime Database Rules。'; renderMessages(); updateOnlineStatus();}); dbMod.onValue(dbMod.query(messagesRef,dbMod.orderByChild('clientCreatedAt'),dbMod.limitToLast(80)),snap=>{const data=snap.val()||{}; cachedMessages=Object.entries(data).map(([id,m])=>({id,...m})).filter(m=>typeof m.text==='string'&&m.text.trim()).sort((a,b)=>getMessageTime(a)-getMessageTime(b)); renderMessages();},err=>{console.error(err); boardStatusText='留言板讀取失敗：請確認 Realtime Database Rules 允許 read。'; renderMessages();}); dbMod.onValue(playersRef,snap=>{const data=snap.val()||{}; const now=Date.now(); remotePlayers=Object.fromEntries(Object.entries(data).filter(([id,p])=>id!==myPlayerId&&p&&(now-(p.clientUpdatedAt||now))<30000).map(([id,p])=>[id,{...p,radius:17,skin:p.skin||'#f0c7a0'}])); updateOnlineStatus();}); if(!creator.classList.contains('hidden')) updateOnlineStatus(); else setupCloudPlayer(); say('Firebase 留言板已在背景連線完成。',180);}catch(error){console.warn('Firebase background init failed:',error); firebaseLoading=false; cloudReady=false; firebaseConnected=false; boardStatusText='Firebase 暫時無法載入，已切回本機留言板；遊戲不會卡住。'; renderMessages(); updateOnlineStatus();}}

function update(){window.COFFEE_SHIP_PLAYER_POS={x:player.x,y:player.y}; npcs.forEach(updateNpc); socialTick(); if(celloTimer>0){celloTimer--; if(celloTimer%150===0&&Math.random()<.65) playCelloPhrase(false);} let dx=0,dy=0; if(keys.has('ArrowUp')||keys.has('w')||mobile.up) dy-=player.speed; if(keys.has('ArrowDown')||keys.has('s')||mobile.down) dy+=player.speed; if(keys.has('ArrowLeft')||keys.has('a')||mobile.left) dx-=player.speed; if(keys.has('ArrowRight')||keys.has('d')||mobile.right) dx+=player.speed; if(dx&&dy){dx*=.707;dy*=.707;} tryMove(dx,dy); syncPlayer(false); if(world.messageTimer>0) world.messageTimer--; if(player.emoteTimer>0){player.emoteTimer--; if(player.emoteTimer===0) player.emote=null;}}
function render(){drawFloor(); drawCafe(); drawParticles(); const actors=[...npcs,...Object.values(remotePlayers),player].sort((a,b)=>(a.y||0)-(b.y||0)); actors.forEach(a=>drawAvatar(a,a===player)); drawBubbles(); drawMessage();}
function loop(){update(); render(); requestAnimationFrame(loop);}

function setupRandomAnimalButton(){
  const btn = document.createElement('button'); btn.type='button'; btn.id='randomAnimalBtn'; btn.textContent='🎲 隨機進入'; btn.style.marginLeft='10px';
  const hint = document.createElement('p'); hint.id='animalHint'; hint.className='hint'; hint.style.marginTop='8px';
  function updateHint(){const a=animalByKey(selectedAnimal); hint.textContent=`目前分身：${a.emoji} ${a.label}。按「隨機進入」會自動取名並登船。`;}
  btn.addEventListener('click',()=>{localStorage.removeItem('coffeeShipRole'); window.COFFEE_SHIP_PENDING_ROLE=null; window.COFFEE_SHIP_FORCE_HUMAN_ROLE=false; const pick=animalOptions[Math.floor(Math.random()*animalOptions.length)]; const name=randomNames[Math.floor(Math.random()*randomNames.length)] + Math.floor(Math.random()*90+10); selectedAnimal=pick.key; player.animal=pick.key; const nameInput=document.getElementById('playerName'); if(nameInput) nameInput.value=name; localStorage.setItem('coffeeShipAnimal',pick.key); updateHint(); startBtn.click();});
  startBtn.insertAdjacentElement('afterend', btn); btn.insertAdjacentElement('afterend', hint); updateHint();
}
setupRandomAnimalButton();

startBtn.addEventListener('click',()=>{startAudio(); const pendingRole=window.COFFEE_SHIP_PENDING_ROLE; if(pendingRole&&pendingRole.specialHuman){selectedAnimal='human'; player.animal='human'; localStorage.setItem('coffeeShipAnimal','human');} player.name=document.getElementById('playerName').value.trim()||'Guest'; player.hair=document.getElementById('hairColor').value; player.shirt=document.getElementById('shirtColor').value; player.coffeeType=document.getElementById('coffeeType').value; player.animal=pendingRole&&pendingRole.specialHuman?'human':selectedAnimal; localStorage.setItem('coffeeShipAvatar',JSON.stringify({name:player.name,hair:player.hair,shirt:player.shirt,coffeeType:player.coffeeType,animal:player.animal})); localStorage.setItem('coffeeShipAnimal',player.animal); creator.classList.add('hidden'); gamePanel.classList.remove('hidden'); avatarName.textContent=pendingRole&&pendingRole.role?`${pendingRole.icon||''} ${player.name}｜${pendingRole.role}`:player.name; updateOnlineStatus(); setupCloudPlayer(); const a=animalByKey(player.animal); say(pendingRole&&pendingRole.role?`歡迎 ${player.name} 以 ${pendingRole.icon||''} ${pendingRole.role} 登上 Coffee Ship。`:`歡迎 ${player.name} 以 ${a.emoji} ${a.label} 分身登上 Coffee Ship。靠近 Mugi 按 E 可以摸摸店貓。`,340);});
const saved=localStorage.getItem('coffeeShipAvatar'); if(saved){try{const s=JSON.parse(saved); document.getElementById('playerName').value=s.name||''; document.getElementById('hairColor').value=s.hair||'#2b1d16'; document.getElementById('shirtColor').value=s.shirt||'#c96a4a'; document.getElementById('coffeeType').value=s.coffeeType||'美式'; selectedAnimal=s.animal||selectedAnimal; player.animal=selectedAnimal; localStorage.setItem('coffeeShipAnimal',selectedAnimal);}catch(e){}}
window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key; keys.add(k); if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault(); if(k==='c') orderCoffee(); if(k==='e') interact(); if(k==='b') openBoard(); if(e.code==='Space') emote();});
window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
document.querySelectorAll('[data-move]').forEach(btn=>{const d=btn.dataset.move; const on=()=>mobile[d]=true, off=()=>mobile[d]=false; btn.addEventListener('pointerdown',on); btn.addEventListener('pointerup',off); btn.addEventListener('pointerleave',off); btn.addEventListener('pointercancel',off);});
document.getElementById('coffeeBtn').onclick=()=>openCoffeeMenu(true); document.getElementById('sitBtn').onclick=interact; document.getElementById('messageBtn').onclick=()=>openBoard(true); document.getElementById('emoteBtn').onclick=emote; closeBoardBtn.onclick=closeBoard; closeCoffeeMenuBtn.onclick=closeCoffeeMenu;
coffeeOptions.addEventListener('click',e=>{const btn=e.target.closest('[data-coffee-index]'); if(!btn) return; chooseCoffee(coffeeMenuItems[Number(btn.dataset.coffeeIndex)]);});
window.addEventListener('beforeunload',()=>{if(cloudReady&&myPlayerRef&&firebaseApi) firebaseApi.remove(myPlayerRef);});
messageForm.addEventListener('submit',async e=>{e.preventDefault(); const text=cleanMessageText(messageInput.value); if(!text){say('留言不能是空白喔。');return;} const submitBtn=messageForm.querySelector('button[type="submit"]'); if(submitBtn){submitBtn.disabled=true;submitBtn.textContent='送出中…';} try{await addMessage(text); messageInput.value=''; player.emote='✍️'; player.emoteTimer=100; say(cloudReady?`${player.name} 把留言貼到雲端留言板了。下一個人會看見。`:`${player.name} 留言成功，但目前只存在這台裝置。`); spawnSparkles();}catch(error){console.error(error); say('留言送出失敗。請檢查 Firebase 設定或 Realtime Database Rules。',360);}finally{const btn=messageForm.querySelector('button[type="submit"]'); if(btn){btn.disabled=false;btn.textContent='貼到留言板';}}});

renderMessages(); updateOnlineStatus(); loop(); setTimeout(initFirebaseInBackground,350);
