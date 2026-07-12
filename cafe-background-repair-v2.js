(() => {
  'use strict';

  if (window.__COFFEE_SHIP_CAFE_BACKGROUND_REPAIR_V2__) return;
  window.__COFFEE_SHIP_CAFE_BACKGROUND_REPAIR_V2__ = true;

  const PARTS = Object.freeze([
    'assets/scenes/cafe-v1/part-1.txt',
    'assets/scenes/cafe-v1/part-2.txt'
  ]);

  let loading = null;
  let ready = false;

  function sceneRuntime() {
    const runtime = window.COFFEE_SHIP_SCENE_ART_V2;
    return runtime && typeof runtime === 'object' ? runtime : null;
  }

  async function loadCafeBackground() {
    if (ready) return true;
    if (loading) return loading;

    loading = (async () => {
      try {
        const chunks = await Promise.all(PARTS.map(async path => {
          const response = await fetch(path,{cache:'no-store'});
          if (!response.ok) throw new Error(`${response.status} ${path}`);
          return (await response.text()).replace(/\s+/g,'');
        }));

        const image = new Image();
        image.decoding = 'async';
        await new Promise((resolve,reject) => {
          image.onload = resolve;
          image.onerror = () => reject(new Error('Cafe background v2 decode failed'));
          image.src = `data:image/webp;base64,${chunks.join('')}`;
        });

        const runtime = sceneRuntime();
        if (!runtime?.assets?.cafe) throw new Error('Scene runtime is not ready');
        runtime.assets.cafe.image = image;
        runtime.assets.cafe.ready = true;
        runtime.assets.cafe.failed = false;
        ready = true;
        runtime.installCafePatch?.();
        document.body.dataset.coffeeShipCafeArt = 'v2-ready';
        window.dispatchEvent(new CustomEvent('coffee-ship:scene-art-ready',{
          detail:{scene:'cafe',version:2,repaired:true,width:image.naturalWidth,height:image.naturalHeight}
        }));
        return true;
      } catch (error) {
        console.warn('Coffee Ship cafe background repair v2 failed.',error);
        return false;
      } finally {
        loading = null;
      }
    })();

    return loading;
  }

  function installWhenReady(attempt = 0) {
    const runtime = sceneRuntime();
    if (!runtime?.assets?.cafe) {
      if (attempt < 80) setTimeout(() => installWhenReady(attempt+1),100);
      return;
    }
    loadCafeBackground();
  }

  window.addEventListener('coffee-ship:entered',() => {
    if (ready) sceneRuntime()?.installCafePatch?.();
    else installWhenReady();
  });
  window.addEventListener('coffee-ship:scene',event => {
    if (event.detail?.scene === 'cafe') {
      if (ready) sceneRuntime()?.installCafePatch?.();
      else installWhenReady();
    }
  });

  window.COFFEE_SHIP_CAFE_BACKGROUND_V2 = {
    version:2,
    isReady:() => ready,
    load:loadCafeBackground
  };

  installWhenReady();
})();
