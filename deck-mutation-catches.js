(() => {
  'use strict';

  const bases = [
    ['雙頭魚','魚類','稀有',0.3,8,'🐟'],
    ['三眼魚','魚類','稀有',0.4,12,'🐟'],
    ['透明骨魚','魚類','史詩',1,24,'🐟'],
    ['發光鱗魚','魚類','稀有',0.5,18,'🐟'],
    ['雙尾旗魚','魚類','史詩',10,90,'🐟'],
    ['三眼蝦','蝦類','稀有',0.03,0.35,'🦐'],
    ['水晶殼蝦','蝦類','稀有',0.04,0.5,'🦐'],
    ['巨鉗蝦','蝦類','史詩',0.8,8,'🦐'],
    ['六腳蟹','螃蟹','稀有',0.2,3,'🦀'],
    ['雙殼蟹','螃蟹','史詩',1,12,'🦀'],
    ['發光眼蟹','螃蟹','稀有',0.3,5,'🦀'],
    ['長人手的章魚','章魚','傳說',20,180,'🐙'],
    ['會寫字的章魚','章魚','史詩',5,50,'🐙'],
    ['鏡面皮膚魷魚','魷魚','史詩',1,22,'🦑'],
    ['雙燈安康魚','安康魚','史詩',5,45,'🐡'],
    ['無臉安康魚','安康魚','傳說',20,130,'🐡'],
    ['三眼鯊魚','鯊魚','史詩',120,900,'🦈'],
    ['雙背鰭鯊魚','鯊魚','稀有',60,420,'🦈'],
    ['古代突變巨鯨','鯨類','傳說',900,4200,'🐋'],
    ['人魚尾影突變體','人魚','傳說',8,40,'🧜‍♀️']
  ];

  const prefixes = ['突變','異色','深海突變','星光突變','黑潮突變','月影突變'];
  const qualities = [['普通',48,1],['優秀',25,1.25],['完美',15,1.6],['閃亮',8,2.1],['神話',4,3]];
  const colors = { '稀有':'#79d0b1', '史詩':'#e9a6b0', '傳說':'#ffe16b' };
  let lock = false;

  function isDeckOpen(){ const d=document.getElementById('deckOverlay'); return d && !d.classList.contains('hidden'); }
  function readJson(k,f){ try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(f)); } catch(e) { return f; } }
  function chooseQuality(){ const total=qualities.reduce((a,b)=>a+b[1],0); let r=Math.random()*total; for(const q of qualities){ r-=q[1]; if(r<=0) return q; } return qualities[0]; }
  function pick(){ const base=bases[Math.floor(Math.random()*bases.length)]; const q=chooseQuality(); const pre=prefixes[Math.floor(Math.random()*prefixes.length)]; const w=(base[3]+Math.pow(Math.random(),1.4)*(base[4]-base[3]))*q[2]; return { name:`${pre}${base[0]}`, zone:'突變海域', rarity:base[2], quality:q[0], weight:w, kind:'mutation', icon:base[5], type:base[1], at:Date.now() }; }
  function priceOf(item){ const r={稀有:18,史詩:55,傳說:180}[item.rarity]||10; const q={普通:1,優秀:1.5,完美:2.4,閃亮:4,神話:8}[item.quality]||1; return Math.max(5,Math.round(item.weight*r*q)); }

  function addStyle(){
    if(document.getElementById('mutationCatchStyle')) return;
    const s=document.createElement('style');
    s.id='mutationCatchStyle';
    s.textContent='.mutation-card{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);z-index:48;background:rgba(22,12,30,.98);border:3px solid #79d0b1;border-radius:18px;padding:16px;color:#fff4d8;text-align:center;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.32);line-height:1.55;max-width:92%;pointer-events:none}.mutation-card.hidden{display:none}.mutation-note{margin-top:10px;padding:10px;border:2px solid #76536a;border-radius:12px;background:#1a1220;color:#d6fff2;text-align:left}@media(max-width:760px){.mutation-card{position:fixed;top:38%;width:min(88vw,360px);max-height:58dvh;overflow-y:auto;padding:14px}}';
    document.head.appendChild(s);
  }
  function ensureCard(){ const p=document.getElementById('gamePanel'); if(!p||document.getElementById('mutationCard')) return; if(getComputedStyle(p).position==='static') p.style.position='relative'; const c=document.createElement('div'); c.id='mutationCard'; c.className='mutation-card hidden'; p.appendChild(c); }
  function save(item){ const bag=readJson('coffeeShipFishBag',[]); const dex=readJson('coffeeShipFishDex',{}); bag.push(item); dex[item.name]=Math.max(dex[item.name]||0,Number(item.weight.toFixed(2))); localStorage.setItem('coffeeShipFishBag',JSON.stringify(bag.slice(-80))); localStorage.setItem('coffeeShipFishDex',JSON.stringify(dex)); }
  function show(item){ const c=document.getElementById('mutationCard'); if(!c) return; const color=colors[item.rarity]||'#79d0b1'; c.innerHTML=`<div style="font-size:23px;color:${color}">${item.icon} ${item.quality} ${item.name}</div><div>類型：${item.type}<br>稀有度：${item.rarity}<br>重量：${item.weight.toFixed(2)} kg<br>價值：${priceOf(item)} 珍珠</div><div class="mutation-note">突變漁獲已放入背包，也會記錄到 FishDex。這類生物比普通漁獲更罕見，賣價也更高。</div>`; c.classList.remove('hidden'); setTimeout(()=>c.classList.add('hidden'),5600); }
  function trigger(e){ if(!isDeckOpen()||lock) return false; if(Math.random()>.18) return false; lock=true; e?.preventDefault?.(); e?.stopImmediatePropagation?.(); setTimeout(()=>{ const item=pick(); save(item); show(item); lock=false; },700+Math.random()*900); return true; }
  function bind(){ window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(k==='f'||k==='c') trigger(e);},true); document.getElementById('coffeeBtn')?.addEventListener('click',e=>trigger(e),true); }
  function init(){ addStyle(); ensureCard(); bind(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();