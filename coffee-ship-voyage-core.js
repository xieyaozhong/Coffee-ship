(() => {
  'use strict';

  if (window.__COFFEE_SHIP_CORE_V3__) return;
  window.__COFFEE_SHIP_CORE_V3__ = true;

  const SCHEMA_VERSION = 3;
  const STORAGE_KEY = 'coffeeShipCoreV3';
  const MAX_LOG = 24;
  const content = new Map();
  const subscribers = new Set();

  const RANKS = Object.freeze([
    {level:1,threshold:0,title:'見習航員'},
    {level:2,threshold:120,title:'夜航船員'},
    {level:3,threshold:320,title:'航路觀測員'},
    {level:4,threshold:650,title:'首席領航員'},
    {level:5,threshold:1100,title:'咖啡船長'}
  ]);

  const ROUTES = Object.freeze({
    stillwater:{
      id:'stillwater',name:'靜潮近海',english:'STILL WATER',unlockRank:1,rewardMultiplier:1,
      description:'平穩、明亮，適合熟悉咖啡船與船員。',tone:'#8fc8bc'
    },
    moonlight:{
      id:'moonlight',name:'月光航道',english:'MOONLIGHT PASSAGE',unlockRank:2,rewardMultiplier:1.25,
      description:'故事與船員相遇較多，報酬也更豐厚。',tone:'#9bbdcd'
    },
    abyss:{
      id:'abyss',name:'深淵外緣',english:'ABYSSAL RIM',unlockRank:4,rewardMultiplier:1.6,
      description:'長距離深海航線，需要更完整的補給與漁獲。',tone:'#d7a4a0'
    }
  });

  const MISSIONS = Object.freeze({
    greet:{id:'greet',event:'npc',title:'向船員報到',description:'與任一名船員互動',goal:1,unit:'次',reputation:18},
    crew:{id:'crew',event:'npc',title:'巡過主艙',description:'與兩名不同船員互動',goal:2,unit:'人',unique:'npc',reputation:26},
    deck:{id:'deck',event:'scene-deck',title:'踏上夜航甲板',description:'從主艙前往甲板',goal:1,unit:'次',reputation:18},
    return:{id:'return',event:'scene-return',title:'帶著海風回艙',description:'到過甲板後返回咖啡廳',goal:1,unit:'次',reputation:22},
    fish:{id:'fish',event:'fish',title:'帶回今日漁獲',description:'在甲板完成一次釣魚',goal:1,unit:'尾',unique:'cast',reputation:24},
    fish2:{id:'fish2',event:'fish',title:'補足本航次收穫',description:'完成兩次不同的釣魚',goal:2,unit:'尾',unique:'cast',reputation:32},
    fish3:{id:'fish3',event:'fish',title:'完成深海採集',description:'完成三次不同的釣魚',goal:3,unit:'尾',unique:'cast',reputation:44},
    coffee:{id:'coffee',event:'coffee',title:'配置航行咖啡',description:'向 Momo 購買一杯效果咖啡',goal:1,unit:'杯',reputation:22},
    rest:{id:'rest',event:'rest',title:'整理航海心情',description:'在主艙找一張椅子休息',goal:1,unit:'次',reputation:16},
    cargo:{id:'cargo',event:'bag',title:'整理本次貨艙',description:'將兩件新物品收進背包',goal:2,unit:'件',unique:'item',reputation:28},
    earn:{id:'earn',event:'earn',title:'累積航行收入',description:'透過販售或事件獲得 20 珍珠',goal:20,unit:'珍珠',reputation:28},
    message:{id:'message',event:'message',title:'留下船上札記',description:'在留言板留下一則訊息',goal:1,unit:'則',reputation:20}
  });

  const ROUTE_PLANS = Object.freeze({
    stillwater:[
      ['greet','deck','fish'],
      ['coffee','crew','rest'],
      ['deck','fish2','return'],
      ['message','coffee','fish'],
      ['crew','cargo','earn']
    ],
    moonlight:[
      ['coffee','crew','fish2'],
      ['message','deck','return'],
      ['crew','cargo','fish2'],
      ['coffee','earn','message']
    ],
    abyss:[
      ['coffee','deck','fish3'],
      ['cargo','earn','return'],
      ['crew','fish3','cargo']
    ]
  });

  let state = null;
  let hud = null;
  let journal = null;
  let previousFocus = null;
  let rewarding = false;

  function safeJson(raw,fallback){
    try{return raw?JSON.parse(raw):fallback;}catch{return fallback;}
  }

  function clone(value){return JSON.parse(JSON.stringify(value));}

  function currentRank(reputation){
    let rank=RANKS[0];
    for(const candidate of RANKS)if(reputation>=candidate.threshold)rank=candidate;
    return rank;
  }

  function nextRank(reputation){
    return RANKS.find(rank=>rank.threshold>reputation)||null;
  }

  function legacyBag(){
    const bag=safeJson(localStorage.getItem('coffeeShipFishBag'),[]);
    return Array.isArray(bag)?bag:[];
  }

  function legacyProfile(){
    const avatar=safeJson(localStorage.getItem('coffeeShipAvatar'),{})||{};
    const role=safeJson(localStorage.getItem('coffeeShipRole'),null);
    return{
      id:localStorage.getItem('coffeeShipPlayerId')||'',
      name:role?.name||avatar.name||'海上旅人',
      avatar:{
        hair:avatar.hair||'#2b1d16',shirt:avatar.shirt||'#c96a4a',skin:avatar.skin||'#f0c7a0',animal:avatar.animal||'human'
      },
      roleId:role?.id||role?.role||''
    };
  }

  function objectiveFor(id){
    const definition=MISSIONS[id];
    return{id,progress:0,goal:definition.goal,complete:false,seen:[],completedAt:null};
  }

  function planFor(routeId,voyageNumber){
    const plans=ROUTE_PLANS[routeId]||ROUTE_PLANS.stillwater;
    const plan=plans[(Math.max(1,voyageNumber)-1)%plans.length];
    return plan.map(objectiveFor);
  }

  function defaultState(){
    const reputation=0;
    const rank=currentRank(reputation);
    return{
      schemaVersion:SCHEMA_VERSION,
      revision:0,
      profile:legacyProfile(),
      resources:{pearls:Math.max(0,Number(localStorage.getItem('coffeeShipPearls')||0)),reputation},
      inventory:{capacity:10,count:legacyBag().length,totalCaught:Number(localStorage.getItem('coffeeShipCatchCount')||0)},
      ship:{rodLevel:1,holdLevel:1,hullLevel:1},
      cafe:{level:1,recipes:1},
      crew:{momo:{bond:0},peak:{bond:0},bean:{bond:0},mugi:{bond:0}},
      progression:{rank:rank.level,rankTitle:rank.title,voyageNumber:1,completedVoyages:0,unlockedRoutes:['stillwater']},
      session:{phase:'boarding',scene:{id:'cafe'},activity:{kind:'none'},modal:null},
      voyage:{
        status:'active',routeId:'stillwater',pendingRouteId:'stillwater',nodeIndex:0,
        visitedDeck:false,objectives:planFor('stillwater',1),startedAt:Date.now(),completedAt:null,reward:0
      },
      log:[]
    };
  }

  function sanitizeState(value){
    const base=defaultState();
    if(!value||Number(value.schemaVersion)!==SCHEMA_VERSION)return base;
    const merged={
      ...base,...value,
      profile:{...base.profile,...value.profile,avatar:{...base.profile.avatar,...value.profile?.avatar}},
      resources:{...base.resources,...value.resources},
      inventory:{...base.inventory,...value.inventory},
      ship:{...base.ship,...value.ship},
      cafe:{...base.cafe,...value.cafe},
      crew:{...base.crew,...value.crew},
      progression:{...base.progression,...value.progression},
      session:{...base.session,...value.session,scene:{...base.session.scene,...value.session?.scene},activity:{...base.session.activity,...value.session?.activity}},
      voyage:{...base.voyage,...value.voyage},
      log:Array.isArray(value.log)?value.log.slice(0,MAX_LOG):[]
    };
    if(!Array.isArray(merged.voyage.objectives)||!merged.voyage.objectives.length){
      merged.voyage.objectives=planFor(merged.voyage.routeId,merged.progression.voyageNumber);
    }
    merged.voyage.objectives=merged.voyage.objectives.filter(row=>MISSIONS[row.id]).map(row=>({
      ...objectiveFor(row.id),...row,seen:Array.isArray(row.seen)?row.seen:[]
    }));
    return merged;
  }

  function loadState(){return sanitizeState(safeJson(localStorage.getItem(STORAGE_KEY),null));}

  function save(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch{return false;}
  }

  function envelope(detail={}){
    return{schema:SCHEMA_VERSION,revision:state.revision,source:'core-v3',at:Date.now(),...detail};
  }

  function emit(name,detail={}){
    try{window.dispatchEvent(new CustomEvent(name,{detail:envelope(detail)}));}catch{}
  }

  function publish(reason,detail={}){
    state.revision+=1;
    save();
    render();
    const snapshot=clone(state);
    for(const subscriber of subscribers){try{subscriber(snapshot,{reason,...detail});}catch{}}
    emit('coffee-ship:state-changed',{reason,state:snapshot,...detail});
  }

  function notify(message,type='info'){
    if(window.COFFEE_SHIP_RUNTIME?.toast){
      window.COFFEE_SHIP_RUNTIME.toast(message,type,3000);
      return;
    }
    const world=window.COFFEE_SHIP_GAME_API?.world;
    if(world){world.message=message;world.messageTimer=260;}
  }

  function syncRank(){
    const rank=currentRank(state.resources.reputation);
    const previous=state.progression.rank;
    state.progression.rank=rank.level;
    state.progression.rankTitle=rank.title;
    const unlocked=Object.values(ROUTES).filter(route=>route.unlockRank<=rank.level).map(route=>route.id);
    state.progression.unlockedRoutes=Array.from(new Set([...state.progression.unlockedRoutes,...unlocked]));
    if(rank.level>previous){
      notify(`聲望提升：${rank.title}`,'success');
      emit('coffee-ship:rank-up',{rank});
    }
  }

  function missionValue(definition,type,detail,objective){
    if(definition.event!==type)return 0;
    if(type==='npc'){
      const key=String(detail?.npc?.name||detail?.npc?.role||'crew');
      if(definition.unique){
        if(objective.seen.includes(key))return 0;
        objective.seen.push(key);
      }
      return 1;
    }
    if(type==='fish'){
      const key=String(detail?.castId||detail?.item?.id||detail?.item?.acquiredAt||Date.now());
      if(objective.seen.includes(key))return 0;
      objective.seen.push(key);
      return 1;
    }
    if(type==='bag'){
      const item=detail?.item||(Array.isArray(detail?.items)?detail.items[0]:null);
      const key=String(item?.id||item?.castId||item?.acquiredAt||`${detail?.source||'bag'}-${state.revision}`);
      if(definition.unique&&objective.seen.includes(key))return 0;
      if(definition.unique)objective.seen.push(key);
      return Math.max(1,Array.isArray(detail?.items)?detail.items.length:1);
    }
    if(type==='earn'){
      if(detail?.meta?.source==='voyage-core'||detail?.source==='voyage-core')return 0;
      return Math.max(0,Number(detail?.delta||0));
    }
    return 1;
  }

  function updateCrewBond(detail){
    const role=detail?.npc?.role;
    const key=role==='barista'?'momo':role==='cellist'?'peak':role==='joker'?'bean':role==='cat'?'mugi':null;
    if(key&&state.crew[key])state.crew[key].bond=Math.min(100,Number(state.crew[key].bond||0)+2);
  }

  function progress(type,detail={}){
    if(state.voyage.status!=='active')return false;
    let changed=false;
    const completed=[];
    for(const objective of state.voyage.objectives){
      if(objective.complete)continue;
      const definition=MISSIONS[objective.id];
      const amount=missionValue(definition,type,detail,objective);
      if(amount<=0)continue;
      objective.progress=Math.min(objective.goal,Number(objective.progress||0)+amount);
      changed=true;
      if(objective.progress>=objective.goal){
        objective.complete=true;
        objective.completedAt=Date.now();
        state.resources.reputation+=definition.reputation;
        state.voyage.nodeIndex+=1;
        completed.push(definition);
        state.log.unshift({kind:'objective',title:definition.title,at:Date.now(),voyage:state.progression.voyageNumber});
      }
    }
    if(type==='npc')updateCrewBond(detail);
    if(!changed&&type!=='npc')return false;
    syncRank();
    publish('voyage-progress',{type,completed:completed.map(row=>row.id)});
    if(completed.length){
      notify(`航程進度：${completed.map(row=>row.title).join('、')}`,'success');
      emit('coffee-ship:voyage-progressed',{type,completed:completed.map(row=>row.id),voyage:state.progression.voyageNumber});
    }
    if(state.voyage.objectives.every(row=>row.complete))settleVoyage();
    return true;
  }

  function settleVoyage(){
    if(state.voyage.status!=='active'||rewarding)return;
    rewarding=true;
    const route=ROUTES[state.voyage.routeId]||ROUTES.stillwater;
    const reward=Math.round((36+state.progression.voyageNumber*5)*route.rewardMultiplier);
    state.voyage.status='ready';
    state.voyage.completedAt=Date.now();
    state.voyage.reward=reward;
    state.resources.reputation+=32;
    state.progression.completedVoyages+=1;
    state.log.unshift({kind:'voyage',title:`完成 ${route.name}`,reward,at:Date.now(),voyage:state.progression.voyageNumber});
    state.log=state.log.slice(0,MAX_LOG);
    syncRank();
    publish('voyage-settled',{reward,routeId:route.id});
    emit('coffee-ship:voyage-settled',{reward,routeId:route.id,voyage:state.progression.voyageNumber});
    queueMicrotask(()=>{
      const economy=window.COFFEE_SHIP_ECONOMY;
      if(economy?.earn)economy.earn(reward,`完成第 ${state.progression.voyageNumber} 趟航程`,{source:'voyage-core',routeId:route.id});
      else window.COFFEE_SHIP_GAME_API?.setPearls?.((window.COFFEE_SHIP_GAME_API?.getPearls?.()||0)+reward);
      rewarding=false;
    });
    notify(`航程完成，獲得 ${reward} 珍珠。打開航程日誌安排下一趟。`,'success');
  }

  function startNextVoyage(routeId=state.voyage.pendingRouteId){
    if(state.voyage.status!=='ready')return false;
    const route=ROUTES[routeId]||ROUTES.stillwater;
    if(!state.progression.unlockedRoutes.includes(route.id))return false;
    state.progression.voyageNumber+=1;
    state.voyage={
      status:'active',routeId:route.id,pendingRouteId:route.id,nodeIndex:0,visitedDeck:false,
      objectives:planFor(route.id,state.progression.voyageNumber),startedAt:Date.now(),completedAt:null,reward:0
    };
    state.session.scene={id:'cafe'};
    state.session.activity={kind:'none'};
    publish('voyage-started',{routeId:route.id,voyage:state.progression.voyageNumber});
    emit('coffee-ship:voyage-started',{routeId:route.id,voyage:state.progression.voyageNumber});
    window.COFFEE_SHIP_DECK?.switchToCafe?.();
    closeJournal();
    notify(`第 ${state.progression.voyageNumber} 趟航程：${route.name}`,'success');
    return true;
  }

  function setPendingRoute(routeId){
    if(!ROUTES[routeId]||!state.progression.unlockedRoutes.includes(routeId))return false;
    state.voyage.pendingRouteId=routeId;
    publish('route-selected',{routeId});
    return true;
  }

  function setScene(scene){
    const next=['cafe','deck','port'].includes(scene)?scene:'cafe';
    if(next==='cafe'&&window.COFFEE_SHIP_PORT?.isOpen?.())return;
    const previous=state.session.scene.id;
    state.session.scene={id:next};
    if(next==='deck')state.voyage.visitedDeck=true;
    publish('scene-changed',{scene:next,previous});
    if(next==='deck')progress('scene-deck',{scene:next,previous});
    if(next==='cafe'&&state.voyage.visitedDeck&&previous!=='cafe')progress('scene-return',{scene:next,previous});
  }

  function syncExternalState(){
    state.profile=legacyProfile();
    state.resources.pearls=window.COFFEE_SHIP_ECONOMY?.balance?.()??Math.max(0,Number(localStorage.getItem('coffeeShipPearls')||0));
    const bag=legacyBag();
    state.inventory.count=bag.length;
    state.inventory.capacity=Math.max(10,Number(state.ship.holdLevel||1)*10);
    state.inventory.totalCaught=Math.max(Number(state.inventory.totalCaught||0),Number(localStorage.getItem('coffeeShipCatchCount')||0));
  }

  function dispatch(command){
    const value=typeof command==='string'?{type:command}:command||{};
    switch(value.type){
      case'GAME_ENTERED':
        state.session.phase='playing';
        syncExternalState();
        publish('game-entered');
        return true;
      case'SCENE_CHANGED':setScene(value.scene);return true;
      case'PROGRESS':return progress(value.event,value.detail||{});
      case'SET_ROUTE':return setPendingRoute(value.routeId);
      case'NEXT_VOYAGE':return startNextVoyage(value.routeId);
      case'SYNC_EXTERNAL':syncExternalState();publish('external-sync');return true;
      case'OPEN_JOURNAL':openJournal();return true;
      case'CLOSE_JOURNAL':closeJournal();return true;
      default:return false;
    }
  }

  function objectiveView(objective){
    const definition=MISSIONS[objective.id];
    return{...objective,title:definition.title,description:definition.description,unit:definition.unit};
  }

  function firstIncomplete(){
    return state.voyage.objectives.find(row=>!row.complete)||null;
  }

  function routeView(routeId=state.voyage.routeId){return ROUTES[routeId]||ROUTES.stillwater;}

  function ensureHud(){
    const topbar=document.querySelector('.game-topbar');
    if(!topbar)return null;
    hud=document.getElementById('voyageHud');
    if(!hud){
      hud=document.createElement('section');
      hud.id='voyageHud';
      hud.className='voyage-hud';
      hud.setAttribute('aria-label','目前航程');
      hud.innerHTML=`
        <div class="voyage-hud__route"><span id="voyageHudKicker">VOYAGE</span><strong id="voyageHudRoute">靜潮近海</strong></div>
        <div class="voyage-hud__objective"><span id="voyageHudStep">CURRENT OBJECTIVE</span><strong id="voyageHudTitle">向船員報到</strong><div class="voyage-hud__track"><span id="voyageHudProgress"></span></div></div>
        <div class="voyage-hud__metrics"><span id="voyageHudPearls">0 珍珠</span><span id="voyageHudCargo">0 / 10 貨艙</span><button id="voyageJournalBtn" type="button">航程日誌</button></div>`;
      topbar.appendChild(hud);
    }
    return hud;
  }

  function ensureJournal(){
    journal=document.getElementById('voyageJournal');
    if(journal)return journal;
    journal=document.createElement('aside');
    journal.id='voyageJournal';
    journal.className='voyage-journal hidden';
    journal.setAttribute('role','dialog');
    journal.setAttribute('aria-modal','true');
    journal.setAttribute('aria-labelledby','voyageJournalTitle');
    journal.innerHTML=`
      <div class="voyage-journal__backdrop" data-voyage-close></div>
      <section class="voyage-journal__sheet">
        <header class="voyage-journal__head"><div><p>CAPTAIN'S LOG</p><h2 id="voyageJournalTitle">航程日誌</h2></div><button class="voyage-journal__close" type="button" data-voyage-close aria-label="關閉航程日誌">關閉</button></header>
        <div class="voyage-journal__body">
          <section class="voyage-journal__summary" id="voyageSummary"></section>
          <section><div class="voyage-journal__section-head"><span>本次目標</span><small id="voyageObjectiveCount"></small></div><div class="voyage-objectives" id="voyageObjectives"></div></section>
          <section id="voyageRoutesSection"><div class="voyage-journal__section-head"><span>下一條航線</span><small>完成本次航程後可選擇</small></div><div class="voyage-routes" id="voyageRoutes"></div></section>
          <section><div class="voyage-journal__section-head"><span>船上紀錄</span><small>長線進度</small></div><div class="voyage-stats" id="voyageStats"></div></section>
        </div>
        <footer class="voyage-journal__foot"><span id="voyageJournalHint">完成三個目標即可結算。</span><button id="voyageNextBtn" type="button">開始下一趟航程</button></footer>
      </section>`;
    document.body.appendChild(journal);
    return journal;
  }

  function renderHud(){
    if(!ensureHud())return;
    const route=routeView();
    const current=firstIncomplete();
    const completed=state.voyage.objectives.filter(row=>row.complete).length;
    const ratio=state.voyage.objectives.length?completed/state.voyage.objectives.length:0;
    document.getElementById('voyageHudKicker').textContent=`VOYAGE ${String(state.progression.voyageNumber).padStart(2,'0')} · ${route.english}`;
    document.getElementById('voyageHudRoute').textContent=route.name;
    document.getElementById('voyageHudStep').textContent=state.voyage.status==='ready'?'VOYAGE COMPLETE':`OBJECTIVE ${Math.min(completed+1,state.voyage.objectives.length)} / ${state.voyage.objectives.length}`;
    document.getElementById('voyageHudTitle').textContent=current?MISSIONS[current.id].title:`航程完成 · ${state.voyage.reward} 珍珠待結算`;
    document.getElementById('voyageHudProgress').style.width=`${Math.round(ratio*100)}%`;
    document.getElementById('voyageHudPearls').textContent=`${state.resources.pearls} 珍珠`;
    document.getElementById('voyageHudCargo').textContent=`${state.inventory.count} / ${state.inventory.capacity} 貨艙`;
    document.getElementById('voyageJournalBtn').classList.toggle('is-ready',state.voyage.status==='ready');
  }

  function renderJournal(){
    if(!ensureJournal())return;
    const route=routeView();
    const rank=currentRank(state.resources.reputation);
    const next=nextRank(state.resources.reputation);
    const completed=state.voyage.objectives.filter(row=>row.complete).length;
    document.getElementById('voyageSummary').innerHTML=`
      <div><p>第 ${String(state.progression.voyageNumber).padStart(2,'0')} 趟航程</p><h3>${route.name}</h3><span>${route.description}</span></div>
      <div class="voyage-journal__rank"><small>${rank.title}</small><strong>${state.resources.reputation}</strong><span>${next?`距離 ${next.title} 還有 ${next.threshold-state.resources.reputation}`:'最高聲望'}</span></div>`;
    document.getElementById('voyageObjectiveCount').textContent=`${completed} / ${state.voyage.objectives.length} 完成`;
    document.getElementById('voyageObjectives').innerHTML=state.voyage.objectives.map(objective=>{
      const view=objectiveView(objective);
      const percent=Math.min(100,Math.round(view.progress/view.goal*100));
      return`<article class="voyage-objective ${view.complete?'is-complete':''}"><span class="voyage-objective__mark">${view.complete?'✓':String(state.voyage.objectives.indexOf(objective)+1).padStart(2,'0')}</span><div><strong>${view.title}</strong><p>${view.description}</p><div class="voyage-objective__track"><span style="width:${percent}%"></span></div></div><small>${view.progress} / ${view.goal} ${view.unit}</small></article>`;
    }).join('');
    document.getElementById('voyageRoutesSection').classList.toggle('is-locked',state.voyage.status!=='ready');
    document.getElementById('voyageRoutes').innerHTML=Object.values(ROUTES).map(routeItem=>{
      const unlocked=state.progression.unlockedRoutes.includes(routeItem.id);
      const selected=state.voyage.pendingRouteId===routeItem.id;
      return`<button class="voyage-route ${selected?'is-selected':''}" type="button" data-route-id="${routeItem.id}" ${unlocked&&state.voyage.status==='ready'?'':'disabled'} style="--route-tone:${routeItem.tone}"><span>${routeItem.english}</span><strong>${routeItem.name}</strong><small>${unlocked?routeItem.description:`聲望階級 ${routeItem.unlockRank} 解鎖`}</small></button>`;
    }).join('');
    document.getElementById('voyageStats').innerHTML=`
      <div><span>已完成航程</span><strong>${state.progression.completedVoyages}</strong></div>
      <div><span>累積漁獲</span><strong>${state.inventory.totalCaught}</strong></div>
      <div><span>船員羈絆</span><strong>${Object.values(state.crew).reduce((sum,row)=>sum+Number(row.bond||0),0)}</strong></div>
      <div><span>船體階級</span><strong>LV.${state.ship.hullLevel}</strong></div>`;
    const nextButton=document.getElementById('voyageNextBtn');
    nextButton.hidden=state.voyage.status!=='ready';
    nextButton.textContent=`啟航：${routeView(state.voyage.pendingRouteId).name}`;
    document.getElementById('voyageJournalHint').textContent=state.voyage.status==='ready'?`本次獲得 ${state.voyage.reward} 珍珠，選擇下一條航線。`:'完成三個目標即可結算本次航程。';
  }

  function render(){
    syncExternalState();
    renderHud();
    renderJournal();
  }

  function openJournal(){
    ensureJournal();
    renderJournal();
    previousFocus=document.activeElement;
    for(const [key,code] of [['ArrowUp','ArrowUp'],['ArrowDown','ArrowDown'],['ArrowLeft','ArrowLeft'],['ArrowRight','ArrowRight'],['w','KeyW'],['a','KeyA'],['s','KeyS'],['d','KeyD']]){
      window.dispatchEvent(new KeyboardEvent('keyup',{key,code,bubbles:true,cancelable:true}));
    }
    journal.classList.remove('hidden');
    document.body.classList.add('voyage-journal-open');
    setTimeout(()=>journal.querySelector('.voyage-journal__close')?.focus(),0);
  }

  function closeJournal(){
    if(!journal)return;
    journal.classList.add('hidden');
    document.body.classList.remove('voyage-journal-open');
    previousFocus?.focus?.();
  }

  function bindUi(){
    document.addEventListener('click',event=>{
      if(event.target.closest?.('#voyageJournalBtn')){event.preventDefault();openJournal();return;}
      if(event.target.closest?.('[data-voyage-close]')){event.preventDefault();closeJournal();return;}
      const routeButton=event.target.closest?.('[data-route-id]');
      if(routeButton){event.preventDefault();setPendingRoute(routeButton.dataset.routeId);return;}
      if(event.target.closest?.('#voyageNextBtn')){event.preventDefault();startNextVoyage();}
    });
    window.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&!journal?.classList.contains('hidden')){event.preventDefault();closeJournal();return;}
      if(event.key==='Tab'&&!journal?.classList.contains('hidden')){
        const focusable=Array.from(journal.querySelectorAll('button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(node=>!node.hidden);
        if(focusable.length){
          const first=focusable[0],last=focusable[focusable.length-1];
          if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
          else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
        }
      }
      if(event.key.toLowerCase()==='j'&&document.body.classList.contains('coffee-ship-entered')){
        event.preventDefault();journal?.classList.contains('hidden')?openJournal():closeJournal();
      }
    });
  }

  function bindGameEvents(){
    const entered=()=>dispatch({type:'GAME_ENTERED'});
    window.addEventListener('coffee-ship:entered',entered);
    window.addEventListener('coffee-ship:boarding-complete',entered);
    window.addEventListener('coffee-ship:scene',event=>dispatch({type:'SCENE_CHANGED',scene:event.detail?.scene}));
    window.addEventListener('coffee-ship:npc-interaction',event=>dispatch({type:'PROGRESS',event:'npc',detail:event.detail}));
    window.addEventListener('coffee-ship:coffee-ordered',event=>dispatch({type:'PROGRESS',event:'coffee',detail:event.detail}));
    window.addEventListener('coffee-ship:rested',event=>dispatch({type:'PROGRESS',event:'rest',detail:event.detail}));
    window.addEventListener('coffee-ship:message-posted',event=>dispatch({type:'PROGRESS',event:'message',detail:event.detail}));
    window.addEventListener('coffee-ship:fishing-result',event=>{
      state.inventory.totalCaught+=1;
      dispatch({type:'PROGRESS',event:'fish',detail:event.detail});
    });
    window.addEventListener('coffee-ship:bag-changed',event=>dispatch({type:'PROGRESS',event:'bag',detail:event.detail}));
    window.addEventListener('coffee-ship:economy-changed',event=>{
      state.resources.pearls=Math.max(0,Number(event.detail?.balance??event.detail?.pearls??state.resources.pearls));
      if(!rewarding)progress('earn',event.detail||{});
      else{save();render();}
    });
    window.addEventListener('coffeeShipPearlsChanged',event=>{
      state.resources.pearls=Math.max(0,Number(event.detail?.balance??event.detail?.pearls??(Number(localStorage.getItem('coffeeShipPearls'))||0)));
      save();renderHud();
    });
    window.addEventListener('coffee-ship:fishing-state',event=>{
      state.session.activity={kind:'fishing',state:event.detail?.state||event.detail};
      save();renderHud();
    });
    window.addEventListener('storage',event=>{
      if(['coffeeShipPearls','coffeeShipFishBag','coffeeShipAvatar','coffeeShipRole'].includes(event.key))dispatch({type:'SYNC_EXTERNAL'});
    });
  }

  function init(){
    state=loadState();
    syncExternalState();
    ensureHud();
    ensureJournal();
    bindUi();
    bindGameEvents();
    render();
    if(document.body.classList.contains('coffee-ship-entered'))state.session.phase='playing';
    const observer=new MutationObserver(()=>{
      ensureHud();
      const dock=document.getElementById('operationDock');
      if(dock&&!dock.dataset.voyageCollapsed){dock.dataset.voyageCollapsed='true';dock.classList.add('is-collapsed');}
    });
    observer.observe(document.body,{childList:true,subtree:true});
    window.COFFEE_SHIP_CORE_V3={
      version:SCHEMA_VERSION,
      getState:()=>clone(state),
      dispatch,
      subscribe(listener){if(typeof listener!=='function')return()=>{};subscribers.add(listener);return()=>subscribers.delete(listener);},
      registerContent(type,definitions){const rows=Array.isArray(definitions)?definitions:[definitions];content.set(type,[...(content.get(type)||[]),...rows.filter(Boolean)]);return content.get(type).length;},
      save,
      routes:ROUTES,
      missions:MISSIONS,
      openJournal,
      closeJournal,
      dispose(){observer.disconnect();subscribers.clear();closeJournal();}
    };
    save();
    emit('coffee-ship:core-ready',{version:SCHEMA_VERSION,state:clone(state)});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
