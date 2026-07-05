(() => {
  'use strict';
  if (window.__COFFEE_SHIP_TURTLE_SOUP_TEN__) return;
  window.__COFFEE_SHIP_TURTLE_SOUP_TEN__ = true;

  const KEY = 'coffeeShipTurtleSoupLetters';
  const META = {
    icon:'🍲',
    series:'海龜湯神秘故事',
    rarity:'神話',
    count:10
  };

  const TURTLE_SOUPS = [
    {
      number:1,
      title:'海龜湯 01｜空椅前的第十三杯',
      previousNumber:10,
      previousAnswer:'船長刪掉的不是死亡名單，而是「毒氣暴露觀察名單」。每個人連續二十四小時沒有症狀，就會從名單上被劃掉。船長是最後接受觀察的人；當他刪掉自己的名字，代表全船終於排除中毒風險。',
      riddle:'咖啡廳裡明明只有十二名生還者，Momo 卻煮了第十三杯咖啡，放在一張空椅前。沒有人喝它。直到咖啡完全冷掉，船長才下令重新啟動引擎。這杯咖啡的用途是什麼？',
      hint:'第十三杯不是給人喝的，而且船上的計時設備剛好壞了。',
      answer:'機艙曾發生燃油外洩。為避免火花引爆揮發氣體，眾人必須等待一段固定時間才能啟動引擎。壞掉的時鐘無法計時，Momo 便用一杯剛煮好的咖啡當作簡單計時器；咖啡完全冷卻，代表安全等待時間已經過去。'
    },
    {
      number:2,
      title:'海龜湯 02｜只亮一分鐘的燈塔',
      previousNumber:1,
      previousAnswer:'第十三杯咖啡不是給人喝，而是燃油外洩後的安全計時器。船上的時鐘故障，等咖啡完全冷掉，就代表揮發氣體已散去，可以重新啟動引擎。',
      riddle:'海岸邊有一座燈塔，每天深夜只亮一分鐘，之後整晚熄滅。它沒有照亮航道，卻多年來阻止了所有船隻在暗礁區觸礁。為什麼一分鐘就足夠？',
      hint:'燈塔不是在告訴船隻「暗礁在哪裡」，而是在告訴它們「什麼時候可以通過」。',
      answer:'燈光亮起的那一分鐘，正是危險潮流反轉、深水航道短暫穩定的時間信號。船隻不需要整夜照明，只要看見那次閃光，就知道安全通過暗礁區的潮汐窗口已經開始。'
    },
    {
      number:3,
      title:'海龜湯 03｜活人的葬禮',
      previousNumber:2,
      previousAnswer:'燈塔的一分鐘亮光是潮汐信號。它標示危險潮流反轉、深水航道開始穩定的時刻，船隻看見信號後才通過暗礁區。',
      riddle:'船員們替一名水手舉行葬禮，而那名水手本人就站在人群裡。他沒有雙胞胎、沒有失憶，也不是惡作劇。所有人都知道他活著，卻仍認真地把刻著他名字的棺木推進海中。為什麼？',
      hint:'他們埋葬的不是他的身體，而是讓敵人繼續尋找他的理由。',
      answer:'水手曾目擊海盜的重要交易，已成為追殺目標。船員們故意舉行公開海葬，讓監視船隻相信他已經死亡；從那天起，他改用新身分生活，棺木裡只有舊衣物和能證明身分的物品。'
    },
    {
      number:4,
      title:'海龜湯 04｜鎖死的艙房',
      previousNumber:3,
      previousAnswer:'那是一場用來欺騙追殺者的假葬禮。水手是海盜交易的目擊者，棺木裡只有舊衣物與身分物品；他本人則改名，繼續活在船上。',
      riddle:'一名潛水員走進艙房，從裡面把門反鎖。舷窗完全封死，房內沒有暗道。十分鐘後，船長打開門，潛水員消失了，地板卻仍然乾燥。船長不但沒有驚訝，還說測試成功。潛水員去了哪裡？',
      hint:'這間「艙房」並不是普通房間；它的下方與海相連。',
      answer:'那是一座加壓潛水鐘，底部有向海面開放的月池。艙內氣壓阻止海水湧入，所以地板保持乾燥；潛水員從底部進入海中，船長確認加壓系統正常後，才說測試成功。'
    },
    {
      number:5,
      title:'海龜湯 05｜向西的船往東走',
      previousNumber:4,
      previousAnswer:'艙房其實是加壓潛水鐘，底部有開放式月池。氣壓擋住海水，因此地板不會濕；潛水員從下方直接進入海裡。',
      riddle:'一艘船的船頭明明朝向西方，引擎也正常運轉，船卻持續向東方前進。當時沒有洋流、沒有風，也沒有其他船拖曳。船長卻說航向完全正確。為什麼？',
      hint:'船移動的方向，不一定等於船頭指向的方向。',
      answer:'船正在狹窄航道中倒車，船尾朝東、船頭朝西。引擎以倒車方式推進，因此整艘船向東移動，正是船長計畫中的航行方式。'
    },
    {
      number:6,
      title:'海龜湯 06｜永遠少一人的點名',
      previousNumber:5,
      previousAnswer:'船正在倒車。船頭朝西，但船尾朝東；引擎以反向推進，讓船在狹窄航道中向東退出。',
      riddle:'甲板上所有人都清楚地站在眼前，可是每次點名，數字都比肉眼看見的人數少一。換了三個位置、重新數了很多次，結果仍然一樣。沒有人躲起來，名單也沒有寫錯。少掉的是誰？',
      hint:'負責點名的人也站在甲板上。',
      answer:'每次負責點名的人都只數了其他人，沒有把自己算進去。肉眼看到的人數包含點名者本人，所以數字永遠少一。'
    },
    {
      number:7,
      title:'海龜湯 07｜不能立刻救的落水者',
      previousNumber:6,
      previousAnswer:'點名者忘了把自己算進去。甲板上實際可見的人數包含他本人，但他的計數只包含其他船員，所以永遠少一。',
      riddle:'船員看見一個人浮在海面上揮手，救生繩也已經準備好，船長卻命令任何人都不能立刻把他拉上船。那個人確實活著，也不是敵人。大家服從命令，反而救了他的命。為什麼？',
      hint:'他不是普通落水，而是剛從深海上升。',
      answer:'那是一名正在進行減壓停留的潛水員。他依照計畫停在指定深度附近，揮手表示自己狀況正常。若立刻把他快速拉上甲板，體內氣體可能形成氣泡，引發致命減壓症。'
    },
    {
      number:8,
      title:'海龜湯 08｜沒有鐘聲後沉沒的船',
      previousNumber:7,
      previousAnswer:'海面上的人是正在做減壓停留的潛水員。立刻把他拉上船會讓他上升過快，可能引發致命減壓症，所以等待才是真正的救援。',
      riddle:'一艘漏水的老船停在港裡很多年。每次港口鐘聲響起，船員就開始抽水，所以船一直沒有沉。某天鐘沒有響，船員也沒有抽水，老船當晚便沉了。鐘既沒有連接抽水機，也不是警報器。為什麼鐘聲如此重要？',
      hint:'鐘聲提醒的不是「船正在漏水」，而是海水即將發生的週期變化。',
      answer:'港口鐘固定在漲潮前敲響，船員把它當成抽水時刻。老船在高潮位時進水最快，必須提前排空積水。那天鐘故障，船員錯過漲潮前的抽水時機，船艙在高潮時迅速灌滿。'
    },
    {
      number:9,
      title:'海龜湯 09｜不鹹的救生衣',
      previousNumber:8,
      previousAnswer:'港口鐘是漲潮時間提示。船員每次聽見鐘聲就提前抽水；鐘故障後，他們錯過高潮位前的排水時機，漏水的老船因此沉沒。',
      riddle:'一名乘客堅稱自己整夜待在客艙，從未離開船。船長在他床下發現一件濕救生衣，立刻知道他說謊。奇怪的是，那晚沒有下雨，救生衣上的水也完全不鹹，而船上的淡水系統早已停用。這件救生衣證明了什麼？',
      hint:'附近只有一個地方能讓救生衣沾到大量淡水。',
      answer:'乘客曾穿救生衣搭小艇前往附近燈塔。燈塔蓄水池的溢流口會把淡水沖到登岸平台，所以救生衣被淡水浸濕。船上無雨且淡水停用，這件不鹹的濕救生衣證明他曾偷偷離船。'
    },
    {
      number:10,
      title:'海龜湯 10｜每天少一個名字',
      previousNumber:9,
      previousAnswer:'救生衣沾到的是燈塔蓄水池溢出的淡水。船上沒有雨、淡水系統也停用，因此它證明乘客曾穿著救生衣搭小艇前往燈塔，並非整夜留在客艙。',
      riddle:'船長每天晚上都從一張名單上刪掉一個船員的名字。被刪掉的人沒有死亡，隔天仍照常工作。第十天，船長刪掉自己的名字後，所有人都歡呼，因為船終於安全了。這張名單究竟記錄什麼？',
      hint:'名字被刪除代表通過觀察，而不是遭到淘汰。',
      answer:'那是毒氣暴露後的健康觀察名單。每個人連續二十四小時沒有出現症狀，就會被刪除。船長是最後一名接受觀察的人；當他的名字也被刪掉，代表全船所有人都排除了中毒風險。'
    }
  ];

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  function canonicalNumber(value, fallback = 1) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 1) return ((Math.floor(parsed) - 1) % META.count) + 1;
    return ((fallback - 1) % META.count) + 1;
  }

  function numberFromEntry(entry, fallback) {
    if (Number.isFinite(Number(entry?.turtleSoupIndex))) return canonicalNumber(entry.turtleSoupIndex, fallback);
    const match = String(entry?.title || '').match(/海龜湯\s*(\d{1,2})/);
    return match ? canonicalNumber(match[1], fallback) : canonicalNumber(fallback, 1);
  }

  function textFor(base) {
    return `【上一湯謎底｜第 ${String(base.previousNumber).padStart(2, '0')} 湯】\n${base.previousAnswer}\n\n【本湯謎面】\n${base.riddle}\n\n【可提問方向】\n${base.hint}\n\n這一瓶不會揭露本題答案；答案寫在下一種海龜湯裡。第 10 湯的答案會回到第 1 湯，形成完整循環。`;
  }

  function entryFor(number, original = {}) {
    const base = TURTLE_SOUPS[canonicalNumber(number) - 1];
    return {
      ...original,
      number:base.number,
      title:base.title,
      text:textFor(base),
      previousAnswer:base.previousAnswer,
      riddle:base.riddle,
      hint:base.hint,
      answer:base.answer,
      icon:META.icon,
      series:META.series,
      rarity:META.rarity,
      turtleSoupIndex:base.number,
      turtleSoupLinkedSeries:true,
      at:original.at || Date.now()
    };
  }

  function normalizeTurtleSoups() {
    const list = read(KEY, []);
    if (!Array.isArray(list)) return;
    const seen = new Set();
    const next = [];
    list.forEach((entry, index) => {
      if (!entry || typeof entry !== 'object') return;
      const number = numberFromEntry(entry, index + 1);
      if (seen.has(number)) return;
      seen.add(number);
      next.push(entryFor(number, entry));
    });
    if (JSON.stringify(list) !== JSON.stringify(next)) save(KEY, next.slice(-META.count));
  }

  function nextNumber(list) {
    const collected = new Set(list.map((entry, index) => numberFromEntry(entry, index + 1)));
    for (let number = 1; number <= META.count; number += 1) {
      if (!collected.has(number)) return number;
    }
    return 1 + Math.floor(Math.random() * META.count);
  }

  function createTurtleSoupBottle() {
    const list = read(KEY, []);
    const safeList = Array.isArray(list) ? list : [];
    const entry = entryFor(nextNumber(safeList));
    safeList.push(entry);
    save(KEY, safeList.slice(-META.count));
    return entry;
  }

  function registerProvider() {
    window.COFFEE_SHIP_BOTTLE_PROVIDERS = window.COFFEE_SHIP_BOTTLE_PROVIDERS || {};
    window.COFFEE_SHIP_BOTTLE_PROVIDERS.turtle = {
      META,
      getEntry:number => entryFor(number),
      create:createTurtleSoupBottle
    };
  }

  function patchRestore() {
    const restore = window.COFFEE_SHIP_BOTTLE_RESTORE;
    if (!restore) return;
    if (restore.META?.turtle) Object.assign(restore.META.turtle, META);
    if (restore.STORE) restore.STORE.turtle = KEY;
    restore.turtleSoupSeries = TURTLE_SOUPS;
    const current = restore.createFullBottle;
    if (typeof current === 'function' && !current.__turtleSoupTenPatched) {
      const original = current;
      const wrapped = function(type) {
        return type === 'turtle' ? createTurtleSoupBottle() : original.call(this, type);
      };
      wrapped.__turtleSoupTenPatched = true;
      restore.createFullBottle = wrapped;
    }
  }

  function patchCore() {
    const core = window.COFFEE_SHIP_BOTTLE_CORE;
    if (!core) return;
    if (core.bottleSeries?.[KEY]) Object.assign(core.bottleSeries[KEY], META);
    const current = core.createBottle;
    if (typeof current === 'function' && !current.__turtleSoupTenPatched) {
      const original = current;
      const wrapped = function(key, title, text) {
        const signature = `${key || ''} ${title || ''} ${text || ''}`;
        if (/coffeeShipTurtleSoupLetters|海龜湯|TurtleSoup/i.test(signature)) return createTurtleSoupBottle();
        return original.call(this, key, title, text);
      };
      wrapped.__turtleSoupTenPatched = true;
      core.createBottle = wrapped;
    }
  }

  function patchDatabase() {
    const db = window.COFFEE_SHIP_DB;
    if (!db) return;
    if (Array.isArray(db.bottles)) {
      let found = false;
      db.bottles = db.bottles.map(row => {
        if (!Array.isArray(row) || row[0] !== 'turtle') return row;
        found = true;
        return ['turtle', META.icon, META.series, META.rarity, entryFor(1).text];
      });
      if (!found) db.bottles.push(['turtle', META.icon, META.series, META.rarity, entryFor(1).text]);
    }
    db.turtleSoupStories = TURTLE_SOUPS;
    db.createTurtleSoupBottle = createTurtleSoupBottle;
  }

  function patchRuntime() {
    registerProvider();
    patchRestore();
    patchCore();
    patchDatabase();
  }

  function init() {
    normalizeTurtleSoups();
    patchRuntime();
    setInterval(() => {
      normalizeTurtleSoups();
      patchRuntime();
    }, 1500);
  }

  window.COFFEE_SHIP_TURTLE_SOUP_SERIES = {
    META,
    TURTLE_SOUPS,
    getEntry:number => entryFor(number),
    createTurtleSoupBottle,
    normalizeTurtleSoups
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();