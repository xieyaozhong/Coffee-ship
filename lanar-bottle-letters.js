(() => {
  'use strict';

  const letters = [
    ['拉納爾漂流瓶 01｜黑潮巨鰭獸','我是海洋學家拉納爾。第一晚，黑潮裡升起像帆一樣的巨鰭，它跟著我的小船滑行了三十分鐘。我關掉燈，才躲過牠的注視。'],
    ['拉納爾漂流瓶 02｜玻璃鯨','玻璃鯨的身體幾乎透明，骨骼像月光。我本想靠近觀察，牠卻用低鳴震裂船窗。我的筆記全濕了，但我活下來了。'],
    ['拉納爾漂流瓶 03｜紅眼海蛇','紅眼海蛇繞住浮標，像在測量我的恐懼。牠沒有攻擊，只把頭貼近水面，盯著我手裡的羅盤。羅盤從那刻起就失準了。'],
    ['拉納爾漂流瓶 04｜深淵鐘水母','我遇見一群像鐘的水母，牠們每次發光，海面就安靜一秒。我的耳朵開始聽見不存在的鐘聲，只能立刻返航。'],
    ['拉納爾漂流瓶 05｜白骨章魚','白骨章魚把觸手伸上船邊，像一排會動的肋骨。我丟下採樣箱引開牠，才保住船身。海底一定藏著更大的個體。'],
    ['拉納爾漂流瓶 06｜燈塔鮟鱇','遠處有光，我以為是燈塔。靠近後才發現那是鮟鱇魚額前的誘餌。牠的嘴張開時，我看見裡面像一條黑色隧道。'],
    ['拉納爾漂流瓶 07｜沉船背脊獸','一座沉船突然移動，木板下露出背脊。原來整艘船長在巨獸身上。我不敢想牠背上還載過多少人的故事。'],
    ['拉納爾漂流瓶 08｜星斑巨魟','星斑巨魟從船底掠過，陰影蓋住整片海。牠沒有惡意，但掀起的浪差點把我翻進海裡。牠像一片會呼吸的夜空。'],
    ['拉納爾漂流瓶 09｜裂牙鯨鯊','裂牙鯨鯊撞上船尾，像是在警告我別再前進。牠身上有舊魚叉，我第一次覺得巨獸也可能只是受傷的旅人。'],
    ['拉納爾漂流瓶 10｜幽藍海馬群','幽藍海馬群圍住我的船，排列成螺旋。牠們引我避開暗礁，卻在離開前留下像哭聲的共鳴。'],
    ['拉納爾漂流瓶 11｜鐵殼帝王蟹','鐵殼帝王蟹爬上礁石，鉗子夾碎了我的錨鏈。我只能割斷繩索。牠的殼上長著古老船名。'],
    ['拉納爾漂流瓶 12｜霧冠海龍','霧冠海龍在晨霧裡出現，身長像一條港口。牠沿著船邊游過時，所有儀器同時停擺。'],
    ['拉納爾漂流瓶 13｜倒影人魚','我看見人魚在水面下模仿我的動作。當我低頭記錄時，倒影裡的我沒有同步抬頭。那不是人魚，是某種會借臉的生物。'],
    ['拉納爾漂流瓶 14｜巨口翻車魚','巨口翻車魚看似笨重，卻能突然垂直升起。牠吞下整片發光浮游生物，周圍瞬間黑得像沒有星星。'],
    ['拉納爾漂流瓶 15｜夜潮猿魚','夜潮猿魚會敲擊船底，節奏像求救。我差點回敲，幸好助手阻止我。牠們會模仿人類的訊號。'],
    ['拉納爾漂流瓶 16｜銀骨飛鯊','銀骨飛鯊躍出海面，越過船桅。牠落水時掀起的浪把實驗瓶全部打碎，只剩這張濕透的紀錄。'],
    ['拉納爾漂流瓶 17｜黑月海龜','黑月海龜背上像背著一小片島。牠靠近時，我聽見樹林聲與鳥叫聲。也許有些島其實從來不是島。'],
    ['拉納爾漂流瓶 18｜千眼鰻群','千眼鰻群在深水下睜開光點，我的船像漂在星空上方。當牠們一起眨眼，我失去了一分鐘記憶。'],
    ['拉納爾漂流瓶 19｜古王鯨','古王鯨的歌聲從海底傳來，我的心跳被迫跟著節奏走。若牠再唱久一點，我可能會忘記自己是誰。'],
    ['拉納爾漂流瓶 20｜無名深海巨獸','最後一種我無法命名。牠沒有完全浮出水面，只露出一隻眼。那隻眼比我的船還大。請保存這些紀錄，別讓我白白追到這裡。']
  ];
  const colors = { normal:'#9ce8f0', rare:'#ffe16b' };
  let lock = false;

  function isDeckOpen() {
    const deck = document.getElementById('deckOverlay');
    return deck && !deck.classList.contains('hidden');
  }

  function addStyle() {
    if (document.getElementById('lanarBottleStyle')) return;
    const style = document.createElement('style');
    style.id = 'lanarBottleStyle';
    style.textContent = '.lanar-card{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);z-index:46;background:rgba(13,16,30,.98);border:3px solid #9ce8f0;border-radius:18px;padding:16px;color:#fff4d8;text-align:left;font-weight:900;box-shadow:0 12px 0 rgba(0,0,0,.32);line-height:1.65;max-width:92%;pointer-events:none}.lanar-card.hidden{display:none}.lanar-title{text-align:center;font-size:21px;margin-bottom:8px;color:#9ce8f0}.lanar-text{padding:10px;border:2px solid #375f79;border-radius:12px;background:#101827}@media(max-width:760px){.lanar-card{position:fixed;top:38%;width:min(88vw,360px);max-height:58dvh;overflow-y:auto;padding:14px}}';
    document.head.appendChild(style);
  }

  function ensureCard() {
    const panel = document.getElementById('gamePanel');
    if (!panel || document.getElementById('lanarCard')) return;
    if (getComputedStyle(panel).position === 'static') panel.style.position = 'relative';
    const card = document.createElement('div');
    card.id = 'lanarCard';
    card.className = 'lanar-card hidden';
    panel.appendChild(card);
  }

  function saveRead(title, text) {
    let list = [];
    try { list = JSON.parse(localStorage.getItem('coffeeShipLanarLetters') || '[]'); } catch (e) {}
    if (!list.some(x => x.title === title)) list.push({ title, text, at: Date.now() });
    localStorage.setItem('coffeeShipLanarLetters', JSON.stringify(list.slice(-40)));
  }

  function showLetter() {
    const card = document.getElementById('lanarCard');
    if (!card) return;
    const entry = letters[Math.floor(Math.random() * letters.length)];
    saveRead(entry[0], entry[1]);
    card.innerHTML = `<div class="lanar-title">🌊 ${entry[0]}</div><div class="lanar-text">${entry[1]}</div>`;
    card.classList.remove('hidden');
    setTimeout(() => card.classList.add('hidden'), 7600);
  }

  function tryLanar(event) {
    if (!isDeckOpen() || lock) return false;
    if (Math.random() > 0.16) return false;
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
      if (k === 'f' || k === 'c') tryLanar(event);
    }, true);
    document.getElementById('coffeeBtn')?.addEventListener('click', event => tryLanar(event), true);
  }

  function init() {
    addStyle();
    ensureCard();
    bind();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
