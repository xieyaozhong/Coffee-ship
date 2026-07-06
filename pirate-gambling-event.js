(() => {
  'use strict';
  if (window.__COFFEE_SHIP_PIRATE_GAMBLING_V1__) return;
  window.__COFFEE_SHIP_PIRATE_GAMBLING_V1__ = true;

  const ID='pirateGamblingEvent', STATE='coffeeShipPirateGamblingState';
  const BETS=[10,25,50,100,250,500], WAIT_CASTS=5, WAIT_MS=120000, CHANCE=.075, STAY=75;
  const GAMES={
    dice:{icon:'🎲',name:'骷髏骰盅',text:'猜大、猜小返還 2 倍；押中七點返還 5 倍。'},
    coin:{icon:'🪙',name:'黑旗硬幣',text:'選王冠或骷髏，猜中返還 2 倍。'},
    chest:{icon:'🧰',name:'三箱藏寶',text:'三箱分別藏著空箱、2 倍與 5 倍獎金。'},
    blackjack:{icon:'🃏',name:'黑帆二十一點',text:'勝利返還 2 倍，天然 21 點返還 2.5 倍。'}
  };
  const SUITS=['♠','♥','♦','♣'], RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  let visit=null,timer=0;

  const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f));}catch{return f;}};
  const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}};
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const fmt=v=>Math.max(0,Math.floor(Number(v)||0)).toLocaleString('zh-TW');
  const eco=()=>window.COFFEE_SHIP_ECONOMY||null;
  const balance=()=>eco()?.balance?.()??Math.max(0,Number(localStorage.getItem('coffeeShipPearls')||0));
  function spend(n,why){if(eco()?.spend)return eco().spend(n,why,{source:'pirate-gambling'});const b=balance();if(b<n)return{ok:false,needed:n-b};localStorage.setItem('coffeeShipPearls',String(b-n));return{ok:true,spent:n,balance:b-n};}
  function earn(n,why){if(eco()?.earn)return eco().earn(n,why,{source:'pirate-gambling'});localStorage.setItem('coffeeShipPearls',String(balance()+n));}
  function stats(){const s=read(STATE,{casts:99,last:0,visits:0,rounds:0,wins:0,losses:0,ties:0,biggest:0});for(const k of Object.keys(s))s[k]=Math.max(0,Number(s[k]||0));return s;}
  function record(result,payout){const s=stats();s.rounds++;s[result==='win'?'wins':result==='tie'?'ties':'losses']++;s.biggest=Math.max(s.biggest,payout||0);save(STATE,s);}
  const deckOpen=()=>!!window.COFFEE_SHIP_DECK?.isDeckOpen?.();
  const busy=()=>document.body.classList.contains('sea-merchant-open')||document.body.classList.contains('pirate-gambling-open')||!!document.querySelector('#seaMerchantEvent:not(.hidden)');
  const chance=()=>eco()?.eventChance?.(CHANCE,'special')??CHANCE;
  function log(title,text,icon='🏴‍☠️'){window.COFFEE_SHIP_FISHING_API?.pushEvent?.({castId:visit?.castId||`pirate_${Date.now()}`,eventKind:'special',title:`海盜賭局｜${title}`,icon,accent:'#d96b72',text});}

  function panel(){let el=document.getElementById(ID);if(!el){el=document.createElement('aside');el.id=ID;el.className='hidden';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.appendChild(el);}return el;}
  const bet=()=>Number(visit?.bet||25);
  function header(){return `<header class="pg-head"><div><b>🏴‍☠️ 黑帆賭船・船長賽德</b><small>「珍珠上桌，故事才開始。」</small></div><button data-pg-close>關閉</button></header><div class="pg-bar"><span id="pgTimer">停留 ${Math.max(0,visit.time)} 秒</span><strong>🦪 <span id="pgWallet">${fmt(balance())}</span></strong></div>`;}
  function menu(){return `<p class="pg-copy">選擇下注額，再挑一種可互動賭局。</p><div class="pg-bets">${BETS.map(n=>`<button class="${n===bet()?'active':''}" data-pg-bet="${n}">🦪 ${fmt(n)}</button>`).join('')}</div><div class="pg-games">${Object.entries(GAMES).map(([id,g])=>`<article><i>${g.icon}</i><h4>${g.name}</h4><p>${g.text}</p><button data-pg-start="${id}">下注 🦪 ${fmt(bet())}</button></article>`).join('')}</div><p class="pg-note" id="pgNote">每局會先扣除下注；勝利金額包含返還的本金。</p>`;}
  function dice(g){return `<section class="pg-table"><h3>🎲 骷髏骰盅</h3><p>下注 🦪 ${fmt(g.bet)}｜2–6 小、8–12 大、七點特殊押注</p><div class="pg-choices"><button data-pg-dice="small">🌊 小<br><small>×2</small></button><button data-pg-dice="seven">💀 七點<br><small>×5</small></button><button data-pg-dice="big">🔥 大<br><small>×2</small></button></div></section>`;}
  function coin(g){return `<section class="pg-table"><h3>🪙 黑旗硬幣</h3><p>下注 🦪 ${fmt(g.bet)}｜猜中返還 2 倍</p><div class="pg-choices two"><button data-pg-coin="crown">👑 王冠</button><button data-pg-coin="skull">💀 骷髏</button></div></section>`;}
  function chest(g){return `<section class="pg-table"><h3>🧰 三箱藏寶</h3><p>下注 🦪 ${fmt(g.bet)}｜空箱、2 倍與 5 倍各一箱</p><div class="pg-chests">${[0,1,2].map(i=>`<button data-pg-chest="${i}">🔒<small>${i+1} 號箱</small></button>`).join('')}</div></section>`;}
  function makeDeck(){const d=[];for(const s of SUITS)for(const r of RANKS)d.push({s,r});for(let i=d.length-1;i;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d;}
  const cardValue=c=>c.r==='A'?11:['J','Q','K'].includes(c.r)?10:Number(c.r);
  function handValue(cards){let n=cards.reduce((a,c)=>a+cardValue(c),0),aces=cards.filter(c=>c.r==='A').length;while(n>21&&aces-- >0)n-=10;return n;}
  function card(c,hidden=false){if(hidden)return'<span class="pg-card back">?</span>';return`<span class="pg-card ${c.s==='♥'||c.s==='♦'?'red':''}">${c.r}<br>${c.s}</span>`;}
  function blackjack(g){return `<section class="pg-table"><h3>🃏 黑帆二十一點</h3><p>下注 🦪 ${fmt(g.bet)}｜莊家 17 點以上停牌</p><div class="pg-hand"><b>海盜莊家：${g.reveal?handValue(g.dealer):cardValue(g.dealer[0])+'+?'} 點</b><div>${g.dealer.map((c,i)=>card(c,!g.reveal&&i===1)).join('')}</div></div><div class="pg-hand"><b>你的牌：${handValue(g.player)} 點</b><div>${g.player.map(c=>card(c)).join('')}</div></div><div class="pg-actions"><button data-pg-blackjack="hit">再要一張</button><button data-pg-blackjack="stand">停牌比點</button></div></section>`;}
  function gameView(){const g=visit.game;if(g.type==='dice')return dice(g);if(g.type==='coin')return coin(g);if(g.type==='chest')return chest(g);return blackjack(g);}
  function result(){const r=visit.result;const net=r.net<0?`損失 🦪 ${fmt(-r.net)}`:r.net>0?`淨獲利 🦪 ${fmt(r.net)}`:'下注原額返還';return `<section class="pg-result"><i>${r.icon}</i><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p><strong>${net}</strong><button data-pg-return>${visit.expired?'看完結果並離開':'返回賭桌'}</button></section>`;}
  function render(){if(!visit)return;panel().innerHTML=`<section class="pg-shell">${header()}<main class="pg-body">${visit.screen==='menu'?menu():visit.screen==='game'?gameView():result()}</main><footer>賭船只停留短暫時間。<button data-pg-close>離開賭船</button></footer></section>`;}
  function note(text,bad=false){const n=document.getElementById('pgNote');if(n){n.textContent=text;n.classList.toggle('bad',bad);}}
  function updateWallet(){const n=document.getElementById('pgWallet');if(n)n.textContent=fmt(balance());}

  function start(type){if(!visit||visit.screen!=='menu'||!GAMES[type])return;const wager=bet(),pay=spend(wager,`海盜賭局：${GAMES[type].name}`);if(!pay.ok)return note(`珍珠不足，還差 ${fmt(pay.needed||wager)} 顆。`,true);const g={type,bet:wager};if(type==='blackjack'){g.deck=makeDeck();g.player=[g.deck.pop(),g.deck.pop()];g.dealer=[g.deck.pop(),g.deck.pop()];g.reveal=false;}visit.game=g;visit.screen='game';render();if(type==='blackjack'&&handValue(g.player)===21)setTimeout(natural,250);}
  function finish(title,text,icon,payout=0,resultType='loss'){const wager=visit.game.bet;if(payout)earn(payout,`海盜賭局獎金：${title}`);const net=payout-wager;record(resultType,payout);log(title,`${text}\n下注：🦪 ${fmt(wager)}\n返還：🦪 ${fmt(payout)}\n淨結果：${net>=0?'+':''}${fmt(Math.abs(net))} 珍珠`,icon);visit.result={title,text,icon,payout,net};visit.game=null;visit.screen='result';render();}
  function playDice(choice){const a=1+Math.floor(Math.random()*6),b=1+Math.floor(Math.random()*6),sum=a+b,ok=choice==='seven'?sum===7:choice==='small'?sum<=6:sum>=8,m=choice==='seven'?5:2,label={small:'小',seven:'七點',big:'大'}[choice];finish(ok?'骰盅猜中':'骰盅落空',`骰子擲出 ${a}＋${b}＝${sum} 點，你押「${label}」。`,ok?'🎲':'💀',ok?visit.game.bet*m:0,ok?'win':'loss');}
  function playCoin(choice){const out=Math.random()<.5?'crown':'skull',ok=out===choice,label={crown:'王冠',skull:'骷髏'};finish(ok?'硬幣猜中':'硬幣猜錯',`硬幣落下是「${label[out]}」面，你選「${label[choice]}」。`,out==='crown'?'👑':'💀',ok?visit.game.bet*2:0,ok?'win':'loss');}
  function playChest(index){const x=[0,2,5];for(let i=2;i;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}const m=x[index],title=m===5?'開出海盜寶藏':m===2?'開出雙倍珍珠':'開到空寶箱';finish(title,`第 ${index+1} 號寶箱的倍率是 ×${m}。`,m===5?'💎':m===2?'🦪':'🕸️',visit.game.bet*m,m?'win':'loss');}
  function natural(){const g=visit?.game;if(!g||g.type!=='blackjack')return;g.reveal=true;if(handValue(g.dealer)===21)finish('雙方黑傑克','你與莊家同時拿到天然 21 點。','🃏',g.bet,'tie');else finish('天然黑傑克','起手兩張牌剛好 21 點。','🌟',Math.floor(g.bet*2.5),'win');}
  function hit(){const g=visit?.game;if(!g||g.type!=='blackjack')return;g.player.push(g.deck.pop());const n=handValue(g.player);if(n>21)finish('二十一點爆牌',`你的牌面合計 ${n} 點。`,'💥',0,'loss');else if(n===21)stand();else render();}
  function stand(){const g=visit?.game;if(!g||g.type!=='blackjack')return;g.reveal=true;while(handValue(g.dealer)<17)g.dealer.push(g.deck.pop());const p=handValue(g.player),d=handValue(g.dealer);if(d>21||p>d)finish('二十一點勝利',`你的 ${p} 點擊敗莊家的 ${d} 點。`,'🏆',g.bet*2,'win');else if(p===d)finish('二十一點平手',`雙方都是 ${p} 點。`,'🤝',g.bet,'tie');else finish('二十一點落敗',`你的 ${p} 點不敵莊家的 ${d} 點。`,'💀',0,'loss');}
  function back(){if(visit.expired)return close('黑帆賭船駛向夜色');visit.result=null;visit.screen='menu';render();}
  function close(msg='海盜賭船駛離'){if(visit?.screen==='game')return false;clearInterval(timer);panel().classList.add('hidden');document.body.classList.remove('pirate-gambling-open');if(visit)setTimeout(()=>window.COFFEE_SHIP_DECK?.showTip?.(`🏴‍☠️ ${msg}`,1600),20);visit=null;return true;}
  function countdown(){clearInterval(timer);timer=setInterval(()=>{if(!visit)return clearInterval(timer);visit.time--;const n=document.getElementById('pgTimer');if(visit.time<=0){visit.expired=true;if(visit.screen==='menu')return close('黑帆賭船消失在濃霧中');if(n)n.textContent='完成目前賭局後，賭船就會離開';}else if(n)n.textContent=`停留 ${visit.time} 秒`;},1000);}
  function open(castId,forced=false){if(visit||!deckOpen()||busy())return false;visit={castId:castId||`pirate_${Date.now()}`,bet:25,time:STAY,screen:'menu',game:null,result:null,expired:false};const s=stats();s.casts=0;s.last=Date.now();s.visits++;save(STATE,s);render();panel().classList.remove('hidden');document.body.classList.add('pirate-gambling-open');log('黑帆賭船靠近','海盜船長賽德邀你挑戰四種珍珠賭局。');countdown();if(forced)note('測試模式：本次賭局由系統手動開啟。');return true;}
  function fishing(e){const d=e.detail||{};if(!d.item||!d.castId)return;const s=stats();s.casts++;save(STATE,s);if(visit||!deckOpen()||busy()||s.casts<WAIT_CASTS||Date.now()-s.last<WAIT_MS||Math.random()>chance())return;setTimeout(()=>open(d.castId),650);}

  function bind(){document.addEventListener('click',e=>{if(!e.target.closest?.(`#${ID}`))return;const b=e.target.closest('[data-pg-bet]');if(b&&visit?.screen==='menu'){visit.bet=Number(b.dataset.pgBet)||25;return render();}const s=e.target.closest('[data-pg-start]');if(s)return start(s.dataset.pgStart);const d=e.target.closest('[data-pg-dice]');if(d)return playDice(d.dataset.pgDice);const c=e.target.closest('[data-pg-coin]');if(c)return playCoin(c.dataset.pgCoin);const h=e.target.closest('[data-pg-chest]');if(h)return playChest(Number(h.dataset.pgChest));const j=e.target.closest('[data-pg-blackjack]');if(j)return j.dataset.pgBlackjack==='hit'?hit():stand();if(e.target.closest('[data-pg-return]'))return back();if(e.target.closest('[data-pg-close]'))close('海盜船長向你揮帽告別');},true);window.addEventListener('coffee-ship:fishing-result',fishing);window.addEventListener('coffee-ship:scene',e=>{if(e.detail?.scene!=='deck'&&visit&&visit.screen!=='game')close('賭船離開目前海域');});window.addEventListener('coffee-ship:economy-changed',updateWallet);}
  function init(){panel();bind();window.COFFEE_SHIP_PIRATE_GAMBLING={open:()=>open(window.COFFEE_SHIP_FISHING_API?.getCurrentCastId?.()||`pirate_test_${Date.now()}`,true),close,state:stats,games:GAMES,version:1};window.dispatchEvent(new CustomEvent('coffee-ship:pirate-gambling-ready',{detail:{games:4,version:1}}));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();