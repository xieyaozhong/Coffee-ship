(() => {
  'use strict';
  if (window.__COFFEE_SHIP_SEA_MERCHANT_V1__) return;
  window.__COFFEE_SHIP_SEA_MERCHANT_V1__ = true;

  const PANEL_ID = 'seaMerchantEvent';
  const STYLE_ID = 'seaMerchantEventStyle';
  const STATE_KEY = 'coffeeShipSeaMerchantState';
  const ADVENTURE_STATE_KEY = 'coffeeShipFishingAdventureState';
  const BAG_KEY = 'coffeeShipFishBag';
  const MAX_BAG = 240;
  const MIN_CASTS_BETWEEN_VISITS = 4;
  const MIN_TIME_BETWEEN_VISITS = 90 * 1000;
  const BASE_CHANCE = .09;
  const VISIT_SECONDS = 45;

  const OFFERS = [
    {
      id:'deep_bait',icon:'🪱',name:'深海特製魚餌',price:38,tone:'#79d0b1',
      description:'濃烈氣味會吸引大型魚群。接下來 3 竿重量提高。',
      action:'effect',effect:{id:'merchant_deep_bait',label:'深海特製魚餌',type:'weight',mult:1.45,casts:3}
    },
    {
      id:'valuation_ticket',icon:'🎫',name:'商會估價券',price:52,tone:'#ffe16b',
      description:'潮汐商會替你抬高行情。接下來 3 竿售價提高。',
      action:'effect',effect:{id:'merchant_valuation',label:'商會估價',type:'value',mult:1.55,casts:3}
    },
    {
      id:'silver_hook',icon:'🪝',name:'幸運銀鉤',price:45,tone:'#9ce8f0',
      description:'經過商人祝福的銀鉤。接下來 2 竿品質提升。',
      action:'effect',effect:{id:'merchant_silver_hook',label:'幸運銀鉤',type:'quality',mult:1,casts:2}
    },
    {
      id:'turtle_seal',icon:'🐢',name:'海龜保險章',price:60,tone:'#86dfbf',
      description:'海龜商會承保漁獲。接下來 4 竿可抵擋逃脫與物品損失。',
      action:'effect',effect:{id:'merchant_turtle_seal',label:'海龜保險章',type:'protect',mult:1,casts:4}
    },
    {
      id:'trade_compass',icon:'🧭',name:'潮路羅盤',price:48,tone:'#b9a4e6',
      description:'指向熱鬧海域的羅盤。接下來 4 竿更容易遇到冒險事件。',
      action:'effect',effect:{id:'merchant_trade_compass',label:'潮路羅盤',type:'event',mult:1.5,casts:4}
    },
    {
      id:'mystery_crate',icon:'📦',name:'神秘打撈箱',price:42,tone:'#f2a957',
      description:'封條完整的未知貨箱，打開後會獲得一件可收藏或販售的海上貨物。',
      action:'crate'
    }
  ];

  const CRATE_LOOT = [
    {icon:'🧿',name:'潮汐藍眼護符',rarity:'史詩',sellPrice:88,trait:'商船從濃霧海域帶回的護符，表面總有冰冷水氣。'},
    {icon:'🔔',name:'遠洋銅鈴',rarity:'稀有',sellPrice:58,trait:'沒有風吹時仍會輕響，據說能提醒船員避開暗礁。'},
    {icon:'🪙',name:'舊航路紀念幣',rarity:'稀有',sellPrice:64,trait:'幣面刻著已從海圖消失的航線。'},
    {icon:'🧵',name:'月光防水銀線',rarity:'史詩',sellPrice:92,trait:'在月光下會顯現細小星點，是高級船帆的修補材料。'},
    {icon:'🫙',name:'瓶裝順風',rarity:'史詩',sellPrice:105,trait:'打開瓶塞時，能聽見一陣來自遠海的順風。'}
  ];

  let currentVisit = null;
  let countdownTimer = 0;
  let queued = false;

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
  }

  function merchantState() {
    const value = read(STATE_KEY,{castsSince:99,lastSeenAt:0,visits:0,purchases:0});
    value.castsSince = Math.max(0,Number(value.castsSince || 0));
    value.lastSeenAt = Math.max(0,Number(value.lastSeenAt || 0));
    value.visits = Math.max(0,Number(value.visits || 0));
    value.purchases = Math.max(0,Number(value.purchases || 0));
    return value;
  }

  function economy() {
    return window.COFFEE_SHIP_ECONOMY || null;
  }

  function balance() {
    return economy()?.balance?.() ?? Math.max(0,Number(localStorage.getItem('coffeeShipPearls') || 0));
  }

  function spend(amount, reason) {
    const price = Math.max(0,Math.floor(Number(amount) || 0));
    if (economy()?.spend) return economy().spend(price,reason,{source:'sea-merchant'});
    const current = balance();
    if (current < price) return {ok:false,balance:current,needed:price-current,spent:0};
    const next = current - price;
    localStorage.setItem('coffeeShipPearls',String(next));
    window.dispatchEvent(new CustomEvent('coffeeShipPearlsChanged',{detail:{pearls:next,balance:next,delta:-price,reason}}));
    return {ok:true,balance:next,spent:price};
  }

  function isDeckOpen() {
    return !!window.COFFEE_SHIP_DECK?.isDeckOpen?.();
  }

  function eventChance() {
    return economy()?.eventChance?.(BASE_CHANCE,'special') ?? BASE_CHANCE;
  }

  function sampleOffers(count = 3) {
    const rows = OFFERS.slice();
    for (let index = rows.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [rows[index],rows[target]] = [rows[target],rows[index]];
    }
    return rows.slice(0,count);
  }

  function addEffect(effect) {
    const state = read(ADVENTURE_STATE_KEY,{effects:[],stats:{}});
    state.effects = Array.isArray(state.effects) ? state.effects : [];
    state.stats = state.stats || {};
    const existing = state.effects.find(row => row?.id === effect.id);
    if (existing) {
      existing.casts = Math.max(Number(existing.casts || 0),Number(effect.casts || 1));
      existing.mult = Number(effect.mult ?? existing.mult ?? 1);
      existing.label = effect.label || existing.label;
      existing.type = effect.type || existing.type;
    } else {
      state.effects.push({...effect,casts:Math.max(1,Number(effect.casts || 1))});
    }
    state.effects = state.effects.filter(row => Number(row?.casts || 0) > 0).slice(-24);
    save(ADVENTURE_STATE_KEY,state);
    window.dispatchEvent(new CustomEvent('coffee-ship:fishing-adventure-state',{detail:{state}}));
    return effect.label;
  }

  function openCrate(castId) {
    const loot = CRATE_LOOT[Math.floor(Math.random() * CRATE_LOOT.length)];
    const item = {
      ...loot,
      quality:'拾獲',kind:'treasure',group:'merchant',zone:'海上商人',
      weight:.15 + Math.random() * 1.35,castId,at:Date.now(),source:'sea-merchant'
    };
    const bag = read(BAG_KEY,[]);
    const safeBag = Array.isArray(bag) ? bag : [];
    safeBag.push(item);
    save(BAG_KEY,safeBag.slice(-MAX_BAG));
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'sea-merchant',item}}));
    return item;
  }

  function pushEvent(title,text,icon='🛶',castId=currentVisit?.castId) {
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({
      castId,
      eventKind:'special',
      title:`海上商人｜${title}`,
      icon,
      accent:'#f2a957',
      text
    });
  }

  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${PANEL_ID}{position:fixed;inset:0;z-index:46000;display:grid;place-items:center;padding:calc(12px + env(safe-area-inset-top)) 12px calc(12px + env(safe-area-inset-bottom));background:rgba(7,5,13,.78);backdrop-filter:blur(8px);box-sizing:border-box;color:#fff4d8}
      #${PANEL_ID}.hidden{display:none!important}.sm-card{width:min(720px,100%);max-height:min(760px,calc(100vh - 24px));display:flex;flex-direction:column;overflow:hidden;border:3px solid #d7a968;border-radius:24px;background:linear-gradient(155deg,#34253c,#130e1b 72%);box-shadow:0 22px 70px rgba(0,0,0,.58),0 8px 0 #08050d}
      .sm-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 16px;border-bottom:1px solid rgba(255,255,255,.1);background:linear-gradient(180deg,rgba(242,169,87,.18),transparent)}.sm-title{display:flex;align-items:center;gap:11px;min-width:0}.sm-portrait{display:grid;place-items:center;width:50px;height:50px;flex:0 0 auto;border:2px solid #f2a957;border-radius:15px;background:#211728;font-size:28px;box-shadow:0 5px 0 rgba(0,0,0,.3)}.sm-title h3{margin:0;font-size:21px}.sm-title p{margin:3px 0 0;color:#d7bb79;font-size:12px}.sm-close{border:0;border-radius:12px;padding:9px 12px;background:#493249;color:#fff4d8;font-weight:1000;box-shadow:0 4px 0 rgba(0,0,0,.3)}
      .sm-status{display:flex;align-items:center;justify-content:space-between;gap:9px;padding:10px 16px;background:#17101f;color:#d8c8b4;font-size:13px;font-weight:900}.sm-wallet{color:#ffe16b;white-space:nowrap}.sm-body{min-height:0;overflow-y:auto;padding:13px 15px 16px;-webkit-overflow-scrolling:touch}.sm-copy{margin:0 0 12px;line-height:1.55;color:#e8dccb}.sm-offers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.sm-offer{display:flex;flex-direction:column;min-height:230px;padding:13px;border:2px solid var(--sm-tone,#f2a957);border-radius:17px;background:linear-gradient(155deg,rgba(58,39,64,.96),rgba(25,17,32,.98));box-shadow:0 7px 0 rgba(0,0,0,.25)}.sm-offer-icon{font-size:32px}.sm-offer h4{margin:8px 0 5px;font-size:17px}.sm-offer p{flex:1;margin:0;color:#d8c8b4;font-size:13px;line-height:1.5}.sm-buy{margin-top:12px;border:0;border-radius:12px;padding:10px 8px;background:var(--sm-tone,#f2a957);color:#17101f;font-weight:1000;box-shadow:0 5px 0 rgba(0,0,0,.32)}.sm-buy:disabled{filter:grayscale(.35);opacity:.55;box-shadow:0 3px 0 rgba(0,0,0,.22)}.sm-notice{min-height:22px;margin:11px 0 0;padding:8px 10px;border-radius:11px;background:rgba(0,0,0,.22);color:#9ce8f0;font-size:13px;font-weight:900}.sm-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 16px;border-top:1px solid rgba(255,255,255,.1);color:#c9b9c9;font-size:12px}.sm-leave{border:0;border-radius:11px;padding:9px 13px;background:#493249;color:#fff4d8;font-weight:1000}.sea-merchant-open .mobile-controls,.sea-merchant-open #backpackSafeOpenBtn,.sea-merchant-open #fishingHub{visibility:hidden!important;pointer-events:none!important}
      @media(max-width:700px){#${PANEL_ID}{padding:calc(7px + env(safe-area-inset-top)) 7px calc(7px + env(safe-area-inset-bottom))}.sm-card{max-height:calc(100vh - 14px);border-radius:19px}.sm-head{padding:12px}.sm-portrait{width:43px;height:43px;font-size:24px}.sm-title h3{font-size:18px}.sm-status{padding:8px 12px}.sm-body{padding:11px 12px 14px}.sm-offers{grid-template-columns:1fr}.sm-offer{min-height:0}.sm-offer p{min-height:42px}.sm-foot{padding:10px 12px}}
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
    panel.setAttribute('aria-label','海上商人事件');
    document.body.appendChild(panel);
    return panel;
  }

  function render() {
    if (!currentVisit) return;
    const panel = ensurePanel();
    const offers = currentVisit.offers;
    panel.innerHTML = `
      <section class="sm-card">
        <header class="sm-head"><div class="sm-title"><span class="sm-portrait">🛶</span><div><h3>潮汐商人・洛克</h3><p>「海上沒有固定價格，只有剛好的相遇。」</p></div></div><button class="sm-close" type="button">關閉</button></header>
        <div class="sm-status"><span id="seaMerchantTimer">商船將停留 ${currentVisit.secondsLeft} 秒</span><span class="sm-wallet">🦪 <b id="seaMerchantBalance">${balance()}</b> 珍珠</span></div>
        <div class="sm-body"><p class="sm-copy">一艘掛滿燈籠的小艇靠近 Coffee Ship。商人打開防水貨箱，今天只展示三件商品。</p><div class="sm-offers">${offers.map(offer => `
          <article class="sm-offer" style="--sm-tone:${offer.tone}"><span class="sm-offer-icon">${escapeHtml(offer.icon)}</span><h4>${escapeHtml(offer.name)}</h4><p>${escapeHtml(offer.description)}</p><button class="sm-buy" type="button" data-merchant-buy="${escapeHtml(offer.id)}" ${currentVisit.bought.has(offer.id) ? 'disabled' : ''}>${currentVisit.bought.has(offer.id) ? '已購買' : `🦪 ${offer.price} 購買`}</button></article>`).join('')}</div><div class="sm-notice" id="seaMerchantNotice">可以購買多件商品，售完為止。</div></div>
        <footer class="sm-foot"><span>商品與價格會在下一次相遇時更換。</span><button class="sm-leave" type="button">讓商船離開</button></footer>
      </section>`;
  }

  function setNotice(text,isError=false) {
    const notice = document.getElementById('seaMerchantNotice');
    if (!notice) return;
    notice.textContent = text;
    notice.style.color = isError ? '#ff9b9b' : '#9ce8f0';
  }

  function updateBalance() {
    const node = document.getElementById('seaMerchantBalance');
    if (node) node.textContent = String(balance());
  }

  function buy(offerId) {
    if (!currentVisit || currentVisit.bought.has(offerId)) return;
    const offer = currentVisit.offers.find(row => row.id === offerId);
    if (!offer) return;

    const payment = spend(offer.price,`海上商人：${offer.name}`);
    if (!payment.ok) {
      setNotice(`珍珠不足，還需要 ${payment.needed || offer.price} 顆。`,true);
      return;
    }

    let resultText = '';
    if (offer.action === 'effect') {
      addEffect(offer.effect);
      resultText = `獲得「${offer.effect.label}」效果，共 ${offer.effect.casts} 竿。`;
    } else if (offer.action === 'crate') {
      const item = openCrate(currentVisit.castId);
      resultText = `打開貨箱，獲得 ${item.icon} ${item.name}［${item.rarity}］。`;
    }

    currentVisit.bought.add(offer.id);
    const state = merchantState();
    state.purchases += 1;
    save(STATE_KEY,state);
    pushEvent('交易完成',`${offer.icon} ${offer.name}\n支付 🦪 ${offer.price} 珍珠\n${resultText}`,offer.icon,currentVisit.castId);
    render();
    setNotice(resultText);
    updateBalance();
  }

  function close(reason='商船駛離') {
    clearInterval(countdownTimer);
    countdownTimer = 0;
    const panel = ensurePanel();
    panel.classList.add('hidden');
    document.body.classList.remove('sea-merchant-open');
    if (currentVisit && reason) setTimeout(() => window.COFFEE_SHIP_DECK?.showTip?.(`🛶 ${reason}`,1600),20);
    currentVisit = null;
  }

  function startCountdown() {
    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      if (!currentVisit) return clearInterval(countdownTimer);
      currentVisit.secondsLeft -= 1;
      const timer = document.getElementById('seaMerchantTimer');
      if (timer) timer.textContent = `商船將停留 ${Math.max(0,currentVisit.secondsLeft)} 秒`;
      if (currentVisit.secondsLeft <= 0) close('海上商人收起貨箱，駛入霧中');
    },1000);
  }

  function openMerchant(castId,forced=false) {
    if (currentVisit || !isDeckOpen()) return false;
    currentVisit = {castId:castId || `merchant_${Date.now()}`,offers:sampleOffers(3),bought:new Set(),secondsLeft:VISIT_SECONDS};
    const state = merchantState();
    state.castsSince = 0;
    state.lastSeenAt = Date.now();
    state.visits += 1;
    save(STATE_KEY,state);
    render();
    ensurePanel().classList.remove('hidden');
    document.body.classList.add('sea-merchant-open');
    pushEvent('神秘商船靠近','掛著琥珀色燈籠的小艇靠近甲板。商人洛克帶來三件限時商品。','🛶',currentVisit.castId);
    startCountdown();
    if (forced) setNotice('測試模式：本次商人事件由系統手動開啟。');
    return true;
  }

  function processFishingResult(event) {
    const detail = event.detail || {};
    if (!detail.item || !detail.castId) return;
    const state = merchantState();
    state.castsSince += 1;
    save(STATE_KEY,state);
    if (currentVisit || !isDeckOpen()) return;
    if (state.castsSince < MIN_CASTS_BETWEEN_VISITS) return;
    if (Date.now() - state.lastSeenAt < MIN_TIME_BETWEEN_VISITS) return;
    if (Math.random() > eventChance()) return;
    setTimeout(() => openMerchant(detail.castId),550);
  }

  function bind() {
    document.addEventListener('click',event => {
      if (!event.target.closest?.(`#${PANEL_ID}`)) return;
      const buyButton = event.target.closest('[data-merchant-buy]');
      if (buyButton) { event.preventDefault(); buy(buyButton.dataset.merchantBuy); return; }
      if (event.target.closest('.sm-close,.sm-leave')) { event.preventDefault(); close('海上商人向你揮手告別'); }
    },true);
    window.addEventListener('coffee-ship:fishing-result',processFishingResult);
    window.addEventListener('coffee-ship:scene',event => { if (event.detail?.scene !== 'deck' && currentVisit) close('商船離開了目前海域'); });
    window.addEventListener('coffee-ship:economy-changed',updateBalance);
  }

  function init() {
    addStyle();
    ensurePanel();
    bind();
    window.COFFEE_SHIP_SEA_MERCHANT = {
      open:() => openMerchant(window.COFFEE_SHIP_FISHING_API?.getCurrentCastId?.() || `merchant_test_${Date.now()}`,true),
      close,
      state:merchantState,
      offers:OFFERS,
      version:1
    };
    window.dispatchEvent(new CustomEvent('coffee-ship:sea-merchant-ready',{detail:{offers:OFFERS.length,version:1}}));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
