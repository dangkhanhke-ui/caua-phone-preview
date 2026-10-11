/* Reproduce Empresas' 500ms launch moment for exactly three additional apps.
   Itaú personal owns its native splash and minimum duration separately. */
(()=>{'use strict';
 const duration=500;
 const targets={whatsapp:'whatsappApp',goodreader:'goodreaderApp',atlas:'atlasApp'};
 const entries=Object.create(null);
 function show(key,launcher){
  const id=targets[key],app=document.getElementById(id);
  if(!app)return;
  let rec=entries[key];
  if(!rec){
   const node=document.createElement('div');node.className='vh-app-launch-splash';
   node.setAttribute('aria-label','Đang mở '+(key==='whatsapp'?'WhatsApp':key==='atlas'?'Atlas':'GoodReader'));
   node.innerHTML='<img alt=""><small>đang tải...</small>';
   app.appendChild(node);rec=entries[key]={node,timer:0};
  }
  clearTimeout(rec.timer);
  const img=launcher.querySelector('.icon img');
  if(img)rec.node.querySelector('img').src=img.currentSrc||img.src;
  rec.node.classList.add('vh-show');
  rec.timer=setTimeout(()=>{rec.node.classList.remove('vh-show');rec.timer=0},duration);
 }
 document.addEventListener('click',event=>{
  const launcher=event.target.closest('#homeScreen [data-app]');
  if(!launcher)return;
  const key=launcher.dataset.app;
  if(Object.prototype.hasOwnProperty.call(targets,key))show(key,launcher);
 },true);
})();
