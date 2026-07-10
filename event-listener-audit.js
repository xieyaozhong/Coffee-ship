(() => {
  'use strict';
  const params=new URLSearchParams(location.search);
  if(params.get('diagnostics')!=='1'||window.__COFFEE_SHIP_EVENT_AUDIT__)return;
  window.__COFFEE_SHIP_EVENT_AUDIT__=true;

  const nativeAdd=EventTarget.prototype.addEventListener;
  const nativeRemove=EventTarget.prototype.removeEventListener;
  const records=[];
  const tracked=new Set(['click','pointerdown','pointerup','touchstart','touchend','keydown']);

  function targetName(target){
    if(target===window)return'window';
    if(target===document)return'document';
    if(target===document.documentElement)return'html';
    if(target===document.body)return'body';
    const tag=target?.tagName?.toLowerCase?.()||target?.constructor?.name||'unknown';
    const id=target?.id?`#${target.id}`:'';
    const classes=target?.classList?.length?`.${[...target.classList].slice(0,4).join('.')}`:'';
    return`${tag}${id}${classes}`;
  }

  function sourceOf(listener){
    try{return Function.prototype.toString.call(listener).replace(/\s+/g,' ').slice(0,500);}
    catch{return String(listener).slice(0,500);}
  }

  function stackOf(){
    try{return String(new Error().stack||'').split('\n').slice(3,9).join('\n');}
    catch{return'';}
  }

  EventTarget.prototype.addEventListener=function(type,listener,options){
    if(tracked.has(type)&&listener){
      const capture=typeof options==='boolean'?options:!!options?.capture;
      records.push({
        action:'add',type,capture,target:targetName(this),source:sourceOf(listener),stack:stackOf(),at:performance.now()
      });
      if(records.length>600)records.shift();
    }
    return nativeAdd.call(this,type,listener,options);
  };

  EventTarget.prototype.removeEventListener=function(type,listener,options){
    if(tracked.has(type)&&listener){
      const capture=typeof options==='boolean'?options:!!options?.capture;
      records.push({
        action:'remove',type,capture,target:targetName(this),source:sourceOf(listener),stack:stackOf(),at:performance.now()
      });
      if(records.length>600)records.shift();
    }
    return nativeRemove.call(this,type,listener,options);
  };

  window.COFFEE_SHIP_EVENT_AUDIT={
    records,
    list:(type='')=>records.filter(row=>!type||row.type===type),
    active:()=>true,
    version:1
  };
})();