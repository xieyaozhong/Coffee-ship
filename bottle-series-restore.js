(() => {
  'use strict';
  if (window.__COFFEE_SHIP_BOTTLE_RESTORE_V5__) return;
  window.__COFFEE_SHIP_BOTTLE_RESTORE_V5__ = true;

  const STORE = {
    joke:'coffeeShipBottleLetters',lanar:'coffeeShipLanarLetters',ariel:'coffeeShipArielLetters',
    island:'coffeeShipIslandLetters',blackbeard:'coffeeShipBlackbeardLetters',priest:'coffeeShipMadPriestLetters',
    carnival:'coffeeShipCarnivalLetters',turtle:'coffeeShipTurtleSoupLetters'
  };

  const META = {
    joke:{icon:'📚',series:'迷因百科',rarity:'稀有',count:50,color:'#9ce8f0'},
    lanar:{icon:'🌊',series:'拉納爾漂流瓶',rarity:'史詩',count:30},
    ariel:{icon:'🧜‍♀️',series:'愛麗兒漂流瓶',rarity:'史詩',count:30},
    island:{icon:'🏝️',series:'可可漂流瓶',rarity:'稀有',count:30},
    blackbeard:{icon:'🏴‍☠️',series:'黑鬍子藏寶圖',rarity:'傳說',count:10},
    priest:{icon:'📜',series:'瘋狂神父殘頁',rarity:'傳說',count:30},
    carnival:{icon:'🎭',series:'狂歡島漂流瓶',rarity:'史詩',count:30},
    turtle:{icon:'🍲',series:'海龜湯神秘故事',rarity:'神話',count:10}
  };

  const MEMES = [{"id":"doge","category":"經典角色","name":"Doge","origin":"源自一張柴犬 Kabosu 側眼看鏡頭的照片，後來搭配彩色 Comic Sans 文字流行。","usage":"用來表現天真、自信或故意不合語法的內心旁白。","note":"看到短句以 wow、such、very 交錯排列，通常就是 Doge 語法。"},{"id":"distracted_boyfriend","category":"情境圖","name":"分心男友","origin":"一張男子回頭看另一名女子、女友露出不滿表情的素材照。","usage":"把三個角色標成「原本選擇」「新誘惑」「被誘惑的人」，用來表現注意力轉移。","note":"重點不是感情，而是三角關係中的選擇與誘惑。"},{"id":"drake_hotline_bling","category":"對比格式","name":"Drake 拒絕／接受","origin":"取自音樂錄影帶中一組拒絕與滿意的連續畫面。","usage":"上格放不想要的選項，下格放偏好的選項，形成最直接的二選一。","note":"適合比較兩種做法，不必真的和音樂有關。"},{"id":"this_is_fine","category":"反應圖","name":"This Is Fine","origin":"漫畫中的狗坐在燃燒房間裡，仍說一切都很好。","usage":"用來描述明明情況失控，當事人卻選擇裝作平靜。","note":"常見於截止日前、系統故障或問題已經無法忽視的時刻。"},{"id":"woman_yelling_cat","category":"對話格式","name":"女人吼貓","origin":"左側是激動指責的女子，右側是坐在餐桌前表情困惑的白貓。","usage":"把左邊當成強烈指控，右邊當成無辜或答非所問的回應。","note":"兩張原本無關的圖片，被網友拼成了經典爭論場景。"},{"id":"expanding_brain","category":"分級格式","name":"腦容量擴張","origin":"由普通大腦一路變成發光宇宙腦的多格圖。","usage":"把想法從普通排到荒謬、超然或自認高明的最高境界。","note":"最後一格不一定真的最聰明，反而常是最離譜的選項。"},{"id":"two_buttons","category":"選擇困難","name":"兩個按鈕","origin":"一名流汗角色面對兩個難以取捨的紅色按鈕。","usage":"用來呈現兩個都想選、都不想選，或彼此矛盾的選項。","note":"按鈕文字越簡短，衝突越清楚。"},{"id":"change_my_mind","category":"挑戰格式","name":"Change My Mind","origin":"一名男子坐在桌前，牌子上寫著一個主張並邀請別人反駁。","usage":"用來故意提出強烈觀點，通常帶有玩笑或挑戰意味。","note":"把主張寫在牌子區域，結尾保留「改變我的想法」的語氣。"},{"id":"surprised_pikachu","category":"反應圖","name":"驚訝皮卡丘","origin":"皮卡丘張嘴露出意外表情的動畫截圖。","usage":"當某人做了必然導致結果的事，結果發生後卻還很驚訝時使用。","note":"笑點來自「明明早就能預料」。"},{"id":"is_this_a_pigeon","category":"誤認格式","name":"這是鴿子嗎？","origin":"動畫角色指著蝴蝶，卻問它是不是鴿子。","usage":"用來嘲諷錯誤分類、誤解概念或把任何東西都叫成同一名稱。","note":"常把角色標成誤解者、蝴蝶標成被誤認的事物。"},{"id":"one_does_not_simply","category":"經典台詞","name":"One Does Not Simply","origin":"電影角色抬手發言的畫面，搭配「不是簡單地……就能……」句型。","usage":"強調某件看似簡單的事情其實困難重重。","note":"適合用在除錯、早睡、準時或任何說起來容易的目標。"},{"id":"success_kid","category":"勝利反應","name":"成功小孩","origin":"一名握拳小孩露出堅定表情的照片。","usage":"表示小型勝利、意外成功，或事情比預期順利。","note":"配文通常先描述危機，再用第二句揭示成功結果。"},{"id":"hide_the_pain_harold","category":"苦笑反應","name":"隱藏痛苦的 Harold","origin":"一名長者帶著禮貌笑容，但眼神顯得勉強。","usage":"用來表現表面微笑、內心疲憊或無奈接受現實。","note":"最適合那些「我很好」但其實完全不好的時刻。"},{"id":"roll_safe","category":"自以為聰明","name":"Roll Safe","origin":"角色用手指敲太陽穴，像是在展示高明計畫。","usage":"搭配表面有邏輯、實際上很荒謬的解法。","note":"句型常是「只要不做 X，就不會遇到 X 的問題」。"},{"id":"disaster_girl","category":"災難反應","name":"災難女孩","origin":"女孩回頭微笑，背景是一棟正在燃燒的房屋。","usage":"暗示角色可能知道災難原因，或對混亂結果感到滿意。","note":"常用於完成惡作劇、改壞程式或看著計畫失控。"},{"id":"mocking_spongebob","category":"模仿語氣","name":"嘲諷海綿寶寶","origin":"角色彎著身體、表情怪異的動畫畫面。","usage":"把別人的話改成大小寫交錯或刻意幼稚的語氣，表示嘲諷模仿。","note":"重點是重複對方說法，而不是提出新論點。"},{"id":"gru_plan","category":"四格反轉","name":"Gru 的計畫","origin":"角色依序展示計畫板，最後發現其中一步導致尷尬反轉。","usage":"前三格建立自信計畫，最後一格重複錯誤結果並露出困惑。","note":"非常適合描述自己寫程式時親手製造的 bug。"},{"id":"ancient_aliens","category":"陰謀反應","name":"古代外星人","origin":"節目來賓張開雙手，畫面常配上「外星人」字樣。","usage":"當問題沒有證據卻被用單一神秘答案解釋時使用。","note":"可以把「外星人」替換成任何過度簡化一切的原因。"},{"id":"uno_draw_25","category":"兩難選擇","name":"UNO 抽 25 張","origin":"玩家必須完成某件事，否則就要抽很多張牌。","usage":"表示寧願接受巨大代價，也不願做一件看似簡單的事情。","note":"牌上的命令越普通，拒絕它的荒謬感越強。"},{"id":"bernie_mittens","category":"人物剪貼","name":"伯尼手套","origin":"一名穿外套、戴手套坐在椅子上的人物照片被大量剪貼到各種場景。","usage":"用來表現安靜旁觀、提早到場或對熱鬧保持距離。","note":"笑點通常來自他在任何場景中都保持同一個坐姿。"},{"id":"coffin_dance","category":"音樂迷因","name":"抬棺舞","origin":"抬棺舞者配合電子音樂的影片片段，常接在危險行為之後。","usage":"用來預告失敗、翻車或角色即將為錯誤決定付出代價。","note":"通常在意外發生前切入，形成黑色幽默的結果提示。"},{"id":"rickroll","category":"惡作劇連結","name":"Rickroll","origin":"以看似正常的連結，引導對方看到特定音樂影片。","usage":"屬於網路誘導惡作劇，重點是讓點擊者發現自己被騙。","note":"成功的 Rickroll 必須讓連結在點開前看不出真正內容。"},{"id":"keyboard_cat","category":"動物影片","name":"Keyboard Cat","origin":"貓咪像在彈電子琴的影片，後來常被放在失敗片段結尾。","usage":"用輕快演奏替尷尬場面收尾，像是舞台工作人員把失敗者送走。","note":"可理解成網路版的「好了，下一位」。"},{"id":"nyan_cat","category":"循環動畫","name":"Nyan Cat","origin":"像素貓以點心身體飛過太空，身後留下彩虹軌跡。","usage":"代表早期網路的循環動畫、洗腦音樂與無目的可愛感。","note":"常被用來營造復古網路氣氛或長時間循環挑戰。"},{"id":"trollface","category":"表情角色","name":"Trollface","origin":"誇張壞笑的黑白線條臉，代表刻意挑釁與惡作劇。","usage":"表示發言者故意讓別人生氣，或以「我就是故意的」收尾。","note":"它是早期網路表情漫畫文化的重要代表。"},{"id":"pepe","category":"表情角色","name":"Pepe the Frog","origin":"一隻青蛙角色被網友改編成大量情緒版本。","usage":"可表現悲傷、得意、尷尬或疲倦，實際語氣取決於版本。","note":"同一角色可能有完全不同的社群含義，使用時要看上下文。"},{"id":"wojak","category":"表情角色","name":"Wojak","origin":"簡單線條人物臉，被延伸成許多生活狀態與人格版本。","usage":"用來把抽象族群、情緒或生活處境角色化。","note":"常與其他角色並列，形成觀點或生活方式的對照。"},{"id":"gigachad","category":"人物反應","name":"Gigachad","origin":"經過強烈黑白處理的健壯男性形象。","usage":"代表極度自信、理想化強者，或故意誇張的完美表現。","note":"有時是稱讚，有時是反諷，取決於配文是否認真。"},{"id":"chad_vs_virgin","category":"對比格式","name":"Chad 與 Virgin","origin":"兩個誇張角色並列，比較自信派與畏縮派的差異。","usage":"把兩種做法塑造成強烈反差，通常刻意偏袒其中一方。","note":"內容常是主觀玩笑，不是真正的人格評價。"},{"id":"press_f","category":"遊戲語言","name":"Press F","origin":"來自遊戲中要求玩家按鍵致意的互動提示。","usage":"在留言中輸入 F，表示對失敗、損失或尷尬事件致意。","note":"通常帶有半認真、半玩笑的哀悼語氣。"},{"id":"npc","category":"網路角色","name":"NPC","origin":"借用遊戲中的非玩家角色概念，形容行為或台詞高度重複。","usage":"用來吐槽某人像只會照固定腳本反應。","note":"拿來標籤真人可能帶有貶義，遊戲內最好用於自嘲或虛構角色。"},{"id":"pov","category":"敘事格式","name":"POV","origin":"原意是視角，短影片與迷因中常用來設定觀眾正在經歷的場景。","usage":"在開頭寫「POV：」後描述一個第一人稱情境。","note":"真正嚴格的視角和網路用法不一定相同，重點是快速建立代入感。"},{"id":"starter_pack","category":"清單格式","name":"Starter Pack","origin":"把某類人、活動或生活情境的典型物品排成一組。","usage":"用幾個代表性元素快速概括一種風格或刻板印象。","note":"好的 Starter Pack 不必文字很多，但每個物件都要有辨識度。"},{"id":"nobody","category":"空白對話","name":"Nobody:","origin":"先寫「沒有人：」並保持空白，再描述某人突然做出沒人要求的事。","usage":"用來強調行為完全自發、突兀或過度投入。","note":"空白本身就是笑點的一部分，不需要真的補上任何台詞。"},{"id":"me_and_the_boys","category":"群體反應","name":"Me and the Boys","origin":"一群角色並肩出現，搭配朋友們準備一起做某件事的文字。","usage":"用來描述團體行動、童年回憶或大家一起做傻事。","note":"通常帶有復古、兄弟感與集體失控的氣氛。"},{"id":"same_picture","category":"職場反應","name":"它們是同一張圖","origin":"角色被要求找出兩張圖的差異，最後回答它們其實一樣。","usage":"用來指出兩個看似不同的東西本質相同。","note":"適合比較改名前後、包裝不同但功能一樣的事物。"},{"id":"always_has_been","category":"宇宙反轉","name":"一直都是如此","origin":"太空人發現真相，另一名太空人從背後用武器回應「一直都是」。","usage":"用來揭示一個其實早就存在、只是現在才被發現的事實。","note":"第二句通常平靜到和重大發現形成反差。"},{"id":"trade_offer","category":"交換格式","name":"Trade Offer","origin":"角色提出交換條件，畫面列出「我得到」與「你得到」。","usage":"把不公平、荒謬或極度划算的交換條件明確列出。","note":"常用於朋友互動、遊戲交易和工作分配。"},{"id":"how_it_started","category":"前後對照","name":"開始時／現在","origin":"把事情剛開始的狀態和後來的結果並排。","usage":"展示成長、惡化、反轉或完全偏離原計畫。","note":"兩張圖差異越大，故事感越強。"},{"id":"tell_me_without_telling","category":"語句挑戰","name":"不用直接說","origin":"要求別人不要直接說出答案，而是用特徵證明。","usage":"常用句型是「不用告訴我你是 X，告訴我你是 X」。","note":"回覆通常是一個足以暴露身分或習慣的細節。"},{"id":"main_character","category":"網路用語","name":"主角能量","origin":"把日常行為想像成電影主角的片段。","usage":"表示某人很有存在感、沉浸在自己的故事，或刻意營造戲劇氛圍。","note":"可以是稱讚，也可以用來提醒別忘了其他人也有自己的故事。"},{"id":"let_him_cook","category":"網路用語","name":"讓他繼續煮","origin":"把創作、推理或計畫比喻成做菜，先別打斷正在發揮的人。","usage":"當某人的想法看似奇怪但可能有成果時，用來表示繼續觀察。","note":"若最後成果失敗，也常反過來說「不該讓他煮」。"},{"id":"side_eye","category":"反應用語","name":"側眼","origin":"用側視與懷疑表情回應可疑、尷尬或不合理的言行。","usage":"不必正面反駁，只用眼神表示「我有看到，而且不太相信」。","note":"加上「強烈側眼」會把懷疑程度放大。"},{"id":"red_flag","category":"警示用語","name":"紅旗","origin":"把值得警覺的行為或特徵稱為紅旗。","usage":"用來提醒關係、工作或交易中可能存在問題。","note":"迷因常把非常小的習慣誇張成紅旗，形成幽默。"},{"id":"touch_grass","category":"網路用語","name":"去摸草","origin":"勸一個過度沉迷網路爭論的人離開螢幕、回到現實生活。","usage":"通常帶有吐槽意味，意思接近「先休息一下」。","note":"對陌生人使用可能顯得不友善，自嘲時最安全。"},{"id":"copium","category":"混成詞","name":"Copium","origin":"由 cope 與 opium 組成的網路詞，想像成讓人接受失敗的虛構氣體。","usage":"用來吐槽某人為不理想結果尋找安慰性解釋。","note":"常搭配吸入面罩或氣瓶圖像。"},{"id":"based","category":"網路用語","name":"Based","origin":"表示某人不怕反對、直接表達立場，後來也常被用作簡短稱讚。","usage":"回應一個大膽、真誠或符合自己觀點的說法。","note":"它的語氣高度依賴社群，上下文比字面意思重要。"},{"id":"ratio","category":"社群機制","name":"Ratio","origin":"當回覆獲得的互動遠高於原貼文時，用來表示原發言不受支持。","usage":"有人會直接回覆「ratio」挑戰互動數量。","note":"它描述的是社群反應，不代表論點一定正確。"},{"id":"brainrot","category":"網路用語","name":"Brain Rot","origin":"形容某種內容反覆出現在腦中，讓人停不下來引用或模仿。","usage":"用來自嘲自己被短影片、口頭禪或特定角色洗腦。","note":"通常不是醫學用語，而是對高度重複網路內容的誇張說法。"},{"id":"meme_lifecycle","category":"百科概念","name":"迷因生命週期","origin":"一個格式通常經歷出現、擴散、變體、過度使用、沉寂與懷舊復活。","usage":"用來理解為什麼同一張圖會突然爆紅，又在幾週後消失。","note":"迷因不一定真正死亡，它可能換一個語境重新出現。"}];

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  }

  function providerFor(type) {
    return window.COFFEE_SHIP_BOTTLE_PROVIDERS?.[type] || null;
  }

  function clamp(number, count) {
    return ((Number(number || 1) - 1) % count + count) % count + 1;
  }

  function memeEntry(number, at=Date.now()) {
    const index = clamp(number, MEMES.length);
    const meme = MEMES[index - 1];
    return {
      id:`meme_${meme.id}`,
      memeId:meme.id,
      memeEncyclopedia:true,
      number:index,
      category:meme.category,
      title:`迷因百科 ${String(index).padStart(2,'0')}｜${meme.name}`,
      text:`【類型】${meme.category}\n【起源】${meme.origin}\n【常見用法】${meme.usage}\n【百科備註】${meme.note}`,
      icon:META.joke.icon,
      series:META.joke.series,
      rarity:META.joke.rarity,
      sellPrice:65,
      at:Number(at || Date.now())
    };
  }

  function fallbackText(type, number) {
    const index = clamp(number, META[type]?.count || 10);
    if (type === 'joke') return memeEntry(index).text;
    return `${META[type]?.series || '漂流瓶'}第 ${index} 封。海水泡皺了紙張，但故事仍然清楚。`;
  }

  function getEntry(type, number) {
    const meta = META[type] || META.joke;
    const index = clamp(number, meta.count);
    if (type === 'joke') return memeEntry(index);
    const provider = providerFor(type);
    const provided = provider?.getEntry?.(index);
    return {
      ...(provided || {}),
      title:provided?.title || `${meta.series} ${String(index).padStart(2,'0')}`,
      text:provided?.text || fallbackText(type,index),
      icon:meta.icon,
      series:meta.series,
      rarity:meta.rarity,
      number:index,
      at:Date.now()
    };
  }

  function nextMemeNumber(list) {
    const owned = new Set((Array.isArray(list) ? list : []).map((entry,index) => clamp(entry?.number || index + 1,MEMES.length)));
    for (let number=1;number<=MEMES.length;number+=1) if (!owned.has(number)) return number;
    return 1 + Math.floor(Math.random()*MEMES.length);
  }

  function createFullBottle(type) {
    const safeType = META[type] ? type : 'joke';
    if (safeType === 'joke') {
      const key = STORE.joke;
      const list = read(key, []);
      const entry = memeEntry(nextMemeNumber(list));
      list.push(entry);
      save(key, list.slice(-120));
      window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'meme-encyclopedia',entry}}));
      return entry;
    }
    const provider = providerFor(safeType);
    if (provider?.create) return provider.create();
    const key = STORE[safeType];
    const list = read(key, []);
    const entry = getEntry(safeType, list.length + 1);
    list.push(entry);
    save(key, list.slice(-120));
    window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'bottle',entry}}));
    return entry;
  }

  function pickType() {
    const table = [['joke',25],['island',22],['lanar',14],['ariel',12],['carnival',12],['priest',7],['blackbeard',5],['turtle',3]];
    let roll = Math.random() * table.reduce((sum,row) => sum + row[1],0);
    for (const [type,weight] of table) {
      roll -= weight;
      if (roll <= 0) return type;
    }
    return 'joke';
  }

  function normalizeAll() {
    Object.entries(STORE).forEach(([type,key]) => {
      const list = read(key, []);
      if (!Array.isArray(list)) return;
      const meta = META[type];
      const repaired = list.map((entry,index) => {
        if (type === 'joke') return memeEntry(entry?.number || index + 1,entry?.at);
        return {
          ...entry,
          icon:meta.icon,
          series:meta.series,
          rarity:meta.rarity,
          title:entry?.title || `${meta.series} ${String(clamp(index + 1,meta.count)).padStart(2,'0')}`,
          text:entry?.text || fallbackText(type,index + 1),
          at:entry?.at || Date.now()
        };
      });
      if (JSON.stringify(list) !== JSON.stringify(repaired)) save(key,repaired.slice(-120));
    });
  }

  function registerMemeProvider() {
    window.COFFEE_SHIP_BOTTLE_PROVIDERS = window.COFFEE_SHIP_BOTTLE_PROVIDERS || {};
    window.COFFEE_SHIP_BOTTLE_PROVIDERS.joke = {
      META:META.joke,
      entries:MEMES,
      getEntry:number => memeEntry(number),
      create:() => createFullBottle('joke'),
      version:1
    };
  }

  function patchBottleCore() {
    const core = window.COFFEE_SHIP_BOTTLE_CORE;
    if (!core) return false;
    if (core.bottleSeries?.[STORE.joke]) Object.assign(core.bottleSeries[STORE.joke],META.joke);
    const current = core.createBottle;
    if (typeof current === 'function' && !current.__memeEncyclopediaPatched) {
      const original = current;
      const wrapped = function(key,title,text) {
        const signature = `${key || ''} ${title || ''} ${text || ''}`;
        if (/coffeeShipBottleLetters|冷笑話|迷因百科|\bjoke\b/i.test(signature)) return createFullBottle('joke');
        return original.call(this,key,title,text);
      };
      wrapped.__memeEncyclopediaPatched = true;
      core.createBottle = wrapped;
    }
    return true;
  }

  function patchDatabase() {
    const db = window.COFFEE_SHIP_DB;
    if (!db) return false;
    if (Array.isArray(db.bottles)) {
      let found = false;
      db.bottles = db.bottles.map(row => {
        if (!Array.isArray(row) || row[0] !== 'joke') return row;
        found = true;
        return ['joke',META.joke.icon,META.joke.series,META.joke.rarity,memeEntry(1).text];
      });
      if (!found) db.bottles.push(['joke',META.joke.icon,META.joke.series,META.joke.rarity,memeEntry(1).text]);
    }
    db.memeEncyclopedia = MEMES;
    db.createMemeBottle = () => createFullBottle('joke');
    const currentAdd = db.addBottle;
    if (typeof currentAdd === 'function' && !currentAdd.__memeEncyclopediaPatched) {
      const original = currentAdd;
      const wrapped = function(bottle) {
        return bottle?.id === 'joke' || /冷笑話|迷因百科/.test(`${bottle?.title || ''}`)
          ? createFullBottle('joke')
          : original.call(this,bottle);
      };
      wrapped.__memeEncyclopediaPatched = true;
      db.addBottle = wrapped;
    }
    return true;
  }

  function patchBackpackStories() {
    const api = window.COFFEE_SHIP_BACKPACK_STORIES;
    const target = api?.stores?.[STORE.joke];
    if (!target) return false;
    const changed = target.series !== META.joke.series || target.icon !== META.joke.icon || Number(target.total || 0) !== META.joke.count;
    Object.assign(target,{icon:META.joke.icon,series:META.joke.series,rarity:META.joke.rarity,total:META.joke.count,color:META.joke.color});
    if (changed) api.refresh?.();
    return true;
  }

  function patchVisibleCard() {
    const card = document.getElementById('centralFishResultCard');
    if (!card || card.classList.contains('hidden')) return;
    const text = card.textContent || '';
    if (!/冷笑話漂流瓶|迷因百科/.test(text)) return;
    const match = text.match(/(?:迷因百科|冷笑話漂流瓶)\s*(\d+)/);
    const number = match ? clamp(match[1],MEMES.length) : 1;
    const entry = memeEntry(number);
    const title = card.querySelector('.central-fish-title');
    const detail = card.querySelector('.central-fish-detail');
    if (title) title.textContent = `${entry.icon} ${entry.title}`;
    if (detail) detail.innerHTML = `類型：迷因百科<br>分類：${entry.category}<br>稀有度：${entry.rarity}<br><br>${entry.text.replace(/\n/g,'<br>')}`;
  }

  function patchRuntime() {
    registerMemeProvider();
    patchBottleCore();
    patchDatabase();
    patchBackpackStories();
    patchVisibleCard();
  }

  function bottleChance() {
    return window.COFFEE_SHIP_ECONOMY?.eventChance?.(.075,'bottle')
      ?? Math.min(.7,.075 + Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.bottleLuck || 0));
  }

  function onFishingResult(event) {
    if (Math.random() > bottleChance()) return;
    const entry = createFullBottle(pickType());
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({
      castId:event.detail?.castId,
      eventKind:'bottle',
      title:entry.title,
      icon:entry.icon || '🍾',
      accent:entry.series === META.joke.series ? META.joke.color : '#d7bb79',
      text:`系列：${entry.series}｜稀有度：${entry.rarity}\n${entry.text}`
    });
  }

  function init() {
    normalizeAll();
    patchRuntime();
    window.addEventListener('coffee-ship:fishing-result',onFishingResult);
    window.addEventListener('coffee-ship:backpack-ready',patchBackpackStories);
    window.addEventListener('coffee-ship:story-ready',patchRuntime);
    window.addEventListener('coffee-ship:fishing-extras-ready',patchRuntime);
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      patchRuntime();
      if (attempts >= 40 || (window.COFFEE_SHIP_BOTTLE_CORE && window.COFFEE_SHIP_DB && window.COFFEE_SHIP_BACKPACK_STORIES)) clearInterval(timer);
    },250);
  }

  window.COFFEE_SHIP_BOTTLE_RESTORE = {
    META,
    STORE,
    MEMES,
    textOf:(type,number) => getEntry(type,number).text,
    titleOf:(type,number) => getEntry(type,number).title,
    getEntry,
    createFullBottle,
    normalizeAll,
    bottleChance,
    version:5
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();