(() => {
  'use strict';

  const pages = [
    ['瘋狂神父殘頁 1｜深淵福音','「起初不是光，乃是潮聲。」我把殘缺的經句補上了。海若先於天空，那麼人不該仰望，而該跪向海底。祂在浪下說話，我只是替祂把字寫歪。'],
    ['瘋狂神父殘頁 2｜潮汐告解','殘頁說：罪會被水洗去。我懂了，不是洗淨，是帶走。把名字交給浪，浪會替你保管；把恐懼交給魚，魚會替你沉默。'],
    ['瘋狂神父殘頁 3｜第七聲鐘','我只找到半句：「第七聲鐘響時……」後面被鹽吃掉了。於是我補成：所有門都會從海裡打開。今晚我聽見第六聲，明晚我會等第七聲。'],
    ['瘋狂神父殘頁 4｜魚群聖徒','書上說眾人聚集，我看見魚群圍成圓。牠們沒有眼皮，因而比人更虔誠。牠們不眨眼地聽我布道，直到我忘了自己還是不是人。'],
    ['瘋狂神父殘頁 5｜鹽之冠','殘句寫著：冠冕將落在忠誠者頭上。我把它理解為鹽。鹽落在傷口上，傷口就記得神。若你痛，表示祂終於肯注意你。'],
    ['瘋狂神父殘頁 6｜月亮誤譯','古頁說月會指路，但我知道那是錯的。月不是燈，是眼。它每晚低一點，近一點，看我有沒有把祂的話傳給漂流瓶。'],
    ['瘋狂神父殘頁 7｜不可翻完之書','我找到一本沒有最後一頁的書。每次翻到盡頭，海風都會多吹出一張新頁。若書永遠讀不完，救贖也就永遠不會結束。多麼仁慈，多麼殘忍。'],
    ['瘋狂神父殘頁 8｜鏡中異端','殘頁警告不可崇拜偶像。我照了鏡子，明白鏡中的我就是偶像。於是我把鏡子丟進海裡。第二天，海面把我的臉還給我，但它在笑。'],
    ['瘋狂神父殘頁 9｜回返的瓶','我丟出的每個瓶子都回來了。這不是失敗，是啟示。祂不要外人讀，祂要我一遍又一遍讀給自己聽，直到我也變成瓶中空氣。'],
    ['瘋狂神父殘頁 10｜祂知道你的名字','最後的殘頁只剩一句：不可回應海上的歌聲。我卻已經回答了。若你讀到這封信，請不要尋找我。祂已經聽見紙張翻動，也已經知道你的名字。']
  ];
  let lock = false;

  function isDeckOpen(){ const d=document.getElementById('deckOverlay'); return d && !d.classList.contains('hidden'); }
  function addStyle(){
    if(document.getElementById('madPriestBottleStyle')) return;
    const s=document.createElement('style');
    s.id='madPriestBottleStyle';
    s.textContent='.mad-priest-card{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);z-index:48;background:rgba(18,14,22,.98);border:3px solid #b8a6ff;border-radius:18px;padding:16px;color:#fff4d8;text-align:left;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.32),0 0 28px rgba(184,166,255,.25);line-height:1.65;max-width:92%;pointer-events:none}.mad-priest-card.hidden{display:none}.mad-priest-title{text-align:center;font-size:21px;margin-bottom:8px;color:#d8ccff}.mad-priest-text{padding:10px;border:2px solid #6b5a8f;border-radius:12px;background:#120e18}@media(max-width:760px){.mad-priest-card{position:fixed;top:36%;width:min(90vw,390px);max-height:56dvh;overflow-y:auto;padding:14px;z-index:14000}.mad-priest-text{max-height:36dvh;overflow-y:auto}}';
    document.head.appendChild(s);
  }
  function ensureCard(){ const p=document.getElementById('gamePanel'); if(!p||document.getElementById('madPriestCard')) return; if(getComputedStyle(p).position==='static') p.style.position='relative'; const c=document.createElement('div'); c.id='madPriestCard'; c.className='mad-priest-card hidden'; p.appendChild(c); }
  function saveRead(title,text){ let list=[]; try{list=JSON.parse(localStorage.getItem('coffeeShipMadPriestLetters')||'[]');}catch(e){} if(!list.some(x=>x.title===title)) list.push({title,text,at:Date.now()}); localStorage.setItem('coffeeShipMadPriestLetters',JSON.stringify(list.slice(-20))); }
  function showPage(){ const card=document.getElementById('madPriestCard'); if(!card) return; const entry=pages[Math.floor(Math.random()*pages.length)]; saveRead(entry[0],entry[1]); card.innerHTML=`<div class="mad-priest-title">📜 ${entry[0]}</div><div class="mad-priest-text">${entry[1]}</div>`; card.classList.remove('hidden'); setTimeout(()=>card.classList.add('hidden'),8000); }
  function tryPage(e){ if(!isDeckOpen()||lock) return false; if(Math.random()>.13) return false; lock=true; e?.preventDefault?.(); e?.stopImmediatePropagation?.(); setTimeout(()=>{showPage(); lock=false;},700+Math.random()*900); return true; }
  function bind(){ window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(k==='f'||k==='c')tryPage(e);},true); document.getElementById('coffeeBtn')?.addEventListener('click',e=>tryPage(e),true); }
  function init(){ addStyle(); ensureCard(); bind(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();