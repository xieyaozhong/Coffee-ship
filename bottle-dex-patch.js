(() => {
  'use strict';

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; }
  }

  function uniqueByTitle(list) {
    const seen = new Set();
    return list.filter(item => {
      const title = item && item.title;
      if (!title || seen.has(title)) return false;
      seen.add(title);
      return true;
    });
  }

  function allLetters() {
    const base = read('coffeeShipBottleLetters').map(x => ({ source: '🍾', title: x.title, text: x.text, at: x.at || 0 }));
    const lanar = read('coffeeShipLanarLetters').map(x => ({ source: '🌊', title: x.title, text: x.text, at: x.at || 0 }));
    const ariel = read('coffeeShipArielLetters').map(x => ({ source: '🧜‍♀️', title: x.title, text: x.text, at: x.at || 0 }));
    const island = read('coffeeShipIslandLetters').map(x => ({ source: '🏝️', title: x.title, text: x.text, at: x.at || 0 }));
    return uniqueByTitle(base.concat(lanar, ariel, island).sort((a, b) => b.at - a.at));
  }

  function enhanceFishDex() {
    const panel = document.getElementById('fishDexPanel');
    if (!panel || panel.classList.contains('hidden')) return;
    if (panel.dataset.bottleDexPatched === String(allLetters().length)) return;
    const letters = allLetters();
    panel.dataset.bottleDexPatched = String(letters.length);
    const oldHeads = Array.from(panel.querySelectorAll('h3')).filter(h => h.textContent.includes('最近瓶中信'));
    oldHeads.forEach(h => {
      const next = h.nextElementSibling;
      h.remove();
      if (next && next.classList.contains('fish-grid')) next.remove();
    });
    const html = `<h3>最近瓶中信 / 漂流瓶</h3><div class="fish-grid">${letters.length ? letters.slice(0, 30).map(l => `<div class="fish-entry"><strong>${l.source} ${l.title}</strong><small>${l.text}</small></div>`).join('') : '<div class="fish-entry">還沒有讀過瓶中信。</div>'}</div>`;
    panel.insertAdjacentHTML('beforeend', html);
  }

  function init() {
    setInterval(enhanceFishDex, 350);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();