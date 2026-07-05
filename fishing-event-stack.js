(() => {
  'use strict';
  if (window.__COFFEE_SHIP_FISHING_EVENT_STACK_V2__) return;
  window.__COFFEE_SHIP_FISHING_EVENT_STACK_V2__ = true;

  const MAX_EVENTS = 8;
  const SOURCE_SELECTOR = [
    '#fishingCard', '#mermaidCard', '#sharkCard', '#mutantCard',
    '.fishing-card', '.mermaid-card', '.shark-card', '.mutant-card',
    '.rare-catch-card', '.special-catch-card', '.bottle-event-card',
    '.story-event-card', '.ocean-event-card', '.world-event-card'
  ].join(',');

  const META = {
    fishingCard: { title:'🎣 漁獲結果', priority:10, accent:'#79d0b1', duration:20000 },
    mutantCard: { title:'🧬 變異生物', priority:20, accent:'#ff5f9e', duration:28000 },
    mermaidCard: { title:'🧜‍♀️ 美人魚事件', priority:30, accent:'#9ce8f0', duration:28000 },
    sharkCard: { title:'🦈 鯊魚事件', priority:40, accent:'#e9a6b0', duration:26000 }
  };

  const state = new WeakMap();
  let root;
  let list;
  let count;
  let observer;
  let queued = false;
  let serial = 0;

  function addStyle() {
    if (document.getElementById('fishingEventStackStyle')) return;
    const style = document.createElement('style');
    style.id = 'fishingEventStackStyle';
    style.textContent = `
      #fishingEventStack{
        position:fixed;right:18px;top:82px;bottom:18px;z-index:25000;
        width:min(430px,calc(100vw - 36px));display:flex;flex-direction:column;gap:9px;
        padding:10px;border:2px solid rgba(121,208,177,.62);border-radius:20px;
        background:rgba(10,8,18,.84);box-shadow:0 16px 42px rgba(0,0,0,.46);
        backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);box-sizing:border-box;
      }
      #fishingEventStack.hidden{display:none!important}
      .fish-event-head{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:40px;padding:2px 3px 4px 7px;color:#fff4d8;font-weight:1000}
      .fish-event-title{display:flex;align-items:center;gap:8px;min-width:0}
      .fish-event-count{display:inline-flex;min-width:26px;height:26px;padding:0 7px;align-items:center;justify-content:center;border-radius:999px;background:#79d0b1;color:#151020;font-size:13px}
      .fish-event-clear{border:0;border-radius:11px;padding:8px 11px;background:#493249;color:#fff4d8;font-weight:950;box-shadow:0 4px 0 rgba(0,0,0,.25);cursor:pointer}
      #fishingEventStackList{min-height:0;overflow-x:hidden;overflow-y:auto;display:flex;flex-direction:column;gap:9px;padding:1px 3px 5px;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
      .fish-event-item{position:relative;flex:0 0 auto;width:100%;max-height:34vh;overflow:auto;box-sizing:border-box;border:2px solid var(--accent,#79d0b1);border-radius:17px;background:linear-gradient(180deg,rgba(28,20,38,.99),rgba(14,11,24,.99));color:#fff4d8;box-shadow:0 7px 0 rgba(0,0,0,.28);animation:fishEventIn .2s ease-out both}
      .fish-event-item-head{position:sticky;top:0;z-index:4;display:flex;align-items:center;justify-content:space-between;gap:9px;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);background:rgba(18,13,29,.98);color:var(--accent,#79d0b1);font-weight:1000}
      .fish-event-index{display:inline-flex;min-width:23px;height:23px;align-items:center;justify-content:center;border-radius:999px;background:var(--accent,#79d0b1);color:#151020;font-size:12px}
      .fish-event-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .fish-event-close{flex:0 0 auto;width:34px;height:34px;border:0;border-radius:10px;background:#493249;color:#fff4d8;font-size:18px;font-weight:1000;cursor:pointer}
      .fish-event-body{padding:12px 13px 15px;text-align:left;line-height:1.55;font-weight:850;overflow-wrap:anywhere}
      .fish-event-body .fishing-card-close,.fish-event-body .mermaid-bubble{display:none!important}
      .fish-event-body .unique-emoji{max-width:72px!important;max-height:72px!important}
      .coffee-event-source-captured{opacity:0!important;visibility:visible!important;pointer-events:none!important}
      body.fishing-event-stack-open #backpackSafeOpenBtn,
      body.fishing-event-stack-open #sceneStatusBadge,
      body.fishing-event-stack-open #deckTip{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
      @keyframes fishEventIn{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}
      @media(max-width:760px){
        body.fishing-event-stack-open{overflow:hidden!important}
        body.fishing-event-stack-open::after{content:'';position:fixed;inset:0;z-index:24980;background:rgba(7,5,13,.74);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);pointer-events:none}
        #fishingEventStack{left:8px;right:8px;top:calc(8px + env(safe-area-inset-top));bottom:calc(8px + env(safe-area-inset-bottom));width:auto;max-width:none;padding:8px;border-radius:18px;z-index:25000}
        #fishingEventStackList{gap:8px}
        .fish-event-item{max-height:30dvh;border-radius:15px}
        .fish-event-item-head{padding:8px 9px}
        .fish-event-body{padding:10px 11px 13px;font-size:14px}
        body.fishing-event-stack-open .mobile-controls,
        body.fishing-event-stack-open #backpackSafeOpenBtn,
        body.fishing-event-stack-open #sceneStatusBadge,
        body.fishing-event-stack-open #deckTip{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
        body.fishing-event-stack-open #fishingCard,
        body.fishing-event-stack-open #mermaidCard,
        body.fishing-event-stack-open #sharkCard,
        body.fishing-event-stack-open #mutantCard{opacity:0!important;visibility:visible!important;pointer-events:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureRoot() {
    if (root?.isConnected) return;
    root = document.createElement('section');
    root.id = 'fishingEventStack';
    root.className = 'hidden';
    root.setAttribute('aria-live', 'polite');
    root.setAttribute('aria-label', '釣魚事件中心');
    root.innerHTML = `
      <div class="fish-event-head">
        <div class="fish-event-title"><span>🌊 本次釣魚事件</span><span class="fish-event-count">0</span></div>
        <button type="button" class="fish-event-clear">全部關閉</button>
      </div>
      <div id="fishingEventStackList"></div>`;
    document.body.appendChild(root);
    list = root.querySelector('#fishingEventStackList');
    count = root.querySelector('.fish-event-count');
    root.querySelector('.fish-event-clear').addEventListener('click', clearAll);
  }

  function typeMeta(source) {
    if (META[source.id]) return META[source.id];
    const token = `${source.id} ${source.className}`.toLowerCase();
    if (token.includes('bottle') || token.includes('letter')) return { title:'🍾 漂流瓶事件', priority:50, accent:'#d7bb79', duration:30000 };
    if (token.includes('rare') || token.includes('legend') || token.includes('world')) return { title:'✨ 稀有事件', priority:25, accent:'#ffe16b', duration:28000 };
    return { title:'🌟 特殊事件', priority:60, accent:'#8460c8', duration:24000 };
  }

  function isShown(source) {
    if (!source?.isConnected || source.classList.contains('hidden')) return false;
    return getComputedStyle(source).display !== 'none';
  }

  function cleanClone(source) {
    const clone = source.cloneNode(true);
    clone.removeAttribute('id');
    clone.removeAttribute('style');
    clone.className = '';
    clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    clone.querySelectorAll('script,style,canvas,.mermaid-bubble,.fishing-card-close').forEach(node => node.remove());
    return clone;
  }

  function signatureOf(source) {
    const clone = cleanClone(source);
    return clone.textContent.replace(/[✕×]/g, '').replace(/\s+/g, ' ').trim();
  }

  function updateCount() {
    ensureRoot();
    const cards = [...list.querySelectorAll('.fish-event-item')];
    cards.forEach((card, index) => {
      const badge = card.querySelector('.fish-event-index');
      if (badge) badge.textContent = String(index + 1);
    });
    count.textContent = String(cards.length);
    const open = cards.length > 0;
    root.classList.toggle('hidden', !open);
    document.body.classList.toggle('fishing-event-stack-open', open);
  }

  function hideSourceFor(card) {
    const id = card?.dataset.sourceId;
    if (!id) return;
    const source = document.getElementById(id);
    if (!source) return;
    source.classList.add('hidden');
    source.classList.remove('coffee-event-source-captured');
    state.set(source, { visible:false, signature:'' });
  }

  function removeCard(card, hideSource = true) {
    if (!card) return;
    clearTimeout(card._timer);
    if (hideSource) hideSourceFor(card);
    card.remove();
    updateCount();
  }

  function clearAll() {
    ensureRoot();
    [...list.querySelectorAll('.fish-event-item')].forEach(card => removeCard(card, true));
    document.querySelectorAll('.coffee-event-source-captured').forEach(source => {
      source.classList.add('hidden');
      source.classList.remove('coffee-event-source-captured');
      state.set(source, { visible:false, signature:'' });
    });
    updateCount();
  }

  function sortCards() {
    const cards = [...list.querySelectorAll('.fish-event-item')];
    cards.sort((a, b) => Number(a.dataset.priority) - Number(b.dataset.priority) || Number(a.dataset.serial) - Number(b.dataset.serial));
    cards.forEach(card => list.appendChild(card));
  }

  function capture(source) {
    ensureRoot();
    const signature = signatureOf(source);
    if (!signature) return;
    const previous = state.get(source) || {};
    if (previous.visible && previous.signature === signature) return;

    const meta = typeMeta(source);
    state.set(source, { visible:true, signature });
    source.classList.add('coffee-event-source-captured');

    const card = document.createElement('article');
    card.className = 'fish-event-item';
    card.dataset.sourceId = source.id || '';
    card.dataset.priority = String(meta.priority);
    card.dataset.serial = String(++serial);
    card.style.setProperty('--accent', meta.accent);
    card.innerHTML = `
      <div class="fish-event-item-head">
        <span class="fish-event-index">1</span>
        <span class="fish-event-name">${meta.title}</span>
        <button type="button" class="fish-event-close" aria-label="關閉事件">✕</button>
      </div>
      <div class="fish-event-body"></div>`;
    const body = card.querySelector('.fish-event-body');
    const clone = cleanClone(source);
    body.append(...clone.childNodes);
    card.querySelector('.fish-event-close').addEventListener('click', () => removeCard(card, true));
    list.appendChild(card);

    while (list.children.length > MAX_EVENTS) removeCard(list.firstElementChild, false);
    sortCards();
    updateCount();
    card._timer = setTimeout(() => removeCard(card, false), meta.duration);
  }

  function sync() {
    queued = false;
    document.querySelectorAll(SOURCE_SELECTOR).forEach(source => {
      if (source.closest('#fishingEventStack')) return;
      const shown = isShown(source);
      const previous = state.get(source) || {};
      if (shown) capture(source);
      else {
        if (previous.visible) state.set(source, { visible:false, signature:'' });
        source.classList.remove('coffee-event-source-captured');
      }
    });
  }

  function queueSync() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(sync);
  }

  function push(options = {}) {
    ensureRoot();
    const card = document.createElement('article');
    card.className = 'fish-event-item';
    card.dataset.priority = String(Number(options.priority || 55));
    card.dataset.serial = String(++serial);
    card.style.setProperty('--accent', options.accent || '#8460c8');
    card.innerHTML = `
      <div class="fish-event-item-head">
        <span class="fish-event-index">1</span>
        <span class="fish-event-name">${options.title || '🌟 特殊事件'}</span>
        <button type="button" class="fish-event-close" aria-label="關閉事件">✕</button>
      </div>
      <div class="fish-event-body">${options.html || options.text || ''}</div>`;
    card.querySelector('.fish-event-close').addEventListener('click', () => removeCard(card, false));
    list.appendChild(card);
    while (list.children.length > MAX_EVENTS) removeCard(list.firstElementChild, false);
    sortCards();
    updateCount();
    card._timer = setTimeout(() => removeCard(card, false), Math.max(5000, Number(options.duration || 24000)));
    return card;
  }

  function init() {
    addStyle();
    ensureRoot();
    observer = new MutationObserver(queueSync);
    observer.observe(document.body, { subtree:true, childList:true, attributes:true, attributeFilter:['class','style'] });
    window.addEventListener('coffee-ship:scene', event => {
      if (event.detail?.scene !== 'deck') clearAll();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearAll();
    });
    window.COFFEE_SHIP_FISH_EVENT_STACK = {
      push,
      clear:clearAll,
      sync:queueSync,
      count:() => list.querySelectorAll('.fish-event-item').length
    };
    queueSync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();