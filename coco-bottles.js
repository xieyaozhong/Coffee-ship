(() => {
  'use strict';

  const KEY = 'coffeeShipIslandLetters';
  const META = { icon:'🏝️', series:'可可漂流瓶', rarity:'稀有', count:30 };

  const COCO_BOTTLES = [
    {number:1, chapter:'第一章：依靠', title:'可可漂流瓶 01｜荒島上的第一個夜晚', text:'我們被海浪沖上島時，哈斯第一個醒來。他沒有先看自己的傷，只是不斷喊我的名字。當我睜開眼，他緊緊抱住我，說還好妳沒事。莫納提醒我們必須先找水，可我幾乎沒有聽見。我只記得哈斯懷裡的溫度，也第一次相信，只要他在，我就能在這座島上活下去。'},
    {number:2, chapter:'第一章：依靠', title:'可可漂流瓶 02｜最後一口水', text:'我們找到的雨水只剩半個椰殼。莫納說三個人應該平均分，哈斯卻把自己的那份推給我。他說自己不渴，夜裡嘴唇卻已經乾裂。我問他為什麼總是照顧我，他笑著說，因為妳比我重要。我知道那或許只是保護，可我的心卻把那句話理解成了別的意思。'},
    {number:3, chapter:'第一章：依靠', title:'可可漂流瓶 03｜守夜的人', text:'哈斯總是第一個守夜。每次醒來，我都能看見他坐在火堆旁。有一晚我假裝熟睡，他替我蓋好外套，又輕輕摸了摸我的頭。我不敢睜眼，怕他立刻把手收回。從那天開始，我開始期待夜晚，因為只有在我睡著時，他才會露出那種沒有防備的溫柔。'},
    {number:4, chapter:'第一章：依靠', title:'可可漂流瓶 04｜我們長得很像', text:'莫納說我和哈斯其實長得很像。我仔細看了很久，才發現我們的眼睛、笑起來的方式，甚至皺眉時的神情都如此相似。我問哈斯，我們以前是不是見過。他沉默許久，只說有些事等離開島後再告訴我。那時候的我以為，他藏著的是一段不能說的感情。'},
    {number:5, chapter:'第一章：依靠', title:'可可漂流瓶 05｜我開始在意他', text:'哈斯今天受了傷。傷勢並不嚴重，我卻慌得連話都說不好。莫納替他處理傷口，我只能一直問他痛不痛。他笑我太緊張。我沒有告訴他，我真正害怕的是，如果某天他不在了，我可能無法獨自活下去。那已經不只是依賴，而是我不願承認的情愫。'},

    {number:6, chapter:'第二章：錯誤的情愫', title:'可可漂流瓶 06｜我不喜歡他看著別人', text:'今天哈斯和莫納一起尋找食物，回來時兩人有說有笑。我站在火堆旁，心裡突然很不舒服。我故意嫌棄他們帶回來的東西，哈斯卻只問我是不是累了。我搖頭，沒有說出真正的原因。我不喜歡他的注意力落在別人身上，也開始希望，他的笑容只屬於我。'},
    {number:7, chapter:'第二章：錯誤的情愫', title:'可可漂流瓶 07｜一場不該出現的夢', text:'我夢見我們離開了荒島。夢裡沒有莫納，只有我和哈斯住在靠海的小屋。他早晨叫我起床，晚上替我整理頭髮。我問我們是什麼關係，他沒有回答，只牽住我的手。醒來後，我不敢看他。那是我第一次希望一個不該存在的夢能成真。'},
    {number:8, chapter:'第二章：錯誤的情愫', title:'可可漂流瓶 08｜他拒絕回答', text:'我問哈斯，離開島後最想做什麼。他說想先帶我去見一個人。我又問他是不是有喜歡的人。他沉默許久，只說，可可，不要把我想成妳期待的那種人。我假裝聽不懂，可那句話像一根刺。他似乎早已看見我的感情，也早已知道我們不可能。'},
    {number:9, chapter:'第二章：錯誤的情愫', title:'可可漂流瓶 09｜舊照片', text:'我們在沉船殘骸裡找到一只鐵盒，裡面有張被海水泡壞的照片。照片上的女人抱著兩個孩子，其中一個很像小時候的我。哈斯看見後立刻把照片收走，說自己不認識照片中的男孩，可他的手一直發抖。我知道，他在說謊。'},
    {number:10, chapter:'第二章：錯誤的情愫', title:'可可漂流瓶 10｜哥哥', text:'哈斯終於說出真相。照片裡的男孩就是他，那個女人是我們的母親。我們年幼時因海難失散，他被別人收養，而我一直不知道自己有哥哥。他早就認出我，也只因我是妹妹才如此保護我。我問，如果我們不是兄妹，你會喜歡我嗎？他沒有回答。'},

    {number:11, chapter:'第三章：莫納', title:'可可漂流瓶 11｜她知道了', text:'莫納知道我們是兄妹後並不驚訝。她只問，我對哈斯的感情是不是早已超過兄妹。我叫她閉嘴。她沒有生氣，只說真相不會因為妳不承認就消失。我開始討厭她，不是因為她說錯了，而是因為她看得太清楚。'},
    {number:12, chapter:'第三章：莫納', title:'可可漂流瓶 12｜哈斯開始躲著我', text:'真相揭開後，哈斯不再和我單獨相處。他仍然照顧我，卻處處保持距離，像在提醒我只能是他的妹妹。莫納說他是在保護我，我卻覺得是她讓哈斯遠離我。如果她沒有揭穿，也許我們還能假裝什麼都不知道。'},
    {number:13, chapter:'第三章：莫納', title:'可可漂流瓶 13｜他們之間的秘密', text:'今天我看見哈斯和莫納在海邊低聲交談。莫納握住他的手臂，最後短暫地抱了他。哈斯回來後說，她只是想安慰他。我問他需要什麼安慰，他沒有回答。那一刻，我開始相信，莫納正在奪走我唯一想留住的人。'},
    {number:14, chapter:'第三章：莫納', title:'可可漂流瓶 14｜她是阻礙', text:'莫納比我冷靜，也比我更懂得在荒島上生存。哈斯開始依賴她的判斷。血緣讓我只能成為妹妹，莫納卻可以成為朋友、同伴，甚至他未來愛上的人。我第一次產生一個可怕的念頭：只要莫納不在，哈斯也許就會重新只看著我。'},
    {number:15, chapter:'第三章：莫納', title:'可可漂流瓶 15｜我開始觀察她', text:'我開始留意莫納每天走哪條路、何時離開營地、什麼時候獨處。我告訴自己只是想知道她和哈斯是否還有秘密，可我心裡其實已經在想像，如果她突然離開，一切會不會恢復原樣。當我開始計算一個人消失後的生活，想像就不再單純。'},

    {number:16, chapter:'第四章：除掉莫納', title:'可可漂流瓶 16｜第一次試探', text:'我曾故意讓莫納錯過一次重要的行動，只希望她暫時無法和哈斯同行。計畫沒有成功，哈斯反而主動去幫她。我第一次因失敗而生氣，也第一次看清，自己已經不只是嫉妒。我正在一步步變成連自己都不願承認的人。'},
    {number:17, chapter:'第四章：除掉莫納', title:'可可漂流瓶 17｜差一點傷到他', text:'我又安排了一次意外，想讓莫納暫時離開我們。可在最後一刻，哈斯卻走到了原本屬於她的位置。我慌忙破壞自己的計畫，才沒有讓事情發生。他還以為我只是累了，甚至把食物分給我。我看著他，第一次害怕我的嫉妒終有一天會傷到他。'},
    {number:18, chapter:'第四章：除掉莫納', title:'可可漂流瓶 18｜莫納警告我', text:'莫納把我帶到海邊，直接問我是不是想傷害她。我否認，她卻說，妳不是想得到哈斯，只是不願接受自己得不到。我問她是不是喜歡哈斯，她說那並不重要。她越平靜，我就越憤怒，因為她說中了我最不願面對的事。'},
    {number:19, chapter:'第四章：除掉莫納', title:'可可漂流瓶 19｜更深的念頭', text:'我發現，讓莫納短暫離開沒有用。只要她回來，哈斯仍會相信她、依靠她。我開始想像一場看似偶然的失蹤，想像所有人都相信她只是離開了島。那時候，我還不明白，當一個人把別人的消失當成願望時，自己也已經迷失。'},
    {number:20, chapter:'第四章：除掉莫納', title:'可可漂流瓶 20｜假的線索', text:'我留下了一條假的線索，想把莫納引到島上危險的北邊。她很快察覺不對，卻沒有立刻拆穿。那晚，她似乎把一切告訴了哈斯。哈斯看我的眼神變得陌生。我害怕他知道真相，也因此做出了最錯誤的決定。'},

    {number:21, chapter:'第五章：錯誤的人', title:'可可漂流瓶 21｜我把莫納引走', text:'清晨，我謊稱哈斯在北邊受傷，把莫納引進森林。她明明不相信我，卻仍然跟來。走到危險地帶時，她問我，妳真的希望哈斯看見現在的妳嗎？就在我失去理智的瞬間，哈斯從遠處追了過來。'},
    {number:22, chapter:'第五章：錯誤的人', title:'可可漂流瓶 22｜他替她擋下那一步', text:'莫納在混亂中失去平衡，哈斯立刻衝過來拉住她。下一刻，他自己卻踩上鬆動的地面，向下墜去。我只來得及抓住他的手。他沒有責怪我，也沒有求我先救他，只大喊著要莫納帶我離開。即使傷害他的人是我，他仍然選擇保護我。'},
    {number:23, chapter:'第五章：錯誤的人', title:'可可漂流瓶 23｜從掌心滑走', text:'我緊緊抓著哈斯的手，莫納也試著靠近。哈斯抬頭問我，這一切是不是我安排的。我沒有回答。就在那一瞬間，他的手從我的掌心滑走。我不知道那是因為我力氣用盡，還是因為我害怕承認真相。這個問題，將永遠跟著我。'},
    {number:24, chapter:'第五章：錯誤的人', title:'可可漂流瓶 24｜最後一次叫他哥哥', text:'哈斯受了重傷。莫納留在他身邊，我卻僵在原地。他最後仍叫莫納不要責怪我，說我只是太害怕失去。那是他最後一次替我辯解。我跪在旁邊喊他哥哥。這是我第一次心甘情願接受自己的身分，也是最後一次能讓他聽見。'},
    {number:25, chapter:'第五章：錯誤的人', title:'可可漂流瓶 25｜哈斯沒有醒來', text:'太陽下山前，哈斯再也沒有醒來。莫納替他闔上眼睛，沒有罵我，也沒有打我，只是安靜陪在他身旁。我曾以為，只要莫納消失，哈斯就會重新需要我。可最後離開的人卻是哈斯。是我的執念，把唯一想保護我的人帶走了。'},

    {number:26, chapter:'第六章：可可的真相', title:'可可漂流瓶 26｜我把他埋在海邊', text:'我們把哈斯安葬在能看見海的地方。莫納說，他喜歡海。我把那張舊照片放在他身旁。照片上的我們都還是孩子，那時候我還沒有愛錯他，也沒有讓一切走到無法挽回。如果時間能永遠停在照片裡，也許我們仍只是失散後重新相遇的兄妹。'},
    {number:27, chapter:'第六章：可可的真相', title:'可可漂流瓶 27｜莫納沒有離開我', text:'我以為莫納會把我獨自留在島上，可她沒有。她仍替我尋找食物，也仍在夜裡守火。我問她為什麼不恨我。她說，因為哈斯最後要她帶我離開。連離開後，他仍然在保護我，而我只能每天活在這份保護裡。'},
    {number:28, chapter:'第六章：可可的真相', title:'可可漂流瓶 28｜我真正恨的人', text:'我一直以為自己恨莫納，恨她冷靜、聰明，也恨她能站在哈斯身旁。現在我才明白，我真正憎恨的是無法改變身分的自己。莫納從來沒有奪走哈斯。是我不肯接受他的選擇，最後親手毀掉了所有人。'},
    {number:29, chapter:'第六章：可可的真相', title:'可可漂流瓶 29｜不是愛', text:'我曾把佔有當成愛，以為只要哈斯選擇我，就是幸福；以為所有靠近他的人都是敵人。可真正的愛不會要求一個人失去朋友，也不會要求他放棄自己的選擇。我所做的一切，不是因為愛得太深，只是因為我不願接受，他有權利不愛我。'},
    {number:30, chapter:'第六章：可可的真相', title:'可可漂流瓶 30｜寫給撿到瓶子的人', text:'如果你撿到這封信，請記住我的名字。我叫可可。我愛上了不該愛的人，而他也是我的哥哥哈斯。我嫉妒莫納，想讓她從我們之間消失，最後卻讓哈斯再也無法回來。不是莫納，不是荒島，也不是命運，是我。當愛開始要求奪走別人的自由時，那就已經不是愛，而是一座等待所有人墜落的陷阱。'}
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
    if (entry && Number.isFinite(Number(entry.cocoIndex))) return canonicalNumber(entry.cocoIndex, fallback);
    const match = String(entry?.title || '').match(/(?:漂流瓶\s*)?(\d{1,3})/);
    return match ? canonicalNumber(match[1], fallback) : canonicalNumber(fallback, 1);
  }

  function entryFor(number, original = {}) {
    const base = COCO_BOTTLES[canonicalNumber(number) - 1];
    return {
      ...original,
      ...base,
      icon:META.icon,
      series:META.series,
      rarity:META.rarity,
      cocoIndex:base.number,
      cocoCompleteSeries:true,
      at:original.at || Date.now()
    };
  }

  function normalizeCoco() {
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

  function nextBottleNumber(list) {
    const collected = new Set(list.map((entry, index) => numberFromEntry(entry, index + 1)));
    for (let number = 1; number <= META.count; number += 1) {
      if (!collected.has(number)) return number;
    }
    return 1 + Math.floor(Math.random() * META.count);
  }

  function createCocoBottle() {
    const list = read(KEY, []);
    const safeList = Array.isArray(list) ? list : [];
    const entry = entryFor(nextBottleNumber(safeList));
    safeList.push(entry);
    save(KEY, safeList.slice(-120));
    return entry;
  }

  function patchBottleRestore() {
    const restore = window.COFFEE_SHIP_BOTTLE_RESTORE;
    if (!restore) return;
    if (restore.META?.island) Object.assign(restore.META.island, META);
    if (restore.STORE) restore.STORE.island = KEY;
    restore.cocoCompleteSeries = COCO_BOTTLES;
    const current = restore.createFullBottle;
    if (typeof current === 'function' && !current.__cocoThirtyPatched) {
      const original = current;
      const wrapped = function(type) {
        return type === 'island' ? createCocoBottle() : original.call(this, type);
      };
      wrapped.__cocoThirtyPatched = true;
      restore.createFullBottle = wrapped;
    }
  }

  function patchBottleCore() {
    const core = window.COFFEE_SHIP_BOTTLE_CORE;
    if (!core) return;
    if (core.bottleSeries?.[KEY]) Object.assign(core.bottleSeries[KEY], META);
    const current = core.createBottle;
    if (typeof current === 'function' && !current.__cocoThirtyPatched) {
      const original = current;
      const wrapped = function(key, title, text) {
        const signature = `${key || ''} ${title || ''} ${text || ''}`;
        if (/coffeeShipIslandLetters|可可|哈斯|莫納|孤島/.test(signature)) return createCocoBottle();
        return original.call(this, key, title, text);
      };
      wrapped.__cocoThirtyPatched = true;
      core.createBottle = wrapped;
    }
  }

  function patchDatabase() {
    const db = window.COFFEE_SHIP_DB;
    if (!db) return;
    if (Array.isArray(db.bottles)) {
      let found = false;
      db.bottles = db.bottles.map(row => {
        if (!Array.isArray(row) || row[0] !== 'island') return row;
        found = true;
        return ['island', META.icon, META.series, META.rarity, COCO_BOTTLES[0].text];
      });
      if (!found) db.bottles.push(['island', META.icon, META.series, META.rarity, COCO_BOTTLES[0].text]);
    }
    db.cocoBottles = COCO_BOTTLES;
    db.createCocoBottle = createCocoBottle;
  }

  function patchRuntime() {
    patchBottleRestore();
    patchBottleCore();
    patchDatabase();
  }

  function init() {
    normalizeCoco();
    patchRuntime();
    setInterval(() => {
      normalizeCoco();
      patchRuntime();
    }, 1200);
  }

  window.COFFEE_SHIP_COCO_SERIES = {
    META,
    COCO_BOTTLES,
    getEntry:number => entryFor(number),
    createCocoBottle,
    normalizeCoco
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();