(() => {
  'use strict';
  if (window.__COFFEE_SHIP_BOARDING_CORE_V3__) return;
  window.__COFFEE_SHIP_BOARDING_CORE_V3__ = true;

  const AVATAR_KEY = 'coffeeShipAvatar';
  const ANIMAL_KEY = 'coffeeShipAnimal';
  const ROLE_KEY = 'coffeeShipRole';
  let entering = false;
  let entered = false;

  function readJson(key,fallback={}) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function cleanName(value) {
    const name=String(value || '').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,12);
    return name || `海上旅人${Math.floor(Math.random()*90+10)}`;
  }

  function currentAnimal() {
    const role=readJson(ROLE_KEY,null);
    if(role?.specialHuman) return 'human';
    const stored=readJson(AVATAR_KEY,{});
    return stored.animal || localStorage.getItem(ANIMAL_KEY) || window.COFFEE_SHIP_GAME_API?.player?.animal || 'human';
  }

  function restoreCanvas() {
    const canvas=document.getElementById('game');
    if(!canvas) return;
    if(canvas.width<300 || canvas.height<180 || canvas.dataset.deckPaused==='true') {
      canvas.width=960;
      canvas.height=576;
    }
    canvas.removeAttribute('data-deck-paused');
    canvas.style.removeProperty('display');
    canvas.style.removeProperty('visibility');
    canvas.style.removeProperty('opacity');
  }

  function notifyModules(avatar,source) {
    setTimeout(() => {
      const notifications=[
        ['coffee-ship:entered',{source,avatar,boardingVersion:3}],
        ['coffee-ship:scene',{scene:'cafe',source:'boarding-core'}],
        ['coffee-ship:boarding-complete',{source,avatar,version:3}]
      ];
      for(const [name,detail] of notifications) {
        try { window.dispatchEvent(new CustomEvent(name,{detail})); }
        catch(error) { console.warn(`${name} listener failed`,error); }
      }
      try { window.COFFEE_SHIP_RUNTIME?.repair?.('boarding-complete'); }
      catch(error) { console.warn('boarding runtime repair failed',error); }
    },0);
  }

  function showGame(avatar,source='button') {
    const creator=document.getElementById('creator');
    const gamePanel=document.getElementById('gamePanel');
    if(!creator || !gamePanel) return false;

    creator.classList.add('hidden');
    gamePanel.classList.remove('hidden');
    gamePanel.style.removeProperty('display');
    gamePanel.style.removeProperty('visibility');
    gamePanel.style.removeProperty('opacity');
    gamePanel.style.removeProperty('height');
    gamePanel.style.removeProperty('min-height');
    document.documentElement.classList.remove('login-resetting');
    document.body.classList.remove('login-resetting','safe-cafe-fallback');
    document.body.classList.add('coffee-ship-entered');
    document.body.dataset.coffeeShipScene='cafe';
    window.COFFEE_SHIP_SCENE='cafe';
    restoreCanvas();

    const nameNode=document.getElementById('avatarName');
    if(nameNode) nameNode.textContent=avatar.name;
    const status=document.getElementById('statusText');
    if(status) status.textContent='本機模式・已登船';
    const mood=document.getElementById('moodDot');
    if(mood) mood.style.background='#79d0b1';

    notifyModules(avatar,source);
    return true;
  }

  function buildAvatar() {
    const api=window.COFFEE_SHIP_GAME_API;
    const role=readJson(ROLE_KEY,null);
    const effect=window.COFFEE_SHIP_COFFEE_EFFECT;
    const name=cleanName(document.getElementById('playerName')?.value || role?.name || api?.player?.name);
    const hair=document.getElementById('hairColor')?.value || api?.player?.hair || '#2b1d16';
    const shirt=document.getElementById('shirtColor')?.value || api?.player?.shirt || '#c96a4a';
    const animal=currentAnimal();
    return {name,hair,shirt,coffeeType:effect?.name || '',animal};
  }

  function applyAvatar(avatar) {
    const api=window.COFFEE_SHIP_GAME_API;
    if(api?.player) {
      api.player.name=avatar.name;
      api.player.hair=avatar.hair;
      api.player.shirt=avatar.shirt;
      api.player.animal=avatar.animal;
      api.player.coffeeType=avatar.coffeeType;
      api.player.hasCoffee=!!window.COFFEE_SHIP_COFFEE_EFFECT;
    }
    localStorage.setItem(AVATAR_KEY,JSON.stringify(avatar));
    localStorage.setItem(ANIMAL_KEY,avatar.animal);
    const input=document.getElementById('playerName');
    if(input) input.value=avatar.name;
  }

  function enter(source='button') {
    if(entering) return false;
    const creator=document.getElementById('creator');
    const gamePanel=document.getElementById('gamePanel');
    if(!creator || !gamePanel) return false;
    if(entered && creator.classList.contains('hidden') && !gamePanel.classList.contains('hidden')) return true;

    entering=true;
    try {
      const avatar=buildAvatar();
      applyAvatar(avatar);
      const success=showGame(avatar,source);
      entered=success;
      return success;
    } catch(error) {
      console.error('boarding core failed',error);
      setTimeout(() => window.COFFEE_SHIP_RUNTIME?.toast?.('登船資料修復中，請再按一次登船。','error',3200),0);
      return false;
    } finally {
      entering=false;
    }
  }

  function intercept(event) {
    const button=event.target?.closest?.('#startBtn');
    if(!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    enter(event.isTrusted ? 'user-button' : 'programmatic-button');
  }

  function resumeSavedAvatar() {
    const creator=document.getElementById('creator');
    const gamePanel=document.getElementById('gamePanel');
    const avatar=readJson(AVATAR_KEY,null);
    if(!avatar || !creator || !gamePanel) return;
    if(document.body.classList.contains('coffee-ship-entered') && gamePanel.classList.contains('hidden')) {
      applyAvatar({...avatar,name:cleanName(avatar.name)});
      showGame(avatar,'resume-repair');
      entered=true;
    }
  }

  function init() {
    document.addEventListener('click',intercept,true);
    resumeSavedAvatar();
    window.COFFEE_SHIP_BOARDING={enter,state:()=>({entering,entered}),version:3};
    setTimeout(() => window.dispatchEvent(new CustomEvent('coffee-ship:boarding-ready',{detail:{version:3}})),0);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();