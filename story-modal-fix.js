(() => {
  'use strict';

  const storyIds = ['lanarCard', 'arielCard', 'islandCard', 'blackbeardCard'];

  function openStory() {
    return storyIds.some(id => {
      const el = document.getElementById(id);
      return el && !el.classList.contains('hidden');
    });
  }

  function addStyle() {
    if (document.getElementById('storyModalFixStyle')) return;
    const style = document.createElement('style');
    style.id = 'storyModalFixStyle';
    style.textContent = `
      body.story-open .rare-catch-overlay{display:none!important;opacity:0!important;pointer-events:none!important}
      @media(max-width:760px){
        body.story-open .mobile-controls{display:none!important;pointer-events:none!important}
        body.story-open #sceneStatusBadge,body.story-open #mobileDeckDoorTip,body.story-open .deck-tip,body.story-open #roleAbilityBtn,body.story-open #changeCharacterBtn{display:none!important}
        #lanarCard:not(.hidden),#arielCard:not(.hidden),#islandCard:not(.hidden),#blackbeardCard:not(.hidden){position:fixed!important;left:50%!important;top:36%!important;transform:translate(-50%,-50%)!important;z-index:13000!important;width:min(90vw,390px)!important;max-height:56dvh!important;overflow-y:auto!important;pointer-events:auto!important;padding:14px!important}
        #lanarCard:not(.hidden) .lanar-text,#arielCard:not(.hidden) .ariel-text,#islandCard:not(.hidden) .island-text,#blackbeardCard:not(.hidden) .blackbeard-text{max-height:36dvh!important;overflow-y:auto!important}
      }
    `;
    document.head.appendChild(style);
  }

  function sync() {
    const open = openStory();
    document.body.classList.toggle('story-open', open);
    if (open) document.querySelectorAll('.rare-catch-overlay').forEach(el => el.remove());
  }

  function init() {
    addStyle();
    setInterval(sync, 120);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();