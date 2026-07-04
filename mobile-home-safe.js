(() => {
  'use strict';

  function mountHelp() {
    const creator=document.getElementById('creator');
    if(!creator||creator.classList.contains('login-interface-ready'))return;
    const hint=creator.querySelector(':scope > .hint');
    if(!hint||document.getElementById('quickHelpBox'))return;
    const box=document.createElement('details');
    box.id='quickHelpBox';box.className='quick-help-box';box.innerHTML='<summary>❔ 操作說明</summary><div class="quick-help-content"></div>';box.querySelector('.quick-help-content').textContent=hint.textContent;hint.insertAdjacentElement('afterend',box);
  }

  function mountRoleCollapse() {
    if(document.getElementById('loginInterface'))return;
    const roleBox=document.querySelector('.role-code-box');
    if(!roleBox||document.getElementById('roleCollapseBox'))return;
    const wrapper=document.createElement('details');
    wrapper.id='roleCollapseBox';wrapper.className='role-collapse-box';wrapper.innerHTML='<summary>👑 特殊角色登入</summary><div class="role-collapse-content"></div>';roleBox.insertAdjacentElement('beforebegin',wrapper);wrapper.querySelector('.role-collapse-content').appendChild(roleBox);
  }

  function renameRandom() {
    const btn=document.getElementById('randomAnimalBtn');
    if(btn)btn.textContent=document.getElementById('loginInterface')?'🎲 隨機動物冒險':'🎲 隨機冒險';
  }

  function addStyle() {
    if(document.getElementById('mobileHomeSafeStyle'))return;
    const style=document.createElement('style');style.id='mobileHomeSafeStyle';style.textContent=`
      .quick-help-box,.role-collapse-box{margin-top:12px;border:2px solid rgba(118,83,106,.55);border-radius:16px;background:rgba(18,11,23,.42);overflow:hidden}
      .quick-help-box summary,.role-collapse-box summary{list-style:none;cursor:pointer;padding:12px 14px;font-weight:900;color:#fff4d8}
      .quick-help-box summary::-webkit-details-marker,.role-collapse-box summary::-webkit-details-marker{display:none}
      .quick-help-content,.role-collapse-content{padding:0 14px 14px;color:#d0bfa8;line-height:1.55;font-weight:800}
      .role-collapse-content .role-code-box{margin-top:0!important;padding:0!important;border:0!important;background:transparent!important}
      @media(max-width:760px){.creator:not(.login-interface-ready)>.hint{display:none!important}.quick-help-content{font-size:13px}.role-collapse-box:not([open]){margin-bottom:0}}
    `;document.head.appendChild(style);
  }

  function init() {
    addStyle();mountHelp();renameRandom();
    const timer=setInterval(()=>{mountRoleCollapse();renameRandom();if(document.getElementById('loginInterface')||document.getElementById('roleCollapseBox'))clearInterval(timer);},250);
    setTimeout(()=>clearInterval(timer),7000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
