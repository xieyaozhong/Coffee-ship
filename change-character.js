(() => {
  'use strict';

  function addStyle() {
    if(document.getElementById('changeCharacterStyle'))return;
    const style=document.createElement('style');
    style.id='changeCharacterStyle';
    style.textContent=`
      #changeCharacterBtn{margin-left:8px;min-width:44px;height:44px;padding:8px 10px;border-radius:12px;font-size:20px;line-height:1;background:#79d0b1;color:#15231f;box-shadow:0 5px 0 #34735d}
      #changeCharacterBtn:active{transform:translateY(3px);box-shadow:0 2px 0 #34735d}
      @media(max-width:760px){#changeCharacterBtn{position:static!important;right:auto!important;top:auto!important;z-index:20;min-width:42px;height:42px}}
    `;
    document.head.appendChild(style);
  }

  function clearCharacterState() {
    localStorage.removeItem('coffeeShipRole');
    localStorage.removeItem('coffeeShipAnimal');
    localStorage.removeItem('coffeeShipAvatar');
    localStorage.removeItem('coffeeShipPendingRoleLogin');
    window.COFFEE_SHIP_PENDING_ROLE=null;
    window.COFFEE_SHIP_FORCE_HUMAN_ROLE=false;
  }

  function closeScenes() {
    try{window.COFFEE_SHIP_DECK?.switchToCafe?.();}catch{}
    ['messageBoard','coffeeMenu','deckOverlay','portOverlay','fishDexPanel'].forEach(id=>document.getElementById(id)?.classList.add('hidden'));
    document.querySelector('.role-panel')?.remove();
    document.getElementById('roleAbilityBtn')?.classList.remove('show');
    document.body.dataset.coffeeShipScene='cafe';
    window.COFFEE_SHIP_SCENE='cafe';
  }

  function changeCharacter() {
    clearCharacterState();
    closeScenes();
    document.documentElement.classList.add('login-resetting');
    document.body.classList.add('login-resetting');
    setTimeout(()=>window.location.reload(),80);
  }

  function mount() {
    const topbar=document.querySelector('.game-topbar > div:first-child');
    if(!topbar||document.getElementById('changeCharacterBtn'))return;
    const btn=document.createElement('button');
    btn.id='changeCharacterBtn';btn.type='button';btn.title='返回登入並更換角色';btn.setAttribute('aria-label','返回登入並更換角色');btn.textContent='👤';btn.addEventListener('click',changeCharacter);topbar.appendChild(btn);
  }

  function init() {
    addStyle();mount();
    const timer=setInterval(mount,800);setTimeout(()=>clearInterval(timer),6000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
