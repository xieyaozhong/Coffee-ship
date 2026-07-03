(() => {
  'use strict';

  let firebaseApi = null;
  let db = null;
  let rolePlayersRef = null;
  let roleSkillsRef = null;
  let myRoleRef = null;
  let ready = false;
  let remoteRoles = {};
  let remoteSkills = {};
  let lastSync = 0;
  let lastSkillSeen = {};
  const myPlayerId = localStorage.getItem('coffeeShipPlayerId') || `player_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  localStorage.setItem('coffeeShipPlayerId', myPlayerId);

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

  function getPos() {
    return window.COFFEE_SHIP_PLAYER_POS || { x: 480, y: 360 };
  }

  function getName(role) {
    if (role && role.name) return role.name;
    const el = document.getElementById('avatarName');
    return el ? el.textContent.replace(/^[^\s]+\s*/, '').split('｜')[0].trim() : 'Guest';
  }

  function isConfigured() {
    const cfg = window.COFFEE_SHIP_FIREBASE_CONFIG;
    return cfg && cfg.apiKey && cfg.databaseURL && !String(cfg.apiKey).includes('PASTE_');
  }

  async function initFirebase() {
    if (ready || !isConfigured()) return;
    try {
      const [appMod, dbMod] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js')
      ]);
      const app = appMod.getApps && appMod.getApps().length ? appMod.getApps()[0] : appMod.initializeApp(window.COFFEE_SHIP_FIREBASE_CONFIG);
      db = dbMod.getDatabase(app);
      firebaseApi = dbMod;
      rolePlayersRef = dbMod.ref(db, 'coffeeShip/rolePlayers');
      roleSkillsRef = dbMod.ref(db, 'coffeeShip/roleSkills');
      myRoleRef = dbMod.ref(db, `coffeeShip/rolePlayers/${myPlayerId}`);

      try { dbMod.onDisconnect(myRoleRef).remove(); } catch (error) {}

      dbMod.onValue(rolePlayersRef, snap => {
        const data = snap.val() || {};
        const now = Date.now();
        remoteRoles = Object.fromEntries(Object.entries(data).filter(([id, p]) => {
          return id !== myPlayerId && p && p.role && (now - (p.clientUpdatedAt || now)) < 30000;
        }));
      });

      dbMod.onValue(roleSkillsRef, snap => {
        const data = snap.val() || {};
        const now = Date.now();
        remoteSkills = Object.fromEntries(Object.entries(data).filter(([id, s]) => {
          return s && s.role && s.createdAt && (now - s.createdAt) < 12000;
        }));
      });

      ready = true;
      syncRole(true);
    } catch (error) {
      console.warn('multiplayer role sync failed', error);
    }
  }

  async function syncRole(force = false) {
    if (!ready || !firebaseApi || !myRoleRef) return;
    const role = getRole();
    const now = Date.now();
    if (!force && now - lastSync < 500) return;
    lastSync = now;
    try {
      if (role && role.role) {
        const pos = getPos();
        await firebaseApi.set(myRoleRef, {
          id: myPlayerId,
          name: getName(role),
          x: Math.round(pos.x),
          y: Math.round(pos.y),
          role: role.role,
          roleIcon: role.icon || '',
          specialHuman: true,
          clientUpdatedAt: now,
          updatedAt: firebaseApi.serverTimestamp()
        });
      } else {
        await firebaseApi.remove(myRoleRef);
      }
    } catch (error) {
      console.warn('role state sync failed', error);
    }
  }

  async function syncSkill(role) {
    await initFirebase();
    if (!ready || !firebaseApi || !roleSkillsRef || !role || !role.role) return;
    const now = Date.now();
    const pos = getPos();
    const skillRef = firebaseApi.ref(db, `coffeeShip/roleSkills/${myPlayerId}_${now}`);
    const payload = {
      id: `${myPlayerId}_${now}`,
      playerId: myPlayerId,
      name: getName(role),
      x: Math.round(pos.x),
      y: Math.round(pos.y),
      role: role.role,
      icon: role.icon || '✨',
      createdAt: now,
      serverCreatedAt: firebaseApi.serverTimestamp()
    };
    try {
      await firebaseApi.set(skillRef, payload);
      setTimeout(() => firebaseApi.remove(skillRef).catch(() => {}), 9000);
    } catch (error) {
      console.warn('skill sync failed', error);
    }
  }

  function px(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  function label(ctx, text, x, y, color = '#fff4d8') {
    ctx.font = '900 12px ui-rounded, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#120b17';
    ctx.fillText(text, x + 2, y + 2);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  function baseHuman(ctx, x, y, cfg) {
    px(ctx, x - 18, y + 22, 36, 6, 'rgba(18,11,23,.85)');
    px(ctx, x - 15, y - 35, 30, 26, cfg.hair || '#2b1d16');
    px(ctx, x - 11, y - 29, 22, 20, '#f0c7a0');
    px(ctx, x - 17, y - 14, 34, 42, cfg.main || '#3b2b44');
    px(ctx, x - 22, y - 8, 8, 27, cfg.sleeve || cfg.main || '#3b2b44');
    px(ctx, x + 14, y - 8, 8, 27, cfg.sleeve || cfg.main || '#3b2b44');
    px(ctx, x - 11, y + 25, 8, 18, '#22202d');
    px(ctx, x + 3, y + 25, 8, 18, '#22202d');
    px(ctx, x - 6, y - 21, 4, 4, '#21182a');
    px(ctx, x + 4, y - 21, 4, 4, '#21182a');
  }

  function drawMaid(ctx, x, y) {
    baseHuman(ctx, x, y, { hair:'#5a3526', main:'#151019', sleeve:'#fff4d8' });
    px(ctx, x - 20, y - 45, 40, 7, '#fff4d8');
    px(ctx, x - 15, y - 51, 9, 9, '#fff4d8');
    px(ctx, x + 6, y - 51, 9, 9, '#fff4d8');
    px(ctx, x - 12, y - 10, 24, 34, '#fff4d8');
    px(ctx, x - 16, y + 17, 32, 8, '#fff4d8');
    px(ctx, x + 23, y + 1, 20, 5, '#d7bb79');
    label(ctx, 'Maid', x, y - 79, '#ffb6cc');
  }

  function drawPirate(ctx, x, y) {
    baseHuman(ctx, x, y, { hair:'#3a241c', main:'#3a1f1d', sleeve:'#5a2b26' });
    px(ctx, x - 25, y - 48, 50, 9, '#111018');
    px(ctx, x - 16, y - 61, 32, 16, '#111018');
    px(ctx, x - 10, y - 56, 20, 4, '#f0a75c');
    px(ctx, x - 12, y - 22, 10, 7, '#111018');
    px(ctx, x - 18, y - 7, 36, 7, '#f0a75c');
    px(ctx, x + 23, y - 4, 4, 36, '#d7bb79');
    label(ctx, 'Pirate', x, y - 79, '#f0a75c');
  }

  function drawViolin(ctx, x, y) {
    baseHuman(ctx, x, y, { hair:'#1f1930', main:'#2a2032', sleeve:'#19151d' });
    px(ctx, x - 7, y - 8, 14, 30, '#fff4d8');
    px(ctx, x + 20, y - 23, 9, 45, '#7b4a2e');
    px(ctx, x + 14, y - 11, 22, 16, '#a45f34');
    px(ctx, x - 32, y - 19, 47, 4, '#fff4d8');
    label(ctx, 'Violin', x, y - 79, '#d7bb79');
  }

  function drawSinger(ctx, x, y) {
    baseHuman(ctx, x, y, { hair:'#2b1d16', main:'#5a386a', sleeve:'#e9a6b0' });
    px(ctx, x - 17, y - 11, 34, 13, '#e9a6b0');
    px(ctx, x + 24, y - 20, 9, 9, '#22202d');
    px(ctx, x + 27, y - 11, 4, 31, '#d7bb79');
    label(ctx, 'Singer', x, y - 79, '#e9a6b0');
  }

  function drawRole(p) {
    const canvas = document.getElementById('game');
    const panel = document.getElementById('gamePanel');
    const deck = document.getElementById('deckOverlay');
    const port = document.getElementById('portOverlay');
    if (!canvas || !panel || panel.classList.contains('hidden')) return;
    if (deck && !deck.classList.contains('hidden')) return;
    if (port && !port.classList.contains('hidden')) return;
    const x = Number(p.x || 0);
    const y = Number(p.y || 0);
    if (!x || !y) return;
    const ctx = canvas.getContext('2d');
    const role = String(p.role || '');
    if (role.includes('女僕')) drawMaid(ctx, x, y);
    else if (role.includes('海盜')) drawPirate(ctx, x, y);
    else if (role.includes('小提琴')) drawViolin(ctx, x, y);
    else if (role.includes('歌手')) drawSinger(ctx, x, y);
    label(ctx, `${p.roleIcon || ''} ${p.name || 'Guest'}`, x, y - 96, '#79d0b1');
  }

  function spawnSkillFx(s) {
    if (!s || !s.id || lastSkillSeen[s.id]) return;
    lastSkillSeen[s.id] = true;
    const icon = s.icon || '✨';
    const role = String(s.role || '');
    const color = roleColors[role] || '#fff4d8';
    const count = role.includes('女僕') ? 26 : 14;
    const baseX = 50 + ((Number(s.x || 480) - 480) / 960) * 70;
    const baseY = 52 + ((Number(s.y || 320) - 320) / 576) * 45;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'role-skill-fx';
      el.textContent = role.includes('女僕') ? (i % 3 === 0 ? '❤️' : '💕') : (i % 3 === 0 ? '♪' : icon);
      el.style.left = `${baseX}vw`;
      el.style.top = `${baseY}vh`;
      el.style.color = color;
      const angle = Math.PI * 2 * i / count + Math.random() * .35;
      const dist = 80 + Math.random() * 150;
      el.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      el.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1500);
    }
  }

  function drawLoop() {
    requestAnimationFrame(drawLoop);
    Object.values(remoteRoles).forEach(drawRole);
    Object.values(remoteSkills).forEach(spawnSkillFx);
  }

  window.addEventListener('coffeeShipRoleSkill', event => syncSkill(event.detail));

  function init() {
    initFirebase();
    setInterval(() => {
      initFirebase();
      syncRole(false);
    }, 500);
    drawLoop();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
