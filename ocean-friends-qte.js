(() => {
  'use strict';
  if (window.__COFFEE_SHIP_OCEAN_FRIENDS_QTE_V1__) return;
  window.__COFFEE_SHIP_OCEAN_FRIENDS_QTE_V1__ = true;

  const PANEL_ID = 'oceanFriendsQte';
  const BAG_KEY = 'coffeeShipFishBag';
  const DEX_KEY = 'coffeeShipEventLootDex';
  const LOG_KEY = 'coffeeShipExpandedEventLog';
  const STATE_KEY = 'coffeeShipOceanFriendsQteState';
  const MAX_BAG = 240;
  const QTE_MS = 8000;
  const RANK = {普通:0,常見:1,稀有:2,史詩:3,傳說:4,神話:5,世界級:6};
  const PRICE = {普通:6,常見:10,稀有:28,史詩:90,傳說:260,神話:900,世界級:5000};
  const GRADES = {
    perfect:{label:'完美判定',icon:'🌟',color:'#ffe878',count:3,minRank:4,mult:2.2},
    great:{label:'極佳判定',icon:'✨',color:'#9ce8f0',count:2,minRank:3,mult:1.65},
    good:{label:'良好判定',icon:'💚',color:'#79d0b1',count:2,minRank:2,mult:1.3},
    normal:{label:'普通判定',icon:'👍',color:'#d7bb79',count:1,minRank:1,mult:1},
    miss:{label:'判定失誤',icon:'💦',color:'#d96b72',count:1,maxRank:1,mult:.7}
  };

  let active = null;
  let animationId = 0;
  let patched = false;
  let replacementBound = false;
  let originalRunCategory = null;

  function read(key,fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function save(key,value) {
    try { localStorage.setItem(key,JSON.stringify(value)); }
    catch {}
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }

  function format(value) {
    return Math.max(0,Math.floor(Number(value) || 0)).toLocaleString('zh-TW');
  }

  function economy() {
    return window.COFFEE_SHIP_ECONOMY || null;
  }

  function modifiers() {
    return economy()?.fishingModifiers?.() || {
      fishingLuck:Math.max(1,Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.fishingLuck || 1)),
      pearlBonus:Math.max(1,Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.pearlBonus || 1)),
      bottleLuck:Math.max(0,Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.bottleLuck || 0))
    };
  }

  function eventChance() {
    const base = .27 + Math.min(.08,modifiers().bottleLuck*.25);
    return economy()?.eventChance?.(base,'special') ?? Math.min(.62,base*modifiers().fishingLuck);
  }

  function chooseCategory(exclude='') {
    const rows = [['ocean',34],['salvage',35],['carnival',23],['world',8]].filter(row => row[0] !== exclude);
    let roll = Math.random()*rows.reduce((sum,row) => sum+row[1],0);
    for (const [name,weight] of rows) {
      roll -= weight;
      if (roll <= 0) return name;
    }
    return rows[0][0];
  }

  function ensurePanel() {
    let panel = document.getElementById(PANEL_ID);
    if (panel) return panel;
    panel = document.createElement('aside');
    panel.id = PANEL_ID;
    panel.className = 'hidden';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-label','海洋朋友判定事件');
    document.body.appendChild(panel);
    return panel;
  }

  function qteState() {
    const state = read(STATE_KEY,{played:0,perfect:0,great:0,good:0,normal:0,miss:0,bestAccuracy:0,rewards:0});
    for (const key of ['played','perfect','great','good','normal','miss','bestAccuracy','rewards']) state[key] = Math.max(0,Number(state[key] || 0));
    return state;
  }

  function bag() {
    const value = read(BAG_KEY,[]);
    return Array.isArray(value) ? value : [];
  }

  function itemFromRow(row,grade,accuracy,castId) {
    const [id,icon,name,category,rarity,weight,note] = row;
    const source = window.COFFEE_SHIP_DB?.itemFromRow
      ? window.COFFEE_SHIP_DB.itemFromRow(row,'ocean')
      : {id,icon,name,category,zone:category,rarity,quality:category,weight,note,kind:'treasure',group:'ocean',price:Math.max(1,Math.round((PRICE[rarity] || 10)*Math.max(1,weight || 1)))};
    const basePrice = Math.max(1,Number(source.sellPrice || source.price || economy()?.sellPrice?.(source) || 1));
    const pearlBonus = modifiers().pearlBonus;
    return {
      ...source,
      id,icon,name,category,rarity,weight,note,
      quality:`海洋朋友・${grade.label}`,
      zone:'海洋朋友QTE',
      kind:'treasure',
      group:'ocean',
      v2:true,
      oceanQte:true,
      qteGrade:grade.label,
      qteAccuracy:accuracy,
      coffeePearlBonus:pearlBonus,
      coffeeEffectName:window.COFFEE_SHIP_COFFEE_EFFECT?.name || '',
      sellPrice:Math.max(1,Math.round(basePrice*pearlBonus*grade.mult)),
      castId,
      at:Date.now()
    };
  }

  function candidatePool(pool,grade) {
    let candidates = pool.filter(row => {
      const rank = RANK[row?.[4]] || 0;
      if (Number.isFinite(grade.minRank) && rank < grade.minRank) return false;
      if (Number.isFinite(grade.maxRank) && rank > grade.maxRank) return false;
      return true;
    });
    if (candidates.length) return candidates;
    if (Number.isFinite(grade.minRank)) {
      for (let rank=grade.minRank-1;rank>=0;rank-=1) {
        candidates = pool.filter(row => (RANK[row?.[4]] || 0) >= rank);
        if (candidates.length) return candidates;
      }
    }
    return pool.slice();
  }

  function pickRows(pool,grade) {
    const selected = [];
    const used = new Set();
    const candidates = candidatePool(pool,grade);
    for (let index=0;index<grade.count;index+=1) {
      let available = candidates.filter(row => !used.has(row[0]));
      if (!available.length) available = pool.filter(row => !used.has(row[0]));
      if (!available.length) available = candidates;
      const row = available[Math.floor(Math.random()*available.length)];
      if (!row) break;
      used.add(row[0]);
      selected.push(row);
    }
    return selected;
  }

  function addRewards(rows,grade,accuracy,castId) {
    const items = bag();
    const dex = read(DEX_KEY,{});
    const rewards = rows.map(row => {
      const item = itemFromRow(row,grade,accuracy,castId);
      items.push(item);
      const previous = dex[item.id] || {};
      dex[item.id] = {
        name:item.name,icon:item.icon,category:item.category,rarity:item.rarity,
        count:Number(previous.count || 0)+1,
        latestAt:Date.now(),
        bestValue:Math.max(Number(previous.bestValue || 0),Number(item.sellPrice || 0)),
        bestQteAccuracy:Math.max(Number(previous.bestQteAccuracy || 0),accuracy)
      };
      return item;
    });
    save(BAG_KEY,items.slice(-MAX_BAG));
    save(DEX_KEY,dex);
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'ocean-friends-qte',items:rewards,grade:grade.label,accuracy}}));
    return rewards;
  }

  function logEvent(eventName,rewards,grade,accuracy,castId) {
    const log = read(LOG_KEY,[]);
    log.unshift({category:'ocean',title:eventName,items:rewards.map(item => item.name),grade:grade.label,accuracy,castId,at:Date.now()});
    save(LOG_KEY,log.slice(0,80));
  }

  function pushEvent(eventName,eventText,rewards,grade,accuracy,castId) {
    const total = rewards.reduce((sum,item) => sum+Number(item.sellPrice || 0),0);
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({
      castId,
      eventKind:'special',
      title:`海洋朋友QTE｜${eventName}・${grade.label}`,
      icon:grade.icon,
      accent:grade.color,
      text:`${eventText}\n判定準度：${accuracy}%\n獲得：${rewards.map(item => `${item.icon} ${item.name}［${item.rarity}］`).join('、')}\n預估總價值：🦪 ${format(total)}`
    });
  }

  function renderPlaying() {
    const event = active.event;
    const normalWidth = 43.4;
    const goodWidth = 26.7;
    const greatWidth = 13.4;
    const perfectWidth = 4;
    ensurePanel().innerHTML = `<section class="ofq-shell"><header class="ofq-head"><div class="ofq-title"><span class="ofq-friend">${active.friendIcon}</span><div><h3>${escapeHtml(event[0])}</h3><p>海洋朋友・準度判定事件</p></div></div><button class="ofq-close" type="button" disabled>判定中</button></header><main class="ofq-body"><p class="ofq-story">${escapeHtml(event[1])}</p><div class="ofq-guide"><span>普通</span><span>良好</span><span>極佳</span><span class="perfect">完美</span></div><section class="ofq-arena"><div class="ofq-track"><span class="ofq-zone normal" style="--zone-left:${active.target}%;--zone-width:${normalWidth}%"></span><span class="ofq-zone good" style="--zone-left:${active.target}%;--zone-width:${goodWidth}%"></span><span class="ofq-zone great" style="--zone-left:${active.target}%;--zone-width:${greatWidth}%"></span><span class="ofq-zone perfect" style="--zone-left:${active.target}%;--zone-width:${perfectWidth}%"></span><span class="ofq-marker" id="oceanFriendsMarker">⚓</span></div><div class="ofq-scale"><span>失誤區</span><span>越接近金色中心，獎勵越好</span><span>失誤區</span></div><div class="ofq-status"><span>指針速度：<strong>${active.speedLabel}</strong></span><span>剩餘：<strong id="oceanFriendsTime">${(QTE_MS/1000).toFixed(1)} 秒</strong></span></div><div class="ofq-time"><span id="oceanFriendsTimeBar" style="--time:100%"></span></div><button class="ofq-hit" id="oceanFriendsHit" type="button">現在判定！</button><p class="ofq-hint">手機點擊按鈕；鍵盤可按空白鍵或 Enter</p></section></main><footer class="ofq-footer"><span>每次事件只有一次判定機會。</span><span>完美判定可獲得 3 件高階獎勵</span></footer></section>`;
  }

  function rewardHtml(item) {
    return `<div class="ofq-reward"><strong>${item.icon} ${escapeHtml(item.name)}［${escapeHtml(item.rarity)}］</strong><small>🦪 ${format(item.sellPrice)}</small></div>`;
  }

  function renderResult() {
    const {grade,accuracy,rewards,event} = active.result;
    const total = rewards.reduce((sum,item) => sum+Number(item.sellPrice || 0),0);
    ensurePanel().innerHTML = `<section class="ofq-shell"><header class="ofq-head"><div class="ofq-title"><span class="ofq-friend">${grade.icon}</span><div><h3>${escapeHtml(grade.label)}</h3><p>${escapeHtml(event[0])}・判定結果</p></div></div><button class="ofq-close" type="button">關閉</button></header><main class="ofq-body"><section class="ofq-result" style="--result-color:${grade.color}"><div class="ofq-grade">${grade.icon}</div><h4>${escapeHtml(grade.label)}</h4><p>${escapeHtml(event[1])}\n你的操作準度決定了海洋朋友留下的謝禮。</p><span class="ofq-accuracy">準度 ${accuracy}%・總價值 🦪 ${format(total)}</span><div class="ofq-rewards">${rewards.map(rewardHtml).join('')}</div><button class="ofq-close" type="button">收下獎勵並返回甲板</button></section></main><footer class="ofq-footer"><span>獎勵已直接放入背包。</span><span>${rewards.length} 件海洋朋友謝禮</span></footer></section>`;
  }

  function stopAnimation() {
    if (animationId) cancelAnimationFrame(animationId);
    animationId = 0;
  }

  function gradeForAccuracy(accuracy) {
    if (accuracy >= 94) return GRADES.perfect;
    if (accuracy >= 80) return GRADES.great;
    if (accuracy >= 60) return GRADES.good;
    if (accuracy >= 35) return GRADES.normal;
    return GRADES.miss;
  }

  function settle(timedOut=false) {
    if (!active || active.phase !== 'playing') return;
    stopAnimation();
    const distance = timedOut ? 100 : Math.abs(active.pointer-active.target);
    const accuracy = timedOut ? 0 : Math.max(0,Math.min(100,Math.round(100-distance*3)));
    const grade = gradeForAccuracy(accuracy);
    const pool = window.COFFEE_SHIP_EXPANDED_EVENTS?.pools?.ocean?.() || [];
    const rows = pickRows(pool,grade);
    const rewards = addRewards(rows,grade,accuracy,active.castId);
    logEvent(active.event[0],rewards,grade,accuracy,active.castId);
    pushEvent(active.event[0],active.event[1],rewards,grade,accuracy,active.castId);
    const state = qteState();
    state.played += 1;
    state[Object.keys(GRADES).find(key => GRADES[key] === grade) || 'miss'] += 1;
    state.bestAccuracy = Math.max(state.bestAccuracy,accuracy);
    state.rewards += rewards.length;
    save(STATE_KEY,state);
    active.phase = 'result';
    active.result = {grade,accuracy,rewards,event:active.event};
    renderResult();
  }

  function animate(now) {
    if (!active || active.phase !== 'playing') return;
    const elapsed = now-active.startedAt;
    const travel = (elapsed*active.speed/1000)%200;
    active.pointer = travel <= 100 ? travel : 200-travel;
    const marker = document.getElementById('oceanFriendsMarker');
    if (marker) marker.style.left = `${active.pointer}%`;
    const remaining = Math.max(0,QTE_MS-elapsed);
    const time = document.getElementById('oceanFriendsTime');
    const bar = document.getElementById('oceanFriendsTimeBar');
    if (time) time.textContent = `${(remaining/1000).toFixed(1)} 秒`;
    if (bar) bar.style.setProperty('--time',`${remaining/QTE_MS*100}%`);
    if (remaining <= 0) {
      settle(true);
      return;
    }
    animationId = requestAnimationFrame(animate);
  }

  function competingBusy() {
    return ['sea-merchant-open','pirate-gambling-open','coral-roulette-open','mutant-hunt-open','abyss-auction-open'].some(name => document.body.classList.contains(name));
  }

  function openQte(castId,forced=false) {
    if (active || competingBusy() || !window.COFFEE_SHIP_DECK?.isDeckOpen?.()) return false;
    const api = window.COFFEE_SHIP_EXPANDED_EVENTS;
    const events = api?.events?.ocean || [];
    if (!events.length || !api?.pools?.ocean?.().length) return false;
    try { window.COFFEE_SHIP_FISHING_API?.close?.(); } catch {}
    const event = events[Math.floor(Math.random()*events.length)];
    const icons = ['🐢','🐬','🦭','🐋','🦦','🪼','🦈','🐧'];
    const speed = 52+Math.random()*24;
    active = {
      phase:'playing',castId:castId || `ocean_qte_${Date.now()}`,event,
      friendIcon:icons[Math.floor(Math.random()*icons.length)],
      target:30+Math.random()*40,
      pointer:0,
      speed,
      speedLabel:speed < 60 ? '平穩' : speed < 69 ? '快速' : '敏捷',
      startedAt:performance.now(),
      forced
    };
    renderPlaying();
    ensurePanel().classList.remove('hidden');
    document.body.classList.add('ocean-friends-qte-open');
    animationId = requestAnimationFrame(animate);
    return true;
  }

  function scheduleOpen(castId,attempt=0) {
    if (active) return;
    if (openQte(castId)) return;
    if (attempt < 90 && window.COFFEE_SHIP_DECK?.isDeckOpen?.()) setTimeout(() => scheduleOpen(castId,attempt+1),700);
  }

  function closeQte() {
    if (!active) return true;
    if (active.phase === 'playing') return false;
    stopAnimation();
    ensurePanel().classList.add('hidden');
    document.body.classList.remove('ocean-friends-qte-open');
    active = null;
    return true;
  }

  function replacementTrigger(event) {
    if (Math.random() > eventChance()) return;
    const castId = event.detail?.castId || window.COFFEE_SHIP_FISHING_API?.getCurrentCastId?.();
    const first = chooseCategory();
    if (first === 'ocean') scheduleOpen(castId);
    else originalRunCategory?.(first,castId);

    const secondaryChance = Math.min(.32,.12*modifiers().fishingLuck+modifiers().bottleLuck*.15);
    if (Math.random() < secondaryChance) {
      const second = chooseCategory(first);
      if (second === 'ocean') setTimeout(() => scheduleOpen(castId),650);
      else setTimeout(() => originalRunCategory?.(second,castId),450);
    }
  }

  function patchExpandedEvents() {
    const api = window.COFFEE_SHIP_EXPANDED_EVENTS;
    if (!api || typeof api.trigger !== 'function' || typeof api.runCategory !== 'function') return false;
    if (api.__oceanFriendsQtePatched) return true;
    window.removeEventListener('coffee-ship:fishing-result',api.trigger);
    originalRunCategory = api.runCategory.bind(api);
    api.originalTrigger = api.trigger;
    api.trigger = replacementTrigger;
    api.runOceanQte = castId => scheduleOpen(castId || `ocean_qte_${Date.now()}`);
    api.__oceanFriendsQtePatched = true;
    api.version = 2;
    if (!replacementBound) {
      replacementBound = true;
      window.addEventListener('coffee-ship:fishing-result',replacementTrigger);
    }
    patched = true;
    window.dispatchEvent(new CustomEvent('coffee-ship:ocean-friends-qte-ready',{detail:{grades:Object.keys(GRADES).length,version:1}}));
    return true;
  }

  function bind() {
    document.addEventListener('click',event => {
      if (!event.target.closest?.(`#${PANEL_ID}`)) return;
      if (event.target.closest('#oceanFriendsHit')) {
        event.preventDefault();
        settle(false);
        return;
      }
      if (event.target.closest('.ofq-close')) {
        event.preventDefault();
        closeQte();
      }
    },true);
    window.addEventListener('keydown',event => {
      if (!active || active.phase !== 'playing' || event.repeat) return;
      if (event.code === 'Space' || event.key === 'Enter') {
        event.preventDefault();
        settle(false);
      }
    });
    window.addEventListener('coffee-ship:scene',event => {
      if (event.detail?.scene !== 'deck' && active?.phase === 'playing') settle(true);
      if (event.detail?.scene !== 'deck' && active?.phase === 'result') closeQte();
    });
  }

  function init() {
    ensurePanel();
    bind();
    if (!patchExpandedEvents()) {
      let attempts = 0;
      const timer = setInterval(() => {
        attempts += 1;
        if (patchExpandedEvents() || attempts > 160) clearInterval(timer);
      },250);
    }
    window.COFFEE_SHIP_OCEAN_FRIENDS_QTE = {
      open:() => openQte(window.COFFEE_SHIP_FISHING_API?.getCurrentCastId?.() || `ocean_qte_test_${Date.now()}`,true),
      close:closeQte,
      state:qteState,
      grades:GRADES,
      patched:() => patched,
      version:1
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();