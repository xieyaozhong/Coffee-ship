(() => {
  'use strict';

  function addStyle() {
    if (document.getElementById('mobileGameLayoutStyle')) return;
    const style = document.createElement('style');
    style.id = 'mobileGameLayoutStyle';
    style.textContent = `
      @media (max-width: 760px) {
        .shell { width: 100%; padding: 10px 10px 90px; }
        .hero { margin-bottom: 8px; }
        h1 { font-size: 30px; text-align: center; width: 100%; }
        .game-panel { padding: 12px; border-radius: 18px; }
        .game-topbar {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .game-topbar > div:first-child {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          flex-wrap: wrap;
        }
        #avatarName {
          font-size: 20px;
          line-height: 1.15;
          max-width: 180px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          margin-right: 0;
        }
        #coffeeBadge {
          font-size: 14px;
          padding: 7px 10px;
          white-space: nowrap;
        }
        #changeCharacterBtn {
          position: static !important;
          width: 52px;
          height: 52px;
          min-width: 52px;
          margin-left: 0 !important;
          grid-column: 2;
          grid-row: 1;
        }
        canvas {
          border-radius: 15px;
          border-width: 3px;
          max-height: 44vh;
          object-fit: contain;
        }
        .mobile-controls {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-top: 12px;
        }
        .mobile-controls > div {
          display: contents;
        }
        .mobile-controls button,
        #roleAbilityBtn {
          width: 100% !important;
          min-width: 0 !important;
          height: 58px !important;
          padding: 0 !important;
          border-radius: 16px !important;
          font-size: 22px !important;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .mobile-controls button:nth-child(1) { grid-column: 1; grid-row: 1; }
        .mobile-controls div button:nth-child(1) { grid-column: 2; grid-row: 1; }
        .mobile-controls div button:nth-child(2) { grid-column: 3; grid-row: 1; }
        .mobile-controls div button:nth-child(3) { grid-column: 4; grid-row: 1; }
        #coffeeBtn { grid-column: 1; grid-row: 2; font-size: 0 !important; }
        #coffeeBtn::after { content: '☕'; font-size: 24px; }
        #sitBtn { grid-column: 2; grid-row: 2; font-size: 0 !important; }
        #sitBtn::after { content: '摸'; font-size: 20px; }
        #messageBtn { grid-column: 3; grid-row: 2; font-size: 0 !important; }
        #messageBtn::after { content: '留言'; font-size: 20px; }
        #emoteBtn { grid-column: 4; grid-row: 2; }
        #roleAbilityBtn.show {
          display: inline-flex !important;
          grid-column: 4;
          grid-row: 3;
        }
        #sceneStatusBadge {
          left: 16px !important;
          bottom: auto !important;
          top: 76px !important;
          z-index: 10 !important;
          transform: scale(.88);
          transform-origin: left top;
          opacity: .88;
        }
        .deck-tip, .port-tip {
          top: 62px !important;
          font-size: 13px;
          padding: 6px 10px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    addStyle();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
