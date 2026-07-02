import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase, ref, push, onValue, query, limitToLast, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

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
let lastTime = 0;
let audioCtx = null;
let celloTimer = 0;
let cloudReady = false;
let messagesRef = null;
let cachedMessages = [];

function isFirebaseConfigured(){
  const cfg = window.COFFEE_SHIP_FIREBASE_CONFIG;
  return cfg && cfg.apiKey && !cfg.apiKey.includes('PASTE_') && cfg.databaseURL && !cfg.databaseURL.includes('PASTE_');
}

try{
  if(isFirebaseConfigured()){
    const app = initializeApp(window.COFFEE_SHIP_FIREBASE_CONFIG);
    const db = getDatabase(app);
    messagesRef = ref(db, 'coffeeShip/messages');
    cloudReady = true;
    onValue(query(messagesRef, limitToLast(50)), snapshot => {
      const data = snapshot.val() || {};
      cachedMessages = Object.entries(data).map(([id, m]) => ({ id, ...m }))
        .sort((a,b) => (a.createdAt || 0) - (b.createdAt || 0));
      renderMessages();
    });
  }
}catch(error){
  console.warn('Firebase init failed, fallback to localStorage:', error);
  cloudReady = false;
}

const world = {
  tile: 48,
  w: 960,
  h: 576,
  message: cloudReady ? '雲端留言板已連線。歡迎來到 Coffee Ship。' : '留言板目前使用本機模式；填好 Firebase 設定後就能跨裝置同步。',
  messageTimer: 300,
  particles: [],
  bubbles: []
};

const player = {
  name: 'Guest', x: 480, y: 360, speed: 2.4, dir: 'down', radius: 17,
  hair: '#2b1d16', shirt: '#c96a4a', skin:'#f0c7a0', coffeeType:'美式',
  hasCoffee:false, sitting:false, emote:null, emoteTimer:0
};

const coffeeMenuItems = [
  {name:'船長美式', icon:'☕', desc:'清爽、直接，適合剛登船的客人。', price:'80 beans'},
  {name:'星光拿鐵', icon:'🌙', desc:'奶泡柔和，喝起來像夜晚甲板的光。', price:'120 beans'},
  {name:'焦糖海鹽拿鐵', icon:'🍯', desc:'甜味和海風感，Momo 最推薦。', price:'135 beans'},
  {name:'深海義式濃縮', icon:'⚓', desc:'短小、濃烈，適合需要醒腦的旅人。', price:'90 beans'},
  {name:'漂流手沖', icon:'🌊', desc:'慢慢沖、慢慢喝，適合在窗邊留言。', price:'150 beans'},
  {name:'雲朵可可咖啡', icon:'☁️', desc:'咖啡加可可，甜一點，心情也軟一點。', price:'130 beans'}
];

const npcBounds = {
  momo: {x:155,y:194,w:298,h:76},
  peak: {x:600,y:286,w:185,h:92},
  bean: {x:610,y:150,w:250,h:155}
};

const npcs = [
  {name:'Momo', role:'barista', x:235, y:214, targetX:330, targetY:214, speed:.72, radius:20, skin:'#f4c7a9', hair:'#f3c85a', shirt:'#78d2bd', apron:'#fff4d8', emote:'☕', emoteTimer:160, wait:0, bounds:npcBounds.momo, coffee:true},
  {name:'Peak', role:'cellist', x:705, y:332, targetX:690, targetY:332, speed:.5, radius:21, skin:'#f0c7a0', hair:'#1f1930', shirt:'#8460c8', emote:'♪', emoteTimer:160, wait:80, bounds:npcBounds.peak, playing:true},
  {name:'Bean', role:'joker', x:755, y:180, targetX:755, targetY:238, speed:.6, radius:18, skin:'#e9b98f', hair:'#6d3f26', shirt:'#d7bb79', emote:'🙂', emoteTimer:130, wait:100, bounds:npcBounds.bean}
];

const moods = ['☕','✨','💭','🙂','🌙','♪','😆'];
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

const chairs = [
  {x:260,y:360},{x:324,y:360},{x:650,y:360},{x:714,y:360},{x:745,y:236},{x:210,y:236}
];
const tables = [{x:290,y:400},{x:680,y:400},{x:730,y:276},{x:195,y:276}];
const counter = {x:120,y:96,w:360,h:88};
const board = {x:560,y:104,w:210,h:72};
const blocks = [counter, {x:98,y:96,w:28,h:300}, {x:834,y:96,w:28,h:300}];

function rectsOverlap(a,b){return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y}
function near(px,py,ox,oy,dist=70){return Math.hypot(px-ox, py-oy) < dist}
function say(text, time=240){world.message = text; world.messageTimer = time;}
function clamp(v,min,max){return Math.max(min, Math.min(max, v));}
function chooseTarget(n){
  n.targetX = n.bounds.x + 30 + Math.random() * Math.max(10, n.bounds.w - 60);
  n.targetY = n.bounds.y + 26 + Math.random() * Math.max(10, n.bounds.h - 52);
}
function pushBubble(n, text, life=140){
  world.bubbles.push({x:n.x, y:n.y-64, text, life, maxLife:life});
}

function drawPixelRect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function drawText(text,x,y,size=16,align='center',color='#fff4d8'){
  ctx.font = `700 ${size}px ui-rounded, system-ui, sans-serif`;
  ctx.textAlign = align; ctx.fillStyle = '#120b17'; ctx.fillText(text,x+2,y+2); ctx.fillStyle = color; ctx.fillText(text,x,y);
}

function drawFloor(){
  ctx.fillStyle = '#28192b'; ctx.fillRect(0,0,world.w,world.h);
  for(let y=0;y<world.h;y+=world.tile){
    for(let x=0;x<world.w;x+=world.tile){
      ctx.fillStyle = ((x/world.tile+y/world.tile)%2===0)?'#302137':'#2a1c31';
      ctx.fillRect(x,y,world.tile,world.tile);
      ctx.strokeStyle = '#3b2941'; ctx.strokeRect(x,y,world.tile,world.tile);
    }
  }
  ctx.fillStyle = '#151020'; ctx.fillRect(0,0,world.w,66);
  for(let i=0;i<18;i++){drawPixelRect(i*56+12,22,4,4,'#fff4d8')}
  drawText('COFFEE SHIP', 480, 42, 26);
}

function drawCafe(){
  drawPixelRect(counter.x,counter.y,counter.w,counter.h,'#76503e');
  drawPixelRect(counter.x,counter.y,counter.w,18,'#a56b45');
  drawPixelRect(180,122,42,34,'#21182a'); drawPixelRect(190,112,22,14,'#d7bb79');
  drawText('BAR', counter.x+counter.w/2, counter.y+58, 18, 'center', '#ffe5ae');
  drawPixelRect(board.x,board.y,board.w,board.h,'#3a293d');
  drawPixelRect(board.x+10,board.y+10,board.w-20,board.h-20,'#21182a');
  drawText(cloudReady ? '雲端留言  B' : '留言板  B', board.x+board.w/2, board.y+44, 18, 'center', cloudReady ? '#79d0b1' : '#f0a75c');
  drawPixelRect(116,190,40,130,'#3d2a32'); drawPixelRect(804,190,40,130,'#3d2a32');
  tables.forEach(t=>{drawPixelRect(t.x-40,t.y-22,80,44,'#694638');drawPixelRect(t.x-28,t.y-12,56,24,'#9b6844');drawPixelRect(t.x-7,t.y-8,14,16,'#fff4d8')});
  chairs.forEach(c=>{drawPixelRect(c.x-16,c.y-14,32,28,'#4f8f73');drawPixelRect(c.x-12,c.y-22,24,10,'#79d0b1')});
  drawPixelRect(625,345,120,16,'#5b3e4e');
  drawText('STAGE',685,344,13,'center','#d7bb79');
  drawPixelRect(400,500,160,28,'#5b3e4e'); drawText('漂浮咖啡船甲板',480,520,15);
}

function drawCello(x,y){
  drawPixelRect(x+15,y-4,6,52,'#4d2b22');
  drawPixelRect(x+4,y+10,26,28,'#8b4d2e');
  drawPixelRect(x+8,y+4,18,14,'#a45f34');
  drawPixelRect(x+12,y+36,10,18,'#6d3f26');
  drawPixelRect(x+18,y-18,4,18,'#d7bb79');
  drawPixelRect(x+38,y+2,4,46,'#fff4d8');
}

function drawAvatar(a, isPlayer=false){
  const x=Math.round(a.x), y=Math.round(a.y);
  if(a.role === 'barista'){
    drawPixelRect(x-19,y-16,38,44,a.apron || '#fff4d8');
    drawPixelRect(x-15,y-12,30,10,'#f8e9b4');
  }
  if(a.role === 'cellist') drawCello(x-48,y-10);
  drawPixelRect(x-11,y+16,22,6,'#120b17');
  drawPixelRect(x-10,y-28,20,18,a.skin || '#f0c7a0');
  drawPixelRect(x-13,y-36,26,12,a.hair); drawPixelRect(x-16,y-28,7,16,a.hair); drawPixelRect(x+9,y-28,7,16,a.hair);
  if(a.role === 'barista') drawPixelRect(x-10,y-40,20,5,'#ffe5ae');
  drawPixelRect(x-14,y-8,28,28,a.shirt);
  drawPixelRect(x-20,y-4,6,18,a.skin || '#f0c7a0'); drawPixelRect(x+14,y-4,6,18,a.skin || '#f0c7a0');
  drawPixelRect(x-10,y+20,8,16,'#2a2634'); drawPixelRect(x+2,y+20,8,16,'#2a2634');
  drawPixelRect(x-5,y-20,4,4,'#21182a'); drawPixelRect(x+5,y-20,4,4,'#21182a');
  drawPixelRect(x-4,y-12,8,3,'#b86766');
  if(a.hasCoffee || a.coffee){drawPixelRect(x+17,y+3,10,12,'#fff4d8'); drawPixelRect(x+19,y+5,6,5,'#6d3f26')}
  drawText(a.name, x, y-44, 13, 'center', isPlayer ? '#79d0b1' : '#fff4d8');
  if(a.emote && (a.emoteTimer === undefined || a.emoteTimer > 0)) drawText(a.emote, x, y-64, 22);
}

function drawMessage(){
  if(world.messageTimer<=0) return;
  ctx.globalAlpha = Math.min(1, world.messageTimer/30);
  drawPixelRect(90,455,780,76,'#151020');
  ctx.strokeStyle='#76536a';ctx.lineWidth=3;ctx.strokeRect(90,455,780,76);
  drawText(world.message,480,500,18);
  ctx.globalAlpha = 1;
}

function drawBubbles(){
  world.bubbles.forEach(b=>{
    const alpha = Math.min(1, b.life/25);
    ctx.globalAlpha = alpha;
    const w = Math.min(260, Math.max(48, b.text.length * 15));
    drawPixelRect(b.x-w/2,b.y-18,w,32,'#151020');
    ctx.strokeStyle='#76536a'; ctx.lineWidth=2; ctx.strokeRect(Math.round(b.x-w/2),Math.round(b.y-18),w,32);
    drawText(b.text,b.x,b.y+4,15,'center','#fff4d8');
    ctx.globalAlpha = 1;
    b.y -= .18; b.life--;
  });
  world.bubbles = world.bubbles.filter(b=>b.life>0);
}

function spawnSparkles(){
  for(let i=0;i<18;i++) world.particles.push({x:player.x,y:player.y-28,vx:(Math.random()-.5)*3,vy:-Math.random()*2-1,life:45});
}
function drawParticles(){
  world.particles.forEach(p=>{drawPixelRect(p.x,p.y,4,4,'#ffe5ae');p.x+=p.vx;p.y+=p.vy;p.life--});
  world.particles = world.particles.filter(p=>p.life>0);
}

function playerHitboxAt(x,y){return {x:x-player.radius,y:y-32,w:player.radius*2,h:62};}
function npcHitbox(n){return {x:n.x-n.radius,y:n.y-34,w:n.radius*2,h:64};}
function tryMove(dx,dy){
  if(player.sitting && (dx||dy)) player.sitting = false;
  const next = playerHitboxAt(player.x+dx, player.y+dy);
  if(next.x<70 || next.x+next.w>890 || next.y<74 || next.y+next.h>545) return;
  for(const b of blocks) if(rectsOverlap(next,b)) return;
  for(const n of npcs) if(rectsOverlap(next,npcHitbox(n))) return;
  player.x += dx; player.y += dy;
}

function npcCanMove(n, nx, ny){
  if(nx < n.bounds.x+18 || nx > n.bounds.x+n.bounds.w-18 || ny < n.bounds.y+24 || ny > n.bounds.y+n.bounds.h-16) return false;
  const box = npcHitbox({...n, x:nx, y:ny});
  for(const b of blocks) if(rectsOverlap(box,b)) return false;
  if(rectsOverlap(box, playerHitboxAt(player.x, player.y))) return false;
  for(const other of npcs){
    if(other === n) continue;
    if(rectsOverlap(box, npcHitbox(other))) return false;
  }
  return true;
}

function updateNpc(n){
  if(n.emoteTimer > 0){ n.emoteTimer--; if(n.emoteTimer === 0) n.emote = null; }
  const dToPlayer = Math.hypot(player.x - n.x, player.y - n.y);
  if(n.role === 'barista' && dToPlayer < 112){
    n.emote = player.hasCoffee ? '☕' : '？'; n.emoteTimer = 60;
    if(Math.random() < 0.01) pushBubble(n, player.hasCoffee ? '請慢用' : '要喝什麼？', 110);
    return;
  }
  if(n.wait > 0){ n.wait--; return; }
  const dx = n.targetX - n.x;
  const dy = n.targetY - n.y;
  const dist = Math.hypot(dx, dy);
  if(dist < 4){
    n.wait = 55 + Math.floor(Math.random()*115);
    chooseTarget(n);
    if(Math.random() < .35){ n.emote = moods[Math.floor(Math.random()*moods.length)]; n.emoteTimer = 90; }
    return;
  }
  const nx = n.x + dx/dist * n.speed;
  const ny = n.y + dy/dist * n.speed;
  if(npcCanMove(n, nx, ny)){ n.x = nx; n.y = ny; }
  else { n.wait = 25; chooseTarget(n); }
}

function socialTick(){
  for(const a of npcs){
    for(const b of npcs){
      if(a === b) continue;
      if(near(a.x,a.y,b.x,b.y,74) && Math.random() < 0.0025){
        a.emote = a.role === 'cellist' ? '♪' : a.role === 'joker' ? '😆' : '☕'; a.emoteTimer = 95;
        b.emote = b.role === 'joker' ? '😂' : '✨'; b.emoteTimer = 95;
        const text = a.role === 'joker' ? '聽我說' : a.role === 'cellist' ? '來一段嗎' : '咖啡好了';
        pushBubble(a, text, 105);
      }
    }
  }
}

function getClosestNpc(dist=82){
  return npcs.find(n => near(player.x, player.y, n.x, n.y, dist));
}

function interact(){
  const n = getClosestNpc(96);
  if(n){
    if(n.role === 'barista'){ openCoffeeMenu(true); return; }
    if(n.role === 'cellist'){
      startAudio(); playCelloPhrase();
      n.emote = '♪'; n.emoteTimer = 120;
      say(peakLines[Math.floor(Math.random()*peakLines.length)], 220);
      return;
    }
    if(n.role === 'joker'){
      n.emote = '😆'; n.emoteTimer = 120;
      say(beanJokes[Math.floor(Math.random()*beanJokes.length)], 260);
      return;
    }
  }
  sitDown();
}

function update(){
  npcs.forEach(updateNpc);
  socialTick();
  if(celloTimer > 0){ celloTimer--; if(celloTimer % 150 === 0 && Math.random() < .65) playCelloPhrase(false); }
  let dx=0, dy=0;
  if(keys.has('ArrowUp')||keys.has('w')||mobile.up) dy-=player.speed;
  if(keys.has('ArrowDown')||keys.has('s')||mobile.down) dy+=player.speed;
  if(keys.has('ArrowLeft')||keys.has('a')||mobile.left) dx-=player.speed;
  if(keys.has('ArrowRight')||keys.has('d')||mobile.right) dx+=player.speed;
  if(dx&&dy){dx*=.707;dy*=.707}
  tryMove(dx,dy);
  if(world.messageTimer>0) world.messageTimer--;
  if(player.emoteTimer>0){player.emoteTimer--; if(player.emoteTimer===0) player.emote=null;}
}
function render(){
  drawFloor(); drawCafe(); drawParticles();
  [...npcs].sort((a,b)=>a.y-b.y).forEach(n=>drawAvatar(n));
  drawAvatar(player,true); drawBubbles(); drawMessage();
}
function loop(t=0){
  lastTime = t;
  update();render();requestAnimationFrame(loop)
}

function startAudio(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if(audioCtx.state === 'suspended') audioCtx.resume();
}
function playTone(freq, start, duration, gain=0.05){
  if(!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  osc.type = 'sawtooth'; osc2.type = 'triangle';
  osc.frequency.setValueAtTime(freq, start); osc2.frequency.setValueAtTime(freq/2, start);
  filter.type = 'lowpass'; filter.frequency.setValueAtTime(620, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + .08);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(filter); osc2.connect(filter); filter.connect(g); g.connect(audioCtx.destination);
  osc.start(start); osc2.start(start); osc.stop(start+duration+.05); osc2.stop(start+duration+.05);
}
function playCelloPhrase(loud=true){
  startAudio();
  const peak = npcs.find(n=>n.role==='cellist');
  if(peak){ peak.emote='♪'; peak.emoteTimer=130; }
  const now = audioCtx.currentTime + .03;
  const notes = [196, 220, 247, 220, 196, 164.8, 174.6, 196];
  notes.forEach((f,i)=>playTone(f, now + i*.34, .42, loud ? .055 : .028));
  celloTimer = 520;
}

function closeCoffeeMenu(){coffeeMenu.classList.add('hidden');}
function openCoffeeMenu(force=false){
  const momo = npcs.find(n=>n.role==='barista');
  const closeToMomo = momo && near(player.x, player.y, momo.x, momo.y, 135);
  const closeToCounter = near(player.x, player.y, counter.x+counter.w/2, counter.y+counter.h+35, 170);
  if(!force && !closeToMomo && !closeToCounter){say('要靠近吧台或 Momo，才能點咖啡喔。'); return;}
  renderCoffeeOptions();
  coffeeMenu.classList.remove('hidden');
  if(momo){momo.emote='☕'; momo.emoteTimer=120; pushBubble(momo,'想喝什麼？',100);}
  say('Momo 把咖啡單遞給你。', 180);
}
function renderCoffeeOptions(){
  coffeeOptions.innerHTML = coffeeMenuItems.map((item, i)=>`
    <button class="coffee-option" data-coffee-index="${i}">
      <strong>${item.icon} ${item.name}</strong>
      <span>${item.desc}</span>
      <small>${item.price}</small>
    </button>
  `).join('');
}
function chooseCoffee(item){
  player.coffeeType = item.name;
  player.hasCoffee = true;
  player.emote = item.icon + '✨';
  player.emoteTimer = 110;
  coffeeBadge.textContent = `手上有一杯${item.name}`;
  const momo = npcs.find(n=>n.role==='barista');
  if(momo){momo.emote = '☕'; momo.emoteTimer = 120; pushBubble(momo,'請慢用',120);}
  closeCoffeeMenu();
  say(`Momo 為 ${player.name} 做好了一杯「${item.name}」。${item.desc}`, 300);
  spawnSparkles();
}
function orderCoffee(){openCoffeeMenu();}
function sitDown(){
  const chair = chairs.find(c=>near(player.x,player.y,c.x,c.y,52));
  if(chair){player.x=chair.x;player.y=chair.y-10;player.sitting=true;player.emote='💭';player.emoteTimer=120;say(`${player.name} 坐下來休息。這裡很適合慢慢整理心情。`)}
  else say('靠近椅子後按 E 就能坐下。靠近 NPC 按 E 則能互動。');
}
function emote(){player.emote = player.hasCoffee ? '☕✨' : '✨'; player.emoteTimer=95; say(`${player.name} 發出了一個小小的表情。`); spawnSparkles();}

function getLocalMessages(){
  try{return JSON.parse(localStorage.getItem('coffeeShipMessages') || '[]')}catch(e){return []}
}
function saveLocalMessages(messages){localStorage.setItem('coffeeShipMessages', JSON.stringify(messages.slice(-50)));}
function getMessages(){return cloudReady ? cachedMessages : getLocalMessages();}
function escapeHtml(text=''){
  return String(text).replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch] || ch));
}
function formatTime(value){
  if(!value) return '剛剛';
  const d = new Date(value);
  if(Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('zh-TW', {month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'});
}
function renderMessages(){
  if(!messagesList) return;
  const messages = getMessages().slice().reverse();
  if(!messages.length){
    messagesList.innerHTML = `<div class="empty-board">${cloudReady ? '雲端留言板已開啟，但還沒有留言。' : '尚未連上雲端。你仍可在這台裝置測試留言。'}</div>`;
    return;
  }
  messagesList.innerHTML = messages.map(m=>`
    <article class="message-card">
      <div class="message-meta"><strong>${escapeHtml(m.name || 'Guest')}</strong><span>${escapeHtml(formatTime(m.createdAt || m.time))}</span></div>
      <div class="message-text">${escapeHtml(m.text || '')}</div>
    </article>
  `).join('');
}
async function addMessage(text){
  const safeText = text.slice(0, 120);
  const msg = {name: player.name || 'Guest', text: safeText, createdAt: Date.now()};
  if(cloudReady && messagesRef){
    await push(messagesRef, {...msg, createdAt: serverTimestamp()});
  }else{
    const messages = getLocalMessages();
    messages.push({...msg, time: formatTime(Date.now())});
    saveLocalMessages(messages);
    renderMessages();
  }
}
function openBoard(force=false){
  const closeEnough = near(player.x, player.y, board.x+board.w/2, board.y+board.h+36, 170);
  if(!force && !closeEnough){say('要靠近牆上的留言板，才能留下訊息喔。'); return;}
  renderMessages();
  messageBoard.classList.remove('hidden');
  say(cloudReady ? '你打開了 Coffee Ship 的雲端留言板。' : '目前是本機留言板；填入 Firebase 設定後就會跨裝置同步。');
  setTimeout(()=>messageInput.focus(), 30);
}
function closeBoard(){messageBoard.classList.add('hidden'); canvas.focus && canvas.focus();}

startBtn.addEventListener('click',()=>{
  startAudio();
  player.name = document.getElementById('playerName').value.trim() || 'Guest';
  player.hair = document.getElementById('hairColor').value;
  player.shirt = document.getElementById('shirtColor').value;
  player.coffeeType = document.getElementById('coffeeType').value;
  localStorage.setItem('coffeeShipAvatar', JSON.stringify({name:player.name,hair:player.hair,shirt:player.shirt,coffeeType:player.coffeeType}));
  creator.classList.add('hidden'); gamePanel.classList.remove('hidden'); avatarName.textContent = player.name;
  statusText.textContent = cloudReady ? '雲端已連線' : '本機模式'; moodDot.style.background = cloudReady ? '#79d0b1' : '#f0a75c'; moodDot.style.color = moodDot.style.background;
  say(`歡迎 ${player.name} 登上 Coffee Ship。找 Momo 點咖啡，找 Peak 聽大提琴，找 Bean 聽笑話。`, 340);
});

const saved = localStorage.getItem('coffeeShipAvatar');
if(saved){try{const s=JSON.parse(saved); document.getElementById('playerName').value=s.name||''; document.getElementById('hairColor').value=s.hair||'#2b1d16'; document.getElementById('shirtColor').value=s.shirt||'#c96a4a'; document.getElementById('coffeeType').value=s.coffeeType||'美式';}catch(e){}}

window.addEventListener('keydown',e=>{
  const k=e.key.length===1?e.key.toLowerCase():e.key; keys.add(k);
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
  if(k==='c') orderCoffee(); if(k==='e') interact(); if(k==='b') openBoard(); if(e.code==='Space') emote();
});
window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));

document.querySelectorAll('[data-move]').forEach(btn=>{
  const d=btn.dataset.move;
  const on=()=>mobile[d]=true, off=()=>mobile[d]=false;
  btn.addEventListener('pointerdown',on); btn.addEventListener('pointerup',off); btn.addEventListener('pointerleave',off);
});
document.getElementById('coffeeBtn').onclick=()=>openCoffeeMenu(true);
document.getElementById('sitBtn').onclick=interact;
document.getElementById('messageBtn').onclick=()=>openBoard(true);
document.getElementById('emoteBtn').onclick=emote;
closeBoardBtn.onclick=closeBoard;
closeCoffeeMenuBtn.onclick=closeCoffeeMenu;
coffeeOptions.addEventListener('click', e=>{
  const btn = e.target.closest('[data-coffee-index]');
  if(!btn) return;
  chooseCoffee(coffeeMenuItems[Number(btn.dataset.coffeeIndex)]);
});
messageForm.addEventListener('submit', async e=>{
  e.preventDefault();
  const text = messageInput.value.trim();
  if(!text){say('留言不能是空白喔。'); return;}
  try{
    await addMessage(text);
    messageInput.value = '';
    player.emote = '✍️'; player.emoteTimer = 100;
    say(cloudReady ? `${player.name} 把留言貼到雲端留言板了。下一個人會看見。` : `${player.name} 留言成功，但目前只存在這台裝置。`);
    spawnSparkles();
  }catch(error){
    console.error(error);
    say('留言送出失敗。請檢查 Firebase 設定或資料庫規則。', 360);
  }
});

renderMessages();
loop();
