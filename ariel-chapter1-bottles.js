(() => {
  'use strict';

  const KEY = 'coffeeShipArielLetters';
  const META = { icon:'🧜‍♀️', series:'愛麗兒漂流瓶', rarity:'史詩' };
  const CHAPTER_ONE = [
    {
      title:'愛麗兒漂流瓶 01｜暴風雨裡的人類',
      text:'今天夜裡的海非常兇。浪像白色的牆，一次又一次拍碎在礁石上。我本來只是想靠近沉船看看，卻聽見有人類在海面上呼救。那是一個年輕的王子，他被斷裂的木板推著，臉色蒼白，像快要被海吞掉。我不該靠近人類，可是他的手還在微微動著。我把他托上海面，帶到最近的沙岸。天快亮時，他還沒有醒。我躲進礁石後面，只留下海藻遮住他的傷口。這是我第一次碰到人類的手，也是第一次覺得海岸離我那麼遙遠。'
    },
    {
      title:'愛麗兒漂流瓶 02｜他醒來以前',
      text:'我在岸邊守了很久。潮水退下去，又悄悄回來，他終於開始呼吸得比較平穩。清晨有一群人類從遠處跑來，我聽見他們喊他王子。原來他不是普通的人類。他們把他抱起來時，我差點游出去告訴他們，是我救了他。可是我沒有聲音可以給他聽，也沒有雙腳可以走到他面前。我只看見他短暫睜開眼睛，看向海的方向。那一瞬間，我以為他看見我了。我把這個念頭藏進心裡，像把珍珠藏進最深的貝殼。'
    },
    {
      title:'愛麗兒漂流瓶 03｜岸上的歌聲',
      text:'第三天，我又去了那片海岸。王子已經能站起來了，他坐在白色階梯上，旁邊有人替他換藥。他忽然笑了一下，所有圍著他的人也跟著笑。我不懂人類為什麼能把受傷說得像故事，能把疼痛藏在禮貌裡。後來他聽見遠處有女孩唱歌，便轉頭看了很久。那個女孩不是我，可是他眼裡的溫柔讓我心裡很安靜，也很痛。我開始想，如果我也能站在岸上，如果我也能讓他聽見我的聲音，他會不會記得暴風雨裡曾經有一雙手把他推回世界。'
    },
    {
      title:'愛麗兒漂流瓶 04｜每天經過的船',
      text:'王子的船重新修好了。從那天起，我每天都會游到航道旁，看它從海平線慢慢出現。船帆升起時像一片乾淨的雲，而他常常站在船頭，對港口的人揮手。他對孩子笑，對老人低頭，也會替陌生的女孩撿起被風吹走的絲巾。我本該高興他那麼善良，卻第一次知道心會因為善良而變得貪心。我想要他的溫柔只停在我身上，可是我甚至不曾真正站在他面前。我只是海裡一個不能開口的秘密，偷偷跟著他的船，假裝這也算陪伴。'
    },
    {
      title:'愛麗兒漂流瓶 05｜第一次心動',
      text:'今天他把一枚破掉的貝殼撿起來，放進口袋。那枚貝殼其實是我前幾天遺落在礁石上的。我不知道他是不是認出它來自那場暴風雨，也不知道他是不是只是隨手收藏。可是我看見他低頭看著貝殼時，眼神比看寶石還柔和。海水突然變得很亮，連魚群都像在替我保守秘密。我終於承認，我想再靠近他一點。不是因為他是王子，也不是因為他的人類世界閃閃發光，而是因為他在快要死去時，仍然抓住海面，像相信明天真的會來。'
    }
  ];

  function read(k, fb){ try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(fb)); } catch(e){ return fb; } }
  function save(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
  function numFromTitle(title, fallback){ const m = String(title || '').match(/(\d+)/); return m ? Number(m[1]) : fallback; }
  function chapterEntry(n){ const base = CHAPTER_ONE[(Math.max(1, n) - 1) % CHAPTER_ONE.length]; return { ...base, icon:META.icon, series:META.series, rarity:META.rarity, chapter:'第一章：相遇', arielChapter1:true, at:Date.now() }; }
  function normalizeAriel(){
    const list = read(KEY, []);
    if(!Array.isArray(list)) return;
    let changed = false;
    const next = list.map((x, idx) => {
      if(!x || typeof x !== 'object') return x;
      const n = numFromTitle(x.title, idx + 1);
      if(n >= 1 && n <= 5) { changed = true; return { ...x, ...chapterEntry(n), at:x.at || Date.now() }; }
      const y = { ...x };
      if(y.icon !== META.icon) { y.icon = META.icon; changed = true; }
      if(y.series !== META.series) { y.series = META.series; changed = true; }
      if(!y.rarity) { y.rarity = META.rarity; changed = true; }
      return y;
    });
    if(changed) save(KEY, next.slice(-120));
  }
  function createArielChapter1(){
    const list = read(KEY, []);
    const n = ((list.length) % CHAPTER_ONE.length) + 1;
    const entry = chapterEntry(n);
    list.push(entry);
    save(KEY, list.slice(-120));
    return entry;
  }
  function patchRuntime(){
    if(window.COFFEE_SHIP_BOTTLE_RESTORE) {
      window.COFFEE_SHIP_BOTTLE_RESTORE.arielChapterOne = CHAPTER_ONE;
      const oldCreate = window.COFFEE_SHIP_BOTTLE_RESTORE.createFullBottle;
      window.COFFEE_SHIP_BOTTLE_RESTORE.createFullBottle = type => type === 'ariel' ? createArielChapter1() : oldCreate(type);
    }
    if(window.COFFEE_SHIP_BOTTLE_CORE) {
      const old = window.COFFEE_SHIP_BOTTLE_CORE.createBottle;
      window.COFFEE_SHIP_BOTTLE_CORE.createBottle = (key, title, text) => /Ariel|愛麗兒/.test(`${key} ${title} ${text}`) ? createArielChapter1() : old(key, title, text);
    }
    if(window.COFFEE_SHIP_DB?.bottles) {
      window.COFFEE_SHIP_DB.bottles = window.COFFEE_SHIP_DB.bottles.map(row => Array.isArray(row) && row[0] === 'ariel' ? ['ariel', META.icon, META.series, META.rarity, CHAPTER_ONE[0].text] : row);
    }
  }
  function init(){ normalizeAriel(); patchRuntime(); setInterval(() => { normalizeAriel(); patchRuntime(); }, 1500); }
  window.COFFEE_SHIP_ARIEL_CHAPTER1 = { CHAPTER_ONE, createArielChapter1, normalizeAriel };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();