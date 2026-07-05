(() => {
  'use strict';
  if (window.__COFFEE_SHIP_MERMAID_LYRICS_V6__) return;
  window.__COFFEE_SHIP_MERMAID_LYRICS_V6__ = true;

  const STORE_KEY = 'coffeeShipMermaidLyrics';
  const BAG_KEY = 'coffeeShipFishBag';
  const SERIES = '美人魚歌詞漂流瓶';

  const LYRICS = [
    {id:'pearl_moonlight',number:1,icon:'🎹',title:'黑暗巴洛克',rarity:'史詩',sellPrice:110,text:'沒有光的世界巴洛克\n變成動人的那美妙聲音\n黑暗陷阱中的秘密聲音\n沉睡搖籃中一直到永遠不醒\n\n看慢慢的向前方邁進\n為最終時刻來臨齊聲歡呼\n充滿冰冷的微笑沒有光\n就將真珠 變成灰燼\n來吧朋友們 如果有希望的光在前方\n讓我們唱出 那首叫絕望的美麗讚歌'},
    {id:'seven_tides',number:2,icon:'🌄',title:'全世界最早的早晨出現的地方',rarity:'史詩',sellPrice:115,text:'思念全世界最早的早晨出現的地方\n思念是道光芒 圍著白雲綻放\n許願火孤單 這場夢依舊燦爛\n\n那段時光 那段過往\n心情擺盪 回憶兩端\n風還微涼 你在身旁\n甜甜的佔據夜晚\n\n如果是你在我的心上\n請你也停止悲傷\n期待眼淚沖淡你的傷\n我永遠在你身旁'},
    {id:'bubbles_return',number:3,icon:'🎁',title:'愛的百寶箱',rarity:'史詩',sellPrice:118,text:'微微風吹起紅白的風帆\n浪漫的　自由的　幸福的　海的夢幻\n時間的魔法飄到了遠方　手一碰　就溶化\n轉眼有一道光芒\n\n明明是你　對我如影隨形\n心卻像隔著遙遠的距離\n毫無保留的你\n我該認真相信　真心　不能有懷疑\n\n百寶箱的愛能解開\n忌妒感和安全感　能給人愛的能量\n百寶箱的愛最可愛　能坦率讓我明白\n我和你有相同的愛　純真而專一的愛'},
    {id:'deepsea_promise',number:4,icon:'🥁',title:'鼓動',rarity:'史詩',sellPrice:120,text:'狂風暴雨的海誰在等待\n我們是堅強的小孩\n成功或失敗\n信心從不曾停擺\n因為擁有愛\n\n也許人生注定經歷失敗\n我會努力振作起來\n鼓動的節拍\n陽光會永遠存在\n憂鬱排除在外\n比太陽還要澎湃'},
    {id:'coral_kingdom',number:5,icon:'🎻',title:'黑暗協奏曲',rarity:'傳說',sellPrice:145,text:'如果和平只是一場夢想，為何總抵擋不住對它的渴望\n翻騰中的波浪信念還在糾纏，堅持何嘗不是希望\n軟弱有時候會躲在手掌，自卑始終迷惑傲慢的正義感\n當我勇敢的闖自始至中保持沉默！\n\nVoice In the Dark！\n黑暗將我淹沒，緩緩的唱起熟悉的旋律\n黑色的協奏曲，結束痛和原諒，開啟你的絕望\n迷失旋轉協奏曲在迴盪。\n沒有方向眼神只有冰涼'},
    {id:'stardust_wish',number:6,icon:'⭐',title:'星砂心願',rarity:'史詩',sellPrice:122,text:'我將一粒星砂放進掌心\n請它替我守護遙遠的人\n若你在夜裡聽見海潮回應\n那是我的心願抵達你身旁'},
    {id:'dawn_song',number:7,icon:'🌅',title:'破曉之歌',rarity:'傳說',sellPrice:150,text:'天空還未亮，我先唱出第一個音\n讓受傷的浪重新學會前進\n當太陽越過最後一道風暴\n我們會看見新的海正在誕生'},
    {id:'guardian_pearl',number:8,icon:'🛡️',title:'守護珍珠',rarity:'傳說',sellPrice:155,text:'珍珠不是王冠也不是眼淚\n是我選擇守護世界的證明\n每一次顫抖都能化成勇氣\n每一句歌都能讓孤單被聽見'},
    {id:'sea_wind_reply',number:9,icon:'💌',title:'海風的回信',rarity:'傳說',sellPrice:160,text:'我把問題寫給遠方海風\n它帶回你沒有說完的回答\n原來真正的愛不是佔有\n是願意讓彼此自由地發光'},
    {id:'eternal_chorus',number:10,icon:'🎼',title:'永恆合唱',rarity:'神話',sellPrice:220,text:'當十道歌聲越過暴雨相遇\n海面會綻放無數透明花朵\n即使故事終有一天寫到最後\n我們的合唱仍在潮汐裡繼續'},
    {id:'rainbow_breeze',number:11,icon:'🍃',title:'七彩的微風',rarity:'神話',sellPrice:240,text:'七彩的微風\n側著臉輕輕吹拂\n想溜走　溜到沒有紛擾的角落\n在黎明前夕　傳來優美的旋律\n記憶裡最美麗最動人的 Melody'}
  ];

  const TOTAL = LYRICS.length;

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

  function entryById(id) {
    return LYRICS.find(entry => entry.id === id) || null;
  }

  function normalizeEntry(entry) {
    const index = Math.max(0, Math.min(TOTAL - 1, Number(entry?.number || 1) - 1));
    const source = entryById(entry?.id) || LYRICS[index];
    return {
      ...source,
      ...entry,
      id:source.id,
      number:source.number,
      icon:source.icon,
      title:`${SERIES} ${String(source.number).padStart(2,'0')}｜${source.title}`,
      songTitle:source.title,
      text:source.text,
      series:SERIES,
      rarity:source.rarity,
      sellPrice:source.sellPrice,
      group:'bottle',
      source:'mermaid-event',
      at:Number(entry?.at || Date.now())
    };
  }

  function normalizeAll() {
    const current = list();
    const normalized = current.map(normalizeEntry).slice(-120);
    if (JSON.stringify(current) !== JSON.stringify(normalized)) save(STORE_KEY, normalized);
    return normalized;
  }

  function createById(id, options = {}) {
    const source = entryById(id);
    if (!source) return null;
    const entry = normalizeEntry({...source,at:Date.now()});
    const current = normalizeAll();
    current.push(entry);
    save(STORE_KEY, current.slice(-120));
    if (!options.silent) {
      window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'mermaid-lyrics',entry}}));
      window.dispatchEvent(new CustomEvent('coffee-ship:mermaid-lyric-found',{detail:{entry}}));
    }
    return entry;
  }

  function createRandom(options = {}) {
    const current = normalizeAll();
    const owned = new Set(current.map(entry => entry.id));
    const missing = LYRICS.filter(entry => !owned.has(entry.id));
    const pool = missing.length ? missing : LYRICS;
    return createById(pool[Math.floor(Math.random() * pool.length)].id, options);
  }

  function migrateLegacyItems() {
    const bag = read(BAG_KEY, []);
    if (!Array.isArray(bag) || !bag.length) return 0;
    const remaining = [];
    let migrated = 0;
    bag.forEach(item => {
      const name = String(item?.name || '');
      const legacy = item?.kind === 'letter' && /美人魚歌詞瓶|泡沫記憶|瓶中歌詞/.test(name);
      if (legacy) {
        createRandom({silent:true});
        migrated += 1;
      } else {
        remaining.push(item);
      }
    });
    if (migrated) {
      save(BAG_KEY, remaining.slice(-240));
      window.dispatchEvent(new CustomEvent('coffee-ship:bag-changed',{detail:{source:'mermaid-lyrics-migration',count:migrated}}));
    }
    return migrated;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }

  function formatText(value) {
    return escapeHtml(value).replace(/\n/g,'<br>');
  }

  function addStyle() {
    if (document.getElementById('mermaidLyricsBottleStyle')) return;
    const style = document.createElement('style');
    style.id = 'mermaidLyricsBottleStyle';
    style.textContent = `
      .mermaid-lyrics-section{margin:0 0 12px;padding:11px;border:2px solid #9ce8f0;border-radius:17px;background:linear-gradient(180deg,rgba(31,65,91,.55),rgba(24,16,32,.9));box-shadow:0 0 20px rgba(156,232,240,.12) inset}
      .mermaid-lyrics-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;color:#9ce8f0;font-weight:1000}.mermaid-lyrics-heading small{color:#fff4d8;opacity:.72}
      .mermaid-lyric-card{border-color:#5f9db3!important;background:linear-gradient(180deg,#1d2c3b,#181020)!important}.mermaid-lyric-card .bp-title{color:#c8f4ff}.mermaid-lyric-number{display:inline-flex;padding:2px 7px;border-radius:999px;background:#264458;color:#9ce8f0;font-size:10px;font-weight:1000;margin-left:auto}
    `;
    document.head.appendChild(style);
  }

  function lyricCards() {
    return normalizeAll().slice().sort((a,b) => Number(b.at || 0) - Number(a.at || 0));
  }

  function injectBackpack() {
    const panel = document.getElementById('backpackPanel');
    if (!panel || panel.classList.contains('hidden')) return;
    const tab = panel.querySelector('[data-bp-tab="letter"]');
    if (!tab?.classList.contains('active')) return;

    const rows = lyricCards();
    if (!tab.dataset.mermaidBaseCount) {
      const match = tab.textContent.match(/(\d+)/);
      tab.dataset.mermaidBaseCount = match ? match[1] : '0';
    }
    tab.textContent = `信件 ${Number(tab.dataset.mermaidBaseCount || 0) + rows.length}`;

    const existing = panel.querySelector('[data-mermaid-lyrics-section]');
    if (!rows.length) {
      existing?.remove();
      return;
    }

    const signature = rows.map(entry => `${entry.id}:${entry.at}`).join('|');
    if (existing?.dataset.signature === signature) return;
    existing?.remove();

    panel.querySelector('.bp-content > .bp-empty')?.remove();
    const content = panel.querySelector('.bp-content');
    if (!content) return;

    const section = document.createElement('section');
    section.className = 'mermaid-lyrics-section';
    section.dataset.mermaidLyricsSection = 'true';
    section.dataset.signature = signature;
    section.innerHTML = `
      <div class="mermaid-lyrics-heading"><span>🎼 美人魚歌詞漂流瓶</span><small>${new Set(rows.map(entry => entry.id)).size}/${TOTAL} 已收集</small></div>
      <div class="bp-list">${rows.map((entry,index) => `
        <article class="bp-card mermaid-lyric-card">
          <strong class="bp-title"><span>${escapeHtml(entry.icon)}</span><span>${escapeHtml(entry.title)}</span><span class="mermaid-lyric-number">${escapeHtml(entry.rarity)}</span></strong>
          <small class="bp-meta">系列：${SERIES}<br>${formatText(entry.text)}<br><span class="bp-price">售價：${entry.sellPrice} 珍珠</span></small>
          <div class="bp-actions"><button class="bp-sell" data-mermaid-lyric-sell="${index}">販售</button><button class="bp-delete" data-mermaid-lyric-delete="${index}">丟棄</button></div>
        </article>`).join('')}</div>`;
    content.prepend(section);
  }

  function removeAt(index, sell) {
    const rows = lyricCards();
    const target = rows[index];
    if (!target) return;
    const current = normalizeAll();
    const sourceIndex = current.findIndex(entry => entry.id === target.id && Number(entry.at) === Number(target.at));
    if (sourceIndex < 0) return;
    current.splice(sourceIndex,1);
    save(STORE_KEY,current);
    if (sell) {
      if (window.COFFEE_SHIP_ECONOMY?.earn) window.COFFEE_SHIP_ECONOMY.earn(target.sellPrice,`販售：${target.title}`,{source:'mermaid-lyrics'});
      else localStorage.setItem('coffeeShipPearls',String(Number(localStorage.getItem('coffeeShipPearls') || 0) + target.sellPrice));
    }
    window.COFFEE_SHIP_BACKPACK_MANAGER?.rebuild?.();
    requestAnimationFrame(injectBackpack);
  }

  function bindBackpack() {
    document.addEventListener('click',event => {
      const sell = event.target.closest?.('[data-mermaid-lyric-sell]');
      if (sell) {
        event.preventDefault();
        event.stopImmediatePropagation();
        removeAt(Number(sell.dataset.mermaidLyricSell),true);
        return;
      }
      const remove = event.target.closest?.('[data-mermaid-lyric-delete]');
      if (remove) {
        event.preventDefault();
        event.stopImmediatePropagation();
        removeAt(Number(remove.dataset.mermaidLyricDelete),false);
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
    migrateLegacyItems();
    bindBackpack();
    window.COFFEE_SHIP_BOTTLE_PROVIDERS = window.COFFEE_SHIP_BOTTLE_PROVIDERS || {};
    window.COFFEE_SHIP_BOTTLE_PROVIDERS.mermaidLyrics = {
      getEntry:number => normalizeEntry(LYRICS[Math.max(0,Math.min(TOTAL - 1,Number(number || 1) - 1))]),
      create:createRandom,
      entries:LYRICS,
      total:TOTAL
    };
  }

  window.COFFEE_SHIP_MERMAID_LYRICS = {
    series:SERIES,
    storageKey:STORE_KEY,
    entries:LYRICS,
    total:TOTAL,
    list:normalizeAll,
    createRandom,
    createById,
    collected:() => new Set(normalizeAll().map(entry => entry.id)).size,
    injectBackpack,
    version:6
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();