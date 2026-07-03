(() => {
  'use strict';

  const roles = {
    VIOLIN2026: { role: '小提琴手', icon: '🎻', names: ['星光小提琴手', '船上琴師', '弦月旅人'], power: '演奏一段旋律', color: '#d7bb79', notes: [659, 784, 880, 784, 659, 587, 659] },
    SINGER2026: { role: '歌手', icon: '🎤', names: ['咖啡歌手', '甲板主唱', '午夜聲線'], power: '唱出咖啡船之歌', color: '#e9a6b0', notes: [523, 587, 659, 698, 659, 587, 523] },
    PIRATE2026: { role: '海盜', icon: '🏴‍☠️', names: ['咖啡海盜', '黑帆船長', '焦糖船員'], power: '召喚金色光點', color: '#f0a75c', notes: [196, 196, 247, 294, 392, 294] },
    MAID2026: { role: '女僕服務生', icon: '❤️', names: ['愛心女僕', '微笑服務生', '甜心店員'], power: '發射愛心，讓附近玩家開心', color: '#ff8fb3', notes: [523, 659, 784, 1046, 784, 659, 523], heart: true }
  };

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const suffix = () => Math.floor(Math.random() * 90 + 10);

  function addStyle() {
    if (document.getElementById('roleSystemStyle')) return;
    const style = document.createElement('style');
    style.id = 'roleSystemStyle';
    style.textContent = `
      .role-code-box{margin-top:14px;padding:14px;border:1px solid rgba(255,244,216,.18);border-radius:16px;background:rgba(18,11,23,.32)}
      .role-code-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.role-code-row input{min-width:180px;flex:1}.role-code-note{margin:8px 0 0;opacity:.86;font-size:14px}
      .role-panel{position:absolute;right:18px;top:72px;bottom:auto;z-index:12;padding:10px 12px;border:2px solid #76536a;border-radius:14px;background:rgba(21,16,32,.94);color:#fff4d8;box-shadow:0 8px 0 rgba(0,0,0,.25);max-width:260px}.role-title{font-weight:900;margin-bottom:4px}.role-power{font-size:13px;opacity:.88;margin-bottom:8px}.role-power-btn{width:100%;border:0;border-radius:10px;padding:9px 10px;font-weight:900;cursor:pointer;background:#d7bb79;color:#21182a}
      @media (max-width: 720px){.role-panel{left:10px;right:10px;top:82px;bottom:auto;max-width:none;padding:8px 10px;display:grid;grid-template-columns:1fr auto;gap:4px 8px;align-items:center}.role-title{font-size:13px;margin:0}.role-power{font-size:11px;margin:0;opacity:.75}.role-power-btn{grid-row:1 / span 2;grid-column:2;width:auto;min-width:86px;padding:8px 10px;font-size:12px}}
      .role-fx{position:fixed;pointer-events:none;z-index:9999;font-size:26px;font-weight:900;text-shadow:2px 2px 0 #120b17;animation:role-fx 1.4s ease-out forwards}@keyframes role-fx{0%{transform:translateY(0) scale(.8);opacity:0}20%{opacity:1}100%{transform:translateY(-90px) scale(1.25);opacity:0}}
      .heart-shot{position:fixed;pointer-events:none;z-index:9999;font-size:24px;font-weight:900;text-shadow:2px 2px 0 #120b17;animation:heart-shot 1.25s ease-out forwards}@keyframes heart-shot{0%{transform:translate(0,0) scale(.7);opacity:0}15%{opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(1.35);opacity:0}}
      .happy-toast{position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:9999;background:rgba(21,16,32,.94);border:2px solid #ff8fb3;border-radius:14px;padding:10px 14px;color:#fff4d8;font-weight:900;box-shadow:0 8px 0 rgba(0,0,0,.25);animation:happy-toast 2s ease-out forwards}@keyframes happy-toast{0%{opacity:0;transform:translateX(-50%) translateY(10px)}20%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-18px)}}
    `;
    document.head.appendChild(style);
  }

  function play(notes) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const audio = new AC();
      const now = audio.currentTime + 0.03;
      notes.forEach((freq, i) => {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.22);
        gain.gain.setValueAtTime(0.0001, now + i * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.08, now + i * 0.22 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.22 + 0.2);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(now + i * 0.22);
        osc.stop(now + i * 0.22 + 0.24);
      });
    } catch (error) {
      console.warn('role audio failed', error);
    }
  }

  function fx(role) {
    const count = role.heart ? 28 : 12;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = role.heart ? 'heart-shot' : 'role-fx';
      el.textContent = role.heart ? (i % 4 === 0 ? '開心+20' : '❤️') : (i % 3 === 0 ? '♪' : role.icon);
      el.style.left = `${20 + Math.random() * 60}vw`;
      el.style.top = `${45 + Math.random() * 35}vh`;
      el.style.color = role.color;
      if (role.heart) {
        const angle = (Math.PI * 2 * i / count) + Math.random() * 0.25;
        const dist = 90 + Math.random() * 170;
        el.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
        el.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      }
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1700);
    }
    if (role.heart) {
      const toast = document.createElement('div');
      toast.className = 'happy-toast';
      toast.textContent = '❤️ 女僕服務讓大家都開心起來了！';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2200);
    }
  }

  function showPanel(role, name) {
    const gamePanel = document.getElementById('gamePanel');
    if (!gamePanel) return;
    const old = document.querySelector('.role-panel');
    if (old) old.remove();
    const panel = document.createElement('div');
    panel.className = 'role-panel';
    panel.innerHTML = `<div class="role-title">${role.icon} ${name}｜${role.role}</div><div class="role-power">能力：${role.power}</div><button class="role-power-btn" type="button">使用能力</button>`;
    const btn = panel.querySelector('button');
    btn.style.background = role.color;
    btn.addEventListener('click', () => { play(role.notes); fx(role); });
    gamePanel.appendChild(panel);
  }

  function safeEnterGame(role, name) {
    const startBtn = document.getElementById('startBtn');
    const playerNameInput = document.getElementById('playerName');
    if (playerNameInput) playerNameInput.value = name;

    const roleState = { role: role.role, icon: role.icon, name, specialHuman: true, animal: 'human' };
    localStorage.setItem('coffeeShipRole', JSON.stringify(roleState));
    localStorage.setItem('coffeeShipAnimal', 'human');
    window.COFFEE_SHIP_PENDING_ROLE = roleState;
    window.COFFEE_SHIP_FORCE_HUMAN_ROLE = true;

    if (startBtn) startBtn.click();
    setTimeout(() => {
      const creator = document.getElementById('creator');
      const gamePanel = document.getElementById('gamePanel');
      const avatarName = document.getElementById('avatarName');
      if (creator && gamePanel && gamePanel.classList.contains('hidden')) {
        creator.classList.add('hidden');
        gamePanel.classList.remove('hidden');
      }
      if (avatarName) avatarName.textContent = `${role.icon} ${name}｜${role.role}`;
      showPanel(role, name);
    }, 180);
  }

  function enterRole(code) {
    const role = roles[String(code || '').trim().toUpperCase()];
    const note = document.getElementById('roleCodeNote');
    if (!role) {
      if (note) note.textContent = '找不到這個編號。可試：VIOLIN2026、SINGER2026、PIRATE2026、MAID2026';
      return;
    }
    const name = `${pick(role.names)}${suffix()}`;
    if (note) note.textContent = `已啟用：${role.icon} ${role.role}，正在進入 Coffee Ship…`;
    safeEnterGame(role, name);
  }

  function mount() {
    const startBtn = document.getElementById('startBtn');
    if (!startBtn || document.getElementById('roleCode')) return;
    const box = document.createElement('div');
    box.className = 'role-code-box';
    box.innerHTML = `<div class="role-code-row"><input id="roleCode" maxlength="20" placeholder="輸入角色編號，例如 MAID2026"><button id="roleEnterBtn" type="button">角色進入</button></div><p id="roleCodeNote" class="role-code-note">角色編號：VIOLIN2026 小提琴手、SINGER2026 歌手、PIRATE2026 海盜、MAID2026 女僕服務生</p>`;
    startBtn.parentElement.appendChild(box);
    document.getElementById('roleEnterBtn').addEventListener('click', () => enterRole(document.getElementById('roleCode').value));
    document.getElementById('roleCode').addEventListener('keydown', e => { if (e.key === 'Enter') enterRole(e.target.value); });
  }

  try {
    addStyle();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  } catch (error) {
    console.error('role system failed', error);
  }
})();
