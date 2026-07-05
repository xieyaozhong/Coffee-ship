(() => {
  'use strict';

  const colors = {
    '小提琴手': '#d7bb79',
    '歌手': '#e9a6b0',
    '海盜': '#f0a75c',
    '女僕服務生': '#ff8fb3'
  };

  function getRole() {
    try {
      const raw = localStorage.getItem('coffeeShipRole');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function addStyle() {
    if (document.getElementById('desktopRoleAbilityStyle')) return;
    const style = document.createElement('style');
    style.id = 'desktopRoleAbilityStyle';
    style.textContent = `
      #desktopRoleAbilityBtn {
        display: none;
        min-width: 44px;
        height: 44px;
        padding: 8px 12px;
        margin-left: 8px;
        border-radius: 12px;
        border: 2px solid rgba(255,244,216,.24);
        background: rgba(255,244,216,.12);
        color: #fff4d8;
        font-size: 22px;
        font-weight: 900;
        box-shadow: 0 5px 0 rgba(0,0,0,.28);
        touch-action: manipulation;
        user-select: none;
      }
      #desktopRoleAbilityBtn.show {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      #desktopRoleAbilityBtn:active {
        transform: translateY(2px);
        box-shadow: 0 3px 0 rgba(0,0,0,.28);
      }
      @media (max-width: 760px) {
        #desktopRoleAbilityBtn { display: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function activate(role) {
    if (!role || !role.role) return;
    window.dispatchEvent(new CustomEvent('coffeeShipRoleSkill', { detail: role }));
    const mobileBtn = document.getElementById('roleAbilityBtn');
    if (mobileBtn && mobileBtn.classList.contains('show')) {
      mobileBtn.click();
      return;
    }
    for (let i = 0; i < (String(role.role).includes('女僕') ? 24 : 12); i++) {
      const el = document.createElement('div');
      el.className = 'role-skill-fx';
      el.textContent = String(role.role).includes('女僕') ? '❤️' : (role.icon || '✨');
      el.style.left = `${48 + (Math.random() - .5) * 18}vw`;
      el.style.top = `${52 + (Math.random() - .5) * 18}vh`;
      el.style.color = colors[role.role] || '#fff4d8';
      const angle = Math.PI * 2 * i / 18 + Math.random() * .35;
      const dist = 70 + Math.random() * 140;
      el.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      el.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1500);
    }
  }

  function ensureButton() {
    let btn = document.getElementById('desktopRoleAbilityBtn');
    if (btn) return btn;
    const first = document.querySelector('.game-topbar > div:first-child');
    if (!first) return null;
    btn = document.createElement('button');
    btn.id = 'desktopRoleAbilityBtn';
    btn.type = 'button';
    btn.title = '特殊能力';
    btn.setAttribute('aria-label', '特殊能力');
    btn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      activate(getRole());
    }, true);
    first.appendChild(btn);
    return btn;
  }

  function sync() {
    addStyle();
    const btn = ensureButton();
    if (!btn) return;
    const role = getRole();
    if (role && role.role && role.icon) {
      btn.textContent = role.icon;
      btn.classList.add('show');
      btn.style.borderColor = colors[role.role] || '#d7bb79';
      btn.style.background = `${colors[role.role] || '#d7bb79'}33`;
    } else {
      btn.classList.remove('show');
    }
  }

  function loadSupportScript(src, dataKey, readyCheck) {
    if (readyCheck?.() || document.querySelector(`script[data-${dataKey}="true"]`)) return;
    const script = document.createElement('script');
    script.src = `${src}?v=${dataKey}-${Date.now()}`;
    script.dataset[dataKey] = 'true';
    script.async = false;
    document.body.appendChild(script);
  }

  function loadDeckEntryFix() {
    loadSupportScript(
      'deck-entry-fix.js',
      'deckEntryFix',
      () => !!window.__COFFEE_SHIP_DECK_ENTRY_FIX__
    );
  }

  function loadFishingEventStack() {
    loadSupportScript(
      'fishing-event-stack.js',
      'fishingEventStack',
      () => !!window.__COFFEE_SHIP_FISHING_EVENT_STACK__
    );
  }

  function init() {
    loadDeckEntryFix();
    loadFishingEventStack();
    sync();
    setInterval(sync, 800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();