(() => {
  'use strict';
  if (window.__COFFEE_SHIP_MUTANT_HUNT_START_GATE_V1__) return;
  window.__COFFEE_SHIP_MUTANT_HUNT_START_GATE_V1__ = true;

  const nativeAdd = window.addEventListener;
  let capturedOriginal = null;
  let captureArmed = true;

  window.addEventListener = function(type, listener, options) {
    if (captureArmed && type === 'coffee-ship:fishing-result' && typeof listener === 'function') {
      capturedOriginal = listener;
      captureArmed = false;
      window.__COFFEE_SHIP_MUTANT_ORIGINAL_FISHING_HANDLER__ = listener;
      window.addEventListener = nativeAdd;
      return;
    }
    return nativeAdd.call(this, type, listener, options);
  };

  setTimeout(() => {
    if (window.addEventListener !== nativeAdd) window.addEventListener = nativeAdd;
  }, 0);

  const PANEL_ID = 'mutantHuntEvent';
  const BAG_KEY = 'coffeeShipFishBag';
  const STATE_KEY = 'coffeeShipMutantHuntStateV1';
  const DEX_KEY = 'coffeeShipMutantDex';
  const MAX_BAG = 240;
  const BASE_CHANCE = .05;
  const COLORS = {稀有:'#79d0b1',史詩:'#e9a6b0',傳說:'#ffe16b',神話:'#ffffff',世界級:'#ff5f9e'};
  const DIFFICULTY = {稀有:.62,史詩:.78,傳說:1,神話:1.28,世界級:1.62};
  const CAPTURE_CHANCE = {稀有:.68,史詩:.58,傳說:.44,神話:.3,世界級:.12};
  const DURATION = {稀有:13000,史詩:13500,傳說:14000,神話:15000,世界級:16500};

  let active = null;
  let timer = 0;
  let tick = 0;
  let bound = false;

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function format(value) {
    return Math.max(0, Math.floor(Number(value) || 0)).toLocaleString('zh-TW');
  }

  function bag() {
    const value = read(BAG_KEY, []);
    return Array.isArray(value) ? value : [];
  }

  function setBag(items, source='mutant-hunt') {
    save(BAG_KEY, items.slice(-MAX_BAG));
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed', {detail:{source}}));
  }

  function state() {
    const value = read(STATE_KEY, {curses:[],stats:{encounters:0,hunts:0,wins:0,failures:0,captures:0,trophies:0}});
    value.curses = Array.isArray(value.curses) ? value.curses : [];
    value.stats = value.stats || {};
    for (const key of ['encounters','hunts','wins','failures','captures','trophies']) value.stats[key] = Math.max(0, Number(value.stats[key] || 0));
    return value;
  }

  function saveState(value) {
    value.curses = value.curses.filter(curse => Number(curse.remaining || 0) > 0).slice(-16);
    save(STATE_KEY, value);
    window.dispatchEvent(new CustomEvent('coffee-ship:mutant-state', {detail:{state:value}}));
  }

  function economy() {
    return window.COFFEE_SHIP_ECONOMY || null;
  }

  function modifiers() {
    return economy()?.fishingModifiers?.() || {
      fishingLuck:Math.max(1, Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.fishingLuck || 1)),
      pearlBonus:Math.max(1, Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.pearlBonus || 1))
    };
  }

  function eventChance() {
    return economy()?.eventChance?.(BASE_CHANCE, 'special') ?? Math.min(.7, BASE_CHANCE * modifiers().fishingLuck);
  }

  function walletBalance() {
    return economy()?.balance?.() ?? Math.max(0, Number(localStorage.getItem('coffeeShipPearls') || 0));
  }

  function spend(amount, reason) {
    const value = Math.min(walletBalance(), Math.max(0, Math.floor(Number(amount) || 0)));
    if (!value) return 0;
    if (economy()?.spend) return Number(economy().spend(value, reason, {source:'mutant-curse'})?.spent || value);
    localStorage.setItem('coffeeShipPearls', String(walletBalance() - value));
    return value;
  }

  function creatures() {
    return window.COFFEE_SHIP_MUTANT_HUNT?.creatures || [];
  }

  function tools() {
    return window.COFFEE_SHIP_MUTANT_HUNT?.tools || {};
  }

  function rarityPick() {
    const list = creatures();
    const luck = Math.min(2, modifiers().fishingLuck);
    const roll = Math.min(.9999, 1 - Math.pow(1 - Math.random(), luck));
    let pool = list.filter(row => row.rarity === '稀有' || row.rarity === '史詩');
    if (roll > .62) pool = list.filter(row => row.rarity === '傳說');
    if (roll > .88) pool = list.filter(row => row.rarity === '神話');
    if (roll > .992) pool = list.filter(row => row.rarity === '世界級');
    if (!pool.length) pool = list;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function isEdibleCatch(item, currentCastId='') {
    if (!item || item.castId === currentCastId || item.unique) return false;
    if (['tool','treasure','letter','currency','trash'].includes(item.kind)) return false;
    return ['fish','mutant','shrimp','crab','squid','jelly','angler','octopus','whale','shark','eel','lobster','creature','snake'].includes(item.kind) || item.quality === '變異';
  }

  function devourFrom(items, count, currentCastId='') {
    const eaten = [];
    for (let step=0; step<count; step+=1) {
      const indexes = items.map((item,index) => isEdibleCatch(item,currentCastId) ? index : -1).filter(index => index >= 0);
      if (!indexes.length) break;
      const index = indexes[Math.floor(Math.random()*indexes.length)];
      eaten.push(items[index]);
      items.splice(index,1);
    }
    return eaten;
  }

  function pushEvent(title, text, icon='🧬', accent='#ff5f9e', castId=active?.castId) {
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({castId,eventKind:'mutant',title,text,icon,accent});
  }

  function addCurse(creature) {
    const huntState = state();
    let curse = huntState.curses.find(row => row.creatureId === creature.id && Number(row.remaining || 0) > 0);
    if (curse) {
      curse.remaining += Math.max(1, Math.ceil(creature.curse.casts / 2));
      curse.severity = Math.max(1, Number(curse.severity || 1));
    } else {
      curse = {
        instanceId:`${creature.id}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
        creatureId:creature.id,
        creatureName:creature.name,
        icon:creature.icon,
        label:creature.curse.label,
        description:creature.curse.description,
        remaining:creature.curse.casts,
        severity:1,
        config:{...creature.curse}
      };
      huntState.curses.push(curse);
    }
    huntState.stats.encounters += 1;
    saveState(huntState);
    return curse;
  }

  function applyImmediatePenalty(creature, castId) {
    const config = creature.curse;
    const messages = [];
    let items = bag();
    if (config.initialPearlFlat) {
      const lost = spend(config.initialPearlFlat, `${creature.name}：${config.label}`);
      if (lost) messages.push(`流失 ${format(lost)} 珍珠`);
    }
    if (config.initialPearlPct) {
      const lost = spend(Math.floor(walletBalance()*config.initialPearlPct), `${creature.name}：${config.label}`);
      if (lost) messages.push(`流失 ${format(lost)} 珍珠`);
    }
    if (config.initialDevour) {
      const eaten = devourFrom(items, config.initialDevour, castId);
      if (eaten.length) {
        setBag(items, 'mutant-curse');
        messages.push(`吞噬 ${eaten.length} 件漁獲`);
      }
    }
    return messages;
  }

  function runOriginalCurseTick(event) {
    if (typeof capturedOriginal !== 'function') return;
    const eco = economy();
    const originalChance = eco?.eventChance;
    if (eco) {
      eco.eventChance = function(base, type, ...rest) {
        if (Number(base) === BASE_CHANCE && type === 'special') return -1;
        return typeof originalChance === 'function' ? originalChance.call(this, base, type, ...rest) : Number(base || 0);
      };
    }
    try { capturedOriginal.call(window, event); }
    finally {
      if (eco) {
        if (typeof originalChance === 'function') eco.eventChance = originalChance;
        else delete eco.eventChance;
      }
    }
  }

  function toolCount(toolId) {
    return bag().filter(item => item?.huntToolId === toolId).length;
  }

  function consumeTool(toolId) {
    const items = bag();
    const index = items.findIndex(item => item?.huntToolId === toolId);
    if (index < 0) return null;
    const [item] = items.splice(index,1);
    setBag(items, 'mutant-tool-broken');
    return item;
  }

  function ensurePanel() {
    let panel = document.getElementById(PANEL_ID);
    if (panel) return panel;
    panel = document.createElement('aside');
    panel.id = PANEL_ID;
    panel.className = 'hidden';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-label','變異生物捕獵事件');
    document.body.appendChild(panel);
    return panel;
  }

  function renderPreview() {
    if (!active || active.phase !== 'preview') return;
    const creature = active.creature;
    const tool = tools()[creature.tool];
    const count = toolCount(creature.tool);
    ensurePanel().innerHTML = `<section class="mh-shell" style="--mh-accent:${COLORS[creature.rarity] || '#ff5f9e'}"><header class="mh-head"><div class="mh-title"><span class="mh-creature-icon">${creature.icon}</span><div><h3>${escapeHtml(creature.name)}</h3><p>${escapeHtml(creature.rarity)}變異生物・捕獵準備</p></div></div><button class="mh-decline-button" type="button" data-mutant-decline>放棄</button></header><main class="mh-body"><section class="mh-briefing"><div class="mh-encounter-card"><div class="mh-encounter-icon">${creature.icon}</div><div><span class="mh-encounter-rarity">${escapeHtml(creature.rarity)}・變異生物</span><h4>${escapeHtml(creature.name)}</h4><p>${escapeHtml(creature.trait)}</p></div></div><div class="mh-prep-grid"><article class="mh-prep-box curse"><strong>☣️ 專屬負面效果</strong><p>${escapeHtml(creature.curse.label)}：${escapeHtml(creature.curse.description)}</p></article><article class="mh-prep-box tool"><strong>${tool.icon} 需要捕獵道具</strong><p>${escapeHtml(tool.name)}會在開始捕獵時損壞。</p><div class="mh-tool-owned ${count ? '' : 'missing'}"><span>目前持有</span><b>${count} 件</b></div></article></div>${active.immediate.length ? `<p class="mh-start-note">遭遇時已受到：${escapeHtml(active.immediate.join('、'))}</p>` : '<p class="mh-start-note">負面效果已附著；放棄捕獵也不會解除。</p>'}<div class="mh-start-actions"><button class="mh-start-button" id="mutantHuntStart" type="button" ${count ? '' : 'disabled'}>開始捕獵<span class="mh-start-cost">${tool.icon} 將消耗 1 件 ${escapeHtml(tool.name)}</span></button><button class="mh-decline-button" type="button" data-mutant-decline>保留道具並放棄</button></div></section></main><footer class="mh-footer mh-ready-footer"><span>按下開始後才會消耗道具。</span><span>${count ? `<strong>已準備完成</strong>` : '缺少必要道具'}</span></footer></section>`;
  }

  function renderBattle() {
    if (!active || active.phase !== 'battle') return;
    const creature = active.creature;
    const tool = tools()[creature.tool];
    ensurePanel().innerHTML = `<section class="mh-shell" style="--mh-accent:${COLORS[creature.rarity] || '#ff5f9e'}"><header class="mh-head"><div class="mh-title"><span class="mh-creature-icon">${creature.icon}</span><div><h3>${escapeHtml(creature.name)}</h3><p>${escapeHtml(creature.rarity)}變異生物・連點捕獵</p></div></div><button class="mh-close" type="button" disabled>捕獵中</button></header><main class="mh-body"><p class="mh-warning">☣️ ${escapeHtml(creature.curse.label)}已附著：${escapeHtml(creature.curse.description)}</p><span class="mh-tool">${tool.icon} ${escapeHtml(tool.name)}已啟動，事件結束後必定損壞</span><section class="mh-arena"><div class="mh-versus"><div class="mh-side"><b>變異生物</b><span>${creature.icon}</span></div><span class="mh-vs">VS</span><div class="mh-side"><b>捕獵者</b><span>🧑‍🚀</span></div></div><div class="mh-track"><span class="mh-center"></span><span class="mh-marker" id="mutantHuntMarker" style="left:${active.progress}%">${tool.icon}</span></div><div class="mh-status"><span>生物抵抗：<strong>${escapeHtml(creature.rarity)}</strong></span><span>剩餘：<strong id="mutantHuntTime">${(active.timeLeft/1000).toFixed(1)} 秒</strong></span></div><button class="mh-tap" id="mutantHuntTap" type="button">連續點擊・拉向捕獵區</button><p class="mh-combo" id="mutantHuntCombo">把標記推到最右側即可勝利</p></section></main><footer class="mh-footer"><span>失敗會延長並加重負面效果。</span><span>${tool.icon} 道具已消耗</span></footer></section>`;
  }

  function renderResult() {
    if (!active?.result) return;
    const result = active.result;
    ensurePanel().innerHTML = `<section class="mh-shell" style="--mh-accent:${result.accent}"><header class="mh-head"><div class="mh-title"><span class="mh-creature-icon">${result.icon}</span><div><h3>${escapeHtml(result.title)}</h3><p>${escapeHtml(active.creature.name)}捕獵結果</p></div></div><button class="mh-result-close" type="button">關閉</button></header><main class="mh-body"><section class="mh-result"><div class="mh-result-icon">${result.icon}</div><h4>${escapeHtml(result.title)}</h4><p>${escapeHtml(result.text)}</p><span class="mh-loot">${escapeHtml(result.reward)}</span><button type="button" class="mh-result-close">返回甲板</button></section></main><footer class="mh-footer"><span>${escapeHtml(active.creature.curse.label)}仍會依剩餘回合發作。</span><span>捕獵道具已損壞</span></footer></section>`;
  }

  function updateBattleUi() {
    if (!active || active.phase !== 'battle') return;
    const marker = document.getElementById('mutantHuntMarker');
    const time = document.getElementById('mutantHuntTime');
    const combo = document.getElementById('mutantHuntCombo');
    if (marker) marker.style.left = `${Math.max(0, Math.min(100, active.progress))}%`;
    if (time) time.textContent = `${Math.max(0, active.timeLeft/1000).toFixed(1)} 秒`;
    if (combo) combo.textContent = active.combo >= 5 ? `連擊 ${active.combo}！拉力提升中` : '把標記推到最右側即可勝利';
  }

  function stopTimer() {
    clearInterval(timer);
    timer = 0;
    tick = 0;
  }

  function startBattle() {
    if (!active || active.phase !== 'preview') return;
    const tool = tools()[active.creature.tool];
    const toolItem = consumeTool(active.creature.tool);
    if (!toolItem) {
      renderPreview();
      window.COFFEE_SHIP_DECK?.showTip?.(`缺少${tool.name}，無法開始捕獵`, 2200);
      return;
    }
    active.phase = 'battle';
    active.toolItem = toolItem;
    active.progress = 48;
    active.timeLeft = DURATION[active.creature.rarity] || 14000;
    active.combo = 0;
    active.clicks = 0;
    active.lastTapAt = 0;
    const huntState = state();
    huntState.stats.hunts += 1;
    saveState(huntState);
    pushEvent('變異捕獵｜開始捕獵', `已消耗 ${tool.icon} ${tool.name}，開始壓制${active.creature.name}。`, active.creature.icon, COLORS[active.creature.rarity], active.castId);
    renderBattle();
    startLoop();
  }

  function tapBattle() {
    if (!active || active.phase !== 'battle') return;
    const now = Date.now();
    active.combo = now - active.lastTapAt <= 360 ? active.combo + 1 : 1;
    active.lastTapAt = now;
    active.clicks += 1;
    const difficulty = DIFFICULTY[active.creature.rarity] || 1;
    const gain = Math.max(2.2, 4.2 - difficulty*.75) + Math.min(2.2, active.combo*.075);
    active.progress = Math.min(100, active.progress + gain);
    updateBattleUi();
    if (active.progress >= 100) finishVictory();
  }

  function addBagItem(item, source) {
    const items = bag();
    items.push(item);
    setBag(items, source);
    return item;
  }

  function addCapturedCreature(creature, castId) {
    const weight = creature.min + Math.random()*(creature.max-creature.min);
    const item = {
      mutantId:creature.id,icon:creature.icon,name:creature.name,zone:'深淵變異狩獵',rarity:creature.rarity,
      quality:'變異捕獲',weight,kind:'mutant',trait:`${creature.trait}。經由捕獵事件成功控制。`,castId,
      coffeePearlBonus:modifiers().pearlBonus,source:'mutant-hunt',at:Date.now()
    };
    addBagItem(item, 'mutant-capture');
    const dex = read(DEX_KEY, {});
    dex[item.name] = Math.max(Number(dex[item.name] || 0), Number(weight.toFixed(2)));
    save(DEX_KEY, dex);
    return item;
  }

  function addTrophy(creature, castId) {
    const loot = creature.loot;
    return addBagItem({
      mutantTrophyId:`${creature.id}_trophy`,icon:loot.icon,name:loot.name,rarity:loot.rarity,quality:'變異戰利品',
      kind:'treasure',group:'mutant-trophy',zone:`${creature.name}捕獵事件`,trait:loot.trait,sellPrice:loot.sellPrice,
      weight:.12,uniqueDropSource:creature.id,castId,source:'mutant-hunt-trophy',at:Date.now()
    }, 'mutant-trophy');
  }

  function finishVictory() {
    if (!active || active.phase !== 'battle') return;
    stopTimer();
    const creature = active.creature;
    const huntState = state();
    huntState.stats.wins += 1;
    const captured = Math.random() < (CAPTURE_CHANCE[creature.rarity] || .35);
    const rewardItem = captured ? addCapturedCreature(creature, active.castId) : addTrophy(creature, active.castId);
    if (captured) huntState.stats.captures += 1;
    else huntState.stats.trophies += 1;
    saveState(huntState);
    const title = captured ? '成功捕獲變異生物' : '擊退並取得獨特戰利品';
    const text = captured ? `你在拔河中壓制了${creature.name}，捕獲個體已放入背包。` : `${creature.name}掙脫前留下了專屬戰利品。`;
    const reward = `${rewardItem.icon} ${rewardItem.name}［${rewardItem.rarity}］`;
    pushEvent(`變異捕獵｜${title}`, `${text}\n獲得：${reward}`, rewardItem.icon, COLORS[rewardItem.rarity] || '#ffe16b', active.castId);
    active.phase = 'result';
    active.result = {title,text,reward,icon:rewardItem.icon,accent:COLORS[rewardItem.rarity] || '#ffe16b'};
    renderResult();
  }

  function aggravateCurse() {
    const huntState = state();
    const curse = huntState.curses.find(row => row.instanceId === active.curseInstanceId);
    const config = active.creature.curse;
    if (curse) {
      curse.remaining += Math.max(2, Number(config.failExtra || 2));
      curse.severity = Math.max(1.5, Number(curse.severity || 1)*1.35);
    }
    let items = bag();
    const messages = [];
    if (config.failPearlFlat) {
      const lost = spend(config.failPearlFlat, `${active.creature.name}捕獵失敗`);
      if (lost) messages.push(`額外流失 ${format(lost)} 珍珠`);
    }
    if (config.failPearlPct) {
      const lost = spend(Math.floor(walletBalance()*config.failPearlPct), `${active.creature.name}捕獵失敗`);
      if (lost) messages.push(`額外流失 ${format(lost)} 珍珠`);
    }
    if (config.failDevour) {
      const eaten = devourFrom(items, config.failDevour, active.castId);
      if (eaten.length) {
        setBag(items, 'mutant-hunt-failure');
        messages.push(`額外吞噬 ${eaten.length} 件漁獲`);
      }
    }
    huntState.stats.failures += 1;
    saveState(huntState);
    return messages;
  }

  function finishFailure(reason='力量被完全壓制') {
    if (!active || active.phase !== 'battle') return;
    stopTimer();
    const extra = aggravateCurse();
    const text = `${reason}。${active.creature.curse.label}的持續時間增加，強度也被放大。${extra.length ? `\n${extra.join('、')}。` : ''}`;
    pushEvent('變異捕獵｜捕獵失敗', text, '💥', '#c96a4a', active.castId);
    active.phase = 'result';
    active.result = {title:'捕獵失敗・懲罰加重',text,reward:'沒有獲得捕獲物或戰利品',icon:'💥',accent:'#c96a4a'};
    renderResult();
  }

  function startLoop() {
    stopTimer();
    timer = setInterval(() => {
      if (!active || active.phase !== 'battle') return stopTimer();
      tick += 1;
      active.timeLeft -= 100;
      const difficulty = DIFFICULTY[active.creature.rarity] || 1;
      let resistance = difficulty*(.72 + Math.random()*.36);
      if (tick % 10 === 0) resistance += difficulty*(1.8 + Math.random()*2.2);
      active.progress = Math.max(0, active.progress - resistance);
      if (Date.now() - active.lastTapAt > 520) active.combo = 0;
      updateBattleUi();
      if (active.progress <= 0) finishFailure('變異生物把鎖具拖入深海');
      else if (active.timeLeft <= 0) finishFailure('捕獵時間耗盡');
    }, 100);
  }

  function closeCurrent() {
    if (!active) return true;
    if (active.phase === 'battle') return false;
    stopTimer();
    ensurePanel().classList.add('hidden');
    document.body.classList.remove('mutant-hunt-open');
    active = null;
    return true;
  }

  function declinePreview() {
    if (!active || active.phase !== 'preview') return;
    const creature = active.creature;
    pushEvent('變異捕獵｜放棄捕獵', `你保留了捕獵道具，但${creature.curse.label}仍會持續發作。`, creature.icon, '#c96a4a', active.castId);
    ensurePanel().classList.add('hidden');
    document.body.classList.remove('mutant-hunt-open');
    active = null;
  }

  function openPreview(creature, curse, castId, immediate=[]) {
    active = {phase:'preview',creature,curseInstanceId:curse.instanceId,castId,immediate,result:null};
    try { window.COFFEE_SHIP_FISHING_API?.close?.(); } catch {}
    renderPreview();
    ensurePanel().classList.remove('hidden');
    document.body.classList.add('mutant-hunt-open');
  }

  function encounter(detail, forcedCreature=null) {
    if (active || document.body.classList.contains('auction-ship-open') || document.body.classList.contains('salvage-qte-open') || document.body.classList.contains('ocean-friends-qte-open')) return;
    if (!forcedCreature && Math.random() > eventChance()) return;
    const creature = forcedCreature || rarityPick();
    if (!creature) return;
    const curse = addCurse(creature);
    const immediate = applyImmediatePenalty(creature, detail.castId);
    const tool = tools()[creature.tool];
    const count = toolCount(creature.tool);
    const baseText = `${creature.trait}。\n專屬負面效果：${creature.curse.label}－${creature.curse.description}${immediate.length ? `\n立即影響：${immediate.join('、')}` : ''}`;
    if (!count) {
      pushEvent(`變異生物｜${creature.name}`, `${baseText}\n缺少 ${tool.icon} ${tool.name}，無法啟動捕獵，生物已逃入深海。`, creature.icon, COLORS[creature.rarity], detail.castId);
      window.COFFEE_SHIP_DECK?.showTip?.(`${creature.icon} 遭遇${creature.name}，缺少${tool.name}`, 2200);
      return;
    }
    pushEvent(`變異生物｜${creature.name}`, `${baseText}\n已發現 ${tool.icon} ${tool.name}，等待玩家決定是否開始捕獵。`, creature.icon, COLORS[creature.rarity], detail.castId);
    openPreview(creature, curse, detail.castId, immediate);
  }

  function processFishingResult(event) {
    const detail = event.detail || {};
    if (!detail.item || !detail.castId) return;
    runOriginalCurseTick(event);
    if (active) return;
    encounter(detail);
  }

  function bind() {
    if (bound) return;
    bound = true;
    nativeAdd.call(window, 'coffee-ship:fishing-result', processFishingResult);
    document.addEventListener('click', event => {
      if (!event.target.closest?.(`#${PANEL_ID}`)) return;
      if (event.target.closest('#mutantHuntStart')) {
        event.preventDefault(); event.stopImmediatePropagation(); startBattle(); return;
      }
      if (event.target.closest('[data-mutant-decline]')) {
        event.preventDefault(); event.stopImmediatePropagation(); declinePreview(); return;
      }
      if (event.target.closest('#mutantHuntTap')) {
        event.preventDefault(); event.stopImmediatePropagation(); tapBattle(); return;
      }
      if (event.target.closest('.mh-result-close')) {
        event.preventDefault(); event.stopImmediatePropagation(); closeCurrent();
      }
    }, true);
    nativeAdd.call(window, 'keydown', event => {
      if (!active || event.repeat) return;
      if (active.phase === 'preview' && event.key === 'Enter') {
        event.preventDefault(); startBattle();
      } else if (active.phase === 'battle' && (event.code === 'Space' || event.key === 'Enter')) {
        event.preventDefault(); tapBattle();
      }
    });
    nativeAdd.call(window, 'coffee-ship:scene', event => {
      if (event.detail?.scene === 'deck' || !active) return;
      if (active.phase === 'battle') finishFailure('你離開甲板，捕獵鎖具失去支點');
      else if (active.phase === 'preview') declinePreview();
      else closeCurrent();
    });
  }

  function installApi() {
    const previous = window.COFFEE_SHIP_MUTANT_HUNT || {};
    window.COFFEE_SHIP_MUTANT_HUNT = {
      ...previous,
      open:id => {
        const creature = creatures().find(row => row.id === id) || creatures()[0];
        if (!creature) return false;
        encounter({castId:`mutant_test_${Date.now()}`,item:{name:'測試遭遇'}}, creature);
        return true;
      },
      close:closeCurrent,
      start:startBattle,
      version:6
    };
    window.dispatchEvent(new CustomEvent('coffee-ship:mutant-hunt-start-ready', {detail:{version:1}}));
  }

  function init() {
    ensurePanel();
    bind();
    installApi();
  }

  nativeAdd.call(window, 'coffee-ship:mutant-hunt-ready', init, {once:true});
  if (document.readyState !== 'loading' && window.COFFEE_SHIP_MUTANT_HUNT?.creatures) init();
})();