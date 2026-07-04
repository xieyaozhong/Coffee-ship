(() => {
  'use strict';

  const letters = [
    ['狂歡島漂流瓶 1｜第一夜','我們靠岸時，島上正在開宴會。每個人都笑得太用力，像是怕一停下來就會想起什麼。村長說，這裡沒有明天，只有今晚。'],
    ['狂歡島漂流瓶 2｜不眠鼓聲','第三天，鼓聲沒有停過。沒有人睡覺，也沒有人承認自己累。有人倒下，旁邊的人只是把彩帶掛到他身上，繼續跳舞。'],
    ['狂歡島漂流瓶 3｜名字丟失','第五天，我問一個戴金面具的人叫什麼名字。他大笑，說名字是離島的人才需要的東西。然後他把我的名字也拿去下注。'],
    ['狂歡島漂流瓶 4｜同一天','第八天，太陽升起時，所有人都喊：宴會開始！可是我記得昨天也是這句，前天也是。這座島把日子攪成一杯甜得發苦的酒。'],
    ['狂歡島漂流瓶 5｜不要拒絕','我拒絕了一杯飲料。全場安靜下來，幾百雙眼睛看著我，像我做了最可怕的事。後來我學會笑著接過來，再偷偷倒進海裡。'],
    ['狂歡島漂流瓶 6｜遺失物海岸','海岸上全是東西：面具、手套、鞋子、玩具、破掉的樂器。沒有人來找，因為島上的人只記得下一場狂歡，不記得自己失去了什麼。'],
    ['狂歡島漂流瓶 7｜鏡子房','我進入一間掛滿鏡子的屋子。鏡中的人都在跳舞，只有我沒有。當我轉身逃走時，其中一面鏡子裡的我還留在那裡笑。'],
    ['狂歡島漂流瓶 8｜永遠的掌聲','今晚有人唱到失聲，大家仍然鼓掌，直到他的喉嚨只剩氣音。島上的掌聲不是稱讚，是命令。'],
    ['狂歡島漂流瓶 9｜華麗衣櫃','他們替我換上亮得刺眼的外套，說外來者也要像節慶的一部分。我摸到口袋裡有別人的求救信，已經被香水泡爛。'],
    ['狂歡島漂流瓶 10｜甜味海風','海風聞起來像糖和酒。太甜了，甜到我開始想吐。有人說聞久了就會快樂，我看見他說這句話時眼神空得像玻璃。'],
    ['狂歡島漂流瓶 11｜玩具箱','廣場中央有一個巨大的玩具箱。裡面不是孩子的玩具，而是所有人曾經珍惜過、後來忘記的東西。箱底傳來敲擊聲。'],
    ['狂歡島漂流瓶 12｜笑臉規則','島上唯一的規則是：不准悲傷。有人哭了，其他人立刻替他畫上笑臉。那張笑臉在雨裡暈開，看起來比哭更可怕。'],
    ['狂歡島漂流瓶 13｜午夜遊行','午夜遊行從不缺席。隊伍穿過市場、穿過海灘、穿過墓地。最前面的花車上坐著一個沒有人敢直視的空王座。'],
    ['狂歡島漂流瓶 14｜離島船票','我找到一張船票，上面寫著「明天」。但這裡沒有明天。我把船票塞進瓶子，如果你撿到它，請替我證明明天真的存在。'],
    ['狂歡島漂流瓶 15｜假面之下','我偷看面具底下的臉。有些人在笑，有些人在睡，有些人的臉早就不在面具後面了。面具自己仍然唱著歌。'],
    ['狂歡島漂流瓶 16｜宴會主人','今晚主人終於出現。他沒有名字，只有一件由無數緞帶縫成的披風。他說狂歡不是為了快樂，而是為了不要聽見海底的鐘。'],
    ['狂歡島漂流瓶 17｜停下來的人','我看見一個人停止跳舞。只停了一秒。下一秒，他的影子還在跳，身體卻被人群推走，再也沒回來。'],
    ['狂歡島漂流瓶 18｜海上音樂','我逃到岸邊，卻聽見音樂從海上傳來。不是島在唱，是海在學。若連海都記住旋律，我們還能逃去哪裡？'],
    ['狂歡島漂流瓶 19｜最後的清醒','我把所有找到的遺失物綁成一包丟進海裡。也許有人會釣到它們。請記住：那些不是紀念品，是有人忘記自己以前是人的證據。'],
    ['狂歡島漂流瓶 20｜不要靠岸','如果你在海上看見燈火、聽見笑聲、聞到甜味，請立刻轉舵。不要靠岸。當你覺得音樂很好聽時，就已經太晚了。']
  ];

  const items = [
    ['👒','華麗羽毛帽',0.1,0.4],['🎭','狂歡面具',0.2,0.8],['🎈','褪色派對氣球',0.01,0.05],['🧸','舊布偶',0.2,0.9],['🎠','壞掉的音樂盒',0.4,1.4],['🥂','裂紋水晶杯',0.2,0.7],['🍾','空酒瓶',0.3,1.1],['🎲','刻字骰子',0.05,0.2],['🎺','金色小喇叭',0.4,1.2],['🪇','斷柄沙鈴',0.15,0.5],['👗','華麗禮服碎片',0.1,0.6],['👔','黑色燕尾服',0.6,1.6],['👠','單隻高跟鞋',0.3,0.9],['👞','發霉皮鞋',0.4,1.2],['🎀','濕掉的緞帶',0.02,0.1],['💍','鍍金戒指',0.01,0.05],['🧤','白手套',0.03,0.12],['🎩','泡水禮帽',0.2,0.7],['📿','彩色項鍊',0.05,0.2],['🪞','裂開的化妝鏡',0.3,0.9]
  ];
  let lock = false;

  function isDeckOpen(){ const d=document.getElementById('deckOverlay'); return d && !d.classList.contains('hidden'); }
  function read(key, fb){ try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fb));}catch(e){return fb;} }
  function save(key,v){ localStorage.setItem(key, JSON.stringify(v)); }
  function addStyle(){
    if(document.getElementById('carnivalIslandStyle')) return;
    const s=document.createElement('style');
    s.id='carnivalIslandStyle';
    s.textContent='.carnival-card{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);z-index:48;background:rgba(26,12,30,.98);border:3px solid #ffb86b;border-radius:18px;padding:16px;color:#fff4d8;text-align:left;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.32),0 0 28px rgba(255,184,107,.25);line-height:1.65;max-width:92%;pointer-events:none}.carnival-card.hidden{display:none}.carnival-title{text-align:center;font-size:21px;margin-bottom:8px;color:#ffcf7a}.carnival-text{padding:10px;border:2px solid #8b5a77;border-radius:12px;background:#1a0f20}@media(max-width:760px){.carnival-card{position:fixed;top:36%;width:min(90vw,390px);max-height:56dvh;overflow-y:auto;padding:14px;z-index:14000}.carnival-text{max-height:36dvh;overflow-y:auto}}';
    document.head.appendChild(s);
  }
  function ensureCard(){ const p=document.getElementById('gamePanel'); if(!p||document.getElementById('carnivalCard')) return; if(getComputedStyle(p).position==='static') p.style.position='relative'; const c=document.createElement('div'); c.id='carnivalCard'; c.className='carnival-card hidden'; p.appendChild(c); }
  function saveLetter(title,text){ let list=read('coffeeShipCarnivalLetters',[]); if(!list.some(x=>x.title===title)) list.push({title,text,at:Date.now()}); save('coffeeShipCarnivalLetters',list.slice(-30)); }
  function showLetter(){ const card=document.getElementById('carnivalCard'); if(!card)return; const e=letters[Math.floor(Math.random()*letters.length)]; saveLetter(e[0],e[1]); card.innerHTML=`<div class="carnival-title">🎭 ${e[0]}</div><div class="carnival-text">${e[1]}</div>`; card.classList.remove('hidden'); setTimeout(()=>card.classList.add('hidden'),8200); }
  function showItem(){ const card=document.getElementById('carnivalCard'); if(!card)return; const it=items[Math.floor(Math.random()*items.length)]; const w=it[2]+Math.random()*(it[3]-it[2]); const item={name:it[1],zone:'狂歡島漂流物',rarity:'稀有',quality:'遺失物',weight:w,kind:'treasure',icon:it[0],at:Date.now()}; const bag=read('coffeeShipFishBag',[]); bag.push(item); save('coffeeShipFishBag',bag.slice(-80)); card.innerHTML=`<div class="carnival-title">${it[0]} 狂歡島遺失物</div><div class="carnival-text">釣到了：${it[1]}<br>來源：狂歡島海域<br>重量：${w.toFixed(2)} kg<br><br>它聞起來像甜酒、海鹽和一場不肯結束的宴會。</div>`; card.classList.remove('hidden'); setTimeout(()=>card.classList.add('hidden'),5200); }
  function tryCarnival(e){ if(!isDeckOpen()||lock)return false; if(Math.random()>.16)return false; lock=true; e?.preventDefault?.(); e?.stopImmediatePropagation?.(); setTimeout(()=>{ Math.random()<.58?showLetter():showItem(); lock=false; },700+Math.random()*900); return true; }
  function bind(){ window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(k==='f'||k==='c')tryCarnival(e);},true); document.getElementById('coffeeBtn')?.addEventListener('click',e=>tryCarnival(e),true); }
  function init(){ addStyle(); ensureCard(); bind(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();