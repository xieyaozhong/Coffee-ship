(() => {
  'use strict';
  if (window.__COFFEE_SHIP_LOGIN_INTERFACE_V3__) return;
  window.__COFFEE_SHIP_LOGIN_INTERFACE_V3__ = true;

  const ANIMALS = {
    human:{emoji:'🙂',body:'#c96a4a',face:'#f0c7a0',accent:'#2b1d16'},
    cat:{emoji:'🐱',body:'#fffdf4',face:'#fffdf4',accent:'#df6d13'},
    dog:{emoji:'🐶',body:'#c08a55',face:'#e3b47c',accent:'#5b3928'},
    rabbit:{emoji:'🐰',body:'#f4efe4',face:'#fff8ef',accent:'#e9a6b0'},
    fox:{emoji:'🦊',body:'#df6d13',face:'#fff0d7',accent:'#2f1b16'},
    bear:{emoji:'🐻',body:'#8a5a3c',face:'#c89162',accent:'#3b241c'},
    penguin:{emoji:'🐧',body:'#1f2430',face:'#f7f3e8',accent:'#e8a23c'},
    pig:{emoji:'🐷',body:'#f4a8bb',face:'#ffc4d0',accent:'#d96f8d'}
  };

  let mode = 'general';
  let previewCanvas = null;
  let previewCtx = null;

  function safeJson(raw,fallback){try{return raw?JSON.parse(raw):fallback;}catch{return fallback;}}
  function px(ctx,x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}

  function currentAnimal(){
    const role=safeJson(localStorage.getItem('coffeeShipRole'),null);
    if(role?.specialHuman)return'human';
    const avatar=safeJson(localStorage.getItem('coffeeShipAvatar'),{});
    return avatar.animal||localStorage.getItem('coffeeShipAnimal')||'human';
  }

  function clearSpecialRoleState(){
    localStorage.removeItem('coffeeShipRole');
    localStorage.removeItem('coffeeShipPendingRoleLogin');
    window.COFFEE_SHIP_PENDING_ROLE=null;
    window.COFFEE_SHIP_FORCE_HUMAN_ROLE=false;
  }

  function drawHuman(ctx,hair,shirt){
    const x=90,y=104;
    ctx.fillStyle='rgba(8,11,20,.55)';ctx.beginPath();ctx.ellipse(x,y+42,30,9,0,Math.PI*2);ctx.fill();
    px(ctx,x-13,y+16,10,22,'#242331');px(ctx,x+3,y+16,10,22,'#242331');
    px(ctx,x-18,y-10,36,31,shirt);px(ctx,x-22,y-5,7,22,'#f0c7a0');px(ctx,x+15,y-5,7,22,'#f0c7a0');
    px(ctx,x-12,y-34,24,22,'#f0c7a0');px(ctx,x-17,y-45,34,17,hair);px(ctx,x-19,y-36,8,20,hair);px(ctx,x+11,y-36,8,20,hair);
    px(ctx,x-7,y-27,4,4,'#21182a');px(ctx,x+4,y-27,4,4,'#21182a');px(ctx,x-4,y-18,8,3,'#b86766');
    px(ctx,x-10,y-6,20,5,'rgba(255,255,255,.22)');
  }

  function drawAnimal(ctx,key,shirt){
    const a=ANIMALS[key]||ANIMALS.human;
    if(key==='human'){drawHuman(ctx,'#2b1d16',shirt);return;}
    const x=90,y=106;
    ctx.fillStyle='rgba(8,11,20,.55)';ctx.beginPath();ctx.ellipse(x,y+41,31,9,0,Math.PI*2);ctx.fill();
    px(ctx,x-16,y-22,32,27,a.body);px(ctx,x-12,y-18,24,19,a.face);
    if(key==='rabbit'){
      px(ctx,x-13,y-50,8,30,a.body);px(ctx,x+5,y-50,8,30,a.body);px(ctx,x-10,y-45,3,21,a.accent);px(ctx,x+8,y-45,3,21,a.accent);
    }else if(key==='pig'){
      px(ctx,x-17,y-30,9,9,a.body);px(ctx,x+8,y-30,9,9,a.body);px(ctx,x-7,y-6,14,8,a.accent);
    }else if(key==='dog'){
      px(ctx,x-21,y-20,8,21,a.accent);px(ctx,x+13,y-20,8,21,a.accent);
    }else if(key==='bear'){
      px(ctx,x-18,y-29,9,9,a.body);px(ctx,x+9,y-29,9,9,a.body);
    }else{
      px(ctx,x-16,y-31,10,12,a.body);px(ctx,x+6,y-31,10,12,a.body);
    }
    px(ctx,x-7,y-12,4,4,'#21182a');px(ctx,x+4,y-12,4,4,'#21182a');px(ctx,x-3,y-4,6,3,'#b86766');
    px(ctx,x-15,y+3,30,27,shirt||a.body);px(ctx,x-12,y+27,8,15,'#242331');px(ctx,x+4,y+27,8,15,'#242331');
    if(key==='fox')px(ctx,x+15,y+6,18,9,a.accent);
    if(key==='cat')px(ctx,x+15,y+5,15,7,a.accent);
    ctx.font='25px system-ui';ctx.textAlign='center';ctx.fillText(a.emoji,x,y-62);
  }

  function drawPreview(){
    if(!previewCtx||!previewCanvas)return;
    const nameInput=document.getElementById('playerName');
    const hair=document.getElementById('hairColor')?.value||'#2b1d16';
    const shirt=document.getElementById('shirtColor')?.value||'#c96a4a';
    previewCtx.clearRect(0,0,180,180);
    const gradient=previewCtx.createLinearGradient(0,0,0,180);
    gradient.addColorStop(0,'#121b42');gradient.addColorStop(1,'#1a1220');previewCtx.fillStyle=gradient;previewCtx.fillRect(0,0,180,180);
    for(let i=0;i<18;i++)px(previewCtx,(i*47)%180,12+(i*29)%78,i%4===0?3:2,i%4===0?3:2,i%3===0?'#fff4d8':'#8198cd');
    previewCtx.fillStyle='#49302d';previewCtx.fillRect(0,142,180,38);previewCtx.fillStyle='#7b513d';previewCtx.fillRect(0,146,180,4);
    const animal=currentAnimal();
    if(animal==='human')drawHuman(previewCtx,hair,shirt);else drawAnimal(previewCtx,animal,shirt);
    const previewName=document.getElementById('loginPreviewName');
    if(previewName)previewName.textContent=(nameInput?.value||'').trim()||'海上旅人';
    const caption=document.getElementById('loginPreviewCaption');
    if(caption)caption.textContent=animal==='human'?'GENERAL TRAVELER':`${ANIMALS[animal]?.emoji||'🎲'} RANDOM ADVENTURER`;
  }

  function setStatus(text,type=''){
    const status=document.getElementById('loginStatus');
    if(!status)return;
    status.textContent=text||'';
    status.classList.toggle('is-error',type==='error');
    status.classList.toggle('is-ok',type==='ok');
  }

  function setMode(next){
    mode=next==='special'?'special':'general';
    document.querySelectorAll('.login-mode-tab').forEach(button=>{
      const active=button.dataset.loginMode===mode;
      button.classList.toggle('is-active',active);
      button.setAttribute('aria-selected',String(active));
    });
    const general=document.getElementById('loginGeneralPanel');
    const special=document.getElementById('loginSpecialPanel');
    if(general)general.hidden=mode!=='general';
    if(special)special.hidden=mode!=='special';
    setStatus(mode==='special'?'選擇一名特殊角色，再按特殊角色登船。':'一般登船會使用目前保存的分身，也可以選擇隨機動物冒險。');
    if(mode==='special')setTimeout(()=>document.getElementById('roleCode')?.focus(),80);
  }

  function moveRoleBox(){
    const holder=document.getElementById('loginRoleHolder');
    const roleBox=document.querySelector('.role-code-box');
    if(!holder||!roleBox)return false;
    const collapse=document.getElementById('roleCollapseBox');
    if(collapse&&collapse.contains(roleBox)){
      collapse.insertAdjacentElement('beforebegin',roleBox);
      collapse.remove();
    }
    if(roleBox.parentElement!==holder)holder.appendChild(roleBox);
    holder.querySelector('.login-role-loading')?.remove();
    const enter=document.getElementById('roleEnterBtn');
    if(enter)enter.textContent='特殊角色登船';
    const input=document.getElementById('roleCode');
    if(input)input.placeholder='輸入角色編號';
    return true;
  }

  function normalizeDynamicElements(){
    document.getElementById('creator')?.classList.add('login-interface-ready');
    const actions=document.getElementById('loginActions');
    const random=document.getElementById('randomAnimalBtn');
    if(actions&&random&&random.parentElement!==actions)actions.appendChild(random);
    if(random){random.textContent='🎲 隨機動物冒險';random.style.marginLeft='0';}
    document.getElementById('animalHint')?.remove();
    moveRoleBox();
  }

  function selectRole(code){
    setMode('special');
    const input=document.getElementById('roleCode');
    if(input){input.value=code;input.dispatchEvent(new Event('input',{bubbles:true}));}
    document.querySelectorAll('.login-role-card').forEach(card=>card.classList.toggle('is-selected',card.dataset.roleCode===code));
    const selected=document.querySelector(`.login-role-card[data-role-code="${code}"] strong`)?.textContent||'特殊角色';
    setStatus(`已選擇 ${selected}，按「特殊角色登船」進入。`,'ok');
  }

  function bindStaticEvents(){
    document.querySelectorAll('.login-mode-tab').forEach(button=>{
      if(button.dataset.loginBound)return;
      button.dataset.loginBound='true';
      button.addEventListener('click',()=>setMode(button.dataset.loginMode));
    });
    document.querySelectorAll('.login-role-card').forEach(card=>{
      if(card.dataset.loginBound)return;
      card.dataset.loginBound='true';
      card.addEventListener('click',()=>selectRole(card.dataset.roleCode));
    });
    ['playerName','hairColor','shirtColor'].forEach(id=>{
      const element=document.getElementById(id);
      if(!element||element.dataset.previewBound)return;
      element.dataset.previewBound='true';
      element.addEventListener('input',drawPreview);
    });
    const nameInput=document.getElementById('playerName');
    if(nameInput&&!nameInput.dataset.enterBound){
      nameInput.dataset.enterBound='true';
      nameInput.addEventListener('keydown',event=>{
        if(event.key!=='Enter')return;
        event.preventDefault();
        document.getElementById('startBtn')?.click();
      });
    }
  }

  function installCaptureGuard(){
    if(document.documentElement.dataset.loginGuardInstalled)return;
    document.documentElement.dataset.loginGuardInstalled='true';
    document.addEventListener('click',event=>{
      const random=event.target.closest?.('#randomAnimalBtn');
      if(random){clearSpecialRoleState();setStatus('正在抽選動物分身……','ok');return;}
      const start=event.target.closest?.('#startBtn');
      if(!start)return;
      const specialLaunch=window.COFFEE_SHIP_FORCE_HUMAN_ROLE||localStorage.getItem('coffeeShipPendingRoleLogin');
      if(mode==='general'&&!specialLaunch)clearSpecialRoleState();
      const nameInput=document.getElementById('playerName');
      let name=(nameInput?.value||'').trim().replace(/\s+/g,' ').slice(0,12);
      if(!name){name=`海上旅人${Math.floor(Math.random()*90+10)}`;if(nameInput)nameInput.value=name;}
      setStatus(`歡迎 ${name}，正在準備登船……`,'ok');
    },true);
  }

  function init(){
    const creator=document.getElementById('creator');
    const interfaceRoot=document.getElementById('loginInterface');
    if(!creator||!interfaceRoot)return;
    creator.classList.add('login-interface-ready');
    previewCanvas=document.getElementById('loginAvatarPreview');
    previewCtx=previewCanvas?.getContext('2d');
    if(previewCtx)previewCtx.imageSmoothingEnabled=false;
    bindStaticEvents();
    installCaptureGuard();
    normalizeDynamicElements();
    drawPreview();
    setMode('general');

    const observer=new MutationObserver(()=>{
      normalizeDynamicElements();
      bindStaticEvents();
    });
    observer.observe(creator,{childList:true,subtree:true});
    let attempts=0;
    const timer=setInterval(()=>{
      attempts++;
      normalizeDynamicElements();
      if((document.getElementById('randomAnimalBtn')&&document.querySelector('#loginRoleHolder .role-code-box'))||attempts>40)clearInterval(timer);
    },200);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
