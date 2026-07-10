(() => {
  'use strict';
  if (window.__COFFEE_SHIP_OPERATION_COLLAPSE_ICONS_V2__) return;
  window.__COFFEE_SHIP_OPERATION_COLLAPSE_ICONS_V2__ = true;

  const STORAGE_KEY = 'coffeeShipOperationDockCollapsed';
  const ACTIONS = [
    { id:'coffeeBtn', iconCafe:'☕', labelCafe:'咖啡', iconDeck:'🎣', labelDeck:'釣魚' },
    { id:'sitBtn', iconCafe:'✋', labelCafe:'互動', iconDeck:'🚪', labelDeck:'互動' },
    { id:'messageBtn', iconCafe:'💬', labelCafe:'留言', iconDeck:'💬', labelDeck:'留言' },
    { id:'emoteBtn', iconCafe:'✨', labelCafe:'表情', iconDeck:'✨', labelDeck:'表情' },
    { id:'fishDexBtn', iconCafe:'🐟', labelCafe:'圖鑑', iconDeck:'🐟', labelDeck:'圖鑑' }
  ];

  let queued = false;

  function scene() {
    return document.body.dataset.coffeeShipScene === 'deck' ? 'deck' : 'cafe';
  }

  function isHidden(el) {
    return !el || el.classList.contains('hidden') || getComputedStyle(el).display === 'none';
  }

  function defaultCollapsed() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === '1') return true;
    if (saved === '0') return false;
    return window.matchMedia('(max-width:760px)').matches;
  }

  function setCollapsed(dock, collapsed, persist = true) {
    dock.classList.toggle('is-collapsed', collapsed);
    const toggle = dock.querySelector('#opDockToggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.setAttribute('aria-label', collapsed ? '展開狀態欄' : '收起狀態欄');
      const icon = toggle.querySelector('.op-toggle-icon');
      const label = toggle.querySelector('.op-toggle-label');
      if (icon) icon.textContent = collapsed ? '⌄' : '⌃';
      if (label) label.textContent = collapsed ? '展開' : '收起';
    }
    if (persist) localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
  }

  function ensureMobileActionIcon(button, icon, label) {
    if (!button) return;
    const currentIcon = button.querySelector('.mobile-action-icon')?.textContent;
    const currentLabel = button.querySelector('.mobile-action-label')?.textContent;
    if (currentIcon === icon && currentLabel === label) return;

    const content = document.createElement('span');
    content.className = 'mobile-action-content';
    const iconNode = document.createElement('span');
    iconNode.className = 'mobile-action-icon';
    iconNode.textContent = icon;
    const labelNode = document.createElement('span');
    labelNode.className = 'mobile-action-label';
    labelNode.textContent = label;
    content.append(iconNode, labelNode);
    button.replaceChildren(content);
  }

  function triggerAction(id) {
    const target = document.getElementById(id);
    if (!target || target.disabled) return;
    target.click();
  }

  function ensureStructure() {
    const dock = document.getElementById('operationDock');
    if (!dock) return null;

    dock.classList.add('op-enhanced-v2');

    let toolbar = dock.querySelector(':scope > .op-dock-toolbar');
    let body = dock.querySelector(':scope > .op-dock-body');

    if (!body) {
      body = document.createElement('div');
      body.className = 'op-dock-body';
      const movable = Array.from(dock.children).filter(node => !node.classList.contains('op-dock-toolbar'));
      movable.forEach(node => body.appendChild(node));
      dock.appendChild(body);
    }

    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.className = 'op-dock-toolbar';
      toolbar.innerHTML = `
        <div class="op-dock-summary">
          <span id="opDockSummaryIcon" class="op-dock-summary-icon">☕</span>
          <span class="op-dock-summary-copy"><strong>狀態與操作</strong><small id="opDockSummaryText">咖啡廳主艙 · 休閒探索中</small></span>
        </div>
        <button id="opDockToggle" class="op-collapse-btn" type="button" aria-expanded="true" aria-label="收起狀態欄">
          <span class="op-toggle-icon">⌃</span><span class="op-toggle-label">收起</span>
        </button>`;
      dock.insertBefore(toolbar, body);
      toolbar.querySelector('#opDockToggle')?.addEventListener('click', () => {
        setCollapsed(dock, !dock.classList.contains('is-collapsed'));
      });
      setCollapsed(dock, defaultCollapsed(), false);
    }

    let actionRow = dock.querySelector('#opActionButtons');
    const firstCard = body.querySelector('.op-card');
    if (!actionRow && firstCard) {
      actionRow = document.createElement('div');
      actionRow.id = 'opActionButtons';
      actionRow.className = 'op-action-buttons';
      actionRow.setAttribute('aria-label', '快捷操作按鈕');
      firstCard.appendChild(actionRow);
    }

    return dock;
  }

  function syncActions(dock) {
    const row = dock.querySelector('#opActionButtons');
    if (!row) return;
    const currentScene = scene();

    ACTIONS.forEach(config => {
      const target = document.getElementById(config.id);
      const icon = currentScene === 'deck' ? config.iconDeck : config.iconCafe;
      const label = currentScene === 'deck' ? config.labelDeck : config.labelCafe;

      let button = row.querySelector(`[data-trigger="${config.id}"]`);
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'op-action-button';
        button.dataset.trigger = config.id;
        button.addEventListener('click', () => triggerAction(config.id));
        row.appendChild(button);
      }

      button.hidden = !target;
      button.disabled = !target || target.disabled;
      button.innerHTML = `<span class="op-action-icon">${icon}</span><span class="op-action-label">${label}</span>`;
      button.setAttribute('aria-label', label);

      if (target) ensureMobileActionIcon(target, icon, label);
    });
  }

  function syncSummary(dock) {
    const currentScene = scene();
    const coffeeOpen = !isHidden(document.getElementById('coffeeMenu'));
    const messageOpen = !isHidden(document.getElementById('messageBoard'));
    const icon = dock.querySelector('#opDockSummaryIcon');
    const text = dock.querySelector('#opDockSummaryText');

    if (icon) icon.textContent = currentScene === 'deck' ? '🌊' : '☕';
    if (text) {
      if (coffeeOpen) text.textContent = currentScene === 'deck' ? '星空甲板 · 釣魚操作中' : '咖啡廳主艙 · 咖啡選單開啟';
      else if (messageOpen) text.textContent = `${currentScene === 'deck' ? '星空甲板' : '咖啡廳主艙'} · 留言板開啟`;
      else text.textContent = currentScene === 'deck' ? '星空甲板 · 探索與釣魚' : '咖啡廳主艙 · 休閒探索中';
    }
  }

  function sync() {
    const dock = ensureStructure();
    if (!dock) return false;
    syncActions(dock);
    syncSummary(dock);
    return true;
  }

  function queueSync() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      sync();
    });
  }

  function init() {
    if (!sync()) {
      const rootObserver = new MutationObserver(() => {
        if (sync()) rootObserver.disconnect();
      });
      rootObserver.observe(document.body, { childList:true, subtree:true });
    }

    window.addEventListener('coffee-ship:scene', queueSync);
    window.addEventListener('coffee-ship:entered', queueSync);
    window.addEventListener('coffee-ship:bag-changed', queueSync);
    window.addEventListener('resize', queueSync, { passive:true });
    document.addEventListener('click', () => setTimeout(queueSync, 20), true);

    const panel = document.getElementById('gamePanel');
    if (panel) {
      new MutationObserver(queueSync).observe(panel, { childList:true, subtree:true, attributes:true, attributeFilter:['class'] });
    }

    setTimeout(queueSync, 0);
    setTimeout(queueSync, 300);
    setTimeout(queueSync, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
