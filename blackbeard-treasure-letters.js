(() => {
  'use strict';

  const maps = [
    ['黑鬍子藏寶圖 1｜翡翠女王冠','哈！那群笨蛋守衛醉得像爛海草，老子從灰鴞王宮的地下寶庫把翡翠女王冠整頂搬走。現在它埋在骷髏灣北側第三塊黑礁下面，往下挖兩鏟半，別挖歪，挖歪就餵螃蟹。'],
    ['黑鬍子藏寶圖 2｜海神藍寶石','這顆海神藍寶石是從「白鹿號」船長室搶來的，那傢伙還想把它塞進靴子裡，笑死人。寶石被我藏在斷桅沉船的船長桌暗格，桌腳刻著一個歪掉的 X。'],
    ['黑鬍子藏寶圖 3｜赤焰王劍','赤焰王劍是老子從紅帆決鬥王手裡奪來的，他吹得多厲害，倒下時還不是像爛魚。劍藏在火山島東壁裂縫後的熱洞裡，入口有三顆黑曜石排成牙齒形。'],
    ['黑鬍子藏寶圖 4｜深淵金庫鑰匙','這把黑鐵鑰匙是從深淵銀行家的脖子上扯下來的，老傢伙嚇到褲子都濕了。鑰匙藏在巨鯨骨架正中央，肋骨第七根底下，用鐵鉤一撬就出來。'],
    ['黑鬍子藏寶圖 5｜黃金海圖','黃金海圖是從迷霧商會的密室搶的，上面標著一堆蠢貨找不到的島。它被我塞在迷霧群島最高燈塔的地板底下，找那塊踩起來空空響的木板。'],
    ['黑鬍子藏寶圖 6｜黑珍珠王座','黑珍珠王座是我最後一次大搶劫的戰利品，從黑潮女公爵的宴會廳拖出來，重得要命。它沒藏在陸地，而是沉在滿月時才露出的無名礁湖底，收齊前五張圖才看得懂這張的座標。']
  ];
  let lock = false;

  function isDeckOpen(){ const d=document.getElementById('deckOverlay'); return d && !d.classList.contains('hidden'); }
  function addStyle(){
    if(document.getElementById('blackbeardBottleStyle')) return;
    const s=document.createElement('style');
    s.id='blackbeardBottleStyle';
    s.textContent='.blackbeard-card{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);z-index:48;background:rgba(24,16,8,.98);border:3px solid #ffe16b;border-radius:18px;padding:16px;color:#fff4d8;text-align:left;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.32),0 0 28px rgba(255,225,107,.25);line-height:1.65;max-width:92%;pointer-events:none}.blackbeard-card.hidden{display:none}.blackbeard-title{text-align:center;font-size:21px;margin-bottom:8px;color:#ffe16b}.blackbeard-text{padding:10px;border:2px solid #8b6d35;border-radius:12px;background:#1a120b}@media(max-width:760px){.blackbeard-card{position:fixed;top:36%;width:min(90vw,390px);max-height:56dvh;overflow-y:auto;padding:14px;z-index:14000}.blackbeard-text{max-height:36dvh;overflow-y:auto}}';
    document.head.appendChild(s);
  }
  function ensureCard(){ const p=document.getElementById('gamePanel'); if(!p||document.getElementById('blackbeardCard')) return; if(getComputedStyle(p).position==='static') p.style.position='relative'; const c=document.createElement('div'); c.id='blackbeardCard'; c.className='blackbeard-card hidden'; p.appendChild(c); }
  function saveRead(title,text){ let list=[]; try{list=JSON.parse(localStorage.getItem('coffeeShipBlackbeardLetters')||'[]');}catch(e){} if(!list.some(x=>x.title===title)) list.push({title,text,at:Date.now()}); localStorage.setItem('coffeeShipBlackbeardLetters',JSON.stringify(list.slice(-20))); }
  function showMap(){ const card=document.getElementById('blackbeardCard'); if(!card) return; const entry=maps[Math.floor(Math.random()*maps.length)]; saveRead(entry[0],entry[1]); card.innerHTML=`<div class="blackbeard-title">🏴‍☠️ ${entry[0]}</div><div class="blackbeard-text">${entry[1]}</div>`; card.classList.remove('hidden'); setTimeout(()=>card.classList.add('hidden'),7800); }
  function tryMap(e){ if(!isDeckOpen()||lock) return false; if(Math.random()>.13) return false; lock=true; e?.preventDefault?.(); e?.stopImmediatePropagation?.(); setTimeout(()=>{showMap(); lock=false;},700+Math.random()*900); return true; }
  function bind(){ window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(k==='f'||k==='c')tryMap(e);},true); document.getElementById('coffeeBtn')?.addEventListener('click',e=>tryMap(e),true); }
  function init(){ addStyle(); ensureCard(); bind(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();