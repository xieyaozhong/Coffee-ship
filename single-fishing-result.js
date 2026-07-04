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
  const sharks = [
    {icon:'🦈',name:'礁鯊',rarity:'常見',min:1,max:1,mode:'random',note:'只咬走一條最靠近袋口的小魚。'},
    {icon:'🦈',name:'鎚頭鯊',rarity:'常見',min:1,max:2,mode:'random',note:'撞翻魚桶，隨機損失少量漁獲。'},
    {icon:'🦈',name:'虎鯊',rarity:'稀有',min:2,max:4,mode:'random',note:'什麼都吃，會亂咬背包裡的魚。'},
    {icon:'🦈',name:'大白鯊',rarity:'史詩',min:2,max:5,mode:'heaviest',note:'專挑最重的魚下口。'},
    {icon:'🦈',name:'幽靈鯊',rarity:'史詩',min:1,max:3,mode:'rare',note:'只盯上稀有以上的魚，普通魚反而安全。'},
    {icon:'🦈',name:'剪影鯊群',rarity:'傳說',min:4,max:7,mode:'random',note:'一整群黑影從船底掠過，魚桶被撕開。'},
    {icon:'🦈',name:'雙頭巨齒鯊',rarity:'神話',min:5,max:9,mode:'heaviest',note:'兩張巨口同時咬下，損失大量高重量漁獲。'},
    {icon:'🦈',name:'深淵吞噬者',rarity:'神話',min:8,max:14,mode:'random',note:'牠不是捕食，是清空。普通與常見魚會大量消失。'},
    {icon:'🦈',name:'黑潮古鯊',rarity:'神話',min:3,max:6,mode:'valuable',note:'牠像知道價值一樣，優先帶走高稀有度漁獲。'},
    {icon:'👑',name:'巨齒鯊王',rarity:'世界級',min:10,max:20,mode:'half',note:'海面裂開，牠吞掉背包中約一半魚類，但留下王者巨齒。',drop:true}
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
    s.textContent='.central-fish-card{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);z-index:13600;background:rgba(21,16,32,.98);border:3px solid #76536a;border-radius:18px;padding:16px;color:#fff4d8;text-align:center;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.32);line-height:1.6;max-width:92%;pointer-events:none}.central-fish-card.hidden{display:none}.central-fish-title{font-size:23px;margin-bottom:8px}.central-fish-detail{padding:10px;border:2px solid #76536a;border-radius:12px;background:#171020}.shark-loss-list{margin-top:8px;text-align:left;max-height:150px;overflow:auto}@media(max-width:760px){.central-fish-card{position:fixed;top:36%;width:min(90vw,390px);max-height:56dvh;overflow-y:auto;padding:14px}.shark-loss-list{max-height:28dvh}}';
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
  function sharkScore(item){ const r={普通:1,常見:2,稀有:4,史詩:7,傳說:11,神話:16,世界級:25}[item.rarity]||1; return r * Math.max(1, Number(item.weight||1)); }
  function sharkTargets(fishItems, shark, count){
    let pool = fishItems.slice();
    if (shark.mode === 'rare') pool = pool.filter(o => !['普通','常見'].includes(o.x.rarity)) || pool;
    if (!pool.length) pool = fishItems.slice();
    if (shark.mode === 'heaviest') pool.sort((a,b)=>(b.x.weight||0)-(a.x.weight||0));
    else if (shark.mode === 'valuable') pool.sort((a,b)=>sharkScore(b.x)-sharkScore(a.x));
    else if (shark.mode === 'half') count = Math.max(count, Math.ceil(fishItems.length/2));
    const eaten=[];
    while(pool.length && eaten.length<count){
      const pick = (shark.mode === 'random' || shark.mode === 'rare') ? pool.splice(Math.floor(Math.random()*pool.length),1)[0] : pool.shift();
      if(pick && !eaten.some(e=>e.i===pick.i)) eaten.push(pick);
    }
    return eaten;
  }
  function shark(){
    const shark = choice(sharks);
    const bag=read('coffeeShipFishBag',[]);
    const fishItems=bag.map((x,i)=>({x,i})).filter(o=>o.x&&o.x.kind==='fish');
    const wanted = shark.min + Math.floor(Math.random()*(shark.max-shark.min+1));
    const eaten = sharkTargets(fishItems, shark, Math.min(wanted, fishItems.length));
    const eatenIdx = eaten.map(e=>e.i);
    const next=bag.filter((_,i)=>!eatenIdx.includes(i));
    if (shark.drop) next.push({name:'巨齒鯊王之牙',zone:'鯊魚事件',rarity:'神話',quality:'戰利品',weight:3+Math.random()*8,kind:'treasure',icon:'🦷',at:now()});
    save('coffeeShipFishBag',next.slice(-120));
    const lost = eaten.length ? `<div class="shark-loss-list">${eaten.map(e=>`・${e.x.quality || ''} ${e.x.name}（${Number(e.x.weight||0).toFixed(2)} kg）`).join('<br>')}</div>` : '<br>但背包裡沒有魚可以被吃掉。';
    const drop = shark.drop ? '<br>獲得：🦷 巨齒鯊王之牙' : '';
    show(`${shark.icon} ${shark.name}`, `稀有度：${shark.rarity}<br>${shark.note}<br><br>損失漁獲：${eaten.length} 件${lost}${drop}`, shark.rarity==='世界級'?7600:6200);
  }
  function mermaid(){
    const bag=read('coffeeShipFishBag',[]); const amount=80+Math.floor(Math.random()*121); bag.push({name:`${amount} 珍珠`,kind:'currency',icon:'🦪',amount,zone:'美人魚贈禮',rarity:'稀有',quality:'貨幣',at:now()}); save('coffeeShipFishBag',bag.slice(-120));
    show('🧜‍♀️ 美人魚事件', `海面亮起藍色光芒，美人魚唱完一小段歌後潛回海裡。<br>獲得：🦪 ${amount} 珍珠`, 6200);
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