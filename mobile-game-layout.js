(() => {
  'use strict';

  function addStyle() {
    let style = document.getElementById('mobileGameLayoutStyle');
    if (!style) {
      style = document.createElement('style');
      style.id = 'mobileGameLayoutStyle';
      document.head.appendChild(style);
    }

    style.textContent = `
      @media (max-width:760px) {
        .shell { width:100%; padding:10px 10px 88px; }
        .hero { margin-bottom:8px; }
        h1 { width:100%; margin:0 auto 8px; font-size:30px; text-align:center; }
        .game-panel { padding:10px; border-radius:18px; overflow:visible; }
        .game-topbar {
          display:grid;
          grid-template-columns:minmax(0,1fr) auto;
          align-items:center;
          gap:8px;
          margin-bottom:9px;
        }
        .game-topbar > div:first-child {
          display:flex;
          min-width:0;
          align-items:center;
          gap:7px;
          flex-wrap:wrap;
        }
        #avatarName {
          max-width:185px;
          margin-right:0;
          overflow:hidden;
          font-size:18px;
          line-height:1.15;
          white-space:nowrap;
          text-overflow:ellipsis;
        }
        #coffeeBadge {
          max-width:170px;
          overflow:hidden;
          padding:6px 9px;
          font-size:12px;
          white-space:nowrap;
          text-overflow:ellipsis;
        }
        #changeCharacterBtn {
          position:static!important;
          grid-column:2;
          grid-row:1;
          width:46px!important;
          min-width:46px!important;
          height:46px!important;
          margin:0!important;
          padding:0!important;
        }
        #game, #deckOverlay {
          width:100%;
          max-height:none;
          aspect-ratio:5/3;
          object-fit:contain;
          border-radius:15px;
        }
        .mobile-controls {
          display:grid!important;
          grid-template-columns:repeat(6,minmax(0,1fr));
          grid-template-rows:54px 54px;
          gap:7px;
          margin-top:10px;
          padding:8px;
          border:2px solid #5b3e4e;
          border-radius:18px;
          background:linear-gradient(180deg,rgba(32,23,39,.98),rgba(18,13,27,.98));
          box-shadow:0 8px 0 rgba(0,0,0,.24);
          position:relative;
          z-index:40;
        }
        .mobile-controls > div { display:contents; }
        .mobile-controls button,
        #roleAbilityBtn {
          width:100%!important;
          min-width:0!important;
          height:54px!important;
          margin:0!important;
          padding:0 4px!important;
          border-radius:14px!important;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          font-size:19px!important;
          line-height:1;
          touch-action:manipulation;
          user-select:none;
          -webkit-user-select:none;
        }
        .mobile-controls [data-move] {
          background:#3a293d;
          color:#fff4d8;
          box-shadow:0 5px 0 #1a1220;
        }
        .mobile-controls > button[data-move="up"] { grid-column:2; grid-row:1; }
        .mobile-controls div button[data-move="left"] { grid-column:1; grid-row:2; }
        .mobile-controls div button[data-move="down"] { grid-column:2; grid-row:2; }
        .mobile-controls div button[data-move="right"] { grid-column:3; grid-row:2; }
        #coffeeBtn { grid-column:4; grid-row:1; font-size:0!important; }
        #coffeeBtn::after { content:'☕'; font-size:22px; }
        #sitBtn { grid-column:5; grid-row:1; font-size:0!important; }
        #sitBtn::after { content:'互動'; font-size:16px; }
        #messageBtn { grid-column:6; grid-row:1; font-size:0!important; }
        #messageBtn::after { content:'留言'; font-size:16px; }
        #emoteBtn { grid-column:4; grid-row:2; }
        #fishDexBtn {
          display:none;
          grid-column:5;
          grid-row:2;
          font-size:0!important;
        }
        #fishDexBtn::after { content:'圖鑑'; font-size:16px; }
        #roleAbilityBtn.show {
          display:inline-flex!important;
          grid-column:6;
          grid-row:2;
        }
        #sceneStatusBadge {
          left:15px!important;
          top:auto!important;
          bottom:132px!important;
          z-index:35!important;
          transform:scale(.86);
          transform-origin:left bottom;
          opacity:.9;
        }
        .deck-tip,.port-tip {
          font-size:12px;
          line-height:1.35;
          padding:6px 9px;
        }
        #mobileDeckDoorTip { display:none!important; }

        body[data-coffee-ship-scene="deck"] #coffeeBadge {
          color:#9ce8f0;
          border-color:#4f8f73;
        }
        body[data-coffee-ship-scene="deck"] #coffeeBtn {
          background:#4f8f73;
          color:#fff4d8;
          box-shadow:0 5px 0 #2d5f4b;
        }
        body[data-coffee-ship-scene="deck"] #coffeeBtn::after {
          content:'🎣 釣魚';
          font-size:15px;
        }
        body[data-coffee-ship-scene="deck"] #sitBtn::after {
          content:'互動';
          font-size:16px;
        }
        body[data-coffee-ship-scene="deck"] #messageBtn { display:none!important; }
        body[data-coffee-ship-scene="deck"] #emoteBtn {
          grid-column:6;
          grid-row:1;
        }
        body[data-coffee-ship-scene="deck"] #fishDexBtn {
          display:inline-flex!important;
          grid-column:4 / span 2;
          grid-row:2;
          background:#5a386a;
          color:#fff4d8;
          box-shadow:0 5px 0 #33213d;
        }
        body[data-coffee-ship-scene="deck"] #roleAbilityBtn.show {
          grid-column:6;
          grid-row:2;
        }
        body[data-coffee-ship-scene="cafe"] #fishDexBtn { display:none!important; }
      }

      @media (max-width:370px) {
        .mobile-controls { gap:5px; padding:6px; grid-template-rows:50px 50px; }
        .mobile-controls button,#roleAbilityBtn { height:50px!important; border-radius:12px!important; }
        #avatarName { max-width:145px; font-size:17px; }
        #coffeeBadge { max-width:130px; }
      }
    `;
  }

  function init() {
    addStyle();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();