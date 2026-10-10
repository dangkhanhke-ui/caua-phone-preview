/* iPhone app-window motion, no opacity/blur; render content once, animate compositor transforms. */
(()=>{'use strict';
const screen=document.getElementById('screen');
if(!screen)return;
const home=document.getElementById('homeScreen');
const names=['voice','calendar','photos','notes','facebook','itau','itau-biz','whatsapp','goodreader','atlas','phone','messages','mail','safari'];
const ids={voice:'voiceApp',calendar:'calendarApp',photos:'photosApp',notes:'notesApp',facebook:'facebookApp',itau:'itauApp','itau-biz':'itauBizApp',whatsapp:'whatsappApp',goodreader:'goodreaderApp',atlas:'atlasApp',phone:'phoneApp',messages:'messagesApp',mail:'mailApp',safari:'safariApp'};
let epoch=0,active=null;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const iconFor=key=>document.querySelector('[data-app="'+key+'"] .icon');
const appFor=key=>document.getElementById(ids[key]);
const appOpen=()=>names.find(key=>appFor(key)?.classList.contains('open'));
const rect=el=>el?.getBoundingClientRect();
function frames(key){
 const start=rect(iconFor(key)),end=rect(screen);
 if(!start||!end||!start.width||!end.width)return null;
 const cx=start.left+start.width/2,cy=start.top+start.height/2;
 const ex=end.left+end.width/2,ey=end.top+end.height/2;
 const sx=Math.max(.08,Math.min(.96,start.width/end.width));
 const sy=Math.max(.08,Math.min(.96,start.height/end.height));
 // Use center-aligned transforms; no zooming from some arbitrary offscreen origin.
 return [{transform:'translate3d('+(cx-ex)+'px,'+(cy-ey)+'px,0) scale('+sx+','+sy+')',borderRadius:'17px'},
         {transform:'translate3d(0,0,0) scale(1,1)',borderRadius:'0px'}];
}
function animate(el,f,duration){
 if(reduced()||!el?.animate||!f)return Promise.resolve();
 const oldWill=el.style.willChange;el.style.willChange='transform,border-radius';
 let animation;
 try{animation=el.animate(f,{duration,easing:'cubic-bezier(.22,.7,.15,1)',fill:'both'});}
 catch(e){el.style.willChange=oldWill;return Promise.resolve();}
 return animation.finished.catch(()=>{}).then(()=>{animation.cancel();el.style.willChange=oldWill;});
}
function launch(key){
 if(!ids[key])return;
 const ticket=++epoch;
 requestAnimationFrame(()=>{
  if(ticket!==epoch)return;
  const app=appFor(key);
  if(!app?.classList.contains('open'))return;
  active=key;
  animate(app,frames(key),245);
 });
}
document.addEventListener('click',event=>{
 const launcher=event.target.closest('[data-app]');
 if(launcher&&!launcher.closest('#ios8AppSwitcher'))launch(launcher.dataset.app);
},true);
screen.addEventListener('caua:motion-close',event=>{
 const detail=event.detail||{},done=typeof detail.done==='function'?detail.done:()=>{};
 const key=appOpen()||active;
 ++epoch;
 const el=appFor(key);
 if(!el?.classList.contains('open')||!home?.classList.contains('active')||reduced()){
  active=null;done();return;
 }
 const f=frames(key);
 if(!f){active=null;done();return;}
 // Expose Home beneath the contracting app without hiding the app yet.
 const homeZ=home.style.zIndex,appZ=el.style.zIndex,oldPE=el.style.pointerEvents;
 home.style.zIndex='1';el.style.zIndex='300';el.style.pointerEvents='none';
 animate(el,[f[1],f[0]],220).finally(()=>{
  home.style.zIndex=homeZ;el.style.zIndex=appZ;el.style.pointerEvents=oldPE;
  active=null;done();
 });
});
window.CauaMotion={version:'1.0',getOpen:appOpen};
})();
