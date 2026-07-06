(() => {
  'use strict';
  if (window.__COFFEE_SHIP_BACKPACK_NEWEST_FIRST_V1__) return;
  window.__COFFEE_SHIP_BACKPACK_NEWEST_FIRST_V1__ = true;

  const PANEL_ID = 'backpackPanel';
  let queued = false;
  let panelObserver = null;

  function sortVisibleItems() {
    const panel = document.getElementById(PANEL_ID);
    if (!panel || panel.classList.contains('hidden')) return;

    const list = panel.querySelector('.bp-content .bp-list');
    if (!list) return;

    const cards = Array.from(list.children).filter(node => node.matches?.('.bp-card'));
    if (cards.length < 2) return;

    const indexedCards = cards.map(card => {
      const action = card.querySelector('[data-bp-sell], [data-bp-delete]');
      const rawIndex = action?.dataset.bpSell ?? action?.dataset.bpDelete;
      return { card, index: Number(rawIndex) };
    });

    // 信件沒有背包索引，原本就已依取得時間排序，因此不處理。
    if (indexedCards.some(entry => !Number.isInteger(entry.index))) return;

    const sortedCards = indexedCards
      .slice()
      .sort((a, b) => b.index - a.index)
      .map(entry => entry.card);

    if (sortedCards.every((card, index) => cards[index] === card)) return;

    const fragment = document.createDocumentFragment();
    sortedCards.forEach(card => fragment.appendChild(card));
    list.appendChild(fragment);
  }

  function queueSort() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      sortVisibleItems();
    });
  }

  function attachPanelObserver() {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return false;

    panelObserver?.disconnect();
    panelObserver = new MutationObserver(queueSort);
    panelObserver.observe(panel, { childList: true, subtree: true });
    queueSort();
    return true;
  }

  function init() {
    if (attachPanelObserver()) return;

    const rootObserver = new MutationObserver(() => {
      if (attachPanelObserver()) rootObserver.disconnect();
    });
    rootObserver.observe(document.body, { childList: true, subtree: true });
  }

  window.addEventListener('coffee-ship:bag-changed', queueSort);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
