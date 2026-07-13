(() => {
  'use strict';
  if (window.__COFFEE_SHIP_MERMAID_EVENT_V6__) return;
  window.__COFFEE_SHIP_MERMAID_EVENT_V6__ = true;

  const encounters = [
    ['月光歌聲','美人魚在月光下浮出水面，唱了一段只有海浪聽得懂的歌。','🐚','月光貝殼','treasure','moon_song'],
    ['深海珍珠','她把一顆冰涼的巨大珍珠放在船邊，微笑後潛回海裡。','💎','巨大珍珠','treasure','deep_pearl'],
    ['魚群祝福','她輕拍海面，魚群從船底閃過。接下來一段時間，稀有魚似乎更靠近了。','✨','魚群祝福','buff','shoal_blessing'],
    ['藍色鱗片','她留下一片會發光的藍色鱗片，上面有細小的星點。','🧜‍♀️','美人魚鱗片','treasure','blue_scale'],
    ['失落航海圖','美人魚遞來一張被海水泡軟的圖，上面畫著不存在的島。','🗺️','失落航海圖','treasure','lost_chart'],
    ['海潮安眠曲','她的歌聲讓海面安靜下來，連遠方的鯊魚影子也退去了。','🌊','安眠潮聲','buff','tide_lullaby'],
    ['傳說魚餌','她把一枚閃亮魚餌拋上甲板，像一顆小星星。','🎣','傳說魚餌','treasure','legendary_bait'],
    ['皇冠碎片','她從貝殼盒中取出一枚金色碎片，像某個沉沒王國的遺物。','👑','海底皇冠碎片','treasure','crown_fragment'],
    ['瓶中歌詞','她留下漂流瓶，裡面裝著一首由珍珠光芒寫成的歌。','🎼','美人魚歌詞漂流瓶','lyrics','bottled_lyrics'],
    ['深海藍寶','她指向海面，浪花中浮出一顆深藍色寶石。','🔷','深海藍寶','treasure','deep_sapphire'],
    ['無聲的微笑','她只是看著你，像知道所有沒有說完的心意。','💙','無聲祝福','buff','silent_smile'],
    ['泡沫回音','她化成一串泡泡離開，其中一顆泡泡包著一張會唱歌的紙。','🫧','泡沫歌詞瓶','lyrics','bubble_echo']
  ];

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  }

  function chance() {
    return window.COFFEE_SHIP_ECONOMY?.eventChance?.(.05,'special')
      ?? Math.min(.7, .05 * Math.max(1, Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.fishingLuck || 1)));
  }

  function lyricDropChance() {
    const bottleLuck = Number(window.COFFEE_SHIP_ECONOMY?.fishingModifiers?.().bottleLuck
      ?? window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.bottleLuck
      ?? 0);
    return Math.min(.78, .38 + bottleLuck * .9);
  }

  function grantItem(encounter, castId) {
    if (encounter[4] === 'buff') {
      localStorage.setItem('coffeeShipMermaidBuffUntil', String(Date.now() + 10 * 60 * 1000));
      return {type:'buff',name:encounter[3],icon:encounter[2]};
    }

    const pearlBonus = window.COFFEE_SHIP_ECONOMY?.fishingModifiers?.().pearlBonus
      ?? Math.max(1, Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.pearlBonus || 1));
    const bag = read('coffeeShipFishBag', []);
    const item = {
      name:encounter[3],zone:'美人魚事件',rarity:'傳說',quality:'祝福',
      weight:0.01 + Math.random() * 0.4,kind:'treasure',icon:encounter[2],
      price:90,sellPrice:Math.round(90 * pearlBonus),coffeePearlBonus:pearlBonus,
      coffeeEffectName:window.COFFEE_SHIP_COFFEE_EFFECT?.name || '',castId,at:Date.now()
    };
    bag.push(item);
    save('coffeeShipFishBag', bag.slice(-240));
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'mermaid',item}}));
    return {type:'item',item};
  }

  function createLyricBottle(castId) {
    const api = window.COFFEE_SHIP_MERMAID_LYRICS;
    const entry = api?.createRandom?.();
    if (!entry) return null;
    const total = Number(api.total || api.entries?.length || 0);

    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({
      castId,
      eventId:`mermaid-lyric:${entry.id || entry.title}`,
      eventKind:'bottle',
      title:entry.title,
      icon:entry.icon,
      accent:'#9ce8f0',
      text:`系列：${entry.series}｜稀有度：${entry.rarity}\n${entry.text}\n收集進度：${api.collected?.() || 0}/${total}`
    });
    return entry;
  }

  function trigger(event) {
    if (Math.random() > chance()) return;
    const castId = event.detail?.castId;
    const encounter = encounters[Math.floor(Math.random() * encounters.length)];
    let rewardText = '';
    let lyric = null;

    if (encounter[4] === 'lyrics') {
      lyric = createLyricBottle(castId);
      rewardText = lyric ? `獲得：${lyric.icon} ${lyric.title}` : '歌詞瓶被海風吹回了遠方。';
    } else {
      const reward = grantItem(encounter,castId);
      rewardText = reward?.type === 'item'
        ? `獲得：${reward.item.icon} ${reward.item.name}`
        : `獲得效果：${encounter[2]} ${encounter[3]}`;
      if (Math.random() < lyricDropChance()) lyric = createLyricBottle(castId);
    }

    const log = read('coffeeShipMermaidEncounters', []);
    log.push({title:encounter[0],text:encounter[1],lyricId:lyric?.id || '',at:Date.now()});
    save('coffeeShipMermaidEncounters', log.slice(-50));

    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({
      castId,
      eventId:`mermaid:${encounter[5]}`,
      eventKind:'mermaid',
      title:`美人魚事件｜${encounter[0]}`,
      icon:'🧜‍♀️',
      accent:'#9ce8f0',
      text:`${encounter[1]}\n${rewardText}${lyric && encounter[4] !== 'lyrics' ? `\n額外發現：${lyric.icon} ${lyric.songTitle}` : ''}`
    });
  }

  function init() {
    window.addEventListener('coffee-ship:fishing-result', trigger);
    window.COFFEE_SHIP_MERMAID_EVENT = {
      trigger,
      chance,
      lyricDropChance,
      encounters,
      version:6
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
