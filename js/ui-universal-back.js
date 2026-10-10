/* Shared navigation glyph for all 14 installed app launchers, 2026-10-10.
   No event listeners on individual buttons: existing back actions remain intact. */
(function(){
'use strict';
const root=document.getElementById('screen');
if(!root)return;
const ids=new Set([
'fb15Back','waThreadBack','waInfoBack','waMediaBack',
'photosToCollections','photosToYears','photosAlbumBack','photosViewerBack',
'notesAccountsBtn','notesBackBtn','messagesBackBtn','messagesDetailBack',
'mailBack','safariBack','calDetailBack','calSearchBack',
'itauBack','itauBizBack'
]);
const selectors=[
'.a10-nav-back','.gr4-has-back','.voice-detail-back','[data-voice-back]',
'.wai-back','.wai-nav-back','.wai-header .wai-nav-btn.left[data-act="back"]','.wa-thread-back',
'.notes26-back','.viewer-back',
'.photos-nav-btn.left','.mail-nav-btn.left','.msg-nav-btn.left',
'.fb15-back','.itau-top-btn.left',
'.cal-overlay-nav button:first-child','.cal-search-nav button:first-child',
'.phone-nav-btn.left[data-phone-action="back"]',
'.phone-nav-btn.left[data-phone-action="return"]'
].join(',');
const svg='<svg class="vh-back-svg" viewBox="0 0 24 30" aria-hidden="true" focusable="false"><path d="M17.5 4.2L6.7 15l10.8 10.8"/></svg>';
const label=/^(?:\s*[‹〈❮←\u2039]\s*)?(?:quay lại|trở lại|trò chuyện|tin nhắn|bộ sưu tập|khoảnh khắc|album|năm|hộp thư|ghi âm|back|voltar|\u2039|‹|〈|❮|←)\s*$/i;
function candidate(el){
 if(!(el instanceof Element)||!el.matches('button,[role="button"]'))return false;
 if(ids.has(el.id))return true;
 if(el.matches(selectors))return true;
 if(el.matches('.phone-nav-btn.left')&&el.getAttribute('data-phone-action')==='back')return true;
 const cls=typeof el.className==='string'?el.className:'';
 if(/(?:^|[\s_-])back(?:[\s_-]|$)/i.test(cls)&&!/passcode|pass-code|keyboard|lock/i.test(cls))return true;
 if(el.closest('.phone-navbar,.wa-nav,.wai-nav,.cal-overlay-nav,.mail-navbar,.msg-nav,.photos-nav,.voice-detail-nav')&&label.test(el.textContent||''))return true;
 return false;
}
function eligible(el){
 if(!candidate(el))return false;
 if(el.id==='itauBack'||el.id==='itauBizBack')return !!(el.textContent||'').trim() || el.classList.contains('vh-back-unified');
 if(el.classList.contains('phone-nav-btn')&&!el.getAttribute('data-phone-action'))return false;
 return true;
}
function normalize(el){
 if(!eligible(el))return;
 if(el.classList.contains('vh-back-unified')&&el.children.length===1&&el.firstElementChild?.classList.contains('vh-back-svg'))return;
 const color=getComputedStyle(el).color;
 el.classList.add('vh-back-unified');
 el.setAttribute('aria-label','Quay lại');
 el.setAttribute('title','Quay lại');
 el.innerHTML=svg;
 // The color is deliberately NOT replaced: this icon inherits each app's own foreground.
 if(color&&color!=='rgba(0, 0, 0, 0)'&&el.style.color==='')el.style.setProperty('--vh-original-back-color',color);
}
function scan(node){
 if(!(node instanceof Element))return;
 if(node.matches('button,[role="button"]'))normalize(node);
 node.querySelectorAll('button,[role="button"]').forEach(normalize);
}
let waiting=false;
const pending=new Set();
function flush(){
 waiting=false;const current=[...pending];pending.clear();
 for(const node of current)scan(node);
}
const observer=new MutationObserver(records=>{
 for(const r of records){
  const t=r.target;
  if(t.closest&&t.closest('.vh-back-unified')&&t.classList.contains('vh-back-svg'))continue;
  if(r.type==='characterData'){
   const b=t.parentElement?.closest('button,[role="button"]');
   if(b)pending.add(b);
  }else if(r.type==='childList'){
   if(t instanceof Element&&t.matches('button,[role="button"]'))pending.add(t);
   r.addedNodes.forEach(n=>{if(n instanceof Element)pending.add(n);});
  }
 }
 if(pending.size&&!waiting){waiting=true;queueMicrotask(flush);}
});
scan(root);
observer.observe(root,{subtree:true,childList:true,characterData:true});
window.VHBackChevron={refresh:()=>scan(root),version:'1.0'};
})();
