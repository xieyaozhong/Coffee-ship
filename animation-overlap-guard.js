(() => {
  'use strict';

  const blockingIds = [
    'lanarCard','arielCard','islandCard','mutantCard','sharkCard',
    'fishDexPanel','fishingCard','fishingSpecialCard','messageBoard','coffeeMenu'
  ];

  function isVisible(id) {
    const el = document.getElementById(id);
    return !!el && !el.classList.contains('hidden');
  }

  function anyBlocking() {
    return blockingIds.some(isVisible);
  }

  function storyOpen() {
    return ['lanarCard','arielCard','islandCard'].some(isVisible);
  }

  function addStyle() {
    if (document.getElementById('animationOverlapGuardStyle')) return;
    const style = document.createElement('style');
    style.id = 'animationOverlapGuardStyle';
    style.textContent = `
      body.animation-guard-open .mobile-controls{display:none!important;pointer-events:none!important}
      body.animation-guard-open #sceneStatusBadge,
      body.animation-guard-open #mobileDeckDoorTip,
      body.animation-guard-open .deck-tip,
      body.animation-guard-open .port-tip,
      body.animation-guard-open #roleAbilityBtn,
      body.animation-guard-open #changeCharacterBtn{display:none!important}
      body.story-open .rare-catch-overlay{display:none!important;opacity:0!important;pointer-events:none!important}
      body.animation-guard-open .rare-catch-overlay{z-index:9000!important}
      #lanarCard:not(.hidden),#arielCard:not(.hidden),#islandCard:not(.hidden){z-index:14000!important}
      #mutantCard:not(.hidden),#sharkCard:not(.hidden),#fishingCard:not(.hidden),#fishingSpecialCard:not(.hidden){z-index:13500!important}
      @media(max-width:760px){
        #lanarCard:not(.hidden),#arielCard:not(.hidden),#islandCard:not(.hidden),#mutantCard:not(.hidden),#sharkCard:not(.hidden),#fishingCard:not(.hidden),#fishingSpecialCard:not(.hidden){position:fixed!important;left:50%!important;top:36%!important;transform:translate(-50%,-50%)!important;width:min(90vw,390px)!important;max-height:56dvh!important;overflow-y:auto!important;pointer-events:auto!important;padding:14px!important}
        #lanarCard:not(.hidden) .lanar-text,#arielCard:not(.hidden) .ariel-text,#islandCard:not(.hidden) .island-text,#mutantCard:not(.hidden) .mutant-trait,#sharkCard:not(.hidden) .shark-loss{max-height:34dvh!important;overflow-y:auto!important}
      }
    `;
    document.head.appendChild(style);
  }

  function cleanupRareIfNeeded() {
    if (!storyOpen()) return;
    document.querySelectorAll('.rare-catch-overlay').forEach(el => el.remove());
  }

  function cleanupStackedRare() {
    const overlays = Array.from(document.querySelectorAll('.rare-catch-overlay'));
    if (overlays.length <= 1) return;
    overlays.slice(0, -1).forEach(el => el.remove());
  }

  function sync() {
    document.body.classList.toggle('animation-guard-open', anyBlocking());
    document.body.classList.toggle('story-open', storyOpen());
    cleanupRareIfNeeded();
    cleanupStackedRare();
  }

  function init() {
    addStyle();
    setInterval(sync, 120);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
