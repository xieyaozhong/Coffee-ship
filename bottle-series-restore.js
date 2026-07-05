(() => {
  'use strict';
  if (window.__COFFEE_SHIP_BOTTLE_RESTORE_V3__) return;
  window.__COFFEE_SHIP_BOTTLE_RESTORE_V3__ = true;

  const STORE = {
    joke:'coffeeShipBottleLetters',lanar:'coffeeShipLanarLetters',ariel:'coffeeShipArielLetters',
    island:'coffeeShipIslandLetters',blackbeard:'coffeeShipBlackbeardLetters',priest:'coffeeShipMadPriestLetters',
    carnival:'coffeeShipCarnivalLetters',turtle:'coffeeShipTurtleSoupLetters'
  };

  const META = {
    joke:{icon:'😂',series:'冷笑話漂流瓶',rarity:'普通',count:50},
    lanar:{icon:'🌊',series:'拉納爾漂流瓶',rarity:'史詩',count:30},
    ariel:{icon:'🧜‍♀️',series:'愛麗兒漂流瓶',rarity:'史詩',count:30},
    island:{icon:'🏝️',series:'可可漂流瓶',rarity:'稀有',count:30},
    blackbeard:{icon:'🏴‍☠️',series:'黑鬍子藏寶圖',rarity:'傳說',count:10},
    priest:{icon:'📜',series:'瘋狂神父殘頁',rarity:'傳說',count:30},
    carnival:{icon:'🎭',series:'狂歡島漂流瓶',rarity:'史詩',count:30},
    turtle:{icon:'🍲',series:'海龜湯神秘故事',rarity:'神話',count:10}
  };

  const JOKES = [
    '魚為什麼不上班？因為牠今天請鮭假。瓶子裡還附了一張請假單，上面只寫著：逆流太累，明天再游。',
    '章魚考試都考幾分？八十分。牠說不是不想考一百，是手太多，寫到最後自己先打結。',
    '螃蟹最大的夢想，是有一天可以直著走。牠練了一整晚，隔天大家說：你只是橫得比較有自信。',
    '海馬到底騎什麼？另一匹海馬。兩匹互相騎到最後都暈船，決定改搭公車。',
    '烏賊最怕考試，因為一緊張就噴墨。老師說不能帶小抄，牠說：這不是小抄，是生理反應。',
    '龍蝦最大的願望是不要進火鍋。牠每天健身，結果只是讓自己看起來更彈牙。',
    '河豚生氣跟平常有什麼差？差很多，平常只是圓，生氣是有態度地圓。',
    '鯊魚最討厭素食餐廳。牠看完菜單後沉默很久，最後點了一份海帶，吃得像在反省人生。',
    '海豹為什麼叫海豹？因為牠每天都在蓋章。牠蓋到最後發現，原來自己才是那顆印章。',
    '海星最怕被評成四星。牠說少一顆不是扣分，是失去身體的一部分，請尊重評論對象。'
  ];

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  }

  function providerFor(type) {
    return window.COFFEE_SHIP_BOTTLE_PROVIDERS?.[type] || null;
  }

  function clamp(number, count) {
    return ((Number(number || 1) - 1) % count) + 1;
  }

  function fallbackText(type, number) {
    const index = clamp(number,META[type]?.count || 10);
    if (type === 'joke') return JOKES[(index - 1) % JOKES.length];
    return `${META[type]?.series || '漂流瓶'}第 ${index} 封。海水泡皺了紙張，但故事仍然清楚。`;
  }

  function getEntry(type, number) {
    const meta = META[type] || META.joke;
    const index = clamp(number,meta.count);
    const provider = providerFor(type);
    const provided = provider?.getEntry?.(index);
    return {
      ...(provided || {}),
      title:provided?.title || `${meta.series} ${String(index).padStart(2,'0')}`,
      text:provided?.text || fallbackText(type,index),
      icon:meta.icon,
      series:meta.series,
      rarity:meta.rarity,
      number:index,
      at:Date.now()
    };
  }

  function createFullBottle(type) {
    const safeType = META[type] ? type : 'joke';
    const provider = providerFor(safeType);
    if (provider?.create) return provider.create();
    const key = STORE[safeType];
    const list = read(key,[]);
    const entry = getEntry(safeType,list.length + 1);
    list.push(entry);
    save(key,list.slice(-120));
    return entry;
  }

  function pickType() {
    const table = [['joke',25],['island',22],['lanar',14],['ariel',12],['carnival',12],['priest',7],['blackbeard',5],['turtle',3]];
    let roll = Math.random() * table.reduce((sum,row) => sum + row[1],0);
    for (const [type,weight] of table) {
      roll -= weight;
      if (roll <= 0) return type;
    }
    return 'joke';
  }

  function normalizeAll() {
    Object.entries(STORE).forEach(([type,key]) => {
      const list = read(key,[]);
      if (!Array.isArray(list)) return;
      const meta = META[type];
      const repaired = list.map((entry,index) => ({
        ...entry,
        icon:meta.icon,
        series:meta.series,
        rarity:meta.rarity,
        title:entry?.title || `${meta.series} ${String(clamp(index + 1,meta.count)).padStart(2,'0')}`,
        text:entry?.text || fallbackText(type,index + 1),
        at:entry?.at || Date.now()
      }));
      if (JSON.stringify(list) !== JSON.stringify(repaired)) save(key,repaired.slice(-120));
    });
  }

  function patchDatabase() {
    if (window.COFFEE_SHIP_DB) {
      window.COFFEE_SHIP_DB.bottles = Object.keys(META).map(type => [type,META[type].icon,META[type].series,META[type].rarity,getEntry(type,1).text]);
      window.COFFEE_SHIP_DB.pickBottle = () => {
        const type = pickType();
        const entry = getEntry(type,1);
        return {id:type,icon:entry.icon,title:entry.series,text:entry.text,rarity:entry.rarity,group:'bottle',at:Date.now()};
      };
    }
  }

  function onFishingResult() {
    if (Math.random() > .075) return;
    const entry = createFullBottle(pickType());
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({
      title:entry.title,
      icon:entry.icon || '🍾',
      accent:'#d7bb79',
      text:`系列：${entry.series}｜稀有度：${entry.rarity}\n${entry.text}`
    });
  }

  function init() {
    normalizeAll();
    patchDatabase();
    window.addEventListener('coffee-ship:fishing-result',onFishingResult);
    setInterval(() => {
      normalizeAll();
      patchDatabase();
    },2500);
  }

  window.COFFEE_SHIP_BOTTLE_RESTORE = {
    META,
    STORE,
    textOf:(type,number) => getEntry(type,number).text,
    titleOf:(type,number) => getEntry(type,number).title,
    createFullBottle,
    normalizeAll
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();