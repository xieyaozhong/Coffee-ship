(() => {
  'use strict';

  function addStyle() {
    if (document.getElementById('mobileSharkModalFixStyle')) return;
    const style = document.createElement('style');
    style.id = 'mobileSharkModalFixStyle';
    style.textContent = `
      @media (max-width: 760px) {
        body.shark-modal-open .mobile-controls {
          display: none !important;
          pointer-events: none !important;
        }
        body.shark-modal-open #sceneStatusBadge,
        body.shark-modal-open #mobileDeckDoorTip,
        body.shark-modal-open .deck-tip,
        body.shark-modal-open #roleAbilityBtn,
        body.shark-modal-open #changeCharacterBtn {
          display: none !important;
        }
        .shark-card:not(.hidden) {
          position: fixed !important;
          left: 50% !important;
          top: 38% !important;
          transform: translate(-50%, -50%) !important;
          z-index: 10000 !important;
          width: min(88vw, 360px) !important;
          max-height: 58dvh !important;
          overflow-y: auto !important;
          padding: 14px !important;
          pointer-events: auto !important;
        }
        .shark-card:not(.hidden) .shark-loss {
          max-height: 26dvh !important;
          overflow-y: auto !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function sync() {
    const card = document.getElementById('sharkCard');
    const open = !!card && !card.classList.contains('hidden');
    document.body.classList.toggle('shark-modal-open', open);
  }

  function init() {
    addStyle();
    setInterval(sync, 150);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
