(() => {
  'use strict';
  if (window.__COFFEE_SHIP_MUTANT_HUNTING_TOOLS_V1__) return;
  window.__COFFEE_SHIP_MUTANT_HUNTING_TOOLS_V1__ = true;

  const BAG_KEY = 'coffeeShipFishBag';
  const MAX_BAG = 240;

  const TOOLS = [
    {
      id:'spectral_lantern',offerId:'mutant_tool_spectral_lantern',icon:'🏮',name:'幽光束縛燈',price:120,sellPrice:36,tone:'#9ce8f0',
      description:'束縛眼部、發光與血月型變異生物。啟動捕獵後燈芯會碎裂。'
    },
    {
      id:'titan_chain',offerId:'mutant_tool_titan_chain',icon:'⛓️',name:'泰坦鎖鏈槍',price:280,sellPrice:84,tone:'#ffe16b',
      description:'固定巨鯊、巨鯨、海蛇與利維坦。發射後鎖鏈會永久崩斷。'
    },
    {
      id:'venom_net',offerId:'mutant_tool_venom_net',icon:'🕸️',name:'抗毒捕獵網',price:95,sellPrice:28,tone:'#79d0b1',
      description:'捕捉毒刺與甲殼型變異生物。使用後網線會遭腐蝕。'
    },
    {
      id:'void_anchor',offerId:'mutant_tool_void_anchor',icon:'⚓',name:'虛空錨籠',price:220,sellPrice:66,tone:'#b9a4e6',
      description:'鎖定章魚、烏賊、夢魘鰻與虛空型生物。使用後錨核會失效。'
    },
    {
      id:'elder_seal',offerId:'mutant_tool_elder_seal',icon:'🧿',name:'古神封印匣',price:888,sellPrice:266,tone:'#ff72bc',
      description:'唯一能承受世界級古神污染的封印道具。開啟後必定損壞。'
    }
  ];

  const BY_OFFER = new Map(TOOLS.map(tool => [tool.offerId,tool]));

  function read(key,fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function save(key,value) {
    try { localStorage.setItem(key,JSON.stringify(value)); }
    catch {}
  }

  function format(value) {
    return Math.max(0,Math.floor(Number(value) || 0)).toLocaleString('zh-TW');
  }

  function spend(amount,reason) {
    const economy = window.COFFEE_SHIP_ECONOMY;
    if (economy?.spend) return economy.spend(amount,reason,{source:'mutant-hunting-tool'});
    const current = Math.max(0,Number(localStorage.getItem('coffeeShipPearls') || 0));
    if (current < amount) return {ok:false,needed:amount-current,balance:current,spent:0};
    const next = current - amount;
    localStorage.setItem('coffeeShipPearls',String(next));
    window.dispatchEvent(new CustomEvent('coffeeShipPearlsChanged',{detail:{balance:next,pearls:next,delta:-amount,reason}}));
    return {ok:true,balance:next,spent:amount};
  }

  function addTool(tool) {
    const bag = read(BAG_KEY,[]);
    const items = Array.isArray(bag) ? bag : [];
    const item = {
      huntToolId:tool.id,
      icon:tool.icon,
      name:tool.name,
      rarity:tool.id === 'elder_seal' ? '神話' : tool.id === 'titan_chain' || tool.id === 'void_anchor' ? '傳說' : '史詩',
      quality:'一次性',
      kind:'tool',
      group:'mutant-hunt-tool',
      zone:'潮汐商人',
      trait:`${tool.description} 使用一次後損壞。`,
      sellPrice:tool.sellPrice,
      weight:.2,
      source:'mutant-hunting-tool',
      at:Date.now()
    };
    items.push(item);
    save(BAG_KEY,items.slice(-MAX_BAG));
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'mutant-hunting-tool',item}}));
    return item;
  }

  function setNotice(text,error=false) {
    const node = document.getElementById('seaMerchantNotice');
    if (!node) return;
    node.textContent = text;
    node.style.color = error ? '#ff9b9b' : '#9ce8f0';
  }

  function updateBalance(value) {
    const node = document.getElementById('seaMerchantBalance');
    if (node) node.textContent = format(value);
  }

  function pushEvent(tool) {
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({
      castId:`mutant_tool_${Date.now()}`,
      eventKind:'special',
      title:'海上商人｜購入捕獵道具',
      icon:tool.icon,
      accent:tool.tone,
      text:`${tool.name}\n支付 🦪 ${format(tool.price)} 珍珠\n一次性捕獵道具已放入背包。`
    });
  }

  function interceptPurchase(event) {
    const button = event.target.closest?.('#seaMerchantEvent [data-merchant-buy]');
    if (!button) return;
    const tool = BY_OFFER.get(button.dataset.merchantBuy);
    if (!tool) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    if (button.disabled) return;

    const payment = spend(tool.price,`海上商人：${tool.name}`);
    if (!payment.ok) {
      setNotice(`珍珠不足，還需要 ${format(payment.needed || tool.price)} 顆。`,true);
      return;
    }

    addTool(tool);
    pushEvent(tool);
    button.disabled = true;
    button.textContent = '已購買・放入背包';
    updateBalance(payment.balance);
    setNotice(`獲得 ${tool.icon} ${tool.name}。遇到對應變異生物時會自動啟動捕獵。`);
  }

  function attachToMerchant() {
    const offers = window.COFFEE_SHIP_SEA_MERCHANT?.offers;
    if (!Array.isArray(offers)) return false;
    for (const tool of TOOLS) {
      if (offers.some(offer => offer.id === tool.offerId)) continue;
      offers.push({
        id:tool.offerId,
        icon:tool.icon,
        name:tool.name,
        price:tool.price,
        sellPrice:tool.sellPrice,
        tone:tool.tone,
        category:'一次性捕獵道具',
        description:tool.description,
        action:'hunt-tool',
        huntToolId:tool.id
      });
    }
    return true;
  }

  function init() {
    document.addEventListener('click',interceptPurchase,true);
    if (!attachToMerchant()) {
      window.addEventListener('coffee-ship:sea-merchant-ready',attachToMerchant,{once:true});
    }
    window.COFFEE_SHIP_MUTANT_HUNTING_TOOLS = {
      items:TOOLS,
      get:id => TOOLS.find(tool => tool.id === id) || null,
      version:1
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
