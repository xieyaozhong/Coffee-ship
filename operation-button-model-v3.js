(() => {
  'use strict';
  if (window.__COFFEE_SHIP_OPERATION_BUTTON_MODEL_V3__) return;
  window.__COFFEE_SHIP_OPERATION_BUTTON_MODEL_V3__ = true;

  const BUTTONS = {
    coffeeBtn:{tone:'coffee',hint:'C'},
    sitBtn:{tone:'interact',hint:'E'},
    messageBtn:{tone:'message',hint:'B'},
    emoteBtn:{tone:'emote',hint:'SPACE'},
    fishDexBtn:{tone:'dex',hint:'DEX'}
  };

  let queued = false;

  function decorateButton(button, config) {
    if (!button || !config) return;
    button.dataset.buttonModel = 'v3';
    button.dataset.buttonTone = config.tone;
    button.dataset.buttonHint = config.hint;
    if (button.dataset.pressModelBound !== 'true') {
      button.dataset.pressModelBound = 'true';
      const down = event => {
        if (button.disabled) return;
        button.classList.add('is-pressed');
        if (event.pointerType === 'touch' && navigator.vibrate) navigator.vibrate(6);
      };
      const up = () => button.classList.remove('is-pressed');
      button.addEventListener('pointerdown', down, {passive:true});
      button.addEventListener('pointerup', up, {passive:true});
      button.addEventListener('pointercancel', up, {passive:true});
      button.addEventListener('pointerleave', up, {passive:true});
      button.addEventListener('blur', up);
    }
  }

  function decorateActionButtons() {
    document.querySelectorAll('#operationDock .op-action-button[data-trigger]').forEach(button => {
      decorateButton(button, BUTTONS[button.dataset.trigger]);
    });
    Object.entries(BUTTONS).forEach(([id, config]) => decorateButton(document.getElementById(id), config));
  }

  function decorateDirectionButtons() {
    document.querySelectorAll('.mobile-controls [data-move]').forEach(button => {
      button.dataset.buttonModel = 'v3';
      button.dataset.buttonTone = 'direction';
      button.dataset.buttonHint = button.dataset.move || '';
      decorateButton(button, {tone:'direction',hint:button.dataset.move || ''});
    });
  }

  function decorateUtilityButtons() {
    const toggle = document.getElementById('opDockToggle');
    if (toggle) decorateButton(toggle, {tone:'toggle',hint:''});
    document.querySelectorAll('.coffee-menu .ghost-btn,.message-board .ghost-btn,.message-form button,.coffee-options button').forEach(button => {
      decorateButton(button, {tone:'utility',hint:''});
    });
  }

  function sync() {
    decorateActionButtons();
    decorateDirectionButtons();
    decorateUtilityButtons();
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
    sync();
    const panel = document.getElementById('gamePanel');
    if (panel) new MutationObserver(queueSync).observe(panel, {childList:true,subtree:true});
    window.addEventListener('coffee-ship:scene', queueSync);
    window.addEventListener('coffee-ship:entered', queueSync);
    window.addEventListener('resize', queueSync, {passive:true});
    setTimeout(sync, 0);
    setTimeout(sync, 300);
    setTimeout(sync, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();