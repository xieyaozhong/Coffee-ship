(() => {
  'use strict';

  function addStyle() {
    if (document.getElementById('mobileModalFixStyle')) return;
    const style = document.createElement('style');
    style.id = 'mobileModalFixStyle';
    style.textContent = `
      @media (max-width: 760px) {
        body.modal-open {
          overflow: hidden !important;
          touch-action: none;
        }
        body.modal-open .mobile-controls {
          display: none !important;
          pointer-events: none !important;
        }
        body.modal-open #sceneStatusBadge,
        body.modal-open #mobileDeckDoorTip,
        body.modal-open .deck-tip,
        body.modal-open .port-tip,
        body.modal-open #roleAbilityBtn,
        body.modal-open #desktopRoleAbilityBtn,
        body.modal-open #changeCharacterBtn {
          display: none !important;
        }
        .fishdex-panel:not(.hidden) {
          position: fixed !important;
          left: 0 !important;
          top: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          max-width: none !important;
          height: 100dvh !important;
          max-height: none !important;
          transform: none !important;
          z-index: 9998 !important;
          border-radius: 0 !important;
          border-left: 0 !important;
          border-right: 0 !important;
          padding: 18px 16px 96px !important;
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
          text-align: left !important;
          pointer-events: auto !important;
        }
        .fishdex-panel:not(.hidden) .fishdex-close,
        .fishdex-panel:not(.hidden) #clearFishCardBtn {
          position: sticky !important;
          top: 8px !important;
          z-index: 2 !important;
        }
        .fishdex-panel:not(.hidden) .fishdex-actions {
          position: sticky !important;
          bottom: 0 !important;
          z-index: 3 !important;
          background: rgba(21,16,32,.96) !important;
          padding: 10px 0 8px !important;
          margin: 10px 0 !important;
        }
        .fishdex-panel:not(.hidden) .fish-grid {
          grid-template-columns: 1fr !important;
          padding-bottom: 18px !important;
        }
        .fishing-card:not(.hidden),
        .fishing-special-card:not(.hidden) {
          position: fixed !important;
          left: 50% !important;
          top: 42% !important;
          z-index: 9999 !important;
          max-height: 70dvh !important;
          overflow-y: auto !important;
          pointer-events: auto !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function modalIsOpen() {
    const selectors = ['#fishDexPanel', '#fishingCard', '#fishingSpecialCard', '#messageBoard', '#coffeeMenu'];
    return selectors.some(sel => {
      const el = document.querySelector(sel);
      return el && !el.classList.contains('hidden');
    });
  }

  function syncBodyState() {
    document.body.classList.toggle('modal-open', modalIsOpen());
  }

  function stopBackgroundInput() {
    ['keydown', 'pointerdown', 'touchstart', 'click'].forEach(type => {
      window.addEventListener(type, event => {
        if (!document.body.classList.contains('modal-open')) return;
        const target = event.target;
        if (target && target.closest && target.closest('#fishDexPanel, #fishingCard, #fishingSpecialCard, #messageBoard, #coffeeMenu')) return;
        if (target && target.closest && target.closest('.mobile-controls')) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }, true);
    });
  }

  function patchCloseButtons() {
    document.addEventListener('click', event => {
      const close = event.target.closest?.('.fishdex-close, #clearFishCardBtn, #closeBoardBtn, #closeCoffeeMenuBtn');
      if (!close) return;
      setTimeout(syncBodyState, 80);
    }, true);
  }

  function init() {
    addStyle();
    stopBackgroundInput();
    patchCloseButtons();
    setInterval(syncBodyState, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
