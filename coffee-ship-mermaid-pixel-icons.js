(() => {
  'use strict';
  if (window.__COFFEE_SHIP_MERMAID_PIXEL_ICONS_V1__) return;
  window.__COFFEE_SHIP_MERMAID_PIXEL_ICONS_V1__ = true;

  const SIZE = 24;
  const DEFINITIONS = [
    {id:'moon_song',title:'月光歌聲',motif:'moon-note',accent:'#fff4a8'},
    {id:'deep_pearl',title:'深海珍珠',motif:'pearl',accent:'#f9fbff'},
    {id:'shoal_blessing',title:'魚群祝福',motif:'shoal',accent:'#7bf2bd'},
    {id:'blue_scale',title:'藍色鱗片',motif:'scale',accent:'#65ddff'},
    {id:'lost_chart',title:'失落航海圖',motif:'chart',accent:'#e9bd79'},
    {id:'tide_lullaby',title:'海潮安眠曲',motif:'lullaby',accent:'#a5f7ff'},
    {id:'legendary_bait',title:'傳說魚餌',motif:'star-bait',accent:'#ffd45c'},
    {id:'crown_fragment',title:'皇冠碎片',motif:'crown',accent:'#ffd065'},
    {id:'bottled_lyrics',title:'瓶中歌詞',motif:'bottle-note',accent:'#8df7e7'},
    {id:'deep_sapphire',title:'深海藍寶',motif:'sapphire',accent:'#4a8fff'},
    {id:'silent_smile',title:'無聲的微笑',motif:'heart',accent:'#ff9dca'},
    {id:'bubble_echo',title:'泡沫回音',motif:'bubble-scroll',accent:'#c8fbff'}
  ];
  const BY_TITLE = new Map(DEFINITIONS.map(row => [row.title,row]));
  const BY_ID = new Map(DEFINITIONS.map(row => [row.id,row]));
  const canvasCache = new Map();
  const dataUrlCache = new Map();

  function hashOf(value) {
    let hash = 2166136261;
    for (const character of String(value || 'mermaid')) {
      hash ^= character.codePointAt(0);
      hash = Math.imul(hash,16777619);
    }
    return hash >>> 0;
  }

  function normalizeTitle(value) {
    return String(value || '美人魚事件')
      .replace(/^mermaid:/,'')
      .replace(/^美人魚事件[｜|]\s*/,'')
      .replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u,'')
      .normalize('NFC').trim() || '美人魚事件';
  }

  function resolve(input = {}) {
    const object = typeof input === 'string' ? {title:input} : input;
    const rawId = String(object.mermaidId || object.eventId || object.id || '').replace(/^mermaid:/,'');
    const title = normalizeTitle(object.name || object.title || rawId);
    return BY_ID.get(rawId) || BY_TITLE.get(rawId) || BY_TITLE.get(title) || null;
  }

  function descriptor(input = {}) {
    const object = typeof input === 'string' ? {title:input} : input;
    const definition = resolve(object);
    const title = definition?.title || normalizeTitle(object.name || object.title || object.eventId || object.id);
    const id = definition?.id || `custom-${hashOf(title).toString(16)}`;
    const key = `mermaid:${id}`;
    const hash = hashOf(key);
    return {
      key,id,title,hash,
      signature:hash.toString(16).padStart(8,'0'),
      motif:definition?.motif || 'sparkle',
      accent:definition?.accent || '#9ce8f0',
      hair:hash & 1 ? '#f2a4d5' : '#e8a6ee',
      hairLight:'#ffd7f1',hairShadow:'#ae78c9',skin:'#ffc7a7',skinShade:'#e99b8e',
      top:'#6750b8',topLight:'#9c84ef',tail:'#7562c7',tailLight:'#a987ed',
      aqua:'#63e4ee',outline:'#332d5e',white:'#f8fbff'
    };
  }

  function painter(context) {
    return (x,y,width=1,height=1,color='#fff') => {
      context.fillStyle = color;
      context.fillRect(Math.round(x),Math.round(y),Math.round(width),Math.round(height));
    };
  }

  function drawBase(px,d) {
    px(7,1,7,2,d.outline); px(5,3,11,5,d.outline); px(5,7,5,5,d.outline);
    px(8,2,6,2,d.hairLight); px(6,4,9,4,d.hair); px(6,7,4,4,d.hairShadow); px(5,9,3,3,d.hair);
    px(9,4,5,4,d.skin); px(10,5,1,1,d.white); px(13,5,1,1,d.aqua); px(11,7,3,1,d.skinShade);
    px(9,8,6,4,d.outline); px(10,8,4,3,d.top); px(11,8,2,1,d.topLight);
    px(8,8,2,6,d.skinShade); px(8,9,1,4,d.skin); px(14,8,5,2,d.skinShade); px(15,8,4,1,d.skin); px(18,7,2,2,d.skin);
    px(10,11,5,3,d.outline); px(11,11,3,2,d.skin); px(10,13,6,4,d.outline); px(11,13,4,3,d.tailLight);
    px(13,16,6,4,d.outline); px(14,16,4,3,d.tail); px(11,19,6,3,d.outline); px(12,19,4,2,d.tail);
    px(7,20,6,4,d.outline); px(4,19,5,4,d.outline); px(8,21,5,2,d.tailLight); px(5,20,4,2,d.tail); px(4,22,5,1,d.aqua); px(10,22,3,1,d.aqua);
    px(11,14,1,2,d.aqua); px(14,16,1,2,d.aqua); px(13,19,1,2,d.aqua);
    [[6,2],[3,7],[21,3],[22,13],[3,16]].forEach(([x,y],index) => px(x,y,index % 2 ? 1 : 2,1,index % 2 ? d.aqua : d.white));
  }

  function drawMotif(px,d) {
    const color = d.accent;
    if (d.motif === 'moon-note') {
      px(19,2,4,4,d.white); px(20,2,3,3,color); px(19,2,1,2,d.aqua); px(20,6,1,4,color); px(18,9,2,2,color); px(21,6,2,1,color);
    } else if (d.motif === 'pearl') {
      px(19,5,4,4,d.outline); px(20,5,3,3,color); px(20,5,1,1,d.white); px(18,4,1,1,d.aqua); px(22,3,1,1,d.white);
    } else if (d.motif === 'shoal') {
      [[18,3],[20,6],[18,10]].forEach(([x,y],index) => { px(x,y,3,2,index === 1 ? d.aqua : color); px(x - 1,y,1,2,d.tailLight); });
    } else if (d.motif === 'scale') {
      [[19,3],[21,6],[18,9]].forEach(([x,y]) => { px(x,y,2,3,d.outline); px(x + 1,y,1,2,color); px(x,y + 1,1,1,d.white); });
    } else if (d.motif === 'chart') {
      px(18,3,5,6,'#5d4267'); px(19,3,4,5,color); px(20,4,2,1,'#9b6f49'); px(21,6,1,1,'#9b6f49'); px(18,4,1,4,d.white);
    } else if (d.motif === 'lullaby') {
      px(18,4,1,5,color); px(19,4,3,1,color); px(21,5,1,3,color); px(17,8,2,2,d.aqua); px(20,8,2,2,d.aqua); px(18,11,5,1,d.white);
    } else if (d.motif === 'star-bait') {
      px(20,3,1,5,d.white); px(18,5,5,1,d.white); px(19,4,3,3,color); px(21,8,1,2,d.aqua); px(20,9,2,1,d.aqua);
    } else if (d.motif === 'crown') {
      px(18,7,5,2,color); px(18,4,1,4,color); px(20,3,1,5,d.white); px(22,4,1,4,color); px(19,8,3,1,'#d78c3d');
    } else if (d.motif === 'bottle-note') {
      px(19,4,3,5,d.outline); px(20,5,2,3,color); px(20,3,1,2,'#d9bb79'); px(22,3,1,4,d.white); px(22,3,2,1,d.aqua); px(23,5,1,2,d.aqua);
    } else if (d.motif === 'sapphire') {
      px(19,3,3,2,d.aqua); px(18,5,5,3,d.outline); px(19,4,3,5,color); px(20,4,1,1,d.white); px(20,8,1,1,d.aqua);
    } else if (d.motif === 'heart') {
      px(18,4,2,2,color); px(21,4,2,2,color); px(18,6,5,2,color); px(19,8,3,1,color); px(20,9,1,1,d.white); px(22,2,1,1,d.aqua);
    } else if (d.motif === 'bubble-scroll') {
      [[19,2,2],[22,5,1],[18,8,2],[22,11,2]].forEach(([x,y,size]) => { px(x,y,size,size,d.white); if (size > 1) px(x + 1,y + 1,1,1,d.aqua); });
      px(18,12,5,3,d.outline); px(19,12,3,2,color); px(20,12,1,1,d.tail); px(23,13,1,1,d.white);
    } else {
      px(20,4,1,5,color); px(18,6,5,1,color); px(19,5,3,3,d.white);
    }
    [[8,18],[10,19],[15,14],[16,17]].forEach(([x,y],index) => {
      if ((d.hash >>> index) & 1) px(x,y,1,1,index % 2 ? d.white : d.aqua);
    });
  }

  function renderCanvas(input = {}) {
    const d = descriptor(input);
    if (canvasCache.has(d.key)) return canvasCache.get(d.key);
    if (!document?.createElement) return null;
    const canvas = document.createElement('canvas');
    canvas.width = SIZE; canvas.height = SIZE; canvas.setAttribute('aria-hidden','true');
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.imageSmoothingEnabled = false;
    context.clearRect(0,0,SIZE,SIZE);
    const px = painter(context);
    drawBase(px,d); drawMotif(px,d);
    canvasCache.set(d.key,canvas);
    return canvas;
  }

  function dataUrl(input = {}) {
    const d = descriptor(input);
    if (dataUrlCache.has(d.key)) return dataUrlCache.get(d.key);
    const canvas = renderCanvas(input);
    if (!canvas?.toDataURL) return '';
    let url = '';
    try { url = canvas.toDataURL('image/png'); } catch {}
    if (url) dataUrlCache.set(d.key,url);
    return url;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g,character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  }

  function iconHtml(input = {},className = '') {
    const d = descriptor(input);
    const src = dataUrl(input);
    if (!src) return '';
    return `<span class="cs-mermaid-pixel-icon ${escapeHtml(className)}" data-icon-key="${escapeHtml(d.key)}" data-mermaid-id="${escapeHtml(d.id)}" data-mermaid-motif="${escapeHtml(d.motif)}" style="--mermaid-accent:${escapeHtml(d.accent)}" aria-hidden="true"><img class="cs-mermaid-pixel-sprite" src="${src}" alt="" width="24" height="24" draggable="false"></span>`;
  }

  function addStyle() {
    if (document.getElementById('coffeeShipMermaidPixelIconStyle')) return;
    const style = document.createElement('style');
    style.id = 'coffeeShipMermaidPixelIconStyle';
    style.textContent = `
      .cs-mermaid-pixel-icon{position:relative!important;display:inline-grid!important;place-items:center!important;width:2.42em!important;height:2.42em!important;min-width:2.42em!important;padding:.16em!important;overflow:visible!important;border:2px solid color-mix(in srgb,var(--mermaid-accent) 70%,#f4a6dc 30%)!important;border-radius:.58em!important;background:linear-gradient(180deg,#16364c,#101c3a)!important;box-shadow:0 4px 0 rgba(0,0,0,.34),inset 0 0 0 1px rgba(255,255,255,.08),0 0 16px color-mix(in srgb,var(--mermaid-accent) 28%,transparent)!important;box-sizing:border-box!important;vertical-align:middle!important}
      .cs-mermaid-pixel-icon::before{content:'';position:absolute;inset:2px;border-radius:.38em;background:radial-gradient(circle at 72% 20%,rgba(255,255,255,.15),transparent 23%),linear-gradient(135deg,rgba(99,228,238,.12),transparent 52%);pointer-events:none}
      .cs-mermaid-pixel-sprite{display:block;width:100%;height:100%;object-fit:contain;image-rendering:pixelated;image-rendering:crisp-edges;filter:drop-shadow(0 2px 0 rgba(0,0,0,.35));user-select:none}
      .fh-icon .cs-mermaid-pixel-icon{font-size:18px;margin:0!important}
      @supports not (color:color-mix(in srgb,red,blue)){.cs-mermaid-pixel-icon{border-color:var(--mermaid-accent)!important}}
    `;
    document.head.appendChild(style);
  }

  function init() { addStyle(); }

  window.COFFEE_SHIP_MERMAID_ICONS = {version:1,size:SIZE,definitions:DEFINITIONS,descriptor,resolve,dataUrl,iconHtml,renderCanvas,hashOf};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
