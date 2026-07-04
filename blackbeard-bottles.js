(() => {
  'use strict';

  const KEY = 'coffeeShipBlackbeardLetters';
  const META = { icon:'🏴‍☠️', series:'黑鬍子藏寶圖', rarity:'傳說', count:10 };

  const BLACKBEARD_TREASURES = [
    {
      number:1,
      chapter:'第一章：王冠與流亡',
      treasure:'伊莉莎白女王的晨星王冠',
      owner:'伊莉莎白女王',
      fate:'王冠失竊後被迫退位，晚年流亡於北方群島。',
      location:'黑礁石下第三個洞',
      title:'黑鬍子藏寶圖 01｜晨星王冠',
      text:'這頂王冠原本屬於瓦洛里亞的伊莉莎白女王。她在海上加冕時，黑鬍子讓三艘空船掛起敵國旗幟，引開皇家護衛，再趁禮炮煙霧登上旗艦。女王沒有被殺，卻在眾目睽睽下失去象徵王權的王冠。貴族把那場羞辱當成她無力統治的證據，三個月後逼她退位。她流亡北方群島直到老去，而王冠被黑鬍子埋在黑礁石下第三個洞。地圖角落寫著：王位不是被奪走的，是所有人看見它能被奪走後，自己鬆開了手。'
    },
    {
      number:2,
      chapter:'第二章：藍寶石與猜疑',
      treasure:'總督夫人的藍海之淚',
      owner:'賽西莉亞夫人',
      fate:'被丈夫誤認為私奔共犯，遭逐出總督府，後來成為孤島燈塔守望人。',
      location:'斷桅沉船的船長室',
      title:'黑鬍子藏寶圖 02｜藍海之淚',
      text:'「藍海之淚」曾掛在東港總督夫人賽西莉亞的頸上。黑鬍子混進總督府的冬季舞會，假扮成受邀的提琴手，在全場熄燈換曲時，用一串玻璃仿品換走真項鍊。隔日總督發現贗品，沒有懷疑守衛，反而認定妻子與海盜私通。賽西莉亞被逐出總督府，最後獨自守著外海燈塔，再也沒有回城。黑鬍子把項鍊藏進斷桅沉船的船長室，並在地圖上寫道：最容易偷走的從來不是珠寶，而是兩個人之間原本就不牢固的信任。'
    },
    {
      number:3,
      chapter:'第三章：金杯與洪水',
      treasure:'聖銀教堂的黎明金杯',
      owner:'馬拉基主教',
      fate:'為疏散信徒留在洪水中的教堂，之後再也沒有被找到。',
      location:'會唱歌的骷髏旁',
      title:'黑鬍子藏寶圖 03｜黎明金杯',
      text:'聖銀教堂的黎明金杯只在每年第一場晨禱時出現。黑鬍子早在雨季前就偽造了王室撤離命令，等洪水漫進城區，再以救援船隊的名義進入教堂。他的手下搬走金杯時，馬拉基主教仍在鐘樓指引居民逃生。主教沒有追逐寶物，也沒有離開，最後和鐘聲一起消失在洪水裡。金杯被藏在一具會隨潮聲哼歌的骷髏旁。黑鬍子寫道：那老頭到最後都沒有看金杯一眼，所以我始終不確定，究竟是我偷走了他的聖物，還是他證明了那東西從來不重要。'
    },
    {
      number:4,
      chapter:'第四章：珍珠與迷霧',
      treasure:'王家船隊的黑珍珠箱',
      owner:'科爾賓海軍上將',
      fate:'旗艦失陷後被流放荒礁，獲救時已不願再踏上任何船。',
      location:'退潮才露出的月牙沙洲',
      title:'黑鬍子藏寶圖 04｜黑珍珠箱',
      text:'王家船隊護送的黑珍珠，是海軍上將科爾賓用十年戰功換來的榮耀。黑鬍子先放出假情報，讓艦隊誤以為海盜會從南方突襲，再利用濃霧從北側靠近旗艦。他沒有擊沉整支船隊，只奪走珍珠箱，並把科爾賓與幾名軍官留在一塊退潮才出現的荒礁。科爾賓數週後獲救，卻從此拒絕登船，餘生都在陸地上畫那場霧。珍珠箱後來被埋在月牙沙洲，只有最低潮時才會露出入口。地圖上還留著一句：一名上將真正失去的，不是珍珠，而是他以為自己永遠看得懂海。'
    },
    {
      number:5,
      chapter:'第五章：金磚與替罪者',
      treasure:'東港銀行的沉潮金磚',
      owner:'加布里埃爾・洛銀行長',
      fate:'因帳冊缺口被當成監守自盜，在獄中度過二十年。',
      location:'老燈塔地下室',
      title:'黑鬍子藏寶圖 05｜沉潮金磚',
      text:'東港銀行的地下金庫建在舊海牆後方。黑鬍子沒有正面攻打，而是在大潮夜打開廢棄引水道，讓海水灌入金庫，再從排水口把裝在浮箱裡的金磚一批批拖走。銀行長加布里埃爾・洛直到天亮才發現所有門鎖都完好，卻少了整整九箱黃金。董事會為保住名聲，把責任全推給他。加布里埃爾被判監守自盜，在獄中度過二十年。黑鬍子則把金磚砌進老燈塔地下室的牆裡。地圖寫著：最乾淨的搶劫，不需要打開門，只需要留下足夠完整的門，讓人們找一個替罪者。'
    },
    {
      number:6,
      chapter:'第六章：王子的名字',
      treasure:'王子的紅寶石誓戒',
      owner:'路西安・阿斯特拉王子',
      fate:'被騙走戒指與離島船票，最終留在狂歡島失去姓名，再也沒有回國。',
      location:'海圖上沒有名字的孤島',
      title:'黑鬍子藏寶圖 06｜路西安的誓戒',
      text:'那位被愛麗兒從暴風雨中救起、最後消失在狂歡島的王子，本名叫路西安・阿斯特拉。紅寶石誓戒是他成年時由王后親手戴上的王室信物。路西安抵達狂歡島後，曾後悔登岸，想買一張離島船票。黑鬍子以戴著羽毛面具的商人身分出現，收下誓戒，交給他一張只在紙上存在的船票。等路西安來到碼頭，船早已離開；他回頭走進燈火，從此再沒有人聽見他的全名。黑鬍子把戒指藏在海圖上沒有名字的孤島。圖上寫著：王子把戒指交給我時，還說有人在海邊等他。可惜狂歡島最擅長的，就是讓人忘記自己答應過誰。'
    },
    {
      number:7,
      chapter:'第七章：羅盤與假救援',
      treasure:'艾利安船長的低語羅盤',
      owner:'艾利安・肖爾船長',
      fate:'船沉後靠殘骸漂流獲救，從此失去方向感，再未出海。',
      location:'雙月礁中央的空心石柱',
      title:'黑鬍子藏寶圖 07｜低語羅盤',
      text:'低語羅盤能指向持有者心中最想抵達的地方，原主人是探險家艾利安・肖爾。黑鬍子故意讓自己的船掛上求救旗，等艾利安靠近救援，再帶人登船奪走羅盤。失去羅盤後，艾利安的船在夜間觸礁，他靠一塊甲板漂流三天才被商船救起。奇怪的是，他此後連家門朝哪個方向都無法確定，更不曾再次出海。羅盤被藏在雙月礁中央的空心石柱裡。黑鬍子寫道：我以為它會指向寶藏，可它第一次轉動時，指的卻是我早就不敢回去的地方。'
    },
    {
      number:8,
      chapter:'第八章：樂器與沉默',
      treasure:'伊索德的玻璃小提琴',
      owner:'伊索德・維恩',
      fate:'追查失竊樂器時遭遇船難，獲救後再也沒有公開演奏。',
      location:'哭泣洞穴最深處的石台',
      title:'黑鬍子藏寶圖 08｜玻璃小提琴',
      text:'玻璃小提琴屬於海上歌劇家伊索德・維恩，傳說它能讓聽眾看見自己最懷念的人。黑鬍子先買通劇團管燈的人，在演出高潮讓舞台陷入黑暗，再趁混亂從樂器箱中換走真琴。伊索德發現後親自搭船追查，卻在暴風中失事。她被救回來後沒有失去聲音，卻再也沒有公開演奏，因為她說，沒有那把琴，每一首曲子都只剩下告別。黑鬍子把琴放在哭泣洞穴最深處的石台上。地圖角落寫著：她不是因為琴被偷而沉默，而是因為她終於知道，所有人來聽的從來不是她。'
    },
    {
      number:9,
      chapter:'第九章：沙漏與失去的時間',
      treasure:'海倫娜鍊金師的月潮沙漏',
      owner:'海倫娜・莫爾',
      fate:'追蹤沙漏時進入異常海霧，船隻歸來時已過去四十年，她本人下落不明。',
      location:'永不落日海灣的沉鐘下',
      title:'黑鬍子藏寶圖 09｜月潮沙漏',
      text:'月潮沙漏能在沙粒落盡前延緩周圍時間，原主人是鍊金師海倫娜・莫爾。黑鬍子假意用深海隕砂與她交易，在試驗開始時讓手下帶走真正的沙漏，只留下外觀相同的空殼。海倫娜駕船追入一片銀色海霧，船在數日後重新出現，船板卻老化了四十年，甲板上只剩她寫到一半的研究筆記。她本人再也沒有被找到。沙漏被壓在永不落日海灣的沉鐘下。黑鬍子寫道：我偷走的是一只沙漏，她追出去的卻是自己以為還來得及挽回的人生。'
    },
    {
      number:10,
      chapter:'第十章：黑鬍子的真名',
      treasure:'戴維・瓊斯的心臟',
      owner:'戴維・瓊斯',
      fate:'他把自己的心封進鐵箱，從此以黑鬍子之名活著，再也無法真正死亡，也無法真正去愛。',
      location:'飛翔荷蘭人號船長室最下層的鐵箱',
      title:'黑鬍子藏寶圖 10｜戴維・瓊斯的心臟',
      text:'最後一件寶物不是搶來的。黑鬍子的本名是戴維・瓊斯。年輕時，他曾相信海會把自己愛的人送回來，卻只等到一場沒有歸人的風暴。為了不再感到失去，他請海巫將自己的心取出，封進一只永遠不會腐朽的鐵箱。從那天起，戴維・瓊斯消失了，海上只剩黑鬍子。他可以奪走王冠、項鍊、金杯、珍珠、金磚、戒指、羅盤、小提琴與沙漏，卻再也無法確認自己是否真的想要它們。鐵箱藏在飛翔荷蘭人號船長室最下層。地圖最後寫著：找到前九件寶物的人會成為富翁；找到第十件的人，才會知道我為什麼寧願讓全世界叫我黑鬍子。不要刺穿它。它每跳一下，我失去過的人就會在夢裡再死一次。'
    }
  ];

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch (error) { return fallback; }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function canonicalNumber(value, fallback = 1) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 1) return ((Math.floor(parsed) - 1) % META.count) + 1;
    return ((fallback - 1) % META.count) + 1;
  }

  function numberFromEntry(entry, fallback) {
    if (entry && Number.isFinite(Number(entry.blackbeardIndex))) return canonicalNumber(entry.blackbeardIndex, fallback);
    const match = String(entry?.title || '').match(/(?:藏寶圖\s*)?(\d{1,3})/);
    return match ? canonicalNumber(match[1], fallback) : canonicalNumber(fallback, 1);
  }

  function entryFor(number, original = {}) {
    const base = BLACKBEARD_TREASURES[canonicalNumber(number) - 1];
    return {
      ...original,
      ...base,
      icon:META.icon,
      series:META.series,
      rarity:META.rarity,
      blackbeardIndex:base.number,
      blackbeardCompleteSeries:true,
      at:original.at || Date.now()
    };
  }

  function normalizeBlackbeard() {
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
    if (JSON.stringify(list) !== JSON.stringify(next)) save(KEY, next.slice(-120));
  }

  function nextTreasureNumber(list) {
    const collected = new Set(list.map((entry, index) => numberFromEntry(entry, index + 1)));
    for (let number = 1; number <= META.count; number += 1) {
      if (!collected.has(number)) return number;
    }
    return 1 + Math.floor(Math.random() * META.count);
  }

  function createBlackbeardBottle() {
    const list = read(KEY, []);
    const safeList = Array.isArray(list) ? list : [];
    const entry = entryFor(nextTreasureNumber(safeList));
    safeList.push(entry);
    save(KEY, safeList.slice(-120));
    return entry;
  }

  function patchBottleRestore() {
    const restore = window.COFFEE_SHIP_BOTTLE_RESTORE;
    if (!restore) return;
    if (restore.META?.blackbeard) Object.assign(restore.META.blackbeard, META);
    if (restore.STORE) restore.STORE.blackbeard = KEY;
    restore.blackbeardCompleteSeries = BLACKBEARD_TREASURES;
    const current = restore.createFullBottle;
    if (typeof current === 'function' && !current.__blackbeardTenPatched) {
      const original = current;
      const wrapped = function(type) {
        return type === 'blackbeard' ? createBlackbeardBottle() : original.call(this, type);
      };
      wrapped.__blackbeardTenPatched = true;
      restore.createFullBottle = wrapped;
    }
  }

  function patchBottleCore() {
    const core = window.COFFEE_SHIP_BOTTLE_CORE;
    if (!core) return;
    if (core.bottleSeries?.[KEY]) Object.assign(core.bottleSeries[KEY], META);
    const current = core.createBottle;
    if (typeof current === 'function' && !current.__blackbeardTenPatched) {
      const original = current;
      const wrapped = function(key, title, text) {
        const signature = `${key || ''} ${title || ''} ${text || ''}`;
        if (/coffeeShipBlackbeardLetters|Blackbeard|黑鬍子|藏寶圖/.test(signature)) return createBlackbeardBottle();
        return original.call(this, key, title, text);
      };
      wrapped.__blackbeardTenPatched = true;
      core.createBottle = wrapped;
    }
  }

  function patchDatabase() {
    const db = window.COFFEE_SHIP_DB;
    if (!db) return;
    if (Array.isArray(db.bottles)) {
      let found = false;
      db.bottles = db.bottles.map(row => {
        if (!Array.isArray(row) || row[0] !== 'blackbeard') return row;
        found = true;
        return ['blackbeard', META.icon, META.series, META.rarity, BLACKBEARD_TREASURES[0].text];
      });
      if (!found) db.bottles.push(['blackbeard', META.icon, META.series, META.rarity, BLACKBEARD_TREASURES[0].text]);
    }
    db.blackbeardTreasures = BLACKBEARD_TREASURES;
    db.createBlackbeardBottle = createBlackbeardBottle;
    const currentAdd = db.addBottle;
    if (typeof currentAdd === 'function' && !currentAdd.__blackbeardTenPatched) {
      const original = currentAdd;
      const wrapped = function(bottle) {
        return bottle?.id === 'blackbeard' ? createBlackbeardBottle() : original.call(this, bottle);
      };
      wrapped.__blackbeardTenPatched = true;
      db.addBottle = wrapped;
    }
  }

  function patchVisibleCard() {
    const card = document.getElementById('centralFishResultCard');
    if (!card || card.classList.contains('hidden') || !/黑鬍子藏寶圖/.test(card.textContent || '')) return;
    const match = (card.textContent || '').match(/黑鬍子藏寶圖\s*(\d+)/);
    const list = read(KEY, []);
    const number = match ? canonicalNumber(match[1]) : nextTreasureNumber(Array.isArray(list) ? list : []);
    const entry = entryFor(number);
    const title = card.querySelector('.central-fish-title');
    const detail = card.querySelector('.central-fish-detail');
    if (title) title.textContent = `${META.icon} ${entry.title}`;
    if (detail) detail.innerHTML = `類型：藏寶圖<br>寶物：${entry.treasure}<br>原主人：${entry.owner}<br>原主人結局：${entry.fate}<br>藏匿地點：${entry.location}<br>稀有度：${entry.rarity}<br><br>${entry.text}`;
  }

  function patchRuntime() {
    patchBottleRestore();
    patchBottleCore();
    patchDatabase();
    patchVisibleCard();
  }

  function init() {
    normalizeBlackbeard();
    patchRuntime();
    const observer = new MutationObserver(() => {
      normalizeBlackbeard();
      patchVisibleCard();
    });
    observer.observe(document.body, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:['class'] });
    setInterval(() => {
      normalizeBlackbeard();
      patchRuntime();
    }, 1200);
  }

  window.COFFEE_SHIP_BLACKBEARD_SERIES = {
    META,
    BLACKBEARD_TREASURES,
    princeRealName:'路西安・阿斯特拉',
    blackbeardRealName:'戴維・瓊斯',
    getEntry:number => entryFor(number),
    createBlackbeardBottle,
    normalizeBlackbeard
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();