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
let frameCount = 0;
let myPlayerId = localStorage.getItem('coffeeShipPlayerId') || `player_${Date.now()}_${Math.random().toString(16).slice(2)}`;
localStorage.setItem('coffeeShipPlayerId', myPlayerId);

const PEARL_KEY = 'coffeeShipPearls';
const COFFEE_EFFECT_KEY = 'coffeeShipCoffeeEffect';

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

const world = {
  tile:48,
  w:960,
  h:576,
  message:'Coffee Ship 已啟動。Momo、Peak、Bean 與 Mugi 現在會在店內自由活動。',
  messageTimer:340,
  particles:[],
  bubbles:[]
};
const player = {
  name:'Guest', x:480, y:360, baseSpeed:2.4, speed:2.4, dir:'down', radius:17,
  hair:'#2b1d16', shirt:'#c96a4a', skin:'#f0c7a0', coffeeType:'', animal:selectedAnimal,
  hasCoffee:false, sitting:false, emote:null, emoteTimer:0, coffeeEffect:null
};

const coffeeMenuItems = [
  {
    id:'captain-americano', name:'船長美式', icon:'☕', price:35, duration:300,
    desc:'清爽直接，讓步伐像甲板海風一樣俐落。', effectLabel:'疾行：移動速度 +28%',
    aura:'#f0a75c', bonuses:{speed:1.28}
  },
  {
    id:'starlight-latte', name:'星光拿鐵', icon:'🌙', price:45, duration:360,
    desc:'柔和奶泡會讓店裡的夥伴更容易注意到你。', effectLabel:'星光親和：互動範圍 +45%',
    aura:'#9ce8f0', bonuses:{interactionRange:1.45,npcAffinity:2}
  },
  {
    id:'caramel-sea-salt', name:'焦糖海鹽拿鐵', icon:'🍯', price:50, duration:480,
    desc:'甜鹹香氣會替每一次漁獲增添珍珠價值。', effectLabel:'金色回饋：漁獲價值 +30%',
    aura:'#ffe16b', bonuses:{pearlBonus:1.3}
  },
  {
    id:'deep-espresso', name:'深海義式濃縮', icon:'⚓', price:40, duration:300,
    desc:'短小濃烈，讓你更快察覺深海稀有動靜。', effectLabel:'深海專注：釣魚更快、稀有率提升',
    aura:'#ff8fb3', bonuses:{fishingLuck:1.45,fishingSpeed:.65}
  },
  {
    id:'drift-pourover', name:'漂流手沖', icon:'🌊', price:55, duration:420,
    desc:'慢慢沖出的層次，能提高漁獲品質與漂流物機率。', effectLabel:'潮汐靈感：品質與瓶中信機率提升',
    aura:'#79d0b1', bonuses:{qualityBonus:.24,bottleLuck:.18}
  },
  {
    id:'cloud-cocoa', name:'雲朵可可咖啡', icon:'☁️', price:45, duration:600,
    desc:'可可與奶泡帶來柔軟心情，表情與互動更有感染力。', effectLabel:'雲朵心情：表情延長、愛心光點',
    aura:'#e9a6b0', bonuses:{emoteBonus:1.55,npcAffinity:1.5,socialSparkle:true}
  }
];

const counter = {x:120,y:96,w:360,h:88};
const board = {x:560,y:104,w:210,h:72};
const chairs = [{x:260,y:360},{x:324,y:360},{x:650,y:360},{x:714,y:360},{x:745,y:236},{x:210,y:236}];
const tables = [{x:290,y:400},{x:680,y:400},{x:730,y:276},{x:195,y:276}];
const blocks = [counter, {x:98,y:96,w:28,h:300}, {x:834,y:96,w:28,h:300}, board];
const npcObstacles = [
  ...tables.map(t=>({x:t.x-48,y:t.y-30,w:96,h:62})),
  {x:610,y:337,w:150,h:32}
];
const catBlockRects = [...npcObstacles, {x:170,y:250,w:70,h:55}];

const roamPoints = {
  momo:[{x:220,y:214},{x:360,y:214},{x:470,y:280},{x:410,y:430},{x:265,y:330},{x:560,y:245}],
  peak:[{x:685,y:330},{x:560,y:430},{x:500,y:280},{x:730,y:230},{x:370,y:320},{x:610,y:210}],
  bean:[{x:755,y:205},{x:590,y:255},{x:500,y:430},{x:300,y:300},{x:735,y:440},{x:430,y:230}],
  mugi:[{x:250,y:452},{x:430,y:440},{x:600,y:455},{x:760,y:325},{x:520,y:260},{x:265,y:285},{x:710,y:205}]
};
const cafeRoamBounds = {x:145,y:190,w:650,h:305};
const npcs = [
  {
    name:'Momo', role:'barista', x:235, y:214, targetX:360, targetY:214, speed:.78, radius:20,
    skin:'#f4c7a9', hair:'#f3c85a', shirt:'#4f8f73', apron:'#fff4d8', accent:'#e9a6b0',
    emote:'☕', emoteTimer:160, wait:0, bounds:cafeRoamBounds, roam:roamPoints.momo, coffee:true, activityTimer:180, flip:false
  },
  {
    name:'Peak', role:'cellist', x:705, y:332, targetX:560, targetY:430, speed:.62, radius:21,
    skin:'#f0c7a0', hair:'#171323', shirt:'#59458a', coat:'#2d2640', accent:'#d7bb79',
    emote:'♪', emoteTimer:160, wait:80, bounds:cafeRoamBounds, roam:roamPoints.peak, playing:true, activityTimer:240, flip:false
  },
  {
    name:'Bean', role:'joker', x:755, y:205, targetX:590, targetY:255, speed:.72, radius:19,
    skin:'#e9b98f', hair:'#6d3f26', shirt:'#d7bb79', accent:'#f05f76', secondary:'#79d0b1',
    emote:'🙂', emoteTimer:130, wait:100, bounds:cafeRoamBounds, roam:roamPoints.bean, activityTimer:210, flip:false
  },
  {
    name:'Mugi', role:'cat', x:250, y:452, targetX:430, targetY:440, speed:.88, radius:12,
    emote:'🐾', emoteTimer:110, wait:40, bounds:cafeRoamBounds, roam:roamPoints.mugi,
    petTimer:0, sleepTimer:0, activityTimer:180, flip:false
  }
];

const moods = ['☕','✨','💭','🙂','🌙','♪','😆'];
const catMoods = ['喵～','呼嚕呼嚕…','Mugi 蹭了蹭你的手。','Mugi 伸了一個懶腰。','Mugi 坐在咖啡香旁邊。'];
const beanJokes = [
  'Bean：為什麼咖啡不會迷路？因為它知道自己要去哪一杯。',
  'Bean：我剛剛跟拿鐵吵架，因為它太會奶了。',
  'Bean：這艘船不怕沉，因為大家都會浮誇。',
  'Bean：我不是豆子，我是有理想的咖啡因。'
];
const peakLines = [
  'Peak 輕輕拉了一段溫柔的大提琴旋律。',
  'Peak 的大提琴聲在船艙裡慢慢散開。',
  'Peak 點頭示意，音符像熱咖啡一樣冒出來。'
];

function safeJson(raw,fallback){try{return raw?JSON.parse(raw):fallback;}catch{return fallback;}}
function rectsOverlap(a,b){return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;}
function near(px,py,ox,oy,dist=70){return Math.hypot(px-ox,py-oy)<dist;}
function say(text,time=240){world.message=text;world.messageTimer=time;}
function drawPixelRect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function drawText(text,x,y,size=16,align='center',color='#fff4d8'){ctx.font=`700 ${size}px ui-rounded,system-ui,sans-serif`;ctx.textAlign=align;ctx.fillStyle='#120b17';ctx.fillText(text,x+2,y+2);ctx.fillStyle=color;ctx.fillText(text,x,y);}
function playerHitboxAt(x,y){return{x:x-player.radius,y:y-32,w:player.radius*2,h:62};}
function npcHitbox(n){return n.role==='cat'?{x:n.x-16,y:n.y-20,w:36,h:34}:{x:n.x-n.radius,y:n.y-38,w:n.radius*2,h:70};}
function animalByKey(key){return animalOptions.find(a=>a.key===key)||animalOptions[0];}
function circleRectHit(cx,cy,r,rect){const nx=Math.max(rect.x,Math.min(cx,rect.x+rect.w));const ny=Math.max(rect.y,Math.min(cy,rect.y+rect.h));return Math.hypot(cx-nx,cy-ny)<r;}
function pushBubble(n,text,life=140){world.bubbles.push({x:n.x,y:n.y-(n.role==='cat'?46:72),text,life});}
function cafeInputAllowed(){return !window.COFFEE_SHIP_DECK?.isDeckOpen?.() && !(document.getElementById('portOverlay')&&!document.getElementById('portOverlay').classList.contains('hidden'));}

function getPearls(){return Math.max(0,Number(localStorage.getItem(PEARL_KEY)||0));}
function setPearls(value){const next=Math.max(0,Math.floor(Number(value)||0));localStorage.setItem(PEARL_KEY,String(next));window.dispatchEvent(new CustomEvent('coffeeShipPearlsChanged',{detail:{pearls:next}}));return next;}
function remainingSeconds(effect=player.coffeeEffect){return effect?Math.max(0,Math.ceil((effect.expiresAt-Date.now())/1000)):0;}
function formatDuration(seconds){const m=Math.floor(seconds/60);const s=seconds%60;return `${m}:${String(s).padStart(2,'0')}`;}
function activeEffect(){return player.coffeeEffect&&player.coffeeEffect.expiresAt>Date.now()?player.coffeeEffect:null;}
function publishCoffeeEffect(){
  const effect=activeEffect();
  window.COFFEE_SHIP_COFFEE_EFFECT=effect?{
    id:effect.id,name:effect.name,icon:effect.icon,label:effect.effectLabel,aura:effect.aura,
    expiresAt:effect.expiresAt,bonuses:{...effect.bonuses}
  }:null;
}
function clearCoffeeEffect(showMessage=false){
  const had=!!player.coffeeEffect;
  player.coffeeEffect=null;player.hasCoffee=false;player.coffeeType='';player.speed=player.baseSpeed;
  localStorage.removeItem(COFFEE_EFFECT_KEY);publishCoffeeEffect();updateCoffeeBadge();
  if(showMessage&&had)say('咖啡效果已經結束，Momo 正在擦亮下一只杯子。',220);
}
function restoreCoffeeEffect(){
  const saved=safeJson(localStorage.getItem(COFFEE_EFFECT_KEY),null);
  if(!saved||!saved.expiresAt||saved.expiresAt<=Date.now()){localStorage.removeItem(COFFEE_EFFECT_KEY);return;}
  const item=coffeeMenuItems.find(x=>x.id===saved.id);
  if(!item)return;
  player.coffeeEffect={...item,expiresAt:saved.expiresAt};
  player.hasCoffee=true;player.coffeeType=item.name;publishCoffeeEffect();
}
function applyCoffeeEffect(item){
  player.coffeeEffect={...item,expiresAt:Date.now()+item.duration*1000};
  player.hasCoffee=true;player.coffeeType=item.name;
  localStorage.setItem(COFFEE_EFFECT_KEY,JSON.stringify({id:item.id,expiresAt:player.coffeeEffect.expiresAt}));
  const savedAvatar=safeJson(localStorage.getItem('coffeeShipAvatar'),{});
  localStorage.setItem('coffeeShipAvatar',JSON.stringify({...savedAvatar,coffeeType:item.name}));
  publishCoffeeEffect();updateCoffeeBadge();
}
function updateCoffeeEffect(){
  const effect=activeEffect();
  if(!effect){if(player.coffeeEffect)clearCoffeeEffect(true);return;}
  player.speed=player.baseSpeed*(effect.bonuses.speed||1);
  if(effect.bonuses.socialSparkle&&frameCount%55===0)spawnSparkles(effect.aura,'♡',5);
  if(frameCount%30===0)updateCoffeeBadge();
}
function updateCoffeeBadge(){
  if(!coffeeBadge)return;
  const pearls=getPearls();const effect=activeEffect();
  coffeeBadge.textContent=effect?`🦪 ${pearls} · ${effect.icon} ${effect.effectLabel} ${formatDuration(remainingSeconds(effect))}`:`🦪 ${pearls} · 尚無咖啡效果`;
  coffeeBadge.style.borderColor=effect?.aura||'#76536a';
  coffeeBadge.style.color=effect?.aura||'#fff4d8';
}

function chooseTarget(n){
  const points=n.roam?.length?n.roam:[{x:n.bounds.x+n.bounds.w/2,y:n.bounds.y+n.bounds.h/2}];
  const point=points[Math.floor(Math.random()*points.length)];
  n.targetX=Math.max(n.bounds.x+24,Math.min(n.bounds.x+n.bounds.w-24,point.x+(Math.random()-.5)*54));
  n.targetY=Math.max(n.bounds.y+30,Math.min(n.bounds.y+n.bounds.h-22,point.y+(Math.random()-.5)*42));
}

function drawFloor(){
  ctx.fillStyle='#28192b';ctx.fillRect(0,0,world.w,world.h);
  for(let y=0;y<world.h;y+=world.tile){for(let x=0;x<world.w;x+=world.tile){ctx.fillStyle=((x/world.tile+y/world.tile)%2===0)?'#302137':'#2a1c31';ctx.fillRect(x,y,world.tile,world.tile);ctx.strokeStyle='#3b2941';ctx.strokeRect(x,y,world.tile,world.tile);}}
  ctx.fillStyle='#151020';ctx.fillRect(0,0,world.w,66);
  for(let i=0;i<18;i++)drawPixelRect(i*56+12,22,4,4,'#fff4d8');
  drawText('COFFEE SHIP',480,42,26);
}
function drawCafe(){
  drawPixelRect(counter.x,counter.y,counter.w,counter.h,'#76503e');drawPixelRect(counter.x,counter.y,counter.w,18,'#b2794c');
  drawPixelRect(180,122,42,34,'#21182a');drawPixelRect(190,112,22,14,'#d7bb79');drawPixelRect(244,112,28,45,'#27394a');drawPixelRect(250,103,16,13,'#9ce8f0');
  drawText('MOMO COFFEE',counter.x+counter.w/2,counter.y+58,17,'center','#ffe5ae');
  drawPixelRect(board.x,board.y,board.w,board.h,'#3a293d');drawPixelRect(board.x+10,board.y+10,board.w-20,board.h-20,'#21182a');drawText(cloudReady?'雲端留言  B':'留言板  B',board.x+board.w/2,board.y+44,18,'center',cloudReady?'#79d0b1':'#f0a75c');
  drawPixelRect(116,190,40,130,'#3d2a32');drawPixelRect(804,190,40,130,'#3d2a32');
  tables.forEach((t,index)=>{drawPixelRect(t.x-40,t.y-22,80,44,'#694638');drawPixelRect(t.x-28,t.y-12,56,24,index%2?'#9b6844':'#a56b45');drawPixelRect(t.x-7,t.y-8,14,16,'#fff4d8');drawPixelRect(t.x-4,t.y-5,8,6,index%2?'#6d3f26':'#9ce8f0');});
  chairs.forEach((c,index)=>{drawPixelRect(c.x-16,c.y-14,32,28,index%2?'#5a386a':'#4f8f73');drawPixelRect(c.x-12,c.y-22,24,10,index%2?'#8460c8':'#79d0b1');});
  drawPixelRect(610,342,150,19,'#5b3e4e');drawPixelRect(625,337,120,9,'#8460c8');drawText('PEAK STAGE',685,335,12,'center','#d7bb79');
  drawPixelRect(400,500,160,28,'#5b3e4e');drawText('漂浮咖啡船甲板',480,520,15);
}

function drawCello(x,y,playing=true){
  drawPixelRect(x+15,y-4,6,52,'#4d2b22');drawPixelRect(x+4,y+10,26,28,'#8b4d2e');drawPixelRect(x+8,y+4,18,14,'#a45f34');drawPixelRect(x+12,y+36,10,18,'#6d3f26');drawPixelRect(x+18,y-18,4,18,'#d7bb79');
  if(playing){const sway=Math.sin(Date.now()/140)*4;drawPixelRect(x+36+sway,y-2,4,48,'#fff4d8');}
}
function drawActorShadow(x,y,w=30){ctx.globalAlpha=.35;drawPixelRect(x-w/2,y+28,w,6,'#08070d');ctx.globalAlpha=1;}
function drawNpcAura(n,color){
  const pulse=3+Math.sin(Date.now()/260+n.x)*2;ctx.save();ctx.globalAlpha=.22;ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(n.x,n.y+24,24+pulse,9+pulse*.25,0,0,Math.PI*2);ctx.stroke();ctx.restore();
}
function drawMomo(n){
  const x=Math.round(n.x),y=Math.round(n.y),bob=Math.floor(Date.now()/300)%2;
  drawActorShadow(x,y,38);drawNpcAura(n,'#79d0b1');
  drawPixelRect(x-11,y+19,9,16,'#2a2634');drawPixelRect(x+2,y+19,9,16,'#2a2634');
  drawPixelRect(x-17,y-8-bob,34,31,n.shirt);drawPixelRect(x-13,y-3-bob,26,30,n.apron);drawPixelRect(x-4,y-3-bob,8,27,'#f8e9b4');
  drawPixelRect(x-20,y-4-bob,7,19,n.skin);drawPixelRect(x+13,y-4-bob,7,19,n.skin);
  drawPixelRect(x-11,y-29-bob,22,19,n.skin);drawPixelRect(x-15,y-38-bob,30,14,n.hair);drawPixelRect(x+8,y-43-bob,12,12,n.hair);drawPixelRect(x-17,y-43-bob,29,6,'#fff4d8');drawPixelRect(x-10,y-47-bob,16,5,n.accent);
  drawPixelRect(x-5,y-22-bob,4,4,'#21182a');drawPixelRect(x+5,y-22-bob,4,4,'#21182a');drawPixelRect(x-3,y-14-bob,7,3,'#b86766');drawPixelRect(x-5,y-7-bob,10,5,n.accent);
  const trayX=n.flip?x-30:x+19;drawPixelRect(trayX,y+4-bob,25,4,'#d7bb79');drawPixelRect(trayX+8,y-7-bob,11,12,'#fff4d8');drawPixelRect(trayX+10,y-5-bob,7,5,'#6d3f26');
  if(Math.floor(Date.now()/220)%2===0){drawText('～',trayX+14,y-12-bob,12,'center','#fff4d8');}
  drawText('☕ Momo',x,y-57,13,'center','#9ff0cf');
  if(n.emote&&n.emoteTimer>0)drawText(n.emote,x,y-77,20);
}
function drawPeak(n){
  const x=Math.round(n.x),y=Math.round(n.y),bob=Math.floor(Date.now()/340)%2;
  drawActorShadow(x,y,40);drawNpcAura(n,'#8460c8');
  if(n.playing||n.activityTimer<80)drawCello(x-51,y-13,n.activityTimer<80||celloTimer>0);
  drawPixelRect(x-11,y+18,9,17,'#191622');drawPixelRect(x+2,y+18,9,17,'#191622');
  drawPixelRect(x-17,y-10-bob,34,34,n.coat);drawPixelRect(x-11,y-7-bob,22,31,n.shirt);drawPixelRect(x-5,y-7-bob,10,27,'#3d3158');drawPixelRect(x-18,y+17-bob,36,8,n.coat);
  drawPixelRect(x-19,y-5-bob,7,19,n.skin);drawPixelRect(x+12,y-5-bob,7,19,n.skin);
  drawPixelRect(x-11,y-31-bob,22,20,n.skin);drawPixelRect(x-15,y-40-bob,30,15,n.hair);drawPixelRect(x-18,y-32-bob,8,18,n.hair);drawPixelRect(x+10,y-32-bob,8,18,n.hair);
  drawPixelRect(x-8,y-23-bob,7,6,'#d7bb79');drawPixelRect(x+2,y-23-bob,7,6,'#d7bb79');drawPixelRect(x-1,y-21-bob,3,2,'#d7bb79');drawPixelRect(x-4,y-13-bob,8,2,'#b86766');drawPixelRect(x-13,y-7-bob,26,5,n.accent);
  drawText('🎻 Peak',x,y-59,13,'center','#d8ccff');
  if(n.emote&&n.emoteTimer>0)drawText(n.emote,x,y-79,20);
}
function drawBean(n){
  const x=Math.round(n.x),y=Math.round(n.y),bob=Math.floor(Date.now()/250)%2;
  drawActorShadow(x,y,36);drawNpcAura(n,'#f0a75c');
  drawPixelRect(x-11,y+18,9,16,'#2a2634');drawPixelRect(x+2,y+18,9,16,'#2a2634');
  drawPixelRect(x-16,y-9-bob,32,32,n.shirt);drawPixelRect(x-13,y-5-bob,13,12,n.accent);drawPixelRect(x,y-5-bob,13,12,n.secondary);drawPixelRect(x-13,y+7-bob,13,12,n.secondary);drawPixelRect(x,y+7-bob,13,12,n.accent);
  drawPixelRect(x-20,y-3-bob,7,18,n.skin);drawPixelRect(x+13,y-3-bob,7,18,n.skin);drawPixelRect(x-11,y-30-bob,22,20,n.skin);drawPixelRect(x-15,y-36-bob,30,10,n.hair);
  drawPixelRect(x-20,y-45-bob,17,12,n.accent);drawPixelRect(x+3,y-45-bob,17,12,n.secondary);drawPixelRect(x-3,y-50-bob,7,18,'#ffe5ae');drawPixelRect(x-21,y-47-bob,5,5,'#ffe16b');drawPixelRect(x+17,y-47-bob,5,5,'#ffe16b');drawPixelRect(x-2,y-53-bob,5,5,'#ffe16b');
  drawPixelRect(x-6,y-22-bob,4,5,'#21182a');drawPixelRect(x+4,y-22-bob,4,5,'#21182a');drawPixelRect(x-5,y-14-bob,11,4,'#fff4d8');drawPixelRect(x-3,y+19-bob,6,5,'#ffe16b');
  drawText('🃏 Bean',x,y-62,13,'center','#ffe5ae');
  if(n.emote&&n.emoteTimer>0)drawText(n.emote,x,y-82,20);
}
function drawCat(n){
  const x=Math.round(n.x),y=Math.round(n.y),pet=n.petTimer>0?2:0,walk=Math.floor(Date.now()/180)%2;
  drawActorShadow(x+6,y,34);drawNpcAura(n,'#e9a6b0');
  drawPixelRect(x-16,y-9-pet,28,16,'#fffdf4');drawPixelRect(x-13,y-14-pet,8,8,'#111');drawPixelRect(x+3,y-14-pet,9,9,'#df6d13');drawPixelRect(x-15,y-15-pet,7,8,'#111');drawPixelRect(x+6,y-16-pet,7,9,'#8b9a86');
  drawPixelRect(x-11,y-5-pet,3,3,'#30384d');drawPixelRect(x+4,y-5-pet,3,3,'#30384d');drawPixelRect(x-3,y+1-pet,5,3,'#b86766');
  drawPixelRect(x+3,y+5-pet,27,12,'#fffdf4');drawPixelRect(x+12,y+5-pet,8,8,'#df6d13');drawPixelRect(x+22,y+8-pet,8,8,'#8b9a86');
  drawPixelRect(x+29,y+(walk?-2:2)-pet,5,16,'#111');drawPixelRect(x+30,y+(walk?-1:3)-pet,3,11,'#df6d13');drawPixelRect(x+5,y+16-pet,6,5,'#111');drawPixelRect(x+22,y+16-pet,6,5,'#111');
  drawPixelRect(x+2,y+4-pet,3,9,'#ff8fb3');drawPixelRect(x+1,y+12-pet,6,6,'#ffe16b');
  drawText('🐾 Mugi',x+7,y-31,12,'center','#fff4d8');
  if(n.emote&&n.emoteTimer>0)drawText(n.emote,x+7,y-49,18);
}
function drawAnimalAvatar(a,isPlayer=false){
  const animal=animalByKey(a.animal);const x=Math.round(a.x),y=Math.round(a.y),body=animal.body,face=animal.face,accent=animal.accent;
  drawActorShadow(x,y,30);drawPixelRect(x-15,y-20,30,24,body);drawPixelRect(x-11,y-16,22,17,face);
  if(animal.key==='rabbit'){drawPixelRect(x-12,y-40,7,22,body);drawPixelRect(x+5,y-40,7,22,body);drawPixelRect(x-10,y-36,3,16,accent);drawPixelRect(x+7,y-36,3,16,accent);}else if(animal.key==='penguin'){drawPixelRect(x-13,y-28,26,12,body);drawPixelRect(x-8,y-16,16,16,face);drawPixelRect(x-3,y-7,6,4,accent);}else if(animal.key==='pig'){drawPixelRect(x-16,y-26,9,9,body);drawPixelRect(x+7,y-26,9,9,body);drawPixelRect(x-6,y-6,12,7,accent);}else{drawPixelRect(x-15,y-29,9,11,body);drawPixelRect(x+6,y-29,9,11,body);}
  if(animal.key==='fox'){drawPixelRect(x-15,y-22,8,10,accent);drawPixelRect(x+7,y-22,8,10,accent);drawPixelRect(x+14,y+2,14,8,accent);}if(animal.key==='dog'){drawPixelRect(x-19,y-18,7,17,accent);drawPixelRect(x+12,y-18,7,17,accent);}if(animal.key==='bear'){drawPixelRect(x-17,y-25,8,8,body);drawPixelRect(x+9,y-25,8,8,body);}if(animal.key==='cat'){drawPixelRect(x-14,y-26,8,8,accent);drawPixelRect(x+6,y-26,8,8,'#8b9a86');drawPixelRect(x+13,y+2,12,6,accent);}
  drawPixelRect(x-6,y-10,4,4,'#21182a');drawPixelRect(x+4,y-10,4,4,'#21182a');drawPixelRect(x-3,y-3,6,3,'#b86766');drawPixelRect(x-13,y+2,26,24,a.shirt||body);drawPixelRect(x-8,y+5,16,16,face);drawPixelRect(x-12,y+24,7,12,'#2a2634');drawPixelRect(x+5,y+24,7,12,'#2a2634');
  if(a.hasCoffee){drawPixelRect(x+15,y+8,10,12,'#fff4d8');drawPixelRect(x+17,y+10,6,5,'#6d3f26');}
  drawText(`${animal.emoji} ${a.name||'Guest'}`,x,y-47,12,'center',isPlayer?'#79d0b1':'#fff4d8');if(a.emote&&(a.emoteTimer===undefined||a.emoteTimer>0))drawText(a.emote,x,y-67,20);
}
function drawHumanAvatar(a,isPlayer=false){
  const x=Math.round(a.x),y=Math.round(a.y);drawActorShadow(x,y,30);drawPixelRect(x-11,y+16,22,6,'#120b17');drawPixelRect(x-10,y-28,20,18,a.skin||'#f0c7a0');drawPixelRect(x-13,y-36,26,12,a.hair||'#2b1d16');drawPixelRect(x-16,y-28,7,16,a.hair||'#2b1d16');drawPixelRect(x+9,y-28,7,16,a.hair||'#2b1d16');drawPixelRect(x-14,y-8,28,28,a.shirt||'#c96a4a');drawPixelRect(x-20,y-4,6,18,a.skin||'#f0c7a0');drawPixelRect(x+14,y-4,6,18,a.skin||'#f0c7a0');drawPixelRect(x-10,y+20,8,16,'#2a2634');drawPixelRect(x+2,y+20,8,16,'#2a2634');drawPixelRect(x-5,y-20,4,4,'#21182a');drawPixelRect(x+5,y-20,4,4,'#21182a');drawPixelRect(x-4,y-12,8,3,'#b86766');if(a.hasCoffee){drawPixelRect(x+17,y+3,10,12,'#fff4d8');drawPixelRect(x+19,y+5,6,5,'#6d3f26');}drawText(a.name||'Guest',x,y-44,13,'center',isPlayer?'#79d0b1':'#fff4d8');if(a.emote&&(a.emoteTimer===undefined||a.emoteTimer>0))drawText(a.emote,x,y-64,22);
}
function drawCoffeeAura(a){
  const effect=a===player?activeEffect():a.coffeeEffect;
  const color=(a===player?effect?.aura:a.coffeeEffectColor)||null;if(!color)return;
  const x=a.x,y=a.y,pulse=6+Math.sin(Date.now()/180)*4;ctx.save();ctx.globalAlpha=.34;ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y+24,25+pulse,8+pulse*.25,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.16;ctx.beginPath();ctx.arc(x,y-5,30+pulse,0,Math.PI*2);ctx.stroke();ctx.restore();
}
function drawAvatar(a,isPlayer=false){
  drawCoffeeAura(a);
  if(a.role==='barista'){drawMomo(a);return;}if(a.role==='cellist'){drawPeak(a);return;}if(a.role==='joker'){drawBean(a);return;}if(a.role==='cat'){drawCat(a);return;}if(a.animal&&a.animal!=='human'){drawAnimalAvatar(a,isPlayer);return;}drawHumanAvatar(a,isPlayer);
}
function drawMessage(){if(world.messageTimer<=0)return;ctx.globalAlpha=Math.min(1,world.messageTimer/30);drawPixelRect(90,455,780,76,'#151020');ctx.strokeStyle='#76536a';ctx.lineWidth=3;ctx.strokeRect(90,455,780,76);drawText(world.message,480,500,18);ctx.globalAlpha=1;}
function drawBubbles(){world.bubbles.forEach(b=>{ctx.globalAlpha=Math.min(1,b.life/25);const w=Math.min(280,Math.max(48,String(b.text).length*15));drawPixelRect(b.x-w/2,b.y-18,w,32,'#151020');ctx.strokeStyle='#76536a';ctx.lineWidth=2;ctx.strokeRect(Math.round(b.x-w/2),Math.round(b.y-18),w,32);drawText(b.text,b.x,b.y+4,15,'center','#fff4d8');ctx.globalAlpha=1;b.y-=.18;b.life--;});world.bubbles=world.bubbles.filter(b=>b.life>0);}
function spawnSparkles(color='#ffe5ae',glyph='',count=18){for(let i=0;i<count;i++)world.particles.push({x:player.x,y:player.y-28,vx:(Math.random()-.5)*3,vy:-Math.random()*2-1,life:45,color,glyph:glyph&&i%3===0?glyph:''});}
function drawParticles(){world.particles.forEach(p=>{ctx.globalAlpha=Math.min(1,p.life/15);if(p.glyph)drawText(p.glyph,p.x,p.y,13,'center',p.color||'#ffe5ae');else drawPixelRect(p.x,p.y,4,4,p.color||'#ffe5ae');p.x+=p.vx;p.y+=p.vy;p.life--;ctx.globalAlpha=1;});world.particles=world.particles.filter(p=>p.life>0);}

function tryMove(dx,dy){
  if(player.sitting&&(dx||dy))player.sitting=false;const next=playerHitboxAt(player.x+dx,player.y+dy);if(next.x<70||next.x+next.w>890||next.y<74||next.y+next.h>545)return;for(const b of blocks)if(rectsOverlap(next,b))return;for(const n of npcs)if(rectsOverlap(next,npcHitbox(n)))return;for(const r of Object.values(remotePlayers))if(r&&rectsOverlap(next,playerHitboxAt(r.x||0,r.y||0)))return;player.x+=dx;player.y+=dy;window.COFFEE_SHIP_PLAYER_POS={x:player.x,y:player.y};
}
function npcCanMove(n,nx,ny){
  if(nx<n.bounds.x+18||nx>n.bounds.x+n.bounds.w-18||ny<n.bounds.y+24||ny>n.bounds.y+n.bounds.h-16)return false;const box=npcHitbox({...n,x:nx,y:ny});for(const b of blocks)if(rectsOverlap(box,b))return false;for(const obstacle of npcObstacles)if(rectsOverlap(box,obstacle))return false;if(n.role==='cat'&&catBlockRects.some(r=>circleRectHit(nx,ny,n.radius+4,r)))return false;if(rectsOverlap(box,playerHitboxAt(player.x,player.y)))return false;for(const other of npcs){if(other!==n&&rectsOverlap(box,npcHitbox(other)))return false;}return true;
}
function updateNpc(n){
  if(n.emoteTimer>0){n.emoteTimer--;if(n.emoteTimer===0)n.emote=null;}if(n.petTimer>0)n.petTimer--;if(n.sleepTimer>0)n.sleepTimer--;if(n.activityTimer>0)n.activityTimer--;
  const dToPlayer=Math.hypot(player.x-n.x,player.y-n.y);const affinity=activeEffect()?.bonuses?.npcAffinity||1;
  if(n.role==='barista'&&dToPlayer<120){n.emote=player.hasCoffee?'☕':'？';n.emoteTimer=55;if(Math.random()<.006*affinity)pushBubble(n,player.hasCoffee?'效果還喜歡嗎？':'今天想喝哪一杯？',115);if(!coffeeMenu.classList.contains('hidden')){n.wait=Math.max(n.wait,12);return;}}
  if(n.role==='cat'){
    if(dToPlayer<62){n.wait=Math.max(n.wait,20);if(Math.random()<.008*affinity){n.emote='喵';n.emoteTimer=80;}}
    if(Math.random()<.00075){n.sleepTimer=260;n.emote='💤';n.emoteTimer=200;pushBubble(n,'Mugi 找到了一塊暖暖的地板。',130);}if(n.sleepTimer>0)return;
  }
  if(n.activityTimer<=0){
    n.activityTimer=170+Math.floor(Math.random()*260);
    if(n.role==='cellist'&&Math.random()<.55){n.wait=105;n.emote='♪';n.emoteTimer=110;pushBubble(n,'♪',85);}
    if(n.role==='joker'&&Math.random()<.5){n.wait=80;n.emote='😆';n.emoteTimer=100;pushBubble(n,'新笑話準備中！',95);}
    if(n.role==='barista'&&Math.random()<.45){n.wait=70;n.emote='☕';n.emoteTimer=90;pushBubble(n,'巡桌時間',90);}
  }
  if(n.wait>0){n.wait--;return;}
  const dx=n.targetX-n.x,dy=n.targetY-n.y,dist=Math.hypot(dx,dy);
  if(dist<5||!Number.isFinite(dist)){n.wait=(n.role==='cat'?40:35)+Math.floor(Math.random()*100);chooseTarget(n);if(Math.random()<.35){n.emote=n.role==='cat'?'🐾':moods[Math.floor(Math.random()*moods.length)];n.emoteTimer=90;}return;}
  const nx=n.x+dx/dist*n.speed,ny=n.y+dy/dist*n.speed;
  if(npcCanMove(n,nx,ny)){n.flip=nx<n.x;n.x=nx;n.y=ny;}else{n.wait=12;chooseTarget(n);}
}
function socialTick(){
  for(let i=0;i<npcs.length;i++){for(let j=i+1;j<npcs.length;j++){const a=npcs[i],b=npcs[j];if(near(a.x,a.y,b.x,b.y,82)&&Math.random()<.002){a.wait=Math.max(a.wait,45);b.wait=Math.max(b.wait,45);if(a.role==='cat'){a.emote='喵';pushBubble(a,b.role==='cellist'?'♪ 喵':'喵～',105);}else{a.emote=a.role==='cellist'?'♪':a.role==='joker'?'😆':'☕';b.emote=b.role==='cat'?'🐾':b.role==='joker'?'😂':'✨';pushBubble(a,a.role==='joker'?'我有一個點子':a.role==='cellist'?'來一小段？':'要不要試喝？',105);}a.emoteTimer=b.emoteTimer=95;}}
  }
}
function getClosestNpc(dist=82){const multiplier=activeEffect()?.bonuses?.interactionRange||1;let closest=null,best=dist*multiplier;for(const n of npcs){const d=Math.hypot(player.x-n.x,player.y-n.y);const limit=n.role==='cat'?70*multiplier:best;if(d<limit&&d<best){closest=n;best=d;}}return closest;}

function startAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();}
function playTone(freq,start,duration,gain=.05){if(!audioCtx)return;const osc=audioCtx.createOscillator(),osc2=audioCtx.createOscillator(),g=audioCtx.createGain(),filter=audioCtx.createBiquadFilter();osc.type='sawtooth';osc2.type='triangle';osc.frequency.setValueAtTime(freq,start);osc2.frequency.setValueAtTime(freq/2,start);filter.type='lowpass';filter.frequency.setValueAtTime(620,start);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(gain,start+.08);g.gain.exponentialRampToValueAtTime(.0001,start+duration);osc.connect(filter);osc2.connect(filter);filter.connect(g);g.connect(audioCtx.destination);osc.start(start);osc2.start(start);osc.stop(start+duration+.05);osc2.stop(start+duration+.05);}
function playCelloPhrase(loud=true){startAudio();const peak=npcs.find(n=>n.role==='cellist');if(peak){peak.emote='♪';peak.emoteTimer=130;peak.wait=150;}const now=audioCtx.currentTime+.03;[196,220,247,220,196,164.8,174.6,196].forEach((f,i)=>playTone(f,now+i*.34,.42,loud?.055:.028));celloTimer=520;}

function closeCoffeeMenu(){coffeeMenu.classList.add('hidden');}
function openCoffeeMenu(force=false){
  if(!cafeInputAllowed())return;const momo=npcs.find(n=>n.role==='barista');const closeToMomo=momo&&near(player.x,player.y,momo.x,momo.y,150*(activeEffect()?.bonuses?.interactionRange||1));const closeToCounter=near(player.x,player.y,counter.x+counter.w/2,counter.y+counter.h+35,170);
  if(!force&&!closeToMomo&&!closeToCounter){say('要靠近吧台或正在巡桌的 Momo，才能點咖啡喔。');return;}
  renderCoffeeOptions();coffeeMenu.classList.remove('hidden');if(momo){momo.emote='☕';momo.emoteTimer=120;momo.wait=130;pushBubble(momo,'珍珠準備好了嗎？',105);}say('Momo 遞上了以珍珠計價的效果咖啡單。',190);
}
function renderCoffeeOptions(){
  const balance=getPearls();const note=coffeeMenu.querySelector('.board-note');if(note)note.innerHTML=`目前持有 <strong class="coffee-pearl-balance">🦪 ${balance} 珍珠</strong>。每杯咖啡都會帶來一種限時人物效果。`;
  coffeeOptions.innerHTML=coffeeMenuItems.map((item,i)=>{
    const affordable=balance>=item.price;return `<button class="coffee-option ${affordable?'':'is-unaffordable'}" data-coffee-index="${i}" aria-disabled="${affordable?'false':'true'}"><strong>${item.icon} ${item.name}</strong><span>${item.desc}</span><em>${item.effectLabel} · ${Math.round(item.duration/60)} 分鐘</em><small>🦪 ${item.price} 珍珠${affordable?'':' · 珍珠不足'}</small></button>`;
  }).join('');
}
function chooseCoffee(item){
  const balance=getPearls();if(balance<item.price){say(`珍珠不足：${item.name} 需要 ${item.price} 珍珠，目前只有 ${balance}。先去甲板釣魚並出售漁獲吧。`,330);renderCoffeeOptions();return;}
  setPearls(balance-item.price);applyCoffeeEffect(item);player.emote=`${item.icon}✨`;player.emoteTimer=Math.round(110*(item.bonuses.emoteBonus||1));const momo=npcs.find(n=>n.role==='barista');if(momo){momo.emote='☕';momo.emoteTimer=120;pushBubble(momo,'效果已啟動，請慢用！',125);}closeCoffeeMenu();say(`花費 ${item.price} 珍珠。${item.icon}「${item.name}」啟動：${item.effectLabel}。`,330);spawnSparkles(item.aura,item.icon,22);syncPlayer(true);
}
function orderCoffee(){openCoffeeMenu();}
function sitDown(){const chair=chairs.find(c=>near(player.x,player.y,c.x,c.y,52));if(chair){player.x=chair.x;player.y=chair.y-10;player.sitting=true;player.emote='💭';player.emoteTimer=120;say(`${player.name} 坐下來休息。這裡很適合慢慢整理心情。`);syncPlayer(true);}else say('靠近椅子後按 E 就能坐下。靠近移動中的 NPC 按 E 可以互動。');}
function emote(){const bonus=activeEffect()?.bonuses?.emoteBonus||1;player.emote=player.hasCoffee?`${activeEffect()?.icon||'☕'}✨`:'✨';player.emoteTimer=Math.round(95*bonus);say(`${player.name} 發出了一個小小的表情。`);spawnSparkles(activeEffect()?.aura||'#ffe5ae',activeEffect()?.bonuses?.socialSparkle?'♡':'',18);syncPlayer(true);}
function petCat(n){n.petTimer=90;n.emote='♡';n.emoteTimer=120;n.wait=100;const text=catMoods[Math.floor(Math.random()*catMoods.length)];pushBubble(n,text,130);say(`${player.name} 摸了摸 Mugi。${text}`,220);spawnSparkles(activeEffect()?.aura||'#ffe5ae','♡',12);}
function interact(){const n=getClosestNpc(100);if(n){if(n.role==='cat'){petCat(n);return;}if(n.role==='barista'){openCoffeeMenu(true);return;}if(n.role==='cellist'){startAudio();playCelloPhrase();n.emote='♪';n.emoteTimer=120;say(peakLines[Math.floor(Math.random()*peakLines.length)],220);return;}if(n.role==='joker'){n.emote='😆';n.emoteTimer=120;n.wait=90;say(beanJokes[Math.floor(Math.random()*beanJokes.length)],260);return;}}sitDown();}

function getLocalMessages(){try{return JSON.parse(localStorage.getItem('coffeeShipMessages')||'[]');}catch{return[];}}
function saveLocalMessages(messages){localStorage.setItem('coffeeShipMessages',JSON.stringify(messages.slice(-80)));}
function getMessages(){return cloudReady?cachedMessages:getLocalMessages();}
function getMessageTime(m){return Number(m.clientCreatedAt||m.createdAt||m.timeRaw||0);}
function cleanMessageText(text){return String(text||'').replace(/[\u0000-\u001F\u007F]/g,' ').replace(/\s+/g,' ').trim().slice(0,120);}
function cleanName(name){return cleanMessageText(name||'Guest').slice(0,16)||'Guest';}
function escapeHtml(text=''){return String(text).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]||ch));}
function formatTime(value){if(!value)return'剛剛';const d=new Date(value);if(Number.isNaN(d.getTime()))return'剛剛';return d.toLocaleString('zh-TW',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});}
function renderMessages(){if(!messagesList)return;const statusClass=cloudReady&&firebaseConnected?'online':firebaseLoading?'connecting':'offline';const messages=getMessages().slice().sort((a,b)=>getMessageTime(b)-getMessageTime(a));const statusHtml=`<div class="board-status ${statusClass}">${escapeHtml(boardStatusText)}</div>`;if(!messages.length){messagesList.innerHTML=statusHtml+`<div class="empty-board">目前還沒有留言。Firebase 成功連線後，不同裝置會同步看到。</div>`;return;}messagesList.innerHTML=statusHtml+messages.map(m=>`<article class="message-card"><div class="message-meta"><strong>${escapeHtml(m.name||'Guest')}</strong><span>${escapeHtml(formatTime(getMessageTime(m)))}</span></div><div class="message-text">${escapeHtml(m.text||'')}</div></article>`).join('');}
async function addMessage(text){const safeText=cleanMessageText(text);if(!safeText)throw new Error('empty message');const now=Date.now();const msg={name:cleanName(player.name),text:safeText,clientCreatedAt:now,createdAt:now,source:'coffee-ship-web'};if(cloudReady&&messagesRef&&firebaseApi)await firebaseApi.push(messagesRef,{...msg,createdAt:firebaseApi.serverTimestamp()});else{const messages=getLocalMessages();messages.push({...msg,timeRaw:now});saveLocalMessages(messages);renderMessages();}}
function openBoard(force=false){if(!cafeInputAllowed())return;const closeEnough=near(player.x,player.y,board.x+board.w/2,board.y+board.h+36,170);if(!force&&!closeEnough){say('要靠近牆上的留言板，才能留下訊息喔。');return;}renderMessages();messageBoard.classList.remove('hidden');say(cloudReady?(firebaseConnected?'你打開了 Coffee Ship 的雲端留言板。':'留言板正在背景連線中。'):'目前先用本機留言板，Firebase 連線成功後會自動同步。');setTimeout(()=>messageInput.focus(),30);}
function closeBoard(){messageBoard.classList.add('hidden');canvas.focus&&canvas.focus();}

function updateOnlineStatus(){if(!statusText)return;statusText.textContent=cloudReady?`雲端已連線 · ${1+Object.keys(remotePlayers).length} 人在線`:firebaseLoading?'Firebase 背景連線中':'本機模式';if(moodDot)moodDot.style.background=cloudReady?'#79d0b1':'#f0a75c';}
function currentPlayerState(){const effect=activeEffect();return{name:player.name||'Guest',x:Math.round(player.x),y:Math.round(player.y),hair:player.hair,shirt:player.shirt,skin:player.skin,animal:player.animal||'human',coffeeType:player.coffeeType||'',hasCoffee:!!player.hasCoffee,coffeeEffectColor:effect?.aura||'',coffeeEffectIcon:effect?.icon||'',coffeeEffectLabel:effect?.effectLabel||'',sitting:!!player.sitting,emote:player.emote||'',clientUpdatedAt:Date.now(),updatedAt:firebaseApi?firebaseApi.serverTimestamp():Date.now()};}
async function syncPlayer(force=false){if(!cloudReady||!myPlayerRef||!firebaseApi)return;const state=currentPlayerState();const stateKey=JSON.stringify({...state,updatedAt:0,clientUpdatedAt:0});const now=Date.now();if(!force&&stateKey===lastSyncedState&&now-lastPlayerSync<1200)return;if(!force&&now-lastPlayerSync<180)return;lastSyncedState=stateKey;lastPlayerSync=now;try{await firebaseApi.set(myPlayerRef,state);}catch(err){console.warn('player sync failed',err);}}
function setupCloudPlayer(){if(!cloudReady||!playersRef||!db||!firebaseApi)return;myPlayerRef=firebaseApi.ref(db,`coffeeShip/players/${myPlayerId}`);try{firebaseApi.onDisconnect(myPlayerRef).remove();}catch{}syncPlayer(true);updateOnlineStatus();}
function isFirebaseConfigured(){const cfg=window.COFFEE_SHIP_FIREBASE_CONFIG;return cfg&&cfg.apiKey&&cfg.databaseURL&&!cfg.apiKey.includes('PASTE_')&&!cfg.databaseURL.includes('PASTE_');}
async function initFirebaseInBackground(){
  if(firebaseLoading||cloudReady||!isFirebaseConfigured()){renderMessages();return;}firebaseLoading=true;boardStatusText='Firebase 背景連線中；遊戲可正常遊玩。';renderMessages();updateOnlineStatus();const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error('Firebase 載入逾時')),8000));
  try{
    const[appMod,dbMod]=await Promise.race([Promise.all([import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),import('https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js')]),timeout]);
    const app=appMod.initializeApp(window.COFFEE_SHIP_FIREBASE_CONFIG);db=dbMod.getDatabase(app);firebaseApi=dbMod;messagesRef=dbMod.ref(db,'coffeeShip/messages');playersRef=dbMod.ref(db,'coffeeShip/players');cloudReady=true;firebaseLoading=false;boardStatusText='Firebase 已載入，正在確認資料庫連線…';
    dbMod.onValue(dbMod.ref(db,'.info/connected'),snap=>{firebaseConnected=snap.val()===true;boardStatusText=firebaseConnected?'雲端留言板已連線：不同裝置會即時看到同一批留言。':'正在重新連線 Firebase…請確認 Realtime Database Rules。';renderMessages();updateOnlineStatus();});
    dbMod.onValue(dbMod.query(messagesRef,dbMod.orderByChild('clientCreatedAt'),dbMod.limitToLast(80)),snap=>{const data=snap.val()||{};cachedMessages=Object.entries(data).map(([id,m])=>({id,...m})).filter(m=>typeof m.text==='string'&&m.text.trim()).sort((a,b)=>getMessageTime(a)-getMessageTime(b));renderMessages();},err=>{console.error(err);boardStatusText='留言板讀取失敗：請確認 Realtime Database Rules 允許 read。';renderMessages();});
    dbMod.onValue(playersRef,snap=>{const data=snap.val()||{};const now=Date.now();remotePlayers=Object.fromEntries(Object.entries(data).filter(([id,p])=>id!==myPlayerId&&p&&(now-(p.clientUpdatedAt||now))<30000).map(([id,p])=>[id,{...p,radius:17,skin:p.skin||'#f0c7a0'}]));updateOnlineStatus();});
    if(!creator.classList.contains('hidden'))updateOnlineStatus();else setupCloudPlayer();say('Firebase 留言板已在背景連線完成。',180);
  }catch(error){console.warn('Firebase background init failed:',error);firebaseLoading=false;cloudReady=false;firebaseConnected=false;boardStatusText='Firebase 暫時無法載入，已切回本機留言板；遊戲不會卡住。';renderMessages();updateOnlineStatus();}
}

function update(){
  frameCount++;window.COFFEE_SHIP_PLAYER_POS={x:player.x,y:player.y};updateCoffeeEffect();npcs.forEach(updateNpc);socialTick();
  if(celloTimer>0){celloTimer--;if(celloTimer%150===0&&Math.random()<.65)playCelloPhrase(false);}
  let dx=0,dy=0;if(keys.has('ArrowUp')||keys.has('w')||mobile.up)dy-=player.speed;if(keys.has('ArrowDown')||keys.has('s')||mobile.down)dy+=player.speed;if(keys.has('ArrowLeft')||keys.has('a')||mobile.left)dx-=player.speed;if(keys.has('ArrowRight')||keys.has('d')||mobile.right)dx+=player.speed;if(dx&&dy){dx*=.707;dy*=.707;}tryMove(dx,dy);syncPlayer(false);if(world.messageTimer>0)world.messageTimer--;if(player.emoteTimer>0){player.emoteTimer--;if(player.emoteTimer===0)player.emote=null;}
}
function render(){drawFloor();drawCafe();drawParticles();const actors=[...npcs,...Object.values(remotePlayers),player].sort((a,b)=>(a.y||0)-(b.y||0));actors.forEach(a=>drawAvatar(a,a===player));drawBubbles();drawMessage();}
function loop(){update();render();requestAnimationFrame(loop);}

function setupRandomAnimalButton(){
  const btn=document.createElement('button');btn.type='button';btn.id='randomAnimalBtn';btn.textContent='🎲 隨機進入';btn.style.marginLeft='10px';const hint=document.createElement('p');hint.id='animalHint';hint.className='hint';hint.style.marginTop='8px';
  function updateHint(){const a=animalByKey(selectedAnimal);hint.textContent=`目前分身：${a.emoji} ${a.label}。按「隨機進入」會自動取名並登船。`;}
  btn.addEventListener('click',()=>{const pick=animalOptions[Math.floor(Math.random()*animalOptions.length)];const name=randomNames[Math.floor(Math.random()*randomNames.length)]+Math.floor(Math.random()*90+10);selectedAnimal=pick.key;player.animal=pick.key;const nameInput=document.getElementById('playerName');if(nameInput)nameInput.value=name;localStorage.setItem('coffeeShipAnimal',pick.key);updateHint();startBtn.click();});
  startBtn.insertAdjacentElement('afterend',btn);btn.insertAdjacentElement('afterend',hint);updateHint();
}
setupRandomAnimalButton();
restoreCoffeeEffect();
updateCoffeeBadge();

startBtn.addEventListener('click',()=>{
  startAudio();player.name=document.getElementById('playerName').value.trim()||'Guest';player.hair=document.getElementById('hairColor').value;player.shirt=document.getElementById('shirtColor').value;player.animal=selectedAnimal;
  const effect=activeEffect();player.coffeeType=effect?.name||'';player.hasCoffee=!!effect;
  localStorage.setItem('coffeeShipAvatar',JSON.stringify({name:player.name,hair:player.hair,shirt:player.shirt,coffeeType:player.coffeeType,animal:player.animal}));localStorage.setItem('coffeeShipAnimal',player.animal);creator.classList.add('hidden');gamePanel.classList.remove('hidden');avatarName.textContent=player.name;updateOnlineStatus();updateCoffeeBadge();setupCloudPlayer();const a=animalByKey(player.animal);say(`歡迎 ${player.name} 以 ${a.emoji} ${a.label} 分身登上 Coffee Ship。NPC 會自由巡店；咖啡使用珍珠購買並提供限時效果。`,380);
});
const saved=localStorage.getItem('coffeeShipAvatar');if(saved){try{const s=JSON.parse(saved);document.getElementById('playerName').value=s.name||'';document.getElementById('hairColor').value=s.hair||'#2b1d16';document.getElementById('shirtColor').value=s.shirt||'#c96a4a';document.getElementById('coffeeType').value='美式';selectedAnimal=s.animal||selectedAnimal;player.animal=selectedAnimal;localStorage.setItem('coffeeShipAnimal',selectedAnimal);}catch{}}

window.addEventListener('keydown',e=>{
  const k=e.key.length===1?e.key.toLowerCase():e.key;keys.add(k);if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(!cafeInputAllowed())return;if(k==='c')orderCoffee();if(k==='e')interact();if(k==='b')openBoard();if(e.code==='Space')emote();
});
window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
document.querySelectorAll('[data-move]').forEach(btn=>{const d=btn.dataset.move;const on=()=>mobile[d]=true,off=()=>mobile[d]=false;btn.addEventListener('pointerdown',on);btn.addEventListener('pointerup',off);btn.addEventListener('pointerleave',off);btn.addEventListener('pointercancel',off);});
document.getElementById('coffeeBtn').onclick=()=>{if(cafeInputAllowed())openCoffeeMenu(true);};
document.getElementById('sitBtn').onclick=()=>{if(cafeInputAllowed())interact();};
document.getElementById('messageBtn').onclick=()=>{if(cafeInputAllowed())openBoard(true);};
document.getElementById('emoteBtn').onclick=()=>{if(cafeInputAllowed())emote();};
closeBoardBtn.onclick=closeBoard;closeCoffeeMenuBtn.onclick=closeCoffeeMenu;
coffeeOptions.addEventListener('click',e=>{const btn=e.target.closest('[data-coffee-index]');if(!btn)return;chooseCoffee(coffeeMenuItems[Number(btn.dataset.coffeeIndex)]);});
window.addEventListener('coffeeShipPearlsChanged',()=>{updateCoffeeBadge();if(!coffeeMenu.classList.contains('hidden'))renderCoffeeOptions();});
window.addEventListener('storage',e=>{if(e.key===PEARL_KEY){updateCoffeeBadge();if(!coffeeMenu.classList.contains('hidden'))renderCoffeeOptions();}});
window.addEventListener('beforeunload',()=>{if(cloudReady&&myPlayerRef&&firebaseApi)firebaseApi.remove(myPlayerRef);});
messageForm.addEventListener('submit',async e=>{e.preventDefault();const text=cleanMessageText(messageInput.value);if(!text){say('留言不能是空白喔。');return;}const submitBtn=messageForm.querySelector('button[type="submit"]');if(submitBtn){submitBtn.disabled=true;submitBtn.textContent='送出中…';}try{await addMessage(text);messageInput.value='';player.emote='✍️';player.emoteTimer=100;say(cloudReady?`${player.name} 把留言貼到雲端留言板了。下一個人會看見。`:`${player.name} 留言成功，但目前只存在這台裝置。`);spawnSparkles();}catch(error){console.error(error);say('留言送出失敗。請檢查 Firebase 設定或 Realtime Database Rules。',360);}finally{const btn=messageForm.querySelector('button[type="submit"]');if(btn){btn.disabled=false;btn.textContent='貼到留言板';}}});

window.COFFEE_SHIP_NPCS=npcs;
window.COFFEE_SHIP_COFFEE={
  menu:coffeeMenuItems,
  getPearls,
  setPearls,
  getActiveEffect:()=>activeEffect(),
  clearEffect:()=>clearCoffeeEffect(false),
  updateBadge:updateCoffeeBadge
};
window.COFFEE_SHIP_GAME_API={player,npcs,openCoffeeMenu,interact,getPearls,setPearls};
publishCoffeeEffect();
renderMessages();updateOnlineStatus();loop();setTimeout(initFirebaseInBackground,350);
