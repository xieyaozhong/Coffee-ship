(() => {
  'use strict';

  const STORE = {
    joke:'coffeeShipBottleLetters', lanar:'coffeeShipLanarLetters', ariel:'coffeeShipArielLetters',
    island:'coffeeShipIslandLetters', blackbeard:'coffeeShipBlackbeardLetters', priest:'coffeeShipMadPriestLetters', carnival:'coffeeShipCarnivalLetters', turtle:'coffeeShipTurtleSoupLetters'
  };
  const META = {
    joke:{icon:'😂',series:'冷笑話漂流瓶',rarity:'普通',count:50},
    lanar:{icon:'🌊',series:'拉納爾漂流瓶',rarity:'史詩',count:30},
    ariel:{icon:'🧜‍♀️',series:'愛麗兒漂流瓶',rarity:'史詩',count:30},
    island:{icon:'🏝️',series:'可可漂流瓶',rarity:'稀有',count:30},
    blackbeard:{icon:'🏴‍☠️',series:'黑鬍子藏寶圖',rarity:'傳說',count:10},
    priest:{icon:'📜',series:'瘋狂神父殘頁',rarity:'傳說',count:30},
    carnival:{icon:'🎭',series:'狂歡島漂流瓶',rarity:'史詩',count:30},
    turtle:{icon:'🍲',series:'海龜湯神秘故事',rarity:'神話',count:20}
  };

  const jokes = [
    '魚為什麼不上班？因為牠今天請鮭假。瓶子裡還附了一張請假單，上面只寫著：逆流太累，明天再游。',
    '章魚考試都考幾分？八十分。牠說不是不想考一百，是手太多，寫到最後自己先打結。',
    '螃蟹最大的夢想，是有一天可以直著走。牠練了一整晚，隔天大家說：你只是橫得比較有自信。',
    '海馬到底騎什麼？另一匹海馬。兩匹互相騎到最後都暈船，決定改搭公車。',
    '烏賊最怕考試，因為一緊張就噴墨。老師說不能帶小抄，牠說：這不是小抄，是生理反應。',
    '龍蝦最大的願望是不要進火鍋。牠每天健身，結果只是讓自己看起來更彈牙。',
    '河豚生氣跟平常有什麼差？差很多，平常只是圓，生氣是有態度地圓。',
    '鯊魚最討厭素食餐廳。牠看完菜單後沉默很久，最後點了一份海帶，吃得像在反省人生。',
    '海豹為什麼叫海豹？因為牠每天都在蓋章。牠蓋到最後發現，原來自己才是那顆印章。',
    '海星最怕被評成四星。牠說少一顆不是扣分，是失去身體的一部分，請尊重評論對象。'
  ];
  const beasts = ['玻璃鯨','黑潮巨眼','骨帆蛇','沉船山羊','月面鮟鱇','倒游水母','長牙海馬','裂口魟','白霧章魚','鐘聲巨蟹','鹽柱鯊','浮島龜','紅燈鰻','空洞海豹','螺旋鯨','冠骨魚','深海修女魚','黑礁巨口','夢遊海蛇','最後的利維坦'];
  const arielMood = ['愛意','悔恨','困惑','沉默','潮聲','失聲','泡沫','回望','嫉妒','清醒','離岸','告別'];
  const carnivalTitles = ['第一夜','不眠鼓聲','名字丟失','同一天','不要拒絕','遺失物海岸','鏡子房','永遠的掌聲','華麗衣櫃','甜味海風','玩具箱','笑臉規則','午夜遊行','離島船票','假面之下','宴會主人','停下來的人','海上音樂','最後的清醒','不要靠岸'];

  function providerFor(type){ return window.COFFEE_SHIP_BOTTLE_PROVIDERS?.[type] || null; }
  function pad(n){ return String(n).padStart(2,'0'); }
  function clampIndex(i, max){ return ((Number(i || 1) - 1) % max) + 1; }
  function titleOf(type, i){
    const provider = providerFor(type);
    const provided = provider?.getEntry?.(i);
    if(provided?.title) return provided.title;
    const m=META[type] || META.joke;
    return `${m.series} ${pad(i)}`;
  }
  function textOf(type, n){
    const provider = providerFor(type);
    const provided = provider?.getEntry?.(n);
    if(provided?.text) return provided.text;
    const i = clampIndex(n, META[type]?.count || 20);
    if(type === 'joke') return jokes[(i-1) % jokes.length] || jokes[0];
    if(type === 'lanar') { const b = beasts[(i-1)%beasts.length]; return `第 ${i} 夜，海洋學家拉納爾記錄了「${b}」。牠不是單純的巨大，而像是某種被海底忘記的規則。牠擦過船身時，羅盤開始倒轉，海水短暫變成黑色。我試著畫下牠的輪廓，卻發現紙上的線條會自己游走。若這封信被撿到，請不要沿著瓶口殘留的鹽味尋找我。`; }
    if(type === 'ariel') { const mood = arielMood[(i-1)%arielMood.length]; return `第 ${i} 封，愛麗兒寫下「${mood}」。我為了王子失去聲音，以為沉默能讓愛變得純粹。可是他聽不見我的心，也沒有想過我為何不說話。今天我站在礁石後，看著他把溫柔給了別人。我仍然愛他，卻開始懷疑：如果愛必須把自己切碎，那還算是被愛嗎？`; }
    if(type === 'island') { const day = i; const speaker = ['哈斯','可可','莫納'][(i-1)%3]; const focus = speaker === '哈斯' ? '他總說自己會保護我們，但夜裡卻偷偷把最後一塊餅乾留給可可。' : speaker === '可可' ? '可可把頭髮剪短，說這樣比較像能活下去的人，可是她看莫納時眼神仍然很柔軟。' : '莫納說愛情在荒島上很可笑，可是她記得可可怕黑，也記得哈斯左手受過傷。'; return `第 ${day} 天，${speaker} 把這封信塞進瓶子。${focus} 我們三個人已經在孤島上活了太久，潮水帶走鞋子、火種和很多不願承認的話。`; }
    if(type === 'blackbeard') { const treasures=['伊莉莎白的皇冠','總督夫人的藍寶石項鍊','聖銀教堂的金杯','王家船隊的黑珍珠箱','東港銀行的金磚','路西安王子的紅寶石戒指','低語羅盤','玻璃小提琴','月潮沙漏','戴維・瓊斯的心臟']; return `黑鬍子用粗魯的字跡寫道：這是老子收藏的「${treasures[(i-1)%treasures.length]}」。每件寶物都有一個不願再提起它的原主人，而最後一件寶物的主人，就是黑鬍子自己。`; }
    if(type === 'priest') return `瘋狂神父殘頁 ${i}：經文被海水泡爛，只剩斷句。紙邊寫著一個名字：塞拉芬・維爾。那不是聖徒，而是曾任王室首席醫師與路西安王子導師的人。`;
    if(type === 'carnival') { const t = carnivalTitles[(i-1)%carnivalTitles.length]; return `狂歡島｜${t}。這座島原本是王室建立的晨潮療養島，聲學治療實驗失控後，悲傷被換成永不停止的狂歡，名字則成了代價。`; }
    if(type === 'turtle') return `海龜湯 ${i}：一名船員每天都把晚餐倒進海裡，直到某天他終於把湯喝完，卻立刻要求船長返航。為什麼？瓶中沒有答案，只有一句提示：他不是第一次喝到那個味道。`;
    return '這是一封被海水泡皺的漂流瓶，文字仍然清楚，像剛剛才有人寫完。';
  }
  function inferType(key, entry){
    const t = `${key || ''} ${entry?.title || ''} ${entry?.series || ''}`;
    if(/Island|孤島|哈斯|可可|莫納/.test(t)) return 'island';
    if(/Lanar|拉納爾/.test(t)) return 'lanar';
    if(/Ariel|愛麗兒/.test(t)) return 'ariel';
    if(/Blackbeard|黑鬍子|藏寶/.test(t)) return 'blackbeard';
    if(/MadPriest|神父|殘頁/.test(t)) return 'priest';
    if(/Carnival|狂歡島/.test(t)) return 'carnival';
    if(/TurtleSoup|海龜湯/.test(t)) return 'turtle';
    return 'joke';
  }
  function read(k, fb){ try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(fb)); } catch(e){ return fb; } }
  function save(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
  function parseNum(entry, fallback){ const m = String(entry?.title || '').match(/(\d+)/); return m ? Number(m[1]) : fallback; }
  function normalizeKey(key){
    const list = read(key, []);
    if(!Array.isArray(list) || !list.length) return;
    let changed = false;
    const next = list.map((x, idx) => {
      if(!x || typeof x !== 'object') return x;
      const type = inferType(key, x); const meta = META[type]; const n = clampIndex(parseNum(x, idx+1), meta.count);
      const providerEntry = providerFor(type)?.getEntry?.(n);
      const y = providerEntry ? { ...x, ...providerEntry } : { ...x };
      if(!y.title || y.title.length < 6) { y.title = titleOf(type, n); changed = true; }
      if(!y.text || y.text.length < 70) { y.text = textOf(type, n); changed = true; }
      if(y.icon !== meta.icon) { y.icon = meta.icon; changed = true; }
      if(y.series !== meta.series) { y.series = meta.series; changed = true; }
      if(!y.rarity || y.rarity !== meta.rarity) { y.rarity = meta.rarity; changed = true; }
      if(!y.at) { y.at = Date.now(); changed = true; }
      if(providerEntry && (x.title !== y.title || x.text !== y.text)) changed = true;
      return y;
    });
    if(changed) save(key, next.slice(-120));
  }
  function createFullBottle(type){
    const provider = providerFor(type);
    if(provider?.create) return provider.create();
    const meta = META[type] || META.joke; const key = STORE[type] || STORE.joke;
    const list = read(key, []); const n = clampIndex(list.length + 1, meta.count);
    const entry = { title:titleOf(type, n), text:textOf(type, n), icon:meta.icon, series:meta.series, rarity:meta.rarity, at:Date.now() };
    list.push(entry); save(key, list.slice(-120)); return entry;
  }
  function pickType(){
    const table = [['joke',25],['island',22],['lanar',14],['ariel',12],['carnival',12],['priest',7],['blackbeard',5],['turtle',3]];
    let total = table.reduce((s,x)=>s+x[1],0), r = Math.random()*total;
    for(const [t,w] of table){ r-=w; if(r<=0) return t; }
    return 'joke';
  }
  function showBottle(entry){
    const host = document.getElementById('gamePanel') || document.body;
    let card = document.getElementById('restoredBottleCard');
    if(!card){ card = document.createElement('div'); card.id='restoredBottleCard'; card.className='central-fish-card hidden'; host.appendChild(card); }
    card.innerHTML = `<div class="central-fish-title"><span class="unique-emoji">${entry.icon}</span>${entry.title}</div><div class="central-fish-detail">類型：${entry.series}<br>稀有度：<span class="rarity-text">${entry.rarity}</span><br><br>${entry.text}</div>`;
    card.classList.remove('hidden'); setTimeout(()=>card.classList.add('hidden'),10000);
  }
  let lockUntil = 0;
  function isDeckOpen(){ const api=window.COFFEE_SHIP_DECK; if(api?.isDeckOpen)return api.isDeckOpen(); const d=document.getElementById('deckOverlay'); return d && !d.classList.contains('hidden'); }
  function isFishingInput(e){ if(!isDeckOpen()) return false; if(e.type==='keydown'){ const k=e.key&&e.key.length===1?e.key.toLowerCase():e.key; return k==='f'||k==='c'; } return !!(e.target&&e.target.closest&&e.target.closest('#coffeeBtn')); }
  function tryBottle(e){
    if(!isFishingInput(e) || Date.now()<lockUntil || Math.random()>.075) return false;
    e.preventDefault(); e.stopImmediatePropagation(); lockUntil=Date.now()+10000;
    setTimeout(()=>showBottle(createFullBottle(pickType())), 380); return true;
  }
  function patchDb(){
    if(window.COFFEE_SHIP_DB){
      window.COFFEE_SHIP_DB.bottles = Object.keys(META).map(type => [type, META[type].icon, META[type].series, META[type].rarity, textOf(type, 1)]);
      window.COFFEE_SHIP_DB.pickBottle = () => { const type=pickType(); return { id:type, icon:META[type]?.icon || '🍾', title:META[type]?.series || '漂流瓶', text:textOf(type, 1), rarity:META[type]?.rarity || '普通', group:'bottle', at:Date.now() }; };
    }
    if(window.COFFEE_SHIP_BOTTLE_CORE){
      const old = window.COFFEE_SHIP_BOTTLE_CORE.createBottle;
      window.COFFEE_SHIP_BOTTLE_CORE.createBottle = (key, title, text) => {
        const type = inferType(key, {title, text});
        const entry = createFullBottle(type);
        return entry || old?.(key,title,text);
      };
    }
  }
  function normalizeAll(){ Object.values(STORE).forEach(normalizeKey); }
  function init(){
    patchDb(); normalizeAll();
    ['keydown','click','pointerdown','touchstart'].forEach(t=>window.addEventListener(t, tryBottle, true));
    setInterval(()=>{ patchDb(); normalizeAll(); }, 1800);
  }
  window.COFFEE_SHIP_BOTTLE_RESTORE = { META, STORE, textOf, titleOf, createFullBottle, normalizeAll };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();