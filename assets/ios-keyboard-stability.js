/* Stable iPhone mockup while iOS Safari opens its native keyboard.
   Isolated: desktop and standalone image viewers are unchanged. */
(function(){
  'use strict';
  if(!/iPhone|iPad|iPod/i.test(navigator.userAgent))return;
  const root=document.documentElement;
  const selectors='input:not([type=hidden]), textarea, select, [contenteditable="true"]';
  let focused=null,releaseTimer=0,frame=0,baseHeight=0;
  const vv=window.visualViewport;
  const editable=el=>el&&el.closest&&el.closest(selectors);
  function capture(){
    if(focused)return;
    baseHeight=window.innerHeight;
    const scale=getComputedStyle(root).getPropertyValue('--phone-scale').trim()||'1';
    root.style.setProperty('--phone-locked-scale',scale);
    root.style.setProperty('--phone-stable-height',baseHeight+'px');
  }
  function schedule(){
    if(frame)cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>{
      frame=0;
      if(!focused)return;
      const field=focused;
      if(!field.isConnected)return;
      const viewportBottom=vv ? vv.offsetTop+vv.height : window.innerHeight;
      const rect=field.getBoundingClientRect();
      const overlap=rect.bottom+18-viewportBottom;
      const shift=overlap>0 ? -Math.min(Math.ceil(overlap),Math.max(0,rect.top-12)) : 0;
      root.style.setProperty('--phone-keyboard-shift',shift+'px');
    });
  }
  function release(){
    focused=null;
    root.classList.remove('phone-keyboard-open');
    root.style.removeProperty('--phone-keyboard-shift');
    root.style.removeProperty('--phone-locked-scale');
    root.style.removeProperty('--phone-stable-height');
    baseHeight=0;
  }
  document.addEventListener('focusin',e=>{
    const field=editable(e.target);
    if(!field||!field.closest('.iphone, #phoneWrap, .screen'))return;
    clearTimeout(releaseTimer);
    if(!focused)capture();
    focused=field;
    root.classList.add('phone-keyboard-open');
    schedule();
    setTimeout(schedule,100);
    setTimeout(schedule,350);
  },true);
  document.addEventListener('focusout',e=>{
    if(!editable(e.target))return;
    clearTimeout(releaseTimer);
    releaseTimer=setTimeout(()=>{
      const active=editable(document.activeElement);
      if(active&&active.closest('.iphone, #phoneWrap, .screen')){focused=active;schedule();return;}
      release();
    },180);
  },true);
  if(vv){
    vv.addEventListener('resize',schedule,{passive:true});
    vv.addEventListener('scroll',schedule,{passive:true});
  }
  window.addEventListener('resize',()=>{
    if(focused)schedule();
    else if(baseHeight)capture();
  },{passive:true});
  window.addEventListener('orientationchange',()=>{
    if(focused){release();const active=editable(document.activeElement);if(active){capture();focused=active;root.classList.add('phone-keyboard-open');schedule();}}
  },{passive:true});
})();
