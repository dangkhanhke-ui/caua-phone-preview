/* Cauã iPhone / phase 2 — native-style local app handoff (Aug 2015).
   All actions are entirely inside the fictional phone. No network send. */
(()=>{
'use strict';
const appIds={
  photos:['photosApp','photos-open'],mail:['mailApp','mail-open'],
  messages:['messagesApp','messages-open'],whatsapp:['whatsappApp','whatsapp-open'],
  facebook:['facebookApp','facebook-open'],safari:['safariApp','safari-open'],
  goodreader:['goodreaderApp','goodreader-open'],notes:['notesApp','notes-open'],
  phone:['phoneApp','phone-open'],calendar:['calendarApp','calendar-open'],
  voice:['voiceApp','voice-open'],itau:['itauApp','itau-open'],
  'itau-biz':['itauBizApp','itau-biz-open']
};
const phone=document.getElementById('screen');
const $=selector=>document.querySelector(selector);
function isLocalPhoto(src){
  return typeof src==='string' && /^\.\/assets\/photos\/[a-z0-9_.-]+\.(?:jpg|jpeg|png|webp)$/i.test(src);
}
function normalizePhoto(src){
  const path=String(src||'');
  if(isLocalPhoto(path))return path;
  try{
    const u=new URL(path,location.href);
    if(u.origin!==location.origin)return '';
    const local='./'+u.pathname.replace(/^\/+/,'').split('/').slice(-2).join('/');
    return isLocalPhoto(local)?local:'';
  }catch(e){return ''}
}
function open(app){
  const launcher=$('[data-app="'+app+'"]');
  if(!launcher||!appIds[app])return false;
  launcher.click(); // keep every app's real open/initialize handler
  for(const [key,[id,cls]] of Object.entries(appIds)){
    if(key===app)continue;
    document.getElementById(id)?.classList.remove('open');
    phone?.classList.remove(cls);
  }
  if(app!=='safari')phone?.classList.remove('safari-tabs-open');
  const [id,cls]=appIds[app];
  document.getElementById(id)?.classList.add('open');
  phone?.classList.add(cls);
  $('#photosSheetBackdrop')?.classList.remove('open');
  $('#safariOverlay')?.classList.remove('show');
  return true;
}
function send(app,event,detail){
  if(!open(app))return false;
  window.dispatchEvent(new CustomEvent('caua:'+event,{detail}));
  return true;
}
function photo(){
  const src=normalizePhoto($('#photosViewerImage')?.getAttribute('src'));
  if(!src)return null;
  const filename=$('#photosInfoBody .photos-info-row:nth-child(2) .value')?.textContent?.split(' · ')[0]?.trim()||src.split('/').pop();
  return {kind:'photo',src,filename};
}
function sharePhoto(app,payload){
  if(!payload||!isLocalPhoto(payload.src))return false;
  if(app==='mail')return send('mail','mail-compose',{kind:'photo',subject:'Ảnh: '+payload.filename,filename:payload.filename,src:payload.src});
  if(app==='messages')return send('messages','messages-draft',{kind:'photo',src:payload.src,filename:payload.filename});
  if(app==='whatsapp')return send('whatsapp','whatsapp-share',{kind:'photo',src:payload.src,filename:payload.filename});
  if(app==='facebook')return send('facebook','facebook-compose',{kind:'photo',src:payload.src,text:''});
  return false;
}
function shareLink(app,title,url){
  const data={kind:'link',title:String(title||'Trang web'),url:String(url||'')};
  if(!data.url)return false;
  if(app==='mail')return send('mail','mail-compose',{kind:'link',subject:data.title,body:data.url});
  if(app==='messages')return send('messages','messages-draft',data);
  if(app==='whatsapp')return send('whatsapp','whatsapp-share',data);
  if(app==='facebook')return send('facebook','facebook-compose',{...data,text:data.title+'\n'+data.url});
  return false;
}
function openMailAttachment(filename){
  const name=String(filename||'').trim();
  if(!name||!name.toLowerCase().endsWith('.pdf'))return false;
  return send('goodreader','goodreader-attachment',{filename:name,source:'mail'});
}
function shareDocument(filename){
  const name=String(filename||'').trim();if(!name)return false;
  return send('mail','mail-compose',{kind:'document',subject:name,filename:name,body:''});
}
async function copy(value){
  try{await navigator.clipboard.writeText(String(value||''));return true}
  catch(e){
    const text=document.createElement('textarea');
    text.value=String(value||'');text.style.cssText='position:fixed;left:-9999px;top:0';
    document.body.appendChild(text);text.select();
    const ok=document.execCommand('copy');text.remove();return ok;
  }
}
const shareRoutes={'Tin nhắn':'messages','Mail':'mail','Facebook':'facebook','WhatsApp':'whatsapp'};
// Native Photos iOS 8 share sheet: preserve the original menu and dismissal.
document.addEventListener('click',e=>{
  const row=e.target.closest('#photosSheetBackdrop .photos-sheet .row');
  if(!row||row.classList.contains('cancel'))return;
  const name=row.textContent.trim();
  if(!(name in shareRoutes)&&name!=='Sao chép')return;
  e.preventDefault();e.stopImmediatePropagation();
  const data=photo();
  $('#photosSheetBackdrop')?.classList.remove('open');
  if(!data)return;
  if(name==='Sao chép')copy(location.href.replace(/[^/]*$/,'')+data.src.replace(/^\.\//,''));
  else sharePhoto(shareRoutes[name],data);
},true);
window.CauaCrossApp=Object.freeze({
  open,sharePhoto,shareLink,openMailAttachment,shareDocument,copy,
  photo
});
})();
