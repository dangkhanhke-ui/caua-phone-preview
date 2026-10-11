/* Display-critical Cauã phone assets. Visuals are local and safe to preload.
   Social posts, chat attachments and Photos are NEVER loaded here. */
(()=>{
 'use strict';
 const protectIcons=()=>{
  const icons=document.querySelectorAll('#homeScreen .icon-grid .app > .icon img, #homeScreen .dock .app > .icon img');
  for(const img of icons){
   img.loading='eager';
   img.decoding='async';
   img.fetchPriority='high';
   // Start decoding before lock-screen exit, without delaying interactions.
   if(typeof img.decode==='function'&&img.complete&&img.naturalWidth){
    img.decode().catch(()=>{});
   }
  }
 };
 const warmWhatsAppBackground=()=>{
  // Supports browsers that lack Service Workers, too.
  const img=new Image();
  img.decoding='async';
  img.fetchPriority='low';
  img.src='./assets/whatsapp/whatsapp_chat_bg.png';
  if(typeof img.decode==='function')img.decode().catch(()=>{});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',protectIcons,{once:true});
 else protectIcons();
 if(typeof window!=='undefined'){
  window.addEventListener('load',()=>{
   if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){
    navigator.serviceWorker.register('./phone-chrome-sw.js',{scope:'./',updateViaCache:'none'}).catch(()=>{});
   }
   if(typeof requestIdleCallback==='function')requestIdleCallback(warmWhatsAppBackground,{timeout:2500});
   else warmWhatsAppBackground();
  },{once:true});
 }
})();