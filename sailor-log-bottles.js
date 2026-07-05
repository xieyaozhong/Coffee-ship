(() => {
  'use strict';
  if (window.__COFFEE_SHIP_SAILOR_LOGS_V2__) return;
  window.__COFFEE_SHIP_SAILOR_LOGS_V2__ = true;

  const STORE_KEY = 'coffeeShipSailorLogLetters';
  const SERIES = '晨星號水手航海日誌';
  const AUTHOR = '水手伊萊亞斯・沃德';

  const ENTRIES = [
    {
      id:'sailor_log_01',number:1,icon:'⚓',title:'離港',rarity:'普通',sellPrice:55,
      text:'1718年5月3日。晨星號載著糖、咖啡豆與染料離開港口。船長說這趟航程平靜得足以讓新手學會打結，而我只希望薪水能讓母親撐過下一個冬天。'
    },
    {
      id:'sailor_log_02',number:2,icon:'🧱',title:'甲板下的聲音',rarity:'普通',sellPrice:58,
      text:'1718年5月5日。夜裡巡查時，我聽見甲板夾層傳來極輕的呼吸聲。那裡只有纜繩、備用木板與老鼠，不該有人刻意壓低喘息。'
    },
    {
      id:'sailor_log_03',number:3,icon:'👣',title:'藏在夾層的人',rarity:'普通',sellPrice:62,
      text:'1718年5月6日。我拆開鬆動木板，發現一名來自西非海岸的黑人青年。他叫科菲・阿杜，靠一袋乾豆與雨水躲了數日。他沒有武器，只反覆說自己不能回去。'
    },
    {
      id:'sailor_log_04',number:4,icon:'🫗',title:'一杯水',rarity:'普通',sellPrice:65,
      text:'1718年5月7日。我給科菲水、餅乾與舊毯子。他說自己曾在港口替商人搬貨，被迫簽下看不懂的契約，所以選擇藏上任何離港的船。我答應暫時不告訴船長。'
    },
    {
      id:'sailor_log_05',number:5,icon:'🗺️',title:'沒有名字的目的地',rarity:'常見',sellPrice:70,
      text:'1718年5月9日。科菲不知道晨星號將去哪裡，只說任何地方都比原來的生活更像希望。他識得星星，也懂得修補帆布。我開始懷疑，真正不該在這艘船上的，或許不是他。'
    },
    {
      id:'sailor_log_06',number:6,icon:'🌩️',title:'風向驟變',rarity:'常見',sellPrice:75,
      text:'1718年5月12日。午後風向毫無預兆地逆轉，雲層像黑牆壓向海面。船長命令收帆，卻仍堅持航線不變。科菲從夾層伸手，在木板上寫下一句：這場風不自然。'
    },
    {
      id:'sailor_log_07',number:7,icon:'🌊',title:'海吞下天空',rarity:'常見',sellPrice:80,
      text:'1718年5月13日。暴雨讓白晝變成黑夜，浪高得像要翻過主桅。三名水手被沖倒，一只貨箱撞破欄杆。科菲冒險爬出夾層，替我們割斷纏住舵輪的繩索。'
    },
    {
      id:'sailor_log_08',number:8,icon:'🪢',title:'暴風後的名字',rarity:'常見',sellPrice:84,
      text:'1718年5月14日。風暴過後，船長終於發現科菲。有人主張把他丟下海，輪機長卻承認若不是他，晨星號昨夜已經翻覆。船長讓他留下工作，但從未真正把他當作船員。'
    },
    {
      id:'sailor_log_09',number:9,icon:'🏴‍☠️',title:'地平線上的黑旗',rarity:'稀有',sellPrice:90,
      text:'1718年5月17日。上午瞭望手看見一艘沒有點燈的船。午後，那艘船升起黑旗，旗上長角骷髏刺穿一顆紅心。老水手低聲說，那是黑鬍子的船。'
    },
    {
      id:'sailor_log_10',number:10,icon:'💥',title:'第一聲炮響',rarity:'稀有',sellPrice:96,
      text:'1718年5月17日，黃昏。第一發炮彈擊碎右舷護欄，木屑像刀片飛過甲板。晨星號沒有足夠火力回擊。船長試圖加速，但暴風留下的損傷讓我們像拖著斷腿逃跑。'
    },
    {
      id:'sailor_log_11',number:11,icon:'🗡️',title:'黑鬍子登船',rarity:'稀有',sellPrice:105,
      text:'1718年5月18日。海盜從鉤索爬上甲板，為首的男人鬍鬚間纏著冒煙火繩。他沒有大喊，只平靜地挑走銀器、藥箱與最好的貨。那份平靜比炮聲更令人恐懼。'
    },
    {
      id:'sailor_log_12',number:12,icon:'🔥',title:'被留下的火',rarity:'稀有',sellPrice:112,
      text:'1718年5月18日，深夜。黑鬍子沒有沉船，只在貨艙留下幾處火種，像在測試我們能否活下去。科菲和我用海水滅火。十二名船員死亡，六人失蹤，船長的眼神從此變得空洞。'
    },
    {
      id:'sailor_log_13',number:13,icon:'🩹',title:'勉強活著',rarity:'稀有',sellPrice:118,
      text:'1718年5月20日。我們用破帆包紮傷口，用木門補上船身。科菲的肩膀被刀劃傷，仍拒絕拿最後一份乾淨繃帶。他說，活著不是把別人的份搶過來。'
    },
    {
      id:'sailor_log_14',number:14,icon:'🎵',title:'霧中的歌',rarity:'史詩',sellPrice:125,
      text:'1718年5月22日。午夜起霧後，海上傳來女人的歌聲。旋律沒有歌詞，卻讓每個人想起最思念的聲音。廚師哭著叫出女兒名字，翻過欄杆前被我們拖住。'
    },
    {
      id:'sailor_log_15',number:15,icon:'🐚',title:'第一個被帶走的人',rarity:'史詩',sellPrice:132,
      text:'1718年5月23日。水手霍布斯趁我們睡著走上甲板。他在船邊微笑，像看見有人張開雙臂迎接。浪中出現蒼白手指，接著他消失了，只留下口袋裡一枚濕透的貝殼。'
    },
    {
      id:'sailor_log_16',number:16,icon:'🕯️',title:'封住耳朵',rarity:'史詩',sellPrice:138,
      text:'1718年5月24日。我們把蠟塞進耳朵，將所有人用繩子綁在固定物上。科菲不受歌聲影響，他說旋律裡沒有他熟悉的人，只有刻意模仿的空洞。他開始替每一班守夜。'
    },
    {
      id:'sailor_log_17',number:17,icon:'🧜‍♀️',title:'海妖靠近',rarity:'史詩',sellPrice:145,
      text:'1718年5月25日。霧散前，我看見她們攀在船側。上半身像美麗女子，水下卻拖著灰白魚尾，眼睛沒有瞳孔。科菲敲響銅鍋，刺耳聲讓她們鬆手。'
    },
    {
      id:'sailor_log_18',number:18,icon:'🪸',title:'留在甲板上的痕跡',rarity:'史詩',sellPrice:150,
      text:'1718年5月26日。海妖退去後，甲板覆著透明黏液與細小黑色鱗片。船醫收集樣本，卻在當晚發起高燒。他說只是傷口感染，但他的指尖開始不受控制地顫動。'
    },
    {
      id:'sailor_log_19',number:19,icon:'🌫️',title:'沒有風的海',rarity:'史詩',sellPrice:156,
      text:'1718年5月28日。風完全停了，帆像死人的衣服垂著。海面平得能映出整艘船，卻映不出任何人的臉。飲水開始發苦，船醫堅持與海妖無關。'
    },
    {
      id:'sailor_log_20',number:20,icon:'🤒',title:'第一個病人',rarity:'傳說',sellPrice:165,
      text:'1718年5月29日。船醫攻擊了來換藥的少年水手，之後完全不記得自己做過什麼。他的眼白布滿灰色斑點，脈搏快得像奔跑。船長命令將他綁進下層艙。'
    },
    {
      id:'sailor_log_21',number:21,icon:'🧪',title:'怪病蔓延',rarity:'傳說',sellPrice:172,
      text:'1718年5月30日。又有四人發燒。他們先聽見不存在的低語，接著開始懷疑食物被下毒。病人對聲音與光極度敏感，卻能在黑暗裡準確找到別人的位置。'
    },
    {
      id:'sailor_log_22',number:22,icon:'🔒',title:'封鎖下層艙',rarity:'傳說',sellPrice:178,
      text:'1718年5月31日。我們把感染者關進下層艙，用貨箱堵住入口。夜裡，他們輪流用正常聲音呼喊親友名字，試圖騙我們開門。科菲說其中有人在模仿海妖的歌。'
    },
    {
      id:'sailor_log_23',number:23,icon:'👁️',title:'每個人都在懷疑',rarity:'傳說',sellPrice:184,
      text:'1718年6月1日。未發燒的人也開始互相監視。大副說科菲帶來詛咒，科菲則指出怪病是在海妖留下黏液後才出現。我相信他，但船上已沒有人相信任何人。'
    },
    {
      id:'sailor_log_24',number:24,icon:'⚔️',title:'第一場互相攻擊',rarity:'傳說',sellPrice:192,
      text:'1718年6月2日。清晨有人打開下層艙，感染者衝上甲板。更可怕的是，健康船員也拿起武器攻擊彼此，堅稱對方眼睛變了顏色。秩序在不到一刻鐘內消失。'
    },
    {
      id:'sailor_log_25',number:25,icon:'🪓',title:'船長失控',rarity:'傳說',sellPrice:198,
      text:'1718年6月2日，夜。船長砍斷主帆繩索，說船正企圖把我們帶回海妖身邊。大副阻止他時被擊倒。船長隨後跳進貨艙，再也沒有上來，裡面只剩拖行木箱的聲音。'
    },
    {
      id:'sailor_log_26',number:26,icon:'🛟',title:'科菲救了我',rarity:'神話',sellPrice:210,
      text:'1718年6月3日。我被兩名失控水手逼到船側，是科菲把救生圈套在我身上，將我拉回甲板。他本可以獨自躲藏，卻一次次回來救人。現在船上還能清楚說話的，只剩我們五個。'
    },
    {
      id:'sailor_log_27',number:27,icon:'🚪',title:'夾層成了避難所',rarity:'神話',sellPrice:220,
      text:'1718年6月4日。我們躲進科菲最初藏身的甲板夾層。外面整夜有人刮木板，低聲承諾只要開門就能回家。科菲用炭筆畫出每個人的臉，怕我們忘記彼此原本的模樣。'
    },
    {
      id:'sailor_log_28',number:28,icon:'🕳️',title:'科菲也病了',rarity:'神話',sellPrice:235,
      text:'1718年6月5日。科菲開始發抖，卻主動要求我們綁住他的手。他說若自己失去理智，就把這本日誌封進油布與玻璃瓶，不要讓故事跟船一起沉下去。他仍然記得每個人的名字。'
    },
    {
      id:'sailor_log_29',number:29,icon:'✒️',title:'我的手開始發抖',rarity:'神話',sellPrice:250,
      text:'1718年6月6日。我聽見母親在木板外叫我。她不可能在海上。科菲已不再說話，只用背靠住門。我寫字時看見墨跡在紙上移動，也許不是墨在動，是我的眼睛出了問題。'
    },
    {
      id:'sailor_log_30',number:30,icon:'☠️',title:'最後一頁',rarity:'世界級',sellPrice:360,
      text:'日期已無法辨認。晨星號上沒有未感染的人，也沒有能駕船的人。科菲把日誌塞進瓶中，我負責寫下最後一句：這場災難不是某一個人的錯。若有人撈到它，請不要登上仍在霧中漂流的晨星號。船上已無人生還。'
    }
  ];

  const TOTAL = ENTRIES.length;
  const handledCasts = new Set();
  let boundFishingApi = null;

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  }

  function list() {
    const value = read(STORE_KEY, []);
    return Array.isArray(value) ? value : [];
  }

  function baseByNumber(number) {
    const safe = Math.max(1, Math.min(TOTAL, Number(number || 1)));
    return ENTRIES[safe - 1];
  }

  function normalizeEntry(entry) {
    const source = ENTRIES.find(item => item.id === entry?.id) || baseByNumber(entry?.number);
    return {
      ...source,
      ...entry,
      id:source.id,
      number:source.number,
      icon:source.icon,
      title:`航海日誌 ${String(source.number).padStart(2,'0')}｜${source.title}`,
      chapterTitle:source.title,
      text:source.text,
      series:SERIES,
      author:AUTHOR,
      rarity:source.rarity,
      group:'bottle',
      source:'shipwreck-salvage',
      sellPrice:Number(entry?.sellPrice || source.sellPrice),
      at:Number(entry?.at || Date.now())
    };
  }

  function normalizeAll() {
    const current = list();
    const normalized = current.map(normalizeEntry).slice(-150);
    if (JSON.stringify(current) !== JSON.stringify(normalized)) save(STORE_KEY, normalized);
    return normalized;
  }

  function modifiers() {
    return window.COFFEE_SHIP_ECONOMY?.fishingModifiers?.() || {
      pearlBonus:Math.max(1, Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.pearlBonus || 1)),
      bottleLuck:Math.max(0, Number(window.COFFEE_SHIP_COFFEE_EFFECT?.bonuses?.bottleLuck || 0))
    };
  }

  function createByNumber(number, options = {}) {
    const source = baseByNumber(number);
    const pearlBonus = Math.max(1, Number(modifiers().pearlBonus || 1));
    const entry = normalizeEntry({
      ...source,
      sellPrice:Math.max(1, Math.round(source.sellPrice * pearlBonus)),
      coffeeEffectName:window.COFFEE_SHIP_COFFEE_EFFECT?.name || '',
      at:Date.now()
    });
    const current = normalizeAll();
    current.push(entry);
    save(STORE_KEY, current.slice(-150));
    if (!options.silent) {
      window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'sailor-log',entry}}));
      window.dispatchEvent(new CustomEvent('coffee-ship:sailor-log-found',{detail:{entry}}));
    }
    return entry;
  }

  function createNext(options = {}) {
    const owned = new Set(normalizeAll().map(entry => entry.id));
    const missing = ENTRIES.find(entry => !owned.has(entry.id));
    const selected = missing || ENTRIES[Math.floor(Math.random() * ENTRIES.length)];
    return createByNumber(selected.number, options);
  }

  function collected() {
    return new Set(normalizeAll().map(entry => entry.id)).size;
  }

  function dropChance() {
    const bottleLuck = Math.max(0, Number(modifiers().bottleLuck || 0));
    return Math.min(.85, .42 + bottleLuck * .8);
  }

  function salvageKey(payload) {
    return String(payload?.castId || `salvage-${Date.now()}`);
  }

  function triggerSalvage(payload = {}) {
    const castId = payload.castId || window.COFFEE_SHIP_FISHING_API?.getCurrentCastId?.();
    const entry = createNext();
    window.COFFEE_SHIP_FISHING_API?.pushEvent?.({
      castId,
      eventKind:'bottle',
      title:`沉船打撈事件｜${entry.title}`,
      icon:entry.icon,
      accent:'#b8a98b',
      text:`系列：${SERIES}｜${entry.rarity}\n${entry.text}\n收集進度：${collected()}/${TOTAL}`
    });
    return entry;
  }

  function bindSalvageBridge() {
    const api = window.COFFEE_SHIP_FISHING_API;
    if (!api?.pushEvent || api === boundFishingApi) return false;

    const originalPushEvent = api.pushEvent.bind(api);
    api.pushEvent = payload => {
      const result = originalPushEvent(payload);
      const title = String(payload?.title || '');
      if (!title.startsWith('海上打撈事件｜')) return result;

      const key = salvageKey(payload);
      if (handledCasts.has(key)) return result;
      handledCasts.add(key);
      setTimeout(() => handledCasts.delete(key), 7000);

      if (Math.random() <= dropChance()) queueMicrotask(() => triggerSalvage(payload));
      return result;
    };

    api.__sailorLogSalvageBridge = true;
    boundFishingApi = api;
    return true;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }

  function formatText(value) {
    return escapeHtml(value).replace(/\n/g,'<br>');
  }

  function addStyle() {
    if (document.getElementById('sailorLogBottleStyle')) return;
    const style = document.createElement('style');
    style.id = 'sailorLogBottleStyle';
    style.textContent = `
      .sailor-log-section{margin:0 0 12px;padding:11px;border:2px solid #8f8069;border-radius:17px;background:linear-gradient(180deg,rgba(55,45,39,.72),rgba(24,16,32,.96));box-shadow:0 0 20px rgba(215,187,121,.1) inset}
      .sailor-log-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;color:#d7bb79;font-weight:1000}.sailor-log-heading small{color:#fff4d8;opacity:.72}
      .sailor-log-card{border-color:#8f8069!important;background:linear-gradient(180deg,#302721,#181020)!important}.sailor-log-card .bp-title{color:#f0d8a6}.sailor-log-rarity{display:inline-flex;padding:2px 7px;border-radius:999px;background:#493b31;color:#ffe4aa;font-size:10px;font-weight:1000;margin-left:auto}
    `;
    document.head.appendChild(style);
  }

  function cards() {
    return normalizeAll().slice().sort((a,b) => Number(a.number) - Number(b.number) || Number(b.at) - Number(a.at));
  }

  function injectBackpack() {
    const panel = document.getElementById('backpackPanel');
    if (!panel || panel.classList.contains('hidden')) return;
    const tab = panel.querySelector('[data-bp-tab="letter"]');
    if (!tab?.classList.contains('active')) return;

    const rows = cards();
    const existing = panel.querySelector('[data-sailor-log-section]');
    if (!rows.length) {
      existing?.remove();
      return;
    }

    const signature = rows.map(entry => `${entry.id}:${entry.at}:${entry.sellPrice}`).join('|');
    if (existing?.dataset.signature === signature) return;
    existing?.remove();

    panel.querySelector('.bp-content > .bp-empty')?.remove();
    const content = panel.querySelector('.bp-content');
    if (!content) return;

    const section = document.createElement('section');
    section.className = 'sailor-log-section';
    section.dataset.sailorLogSection = 'true';
    section.dataset.signature = signature;
    section.innerHTML = `
      <div class="sailor-log-heading"><span>📓 ${SERIES}</span><small>${collected()}/${TOTAL} 已收集</small></div>
      <div class="bp-list">${rows.map((entry,index) => `
        <article class="bp-card sailor-log-card">
          <strong class="bp-title"><span>${escapeHtml(entry.icon)}</span><span>${escapeHtml(entry.title)}</span><span class="sailor-log-rarity">${escapeHtml(entry.rarity)}</span></strong>
          <small class="bp-meta">作者：${escapeHtml(entry.author)}<br>${formatText(entry.text)}${entry.coffeeEffectName ? `<br>咖啡加成：${escapeHtml(entry.coffeeEffectName)}` : ''}<br><span class="bp-price">售價：${entry.sellPrice} 珍珠</span></small>
          <div class="bp-actions"><button class="bp-sell" data-sailor-log-sell="${index}">販售</button><button class="bp-delete" data-sailor-log-delete="${index}">丟棄</button></div>
        </article>`).join('')}</div>`;
    content.append(section);
  }

  function removeAt(index, sell) {
    const rows = cards();
    const target = rows[index];
    if (!target) return;
    const current = normalizeAll();
    const sourceIndex = current.findIndex(entry => entry.id === target.id && Number(entry.at) === Number(target.at));
    if (sourceIndex < 0) return;
    current.splice(sourceIndex,1);
    save(STORE_KEY,current);
    if (sell) {
      if (window.COFFEE_SHIP_ECONOMY?.earn) {
        window.COFFEE_SHIP_ECONOMY.earn(target.sellPrice,`販售：${target.title}`,{source:'sailor-log'});
      } else {
        localStorage.setItem('coffeeShipPearls',String(Number(localStorage.getItem('coffeeShipPearls') || 0) + target.sellPrice));
      }
    }
    window.COFFEE_SHIP_BACKPACK_MANAGER?.rebuild?.();
    requestAnimationFrame(injectBackpack);
  }

  function bindBackpack() {
    document.addEventListener('click', event => {
      const sell = event.target.closest?.('[data-sailor-log-sell]');
      if (sell) {
        event.preventDefault();
        event.stopImmediatePropagation();
        removeAt(Number(sell.dataset.sailorLogSell),true);
        return;
      }
      const remove = event.target.closest?.('[data-sailor-log-delete]');
      if (remove) {
        event.preventDefault();
        event.stopImmediatePropagation();
        removeAt(Number(remove.dataset.sailorLogDelete),false);
      }
    },true);

    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        injectBackpack();
      });
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  }

  function init() {
    addStyle();
    normalizeAll();
    bindBackpack();
    bindSalvageBridge();
    setInterval(bindSalvageBridge, 750);
    window.addEventListener('coffee-ship:fishing-extras-ready',bindSalvageBridge);

    window.COFFEE_SHIP_BOTTLE_PROVIDERS = window.COFFEE_SHIP_BOTTLE_PROVIDERS || {};
    window.COFFEE_SHIP_BOTTLE_PROVIDERS.sailorLog = {
      getEntry:number => normalizeEntry(baseByNumber(number)),
      create:createNext,
      entries:ENTRIES,
      total:TOTAL
    };
  }

  window.COFFEE_SHIP_SAILOR_LOGS = {
    series:SERIES,
    author:AUTHOR,
    storageKey:STORE_KEY,
    entries:ENTRIES,
    total:TOTAL,
    list:normalizeAll,
    createNext,
    createByNumber,
    collected,
    dropChance,
    trigger:triggerSalvage,
    bindSalvageBridge,
    version:2
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();