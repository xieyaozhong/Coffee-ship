(() => {
  'use strict';
  if (window.__COFFEE_SHIP_MUTANT_CREATURES_V5__) return;
  window.__COFFEE_SHIP_MUTANT_CREATURES_V5__ = true;

  const PANEL_ID = 'mutantHuntEvent';
  const BAG_KEY = 'coffeeShipFishBag';
  const STATE_KEY = 'coffeeShipMutantHuntStateV1';
  const DEX_KEY = 'coffeeShipMutantDex';
  const MAX_BAG = 240;
  const BASE_CHANCE = .05;

  const TOOLS = {
    spectral_lantern:{icon:'🏮',name:'幽光束縛燈'},
    titan_chain:{icon:'⛓️',name:'泰坦鎖鏈槍'},
    venom_net:{icon:'🕸️',name:'抗毒捕獵網'},
    void_anchor:{icon:'⚓',name:'虛空錨籠'},
    elder_seal:{icon:'🧿',name:'古神封印匣'}
  };

  const COLORS = {稀有:'#79d0b1',史詩:'#e9a6b0',傳說:'#ffe16b',神話:'#ffffff',世界級:'#ff5f9e'};
  const DIFFICULTY = {稀有:.62,史詩:.78,傳說:1,神話:1.28,世界級:1.62};
  const CAPTURE_CHANCE = {稀有:.68,史詩:.58,傳說:.44,神話:.3,世界級:.12};
  const DURATION = {稀有:13000,史詩:13500,傳說:14000,神話:15000,世界級:16500};

  const CREATURES = [
    {
      id:'hundred_eye_angler',icon:'👁',name:'百眼鮟鱇',rarity:'傳說',trait:'身上長滿眼睛',min:40,max:180,tool:'spectral_lantern',
      curse:{label:'百眼凝視',description:'接下來 3 竿漁獲價值降低 35%。',casts:3,valueFactor:.65,initialPearlFlat:10,failExtra:3,failPearlFlat:40},
      loot:{icon:'👁️',name:'百眼視網膜',rarity:'傳說',sellPrice:260,trait:'每一層膜都映著不同方向的深海。'}
    },
    {
      id:'two_head_megalodon',icon:'🦈',name:'雙頭巨齒鯊',rarity:'神話',trait:'兩個頭會輪流撕咬漁獲',min:3000,max:16000,tool:'titan_chain',
      curse:{label:'雙首飢餓',description:'立即吞噬 2 件漁獲，接下來 3 竿仍可能繼續吞噬。',casts:3,devourChance:.5,devourCount:1,initialDevour:2,failExtra:3,failDevour:4},
      loot:{icon:'🦷',name:'雙首鯊齒王冠',rarity:'神話',sellPrice:8000,trait:'兩排巨齒自然咬合成王冠形狀。'}
    },
    {
      id:'abyss_maw_octopus',icon:'🐙',name:'深淵裂口章魚',rarity:'神話',trait:'觸腕末端各長著一張嘴',min:600,max:4800,tool:'void_anchor',
      curse:{label:'裂口墨疫',description:'接下來 4 竿重量降低 35%，並持續流失珍珠。',casts:4,weightFactor:.65,pearlFlat:5,initialPearlFlat:20,failExtra:3,failPearlFlat:60},
      loot:{icon:'🫧',name:'裂口活性墨囊',rarity:'神話',sellPrice:2200,trait:'墨汁會自行形成張嘴的黑色輪廓。'}
    },
    {
      id:'glowing_skeleton_fish',icon:'🐟',name:'發光骷髏魚',rarity:'史詩',trait:'全身骨骼持續發出冷光',min:2,max:18,tool:'spectral_lantern',
      curse:{label:'骨光感染',description:'接下來 3 竿每次流失 12 珍珠，價值降低 15%。',casts:3,pearlFlat:12,valueFactor:.85,failExtra:3,failPearlFlat:45},
      loot:{icon:'🦴',name:'骨光脊柱',rarity:'史詩',sellPrice:120,trait:'離水後仍會按照潮汐頻率閃爍。'}
    },
    {
      id:'crystal_king_crab',icon:'🦀',name:'水晶帝王蟹',rarity:'傳說',trait:'甲殼像切割過的深海水晶',min:8,max:55,tool:'venom_net',
      curse:{label:'晶刃裂傷',description:'接下來 3 竿漁獲價值降低 28%。',casts:3,valueFactor:.72,initialPearlFlat:15,failExtra:3,failPearlFlat:50},
      loot:{icon:'💠',name:'水晶蟹皇甲片',rarity:'傳說',sellPrice:650,trait:'邊緣比玻璃更銳利，內部封存著藍色氣泡。'}
    },
    {
      id:'venom_puffer_king',icon:'🐡',name:'毒刺河豚王',rarity:'史詩',trait:'毒刺能讓肌肉短暫失去反應',min:4,max:28,tool:'venom_net',
      curse:{label:'毒刺麻痺',description:'接下來 4 竿重量降低 22%，每竿流失 8 珍珠。',casts:4,weightFactor:.78,pearlFlat:8,failExtra:4,failPearlFlat:60},
      loot:{icon:'🧪',name:'毒王刺囊',rarity:'史詩',sellPrice:420,trait:'透明囊內的毒液會逆著重力流動。'}
    },
    {
      id:'scythe_shrimp',icon:'🦐',name:'深海鐮刀蝦',rarity:'稀有',trait:'前肢像兩把彎曲鐮刀',min:.6,max:4.8,tool:'venom_net',
      curse:{label:'鐮傷流失',description:'接下來 2 竿每次流失 10 珍珠。',casts:2,pearlFlat:10,initialPearlFlat:20,failExtra:2,failPearlFlat:35},
      loot:{icon:'🗡️',name:'深海鐮刀前肢',rarity:'稀有',sellPrice:160,trait:'薄得近乎透明，卻能切開厚重船繩。'}
    },
    {
      id:'black_hole_squid',icon:'🦑',name:'黑洞烏賊',rarity:'神話',trait:'周圍光線會向牠的身體彎曲',min:120,max:900,tool:'void_anchor',
      curse:{label:'黑洞牽引',description:'立即失去 8% 珍珠；接下來 3 竿持續被吸走珍珠並降低價值。',casts:3,pearlPct:.04,valueFactor:.75,initialPearlPct:.08,failExtra:4,failPearlPct:.12},
      loot:{icon:'⚫',name:'微型黑洞墨珠',rarity:'神話',sellPrice:4500,trait:'會讓附近細小物件緩慢滑向它。'}
    },
    {
      id:'corrupted_blue_whale',icon:'🐋',name:'腐化藍鯨',rarity:'神話',trait:'腐化潮水從皮膚裂縫湧出',min:100000,max:220000,tool:'titan_chain',
      curse:{label:'腐潮擴散',description:'立即吞噬 3 件漁獲；接下來 4 竿重量降低 42%。',casts:4,weightFactor:.58,initialDevour:3,failExtra:4,failDevour:5},
      loot:{icon:'🫀',name:'腐化鯨骨心核',rarity:'神話',sellPrice:25000,trait:'骨質核心仍像心臟般緩慢收縮。'}
    },
    {
      id:'abyss_devourer',icon:'🦈',name:'深淵吞噬者',rarity:'神話',trait:'會追蹤背包中最鮮活的漁獲',min:2000,max:13000,tool:'titan_chain',
      curse:{label:'吞噬印記',description:'立即吞噬 2 件漁獲；接下來 4 竿仍有機率吞噬。',casts:4,devourChance:.4,devourCount:1,initialDevour:2,failExtra:4,failDevour:5},
      loot:{icon:'🔻',name:'吞噬者胃晶',rarity:'神話',sellPrice:18000,trait:'晶體內封存著尚未消化的微型魚影。'}
    },
    {
      id:'abyss_serpent_emperor',icon:'🐍',name:'海淵蛇皇',rarity:'傳說',trait:'蛇身纏繞時會留下黑色咒紋',min:300,max:2200,tool:'titan_chain',
      curse:{label:'蛇皇纏咒',description:'接下來 4 竿漁獲價值降低 45%，每竿流失 6 珍珠。',casts:4,valueFactor:.55,pearlFlat:6,failExtra:3,failPearlFlat:80},
      loot:{icon:'🐲',name:'蛇皇脫鱗',rarity:'傳說',sellPrice:3200,trait:'鱗片彎曲時會顯現一段古老海咒。'}
    },
    {
      id:'lava_lobster',icon:'🦞',name:'熔岩龍蝦',rarity:'傳說',trait:'甲殼縫隙流動著高溫熔光',min:6,max:38,tool:'venom_net',
      curse:{label:'熔燼灼傷',description:'接下來 3 竿每次流失 20 珍珠，重量降低 15%。',casts:3,pearlFlat:20,weightFactor:.85,failExtra:3,failPearlFlat:100},
      loot:{icon:'🔥',name:'熔岩龍蝦心石',rarity:'傳說',sellPrice:900,trait:'浸入冷水後仍維持暗紅高溫。'}
    },
    {
      id:'star_core_butterflyfish',icon:'🐠',name:'星核蝶魚',rarity:'傳說',trait:'鱗片像失控的星光粒子',min:1.5,max:9.5,tool:'spectral_lantern',
      curse:{label:'星核失序',description:'接下來 3 竿重量降低 32%，價值降低 20%。',casts:3,weightFactor:.68,valueFactor:.8,failExtra:3,failPearlFlat:45},
      loot:{icon:'🌠',name:'星核蝶鱗',rarity:'傳說',sellPrice:780,trait:'每片鱗都像一張微縮星圖。'}
    },
    {
      id:'blood_moon_jelly_king',icon:'🐙',name:'血月水母王',rarity:'神話',trait:'紅光會讓四肢短暫麻痺',min:80,max:680,tool:'spectral_lantern',
      curse:{label:'血月麻痺',description:'接下來 4 竿價值降低 30%，每竿流失 10 珍珠。',casts:4,valueFactor:.7,pearlFlat:10,initialPearlFlat:30,failExtra:4,failPearlPct:.1},
      loot:{icon:'🌕',name:'血月水母冠',rarity:'神話',sellPrice:5200,trait:'透明冠膜內永遠懸著一輪紅月。'}
    },
    {
      id:'cursed_hermit_crab',icon:'🐚',name:'詛咒寄居蟹',rarity:'史詩',trait:'殼上的人臉會低聲索取珍珠',min:2,max:18,tool:'venom_net',
      curse:{label:'人面詛咒',description:'接下來 5 竿每次流失 8 珍珠，價值降低 15%。',casts:5,pearlFlat:8,valueFactor:.85,failExtra:5,failPearlFlat:60},
      loot:{icon:'🎭',name:'人面詛咒殼',rarity:'史詩',sellPrice:550,trait:'殼面表情會在無人注視時改變。'}
    },
    {
      id:'nightmare_eel',icon:'🐟',name:'深海夢魘鰻',rarity:'傳說',trait:'低鳴會讓釣手反覆看見失敗畫面',min:25,max:190,tool:'void_anchor',
      curse:{label:'夢魘低鳴',description:'接下來 4 竿價值降低 30%，重量降低 18%。',casts:4,valueFactor:.7,weightFactor:.82,failExtra:4,failPearlFlat:75},
      loot:{icon:'🎵',name:'夢魘鳴囊',rarity:'傳說',sellPrice:2600,trait:'靠近耳邊會播放一段不存在的警報聲。'}
    },
    {
      id:'thousand_leg_sea_spider',icon:'🦀',name:'千足海蜘蛛',rarity:'神話',trait:'絲網會黏住剛取得的漁獲',min:90,max:720,tool:'venom_net',
      curse:{label:'千足纏網',description:'立即吞噬 1 件漁獲；接下來 4 竿重量降低 30%，並可能繼續吞噬。',casts:4,weightFactor:.7,devourChance:.25,devourCount:1,initialDevour:1,failExtra:4,failDevour:3},
      loot:{icon:'🕷️',name:'千足海蜘蛛絲腺',rarity:'神話',sellPrice:4800,trait:'拉出的絲線能在海水中保持完全乾燥。'}
    },
    {
      id:'void_whale',icon:'🐋',name:'虛空鯨',rarity:'神話',trait:'半透明身體會侵蝕周圍物質',min:900,max:9000,tool:'void_anchor',
      curse:{label:'虛空侵蝕',description:'立即失去 12% 珍珠；接下來 4 竿持續失去珍珠且價值降低 40%。',casts:4,valueFactor:.6,pearlPct:.05,initialPearlPct:.12,failExtra:5,failPearlPct:.18},
      loot:{icon:'🫥',name:'虛空鯨透明骨片',rarity:'神話',sellPrice:12000,trait:'放在紙上時，骨片下方的文字會暫時消失。'}
    },
    {
      id:'leviathan_juvenile',icon:'🐉',name:'利維坦幼體',rarity:'神話',trait:'咆哮會讓整片漁場陷入恐懼',min:5000,max:30000,tool:'titan_chain',
      curse:{label:'利維坦恐懼',description:'立即吞噬 4 件漁獲；接下來 5 竿重量減半並可能繼續吞噬。',casts:5,weightFactor:.5,devourChance:.35,devourCount:1,initialDevour:4,failExtra:5,failDevour:6},
      loot:{icon:'🦴',name:'利維坦幼角',rarity:'神話',sellPrice:30000,trait:'幼角內部仍傳來像海嘯般的回聲。'}
    },
    {
      id:'eye_of_cthulhu',icon:'👑',name:'克蘇魯之眼',rarity:'世界級',trait:'凝視本身就會改寫現實',min:999999,max:9999999,tool:'elder_seal',
      curse:{label:'古神凝視',description:'立即失去 25% 珍珠並吞噬 5 件漁獲；接下來 7 竿承受全面侵蝕。',casts:7,valueFactor:.4,weightFactor:.55,pearlPct:.08,initialPearlPct:.25,initialDevour:5,failExtra:7,failPearlPct:.35,failDevour:8},
      loot:{icon:'🌌',name:'克蘇魯虹膜碎片',rarity:'世界級',sellPrice:250000,trait:'碎片中央映出的不是持有者，而是一片陌生星海。'}
    }
  ];

  let activeBattle = null;
  let battleTimer = 0;
  let battleTick = 0;

  function read(key,fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function save(key,value) {
    try { localStorage.setItem(key,JSON.stringify(value)); }
    catch {}
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g,character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
  }

  function formatNumber(value) {
    return Math.max(0,Math.floor(Number(value) || 0)).toLocaleString('zh-TW');
  }

  function bag() {
    const value = read(BAG_KEY,[]);
    return Array.isArray(value) ? value : [];
  }

  function setBag(items,source='mutant-hunt') {
    save(BAG_KEY,items.slice(-MAX_BAG));
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source}}));
  }

  function state() {
    const value = read(STATE_KEY,{curses:[],stats:{encounters:0,hunts:0,wins:0,failures:0,captures:0,trophies:0}});
    value.curses = Array.isArray(value.curses) ? value.curses : [];
    value.stats = value.stats || {};
    for (const key of ['encounters','hunts','wins','failures','captures','trophies']) value.stats[key] = Math.max(0,Number(value.stats[key] || 0));
    return value;
  }

  function saveState(value) {
    value.curses = value.curses.filter(curse => Number(curse.remaining || 0) > 0).slice(-16);
    save(STATE_KEY,value);
    window.dispatchEvent(new CustomEvent('coffee-ship:mutant-state',{detail:{state:value}}));
  }

  function modifiers() {
    return window.COFFEE_SHIP_ECONOMY?.fishingModifiers?.() || {
      fishingLuck:Math.max(1,Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.fishingLuck || 1)),
      pearlBonus:Math.max(1,Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.pearlBonus || 1))
    };
  }

  function eventChance() {
    return window.COFFEE_SHIP_ECONOMY?.eventChance?.(BASE_CHANCE,'special') ?? Math.min(.7,BASE_CHANCE*modifiers().fishingLuck);
  }

  function walletBalance() {
    return window.COFFEE_SHIP_ECONOMY?.balance?.() ?? Math.max(0,Number(localStorage.getItem('coffeeShipPearls') || 0));
  }

  function spend(amount,reason) {
    const value = Math.min(walletBalance(),Math.max(0,Math.floor(Number(amount) || 0)));
    if (!value) return 0;
    if (window.COFFEE_SHIP_ECONOMY?.spend) return Number(window.COFFEE_SHIP_ECONOMY.spend(value,reason,{source:'mutant-curse'})?.spent || value);
    localStorage.setItem('coffeeShipPearls',String(walletBalance()-value));
    return value;
  }

  function rarityPick() {
    const luck = Math.min(2,modifiers().fishingLuck);
    const roll = Math.min(.9999,1-Math.pow(1-Math.random(),luck));
    let pool = CREATURES.filter(creature => creature.rarity === '稀有' || creature.rarity === '史詩');
    if (roll > .62) pool = CREATURES.filter(creature => creature.rarity === '傳說');
    if (roll > .88) pool = CREATURES.filter(creature => creature.rarity === '神話');
    if (roll > .992) pool = CREATURES.filter(creature => creature.rarity === '世界級');
    return pool[Math.floor(Math.random()*pool.length)];
  }

  function isEdibleCatch(item,currentCastId='') {
    if (!item || item.castId === currentCastId || item.unique) return false;
    if (['tool','treasure','letter','currency','trash'].includes(item.kind)) return false;
    return ['fish','mutant','shrimp','crab','squid','jelly','angler','octopus','whale','shark','eel','lobster','creature','snake'].includes(item.kind) || item.quality === '變異';
  }

  function devourFrom(items,count,currentCastId='') {
    const eaten = [];
    for (let step=0;step<count;step+=1) {
      const indexes = items.map((item,index) => isEdibleCatch(item,currentCastId) ? index : -1).filter(index => index >= 0);
      if (!indexes.length) break;
      const index = indexes[Math.floor(Math.random()*indexes.length)];
      eaten.push(items[index]);
      items.splice(index,1);
    }
    return eaten;
  }

  function priceOf(item) {
    if (Number.isFinite(Number(item?.sellPrice))) return Math.max(0,Number(item.sellPrice));
    return window.COFFEE_SHIP_ECONOMY?.sellPrice?.(item) ?? 0;
  }

  function pushEvent(title,text,icon='🧬',accent='#ff5f9e',castId=activeBattle?.castId) {
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({castId,eventKind:'mutant',title,text,icon,accent});
  }

  function addCurse(creature) {
    const huntState = state();
    let curse = huntState.curses.find(row => row.creatureId === creature.id && Number(row.remaining || 0) > 0);
    if (curse) {
      curse.remaining += Math.max(1,Math.ceil(creature.curse.casts/2));
      curse.severity = Math.max(1,Number(curse.severity || 1));
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

  function applyImmediatePenalty(creature,castId) {
    const config = creature.curse;
    let items = bag();
    const messages = [];
    if (config.initialPearlFlat) {
      const lost = spend(config.initialPearlFlat,`${creature.name}：${config.label}`);
      if (lost) messages.push(`流失 ${formatNumber(lost)} 珍珠`);
    }
    if (config.initialPearlPct) {
      const lost = spend(Math.floor(walletBalance()*config.initialPearlPct),`${creature.name}：${config.label}`);
      if (lost) messages.push(`流失 ${formatNumber(lost)} 珍珠`);
    }
    if (config.initialDevour) {
      const eaten = devourFrom(items,config.initialDevour,castId);
      if (eaten.length) {
        setBag(items,'mutant-curse');
        messages.push(`吞噬 ${eaten.length} 件漁獲`);
      }
    }
    return messages;
  }

  function applyActiveCurses(detail) {
    const huntState = state();
    if (!huntState.curses.length || !detail?.castId) return;
    let items = bag();
    let changed = false;
    const currentIndex = items.findIndex(item => item?.castId === detail.castId && item?.name === detail.item?.name);
    const messages = [];

    for (const curse of huntState.curses) {
      if (curse.remaining <= 0) continue;
      const config = curse.config || {};
      const severity = Math.max(1,Number(curse.severity || 1));
      const effects = [];

      if (currentIndex >= 0 && items[currentIndex]) {
        const current = items[currentIndex];
        if (config.weightFactor) {
          const factor = Math.max(.1,1-(1-config.weightFactor)*severity);
          current.weight = Math.max(.01,Number(current.weight || 0)*factor);
          if (detail.item) detail.item.weight = current.weight;
          effects.push(`重量降至 ${Math.round(factor*100)}%`);
          changed = true;
        }
        if (config.valueFactor) {
          const factor = Math.max(.1,1-(1-config.valueFactor)*severity);
          current.sellPrice = Math.max(0,Math.floor(priceOf(current)*factor));
          current.mutantCurse = curse.label;
          if (detail.item) {
            detail.item.sellPrice = current.sellPrice;
            detail.item.mutantCurse = curse.label;
          }
          effects.push(`價值降至 ${Math.round(factor*100)}%`);
          changed = true;
        }
      }

      if (config.pearlFlat) {
        const lost = spend(Math.ceil(config.pearlFlat*severity),`${curse.creatureName}：${curse.label}`);
        if (lost) effects.push(`流失 ${formatNumber(lost)} 珍珠`);
      }
      if (config.pearlPct) {
        const lost = spend(Math.floor(walletBalance()*config.pearlPct*severity),`${curse.creatureName}：${curse.label}`);
        if (lost) effects.push(`流失 ${formatNumber(lost)} 珍珠`);
      }
      if (config.devourChance && Math.random() < Math.min(.9,config.devourChance*severity)) {
        const eaten = devourFrom(items,Math.max(1,Number(config.devourCount || 1)),detail.castId);
        if (eaten.length) {
          effects.push(`吞噬 ${eaten.length} 件漁獲`);
          changed = true;
        }
      }

      curse.remaining -= 1;
      if (effects.length) messages.push(`${curse.icon} ${curse.label}：${effects.join('、')}`);
    }

    if (changed) setBag(items,'mutant-curse-tick');
    saveState(huntState);
    if (messages.length) {
      pushEvent('變異殘留｜負面效果發作',messages.join('\n'),'☣️','#c96a4a',detail.castId);
    }
  }

  function findToolIndex(toolId) {
    return bag().findIndex(item => item?.huntToolId === toolId);
  }

  function consumeTool(toolId) {
    const items = bag();
    const index = items.findIndex(item => item?.huntToolId === toolId);
    if (index < 0) return null;
    const [item] = items.splice(index,1);
    setBag(items,'mutant-tool-broken');
    return item;
  }

  function addBagItem(item,source) {
    const items = bag();
    items.push(item);
    setBag(items,source);
    return item;
  }

  function addCapturedCreature(creature,castId) {
    const weight = creature.min + Math.random()*(creature.max-creature.min);
    const item = {
      mutantId:creature.id,
      icon:creature.icon,
      name:creature.name,
      zone:'深淵變異狩獵',
      rarity:creature.rarity,
      quality:'變異捕獲',
      weight,
      kind:'mutant',
      trait:`${creature.trait}。經由捕獵事件成功控制。`,
      castId,
      coffeePearlBonus:modifiers().pearlBonus,
      source:'mutant-hunt',
      at:Date.now()
    };
    addBagItem(item,'mutant-capture');
    const dex = read(DEX_KEY,{});
    dex[item.name] = Math.max(Number(dex[item.name] || 0),Number(weight.toFixed(2)));
    save(DEX_KEY,dex);
    return item;
  }

  function addTrophy(creature,castId) {
    const loot = creature.loot;
    return addBagItem({
      mutantTrophyId:`${creature.id}_trophy`,
      icon:loot.icon,
      name:loot.name,
      rarity:loot.rarity,
      quality:'變異戰利品',
      kind:'treasure',
      group:'mutant-trophy',
      zone:`${creature.name}捕獵事件`,
      trait:loot.trait,
      sellPrice:loot.sellPrice,
      weight:.12,
      uniqueDropSource:creature.id,
      castId,
      source:'mutant-hunt-trophy',
      at:Date.now()
    },'mutant-trophy');
  }

  function closeCompetingEvents() {
    try { window.COFFEE_SHIP_FISHING_API?.close?.(); } catch {}
    try { if (document.body.classList.contains('sea-merchant-open')) window.COFFEE_SHIP_SEA_MERCHANT?.close?.(''); } catch {}
    try { if (document.body.classList.contains('pirate-gambling-open')) window.COFFEE_SHIP_PIRATE_GAMBLING?.close?.(''); } catch {}
    try { if (document.body.classList.contains('coral-roulette-open')) window.COFFEE_SHIP_CORAL_ROULETTE?.close?.(); } catch {}
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

  function renderBattle() {
    if (!activeBattle) return;
    const battle = activeBattle;
    const creature = battle.creature;
    const tool = TOOLS[creature.tool];
    ensurePanel().innerHTML = `<section class="mh-shell" style="--mh-accent:${COLORS[creature.rarity] || '#ff5f9e'}"><header class="mh-head"><div class="mh-title"><span class="mh-creature-icon">${creature.icon}</span><div><h3>${escapeHtml(creature.name)}</h3><p>${escapeHtml(creature.rarity)}變異生物・連點捕獵</p></div></div><button class="mh-close" type="button" disabled>捕獵中</button></header><main class="mh-body"><p class="mh-warning">☣️ ${escapeHtml(creature.curse.label)}已附著：${escapeHtml(creature.curse.description)}</p><span class="mh-tool">${tool.icon} ${escapeHtml(tool.name)}已啟動，事件結束後必定損壞</span><section class="mh-arena"><div class="mh-versus"><div class="mh-side"><b>變異生物</b><span>${creature.icon}</span></div><span class="mh-vs">VS</span><div class="mh-side"><b>捕獵者</b><span>🧑‍🚀</span></div></div><div class="mh-track"><span class="mh-center"></span><span class="mh-marker" id="mutantHuntMarker" style="left:${battle.progress}%">${tool.icon}</span></div><div class="mh-status"><span>生物抵抗：<strong>${escapeHtml(creature.rarity)}</strong></span><span>剩餘：<strong id="mutantHuntTime">${(battle.timeLeft/1000).toFixed(1)} 秒</strong></span></div><button class="mh-tap" id="mutantHuntTap" type="button">連續點擊・拉向捕獵區</button><p class="mh-combo" id="mutantHuntCombo">把標記推到最右側即可勝利</p></section></main><footer class="mh-footer"><span>失敗會延長並加重負面效果。</span><span>${tool.icon} 道具已消耗</span></footer></section>`;
  }

  function renderResult() {
    if (!activeBattle?.result) return;
    const battle = activeBattle;
    const result = battle.result;
    ensurePanel().innerHTML = `<section class="mh-shell" style="--mh-accent:${result.accent}"><header class="mh-head"><div class="mh-title"><span class="mh-creature-icon">${result.icon}</span><div><h3>${escapeHtml(result.title)}</h3><p>${escapeHtml(battle.creature.name)}捕獵結果</p></div></div><button class="mh-close" type="button">關閉</button></header><main class="mh-body"><section class="mh-result"><div class="mh-result-icon">${result.icon}</div><h4>${escapeHtml(result.title)}</h4><p>${escapeHtml(result.text)}</p><span class="mh-loot">${escapeHtml(result.reward)}</span><button type="button" class="mh-close">返回甲板</button></section></main><footer class="mh-footer"><span>${escapeHtml(battle.creature.curse.label)}仍會依剩餘回合發作。</span><span>捕獵道具已損壞</span></footer></section>`;
  }

  function updateBattleUi() {
    if (!activeBattle || activeBattle.phase !== 'battle') return;
    const marker = document.getElementById('mutantHuntMarker');
    const time = document.getElementById('mutantHuntTime');
    const combo = document.getElementById('mutantHuntCombo');
    if (marker) marker.style.left = `${Math.max(0,Math.min(100,activeBattle.progress))}%`;
    if (time) time.textContent = `${Math.max(0,activeBattle.timeLeft/1000).toFixed(1)} 秒`;
    if (combo) combo.textContent = activeBattle.combo >= 5 ? `連擊 ${activeBattle.combo}！拉力提升中` : '把標記推到最右側即可勝利';
  }

  function stopBattleTimer() {
    clearInterval(battleTimer);
    battleTimer = 0;
    battleTick = 0;
  }

  function tapBattle() {
    if (!activeBattle || activeBattle.phase !== 'battle') return;
    const now = Date.now();
    activeBattle.combo = now-activeBattle.lastTapAt <= 360 ? activeBattle.combo+1 : 1;
    activeBattle.lastTapAt = now;
    activeBattle.clicks += 1;
    const difficulty = DIFFICULTY[activeBattle.creature.rarity] || 1;
    const gain = Math.max(2.2,4.2-difficulty*.75) + Math.min(2.2,activeBattle.combo*.075);
    activeBattle.progress = Math.min(100,activeBattle.progress+gain);
    updateBattleUi();
    if (activeBattle.progress >= 100) finishVictory();
  }

  function aggravateCurse(battle) {
    const huntState = state();
    const curse = huntState.curses.find(row => row.instanceId === battle.curseInstanceId);
    const config = battle.creature.curse;
    if (curse) {
      curse.remaining += Math.max(2,Number(config.failExtra || 2));
      curse.severity = Math.max(1.5,Number(curse.severity || 1)*1.35);
    }
    let items = bag();
    const messages = [];
    if (config.failPearlFlat) {
      const lost = spend(config.failPearlFlat,`${battle.creature.name}捕獵失敗`);
      if (lost) messages.push(`額外流失 ${formatNumber(lost)} 珍珠`);
    }
    if (config.failPearlPct) {
      const lost = spend(Math.floor(walletBalance()*config.failPearlPct),`${battle.creature.name}捕獵失敗`);
      if (lost) messages.push(`額外流失 ${formatNumber(lost)} 珍珠`);
    }
    if (config.failDevour) {
      const eaten = devourFrom(items,config.failDevour,battle.castId);
      if (eaten.length) {
        setBag(items,'mutant-hunt-failure');
        messages.push(`額外吞噬 ${eaten.length} 件漁獲`);
      }
    }
    huntState.stats.failures += 1;
    saveState(huntState);
    return messages;
  }

  function finishVictory() {
    if (!activeBattle || activeBattle.phase !== 'battle') return;
    stopBattleTimer();
    const battle = activeBattle;
    const creature = battle.creature;
    const huntState = state();
    huntState.stats.wins += 1;
    const captured = Math.random() < (CAPTURE_CHANCE[creature.rarity] || .35);
    let rewardItem;
    if (captured) {
      rewardItem = addCapturedCreature(creature,battle.castId);
      huntState.stats.captures += 1;
    } else {
      rewardItem = addTrophy(creature,battle.castId);
      huntState.stats.trophies += 1;
    }
    saveState(huntState);
    const title = captured ? '成功捕獲變異生物' : '擊退並取得獨特戰利品';
    const text = captured
      ? `你在拔河中壓制了${creature.name}，捕獲個體已放入背包。`
      : `${creature.name}掙脫前留下了專屬戰利品。`;
    const reward = `${rewardItem.icon} ${rewardItem.name}［${rewardItem.rarity}］`;
    pushEvent(`變異捕獵｜${title}`,`${text}\n獲得：${reward}`,rewardItem.icon,COLORS[rewardItem.rarity] || '#ffe16b',battle.castId);
    activeBattle.phase = 'result';
    activeBattle.result = {title,text,reward,icon:rewardItem.icon,accent:COLORS[rewardItem.rarity] || '#ffe16b'};
    renderResult();
  }

  function finishFailure(reason='力量被完全壓制') {
    if (!activeBattle || activeBattle.phase !== 'battle') return;
    stopBattleTimer();
    const battle = activeBattle;
    const extra = aggravateCurse(battle);
    const text = `${reason}。${battle.creature.curse.label}的持續時間增加，強度也被放大。${extra.length ? `\n${extra.join('、')}。` : ''}`;
    pushEvent('變異捕獵｜捕獵失敗',text,'💥','#c96a4a',battle.castId);
    activeBattle.phase = 'result';
    activeBattle.result = {title:'捕獵失敗・懲罰加重',text,reward:'沒有獲得捕獲物或戰利品',icon:'💥',accent:'#c96a4a'};
    renderResult();
  }

  function startBattleLoop() {
    stopBattleTimer();
    battleTimer = setInterval(() => {
      if (!activeBattle || activeBattle.phase !== 'battle') return stopBattleTimer();
      battleTick += 1;
      activeBattle.timeLeft -= 100;
      const difficulty = DIFFICULTY[activeBattle.creature.rarity] || 1;
      let resistance = difficulty*(.72+Math.random()*.36);
      if (battleTick%10 === 0) resistance += difficulty*(1.8+Math.random()*2.2);
      activeBattle.progress = Math.max(0,activeBattle.progress-resistance);
      if (Date.now()-activeBattle.lastTapAt > 520) activeBattle.combo = 0;
      updateBattleUi();
      if (activeBattle.progress <= 0) finishFailure('變異生物把鎖具拖入深海');
      else if (activeBattle.timeLeft <= 0) finishFailure('捕獵時間耗盡');
    },100);
  }

  function openBattle(creature,curse,toolItem,castId) {
    closeCompetingEvents();
    activeBattle = {
      phase:'battle',creature,curseInstanceId:curse.instanceId,toolItem,castId,
      progress:48,timeLeft:DURATION[creature.rarity] || 14000,combo:0,clicks:0,lastTapAt:0,result:null
    };
    const huntState = state();
    huntState.stats.hunts += 1;
    saveState(huntState);
    renderBattle();
    ensurePanel().classList.remove('hidden');
    document.body.classList.add('mutant-hunt-open');
    startBattleLoop();
    [250,650,1100].forEach(delay => setTimeout(() => { if (activeBattle?.phase === 'battle') closeCompetingEvents(); },delay));
  }

  function closeBattle() {
    if (activeBattle?.phase === 'battle') return false;
    stopBattleTimer();
    ensurePanel().classList.add('hidden');
    document.body.classList.remove('mutant-hunt-open');
    activeBattle = null;
    return true;
  }

  function encounter(detail) {
    if (Math.random() > eventChance()) return;
    const creature = rarityPick();
    const curse = addCurse(creature);
    const immediate = applyImmediatePenalty(creature,detail.castId);
    const tool = TOOLS[creature.tool];
    const toolIndex = findToolIndex(creature.tool);

    if (toolIndex < 0) {
      const text = `${creature.trait}。\n專屬負面效果：${creature.curse.label}－${creature.curse.description}${immediate.length ? `\n立即影響：${immediate.join('、')}` : ''}\n缺少 ${tool.icon} ${tool.name}，無法啟動捕獵，生物已逃入深海。`;
      pushEvent(`變異生物｜${creature.name}`,text,creature.icon,COLORS[creature.rarity],detail.castId);
      window.COFFEE_SHIP_DECK?.showTip?.(`${creature.icon} 遭遇${creature.name}，缺少${tool.name}`,2200);
      return;
    }

    const toolItem = consumeTool(creature.tool);
    const text = `${creature.trait}。\n專屬負面效果：${creature.curse.label}－${creature.curse.description}${immediate.length ? `\n立即影響：${immediate.join('、')}` : ''}\n消耗 ${tool.icon} ${tool.name}，捕獵事件開始。`;
    pushEvent(`變異生物｜${creature.name}`,text,creature.icon,COLORS[creature.rarity],detail.castId);
    setTimeout(() => openBattle(creature,curse,toolItem,detail.castId),180);
  }

  function processFishingResult(event) {
    const detail = event.detail || {};
    if (!detail.item || !detail.castId) return;
    applyActiveCurses(detail);
    if (activeBattle) return;
    encounter(detail);
  }

  function bind() {
    document.addEventListener('click',event => {
      if (!event.target.closest?.(`#${PANEL_ID}`)) return;
      if (event.target.closest('#mutantHuntTap')) { event.preventDefault(); tapBattle(); return; }
      if (event.target.closest('.mh-close')) { event.preventDefault(); closeBattle(); }
    },true);
    window.addEventListener('keydown',event => {
      if (!activeBattle || activeBattle.phase !== 'battle' || event.repeat) return;
      if (event.code === 'Space' || event.key === 'Enter') {
        event.preventDefault();
        tapBattle();
      }
    });
    window.addEventListener('coffee-ship:fishing-result',processFishingResult);
    window.addEventListener('coffee-ship:scene',event => {
      if (event.detail?.scene !== 'deck' && activeBattle?.phase === 'battle') finishFailure('你離開甲板，捕獵鎖具失去支點');
      else if (event.detail?.scene !== 'deck' && activeBattle) closeBattle();
    });
  }

  function init() {
    ensurePanel();
    bind();
    window.COFFEE_SHIP_MUTANT_HUNT = {
      creatures:CREATURES,
      tools:TOOLS,
      state,
      open:id => {
        const creature = CREATURES.find(row => row.id === id) || CREATURES[0];
        const curse = addCurse(creature);
        const toolItem = {huntToolId:creature.tool,name:TOOLS[creature.tool].name,icon:TOOLS[creature.tool].icon};
        openBattle(creature,curse,toolItem,`mutant_test_${Date.now()}`);
      },
      close:closeBattle,
      version:5
    };
    window.dispatchEvent(new CustomEvent('coffee-ship:mutant-hunt-ready',{detail:{creatures:CREATURES.length,tools:Object.keys(TOOLS).length,version:5}}));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
