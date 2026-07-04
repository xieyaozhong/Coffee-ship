(() => {
  'use strict';

  const fish = [
    ['晨霧銀魚','近海','普通',0.04,0.25],['檸檬小鯛','近海','普通',0.12,0.65],['奶茶雀魚','近海','普通',0.05,0.28],['粉泡小魚','近海','普通',0.03,0.2],['綠藻小魨','近海','普通',0.08,0.42],['貝殼斑魚','近海','普通',0.06,0.35],['小月尾魚','近海','普通',0.05,0.3],['木匙魚','近海','普通',0.1,0.55],['霜白小鯡','近海','普通',0.08,0.5],['漂浮葉魚','近海','普通',0.04,0.22],
    ['港燈鰆魚','港口','常見',0.8,3.4],['煤灰鯔魚','港口','常見',0.6,2.8],['銅斑鯛','港口','常見',0.5,2.2],['咖啡紋鱸','港口','常見',1.0,4.8],['薄荷飛魚','港口','常見',0.25,1.1],['烤糖秋刀','港口','常見',0.2,0.9],['白帆石斑','港口','常見',1.5,6.5],['小船影魚','港口','常見',0.4,1.8],['銹錨鯰','港口','常見',0.9,5.2],['海鹽扁魚','港口','常見',0.7,3.3],
    ['夜燈鯉','夜海','稀有',0.6,3.2],['星露鰻','夜海','稀有',1.2,7.8],['紫霧魟','夜海','稀有',2.5,12],['月石河豚','夜海','稀有',0.7,4.5],['藍焰小鯊','夜海','稀有',4,22],['水晶鱈魚','夜海','稀有',1.5,8.5],['銀鈴魷','夜海','稀有',0.5,3.5],['夜櫻蝶魚','夜海','稀有',0.2,1.2],['星河紅魚','夜海','稀有',0.9,5.6],['暗潮尖嘴魚','夜海','稀有',1.8,9.8],
    ['深海琥珀魚','深海','史詩',8,36],['古鐘鮟鱇','深海','史詩',12,66],['藍晶皇帶','深海','史詩',10,52],['黑曜石鯛','深海','史詩',6,30],['銀冠章魚','深海','史詩',18,95],['深眠鯨幼體','深海','史詩',80,420],['幽火燈籠魚','深海','史詩',5,28],['巨牙鰻','深海','史詩',22,120],['虹骨魷魚','深海','史詩',9,48],['沉月石斑','深海','史詩',14,75],
    ['晨星龍魚','傳說','傳說',35,180],['金翼旗魚','傳說','傳說',45,240],['海神白鯨','傳說','傳說',220,1100],['紅蓮鮪王','傳說','傳說',70,360],['蒼穹飛鱗魚','傳說','傳說',18,95],['寶石海馬王','傳說','傳說',2,12],['銀月海龍','傳說','傳說',60,310],['幽藍王鯊','傳說','傳說',180,900],['星冠翻車魚','傳說','傳說',120,680],['黃昏海皇魚','傳說','傳說',90,520]
  ];
  const weight = { '普通':50, '常見':30, '稀有':14, '史詩':5, '傳說':1 };
  const q = [['普通',55,1],['優秀',25,1.15],['完美',13,1.3],['閃亮',5,1.55],['神話',2,1.9]];
  const color = { '普通':'#fff4d8', '常見':'#9ce8f0', '稀有':'#79d0b1', '史詩':'#e9a6b0', '傳說':'#ffe16b' };
  let lock = false;

  function isDeckOpen(){ const d=document.getElementById('deckOverlay'); return d && !d.classList.contains('hidden'); }
  function read(key, fb){ try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fb));}catch(e){return fb;} }
  function save(key,v){ localStorage.setItem(key, JSON.stringify(v)); }
  function choose(map){ const total=Object.values(map).reduce((a,b)=>a+b,0); let r=Math.random()*total; for(const [k,w] of Object.entries(map)){ r-=w; if(r<=0)return k; } return Object.keys(map)[0]; }
  function chooseQ(){ const total=q.reduce((a,b)=>a+b[1],0); let r=Math.random()*total; for(const x of q){ r-=x[1]; if(r<=0)return x; } return q[0]; }
  function price(item){ const rm={普通:2,常見:4,稀有:10,史詩:28,傳說:120}[item.rarity]||2; const qm={普通:1,優秀:1.4,完美:2,閃亮:3.5,神話:6}[item.quality]||1; return Math.max(1, Math.round(item.weight*rm*qm)); }

  function addStyle(){
    if(document.getElementById('extraFish50Style')) return;
    const s=document.createElement('style');
    s.id='extraFish50Style';
    s.textContent='.extra-fish-card{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);z-index:45;background:rgba(21,16,32,.97);border:3px solid #79d0b1;border-radius:18px;padding:16px;color:#fff4d8;text-align:center;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.28);pointer-events:none;line-height:1.55;max-width:92%}.extra-fish-card.hidden{display:none}@media(max-width:760px){.extra-fish-card{position:fixed;top:36%;width:min(90vw,370px);max-height:56dvh;overflow-y:auto;padding:14px;z-index:13500}}';
    document.head.appendChild(s);
  }
  function ensureCard(){ const p=document.getElementById('gamePanel'); if(!p||document.getElementById('extraFish50Card')) return; if(getComputedStyle(p).position==='static') p.style.position='relative'; const c=document.createElement('div'); c.id='extraFish50Card'; c.className='extra-fish-card hidden'; p.appendChild(c); }

  function showCatch(){
    const card=document.getElementById('extraFish50Card'); if(!card)return;
    const r=choose(weight); const list=fish.filter(f=>f[2]===r); const f=list[Math.floor(Math.random()*list.length)]; const qu=chooseQ();
    const w=(f[3]+Math.pow(Math.random(),1.6)*(f[4]-f[3]))*qu[2];
    const item={name:f[0],zone:f[1],rarity:r,quality:qu[0],weight:w,kind:'fish',at:Date.now()};
    const bag=read('coffeeShipFishBag',[]); bag.push(item); save('coffeeShipFishBag',bag.slice(-80));
    const dex=read('coffeeShipFishDex',{}); dex[item.name]=Math.max(dex[item.name]||0,Number(w.toFixed(2))); save('coffeeShipFishDex',dex);
    card.innerHTML=`<div style="font-size:22px;color:${color[r]||'#fff4d8'}">🐟 ${qu[0]} ${f[0]}</div><div>海域：${f[1]}<br>稀有度：${r}<br>重量：${w.toFixed(2)} kg<br>價值：${price(item)} 珍珠<br>新增魚種收集：${Object.keys(dex).length}</div>`;
    card.classList.remove('hidden');
    setTimeout(()=>card.classList.add('hidden'), r==='傳說'?5200:3800);
  }

  function tryExtra(e){
    if(!isDeckOpen()||lock) return false;
    if(Math.random()>.35) return false;
    lock=true;
    e?.preventDefault?.(); e?.stopImmediatePropagation?.();
    setTimeout(()=>{showCatch(); lock=false;},650+Math.random()*900);
    return true;
  }
  function bind(){ window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(k==='f'||k==='c')tryExtra(e);},true); document.getElementById('coffeeBtn')?.addEventListener('click',e=>tryExtra(e),true); }
  function init(){ addStyle(); ensureCard(); bind(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();