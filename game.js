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

const keys = new Set();
const mobile = { up:false, down:false, left:false, right:false };

const world = {
  tile: 48,
  w: 960,
  h: 576,
  message: '歡迎來到 Coffee Ship。靠近吧台按 C 點咖啡。',
  messageTimer: 260,
  particles: []
};

const player = {
  name: 'Guest', x: 480, y: 360, speed: 2.4, dir: 'down',
  hair: '#2b1d16', shirt: '#c96a4a', skin:'#f0c7a0', coffeeType:'美式',
  hasCoffee:false, sitting:false, emote:null, emoteTimer:0
};

const npcs = [
  {name:'Momo', x:260, y:250, hair:'#5b2b1e', shirt:'#79d0b1', emote:'☕'},
  {name:'Peak', x:705, y:332, hair:'#1f1930', shirt:'#8460c8', emote:'♪'},
  {name:'Bean', x:755, y:180, hair:'#e0b45d', shirt:'#d7bb79', emote:'...'}
];

const chairs = [
  {x:260,y:360},{x:324,y:360},{x:650,y:360},{x:714,y:360},{x:745,y:236},{x:210,y:236}
];
const tables = [{x:290,y:400},{x:680,y:400},{x:730,y:276},{x:195,y:276}];
const counter = {x:120,y:96,w:360,h:88};
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
  drawPixelRect(116,190,40,130,'#3d2a32'); drawPixelRect(804,190,40,130,'#3d2a32');
  tables.forEach(t=>{drawPixelRect(t.x-40,t.y-22,80,44,'#694638');drawPixelRect(t.x-28,t.y-12,56,24,'#9b6844');drawPixelRect(t.x-7,t.y-8,14,16,'#fff4d8')});
  chairs.forEach(c=>{drawPixelRect(c.x-16,c.y-14,32,28,'#4f8f73');drawPixelRect(c.x-12,c.y-22,24,10,'#79d0b1')});
  drawPixelRect(400,500,160,28,'#5b3e4e'); drawText('漂浮咖啡船甲板',480,520,15);
}

function drawAvatar(a, isPlayer=false){
  const x=Math.round(a.x), y=Math.round(a.y);
  drawPixelRect(x-11,y+16,22,6,'#120b17');
  drawPixelRect(x-10,y-28,20,18,a.skin || '#f0c7a0');
  drawPixelRect(x-12,y-34,24,12,a.hair); drawPixelRect(x-14,y-28,6,12,a.hair); drawPixelRect(x+8,y-28,6,12,a.hair);
  drawPixelRect(x-14,y-8,28,28,a.shirt);
  drawPixelRect(x-20,y-4,6,18,a.skin || '#f0c7a0'); drawPixelRect(x+14,y-4,6,18,a.skin || '#f0c7a0');
  drawPixelRect(x-10,y+20,8,16,'#2a2634'); drawPixelRect(x+2,y+20,8,16,'#2a2634');
  drawPixelRect(x-5,y-20,4,4,'#21182a'); drawPixelRect(x+5,y-20,4,4,'#21182a');
  drawPixelRect(x-4,y-12,8,3,'#b86766');
  if(a.hasCoffee){drawPixelRect(x+17,y+3,10,12,'#fff4d8'); drawPixelRect(x+19,y+5,6,5,'#6d3f26')}
  drawText(a.name, x, y-42, 13, 'center', isPlayer ? '#79d0b1' : '#fff4d8');
  if(a.emote && (a.emoteTimer === undefined || a.emoteTimer > 0)) drawText(a.emote, x, y-62, 22);
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
  player.x += dx; player.y += dy;
}
function update(){
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

function orderCoffee(){
  if(near(player.x, player.y, counter.x+counter.w/2, counter.y+counter.h+35, 150)){
    player.hasCoffee = true; player.emote='☕'; player.emoteTimer=90; coffeeBadge.textContent = `手上有一杯${player.coffeeType}`; say(`${player.name} 點了一杯${player.coffeeType}。咖啡香在船上漂起來了。`); spawnSparkles();
  } else say('要靠近吧台才能點咖啡喔。');
}
function sitDown(){
  const chair = chairs.find(c=>near(player.x,player.y,c.x,c.y,52));
  if(chair){player.x=chair.x;player.y=chair.y-10;player.sitting=true;player.emote='💭';player.emoteTimer=120;say(`${player.name} 坐下來休息。這裡很適合慢慢整理心情。`)}
  else say('靠近椅子後按 E 就能坐下。');
}
function emote(){player.emote = player.hasCoffee ? '☕✨' : '✨'; player.emoteTimer=95; say(`${player.name} 發出了一個小小的表情。`); spawnSparkles();}

startBtn.addEventListener('click',()=>{
  player.name = document.getElementById('playerName').value.trim() || 'Guest';
  player.hair = document.getElementById('hairColor').value;
  player.shirt = document.getElementById('shirtColor').value;
  player.coffeeType = document.getElementById('coffeeType').value;
  localStorage.setItem('coffeeShipAvatar', JSON.stringify({name:player.name,hair:player.hair,shirt:player.shirt,coffeeType:player.coffeeType}));
  creator.classList.add('hidden'); gamePanel.classList.remove('hidden'); avatarName.textContent = player.name;
  statusText.textContent = '已登船'; moodDot.style.background = '#79d0b1'; moodDot.style.color = '#79d0b1';
  say(`歡迎 ${player.name} 登上 Coffee Ship。先去吧台按 C 點一杯咖啡吧。`, 300);
});

const saved = localStorage.getItem('coffeeShipAvatar');
if(saved){try{const s=JSON.parse(saved); document.getElementById('playerName').value=s.name||''; document.getElementById('hairColor').value=s.hair||'#2b1d16'; document.getElementById('shirtColor').value=s.shirt||'#c96a4a'; document.getElementById('coffeeType').value=s.coffeeType||'美式';}catch(e){}}

window.addEventListener('keydown',e=>{
  const k=e.key.length===1?e.key.toLowerCase():e.key; keys.add(k);
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
  if(k==='c') orderCoffee(); if(k==='e') sitDown(); if(e.code==='Space') emote();
});
window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));

document.querySelectorAll('[data-move]').forEach(btn=>{
  const d=btn.dataset.move;
  const on=()=>mobile[d]=true, off=()=>mobile[d]=false;
  btn.addEventListener('pointerdown',on); btn.addEventListener('pointerup',off); btn.addEventListener('pointerleave',off);
});
document.getElementById('coffeeBtn').onclick=orderCoffee;
document.getElementById('sitBtn').onclick=sitDown;
document.getElementById('emoteBtn').onclick=emote;

loop();
