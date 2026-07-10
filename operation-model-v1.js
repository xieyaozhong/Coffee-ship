(() => {
  'use strict';
  if (window.__COFFEE_SHIP_OPERATION_MODEL_V1__) return;
  window.__COFFEE_SHIP_OPERATION_MODEL_V1__ = true;

  function ensureDock() {
    const panel = document.getElementById('gamePanel');
    const canvas = document.getElementById('game');
    if (!panel || !canvas) return false;
    if (!document.getElementById('operationDock')) {
      const dock = document.createElement('section');
      dock.id = 'operationDock';
      dock.innerHTML = `
        <article class="op-card">
          <div class="op-card-head"><strong>COMMAND DECK</strong><span>OPERATION</span></div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px">
            <div id="opScenePill" class="op-scene-pill">☕ 咖啡廳</div>
            <div id="opModePill" class="op-chip">休閒探索中</div>
          </div>
          <div class="op-grid">
            <div class="op-stat"><span>目前場景</span><strong id="opSceneLabel">咖啡廳主艙</strong></div>
            <div class="op-stat"><span>主要互動</span><strong id="opActionLabel">點咖啡、互動、留言</strong></div>
            <div class="op-stat"><span>目前提示</span><strong id="opHintLabel">靠近角色或物件後按互動</strong></div>
          </div>
        </article>
        <article class="op-card">
          <div class="op-card-head"><strong>快捷操作</strong><span>SHORTCUTS</span></div>
          <div id="opKeys" class="op-key-list"></div>
          <div style="height:10px"></div>
          <div class="op-card-head" style="margin-bottom:8px"><strong>視窗狀態</strong><span>LIVE</span></div>
          <div class="op-panel-state">
            <div class="op-panel-pill"><div><small>咖啡視窗</small><strong id="opCoffeeState">已關閉</strong></div><span id="opCoffeeTag" class="op-panel-closed">Closed</span></div>
            <div class="op-panel-pill"><div><small>留言視窗</small><strong id="opMessageState">已關閉</strong></div><span id="opMessageTag" class="op-panel-closed">Closed</span></div>
          </div>
        </article>`;
      canvas.insertAdjacentElement('afterend', dock);
    }
    return true;
  }

  function ensureMobileModel() {
    const mobile = document.querySelector('.mobile-controls');
    if (!mobile || mobile.dataset.operationModeled === 'true') return;
    mobile.dataset.operationModeled = 'true';

    const moveTop = mobile.querySelector('[data-move="up"]');
    const moveRow = mobile.querySelector('div');
    const actionButtons = Array.from(mobile.querySelectorAll('#coffeeBtn,#sitBtn,#messageBtn,#emoteBtn'));
    if (!moveTop || !moveRow) return;

    const moveBlock = document.createElement('div');
    moveBlock.className = 'op-mobile-block';
    moveBlock.innerHTML = '<h4>MOVEMENT</h4><div class="op-mobile-stack"></div>';
    const stack = moveBlock.querySelector('.op-mobile-stack');
    stack.appendChild(moveTop);
    stack.appendChild(moveRow);

    const actionBlock = document.createElement('div');
    actionBlock.className = 'op-mobile-block';
    actionBlock.innerHTML = '<h4>ACTIONS</h4><div class="op-mobile-actions"></div>';
    const actionWrap = actionBlock.querySelector('.op-mobile-actions');
    actionButtons.forEach(btn => actionWrap.appendChild(btn));

    mobile.innerHTML = '';
    mobile.appendChild(moveBlock);
    mobile.appendChild(actionBlock);
  }

  function ensureHeaderHints() {
    document.querySelectorAll('#coffeeMenu .board-head, #messageBoard .board-head').forEach(head => {
      if (head.querySelector('.op-close-hint')) return;
      const hint = document.createElement('div');
      hint.className = 'op-close-hint';
      hint.textContent = 'Esc / 關閉按鈕 可收合視窗';
      head.querySelector('div')?.appendChild(hint);
    });
  }

  function sceneState() {
    return document.body.dataset.coffeeShipScene === 'deck' ? 'deck' : 'cafe';
  }

  function hidden(el) {
    return !el || el.classList.contains('hidden') || getComputedStyle(el).display === 'none';
  }

  function setPanelStatus(prefix, open, title) {
    const state = document.getElementById(prefix + 'State');
    const tag = document.getElementById(prefix + 'Tag');
    if (!state || !tag) return;
    state.textContent = open ? `${title}開啟中` : '已關閉';
    tag.textContent = open ? 'Open' : 'Closed';
    tag.className = open ? 'op-panel-open' : 'op-panel-closed';
  }

  function renderKeys(scene) {
    const wrap = document.getElementById('opKeys');
    if (!wrap) return;
    const entries = scene === 'deck'
      ? [ ['WASD','移動'], ['E','互動 / 回艙'], ['C','釣魚'], ['B','留言'], ['Space','表情'] ]
      : [ ['WASD','移動'], ['E','互動'], ['C','咖啡'], ['B','留言'], ['Space','表情'] ];
    wrap.innerHTML = entries.map(([key,label]) => `<span class="op-key"><b>${key}</b>${label}</span>`).join('');
  }

  function update() {
    if (!ensureDock()) return;
    ensureMobileModel();
    ensureHeaderHints();

    const scene = sceneState();
    const coffeeMenu = document.getElementById('coffeeMenu');
    const board = document.getElementById('messageBoard');
    const coffeeOpen = !hidden(coffeeMenu);
    const boardOpen = !hidden(board);

    const scenePill = document.getElementById('opScenePill');
    const modePill = document.getElementById('opModePill');
    const sceneLabel = document.getElementById('opSceneLabel');
    const actionLabel = document.getElementById('opActionLabel');
    const hintLabel = document.getElementById('opHintLabel');

    if (scene === 'deck') {
      if (scenePill) scenePill.textContent = '🌊 星空甲板';
      if (sceneLabel) sceneLabel.textContent = '觀景甲板 / 釣魚區';
      if (actionLabel) actionLabel.textContent = '回艙、釣魚、休憩互動';
      if (hintLabel) hintLabel.textContent = '左側回咖啡廳，右側可釣魚';
      if (modePill) modePill.textContent = coffeeOpen ? '甲板操作中' : '甲板探索中';
    } else {
      if (scenePill) scenePill.textContent = '☕ 咖啡廳主艙';
      if (sceneLabel) sceneLabel.textContent = 'Momo 吧台 / 留言區 / 舞台';
      if (actionLabel) actionLabel.textContent = '點咖啡、人物互動、留言';
      if (hintLabel) hintLabel.textContent = '靠近角色或座位後按互動';
      if (modePill) modePill.textContent = coffeeOpen ? '咖啡選單開啟' : boardOpen ? '留言板開啟' : '休閒探索中';
    }

    setPanelStatus('opCoffee', coffeeOpen, '咖啡視窗');
    setPanelStatus('opMessage', boardOpen, '留言視窗');
    renderKeys(scene);
  }

  function init() {
    update();
    window.addEventListener('coffee-ship:scene', update);
    window.addEventListener('coffee-ship:entered', update);
    document.addEventListener('click', () => setTimeout(update, 20), true);
    const observer = new MutationObserver(() => update());
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-coffee-ship-scene'] });
    document.getElementById('coffeeMenu') && observer.observe(document.getElementById('coffeeMenu'), { attributes: true, attributeFilter: ['class'] });
    document.getElementById('messageBoard') && observer.observe(document.getElementById('messageBoard'), { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();