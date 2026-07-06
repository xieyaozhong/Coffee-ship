(() => {
  'use strict';
  if (window.__COFFEE_SHIP_SALVAGE_QTE_V1__) return;
  window.__COFFEE_SHIP_SALVAGE_QTE_V1__ = true;

  const PANEL_ID = 'salvageQteEvent';
  const BAG_KEY = 'coffeeShipFishBag';
  const DEX_KEY = 'coffeeShipEventLootDex';
  const LOG_KEY = 'coffeeShipExpandedEventLog';
  const STATE_KEY = 'coffeeShipSalvageQteState';
  const MAX_BAG = 240;
  const ROUND_MS = 6000;
  const RANK = {普通:0,常見:1,稀有:2,史詩:3,傳說:4,神話:5,世界級:6};
  const PRICE = {普通:6,常見:10,稀有:28,史詩:90,傳說:260,神話:900,世界級:5000};
  const GRADES = {
    perfect:{label:'完美打撈',icon:'🏆',color:'#ffe878',count:3,minRank:4,mult:2.25},
    great:{label:'精準打撈',icon:'✨',color:'#9ce8f0',count:2,minRank:3,mult:1.7},
    good:{label:'穩定打撈',icon:'⚓',color:'#79d0b1',count:2,minRank:2,mult:1.35},
    normal:{label:'完成打撈',icon:'🧰',color:'#d7bb79',count:1,minRank:1,mult:1},
    miss:{label:'繩索受損',icon:'🪢',color:'#d96b72',count:1,maxRank:1,mult:.65}
  };

  let active = null;
  let animationId = 0;
  let roundTimeout = 0;

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
      pearlBonus:Math.max(1,Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.pearlBonus || 1))
    };
  }

  function state() {
    const value = read(STATE_KEY,{played:0,perfect:0,great:0,good:0,normal:0,miss:0,bestAverage:0,rewards:0,ropeBreaks:0});
    for (const key of ['played','perfect','great','good','normal','miss','bestAverage','rewards','ropeBreaks']) value[key] = Math.max(0,Number(value[key] || 0));
    return value;
  }

  function bag() {
    const value = read(BAG_KEY,[]);
    return Array.isArray(value) ? value : [];
  }

  function ensurePanel() {
    let panel = document.getElementById(PANEL_ID);
    if (panel) return panel;
    panel = document.createElement('aside');
    panel.id = PANEL_ID;
    panel.className = 'hidden';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-label','沉船打撈垂直判定');
    document.body.appendChild(panel);
    return panel;
  }

  function stopMotion() {
    if (animationId) cancelAnimationFrame(animationId);
    clearTimeout(roundTimeout);
    animationId = 0;
    roundTimeout = 0;
  }

  function gradeFor(average,broken=false) {
    if (broken || average < 30) return GRADES.miss;
    if (average >= 90) return GRADES.perfect;
    if (average >= 76) return GRADES.great;
    if (average >= 55) return GRADES.good;
    return GRADES.normal;
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
    const candidates = candidatePool(pool,grade);
    const selected = [];
    const used = new Set();
    for (let index=0;index<grade.count;index+=1) {
      let available = candidates.filter(row => !used.has(row[0]));
      if (!available.length) available = pool.filter(row => !used.has(row[0]));
      if (!available.length) available = candidates;
      const row = available[Math.floor(Math.random()*available.length)];
      if (!row) break;
      selected.push(row);
      used.add(row[0]);
    }
    return selected;
  }

  function itemFromRow(row,grade,average,castId) {
    const [id,icon,name,category,rarity,weight,note] = row;
    const source = window.COFFEE_SHIP_DB?.itemFromRow
      ? window.COFFEE_SHIP_DB.itemFromRow(row,'salvage')
      : {id,icon,name,category,zone:category,rarity,quality:category,weight,note,kind:'treasure',group:'salvage',price:Math.max(1,Math.round((PRICE[rarity] || 10)*Math.max(1,weight || 1)))};
    const pearlBonus = modifiers().pearlBonus;
    const basePrice = Math.max(1,Number(source.sellPrice || source.price || economy()?.sellPrice?.(source) || 1));
    return {
      ...source,
      id,icon,name,category,rarity,weight,note,
      quality:`沉船打撈・${grade.label}`,
      zone:'沉船垂直打撈',
      kind:'treasure',
      group:'salvage',
      salvageQte:true,
      salvageGrade:grade.label,
      salvageAccuracy:average,
      ropeIntegrity:Math.max(0,Math.round(active?.rope || 0)),
      coffeePearlBonus:pearlBonus,
      coffeeEffectName:window.COFFEE_SHIP_COFFEE_EFFECT?.name || '',
      sellPrice:Math.max(1,Math.round(basePrice*pearlBonus*grade.mult)),
      castId,
      at:Date.now()
    };
  }

  function addRewards(rows,grade,average,castId) {
    const items = bag();
    const dex = read(DEX_KEY,{});
    const rewards = rows.map(row => {
      const item = itemFromRow(row,grade,average,castId);
      items.push(item);
      const previous = dex[item.id] || {};
      dex[item.id] = {
        name:item.name,icon:item.icon,category:item.category,rarity:item.rarity,
        count:Number(previous.count || 0)+1,
        latestAt:Date.now(),
        bestValue:Math.max(Number(previous.bestValue || 0),Number(item.sellPrice || 0)),
        bestSalvageAccuracy:Math.max(Number(previous.bestSalvageAccuracy || 0),average)
      };
      return item;
    });
    save(BAG_KEY,items.slice(-MAX_BAG));
    save(DEX_KEY,dex);
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'salvage-qte',items:rewards,grade:grade.label,accuracy:average}}));
    return rewards;
  }

  function logResult(rewards,grade,average) {
    const log = read(LOG_KEY,[]);
    log.unshift({category:'salvage',title:active.event[0],items:rewards.map(item => item.name),grade:grade.label,accuracy:average,rope:active.rope,castId:active.castId,at:Date.now()});
    save(LOG_KEY,log.slice(0,80));
  }

  function pushResult(rewards,grade,average) {
    const total = rewards.reduce((sum,item) => sum+Number(item.sellPrice || 0),0);
    const pulls = active.hits.map((value,index) => `第 ${index+1} 次 ${value}%`).join('、');
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({
      castId:active.castId,
      eventKind:'special',
      title:`沉船打撈QTE｜${active.event[0]}・${grade.label}`,
      icon:grade.icon,
      accent:grade.color,
      text:`${active.event[1]}\n三段收線：${pulls || '未完成'}\n平均準度：${average}%｜繩索完整度：${Math.max(0,Math.round(active.rope))}%\n獲得：${rewards.map(item => `${item.icon} ${item.name}［${item.rarity}］`).join('、')}\n預估總價值：🦪 ${format(total)}`
    });
  }

  function roundRange(round) {
    if (round === 1) return {min:38,max:91};
    if (round === 2) return {min:22,max:76};
    return {min:7,max:59};
  }

  function newRound() {
    if (!active || active.phase !== 'playing') return;
    stopMotion();
    const range = roundRange(active.round);
    active.min = range.min;
    active.max = range.max;
    active.pointer = range.max;
    active.target = range.min+9+Math.random()*Math.max(8,range.max-range.min-18);
    active.speed = 38+active.round*8+Math.random()*11;
    active.roundStartedAt = performance.now();
    active.feedback = active.round === 1 ? '沉船物已勾住，抓準安全水流開始第一段收線。' : `第 ${active.round} 段收線：水流變快，注意上下晃動。`;
    renderPlaying();
    animationId = requestAnimationFrame(animate);
    roundTimeout = setTimeout(() => pull(true),ROUND_MS+80);
  }

  function pullPenalty(accuracy) {
    if (accuracy >= 90) return 0;
    if (accuracy >= 76) return 3;
    if (accuracy >= 55) return 10;
    if (accuracy >= 30) return 22;
    return 42;
  }

  function pull(timedOut=false) {
    if (!active || active.phase !== 'playing' || active.resolving) return;
    active.resolving = true;
    stopMotion();
    const distance = timedOut ? 100 : Math.abs(active.pointer-active.target);
    const accuracy = timedOut ? 0 : Math.max(0,Math.min(100,Math.round(100-distance*3.15)));
    const penalty = pullPenalty(accuracy);
    active.rope = Math.max(0,active.rope-penalty);
    active.hits.push(accuracy);
    active.feedback = timedOut
      ? `第 ${active.round} 次錯過時機，繩索磨損 ${penalty}%。`
      : accuracy >= 90 ? `第 ${active.round} 次完美咬住水流，沉船物快速上升！`
      : accuracy >= 76 ? `第 ${active.round} 次收線精準，繩索只受到輕微拉扯。`
      : accuracy >= 55 ? `第 ${active.round} 次成功收線，但水流讓繩索磨損 ${penalty}%。`
      : `第 ${active.round} 次收線偏差，繩索劇烈磨損 ${penalty}%。`;

    if (active.rope <= 0) {
      setTimeout(() => finish(true),480);
      return;
    }
    if (active.round >= 3) {
      setTimeout(() => finish(false),480);
      return;
    }
    active.round += 1;
    setTimeout(() => {
      if (!active) return;
      active.resolving = false;
      newRound();
    },620);
  }

  function finish(broken=false) {
    if (!active || active.phase !== 'playing') return;
    stopMotion();
    const completed = active.hits.length || 1;
    const average = broken ? Math.min(29,Math.round(active.hits.reduce((sum,value) => sum+value,0)/completed)) : Math.round(active.hits.reduce((sum,value) => sum+value,0)/completed);
    const grade = gradeFor(average,broken);
    const pool = window.COFFEE_SHIP_EXPANDED_EVENTS?.pools?.salvage?.() || [];
    const rows = pickRows(pool,grade);
    const rewards = addRewards(rows,grade,average,active.castId);
    logResult(rewards,grade,average);
    pushResult(rewards,grade,average);
    const stats = state();
    const gradeKey = Object.keys(GRADES).find(key => GRADES[key] === grade) || 'miss';
    stats.played += 1;
    stats[gradeKey] += 1;
    stats.bestAverage = Math.max(stats.bestAverage,average);
    stats.rewards += rewards.length;
    if (broken) stats.ropeBreaks += 1;
    save(STATE_KEY,stats);
    active.phase = 'result';
    active.result = {grade,average,rewards,broken};
    renderResult();
  }

  function pullDots() {
    return [0,1,2].map(index => {
      const value = active.hits[index];
      const cls = Number.isFinite(value) ? value >= 55 ? 'done' : 'bad' : '';
      return `<span class="sq-pull-dot ${cls}">${Number.isFinite(value) ? value : index+1}</span>`;
    }).join('');
  }

  function renderPlaying() {
    const zoneHeight = 28;
    const ropeHeight = Math.max(5,active.pointer);
    ensurePanel().innerHTML = `<section class="sq-shell"><header class="sq-head"><div class="sq-title"><span class="sq-icon">⚓</span><div><h3>${escapeHtml(active.event[0])}</h3><p>沉船打撈・三段垂直收線</p></div></div><button class="sq-close" type="button" disabled>打撈中</button></header><main class="sq-body"><p class="sq-story">${escapeHtml(active.event[1])}</p><div class="sq-dashboard"><section class="sq-sea"><span class="sq-surface"></span><span class="sq-bubbles"></span><span class="sq-depth-label top">海面</span><span class="sq-depth-label middle">中層水流</span><span class="sq-depth-label bottom">沉船區</span><span class="sq-seabed"></span><span class="sq-rope" id="salvageRope" style="--rope-height:${ropeHeight}%"></span><span class="sq-safe-zone" style="--zone-top:${active.target}%;--zone-height:${zoneHeight}%"><span class="sq-perfect-zone"></span></span><span class="sq-cargo" id="salvageCargo" style="top:${active.pointer}%">📦</span></section><aside class="sq-panel"><div class="sq-meter"><strong>繩索完整度 ${Math.round(active.rope)}%</strong><small>判定偏差會磨損繩索</small><div class="sq-rope-health"><span id="salvageRopeHealth" style="--rope-health:${active.rope}%"></span></div><div class="sq-pulls">${pullDots()}</div></div><div class="sq-current"><b>第 ${active.round}/3 段</b>沉船物會上下晃動。進入亮色安全區時收線，越靠近中心越準。</div><div class="sq-time"><span id="salvageTimeBar" style="--time:100%"></span></div><button class="sq-pull" id="salvagePullButton" type="button">⬆️ 收線！</button><div class="sq-feedback" id="salvageFeedback">${escapeHtml(active.feedback)}</div></aside></div></main><footer class="sq-footer"><span>手機點擊收線；鍵盤可按 ↑、W、空白鍵或 Enter。</span><span>三次平均準度決定獎勵</span></footer></section>`;
  }

  function rewardHtml(item) {
    return `<div class="sq-reward"><strong>${item.icon} ${escapeHtml(item.name)}［${escapeHtml(item.rarity)}］</strong><small>🦪 ${format(item.sellPrice)}</small></div>`;
  }

  function renderResult() {
    const {grade,average,rewards,broken} = active.result;
    const total = rewards.reduce((sum,item) => sum+Number(item.sellPrice || 0),0);
    const hitText = active.hits.map((value,index) => `第 ${index+1} 次 ${value}%`).join('、');
    ensurePanel().innerHTML = `<section class="sq-shell"><header class="sq-head"><div class="sq-title"><span class="sq-icon">${grade.icon}</span><div><h3>${escapeHtml(grade.label)}</h3><p>${escapeHtml(active.event[0])}・打撈結果</p></div></div><button class="sq-close" type="button">關閉</button></header><main class="sq-body"><section class="sq-result" style="--result-color:${grade.color}"><div class="sq-grade">${grade.icon}</div><h4>${escapeHtml(grade.label)}</h4><p>${broken?'繩索在最後拉扯中受損，只有部分物品被帶回海面。':'三段收線完成，沉船物成功離開海床。'}\n${escapeHtml(hitText)}\n繩索完整度：${Math.round(active.rope)}%</p><span class="sq-score">平均準度 ${average}%・總價值 🦪 ${format(total)}</span><div class="sq-rewards">${rewards.map(rewardHtml).join('')}</div><button class="sq-close" type="button">收下打撈物並返回甲板</button></section></main><footer class="sq-footer"><span>獎勵已直接放入背包。</span><span>${rewards.length} 件沉船打撈物</span></footer></section>`;
  }

  function animate(now) {
    if (!active || active.phase !== 'playing' || active.resolving) return;
    const elapsed = now-active.roundStartedAt;
    const distance = active.max-active.min;
    const travel = (elapsed*active.speed/1000)%(distance*2);
    active.pointer = travel <= distance ? active.max-travel : active.min+(travel-distance);
    const cargo = document.getElementById('salvageCargo');
    const rope = document.getElementById('salvageRope');
    if (cargo) cargo.style.top = `${active.pointer}%`;
    if (rope) rope.style.setProperty('--rope-height',`${active.pointer}%`);
    const remaining = Math.max(0,ROUND_MS-elapsed);
    const bar = document.getElementById('salvageTimeBar');
    if (bar) bar.style.setProperty('--time',`${remaining/ROUND_MS*100}%`);
    animationId = requestAnimationFrame(animate);
  }

  function competingBusy() {
    return ['sea-merchant-open','pirate-gambling-open','coral-roulette-open','mutant-hunt-open','abyss-auction-open','ocean-friends-qte-open'].some(name => document.body.classList.contains(name));
  }

  function openQte(castId,forced=false) {
    if (active || competingBusy() || !window.COFFEE_SHIP_DECK?.isDeckOpen?.()) return false;
    const api = window.COFFEE_SHIP_EXPANDED_EVENTS;
    const events = api?.events?.salvage || [];
    const pool = api?.pools?.salvage?.() || [];
    if (!events.length || !pool.length) return false;
    try { window.COFFEE_SHIP_FISHING_API?.close?.(); } catch {}
    active = {
      phase:'playing',
      castId:castId || `salvage_qte_${Date.now()}`,
      event:events[Math.floor(Math.random()*events.length)],
      round:1,
      rope:100,
      hits:[],
      pointer:90,
      target:60,
      min:38,
      max:91,
      speed:48,
      feedback:'沉船物已勾住。',
      resolving:false,
      forced
    };
    ensurePanel().classList.remove('hidden');
    document.body.classList.add('salvage-qte-open');
    newRound();
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
    stopMotion();
    ensurePanel().classList.add('hidden');
    document.body.classList.remove('salvage-qte-open');
    active = null;
    return true;
  }

  function bind() {
    document.addEventListener('click',event => {
      if (!event.target.closest?.(`#${PANEL_ID}`)) return;
      if (event.target.closest('#salvagePullButton')) {
        event.preventDefault();
        pull(false);
        return;
      }
      if (event.target.closest('.sq-close')) {
        event.preventDefault();
        closeQte();
      }
    },true);
    window.addEventListener('keydown',event => {
      if (!active || active.phase !== 'playing' || active.resolving || event.repeat) return;
      if (event.code === 'Space' || event.key === 'Enter' || event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
        event.preventDefault();
        pull(false);
      }
    });
    window.addEventListener('coffee-ship:scene',event => {
      if (event.detail?.scene !== 'deck' && active?.phase === 'playing') finish(true);
      if (event.detail?.scene !== 'deck' && active?.phase === 'result') closeQte();
    });
  }

  function init() {
    ensurePanel();
    bind();
    window.COFFEE_SHIP_SALVAGE_QTE = {
      open:(castId) => openQte(castId || window.COFFEE_SHIP_FISHING_API?.getCurrentCastId?.() || `salvage_qte_test_${Date.now()}`,true),
      schedule:scheduleOpen,
      close:closeQte,
      state,
      grades:GRADES,
      version:1
    };
    window.dispatchEvent(new CustomEvent('coffee-ship:salvage-qte-ready',{detail:{rounds:3,grades:Object.keys(GRADES).length,version:1}}));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();