(() => {
  'use strict';

  const tierMap = {
    '稀有': { cls: 'rare', title: 'RARE CATCH', icon: '💙', ms: 1700 },
    '史詩': { cls: 'epic', title: 'EPIC CATCH', icon: '💜', ms: 2200 },
    '傳說': { cls: 'legend', title: 'LEGENDARY', icon: '✨', ms: 2800 },
    '神話': { cls: 'myth', title: 'MYTHIC CREATURE', icon: '👑', ms: 3300 },
    '世界級': { cls: 'myth', title: 'WORLD CLASS', icon: '👑', ms: 3800 }
  };
  let playing = false;
  let lastKey = '';
  let timer = null;

  function addStyle() {
    if (document.getElementById('fishingRareAnimationStyle')) return;
    const style = document.createElement('style');
    style.id = 'fishingRareAnimationStyle';
    style.textContent = `
      .rare-catch-overlay{position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;background:rgba(5,8,18,.38);pointer-events:none;overflow:hidden;animation:rareFade .35s ease-out both}.rare-catch-overlay.epic{background:rgba(14,5,28,.52)}.rare-catch-overlay.legend{background:rgba(20,12,4,.62)}.rare-catch-overlay.myth{background:rgba(0,0,0,.76);animation:rareShake .22s infinite alternate}.rare-catch-box{text-align:center;color:#fff4d8;font-weight:1000;text-shadow:3px 3px 0 #120b17;transform:scale(.85);animation:rareReveal 1.25s ease-out forwards}.rare-catch-title{font-size:clamp(30px,8vw,72px);letter-spacing:2px}.rare-catch-shadow{font-size:clamp(58px,18vw,150px);filter:brightness(0);opacity:.82;animation:shadowPulse .7s ease-in-out infinite alternate}.rare-catch-name{font-size:clamp(18px,4.5vw,34px);margin-top:10px;max-width:92vw}.rare-catch-ring{position:absolute;width:48vmin;height:48vmin;border:6px solid rgba(156,232,240,.65);border-radius:999px;animation:ringExpand 1.2s ease-out infinite}.rare-catch-overlay.epic .rare-catch-ring{border-color:rgba(233,166,176,.72)}.rare-catch-overlay.legend .rare-catch-ring{border-color:rgba(255,225,107,.78);box-shadow:0 0 42px #ffe16b}.rare-catch-overlay.myth .rare-catch-ring{border-color:rgba(255,255,255,.9);box-shadow:0 0 64px #fff}.rare-particle{position:absolute;font-size:24px;animation:particleFly 1.8s ease-out forwards}.rare-flash{position:absolute;inset:0;background:rgba(255,255,255,.9);animation:flashOut .38s ease-out forwards}@keyframes rareFade{from{opacity:0}to{opacity:1}}@keyframes rareReveal{0%{transform:scale(.55);opacity:0}45%{transform:scale(1.08);opacity:1}100%{transform:scale(1);opacity:1}}@keyframes shadowPulse{from{transform:scale(.92);opacity:.55}to{transform:scale(1.08);opacity:.95}}@keyframes ringExpand{0%{transform:scale(.35);opacity:1}100%{transform:scale(1.55);opacity:0}}@keyframes particleFly{0%{transform:translate(0,0) scale(.6);opacity:0}20%{opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(1.4);opacity:0}}@keyframes flashOut{from{opacity:.9}to{opacity:0}}@keyframes rareShake{from{transform:translate(-2px,1px)}to{transform:translate(2px,-1px)}}
    `;
    document.head.appendChild(style);
  }

  function clearOverlay() {
    document.querySelectorAll('.rare-catch-overlay').forEach(el => el.remove());
    if (timer) clearTimeout(timer);
    timer = null;
    playing = false;
  }

  function visible(card) { return card && !card.classList.contains('hidden'); }
  function tierFromCard(card, text) {
    if (!visible(card)) return '';
    if (card.id === 'lanarCard' || card.id === 'arielCard' || card.id === 'islandCard' || card.id === 'blackbeardCard') return '';
    if (card.id === 'mutantCard') {
      const m = text.match(/稀有度：\s*(世界級|神話|傳說|史詩|稀有|常見|普通)/);
      return m ? m[1] : '';
    }
    if (card.id === 'sharkCard') {
      const m = text.match(/稀有度：\s*(傳說|史詩|稀有|常見|普通)/);
      if (!m) return '';
      if (m[1] === '傳說') return '神話';
      if (m[1] === '常見' || m[1] === '普通') return '';
      return m[1];
    }
    if (['fishingCard','fishingSpecialCard','extraFish50Card'].includes(card.id)) {
      const m = text.match(/稀有度：\s*(傳說|史詩|稀有|常見|普通)/);
      if (!m) return '';
      if (m[1] === '普通' || m[1] === '常見') return '';
      return m[1];
    }
    return '';
  }
  function nameFromText(text) { return text.replace(/海域：.*$/s, '').replace(/類型：.*$/s, '').replace(/稀有度：.*$/s, '').replace(/\s+/g, ' ').trim().slice(0, 42); }
  function iconFromText(text, tier) {
    if (/鯊/.test(text)) return '🦈';
    if (/瓶|信/.test(text)) return '🍾';
    if (/蟹/.test(text)) return '🦀';
    if (/蝦|龍蝦/.test(text)) return '🦐';
    if (/鯨/.test(text)) return '🐋';
    if (/章魚/.test(text)) return '🐙';
    if (/人魚/.test(text)) return '🧜‍♀️';
    return tierMap[tier]?.icon || '🐟';
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
    addStyle();
    const overlay = document.createElement('div');
    overlay.className = `rare-catch-overlay ${cfg.cls}`;
    const icon = iconFromText(text, tier);
    overlay.innerHTML = `<div class="rare-flash"></div><div class="rare-catch-ring"></div><div class="rare-catch-ring" style="animation-delay:.35s"></div><div class="rare-catch-box"><div class="rare-catch-title">${cfg.icon} ${cfg.title}</div><div class="rare-catch-shadow">${icon}</div><div class="rare-catch-name">${nameFromText(text)}</div></div>`;
    document.body.appendChild(overlay);
    const particles = cfg.cls === 'myth' ? 42 : cfg.cls === 'legend' ? 32 : cfg.cls === 'epic' ? 24 : 16;
    for (let i = 0; i < particles; i++) {
      const p = document.createElement('div');
      p.className = 'rare-particle';
      p.textContent = cfg.cls === 'legend' ? '✨' : cfg.cls === 'epic' ? '⚡' : cfg.cls === 'myth' ? (i % 3 ? '🌊' : '👁️') : '💦';
      p.style.left = `${50 + (Math.random() - .5) * 18}vw`;
      p.style.top = `${50 + (Math.random() - .5) * 18}vh`;
      const a = Math.random() * Math.PI * 2;
      const d = 110 + Math.random() * 260;
      p.style.setProperty('--dx', `${Math.cos(a) * d}px`);
      p.style.setProperty('--dy', `${Math.sin(a) * d}px`);
      overlay.appendChild(p);
    }
    timer = setTimeout(() => clearOverlay(), cfg.ms);
  }
  function watchCards() {
    const cards = ['#fishingCard', '#fishingSpecialCard', '#extraFish50Card', '#sharkCard', '#mutantCard'].map(s => document.querySelector(s)).filter(Boolean);
    for (const card of cards) { if (!visible(card)) continue; const text = card.textContent.trim(); if (text) play(card, text); break; }
  }
  function init() { addStyle(); setInterval(watchCards, 180); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();