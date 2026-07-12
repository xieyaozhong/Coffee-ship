(() => {
  'use strict';

  if (window.__COFFEE_SHIP_FISHING_UI_CLEANUP_V3__) return;
  window.__COFFEE_SHIP_FISHING_UI_CLEANUP_V3__ = true;
  window.__COFFEE_SHIP_FISHING_UI_CLEANUP_V2__ = true;

  let scene = document.body?.dataset?.coffeeShipScene || window.COFFEE_SHIP_SCENE || 'cafe';
  let queued = false;
  let lastState = null;

  const isDeck = () => scene === 'deck' || document.body?.dataset?.coffeeShipScene === 'deck' || !!window.COFFEE_SHIP_DECK?.isDeckOpen?.();

  function removeLegacyUi() {
    ['fishingCard','fishingMotionCanvas','fishingEventStack','deckFishingBtn','fishingBtn'].forEach(id => document.getElementById(id)?.remove());
    document.querySelectorAll('.deck-fishing-button,.legacy-fishing-button,.fishing-shortcut-button').forEach(element => element.remove());
    document.body.classList.remove('fishing-motion-active','fishing-event-stack-open','fishing-result-open');
  }

  function dedupe(id) {
    const items = Array.from(document.querySelectorAll(`[id="${id}"]`));
    items.slice(1).forEach(item => item.remove());
    return items[0] || null;
  }

  function setVisible(element,visible) {
    if (!element) return;
    if (element.hidden !== !visible) element.hidden = !visible;
    const aria = visible ? 'false' : 'true';
    if (element.getAttribute('aria-hidden') !== aria) element.setAttribute('aria-hidden',aria);
  }

  function protectFishingButton() {
    const button = document.getElementById('coffeeBtn');
    if (!button || button.dataset.fishingTextGuard === 'v3') return;
    const descriptor = Object.getOwnPropertyDescriptor(Node.prototype,'textContent');
    if (!descriptor?.get || !descriptor?.set) return;
    const nativeGet = descriptor.get.bind(button);
    const nativeSet = descriptor.set.bind(button);

    try {
      Object.defineProperty(button,'textContent',{
        configurable:true,
        enumerable:false,
        get() { return nativeGet(); },
        set(value) {
          const next = String(value ?? '');
          if (isDeck() && next.trim().startsWith('🎣')) {
            button.dataset.fishingStateLabel = next.replace(/^🎣\s*/,'').trim();
            button.setAttribute('aria-label',next.trim() || '釣魚');
            button.title = next.trim() || '釣魚';
            return;
          }
          if (nativeGet() === next) return;
          nativeSet(next);
        }
      });
      button.dataset.fishingTextGuard = 'v3';
    } catch (error) {
      console.warn('Coffee Ship fishing button guard was not installed.',error);
    }
  }

  function syncOperationHints(deckOpen) {
    const keys = document.getElementById('opKeys');
    if (keys) {
      const entries = deckOpen
        ? [['WASD','移動'],['E','互動 / 回艙'],['C','釣魚']]
        : [['WASD','移動'],['E','互動'],['C','咖啡'],['B','留言'],['Space','表情']];
      const html = entries.map(([key,label]) => `<span class="op-key"><b>${key}</b>${label}</span>`).join('');
      if (keys.innerHTML !== html) keys.innerHTML = html;
    }
    const actionLabel = document.getElementById('opActionLabel');
    const hintLabel = document.getElementById('opHintLabel');
    const actionText = deckOpen ? '最新版釣魚、互動、返回咖啡廳' : '點咖啡、人物互動、留言';
    const hintText = deckOpen ? '右側發光區按 C 釣魚，左側按 E 回艙' : '靠近角色或座位後按互動';
    if (actionLabel && actionLabel.textContent !== actionText) actionLabel.textContent = actionText;
    if (hintLabel && hintLabel.textContent !== hintText) hintLabel.textContent = hintText;
  }

  function syncButtons(deckOpen) {
    const coffee = dedupe('coffeeBtn');
    const action = dedupe('sitBtn');
    const message = dedupe('messageBtn');
    const emote = dedupe('emoteBtn');
    const dex = dedupe('fishDexBtn');

    setVisible(coffee,true);
    setVisible(action,true);
    setVisible(message,!deckOpen);
    setVisible(emote,!deckOpen);
    setVisible(dex,deckOpen);

    if (coffee) {
      coffee.setAttribute('aria-label',deckOpen ? '釣魚' : '開啟咖啡選單');
      coffee.title = deckOpen ? (lastState?.ready ? '下竿' : lastState?.mode === 'cooldown' ? '整理釣具中' : '釣魚') : '開啟咖啡選單';
    }
    if (action) {
      action.setAttribute('aria-label',deckOpen ? '互動或返回咖啡廳' : '互動或坐下');
      action.title = deckOpen ? '互動或返回咖啡廳' : '互動或坐下';
    }
    if (dex) {
      dex.setAttribute('aria-label','開啟釣魚紀錄與圖鑑');
      dex.title = '開啟釣魚紀錄與圖鑑';
    }
  }

  function sync() {
    queued = false;
    const deckOpen = isDeck();
    removeLegacyUi();
    protectFishingButton();
    syncButtons(deckOpen);
    syncOperationHints(deckOpen);
    document.body.dataset.fishingUi = deckOpen ? 'unified-v4-stable' : 'cafe';
  }

  function queueSync() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(sync);
  }

  function init() {
    protectFishingButton();
    window.addEventListener('coffee-ship:scene',event => {
      scene = event.detail?.scene || window.COFFEE_SHIP_SCENE || 'cafe';
      queueSync();
    });
    window.addEventListener('coffee-ship:fishing-state',event => {
      lastState = event.detail || null;
      queueSync();
    });
    window.addEventListener('coffee-ship:fishing-api-ready',queueSync);
    window.addEventListener('coffee-ship:entered',queueSync);
    window.addEventListener('coffee-ship:scene-art-ready',event => {
      if (event.detail?.scene === 'cafe') window.COFFEE_SHIP_SCENE_ART_V2?.installCafePatch?.();
      queueSync();
    });

    queueSync();
    setTimeout(queueSync,250);
    setTimeout(queueSync,1000);
    window.COFFEE_SHIP_FISHING_UI_CLEANUP = {version:3,sync:queueSync};
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
