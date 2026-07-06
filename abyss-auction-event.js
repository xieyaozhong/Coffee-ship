(() => {
  'use strict';
  if (window.__COFFEE_SHIP_ABYSS_AUCTION_V1__) return;
  window.__COFFEE_SHIP_ABYSS_AUCTION_V1__ = true;

  const PANEL_ID = 'abyssAuctionEvent';
  const BAG_KEY = 'coffeeShipFishBag';
  const STATE_KEY = 'coffeeShipAbyssAuctionState';
  const MAX_BAG = 240;
  const TURN_MS = 8000;

  const TREASURES = [
    {id:'moon_astrolabe',icon:'🌙',name:'月潮星盤',rarity:'史詩',startBid:90,appraisal:420,sellPrice:220,accent:'#9ce8f0',trait:'星盤會自行記錄不存在於現代海圖上的月潮航線。'},
    {id:'drowned_violin',icon:'🎻',name:'沉船小提琴',rarity:'史詩',startBid:140,appraisal:680,sellPrice:350,accent:'#e9a6b0',trait:'琴箱已浸水百年，四根琴弦卻仍能奏出低沉船歌。'},
    {id:'black_pearl_crown',icon:'👑',name:'黑珍珠海后冠',rarity:'傳說',startBid:220,appraisal:1100,sellPrice:570,accent:'#ffe16b',trait:'冠上的黑珍珠會映出佩戴者最不願承認的願望。'},
    {id:'ghost_watch',icon:'⌚',name:'幽靈船長懷錶',rarity:'傳說',startBid:300,appraisal:1650,sellPrice:820,accent:'#b9a4e6',trait:'指針只在附近有沉船亡魂時才會開始走動。'},
    {id:'leviathan_chess',icon:'♜',name:'利維坦象牙棋子',rarity:'傳說',startBid:390,appraisal:2300,sellPrice:1150,accent:'#d7bb79',trait:'棋子底部刻著一場從未被歷史記錄的海戰。'},
    {id:'mermaid_glass_tear',icon:'💧',name:'人魚玻璃淚',rarity:'神話',startBid:520,appraisal:3200,sellPrice:1600,accent:'#79d0b1',trait:'淚珠不會蒸發，靠近歌聲時會出現七彩裂光。'},
    {id:'abyss_royal_seal',icon:'🧿',name:'深淵王室封印',rarity:'神話',startBid:680,appraisal:4700,sellPrice:2350,accent:'#ff72bc',trait:'封印背面的文字會在無光處重新排列。'},
    {id:'starwreck_core',icon:'🧭',name:'星骸導航核心',rarity:'神話',startBid:880,appraisal:6800,sellPrice:3400,accent:'#9fb8ff',trait:'來自墜入海中的星船，仍在搜尋早已消失的母港。'},
    {id:'stopped_music_box',icon:'🎶',name:'停時潮汐音樂盒',rarity:'世界級',startBid:1180,appraisal:9800,sellPrice:4900,accent:'#ffffff',trait:'盒蓋打開時，附近落下的水滴會停在半空數秒。'},
    {id:'abyss_emperor_scepter',icon:'🔱',name:'深海帝皇權杖',rarity:'世界級',startBid:1750,appraisal:15800,sellPrice:7900,accent:'#ffcf67',trait:'權杖頂端封存著一座沉沒王城最後一次潮汐。'}
  ];

  const NPC_POOL = [
    {id:'shell_lady',icon:'👒',name:'貝殼夫人',aggression:.62,min:.48,max:.92},
    {id:'black_flag_collector',icon:'🏴‍☠️',name:'黑旗收藏家',aggression:.9,min:.68,max:1.15},
    {id:'wreck_scholar',icon:'📚',name:'沉船學者',aggression:.56,min:.42,max:.84},
    {id:'gold_tooth_captain',icon:'🦷',name:'金牙船長',aggression:.82,min:.58,max:1.04},
    {id:'fog_count',icon:'🎩',name:'霧港伯爵',aggression:.7,min:.52,max:.98},
    {id:'abyss_agent',icon:'🐙',name:'深海代理人',aggression:.96,min:.78,max:1.28}
  ];

  let active = null;
  let turnTimer = 0;
  let npcTimer = 0;
  const processedCastIds = new Set();

  function read(key,fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function save(key,value) {
    try { localStorage.setItem(key,JSON.stringify(value)); }
    catch {}
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }

  function format(value) {
    return Math.max(0,Math.floor(Number(value) || 0)).toLocaleString('zh-TW');
  }

  function economy() {
    return window.COFFEE_SHIP_ECONOMY || null;
  }

  function balance() {
    return economy()?.balance?.() ?? Math.max(0,Number(localStorage.getItem('coffeeShipPearls') || 0));
  }

  function spend(amount,reason) {
    const value = Math.max(0,Math.floor(Number(amount) || 0));
    if (economy()?.spend) return economy().spend(value,reason,{source:'abyss-auction'});
    const current = balance();
    if (current < value) return {ok:false,balance:current,needed:value-current,spent:0};
    const next = current-value;
    localStorage.setItem('coffeeShipPearls',String(next));
    window.dispatchEvent(new CustomEvent('coffeeShipPearlsChanged',{detail:{pearls:next,balance:next,delta:-value,reason}}));
    return {ok:true,balance:next,spent:value};
  }

  function auctionState() {
    const state = read(STATE_KEY,{visits:0,wins:0,losses:0,spent:0,collected:[]});
    for (const key of ['visits','wins','losses','spent']) state[key] = Math.max(0,Number(state[key] || 0));
    state.collected = Array.isArray(state.collected) ? state.collected : [];
    return state;
  }

  function bag() {
    const value = read(BAG_KEY,[]);
    return Array.isArray(value) ? value : [];
  }

  function ownedIds() {
    return new Set(bag().map(item => item?.auctionTreasureId).filter(Boolean));
  }

  function shuffle(rows) {
    const result = rows.slice();
    for (let index=result.length-1;index>0;index-=1) {
      const target = Math.floor(Math.random()*(index+1));
      [result[index],result[target]] = [result[target],result[index]];
    }
    return result;
  }

  function chooseTreasure() {
    const owned = ownedIds();
    const missing = TREASURES.filter(item => !owned.has(item.id));
    const pool = missing.length ? missing : TREASURES;
    return pool[Math.floor(Math.random()*pool.length)];
  }

  function roundFive(value) {
    return Math.max(5,Math.ceil(Number(value || 0)/5)*5);
  }

  function incrementFor(value) {
    return roundFive(Math.max(10,Number(value || 0)*.11));
  }

  function nextMinimumBid() {
    if (!active) return 0;
    if (active.leader === 'auctioneer') return active.treasure.startBid;
    return roundFive(active.currentBid + incrementFor(active.currentBid));
  }

  function createBidders(treasure) {
    return shuffle(NPC_POOL).slice(0,3).map((npc,index) => {
      const multiplier = npc.min + Math.random()*(npc.max-npc.min);
      const budget = roundFive(Math.max(treasure.startBid+incrementFor(treasure.startBid)*(index+1),treasure.appraisal*multiplier));
      return {...npc,budget,out:false,lastBid:0};
    });
  }

  function addTreasure(treasure,price,castId) {
    const item = {
      auctionTreasureId:treasure.id,
      icon:treasure.icon,
      name:treasure.name,
      rarity:treasure.rarity,
      quality:'拍賣限定',
      kind:'treasure',
      group:'abyss-auction',
      zone:'深淵拍賣會',
      trait:treasure.trait,
      purchasePrice:price,
      appraisedValue:treasure.appraisal,
      sellPrice:treasure.sellPrice,
      weight:.12,
      source:'abyss-auction',
      unique:true,
      castId,
      at:Date.now()
    };
    const items = bag();
    items.push(item);
    save(BAG_KEY,items.slice(-MAX_BAG));
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'abyss-auction',item}}));
    return item;
  }

  function pushEvent(title,text,icon='🔨',accent='#f2a957') {
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({
      castId:active?.castId || `auction_${Date.now()}`,
      eventKind:'special',
      title:`深淵拍賣會｜${title}`,
      icon,
      accent,
      text
    });
  }

  function ensurePanel() {
    let panel = document.getElementById(PANEL_ID);
    if (panel) return panel;
    panel = document.createElement('aside');
    panel.id = PANEL_ID;
    panel.className = 'hidden';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-label','深淵拍賣會競標');
    document.body.appendChild(panel);
    return panel;
  }

  function bidderHtml(npc) {
    const leading = active.leader === npc.id;
    return `<div class="aa-bidder ${leading?'is-leading':''} ${npc.out?'is-out':''}"><b>${npc.icon} ${escapeHtml(npc.name)}</b><small>${npc.out?'已退出':leading?`領先 🦪 ${format(active.currentBid)}`:'仍在競標'}</small></div>`;
  }

  function logsHtml() {
    return active.logs.slice(-7).reverse().map(row => `<div>${escapeHtml(row)}</div>`).join('');
  }

  function renderBidding() {
    const treasure = active.treasure;
    const minimum = nextMinimumBid();
    const step = incrementFor(Math.max(minimum,active.currentBid));
    const strong = roundFive(minimum+step*2);
    const canAct = active.phase === 'player';
    const wallet = balance();
    const timePercent = Math.max(0,Math.min(100,active.turnMs/TURN_MS*100));
    const leaderName = active.leader === 'auctioneer' ? '拍賣官底價' : active.leader === 'player' ? '你目前領先' : `${active.npcs.find(npc => npc.id === active.leader)?.name || '神秘買家'}領先`;
    const note = canAct ? (minimum <= wallet ? `輪到你出價。最低有效出價為 🦪 ${format(minimum)}。` : `最低出價需要 🦪 ${format(minimum)}，你的珍珠不足，只能放棄。`) : 'NPC 正在評估價格，請稍候……';
    return `<main class="aa-body"><section class="aa-lot"><div class="aa-lot-icon">${treasure.icon}</div><div><h4>${escapeHtml(treasure.name)}</h4><span class="aa-rarity">${escapeHtml(treasure.rarity)}・拍賣限定</span><p>${escapeHtml(treasure.trait)}</p><div class="aa-appraisal"><span>起標：<strong>🦪 ${format(treasure.startBid)}</strong></span><span>估值：<strong>🦪 ${format(treasure.appraisal)}</strong></span><span>收藏進度：<strong>${ownedIds().size}/10</strong></span></div></div></section><section class="aa-board"><div class="aa-price"><small>目前最高價</small><strong>🦪 ${format(Math.max(treasure.startBid,active.currentBid))}</strong><div class="aa-leader">${escapeHtml(leaderName)}</div></div><div class="aa-track"><span id="abyssAuctionTimeBar" style="--aa-time:${timePercent}%"></span></div><div class="aa-bidders">${active.npcs.map(bidderHtml).join('')}</div><div class="aa-actions"><button class="aa-bid" type="button" data-auction-bid="${minimum}" ${!canAct||minimum>wallet?'disabled':''}>跟價至 🦪 ${format(minimum)}</button><button class="aa-bid strong" type="button" data-auction-bid="${strong}" ${!canAct||strong>wallet?'disabled':''}>強勢加價 🦪 ${format(strong)}</button><button class="aa-pass" type="button" data-auction-pass ${!canAct?'disabled':''}>放棄本次競標</button></div><div class="aa-note" id="abyssAuctionNote">${escapeHtml(note)}</div><div class="aa-log" id="abyssAuctionLog">${logsHtml()}</div></section></main>`;
  }

  function renderResult() {
    const result = active.result;
    return `<main class="aa-body"><section class="aa-result"><div class="aa-result-icon">${result.icon}</div><h4>${escapeHtml(result.title)}</h4><p>${escapeHtml(result.text)}</p><strong>${escapeHtml(result.reward)}</strong><button class="aa-close" type="button">返回甲板</button></section></main>`;
  }

  function render() {
    if (!active) return;
    const treasure = active.treasure;
    const bidding = active.phase === 'player' || active.phase === 'npc';
    ensurePanel().innerHTML = `<section class="aa-shell" style="--aa-accent:${treasure.accent}"><header class="aa-head"><div class="aa-title"><span class="aa-hammer">🔨</span><div><h3>深淵拍賣會</h3><p>每場只競標一件珍寶・第 ${TREASURES.indexOf(treasure)+1}／10 種</p></div></div><button class="aa-close" type="button" ${active.phase==='npc'?'disabled':''}>${bidding?'放棄':'關閉'}</button></header><div class="aa-status"><span>${bidding?`出價回合 ${active.round}`:'競標已結束'}</span><span class="aa-wallet">🦪 <b id="abyssAuctionBalance">${format(balance())}</b> 珍珠</span></div>${active.phase==='result'?renderResult():renderBidding()}<footer class="aa-footer"><span>只有得標時才會扣除珍珠。</span><span>${active.npcs.filter(npc => !npc.out).length} 名 NPC 尚未退出</span></footer></section>`;
  }

  function stopTimers() {
    clearInterval(turnTimer);
    clearTimeout(npcTimer);
    turnTimer = 0;
    npcTimer = 0;
  }

  function startTurnTimer() {
    clearInterval(turnTimer);
    turnTimer = setInterval(() => {
      if (!active || active.phase !== 'player') return clearInterval(turnTimer);
      active.turnMs -= 200;
      const bar = document.getElementById('abyssAuctionTimeBar');
      if (bar) bar.style.setProperty('--aa-time',`${Math.max(0,active.turnMs/TURN_MS*100)}%`);
      if (active.turnMs <= 0) finishLoss('你沒有在倒數結束前出價，拍賣官視為放棄。');
    },200);
  }

  function finishWin() {
    if (!active || active.phase === 'result') return;
    stopTimers();
    const treasure = active.treasure;
    const payment = spend(active.currentBid,`深淵拍賣會：${treasure.name}`);
    if (!payment.ok) {
      finishLoss(`結標時珍珠不足，無法支付 🦪 ${format(active.currentBid)}。`);
      return;
    }
    const item = addTreasure(treasure,active.currentBid,active.castId);
    const state = auctionState();
    state.wins += 1;
    state.spent += active.currentBid;
    if (!state.collected.includes(treasure.id)) state.collected.push(treasure.id);
    save(STATE_KEY,state);
    const text = `拍賣槌落下，你以 🦪 ${format(active.currentBid)} 珍珠擊退所有競標者。\n${item.name}已放入背包。`;
    pushEvent('成功得標',text,item.icon,treasure.accent);
    active.phase = 'result';
    active.result = {icon:item.icon,title:'成功得標',text,reward:`${item.name}［${item.rarity}］`};
    render();
  }

  function finishLoss(reason) {
    if (!active || active.phase === 'result') return;
    stopTimers();
    const winningNpc = active.leader !== 'player' && active.leader !== 'auctioneer'
      ? active.npcs.find(npc => npc.id === active.leader)
      : active.npcs.filter(npc => !npc.out).sort((a,b) => b.budget-a.budget)[0];
    const winner = winningNpc?.name || '匿名收藏家';
    const finalPrice = Math.max(active.treasure.startBid,active.currentBid);
    const state = auctionState();
    state.losses += 1;
    save(STATE_KEY,state);
    const text = `${reason}\n${winner}以 🦪 ${format(finalPrice)} 珍珠取得${active.treasure.name}。你沒有支付任何珍珠。`;
    pushEvent('競標失敗',text,'🔨','#d96b72');
    active.phase = 'result';
    active.result = {icon:'🔨',title:'競標失敗',text,reward:'未扣除珍珠・未取得珍寶'};
    render();
  }

  function npcResponse() {
    if (!active || active.phase !== 'npc') return;
    const next = nextMinimumBid();
    active.npcs.forEach(npc => {
      if (!npc.out && npc.budget < next) {
        npc.out = true;
        active.logs.push(`${npc.icon} ${npc.name}因價格過高退出。`);
      }
    });
    const candidates = active.npcs.filter(npc => !npc.out && npc.budget >= next);
    if (!candidates.length) {
      active.logs.push('全場沉默，拍賣官準備落槌。');
      render();
      npcTimer = setTimeout(finishWin,700);
      return;
    }

    const weighted = candidates.map(npc => ({npc,score:Math.random()*.55+npc.aggression*.65+(npc.budget-next)/Math.max(1,npc.budget)})).sort((a,b) => b.score-a.score);
    const bidder = weighted[0].npc;
    const step = incrementFor(next);
    const extraSteps = Math.random() < bidder.aggression*.45 ? 1+Math.floor(Math.random()*2) : 0;
    const offer = Math.min(bidder.budget,roundFive(next+step*extraSteps));
    bidder.lastBid = offer;
    active.currentBid = offer;
    active.leader = bidder.id;
    active.round += 1;
    active.logs.push(`${bidder.icon} ${bidder.name}出價 🦪 ${format(offer)}。`);
    active.phase = 'player';
    active.turnMs = TURN_MS;
    render();
    startTurnTimer();
  }

  function placeBid(amount) {
    if (!active || active.phase !== 'player') return;
    const minimum = nextMinimumBid();
    const bid = roundFive(Math.max(minimum,Number(amount || 0)));
    if (bid > balance()) return;
    clearInterval(turnTimer);
    active.currentBid = bid;
    active.leader = 'player';
    active.playerBid = bid;
    active.logs.push(`🙋 你出價 🦪 ${format(bid)}。`);
    active.phase = 'npc';
    render();
    npcTimer = setTimeout(npcResponse,650+Math.random()*550);
  }

  function closeAuction() {
    if (!active) return true;
    if (active.phase === 'player') {
      finishLoss('你主動退出本次競標。');
      return false;
    }
    if (active.phase === 'npc') return false;
    stopTimers();
    ensurePanel().classList.add('hidden');
    document.body.classList.remove('abyss-auction-open');
    active = null;
    return true;
  }

  function closeCompetingEvents() {
    try { window.COFFEE_SHIP_FISHING_API?.close?.(); } catch {}
    try { if (document.body.classList.contains('sea-merchant-open')) window.COFFEE_SHIP_SEA_MERCHANT?.close?.(''); } catch {}
    try { if (document.body.classList.contains('pirate-gambling-open')) window.COFFEE_SHIP_PIRATE_GAMBLING?.close?.(''); } catch {}
    try { if (document.body.classList.contains('coral-roulette-open')) window.COFFEE_SHIP_CORAL_ROULETTE?.close?.(); } catch {}
    try { if (document.body.classList.contains('mutant-hunt-open')) window.COFFEE_SHIP_MUTANT_HUNT?.close?.(); } catch {}
  }

  function competingBusy() {
    return ['sea-merchant-open','pirate-gambling-open','coral-roulette-open','mutant-hunt-open'].some(name => document.body.classList.contains(name));
  }

  function openAuction(castId,forced=false) {
    if (active || !window.COFFEE_SHIP_DECK?.isDeckOpen?.()) return false;
    closeCompetingEvents();
    if (competingBusy()) return false;
    const treasure = chooseTreasure();
    active = {
      castId:castId || `auction_${Date.now()}`,
      treasure,
      npcs:createBidders(treasure),
      currentBid:Math.max(0,treasure.startBid-incrementFor(treasure.startBid)),
      leader:'auctioneer',
      playerBid:0,
      phase:'player',
      round:1,
      turnMs:TURN_MS,
      logs:[`🔨 拍賣官宣布${treasure.name}起標價為 🦪 ${format(treasure.startBid)}。`],
      result:null
    };
    const state = auctionState();
    state.visits += 1;
    save(STATE_KEY,state);
    render();
    ensurePanel().classList.remove('hidden');
    document.body.classList.add('abyss-auction-open');
    pushEvent('競標開始',`本場拍品為 ${treasure.icon} ${treasure.name}［${treasure.rarity}］。\n起標價：🦪 ${format(treasure.startBid)} 珍珠。`,treasure.icon,treasure.accent);
    startTurnTimer();
    if (forced) {
      active.logs.push('測試模式：拍賣會由系統手動開啟。');
      render();
    }
    return true;
  }

  function scheduleOpen(castId,attempt=0) {
    if (active) return;
    if (openAuction(castId)) return;
    if (attempt < 25) setTimeout(() => scheduleOpen(castId,attempt+1),800);
  }

  function installEventPatch() {
    const event = window.COFFEE_SHIP_FISHING_ADVENTURES?.events?.find(row => row.id === 'abyss_auction');
    if (!event) return false;
    event.effect = 'mixed';
    event.actions = [];
    event.text = '深淵拍賣船升起黑金旗幟，本場只展出一件珍寶，等待你與收藏家真正競價。';
    event.interactive = true;
    event.auctionVersion = 1;
    return true;
  }

  function checkCast(castId) {
    if (!castId || processedCastIds.has(castId)) return;
    const rows = window.COFFEE_SHIP_FISHING_ADVENTURES?.log?.() || [];
    const found = rows.find(row => row?.id === 'abyss_auction' && row?.castId === castId);
    if (!found) return;
    processedCastIds.add(castId);
    scheduleOpen(castId);
  }

  function processFishingResult(event) {
    const castId = event.detail?.castId;
    if (!castId) return;
    [90,220,480].forEach(delay => setTimeout(() => checkCast(castId),delay));
  }

  function bind() {
    document.addEventListener('click',event => {
      if (!event.target.closest?.(`#${PANEL_ID}`)) return;
      const bid = event.target.closest('[data-auction-bid]');
      if (bid) { event.preventDefault(); placeBid(Number(bid.dataset.auctionBid)); return; }
      if (event.target.closest('[data-auction-pass]')) { event.preventDefault(); finishLoss('你選擇不再跟價。'); return; }
      if (event.target.closest('.aa-close')) { event.preventDefault(); closeAuction(); }
    },true);
    window.addEventListener('coffee-ship:fishing-result',processFishingResult);
    window.addEventListener('coffee-ship:fishing-adventures-ready',installEventPatch);
    window.addEventListener('coffee-ship:fishing-adventure-expanded',installEventPatch);
    window.addEventListener('coffee-ship:economy-changed',() => {
      const node = document.getElementById('abyssAuctionBalance');
      if (node) node.textContent = format(balance());
    });
    window.addEventListener('coffee-ship:scene',event => {
      if (event.detail?.scene !== 'deck' && active?.phase !== 'result') finishLoss('你離開甲板，拍賣官取消了你的競標資格。');
      else if (event.detail?.scene !== 'deck' && active) closeAuction();
    });
  }

  function init() {
    ensurePanel();
    bind();
    installEventPatch();
    let attempts = 0;
    const patchTimer = setInterval(() => {
      attempts += 1;
      if (installEventPatch() || attempts > 24) clearInterval(patchTimer);
    },250);
    window.COFFEE_SHIP_ABYSS_AUCTION = {
      open:() => openAuction(window.COFFEE_SHIP_FISHING_API?.getCurrentCastId?.() || `auction_test_${Date.now()}`,true),
      close:closeAuction,
      state:auctionState,
      treasures:TREASURES,
      version:1
    };
    window.dispatchEvent(new CustomEvent('coffee-ship:abyss-auction-ready',{detail:{treasures:TREASURES.length,version:1}}));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();