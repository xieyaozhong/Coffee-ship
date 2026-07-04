(() => {
  'use strict';
  if (window.__COFFEE_SHIP_LOGIN_INTERFACE_FIX__) return;
  window.__COFFEE_SHIP_LOGIN_INTERFACE_FIX__ = true;

  const ROLE_OPTIONS = [
    {code:'VIOLIN2026', icon:'🎻', name:'小提琴手', desc:'演奏旋律'},
    {code:'SINGER2026', icon:'🎤', name:'歌手', desc:'唱出船歌'},
    {code:'PIRATE2026', icon:'🏴‍☠️', name:'海盜', desc:'召喚金光'},
    {code:'MAID2026', icon:'❤️', name:'女僕服務生', desc:'散播開心'}
  ];
  const ANIMAL = {
    human:{emoji:'🙂',body:'#c96a4a',face:'#f0c7a0',accent:'#2b1d16'},
    cat:{emoji:'🐱',body:'#fffdf4',face:'#fffdf4',accent:'#df6d13'},
    dog:{emoji:'🐶',body:'#c08a55',face:'#e3b47c',accent:'#5b3928'},
    rabbit:{emoji:'🐰',body:'#f4efe4',face:'#fff8ef',accent:'#e9a6b0'},
    fox:{emoji:'🦊',body:'#df6d13',face:'#fff0d7',accent:'#2f1b16'},
    bear:{emoji:'🐻',body:'#8a5a3c',face:'#c89162',accent:'#3b241c'},
    penguin:{emoji:'🐧',body:'#1f2430',face:'#f7f3e8',accent:'#e8a23c'},
    pig:{emoji:'🐷',body:'#f4a8bb',face:'#ffc4d0',accent:'#d96f8d'}
  };

  let built = false;
  let mode = 'general';
  let previewCanvas = null;
  let previewCtx = null;
  let roleAttachTimer = 0;

  function safeJson(raw, fallback) {
    try { return raw ? JSON.parse(raw) : fallback; }
    catch { return fallback; }
  }

  function currentAnimal() {
    const role = safeJson(localStorage.getItem('coffeeShipRole'), null);
    if (role?.specialHuman) return 'human';
    const avatar = safeJson(localStorage.getItem('coffeeShipAvatar'), {});
    return avatar.animal || localStorage.getItem('coffeeShipAnimal') || 'human';
  }

  function px(ctx,x,y,w,h,color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x),Math.round(y),w,h);
  }

  function drawHuman(ctx, hair, shirt) {
    const x=90,y=104;
    ctx.save();
    ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=12;
    ctx.fillStyle='rgba(8,11,20,.55)';ctx.beginPath();ctx.ellipse(x,y+42,30,9,0,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
    px(ctx,x-13,y+16,10,22,'#242331');px(ctx,x+3,y+16,10,22,'#242331');
    px(ctx,x-18,y-10,36,31,shirt);px(ctx,x-22,y-5,7,22,'#f0c7a0');px(ctx,x+15,y-5,7,22,'#f0c7a0');
    px(ctx,x-12,y-34,24,22,'#f0c7a0');px(ctx,x-17,y-45,34,17,hair);px(ctx,x-19,y-36,8,20,hair);px(ctx,x+11,y-36,8,20,hair);
    px(ctx,x-7,y-27,4,4,'#21182a');px(ctx,x+4,y-27,4,4,'#21182a');px(ctx,x-4,y-18,8,3,'#b86766');
    px(ctx,x-10,y-6,20,5,'rgba(255,255,255,.22)');
    ctx.restore();
  }

  function drawAnimal(ctx, key, shirt) {
    const a=ANIMAL[key]||ANIMAL.human;
    if(key==='human'){drawHuman(ctx,'#2b1d16',shirt);return;}
    const x=90,y=106;
    ctx.save();
    ctx.fillStyle='rgba(8,11,20,.55)';ctx.beginPath();ctx.ellipse(x,y+41,31,9,0,0,Math.PI*2);ctx.fill();
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
    ctx.restore();
  }

  function drawPreview() {
    if (!previewCtx || !previewCanvas) return;
    const nameInput=document.getElementById('playerName');
    const hairInput=document.getElementById('hairColor');
    const shirtInput=document.getElementById('shirtColor');
    const ctx=previewCtx;
    ctx.clearRect(0,0,180,180);
    const gradient=ctx.createLinearGradient(0,0,0,180);
    gradient.addColorStop(0,'#121b42');gradient.addColorStop(1,'#1a1220');ctx.fillStyle=gradient;ctx.fillRect(0,0,180,180);
    for(let i=0;i<18;i++){px(ctx,(i*47)%180,12+(i*29)%78,i%4===0?3:2,i%4===0?3:2,i%3===0?'#fff4d8':'#8198cd');}
    ctx.fillStyle='#49302d';ctx.fillRect(0,142,180,38);ctx.fillStyle='#7b513d';ctx.fillRect(0,146,180,4);
    const key=currentAnimal();
    if(key==='human')drawHuman(ctx,hairInput?.value||'#2b1d16',shirtInput?.value||'#c96a4a');
    else drawAnimal(ctx,key,shirtInput?.value||ANIMAL[key]?.body);
    const name=document.getElementById('loginPreviewName');
    if(name)name.textContent=(nameInput?.value||'').trim()||'海上旅人';
    const caption=document.getElementById('loginPreviewCaption');
    if(caption)caption.textContent=key==='human'?'GENERAL TRAVELER':`${ANIMAL[key]?.emoji||'🎲'} RANDOM ADVENTURER`;
  }

  function setStatus(text, type='') {
    const status=document.getElementById('loginStatus');
    if(!status)return;
    status.textContent=text||'';
    status.classList.toggle('is-error',type==='error');
    status.classList.toggle('is-ok',type==='ok');
  }

  function setMode(next) {
    mode=next==='special'?'special':'general';
    document.querySelectorAll('.login-mode-tab').forEach(btn=>{
      const active=btn.dataset.loginMode===mode;
      btn.classList.toggle('is-active',active);
      btn.setAttribute('aria-selected',String(active));
    });
    const general=document.getElementById('loginGeneralPanel');
    const special=document.getElementById('loginSpecialPanel');
    if(general)general.hidden=mode!=='general';
    if(special)special.hidden=mode!=='special';
    setStatus(mode==='special'?'特殊角色會固定使用精緻人類造型。':'一般登船會使用目前保存的分身；也可以選擇隨機動物冒險。','');
    if(mode==='special')setTimeout(()=>document.getElementById('roleCode')?.focus(),80);
  }

  function unwrapLegacyRoleCollapse(roleBox) {
    const collapse=document.getElementById('roleCollapseBox');
    if(!collapse||!collapse.contains(roleBox))return;
    collapse.insertAdjacentElement('beforebegin',roleBox);
    collapse.remove();
  }

  function attachRoleBox() {
    const holder=document.getElementById('loginRoleHolder');
    const roleBox=document.querySelector('.role-code-box');
    if(!holder||!roleBox)return false;
    unwrapLegacyRoleCollapse(roleBox);
    if(roleBox.parentElement!==holder)holder.appendChild(roleBox);
    const enter=document.getElementById('roleEnterBtn');
    if(enter)enter.textContent='特殊角色登船';
    const input=document.getElementById('roleCode');
    if(input)input.placeholder='輸入角色編號';
    const note=document.getElementById('roleCodeNote');
    if(note&&!note.dataset.loginFixed){
      note.dataset.loginFixed='true';
      note.textContent='請選擇上方角色，或輸入已知角色編號。特殊角色與隨機動物分身彼此獨立。';
    }
    return true;
  }

  function selectRole(code) {
    const input=document.getElementById('roleCode');
    if(input){input.value=code;input.dispatchEvent(new Event('input',{bubbles:true}));}
    document.querySelectorAll('.login-role-card').forEach(card=>card.classList.toggle('is-selected',card.dataset.roleCode===code));
    const role=ROLE_OPTIONS.find(item=>item.code===code);
    setStatus(role?`已選擇 ${role.icon} ${role.name}，按「特殊角色登船」進入。`:'','ok');
  }

  function bindEvents() {
    ['playerName','hairColor','shirtColor'].forEach(id=>document.getElementById(id)?.addEventListener('input',drawPreview));
    document.querySelectorAll('.login-mode-tab').forEach(btn=>btn.addEventListener('click',()=>setMode(btn.dataset.loginMode)));
    document.querySelectorAll('.login-role-card').forEach(card=>card.addEventListener('click',()=>selectRole(card.dataset.roleCode)));

    const nameInput=document.getElementById('playerName');
    nameInput?.addEventListener('keydown',event=>{
      if(event.key!=='Enter')return;
      event.preventDefault();
      document.getElementById('startBtn')?.click();
    });
    nameInput?.addEventListener('focus',()=>setTimeout(()=>nameInput.scrollIntoView({block:'center',behavior:'smooth'}),180));

    const start=document.getElementById('startBtn');
    start?.addEventListener('click',()=>{
      let name=(nameInput?.value||'').trim().replace(/\s+/g,' ').slice(0,12);
      if(!name){name=`海上旅人${Math.floor(Math.random()*90+10)}`;if(nameInput)nameInput.value=name;}
      setStatus(`歡迎 ${name}，正在準備登船……`,'ok');
    },true);

    const random=document.getElementById('randomAnimalBtn');
    if(random){
      random.textContent='🎲 隨機動物冒險';
      random.addEventListener('click',()=>setStatus('正在抽選動物分身……','ok'),true);
    }

    document.getElementById('roleEnterBtn')?.addEventListener('click',()=>{
      const code=document.getElementById('roleCode')?.value.trim();
      if(!code)setStatus('請先選擇一名特殊角色。','error');
      else setStatus('正在載入特殊角色造型……','ok');
    },true);
  }

  function build() {
    if(built)return true;
    const creator=document.getElementById('creator');
    const formGrid=creator?.querySelector('.form-grid');
    const start=document.getElementById('startBtn');
    const random=document.getElementById('randomAnimalBtn');
    if(!creator||!formGrid||!start||!random)return false;

    built=true;
    creator.classList.add('login-interface-ready');
    const legacyTitle=creator.querySelector(':scope > h2');
    if(legacyTitle)legacyTitle.hidden=true;
    const coffee=document.getElementById('coffeeType');
    const coffeeLabel=coffee?.closest('label');
    if(coffeeLabel)coffeeLabel.classList.add('login-legacy-field');

    const ui=document.createElement('div');
    ui.id='loginInterface';
    ui.className='login-interface';
    ui.innerHTML=`
      <section class="login-visual" aria-label="角色預覽">
        <div class="login-brand">
          <p class="eyebrow">WELCOME ABOARD</p>
          <h2>Coffee Ship</h2>
          <p>建立分身、選擇身分，從漂浮咖啡廳開始你的海上故事。</p>
        </div>
        <div class="login-preview-card">
          <canvas id="loginAvatarPreview" width="180" height="180"></canvas>
          <strong id="loginPreviewName" class="login-preview-name">海上旅人</strong>
          <span id="loginPreviewCaption" class="login-preview-caption">GENERAL TRAVELER</span>
        </div>
        <div class="login-visual-footer">
          <span class="login-feature-chip">☕ 珍珠咖啡</span>
          <span class="login-feature-chip">🎣 深海釣魚</span>
          <span class="login-feature-chip">🍾 漂流故事</span>
        </div>
      </section>
      <section class="login-controls">
        <header class="login-controls-header">
          <h3>選擇登船方式</h3>
          <p>一般旅人與特殊角色分開登入，角色資料會保存在這台裝置。</p>
        </header>
        <div class="login-mode-tabs" role="tablist" aria-label="登入方式">
          <button type="button" class="login-mode-tab is-active" data-login-mode="general" role="tab" aria-selected="true">🌊 一般旅人</button>
          <button type="button" class="login-mode-tab" data-login-mode="special" role="tab" aria-selected="false">👑 特殊角色</button>
        </div>
        <div id="loginGeneralPanel" class="login-panel login-general-panel" role="tabpanel">
          <div id="loginFormHolder"></div>
          <div id="loginActions" class="login-actions"></div>
        </div>
        <div id="loginSpecialPanel" class="login-panel login-special-panel" role="tabpanel" hidden>
          <div class="login-role-grid">
            ${ROLE_OPTIONS.map(role=>`<button type="button" class="login-role-card" data-role-code="${role.code}"><span class="login-role-icon">${role.icon}</span><span><strong>${role.name}</strong><small>${role.desc}</small></span></button>`).join('')}
          </div>
          <div id="loginRoleHolder"></div>
        </div>
        <p id="loginStatus" class="login-status" aria-live="polite"></p>
      </section>`;

    const firstChild=creator.firstElementChild;
    creator.insertBefore(ui,firstChild);
    document.getElementById('loginFormHolder').appendChild(formGrid);
    const actions=document.getElementById('loginActions');
    actions.appendChild(start);actions.appendChild(random);
    attachRoleBox();
    previewCanvas=document.getElementById('loginAvatarPreview');
    previewCtx=previewCanvas?.getContext('2d');
    if(previewCtx)previewCtx.imageSmoothingEnabled=false;
    bindEvents();
    drawPreview();
    setMode('general');

    roleAttachTimer=window.setInterval(()=>{
      if(attachRoleBox())window.clearInterval(roleAttachTimer);
    },180);
    window.setTimeout(()=>window.clearInterval(roleAttachTimer),6000);
    return true;
  }

  function init() {
    if(build())return;
    let attempts=0;
    const timer=setInterval(()=>{
      attempts++;
      if(build()||attempts>40)clearInterval(timer);
    },150);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
