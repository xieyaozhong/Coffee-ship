(() => {
  'use strict';
  if (window.__COFFEE_SHIP_ICON_POLISH_V3__) return;
  window.__COFFEE_SHIP_ICON_POLISH_V3__ = true;

  const rarityColor = {普通:'#f7f1dc',常見:'#75d982',稀有:'#62c8ff',史詩:'#c084fc',傳說:'#ffe16b',神話:'#ff6b8a',世界級:'#9fffee'};
  const rarityGem = {普通:'•',常見:'✦',稀有:'◆',史詩:'✷',傳說:'★',神話:'✹',世界級:'♛'};
  const palette = {
    fish:['#6ed6ff','#2272b8'],shark:['#9fd5ff','#2e5d97'],whale:['#8cf0ff','#2e7f8b'],squid:['#c8a3ff','#5a46b3'],octopus:['#f0a9cf','#9e4d79'],
    crab:['#ffb08e','#bb5747'],lobster:['#ff9ca0','#ab4356'],shrimp:['#ffbca8','#c96c54'],jelly:['#9ffff0','#44b8af'],shell:['#ffe1a8','#d2974b'],
    dragon:['#ffe98d','#a65bff'],treasure:['#ffe58d','#ca8c26'],bottle:['#9ce8f0','#3c8a9b'],trash:['#c6d0da','#5e6f7e'],relic:['#d7bb79','#6d5630'],
    coffee:['#f2c38f','#925c35'],merfolk:['#8fe4d0','#317a7c'],mask:['#cdb4ff','#7153c9'],toy:['#ffd48f','#d06b48'],clothes:['#ffc1da','#a75586'],accessory:['#fff0a1','#b7842c']
  };
  const badge = {fish:'◉',shark:'✦',whale:'◌',squid:'✧',octopus:'✹',crab:'◆',lobster:'❖',shrimp:'✶',jelly:'✿',shell:'◈',dragon:'☄',treasure:'✦',bottle:'✉',trash:'⊘',relic:'✚',coffee:'☕',merfolk:'♆',mask:'◍',toy:'✪',clothes:'✿',accessory:'❂'};
  const itemFamilies = new Set(['treasure','bottle','trash','relic','coffee','mask','toy','clothes','accessory']);

  function familyOf(value='') {
    const name = String(value);
    if (/鯊/.test(name)) return 'shark';
    if (/鯨/.test(name)) return 'whale';
    if (/章魚|克拉肯/.test(name)) return 'octopus';
    if (/魷魚|烏賊|小卷/.test(name)) return 'squid';
    if (/蟹/.test(name)) return 'crab';
    if (/龍蝦/.test(name)) return 'lobster';
    if (/蝦/.test(name)) return 'shrimp';
    if (/水母/.test(name)) return 'jelly';
    if (/海龜|龜|貝殼|海螺|珍珠|鸚鵡螺|菊石/.test(name)) return 'shell';
    if (/利維坦|海淵蛇皇|海蛇|皇帶魚|鰻/.test(name)) return 'dragon';
    if (/美人魚|人魚/.test(name)) return 'merfolk';
    if (/咖啡|拿鐵/.test(name)) return 'coffee';
    if (/漂流瓶|瓶中信|letter|bottle/.test(name)) return 'bottle';
    if (/塑膠|垃圾|瓶蓋|吸管|trash/.test(name)) return 'trash';
    if (/寶箱|珍寶|收藏|藏寶|金幣|古幣|銀幣|硬幣/.test(name)) return 'treasure';
    if (/古代|化石|遺物|神父|殘頁|羅盤|懷錶|沙漏|小提琴|古鑰匙|日記|手札|筆記|地圖|海圖|星圖|船錨|錨/.test(name)) return 'relic';
    if (/面具/.test(name)) return 'mask';
    if (/氣球|悠悠球|風箏|木馬|玩偶|骰子|撲克|顏料|門票|票券/.test(name)) return 'toy';
    if (/內衣|襪|襯衫|燕尾服|晚禮服|洋裝|披風|手套|圍巾|帽|高跟鞋|長靴|皮鞋|絲帶/.test(name)) return 'clothes';
    if (/戒指|項鍊|王冠|皇冠|寶石|羽毛|徽章|勳章|胸針|耳環|腳環|銀鈴|水晶|香水|香氛/.test(name)) return 'accessory';
    return 'fish';
  }

  function rarityOf(icon) {
    return icon.dataset.rarity || icon.closest('.central-fish-card,.fishing-card,.mutant-card,.backpack-entry,.fish-entry,.fh-card,.fh-dex-row')?.textContent?.match(/稀有度：\s*(世界級|神話|傳說|史詩|稀有|常見|普通)/)?.[1] || '';
  }

  function enhanceIcon(icon) {
    const context = `${icon.dataset.iconKey || ''} ${icon.parentElement?.textContent || ''}`;
    const family = familyOf(context);
    const rarity = rarityOf(icon);
    const colors = palette[family] || palette.fish;
    icon.dataset.family = family;
    icon.dataset.rarity = rarity;
    icon.dataset.item = itemFamilies.has(family) ? 'true' : 'false';
    icon.style.setProperty('--icon-accent', colors[0]);
    icon.style.setProperty('--icon-deep', colors[1]);
    icon.style.setProperty('--icon-color', rarityColor[rarity] || colors[0]);
    icon.style.setProperty('--icon-frame', rarityColor[rarity] || '#ffffff22');
    const badgeNode = icon.querySelector('.cs-species-badge');
    if (badgeNode) badgeNode.textContent = badge[family] || '◉';
    let gem = icon.querySelector('.cs-species-rarity-gem');
    if (!gem) {
      gem = document.createElement('span');
      gem.className = 'cs-species-rarity-gem';
      icon.appendChild(gem);
    }
    gem.textContent = rarityGem[rarity] || '•';
  }

  function enhanceAll(root=document) {
    root.querySelectorAll?.('.cs-species-icon').forEach(enhanceIcon);
  }

  function patchGlobal() {
    const api = window.COFFEE_SHIP_ICON;
    if (!api || api.__polishV3) return;
    const originalDescriptor = api.iconDescriptor?.bind(api);
    const originalHtml = api.iconHtml?.bind(api);
    if (originalDescriptor) api.iconDescriptor = item => {
      const d = originalDescriptor(item);
      const family = familyOf(`${item?.id || ''} ${item?.name || ''} ${item?.title || ''} ${item?.kind || ''}`);
      const colors = palette[family] || palette.fish;
      return {...d,family,isItem:itemFamilies.has(family),accent:colors[0],deep:colors[1],color:rarityColor[item?.rarity] || d.color || colors[0]};
    };
    if (originalHtml) api.iconHtml = (item,className='') => {
      const d = api.iconDescriptor(item);
      const temp = document.createElement('div');
      temp.innerHTML = originalHtml(item,className);
      const icon = temp.firstElementChild;
      if (!icon) return originalHtml(item,className);
      icon.dataset.family = d.family || 'fish';
      icon.dataset.rarity = item?.rarity || d.rarity || '';
      icon.dataset.item = d.isItem ? 'true' : 'false';
      icon.style.setProperty('--icon-accent', d.accent);
      icon.style.setProperty('--icon-deep', d.deep);
      icon.style.setProperty('--icon-color', d.color);
      const badgeNode = icon.querySelector('.cs-species-badge');
      if (badgeNode) badgeNode.textContent = badge[d.family] || badgeNode.textContent;
      const gem = document.createElement('span');
      gem.className = 'cs-species-rarity-gem';
      gem.textContent = rarityGem[item?.rarity || d.rarity] || '•';
      icon.appendChild(gem);
      return icon.outerHTML;
    };
    api.familyOf = familyOf;
    api.__polishV3 = true;
    if (window.COFFEE_SHIP_EMOJI) {
      window.COFFEE_SHIP_EMOJI.iconDescriptor = api.iconDescriptor;
      window.COFFEE_SHIP_EMOJI.iconHtml = api.iconHtml;
      window.COFFEE_SHIP_EMOJI.familyOf = familyOf;
    }
  }

  function addStyle() {
    if (document.getElementById('fishItemIconPolishV3')) return;
    const style = document.createElement('style');
    style.id = 'fishItemIconPolishV3';
    style.textContent = `
      .cs-species-icon{width:1.96em;height:1.96em;border:2px solid color-mix(in srgb,var(--icon-color) 64%,white 36%);outline:1px solid color-mix(in srgb,var(--icon-frame) 55%,transparent);outline-offset:1px;background:radial-gradient(circle at 28% 22%,rgba(255,255,255,.52),transparent 24%),radial-gradient(circle at 72% 78%,rgba(255,255,255,.10),transparent 30%),linear-gradient(160deg,var(--icon-accent),var(--icon-deep));box-shadow:0 4px 0 rgba(0,0,0,.30),0 0 0 1px rgba(255,255,255,.06) inset,0 0 14px color-mix(in srgb,var(--icon-color) 42%,transparent);transition:transform .16s ease,filter .16s ease}
      .cs-species-icon::before{content:'';position:absolute;inset:.12em;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.11),transparent 52%);pointer-events:none}
      .cs-species-icon::after{content:'';position:absolute;width:.40em;height:.40em;top:.10em;left:.16em;border-radius:50%;background:rgba(255,255,255,.38);box-shadow:0 0 8px rgba(255,255,255,.18)}
      .cs-species-icon[data-item="true"]{border-radius:.58em}
      .cs-species-icon[data-family="shell"]{border-radius:42% 58% 46% 54%/46% 42% 58% 54%}
      .cs-species-icon[data-family="jelly"],.cs-species-icon[data-family="octopus"],.cs-species-icon[data-family="squid"]{border-radius:46% 46% 56% 56%/42% 42% 58% 58%}
      .cs-species-icon[data-family="shark"],.cs-species-icon[data-family="whale"],.cs-species-icon[data-family="dragon"]{border-radius:58% 42% 50% 50%/44% 44% 56% 56%}
      .cs-species-rarity-gem{position:absolute;left:-.22em;top:-.24em;display:grid;place-items:center;width:.98em;height:.98em;border-radius:999px;background:linear-gradient(180deg,#20162b,#0f0c16);border:1px solid color-mix(in srgb,var(--icon-color) 70%,white 30%);color:var(--icon-color);font-size:.48em;line-height:1;box-shadow:0 2px 0 rgba(0,0,0,.34),0 0 8px color-mix(in srgb,var(--icon-color) 35%,transparent);transform:rotate(calc(var(--icon-rotate) * -1));z-index:2}
      .cs-species-icon[data-rarity="稀有"],.cs-species-icon[data-rarity="史詩"],.cs-species-icon[data-rarity="傳說"],.cs-species-icon[data-rarity="神話"],.cs-species-icon[data-rarity="世界級"]{box-shadow:0 4px 0 rgba(0,0,0,.30),0 0 0 1px rgba(255,255,255,.06) inset,0 0 18px color-mix(in srgb,var(--icon-color) 58%,transparent),0 0 30px color-mix(in srgb,var(--icon-color) 24%,transparent)}
      .fh-card:hover .cs-species-icon,.fh-dex-row:hover .cs-species-icon,.backpack-entry:hover .cs-species-icon,.fish-entry:hover .cs-species-icon{transform:translateY(-2px) rotate(var(--icon-rotate));filter:brightness(1.08)}
      @supports not (color:color-mix(in srgb,red,blue)){.cs-species-icon{border-color:var(--icon-color);outline-color:var(--icon-color)}.cs-species-rarity-gem{border-color:var(--icon-color)}}
    `;
    document.head.appendChild(style);
  }

  function init() {
    addStyle();
    patchGlobal();
    enhanceAll();
    const observer = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType !== 1) return;
      if (node.matches?.('.cs-species-icon')) enhanceIcon(node);
      enhanceAll(node);
    })));
    observer.observe(document.body,{subtree:true,childList:true});
    setInterval(() => { patchGlobal(); enhanceAll(); }, 2200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
