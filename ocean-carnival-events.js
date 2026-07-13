(() => {
  'use strict';
  if (window.__COFFEE_SHIP_OCEAN_CARNIVAL_EVENTS_V1__) return;
  window.__COFFEE_SHIP_OCEAN_CARNIVAL_EVENTS_V1__ = true;

  const BAG_KEY = 'coffeeShipFishBag';
  const DEX_KEY = 'coffeeShipEventLootDex';
  const LOG_KEY = 'coffeeShipExpandedEventLog';
  const MAX_BAG = 240;

  const OCEAN_EXTRA = [
    ['ocean_turtle_scale','🐢','海龜脫落甲片','海洋朋友','常見',.18,'自然脫落的甲片，沒有傷害到海龜。'],
    ['ocean_dolphin_whistle','🐬','海豚銀哨','海洋朋友','稀有',.12,'吹響時，遠方會傳來海豚回應。'],
    ['ocean_seal_ball','🦭','海豹玩具球','海洋朋友','普通',.35,'表面留下許多牙印。'],
    ['ocean_whale_stone','🐋','鯨歌共鳴石','海洋朋友','史詩',2.4,'靠近耳邊時能聽見低沉鯨歌。'],
    ['ocean_ray_sand','✨','蝠魟星砂','海洋朋友','稀有',.08,'從蝠魟掠過海床時揚起的星形砂粒。'],
    ['ocean_octopus_jar','🐙','章魚收藏玻璃瓶','海洋朋友','稀有',.6,'瓶內整齊放著亮晶晶的小石子。'],
    ['ocean_coral_branch','🪸','珊瑚守護枝','海洋朋友','史詩',1.1,'已自然脫落，仍泛著溫柔微光。'],
    ['ocean_seahorse_pouch','🦄','海馬育兒袋護符','海洋朋友','稀有',.05,'象徵耐心照顧與守護。'],
    ['ocean_jelly_glow','🪼','月光水母膠','海洋朋友','常見',.22,'不具刺激性，夜裡會發出淡藍色光。'],
    ['ocean_hermit_token','🦀','寄居蟹交換券','海洋朋友','普通',.03,'背面畫著一個尺寸剛好的新貝殼。'],
    ['ocean_otter_hammer','🦦','海獺貝殼錘','海洋朋友','稀有',.45,'海獺敲貝殼時遺落的小石頭。'],
    ['ocean_penguin_feather','🐧','企鵝漂流羽毛','海洋朋友','常見',.02,'被海水沖得乾乾淨淨。'],
    ['ocean_albatross_mail','🕊️','信天翁郵袋','海洋朋友','史詩',.7,'袋中有幾封沒有地址的信。'],
    ['ocean_whaleshark_scale','🦈','鯨鯊星斑鱗','海洋朋友','傳說',.15,'像夜空一樣布滿白色星點。'],
    ['ocean_dugong_grass','🌿','儒艮海草束','海洋朋友','普通',.8,'被整理成一束的柔軟海草。'],
    ['ocean_snake_skin','🐍','海蛇舊皮','海洋朋友','稀有',.26,'完整而透明，泛著虹彩。'],
    ['ocean_star_core','⭐','海星再生晶核','海洋朋友','傳說',.09,'並非真正器官，而是像晶體般的海水結晶。'],
    ['ocean_lobster_shell','🦞','龍蝦蛻殼','海洋朋友','常見',1.7,'完整保留巨大鉗子的形狀。'],
    ['ocean_crab_clasp','🦀','螃蟹金鉗扣','海洋朋友','史詩',.14,'一枚被螃蟹從沉船帶回來的金屬扣。'],
    ['ocean_seaslug_crystal','💜','海兔紫晶黏液','海洋朋友','稀有',.11,'乾燥後形成漂亮的紫色晶膜。'],
    ['ocean_manatee_herb','🌱','海牛睡眠草','海洋朋友','常見',.55,'聞起來讓人放鬆。'],
    ['ocean_turtle_tracker','📡','被取下的海龜定位器','海洋朋友','史詩',.32,'任務完成後回收的舊型定位器。'],
    ['ocean_freed_net','🕸️','被解開的幽靈漁網','海洋朋友','稀有',2.8,'已從受困動物身上完整取下。'],
    ['ocean_oil_cloth','🧽','油污清理布','海洋朋友','普通',.42,'證明有人曾替海鳥清理羽毛。'],
    ['ocean_coral_seed','🫙','珊瑚幼苗罐','海洋朋友','史詩',.9,'等待被送往合適海域復育。'],
    ['ocean_medical_box','🩺','海洋救援醫療箱','海洋朋友','傳說',3.2,'箱角貼滿不同救援隊的貼紙。'],
    ['ocean_group_photo','📷','海洋朋友合照','海洋朋友','神話',.04,'照片裡所有動物都剛好看向鏡頭。'],
    ['ocean_whale_baleen','🪶','自然脫落的藍鯨鬚片','海洋朋友','傳說',4.8,'巨大但輕盈，像深色羽毛。'],
    ['ocean_seal_stamp','🔵','海豹印章','海洋朋友','稀有',.16,'蓋出來是一枚圓滾滾的鰭印。'],
    ['ocean_dolphin_chart','🗺️','海豚航線圖','海洋朋友','傳說',.25,'標記著安全水道與魚群位置。']
  ];

  const CARNIVAL_EXTRA = [
    ['carnival_paper_flowers','💐','狂歡節紙花束','祭典裝飾','普通',.08,'泡過海水仍保持鮮豔。'],
    ['carnival_ribbon_wheel','🎀','彩帶旋輪','祭典裝飾','常見',.22,'只要吹到海風就會自行旋轉。'],
    ['carnival_moon_mask','🌙','銀月舞者面具','動物面具','史詩',.31,'面具內側寫著舞會開始的時間。'],
    ['carnival_sun_mask','☀️','金日主持人面具','動物面具','傳說',.42,'戴上後會感覺舞台燈正照著自己。'],
    ['carnival_jester_cane','🪄','小丑手杖','祭典道具','稀有',.6,'敲擊地面時會冒出一小片亮粉。'],
    ['carnival_dance_shoes','👞','永不停歇的舞鞋','漂流衣物','史詩',.52,'鞋底仍在輕輕打拍子。'],
    ['carnival_music_box','🎼','狂歡島音樂盒','玩具','傳說',1.2,'旋律總是在最後一小節突然中斷。'],
    ['carnival_carousel_ticket','🎟️','旋轉木馬紀念票','祭典票券','常見',.01,'票面日期是一百年前。'],
    ['carnival_moon_ticket','🎫','銀月舞會門票','祭典票券','稀有',.02,'入場者姓名已被海水洗去。'],
    ['carnival_invitation','✉️','金色邀請函','祭典票券','傳說',.03,'邀請你參加永不散場的最後一夜。'],
    ['carnival_candy_box','🍬','潮濕糖果盒','祭典食物','普通',.28,'糖果紙發出細微笑聲。'],
    ['carnival_perfume','🧴','舞會香水瓶','飾品','稀有',.18,'聞起來像焦糖、玫瑰與暴雨前的海。'],
    ['carnival_bulb','💡','彩燈玻璃燈泡','祭典裝飾','常見',.12,'沒有接電卻會每隔一段時間亮起。'],
    ['carnival_flag','🚩','帳篷尖頂旗','祭典裝飾','稀有',.7,'旗面畫著閉著眼睛的小丑。'],
    ['carnival_magic_cards','🃏','魔術師完整牌組','玩具','史詩',.16,'每次數都會多出一張牌。'],
    ['carnival_oracle_crystal','🔮','占卜帳篷水晶','飾品','傳說',1.8,'水晶裡映出的不是現在的天空。'],
    ['carnival_mirror_mask','🪞','鏡面無臉面具','動物面具','神話',.36,'鏡面只反射身後的人群。'],
    ['carnival_black_mask','🪶','黑羽夜宴面具','動物面具','傳說',.29,'羽毛摸起來像剛離開鳥翼。'],
    ['carnival_shawl','🧣','紅絨舞會披肩','漂流衣物','史詩',.88,'邊緣縫著細小金鈴。'],
    ['carnival_key','🗝️','祭典後台鑰匙','祭典道具','傳說',.2,'不知道能打開哪一座已沉沒的帳篷。'],
    ['carnival_last_candle','🕯️','最後一支舞會蠟燭','祭典道具','史詩',.25,'燭火遇到海水也不會熄滅。'],
    ['carnival_stage_piece','🎭','漂流舞台碎片','祭典裝飾','稀有',3.4,'木板背面留下演員的簽名。'],
    ['carnival_smile_coin','🪙','笑臉代幣','祭典票券','常見',.04,'正反兩面都在微笑。'],
    ['carnival_program','📃','無名節目單','祭典票券','稀有',.03,'所有演員名字都被整齊剪去。'],
    ['carnival_royal_fork','🍴','王室宴會銀叉','飾品','史詩',.19,'叉柄刻著狂歡島消失前的王徽。']
  ];

  const SALVAGE_LOOT = [
    ['wreck_compass','🧭','沉船羅盤','沉船打撈','稀有',.65,'指針永遠指向最近的陸地。'],
    ['wreck_watch','⌚','船長懷錶','沉船打撈','史詩',.22,'停在船沉沒前一分鐘。'],
    ['wreck_sextant','📐','銀製六分儀','沉船打撈','傳說',1.4,'即使沒有星星也能指出方向。'],
    ['wreck_telescope','🔭','黃銅望遠鏡','沉船打撈','稀有',2.1,'鏡片裡偶爾出現不存在的燈塔。'],
    ['wreck_telegraph','📻','深海電報機','沉船打撈','史詩',7.8,'仍會斷斷續續敲出摩斯密碼。'],
    ['wreck_coffee_crate','☕','密封咖啡豆木箱','沉船貨物','常見',9.5,'打開後仍保留焦糖香氣。'],
    ['wreck_tea_tin','🫖','百年密封茶罐','沉船貨物','稀有',1.1,'罐身印著已消失的港口。'],
    ['wreck_cup','🏺','船長室古董杯','沉船打撈','稀有',.48,'杯底刻著 Coffee Ship 的前身。'],
    ['wreck_medkit','🧰','舊船醫藥箱','沉船打撈','常見',3.8,'藥品失效了，箱子仍保存良好。'],
    ['wreck_bell','🔔','沉船銅鐘','沉船打撈','史詩',18,'深夜時會自己響一次。'],
    ['wreck_badge','⚓','老水手徽章','沉船打撈','常見',.08,'背面寫著「記得回家」。'],
    ['wreck_lifebuoy','🛟','褪色救生圈','沉船貨物','普通',2.5,'上面的船名已經看不清楚。'],
    ['wreck_star_chart','🌌','防水星圖','沉船打撈','傳說',.12,'標記了一顆不存在於現代星圖的星。'],
    ['wreck_flag','🏳️','破損船旗','沉船打撈','稀有',.9,'旗角縫著一枚小珍珠。'],
    ['wreck_key','🔑','沉船船艙鑰匙','沉船打撈','史詩',.18,'表面沒有鏽蝕。'],
    ['wreck_pearl_box','🦪','珍珠母貝盒','沉船貨物','傳說',.72,'盒內鋪著深藍色絲絨。'],
    ['wreck_gold_tooth','🦷','海盜金牙','海盜遺物','稀有',.04,'比傳聞中小很多。'],
    ['wreck_kingdom_coin','🪙','沉沒王國硬幣','古代遺物','傳說',.06,'幣面是頭戴珊瑚冠的國王。'],
    ['wreck_dragon_bone','🦴','海龍骨碎片','古代遺物','神話',5.6,'不知道是化石還是仍有生命。'],
    ['wreck_anchor_tip','⚫','黑曜石錨尖','古代遺物','史詩',6.2,'斷面平整得不像自然碎裂。'],
    ['wreck_glass_float','🔵','藍色玻璃浮球','漂流貨物','普通',.7,'玻璃中困著一顆小氣泡。'],
    ['wreck_camera','📸','漂流防水相機','漂流貨物','稀有',.44,'最後一張照片拍到巨大黑影。'],
    ['wreck_diary','📔','防水航海日記','沉船打撈','史詩',.32,'最後幾頁只重複寫著「不要回頭」。'],
    ['wreck_record','💿','船艙黑膠唱片','沉船貨物','稀有',.21,'唱片標籤寫著海上最後一夜。'],
    ['wreck_music_box','🎶','沉睡水手音樂盒','沉船打撈','傳說',1.5,'打開時會出現遠方合唱聲。'],
    ['wreck_beacon','🚨','發光航標核心','沉船打撈','史詩',3.1,'離開海水後仍保持微光。'],
    ['wreck_moon_crystal','🌙','月潮結晶','潮汐遺物','傳說',.36,'月圓時重量會變輕。'],
    ['wreck_storm_core','🌩️','風暴核心玻璃球','潮汐遺物','神話',2.8,'球內有一道永不停止的閃電。'],
    ['wreck_sea_statue','🗿','海神小雕像','古代遺物','神話',4.2,'雕像眼睛鑲著兩粒黑珍珠。'],
    ['wreck_void_shard','🕳️','虛空海溝碎片','深淵遺物','世界級',.01,'看得見輪廓，卻看不見表面。']
  ];

  const WORLD_LOOT = [
    ['world_aurora_bottle','🌌','極光收藏瓶','世界奇物','傳說',.3,'瓶內有一小片移動的極光。'],
    ['world_tide_hourglass','⏳','星潮砂漏','世界奇物','神話',1.2,'砂粒會由下往上流動。'],
    ['world_undersea_ticket','🚋','海底列車舊票','世界奇物','傳說',.02,'終點站寫著「月亮背面」。'],
    ['world_fog_key','🌫️','霧中月鑰','世界奇物','神話',.16,'只有在起霧時才摸得到。'],
    ['world_ghost_ticket','🎫','無人船乘船證','幽靈航線','史詩',.03,'乘客欄已經寫著你的名字。'],
    ['world_whalefall_flower','🌸','鯨落花','世界奇物','神話',.08,'只在深海鯨骨旁盛開。'],
    ['world_abyss_stamp','📮','深淵郵票','世界奇物','傳說',.01,'可以把信寄給尚未發生的明天。'],
    ['world_reverse_watch','🕰️','逆流懷錶','世界奇物','神話',.28,'秒針逆時針走動。'],
    ['world_sky_scale','🪽','天空魚鱗','世界奇物','傳說',.04,'表面映著雲而不是海。'],
    ['world_crown_fragment','👑','海神王冠碎片','世界奇物','世界級',.5,'靠近海水時會浮在半空。'],
    ['world_dream_anchor','⚓','夢境船錨','世界奇物','神話',6.5,'能固定一個即將醒來的夢。'],
    ['world_silent_bell','🔕','無聲海鐘','世界奇物','傳說',2.2,'鐘身震動時，附近所有聲音會短暫消失。']
  ];

  const OCEAN_EVENTS = [
    ['受困海龜','你發現一隻被廢棄漁線纏住的海龜。解開漁線後，牠把在海床找到的東西推向船邊。'],
    ['海豚領航','一群海豚在船側跳躍，帶你避開暗礁並找到漂浮物。'],
    ['海獺交換所','海獺抱著貝殼靠近，認真地用收藏品和你交換。'],
    ['鯨歌回聲','低沉鯨歌穿過船底，海面浮起帶有共鳴的遺物。'],
    ['海豹救援隊','一隻海豹頂著救援箱游來，箱中留下幾件紀念品。'],
    ['珊瑚復育任務','你協助把珊瑚幼苗送回合適水域，救援隊留下謝禮。'],
    ['信天翁郵差','信天翁把沒有地址的郵袋放在欄杆上，等待你接收。'],
    ['巨型蝠魟巡游','巨大蝠魟從月光下掠過，星砂與小物被海風吹上甲板。'],
    ['海洋清理行動','你撈起幽靈漁網與垃圾，幾隻海洋動物帶來回禮。'],
    ['海洋朋友合照','海龜、海豚與海豹短暫聚在船邊，留下不可思議的合照。']
  ];

  const CARNIVAL_EVENTS = [
    ['海上紙花雨','沒有島嶼的海面突然飄下大量紙花與彩帶。'],
    ['無人遊行船','一艘沒有乘客的遊行船擦身而過，甲板上散落祭典物品。'],
    ['最後一支舞','遠處傳來舞曲，幾件舞會服飾隨浪漂到船邊。'],
    ['小丑的漂流箱','畫著笑臉的木箱浮出水面，裡面全是奇怪玩具。'],
    ['狂歡島後台','漁線勾住一扇後台門板，門後綁著一串遺失物。'],
    ['面具之夜','海面浮起數張面具，它們全都面向 Coffee Ship。'],
    ['熄滅的舞台','一塊帶著簽名的舞台碎片和樂器道具順流而來。'],
    ['銀月邀請函','一封未拆封的金色邀請函出現在魚鉤上。'],
    ['旋轉木馬殘影','海霧中出現旋轉木馬的輪廓，霧散後留下紀念品。'],
    ['狂歡島王室宴席','一只密封餐具箱漂來，箱蓋刻著失落王徽。']
  ];

  const SALVAGE_EVENTS = [
    ['沉船貨艙','魚鉤勾住沉船貨艙的繩索，你拉上幾件保存良好的貨物。'],
    ['老船長房間','一扇腐朽木門浮上海面，門後卡著船長的私人物品。'],
    ['暴風後的海面','昨夜風暴把沉在海床的物品捲到了淺層。'],
    ['失落咖啡商船','密封木箱散發咖啡香，箱上仍看得見古老航運標誌。'],
    ['幽靈航標','一枚熄滅百年的航標突然亮起，照出附近的沉船物品。'],
    ['海盜補給箱','鎖已鏽斷的補給箱浮出水面，裡面混著金屬與航海工具。'],
    ['月潮打撈','月光讓潮水短暫退去，露出原本碰不到的海床。'],
    ['海底電報','釣線傳來規律震動，來源是一台仍在工作的電報機。'],
    ['沉沒王國遺跡','漁鉤刮過石造屋頂，帶回刻有未知王徽的遺物。'],
    ['漂流攝影箱','防水箱內有相機、日記與一卷尚未沖洗的底片。'],
    ['深海音樂室','海流送來黑膠唱片與音樂盒，旋律在浪聲中接續。'],
    ['黑曜石船錨','船底傳來沉重碰撞聲，一枚古老錨尖被拉上甲板。']
  ];

  const WORLD_EVENTS = [
    ['極光落海','一道極光垂落海面，凝結成可以被撈起的奇物。'],
    ['逆流一分鐘','周圍海水突然倒流，來自未來的漂流物撞上船身。'],
    ['海底列車經過','深海傳來鐵軌聲，一張車票與行李從浪中浮起。'],
    ['無人船靠泊','沒有船員的黑船短暫靠近，只留下一張乘船證。'],
    ['鯨落花園','海面投射出深海花園的影像，一朵花穿過影像來到甲板。'],
    ['月亮背面的郵件','魚鉤拉起一只沒有開口的郵袋，封蠟是一輪黑月。'],
    ['夢境船錨','所有人短暫聽見夢中的潮聲，海上留下不屬於現實的船錨。'],
    ['海神王冠','巨大浪牆在船前分開，浪底閃過一枚王冠碎片。']
  ];

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  }

  function economy() {
    return window.COFFEE_SHIP_ECONOMY || null;
  }

  function modifiers() {
    return economy()?.fishingModifiers?.() || {
      fishingLuck:Math.max(1, Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.fishingLuck || 1)),
      pearlBonus:Math.max(1, Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.pearlBonus || 1)),
      bottleLuck:Math.max(0, Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.bottleLuck || 0))
    };
  }

  function eventChance() {
    const base = .27 + Math.min(.08, modifiers().bottleLuck * .25);
    return economy()?.eventChance?.(base,'special') ?? Math.min(.62, base * modifiers().fishingLuck);
  }

  function itemFromRow(row, group) {
    const [id,icon,name,category,rarity,weight,note] = row;
    const db = window.COFFEE_SHIP_DB;
    const source = db?.itemFromRow ? db.itemFromRow(row,group) : {
      id,icon,name,category,zone:category,rarity,quality:category,weight,note,kind:'treasure',group,
      price:Math.max(1,Math.round((({普通:6,常見:10,稀有:28,史詩:90,傳說:260,神話:900,世界級:5000})[rarity] || 10) * Math.max(1,weight || 1)))
    };
    const pearlBonus = modifiers().pearlBonus;
    const basePrice = Math.max(1, Number(source.price || economy()?.sellPrice?.(source) || 1));
    return {
      ...source,
      id,
      icon,
      name,
      category,
      rarity,
      quality:category,
      weight,
      note,
      kind:'treasure',
      group,
      v2:true,
      coffeePearlBonus:pearlBonus,
      coffeeEffectName:window.COFFEE_SHIP_COFFEE_EFFECT?.name || '',
      sellPrice:Math.max(1,Math.round(basePrice * pearlBonus)),
      at:Date.now()
    };
  }

  function combinedCarnivalPool() {
    return [...(window.COFFEE_SHIP_DB?.carnivalLoot || []),...CARNIVAL_EXTRA];
  }

  function combinedOceanPool() {
    return [...(window.COFFEE_SHIP_DB?.oceanLoot || []),...OCEAN_EXTRA];
  }

  function rarityRoll() {
    const luck = Math.min(2.1, modifiers().fishingLuck);
    const roll = 1 - Math.pow(1 - Math.random(),luck);
    if (roll > .9975) return '世界級';
    if (roll > .965) return '神話';
    if (roll > .86) return '傳說';
    if (roll > .64) return '史詩';
    if (roll > .34) return '稀有';
    if (roll > .12) return '常見';
    return '普通';
  }

  const RANK = {普通:0,常見:1,稀有:2,史詩:3,傳說:4,神話:5,世界級:6};

  function pickRow(pool) {
    const rarity = rarityRoll();
    let candidates = pool.filter(row => row[4] === rarity);
    if (!candidates.length) {
      const target = RANK[rarity] || 0;
      let nearest = Infinity;
      for (const row of pool) nearest = Math.min(nearest,Math.abs((RANK[row[4]] || 0) - target));
      candidates = pool.filter(row => Math.abs((RANK[row[4]] || 0) - target) === nearest);
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function addItems(rows, group, castId) {
    const bag = read(BAG_KEY,[]);
    const dex = read(DEX_KEY,{});
    const items = rows.map(row => {
      const item = {...itemFromRow(row,group),castId};
      bag.push(item);
      const previous = dex[item.id] || {};
      dex[item.id] = {
        name:item.name,icon:item.icon,category:item.category,rarity:item.rarity,
        count:Number(previous.count || 0) + 1,
        latestAt:Date.now(),
        bestValue:Math.max(Number(previous.bestValue || 0),Number(item.sellPrice || 0))
      };
      return item;
    });
    save(BAG_KEY,bag.slice(-MAX_BAG));
    save(DEX_KEY,dex);
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:group,items}}));
    return items;
  }

  function logEvent(category,title,items,castId) {
    const log = read(LOG_KEY,[]);
    log.unshift({category,title,items:items.map(item => item.name),castId,at:Date.now()});
    save(LOG_KEY,log.slice(0,80));
  }

  function dropCount(category) {
    const bonus = modifiers().fishingLuck;
    if (category === 'world') return Math.random() < .22 * bonus ? 2 : 1;
    const roll = Math.random();
    if (roll < .08 * bonus) return 3;
    if (roll < .38 * bonus) return 2;
    return 1;
  }

  function categoryPool(category) {
    if (category === 'ocean') return combinedOceanPool();
    if (category === 'carnival') return combinedCarnivalPool();
    if (category === 'world') return WORLD_LOOT;
    return SALVAGE_LOOT;
  }

  function categoryEvents(category) {
    if (category === 'ocean') return OCEAN_EVENTS;
    if (category === 'carnival') return CARNIVAL_EVENTS;
    if (category === 'world') return WORLD_EVENTS;
    return SALVAGE_EVENTS;
  }

  function chooseCategory(exclude = '') {
    const rows = [
      ['ocean',34],['salvage',35],['carnival',23],['world',8]
    ].filter(row => row[0] !== exclude);
    let roll = Math.random() * rows.reduce((sum,row) => sum + row[1],0);
    for (const [name,weight] of rows) {
      roll -= weight;
      if (roll <= 0) return name;
    }
    return rows[0][0];
  }

  function runCategory(category,castId) {
    const pool = categoryPool(category);
    const event = categoryEvents(category)[Math.floor(Math.random() * categoryEvents(category).length)];
    const rows = [];
    const used = new Set();
    const count = dropCount(category);
    for (let index = 0; index < count; index += 1) {
      let row = pickRow(pool);
      let attempts = 0;
      while (used.has(row[0]) && attempts < 8) {
        row = pickRow(pool);
        attempts += 1;
      }
      used.add(row[0]);
      rows.push(row);
    }
    const items = addItems(rows,category,castId);
    const total = items.reduce((sum,item) => sum + Number(item.sellPrice || 0),0);
    const labels = {ocean:'海洋朋友事件',carnival:'狂歡節漂流事件',salvage:'海上打撈事件',world:'世界奇遇'};
    const icons = {ocean:'🐢',carnival:'🎭',salvage:'⚓',world:'🌌'};
    const accents = {ocean:'#79d0b1',carnival:'#e9a6b0',salvage:'#d7bb79',world:'#9ce8f0'};
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({
      castId,
      eventId:`${category}:${event[0]}`,
      eventKind:'special',
      title:`${labels[category]}｜${event[0]}`,
      icon:icons[category],
      accent:accents[category],
      text:`${event[1]}\n獲得：${items.map(item => `${item.icon} ${item.name}［${item.rarity}］`).join('、')}\n預估總價值：🦪 ${total}`
    });
    logEvent(category,event[0],items,castId);
    return items;
  }

  function trigger(event) {
    if (Math.random() > eventChance()) return;
    const castId = event.detail?.castId || window.COFFEE_SHIP_FISHING_API?.getCurrentCastId?.();
    const first = chooseCategory();
    runCategory(first,castId);

    const secondaryChance = Math.min(.32,.12 * modifiers().fishingLuck + modifiers().bottleLuck * .15);
    if (Math.random() < secondaryChance) runCategory(chooseCategory(first),castId);
  }

  function init() {
    window.addEventListener('coffee-ship:fishing-result',trigger);
    window.COFFEE_SHIP_EXPANDED_EVENTS = {
      trigger,
      runCategory,
      pools:{
        ocean:combinedOceanPool,
        carnival:combinedCarnivalPool,
        salvage:() => SALVAGE_LOOT,
        world:() => WORLD_LOOT
      },
      events:{ocean:OCEAN_EVENTS,carnival:CARNIVAL_EVENTS,salvage:SALVAGE_EVENTS,world:WORLD_EVENTS},
      dex:() => read(DEX_KEY,{}),
      log:() => read(LOG_KEY,[]),
      version:1
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
