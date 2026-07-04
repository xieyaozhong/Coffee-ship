(() => {
  'use strict';

  const tierMap = {
    '稀有': { cls: 'rare', title: 'RARE CATCH', icon: '💙', ms: 2600, particles: ['✨','💧','🫧'] },
    '史詩': { cls: 'epic', title: 'EPIC CATCH', icon: '💜', ms: 3200, particles: ['🔮','🌊','✨'] },
    '傳說': { cls: 'legend', title: 'LEGENDARY', icon: '✨', ms: 4200, particles: ['👑','✨','⚡','💫'] },
    '神話': { cls: 'myth', title: 'MYTHIC CREATURE', icon: '👑', ms: 5400, particles: ['👁️','🌊','🌑','🌀'] },
    '世界級': { cls: 'world', title: 'WORLD CLASS', icon: '🌈', ms: 6500, particles: ['👑','🌈','🌌','✨','☄️','👁️'] }
  };
  let playing = false;
  let lastKey = '';
  let timer = null;

  function addStyle() {
    if (document.getElementById('fishingRareAnimationStyle')) return;
    const style = document.createElement('style');
    style.id = 'fishingRareAnimationStyle';
    style.textContent = `
      .rare-catch-overlay{position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;background:rgba(5,8,18,.38);pointer-events:none;overflow:hidden;animation:rareFade .25s ease-out both}.rare-catch-overlay.rare{background:radial-gradient(circle at center,rgba(53,155,255,.26),rgba(3,8,20,.48) 60%,rgba(0,0,0,.62))}.rare-catch-overlay.epic{background:radial-gradient(circle at center,rgba(128,72,220,.36),rgba(14,5,28,.58) 58%,rgba(0,0,0,.74))}.rare-catch-overlay.legend{background:radial-gradient(circle at center,rgba(255,219,92,.35),rgba(30,18,4,.68) 60%,rgba(0,0,0,.78));animation:rareShakeSoft .16s infinite alternate}.rare-catch-overlay.myth{background:radial-gradient(circle at center,rgba(20,25,40,.20),rgba(0,0,0,.82) 55%,rgba(0,0,0,.94));animation:rareShake .11s infinite alternate}.rare-catch-overlay.world{background:radial-gradient(circle at center,rgba(255,255,255,.18),rgba(18,10,55,.72) 50%,rgba(0,0,0,.96));animation:rareShake .08s infinite alternate}.rare-catch-box{position:relative;z-index:4;text-align:center;color:#fff4d8;font-weight:1000;text-shadow:4px 4px 0 #120b17,0 0 16px rgba(255,244,216,.35);transform:scale(.72);animation:rareReveal 1.25s cubic-bezier(.2,1.45,.2,1) forwards}.rare-catch-title{font-size:clamp(30px,8vw,80px);letter-spacing:3px;white-space:nowrap}.rare-catch-shadow{font-size:clamp(62px,20vw,170px);filter:drop-shadow(0 0 28px rgba(255,255,255,.22));opacity:.92;animation:shadowPulse .68s ease-in-out infinite alternate}.rare-catch-name{font-size:clamp(18px,4.6vw,34px);margin-top:10px;max-width:92vw;line-height:1.35}.rare-catch-ring{position:absolute;z-index:2;width:48vmin;height:48vmin;border:6px solid rgba(156,232,240,.62);border-radius:999px;animation:ringExpand 1.15s ease-out infinite}.rare-catch-ring.r2{animation-delay:.35s}.rare-catch-ring.r3{animation-delay:.7s}.rare-catch-overlay.epic .rare-catch-ring{border-color:rgba(205,148,255,.72);box-shadow:0 0 30px rgba(192,112,255,.35)}.rare-catch-overlay.legend .rare-catch-ring{border-color:rgba(255,225,107,.85);box-shadow:0 0 54px #ffe16b}.rare-catch-overlay.myth .rare-catch-ring{border-color:rgba(190,230,255,.8);box-shadow:0 0 58px rgba(160,220,255,.42)}.rare-catch-overlay.world .rare-catch-ring{border-color:rgba(255,255,255,.95);box-shadow:0 0 80px rgba(255,255,255,.78)}.rare-catch-vortex{position:absolute;z-index:1;width:58vmin;height:58vmin;border-radius:999px;border:18px solid rgba(255,255,255,.05);box-shadow:inset 0 0 40px rgba(255,255,255,.08),0 0 80px rgba(0,0,0,.45);animation:vortexSpin 5s linear infinite}.rare-catch-overlay.legend .rare-catch-vortex{border-color:rgba(255,225,107,.10);box-shadow:0 0 95px rgba(255,225,107,.38)}.rare-catch-overlay.myth .rare-catch-vortex{border-color:rgba(120,160,190,.12);box-shadow:inset 0 0 60px rgba(255,255,255,.07),0 0 120px rgba(0,0,0,.95)}.rare-catch-overlay.world .rare-catch-vortex{background:conic-gradient(from 0deg,rgba(255,0,140,.16),rgba(255,230,0,.16),rgba(0,255,200,.16),rgba(70,120,255,.16),rgba(255,0,140,.16));filter:blur(.2px)}.rare-particle{position:absolute;z-index:3;font-size:24px;animation:particleFly 2.4s ease-out forwards;text-shadow:0 0 10px rgba(255,255,255,.35)}.rare-bg-particle{position:absolute;z-index:0;font-size:24px;opacity:.9;animation:bgFloat 4.2s ease-in-out infinite}.rare-wave{position:absolute;z-index:1;font-size:34px;opacity:.9;animation:waveSweep 2.8s ease-out forwards}.rare-flash{position:absolute;z-index:5;inset:0;background:rgba(255,255,255,.9);animation:flashOut .42s ease-out forwards}.rare-crown{position:absolute;z-index:5;top:10vh;left:50%;transform:translateX(-50%);font-size:clamp(34px,10vw,92px);animation:crownDrop 1.2s cubic-bezier(.2,1.4,.2,1) forwards}.rare-world-banner{position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:6;background:rgba(255,244,216,.12);border:2px solid rgba(255,244,216,.45);border-radius:999px;padding:8px 16px;color:#fff4d8;font-weight:1000;letter-spacing:2px;box-shadow:0 0 30px rgba(255,255,255,.18)}body.rare-catch-playing .central-fish-card,body.rare-catch-playing #fishingCard,body.rare-catch-playing #fishingSpecialCard,body.rare-catch-playing #extraFish50Card,body.rare-catch-playing #sharkCard,body.rare-catch-playing #mutantCard{z-index:14050!important;position:fixed!important;pointer-events:none!important}@keyframes rareFade{from{opacity:0}to{opacity:1}}@keyframes rareReveal{0%{transform:scale(.45);opacity:0}45%{transform:scale(1.12);opacity:1}100%{transform:scale(1);opacity:1}}@keyframes shadowPulse{from{transform:scale(.92) rotate(-1deg);opacity:.62}to{transform:scale(1.08) rotate(1deg);opacity:1}}@keyframes ringExpand{0%{transform:scale(.25);opacity:1}100%{transform:scale(1.75);opacity:0}}@keyframes particleFly{0%{transform:translate(0,0) scale(.5) rotate(0);opacity:0}15%{opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(1.6) rotate(var(--rot));opacity:0}}@keyframes bgFloat{0%{transform:translateY(20vh) scale(.8);opacity:0}25%{opacity:.95}100%{transform:translateY(-120vh) scale(1.35);opacity:0}}@keyframes waveSweep{0%{transform:translateX(-30vw) scale(.8);opacity:0}20%{opacity:1}100%{transform:translateX(130vw) scale(1.5);opacity:0}}@keyframes flashOut{from{opacity:.85}to{opacity:0}}@keyframes rareShake{from{transform:translate(-2px,1px)}to{transform:translate(2px,-1px)}}@keyframes rareShakeSoft{from{transform:translate(-1px,.5px)}to{transform:translate(1px,-.5px)}}@keyframes vortexSpin{from{transform:rotate(0deg) scale(.95)}to{transform:rotate(360deg) scale(1.05)}}@keyframes crownDrop{0%{transform:translate(-50%,-120px) scale(.35);opacity:0}65%{transform:translate(-50%,0) scale(1.15);opacity:1}100%{transform:translate(-50%,0) scale(1)}}
      @media(max-width:760px){.rare-catch-title{font-size:clamp(28px,9vw,56px)}.rare-catch-name{font-size:clamp(16px,4.8vw,26px);padding:0 12px}.rare-catch-shadow{font-size:clamp(58px,22vw,130px)}.rare-particle,.rare-bg-particle{font-size:22px}}
    `;
    document.head.appendChild(style);
  }

  function clearOverlay() {
    document.querySelectorAll('.rare-catch-overlay').forEach(el => el.remove());
    document.body.classList.remove('rare-catch-playing');
    if (timer) clearTimeout(timer);
    timer = null;
    playing = false;
  }

  function visible(card) { return card && !card.classList.contains('hidden'); }
  function tierFromCard(card, text) {
    if (!visible(card)) return '';
    if (card.id === 'lanarCard' || card.id === 'arielCard' || card.id === 'islandCard' || card.id === 'blackbeardCard' || card.id === 'madPriestCard' || card.id === 'carnivalCard') return '';
    if (card.id === 'centralFishResultCard') {
      if (/鯊魚事件|鯊/.test(text)) return '神話';
      if (/美人魚事件/.test(text)) return '傳說';
      const m = text.match(/稀有度：\s*(世界級|神話|傳說|史詩|稀有|常見|普通)/);
      if (!m) return '';
      if (m[1] === '普通' || m[1] === '常見') return '';
      return m[1];
    }
    if (card.id === 'mutantCard') {
      const m = text.match(/稀有度：\s*(世界級|神話|傳說|史詩|稀有|常見|普通)/);
      return m ? m[1] : '';
    }
    if (card.id === 'sharkCard') {
      const m = text.match(/稀有度：\s*(世界級|神話|傳說|史詩|稀有|常見|普通)/);
      if (!m) return '神話';
      if (m[1] === '傳說') return '神話';
      if (m[1] === '常見' || m[1] === '普通') return '';
      return m[1];
    }
    if (['fishingCard','fishingSpecialCard','extraFish50Card'].includes(card.id)) {
      const m = text.match(/稀有度：\s*(世界級|神話|傳說|史詩|稀有|常見|普通)/);
      if (!m) return '';
      if (m[1] === '普通' || m[1] === '常見') return '';
      return m[1];
    }
    return '';
  }
  function nameFromText(text) { return text.replace(/分類：.*$/s, '').replace(/海域：.*$/s, '').replace(/類型：.*$/s, '').replace(/稀有度：.*$/s, '').replace(/重量：.*$/s, '').replace(/\s+/g, ' ').trim().slice(0, 54); }
  function iconFromText(text, tier) {
    if (/克蘇魯|眼/.test(text)) return '👁️';
    if (/鯊/.test(text)) return '🦈';
    if (/美人魚/.test(text)) return '🧜‍♀️';
    if (/瓶|信/.test(text)) return '🍾';
    if (/蟹/.test(text)) return '🦀';
    if (/蝦|龍蝦/.test(text)) return '🦐';
    if (/鯨/.test(text)) return '🐋';
    if (/章魚|烏賊|克拉肯/.test(text)) return '🐙';
    if (/變異|腐化|夢魘|深淵/.test(text)) return '🧬';
    if (/古|化石|菊石|三葉蟲|鄧氏/.test(text)) return '🦴';
    return tierMap[tier]?.icon || '🐟';
  }
  function particleFor(cls, list, i) {
    if (cls === 'myth') return i % 4 === 0 ? '👁️' : i % 4 === 1 ? '🌊' : i % 4 === 2 ? '🌑' : '🌀';
    if (cls === 'world') return ['👑','🌈','🌌','✨','☄️','👁️'][i % 6];
    return list[i % list.length];
  }
  function addParticles(overlay, cfg, tier, text) {
    const count = cfg.cls === 'world' ? 78 : cfg.cls === 'myth' ? 64 : cfg.cls === 'legend' ? 46 : cfg.cls === 'epic' ? 34 : 24;
    const bgCount = cfg.cls === 'world' ? 46 : cfg.cls === 'myth' ? 34 : cfg.cls === 'legend' ? 24 : 14;
    for (let i = 0; i < bgCount; i++) {
      const p = document.createElement('div');
      p.className = 'rare-bg-particle';
      p.textContent = particleFor(cfg.cls, cfg.particles, i);
      p.style.left = `${Math.random() * 100}vw`;
      p.style.top = `${20 + Math.random() * 100}vh`;
      p.style.animationDelay = `${Math.random() * 1.4}s`;
      p.style.animationDuration = `${3.2 + Math.random() * 2.4}s`;
      overlay.appendChild(p);
    }
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'rare-particle';
      p.textContent = particleFor(cfg.cls, cfg.particles, i);
      p.style.left = `${50 + (Math.random() - .5) * 22}vw`;
      p.style.top = `${50 + (Math.random() - .5) * 22}vh`;
      const a = Math.random() * Math.PI * 2;
      const d = 120 + Math.random() * (cfg.cls === 'world' ? 460 : cfg.cls === 'myth' ? 380 : 280);
      p.style.setProperty('--dx', `${Math.cos(a) * d}px`);
      p.style.setProperty('--dy', `${Math.sin(a) * d}px`);
      p.style.setProperty('--rot', `${-360 + Math.random() * 720}deg`);
      p.style.animationDelay = `${Math.random() * .45}s`;
      overlay.appendChild(p);
    }
    if (cfg.cls === 'myth' || cfg.cls === 'world') {
      for (let i = 0; i < 18; i++) {
        const w = document.createElement('div');
        w.className = 'rare-wave';
        w.textContent = i % 2 ? '🌊' : '👁️';
        w.style.left = `${-10 - Math.random() * 20}vw`;
        w.style.top = `${18 + Math.random() * 70}vh`;
        w.style.animationDelay = `${Math.random() * 1.8}s`;
        overlay.appendChild(w);
      }
    }
  }
  function play(card, text) {
    const tier = tierFromCard(card, text);
    if (!tier || !tierMap[tier]) return;
    const key = `${card.id}:${tier}:${nameFromText(text)}`;
    if (key === lastKey && playing) return;
    clearOverlay();
    lastKey = key;
    const cfg = tierMap[tier];
    playing = true;
    document.body.classList.add('rare-catch-playing');
    addStyle();
    const overlay = document.createElement('div');
    overlay.className = `rare-catch-overlay ${cfg.cls}`;
    const icon = iconFromText(text, tier);
    overlay.innerHTML = `${cfg.cls === 'world' ? '<div class="rare-world-banner">🌈 WORLD CLASS DISCOVERY 🌈</div>' : ''}<div class="rare-flash"></div>${(cfg.cls === 'legend' || cfg.cls === 'myth' || cfg.cls === 'world') ? '<div class="rare-crown">👑</div>' : ''}<div class="rare-catch-vortex"></div><div class="rare-catch-ring"></div><div class="rare-catch-ring r2"></div><div class="rare-catch-ring r3"></div><div class="rare-catch-box"><div class="rare-catch-title">${cfg.icon} ${cfg.title}</div><div class="rare-catch-shadow">${icon}</div><div class="rare-catch-name">${nameFromText(text)}</div></div>`;
    document.body.appendChild(overlay);
    addParticles(overlay, cfg, tier, text);
    timer = setTimeout(() => clearOverlay(), cfg.ms);
  }
  function watchCards() {
    const cards = ['#centralFishResultCard', '#fishingCard', '#fishingSpecialCard', '#extraFish50Card', '#sharkCard', '#mutantCard'].map(s => document.querySelector(s)).filter(Boolean);
    for (const card of cards) { if (!visible(card)) continue; const text = card.textContent.trim(); if (text) play(card, text); break; }
  }
  function init() { addStyle(); setInterval(watchCards, 120); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();