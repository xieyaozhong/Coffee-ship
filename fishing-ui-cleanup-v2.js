(() => {
  'use strict';

  if (window.__COFFEE_SHIP_FISHING_UI_CLEANUP_V2__) return;
  window.__COFFEE_SHIP_FISHING_UI_CLEANUP_V2__ = true;

  let scene = document.body?.dataset?.coffeeShipScene || window.COFFEE_SHIP_SCENE || 'cafe';
  let queued = false;
  let lastFishingState = null;

  const isDeck = () => scene === 'deck' || document.body?.dataset?.coffeeShipScene === 'deck' || !!window.COFFEE_SHIP_DECK?.isDeckOpen?.();

  function setActionButton(button, icon, label, ariaLabel = label) {
    if (!button) return;
    const desired = `${icon} ${label}`;
    if (button.textContent?.replace(/\s+/g,' ').trim() !== desired) button.textContent = desired;
    button.setAttribute('aria-label',ariaLabel);
    button.title = ariaLabel;
  }

  function setVisible(element, visible) {
    if (!element) return;
    if (element.hidden === !visible && element.getAttribute('aria-hidden') === String(!visible)) return;
    element.hidden = !visible;
    element.setAttribute('aria-hidden',String(!visible));
  }

  function removeLegacyFishingUi() {
    ['fishingCard','fishingMotionCanvas','fishingEventStack','deckFishingBtn','fishingBtn'].forEach(id => document.getElementById(id)?.remove());
    document.querySelectorAll('.deck-fishing-button,.legacy-fishing-button,.fishing-shortcut-button').forEach(element => element.remove());
    document.body.classList.remove('fishing-motion-active','fishing-event-stack-open','fishing-result-open');
  }

  function dedupeById(id) {
    const elements = Array.from(document.querySelectorAll(`[id="${id}"]`));
    elements.slice(1).forEach(element => element.remove());
    return elements[0] || null;
  }

  function syncOperationDock(deckOpen) {
    const actionRow = document.getElementById('opActionButtons');
    if (actionRow) {
      actionRow.querySelectorAll('[data-trigger]').forEach(button => {
        const keep = deckOpen && button.dataset.trigger === 'fishDexBtn';
        setVisible(button,keep);
      });
    }

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
    if (actionLabel) actionLabel.textContent = deckOpen ? '最新版釣魚、互動、返回咖啡廳' : '點咖啡、人物互動、留言';
    if (hintLabel) hintLabel.textContent = deckOpen ? '右側發光區按 C 釣魚，左側按 E 回艙' : '靠近角色或座位後按互動';
  }

  function syncTopbar(deckOpen) {
    const hint = document.querySelector('.game-topbar .controls');
    if (hint) hint.textContent = deckOpen
      ? 'WASD / 方向鍵移動 · C 釣魚 · E 互動 / 返回'
      : 'WASD / 方向鍵移動 · C 咖啡 · E 互動 · B 留言';
  }

  function syncButtons(deckOpen) {
    const coffee = dedupeById('coffeeBtn');
    const action = dedupeById('sitBtn');
    const message = dedupeById('messageBtn');
    const emote = dedupeById('emoteBtn');
    const dex = dedupeById('fishDexBtn');

    setVisible(coffee,true);
    setVisible(action,true);
    setVisible(message,!deckOpen);
    setVisible(emote,!deckOpen);
    setVisible(dex,deckOpen);

    if (deckOpen) {
      const state = lastFishingState || window.COFFEE_SHIP_FISHING_API?.getState?.() || null;
      const label = state?.ready ? '下竿' : state?.mode === 'cooldown' ? '等待' : '釣魚';
      setActionButton(coffee,'🎣',label,'使用最新版釣魚系統');
      setActionButton(action,'🚪','互動','互動或返回咖啡廳');
      if (dex) setActionButton(dex,'🐟','紀錄','開啟釣魚紀錄與圖鑑');
    } else {
      setActionButton(coffee,'☕','咖啡','開啟咖啡選單');
      setActionButton(action,'✋','互動','互動或坐下');
      setActionButton(message,'💬','留言','開啟留言板');
      setActionButton(emote,'✨','表情','使用表情');
    }
  }

  function ensureCafeScenePatch() {
    if (isDeck()) return;
    window.COFFEE_SHIP_SCENE_ART_V2?.installCafePatch?.();
  }

  function sync() {
    queued = false;
    const deckOpen = isDeck();
    removeLegacyFishingUi();
    syncButtons(deckOpen);
    syncOperationDock(deckOpen);
    syncTopbar(deckOpen);
    ensureCafeScenePatch();
    document.body.dataset.fishingUi = deckOpen ? 'unified-v4' : 'cafe';
  }

  function queueSync() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(sync);
  }

  function init() {
    window.addEventListener('coffee-ship:scene',event => {
      scene = event.detail?.scene || window.COFFEE_SHIP_SCENE || 'cafe';
      queueSync();
    });
    window.addEventListener('coffee-ship:fishing-state',event => {
      lastFishingState = event.detail || null;
      queueSync();
    });
    window.addEventListener('coffee-ship:fishing-api-ready',queueSync);
    window.addEventListener('coffee-ship:scene-art-ready',queueSync);
    window.addEventListener('coffee-ship:entered',queueSync);

    const observer = new MutationObserver(queueSync);
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden','data-coffee-ship-scene']});

    queueSync();
    setTimeout(queueSync,300);
    setTimeout(queueSync,1200);
    setInterval(() => {
      if (!isDeck()) ensureCafeScenePatch();
    },1500);

    window.COFFEE_SHIP_FISHING_UI_CLEANUP = { version:2, sync:queueSync };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
