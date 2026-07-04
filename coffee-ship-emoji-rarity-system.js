(() => {
  'use strict';

  const rarityColor = {
    '普通':'#f7f1dc', '常見':'#75d982', '稀有':'#62c8ff', '史詩':'#c084fc',
    '傳說':'#ffe16b', '神話':'#ff6b8a', '世界級':'#9fffee'
  };
  const rarityShadow = {
    '稀有':'0 0 8px rgba(98,200,255,.55)', '史詩':'0 0 10px rgba(192,132,252,.65)',
    '傳說':'0 0 12px rgba(255,225,107,.75)', '神話':'0 0 14px rgba(255,107,138,.85)',
    '世界級':'0 0 16px rgba(159,255,238,.95)'
  };

  const uniqueEmoji = {
    joke:'😂', lanar:'🌊', ariel:'🧜‍♀️', island:'🏝️', blackbeard:'🏴‍☠️', mad_priest:'📜', priest:'📜', carnival:'🎭', turtle_soup:'🍲',
    mask_fox:'🦊', mask_wolf:'🐺', mask_lion:'🦁', mask_tiger:'🐯', mask_bear:'🐻', mask_owl:'🦉', mask_deer:'🦌', mask_goat:'🐐', mask_boar:'🐗', mask_snake:'🐍',
    cloth_underwear_top:'👙', cloth_underwear_bottom:'🩲', cloth_socks:'🧦', cloth_shirt:'👕', cloth_tailcoat:'👔', cloth_gown:'👗', cloth_cape:'🧥', cloth_gloves:'🧤', cloth_scarf:'🧣', cloth_hat:'👒', cloth_top_hat:'🎩', cloth_heels:'👠', cloth_boots:'👢', cloth_shoes:'👞', cloth_ribbon:'🎀',
    toy_balloon:'🎈', toy_yoyo:'🪀', toy_kite:'🪁', toy_horse:'🎠', toy_doll:'🪆', toy_nose:'🤡', toy_trumpet:'🎺', toy_drum:'🥁', toy_paint:'🎨', toy_cards:'🃏', toy_dice:'🎲', toy_bear:'🧸', toy_pinata:'🪅', toy_maracas:'🪇', toy_circus:'🎪',
    acc_ring:'💍', acc_necklace:'📿', acc_crown:'👑', acc_gem:'💎', acc_feather:'🪶', acc_badge:'🏵️', acc_medal:'🏅', acc_brooch:'💠', acc_earring:'✨', acc_bell:'🔔',
    turtle_shell:'🐢', turtle_straw:'🥤', walrus_tusk:'🦷', scalpel:'🔪', rust_tool:'🔧', human_skin:'🧩', drifter_relic:'🧩', pearl:'🦪', bottle:'🍾', trash:'🗑️', treasure:'💰', item:'📦'
  };

  const exactRules = [
    [/克蘇魯之眼|百眼鮟鱇/, '👁️'], [/雙頭巨齒鯊|深淵吞噬者|鯨鯊|鯊/, '🦈'],
    [/利維坦|海淵蛇皇|海蛇|皇帶魚|鰻/, '🐉'], [/腐化藍鯨|虛空鯨|咖啡鯨|鯨/, '🐋'],
    [/深淵裂口章魚|章魚|克拉肯/, '🐙'], [/黑洞烏賊|魷魚|烏賊|小卷/, '🦑'],
    [/水晶帝王蟹|帝王蟹|寄居蟹|海蜘蛛|蟹/, '🦀'], [/熔岩龍蝦|龍蝦/, '🦞'], [/蝦/, '🦐'],
    [/血月水母王|水母/, '🪼'], [/鮟鱇|安康|河豚/, '🐡'], [/魟/, '🪽'],
    [/海龜|龜殼|浮島龜/, '🐢'], [/鸚鵡螺|菊石|貝殼|海螺|珍珠/, '🐚'],
    [/美人魚|人魚/, '🧜‍♀️'], [/骷髏|化石|古代|三葉蟲|鄧氏/, '🦴'],
    [/咖啡|拿鐵/, '☕'], [/星|銀河|宇宙|月光|月影|星空/, '🌌'], [/風暴|雷|閃電/, '⚡'], [/冰|霜|雪/, '❄️'], [/火|熔岩|紅寶石/, '🔥'],
    [/冷笑話/, '😂'], [/拉納爾/, '🌊'], [/愛麗兒/, '🧜‍♀️'], [/哈斯|可可|莫納|孤島/, '🏝️'], [/黑鬍子|藏寶圖/, '🏴‍☠️'], [/瘋狂神父|神父|殘頁/, '📜'], [/狂歡島漂流瓶/, '🎭'], [/海龜湯/, '🍲'],
    [/狐狸面具/, '🦊'], [/狼面具/, '🐺'], [/獅子面具/, '🦁'], [/老虎面具/, '🐯'], [/熊面具/, '🐻'], [/貓頭鷹面具/, '🦉'], [/鹿角面具/, '🦌'], [/山羊面具/, '🐐'], [/野豬面具/, '🐗'], [/蛇神面具/, '🐍'], [/面具/, '🎭'],
    [/內衣/, '👙'], [/內褲|短褲/, '🩲'], [/襪/, '🧦'], [/襯衫/, '👕'], [/燕尾服/, '👔'], [/晚禮服|洋裝|禮服/, '👗'], [/披風/, '🧥'], [/手套/, '🧤'], [/圍巾/, '🧣'], [/高帽|禮帽/, '🎩'], [/帽/, '👒'], [/高跟鞋/, '👠'], [/長靴/, '👢'], [/皮鞋/, '👞'], [/絲帶|緞帶/, '🎀'],
    [/氣球/, '🎈'], [/悠悠球/, '🪀'], [/風箏/, '🪁'], [/木馬|音樂盒/, '🎠'], [/人偶|布偶|玩偶/, '🪆'], [/小丑鼻子/, '🤡'], [/喇叭/, '🎺'], [/小鼓/, '🥁'], [/顏料/, '🎨'], [/撲克|牌/, '🃏'], [/骰子/, '🎲'], [/玩偶熊/, '🧸'],
    [/戒指/, '💍'], [/項鍊/, '📿'], [/王冠|皇冠/, '👑'], [/寶石/, '💎'], [/羽毛/, '🪶'], [/徽章/, '🏵️'], [/勳章/, '🏅'], [/胸針/, '💠'], [/耳環/, '✨'], [/腳環|銀鈴/, '🔔'],
    [/手術刀/, '🔪'], [/工具/, '🔧'], [/羅盤/, '🧭'], [/懷錶|沙漏/, '⌛'], [/小提琴/, '🎻'], [/心臟/, '🫀'],
    [/塑膠|垃圾|瓶蓋|吸管/, '🗑️'], [/漂流瓶|瓶中信|古老瓶中信|星海瓶中信/, '🍾'], [/沉船|船錨/, '⚓']
  ];

  const fishBasePool = ['🐟','🐠','🐡'];
  const sigilPool = ['✦','◆','●','▲','☾','⚡','✧','✚','♢','★','☄','◎','◈','♜','♠','♣','❖','◇','◉','✺','⬟','⬢','◐','◒'];

  function hashOf(value) {
    let h = 2166136261;
    for (const char of String(value || 'item')) {
      h ^= char.codePointAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function firstEmoji(text) {
    const s = String(text || '').trim();
    const match = s.match(/^(?:\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/u);
    return match ? match[0] : '';
  }

  function cleanEmoji(text) {
    return String(text || '').replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '').trim();
  }

  function keyOf(item) {
    const raw = item?.id || item?.v2id || item?.iconId || item?.series || item?.name || item?.title || 'item';
    return String(raw).replace(/\s+/g, '_');
  }

  function baseEmojiFor(item) {
    const name = `${item?.id || ''} ${item?.name || ''} ${item?.title || ''} ${item?.series || ''} ${item?.kind || ''}`;
    const key = keyOf(item);
    if (uniqueEmoji[key]) return uniqueEmoji[key];
    const rule = exactRules.find(([pattern]) => pattern.test(name));
    if (rule) return rule[1];
    const existing = firstEmoji(item?.icon || item?.emoji || '');
    if (existing) return existing;
    if (/letter|bottle/.test(item?.kind || '')) return '🍾';
    if (/trash/.test(item?.kind || '')) return '🗑️';
    if (/treasure/.test(item?.kind || '')) return '📦';
    return fishBasePool[hashOf(key) % fishBasePool.length];
  }

  function iconDescriptor(item) {
    const key = keyOf(item);
    const hash = hashOf(key);
    const rarity = item?.rarity || '';
    return {
      key,
      base:baseEmojiFor(item),
      badge:sigilPool[(hash >>> 4) % sigilPool.length],
      hue:hash % 360,
      rotate:(hash % 13) - 6,
      rarity,
      color:rarityColor[rarity] || `hsl(${hash % 360} 82% 70%)`
    };
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }

  function iconHtml(item, className='') {
    const icon = iconDescriptor(item);
    return `<span class="cs-species-icon ${className}" data-icon-key="${escapeHtml(icon.key)}" style="--icon-hue:${icon.hue};--icon-color:${icon.color};--icon-rotate:${icon.rotate}deg"><span class="cs-species-base">${icon.base}</span><span class="cs-species-badge">${icon.badge}</span></span>`;
  }

  function emojiFor(item) {
    return iconDescriptor(item).base;
  }

  function applyDbEmoji() {
    const db = window.COFFEE_SHIP_DB;
    if (!db) return;
    const patchRow = row => {
      if (!Array.isArray(row)) return;
      const item = {id:row[0], name:row[2], series:row[2], icon:row[1], rarity:row[3]};
      row[1] = emojiFor(item);
    };
    (db.carnivalLoot || []).forEach(patchRow);
    (db.oceanLoot || []).forEach(patchRow);
    (db.bottles || []).forEach(patchRow);
  }

  function normalizeBagEmoji() {
    const raw = localStorage.getItem('coffeeShipFishBag');
    if (!raw) return;
    let bag;
    try { bag = JSON.parse(raw); } catch (error) { return; }
    if (!Array.isArray(bag)) return;
    let changed = false;
    const next = bag.map(item => {
      if (!item || typeof item !== 'object') return item;
      const cleanName = cleanEmoji(item.name || '');
      const normalized = {...item, name:cleanName || item.name};
      const icon = iconDescriptor(normalized);
      if (item.icon !== icon.base || item.emoji !== icon.base || item.iconKey !== icon.key || item.iconBadge !== icon.badge || item.iconHue !== icon.hue || item.name !== normalized.name) {
        changed = true;
        return {...normalized, icon:icon.base, emoji:icon.base, iconKey:icon.key, iconBadge:icon.badge, iconHue:icon.hue};
      }
      return item;
    });
    if (changed) localStorage.setItem('coffeeShipFishBag', JSON.stringify(next.slice(-220)));
  }

  function addStyle() {
    let style = document.getElementById('emojiRarityStyle');
    if (!style) {
      style = document.createElement('style');
      style.id = 'emojiRarityStyle';
      document.head.appendChild(style);
    }
    style.textContent = `
      .cs-icon{display:none!important}
      .rarity-text{font-weight:1000}
      .rarity-normal{color:${rarityColor['普通']}}
      .rarity-common{color:${rarityColor['常見']}}
      .rarity-rare{color:${rarityColor['稀有']};text-shadow:${rarityShadow['稀有']}}
      .rarity-epic{color:${rarityColor['史詩']};text-shadow:${rarityShadow['史詩']}}
      .rarity-legend{color:${rarityColor['傳說']};text-shadow:${rarityShadow['傳說']}}
      .rarity-myth{color:${rarityColor['神話']};text-shadow:${rarityShadow['神話']}}
      .rarity-world{color:${rarityColor['世界級']};text-shadow:${rarityShadow['世界級']}}
      .unique-emoji{display:inline-flex;vertical-align:middle;margin-right:.3em}
      .cs-species-icon{
        position:relative;
        display:inline-grid;
        place-items:center;
        width:1.75em;
        height:1.75em;
        flex:0 0 auto;
        margin-right:.38em;
        border:2px solid color-mix(in srgb,var(--icon-color) 72%,white 28%);
        border-radius:999px;
        background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.42),transparent 34%),linear-gradient(145deg,hsl(var(--icon-hue) 68% 42%),hsl(calc(var(--icon-hue) + 42) 74% 22%));
        box-shadow:0 3px 0 rgba(0,0,0,.32),0 0 12px color-mix(in srgb,var(--icon-color) 38%,transparent);
        transform:rotate(var(--icon-rotate));
        vertical-align:middle;
        isolation:isolate;
      }
      .cs-species-base{font-size:1.05em;line-height:1;filter:drop-shadow(0 1px 0 rgba(0,0,0,.45));transform:rotate(calc(var(--icon-rotate) * -1))}
      .cs-species-badge{
        position:absolute;
        right:-.28em;
        bottom:-.25em;
        display:grid;
        place-items:center;
        min-width:.9em;
        height:.9em;
        padding:0 .08em;
        border:1px solid #fff4d8;
        border-radius:999px;
        background:#151020;
        color:var(--icon-color);
        font-size:.48em;
        line-height:1;
        box-shadow:0 2px 0 rgba(0,0,0,.38);
        transform:rotate(calc(var(--icon-rotate) * -1));
      }
      .backpack-entry strong,.fish-entry strong{display:flex;align-items:center;gap:.1em;font-size:15px}
      .backpack-entry strong .cs-species-icon,.fish-entry strong .cs-species-icon{font-size:22px}
      .central-fish-title,.carnival-title,.mutant-name,.fishing-card>div:first-child{display:flex;align-items:center;justify-content:center;gap:.12em}
      .central-fish-title .cs-species-icon,.carnival-title .cs-species-icon,.mutant-name .cs-species-icon,.fishing-card>div:first-child .cs-species-icon{font-size:28px}
      @supports not (color:color-mix(in srgb,red,blue)){
        .cs-species-icon{border-color:var(--icon-color);box-shadow:0 3px 0 rgba(0,0,0,.32)}
      }
    `;
  }

  function rarityClass(rarity) {
    return {'普通':'normal','常見':'common','稀有':'rare','史詩':'epic','傳說':'legend','神話':'myth','世界級':'world'}[rarity] || 'normal';
  }

  function enhanceTextNode(element) {
    if (!element) return;
    let html = element.innerHTML;
    const text = element.textContent || '';
    const rarity = text.match(/稀有度：\s*(世界級|神話|傳說|史詩|稀有|常見|普通)/)?.[1];
    if (rarity && !html.includes('rarity-text')) {
      html = html.replace(new RegExp(`稀有度：\\s*${rarity}`), `稀有度：<span class="rarity-text rarity-${rarityClass(rarity)}">${rarity}</span>`);
      element.innerHTML = html;
    }
  }

  function rawTitle(element) {
    const clone = element.cloneNode(true);
    clone.querySelectorAll('.cs-species-icon,.unique-emoji').forEach(node => node.remove());
    return cleanEmoji(clone.textContent || '');
  }

  function decorateTitle(element) {
    if (!element) return;
    const raw = rawTitle(element);
    if (!raw) return;
    const rarity = element.closest('.central-fish-card,.fishing-card,.mutant-card,.backpack-entry,.fish-entry')?.textContent?.match(/稀有度：\s*(世界級|神話|傳說|史詩|稀有|常見|普通)/)?.[1] || '';
    const descriptor = iconDescriptor({name:raw, rarity});
    if (element.dataset.csIconKey === descriptor.key && element.querySelector('.cs-species-icon')) return;
    element.textContent = raw;
    element.insertAdjacentHTML('afterbegin', iconHtml({name:raw, rarity}));
    element.dataset.csIconKey = descriptor.key;
  }

  function enhanceCards(root=document) {
    root.querySelectorAll?.('.backpack-entry strong,.fish-entry strong,.central-fish-title,.carnival-title,.mutant-name,.fishing-card>div:first-child,#fishingSpecialCard>div:first-child,#extraFish50Card>div:first-child,#sharkCard>div:first-child').forEach(decorateTitle);
    root.querySelectorAll?.('.backpack-entry small,.fish-entry small,.central-fish-detail,.carnival-text,.mutant-card,.fishing-card').forEach(enhanceTextNode);
  }

  function init() {
    addStyle();
    applyDbEmoji();
    normalizeBagEmoji();
    enhanceCards();
    const observer = new MutationObserver(records => {
      for (const record of records) {
        const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
        if (target) enhanceCards(target.closest?.('#gamePanel') || target);
      }
    });
    observer.observe(document.body, {subtree:true, childList:true, characterData:true});
    setInterval(() => { applyDbEmoji(); normalizeBagEmoji(); enhanceCards(); }, 2400);
  }

  window.COFFEE_SHIP_ICON = { iconDescriptor, iconHtml, emojiFor, cleanEmoji, rarityColor, rarityShadow, hashOf };
  window.COFFEE_SHIP_EMOJI = { uniqueEmoji, emojiFor, iconDescriptor, iconHtml, cleanEmoji, rarityColor, enhanceCards, normalizeBagEmoji };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();