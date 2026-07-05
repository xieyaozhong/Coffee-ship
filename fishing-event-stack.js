(() => {
  'use strict';
  if (window.__COFFEE_SHIP_FISHING_EVENT_BRIDGE_V3__) return;
  window.__COFFEE_SHIP_FISHING_EVENT_BRIDGE_V3__ = true;
  window.__COFFEE_SHIP_FISHING_EVENT_STACK_V2__ = true;

  const SELECTOR = [
    '#mermaidCard','#sharkCard','#mutantCard','#extraFish50Card','#restoredBottleCard',
    '.mermaid-card','.shark-card','.mutant-card','.extra-fish-card',
    '.rare-catch-card','.special-catch-card','.bottle-event-card',
    '.story-event-card','.ocean-event-card','.world-event-card'
  ].join(',');

  const seen = new WeakMap();
  let queued = false;

  function visible(element) {
    if (!element?.isConnected || element.classList.contains('hidden')) return false;
    return getComputedStyle(element).display !== 'none';
  }

  function metadata(element) {
    const token = `${element.id} ${element.className}`.toLowerCase();
    if (token.includes('mermaid')) return {title:'美人魚事件',icon:'🧜‍♀️',accent:'#9ce8f0'};
    if (token.includes('shark')) return {title:'鯊魚事件',icon:'🦈',accent:'#e9a6b0'};
    if (token.includes('mutant')) return {title:'變異生物',icon:'🧬',accent:'#ff5f9e'};
    if (token.includes('bottle') || token.includes('story')) return {title:'漂流瓶事件',icon:'🍾',accent:'#d7bb79'};
    if (token.includes('rare') || token.includes('world')) return {title:'稀有事件',icon:'✨',accent:'#ffe16b'};
    return {title:'特殊釣魚事件',icon:'🌟',accent:'#8460c8'};
  }

  function signature(element) {
    return String(element.textContent || '').replace(/\s+/g,' ').trim();
  }

  function capture(element) {
    const api = window.COFFEE_SHIP_FISHING_API;
    if (!api?.pushEvent || !visible(element)) return;
    const text = signature(element);
    if (!text || seen.get(element) === text) return;
    seen.set(element,text);
    api.pushEvent({...metadata(element),text});
    element.classList.add('hidden');
  }

  function sync() {
    queued = false;
    document.querySelectorAll(SELECTOR).forEach(capture);
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(sync);
  }

  function countHistory() {
    try {
      const value = JSON.parse(localStorage.getItem('coffeeShipRecentCatches') || '[]');
      return Array.isArray(value) ? value.length : 0;
    } catch {
      return 0;
    }
  }

  function init() {
    const observer = new MutationObserver(queue);
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
    window.addEventListener('coffee-ship:fishing-api-ready',queue);
    window.COFFEE_SHIP_FISH_EVENT_STACK = {
      push:options => window.COFFEE_SHIP_FISHING_API?.pushEvent?.(options),
      clear:() => {},
      sync:queue,
      count:countHistory
    };
    queue();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();