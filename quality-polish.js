(() => {
  'use strict';
  function addStyle(){
    if(document.getElementById('qualityPolishStyle')) return;
    const s=document.createElement('style');
    s.id='qualityPolishStyle';
    s.textContent=`
      @media(max-width:760px){
        .mobile-controls{position:relative;z-index:50}.mobile-controls button{touch-action:manipulation}.game-panel{overflow:hidden}#fishDexBtn{background:#3a293d;color:#fff4d8;box-shadow:0 5px 0 #1a1220}
        #sceneStatusBadge{pointer-events:none}.deck-tip,.port-tip{max-width:82vw;text-align:center}
      }
      .hidden{display:none!important}
    `;
    document.head.appendChild(s);
  }
  function init(){addStyle();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
