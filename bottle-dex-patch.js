(() => {
  'use strict';

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; }
  }
  function readObj(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { return {}; }
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
    const blackbeard = read('coffeeShipBlackbeardLetters').map(x => ({ source: '🏴‍☠️', title: x.title, text: x.text, at: x.at || 0 }));
    const priest = read('coffeeShipMadPriestLetters').map(x => ({ source: '📜', title: x.title, text: x.text, at: x.at || 0 }));
    return uniqueByTitle(base.concat(lanar, ariel, island, blackbeard, priest).sort((a, b) => b.at - a.at));
  }

  function mutantEntries() {
    const dex = readObj('coffeeShipMutantDex');
    return Object.entries(dex).sort((a,b)=>b[1]-a[1]);
  }

  function enhanceFishDex() {
    const panel = document.getElementById('fishDexPanel');
    if (!panel || panel.classList.contains('hidden')) return;
    const letters = allLetters();
    const mutants = mutantEntries();
    const stamp = `${letters.length}-${mutants.length}`;
    if (panel.dataset.bottleDexPatched === stamp) return;
    panel.dataset.bottleDexPatched = stamp;
    const oldHeads = Array.from(panel.querySelectorAll('h3')).filter(h => h.textContent.includes('最近瓶中信') || h.textContent.includes('變異生物'));
    oldHeads.forEach(h => {
      const next = h.nextElementSibling;
      h.remove();
      if (next && next.classList.contains('fish-grid')) next.remove();
    });
    const mutantHtml = `<h3>🧬 變異生物</h3><div class="fish-grid">${mutants.length ? mutants.slice(0, 20).map(([name, weight]) => `<div class="fish-entry"><strong>🧬 ${name}</strong><small>最大紀錄：${Number(weight).toFixed(2)} kg</small></div>`).join('') : '<div class="fish-entry">尚未發現變異生物。</div>'}</div>`;
    const letterHtml = `<h3>最近瓶中信 / 漂流瓶</h3><div class="fish-grid">${letters.length ? letters.slice(0, 46).map(l => `<div class="fish-entry"><strong>${l.source} ${l.title}</strong><small>${l.text}</small></div>`).join('') : '<div class="fish-entry">還沒有讀過瓶中信。</div>'}</div>`;
    panel.insertAdjacentHTML('beforeend', mutantHtml + letterHtml);
  }

  function init() {
    setInterval(enhanceFishDex, 350);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();