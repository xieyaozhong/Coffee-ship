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
  messageTimer: 320,
  particles: []
};

const player = {
  name: 'Guest', x: 480, y: 360, speed: 2.4, dir: 'down',
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

const npcs = [
  {
    name:'Momo', title:'金髮店長', x:235, y:214, hair:'#f4d47a', shirt:'#1f1a23', apron:'#ffffff', skin:'#f5cda7',
    emote:'☕', role:'manager', barista:true, homeX:235, homeY:214, targetX:330, targetY:214, wait:0, dir:'right', emoteTimer:999999,
    talk:['歡迎光臨 Coffee Ship，我是店長 Momo。','想喝什麼呢？靠近我按 C，我會替你推薦咖啡。','今天的推薦是焦糖海鹽拿鐵，像海風一樣溫柔。']
  },
  {
    name:'Peak', title:'大提琴手', x:705, y:332, hair:'#17151f', shirt:'#2e2638', skin:'#efc39d', emote:'🎻', role:'cellist', emoteTimer:999999,
    talk:['Peak 拉起低沉的大提琴，整艘船都安靜了下來。','這首曲子像深夜的海，也像一杯慢慢冷掉的咖啡。','你可以坐下來聽，我會一直演奏。']
  },
  {
    name:'Bean', title:'喜劇 NPC', x:755, y:180, hair:'#8a5a31', shirt:'#d7bb79', skin:'#f0c7a0', emote:'😂', role:'joker', emoteTimer:999999,
    jokes:['Bean：為什麼咖啡每天都很準時？因為它會「準時萃取」！','Bean：拿鐵為什麼不迷路？因為它有拉花導航！','Bean：咖啡豆最怕什麼？最怕被磨到沒脾氣！','Bean：美式咖啡說它很自由，因為它沒有奶的束縛。']
  }
];

const chairs = [
  {x:260,y:360},{x:324,y:360},{x:650,y:360},{x:714,y:360},{x:745,y:236},{x:210,y:236}
];
const tables = [{x:290,y:400},{x:680,y:400},{x:730,y:276},{x:195,y:276}];
const counter = {x:120,y:96,w:360,h:88};
const momoZone = {x:150,y:198,w:300,h:74};
const board = {x:560,y:104,w:210,h:72};
const blocks = [counter, {x:98,y:96,w:28,h:300}, {x:834,y:96,w:28,h:300}];

function rectsOverlap(a,b){return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y}
function near(px,py,ox,oy,dist=70){return Math.hypot(px-ox, py-oy) < dist}
function say(text, time=240){world.message = text; world.messageTimer = time;}

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
  drawText('Momo 店長', 305, 202, 14, 'center', '#79d0b1');
  drawPixelRect(board.x,board.y,board.w,board.h,'#3a293d');
  drawPixelRect(board.x+10,board.y+10,board.w-20,board.h-20,'#21182a');
  drawText(cloudReady ? '雲端留言  B' : '留言板  B', board.x+board.w/2, board.y+44, 18, 'center', cloudReady ? '#79d0b1' : '#f0a75c');
  drawPixelRect(116,190,40,130,'#3d2a32'); drawPixelRect(804,190,40,130,'#3d2a32');
  tables.forEach(t=>{drawPixelRect(t.x-40,t.y-22,80,44,'#694638');drawPixelRect(t.x-28,t.y-12,56,24,'#9b6844');drawPixelRect(t.x-7,t.y-8,14,16,'#fff4d8')});
  chairs.forEach(c=>{drawPixelRect(c.x-16,c.y-14,32,28,'#4f8f73');drawPixelRect(c.x-12,c.y-22,24,10,'#79d0b1')});
  drawPixelRect(400,500,160,28,'#5b3e4e'); drawText('漂浮咖啡船甲板',480,520,15);
}

function drawAvatar(a, isPlayer=false){
  const x=Math.round(a.x), y=Math.round(a.y);
  if(!isPlayer){
    ctx.strokeStyle = a.role === 'manager' ? '#f4d47a' : (a.role === 'cellist' ? '#8460c8' : '#f0a75c');
    ctx.lineWidth = 2;
    ctx.strokeRect(x-18, y-36, 36, 76);
  }
  if(a.barista){
    drawPixelRect(x-20,y-18,40,44,a.apron || '#fff4d8');
    drawPixelRect(x-14,y-10,28,10,'#fff4d8');
  }
  drawPixelRect(x-11,y+16,22,6,'#120b17');
  drawPixelRect(x-10,y-28,20,18,a.skin || '#f0c7a0');
  drawPixelRect(x-12,y-34,24,12,a.hair); drawPixelRect(x-16,y-30,8,18,a.hair); drawPixelRect(x+8,y-30,8,18,a.hair);
  if(a.role === 'manager'){ drawPixelRect(x-18,y-27,5,28,a.hair); drawPixelRect(x+13,y-27,5,28,a.hair); }
  drawPixelRect(x-14,y-8,28,28,a.shirt);
  drawPixelRect(x-20,y-4,6,18,a.skin || '#f0c7a0'); drawPixelRect(x+14,y-4,6,18,a.skin || '#f0c7a0');
  drawPixelRect(x-10,y+20,8,16,'#2a2634'); drawPixelRect(x+2,y+20,8,16,'#2a2634');
  drawPixelRect(x-5,y-20,4,4,'#21182a'); drawPixelRect(x+5,y-20,4,4,'#21182a');
  drawPixelRect(x-4,y-12,8,3,'#b86766');
  if(a.hasCoffee){drawPixelRect(x+17,y+3,10,12,'#fff4d8'); drawPixelRect(x+19,y+5,6,5,'#6d3f26')}
  if(a.barista){drawPixelRect(x-19,y+2,8,12,'#fff4d8'); drawPixelRect(x-17,y+4,4,5,'#6d3f26');}
  if(a.role === 'cellist') drawCello(x, y);
  if(a.role === 'joker') drawBeanMascot(x, y);
  drawText(a.title ? `${a.name}・${a.title}` : a.name, x, y-42, 13, 'center', isPlayer ? '#79d0b1' : '#fff4d8');
  if(a.emote && (a.emoteTimer === undefined || a.emoteTimer > 0)) drawText(a.emote, x, y-62, 22);
}

function drawCello(x, y){
  drawPixelRect(x+19,y-7,9,34,'#8a4a2a');
  drawPixelRect(x+16,y+2,15,22,'#a85f34');
  drawPixelRect(x+22,y-28,3,32,'#3a231a');
  drawPixelRect(x+12,y+2,3,33,'#fff4d8');
}

function drawBeanMascot(x, y){
  drawPixelRect(x-17,y-18,34,42,'#b98952');
  drawPixelRect(x-13,y-14,26,34,'#d7bb79');
  drawPixelRect(x-8,y-2,4,4,'#21182a');
  drawPixelRect(x+6,y-2,4,4,'#21182a');
  drawPixelRect(x-5,y+8,14,4,'#21182a');
}

function drawMessage(){
  if(world.messageTimer<=0) return;
  ctx.globalAlpha = Math.min(1, world.messageTimer/30);
  drawPixelRect(90,455,780,76,'#151020');
  ctx.strokeStyle='#76536a';ctx.lineWidth=3;ctx.strokeRect(90,455,780,76);
  drawText(world.message,480,500,18);
  ctx.globalAlpha = 1;
}

function spawnSparkles(){
  for(let i=0;i<18;i++) world.particles.push({x:player.x,y:player.y-28,vx:(Math.random()-.5)*3,vy:-Math.random()*2-1,life:45});
}
function drawParticles(){
  world.particles.forEach(p=>{drawPixelRect(p.x,p.y,4,4,'#ffe5ae');p.x+=p.vx;p.y+=p.vy;p.life--});
  world.particles = world.particles.filter(p=>p.life>0);
}

function tryMove(dx,dy){
  if(player.sitting && (dx||dy)) player.sitting = false;
  const next = {x:player.x+dx-13,y:player.y+dy-32,w:26,h:64};
  if(next.x<70 || next.x+next.w>890 || next.y<74 || next.y+next.h>545) return;
  for(const b of blocks) if(rectsOverlap(next,b)) return;
  for(const npc of npcs){
    const npcBody = {x:npc.x-18, y:npc.y-36, w:36, h:76};
    if(rectsOverlap(next, npcBody)) return;
  }
  player.x += dx; player.y += dy;
}
function updateMomo(){
  const momo = npcs.find(n=>n.barista);
  if(!momo) return;
  const dist = Math.hypot(player.x - momo.x, player.y - momo.y);
  if(dist < 105){
    momo.emote = player.hasCoffee ? '歡迎慢用' : '要喝什麼？';
    momo.emoteTimer = 999999;
    momo.dir = player.x > momo.x ? 'right' : 'left';
    if(Math.random() < 0.015) say('Momo 店長：歡迎登船，今天想喝哪一杯？靠近我按 C 看咖啡單。', 160);
    return;
  }
  if(momo.wait > 0){momo.wait--; return;}
  const dx = momo.targetX - momo.x;
  const dy = momo.targetY - momo.y;
  const d = Math.hypot(dx, dy);
  if(d < 3){
    momo.wait = 40 + Math.floor(Math.random()*80);
    momo.targetX = momoZone.x + Math.random()*momoZone.w;
    momo.targetY = momoZone.y + Math.random()*momoZone.h;
    momo.emote = Math.random() > .5 ? '☕' : '整理杯子';
    return;
  }
  momo.x += dx/d * 0.7;
  momo.y += dy/d * 0.7;
}

function update(){
  updateMomo();
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
  npcs.forEach(n=>drawAvatar(n)); drawAvatar(player,true); drawMessage();
}
function loop(){update();render();requestAnimationFrame(loop)}

function closeCoffeeMenu(){coffeeMenu.classList.add('hidden');}
function openCoffeeMenu(force=false){
  const momo = npcs.find(n=>n.barista);
  const closeToMomo = momo && near(player.x, player.y, momo.x, momo.y, 130);
  const closeToCounter = near(player.x, player.y, counter.x+counter.w/2, counter.y+counter.h+35, 170);
  if(!force && !closeToMomo && !closeToCounter){say('要靠近吧台或 Momo 店長，才能點咖啡喔。'); return;}
  renderCoffeeOptions();
  coffeeMenu.classList.remove('hidden');
  say('Momo 店長把咖啡單遞給你：今天想喝哪一杯？', 220);
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
  const momo = npcs.find(n=>n.barista);
  if(momo){momo.emote = '請慢用'; momo.emoteTimer = 999999;}
  closeCoffeeMenu();
  say(`Momo 店長為 ${player.name} 做好了一杯「${item.name}」。${item.desc}`, 320);
  spawnSparkles();
}
function orderCoffee(){openCoffeeMenu();}
function interactNPC(){
  const npc = npcs.find(n=>near(player.x, player.y, n.x, n.y, 82));
  if(!npc) return false;
  if(npc.role === 'manager'){
    say('Momo 店長：我是 Coffee Ship 的金髮店長。想點咖啡的話按 C，我幫你做。', 260);
    npc.emote = '☕'; npc.emoteTimer = 999999;
    return true;
  }
  if(npc.role === 'cellist'){
    const line = npc.talk[Math.floor(Math.random()*npc.talk.length)];
    npc.emote = '🎼'; npc.emoteTimer = 180;
    say(line, 300);
    spawnSparkles();
    return true;
  }
  if(npc.role === 'joker'){
    const joke = npc.jokes[Math.floor(Math.random()*npc.jokes.length)];
    npc.emote = '😂'; npc.emoteTimer = 180;
    say(joke, 320);
    return true;
  }
  return false;
}

function sitDown(){
  if(interactNPC()) return;
  const chair = chairs.find(c=>near(player.x,player.y,c.x,c.y,52));
  if(chair){player.x=chair.x;player.y=chair.y-10;player.sitting=true;player.emote='💭';player.emoteTimer=120;say(`${player.name} 坐下來休息。這裡很適合慢慢整理心情。`)}
  else say('靠近椅子後按 E 就能坐下。');
}

function emote(){player.emote = player.hasCoffee ? '☕✨' : '✨'; player.emoteTimer=95; say(`${player.name} 發出了一個小小的表情。`); spawnSparkles();}

function getLocalMessages(){
  try{return JSON.parse(localStorage.getItem('coffeeShipMessages') || '[]')}catch(e){return []}
}
function saveLocalMessages(messages){localStorage.setItem('coffeeShipMessages', JSON.stringify(messages.slice(-50)));}
function getMessages(){return cloudReady ? cachedMessages : getLocalMessages();}
function escapeHtml(text=''){
  return String(text).replace(/[&<>\"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch] || ch));
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
  player.name = document.getElementById('playerName').value.trim() || 'Guest';
  player.hair = document.getElementById('hairColor').value;
  player.shirt = document.getElementById('shirtColor').value;
  player.coffeeType = document.getElementById('coffeeType').value;
  localStorage.setItem('coffeeShipAvatar', JSON.stringify({name:player.name,hair:player.hair,shirt:player.shirt,coffeeType:player.coffeeType}));
  creator.classList.add('hidden'); gamePanel.classList.remove('hidden'); avatarName.textContent = player.name;
  statusText.textContent = cloudReady ? '雲端已連線' : '本機模式'; moodDot.style.background = cloudReady ? '#79d0b1' : '#f0a75c'; moodDot.style.color = moodDot.style.background;
  say(`歡迎 ${player.name} 登上 Coffee Ship。Momo 是金髮店長；Peak 會演奏大提琴；Bean 會講笑話。靠近 NPC 按 E 可互動。`, 360);
});

const saved = localStorage.getItem('coffeeShipAvatar');
if(saved){try{const s=JSON.parse(saved); document.getElementById('playerName').value=s.name||''; document.getElementById('hairColor').value=s.hair||'#2b1d16'; document.getElementById('shirtColor').value=s.shirt||'#c96a4a'; document.getElementById('coffeeType').value=s.coffeeType||'美式';}catch(e){}}

window.addEventListener('keydown',e=>{
  const k=e.key.length===1?e.key.toLowerCase():e.key; keys.add(k);
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
  if(k==='c') orderCoffee(); if(k==='e') sitDown(); if(k==='b') openBoard(); if(e.code==='Space') emote();
});
window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));

document.querySelectorAll('[data-move]').forEach(btn=>{
  const d=btn.dataset.move;
  const on=()=>mobile[d]=true, off=()=>mobile[d]=false;
  btn.addEventListener('pointerdown',on); btn.addEventListener('pointerup',off); btn.addEventListener('pointerleave',off);
});
document.getElementById('coffeeBtn').onclick=()=>openCoffeeMenu(true);
document.getElementById('sitBtn').onclick=sitDown;
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
