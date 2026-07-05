(() => {
  'use strict';
  if (window.__COFFEE_SHIP_MUTANT_CREATURES_V4__) return;
  window.__COFFEE_SHIP_MUTANT_CREATURES_V4__ = true;

  const mutants = [
    ['👁','百眼鮟鱇','傳說','身上長滿眼睛',40,180,3],['🦈','雙頭巨齒鯊','神話','有機率吃掉更多漁獲',3000,16000,9],['🐙','深淵裂口章魚','神話','八條嘴巴',600,4800,5],['🐟','發光骷髏魚','史詩','全身骨骼會發光',2,18,1],['🦀','水晶帝王蟹','傳說','高珍珠價值',8,55,1],['🐡','毒刺河豚王','史詩','背包短暫中毒特效',4,28,1],['🦐','深海鐮刀蝦','稀有','巨大鐮刀前肢',0.6,4.8,0],['🦑','黑洞烏賊','神話','周圍會變暗',120,900,4],['🐋','腐化藍鯨','神話','超過 100 噸',100000,220000,6],['🦈','深淵吞噬者','神話','最高級掠食者',2000,13000,12],['🐍','海淵蛇皇','傳說','超長蛇形生物',300,2200,2],['🦞','熔岩龍蝦','傳說','身體像岩漿',6,38,1],['🐠','星核蝶魚','傳說','星光粒子特效',1.5,9.5,0],['🐙','血月水母王','神話','紅色發光',80,680,3],['🐚','詛咒寄居蟹','史詩','殼像人臉',2,18,1],['🐟','深海夢魘鰻','傳說','會發出低鳴',25,190,2],['🦀','千足海蜘蛛','神話','巨型海蜘蛛',90,720,4],['🐋','虛空鯨','神話','半透明身體',900,9000,5],['🐉','利維坦幼體','神話','極低機率出現',5000,30000,8],['👑','克蘇魯之眼','世界級','重量無上限',999999,9999999,15]
  ];

  const colors = {稀有:'#79d0b1',史詩:'#e9a6b0',傳說:'#ffe16b',神話:'#ffffff',世界級:'#ff5f9e'};

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  }

  function modifiers() {
    return window.COFFEE_SHIP_ECONOMY?.fishingModifiers?.() || {
      fishingLuck:Math.max(1, Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.fishingLuck || 1)),
      pearlBonus:Math.max(1, Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.pearlBonus || 1))
    };
  }

  function chance() {
    return window.COFFEE_SHIP_ECONOMY?.eventChance?.(.05,'special')
      ?? Math.min(.7, .05 * modifiers().fishingLuck);
  }

  function pick() {
    const luck = Math.min(2, modifiers().fishingLuck);
    const roll = Math.min(.9999, 1 - Math.pow(1 - Math.random(), luck));
    let pool = mutants.filter(item => item[2] === '稀有' || item[2] === '史詩');
    if (roll > .62) pool = mutants.filter(item => item[2] === '傳說');
    if (roll > .88) pool = mutants.filter(item => item[2] === '神話');
    if (roll > .992) pool = mutants.filter(item => item[2] === '世界級');
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function eatBag(count) {
    if (!count) return [];
    const bag = read('coffeeShipFishBag', []);
    const edible = bag.filter(item => item && item.kind !== 'trash' && item.kind !== 'letter' && item.kind !== 'currency');
    const keep = bag.filter(item => !item || item.kind === 'trash' || item.kind === 'letter' || item.kind === 'currency');
    const eaten = [];
    for (let index = 0; index < count && edible.length; index += 1) {
      const selected = Math.floor(Math.random() * edible.length);
      eaten.push(edible.splice(selected, 1)[0]);
    }
    save('coffeeShipFishBag', keep.concat(edible).slice(-240));
    return eaten;
  }

  function trigger(event) {
    if (Math.random() > chance()) return;
    const mutant = pick();
    const weight = mutant[4] + Math.random() * (mutant[5] - mutant[4]);
    const eaten = eatBag(mutant[6]);
    const item = {
      name:mutant[1],zone:'深淵變異',rarity:mutant[2],quality:'變異',weight,
      kind:'mutant',icon:mutant[0],trait:mutant[3],at:Date.now(),castId:event.detail?.castId,
      coffeePearlBonus:modifiers().pearlBonus,
      coffeeEffectName:window.COFFEE_SHIP_COFFEE_EFFECT?.name || ''
    };
    const bag = read('coffeeShipFishBag', []);
    bag.push(item);
    save('coffeeShipFishBag', bag.slice(-240));
    const dex = read('coffeeShipMutantDex', {});
    dex[item.name] = Math.max(Number(dex[item.name] || 0), Number(weight.toFixed(2)));
    save('coffeeShipMutantDex', dex);
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'mutant',item,eaten}}));
    const loss = eaten.length ? `吞噬了 ${eaten.length} 件漁獲。` : '沒有漁獲被吞噬。';
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({
      castId:event.detail?.castId,
      eventKind:'mutant',
      title:`變異生物｜${item.name}`,
      icon:item.icon,
      accent:colors[item.rarity] || '#ff5f9e',
      text:`稀有度：${item.rarity}。重量：${item.rarity === '世界級' ? '∞' : weight.toFixed(2) + ' kg'}。特性：${item.trait}。${loss}${item.coffeeEffectName ? ` 咖啡加成：${item.coffeeEffectName}` : ''}`
    });
  }

  function init() {
    window.addEventListener('coffee-ship:fishing-result', trigger);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();