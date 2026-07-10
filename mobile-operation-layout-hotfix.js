(() => {
  'use strict';
  if (window.__COFFEE_SHIP_MOBILE_OPERATION_LAYOUT_HOTFIX__) return;
  window.__COFFEE_SHIP_MOBILE_OPERATION_LAYOUT_HOTFIX__ = true;

  const ACTION_IDS = ['coffeeBtn','sitBtn','messageBtn','emoteBtn','fishDexBtn'];
  let queued = false;

  function restoreControls() {
    const controls = document.querySelector('.mobile-controls');
    if (!controls) return;

    const up = controls.querySelector('[data-move="up"]');
    const left = controls.querySelector('[data-move="left"]');
    const down = controls.querySelector('[data-move="down"]');
    const right = controls.querySelector('[data-move="right"]');
    if (!up || !left || !down || !right) return;

    let directionRow = controls.querySelector(':scope > .mobile-direction-row');
    if (!directionRow) {
      directionRow = document.createElement('div');
      directionRow.className = 'mobile-direction-row';
    }
    directionRow.replaceChildren(left, down, right);

    const actions = ACTION_IDS.map(id => document.getElementById(id)).filter(Boolean);
    const expected = [up, directionRow, ...actions];
    const current = Array.from(controls.children);
    const alreadyFixed = current.length === expected.length && current.every((node, index) => node === expected[index]);

    if (!alreadyFixed) controls.replaceChildren(...expected);

    controls.dataset.operationModeled = 'mobile-fixed';
    controls.dataset.mobileLayoutFixed = 'true';
  }

  function queueRestore() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      restoreControls();
    });
  }

  function init() {
    restoreControls();

    const controls = document.querySelector('.mobile-controls');
    if (controls) {
      new MutationObserver(records => {
        const structureChanged = records.some(record =>
          record.type === 'childList' &&
          (record.target === controls || record.target.classList?.contains('op-mobile-block') || record.target.classList?.contains('op-mobile-stack') || record.target.classList?.contains('op-mobile-actions'))
        );
        if (structureChanged) queueRestore();
      }).observe(controls, { childList:true, subtree:true });
    }

    window.addEventListener('coffee-ship:entered', queueRestore);
    window.addEventListener('coffee-ship:scene', queueRestore);
    window.addEventListener('resize', queueRestore, { passive:true });
    setTimeout(restoreControls, 0);
    setTimeout(restoreControls, 250);
    setTimeout(restoreControls, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();