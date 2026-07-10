(() => {
  'use strict';
  if (window.__COFFEE_SHIP_BOARDING_CORE_V4__) return;
  window.__COFFEE_SHIP_BOARDING_CORE_V4__ = true;

  const AVATAR_KEY='coffeeShipAvatar';
  const ANIMAL_KEY='coffeeShipAnimal';
  const ROLE_KEY='coffeeShipRole';
  const ANIMALS=['human','cat','dog','rabbit','fox','bear','penguin','pig'];
  const RANDOM_NAMES=['拿鐵旅人','漂流豆豆','星光客人','小小船員','焦糖小豬','雲朵咖啡','午夜兔兔','微笑熊熊'];
  let entering=false;
  let entered=false;
  let lastPointerBoarding=0;

  function readJson(key,fallback={}) {
    try { return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function cleanName(value) {
    const name=String(value||'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,12);
    return name||`海上旅人${Math.floor(Math.random()*90+10)}`;
  }

  function currentAnimal() {
    const role=readJson(ROLE_KEY,null);
    if(role?.specialHuman)return'human';
    const stored=readJson(AVATAR_KEY,{});
    return stored.animal||localStorage.getItem(ANIMAL_KEY)||window.COFFEE_SHIP_GAME_API?.player?.animal||'human';
  }

  function restoreCanvas() {
    const canvas=document.getElementById('game');
    if(!canvas)return;
    if(canvas.width<300||canvas.height<180||canvas.dataset.deckPaused==='true'){
      canvas.width=960;
      canvas.height=576;
    }
    canvas.removeAttribute('data-deck-paused');
    canvas.style.removeProperty('display');
    canvas.style.removeProperty('visibility');
    canvas.style.removeProperty('opacity');
  }

  function notifyModules(avatar,source) {
    setTimeout(()=>{
      for(const [name,detail] of [
        ['coffee-ship:entered',{source,avatar,boardingVersion:4}],
        ['coffee-ship:scene',{scene:'cafe',source:'boarding-core'}],
        ['coffee-ship:boarding-complete',{source,avatar,version:4}]
      ]){
        try{window.dispatchEvent(new CustomEvent(name,{detail}));}
        catch(error){console.warn(`${name} listener failed`,error);}
      }
      try{window.COFFEE_SHIP_RUNTIME?.repair?.('boarding-complete');}
      catch(error){console.warn('boarding runtime repair failed',error);}
    },0);
  }

  function buildAvatar() {
    const api=window.COFFEE_SHIP_GAME_API;
    const role=readJson(ROLE_KEY,null);
    const effect=window.COFFEE_SHIP_COFFEE_EFFECT;
    return{
      name:cleanName(document.getElementById('playerName')?.value||role?.name||api?.player?.name),
      hair:document.getElementById('hairColor')?.value||api?.player?.hair||'#2b1d16',
      shirt:document.getElementById('shirtColor')?.value||api?.player?.shirt||'#c96a4a',
      coffeeType:effect?.name||'',
      animal:currentAnimal()
    };
  }

  function applyAvatar(avatar) {
    const player=window.COFFEE_SHIP_GAME_API?.player;
    if(player){
      Object.assign(player,{name:avatar.name,hair:avatar.hair,shirt:avatar.shirt,animal:avatar.animal,coffeeType:avatar.coffeeType,hasCoffee:!!window.COFFEE_SHIP_COFFEE_EFFECT});
    }
    localStorage.setItem(AVATAR_KEY,JSON.stringify(avatar));
    localStorage.setItem(ANIMAL_KEY,avatar.animal);
    const input=document.getElementById('playerName');
    if(input)input.value=avatar.name;
  }

  function showGame(avatar,source) {
    const creator=document.getElementById('creator');
    const gamePanel=document.getElementById('gamePanel');
    if(!creator||!gamePanel)return false;
    creator.classList.add('hidden');
    gamePanel.classList.remove('hidden');
    for(const property of ['display','visibility','opacity','height','min-height'])gamePanel.style.removeProperty(property);
    document.documentElement.classList.remove('login-resetting');
    document.body.classList.remove('login-resetting','safe-cafe-fallback');
    document.body.classList.add('coffee-ship-entered');
    document.body.dataset.coffeeShipScene='cafe';
    window.COFFEE_SHIP_SCENE='cafe';
    restoreCanvas();
    const nameNode=document.getElementById('avatarName');
    if(nameNode)nameNode.textContent=avatar.name;
    const status=document.getElementById('statusText');
    if(status)status.textContent='本機模式・已登船';
    const mood=document.getElementById('moodDot');
    if(mood)mood.style.background='#79d0b1';
    notifyModules(avatar,source);
    return true;
  }

  function enter(source='button') {
    if(entering)return false;
    const creator=document.getElementById('creator');
    const gamePanel=document.getElementById('gamePanel');
    if(!creator||!gamePanel)return false;
    if(entered&&creator.classList.contains('hidden')&&!gamePanel.classList.contains('hidden'))return true;
    entering=true;
    try{
      const avatar=buildAvatar();
      applyAvatar(avatar);
      entered=showGame(avatar,source);
      return entered;
    }catch(error){
      console.error('boarding core failed',error);
      setTimeout(()=>window.COFFEE_SHIP_RUNTIME?.toast?.('登船資料修復中，請再按一次登船。','error',3200),0);
      return false;
    }finally{entering=false;}
  }

  function interceptClick(event) {
    if(!event.target?.closest?.('#startBtn'))return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(Date.now()-lastPointerBoarding>500)enter(event.isTrusted?'user-click':'programmatic-click');
  }

  function rebuildStartButton() {
    const oldButton=document.getElementById('startBtn');
    if(!oldButton)return null;
    const button=oldButton.cloneNode(true);
    button.id='startBtn';
    button.type='button';
    button.disabled=false;
    button.dataset.boardingCore='4';
    oldButton.replaceWith(button);

    button.addEventListener('pointerup',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      lastPointerBoarding=Date.now();
      enter('pointer');
    },true);
    button.addEventListener('keydown',event=>{
      if(event.key!=='Enter'&&event.key!==' ')return;
      event.preventDefault();
      event.stopImmediatePropagation();
      enter('keyboard');
    },true);
    return button;
  }

  function rebuildRandomButton() {
    const old=document.getElementById('randomAnimalBtn');
    if(!old)return;
    const button=old.cloneNode(true);
    old.replaceWith(button);
    button.addEventListener('pointerup',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      const animal=ANIMALS[Math.floor(Math.random()*ANIMALS.length)];
      const name=`${RANDOM_NAMES[Math.floor(Math.random()*RANDOM_NAMES.length)]}${Math.floor(Math.random()*90+10)}`;
      localStorage.removeItem(ROLE_KEY);
      localStorage.setItem(ANIMAL_KEY,animal);
      const input=document.getElementById('playerName');
      if(input)input.value=name;
      enter('random-animal');
    },true);
  }

  function resumeSavedAvatar() {
    const creator=document.getElementById('creator');
    const gamePanel=document.getElementById('gamePanel');
    const avatar=readJson(AVATAR_KEY,null);
    if(!avatar||!creator||!gamePanel)return;
    if(document.body.classList.contains('coffee-ship-entered')&&gamePanel.classList.contains('hidden')){
      applyAvatar({...avatar,name:cleanName(avatar.name)});
      entered=showGame(avatar,'resume-repair');
    }
  }

  function init() {
    rebuildStartButton();
    rebuildRandomButton();
    document.addEventListener('click',interceptClick,true);
    resumeSavedAvatar();
    window.COFFEE_SHIP_BOARDING={enter,rebuild:rebuildStartButton,state:()=>({entering,entered}),version:4};
    setTimeout(()=>window.dispatchEvent(new CustomEvent('coffee-ship:boarding-ready',{detail:{version:4}})),0);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();