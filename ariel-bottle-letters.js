(() => {
  'use strict';

  const letters = [
    ['愛麗兒漂流瓶 01｜失去聲音的第一夜','我以為只要靠近他，就算沒有聲音也能被理解。可當海風穿過我的喉嚨，我才知道沉默原來這麼冷。'],
    ['愛麗兒漂流瓶 02｜岸上的腳步','每一步都像踩在碎浪上疼痛。我仍然微笑，因為我想讓他看見我的勇敢，而不是我為了他付出的代價。'],
    ['愛麗兒漂流瓶 03｜他的眼神','他看著我時很溫柔，卻像在看一個被海浪送來的謎。我想告訴他我的名字、我的歌、我的心，但我什麼都說不出來。'],
    ['愛麗兒漂流瓶 04｜沒有回答的晚餐','他問我是不是害怕人類的世界。我低頭笑了笑。真正讓我害怕的不是人類，而是他永遠不會知道我為什麼來到這裡。'],
    ['愛麗兒漂流瓶 05｜被誤認的愛','他把我的沉默當成乖巧，把我的忍耐當成天真。我多希望他愛上的不是一個安靜的影子，而是真正的我。'],
    ['愛麗兒漂流瓶 06｜另一個名字','今天他提起另一個人的名字，眼裡有我從未見過的光。我才明白，我交出去的聲音，並沒有換來他的心。'],
    ['愛麗兒漂流瓶 07｜王子的背影','他離開時沒有回頭。我站在岸邊，看著浪花一次次靠近，又一次次退回去。原來海比人類更懂得告別。'],
    ['愛麗兒漂流瓶 08｜悔恨','如果能重來，我還會救他嗎？我想我仍會。但我不該把自己的全部交給一個只記得被救，卻忘了看見我的人。'],
    ['愛麗兒漂流瓶 09｜不解','我不懂，為什麼我的愛像潮水一樣真實，對他而言卻只是短暫的浪聲。他曾握住我的手，為何又能那麼輕易放開？'],
    ['愛麗兒漂流瓶 10｜沉默的怒意','我曾以為愛是犧牲。現在我開始懷疑，那只是我太年輕，把自己的痛包裝成浪漫。'],
    ['愛麗兒漂流瓶 11｜回望海底','我想念海底的歌，想念那些不需要解釋就懂我的族人。也許我失去的不是聲音，而是相信自己值得被完整愛著的勇氣。'],
    ['愛麗兒漂流瓶 12｜最後一封給王子','如果這封信漂到你手中，請你記得：我不是一段奇遇，也不是你故事裡沉默的女孩。我是愛過你、失去聲音、也終於學會放過自己的美人魚。']
  ];
  let lock = false;

  function isDeckOpen() {
    const deck = document.getElementById('deckOverlay');
    return deck && !deck.classList.contains('hidden');
  }

  function addStyle() {
    if (document.getElementById('arielBottleStyle')) return;
    const style = document.createElement('style');
    style.id = 'arielBottleStyle';
    style.textContent = '.ariel-card{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);z-index:47;background:rgba(30,13,28,.98);border:3px solid #e9a6b0;border-radius:18px;padding:16px;color:#fff4d8;text-align:left;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.32);line-height:1.65;max-width:92%;pointer-events:none}.ariel-card.hidden{display:none}.ariel-title{text-align:center;font-size:21px;margin-bottom:8px;color:#e9a6b0}.ariel-text{padding:10px;border:2px solid #76536a;border-radius:12px;background:#1a1220}@media(max-width:760px){.ariel-card{position:fixed;top:38%;width:min(88vw,360px);max-height:58dvh;overflow-y:auto;padding:14px}}';
    document.head.appendChild(style);
  }

  function ensureCard() {
    const panel = document.getElementById('gamePanel');
    if (!panel || document.getElementById('arielCard')) return;
    if (getComputedStyle(panel).position === 'static') panel.style.position = 'relative';
    const card = document.createElement('div');
    card.id = 'arielCard';
    card.className = 'ariel-card hidden';
    panel.appendChild(card);
  }

  function saveRead(title, text) {
    let list = [];
    try { list = JSON.parse(localStorage.getItem('coffeeShipArielLetters') || '[]'); } catch (e) {}
    if (!list.some(x => x.title === title)) list.push({ title, text, at: Date.now() });
    localStorage.setItem('coffeeShipArielLetters', JSON.stringify(list.slice(-30)));
  }

  function showLetter() {
    const card = document.getElementById('arielCard');
    if (!card) return;
    const entry = letters[Math.floor(Math.random() * letters.length)];
    saveRead(entry[0], entry[1]);
    card.innerHTML = `<div class="ariel-title">🧜‍♀️ ${entry[0]}</div><div class="ariel-text">${entry[1]}</div>`;
    card.classList.remove('hidden');
    setTimeout(() => card.classList.add('hidden'), 7600);
  }

  function tryAriel(event) {
    if (!isDeckOpen() || lock) return false;
    if (Math.random() > 0.13) return false;
    lock = true;
    event?.preventDefault?.();
    event?.stopImmediatePropagation?.();
    setTimeout(() => {
      showLetter();
      lock = false;
    }, 700 + Math.random() * 900);
    return true;
  }

  function bind() {
    window.addEventListener('keydown', event => {
      const k = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (k === 'f' || k === 'c') tryAriel(event);
    }, true);
    document.getElementById('coffeeBtn')?.addEventListener('click', event => tryAriel(event), true);
  }

  function init() {
    addStyle();
    ensureCard();
    bind();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
