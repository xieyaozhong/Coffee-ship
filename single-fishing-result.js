(() => {
  'use strict';

  let lockedUntil = 0;
  const visibleIds = [
    'centralFishResultCard','fishingCard','fishingSpecialCard','extraFish50Card','sharkCard','mutantCard','mermaidCard',
    'lanarCard','arielCard','islandCard','blackbeardCard','madPriestCard','carnivalCard'
  ];

  const fish = [
    ['晨霧銀魚','近海','普通',0.04,0.25],['檸檬小鯛','近海','普通',0.12,0.65],['奶茶雀魚','近海','普通',0.05,0.28],['玻璃小魚','近海','普通',0.03,0.2],['港燈鰆魚','港口','常見',0.8,3.4],['咖啡紋鱸','港口','常見',1.0,4.8],['白帆石斑','港口','常見',1.5,6.5],['夜燈鯉','夜海','稀有',0.6,3.2],['星露鰻','夜海','稀有',1.2,7.8],['紫霧魟','夜海','稀有',2.5,12],['深海琥珀魚','深海','史詩',8,36],['古鐘鮟鱇','深海','史詩',12,66],['晨星龍魚','傳說','傳說',35,180],['海神白鯨','傳說','傳說',220,1100]
  ];
  const items = [
    ['🗑️','漂流塑膠袋','普通',0.01,0.04,'海底垃圾'],['🗑️','破吸管','普通',0.01,0.03,'海底垃圾'],['🗑️','生鏽瓶蓋','普通',0.02,0.08,'海底垃圾'],['🪢','舊船繩','常見',0.5,2,'海底物品'],['🎭','狂歡面具','稀有',0.2,0.8,'狂歡島遺失物'],['👒','華麗羽毛帽','稀有',0.1,0.4,'狂歡島遺失物'],['💍','鍍金戒指','稀有',0.01,0.05,'海底物品'],['🪞','裂開的化妝鏡','稀有',0.3,0.9,'狂歡島遺失物']
  ];
  const letters = [
    ['coffeeShipBottleLetters','🍾','普通瓶中信','不要急著抵達終點，船上的風、咖啡與朋友，本身就是旅程。'],
    ['coffeeShipLanarLetters','🌊','拉納爾漂流瓶','海洋學家拉納爾記下海獸的影子：牠從船底游過時，整片海像被翻到背面。'],
    ['coffeeShipArielLetters','🧜‍♀️','愛麗兒漂流瓶','我曾以為失去聲音就能換來愛，後來才知道，沉默只會讓不愛你的人更容易離開。'],
    ['coffeeShipBlackbeardLetters','🏴‍☠️','黑鬍子藏寶圖','老子把寶藏埋在黑礁石底下，敢挖就看你有沒有命帶走。'],
    ['coffeeShipMadPriestLetters','📜','瘋狂神父殘頁','潮聲不是潮聲，是祂在紙背後呼吸。不要回答海上的歌聲。'],
    ['coffeeShipCarnivalLetters','🎭','狂歡島漂流瓶','如果你在海上看見燈火、聽見笑聲、聞到甜味，請立刻轉舵。']
  ];

  function now(){ return Date.now(); }
  function read(key, fallback){ try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch(e){ return fallback; } }
  function save(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
  function isDeckOpen(){ const d=document.getElementById('deckOverlay'); return d && !d.classList.contains('hidden'); }
  function isFishingInput(event){
    if (!isDeckOpen()) return false;
    if (event.type === 'keydown') { const k = event.key && event.key.length === 1 ? event.key.toLowerCase() : event.key; return k === 'f' || k === 'c'; }
    if (event.type === 'click' || event.type === 'pointerdown' || event.type === 'touchstart') return !!(event.target && event.target.closest && event.target.closest('#coffeeBtn'));
    return false;
  }
  function hasVisibleResult(){ return visibleIds.some(id => { const el=document.getElementById(id); return el && !el.classList.contains('hidden'); }); }
  function clearAll(){ visibleIds.forEach(id => { const el=document.getElementById(id); if(el) el.classList.add('hidden'); }); document.querySelectorAll('.rare-catch-overlay').forEach(x=>x.remove()); }
  function locked(){ return now() < lockedUntil || hasVisibleResult(); }
  function choice(list){ return list[Math.floor(Math.random()*list.length)]; }
  function weighted(table){ let r=Math.random()*table.reduce((s,x)=>s+x[1],0); for(const x of table){ r-=x[1]; if(r<=0) return x[0]; } return table[0][0]; }

  function addStyle(){
    if(document.getElementById('centralFishingResultStyle')) return;
    const s=document.createElement('style');
    s.id='centralFishingResultStyle';
    s.textContent='.central-fish-card{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);z-index:13600;background:rgba(21,16,32,.98);border:3px solid #76536a;border-radius:18px;padding:16px;color:#fff4d8;text-align:center;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.32);line-height:1.6;max-width:92%;pointer-events:none}.central-fish-card.hidden{display:none}.central-fish-title{font-size:23px;margin-bottom:8px}.central-fish-detail{padding:10px;border:2px solid #76536a;border-radius:12px;background:#171020}@media(max-width:760px){.central-fish-card{position:fixed;top:36%;width:min(90vw,390px);max-height:56dvh;overflow-y:auto;padding:14px}}';
    document.head.appendChild(s);
  }
  function card(){ const p=document.getElementById('gamePanel'); if(!p) return null; let c=document.getElementById('centralFishResultCard'); if(!c){ if(getComputedStyle(p).position==='static') p.style.position='relative'; c=document.createElement('div'); c.id='centralFishResultCard'; c.className='central-fish-card hidden'; p.appendChild(c); } return c; }
  function show(title, detail, ms=4600){ const c=card(); if(!c) return; c.innerHTML=`<div class="central-fish-title">${title}</div><div class="central-fish-detail">${detail}</div>`; c.classList.remove('hidden'); lockedUntil=now()+ms; setTimeout(()=>c.classList.add('hidden'),ms); }

  function addFish(){
    const f=choice(fish); const q=weighted([['普通',55],['優秀',25],['完美',13],['閃亮',5],['神話',2]]); const mult={普通:1,優秀:1.15,完美:1.3,閃亮:1.55,神話:1.9}[q]; const w=(f[3]+Math.random()*(f[4]-f[3]))*mult;
    const item={name:f[0],zone:f[1],rarity:f[2],quality:q,weight:w,kind:'fish',icon:'🐟',at:now()}; const bag=read('coffeeShipFishBag',[]); bag.push(item); save('coffeeShipFishBag',bag.slice(-120)); const dex=read('coffeeShipFishDex',{}); dex[item.name]=Math.max(dex[item.name]||0,Number(w.toFixed(2))); save('coffeeShipFishDex',dex);
    show(`🐟 ${q} ${f[0]}`, `類型：魚類<br>海域：${f[1]}<br>稀有度：${f[2]}<br>重量：${w.toFixed(2)} kg`);
  }
  function addItem(){
    const it=choice(items); const w=it[3]+Math.random()*(it[4]-it[3]); const item={name:it[1],zone:it[5],rarity:it[2],quality:'拾獲',weight:w,kind:'treasure',icon:it[0],at:now()}; const bag=read('coffeeShipFishBag',[]); bag.push(item); save('coffeeShipFishBag',bag.slice(-120));
    show(`${it[0]} ${it[1]}`, `類型：物品 / 海底垃圾<br>來源：${it[5]}<br>稀有度：${it[2]}<br>重量：${w.toFixed(2)} kg`);
  }
  function addLetter(){
    const l=choice(letters); const list=read(l[0],[]); const title=`${l[2]} ${list.length+1}`; const text=l[3]; list.push({title,text,at:now()}); save(l[0],list.slice(-60));
    show(`${l[1]} ${title}`, `類型：瓶中信<br><br>${text}`, 6200);
  }
  function shark(){
    const bag=read('coffeeShipFishBag',[]); const fishItems=bag.map((x,i)=>({x,i})).filter(o=>o.x&&o.x.kind==='fish'); const eat=Math.min(fishItems.length,1+Math.floor(Math.random()*4)); const eaten=[]; for(let i=0;i<eat;i++){ const pick=fishItems.splice(Math.floor(Math.random()*fishItems.length),1)[0]; if(pick) eaten.push(pick.i); } const next=bag.filter((_,i)=>!eaten.includes(i)); save('coffeeShipFishBag',next);
    show('🦈 鯊魚事件', `鯊魚衝上甲板旁的海面！<br>背包漁獲被吃掉：${eat} 件`, 5600);
  }
  function mermaid(){
    const pearls=Number(localStorage.getItem('coffeeShipPearls')||'0')+80+Math.floor(Math.random()*121); localStorage.setItem('coffeeShipPearls',String(pearls));
    show('🧜‍♀️ 美人魚事件', `海面亮起藍色光芒，美人魚唱完一小段歌後潛回海裡。<br>獲得珍珠：${pearls}（已更新）`, 6200);
  }

  function roll(){
    const r=Math.random()*100;
    if(r<4) return shark();
    if(r<6) return mermaid();
    if(r<75) return addFish();
    if(r<93) return addItem();
    return addLetter();
  }

  function handle(event){
    if(!isFishingInput(event)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if(locked()) return;
    clearAll(); lockedUntil=now()+2000; setTimeout(roll,450);
  }

  function init(){ addStyle(); ['keydown','click','pointerdown','touchstart'].forEach(t=>window.addEventListener(t,handle,true)); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();