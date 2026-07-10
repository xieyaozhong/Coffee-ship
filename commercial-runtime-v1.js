(() => {
  'use strict';
  if (window.__COFFEE_SHIP_COMMERCIAL_RUNTIME_V1__) return;
  window.__COFFEE_SHIP_COMMERCIAL_RUNTIME_V1__ = true;

  const BUILD = 'COMMERCIAL 2026.07.10';
  const ERROR_KEY = 'coffeeShipRuntimeDiagnostics';
  let toastTimer = 0;
  let wasOffline = !navigator.onLine;

  function safeText(value) {
    return String(value ?? '').replace(/[<>]/g, '');
  }

  function ensureSystemLayer() {
    let layer = document.getElementById('csSystemLayer');
    if (layer) return layer;
    layer = document.createElement('section');
    layer.id = 'csSystemLayer';
    layer.setAttribute('aria-label', '系統狀態');
    layer.innerHTML = `
      <div id="csConnectionBanner" class="cs-system-banner" role="status" aria-live="polite" hidden>
        <span id="csConnectionIcon" class="cs-system-icon">📡</span>
        <span class="cs-system-copy"><strong id="csConnectionTitle">連線狀態</strong><small id="csConnectionMessage"></small></span>
        <button id="csConnectionAction" class="cs-system-action" type="button">重新整理</button>
      </div>
      <div id="csSystemToast" class="cs-system-toast" role="status" aria-live="polite" hidden>
        <span id="csToastIcon" class="cs-system-icon">✓</span>
        <span class="cs-system-copy"><strong id="csToastTitle">系統訊息</strong><small id="csToastMessage"></small></span>
        <button id="csToastAction" class="cs-system-action" type="button" hidden>處理</button>
      </div>`;
    document.body.appendChild(layer);
    layer.querySelector('#csConnectionAction')?.addEventListener('click', () => location.reload());
    return layer;
  }

  function showToast(title, message, options = {}) {
    const layer = ensureSystemLayer();
    const toast = layer.querySelector('#csSystemToast');
    const icon = layer.querySelector('#csToastIcon');
    const titleNode = layer.querySelector('#csToastTitle');
    const messageNode = layer.querySelector('#csToastMessage');
    const action = layer.querySelector('#csToastAction');
    if (!toast || !icon || !titleNode || !messageNode || !action) return;

    clearTimeout(toastTimer);
    icon.textContent = options.icon || '✓';
    titleNode.textContent = safeText(title);
    messageNode.textContent = safeText(message);
    action.hidden = !options.actionLabel;
    action.textContent = safeText(options.actionLabel || '');
    action.onclick = options.onAction || null;
    toast.hidden = false;
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, options.duration || 3600);
  }

  function updateConnectionState() {
    const layer = ensureSystemLayer();
    const banner = layer.querySelector('#csConnectionBanner');
    const icon = layer.querySelector('#csConnectionIcon');
    const title = layer.querySelector('#csConnectionTitle');
    const message = layer.querySelector('#csConnectionMessage');
    const action = layer.querySelector('#csConnectionAction');
    if (!banner || !icon || !title || !message || !action) return;

    if (!navigator.onLine) {
      wasOffline = true;
      banner.hidden = false;
      banner.classList.remove('is-online');
      icon.textContent = '⚠️';
      title.textContent = '目前處於離線狀態';
      message.textContent = '本機功能仍可使用；同步、留言與線上內容可能暫時無法更新。';
      action.hidden = false;
      action.textContent = '重新整理';
      return;
    }

    if (wasOffline) {
      banner.hidden = false;
      banner.classList.add('is-online');
      icon.textContent = '✓';
      title.textContent = '連線已恢復';
      message.textContent = '線上功能將繼續同步。';
      action.hidden = true;
      window.setTimeout(() => { banner.hidden = true; }, 2600);
    } else {
      banner.hidden = true;
    }
    wasOffline = false;
  }

  function readDiagnostics() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(ERROR_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function recordDiagnostic(kind, message, source = '') {
    try {
      const list = readDiagnostics();
      list.push({
        kind: safeText(kind).slice(0, 40),
        message: safeText(message).slice(0, 280),
        source: safeText(source).slice(0, 180),
        at: new Date().toISOString()
      });
      sessionStorage.setItem(ERROR_KEY, JSON.stringify(list.slice(-10)));
    } catch (_) {
      // Diagnostics are local-only and optional.
    }
  }

  function handleRuntimeError(kind, message, source) {
    recordDiagnostic(kind, message, source);
    showToast(
      '部分功能發生暫時性錯誤',
      '遊戲會繼續運作；若畫面沒有恢復，可重新整理頁面。',
      { icon:'⚠️', actionLabel:'重新整理', onAction:() => location.reload(), duration:7000 }
    );
  }

  function enhanceAccessibility() {
    const canvas = document.getElementById('game');
    if (canvas) {
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'Coffee Ship 像素遊戲畫面');
      canvas.setAttribute('tabindex', '0');
    }

    const controls = document.querySelector('.mobile-controls');
    if (controls) {
      controls.setAttribute('role', 'group');
      controls.setAttribute('aria-label', '遊戲操作按鈕');
    }

    const dock = document.getElementById('operationDock');
    if (dock) {
      dock.setAttribute('role', 'region');
      dock.setAttribute('aria-label', '遊戲狀態與快捷操作');
    }

    const status = document.querySelector('.status-card');
    if (status) {
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
    }

    const coffeeMenu = document.getElementById('coffeeMenu');
    if (coffeeMenu) {
      coffeeMenu.setAttribute('role', 'dialog');
      coffeeMenu.setAttribute('aria-label', '效果咖啡選單');
    }

    const messageBoard = document.getElementById('messageBoard');
    if (messageBoard) {
      messageBoard.setAttribute('role', 'dialog');
      messageBoard.setAttribute('aria-label', '船上留言板');
    }

    document.querySelectorAll('button:not([type])').forEach(button => {
      button.type = button.closest('form') ? 'submit' : 'button';
    });
  }

  function addBuildBadge() {
    const host = document.querySelector('.status-card');
    if (!host || host.querySelector('.cs-build-badge')) return;
    const badge = document.createElement('span');
    badge.className = 'cs-build-badge';
    badge.textContent = BUILD;
    host.appendChild(badge);
  }

  function addRecoveryCard(message) {
    const creator = document.getElementById('creator');
    if (!creator || creator.querySelector('.cs-recovery-card')) return;
    const card = document.createElement('div');
    card.className = 'cs-recovery-card';
    card.innerHTML = `<strong>系統未完整載入</strong><small>${safeText(message)}</small><button type="button">重新整理頁面</button>`;
    card.querySelector('button')?.addEventListener('click', () => location.reload());
    creator.appendChild(card);
  }

  function validateCriticalUI() {
    const missing = [];
    if (!document.getElementById('startBtn')) missing.push('登船按鈕');
    if (!document.getElementById('game')) missing.push('遊戲畫布');
    if (!document.getElementById('gamePanel')) missing.push('遊戲介面');
    if (missing.length) {
      recordDiagnostic('critical-ui', `Missing: ${missing.join(', ')}`);
      addRecoveryCard(`缺少必要元件：${missing.join('、')}。這通常是暫時性的快取或載入問題。`);
      return false;
    }
    return true;
  }

  function markReady() {
    document.documentElement.classList.remove('cs-booting');
    document.documentElement.classList.add('cs-ready');
    document.body?.removeAttribute('aria-busy');
  }

  function recordPerformance() {
    try {
      const nav = performance.getEntriesByType?.('navigation')?.[0];
      if (!nav) return;
      sessionStorage.setItem('coffeeShipLastPerformance', JSON.stringify({
        domReady: Math.round(nav.domContentLoadedEventEnd),
        loaded: Math.round(nav.loadEventEnd || performance.now()),
        transfer: nav.transferSize || 0,
        at: new Date().toISOString()
      }));
    } catch (_) {
      // Local performance metrics are optional.
    }
  }

  function init() {
    document.body?.setAttribute('aria-busy', 'true');
    ensureSystemLayer();
    updateConnectionState();
    enhanceAccessibility();
    addBuildBadge();
    validateCriticalUI();

    const observer = new MutationObserver(() => {
      enhanceAccessibility();
      addBuildBadge();
    });
    observer.observe(document.body, { childList:true, subtree:true });

    window.addEventListener('online', updateConnectionState);
    window.addEventListener('offline', updateConnectionState);
    window.addEventListener('error', event => {
      handleRuntimeError('error', event.message || 'Unknown error', event.filename || '');
    });
    window.addEventListener('unhandledrejection', event => {
      const reason = event.reason instanceof Error ? event.reason.message : String(event.reason || 'Unknown rejection');
      handleRuntimeError('unhandledrejection', reason, 'promise');
    });

    window.addEventListener('coffee-ship:entered', () => {
      showToast('登船完成', '系統已切換至遊戲模式。', { icon:'⚓', duration:1800 });
      enhanceAccessibility();
    });

    if (document.readyState === 'complete') {
      markReady();
      recordPerformance();
    } else {
      window.addEventListener('load', () => {
        markReady();
        recordPerformance();
      }, { once:true });
      window.setTimeout(markReady, 3200);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
