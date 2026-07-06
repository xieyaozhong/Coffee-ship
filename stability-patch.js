(() => {
  'use strict';
  if (window.__COFFEE_SHIP_STAGED_LOADER_V14__) return;
  window.__COFFEE_SHIP_STAGED_LOADER_V14__ = true;

  let controlsBound=false, fishingCoreReady=false, fishingCoreLoading=null;
  let fishingExtrasPromise=null, storyModulesPromise=null, deckPreloadStarted=false;

  const isDeck=()=>!!window.COFFEE_SHIP_DECK?.isDeckOpen?.();
  const isPort=()=>{const el=document.getElementById('portOverlay');return !!el&&!el.classList.contains('hidden');};
  const isGame=()=>{const c=document.getElementById('creator'),g=document.getElementById('gamePanel');return !!g&&!g.classList.contains('hidden')&&(!c||c.classList.contains('hidden'));};
  const keyEvent=(type,key,code=key)=>window.dispatchEvent(new KeyboardEvent(type,{key,code,bubbles:true,cancelable:true}));

  function holdKey(button,key){
    if(!button||!key||button.dataset.sceneHoldBound==='true')return;
    button.dataset.sceneHoldBound='true';let pressed=false;
    const start=event=>{if(!isDeck()&&!isPort())return;event.preventDefault();event.stopPropagation();if(!pressed){pressed=true;keyEvent('keydown',key);}};
    const end=()=>{if(!pressed)return;pressed=false;keyEvent('keyup',key);};
    button.addEventListener('pointerdown',start,true);button.addEventListener('pointerup',end,true);
    button.addEventListener('pointerleave',end,true);button.addEventListener('pointercancel',end,true);
  }

  function bindMobileControls(){
    if(controlsBound)return;controlsBound=true;
    const map={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'};
    document.querySelectorAll('[data-move]').forEach(button=>holdKey(button,map[button.dataset.move]));
    document.getElementById('emoteBtn')?.addEventListener('click',event=>{
      if(!isDeck()&&!isPort())return;event.preventDefault();event.stopPropagation();
      keyEvent('keydown',' ','Space');setTimeout(()=>keyEvent('keyup',' ','Space'),70);
    },true);
  }

  function updateBadge(){
    const badge=document.getElementById('sceneStatusBadge');if(!badge)return;
    badge.style.display=isGame()?'block':'none';badge.textContent=isPort()?'⚓ Port':isDeck()?'🌊 Deck':'☕ Cafe';
  }

  function addBadge(){
    const panel=document.getElementById('gamePanel');if(!panel||document.getElementById('sceneStatusBadge'))return;
    const badge=document.createElement('div');badge.id='sceneStatusBadge';
    badge.style.cssText='display:none;position:absolute;left:18px;bottom:18px;z-index:11;padding:6px 10px;border-radius:10px;background:rgba(21,16,32,.86);border:2px solid #76536a;color:#fff4d8;font-weight:900;font-size:13px;pointer-events:none';
    badge.textContent='☕ Cafe';panel.appendChild(badge);updateBadge();
    window.addEventListener('coffee-ship:entered',updateBadge);window.addEventListener('coffee-ship:scene',updateBadge);
  }

  function fileName(src){try{return new URL(src,location.href).pathname.split('/').pop();}catch{return String(src).split('?')[0].split('/').pop();}}
  function loaded(src){const target=fileName(src);return Array.from(document.scripts).some(script=>fileName(script.src||script.getAttribute('src')||'')===target);}
  function loadScript(src,flag){
    if(loaded(src)||document.querySelector(`script[data-${flag}="true"]`))return Promise.resolve(true);
    return new Promise(resolve=>{const script=document.createElement('script');script.src=src;script.async=false;script.dataset[flag]='true';
      script.onload=()=>resolve(true);script.onerror=()=>{console.warn(`Optional module failed: ${src}`);resolve(false);};document.body.appendChild(script);});
  }
  const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  async function loadSequence(entries,gap=80){for(const [src,flag] of entries){while(document.hidden)await pause(400);await loadScript(src,flag);if(gap)await pause(gap);}}
  function idle(callback,timeout=1200){if('requestIdleCallback'in window)requestIdleCallback(callback,{timeout});else setTimeout(callback,260);}

  async function loadCafeEnhancements(){
    await loadSequence([
      ['role-sprites.js?v=stable-9','roleSprites'],['role-mobile-ability.js?v=stable-9','roleAbility'],
      ['change-character.js?v=stable-9','changeCharacter'],['mobile-home-safe.js?v=stable-9','mobileHomeSafe'],
      ['mobile-game-layout.js?v=stable-9','mobileGameLayout'],['quality-polish.js?v=stable-9','qualityPolish'],
      ['black-cat-nox.js?v=stable-9','blackCatNox'],['npc-behavior-polish.js?v=stable-9','npcBehaviorPolish'],
      ['port.js?v=stable-9','portScene']
    ]);
  }

  async function ensureFishingCore(){
    if(Number(window.COFFEE_SHIP_FISHING_API?.version||0)>=4){fishingCoreReady=true;return true;}
    if(fishingCoreReady&&window.COFFEE_SHIP_FISHING_API)return true;if(fishingCoreLoading)return fishingCoreLoading;
    fishingCoreLoading=(async()=>{const ok=await loadScript('deck-fishing.js?v=unified-fishing-4g','deckFishing');
      fishingCoreReady=ok&&Number(window.COFFEE_SHIP_FISHING_API?.version||0)>=4;fishingCoreLoading=null;window.COFFEE_SHIP_FISHING_READY=fishingCoreReady;return fishingCoreReady;})();
    return fishingCoreLoading;
  }

  async function loadFishingExtras(){
    if(fishingExtrasPromise)return fishingExtrasPromise;
    fishingExtrasPromise=(async()=>{
      await loadSequence([
        ['extra-fish-50.js?v=events-1','extraFish50'],['loot-bottle-core.js?v=events-1','lootBottleCore'],
        ['bottle-series-restore.js?v=events-1','bottleSeriesRestore'],['mermaid-event.js?v=events-1','mermaidEvent'],
        ['deck-shark-event.js?v=events-1','deckSharkEvent'],['mutant-creatures.js?v=events-1','mutantCreatures'],
        ['ocean-carnival-events.js?v=events-1','oceanCarnivalEvents'],['event-loot-normalizer.js?v=events-2','eventLootNormalizer'],
        ['fishing-adventure-events.js?v=adventure-1','fishingAdventureEvents'],
        ['fishing-adventure-expansion.js?v=adventure-expansion-1','fishingAdventureExpansion'],
        ['coral-roulette-event.js?v=coral-roulette-1','coralRouletteEvent'],
        ['sea-merchant-event.js?v=merchant-1','seaMerchantEvent'],
        ['pirate-gambling-event.js?v=pirate-gambling-1','pirateGamblingEvent'],
        ['fishing-event-stack.js?v=events-1','fishingEventBridge']
      ],65);
      window.dispatchEvent(new CustomEvent('coffee-ship:fishing-extras-ready',{detail:{version:11,economy:true,expandedEvents:true,adventureEvents:true,coralRoulette:true,seaMerchant:true,pirateGambling:true,totalAdventureEvents:122}}));
      return true;
    })();return fishingExtrasPromise;
  }

  async function loadStoryModules(){
    if(storyModulesPromise)return storyModulesPromise;
    storyModulesPromise=(async()=>{await loadSequence([
      ['turtle-soup-bottles.js?v=story-9','turtleSoupBottles'],['lanar-bottles.js?v=story-9','lanarBottles'],
      ['ariel-chapter1-bottles.js?v=story-9','arielBottles'],['coco-bottles.js?v=story-9','cocoBottles'],
      ['blackbeard-bottles.js?v=story-9','blackbeardBottles'],['mad-priest-bottles.js?v=story-9','madPriestBottles'],
      ['carnival-island-bottles.js?v=story-9','carnivalIslandBottles'],['original-emoji-restore.js?v=story-9','originalEmojiRestore'],
      ['lanar-bottle-letters.js?v=story-9','lanarBottleLetters'],['ariel-bottle-letters.js?v=story-9','arielBottleLetters'],
      ['island-triangle-letters.js?v=story-9','islandTriangleLetters'],['blackbeard-treasure-letters.js?v=story-9','blackbeardTreasureLetters'],
      ['story-modal-fix.js?v=story-9','storyModalFix'],['bottle-dex-patch.js?v=story-9','bottleDexPatch']
    ],420);window.dispatchEvent(new CustomEvent('coffee-ship:story-ready',{detail:{version:9}}));return true;})();
    return storyModulesPromise;
  }

  async function preloadDeckSystems(){
    if(deckPreloadStarted)return;deckPreloadStarted=true;
    if(!await ensureFishingCore()){deckPreloadStarted=false;return;}
    await loadFishingExtras();idle(loadStoryModules,1800);
  }

  async function handleFishingRequest(){
    if(!isDeck())return;if(!await ensureFishingCore()){window.COFFEE_SHIP_DECK?.showTip?.('釣魚功能載入失敗，請重新整理後再試',2200);return;}
    await loadFishingExtras();window.COFFEE_SHIP_FISHING_API.startFishing();
  }

  function bindTriggers(){
    window.addEventListener('coffee-ship:request-fishing',handleFishingRequest);
    window.addEventListener('coffee-ship:scene',event=>{if(event.detail?.scene==='deck')preloadDeckSystems();else deckPreloadStarted=false;});
    document.addEventListener('click',event=>{if(event.target.closest?.('#backpackSafeOpenBtn'))idle(loadStoryModules,800);if(event.target.closest?.('#fishDexBtn'))preloadDeckSystems();},true);
  }

  function init(){
    bindMobileControls();addBadge();idle(loadCafeEnhancements,800);bindTriggers();if(isDeck())preloadDeckSystems();
    window.COFFEE_SHIP_FEATURE_LOADER={ensureFishingCore,loadFishingExtras,loadStoryModules,preloadDeckSystems,
      fishingReady:()=>fishingCoreReady,fishingAnimation:false,fishDex:true,economy:true,expandedEvents:true,
      adventureEvents:true,coralRoulette:true,seaMerchant:true,pirateGambling:true,totalAdventureEvents:122,version:14};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();