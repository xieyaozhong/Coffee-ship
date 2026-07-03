(() => {
  'use strict';

  const tierMap = {
    '稀有': { cls: 'rare', title: 'RARE CATCH', icon: '💙', ms: 1900 },
    '史詩': { cls: 'epic', title: 'EPIC CATCH', icon: '💜', ms: 2400 },
    '傳說': { cls: 'legend', title: 'LEGENDARY', icon: '✨', ms: 3100 },
    '神話': { cls: 'myth', title: 'MYTHIC CREATURE', icon: '👑', ms: 3600 }
  };
  let playing = false;
  let lastText = '';

  function addStyle() {
    if (document.getElementById('fishingRareAnimationStyle')) return;
    const style = document.createElement('style');
    style.id = 'fishingRareAnimationStyle';
    style.textContent = `
      .rare-catch-overlay{position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;background:rgba(5,8,18,.38);pointer-events:none;overflow:hidden;animation:rareFade .35s ease-out both}.rare-catch-overlay.epic{background:rgba(14,5,28,.52)}.rare-catch-overlay.legend{background:rgba(20,12,4,.62)}.rare-catch-overlay.myth{background:rgba(0,0,0,.76);animation:rareShake .22s infinite alternate}.rare-catch-box{text-align:center;color:#fff4d8;font-weight:1000;text-shadow:3px 3px 0 #120b17;transform:scale(.85);animation:rareReveal 1.25s ease-out forwards}.rare-catch-title{font-size:clamp(30px,8vw,72px);letter-spacing:2px}.rare-catch-shadow{font-size:clamp(58px,18vw,150px);filter:brightness(0);opacity:.82;animation:shadowPulse .7s ease-in-out infinite alternate}.rare-catch-name{font-size:clamp(18px,4.5vw,34px);margin-top:10px}.rare-catch-ring{position:absolute;width:48vmin;height:48vmin;border:6px solid rgba(156,232,240,.65);border-radius:999px;animation:ringExpand 1.2s ease-out infinite}.rare-catch-overlay.epic .rare-catch-ring{border-color:rgba(233,166,176,.72)}.rare-catch-overlay.legend .rare-catch-ring{border-color:rgba(255,225,107,.78);box-shadow:0 0 42px #ffe16b}.rare-catch-overlay.myth .rare-catch-ring{border-color:rgba(255,255,255,.9);box-shadow:0 0 64px #fff}.rare-particle{position:absolute;font-size:24px;animation:particleFly 1.8s ease-out forwards}.rare-flash{position:absolute;inset:0;background:rgba(255,255,255,.9);animation:flashOut .38s ease-out forwards}@keyframes rareFade{from{opacity:0}to{opacity:1}}@keyframes rareReveal{0%{transform:scale(.55);opacity:0}45%{transform:scale(1.08);opacity:1}100%{transform:scale(1);opacity:1}}@keyframes shadowPulse{from{transform:scale(.92);opacity:.55}to{transform:scale(1.08);opacity:.95}}@keyframes ringExpand{0%{transform:scale(.35);opacity:1}100%{transform:scale(1.55);opacity:0}}@keyframes particleFly{0%{transform:translate(0,0) scale(.6);opacity:0}20%{opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(1.4);opacity:0}}@keyframes flashOut{from{opacity:.9}to{opacity:0}}@keyframes rareShake{from{transform:translate(-2px,1px)}to{transform:translate(2px,-1px)}}
    `;
    document.head.appendChild(style);
  }

  function tierFromText(text) {
    if (/巨齒鯊|世界級|克蘇魯|神話|利維坦|拉納爾|愛麗兒/.test(text)) return '神話';
    if (/傳說|咖啡鯨|星海|人魚|王冠|永夜|黑洞/.test(text)) return '傳說';
    if (/史詩|深海|巨型|古老|銀河|大白鯊|虎鯊/.test(text)) return '史詩';
    if (/稀有|瓶中信|安康|帝王蟹|星砂|夜光/.test(text)) return '稀有';
    return '';
  }

  function play(text) {
    const tier = tierFromText(text);
    if (!tier || playing) return;
    const cfg = tierMap[tier];
    playing = true;
    addStyle();
    const overlay = document.createElement('div');
    overlay.className = `rare-catch-overlay ${cfg.cls}`;
    const icon = /鯊/.test(text) ? '🦈' : (/瓶|信|拉納爾|愛麗兒/.test(text) ? '🍾' : cfg.icon);
    overlay.innerHTML = `<div class="rare-flash"></div><div class="rare-catch-ring"></div><div class="rare-catch-ring" style="animation-delay:.35s"></div><div class="rare-catch-box"><div class="rare-catch-title">${cfg.icon} ${cfg.title}</div><div class="rare-catch-shadow">${icon}</div><div class="rare-catch-name">${text.replace(/<[^>]+>/g,'').slice(0,42)}</div></div>`;
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
    setTimeout(() => {
      overlay.remove();
      playing = false;
    }, cfg.ms);
  }

  function watchCards() {
    const cards = ['#fishingCard', '#sharkCard', '#lanarCard', '#arielCard'].map(s => document.querySelector(s)).filter(Boolean);
    for (const card of cards) {
      if (card.classList.contains('hidden')) continue;
      const text = card.textContent.trim();
      if (text && text !== lastText) {
        lastText = text;
        play(text);
      }
    }
  }

  function init() {
    addStyle();
    setInterval(watchCards, 180);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
