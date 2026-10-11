/* 500ms launch moments on every real app activation (home, resume, app switcher).
   Itaú personal reuses its own native splash/loading logic. No other apps are affected. */
(()=>{'use strict';
  const DURATION=500;
  const targets={
    itau:{id:'itauApp',name:'Itaú'},
    whatsapp:{id:'whatsappApp',name:'WhatsApp'},
    goodreader:{id:'goodreaderApp',name:'GoodReader'},
    atlas:{id:'atlasApp',name:'Atlas'}
  };
  const home=document.getElementById('homeScreen');
  Object.entries(targets).forEach(([key,target])=>{
    const app=document.getElementById(target.id);
    if(!app)return;
    let wasOpen=app.classList.contains('open');
    let timer=0, shownFromResume=false, node=null;
    const nativeSplash=key==='itau'?document.getElementById('itauSplash'):null;
    if(key!=='itau'){
      node=document.createElement('div');
      node.className='vh-app-launch-splash';
      node.setAttribute('aria-label','Đang mở '+target.name);
      node.innerHTML='<img alt=""><small>đang tải...</small>';
      app.appendChild(node);
      const launcher=home?.querySelector('[data-app="'+key+'"]');
      const icon=launcher?.querySelector('.icon img');
      if(icon)node.querySelector('img').src=icon.currentSrc||icon.src;
    }
    function hide(){
      clearTimeout(timer);timer=0;
      if(node)node.classList.remove('vh-show');
      if(nativeSplash&&shownFromResume)nativeSplash.classList.add('hide');
      shownFromResume=false;
    }
    new MutationObserver(()=>{
      const isOpen=app.classList.contains('open');
      if(isOpen===wasOpen)return;
      wasOpen=isOpen;
      if(!isOpen){hide();return;}
      clearTimeout(timer);
      if(nativeSplash){
        // The bank's own openApp() has already shown its native splash.
        // Only manually resume it when the switcher bypasses openApp().
        if(!nativeSplash.classList.contains('hide'))return;
        nativeSplash.classList.remove('hide');
        shownFromResume=true;
      }else if(node){
        const icon=home?.querySelector('[data-app="'+key+'"] .icon img');
        if(icon)node.querySelector('img').src=icon.currentSrc||icon.src;
        node.classList.add('vh-show');
      }else return;
      timer=setTimeout(()=>{
        if(!app.classList.contains('open'))return;
        if(nativeSplash){nativeSplash.classList.add('hide');shownFromResume=false;}
        else node?.classList.remove('vh-show');
        timer=0;
      },DURATION);
    }).observe(app,{attributes:true,attributeFilter:['class']});
  });
})();
