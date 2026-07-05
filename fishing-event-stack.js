(() => {
  'use strict';
  if (window.__COFFEE_SHIP_FISHING_EVENT_STACK__) return;
  window.__COFFEE_SHIP_FISHING_EVENT_STACK__ = true;

  const MAX_EVENTS = 8;
  const SOURCE_SELECTORS = [
    '#fishingCard',
    '#mermaidCard',
    '#sharkCard',
    '#mutantCard',
    '.fishing-card',
    '.mermaid-card',
    '.shark-card',
    '.mutant-card',
    '.rare-catch-card',
    '.special-catch-card',
    '.bottle-event-card',
    '.fishing-event-card'
  ].join(',');

  const EXCLUDED_IDS = new Set([
    'fishDexPanel',
    'coffeeMenu',
    'messageBoard',
    'deckTip',
    'sceneStatusBadge',
    'backpackManagerRoot',
    'fishingEventStack',
    'fishingEventStackList'
  ]);

  const TYPE_META = {
    fishingCard: { title:'🎣 漁獲結果', priority:10, accent:'#79d0b1', duration:20000 },
    mutantCard: { title:'🧬 變異生物', priority:20, accent:'#ff5f9e', duration:26000 },
    mermaidCard: { title:'🧜‍♀️ 美人魚事件', priority:30, accent:'#9ce8f0', duration:26000 },
    sharkCard: { title:'🦈 鯊魚事件', priority:40, accent:'#e9a6b0', duration:24000 }
  };

  let stack = null;
  let list = null;
  let countLabel = null;
  let observer = null;
  let syncQueued = false;
  let serial = 0;
  const sourceState = new WeakMap();

  function addStyle() {
    if (document.getElementById('fishingEventStackStyle')) return;
    const style = document.createElement('style');
    style.id = 'fishingEventStackStyle';
    style.textContent = `
      #fishingEventStack{
        position:fixed;
        right:18px;
        top:86px;
        bottom:18px;
        z-index:25000;
        width:min(420px,calc(100vw - 36px));
        display:flex;
        flex-direction:column;
        gap:9px;
        padding:10px;
        border:2px solid rgba(121,208,177,.58);
        border-radius:20px;
        background:rgba(10,8,18,.78);
        box-shadow:0 14px 38px rgba(0,0,0,.42);
        backdrop-filter:blur(7px);
        -webkit-backdrop-filter:blur(7px);
        box-sizing:border-box;
        pointer-events:auto;
      }
      #fishingEventStack.hidden{display:none!important}
      .fishing-event-stack-head{
        flex:0 0 auto;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        min-height:40px;
        padding:3px 3px 4px 7px;
        color:#fff4d8;
        font-weight:1000;
      }
      .fishing-event-stack-title{display:flex;align-items:center;gap:8px;min-width:0}
      .fishing-event-stack-count{
        display:inline-flex;
        min-width:26px;
        height:26px;
        padding:0 7px;
        align-items:center;
        justify-content:center;
        border-radius:999px;
        background:#79d0b1;
        color:#151020;
        font-size:13px;
      }
      .fishing-event-stack-clear{
        border:0;
        border-radius:11px;
        padding:8px 11px;
        background:#493249;
        color:#fff4d8;
        font-weight:950;
        cursor:pointer;
        box-shadow:0 4px 0 rgba(0,0,0,.25);
      }
      #fishingEventStackList{
        min-height:0;
        overflow-x:hidden;
        overflow-y:auto;
        display:flex;
        flex-direction:column;
        gap:9px;
        padding:1px 3px 5px;
        overscroll-behavior:contain;
        -webkit-overflow-scrolling:touch;
      }
      .coffee-fishing-event{
        position:relative;
        flex:0 0 auto;
        width:100%;
        max-height:34vh;
        overflow:auto;
        box-sizing:border-box;
        border:2px solid var(--event-accent,#79d0b1);
        border-radius:17px;
        background:linear-gradient(180deg,rgba(28,20,38,.99),rgba(14,11,24,.99));
        color:#fff4d8;
        box-shadow:0 7px 0 rgba(0,0,0,.27),0 0 24px color-mix(in srgb,var(--event-accent,#79d0b1) 18%,transparent);
        animation:coffeeEventIn .22s ease-out both;
      }
      .coffee-fishing-event-head{
        position:sticky;
        top:0;
        z-index:4;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        padding:9px 10px;
        border-bottom:1px solid color-mix(in srgb,var(--event-accent,#79d0b1) 55%,transparent);
        background:rgba(18,13,29,.97);
        color:var(--event-accent,#79d0b1);
        font-weight:1000;
      }
      .coffee-fishing-event-index{
        display:inline-flex;
        min-width:23px;
        height:23px;
        align-items:center;
        justify-content:center;
        border-radius:999px;
        background:var(--event-accent,#79d0b1);
        color:#151020;
        font-size:12px;
      }
      .coffee-fishing-event-heading{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .coffee-fishing-event-close{
        flex:0 0 auto;
        width:34px;
        height:34px;
        border:0;
        border-radius:10px;
        background:#493249;
        color:#fff4d8;
        font-size:18px;
        font-weight:1000;
        cursor:pointer;
      }
      .coffee-fishing-event-body{
        padding:12px 13px 15px;
        text-align:left;
        line-height:1.55;
        font-weight:850;
        overflow-wrap:anywhere;
      }
      .coffee-fishing-event-body>.fishing-card-close{display:none!important}
      .coffee-fishing-event-body .mermaid-bubble{display:none!important}
      .coffee-fishing-event-body .unique-emoji{max-width:72px!important;max-height:72px!important}
      .coffee-event-source-captured{
        opacity:0!important;
        visibility:hidden!important;
        pointer-events:none!important;
      }
      body.fishing-event-stack-open #backpackSafeOpenBtn,
      body.fishing-event-stack-open #sceneStatusBadge,
      body.fishing-event-stack-open #deckTip{
        opacity:0!important;
        visibility:hidden!important;
        pointer-events:none!important;
      }
      @keyframes coffeeEventIn{
        from{opacity:0;transform:translateY(12px) scale(.985)}
        to{opacity:1;transform:translateY(0) scale(1)}
      }
      @media(max-width:760px){
        body.fishing-event-stack-open{overflow:hidden!important}
        body.fishing-event-stack-open::after{
          content:'';
          position:fixed;
          inset:0;
          z-index:24980;
          background:rgba(7,5,13,.72);
          backdrop-filter:blur(2px);
          -webkit-backdrop-filter:blur(2px);
          pointer-events:none;
        }
        #fishingEventStack{
          left:8px;
          right:8px;
          top:calc(8px + env(safe-area-inset-top));
          bottom:calc(8px + env(safe-area-inset-bottom));
          width:auto;
          max-width:none;
          padding:8px;
          border-radius:18px;
          z-index:25000;
        }
        #fishingEventStackList{gap:8px}
        .coffee-fishing-event{max-height:31dvh;border-radius:15px}
        .coffee-fishing-event-head{padding:8px 9px}
        .coffee-fishing-event-body{padding:10px 11px 13px;font-size:14px}
        body.fishing-event-stack-open .mobile-controls,
        body.fishing-event-stack-open #backpackSafeOpenBtn,
        body.fishing-event-stack-open #sceneStatusBadge,
        body.fishing-event-stack-open #deckTip{
          opacity:0!important;
          visibility:hidden!important;
          pointer-events:none!important;
        }
        body.fishing-event-stack-open #fishingCard.fishing-card,
        body.fishing-event-stack-open #mermaidCard.mermaid-card,
        body.fishing-event-stack-open #sharkCard.shark-card,
        body.fishing-event-stack-open #mutantCard.mutant-card{
          opacity:0!important;
          visibility:hidden!important;
          pointer-events:none!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureStack() {
    if (stack && stack.isConnected) return stack;
    stack = document.createElement('section');
    stack.id = 'fishingEventStack';
    stack.className = 'hidden';
    stack.setAttribute('aria-live', 'polite');
    stack.setAttribute('aria-label', '釣魚事件中心');
    stack.innerHTML = `
      <div class="fishing-event-stack-head">
        <div class="fishing-event-stack-title"><span>🌊 本次釣魚事件</span><span class="fishing-event-stack-count">0</span></div>
        <button type="button" class="fishing-event-stack-clear">全部關閉</button>
      </div>
      <div id="fishingEventStackList"></div>`;
    document.body.appendChild(stack);
    list = stack.querySelector('#fishingEventStackList');
    countLabel = stack.querySelector('.fishing-event-stack-count');
    stack.querySelector('.fishing-event-stack-clear').addEventListener('click', clearAll);
    return stack;
  }

  function metaFor(source) {
    const exact = TYPE_META[source.id];
    if (exact) return exact;
    const token = `${source.id} ${source.className}`.toLowerCase();
    if (token.includes('bottle') || token.includes('letter')) return { title:'🍾 漂流瓶事件', priority:50, accent:'#d7bb79', duration:30000 };
    if (token.includes('rare') || token.includes('legend')) return { title:'✨ 稀有事件', priority:25, accent:'#ffe16b', duration:26000 };
    return { title:'🌟 特殊事件', priority:60, accent:'#8460c8', duration:22000 };
  }

  function simpleHash(value) {
    let hash = 2166136261;
    const text = String(value || '');
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function isVisible(source) {
    if (!source || !source.isConnected || source.classList.contains('hidden')) return false;
    const style = getComputedStyle(source);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  function isCandidate(source) {
    if (!(source instanceof HTMLElement)) return false;
    if (EXCLUDED_IDS.has(source.id)) return false;
    if (source.closest('#fishingEventStack')) return false;
    if (source.matches('canvas,button,input,textarea,select,script,style')) return false;
    return source.matches(SOURCE_SELECTORS);
  }

  function cleanSnapshot(source) {
    const wrapper = document.createElement('div');
    wrapper.className = 'coffee-fishing-event-body';
    const clone = source.cloneNode(true);
    clone.removeAttribute('id');
    clone.className = '';
    clone.removeAttribute('style');
    clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    clone.querySelectorAll('script,style,canvas,.mermaid-bubble,.fishing-card-close').forEach(node => node.remove());
    wrapper.append(...Array.from(clone.childNodes));
    return wrapper;
  }

  function updateCount() {
    ensureStack();
    const cards = Array.from(list.querySelectorAll('.coffee-fishing-event'));
    cards.forEach((card, index) => {
      const badge = card.querySelector('.coffee-fishing-event-index');
      if (badge) badge.textContent = String(index + 1);
    });
    if (countLabel) countLabel.textContent = String(cards.length);
    const open = cards.length > 0;
    stack.classList.toggle('hidden', !open);
    document.body.classList.toggle('fishing-event-stack-open', open);
  }

  function removeCard(card) {
    if (!card) return;
    clearTimeout(card._autoCloseTimer);
    card.remove();
    updateCount();
  }

  function clearAll() {
    ensureStack();
    list.querySelectorAll('.coffee-fishing-event').forEach(card => {
      clearTimeout(card._autoCloseTimer);
      card.remove();
    });
    document.querySelectorAll('.coffee-event-source-captured').forEach(source => source.classList.remove('coffee-event-source-captured'));
    updateCount();
  }

  function sortCards() {
    const cards = Array.from(list.querySelectorAll('.coffee-fishing-event'));
    cards.sort((a, b) => {
      const priorityDiff = Number(a.dataset.priority || 99) - Number(b.dataset.priority || 99);
      if (priorityDiff) return priorityDiff;
      return Number(a.dataset.serial || 0) - Number(b.dataset.serial || 0);
    });
    cards.forEach(card => list.appendChild(card));
  }

  function addSnapshot(source) {
    ensureStack();
    const meta = metaFor(source);
    const signature = simpleHash(`${source.id}|${source.innerHTML}|${source.textContent}`);
    const previous = sourceState.get(source) || {};
    if (previous.visible && previous.signature === signature) return;

    sourceState.set(source, { visible:true, signature });
    source.classList.add('coffee-event-source-captured');

    const card = document.createElement('article');
    card.className = 'coffee-fishing-event';
    card.dataset.sourceId = source.id || 'specialEvent';
    card.dataset.priority = String(meta.priority);
    card.dataset.serial = String(++serial);
    card.style.setProperty('--event-accent', meta.accent);
    card.innerHTML = `
      <div class="coffee-fishing-event-head">
        <span class="coffee-fishing-event-index">1</span>
        <span class="coffee-fishing-event-heading">${meta.title}</span>
        <button type="button" class="coffee-fishing-event-close" aria-label="關閉事件">✕</button>
      </div>`;
    card.appendChild(cleanSnapshot(source));
    card.querySelector('.coffee-fishing-event-close').addEventListener('click', () => removeCard(card));
    list.appendChild(card);

    while (list.children.length > MAX_EVENTS) removeCard(list.firstElementChild);
    sortCards();
    updateCount();

    card._autoCloseTimer = setTimeout(() => removeCard(card), meta.duration);
  }

  function syncSources() {
    syncQueued = false;
    document.querySelectorAll(SOURCE_SELECTORS).forEach(source => {
      if (!isCandidate(source)) return;
      const visible = isVisible(source);
      const state = sourceState.get(source) || {};
      if (visible) addSnapshot(source);
      else {
        if (state.visible) sourceState.set(source, { ...state, visible:false, signature:'' });
        source.classList.remove('coffee-event-source-captured');
      }
    });
  }

  function queueSync() {
    if (syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(syncSources);
  }

  function pushEvent(options = {}) {
    ensureStack();
    const card = document.createElement('article');
    const priority = Number(options.priority || 55);
    const duration = Math.max(5000, Number(options.duration || 22000));
    card.className = 'coffee-fishing-event';
    card.dataset.priority = String(priority);
    card.dataset.serial = String(++serial);
    card.style.setProperty('--event-accent', options.accent || '#8460c8');
    card.innerHTML = `
      <div class="coffee-fishing-event-head">
        <span class="coffee-fishing-event-index">1</span>
        <span class="coffee-fishing-event-heading">${options.title || '🌟 特殊事件'}</span>
        <button type="button" class="coffee-fishing-event-close" aria-label="關閉事件">✕</button>
      </div>
      <div class="coffee-fishing-event-body">${options.html || options.text || ''}</div>`;
    card.querySelector('.coffee-fishing-event-close').addEventListener('click', () => removeCard(card));
    list.appendChild(card);
    while (list.children.length > MAX_EVENTS) removeCard(list.firstElementChild);
    sortCards();
    updateCount();
    card._autoCloseTimer = setTimeout(() => removeCard(card), duration);
    return card;
  }

  function init() {
    addStyle();
    ensureStack();
    observer = new MutationObserver(queueSync);
    observer.observe(document.body, {
      subtree:true,
      childList:true,
      attributes:true,
      attributeFilter:['class','style']
    });
    window.addEventListener('coffee-ship:scene', event => {
      if (event.detail?.scene !== 'deck') clearAll();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearAll();
    });
    window.COFFEE_SHIP_FISH_EVENT_STACK = {
      push:pushEvent,
      clear:clearAll,
      sync:queueSync,
      count:() => list?.querySelectorAll('.coffee-fishing-event').length || 0
    };
    queueSync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
