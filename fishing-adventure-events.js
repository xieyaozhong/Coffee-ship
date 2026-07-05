(() => {
  'use strict';
  if (window.__COFFEE_SHIP_FISHING_ADVENTURES_V1__) return;
  window.__COFFEE_SHIP_FISHING_ADVENTURES_V1__ = true;

  const BAG_KEY = 'coffeeShipFishBag';
  const HISTORY_KEY = 'coffeeShipRecentCatches';
  const STATE_KEY = 'coffeeShipFishingAdventureState';
  const LOG_KEY = 'coffeeShipFishingAdventureLog';
  const MAX_BAG = 240;
  const MAX_LOG = 120;
  const RARITIES = ['普通','常見','稀有','史詩','傳說','神話','世界級'];
  const QUALITIES = ['普通','優秀','完美','閃亮','神話'];

  const LOOT = {
    merchant:[
      ['🪙','潮汐商會代幣','稀有',38,'漂流商人的交易憑證。'],
      ['🧵','防水銀線','常見',22,'能修補被海水泡壞的漁具。'],
      ['🔔','迷你港口鈴','稀有',42,'只在安全水域發出聲音。']
    ],
    ghost:[
      ['🕯️','幽靈船不滅燭','史詩',88,'沒有火焰，卻能照出水手留下的腳印。'],
      ['🪪','失蹤船員名牌','稀有',48,'背面刻著一艘已不存在的船名。'],
      ['🧿','避霧藍眼護符','史詩',92,'在濃霧中會微微發熱。']
    ],
    storm:[
      ['⚡','凝固雷光碎片','史詩',96,'雷電擊中海面後留下的玻璃結晶。'],
      ['🌪️','風暴瓶塞','稀有',52,'靠近耳邊能聽見遠方雷聲。'],
      ['🧲','雷擊磁針','史詩',84,'總是指向最近一次落雷的位置。']
    ],
    moon:[
      ['🌙','月潮銀幣','史詩',105,'只在月光下顯現幣面。'],
      ['🔭','星圖鏡片','傳說',155,'能看見普通望遠鏡找不到的星。'],
      ['🫙','夜色收藏罐','稀有',58,'罐內像裝著一小片無月夜。']
    ],
    odd:[
      ['🚪','漂浮小門把','史詩',82,'門已經不見，門把仍會在海上漂浮。'],
      ['🎫','海底列車月台票','傳說',145,'票面寫著下一班車將在潮汐最低時抵達。'],
      ['⏳','倒流砂漏','傳說',168,'砂粒偶爾會從下方落回上方。'],
      ['📮','無地址海上郵戳','稀有',64,'蓋出的日期永遠是明天。']
    ]
  };

  const EVENTS = [
    // 負面事件：損失、污染、逃脫與持續減益。
    {id:'squall',tone:'negative',weight:8,icon:'🌧️',title:'突發暴雨',effect:'status',status:{id:'wet_line',label:'濕滑釣線',type:'weight',mult:.72,casts:2},text:'暴雨打濕了釣線，接下來兩竿的漁獲重量降低。'},
    {id:'broken_hook',tone:'negative',weight:6,icon:'🪝',title:'魚鉤斷裂',effect:'escape',text:'魚鉤在拉起漁獲前斷裂，這一竿的漁獲逃走了。'},
    {id:'pirate_toll',tone:'negative',weight:7,icon:'🏴‍☠️',title:'海盜過路費',effect:'pearlLoss',min:8,max:32,text:'一艘小型海盜艇靠近，強行收走少量珍珠。'},
    {id:'hungry_gull',tone:'negative',weight:7,icon:'🐦',title:'飢餓海鳥',effect:'removeLow',text:'海鳥趁你整理釣具時叼走一件低價普通物品。'},
    {id:'rust_tide',tone:'negative',weight:7,icon:'🟤',title:'鏽色潮水',effect:'damage',mult:.68,text:'鏽色海水污染了本次漁獲，使其價值下降。'},
    {id:'jelly_sting',tone:'negative',weight:6,icon:'🪼',title:'水母群干擾',effect:'status',status:{id:'numb_hands',label:'手指麻痺',type:'value',mult:.72,casts:2},text:'水母觸手纏住釣線，接下來兩竿的售價降低。'},
    {id:'black_fog',tone:'negative',weight:7,icon:'🌫️',title:'黑霧籠罩',effect:'status',status:{id:'misfortune',label:'黑霧厄運',type:'misfortune',mult:1.6,casts:3},text:'黑霧讓方向感消失，接下來三竿更容易觸發負面事件。'},
    {id:'cursed_coin',tone:'negative',weight:5,icon:'🪙',title:'被詛咒的硬幣',effect:'mixed',actions:[{effect:'pearlGain',min:12,max:24},{effect:'status',status:{id:'cursed_value',label:'灰色詛咒',type:'value',mult:.62,casts:2}}],text:'你撿到一些珍珠，但硬幣上的詛咒會壓低接下來兩竿的價值。'},
    {id:'rotten_bait',tone:'negative',weight:7,icon:'🪱',title:'腐壞魚餌',effect:'downgrade',text:'魚餌已經腐壞，本次漁獲的品質下降一級。'},
    {id:'tangled_line',tone:'negative',weight:8,icon:'🧶',title:'釣線打結',effect:'status',status:{id:'tangled',label:'打結釣線',type:'weight',mult:.8,casts:3},text:'釣線纏成一團，接下來三竿的重量稍微降低。'},
    {id:'false_lighthouse',tone:'negative',weight:5,icon:'🔦',title:'虛假燈塔',effect:'status',status:{id:'lost_route',label:'錯誤航向',type:'event',mult:.62,casts:3},text:'遠方燈火把船帶離魚群，接下來三竿較難觸發冒險事件。'},
    {id:'sea_sickness',tone:'negative',weight:7,icon:'🤢',title:'嚴重暈船',effect:'status',status:{id:'seasick',label:'暈船',type:'quality',mult:-1,casts:2},text:'甲板劇烈搖晃，接下來兩竿的品質容易下降。'},
    {id:'reef_scrape',tone:'negative',weight:6,icon:'🪨',title:'擦過暗礁',effect:'pearlLoss',min:10,max:38,text:'船身擦過暗礁，你支付珍珠修補受損的釣魚設備。'},
    {id:'tax_crab',tone:'negative',weight:5,icon:'🦀',title:'螃蟹稅務員',effect:'pearlLoss',min:4,max:18,text:'戴著小帽子的螃蟹拿出帳本，徵收了一筆莫名其妙的海床稅。'},
    {id:'mimic_chest',tone:'negative',weight:4,icon:'🧰',title:'寶箱其實會咬人',effect:'damage',mult:.5,text:'你拉起一只假寶箱，它夾住漁獲後又跳回海裡，價值大幅降低。'},
    {id:'cold_current',tone:'negative',weight:7,icon:'🧊',title:'極寒洋流',effect:'status',status:{id:'cold_current',label:'低溫洋流',type:'weight',mult:.66,casts:2},text:'冰冷洋流讓魚群活動遲緩，接下來兩竿的重量降低。'},
    {id:'oil_slick',tone:'negative',weight:6,icon:'🛢️',title:'海面油污',effect:'damage',mult:.58,text:'漁獲沾上難以清理的油污，出售價值大幅下降。'},
    {id:'shark_shadow',tone:'negative',weight:5,icon:'🦈',title:'鯊魚陰影',effect:'status',status:{id:'shark_fear',label:'鯊影威脅',type:'escape',mult:.2,casts:3},text:'巨大鯊影在船底徘徊，接下來三竿有機率被搶走。'},
    {id:'siren_distraction',tone:'negative',weight:5,icon:'🎶',title:'海妖假歌聲',effect:'status',status:{id:'siren_daze',label:'海妖迷惑',type:'quality',mult:-1,casts:3},text:'遠方歌聲讓你無法集中，接下來三竿品質容易下降。'},
    {id:'mutiny_rumor',tone:'negative',weight:5,icon:'🗯️',title:'甲板上的叛變傳言',effect:'status',status:{id:'crew_panic',label:'船員恐慌',type:'misfortune',mult:1.45,casts:4},text:'船員開始互相猜疑，接下來四竿負面事件增加。'},
    {id:'haunted_bell',tone:'negative',weight:4,icon:'🔔',title:'無人敲響的船鐘',effect:'mixed',actions:[{effect:'status',status:{id:'haunted_weight',label:'幽靈拖曳',type:'weight',mult:.74,casts:3}},{effect:'status',status:{id:'haunted_event',label:'亡者注視',type:'misfortune',mult:1.35,casts:3}}],text:'船鐘自行敲響，接下來三竿同時受到重量與運勢懲罰。'},
    {id:'anchor_drag',tone:'negative',weight:6,icon:'⚓',title:'船錨拖底',effect:'status',status:{id:'muddy_water',label:'混濁海水',type:'value',mult:.78,casts:3},text:'船錨攪起大量泥沙，接下來三竿的漁獲價值降低。'},
    {id:'spoiled_supplies',tone:'negative',weight:5,icon:'🥫',title:'補給箱腐敗',effect:'removeLow',text:'腐敗氣味引來老鼠，一件低價物品遭到破壞。'},
    {id:'salt_storm',tone:'negative',weight:6,icon:'🧂',title:'鹽晶風暴',effect:'damage',mult:.7,text:'尖銳鹽晶刮傷漁獲，本次品質與售價受損。'},
    {id:'rogue_wave',tone:'negative',weight:5,icon:'🌊',title:'瘋狗浪',effect:'removeLow',text:'巨浪掃過甲板，捲走背包中一件可替代的普通物品。'},
    {id:'dead_calm',tone:'negative',weight:6,icon:'🫥',title:'死寂無風帶',effect:'status',status:{id:'dead_calm',label:'死寂海域',type:'event',mult:.45,casts:3},text:'海面完全靜止，接下來三竿特殊事件機率降低。'},
    {id:'leaking_pouch',tone:'negative',weight:7,icon:'👝',title:'珍珠袋破洞',effect:'pearlLoss',min:5,max:26,text:'珍珠袋在甲板上磨破，少量珍珠滾進海裡。'},
    {id:'abyss_gaze',tone:'negative',weight:4,icon:'👁️',title:'深淵凝視',effect:'mixed',actions:[{effect:'status',status:{id:'abyss_value',label:'深淵寒意',type:'value',mult:.64,casts:2}},{effect:'status',status:{id:'abyss_fear',label:'深淵恐懼',type:'misfortune',mult:1.55,casts:2}}],text:'海面下睜開巨大眼睛，接下來兩竿同時降低價值並增加厄運。'},
    {id:'customs_patrol',tone:'negative',weight:5,icon:'🛂',title:'幽靈海關巡查',effect:'pearlLoss',min:12,max:45,text:'幽靈官員認定漁獲文件不齊，強制收取通關費。'},
    {id:'rat_swarm',tone:'negative',weight:6,icon:'🐀',title:'船艙鼠群',effect:'removeLow',text:'鼠群衝出船艙，咬壞一件低價物品後消失。'},
    {id:'cracked_compass',tone:'negative',weight:6,icon:'🧭',title:'羅盤破裂',effect:'status',status:{id:'wrong_spot',label:'錯誤釣點',type:'weight',mult:.76,casts:4},text:'羅盤指向錯誤海域，接下來四竿的重量下降。'},
    {id:'phantom_net',tone:'negative',weight:5,icon:'🕸️',title:'幽靈漁網',effect:'damage',mult:.48,text:'看不見的漁網纏住本次漁獲，重量與售價幾乎減半。'},
    {id:'red_moon',tone:'negative',weight:4,icon:'🌕',title:'赤紅月潮',effect:'status',status:{id:'red_moon',label:'赤月厄運',type:'misfortune',mult:1.8,casts:3},text:'月亮變成暗紅色，接下來三竿更容易遭遇危險。'},
    {id:'barnacle_plague',tone:'negative',weight:5,icon:'🦪',title:'藤壺爆發',effect:'status',status:{id:'barnacle_drag',label:'藤壺阻力',type:'weight',mult:.7,casts:3},text:'大量藤壺附著在釣具上，接下來三竿拉力下降。'},
    {id:'thief_octopus',tone:'negative',weight:4,icon:'🐙',title:'小偷章魚',effect:'removeLow',text:'一隻熟練的章魚伸手進背包，偷走一件低價物品。'},

    // 正面事件：珍珠、收藏、升級與持續增益。
    {id:'pearl_rain',tone:'positive',weight:7,icon:'🦪',title:'珍珠雨',effect:'pearlGain',min:18,max:65,text:'浪花裡落下閃亮珍珠，全部存入共用錢包。'},
    {id:'friendly_dolphin',tone:'positive',weight:6,icon:'🐬',title:'海豚幫忙拉線',effect:'duplicate',text:'海豚把另一尾相似漁獲推到船邊，你獲得額外一份漁獲。'},
    {id:'golden_current',tone:'positive',weight:7,icon:'🌟',title:'黃金洋流',effect:'status',status:{id:'gold_current',label:'黃金洋流',type:'weight',mult:1.55,casts:3},text:'金色洋流聚集大型魚群，接下來三竿重量提高。'},
    {id:'merchant_buoy',tone:'positive',weight:6,icon:'🛟',title:'漂流商人浮標',effect:'loot',pool:'merchant',text:'浮標的暗格裡藏著一件商會物品。'},
    {id:'moon_market',tone:'positive',weight:5,icon:'🌙',title:'月下海市',effect:'status',status:{id:'moon_market',label:'月下高價',type:'value',mult:1.65,casts:3},text:'月光中的神秘市場願意高價收購，接下來三竿售價提升。'},
    {id:'lucky_hook',tone:'positive',weight:7,icon:'🪝',title:'幸運魚鉤',effect:'status',status:{id:'lucky_hook',label:'幸運魚鉤',type:'quality',mult:1,casts:3},text:'撿到一枚幸運魚鉤，接下來三竿品質提升。'},
    {id:'ghost_advice',tone:'positive',weight:5,icon:'👻',title:'老漁夫幽靈的指點',effect:'status',status:{id:'ghost_luck',label:'老漁夫指點',type:'event',mult:1.7,casts:3},text:'老漁夫幽靈指出魚群位置，接下來三竿冒險事件機率提升。'},
    {id:'turtle_guard',tone:'positive',weight:5,icon:'🐢',title:'海龜護航',effect:'status',status:{id:'turtle_guard',label:'海龜守護',type:'protect',mult:1,casts:4},text:'海龜群跟在船側，接下來四竿可抵擋漁獲逃脫與物品損失。'},
    {id:'coffee_crate',tone:'positive',weight:5,icon:'☕',title:'密封咖啡補給箱',effect:'loot',pool:'merchant',text:'你撈到一只乾燥的補給箱，裡面留有可販售物資。'},
    {id:'meteor_fish',tone:'positive',weight:4,icon:'☄️',title:'流星照亮漁獲',effect:'upgrade',text:'流星掠過海面，本次漁獲的稀有度與品質提升。'},
    {id:'singing_whale',tone:'positive',weight:5,icon:'🐋',title:'鯨歌共鳴',effect:'status',status:{id:'whale_song',label:'鯨歌共鳴',type:'value',mult:1.45,casts:4},text:'低沉鯨歌讓漁獲產生共鳴，接下來四竿售價提高。'},
    {id:'rainbow_wake',tone:'positive',weight:4,icon:'🌈',title:'彩虹船跡',effect:'duplicate',text:'彩虹色浪花帶來第二份漁獲。'},
    {id:'rescue_reward',tone:'positive',weight:6,icon:'🛟',title:'海上救援謝禮',effect:'pearlGain',min:25,max:80,text:'你協助扶正一艘小艇，獲得船員送出的珍珠謝禮。'},
    {id:'ocean_postman',tone:'positive',weight:5,icon:'📮',title:'海上郵差',effect:'loot',pool:'odd',text:'信天翁郵差送來一件沒有收件人的奇怪包裹。'},
    {id:'salvage_insurance',tone:'positive',weight:5,icon:'🛡️',title:'打撈保險券',effect:'status',status:{id:'insurance',label:'打撈保險',type:'protect',mult:1,casts:5},text:'保險券可保護接下來五竿，不會被偷走低價物品。'},
    {id:'calm_tide',tone:'positive',weight:7,icon:'🌤️',title:'平穩潮汐',effect:'mixed',actions:[{effect:'status',status:{id:'calm_weight',label:'平穩拉線',type:'weight',mult:1.28,casts:3}},{effect:'status',status:{id:'calm_quality',label:'穩定手感',type:'quality',mult:1,casts:2}}],text:'海面變得平穩，接下來幾竿重量與品質同時改善。'},
    {id:'constellation_map',tone:'positive',weight:4,icon:'🔭',title:'星座航線圖',effect:'loot',pool:'moon',text:'一張發光星圖從海中浮起，記錄著夜間魚群路線。'},
    {id:'abundance_net',tone:'positive',weight:4,icon:'🕸️',title:'豐收之網',effect:'status',status:{id:'abundance',label:'豐收之網',type:'duplicate',mult:.38,casts:4},text:'接下來四竿有機率額外獲得一份相同漁獲。'},
    {id:'pearl_oyster',tone:'positive',weight:6,icon:'🦪',title:'巨大珍珠牡蠣',effect:'mixed',actions:[{effect:'pearlGain',min:20,max:55},{effect:'loot',pool:'moon'}],text:'牡蠣中藏著珍珠與一件月潮收藏物。'},
    {id:'forgotten_pantry',tone:'positive',weight:5,icon:'🥫',title:'漂流食品櫃',effect:'loot',pool:'merchant',text:'你撈起一只密封食品櫃，裡面的金屬用品仍能販售。'},
    {id:'deck_festival',tone:'positive',weight:4,icon:'🎉',title:'甲板臨時慶典',effect:'mixed',actions:[{effect:'pearlGain',min:14,max:40},{effect:'status',status:{id:'festival_value',label:'慶典行情',type:'value',mult:1.3,casts:3}}],text:'船員舉辦短暫慶典，你獲得珍珠並提高接下來三竿的售價。'},
    {id:'wandering_chef',tone:'positive',weight:5,icon:'🧑‍🍳',title:'漂流廚師',effect:'upgradeQuality',text:'漂流廚師教你更好的保存方式，本次漁獲品質提升。'},
    {id:'lighthouse_blessing',tone:'positive',weight:5,icon:'🏮',title:'古老燈塔祝福',effect:'mixed',actions:[{effect:'status',status:{id:'light_luck',label:'燈塔指引',type:'event',mult:1.45,casts:4}},{effect:'status',status:{id:'light_protect',label:'燈塔守護',type:'protect',mult:1,casts:2}}],text:'古老燈塔亮起，接下來數竿更容易遇到事件並獲得保護。'},
    {id:'albatross_courier',tone:'positive',weight:5,icon:'🕊️',title:'信天翁快遞',effect:'loot',pool:'odd',text:'信天翁把一件遠方貨物丟在甲板上。'},
    {id:'mermaid_scale',tone:'positive',weight:3,icon:'🧜‍♀️',title:'海面上的發光鱗片',effect:'loot',pool:'moon',text:'浪花中漂來一件帶有美人魚氣息的收藏物。'},
    {id:'repair_buoy',tone:'positive',weight:5,icon:'🔧',title:'海上修理浮標',effect:'mixed',actions:[{effect:'upgradeQuality'},{effect:'status',status:{id:'repaired_line',label:'全新釣線',type:'weight',mult:1.25,casts:3}}],text:'自動修理浮標整理了釣具，本次品質與之後重量都獲得改善。'},
    {id:'sunken_safe',tone:'positive',weight:3,icon:'🧰',title:'沉沒的小型保險箱',effect:'pearlGain',min:55,max:130,text:'保險箱鏽蝕嚴重，但裡面仍保存著一批珍珠。'},

    // 奇異事件：收藏、世界觀與少量實際影響。
    {id:'tagged_fish',tone:'strange',weight:7,icon:'🏷️',title:'來自未來的標記',effect:'mixed',actions:[{effect:'upgradeQuality'},{effect:'pearlGain',min:5,max:20}],text:'漁獲身上掛著尚未發行的研究標籤，研究單位支付了小額獎勵。'},
    {id:'reverse_rain',tone:'strange',weight:6,icon:'☔',title:'雨滴向天空落去',effect:'status',status:{id:'reverse_tide',label:'逆流潮汐',type:'weight',mult:1.18,casts:2},text:'雨滴從海面升向天空，逆流順便托起魚群。'},
    {id:'clockwork_gull',tone:'strange',weight:5,icon:'⚙️',title:'發條海鷗',effect:'loot',pool:'odd',text:'一隻發條海鷗停在欄杆上，吐出一件金屬收藏品。'},
    {id:'tiny_island',tone:'strange',weight:5,icon:'🏝️',title:'巴掌大的小島',effect:'loot',pool:'moon',text:'一座只有桌面大小的小島漂過船側，上面放著一件月潮遺物。'},
    {id:'ghost_parade',tone:'strange',weight:4,icon:'⛵',title:'幽靈船隊遊行',effect:'loot',pool:'ghost',text:'透明船隊安靜經過，其中一艘留下紀念物。'},
    {id:'moon_bucket',tone:'strange',weight:5,icon:'🪣',title:'水桶裡撈到月亮',effect:'pearlGain',min:16,max:48,text:'水桶裡的月光凝結成可使用的珍珠。'},
    {id:'judge_crab',tone:'strange',weight:6,icon:'⚖️',title:'會說話的螃蟹法官',effect:'gamble',winMin:20,winMax:70,lossMin:4,lossMax:18,text:'螃蟹法官判決你的釣法是否合格，結果可能得到獎金或罰款。'},
    {id:'undersea_train',tone:'strange',weight:4,icon:'🚆',title:'海底列車經過',effect:'loot',pool:'odd',text:'海底列車從船下駛過，一張車票被水流送上甲板。'},
    {id:'floating_door',tone:'strange',weight:4,icon:'🚪',title:'海上的獨立門扉',effect:'loot',pool:'odd',text:'一扇沒有牆的門在海面打開，留下門把後自行關閉。'},
    {id:'sea_writes_name',tone:'strange',weight:5,icon:'✍️',title:'海浪寫下你的名字',effect:'status',status:{id:'named_by_sea',label:'海洋記名',type:'value',mult:1.22,casts:3},text:'海浪在甲板上寫下你的名字，接下來三竿似乎更受市場歡迎。'},
    {id:'invisible_choir',tone:'strange',weight:5,icon:'🎼',title:'看不見的合唱團',effect:'status',status:{id:'choir_luck',label:'無形合唱',type:'event',mult:1.35,casts:3},text:'沒有人的合唱聲從霧裡傳來，吸引更多奇異事件靠近。'},
    {id:'ancient_machine',tone:'strange',weight:4,icon:'🎰',title:'海底自動販賣機',effect:'gamble',winMin:35,winMax:110,lossMin:8,lossMax:28,text:'機器接受珍珠並隨機吐出更多珍珠，或什麼也不給。'},
    {id:'sleepy_kraken',tone:'strange',weight:3,icon:'🐙',title:'沉睡海怪翻身',effect:'status',status:{id:'kraken_wave',label:'海怪餘波',type:'weight',mult:1.6,casts:1},text:'巨大海怪在深處翻身，下一竿可能拉到更沉重的漁獲。'},
    {id:'fallen_star',tone:'strange',weight:3,icon:'⭐',title:'星星落進海裡',effect:'upgrade',text:'落海星光附著在漁獲上，提升稀有度與品質。'},
    {id:'future_bottle',tone:'strange',weight:4,icon:'🍾',title:'明日寄出的漂流瓶',effect:'loot',pool:'odd',text:'瓶上的郵戳是明天，裡面只有一件奇怪的小物。'},
    {id:'whispering_anchor',tone:'strange',weight:4,icon:'⚓',title:'會說夢話的船錨',effect:'status',status:{id:'anchor_dream',label:'船錨夢境',type:'duplicate',mult:.22,casts:3},text:'船錨在夢話中透露魚群位置，接下來三竿可能出現雙重漁獲。'},

    // 風險交換事件：可能獲利，也可能受到懲罰。
    {id:'double_or_nothing',tone:'risk',weight:7,icon:'🎲',title:'雙倍或歸零',effect:'gamble',winMin:45,winMax:120,lossMin:15,lossMax:50,text:'神秘賭徒拋出骨骰，勝利獲得大量珍珠，失敗則支付賭金。'},
    {id:'cursed_chest',tone:'risk',weight:6,icon:'🧰',title:'被封印的寶箱',effect:'riskChest',text:'打開寶箱可能獲得珍珠與收藏，也可能招來持續詛咒。'},
    {id:'pirate_dice',tone:'risk',weight:6,icon:'☠️',title:'海盜骰局',effect:'gamble',winMin:30,winMax:95,lossMin:10,lossMax:40,text:'海盜邀你擲骰，輸贏立即從珍珠錢包結算。'},
    {id:'storm_challenge',tone:'risk',weight:5,icon:'⚡',title:'穿越雷暴魚群',effect:'riskStorm',text:'選擇在雷暴中繼續下竿，可能獲得重量加成，也可能讓釣具受損。'},
    {id:'sea_witch',tone:'risk',weight:5,icon:'🔮',title:'海巫的交換',effect:'riskWitch',text:'海巫提出交換：犧牲一件低價物品，換取接下來數竿的強力增益。'},
    {id:'black_pearl',tone:'risk',weight:5,icon:'⚫',title:'黑珍珠賭注',effect:'riskPearl',text:'黑珍珠可能化為大量財富，也可能吞噬一部分錢包。'},
    {id:'haunted_net',tone:'risk',weight:5,icon:'🕸️',title:'亡者留下的漁網',effect:'riskNet',text:'幽靈漁網可能複製本次漁獲，也可能把它拖回深海。'},
    {id:'leviathan_shadow',tone:'risk',weight:4,icon:'🐉',title:'利維坦陰影',effect:'riskLeviathan',text:'巨大陰影經過船底；留下可能得到祝福，也可能遭遇長時間厄運。'},
    {id:'moon_toll',tone:'risk',weight:5,icon:'🌙',title:'月潮收費站',effect:'riskToll',text:'支付少量珍珠可換取三竿高價潮汐；拒絕則受到一竿低價影響。'},
    {id:'abyss_auction',tone:'risk',weight:4,icon:'🔨',title:'深淵拍賣會',effect:'riskAuction',text:'深淵中的拍賣槌落下，你可能買到稀有收藏，也可能只買到空盒。'}
  ];

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  }

  function state() {
    const value = read(STATE_KEY,{effects:[],stats:{casts:0,events:0,negative:0,positive:0,strange:0,risk:0}});
    value.effects = Array.isArray(value.effects) ? value.effects : [];
    value.stats = value.stats || {};
    return value;
  }

  function saveState(value) {
    value.effects = (value.effects || []).filter(effect => Number(effect.casts || 0) > 0).slice(-24);
    save(STATE_KEY,value);
    window.dispatchEvent(new CustomEvent('coffee-ship:fishing-adventure-state',{detail:{state:value}}));
  }

  function economy() {
    return window.COFFEE_SHIP_ECONOMY || null;
  }

  function balance() {
    return economy()?.balance?.() ?? Math.max(0,Number(localStorage.getItem('coffeeShipPearls') || 0));
  }

  function earn(amount, reason) {
    const value = Math.max(0,Math.floor(Number(amount) || 0));
    if (!value) return 0;
    if (economy()?.earn) economy().earn(value,reason,{source:'fishing-adventure'});
    else localStorage.setItem('coffeeShipPearls',String(balance() + value));
    return value;
  }

  function spend(amount, reason) {
    const value = Math.min(balance(),Math.max(0,Math.floor(Number(amount) || 0)));
    if (!value) return 0;
    if (economy()?.spend) economy().spend(value,reason,{source:'fishing-adventure'});
    else localStorage.setItem('coffeeShipPearls',String(Math.max(0,balance() - value)));
    return value;
  }

  function randomInt(min,max) {
    return Math.floor(Number(min || 0) + Math.random() * (Number(max || min || 0) - Number(min || 0) + 1));
  }

  function priceOf(item) {
    return economy()?.sellPrice?.(item) ?? Math.max(1,Number(item?.sellPrice || item?.price || 1));
  }

  function rarityRank(value) {
    return Math.max(0,RARITIES.indexOf(String(value || '普通')));
  }

  function protectedItem(item) {
    const text = `${item?.name || ''} ${item?.zone || ''} ${item?.source || ''} ${item?.series || ''}`;
    return item?.kind === 'letter' || item?.group === 'bottle' || /漂流瓶|航海日誌|藏寶圖|故事|殘頁|歌詞/.test(text) || rarityRank(item?.rarity) >= 3;
  }

  function findBagIndex(items,item,castId) {
    for (let index = items.length - 1; index >= 0; index -= 1) {
      const row = items[index];
      if (String(row?.castId || '') !== String(castId || '')) continue;
      if (Number(row?.at || 0) === Number(item?.at || 0) || row?.name === item?.name) return index;
    }
    return -1;
  }

  function mutateCatch(item,castId,mutator) {
    const bag = read(BAG_KEY,[]);
    const history = read(HISTORY_KEY,[]);
    const bagIndex = findBagIndex(bag,item,castId);
    const historyIndex = history.findIndex(row => row?.type === 'catch' && String(row.castId || '') === String(castId || '') && (Number(row.item?.at || 0) === Number(item?.at || 0) || row.item?.name === item?.name));

    const target = bagIndex >= 0 ? bag[bagIndex] : item;
    mutator(target);
    Object.assign(item,target);
    if (bagIndex >= 0) bag[bagIndex] = target;
    if (historyIndex >= 0) history[historyIndex].item = {...history[historyIndex].item,...target};
    save(BAG_KEY,bag.slice(-MAX_BAG));
    save(HISTORY_KEY,history);
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'fishing-adventure',item:target}}));
    window.COFFEE_SHIP_FISHING_API?.render?.({preserveScroll:true});
    return target;
  }

  function escapeCatch(item,castId) {
    const bag = read(BAG_KEY,[]);
    const history = read(HISTORY_KEY,[]);
    const bagIndex = findBagIndex(bag,item,castId);
    if (bagIndex >= 0) bag.splice(bagIndex,1);
    const historyIndex = history.findIndex(row => row?.type === 'catch' && String(row.castId || '') === String(castId || '') && (Number(row.item?.at || 0) === Number(item?.at || 0) || row.item?.name === item?.name));
    if (historyIndex >= 0) {
      history[historyIndex].item = {...history[historyIndex].item,name:`${item.name}（逃脫）`,kind:'trash',weight:0,sellPrice:0,escaped:true};
    }
    save(BAG_KEY,bag.slice(-MAX_BAG));
    save(HISTORY_KEY,history);
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'fishing-adventure-escape',item}}));
    window.COFFEE_SHIP_FISHING_API?.render?.({preserveScroll:true});
  }

  function duplicateCatch(item,castId) {
    if (!item || item.escaped || item.kind === 'trash') return null;
    const clone = {...item,at:Date.now() + Math.floor(Math.random()*5),weight:Math.max(.01,Number(item.weight || 0) * (.82 + Math.random() * .28)),duplicate:true};
    clone.sellPrice = Math.max(1,Math.round(priceOf(clone)));
    const bag = read(BAG_KEY,[]);
    bag.push(clone);
    save(BAG_KEY,bag.slice(-MAX_BAG));
    const history = read(HISTORY_KEY,[]);
    history.unshift({type:'catch',castId,item:clone,at:clone.at});
    save(HISTORY_KEY,history.slice(0,120));
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'fishing-adventure-duplicate',item:clone}}));
    window.COFFEE_SHIP_FISHING_API?.render?.({preserveScroll:true});
    return clone;
  }

  function addLoot(poolName,castId) {
    const pool = LOOT[poolName] || LOOT.odd;
    const row = pool[Math.floor(Math.random() * pool.length)];
    const bonus = Math.max(1,Number(economy()?.fishingModifiers?.().pearlBonus || 1));
    const item = {
      name:row[1],icon:row[0],rarity:row[2],quality:'拾獲',kind:'treasure',group:'adventure',
      zone:'海上冒險事件',trait:row[4],sellPrice:Math.round(row[3] * bonus),weight:.05 + Math.random() * 1.8,
      castId,at:Date.now(),coffeePearlBonus:bonus,coffeeEffectName:window.COFFEE_SHIP_COFFEE_EFFECT?.name || ''
    };
    const bag = read(BAG_KEY,[]);
    bag.push(item);
    save(BAG_KEY,bag.slice(-MAX_BAG));
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'fishing-adventure-loot',item}}));
    return item;
  }

  function removeLowItem(currentState) {
    if (currentState.effects.some(effect => effect.type === 'protect' && effect.casts > 0)) return {protected:true};
    const bag = read(BAG_KEY,[]);
    const candidates = bag.map((item,index) => ({item,index,price:priceOf(item)}))
      .filter(row => !protectedItem(row.item) && row.price <= 80)
      .sort((a,b) => a.price - b.price);
    if (!candidates.length) return null;
    const target = candidates[0];
    bag.splice(target.index,1);
    save(BAG_KEY,bag.slice(-MAX_BAG));
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'fishing-adventure-loss',item:target.item}}));
    return target.item;
  }

  function addStatus(currentState,status) {
    if (!status?.id) return;
    const existing = currentState.effects.find(effect => effect.id === status.id);
    if (existing) {
      existing.casts = Math.max(Number(existing.casts || 0),Number(status.casts || 1));
      existing.mult = Number(status.mult ?? existing.mult ?? 1);
      existing.label = status.label || existing.label;
      existing.type = status.type || existing.type;
    } else {
      currentState.effects.push({...status,casts:Math.max(1,Number(status.casts || 1))});
    }
  }

  function upgradeQuality(item) {
    const index = Math.max(0,QUALITIES.indexOf(item.quality || '普通'));
    item.quality = QUALITIES[Math.min(QUALITIES.length - 1,index + 1)];
  }

  function downgradeQuality(item) {
    const index = Math.max(0,QUALITIES.indexOf(item.quality || '普通'));
    item.quality = QUALITIES[Math.max(0,index - 1)];
  }

  function upgradeRarity(item) {
    const index = rarityRank(item.rarity);
    item.rarity = RARITIES[Math.min(RARITIES.length - 1,index + 1)];
  }

  function applyActiveEffects(item,castId,currentState) {
    const notes = [];
    let protectedNow = currentState.effects.some(effect => effect.type === 'protect' && effect.casts > 0);
    let escape = false;
    let duplicateChance = 0;

    mutateCatch(item,castId,target => {
      for (const effect of currentState.effects) {
        if (effect.casts <= 0) continue;
        if (effect.type === 'weight') {
          target.weight = Math.max(.01,Number(target.weight || 0) * Number(effect.mult || 1));
          notes.push(`${effect.label}：重量 ×${Number(effect.mult).toFixed(2)}`);
        } else if (effect.type === 'value') {
          target.sellPrice = Math.max(0,Math.round(priceOf(target) * Number(effect.mult || 1)));
          notes.push(`${effect.label}：售價 ×${Number(effect.mult).toFixed(2)}`);
        } else if (effect.type === 'quality') {
          if (Number(effect.mult) > 0) upgradeQuality(target);
          else downgradeQuality(target);
          notes.push(`${effect.label}：品質${Number(effect.mult) > 0 ? '提升' : '下降'}`);
        } else if (effect.type === 'escape') {
          if (!protectedNow && Math.random() < Number(effect.mult || 0)) escape = true;
        } else if (effect.type === 'duplicate') {
          duplicateChance = Math.max(duplicateChance,Number(effect.mult || 0));
        }
        effect.casts -= 1;
      }
      if (target.sellPrice == null && notes.length) target.sellPrice = Math.max(0,Math.round(priceOf(target)));
    });

    if (escape) {
      escapeCatch(item,castId);
      notes.push('鯊影奪走了本次漁獲');
    } else if (duplicateChance > 0 && Math.random() < duplicateChance) {
      duplicateCatch(item,castId);
      notes.push('持續效果帶來額外一份漁獲');
    }

    saveState(currentState);
    if (notes.length) pushDisplay({castId,tone:escape?'negative':'status',icon:escape?'🦈':'🧭',title:'持續效果生效',text:notes.join('\n')});
    return {escaped:escape,notes};
  }

  function categoryWeights(currentState) {
    const luck = Math.max(1,Number(economy()?.fishingModifiers?.().eventLuck || 1));
    const misfortune = currentState.effects.filter(effect => effect.type === 'misfortune' && effect.casts > 0).reduce((value,effect) => value * Number(effect.mult || 1),1);
    return {
      negative:44 * misfortune / Math.sqrt(luck),
      positive:25 * luck,
      strange:17 * Math.sqrt(luck),
      risk:14
    };
  }

  function eventMultiplier(currentState) {
    return currentState.effects.filter(effect => effect.type === 'event' && effect.casts > 0).reduce((value,effect) => value * Number(effect.mult || 1),1);
  }

  function weightedPick(rows,weightGetter = row => row.weight || 1) {
    const total = rows.reduce((sum,row) => sum + Math.max(0,Number(weightGetter(row) || 0)),0);
    if (!total) return rows[0];
    let roll = Math.random() * total;
    for (const row of rows) {
      roll -= Math.max(0,Number(weightGetter(row) || 0));
      if (roll <= 0) return row;
    }
    return rows[rows.length - 1];
  }

  function chooseTone(currentState) {
    const weights = categoryWeights(currentState);
    return weightedPick(Object.entries(weights).map(([tone,weight]) => ({tone,weight}))).tone;
  }

  function chooseEvent(currentState,excluded = new Set()) {
    const tone = chooseTone(currentState);
    const rows = EVENTS.filter(event => event.tone === tone && !excluded.has(event.id));
    return weightedPick(rows.length ? rows : EVENTS.filter(event => !excluded.has(event.id)));
  }

  function eventChance(currentState) {
    const luck = Math.max(1,Number(economy()?.fishingModifiers?.().eventLuck || 1));
    return Math.min(.82,.36 * luck * eventMultiplier(currentState));
  }

  function executeAction(action,context) {
    const {item,castId,currentState} = context;
    switch (action.effect) {
      case 'pearlGain': {
        const amount = earn(randomInt(action.min,action.max),`事件獎勵：${context.title}`);
        return `獲得 🦪 ${amount} 珍珠`;
      }
      case 'pearlLoss': {
        const amount = spend(randomInt(action.min,action.max),`事件損失：${context.title}`);
        return amount ? `損失 🦪 ${amount} 珍珠` : '錢包裡沒有珍珠可被收走';
      }
      case 'removeLow': {
        const removed = removeLowItem(currentState);
        if (removed?.protected) return '保護效果阻止物品損失';
        return removed ? `失去 ${removed.icon || '📦'} ${removed.name}` : '背包裡沒有可被破壞的低價物品';
      }
      case 'damage': {
        mutateCatch(item,castId,target => {
          target.sellPrice = Math.max(0,Math.round(priceOf(target) * Number(action.mult || .7)));
          downgradeQuality(target);
        });
        return `本次漁獲受損，品質下降且售價剩下約 ${Math.round(Number(action.mult || .7) * 100)}%`;
      }
      case 'escape': {
        const protectedNow = currentState.effects.some(effect => effect.type === 'protect' && effect.casts > 0);
        if (protectedNow) return '保護效果抓住了即將逃脫的漁獲';
        escapeCatch(item,castId);
        context.escaped = true;
        return `${item.name} 逃回海中`;
      }
      case 'status':
        addStatus(currentState,action.status);
        return `獲得狀態「${action.status.label}」${action.status.casts} 竿`;
      case 'duplicate': {
        const clone = duplicateCatch(item,castId);
        return clone ? `額外獲得 ${clone.icon || '🐟'} ${clone.name}` : '沒有可以複製的漁獲';
      }
      case 'upgrade':
        mutateCatch(item,castId,target => { upgradeQuality(target); upgradeRarity(target); target.weight = Math.max(.01,Number(target.weight || 0) * 1.25); target.sellPrice = Math.round(priceOf(target) * 1.45); });
        return '本次漁獲的稀有度、品質、重量與價值提升';
      case 'upgradeQuality':
        mutateCatch(item,castId,target => { upgradeQuality(target); target.sellPrice = Math.round(priceOf(target) * 1.2); });
        return '本次漁獲品質提升一級';
      case 'downgrade':
        mutateCatch(item,castId,target => { downgradeQuality(target); target.sellPrice = Math.max(0,Math.round(priceOf(target) * .78)); });
        return '本次漁獲品質下降一級';
      case 'loot': {
        const loot = addLoot(action.pool,castId);
        return `獲得 ${loot.icon} ${loot.name}［${loot.rarity}］`;
      }
      case 'gamble': {
        if (Math.random() < .52) {
          const amount = earn(randomInt(action.winMin,action.winMax),`事件勝利：${context.title}`);
          return `賭局勝利，獲得 🦪 ${amount} 珍珠`;
        }
        const amount = spend(randomInt(action.lossMin,action.lossMax),`事件失敗：${context.title}`);
        return amount ? `賭局失敗，損失 🦪 ${amount} 珍珠` : '賭局失敗，但錢包是空的';
      }
      case 'riskChest':
        if (Math.random() < .55) return [executeAction({effect:'pearlGain',min:45,max:125},context),executeAction({effect:'loot',pool:'ghost'},context)].join('\n');
        return executeAction({effect:'status',status:{id:'chest_curse',label:'寶箱詛咒',type:'misfortune',mult:1.8,casts:4}},context);
      case 'riskStorm':
        if (Math.random() < .5) return executeAction({effect:'status',status:{id:'storm_power',label:'雷暴大魚群',type:'weight',mult:1.85,casts:2}},context);
        return executeAction({effect:'status',status:{id:'storm_damage',label:'雷擊釣具',type:'value',mult:.55,casts:2}},context);
      case 'riskWitch': {
        const removed = removeLowItem(currentState);
        if (removed && !removed.protected) {
          addStatus(currentState,{id:'witch_blessing',label:'海巫祝福',type:'value',mult:1.8,casts:3});
          return `交出 ${removed.icon || '📦'} ${removed.name}，換得三竿高價祝福`;
        }
        addStatus(currentState,{id:'witch_displeasure',label:'海巫不悅',type:'misfortune',mult:1.5,casts:2});
        return '沒有合適祭品，海巫留下兩竿厄運';
      }
      case 'riskPearl':
        if (Math.random() < .48) return executeAction({effect:'pearlGain',min:70,max:180},context);
        return executeAction({effect:'pearlLoss',min:20,max:75},context);
      case 'riskNet':
        if (Math.random() < .55) return executeAction({effect:'duplicate'},context);
        return executeAction({effect:'escape'},context);
      case 'riskLeviathan':
        if (Math.random() < .5) return executeAction({effect:'status',status:{id:'leviathan_bless',label:'巨獸餘波',type:'weight',mult:2,casts:1}},context);
        return executeAction({effect:'status',status:{id:'leviathan_dread',label:'巨獸恐懼',type:'misfortune',mult:2,casts:3}},context);
      case 'riskToll': {
        const fee = Math.min(balance(),18);
        if (fee >= 8) {
          spend(fee,`月潮通行費`);
          addStatus(currentState,{id:'moon_toll_value',label:'月潮高價',type:'value',mult:1.7,casts:3});
          return `支付 🦪 ${fee} 珍珠，換得三竿高價潮汐`;
        }
        addStatus(currentState,{id:'moon_toll_cold',label:'月潮拒絕',type:'value',mult:.7,casts:1});
        return '珍珠不足，下一竿售價降低';
      }
      case 'riskAuction': {
        const fee = Math.min(balance(),randomInt(12,35));
        if (fee) spend(fee,'深淵拍賣會出價');
        if (Math.random() < .52) {
          const loot = addLoot(Math.random() < .5 ? 'moon' : 'ghost',castId);
          return `支付 🦪 ${fee} 珍珠，拍得 ${loot.icon} ${loot.name}`;
        }
        return `支付 🦪 ${fee} 珍珠，只拍到一只空盒`;
      }
      case 'mixed':
        return (action.actions || []).map(row => executeAction(row,context)).filter(Boolean).join('\n');
      default:
        return '';
    }
  }

  function pushDisplay({castId,tone,icon,title,text}) {
    const labels = {negative:'負面事件',positive:'幸運事件',strange:'奇異事件',risk:'風險事件',status:'持續效果'};
    const accents = {negative:'#d96b72',positive:'#79d0b1',strange:'#9ce8f0',risk:'#f2a957',status:'#b9a4e6'};
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({
      castId,
      eventKind:'special',
      title:`${labels[tone] || '海上事件'}｜${title}`,
      icon:icon || '🌊',
      accent:accents[tone] || '#8460c8',
      text
    });
  }

  function logEvent(event,detail,castId) {
    const rows = read(LOG_KEY,[]);
    rows.unshift({id:event.id,title:event.title,tone:event.tone,detail,castId,at:Date.now()});
    save(LOG_KEY,rows.slice(0,MAX_LOG));
  }

  function runEvent(event,item,castId,currentState) {
    const context = {item,castId,currentState,title:event.title,escaped:false};
    const detail = executeAction(event,context);
    saveState(currentState);
    pushDisplay({castId,tone:event.tone,icon:event.icon,title:event.title,text:`${event.text}\n${detail}`});
    logEvent(event,detail,castId);
    currentState.stats.events = Number(currentState.stats.events || 0) + 1;
    currentState.stats[event.tone] = Number(currentState.stats[event.tone] || 0) + 1;
    saveState(currentState);
    return context;
  }

  function processResult(event) {
    const item = event.detail?.item;
    const castId = event.detail?.castId;
    if (!item || !castId) return;

    setTimeout(() => {
      const currentState = state();
      currentState.stats.casts = Number(currentState.stats.casts || 0) + 1;
      const active = applyActiveEffects(item,castId,currentState);
      if (active.escaped) return;

      if (Math.random() > eventChance(currentState)) {
        saveState(currentState);
        return;
      }

      const used = new Set();
      const first = chooseEvent(currentState,used);
      used.add(first.id);
      const firstResult = runEvent(first,item,castId,currentState);
      if (firstResult.escaped) return;

      const luck = Math.max(1,Number(economy()?.fishingModifiers?.().eventLuck || 1));
      const chainChance = Math.min(.3,.12 * Math.sqrt(luck));
      if (Math.random() < chainChance) {
        const second = chooseEvent(currentState,used);
        runEvent(second,item,castId,currentState);
      }
    },30);
  }

  function clearEffects() {
    const currentState = state();
    currentState.effects = [];
    saveState(currentState);
  }

  function init() {
    window.addEventListener('coffee-ship:fishing-result',processResult);
    window.COFFEE_SHIP_FISHING_ADVENTURES = {
      events:EVENTS,
      loot:LOOT,
      state,
      log:() => read(LOG_KEY,[]),
      clearEffects,
      run:(id,item,castId) => {
        const event = EVENTS.find(row => row.id === id);
        if (!event) return false;
        runEvent(event,item,castId || window.COFFEE_SHIP_FISHING_API?.getCurrentCastId?.(),state());
        return true;
      },
      version:1
    };
    window.dispatchEvent(new CustomEvent('coffee-ship:fishing-adventures-ready',{detail:{events:EVENTS.length,negative:EVENTS.filter(row => row.tone === 'negative').length,version:1}}));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();