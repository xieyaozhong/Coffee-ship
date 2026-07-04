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
    // masks
    mask_fox:'🦊', mask_wolf:'🐺', mask_lion:'🦁', mask_tiger:'🐯', mask_bear:'🐻', mask_owl:'🦉', mask_deer:'🦌', mask_goat:'🐐', mask_boar:'🐗', mask_snake:'🐍',
    // clothing
    cloth_party:'🎽', cloth_shorts:'🩳', cloth_socks:'🧦', cloth_shirt:'👕', cloth_tailcoat:'👔', cloth_gown:'👗', cloth_cape:'🧥', cloth_gloves:'🧤', cloth_scarf:'🧣', cloth_hat:'👒', cloth_top_hat:'🎩', cloth_heels:'👠', cloth_boots:'👢', cloth_shoes:'👞', cloth_ribbon:'🎀',
    // toys
    toy_balloon:'🎈', toy_yoyo:'🪀', toy_kite:'🪁', toy_horse:'🎠', toy_doll:'🪆', toy_nose:'🤡', toy_trumpet:'🎺', toy_drum:'🥁', toy_paint:'🎨', toy_cards:'🃏', toy_dice:'🎲', toy_bear:'🧸', toy_pinata:'🪅', toy_maracas:'🪇', toy_circus:'🎪',
    // accessories
    acc_ring:'💍', acc_necklace:'📿', acc_crown:'👑', acc_gem:'💎', acc_feather:'🪶', acc_badge:'📜', acc_medal:'🏅', acc_brooch:'💠', acc_earring:'✨', acc_bell:'🔔',
    // ocean friend
    turtle_shell:'🐢', turtle_straw:'🥤', walrus_relic:'🦭', rust_tool:'🧰', drifter_relic:'🧩',
    // bottles
    joke:'😂', lanar:'🌊', ariel:'🧜‍♀️', blackbeard:'🏴‍☠️', mad_priest:'⛪', carnival:'🎭', turtle_soup:'🍲',
    // generic fallbacks
    pearl:'🦪', fish:'🐟', shark:'🦈', trash:'🗑️', treasure:'💰', bottle:'🍾', item:'📦'
  };

  const autoEmojiPool = ['🪙','🗝️','🧭','🧿','🪬','⚱️','🏺','🪞','🕯️','📯','🧺','🪵','🪨','🪷','🌙','⭐','☄️','🌈','🔥','❄️','⚡','🫧','🪸','🐚','🦀','🦞','🦐','🦑','🐙','🐋','🐡','🐠','🐬','🦈','🦦','🐾','🪽','🛟','⚓','⛵','🚢','🧜','🧪','🧫','🔮','🪄','📘','📕','📗','📙','🧾','💌'];

  function cleanEmoji(text) { return String(text || '').replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '').trim(); }
  function keyOf(item) {
    const raw = item?.id || item?.v2id || item?.iconId || item?.name || item?.title || 'item';
    return String(raw).replace(/\s+/g, '_');
  }
  function emojiFor(item) {
    const key = keyOf(item);
    if (uniqueEmoji[key]) return uniqueEmoji[key];
    const name = item?.name || item?.title || '';
    for (const [k, e] of Object.entries(uniqueEmoji)) if (name.includes(k) || key.includes(k)) return e;
    let h = 0; String(key).split('').forEach(ch => h = (h * 31 + ch.charCodeAt(0)) >>> 0);
    return autoEmojiPool[h % autoEmojiPool.length];
  }
  function applyDbEmoji() {
    if (!window.COFFEE_SHIP_DB) return;
    const db = window.COFFEE_SHIP_DB;
    const patchRow = row => { if (Array.isArray(row)) row[1] = uniqueEmoji[row[0]] || row[1] || emojiFor({ id:row[0], name:row[2] }); };
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
      if (item.icon !== one || item.name !== cleanName) {
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