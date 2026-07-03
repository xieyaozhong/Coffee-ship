(() => {
  'use strict';

  const mutants = [
    ['👁','百眼鮟鱇','傳說','身上長滿眼睛',40,180,3],
    ['🦈','雙頭巨齒鯊','神話','有機率吃掉更多漁獲',3000,16000,9],
    ['🐙','深淵裂口章魚','神話','八條嘴巴',600,4800,5],
    ['🐟','發光骷髏魚','史詩','全身骨骼會發光',2,18,1],
    ['🦀','水晶帝王蟹','傳說','高珍珠價值',8,55,1],
    ['🐡','毒刺河豚王','史詩','背包短暫中毒特效',4,28,1],
    ['🦐','深海鐮刀蝦','稀有','巨大鐮刀前肢',0.6,4.8,0],
    ['🦑','黑洞烏賊','神話','周圍會變暗',120,900,4],
    ['🐋','腐化藍鯨','神話','超過 100 噸',100000,220000,6],
    ['🦈','深淵吞噬者','神話','最高級掠食者',2000,13000,12],
    ['🐍','海淵蛇皇','傳說','超長蛇形生物',300,2200,2],
    ['🦞','熔岩龍蝦','傳說','身體像岩漿',6,38,1],
    ['🐠','星核蝶魚','傳說','星光粒子特效',1.5,9.5,0],
    ['🐙','血月水母王','神話','紅色發光',80,680,3],
    ['🐚','詛咒寄居蟹','史詩','殼像人臉',2,18,1],
    ['🐟','深海夢魘鰻','傳說','會發出低鳴',25,190,2],
    ['🦀','千足海蜘蛛','神話','巨型海蜘蛛',90,720,4],
    ['🐋','虛空鯨','神話','半透明身體',900,9000,5],
    ['🐉','利維坦幼體','神話','極低機率出現',5000,30000,8],
    ['👑','克蘇魯之眼','世界級','全服公告、FishDex 特殊頁面、重量無上限',999999,9999999,15]
  ];
  const colors = { '稀有':'#79d0b1', '史詩':'#e9a6b0', '傳說':'#ffe16b', '神話':'#ffffff', '世界級':'#ff5f9e' };
  let lock = false;

  function isDeckOpen(){ const d=document.getElementById('deckOverlay'); return d && !d.classList.contains('hidden'); }
  function read(key, fallback){ try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch(e){ return fallback; } }
  function save(key, value){ localStorage.setItem(key, JSON.stringify(value)); }

  function addStyle(){
    if(document.getElementById('mutantCreatureStyle')) return;
    const s=document.createElement('style');
    s.id='mutantCreatureStyle';
    s.textContent='.mutant-card{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);z-index:49;background:rgba(5,8,18,.98);border:3px solid #ff5f9e;border-radius:18px;padding:16px;color:#fff4d8;text-align:center;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.36),0 0 34px rgba(255,95,158,.45);line-height:1.55;max-width:92%;pointer-events:none}.mutant-card.hidden{display:none}.mutant-name{font-size:24px;margin-bottom:8px}.mutant-trait{margin-top:10px;padding:10px;border:2px solid #76536a;border-radius:12px;background:#101827;text-align:left}@media(max-width:760px){.mutant-card{position:fixed;top:38%;width:min(88vw,370px);max-height:58dvh;overflow-y:auto;padding:14px}}';
    document.head.appendChild(s);
  }
  function ensureCard(){ const p=document.getElementById('gamePanel'); if(!p||document.getElementById('mutantCard')) return; if(getComputedStyle(p).position==='static') p.style.position='relative'; const c=document.createElement('div'); c.id='mutantCard'; c.className='mutant-card hidden'; p.appendChild(c); }

  function pick(){
    const r=Math.random();
    let pool=mutants.filter(x=>x[2]==='稀有'||x[2]==='史詩');
    if(r>.62) pool=mutants.filter(x=>x[2]==='傳說');
    if(r>.88) pool=mutants.filter(x=>x[2]==='神話');
    if(r>.992) pool=mutants.filter(x=>x[2]==='世界級');
    return pool[Math.floor(Math.random()*pool.length)];
  }

  function eatBag(count){
    if(!count) return [];
    let bag=read('coffeeShipFishBag', []);
    const edible=bag.filter(x=>x&&x.kind!=='trash'&&x.kind!=='letter');
    const keep=bag.filter(x=>!x||x.kind==='trash'||x.kind==='letter');
    const eaten=[];
    for(let i=0;i<count&&edible.length;i++){
      const idx=Math.floor(Math.random()*edible.length);
      eaten.push(edible.splice(idx,1)[0]);
    }
    save('coffeeShipFishBag', keep.concat(edible).slice(-80));
    return eaten;
  }

  function priceOf(m, weight){
    const mult={稀有:25,史詩:80,傳說:240,神話:900,世界級:9999}[m[2]]||20;
    return Math.round(Math.min(999999, Math.max(1, weight)*mult));
  }

  function show(){
    const card=document.getElementById('mutantCard'); if(!card) return;
    const m=pick();
    const weight=m[4]+Math.random()*(m[5]-m[4]);
    const eaten=eatBag(m[6]);
    const dex=read('coffeeShipMutantDex', {});
    dex[m[1]]=Math.max(dex[m[1]]||0, Number(weight.toFixed(2)));
    save('coffeeShipMutantDex', dex);
    const bag=read('coffeeShipFishBag', []);
    bag.push({name:m[1], zone:'深淵變異', rarity:m[2], quality:'變異', weight, kind:'mutant', icon:m[0], trait:m[3], at:Date.now()});
    save('coffeeShipFishBag', bag.slice(-80));
    const color=colors[m[2]]||'#fff4d8';
    const lost=eaten.length?`<br><br>吞噬副作用：${eaten.length} 件背包漁獲被吃掉`:'<br><br>沒有漁獲被吃掉';
    card.innerHTML=`<div class="mutant-name" style="color:${color}">${m[0]} ${m[1]}</div><div>類型：深淵變異生物<br>稀有度：${m[2]}<br>重量：${m[2]==='世界級'?'∞':weight.toFixed(2)+' kg'}<br>價值：約 ${priceOf(m,weight)} 珍珠</div><div class="mutant-trait">特性：${m[3]}${lost}<br>變異圖鑑：${Object.keys(dex).length}/20</div>`;
    card.classList.remove('hidden');
    setTimeout(()=>card.classList.add('hidden'), m[2]==='世界級'?8600:6200);
  }

  function tryMutant(e){
    if(!isDeckOpen()||lock) return false;
    if(Math.random()>.12) return false;
    lock=true;
    e?.preventDefault?.(); e?.stopImmediatePropagation?.();
    setTimeout(()=>{ show(); lock=false; }, 850+Math.random()*1100);
    return true;
  }

  function bind(){
    window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(k==='f'||k==='c')tryMutant(e);},true);
    document.getElementById('coffeeBtn')?.addEventListener('click',e=>tryMutant(e),true);
  }
  function init(){ addStyle(); ensureCard(); bind(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();