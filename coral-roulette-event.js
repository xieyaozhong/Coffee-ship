(() => {
  'use strict';
  if (window.__COFFEE_SHIP_CORAL_ROULETTE_V1__) return;
  window.__COFFEE_SHIP_CORAL_ROULETTE_V1__ = true;

  const PANEL_ID = 'coralRouletteEvent';
  const STYLE_ID = 'coralRouletteStyleV1';
  const BAG_KEY = 'coffeeShipFishBag';
  const ADVENTURE_STATE_KEY = 'coffeeShipFishingAdventureState';
  const ROULETTE_STATE_KEY = 'coffeeShipCoralRouletteState';
  const MAX_BAG = 240;
  const SEGMENT_DEGREES = 30;
  const SPIN_MS = 5400;

  const UNIQUE_DROPS = {
    coral_branch: {
      id:'coral_branch',icon:'🪸',name:'潮光珊瑚枝',rarity:'史詩',sellPrice:180,
      trait:'只在珊瑚輪盤停止的瞬間生成，枝端會隨潮汐明暗閃爍。'
    },
    rainbow_pearl: {
      id:'rainbow_pearl',icon:'🔮',name:'虹礁珍珠',rarity:'傳說',sellPrice:420,
      trait:'珠面同時映出七種礁海色彩，離開海水後仍保持濕潤光澤。'
    },
    roulette_core: {
      id:'roulette_core',icon:'⚙️',name:'珊瑚輪盤核心',rarity:'神話',sellPrice:888,
      trait:'輪盤最深處脫落的活體核心，靠近珍珠時會緩慢轉動。'
    }
  };

  const SEGMENTS = [
    {id:'gain25a',icon:'🦪',short:'+25',type:'gain',amount:25,color:'#55b89a'},
    {id:'lose20a',icon:'🌊',short:'-20',type:'loss',amount:20,color:'#b85b70'},
    {id:'gain60',icon:'✨',short:'+60',type:'gain',amount:60,color:'#d7a84d'},
    {id:'coral_branch',icon:'🪸',short:'珊瑚枝',type:'drop',drop:'coral_branch',color:'#ed7f9d'},
    {id:'lose40',icon:'🌀',short:'-40',type:'loss',amount:40,color:'#77529c'},
    {id:'blessing',icon:'🌺',short:'祝福',type:'blessing',color:'#e57e7e'},
    {id:'gain25b',icon:'🦪',short:'+25',type:'gain',amount:25,color:'#4ea3a5'},
    {id:'rainbow_pearl',icon:'🔮',short:'虹礁珠',type:'drop',drop:'rainbow_pearl',color:'#a56ac7'},
    {id:'gain120',icon:'💰',short:'+120',type:'gain',amount:120,color:'#d79245'},
    {id:'lose60',icon:'⚠️',short:'-60',type:'loss',amount:60,color:'#a34359'},
    {id:'jackpot',icon:'👑',short:'+300',type:'gain',amount:300,color:'#f0c34c'},
    {id:'roulette_core',icon:'⚙️',short:'核心',type:'drop',drop:'roulette_core',color:'#4e7ed2'}
  ];

  let active = null;
  let spinTimer = 0;
  const processedCastIds = new Set();

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key,JSON.stringify(value)); }
    catch {}
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
  }

  function formatNumber(value) {
    return Math.max(0,Math.floor(Number(value) || 0)).toLocaleString('zh-TW');
  }

  function economy() {
    return window.COFFEE_SHIP_ECONOMY || null;
  }

  function balance() {
    return economy()?.balance?.() ?? Math.max(0,Number(localStorage.getItem('coffeeShipPearls') || 0));
  }

  function earn(amount, reason) {
    const value = Math.max(0,Math.floor(Number(amount) || 0));
    if (economy()?.earn) return economy().earn(value,reason,{source:'coral-roulette'});
    const next = balance() + value;
    localStorage.setItem('coffeeShipPearls',String(next));
    window.dispatchEvent(new CustomEvent('coffeeShipPearlsChanged',{detail:{pearls:next,balance:next,delta:value,reason}}));
    return value;
  }

  function spend(amount, reason) {
    const value = Math.min(balance(),Math.max(0,Math.floor(Number(amount) || 0)));
    if (!value) return 0;
    if (economy()?.spend) return Number(economy().spend(value,reason,{source:'coral-roulette'})?.spent || value);
    const next = balance() - value;
    localStorage.setItem('coffeeShipPearls',String(next));
    window.dispatchEvent(new CustomEvent('coffeeShipPearlsChanged',{detail:{pearls:next,balance:next,delta:-value,reason}}));
    return value;
  }

  function rouletteState() {
    const state = read(ROULETTE_STATE_KEY,{spins:0,jackpots:0,uniqueDrops:0,pearlsWon:0,pearlsLost:0,lastCastId:''});
    for (const key of ['spins','jackpots','uniqueDrops','pearlsWon','pearlsLost']) state[key] = Math.max(0,Number(state[key] || 0));
    return state;
  }

  function addUniqueDrop(dropId, castId) {
    const source = UNIQUE_DROPS[dropId];
    if (!source) return null;
    const item = {
      coralRouletteDropId:source.id,
      uniqueDropSource:'coral_roulette',
      icon:source.icon,name:source.name,rarity:source.rarity,quality:'輪盤限定',
      kind:'treasure',group:'coral-roulette',zone:'珊瑚輪盤',trait:source.trait,
      sellPrice:source.sellPrice,weight:.08,castId,source:'coral-roulette',at:Date.now()
    };
    const bag = read(BAG_KEY,[]);
    const safeBag = Array.isArray(bag) ? bag : [];
    safeBag.push(item);
    save(BAG_KEY,safeBag.slice(-MAX_BAG));
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'coral-roulette',item}}));
    return item;
  }

  function addBlessing() {
    const state = read(ADVENTURE_STATE_KEY,{effects:[],stats:{}});
    state.effects = Array.isArray(state.effects) ? state.effects : [];
    state.stats = state.stats || {};
    const effects = [
      {id:'coral_roulette_value',label:'虹礁祝福',type:'value',mult:1.5,casts:3},
      {id:'coral_roulette_event',label:'珊瑚指引',type:'event',mult:1.25,casts:3}
    ];
    for (const effect of effects) {
      const existing = state.effects.find(row => row?.id === effect.id);
      if (existing) Object.assign(existing,effect,{casts:Math.max(Number(existing.casts || 0),effect.casts)});
      else state.effects.push({...effect});
    }
    state.effects = state.effects.filter(row => Number(row?.casts || 0) > 0).slice(-24);
    save(ADVENTURE_STATE_KEY,state);
    window.dispatchEvent(new CustomEvent('coffee-ship:fishing-adventure-state',{detail:{state}}));
  }

  function pushResult(segment, detail) {
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({
      castId:active?.castId || `coral_roulette_${Date.now()}`,
      eventKind:'special',
      title:`珊瑚輪盤｜${detail.title}`,
      icon:segment.icon,
      accent:segment.color,
      text:detail.text
    });
  }

  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const colors = SEGMENTS.map((segment,index) => `${segment.color} ${index*SEGMENT_DEGREES}deg ${(index+1)*SEGMENT_DEGREES}deg`).join(',');
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${PANEL_ID}{position:fixed;inset:0;z-index:48000;display:grid;place-items:center;padding:calc(8px + env(safe-area-inset-top)) 8px calc(8px + env(safe-area-inset-bottom));box-sizing:border-box;background:rgba(4,7,13,.86);backdrop-filter:blur(10px);color:#fff8df}
      #${PANEL_ID}.hidden{display:none!important}.cr-shell{width:min(760px,100%);max-height:calc(100vh - 16px);display:flex;flex-direction:column;overflow:hidden;border:3px solid #ef819b;border-radius:24px;background:radial-gradient(circle at 50% 0,rgba(255,120,164,.17),transparent 35%),linear-gradient(160deg,#342440,#11101c 72%);box-shadow:0 25px 80px rgba(0,0,0,.64),0 8px 0 #06070c}.cr-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 16px;border-bottom:1px solid rgba(255,255,255,.1)}.cr-head h3{margin:0;font-size:21px}.cr-head p{margin:4px 0 0;color:#efadc0;font-size:12px}.cr-close{border:0;border-radius:11px;padding:9px 12px;background:#493249;color:#fff8df;font-weight:1000}.cr-body{min-height:0;overflow:auto;padding:14px 16px 18px;text-align:center;-webkit-overflow-scrolling:touch}.cr-copy{max-width:580px;margin:0 auto 12px;color:#dbcbdc;line-height:1.55}.cr-wheel-wrap{position:relative;width:min(390px,84vw);aspect-ratio:1;margin:0 auto 13px;display:grid;place-items:center}.cr-pointer{position:absolute;z-index:5;top:-3px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:18px solid transparent;border-right:18px solid transparent;border-top:0;border-bottom:36px solid #fff1aa;filter:drop-shadow(0 5px 2px rgba(0,0,0,.45))}.cr-wheel{position:relative;width:90%;aspect-ratio:1;border:8px solid #f4d27b;border-radius:50%;background:conic-gradient(from -15deg,${colors});box-shadow:0 0 0 5px #6e3c55,0 17px 35px rgba(0,0,0,.42),inset 0 0 32px rgba(0,0,0,.25);transition:transform ${SPIN_MS}ms cubic-bezier(.12,.72,.13,1);will-change:transform}.cr-wheel::after{content:'';position:absolute;inset:42%;border:5px solid #f4d27b;border-radius:50%;background:radial-gradient(circle,#fff1aa,#d77b91 55%,#5a304c 58%);box-shadow:0 4px 12px rgba(0,0,0,.45)}.cr-label{position:absolute;left:50%;top:50%;width:58px;margin-left:-29px;margin-top:-13px;text-align:center;font-weight:1000;font-size:11px;line-height:1.05;text-shadow:0 2px 2px rgba(0,0,0,.75);transform:rotate(var(--angle)) translateY(calc(clamp(118px,34vw,156px) * -1)) rotate(calc(var(--angle) * -1));pointer-events:none}.cr-label b{display:block;font-size:18px}.cr-spin{min-width:190px;border:0;border-radius:14px;padding:12px 18px;background:linear-gradient(180deg,#ffe987,#e9ac4e);color:#24131d;font-size:16px;font-weight:1000;box-shadow:0 6px 0 #86512f}.cr-spin:disabled{filter:grayscale(.4);opacity:.62;box-shadow:0 3px 0 #573822}.cr-wallet{margin:10px 0 0;color:#ffe16b;font-weight:1000}.cr-result{max-width:590px;margin:13px auto 0;padding:12px 14px;border:1px solid rgba(255,255,255,.12);border-radius:15px;background:rgba(0,0,0,.24);color:#9ce8f0;font-weight:900;line-height:1.55}.cr-result.win{color:#ffe16b}.cr-result.loss{color:#ff9fa8}.cr-legend{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;max-width:620px;margin:14px auto 0}.cr-legend span{padding:7px 5px;border-radius:10px;background:rgba(255,255,255,.055);font-size:10px;color:#cfc0d0}.cr-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 16px;border-top:1px solid rgba(255,255,255,.1);color:#c9b9c9;font-size:12px}.coral-roulette-open .mobile-controls,.coral-roulette-open #backpackSafeOpenBtn,.coral-roulette-open #fishingHub,.coral-roulette-open #seaMerchantEvent,.coral-roulette-open #pirateGamblingEvent{visibility:hidden!important;pointer-events:none!important}
      @media(max-width:700px){.cr-shell{border-radius:18px}.cr-head{padding:11px 12px}.cr-head h3{font-size:18px}.cr-body{padding:10px 10px 14px}.cr-wheel-wrap{width:min(330px,82vw)}.cr-label{transform:rotate(var(--angle)) translateY(calc(clamp(102px,33vw,132px) * -1)) rotate(calc(var(--angle) * -1));font-size:9px}.cr-label b{font-size:15px}.cr-legend{grid-template-columns:repeat(2,minmax(0,1fr))}.cr-footer{padding:9px 12px}}
      @media(prefers-reduced-motion:reduce){.cr-wheel{transition-duration:1200ms!important}}
    `;
    document.head.appendChild(style);
  }

  function ensurePanel() {
    let panel = document.getElementById(PANEL_ID);
    if (panel) return panel;
    panel = document.createElement('aside');
    panel.id = PANEL_ID;
    panel.className = 'hidden';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-label','珊瑚輪盤抽獎');
    document.body.appendChild(panel);
    return panel;
  }

  function labelsHtml() {
    return SEGMENTS.map((segment,index) => `<span class="cr-label" style="--angle:${index*SEGMENT_DEGREES}deg"><b>${segment.icon}</b>${escapeHtml(segment.short)}</span>`).join('');
  }

  function legendHtml() {
    return SEGMENTS.map(segment => `<span>${segment.icon} ${escapeHtml(segment.short)}</span>`).join('');
  }

  function render() {
    if (!active) return;
    const panel = ensurePanel();
    panel.innerHTML = `<section class="cr-shell"><header class="cr-head"><div><h3>🎡 珊瑚輪盤</h3><p>風險事件・每次相遇只能旋轉一次</p></div><button class="cr-close" type="button" ${active.spinning?'disabled':''}>關閉</button></header><main class="cr-body"><p class="cr-copy">古老珊瑚從海面升起。按下旋轉後，指針落在哪一格，就立即獲得該結果。</p><div class="cr-wheel-wrap"><span class="cr-pointer"></span><div class="cr-wheel" id="coralRouletteWheel" style="transform:rotate(${active.rotation}deg)">${labelsHtml()}</div></div><button class="cr-spin" id="coralRouletteSpin" type="button" ${active.spun||active.spinning?'disabled':''}>${active.spinning?'輪盤旋轉中…':active.spun?'本次已完成':'啟動珊瑚輪盤'}</button><p class="cr-wallet">目前持有 🦪 <span id="coralRouletteBalance">${formatNumber(balance())}</span> 珍珠</p><div class="cr-result ${active.resultClass || ''}" id="coralRouletteResult">${active.resultHtml || '限定掉落物只會從這座輪盤取得。'}</div><div class="cr-legend">${legendHtml()}</div></main><footer class="cr-footer"><span>輪盤結果由 12 個等分獎格決定。</span><button class="cr-close" type="button" ${active.spinning?'disabled':''}>${active.spun?'離開輪盤':'放棄並離開'}</button></footer></section>`;
  }

  function updateStats(segment,amount=0) {
    const state = rouletteState();
    state.spins += 1;
    state.lastCastId = active?.castId || '';
    if (segment.id === 'jackpot') state.jackpots += 1;
    if (segment.type === 'drop') state.uniqueDrops += 1;
    if (segment.type === 'gain') state.pearlsWon += amount;
    if (segment.type === 'loss') state.pearlsLost += amount;
    save(ROULETTE_STATE_KEY,state);
  }

  function settle(segment) {
    if (!active) return;
    let detail;
    if (segment.type === 'gain') {
      earn(segment.amount,`珊瑚輪盤：${segment.short}`);
      detail = {title:segment.id==='jackpot'?'珊瑚大獎':'珍珠獎勵',text:`指針停在「${segment.short}」，獲得 🦪 ${formatNumber(segment.amount)} 珍珠。`,html:`${segment.icon} 指針停在「${escapeHtml(segment.short)}」<br>獲得 🦪 ${formatNumber(segment.amount)} 珍珠`,className:'win',amount:segment.amount};
    } else if (segment.type === 'loss') {
      const lost = spend(segment.amount,`珊瑚輪盤：${segment.short}`);
      detail = {title:'珊瑚反噬',text:lost?`指針停在「${segment.short}」，損失 🦪 ${formatNumber(lost)} 珍珠。`:'指針落在損失格，但錢包裡沒有珍珠。',html:lost?`${segment.icon} 珊瑚輪盤發出暗光<br>損失 🦪 ${formatNumber(lost)} 珍珠`:`${segment.icon} 損失格沒有拿走任何東西`,className:'loss',amount:lost};
    } else if (segment.type === 'blessing') {
      addBlessing();
      detail = {title:'虹礁祝福',text:'獲得虹礁祝福：接下來 3 竿售價 ×1.5，事件機率 ×1.25。',html:'🌺 獲得「虹礁祝福」<br>接下來 3 竿提高售價與事件機率',className:'win',amount:0};
    } else {
      const item = addUniqueDrop(segment.drop,active.castId);
      detail = {title:'限定收藏品',text:`獲得 ${item.icon} ${item.name}［${item.rarity}・輪盤限定］，已放入背包。`,html:`${item.icon} 獲得限定掉落物<br>「${escapeHtml(item.name)}」［${escapeHtml(item.rarity)}］`,className:'win',amount:0};
    }
    updateStats(segment,detail.amount);
    pushResult(segment,detail);
    active.spinning = false;
    active.spun = true;
    active.resultHtml = detail.html;
    active.resultClass = detail.className;
    render();
  }

  function randomIndex() {
    if (window.crypto?.getRandomValues) {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return value[0] % SEGMENTS.length;
    }
    return Math.floor(Math.random()*SEGMENTS.length);
  }

  function spin() {
    if (!active || active.spinning || active.spun) return;
    active.spinning = true;
    const index = randomIndex();
    const target = (360 - index*SEGMENT_DEGREES) % 360;
    active.rotation = 360*7 + target;
    render();
    requestAnimationFrame(() => {
      const wheel = document.getElementById('coralRouletteWheel');
      if (wheel) wheel.style.transform = `rotate(${active.rotation}deg)`;
    });
    clearTimeout(spinTimer);
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    spinTimer = setTimeout(() => settle(SEGMENTS[index]),reduced?1300:SPIN_MS+120);
  }

  function close() {
    if (active?.spinning) return false;
    clearTimeout(spinTimer);
    ensurePanel().classList.add('hidden');
    document.body.classList.remove('coral-roulette-open');
    active = null;
    return true;
  }

  function closeCompetingEvents() {
    try { window.COFFEE_SHIP_SEA_MERCHANT?.close?.(''); } catch {}
    try { window.COFFEE_SHIP_PIRATE_GAMBLING?.close?.(''); } catch {}
  }

  function open(castId,forced=false) {
    if (active || !window.COFFEE_SHIP_DECK?.isDeckOpen?.()) return false;
    closeCompetingEvents();
    active = {castId:castId || `coral_test_${Date.now()}`,rotation:0,spinning:false,spun:false,resultHtml:'',resultClass:''};
    render();
    ensurePanel().classList.remove('hidden');
    document.body.classList.add('coral-roulette-open');
    if (forced) {
      active.resultHtml = '測試模式：輪盤由系統手動開啟。';
      render();
    }
    return true;
  }

  function installEventPatch() {
    const api = window.COFFEE_SHIP_FISHING_ADVENTURES;
    const event = api?.events?.find(row => row.id === 'coral_roulette');
    if (!event) return false;
    event.effect = 'mixed';
    event.actions = [];
    event.text = '古老珊瑚輪盤浮上海面，等待你親手啟動並接受指針決定的結果。';
    event.interactive = true;
    event.rouletteVersion = 1;
    return true;
  }

  function checkCast(castId) {
    if (!castId || processedCastIds.has(castId)) return;
    const rows = window.COFFEE_SHIP_FISHING_ADVENTURES?.log?.() || [];
    const found = rows.find(row => row?.id === 'coral_roulette' && row?.castId === castId);
    if (!found) return;
    processedCastIds.add(castId);
    setTimeout(() => open(castId),80);
  }

  function processFishingResult(event) {
    const castId = event.detail?.castId;
    if (!castId) return;
    [90,220,480].forEach(delay => setTimeout(() => checkCast(castId),delay));
  }

  function bind() {
    document.addEventListener('click',event => {
      if (!event.target.closest?.(`#${PANEL_ID}`)) return;
      if (event.target.closest('#coralRouletteSpin')) { event.preventDefault(); spin(); return; }
      if (event.target.closest('.cr-close')) { event.preventDefault(); close(); }
    },true);
    window.addEventListener('coffee-ship:fishing-result',processFishingResult);
    window.addEventListener('coffee-ship:fishing-adventures-ready',installEventPatch);
    window.addEventListener('coffee-ship:fishing-adventure-expanded',installEventPatch);
    window.addEventListener('coffee-ship:economy-changed',() => {
      const node = document.getElementById('coralRouletteBalance');
      if (node) node.textContent = formatNumber(balance());
    });
    window.addEventListener('coffee-ship:scene',event => {
      if (event.detail?.scene !== 'deck' && active && !active.spinning) close();
    });
  }

  function init() {
    addStyle();
    ensurePanel();
    bind();
    installEventPatch();
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (installEventPatch() || attempts > 24) clearInterval(timer);
    },250);
    window.COFFEE_SHIP_CORAL_ROULETTE = {open:() => open(window.COFFEE_SHIP_FISHING_API?.getCurrentCastId?.() || `coral_test_${Date.now()}`,true),close,state:rouletteState,segments:SEGMENTS,drops:UNIQUE_DROPS,version:1};
    window.dispatchEvent(new CustomEvent('coffee-ship:coral-roulette-ready',{detail:{segments:SEGMENTS.length,drops:Object.keys(UNIQUE_DROPS).length,version:1}}));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
