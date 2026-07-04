(() => {
  'use strict';

  function addStyle() {
    if (document.getElementById('mobileMutantModalFixStyle')) return;
    const style = document.createElement('style');
    style.id = 'mobileMutantModalFixStyle';
    style.textContent = `
      @media (max-width: 760px) {
        body.mutant-modal-open .mobile-controls {
          display: none !important;
          pointer-events: none !important;
        }
        body.mutant-modal-open #sceneStatusBadge,
        body.mutant-modal-open #mobileDeckDoorTip,
        body.mutant-modal-open .deck-tip,
        body.mutant-modal-open #roleAbilityBtn,
        body.mutant-modal-open #changeCharacterBtn {
          display: none !important;
        }
        .mutant-card:not(.hidden) {
          position: fixed !important;
          left: 50% !important;
          top: 38% !important;
          transform: translate(-50%, -50%) !important;
          z-index: 10001 !important;
          width: min(88vw, 370px) !important;
          max-height: 58dvh !important;
          overflow-y: auto !important;
          padding: 14px !important;
          pointer-events: auto !important;
        }
        .mutant-card:not(.hidden) .mutant-trait {
          max-height: 28dvh !important;
          overflow-y: auto !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function sync() {
    const card = document.getElementById('mutantCard');
    const open = !!card && !card.classList.contains('hidden');
    document.body.classList.toggle('mutant-modal-open', open);
  }

  function init() {
    addStyle();
    setInterval(sync, 150);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
