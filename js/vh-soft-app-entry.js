/* One-shot app entry only. Capture class changes instead of intercepting taps. */
(()=>{'use strict';
const screen=document.getElementById('screen');if(!screen)return;
const ids=['voiceApp','calendarApp','photosApp','notesApp','facebookApp','itauApp','itauBizApp','whatsappApp','goodreaderApp','atlasApp','phoneApp','messagesApp','safariApp'];
const apps=ids.map(id=>document.getElementById(id)).filter(Boolean);
for(const app of apps){
 let timer=0;
 const obs=new MutationObserver(()=>{
  if(app.classList.contains('open')){
   // Restart only on a genuine closed -> opened transition.
   if(app.dataset.vhMotionOpen==='1')return;
   app.dataset.vhMotionOpen='1';
   if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   app.classList.remove('vh-soft-entering');
   void app.offsetWidth;
   app.classList.add('vh-soft-entering');
   clearTimeout(timer);timer=setTimeout(()=>app.classList.remove('vh-soft-entering'),160);
  }else{
   app.dataset.vhMotionOpen='0';
   app.classList.remove('vh-soft-entering');
   clearTimeout(timer);
  }
 });
 app.dataset.vhMotionOpen=app.classList.contains('open')?'1':'0';
 obs.observe(app,{attributes:true,attributeFilter:['class']});
}
})();
