(() => {
  'use strict';

  const palette = {
    normal:['#f7d98b','#76536a','#171020'], rare:['#6bd7ff','#254d7a','#101a2a'], epic:['#c084fc','#5b2a86','#180f26'],
    legend:['#ffe16b','#9b5b22','#24140d'], myth:['#ff6b8a','#5a1026','#120812'], world:['#9fffee','#7a5cff','#110822']
  };
  const rarityClass = { 普通:'normal', 常見:'normal', 稀有:'rare', 史詩:'epic', 傳說:'legend', 神話:'myth', 世界級:'world' };

  function esc(s){ return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m])); }
  function seedColor(id){
    let h = 0; String(id || 'coffee').split('').forEach(ch => h = (h * 31 + ch.charCodeAt(0)) >>> 0);
    return `hsl(${h % 360} 72% 62%)`;
  }
  function kindOf(id, name, category){
    const s = `${id || ''} ${name || ''} ${category || ''}`;
    if (/bottle|漂流瓶|藏寶圖|殘頁|故事/.test(s)) return 'bottle';
    if (/mask|面具/.test(s)) return 'mask';
    if (/cloth|衣|褲|襪|襯衫|禮服|披風|手套|圍巾|帽|鞋|絲帶/.test(s)) return 'cloth';
    if (/toy|玩具|氣球|悠悠球|風箏|木馬|人偶|小丑|喇叭|小鼓|撲克牌|骰子/.test(s)) return 'toy';
    if (/acc|戒指|項鍊|王冠|寶石|胸針|耳環|腳環|飾品/.test(s)) return 'accessory';
    if (/shark|鯊|巨齒/.test(s)) return 'shark';
    if (/fish|魚|鯨|鰻|魟|鮟鱇/.test(s)) return 'fish';
    if (/trash|垃圾|塑膠|吸管/.test(s)) return 'trash';
    if (/pearl|珍珠/.test(s)) return 'pearl';
    return 'item';
  }
  function glyph(kind){
    return { bottle:'✉', mask:'◉', cloth:'◆', toy:'✦', accessory:'◇', shark:'≋', fish:'◒', trash:'×', pearl:'●', item:'◆' }[kind] || '◆';
  }
  function svgData(item){
    const id = item.iconId || item.id || item.name || 'item';
    const kind = kindOf(id, item.name || item.title, item.category || item.quality);
    const rarity = item.rarity || '普通';
    const [a,b,c] = palette[rarityClass[rarity] || 'normal'];
    const accent = seedColor(id);
    const letter = glyph(kind);
    const label = esc((item.name || item.title || id).slice(0, 2));
    const shine = rarityClass[rarity] === 'world' ? '<circle cx="18" cy="18" r="4" fill="#fff" opacity=".9"/><circle cx="78" cy="22" r="3" fill="#fff" opacity=".75"/><path d="M50 8l4 9 10 1-8 7 2 10-8-5-8 5 2-10-8-7 10-1z" fill="#fff" opacity=".85"/>' : '';
    const body = kind === 'bottle'
      ? `<path d="M41 18h22v16c0 8 13 15 13 32 0 21-15 31-24 31S28 87 28 66c0-17 13-24 13-32V18z" fill="${accent}" stroke="${b}" stroke-width="5"/><rect x="38" y="11" width="28" height="13" rx="4" fill="${a}" stroke="${b}" stroke-width="4"/><path d="M39 59h28v20H39z" fill="#fff4d8" opacity=".92" stroke="${b}" stroke-width="3"/>`
      : kind === 'mask'
      ? `<path d="M20 50c5-23 22-31 44-29s38 14 40 32c-8 20-23 30-42 30S29 73 20 50z" fill="${accent}" stroke="${b}" stroke-width="5"/><circle cx="45" cy="51" r="8" fill="${c}"/><circle cx="75" cy="51" r="8" fill="${c}"/><path d="M52 69c8 5 15 5 24 0" fill="none" stroke="#fff4d8" stroke-width="4" stroke-linecap="round"/>`
      : kind === 'fish' || kind === 'shark'
      ? `<path d="M23 64c18-29 50-30 74-7l16-13v40L97 72C72 94 40 91 23 64z" fill="${accent}" stroke="${b}" stroke-width="5"/><circle cx="82" cy="58" r="5" fill="${c}"/><path d="M35 52c-8-8-13-17-12-27 13 4 21 12 25 23" fill="${a}" stroke="${b}" stroke-width="4"/>`
      : kind === 'cloth'
      ? `<path d="M36 22l17 10 17-10 24 15-13 23-10-6v42H35V54l-10 6-13-23z" fill="${accent}" stroke="${b}" stroke-width="5"/><path d="M43 28c5 10 15 10 20 0" fill="none" stroke="#fff4d8" stroke-width="4"/>`
      : kind === 'toy'
      ? `<circle cx="64" cy="54" r="33" fill="${accent}" stroke="${b}" stroke-width="5"/><path d="M37 54h54M64 27v54" stroke="#fff4d8" stroke-width="5" opacity=".8"/><circle cx="64" cy="54" r="10" fill="${a}" stroke="${b}" stroke-width="3"/>`
      : kind === 'accessory' || kind === 'pearl'
      ? `<path d="M64 18l31 31-31 61-31-61z" fill="${accent}" stroke="${b}" stroke-width="5"/><path d="M33 49h62M49 19l15 30 15-30M49 49l15 61 15-61" stroke="#fff4d8" stroke-width="3" opacity=".65"/>`
      : `<rect x="26" y="25" width="76" height="76" rx="18" fill="${accent}" stroke="${b}" stroke-width="5"/><path d="M42 80l44-44M43 36l43 44" stroke="#fff4d8" stroke-width="7" stroke-linecap="round" opacity=".7"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><filter id="s"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000" flood-opacity=".35"/></filter></defs><rect width="128" height="128" rx="24" fill="${c}"/><circle cx="24" cy="22" r="38" fill="${a}" opacity=".2"/><circle cx="108" cy="106" r="46" fill="${accent}" opacity=".16"/>${shine}<g filter="url(#s)">${body}</g><text x="64" y="116" text-anchor="middle" font-size="16" font-weight="900" fill="#fff4d8" font-family="sans-serif">${label}</text><text x="16" y="24" font-size="18" fill="#fff4d8" font-weight="900">${letter}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
  function iconHtml(item, cls='cs-icon'){
    const src = svgData(item || {});
    const alt = esc((item && (item.name || item.title || item.id)) || 'icon');
    return `<img class="${cls}" src="${src}" alt="${alt}" loading="lazy">`;
  }
  function addStyle(){
    if(document.getElementById('coffeeShipIconStyle')) return;
    const s = document.createElement('style');
    s.id = 'coffeeShipIconStyle';
    s.textContent = `.cs-icon{width:38px;height:38px;border-radius:12px;vertical-align:middle;object-fit:cover;margin-right:8px;box-shadow:0 3px 0 rgba(0,0,0,.35)}.cs-icon-lg{width:72px;height:72px;border-radius:18px;display:block;margin:0 auto 8px;box-shadow:0 6px 0 rgba(0,0,0,.35)}.backpack-entry .cs-icon{width:44px;height:44px;float:left;margin:0 9px 6px 0}.central-fish-title .cs-icon,.carnival-title .cs-icon{width:54px;height:54px;display:inline-block}`;
    document.head.appendChild(s);
  }
  function enhanceExistingCards(){
    document.querySelectorAll('.backpack-entry').forEach(card => {
      if(card.dataset.csIconEnhanced) return;
      const strong = card.querySelector('strong');
      if(!strong) return;
      const text = strong.textContent.trim();
      const name = text.replace(/^[^\p{L}\p{N}]+/u,'').trim();
      strong.insertAdjacentHTML('afterbegin', iconHtml({ name, rarity: card.textContent.match(/稀有度：(世界級|神話|傳說|史詩|稀有|常見|普通)/)?.[1] || '普通' }));
      card.dataset.csIconEnhanced = '1';
    });
  }
  function normalizeDbIcons(){
    if(window.COFFEE_SHIP_DB){
      [...(window.COFFEE_SHIP_DB.carnivalLoot || []), ...(window.COFFEE_SHIP_DB.oceanLoot || [])].forEach(row => { if(row && !row.iconId) row.iconId = row[0]; });
    }
  }
  function init(){ addStyle(); normalizeDbIcons(); setInterval(enhanceExistingCards, 700); }
  window.COFFEE_SHIP_ICONS = { svgData, iconHtml, kindOf, addStyle, enhanceExistingCards };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();