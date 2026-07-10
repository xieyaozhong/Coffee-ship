(() => {
  'use strict';
  if (window.__COFFEE_SHIP_OPERATION_BUTTON_MODEL_V4__) return;
  window.__COFFEE_SHIP_OPERATION_BUTTON_MODEL_V4__ = true;

  const BUTTONS = {
    coffeeBtn:{tone:'coffee',hint:'C'},
    sitBtn:{tone:'interact',hint:'E'},
    messageBtn:{tone:'message',hint:'B'},
    emoteBtn:{tone:'emote',hint:'SPACE'},
    fishDexBtn:{tone:'dex',hint:'DEX'}
  };

  const PROTECTED_SELECTOR = [
    '#game',
    '.mobile-controls',
    '#operationDock',
    '.coffee-menu button',
    '.message-board button',
    '.coffee-options button',
    '#sceneStatusBadge'
  ].join(',');

  const EDITABLE_SELECTOR = 'input,textarea,select,[contenteditable="true"],[contenteditable=""]';
  let queued = false;

  function injectTouchGuardStyle() {
    if (document.getElementById('coffeeShipTouchGuardStyle')) return;
    const style = document.createElement('style');
    style.id = 'coffeeShipTouchGuardStyle';
    style.textContent = `
      ${PROTECTED_SELECTOR},
      ${PROTECTED_SELECTOR} *{
        -webkit-user-select:none!important;
        user-select:none!important;
        -webkit-touch-callout:none!important;
        -webkit-tap-highlight-color:transparent!important;
      }
      .mobile-controls button,
      #operationDock button,
      .coffee-menu button,
      .message-board button,
      .coffee-options button{
        touch-action:manipulation!important;
        -webkit-user-drag:none!important;
      }
      .mobile-controls [data-move]{touch-action:none!important}
      .mobile-controls img,
      #operationDock img{
        -webkit-user-drag:none!important;
        user-drag:none!important;
        pointer-events:none!important;
      }
      input,textarea,select,[contenteditable="true"],[contenteditable=""]{
        -webkit-user-select:text!important;
        user-select:text!important;
        -webkit-touch-callout:default!important;
      }
    `;
    document.head.appendChild(style);
  }

  function protectedTarget(target) {
    if (!(target instanceof Element)) return null;
    if (target.closest(EDITABLE_SELECTOR)) return null;
    return target.closest(PROTECTED_SELECTOR);
  }

  function clearSelection() {
    const selection = window.getSelection?.();
    if (selection && selection.rangeCount) selection.removeAllRanges();
  }

  function bindLongPressGuard() {
    if (document.documentElement.dataset.longPressGuardBound === 'true') return;
    document.documentElement.dataset.longPressGuardBound = 'true';

    ['contextmenu','selectstart','dragstart'].forEach(type => {
      document.addEventListener(type, event => {
        if (!protectedTarget(event.target)) return;
        event.preventDefault();
        clearSelection();
      }, true);
    });

    document.addEventListener('pointerdown', event => {
      if (!protectedTarget(event.target)) return;
      clearSelection();
    }, true);

    document.addEventListener('touchstart', event => {
      if (!protectedTarget(event.target)) return;
      clearSelection();
    }, {capture:true,passive:true});
  }

  function decorateButton(button, config) {
    if (!button || !config) return;
    button.dataset.buttonModel = 'v4';
    button.dataset.buttonTone = config.tone;
    button.dataset.buttonHint = config.hint;
    button.setAttribute('draggable', 'false');
    if (button.dataset.pressModelBound !== 'true') {
      button.dataset.pressModelBound = 'true';
      const down = event => {
        if (button.disabled) return;
        button.classList.add('is-pressed');
        clearSelection();
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
      button.dataset.buttonModel = 'v4';
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
    injectTouchGuardStyle();
    bindLongPressGuard();
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