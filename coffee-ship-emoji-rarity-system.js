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
    // 漂流瓶系列：恢復原本辨識 Emoji，每個系列一個
    joke:'😂', lanar:'🌊', ariel:'🧜‍♀️', island:'🏝️', blackbeard:'🏴‍☠️', mad_priest:'📜', carnival:'🎭', turtle_soup:'🍲',
    // 狂歡面具
    mask_fox:'🦊', mask_wolf:'🐺', mask_lion:'🦁', mask_tiger:'🐯', mask_bear:'🐻', mask_owl:'🦉', mask_deer:'🦌', mask_goat:'🐐', mask_boar:'🐗', mask_snake:'🐍',
    // 衣物
    cloth_underwear_top:'👙', cloth_underwear_bottom:'🩲', cloth_socks:'🧦', cloth_shirt:'👕', cloth_tailcoat:'👔', cloth_gown:'👗', cloth_cape:'🧥', cloth_gloves:'🧤', cloth_scarf:'🧣', cloth_hat:'👒', cloth_top_hat:'🎩', cloth_heels:'👠', cloth_boots:'👢', cloth_shoes:'👞', cloth_ribbon:'🎀',
    cloth_party:'👙', cloth_shorts:'🩲',
    // 玩具
    toy_balloon:'🎈', toy_yoyo:'🪀', toy_kite:'🪁', toy_horse:'🎠', toy_doll:'🪆', toy_nose:'🤡', toy_trumpet:'🎺', toy_drum:'🥁', toy_paint:'🎨', toy_cards:'🃏', toy_dice:'🎲', toy_bear:'🧸', toy_pinata:'🪅', toy_maracas:'🪇', toy_circus:'🎪',
    // 飾品與寶物
    acc_ring:'💍', acc_necklace:'📿', acc_crown:'👑', acc_gem:'💎', acc_feather:'🪶', acc_badge:'🏵️', acc_medal:'🏅', acc_brooch:'💠', acc_earring:'✨', acc_bell:'🔔',
    treasure_crown:'👑', treasure_gem:'💎',
    // 海洋朋友與特殊物品：恢復原本高辨識 Emoji
    turtle_shell:'🐢', turtle_straw:'🥤', walrus_tusk:'🦷', walrus_relic:'🦷', scalpel:'🔪', rust_tool:'🔪', human_skin:'🧩', drifter_relic:'🧩',
    pearl:'🦪', fish:'🐟', shark:'🦈', trash:'🗑️', treasure:'💰', bottle:'🍾', item:'📦'
  };

  const originalRules = [
    // 漂流瓶
    [/冷笑話/, '😂'], [/拉納爾/, '🌊'], [/愛麗兒|美人魚漂流瓶/, '🧜‍♀️'], [/哈斯|可可|莫納|孤島三角戀|孤島/, '🏝️'], [/黑鬍子|藏寶圖/, '🏴‍☠️'], [/瘋狂神父|神父|殘頁/, '📜'], [/狂歡島漂流瓶/, '🎭'], [/海龜湯/, '🍲'],
    // 面具
    [/狐狸面具/, '🦊'], [/狼面具/, '🐺'], [/獅子面具/, '🦁'], [/老虎面具/, '🐯'], [/熊面具/, '🐻'], [/貓頭鷹面具/, '🦉'], [/鹿角面具/, '🦌'], [/山羊面具/, '🐐'], [/野豬面具/, '🐗'], [/蛇神面具/, '🐍'], [/面具/, '🎭'],
    // 衣物
    [/內衣/, '👙'], [/內褲|短褲/, '🩲'], [/襪/, '🧦'], [/襯衫/, '👕'], [/燕尾服/, '👔'], [/晚禮服|洋裝|禮服/, '👗'], [/披風/, '🧥'], [/手套/, '🧤'], [/圍巾/, '🧣'], [/羽毛帽|帽/, '👒'], [/高帽|禮帽/, '🎩'], [/高跟鞋/, '👠'], [/長靴/, '👢'], [/皮鞋/, '👞'], [/絲帶|緞帶/, '🎀'],
    // 玩具
    [/氣球/, '🎈'], [/悠悠球/, '🪀'], [/風箏/, '🪁'], [/木馬|音樂盒/, '🎠'], [/人偶|布偶|玩偶/, '🪆'], [/小丑鼻子/, '🤡'], [/喇叭/, '🎺'], [/小鼓/, '🥁'], [/顏料/, '🎨'], [/撲克|牌/, '🃏'], [/骰子/, '🎲'], [/玩偶熊/, '🧸'], [/彩罐/, '🪅'], [/沙鈴/, '🪇'], [/雜耍球/, '🎪'],
    // 飾品與寶藏
    [/戒指/, '💍'], [/項鍊/, '📿'], [/王冠|皇冠/, '👑'], [/寶石/, '💎'], [/羽毛飾品/, '🪶'], [/徽章/, '🏵️'], [/勳章/, '🏅'], [/胸針/, '💠'], [/耳環/, '✨'], [/腳環|銀鈴/, '🔔'],
    // 海洋朋友與垃圾
    [/龜殼|海龜/, '🐢'], [/吸管/, '🥤'], [/海象牙|海象角|海象/, '🦷'], [/手術刀|生鏽工具|醫療器具/, '🔪'], [/人皮|漂流者|遺物|皮革/, '🧩'], [/珍珠/, '🦪'], [/鯊/, '🦈'], [/魚|鯨|鰻|魟|鮟鱇/, '🐟'], [/垃圾|塑膠|瓶蓋/, '🗑️'], [/瓶|漂流瓶/, '🍾']
  ];

  const autoEmojiPool = ['🪙','🗝️','🧭','🧿','🪬','⚱️','🏺','🪞','🕯️','📯','🧺','🪵','🪨','🪷','🌙','⭐','☄️','🌈','🔥','❄️','⚡','🫧','🪸','🐚','🦀','🦞','🦐','🦑','🐙','🐋','🐡','🐠','🐬','🦦','🐾','🪽','🛟','⚓','⛵','🚢','🧪','🧫','🔮','🪄','📘','📕','📗','📙','🧾','💌'];

  function firstEmoji(text) {
    const s = String(text || '').trim();
    const m = s.match(/^(?:\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/u);
    return m ? m[0] : '';
  }
  function cleanEmoji(text) { return String(text || '').replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '').trim(); }
  function keyOf(item) {
    const raw = item?.id || item?.v2id || item?.iconId || item?.series || item?.name || item?.title || 'item';
    return String(raw).replace(/\s+/g, '_');
  }
  function emojiFor(item) {
    const existing = firstEmoji(item?.icon || item?.emoji || '');
    const name = item?.name || item?.title || item?.series || '';
    const key = keyOf(item);
    const rule = originalRules.find(([re]) => re.test(`${key} ${name}`));
    if (rule) return rule[1];
    if (uniqueEmoji[key]) return uniqueEmoji[key];
    if (existing) return existing;
    let h = 0; String(key).split('').forEach(ch => h = (h * 31 + ch.charCodeAt(0)) >>> 0);
    return autoEmojiPool[h % autoEmojiPool.length];
  }
  function applyDbEmoji() {
    if (!window.COFFEE_SHIP_DB) return;
    const db = window.COFFEE_SHIP_DB;
    const patchRow = row => { if (Array.isArray(row)) row[1] = emojiFor({ id:row[0], name:row[2], series:row[2], icon:row[1] }); };
    (db.carnivalLoot || []).forEach(patchRow);
    (db.oceanLoot || []).forEach(patchRow);
    (db.bottles || []).forEach(patchRow);
  }
  function normalizeBagEmoji() {
    const raw = localStorage.getItem('coffeeShipFishBag');
    if (!raw) return;
    let bag;
    try { bag = JSON.parse(raw); } catch(e) { return; }
    if (!Array.isArray(bag)) return;
    let changed = false;
    const next = bag.map(item => {
      if (!item || typeof item !== 'object') return item;
      const one = emojiFor(item);
      const cleanName = cleanEmoji(item.name || '');
      if (item.icon !== one || item.emoji !== one || item.name !== cleanName) {
        changed = true;
        return { ...item, icon:one, emoji:one, name:cleanName || item.name };
      }
      return item;
    });
    if (changed) localStorage.setItem('coffeeShipFishBag', JSON.stringify(next.slice(-220)));
  }
  function addStyle() {
    if (document.getElementById('emojiRarityStyle')) return;
    const s = document.createElement('style');
    s.id = 'emojiRarityStyle';
    s.textContent = `
      .cs-icon{display:none!important}.rarity-text{font-weight:1000}.rarity-normal{color:${rarityColor['普通']}}.rarity-common{color:${rarityColor['常見']}}.rarity-rare{color:${rarityColor['稀有']};text-shadow:${rarityShadow['稀有']}}.rarity-epic{color:${rarityColor['史詩']};text-shadow:${rarityShadow['史詩']}}.rarity-legend{color:${rarityColor['傳說']};text-shadow:${rarityShadow['傳說']}}.rarity-myth{color:${rarityColor['神話']};text-shadow:${rarityShadow['神話']}}.rarity-world{color:${rarityColor['世界級']};text-shadow:${rarityShadow['世界級']}}
      .unique-emoji{display:inline-block;width:1.5em;text-align:center;margin-right:.25em;filter:drop-shadow(0 2px 0 rgba(0,0,0,.35))}.backpack-entry strong{font-size:15px}.backpack-entry strong .unique-emoji{font-size:22px;vertical-align:middle}.central-fish-title .unique-emoji,.carnival-title .unique-emoji{font-size:28px;vertical-align:middle}
    `;
    document.head.appendChild(s);
  }
  function rarityClass(r) { return {'普通':'normal','常見':'common','稀有':'rare','史詩':'epic','傳說':'legend','神話':'myth','世界級':'world'}[r] || 'normal'; }
  function enhanceTextNode(el) {
    if (!el || el.dataset.emojiRarityDone) return;
    let html = el.innerHTML;
    const text = el.textContent || '';
    const rarity = text.match(/稀有度：\s*(世界級|神話|傳說|史詩|稀有|常見|普通)/)?.[1];
    if (rarity && !html.includes('rarity-text')) {
      html = html.replace(`稀有度：${rarity}`, `稀有度：<span class="rarity-text rarity-${rarityClass(rarity)}">${rarity}</span>`);
      html = html.replace(`稀有度： ${rarity}`, `稀有度：<span class="rarity-text rarity-${rarityClass(rarity)}">${rarity}</span>`);
    }
    el.innerHTML = html;
    el.dataset.emojiRarityDone = '1';
  }
  function enhanceCards() {
    document.querySelectorAll('.backpack-entry').forEach(card => {
      const strong = card.querySelector('strong');
      if (strong && !strong.dataset.uniqueEmojiDone) {
        const raw = cleanEmoji(strong.textContent);
        strong.textContent = raw;
        strong.insertAdjacentHTML('afterbegin', `<span class="unique-emoji">${emojiFor({ name:raw })}</span>`);
        strong.dataset.uniqueEmojiDone = '1';
      }
      card.querySelectorAll('small').forEach(enhanceTextNode);
    });
    document.querySelectorAll('.central-fish-title,.carnival-title').forEach(title => {
      if (title.dataset.uniqueEmojiDone) return;
      const raw = cleanEmoji(title.textContent);
      title.textContent = raw;
      title.insertAdjacentHTML('afterbegin', `<span class="unique-emoji">${emojiFor({ name:raw })}</span>`);
      title.dataset.uniqueEmojiDone = '1';
    });
    document.querySelectorAll('.central-fish-detail,.carnival-text').forEach(enhanceTextNode);
  }
  function init() { addStyle(); applyDbEmoji(); normalizeBagEmoji(); setInterval(() => { applyDbEmoji(); normalizeBagEmoji(); enhanceCards(); }, 700); }

  window.COFFEE_SHIP_EMOJI = { uniqueEmoji, emojiFor, cleanEmoji, rarityColor, enhanceCards, normalizeBagEmoji };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();