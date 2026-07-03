(() => {
  'use strict';

  const roleNotes = {
    '小提琴手': [659, 784, 880, 784, 659, 587, 659],
    '歌手': [523, 587, 659, 698, 659, 587, 523],
    '海盜': [196, 196, 247, 294, 392, 294],
    '女僕服務生': [523, 659, 784, 1046, 784, 659, 523]
  };

  const roleColors = {
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
    if (document.getElementById('roleMobileAbilityStyle')) return;
    const style = document.createElement('style');
    style.id = 'roleMobileAbilityStyle';
    style.textContent = `
      .role-panel { display: none !important; }
      #roleAbilityBtn {
        display: none;
        min-width: 52px;
        height: 52px;
        border-radius: 14px;
        border: 2px solid rgba(255,244,216,.22);
        background: rgba(255,244,216,.12);
        color: #fff4d8;
        font-size: 22px;
        font-weight: 900;
        box-shadow: 0 5px 0 rgba(0,0,0,.26);
        touch-action: manipulation;
        user-select: none;
      }
      #roleAbilityBtn.show { display: inline-flex; align-items: center; justify-content: center; }
      #roleAbilityBtn:active { transform: translateY(2px); box-shadow: 0 3px 0 rgba(0,0,0,.26); }
      .role-skill-fx{position:fixed;pointer-events:none;z-index:9999;font-size:24px;font-weight:900;text-shadow:2px 2px 0 #120b17;animation:role-skill-fx 1.25s ease-out forwards}
      @keyframes role-skill-fx{0%{transform:translate(0,0) scale(.75);opacity:0}15%{opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(1.3);opacity:0}}
    `;
    document.head.appendChild(style);
  }

  function ensureButton() {
    let btn = document.getElementById('roleAbilityBtn');
    if (btn) return btn;
    const emoteBtn = document.getElementById('emoteBtn');
    if (!emoteBtn || !emoteBtn.parentElement) return null;
    btn = document.createElement('button');
    btn.id = 'roleAbilityBtn';
    btn.type = 'button';
    btn.setAttribute('aria-label', '特殊能力');
    emoteBtn.insertAdjacentElement('afterend', btn);
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      activateAbility();
    }, true);
    return btn;
  }

  function play(notes) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC || !notes) return;
      const audio = new AC();
      const now = audio.currentTime + 0.03;
      notes.forEach((freq, i) => {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.18);
        gain.gain.setValueAtTime(0.0001, now + i * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.075, now + i * 0.18 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.18);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(now + i * 0.18);
        osc.stop(now + i * 0.18 + 0.2);
      });
    } catch (error) {
      console.warn('role ability audio failed', error);
    }
  }

  function spawnFx(role) {
    const roleName = role.role || '';
    const icon = role.icon || '✨';
    const color = roleColors[roleName] || '#fff4d8';
    const isMaid = roleName.includes('女僕');
    const count = isMaid ? 28 : 14;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'role-skill-fx';
      el.textContent = isMaid ? (i % 4 === 0 ? '❤️' : '💕') : (i % 3 === 0 ? '♪' : icon);
      el.style.left = `${48 + (Math.random() - .5) * 18}vw`;
      el.style.top = `${52 + (Math.random() - .5) * 18}vh`;
      el.style.color = color;
      const angle = Math.PI * 2 * i / count + Math.random() * .35;
      const dist = 80 + Math.random() * 150;
      el.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      el.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1500);
    }
  }

  function activateAbility() {
    const role = getRole();
    if (!role || !role.role) return;
    play(roleNotes[role.role]);
    spawnFx(role);
    window.dispatchEvent(new CustomEvent('coffeeShipRoleSkill', { detail: role }));
  }

  function syncButton() {
    addStyle();
    const btn = ensureButton();
    if (!btn) return;
    const role = getRole();
    if (role && role.role && role.icon) {
      btn.textContent = role.icon;
      btn.classList.add('show');
      btn.style.background = `${roleColors[role.role] || '#d7bb79'}33`;
      btn.style.borderColor = roleColors[role.role] || '#d7bb79';
    } else {
      btn.classList.remove('show');
    }
  }

  function init() {
    syncButton();
    setInterval(syncButton, 800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
