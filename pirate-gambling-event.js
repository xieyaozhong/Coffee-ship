(() => {
  'use strict';
  if (window.__COFFEE_SHIP_PIRATE_GAMBLING_V2__) return;
  window.__COFFEE_SHIP_PIRATE_GAMBLING_V2__ = true;

  const ID = 'pirateGamblingEvent';
  const STATE = 'coffeeShipPirateGamblingState';
  const BETS = [10, 25, 50, 100, 250, 500];
  const WAIT_CASTS = 5;
  const WAIT_MS = 120000;
  const CHANCE = .075;
  const STAY = 75;

  const GAMES = {
    dice: {
      icon: '🎲',
      name: '骷髏骰盅',
      tag: '猜點數',
      text: '猜大、猜小返還 2 倍；押中七點返還 5 倍。'
    },
    coin: {
      icon: '🪙',
      name: '黑旗硬幣',
      tag: '二選一',
      text: '選王冠或骷髏，猜中返還 2 倍。'
    },
    chest: {
      icon: '🧰',
      name: '三箱藏寶',
      tag: '選寶箱',
      text: '三箱分別藏著空箱、2 倍與 5 倍獎金。'
    },
    blackjack: {
      icon: '🃏',
      name: '黑帆二十一點',
      tag: '紙牌對決',
      text: '勝利返還 2 倍，天然 21 點返還 2.5 倍。'
    }
  };

  const SUITS = ['♠', '♥', '♦', '♣'];
  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  let visit = null;
  let timer = 0;

  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  };

  const save = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  };

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);

  const fmt = value => Math.max(0, Math.floor(Number(value) || 0)).toLocaleString('zh-TW');
  const eco = () => window.COFFEE_SHIP_ECONOMY || null;
  const balance = () => eco()?.balance?.() ?? Math.max(0, Number(localStorage.getItem('coffeeShipPearls') || 0));

  function spend(amount, reason) {
    if (eco()?.spend) return eco().spend(amount, reason, { source: 'pirate-gambling' });
    const current = balance();
    if (current < amount) return { ok: false, needed: amount - current };
    const next = current - amount;
    localStorage.setItem('coffeeShipPearls', String(next));
    window.dispatchEvent(new CustomEvent('coffeeShipPearlsChanged', { detail: { balance: next, pearls: next, delta: -amount, reason } }));
    return { ok: true, spent: amount, balance: next };
  }

  function earn(amount, reason) {
    if (eco()?.earn) return eco().earn(amount, reason, { source: 'pirate-gambling' });
    const next = balance() + amount;
    localStorage.setItem('coffeeShipPearls', String(next));
    window.dispatchEvent(new CustomEvent('coffeeShipPearlsChanged', { detail: { balance: next, pearls: next, delta: amount, reason } }));
    return next;
  }

  function stats() {
    const state = read(STATE, { casts: 99, last: 0, visits: 0, rounds: 0, wins: 0, losses: 0, ties: 0, biggest: 0 });
    for (const key of Object.keys(state)) state[key] = Math.max(0, Number(state[key] || 0));
    return state;
  }

  function record(result, payout) {
    const state = stats();
    state.rounds += 1;
    state[result === 'win' ? 'wins' : result === 'tie' ? 'ties' : 'losses'] += 1;
    state.biggest = Math.max(state.biggest, payout || 0);
    save(STATE, state);
  }

  const deckOpen = () => !!window.COFFEE_SHIP_DECK?.isDeckOpen?.();
  const busy = () => document.body.classList.contains('sea-merchant-open') ||
    document.body.classList.contains('pirate-gambling-open') ||
    !!document.querySelector('#seaMerchantEvent:not(.hidden)');
  const chance = () => eco()?.eventChance?.(CHANCE, 'special') ?? CHANCE;
  const randomGame = () => Object.keys(GAMES)[Math.floor(Math.random() * Object.keys(GAMES).length)];

  function log(title, text, icon = '🏴‍☠️') {
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({
      castId: visit?.castId || `pirate_${Date.now()}`,
      eventId: `pirate:${visit?.gameType || 'ship'}`,
      eventKind: 'special',
      title: `海盜賭局｜${title}`,
      icon,
      accent: '#d96b72',
      text
    });
  }

  function panel() {
    let element = document.getElementById(ID);
    if (!element) {
      element = document.createElement('aside');
      element.id = ID;
      element.className = 'hidden';
      element.setAttribute('role', 'dialog');
      element.setAttribute('aria-modal', 'true');
      element.setAttribute('aria-label', '海盜賭博事件');
      document.body.appendChild(element);
    }
    return element;
  }

  const bet = () => Number(visit?.bet || 25);
  const featured = () => GAMES[visit?.gameType] || GAMES.dice;

  function header() {
    return `<header class="pg-head"><div class="pg-heading"><span class="pg-skull">🏴‍☠️</span><div><b>黑帆賭船</b><small>船長賽德：「珍珠上桌，故事才開始。」</small></div></div><button data-pg-close aria-label="關閉海盜賭局">✕</button></header><div class="pg-bar"><span id="pgTimer">停留 ${Math.max(0, visit.time)} 秒</span><strong>🦪 <span id="pgWallet">${fmt(balance())}</span></strong></div>`;
  }

  function menu() {
    const game = featured();
    return `<section class="pg-feature"><div class="pg-feature-top"><span class="pg-feature-icon">${game.icon}</span><div><span class="pg-tag">本次賭局・${game.tag}</span><h3>${esc(game.name)}</h3><p>${esc(game.text)}</p></div></div><div class="pg-bet-label">選擇下注額</div><div class="pg-bets">${BETS.map(amount => `<button class="${amount === bet() ? 'active' : ''}" data-pg-bet="${amount}">🦪 ${fmt(amount)}</button>`).join('')}</div><button class="pg-primary" data-pg-start="${visit.gameType}">開始 ${esc(game.name)}・下注 🦪 ${fmt(bet())}</button><p class="pg-note" id="pgNote">這次賭船只開放這一種賭局；下一次相遇會重新隨機抽選。</p></section>`;
  }

  function dice(game) {
    return `<section class="pg-table"><h3>🎲 骷髏骰盅</h3><p>下注 🦪 ${fmt(game.bet)}｜2–6 小、8–12 大、七點特殊押注</p><div class="pg-choices"><button data-pg-dice="small">🌊 小<small>返還 ×2</small></button><button data-pg-dice="seven">💀 七點<small>返還 ×5</small></button><button data-pg-dice="big">🔥 大<small>返還 ×2</small></button></div></section>`;
  }

  function coin(game) {
    return `<section class="pg-table"><h3>🪙 黑旗硬幣</h3><p>下注 🦪 ${fmt(game.bet)}｜猜中返還 2 倍</p><div class="pg-choices two"><button data-pg-coin="crown">👑 王冠<small>海盜王正面</small></button><button data-pg-coin="skull">💀 骷髏<small>黑帆旗背面</small></button></div></section>`;
  }

  function chest(game) {
    return `<section class="pg-table"><h3>🧰 三箱藏寶</h3><p>下注 🦪 ${fmt(game.bet)}｜空箱、2 倍與 5 倍各一箱</p><div class="pg-chests">${[0, 1, 2].map(index => `<button data-pg-chest="${index}">🔒<small>${index + 1} 號箱</small></button>`).join('')}</div></section>`;
  }

  function makeDeck() {
    const cards = [];
    for (const suit of SUITS) for (const rank of RANKS) cards.push({ suit, rank });
    for (let index = cards.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [cards[index], cards[target]] = [cards[target], cards[index]];
    }
    return cards;
  }

  const cardValue = card => card.rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(card.rank) ? 10 : Number(card.rank);

  function handValue(cards) {
    let value = cards.reduce((sum, card) => sum + cardValue(card), 0);
    let aces = cards.filter(card => card.rank === 'A').length;
    while (value > 21 && aces > 0) { value -= 10; aces -= 1; }
    return value;
  }

  function cardHtml(card, hidden = false) {
    if (hidden) return '<span class="pg-card back">?</span>';
    const red = card.suit === '♥' || card.suit === '♦';
    return `<span class="pg-card ${red ? 'red' : ''}">${card.rank}<br>${card.suit}</span>`;
  }

  function blackjack(game) {
    return `<section class="pg-table"><h3>🃏 黑帆二十一點</h3><p>下注 🦪 ${fmt(game.bet)}｜莊家 17 點以上停牌</p><div class="pg-hand"><b>海盜莊家：${game.reveal ? handValue(game.dealer) : `${cardValue(game.dealer[0])}+?`} 點</b><div>${game.dealer.map((card, index) => cardHtml(card, !game.reveal && index === 1)).join('')}</div></div><div class="pg-hand"><b>你的牌：${handValue(game.player)} 點</b><div>${game.player.map(card => cardHtml(card)).join('')}</div></div><div class="pg-actions"><button data-pg-blackjack="hit">再要一張</button><button data-pg-blackjack="stand">停牌比點</button></div></section>`;
  }

  function gameView() {
    const game = visit.game;
    if (game.type === 'dice') return dice(game);
    if (game.type === 'coin') return coin(game);
    if (game.type === 'chest') return chest(game);
    return blackjack(game);
  }

  function resultView() {
    const result = visit.result;
    const net = result.net < 0 ? `損失 🦪 ${fmt(-result.net)}` : result.net > 0 ? `淨獲利 🦪 ${fmt(result.net)}` : '下注原額返還';
    return `<section class="pg-result"><i>${result.icon}</i><h3>${esc(result.title)}</h3><p>${esc(result.text)}</p><strong>${net}</strong><button data-pg-return>${visit.expired ? '看完結果並離開' : `再玩一次 ${esc(featured().name)}`}</button></section>`;
  }

  function render() {
    if (!visit) return;
    const content = visit.screen === 'menu' ? menu() : visit.screen === 'game' ? gameView() : resultView();
    panel().innerHTML = `<section class="pg-shell">${header()}<main class="pg-body">${content}</main><footer><span>本次只開放 ${featured().icon} ${esc(featured().name)}</span><button data-pg-close>離開賭船</button></footer></section>`;
  }

  function note(text, bad = false) {
    const node = document.getElementById('pgNote');
    if (!node) return;
    node.textContent = text;
    node.classList.toggle('bad', bad);
  }

  function updateWallet() {
    const node = document.getElementById('pgWallet');
    if (node) node.textContent = fmt(balance());
  }

  function start(type) {
    if (!visit || visit.screen !== 'menu' || type !== visit.gameType) return;
    const wager = bet();
    const payment = spend(wager, `海盜賭局：${featured().name}`);
    if (!payment.ok) {
      note(`珍珠不足，還差 ${fmt(payment.needed || wager)} 顆。`, true);
      return;
    }

    const game = { type, bet: wager };
    if (type === 'blackjack') {
      game.deck = makeDeck();
      game.player = [game.deck.pop(), game.deck.pop()];
      game.dealer = [game.deck.pop(), game.deck.pop()];
      game.reveal = false;
    }
    visit.game = game;
    visit.screen = 'game';
    render();
    if (type === 'blackjack' && handValue(game.player) === 21) setTimeout(resolveNatural, 250);
  }

  function finish(title, text, icon, payout = 0, resultType = 'loss') {
    const wager = visit.game.bet;
    if (payout) earn(payout, `海盜賭局獎金：${title}`);
    const net = payout - wager;
    record(resultType, payout);
    log(title, `${text}\n下注：🦪 ${fmt(wager)}\n返還：🦪 ${fmt(payout)}\n淨結果：${net >= 0 ? '+' : '-'}${fmt(Math.abs(net))} 珍珠`, icon);
    visit.result = { title, text, icon, payout, net };
    visit.game = null;
    visit.screen = 'result';
    render();
  }

  function playDice(choice) {
    const first = 1 + Math.floor(Math.random() * 6);
    const second = 1 + Math.floor(Math.random() * 6);
    const sum = first + second;
    const success = choice === 'seven' ? sum === 7 : choice === 'small' ? sum <= 6 : sum >= 8;
    const multiplier = choice === 'seven' ? 5 : 2;
    const label = { small: '小', seven: '七點', big: '大' }[choice];
    finish(success ? '骰盅猜中' : '骰盅落空', `骰子擲出 ${first}＋${second}＝${sum} 點，你押「${label}」。`, success ? '🎲' : '💀', success ? visit.game.bet * multiplier : 0, success ? 'win' : 'loss');
  }

  function playCoin(choice) {
    const outcome = Math.random() < .5 ? 'crown' : 'skull';
    const success = outcome === choice;
    const labels = { crown: '王冠', skull: '骷髏' };
    finish(success ? '硬幣猜中' : '硬幣猜錯', `硬幣落下是「${labels[outcome]}」面，你選「${labels[choice]}」。`, outcome === 'crown' ? '👑' : '💀', success ? visit.game.bet * 2 : 0, success ? 'win' : 'loss');
  }

  function playChest(index) {
    const outcomes = [0, 2, 5];
    for (let cursor = outcomes.length - 1; cursor > 0; cursor -= 1) {
      const target = Math.floor(Math.random() * (cursor + 1));
      [outcomes[cursor], outcomes[target]] = [outcomes[target], outcomes[cursor]];
    }
    const multiplier = outcomes[index];
    const title = multiplier === 5 ? '開出海盜寶藏' : multiplier === 2 ? '開出雙倍珍珠' : '開到空寶箱';
    finish(title, `第 ${index + 1} 號寶箱的倍率是 ×${multiplier}。`, multiplier === 5 ? '💎' : multiplier === 2 ? '🦪' : '🕸️', visit.game.bet * multiplier, multiplier ? 'win' : 'loss');
  }

  function resolveNatural() {
    const game = visit?.game;
    if (!game || game.type !== 'blackjack') return;
    game.reveal = true;
    if (handValue(game.dealer) === 21) finish('雙方黑傑克', '你與莊家同時拿到天然 21 點。', '🃏', game.bet, 'tie');
    else finish('天然黑傑克', '起手兩張牌剛好 21 點。', '🌟', Math.floor(game.bet * 2.5), 'win');
  }

  function hit() {
    const game = visit?.game;
    if (!game || game.type !== 'blackjack') return;
    game.player.push(game.deck.pop());
    const value = handValue(game.player);
    if (value > 21) finish('二十一點爆牌', `你的牌面合計 ${value} 點。`, '💥', 0, 'loss');
    else if (value === 21) stand();
    else render();
  }

  function stand() {
    const game = visit?.game;
    if (!game || game.type !== 'blackjack') return;
    game.reveal = true;
    while (handValue(game.dealer) < 17) game.dealer.push(game.deck.pop());
    const player = handValue(game.player);
    const dealer = handValue(game.dealer);
    if (dealer > 21 || player > dealer) finish('二十一點勝利', `你的 ${player} 點擊敗莊家的 ${dealer} 點。`, '🏆', game.bet * 2, 'win');
    else if (player === dealer) finish('二十一點平手', `雙方都是 ${player} 點。`, '🤝', game.bet, 'tie');
    else finish('二十一點落敗', `你的 ${player} 點不敵莊家的 ${dealer} 點。`, '💀', 0, 'loss');
  }

  function back() {
    if (visit.expired) return close('黑帆賭船駛向夜色');
    visit.result = null;
    visit.screen = 'menu';
    render();
  }

  function close(message = '海盜賭船駛離') {
    if (visit?.screen === 'game') return false;
    clearInterval(timer);
    timer = 0;
    panel().classList.add('hidden');
    document.body.classList.remove('pirate-gambling-open');
    if (visit) setTimeout(() => window.COFFEE_SHIP_DECK?.showTip?.(`🏴‍☠️ ${message}`, 1600), 20);
    visit = null;
    return true;
  }

  function countdown() {
    clearInterval(timer);
    timer = setInterval(() => {
      if (!visit) return clearInterval(timer);
      visit.time -= 1;
      const node = document.getElementById('pgTimer');
      if (visit.time <= 0) {
        visit.expired = true;
        if (visit.screen === 'menu') return close('黑帆賭船消失在濃霧中');
        if (node) node.textContent = '完成目前賭局後，賭船就會離開';
      } else if (node) {
        node.textContent = `停留 ${visit.time} 秒`;
      }
    }, 1000);
  }

  function open(castId, forced = false, forcedGame = null) {
    if (visit || !deckOpen() || busy()) return false;
    const gameType = GAMES[forcedGame] ? forcedGame : randomGame();
    visit = {
      castId: castId || `pirate_${Date.now()}`,
      gameType,
      bet: 25,
      time: STAY,
      screen: 'menu',
      game: null,
      result: null,
      expired: false
    };
    const state = stats();
    state.casts = 0;
    state.last = Date.now();
    state.visits += 1;
    save(STATE, state);
    render();
    panel().classList.remove('hidden');
    document.body.classList.add('pirate-gambling-open');
    log('黑帆賭船靠近', `海盜船長賽德今天只開放「${featured().name}」。`, featured().icon);
    countdown();
    if (forced) note('測試模式：本次賭局由系統手動開啟。');
    return true;
  }

  function fishing(event) {
    const detail = event.detail || {};
    if (!detail.item || !detail.castId) return;
    const state = stats();
    state.casts += 1;
    save(STATE, state);
    if (visit || !deckOpen() || busy() || state.casts < WAIT_CASTS || Date.now() - state.last < WAIT_MS || Math.random() > chance()) return;
    setTimeout(() => open(detail.castId), 650);
  }

  function bind() {
    document.addEventListener('click', event => {
      if (!event.target.closest?.(`#${ID}`)) return;
      const betButton = event.target.closest('[data-pg-bet]');
      if (betButton && visit?.screen === 'menu') {
        visit.bet = Number(betButton.dataset.pgBet) || 25;
        render();
        return;
      }
      const startButton = event.target.closest('[data-pg-start]');
      if (startButton) return start(startButton.dataset.pgStart);
      const diceButton = event.target.closest('[data-pg-dice]');
      if (diceButton) return playDice(diceButton.dataset.pgDice);
      const coinButton = event.target.closest('[data-pg-coin]');
      if (coinButton) return playCoin(coinButton.dataset.pgCoin);
      const chestButton = event.target.closest('[data-pg-chest]');
      if (chestButton) return playChest(Number(chestButton.dataset.pgChest));
      const blackjackButton = event.target.closest('[data-pg-blackjack]');
      if (blackjackButton) return blackjackButton.dataset.pgBlackjack === 'hit' ? hit() : stand();
      if (event.target.closest('[data-pg-return]')) return back();
      if (event.target.closest('[data-pg-close]')) close('海盜船長向你揮帽告別');
    }, true);

    window.addEventListener('coffee-ship:fishing-result', fishing);
    window.addEventListener('coffee-ship:scene', event => {
      if (event.detail?.scene !== 'deck' && visit && visit.screen !== 'game') close('賭船離開目前海域');
    });
    window.addEventListener('coffee-ship:economy-changed', updateWallet);
  }

  function init() {
    panel();
    bind();
    window.COFFEE_SHIP_PIRATE_GAMBLING = {
      open: gameType => open(window.COFFEE_SHIP_FISHING_API?.getCurrentCastId?.() || `pirate_test_${Date.now()}`, true, gameType),
      close,
      state: stats,
      games: GAMES,
      version: 2
    };
    window.dispatchEvent(new CustomEvent('coffee-ship:pirate-gambling-ready', { detail: { games: 4, oneGamePerVisit: true, version: 2 } }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
