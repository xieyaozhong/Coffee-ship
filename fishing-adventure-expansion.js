(() => {
  'use strict';
  if (window.__COFFEE_SHIP_FISHING_ADVENTURE_EXPANSION_V1__) return;
  window.__COFFEE_SHIP_FISHING_ADVENTURE_EXPANSION_V1__ = true;

  const EXTRA_EVENTS = [
    // 追加負面事件 12 種
    {id:'acid_rain',tone:'negative',weight:5,icon:'🌧️',title:'酸性海雨',effect:'damage',mult:.52,text:'帶有刺鼻氣味的雨水落下，本次漁獲遭到腐蝕。'},
    {id:'magnetic_storm',tone:'negative',weight:5,icon:'🧲',title:'磁暴干擾',effect:'status',status:{id:'magnetic_confusion',label:'磁暴亂流',type:'event',mult:.5,casts:3},text:'羅盤與釣魚探測器全部失靈，接下來三竿事件機率下降。'},
    {id:'rope_rot',tone:'negative',weight:6,icon:'🪢',title:'繩索腐朽',effect:'status',status:{id:'rotten_rope',label:'腐朽繩索',type:'weight',mult:.63,casts:2},text:'主釣線出現腐朽裂痕，接下來兩竿難以拉起大型漁獲。'},
    {id:'sea_lice',tone:'negative',weight:5,icon:'🦠',title:'海蝨附著',effect:'status',status:{id:'sea_lice',label:'海蝨污染',type:'value',mult:.66,casts:3},text:'大量海蝨附著在漁獲與漁具上，接下來三竿售價降低。'},
    {id:'iced_deck',tone:'negative',weight:5,icon:'🧊',title:'甲板結冰',effect:'status',status:{id:'slippery_deck',label:'濕滑甲板',type:'quality',mult:-1,casts:3},text:'甲板突然結冰，接下來三竿更難完整保存漁獲。'},
    {id:'lantern_out',tone:'negative',weight:6,icon:'🏮',title:'船燈全部熄滅',effect:'status',status:{id:'dark_deck',label:'黑暗甲板',type:'misfortune',mult:1.5,casts:3},text:'船燈無預警熄滅，黑暗使接下來三竿更危險。'},
    {id:'phantom_accountant',tone:'negative',weight:4,icon:'📒',title:'亡靈會計師',effect:'pearlLoss',min:15,max:55,text:'亡靈會計師翻出百年前的帳冊，要求你補繳不存在的船稅。'},
    {id:'cursed_map',tone:'negative',weight:4,icon:'🗺️',title:'錯誤海圖',effect:'mixed',actions:[{effect:'status',status:{id:'map_weight',label:'偏離魚群',type:'weight',mult:.7,casts:3}},{effect:'status',status:{id:'map_misfortune',label:'詛咒航線',type:'misfortune',mult:1.4,casts:3}}],text:'海圖把船引向錯誤海域，接下來三竿重量下降且厄運增加。'},
    {id:'echo_panic',tone:'negative',weight:5,icon:'📢',title:'船艙回音失控',effect:'status',status:{id:'echo_panic',label:'回音恐慌',type:'quality',mult:-1,casts:2},text:'船艙不斷重複陌生人的喊聲，使你無法專心處理漁獲。'},
    {id:'salt_flies',tone:'negative',weight:5,icon:'🪰',title:'鹽霧飛蟲',effect:'removeLow',text:'成群飛蟲鑽進背包，毀掉一件沒有保護的低價物品。'},
    {id:'spoiled_coffee',tone:'negative',weight:5,icon:'☕',title:'咖啡補給變質',effect:'status',status:{id:'bitter_hands',label:'苦澀疲勞',type:'value',mult:.74,casts:2},text:'變質咖啡讓船員精神不濟，接下來兩竿售價降低。'},
    {id:'ghost_anchor_chain',tone:'negative',weight:4,icon:'⛓️',title:'幽靈錨鏈纏船',effect:'mixed',actions:[{effect:'status',status:{id:'chain_drag',label:'錨鏈拖曳',type:'weight',mult:.58,casts:2}},{effect:'pearlLoss',min:8,max:30}],text:'看不見的錨鏈纏住船底，你必須花珍珠修理，接下來兩竿重量也下降。'},

    // 追加正面事件 8 種
    {id:'storm_relic',tone:'positive',weight:5,icon:'⚡',title:'雷暴遺物',effect:'loot',pool:'storm',text:'雷電擊中遠方海面，一件凝結的風暴遺物漂到船邊。'},
    {id:'sea_garden',tone:'positive',weight:5,icon:'🌺',title:'漂浮海上花園',effect:'mixed',actions:[{effect:'loot',pool:'festival'},{effect:'status',status:{id:'garden_value',label:'花園香氣',type:'value',mult:1.3,casts:3}}],text:'漂浮花園送來一件收藏物，香氣也提高接下來三竿的價值。'},
    {id:'repair_dolphins',tone:'positive',weight:5,icon:'🐬',title:'海豚修理隊',effect:'mixed',actions:[{effect:'upgradeQuality'},{effect:'status',status:{id:'dolphin_line',label:'海豚修整',type:'weight',mult:1.32,casts:3}}],text:'海豚把纏住的釣線理順，本次品質與接下來三竿重量提升。'},
    {id:'lucky_cat_buoy',tone:'positive',weight:4,icon:'🐈',title:'招財貓浮標',effect:'pearlGain',min:35,max:100,text:'一座招財貓浮標搖了搖前腳，吐出一批珍珠。'},
    {id:'captain_tip',tone:'positive',weight:6,icon:'🧑‍✈️',title:'老船長的小費',effect:'pearlGain',min:22,max:72,text:'老船長欣賞你的漁獲，從私人錢袋拿出珍珠作為小費。'},
    {id:'coral_lottery',tone:'positive',weight:4,icon:'🪸',title:'珊瑚抽獎券',effect:'mixed',actions:[{effect:'pearlGain',min:18,max:58},{effect:'loot',pool:'festival'}],text:'珊瑚礁上的抽獎箱開出珍珠與一件節慶收藏物。'},
    {id:'sunrise_current',tone:'positive',weight:6,icon:'🌅',title:'日出暖流',effect:'mixed',actions:[{effect:'status',status:{id:'sunrise_weight',label:'日出暖流',type:'weight',mult:1.4,casts:3}},{effect:'status',status:{id:'sunrise_event',label:'晨光好運',type:'event',mult:1.3,casts:3}}],text:'第一道陽光照亮魚群，接下來三竿重量與事件機率提升。'},
    {id:'dropped_pirate_purse',tone:'positive',weight:4,icon:'👛',title:'海盜遺落的錢袋',effect:'pearlGain',min:60,max:145,text:'海盜船高速轉向時掉下一只錢袋，裡面裝著不少珍珠。'},

    // 追加奇異事件 6 種
    {id:'upside_down_ship',tone:'strange',weight:4,icon:'🙃',title:'倒著航行的船',effect:'loot',pool:'deep',text:'一艘船底朝天地從旁經過，丟下一件深海收藏物。'},
    {id:'floating_piano',tone:'strange',weight:4,icon:'🎹',title:'自己演奏的鋼琴',effect:'status',status:{id:'piano_resonance',label:'鋼琴共鳴',type:'quality',mult:1,casts:2},text:'海面上的鋼琴自行演奏，旋律讓接下來兩竿品質提高。'},
    {id:'fish_with_key',tone:'strange',weight:5,icon:'🔑',title:'魚嘴裡的古老鑰匙',effect:'loot',pool:'deep',text:'本次漁獲吐出一把不知道能打開什麼的古老鑰匙。'},
    {id:'bottled_thunder',tone:'strange',weight:4,icon:'🌩️',title:'瓶裝雷聲',effect:'loot',pool:'storm',text:'玻璃瓶裡不斷傳來雷聲，瓶身卻完全沒有破裂。'},
    {id:'shadow_fishing',tone:'strange',weight:4,icon:'👤',title:'影子先釣到魚',effect:'duplicate',text:'你的影子比你早一步收線，帶回第二份相同漁獲。'},
    {id:'second_moon',tone:'strange',weight:3,icon:'🌕',title:'海面出現第二個月亮',effect:'mixed',actions:[{effect:'loot',pool:'moon'},{effect:'status',status:{id:'double_moon',label:'雙月潮汐',type:'value',mult:1.5,casts:2}}],text:'第二個月亮在海面升起，留下月潮遺物並提高接下來兩竿售價。'},

    // 追加風險事件 6 種
    {id:'thunder_jar_wager',tone:'risk',weight:5,icon:'🌩️',title:'打開雷聲罐',effect:'gamble',winMin:55,winMax:150,lossMin:18,lossMax:58,text:'打開雷聲罐可能讓雷光凝成珍珠，也可能燒壞一部分物資。'},
    {id:'ghost_captain_bargain',tone:'risk',weight:5,icon:'👻',title:'幽靈船長的契約',effect:'riskChest',text:'幽靈船長提出一份模糊契約，可能送出寶藏，也可能留下詛咒。'},
    {id:'coral_roulette',tone:'risk',weight:5,icon:'🎡',title:'珊瑚輪盤',effect:'gamble',winMin:38,winMax:125,lossMin:12,lossMax:46,text:'珊瑚輪盤在海底轉動，停下時決定珍珠的得失。'},
    {id:'lighthouse_toll',tone:'risk',weight:5,icon:'🏮',title:'幽光燈塔通行費',effect:'riskToll',text:'燈塔要求支付珍珠，通過後可以獲得短暫的高價潮汐。'},
    {id:'kraken_coin',tone:'risk',weight:4,icon:'🐙',title:'海怪硬幣',effect:'riskPearl',text:'海怪吐出一枚黑色硬幣，它可能帶來財富，也可能吞掉錢包中的珍珠。'},
    {id:'cursed_compass_wager',tone:'risk',weight:4,icon:'🧭',title:'詛咒羅盤賭局',effect:'riskLeviathan',text:'羅盤在祝福與災厄之間旋轉，停止時決定下一段航程。'}
  ];

  const EXTRA_LOOT = {
    festival:[
      ['🎐','海風玻璃風鈴','稀有',68,'只在船向正確方向航行時響起。'],
      ['🌺','漂流花冠','史詩',98,'花瓣離開海水後依然鮮豔。'],
      ['🎏','潮汐祈願旗','稀有',72,'旗面寫著不同船員留下的願望。']
    ],
    deep:[
      ['🔑','深海黃銅鑰匙','史詩',108,'鑰匙齒紋像一排縮小的海浪。'],
      ['🫧','不破深海氣泡','傳說',172,'被玻璃環固定後永遠不會消失。'],
      ['🧱','倒置船隻壓艙磚','稀有',66,'不論怎麼放都會自己翻到背面。']
    ]
  };

  function install() {
    const api = window.COFFEE_SHIP_FISHING_ADVENTURES;
    if (!api?.events || !api?.loot) return false;

    const existing = new Set(api.events.map(event => event.id));
    EXTRA_EVENTS.forEach(event => {
      if (!existing.has(event.id)) api.events.push(event);
    });
    Object.entries(EXTRA_LOOT).forEach(([name,rows]) => {
      api.loot[name] = Array.isArray(api.loot[name]) ? [...api.loot[name],...rows] : rows.slice();
    });

    api.expansionVersion = 1;
    api.totalEvents = api.events.length;
    window.dispatchEvent(new CustomEvent('coffee-ship:fishing-adventure-expanded',{
      detail:{added:EXTRA_EVENTS.length,total:api.events.length,negative:api.events.filter(event => event.tone === 'negative').length,version:1}
    }));
    return true;
  }

  if (!install()) {
    window.addEventListener('coffee-ship:fishing-adventures-ready',install,{once:true});
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (install() || attempts > 20) clearInterval(timer);
    },250);
  }
})();