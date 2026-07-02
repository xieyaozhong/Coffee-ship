(() => {
  'use strict';

  function addStyle() {
    if (document.getElementById('changeCharacterStyle')) return;
    const style = document.createElement('style');
    style.id = 'changeCharacterStyle';
    style.textContent = `
      #changeCharacterBtn {
        margin-left: 8px;
        min-width: 44px;
        height: 44px;
        padding: 8px 10px;
        border-radius: 12px;
        font-size: 20px;
        line-height: 1;
        background: #79d0b1;
        color: #15231f;
        box-shadow: 0 5px 0 #34735d;
      }
      #changeCharacterBtn:active { transform: translateY(3px); box-shadow: 0 2px 0 #34735d; }
      @media (max-width: 760px) {
        #changeCharacterBtn { position: absolute; right: 14px; top: 12px; z-index: 20; min-width: 42px; height: 42px; }
      }
    `;
    document.head.appendChild(style);
  }

  function clearRoleState() {
    localStorage.removeItem('coffeeShipRole');
    localStorage.removeItem('coffeeShipAnimal');
    localStorage.removeItem('coffeeShipAvatar');
    window.COFFEE_SHIP_PENDING_ROLE = null;
    window.COFFEE_SHIP_FORCE_HUMAN_ROLE = false;
    const rolePanel = document.querySelector('.role-panel');
    if (rolePanel) rolePanel.remove();
    const abilityBtn = document.getElementById('roleAbilityBtn');
    if (abilityBtn) abilityBtn.classList.remove('show');
  }

  function showCreator() {
    const creator = document.getElementById('creator');
    const gamePanel = document.getElementById('gamePanel');
    const board = document.getElementById('messageBoard');
    const coffee = document.getElementById('coffeeMenu');
    const deck = document.getElementById('deckOverlay');
    const port = document.getElementById('portOverlay');
    if (board) board.classList.add('hidden');
    if (coffee) coffee.classList.add('hidden');
    if (deck) deck.classList.add('hidden');
    if (port) port.classList.add('hidden');
    if (gamePanel) gamePanel.classList.add('hidden');
    if (creator) creator.classList.remove('hidden');
    const status = document.getElementById('statusText');
    if (status) status.textContent = '重新選擇角色';
    window.COFFEE_SHIP_SCENE = 'cafe';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function changeCharacter() {
    clearRoleState();
    showCreator();
  }

  function mount() {
    const topbar = document.querySelector('.game-topbar > div:first-child');
    if (!topbar || document.getElementById('changeCharacterBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'changeCharacterBtn';
    btn.type = 'button';
    btn.title = '更換角色';
    btn.setAttribute('aria-label', '更換角色');
    btn.textContent = '👤';
    btn.addEventListener('click', changeCharacter);
    topbar.appendChild(btn);
  }

  function init() {
    addStyle();
    mount();
    const timer = setInterval(mount, 800);
    setTimeout(() => clearInterval(timer), 6000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
