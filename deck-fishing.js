(() => {
  'use strict';
  const fish = [
    ['小沙丁魚','近海','普通',0.03,0.18],['銀鱗小魚','近海','普通',0.05,0.35],['月光鯷魚','近海','普通',0.04,0.42],['咖啡豆魚','近海','普通',0.08,0.55],['奶泡魚','近海','普通',0.12,0.8],['海風小鯛','近海','普通',0.2,0.9],['泡泡魚','近海','普通',0.06,0.4],['迷你飛魚','近海','普通',0.15,0.75],['橘尾雀鯛','近海','普通',0.08,0.35],['玻璃小蝦','近海','普通',0.01,0.08],
    ['港口竹筴魚','港口','常見',0.3,1.2],['星斑鯖魚','港口','常見',0.45,1.8],['藍線魚','港口','常見',0.25,1.1],['焦糖鯛','港口','常見',0.6,2.3],['木棧道石斑','港口','常見',0.8,3.6],['船影鱸魚','港口','常見',0.9,4.2],['碼頭烏魚','港口','常見',0.7,3.2],['白浪比目魚','港口','常見',0.5,2.8],['船燈秋刀魚','港口','常見',0.2,0.9],['銅鰭魚','港口','常見',0.35,1.7],
    ['夜光魷魚','夜海','稀有',0.5,2.8],['珍珠河豚','夜海','稀有',0.7,3.1],['藍寶石鮪幼魚','夜海','稀有',2.2,8.5],['星空鰻','夜海','稀有',1.1,5.6],['玫瑰金鯉','夜海','稀有',0.9,4.8],['月牙水母','夜海','稀有',0.3,1.5],['銀河小卷','夜海','稀有',0.4,2.2],['幽光燈籠魚','夜海','稀有',0.6,3.4],['紫星魟幼魚','夜海','稀有',1.5,6.2],['夜霧鯰魚','夜海','稀有',1.2,7.5],
    ['深海拿鐵鯊','深海','史詩',12,48],['銀河旗魚','深海','史詩',18,72],['古代鸚鵡螺','深海','史詩',5,25],['月影魟魚','深海','史詩',9,38],['黑潮大鮪魚','深海','史詩',26,120],['冰藍皇帶魚','深海','史詩',8,35],['紅寶石石斑','深海','史詩',10,45],['風暴鬼頭刀','深海','史詩',6,28],['深淵大章魚','深海','史詩',30,160],['星塵龍蝦','深海','史詩',2,16],
    ['傳說咖啡鯨','傳說','傳說',300,1200],['星海龍魚','傳說','傳說',45,180],['黃金船錨魚','傳說','傳說',20,90],['宇宙翻車魚','傳說','傳說',150,800],['黎明海神魚','傳說','傳說',80,360],['黑洞巨魷','傳說','傳說',200,1500],['彩虹王鮪','傳說','傳說',60,260],['永夜鯨鯊','傳說','傳說',500,2200]
  ];
  const rarity = { '普通':50, '常見':31, '稀有':14, '史詩':4.2, '傳說':0.8 };
  const qTable = [['普通',55,1],['優秀',25,1.13],['完美',13,1.28],['閃亮',5,1.5],['神話',2,1.9]];
  const colors = { '普通':'#fff4d8', '常見':'#9ce8f0', '稀有':'#79d0b1', '史詩':'#e9a6b0', '傳說':'#ffe16b' };
  let busy = false, cooldown = 0, noticeTimer = 0, notice = '', noticeColor = '#fff4d8';
  let count = Number(localStorage.getItem('coffeeShipCatchCount') || 0);
  let best = null, dex = {};
  try { best = JSON.parse(localStorage.getItem('coffeeShipBestFish') || 'null'); } catch(e) {}
  try { dex = JSON.parse(localStorage.getItem('coffeeShipFishDex') || '{}'); } catch(e) { dex = {}; }

  function isDeckOpen(){ const d=document.getElementById('deckOverlay'); return d && !d.classList.contains('hidden'); }
  function ctxDeck(){ const d=document.getElementById('deckOverlay'); return d ? d.getContext('2d') : null; }
  function addStyle(){ if(document.getElementById('deckFishingStyle')) return; const s=document.createElement('style'); s.id='deckFishingStyle'; s.textContent='.fishing-card{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:30;background:rgba(21,16,32,.96);border:3px solid #d7bb79;border-radius:18px;padding:16px;color:#fff4d8;text-align:center;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.28);pointer-events:none;line-height:1.55}.fishing-card.hidden{display:none}@media(max-width:760px){.fishing-card{min-width:245px;font-size:14px;padding:13px}}'; document.head.appendChild(s); }
  function ensureCard(){ const p=document.getElementById('gamePanel'); if(!p||document.getElementById('fishingCard')) return; if(getComputedStyle(p).position==='static') p.style.position='relative'; const c=document.createElement('div'); c.id='fishingCard'; c.className='fishing-card hidden'; p.appendChild(c); }
  function chooseWeighted(map){ const total=Object.values(map).reduce((a,b)=>a+b,0); let r=Math.random()*total; for(const [k,w] of Object.entries(map)){ r-=w; if(r<=0) return k; } return Object.keys(map)[0]; }
  function chooseQuality(){ const total=qTable.reduce((a,b)=>a+b[1],0); let r=Math.random()*total; for(const q of qTable){ r-=q[1]; if(r<=0) return q; } return qTable[0]; }
  function showCard(item){ const card=document.getElementById('fishingCard'); if(!card) return; const bestText=best?`最大紀錄：${best.name} ${best.weight.toFixed(2)} kg`:'最大紀錄：尚無'; const got=Object.keys(dex).length; card.innerHTML=`<div style="font-size:22px;color:${colors[item.rarity]}">🐟 ${item.quality} ${item.name}</div><div>海域：${item.zone}<br>稀有度：${item.rarity}<br>重量：${item.weight.toFixed(2)} kg<br>FishDex：${got}/${fish.length}<br>總釣獲：${count} 隻<br>${bestText}</div>`; card.classList.remove('hidden'); setTimeout(()=>card.classList.add('hidden'),3900); }
  function catchFish(){ const r=chooseWeighted(rarity); const list=fish.filter(f=>f[2]===r); const f=list[Math.floor(Math.random()*list.length)]; const q=chooseQuality(); const weight=(f[3]+Math.pow(Math.random(),1.65)*(f[4]-f[3]))*q[2]; const item={name:f[0],zone:f[1],rarity:r,quality:q[0],weight,at:Date.now()}; count++; localStorage.setItem('coffeeShipCatchCount',String(count)); dex[item.name]=Math.max(dex[item.name]||0, Number(item.weight.toFixed(2))); localStorage.setItem('coffeeShipFishDex',JSON.stringify(dex)); if(!best||item.weight>best.weight){best=item;localStorage.setItem('coffeeShipBestFish',JSON.stringify(best));} notice=`${item.quality} ${item.name} ${item.weight.toFixed(2)}kg`; noticeColor=colors[item.rarity]||'#fff4d8'; noticeTimer=300; showCard(item); }
  function startFishing(){ if(!isDeckOpen()||busy||cooldown>0) return; busy=true; cooldown=150; notice='拋竿中...'; noticeColor='#9ce8f0'; noticeTimer=120; setTimeout(()=>{ if(isDeckOpen()) catchFish(); busy=false; }, 700+Math.random()*1500); }
  function draw(){ if(!isDeckOpen()) return; const ctx=ctxDeck(); if(!ctx) return; ctx.save(); ctx.textAlign='center'; ctx.font='900 24px ui-rounded, system-ui, sans-serif'; ctx.fillStyle='#120b17'; ctx.fillText('🎣 釣魚點',820+2,336+2); ctx.fillStyle='#9ce8f0'; ctx.fillText('🎣 釣魚點',820,336); ctx.font='900 13px ui-rounded, system-ui, sans-serif'; const dexText=`FishDex ${Object.keys(dex).length}/${fish.length}`; ctx.fillStyle='#120b17'; ctx.fillText('F / 手機☕ 釣魚',820+2,360+2); ctx.fillText(dexText,820+2,378+2); ctx.fillStyle='#fff4d8'; ctx.fillText('F / 手機☕ 釣魚',820,360); ctx.fillStyle='#d7bb79'; ctx.fillText(dexText,820,378); if(noticeTimer>0){ctx.font='900 15px ui-rounded, system-ui, sans-serif';ctx.fillStyle='#120b17';ctx.fillText(notice,690+2,334+2);ctx.fillStyle=noticeColor;ctx.fillText(notice,690,334);noticeTimer--;} ctx.restore(); }
  function bind(){ window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(isDeckOpen()&&(k==='f'||k==='c')){e.preventDefault();startFishing();}},true); document.getElementById('coffeeBtn')?.addEventListener('click',e=>{if(!isDeckOpen())return;e.preventDefault();e.stopPropagation();startFishing();},true); }
  function loop(){requestAnimationFrame(loop); if(cooldown>0) cooldown--; draw();}
  function init(){addStyle();ensureCard();bind();loop();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
