(() => {
  'use strict';

  const CATCHES = [
    ['小沙丁魚','近海','普通',0.03,0.18,'fish'],['銀鱗小魚','近海','普通',0.05,0.35,'fish'],['月光鯷魚','近海','普通',0.04,0.42,'fish'],['咖啡豆魚','近海','普通',0.08,0.55,'fish'],['奶泡魚','近海','普通',0.12,0.8,'fish'],['海風小鯛','近海','普通',0.2,0.9,'fish'],['泡泡魚','近海','普通',0.06,0.4,'fish'],['迷你飛魚','近海','普通',0.15,0.75,'fish'],['橘尾雀鯛','近海','普通',0.08,0.35,'fish'],['玻璃小魚','近海','普通',0.02,0.2,'fish'],
    ['白玉小蝦','近海','普通',0.02,0.12,'shrimp'],['海草蝦','近海','普通',0.03,0.16,'shrimp'],['晨光小蝦','近海','普通',0.02,0.14,'shrimp'],['小寄居蟹','近海','普通',0.05,0.3,'crab'],['迷你沙蟹','近海','普通',0.04,0.22,'crab'],
    ['漂流塑膠袋','海底垃圾','普通',0.01,0.06,'trash'],['生鏽瓶蓋','海底垃圾','普通',0.01,0.03,'trash'],['破吸管','海底垃圾','普通',0.01,0.04,'trash'],['皺掉的杯套','海底垃圾','普通',0.01,0.05,'trash'],
    ['港口竹筴魚','港口','常見',0.3,1.2,'fish'],['星斑鯖魚','港口','常見',0.45,1.8,'fish'],['藍線魚','港口','常見',0.25,1.1,'fish'],['焦糖鯛','港口','常見',0.6,2.3,'fish'],['木棧道石斑','港口','常見',0.8,3.6,'fish'],['船影鱸魚','港口','常見',0.9,4.2,'fish'],['碼頭烏魚','港口','常見',0.7,3.2,'fish'],['白浪比目魚','港口','常見',0.5,2.8,'fish'],['船燈秋刀魚','港口','常見',0.2,0.9,'fish'],['銅鰭魚','港口','常見',0.35,1.7,'fish'],
    ['紅螯小蟹','港口','常見',0.12,0.9,'crab'],['藍紋梭子蟹','港口','常見',0.25,1.8,'crab'],['咖啡蝦','港口','常見',0.04,0.22,'shrimp'],['斑節蝦','港口','常見',0.05,0.3,'shrimp'],['舊船繩','海底垃圾','常見',0.2,1.2,'trash'],['破木箱碎片','海底垃圾','常見',0.5,3.5,'trash'],
    ['夜光魷魚','夜海','稀有',0.5,2.8,'squid'],['珍珠河豚','夜海','稀有',0.7,3.1,'fish'],['藍寶石鮪幼魚','夜海','稀有',2.2,8.5,'fish'],['星空鰻','夜海','稀有',1.1,5.6,'fish'],['玫瑰金鯉','夜海','稀有',0.9,4.8,'fish'],['月牙水母','夜海','稀有',0.3,1.5,'jelly'],['銀河小卷','夜海','稀有',0.4,2.2,'squid'],['幽光燈籠魚','夜海','稀有',0.6,3.4,'angler'],['紫星魟幼魚','夜海','稀有',1.5,6.2,'fish'],['夜霧鯰魚','夜海','稀有',1.2,7.5,'fish'],
    ['星砂蝦','夜海','稀有',0.05,0.3,'shrimp'],['月影帝王蟹幼蟹','夜海','稀有',1.5,8,'crab'],['小安康魚','夜海','稀有',1.1,6.5,'angler'],['瓶中信','漂流物','稀有',0.2,1.2,'letter'],['海女的髮梳','漂流物','稀有',0.05,0.2,'treasure'],
    ['深海拿鐵鯊','深海','史詩',12,48,'fish'],['銀河旗魚','深海','史詩',18,72,'fish'],['古代鸚鵡螺','深海','史詩',5,25,'shell'],['月影魟魚','深海','史詩',9,38,'fish'],['黑潮大鮪魚','深海','史詩',26,120,'fish'],['冰藍皇帶魚','深海','史詩',8,35,'fish'],['紅寶石石斑','深海','史詩',10,45,'fish'],['風暴鬼頭刀','深海','史詩',6,28,'fish'],['深淵大章魚','深海','史詩',30,160,'octopus'],['星塵龍蝦','深海','史詩',2,16,'shrimp'],
    ['巨型安康魚','深海','史詩',18,95,'angler'],['深海王蟹','深海','史詩',5,28,'crab'],['虹光龍蝦','深海','史詩',1.8,12,'shrimp'],['沉船懷錶','漂流物','史詩',0.1,0.8,'treasure'],['古老瓶中信','漂流物','史詩',0.3,1.5,'letter'],
    ['傳說咖啡鯨','傳說','傳說',300,1200,'whale'],['星海龍魚','傳說','傳說',45,180,'fish'],['黃金船錨魚','傳說','傳說',20,90,'fish'],['宇宙翻車魚','傳說','傳說',150,800,'fish'],['黎明海神魚','傳說','傳說',80,360,'fish'],['黑洞巨魷','傳說','傳說',200,1500,'squid'],['彩虹王鮪','傳說','傳說',60,260,'fish'],['永夜鯨鯊','傳說','傳說',500,2200,'whale'],
    ['美人魚的微笑','傳說','傳說',10,35,'mermaid'],['人魚公主的貝殼','傳說','傳說',0.8,3.5,'mermaid'],['王冠安康魚','傳說','傳說',40,180,'angler'],['星海瓶中信','漂流物','傳說',0.4,2,'letter']
  ];

  const LETTERS = [
    '今晚的海很安靜，願撿到這封信的人，也能被溫柔接住。',
    '我把想念裝進瓶子裡，如果它漂到你手上，請替我看一眼星星。',
    '不要急著抵達終點，船上的風、咖啡與朋友，本身就是旅程。',
    '如果今天很累，請記得：你已經撐過很多風浪了。',
    '傳說在滿月的甲板釣魚，會遇見唱歌的人魚。',
    '給未來的店長：請把 Coffee Ship 繼續開往溫柔的地方。',
    '海底有很多遺失的願望，也有很多重新開始的勇氣。',
    '瓶子漂到你手上，代表今天的幸運偷偷選中了你。',
    '願你釣到的不只是魚，也是一點點快樂。',
    '甲板上的風會把不開心慢慢吹遠。'
  ];

  const RARITY_WEIGHT = { '普通': 50, '常見': 31, '稀有': 14, '史詩': 4.2, '傳說': 0.8 };
  const QUALITY_TABLE = [['普通', 55, 1], ['優秀', 25, 1.13], ['完美', 13, 1.28], ['閃亮', 5, 1.5], ['神話', 2, 1.9]];
  const COLORS = { '普通':'#fff4d8', '常見':'#9ce8f0', '稀有':'#79d0b1', '史詩':'#e9a6b0', '傳說':'#ffe16b' };
  const ICONS = { fish:'🐟', shrimp:'🦐', crab:'🦀', angler:'🐡', mermaid:'🧜‍♀️', trash:'🗑️', letter:'🍾', squid:'🦑', jelly:'🪼', shell:'🐚', octopus:'🐙', whale:'🐋', treasure:'📦' };
  const STORAGE = { count:'coffeeShipCatchCount', best:'coffeeShipBestFish', dex:'coffeeShipFishDex', bag:'coffeeShipFishBag', money:'coffeeShipPearls' };

  let busy = false, cooldown = 0, noticeTimer = 0, notice = '', noticeColor = '#fff4d8';
  let count = Number(localStorage.getItem(STORAGE.count) || 0);
  let best = readJson(STORAGE.best, null);
  let dex = readJson(STORAGE.dex, {});
  let bag = readJson(STORAGE.bag, []);
  let pearls = Number(localStorage.getItem(STORAGE.money) || 0);

  function readJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
  function saveAll() { localStorage.setItem(STORAGE.count, String(count)); localStorage.setItem(STORAGE.dex, JSON.stringify(dex)); localStorage.setItem(STORAGE.bag, JSON.stringify(bag.slice(-80))); localStorage.setItem(STORAGE.money, String(pearls)); if (best) localStorage.setItem(STORAGE.best, JSON.stringify(best)); }
  function isDeckOpen(){ const d=document.getElementById('deckOverlay'); return d && !d.classList.contains('hidden'); }
  function ctxDeck(){ const d=document.getElementById('deckOverlay'); return d ? d.getContext('2d') : null; }

  function addStyle(){
    if(document.getElementById('deckFishingStyle')) return;
    const s=document.createElement('style');
    s.id='deckFishingStyle';
    s.textContent=`
      .fishing-card,.fishdex-panel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:40;background:rgba(21,16,32,.97);border:3px solid #d7bb79;border-radius:18px;padding:16px;color:#fff4d8;text-align:center;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.28);line-height:1.55;max-width:92%}
      .fishing-card{pointer-events:none}.fishing-card.hidden,.fishdex-panel.hidden{display:none}.letter-text{margin-top:10px;padding:10px;border:2px solid #76536a;border-radius:12px;background:#1a1220;color:#fff4d8;font-weight:800;line-height:1.65}
      .fishdex-panel{width:min(680px,92vw);max-height:78vh;overflow:auto;text-align:left}.fishdex-panel h2{margin:0 0 8px}.fishdex-actions{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.fishdex-actions button{box-shadow:none;padding:8px 10px;border-radius:10px}.fish-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:8px}.fish-entry{border:1px solid #76536a;border-radius:10px;padding:8px;background:#1a1220}.fish-entry strong{display:block}.fish-entry small{color:#d0bfa8}.fishdex-close{float:right;background:#3a293d;color:#fff4d8}
      #fishDexBtn{display:none}@media(max-width:760px){.fishing-card{min-width:245px;font-size:14px;padding:13px}.fishdex-panel{font-size:13px}.mobile-controls #fishDexBtn{display:inline-flex!important}}
    `;
    document.head.appendChild(s);
  }

  function ensureUi(){
    const p=document.getElementById('gamePanel'); if(!p) return; if(getComputedStyle(p).position==='static') p.style.position='relative';
    if(!document.getElementById('fishingCard')){ const c=document.createElement('div'); c.id='fishingCard'; c.className='fishing-card hidden'; p.appendChild(c); }
    if(!document.getElementById('fishDexPanel')){ const panel=document.createElement('div'); panel.id='fishDexPanel'; panel.className='fishdex-panel hidden'; p.appendChild(panel); }
    const mobile=document.querySelector('.mobile-controls');
    if(mobile && !document.getElementById('fishDexBtn')){ const b=document.createElement('button'); b.id='fishDexBtn'; b.type='button'; b.textContent='📖'; b.title='FishDex'; b.addEventListener('click', e=>{ if(isDeckOpen()){e.preventDefault(); e.stopPropagation(); openDex();}}, true); mobile.appendChild(b); }
  }

  function chooseWeighted(map){ const total=Object.values(map).reduce((a,b)=>a+b,0); let r=Math.random()*total; for(const [k,w] of Object.entries(map)){ r-=w; if(r<=0) return k; } return Object.keys(map)[0]; }
  function chooseQuality(){ const total=QUALITY_TABLE.reduce((a,b)=>a+b[1],0); let r=Math.random()*total; for(const q of QUALITY_TABLE){ r-=q[1]; if(r<=0) return q; } return QUALITY_TABLE[0]; }
  function iconFor(item){ return ICONS[item.kind] || '🐟'; }
  function priceOf(item){ const rarityMul={普通:2,常見:4,稀有:10,史詩:28,傳說:120}[item.rarity]||2; const qMul={普通:1,優秀:1.4,完美:2,閃亮:3.5,神話:6}[item.quality]||1; return Math.max(1, Math.round((item.weight || 0.1) * rarityMul * qMul)); }

  function showCard(item){
    const card=document.getElementById('fishingCard'); if(!card) return;
    const got=Object.keys(dex).length; const bestText=best?`最大紀錄：${best.name} ${best.weight.toFixed(2)} kg`:'最大紀錄：尚無'; const icon=iconFor(item); const color=COLORS[item.rarity]||'#fff4d8';
    if(item.kind==='letter'){
      card.innerHTML=`<div style="font-size:22px;color:${color}">${icon} ${item.name}</div><div>海域：${item.zone}<br>稀有度：${item.rarity}<br>FishDex：${got}/${CATCHES.length}<br>總釣獲：${count} 次</div><div class="letter-text">信中內容：${item.letter}</div>`;
    } else {
      const value = item.kind === 'trash' ? '不可販售' : `${priceOf(item)} 珍珠`;
      card.innerHTML=`<div style="font-size:22px;color:${color}">${icon} ${item.quality} ${item.name}</div><div>海域：${item.zone}<br>稀有度：${item.rarity}<br>重量：${item.weight.toFixed(2)} kg<br>價值：${value}<br>FishDex：${got}/${CATCHES.length}<br>總釣獲：${count} 次<br>${bestText}</div>`;
    }
    card.classList.remove('hidden'); setTimeout(()=>card.classList.add('hidden'), item.kind==='letter'?6500:4200);
  }

  function catchOne(){
    const r=chooseWeighted(RARITY_WEIGHT); const list=CATCHES.filter(f=>f[2]===r); const f=list[Math.floor(Math.random()*list.length)]; const q=chooseQuality();
    const weight=(f[3]+Math.pow(Math.random(),1.65)*(f[4]-f[3]))*q[2]; const item={name:f[0],zone:f[1],rarity:r,quality:q[0],weight,kind:f[5],at:Date.now()};
    if(item.kind==='letter') item.letter=LETTERS[Math.floor(Math.random()*LETTERS.length)];
    count++; dex[item.name]=Math.max(dex[item.name]||0, Number(item.weight.toFixed(2))); if(item.kind!=='letter') bag.push(item);
    if(item.kind!=='trash' && item.kind!=='letter' && (!best||item.weight>best.weight)) best=item;
    saveAll(); notice=item.kind==='letter'?`瓶中信：${item.letter.slice(0,12)}...`:`${iconFor(item)} ${item.quality} ${item.name} ${item.weight.toFixed(2)}kg`; noticeColor=COLORS[item.rarity]||'#fff4d8'; noticeTimer=360; showCard(item);
  }

  function startFishing(){ if(!isDeckOpen()||busy||cooldown>0) return; busy=true; cooldown=120; notice='拋竿中...'; noticeColor='#9ce8f0'; noticeTimer=120; setTimeout(()=>{ if(isDeckOpen()) catchOne(); busy=false; },650+Math.random()*1300); }

  function openDex(){
    ensureUi(); const panel=document.getElementById('fishDexPanel'); if(!panel) return; const got=Object.keys(dex).length; const bestText=best?`${best.name} ${best.weight.toFixed(2)}kg`:'尚無';
    const recent=bag.slice(-18).reverse();
    panel.innerHTML=`<button class="fishdex-close" type="button">關閉</button><h2>📖 FishDex</h2><div>收集：${got}/${CATCHES.length}｜總釣獲：${count}｜珍珠：${pearls}｜最大：${bestText}</div><div class="fishdex-actions"><button id="sellFishBtn" type="button">賣出背包可販售漁獲</button><button id="clearFishCardBtn" type="button">只關閉</button></div><div class="fish-grid">${recent.length?recent.map(it=>`<div class="fish-entry"><strong>${iconFor(it)} ${it.quality} ${it.name}</strong><small>${it.rarity}｜${it.weight.toFixed(2)}kg｜${it.kind==='trash'?'不可販售':priceOf(it)+' 珍珠'}</small></div>`).join(''):'<div class="fish-entry">還沒有背包漁獲，先去釣魚吧。</div>'}</div>`;
    panel.classList.remove('hidden'); panel.querySelector('.fishdex-close').onclick=()=>panel.classList.add('hidden'); panel.querySelector('#clearFishCardBtn').onclick=()=>panel.classList.add('hidden'); panel.querySelector('#sellFishBtn').onclick=()=>{ let gain=0; bag=bag.filter(it=>{ if(it.kind==='trash') return true; gain+=priceOf(it); return false; }); pearls+=gain; saveAll(); notice=`賣出漁獲 +${gain} 珍珠`; noticeColor='#ffe16b'; noticeTimer=240; openDex(); };
  }

  function draw(){
    if(!isDeckOpen()) return; const ctx=ctxDeck(); if(!ctx) return; ctx.save(); ctx.textAlign='center'; ctx.font='900 24px ui-rounded, system-ui, sans-serif'; ctx.fillStyle='#120b17'; ctx.fillText('🎣 釣魚點',820+2,336+2); ctx.fillStyle='#9ce8f0'; ctx.fillText('🎣 釣魚點',820,336); ctx.font='900 13px ui-rounded, system-ui, sans-serif'; const dexText=`FishDex ${Object.keys(dex).length}/${CATCHES.length}`; ctx.fillStyle='#120b17'; ctx.fillText('F釣魚 / G圖鑑 / 手機☕',820+2,360+2); ctx.fillText(dexText,820+2,378+2); ctx.fillStyle='#fff4d8'; ctx.fillText('F釣魚 / G圖鑑 / 手機☕',820,360); ctx.fillStyle='#d7bb79'; ctx.fillText(dexText,820,378); if(noticeTimer>0){ctx.font='900 15px ui-rounded, system-ui, sans-serif';ctx.fillStyle='#120b17';ctx.fillText(notice,690+2,334+2);ctx.fillStyle=noticeColor;ctx.fillText(notice,690,334);noticeTimer--;} ctx.restore();
  }
  function bind(){ window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(!isDeckOpen())return;if(k==='f'||k==='c'){e.preventDefault();startFishing();} if(k==='g'){e.preventDefault();openDex();}},true); document.getElementById('coffeeBtn')?.addEventListener('click',e=>{if(!isDeckOpen())return;e.preventDefault();e.stopPropagation();startFishing();},true); }
  function loop(){requestAnimationFrame(loop); if(cooldown>0) cooldown--; draw();}
  function init(){addStyle();ensureUi();bind();loop();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
