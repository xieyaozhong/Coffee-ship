(() => {
  'use strict';
  if (window.__COFFEE_SHIP_SEA_MERCHANT_COLLECTIONS_V1__) return;
  window.__COFFEE_SHIP_SEA_MERCHANT_COLLECTIONS_V1__ = true;

  const BAG_KEY = 'coffeeShipFishBag';
  const MERCHANT_STATE_KEY = 'coffeeShipSeaMerchantState';
  const VISIT_KEY = 'coffeeShipSeaMerchantPremiumVisitV1';
  const STYLE_ID = 'seaMerchantCollectionStyleV1';
  const MAX_BAG = 240;

  const COLLECTIONS = [
    {
      id:'whale_song_record',icon:'💿',name:'初版鯨歌黑膠唱片',rarity:'傳說',price:18000,sellPrice:7200,weight:18,
      trait:'由遠洋錄音師在無月海域錄下的第一版母盤。唱針落下時，附近的水杯會泛起細小波紋。'
    },
    {
      id:'royal_coffee_cup',icon:'🏺',name:'皇家咖啡航海瓷杯',rarity:'傳說',price:32000,sellPrice:12800,weight:17,
      trait:'舊王國旗艦專用的金邊瓷杯，杯底仍留著一圈永遠不會乾掉的咖啡香。'
    },
    {
      id:'first_tide_badge',icon:'🎖️',name:'初代潮汐商會徽章',rarity:'傳說',price:58000,sellPrice:23200,weight:15,
      trait:'潮汐商會成立時鑄造的第一批徽章，背面刻有已失傳的海上暗語。'
    },
    {
      id:'eternal_ship_lamp',icon:'🏮',name:'永不熄滅的船燈',rarity:'神話',price:88888,sellPrice:35555,weight:12,
      trait:'燈芯沒有火焰，卻會在迷航時自行亮起。燈罩內側映著一條不存在於海圖上的航路。'
    },
    {
      id:'old_god_figurehead',icon:'🗿',name:'舊神船首像碎片',rarity:'神話',price:128000,sellPrice:51200,weight:10,
      trait:'來自一艘無名古船的船首像。靠近耳邊時，能聽到木頭深處傳來低沉潮聲。'
    },
    {
      id:'sunken_kingdom_crown',icon:'👑',name:'沉沒王國的金冠',rarity:'神話',price:188888,sellPrice:75555,weight:8,
      trait:'在深海王座旁被發現的古老金冠，寶石排列與現代星圖完全一致。'
    },
    {
      id:'end_of_world_chart',icon:'🗺️',name:'世界盡頭航海圖',rarity:'神話',price:250000,sellPrice:100000,weight:6,
      trait:'羊皮紙邊緣畫著海水垂直落下的景象，最遠端標註著「返航者不得言說」。'
    },
    {
      id:'abyss_blue_diamond_compass',icon:'💎',name:'深淵藍鑽羅盤',rarity:'世界級',price:388888,sellPrice:155555,weight:4,
      trait:'羅盤中央鑲著會吸收光線的藍鑽。指針不朝北方，而是指向持有者最渴望找到的事物。'
    },
    {
      id:'star_sea_hourglass',icon:'⌛',name:'星海倒流沙漏',rarity:'世界級',price:588888,sellPrice:235555,weight:3,
      trait:'銀色砂粒會從下方緩慢升起。傳說完整倒流一次，遠海便會重演一個被遺忘的夜晚。'
    },
    {
      id:'moon_sea_queen_pearl',icon:'🔮',name:'月海女王珍珠',rarity:'世界級',price:888888,sellPrice:355555,weight:1,
      trait:'比普通珍珠更像一輪微縮滿月。只有海面完全平靜時，珠心才會浮現沉睡王城的倒影。'
    }
  ];

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

  function formatPrice(value) {
    return Math.max(0,Number(value || 0)).toLocaleString('zh-TW');
  }

  function economy() {
    return window.COFFEE_SHIP_ECONOMY || null;
  }

  function balance() {
    return economy()?.balance?.() ?? Math.max(0,Number(localStorage.getItem('coffeeShipPearls') || 0));
  }

  function spend(amount, reason) {
    const price = Math.max(0,Math.floor(Number(amount) || 0));
    if (economy()?.spend) return economy().spend(price,reason,{source:'sea-merchant-collection'});
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

  function ownedIds() {
    return new Set(bag().map(item => item?.merchantCollectionId || item?.collectionId).filter(Boolean));
  }

  function visitId() {
    return String(read(MERCHANT_STATE_KEY,{lastSeenAt:0}).lastSeenAt || 0);
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

  function chooseCollectionIds(count = 2) {
    const owned = ownedIds();
    let pool = COLLECTIONS.filter(item => !owned.has(item.id));
    if (!pool.length) pool = COLLECTIONS.slice();
    const selected = [];
    while (pool.length && selected.length < count) {
      const item = weightedPick(pool);
      selected.push(item.id);
      pool = pool.filter(row => row.id !== item.id);
    }
    return selected;
  }

  function visitState() {
    const id = visitId();
    const existing = read(VISIT_KEY,null);
    if (existing && String(existing.visitId) === id && Array.isArray(existing.ids)) {
      existing.bought = Array.isArray(existing.bought) ? existing.bought : [];
      return existing;
    }
    const created = {visitId:id,ids:chooseCollectionIds(2),bought:[],createdAt:Date.now()};
    save(VISIT_KEY,created);
    return created;
  }

  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .sm-premium-section{margin-top:16px;padding-top:15px;border-top:1px solid rgba(255,225,107,.24)}
      .sm-premium-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}.sm-premium-head h4{margin:0;color:#ffe16b;font-size:17px}.sm-premium-head p{margin:4px 0 0;color:#cbb9cd;font-size:12px;line-height:1.45}.sm-premium-badge{flex:0 0 auto;padding:5px 8px;border:1px solid rgba(255,225,107,.5);border-radius:999px;background:rgba(255,225,107,.1);color:#ffe16b;font-size:10px;font-weight:1000}
      .sm-premium-offers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.sm-premium-offer{position:relative;display:flex;flex-direction:column;min-height:245px;padding:14px;border:2px solid var(--premium-tone,#ffe16b);border-radius:18px;background:radial-gradient(circle at 80% 10%,rgba(255,225,107,.12),transparent 34%),linear-gradient(155deg,rgba(54,38,62,.98),rgba(18,12,25,.99));box-shadow:0 8px 0 rgba(0,0,0,.3),0 0 28px rgba(255,225,107,.06);overflow:hidden}.sm-premium-offer::after{content:'COLLECTOR';position:absolute;right:-23px;top:18px;transform:rotate(38deg);padding:3px 28px;background:rgba(255,225,107,.12);color:rgba(255,235,175,.52);font-size:8px;font-weight:1000;letter-spacing:.14em}.sm-premium-icon{font-size:36px;filter:drop-shadow(0 5px 12px rgba(255,225,107,.18))}.sm-premium-name{margin:8px 0 4px;font-size:17px}.sm-premium-rarity{display:inline-flex;align-self:flex-start;margin-bottom:7px;padding:3px 7px;border-radius:999px;background:rgba(255,255,255,.08);color:var(--premium-tone,#ffe16b);font-size:10px;font-weight:1000}.sm-premium-description{flex:1;margin:0;color:#d8c8b4;font-size:12px;line-height:1.5}.sm-premium-resale{display:block;margin-top:8px;color:#a998aa;font-size:10px}.sm-premium-buy{margin-top:12px;border:0;border-radius:12px;padding:10px 8px;background:linear-gradient(180deg,var(--premium-tone,#ffe16b),#c8913c);color:#18101f;font-weight:1000;box-shadow:0 5px 0 rgba(0,0,0,.36)}.sm-premium-buy:disabled{filter:grayscale(.5);opacity:.55;box-shadow:0 3px 0 rgba(0,0,0,.24)}.sm-premium-empty{padding:15px;border:1px dashed rgba(255,225,107,.4);border-radius:14px;color:#ffe16b;text-align:center;font-weight:900}
      @media(max-width:700px){.sm-premium-offers{grid-template-columns:1fr}.sm-premium-offer{min-height:0}.sm-premium-head{align-items:center}.sm-premium-description{min-height:54px}}
    `;
    document.head.appendChild(style);
  }

  function toneFor(rarity) {
    return ({傳說:'#ffe16b',神話:'#f2a957',世界級:'#ff72bc'})[rarity] || '#ffe16b';
  }

  function renderPremiumSection() {
    const merchantPanel = document.getElementById('seaMerchantEvent');
    const body = merchantPanel?.querySelector('.sm-body');
    if (!body || merchantPanel.classList.contains('hidden')) return;

    body.querySelector('.sm-premium-section')?.remove();
    const state = visitState();
    const owned = ownedIds();
    const items = state.ids.map(id => COLLECTIONS.find(item => item.id === id)).filter(Boolean);
    const section = document.createElement('section');
    section.className = 'sm-premium-section';

    const cards = items.length ? items.map(item => {
      const purchased = state.bought.includes(item.id) || owned.has(item.id);
      const affordable = balance() >= item.price;
      const disabled = purchased ? 'disabled' : '';
      const buttonText = purchased ? '已收藏' : `🦪 ${formatPrice(item.price)} 購買`;
      return `<article class="sm-premium-offer" style="--premium-tone:${toneFor(item.rarity)}"><span class="sm-premium-icon">${escapeHtml(item.icon)}</span><h5 class="sm-premium-name">${escapeHtml(item.name)}</h5><span class="sm-premium-rarity">${escapeHtml(item.rarity)}典藏</span><p class="sm-premium-description">${escapeHtml(item.trait)}</p><small class="sm-premium-resale">收藏回收價：🦪 ${formatPrice(item.sellPrice)}</small><button class="sm-premium-buy" type="button" data-premium-collection-buy="${escapeHtml(item.id)}" ${disabled} aria-label="購買${escapeHtml(item.name)}">${buttonText}</button>${!purchased && !affordable ? `<small class="sm-premium-resale">目前還差 🦪 ${formatPrice(item.price - balance())}</small>` : ''}</article>`;
    }).join('') : '<div class="sm-premium-empty">本次沒有可展示的典藏品。</div>';

    section.innerHTML = `<div class="sm-premium-head"><div><h4>✨ 洛克的私人典藏庫</h4><p>每次相遇只展示兩件高價收藏；每種收藏品只能擁有一件。</p></div><span class="sm-premium-badge">LIMITED</span></div><div class="sm-premium-offers">${cards}</div>`;
    body.appendChild(section);
  }

  function addToBag(item) {
    const items = bag();
    const now = Date.now();
    const collectible = {
      merchantCollectionId:item.id,
      collectionId:item.id,
      icon:item.icon,
      name:item.name,
      rarity:item.rarity,
      quality:'典藏',
      kind:'treasure',
      group:'merchant-collection',
      zone:'潮汐商人典藏庫',
      trait:item.trait,
      purchasePrice:item.price,
      sellPrice:item.sellPrice,
      weight:.08,
      unique:true,
      source:'sea-merchant-collection',
      at:now
    };
    items.push(collectible);
    save(BAG_KEY,items.slice(-MAX_BAG));
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'sea-merchant-collection',item:collectible}}));
    return collectible;
  }

  function pushEvent(item) {
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({
      castId:`merchant_collection_${Date.now()}`,
      eventKind:'special',
      title:'海上商人｜購入私人典藏',
      icon:item.icon,
      accent:toneFor(item.rarity),
      text:`${item.name}［${item.rarity}典藏］\n支付 🦪 ${formatPrice(item.price)} 珍珠\n收藏品已放入背包。`
    });
  }

  function setMerchantNotice(text, isError = false) {
    const notice = document.getElementById('seaMerchantNotice');
    if (!notice) return;
    notice.textContent = text;
    notice.style.color = isError ? '#ff9b9b' : '#ffe16b';
  }

  function buyCollection(id) {
    const item = COLLECTIONS.find(row => row.id === id);
    if (!item) return;
    if (ownedIds().has(id)) {
      setMerchantNotice('這件收藏品已經在你的背包中。',true);
      renderPremiumSection();
      return;
    }

    const payment = spend(item.price,`海上商人典藏：${item.name}`);
    if (!payment.ok) {
      setMerchantNotice(`珍珠不足，還需要 ${formatPrice(payment.needed || item.price)} 顆。`,true);
      renderPremiumSection();
      return;
    }

    addToBag(item);
    const state = visitState();
    if (!state.bought.includes(id)) state.bought.push(id);
    save(VISIT_KEY,state);
    pushEvent(item);
    setMerchantNotice(`已購入 ${item.icon} ${item.name}，收藏品已放入背包。`);
    renderPremiumSection();
  }

  function queueRender() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      renderPremiumSection();
    });
  }

  function bind() {
    document.addEventListener('click', event => {
      const button = event.target.closest?.('[data-premium-collection-buy]');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      buyCollection(button.dataset.premiumCollectionBuy);
    }, true);

    const observer = new MutationObserver(mutations => {
      const changedOutsidePremium = mutations.some(mutation => {
        if (mutation.type === 'attributes') return mutation.target?.id === 'seaMerchantEvent';
        const nodes = [...mutation.addedNodes,...mutation.removedNodes];
        return nodes.some(node => {
          if (node.nodeType !== 1) return false;
          return !node.matches?.('.sm-premium-section') && !node.closest?.('.sm-premium-section');
        });
      });
      if (changedOutsidePremium) queueRender();
    });
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    window.addEventListener('coffee-ship:sea-merchant-ready',queueRender);
    window.addEventListener('coffee-ship:economy-changed',queueRender);
  }

  function init() {
    addStyle();
    bind();
    queueRender();
    window.COFFEE_SHIP_SEA_MERCHANT_COLLECTIONS = {
      items:COLLECTIONS,
      owned:() => [...ownedIds()],
      refresh:queueRender,
      version:1
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
