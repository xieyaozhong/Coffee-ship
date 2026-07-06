(() => {
  'use strict';
  if (window.__COFFEE_SHIP_MOBILE_CONTROLS_RUNTIME_FIX_V2__) return;
  window.__COFFEE_SHIP_MOBILE_CONTROLS_RUNTIME_FIX_V2__ = true;

  const ACTIONS = {
    coffeeBtn: { icon: '☕', label: '咖啡', aria: '開啟咖啡選單' },
    sitBtn: { icon: '✋', label: '互動', aria: '互動或坐下' },
    messageBtn: { icon: '💬', label: '留言', aria: '開啟留言板' },
    emoteBtn: { icon: '✨', label: '表情', aria: '使用表情' },
    fishDexBtn: { icon: '🐟', label: '圖鑑', aria: '開啟漁獲圖鑑' }
  };

  const DIRECTIONS = {
    up: { glyph: '▲', aria: '向上移動' },
    left: { glyph: '◀', aria: '向左移動' },
    down: { glyph: '▼', aria: '向下移動' },
    right: { glyph: '▶', aria: '向右移動' }
  };

  let queued = false;

  function makeActionContent(icon, label) {
    const wrapper = document.createElement('span');
    wrapper.className = 'mobile-action-content';

    const iconNode = document.createElement('span');
    iconNode.className = 'mobile-action-icon';
    iconNode.textContent = icon;

    const labelNode = document.createElement('span');
    labelNode.className = 'mobile-action-label';
    labelNode.textContent = label;

    wrapper.append(iconNode, labelNode);
    return wrapper;
  }

  function fixActionButton(id, config) {
    const button = document.getElementById(id);
    if (!button) return;

    const currentIcon = button.querySelector('.mobile-action-icon')?.textContent;
    const currentLabel = button.querySelector('.mobile-action-label')?.textContent;
    if (currentIcon !== config.icon || currentLabel !== config.label) {
      button.replaceChildren(makeActionContent(config.icon, config.label));
    }

    button.setAttribute('aria-label', config.aria);
    button.setAttribute('title', config.aria);
    button.dataset.mobileControlFixed = '2';

    button.style.setProperty('display', 'flex', 'important');
    button.style.setProperty('align-items', 'center', 'important');
    button.style.setProperty('justify-content', 'center', 'important');
    button.style.setProperty('font-size', 'initial', 'important');
    button.style.setProperty('color', '#fff8df', 'important');
  }

  function fixDirectionButtons() {
    document.querySelectorAll('.mobile-controls [data-move]').forEach(button => {
      const config = DIRECTIONS[button.dataset.move];
      if (!config) return;
      if (button.textContent !== config.glyph) button.textContent = config.glyph;
      button.setAttribute('aria-label', config.aria);
      button.setAttribute('title', config.aria);
      button.style.setProperty('font-size', '20px', 'important');
      button.style.setProperty('color', '#fff8df', 'important');
    });
  }

  function fixAllButtons() {
    fixDirectionButtons();
    Object.entries(ACTIONS).forEach(([id, config]) => fixActionButton(id, config));
  }

  function queueFix() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fixAllButtons();
    });
  }

  function init() {
    fixAllButtons();

    const controls = document.querySelector('.mobile-controls');
    if (controls) {
      new MutationObserver(queueFix).observe(controls, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    const rootObserver = new MutationObserver(queueFix);
    rootObserver.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('coffee-ship:entered', queueFix);
    window.addEventListener('coffee-ship:scene', queueFix);
    window.addEventListener('resize', queueFix, { passive: true });

    setTimeout(fixAllButtons, 0);
    setTimeout(fixAllButtons, 250);
    setTimeout(fixAllButtons, 1000);
    setTimeout(fixAllButtons, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
