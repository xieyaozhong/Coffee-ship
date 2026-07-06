(() => {
  'use strict';
  if (window.__COFFEE_SHIP_SEA_MERCHANT_V2__) return;
  window.__COFFEE_SHIP_SEA_MERCHANT_V2__ = true;

  const PANEL_ID = 'seaMerchantEvent';
  const STYLE_ID = 'seaMerchantEventStyleV2';
  const STATE_KEY = 'coffeeShipSeaMerchantState';
  const ADVENTURE_STATE_KEY = 'coffeeShipFishingAdventureState';
  const BAG_KEY = 'coffeeShipFishBag';
  const MAX_BAG = 240;
  const MIN_CASTS_BETWEEN_VISITS = 4;
  const MIN_TIME_BETWEEN_VISITS = 90 * 1000;
  const BASE_CHANCE = .09;
  const VISIT_SECONDS = 45;

  const REGULAR_OFFERS = [
    {
      id:'deep_bait',icon:'🪱',name:'深海特製魚餌',price:38,tone:'#79d0b1',category:'實用道具',
      description:'接下來 3 竿重量提高。',action:'effect',
      effect:{id:'merchant_deep_bait',label:'深海特製魚餌',type:'weight',mult:1.45,casts:3}
    },
    {
      id:'valuation_ticket',icon:'🎫',name:'商會估價券',price:52,tone:'#ffe16b',category:'實用道具',
      description:'接下來 3 竿售價提高。',action:'effect',
      effect:{id:'merchant_valuation',label:'商會估價',type:'value',mult:1.55,casts:3}
    },
    {
      id:'silver_hook',icon:'🪝',name:'幸運銀鉤',price:45,tone:'#9ce8f0',category:'實用道具',
      description:'接下來 2 竿品質提升。',action:'effect',
      effect:{id:'merchant_silver_hook',label:'幸運銀鉤',type:'quality',mult:1,casts:2}
    },
    {
      id:'turtle_seal',icon:'🐢',name:'海龜保險章',price:60,tone:'#86dfbf',category:'實用道具',
      description:'接下來 4 竿抵擋逃脫與物品損失。',action:'effect',
      effect:{id:'merchant_turtle_seal',label:'海龜保險章',type:'protect',mult:1,casts:4}
    },
    {
      id:'trade_compass',icon:'🧭',name:'潮路羅盤',price:48,tone:'#b9a4e6',category:'實用道具',
      description:'接下來 4 竿更容易遇到冒險事件。',action:'effect',
      effect:{id:'merchant_trade_compass',label:'潮路羅盤',type:'event',mult:1.5,casts:4}
    },
    {
      id:'mystery_crate',icon:'📦',name:'神秘打撈箱',price:42,tone:'#f2a957',category:'打撈貨箱',
      description:'打開後獲得一件可收藏或販售的海上貨物。',action:'crate'
    }
  ];

  const COLLECTIONS = [
    {id:'whale_song_record',icon:'💿',name:'初版鯨歌黑膠唱片',rarity:'傳說',price:18000,sellPrice:7200,weight:18,trait:'母盤播放時，附近水杯會泛起細小波紋。'},
    {id:'royal_coffee_cup',icon:'🏺',name:'皇家咖啡航海瓷杯',rarity:'傳說',price:32000,sellPrice:12800,weight:17,trait:'舊王國旗艦使用的金邊瓷杯，仍留著咖啡香。'},
    {id:'first_tide_badge',icon:'🎖️',name:'初代潮汐商會徽章',rarity:'傳說',price:58000,sellPrice:23200,weight:15,trait:'商會成立時鑄造，背面刻有失傳的海上暗語。'},
    {id:'eternal_ship_lamp',icon:'🏮',name:'永不熄滅的船燈',rarity:'神話',price:88888,sellPrice:35555,weight:12,trait:'沒有火焰，卻會在迷航時自行亮起。'},
    {id:'old_god_figurehead',icon:'🗿',name:'舊神船首像碎片',rarity:'神話',price:128000,sellPrice:51200,weight:10,trait:'靠近耳邊時，能聽到木頭深處的低沉潮聲。'},
    {id:'sunken_kingdom_crown',icon:'👑',name:'沉沒王國的金冠',rarity:'神話',price:188888,sellPrice:75555,weight:8,trait:'寶石排列與現代星圖完全一致。'},
    {id:'end_of_world_chart',icon:'🗺️',name:'世界盡頭航海圖',rarity:'神話',price:250000,sellPrice:100000,weight:6,trait:'最遠端標註著「返航者不得言說」。'},
    {id:'abyss_blue_diamond_compass',icon:'💎',name:'深淵藍鑽羅盤',rarity:'世界級',price:388888,sellPrice:155555,weight:4,trait:'指針會指向持有者最渴望找到的事物。'},
    {id:'star_sea_hourglass',icon:'⌛',name:'星海倒流沙漏',rarity:'世界級',price:588888,sellPrice:235555,weight:3,trait:'銀色砂粒會從下方緩慢升起。'},
    {id:'moon_sea_queen_pearl',icon:'🔮',name:'月海女王珍珠',rarity:'世界級',price:888888,sellPrice:355555,weight:1,trait:'珠心會浮現沉睡王城的倒影。'}
  ].map(item => ({
    ...item,
    action:'collection',
    category:`${item.rarity}典藏`,
    tone:({傳說:'#ffe16b',神話:'#f2a957',世界級:'#ff72bc'})[item.rarity] || '#ffe16b',
    description:item.trait
  }));

  const CRATE_LOOT = [
    {icon:'🧿',name:'潮汐藍眼護符',rarity:'史詩',sellPrice:88,trait:'表面總有冰冷水氣。'},
    {icon:'🔔',name:'遠洋銅鈴',rarity:'稀有',sellPrice:58,trait:'沒有風吹時仍會輕響。'},
    {icon:'🪙',name:'舊航路紀念幣',rarity:'稀有',sellPrice:64,trait:'幣面刻著已消失的航線。'},
    {icon:'🧵',name:'月光防水銀線',rarity:'史詩',sellPrice:92,trait:'月光下會顯現細小星點。'},
    {icon:'🫙',name:'瓶裝順風',rarity:'史詩',sellPrice:105,trait:'能聽見一陣來自遠海的順風。'}
  ];

  let currentVisit = null;
  let countdownTimer = 0;

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

  function formatPrice(value) {
    return Math.max(0,Math.floor(Number(value) || 0)).toLocaleString('zh-TW');
  }

  function merchantState() {
    const value = read(STATE_KEY,{castsSince:99,lastSeenAt:0,visits:0,purchases:0});
    for (const key of ['castsSince','lastSeenAt','visits','purchases']) value[key] = Math.max(0,Number(value[key] || 0));
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

  function bag() {
    const value = read(BAG_KEY,[]);
    return Array.isArray(value) ? value : [];
  }

  function ownedCollectionIds() {
    return new Set(bag().map(item => item?.merchantCollectionId || item?.collectionId).filter(Boolean));
  }

  function isDeckOpen() {
    return !!window.COFFEE_SHIP_DECK?.isDeckOpen?.();
  }

  function eventChance() {
    return economy()?.eventChance?.(BASE_CHANCE,'special') ?? BASE_CHANCE;
  }

  function shuffle(rows) {
    const output = rows.slice();
    for (let index = output.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [output[index],output[target]] = [output[target],output[index]];
    }
    return output;
  }

  function weightedPick(rows) {
    const total = rows.reduce((sum,row) => sum + Math.max(0,Number(row.weight || 1)),0);
    let roll = Math.random() * total;
    for (const row of rows) {
      roll -= Math.max(0,Number(row.weight || 1));
      if (roll <= 0) return row;
    }
    return rows[rows.length - 1];
  }

  function sampleOffers() {
    const regular = shuffle(REGULAR_OFFERS).slice(0,2);
    const owned = ownedCollectionIds();
    const unownedCollections = COLLECTIONS.filter(item => !owned.has(item.id));
    const premium = unownedCollections.length ? weightedPick(unownedCollections) : shuffle(REGULAR_OFFERS.filter(item => !regular.some(row => row.id === item.id)))[0];
    return shuffle([...regular,premium].filter(Boolean)).slice(0,3);
  }

  function addEffect(effect) {
    const state = read(ADVENTURE_STATE_KEY,{effects:[],stats:{}});
    state.effects = Array.isArray(state.effects) ? state.effects : [];
    state.stats = state.stats || {};
    const existing = state.effects.find(row => row?.id === effect.id);
    if (existing) Object.assign(existing,effect,{casts:Math.max(Number(existing.casts || 0),Number(effect.casts || 1))});
    else state.effects.push({...effect,casts:Math.max(1,Number(effect.casts || 1))});
    state.effects = state.effects.filter(row => Number(row?.casts || 0) > 0).slice(-24);
    save(ADVENTURE_STATE_KEY,state);
    window.dispatchEvent(new CustomEvent('coffee-ship:fishing-adventure-state',{detail:{state}}));
  }

  function addBagItem(item, source) {
    const items = bag();
    items.push(item);
    save(BAG_KEY,items.slice(-MAX_BAG));
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source,item}}));
    return item;
  }

  function openCrate(castId) {
    const loot = CRATE_LOOT[Math.floor(Math.random() * CRATE_LOOT.length)];
    return addBagItem({
      ...loot,quality:'拾獲',kind:'treasure',group:'merchant',zone:'海上商人',
      weight:.15 + Math.random()*1.35,castId,at:Date.now(),source:'sea-merchant'
    },'sea-merchant');
  }

  function addCollection(offer, castId) {
    return addBagItem({
      merchantCollectionId:offer.id,collectionId:offer.id,icon:offer.icon,name:offer.name,
      rarity:offer.rarity,quality:'典藏',kind:'treasure',group:'merchant-collection',
      zone:'潮汐商人典藏庫',trait:offer.trait,purchasePrice:offer.price,sellPrice:offer.sellPrice,
      weight:.08,unique:true,castId,source:'sea-merchant-collection',at:Date.now()
    },'sea-merchant-collection');
  }

  function pushEvent(title,text,icon='🛶',castId=currentVisit?.castId) {
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({castId,eventKind:'special',title:`海上商人｜${title}`,icon,accent:'#f2a957',text});
  }

  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${PANEL_ID}{position:fixed;inset:0;z-index:46000;display:grid;place-items:center;padding:calc(10px + env(safe-area-inset-top)) 10px calc(10px + env(safe-area-inset-bottom));background:rgba(7,5,13,.78);backdrop-filter:blur(6px);box-sizing:border-box;color:#fff4d8}
      #${PANEL_ID}.hidden{display:none!important}.sm-card{width:min(760px,100%);max-height:calc(100vh - 20px);display:flex;flex-direction:column;overflow:hidden;border:3px solid #d7a968;border-radius:22px;background:linear-gradient(155deg,#34253c,#130e1b 72%);box-shadow:0 20px 55px rgba(0,0,0,.52),0 7px 0 #08050d}
      .sm-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 15px;border-bottom:1px solid rgba(255,255,255,.1);background:rgba(242,169,87,.1)}.sm-title{display:flex;align-items:center;gap:10px;min-width:0}.sm-portrait{display:grid;place-items:center;width:46px;height:46px;flex:0 0 auto;border:2px solid #f2a957;border-radius:14px;background:#211728;font-size:25px}.sm-title h3{margin:0;font-size:20px}.sm-title p{margin:3px 0 0;color:#d7bb79;font-size:12px}.sm-close,.sm-leave{border:0;border-radius:11px;padding:9px 12px;background:#493249;color:#fff4d8;font-weight:1000}
      .sm-status{display:flex;align-items:center;justify-content:space-between;gap:9px;padding:8px 15px;background:#17101f;color:#d8c8b4;font-size:13px;font-weight:900}.sm-wallet{color:#ffe16b;white-space:nowrap}.sm-body{min-height:0;overflow-y:auto;padding:12px 14px 15px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}.sm-copy{margin:0 0 11px;color:#e8dccb;line-height:1.5}.sm-offers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.sm-offer{position:relative;display:flex;flex-direction:column;min-height:228px;padding:13px;border:2px solid var(--sm-tone,#f2a957);border-radius:16px;background:linear-gradient(155deg,#3a2940,#191120);box-shadow:0 6px 0 rgba(0,0,0,.24);overflow:hidden;contain:content}.sm-offer.is-collection{background:linear-gradient(155deg,#483342,#191120)}.sm-offer.is-collection::after{content:'COLLECTOR';position:absolute;right:-25px;top:18px;transform:rotate(38deg);padding:3px 28px;background:rgba(255,225,107,.13);color:rgba(255,240,190,.6);font-size:8px;font-weight:1000;letter-spacing:.12em}.sm-offer-icon{font-size:31px}.sm-offer h4{margin:7px 0 5px;font-size:16px}.sm-kind{display:inline-flex;align-self:flex-start;margin-bottom:7px;padding:3px 7px;border-radius:999px;background:rgba(255,255,255,.08);color:var(--sm-tone,#ffe16b);font-size:10px;font-weight:1000}.sm-offer p{flex:1;margin:0;color:#d8c8b4;font-size:12px;line-height:1.48}.sm-resale{display:block;margin-top:7px;color:#a998aa;font-size:10px}.sm-buy{margin-top:11px;border:0;border-radius:11px;padding:10px 7px;background:var(--sm-tone,#f2a957);color:#17101f;font-weight:1000;box-shadow:0 4px 0 rgba(0,0,0,.3)}.sm-buy:disabled{filter:grayscale(.4);opacity:.55;box-shadow:none}.sm-notice{min-height:21px;margin:10px 0 0;padding:8px 10px;border-radius:10px;background:rgba(0,0,0,.2);color:#9ce8f0;font-size:12px;font-weight:900}.sm-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 15px;border-top:1px solid rgba(255,255,255,.1);color:#c9b9c9;font-size:12px}.sea-merchant-open .mobile-controls,.sea-merchant-open #backpackSafeOpenBtn,.sea-merchant-open #fishingHub{visibility:hidden!important;pointer-events:none!important}
      @media(max-width:700px){#${PANEL_ID}{padding:calc(6px + env(safe-area-inset-top)) 6px calc(6px + env(safe-area-inset-bottom));backdrop-filter:none;background:rgba(7,5,13,.9)}.sm-card{max-height:calc(100vh - 12px);border-radius:17px;box-shadow:0 10px 25px rgba(0,0,0,.45)}.sm-head{padding:10px 11px}.sm-portrait{width:40px;height:40px;font-size:22px}.sm-title h3{font-size:17px}.sm-status{padding:7px 11px}.sm-body{padding:9px 10px 12px}.sm-offers{grid-template-columns:1fr;gap:8px}.sm-offer{min-height:0;padding:11px;contain:layout paint}.sm-offer p{min-height:36px}.sm-foot{padding:8px 11px}}
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

  function offerHtml(offer) {
    const bought = currentVisit.bought.has(offer.id);
    const collection = offer.action === 'collection';
    const resale = collection ? `<small class="sm-resale">回收價：🦪 ${formatPrice(offer.sellPrice)}</small>` : '';
    return `<article class="sm-offer ${collection?'is-collection':''}" style="--sm-tone:${offer.tone}"><span class="sm-offer-icon">${escapeHtml(offer.icon)}</span><h4>${escapeHtml(offer.name)}</h4><span class="sm-kind">${escapeHtml(offer.category)}</span><p>${escapeHtml(offer.description)}</p>${resale}<button class="sm-buy" type="button" data-merchant-buy="${escapeHtml(offer.id)}" ${bought?'disabled':''}>${bought?'已購買':`🦪 ${formatPrice(offer.price)} 購買`}</button></article>`;
  }

  function render() {
    if (!currentVisit) return;
    const panel = ensurePanel();
    panel.innerHTML = `<section class="sm-card"><header class="sm-head"><div class="sm-title"><span class="sm-portrait">🛶</span><div><h3>潮汐商人・洛克</h3><p>「海上沒有固定價格，只有剛好的相遇。」</p></div></div><button class="sm-close" type="button">關閉</button></header><div class="sm-status"><span id="seaMerchantTimer">商船將停留 ${currentVisit.secondsLeft} 秒</span><span class="sm-wallet">🦪 <b id="seaMerchantBalance">${formatPrice(balance())}</b> 珍珠</span></div><div class="sm-body"><p class="sm-copy">本次只展示三件商品，其中包含兩件實用品與一件私人典藏。</p><div class="sm-offers">${currentVisit.offers.map(offerHtml).join('')}</div><div class="sm-notice" id="seaMerchantNotice">可以購買多件商品，售完為止。</div></div><footer class="sm-foot"><span>下一次相遇會更換全部商品。</span><button class="sm-leave" type="button">讓商船離開</button></footer></section>`;
  }

  function setNotice(text,isError=false) {
    const notice = document.getElementById('seaMerchantNotice');
    if (!notice) return;
    notice.textContent = text;
    notice.style.color = isError ? '#ff9b9b' : '#9ce8f0';
  }

  function updateBalance() {
    const node = document.getElementById('seaMerchantBalance');
    if (node) node.textContent = formatPrice(balance());
  }

  function buy(offerId) {
    if (!currentVisit || currentVisit.bought.has(offerId)) return;
    const offer = currentVisit.offers.find(row => row.id === offerId);
    if (!offer) return;
    if (offer.action === 'collection' && ownedCollectionIds().has(offer.id)) {
      setNotice('這件典藏品已經在你的背包中。',true);
      return;
    }

    const payment = spend(offer.price,`海上商人：${offer.name}`);
    if (!payment.ok) {
      setNotice(`珍珠不足，還需要 ${formatPrice(payment.needed || offer.price)} 顆。`,true);
      return;
    }

    let resultText = '';
    if (offer.action === 'effect') {
      addEffect(offer.effect);
      resultText = `獲得「${offer.effect.label}」效果，共 ${offer.effect.casts} 竿。`;
    } else if (offer.action === 'crate') {
      const item = openCrate(currentVisit.castId);
      resultText = `打開貨箱，獲得 ${item.icon} ${item.name}［${item.rarity}］。`;
    } else if (offer.action === 'collection') {
      const item = addCollection(offer,currentVisit.castId);
      resultText = `獲得 ${item.icon} ${item.name}［${item.rarity}典藏］，已放入背包。`;
    }

    currentVisit.bought.add(offer.id);
    const state = merchantState();
    state.purchases += 1;
    save(STATE_KEY,state);
    pushEvent('交易完成',`${offer.icon} ${offer.name}\n支付 🦪 ${formatPrice(offer.price)} 珍珠\n${resultText}`,offer.icon,currentVisit.castId);
    render();
    setNotice(resultText);
  }

  function close(reason='商船駛離') {
    clearTimeout(countdownTimer);
    countdownTimer = 0;
    ensurePanel().classList.add('hidden');
    document.body.classList.remove('sea-merchant-open');
    if (currentVisit && reason) setTimeout(() => window.COFFEE_SHIP_DECK?.showTip?.(`🛶 ${reason}`,1600),20);
    currentVisit = null;
  }

  function scheduleTick() {
    clearTimeout(countdownTimer);
    countdownTimer = setTimeout(() => {
      if (!currentVisit) return;
      currentVisit.secondsLeft -= 1;
      const timer = document.getElementById('seaMerchantTimer');
      if (timer) timer.textContent = `商船將停留 ${Math.max(0,currentVisit.secondsLeft)} 秒`;
      if (currentVisit.secondsLeft <= 0) close('海上商人收起貨箱，駛入霧中');
      else scheduleTick();
    },1000);
  }

  function openMerchant(castId,forced=false) {
    if (currentVisit || !isDeckOpen()) return false;
    currentVisit = {castId:castId || `merchant_${Date.now()}`,offers:sampleOffers(),bought:new Set(),secondsLeft:VISIT_SECONDS};
    const state = merchantState();
    state.castsSince = 0;
    state.lastSeenAt = Date.now();
    state.visits += 1;
    save(STATE_KEY,state);
    render();
    ensurePanel().classList.remove('hidden');
    document.body.classList.add('sea-merchant-open');
    pushEvent('神秘商船靠近','商人洛克帶來三件商品，其中包含一件私人典藏。','🛶',currentVisit.castId);
    scheduleTick();
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
      close,state:merchantState,offers:REGULAR_OFFERS,collections:COLLECTIONS,version:2
    };
    window.COFFEE_SHIP_SEA_MERCHANT_COLLECTIONS = {
      items:COLLECTIONS,owned:() => [...ownedCollectionIds()],version:2
    };
    window.dispatchEvent(new CustomEvent('coffee-ship:sea-merchant-ready',{detail:{offers:REGULAR_OFFERS.length,collections:COLLECTIONS.length,displayed:3,version:2}}));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
