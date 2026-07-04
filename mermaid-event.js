(() => {
  'use strict';

  const encounters = [
    ['月光歌聲','美人魚在月光下浮出水面，唱了一段只有海浪聽得懂的歌。你獲得了「月光貝殼」。','🐚','月光貝殼','treasure'],
    ['深海珍珠','她把一顆冰涼的巨大珍珠放在船邊，微笑後潛回海裡。','💎','巨大珍珠','treasure'],
    ['魚群祝福','她輕拍海面，魚群從船底閃過。接下來一段時間，稀有魚似乎更靠近了。','✨','魚群祝福','buff'],
    ['藍色鱗片','她留下一片會發光的藍色鱗片，上面有細小的星點。','🧜‍♀️','美人魚鱗片','treasure'],
    ['失落航海圖','美人魚遞來一張被海水泡軟的圖，上面畫著不存在的島。','🗺️','失落航海圖','letter'],
    ['海潮安眠曲','她的歌聲讓海面安靜下來，連遠方的鯊魚影子也退去了。','🌊','安眠潮聲','buff'],
    ['傳說魚餌','她把一枚閃亮魚餌拋上甲板，像一顆小星星。','🎣','傳說魚餌','treasure'],
    ['皇冠碎片','她從貝殼盒中取出一枚金色碎片，像某個沉沒王國的遺物。','👑','海底皇冠碎片','treasure'],
    ['瓶中歌詞','她留下漂流瓶，裡面不是求救信，而是一段沒有結尾的歌詞。','🍾','美人魚歌詞瓶','letter'],
    ['深海藍寶','她指向海面，浪花中浮出一顆深藍色寶石。','🔷','深海藍寶','treasure'],
    ['無聲的微笑','她只是看著你，像知道愛麗兒所有沒說完的話。你感覺這次相遇會被海記住。','💙','無聲祝福','buff'],
    ['泡沫道別','她化成一串泡泡離開，泡泡裡短暫映出一座遙遠的白色宮殿。','🫧','泡沫記憶','letter']
  ];
  let lock = false;

  function isDeckOpen(){ const d=document.getElementById('deckOverlay'); return d && !d.classList.contains('hidden'); }
  function read(key, fb){ try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fb));}catch(e){return fb;} }
  function save(key, v){ localStorage.setItem(key, JSON.stringify(v)); }
  function addStyle(){
    if(document.getElementById('mermaidEventStyle')) return;
    const s=document.createElement('style');
    s.id='mermaidEventStyle';
    s.textContent=`
      .mermaid-card{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);z-index:14100;background:linear-gradient(180deg,rgba(8,22,42,.98),rgba(20,10,38,.98));border:3px solid #9ce8f0;border-radius:20px;padding:18px;color:#fff4d8;text-align:center;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.34),0 0 42px rgba(156,232,240,.45);line-height:1.65;max-width:92%;pointer-events:none;overflow:hidden}.mermaid-card.hidden{display:none}.mermaid-title{font-size:24px;color:#9ce8f0;text-shadow:2px 2px 0 #120b17}.mermaid-body{position:relative;z-index:2;margin-top:10px;padding:10px;border:2px solid #6bbbd0;border-radius:14px;background:rgba(9,20,38,.72);text-align:left}.mermaid-glow{font-size:62px;animation:mermaidFloat 1.4s ease-in-out infinite alternate}.mermaid-bubble{position:absolute;bottom:-20px;font-size:20px;animation:mermaidBubble 2.3s ease-out forwards}@keyframes mermaidFloat{from{transform:translateY(4px) scale(.96)}to{transform:translateY(-6px) scale(1.04)}}@keyframes mermaidBubble{0%{transform:translateY(0);opacity:0}20%{opacity:1}100%{transform:translateY(-260px);opacity:0}}@media(max-width:760px){.mermaid-card{position:fixed;top:36%;width:min(90vw,390px);max-height:58dvh;overflow-y:auto;padding:14px}.mermaid-body{max-height:36dvh;overflow-y:auto}}
    `;
    document.head.appendChild(s);
  }
  function ensureCard(){ const p=document.getElementById('gamePanel'); if(!p||document.getElementById('mermaidCard')) return; if(getComputedStyle(p).position==='static') p.style.position='relative'; const c=document.createElement('div'); c.id='mermaidCard'; c.className='mermaid-card hidden'; p.appendChild(c); }
  function addBubbles(card){
    for(let i=0;i<24;i++){
      const b=document.createElement('div'); b.className='mermaid-bubble'; b.textContent=i%4?'🫧':'✨';
      b.style.left=(5+Math.random()*90)+'%'; b.style.animationDelay=(Math.random()*1.2)+'s'; b.style.fontSize=(14+Math.random()*18)+'px';
      card.appendChild(b);
    }
  }
  function saveEncounter(title, text){
    const list=read('coffeeShipMermaidEncounters',[]);
    list.push({title,text,at:Date.now()});
    save('coffeeShipMermaidEncounters',list.slice(-30));
    const dex=read('coffeeShipMermaidDex',{}); dex[title]=(dex[title]||0)+1; save('coffeeShipMermaidDex',dex);
  }
  function grant(item){
    if(item[4]==='buff') { localStorage.setItem('coffeeShipMermaidBuffUntil', String(Date.now()+10*60*1000)); return; }
    const bag=read('coffeeShipFishBag',[]);
    bag.push({name:item[3], zone:'美人魚事件', rarity:'傳說', quality:'祝福', weight:0.01+Math.random()*0.4, kind:item[4]==='letter'?'letter':'treasure', icon:item[2], at:Date.now()});
    save('coffeeShipFishBag',bag.slice(-80));
  }
  function showEncounter(){
    const card=document.getElementById('mermaidCard'); if(!card) return;
    const e=encounters[Math.floor(Math.random()*encounters.length)];
    saveEncounter(e[0], e[1]); grant(e);
    const dex=read('coffeeShipMermaidDex',{});
    card.innerHTML=`<div class="mermaid-title">🧜‍♀️ 美人魚事件｜${e[0]}</div><div class="mermaid-glow">🧜‍♀️</div><div class="mermaid-body">${e[1]}<br><br>獲得：${e[2]} ${e[3]}<br>MermaidDex：${Object.keys(dex).length}/12</div>`;
    addBubbles(card);
    card.classList.remove('hidden');
    if(window.COFFEE_SHIP_CLAIM_FISH_RESULT) window.COFFEE_SHIP_CLAIM_FISH_RESULT(9000);
    setTimeout(()=>card.classList.add('hidden'),8600);
  }
  function tryMermaid(e){
    if(!isDeckOpen()||lock) return false;
    // rare but testable; roughly one in 20 fishing attempts.
    if(Math.random()>.05) return false;
    lock=true;
    e?.preventDefault?.(); e?.stopImmediatePropagation?.();
    setTimeout(()=>{ showEncounter(); lock=false; }, 900+Math.random()*900);
    return true;
  }
  function bind(){
    window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(k==='f'||k==='c')tryMermaid(e);},true);
    document.getElementById('coffeeBtn')?.addEventListener('click',e=>tryMermaid(e),true);
  }
  function init(){ addStyle(); ensureCard(); bind(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
