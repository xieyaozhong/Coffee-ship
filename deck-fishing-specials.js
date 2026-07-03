(() => {
  'use strict';
  const items = [
    ['白玉小蝦','蝦類','普通',0.02,0.12,'蝦'],['海草蝦','蝦類','普通',0.03,0.16,'蝦'],['咖啡蝦','蝦類','常見',0.04,0.22,'蝦'],['星砂蝦','蝦類','稀有',0.05,0.3,'蝦'],['虹光龍蝦','蝦類','史詩',1.8,12,'蝦'],
    ['小寄居蟹','螃蟹','普通',0.05,0.3,'蟹'],['紅螯小蟹','螃蟹','常見',0.12,0.9,'蟹'],['藍紋梭子蟹','螃蟹','常見',0.25,1.8,'蟹'],['深海王蟹','螃蟹','史詩',5,28,'蟹'],
    ['小安康魚','深海魚','稀有',1.1,6.5,'安康魚'],['巨型安康魚','深海魚','史詩',18,95,'安康魚'],['王冠安康魚','深海魚','傳說',40,180,'安康魚'],
    ['人魚剪影','傳說生物','傳說',10,35,'人魚'],['人魚貝殼','漂流物','傳說',0.8,3.5,'貝殼'],
    ['漂流袋子','海底垃圾','普通',0.01,0.06,'垃圾'],['生鏽瓶蓋','海底垃圾','普通',0.01,0.03,'垃圾'],['舊船繩','海底垃圾','常見',0.2,1.2,'垃圾'],['破木箱碎片','海底垃圾','常見',0.5,3.5,'垃圾'],
    ['瓶中信','漂流物','稀有',0.2,1.2,'信'],['古老瓶中信','漂流物','史詩',0.3,1.5,'信'],['星海瓶中信','漂流物','傳說',0.4,2,'信']
  ];
  const letters = ['Coffee Ship 今日航行平安。','甲板風向良好，適合看星星。','下一站可能會遇見新的島。','請把這封信交給下一位釣魚的人。','瓶中記錄：今晚海面有銀色波光。','留言：咖啡香會指引回家的路。'];
  const colors = { '普通':'#fff4d8', '常見':'#9ce8f0', '稀有':'#79d0b1', '史詩':'#e9a6b0', '傳說':'#ffe16b' };
  const icons = { '蝦':'🦐', '蟹':'🦀', '安康魚':'🐡', '人魚':'🧜', '貝殼':'🐚', '垃圾':'🗑️', '信':'🍾' };
  let lock = false;
  function isDeckOpen(){ const d=document.getElementById('deckOverlay'); return d && !d.classList.contains('hidden'); }
  function addStyle(){ if(document.getElementById('fishingSpecialStyle')) return; const s=document.createElement('style'); s.id='fishingSpecialStyle'; s.textContent='.fishing-special-card{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:40;background:rgba(21,16,32,.97);border:3px solid #d7bb79;border-radius:18px;padding:16px;color:#fff4d8;text-align:center;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.28);pointer-events:none;line-height:1.55;max-width:90%}.fishing-special-card.hidden{display:none}.bottle-letter{margin-top:10px;padding:10px;border:2px solid #76536a;border-radius:12px;background:#1a1220;line-height:1.65}@media(max-width:760px){.fishing-special-card{min-width:245px;font-size:14px;padding:13px}}'; document.head.appendChild(s); }
  function ensureCard(){ const panel=document.getElementById('gamePanel'); if(!panel||document.getElementById('fishingSpecialCard')) return; if(getComputedStyle(panel).position==='static') panel.style.position='relative'; const card=document.createElement('div'); card.id='fishingSpecialCard'; card.className='fishing-special-card hidden'; panel.appendChild(card); }
  function pick(){ const r=Math.random(); let list=items; if(r<.55) list=items.filter(i=>i[2]==='普通'||i[2]==='常見'); else if(r<.88) list=items.filter(i=>i[2]==='稀有'); else if(r<.98) list=items.filter(i=>i[2]==='史詩'); else list=items.filter(i=>i[2]==='傳說'); return list[Math.floor(Math.random()*list.length)]; }
  function show(item){ const card=document.getElementById('fishingSpecialCard'); if(!card) return; const w=item[3]+Math.random()*(item[4]-item[3]); const isLetter=item[0].includes('瓶中信'); const icon=icons[item[5]]||'🐟'; const color=colors[item[2]]||'#fff4d8'; const caught=JSON.parse(localStorage.getItem('coffeeShipSpecialCatches')||'{}'); caught[item[0]]=Math.max(caught[item[0]]||0,Number(w.toFixed(2))); localStorage.setItem('coffeeShipSpecialCatches',JSON.stringify(caught)); if(isLetter){ const msg=letters[Math.floor(Math.random()*letters.length)]; card.innerHTML=`<div style="font-size:22px;color:${color}">${icon} ${item[0]}</div><div>類型：${item[1]}<br>稀有度：${item[2]}</div><div class="bottle-letter">信中內容：${msg}</div>`; } else { card.innerHTML=`<div style="font-size:22px;color:${color}">${icon} ${item[0]}</div><div>類型：${item[1]}<br>稀有度：${item[2]}<br>重量：${w.toFixed(2)} kg<br>特殊收集：${Object.keys(caught).length}/${items.length}</div>`; } card.classList.remove('hidden'); setTimeout(()=>card.classList.add('hidden'),isLetter?6200:3800); }
  function trySpecial(e){ if(!isDeckOpen()||lock||Math.random()>.42) return; lock=true; e?.preventDefault?.(); e?.stopImmediatePropagation?.(); setTimeout(()=>{show(pick()); lock=false;},700+Math.random()*900); }
  function bind(){ window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(k==='f'||k==='c')trySpecial(e);},true); document.getElementById('coffeeBtn')?.addEventListener('click',e=>trySpecial(e),true); }
  function init(){ addStyle(); ensureCard(); bind(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
