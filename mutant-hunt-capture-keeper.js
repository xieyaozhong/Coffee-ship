(() => {
  'use strict';
  if (window.__COFFEE_SHIP_MUTANT_CAPTURE_KEEPER_V1__) return;
  window.__COFFEE_SHIP_MUTANT_CAPTURE_KEEPER_V1__ = true;

  const nativeTimeout = window.setTimeout;
  function guardedTimeout(callback, delay, ...args) {
    const source = typeof callback === 'function' ? Function.prototype.toString.call(callback) : '';
    if (Number(delay) === 0 && source.includes('window.addEventListener !== nativeAdd')) {
      return nativeTimeout.call(window, callback, 10000, ...args);
    }
    return nativeTimeout.call(window, callback, delay, ...args);
  }

  window.setTimeout = guardedTimeout;
  nativeTimeout(() => {
    if (window.setTimeout === guardedTimeout) window.setTimeout = nativeTimeout;
  }, 0);
})();