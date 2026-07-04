(() => {
  'use strict';

  const KEY = 'coffeeShipLanarLetters';
  const META = { icon:'🌊', series:'拉納爾漂流瓶', rarity:'史詩', count:30 };

  const LANAR_BOTTLES = [
    {number:1, chapter:'第一章：變異初見', creature:'百眼鮟鱇', className:'變異生物', title:'拉納爾漂流瓶 01｜百眼鮟鱇', text:'觀測編號 L-01。百眼鮟鱇的頭部與背脊分布著近百枚細小眼球，牠們不會同時眨動，而是依序追蹤水中的震動。牠會被發光蝦與緩慢晃動的餌吸引；收線過快，所有眼睛便會同時閉上，魚線也會在下一秒斷裂。這個物種確實能被釣起，但釣手必須忍受牠上鉤後仍從不同方向注視自己的感覺。'},
    {number:2, chapter:'第一章：變異初見', creature:'發光骷髏魚', className:'變異生物', title:'拉納爾漂流瓶 02｜發光骷髏魚', text:'觀測編號 L-02。發光骷髏魚的肌肉幾乎完全透明，只有骨骼會以藍白色節奏閃爍。燈光反而會使牠遠離，最有效的捕捉方式是在完全黑暗中垂下沒有反光的細鉤。牠離水後仍會閃爍數分鐘，頻率與附近生物的心跳一致。我懷疑那不是光，而是一種模仿生命的訊號。'},
    {number:3, chapter:'第一章：變異初見', creature:'毒刺河豚王', className:'變異生物', title:'拉納爾漂流瓶 03｜毒刺河豚王', text:'觀測編號 L-03。毒刺河豚王受驚時能膨脹到小艇大小，紫色毒刺會沿身體依序豎起。牠偏好帶有強烈鹽味的硬殼餌，上鉤後不可強拉，必須讓魚線保持鬆弛，等牠自行排出體內海水。捕獲個體即使平靜，刺尖仍會分泌麻痺性黏液。任何徒手觸碰的行為，都應被視為自願放棄手指。'},
    {number:4, chapter:'第一章：變異初見', creature:'深海鐮刀蝦', className:'變異生物', title:'拉納爾漂流瓶 04｜深海鐮刀蝦', text:'觀測編號 L-04。深海鐮刀蝦的前肢像兩把向內彎曲的刀，能在一瞬間切開普通魚線。牠常躲在礁縫等待金屬反光，使用帶鏈節的釣組反而容易引牠攻擊。上鉤後牠不是向外逃，而是沿著魚線往船上爬。真正的捕捉關鍵，不是把牠拉近，而是在牠抵達甲板前先準備好堅固容器。'},
    {number:5, chapter:'第一章：變異初見', creature:'黑洞烏賊', className:'變異生物', title:'拉納爾漂流瓶 05｜黑洞烏賊', text:'觀測編號 L-05。黑洞烏賊噴出的墨不會染黑海水，而會直接吸收附近光線，形成一塊看不見邊界的黑暗。牠對含鐵量高的隕石碎片有明顯反應，魚鉤必須藏在餌的中心。當浮標附近的星光突然消失，便代表牠已經接近。不要依靠眼睛判斷收線時機，要聽魚線發出的低鳴。'},

    {number:6, chapter:'第二章：巨型個體', creature:'腐化藍鯨', className:'變異生物', title:'拉納爾漂流瓶 06｜腐化藍鯨', text:'觀測編號 L-06。腐化藍鯨的體表覆蓋黑色結晶，傷口中流出的不是血，而是帶有金屬氣味的深藍液體。牠的重量遠超任何正常藍鯨，普通船隻只會被拖入海中。遊戲紀錄證明牠能被釣獲，但那更接近一場船與生物之間的拔河。牠浮上海面時，周圍所有魚群都會朝相反方向逃散。'},
    {number:7, chapter:'第二章：巨型個體', creature:'海淵蛇皇', className:'變異生物', title:'拉納爾漂流瓶 07｜海淵蛇皇', text:'觀測編號 L-07。海淵蛇皇會纏繞海流，使附近浮標呈圓形旋轉。牠對活鰻與銀色長餌反應最強，上鉤後會沿魚線盤旋，試圖將整條線扭成結。牠頭頂的骨冠不是裝飾，而是感知壓力差的器官。若水面突然形成沒有風的漩渦，應立即放長魚線，否則被拖走的可能不只是漁獲。'},
    {number:8, chapter:'第二章：巨型個體', creature:'星核蝶魚', className:'變異生物', title:'拉納爾漂流瓶 08｜星核蝶魚', text:'觀測編號 L-08。星核蝶魚只有手掌大小，體內卻有一顆像微型恆星般發光的核心。牠每次擺動魚鰭，周圍海水都會短暫升溫。以隕石粉末包裹小鉤，可以提高牠接近的機率。捕獲後必須讓容器保持流動水，否則核心會逐漸變亮，直到整個容器像白晝一樣刺眼。'},
    {number:9, chapter:'第二章：巨型個體', creature:'血月水母王', className:'變異生物', title:'拉納爾漂流瓶 09｜血月水母王', text:'觀測編號 L-09。血月水母王只在月色呈紅時靠近海面，傘體內能看見如血管般流動的光。牠幾乎不追餌，只會被保持靜止的紅色浮標吸引。上鉤時沒有拉力，釣手只會感覺魚線突然變重。最危險的是牠的觸手會沿著濕潤魚線傳導麻痺，因此收線前必須保持手套乾燥。'},
    {number:10, chapter:'第二章：巨型個體', creature:'詛咒寄居蟹', className:'變異生物', title:'拉納爾漂流瓶 10｜詛咒寄居蟹', text:'觀測編號 L-10。詛咒寄居蟹不使用貝殼，而會選擇沉船上的金屬器物作為外殼。已觀察到牠背著頭盔、茶壺與小型保險箱移動。帶有鏽蝕氣味的餌最容易引牠上鉤，但拉起時必須連同外殼一起計算重量。若牠在甲板上突然離開原本的殼，請立刻檢查附近是否有更昂貴的物品失蹤。'},

    {number:11, chapter:'第三章：深淵習性', creature:'深海夢魘鰻', className:'變異生物', title:'拉納爾漂流瓶 11｜深海夢魘鰻', text:'觀測編號 L-11。深海夢魘鰻會釋放低頻震動，使附近生物進入短暫睡眠。釣手常在等待時失去意識，醒來才發現魚竿已被拖向海中。將小鈴固定在手腕與魚竿之間，可以在牠上鉤時喚醒自己。牠被拉出水面後仍會讓人看見最害怕的夢，因此不建議獨自處理。'},
    {number:12, chapter:'第三章：深淵習性', creature:'虛空鯨', className:'變異生物', title:'拉納爾漂流瓶 12｜虛空鯨', text:'觀測編號 L-12。聲納無法偵測虛空鯨，儀器只會顯示一塊完全沒有回音的區域。牠靠近時，海面上的倒影會先消失。一般魚餌對牠無效，只有被黑暗包覆的發光餌能引起反應。釣獲過程中，魚線看似垂直不動，實際上整艘船正被牠緩慢拖行。'},
    {number:13, chapter:'第三章：深淵習性', creature:'百眼鮟鱇', className:'變異生物', title:'拉納爾漂流瓶 13｜百眼鮟鱇的集體視線', text:'觀測編號 L-13。第二次遇見百眼鮟鱇時，我發現牠們會共享視覺。只要其中一隻看到魚鉤，附近個體便會同時轉向。這代表一次下鉤可能吸引整群，也可能使整群一起逃離。最穩定的方式，是讓餌像受傷小魚般間歇移動，並在第一隻咬鉤後立刻收線，不要等待第二次拉扯。'},
    {number:14, chapter:'第三章：深淵習性', creature:'發光骷髏魚', className:'變異生物', title:'拉納爾漂流瓶 14｜骨光魚群', text:'觀測編號 L-14。發光骷髏魚成群移動時，骨骼的閃爍會組成看似文字的圖案。牠們會圍繞沉入海中的白骨，像在辨認失去的同類。使用骨白色假餌能釣到個體，但魚群會在同伴離水後停止發光。那一刻海底完全黑暗，只有被釣起的那隻仍在船上閃爍。'},
    {number:15, chapter:'第三章：深淵習性', creature:'毒刺河豚王', className:'變異生物', title:'拉納爾漂流瓶 15｜河豚王的警戒圈', text:'觀測編號 L-15。毒刺河豚王會在巢穴周圍吹出一圈又一圈氣泡，任何穿過氣泡圈的生物都會遭到攻擊。把餌停在最外層，牠會主動游出警戒區咬鉤。不要把鉤送進圈內，因為那通常會引來不只一隻。牠們膨脹後彼此碰撞，足以直接撞翻小船。'},

    {number:16, chapter:'第四章：捕捉技術', creature:'深海鐮刀蝦', className:'變異生物', title:'拉納爾漂流瓶 16｜不應使用纖維線', text:'觀測編號 L-16。經過三次斷線後，我確認深海鐮刀蝦能辨認纖維材質，並優先切割受力點。短鏈節加上柔性金屬前導線最有效，餌則應固定得足夠鬆，讓牠誤以為那是沉船上的碎片。牠第一次攻擊通常只是在測試，第二次才會真正咬住。過早揚竿，只會留下一條被切得非常整齊的線。'},
    {number:17, chapter:'第四章：捕捉技術', creature:'黑洞烏賊', className:'變異生物', title:'拉納爾漂流瓶 17｜消失的浮標', text:'觀測編號 L-17。黑洞烏賊不會把浮標拖進水裡，而會讓浮標周圍的光先消失。當你看不見浮標時，不代表它沉了，而代表牠已把觸手纏上魚線。此時應閉眼收線，避免被黑暗中的方向感欺騙。我曾睜眼操作，結果明明朝船內拉，魚線卻從背後滑入海中。'},
    {number:18, chapter:'第四章：捕捉技術', creature:'腐化藍鯨', className:'變異生物', title:'拉納爾漂流瓶 18｜藍鯨的低鳴', text:'觀測編號 L-18。腐化藍鯨咬鉤前會發出極低頻的鳴聲，船艙裡的玻璃會先出現裂紋。牠並不把餌當作食物，而像是在回應某種挑戰。若真的決定揚竿，應先固定船上所有物品，並確保魚線能在極端拉力下釋放。捕捉牠不是力量競賽，而是判斷何時可以拉、何時必須讓牠帶走整片海。'},
    {number:19, chapter:'第四章：捕捉技術', creature:'海淵蛇皇', className:'變異生物', title:'拉納爾漂流瓶 19｜逆著漩渦收線', text:'觀測編號 L-19。海淵蛇皇上鉤後會製造順時針漩渦，使普通釣手下意識跟著旋轉。真正有效的做法是以相反方向緩慢收線，讓牠自己的身體解開纏繞。速度不能快，否則骨冠會割傷魚線。當漩渦突然停止時，牠通常已來到船底，下一次拉扯會直接向下。'},
    {number:20, chapter:'第四章：捕捉技術', creature:'星核蝶魚', className:'變異生物', title:'拉納爾漂流瓶 20｜核心過熱', text:'觀測編號 L-20。星核蝶魚上鉤後會迅速提高體內核心溫度，企圖燒斷魚線。浸過深海冷泉水的線材能延緩這個過程。牠被拉近水面時會像一顆上升的星，周圍小魚全被照亮。必須在核心變成純白前完成捕獲，否則牠會放棄魚鉤，瞬間鑽回深水。'},

    {number:21, chapter:'第五章：異常效應', creature:'血月水母王', className:'變異生物', title:'拉納爾漂流瓶 21｜紅月潮汐', text:'觀測編號 L-21。血月水母王出現時，附近潮位會短暫升高，像整片海都受到牠的呼吸控制。牠被釣起後，紅色月光仍會停留在傘體內，即使天空已恢復正常。多名釣手聲稱聽見牠發出類似歌聲的震動，但錄音設備沒有留下任何聲音。也許那首歌只存在於接觸牠的人的骨頭裡。'},
    {number:22, chapter:'第五章：異常效應', creature:'詛咒寄居蟹', className:'變異生物', title:'拉納爾漂流瓶 22｜會更換主人的殼', text:'觀測編號 L-22。被捕獲的詛咒寄居蟹會在無人注視時更換外殼。第一次是從鐵杯換進羅盤，第二次則躲進一只上鎖的盒子。奇怪的是，被牠使用過的物品之後都會指向同一個海域。若你釣到牠，請不要把最重要的東西留在容器旁，牠似乎特別喜歡帶走具有回憶的物品。'},
    {number:23, chapter:'第五章：異常效應', creature:'深海夢魘鰻', className:'變異生物', title:'拉納爾漂流瓶 23｜共同夢境', text:'觀測編號 L-23。三名同時處理深海夢魘鰻的船員，醒來後描述了完全相同的夢：一艘沒有人的船正在黑海上航行。這表示牠的影響不是單純毒素，而可能讓附近生物進入同一個夢境。捕捉時應保持至少一人清醒，並持續報時。若所有人同時安靜，立刻切斷魚線。'},
    {number:24, chapter:'第五章：異常效應', creature:'虛空鯨', className:'變異生物', title:'拉納爾漂流瓶 24｜被抹去的重量', text:'觀測編號 L-24。虛空鯨被拉近船側時，秤具顯示的重量會在零與極大數值之間跳動。牠似乎不完全存在於同一片海域。魚鉤明明掛在口部，魚線卻像從數百公尺外的另一個方向受力。成功釣獲後，甲板上會留下一塊沒有倒影的濕痕，數小時後才逐漸恢復。'},
    {number:25, chapter:'第五章：異常效應', creature:'百眼鮟鱇', className:'變異生物', title:'拉納爾漂流瓶 25｜最大的那一隻', text:'觀測編號 L-25。我遇見一隻體型遠超其他個體的百眼鮟鱇，牠身上的眼睛不是看向外界，而全都盯著自己口中的光餌。當我的魚鉤接近，牠所有眼球才同時轉向我。牠能被釣上來，但離水後仍持續盯著海面，像真正令牠恐懼的東西還留在更深處。'},

    {number:26, chapter:'第六章：最高警戒', creature:'黑洞烏賊', className:'變異生物', title:'拉納爾漂流瓶 26｜幼體不是幼小個體', text:'觀測編號 L-26。所謂黑洞烏賊幼體，並不是較小的成體，而是一團尚未形成固定形狀的黑暗。牠會沿著魚線向上移動，途中逐漸長出觸手。捕捉成功後必須持續提供微弱光源，讓牠維持邊界。若容器內完全熄燈，下一次打開時，容器可能仍在，裡面的空間卻已經不見。'},
    {number:27, chapter:'第六章：最高警戒', creature:'腐化藍鯨', className:'變異生物', title:'拉納爾漂流瓶 27｜十萬公斤個體', text:'觀測編號 L-27。今日釣獲紀錄顯示，一頭腐化藍鯨的重量突破十萬公斤。牠上鉤時沒有掙扎，只是繼續向前游，直到整艘船被拖離原航線。真正讓牠浮上來的不是釣力，而是牠主動回頭看了我們一眼。我無法確定這算捕獲，還是牠允許我們短暫相信自己成功了。'},
    {number:28, chapter:'第六章：最高警戒', creature:'虛空鯨', className:'變異生物', title:'拉納爾漂流瓶 28｜第二頭虛空鯨', text:'觀測編號 L-28。第二頭虛空鯨出現時，第一頭的捕獲紀錄從航海日誌中消失了，只剩我仍記得。牠們或許會互相取代，讓世界只容許一頭存在。釣起這個物種後，務必立刻留下多份紀錄，分開存放。若所有紀錄都只寫著空白，代表牠可能再次回到了海中。'},
    {number:29, chapter:'第六章：最高警戒', creature:'變異生物群', className:'變異生物', title:'拉納爾漂流瓶 29｜同步上鉤', text:'觀測編號 L-29。今晚，百眼鮟鱇、星核蝶魚與發光骷髏魚在同一時間咬住不同釣線。牠們原本沒有共同棲地，卻以完全相同的節奏掙扎。深海似乎存在某種能同時控制變異生物的訊號。三條線最後一起斷裂，斷口平滑得像被同一把刀切過。我開始懷疑，這些變異不是彼此獨立的事件。'},
    {number:30, chapter:'第六章：最高警戒', creature:'克蘇魯之眼', className:'世界級生物', title:'拉納爾漂流瓶 30｜克蘇魯之眼', text:'世界級觀測編號 W-01。克蘇魯之眼不是一隻完整生物，而像某個龐大存在透過深海向上觀看的器官。牠能被魚鉤捕捉，卻無法判定究竟是釣手拉住了牠，還是牠反過來連接了釣手。上鉤後，海面會失去地平線，重量讀數固定在儀器上限。若你真的把牠拉出水面，不要凝視瞳孔，也不要相信其中倒映出的那艘船就是自己的船。'}
  ];

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch (error) { return fallback; }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function canonicalNumber(value, fallback = 1) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 1) return ((Math.floor(parsed) - 1) % META.count) + 1;
    return ((fallback - 1) % META.count) + 1;
  }

  function numberFromEntry(entry, fallback) {
    if (entry && Number.isFinite(Number(entry.lanarIndex))) return canonicalNumber(entry.lanarIndex, fallback);
    const match = String(entry?.title || '').match(/(?:漂流瓶\s*)?(\d{1,3})/);
    return match ? canonicalNumber(match[1], fallback) : canonicalNumber(fallback, 1);
  }

  function entryFor(number, original = {}) {
    const base = LANAR_BOTTLES[canonicalNumber(number) - 1];
    return {
      ...original,
      ...base,
      icon:META.icon,
      series:META.series,
      rarity:META.rarity,
      lanarIndex:base.number,
      lanarCompleteSeries:true,
      at:original.at || Date.now()
    };
  }

  function normalizeLanar() {
    const list = read(KEY, []);
    if (!Array.isArray(list)) return;
    const seen = new Set();
    const next = [];
    list.forEach((entry, index) => {
      if (!entry || typeof entry !== 'object') return;
      const number = numberFromEntry(entry, index + 1);
      if (seen.has(number)) return;
      seen.add(number);
      next.push(entryFor(number, entry));
    });
    if (JSON.stringify(list) !== JSON.stringify(next)) save(KEY, next.slice(-120));
  }

  function nextBottleNumber(list) {
    const collected = new Set(list.map((entry, index) => numberFromEntry(entry, index + 1)));
    for (let number = 1; number <= META.count; number += 1) {
      if (!collected.has(number)) return number;
    }
    return 1 + Math.floor(Math.random() * META.count);
  }

  function createLanarBottle() {
    const list = read(KEY, []);
    const safeList = Array.isArray(list) ? list : [];
    const entry = entryFor(nextBottleNumber(safeList));
    safeList.push(entry);
    save(KEY, safeList.slice(-120));
    return entry;
  }

  function patchBottleRestore() {
    const restore = window.COFFEE_SHIP_BOTTLE_RESTORE;
    if (!restore) return;
    if (restore.META?.lanar) Object.assign(restore.META.lanar, META);
    if (restore.STORE) restore.STORE.lanar = KEY;
    restore.lanarCompleteSeries = LANAR_BOTTLES;
    const current = restore.createFullBottle;
    if (typeof current === 'function' && !current.__lanarThirtyPatched) {
      const original = current;
      const wrapped = function(type) {
        return type === 'lanar' ? createLanarBottle() : original.call(this, type);
      };
      wrapped.__lanarThirtyPatched = true;
      restore.createFullBottle = wrapped;
    }
  }

  function patchBottleCore() {
    const core = window.COFFEE_SHIP_BOTTLE_CORE;
    if (!core) return;
    if (core.bottleSeries?.[KEY]) Object.assign(core.bottleSeries[KEY], META);
    const current = core.createBottle;
    if (typeof current === 'function' && !current.__lanarThirtyPatched) {
      const original = current;
      const wrapped = function(key, title, text) {
        const signature = `${key || ''} ${title || ''} ${text || ''}`;
        if (/coffeeShipLanarLetters|Lanar|拉納爾/.test(signature)) return createLanarBottle();
        return original.call(this, key, title, text);
      };
      wrapped.__lanarThirtyPatched = true;
      core.createBottle = wrapped;
    }
  }

  function patchDatabase() {
    const db = window.COFFEE_SHIP_DB;
    if (!db) return;
    if (Array.isArray(db.bottles)) {
      let found = false;
      db.bottles = db.bottles.map(row => {
        if (!Array.isArray(row) || row[0] !== 'lanar') return row;
        found = true;
        return ['lanar', META.icon, META.series, META.rarity, LANAR_BOTTLES[0].text];
      });
      if (!found) db.bottles.push(['lanar', META.icon, META.series, META.rarity, LANAR_BOTTLES[0].text]);
    }
    db.lanarBottles = LANAR_BOTTLES;
    db.createLanarBottle = createLanarBottle;
    const currentAdd = db.addBottle;
    if (typeof currentAdd === 'function' && !currentAdd.__lanarThirtyPatched) {
      const original = currentAdd;
      const wrapped = function(bottle) {
        return bottle?.id === 'lanar' ? createLanarBottle() : original.call(this, bottle);
      };
      wrapped.__lanarThirtyPatched = true;
      db.addBottle = wrapped;
    }
  }

  function patchVisibleCard() {
    const card = document.getElementById('centralFishResultCard');
    if (!card || card.classList.contains('hidden') || !/拉納爾漂流瓶/.test(card.textContent || '')) return;
    const match = (card.textContent || '').match(/拉納爾漂流瓶\s*(\d+)/);
    const list = read(KEY, []);
    const number = match ? canonicalNumber(match[1]) : nextBottleNumber(Array.isArray(list) ? list : []);
    const entry = entryFor(number);
    const title = card.querySelector('.central-fish-title');
    const detail = card.querySelector('.central-fish-detail');
    if (title) title.textContent = `${META.icon} ${entry.title}`;
    if (detail) detail.innerHTML = `類型：瓶中信<br>分類：${entry.className}<br>紀錄生物：${entry.creature}<br>稀有度：${entry.rarity}<br><br>${entry.text}`;
  }

  function patchRuntime() {
    patchBottleRestore();
    patchBottleCore();
    patchDatabase();
    patchVisibleCard();
  }

  function init() {
    normalizeLanar();
    patchRuntime();
    const observer = new MutationObserver(() => {
      normalizeLanar();
      patchVisibleCard();
    });
    observer.observe(document.body, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:['class'] });
    setInterval(() => {
      normalizeLanar();
      patchRuntime();
    }, 1200);
  }

  window.COFFEE_SHIP_LANAR_SERIES = {
    META,
    LANAR_BOTTLES,
    getEntry:number => entryFor(number),
    createLanarBottle,
    normalizeLanar
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();