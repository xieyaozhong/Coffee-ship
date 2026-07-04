(() => {
  'use strict';

  let lockUntil = 0;
  const friends = [
    { icon:'🐢', name:'海龜', min:260, max:520, text:'海龜浮上海面，先收走一大把珍珠，接著嚴肅地說教：不要亂丟垃圾，不要把吸管留在海裡，也不要以為大海會自己復原。', item:true },
    { icon:'🦭', name:'海象', min:420, max:820, text:'海象沒有說話，只是靠近船邊看著你。牠的眼神很像人，安靜、疲憊，像記得很多海上的壞事。牠收下珍珠後，又慢慢沉回浪裡。' },
    { icon:'🐬', name:'海豚', min:360, max:680, text:'海豚繞著船邊游了好幾圈，油嘴滑舌地吹著泡泡。牠收走珍珠後，像惡作劇一樣拋給你一個隨機漂流瓶。', bottle:true }
  ];
  const bottles = [
    ['coffeeShipBottleLetters','🍾','冷笑話漂流瓶','魚為什麼不上班？因為今天請鮭假。'],
    ['coffeeShipLanarLetters','🌊','拉納爾漂流瓶','拉納爾寫道：那頭巨獸從船底游過時，整片海像被翻到背面。'],
    ['coffeeShipArielLetters','🧜‍♀️','愛麗兒漂流瓶','我曾以為失去聲音就能換來愛，後來才知道，沉默只會讓不愛你的人更容易離開。'],
    ['coffeeShipBlackbeardLetters','🏴‍☠️','黑鬍子藏寶圖','老子把寶藏埋在黑礁石底下，敢挖就看你有沒有命帶走。'],
    ['coffeeShipMadPriestLetters','📜','瘋狂神父殘頁','潮聲不是潮聲，是祂在紙背後呼吸。不要回答海上的歌聲。'],
    ['coffeeShipCarnivalLetters','🎭','狂歡島漂流瓶','如果你在海上看見燈火、聽見笑聲、聞到甜味，請立刻轉舵。']
  ];

  function read(key, fb){ try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fb)); } catch(e){ return fb; } }
  function save(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
  function bag(){ return read('coffeeShipFishBag', []); }
  function setBag(items){ save('coffeeShipFishBag', items.slice(-140)); }
  function isDeckOpen(){ const d=document.getElementById('deckOverlay'); return d && !d.classList.contains('hidden'); }
  function isFishingInput(e){ if(!isDeckOpen()) return false; if(e.type === 'keydown'){ const k=e.key && e.key.length===1 ? e.key.toLowerCase() : e.key; return k==='f' || k==='c'; } return !!(e.target && e.target.closest && e.target.closest('#coffeeBtn')); }
  function choose(list){ return list[Math.floor(Math.random()*list.length)]; }
  function price(min,max){ return min + Math.floor(Math.random()*(max-min+1)); }
  function visible(){ const c=document.getElementById('oceanFriendCard'); return c && !c.classList.contains('hidden'); }

  function addStyle(){
    if(document.getElementById('oceanFriendStyle')) return;
    const s=document.createElement('style');
    s.id='oceanFriendStyle';
    s.textContent='.ocean-friend-card{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);z-index:13650;background:rgba(15,28,38,.98);border:3px solid #7dc7ff;border-radius:18px;padding:16px;color:#fff4d8;text-align:center;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.32),0 0 28px rgba(125,199,255,.25);line-height:1.65;max-width:92%;pointer-events:none}.ocean-friend-card.hidden{display:none}.ocean-friend-title{font-size:24px;margin-bottom:8px}.ocean-friend-text{padding:10px;border:2px solid #5fc6d8;border-radius:12px;background:#101b28}@media(max-width:760px){.ocean-friend-card{position:fixed;top:36%;width:min(90vw,390px);max-height:56dvh;overflow-y:auto;padding:14px}.ocean-friend-text{max-height:36dvh;overflow-y:auto}}';
    document.head.appendChild(s);
  }
  function card(){ const p=document.getElementById('gamePanel') || document.body; let c=document.getElementById('oceanFriendCard'); if(!c){ if(p !== document.body && getComputedStyle(p).position==='static') p.style.position='relative'; c=document.createElement('div'); c.id='oceanFriendCard'; c.className='ocean-friend-card hidden'; p.appendChild(c); } return c; }
  function show(title, detail, ms=7200){ const c=card(); c.innerHTML=`<div class="ocean-friend-title">${title}</div><div class="ocean-friend-text">${detail}</div>`; c.classList.remove('hidden'); lockUntil=Date.now()+ms; setTimeout(()=>c.classList.add('hidden'),ms); }

  function spendPearls(amount){
    let left=amount, paid=0;
    const next=[];
    for(const it of bag()){
      if(it && it.kind==='currency' && left>0){
        const have=Number(it.amount||0);
        const take=Math.min(have,left);
        paid += take;
        left -= take;
        if(have>take) next.push({...it, amount:have-take, name:`${have-take} 珍珠`, zone:'找零'});
      } else next.push(it);
    }
    setBag(next);
    return paid;
  }
  function addBottle(){ const b=choose(bottles); const list=read(b[0],[]); const title=`${b[2]} ${list.length+1}`; list.push({title,text:b[3],at:Date.now()}); save(b[0],list.slice(-80)); return `${b[1]} ${title}<br>${b[3]}`; }
  function addTurtleItem(){ const items=bag(); const w=.01+Math.random()*.04; items.push({name:'鼻孔裡的舊吸管',zone:'海洋朋友事件',rarity:'稀有',quality:'警示物',weight:w,kind:'treasure',icon:'🥤🐢',at:Date.now()}); setBag(items); return '掉落：🥤🐢 鼻孔裡的舊吸管'; }
  function event(){
    const f=choose(friends);
    const cost=price(f.min,f.max);
    const paid=spendPearls(cost);
    let extra='';
    if(f.item && Math.random()<0.65) extra='<br><br>'+addTurtleItem();
    if(f.bottle) extra='<br><br>獲得漂流瓶：<br>'+addBottle();
    const pay = paid >= cost ? `收取珍珠：${paid}` : `牠想收 ${cost} 珍珠，但你只有 ${paid}。牠還是全拿走了。`;
    show(`${f.icon} 海洋朋友｜${f.name}`, `${f.text}<br><br>${pay}${extra}`);
  }
  function onFish(e){
    if(!isFishingInput(e)) return;
    if(Date.now()<lockUntil || visible()){ e.preventDefault(); e.stopImmediatePropagation(); return; }
    if(Math.random() > 0.03) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    setTimeout(event,450);
  }
  function init(){ addStyle(); ['keydown','click','pointerdown','touchstart'].forEach(t=>window.addEventListener(t,onFish,true)); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();