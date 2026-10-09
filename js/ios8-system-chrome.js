/* Restore 2015-style iOS toolbars and adaptive status bar without replacing any button. */
(() => {
 'use strict';
 const NS='http://www.w3.org/2000/svg';
 const screen=document.getElementById('screen');
 const bar=document.getElementById('statusBar');
 if(!screen||!bar)return;
 const svg=(body,viewBox='0 0 24 24',kind='ios8-tool-svg') =>
   '<svg class="'+kind+'" viewBox="'+viewBox+'" aria-hidden="true" focusable="false">'+body+'</svg>';
 const paths={
  share:'<path d="M12 15.5V2.8m0 0L7.8 7m4.2-4.2L16.2 7"/><path d="M7.2 10.3H5.5A1.7 1.7 0 0 0 3.8 12v7A1.7 1.7 0 0 0 5.5 20.7h13a1.7 1.7 0 0 0 1.7-1.7v-7a1.7 1.7 0 0 0-1.7-1.7h-1.7"/>',
  heart:'<path class="ios8-heart" d="M12 20.9 4.2 13.5C-1 8.4 6.2 2.4 11.1 7.4L12 8.3l.9-.9c4.9-5 12.1 1 6.9 6.1L12 20.9z"/>',
  trash:'<path d="M4.8 6.8h14.4M9.3 6.8V4.5h5.4v2.3M6.8 6.9l.7 12.7h9l.7-12.7M10 10v6.4M14 10v6.4"/>',
  flag:'<path d="M6 21V3.5M6 4h12l-2.4 4.4 2.4 4.2H6"/>',
  move:'<path d="M2.5 7.8h7.1l2 2.1h9.9v9.3H2.5z"/><path d="M2.5 7.8V5.4h6l1.7 2.4"/>',
  reply:'<path d="M10 7 3.8 12l6.2 5"/><path d="M4.3 12h8.1c4.3 0 7.3 2.5 7.7 6.8-.1-5.9-2.8-9.8-8-9.8H4.3"/>',
  compose:'<path d="m4.5 18.5 4.5-1L19 7.4l-3.1-3.1L5.8 14.4z"/><path d="m13.6 6.5 3.1 3.1M4.5 18.5l-.3 2.2 2.2-.3"/>',
  root:'<path d="M2.5 11 12 3.2 21.5 11"/><path d="M5 9.4V20h14V9.4M10 20v-6.5h4V20"/>',
  back:'<path d="M14.4 4.2 7.1 12l7.3 7.8"/>',
  select:'<path d="M10 6h10M10 12h10M10 18h10"/><path d="m3.5 5.8 1.4 1.4 2.3-2.5M3.5 11.8l1.4 1.4 2.3-2.5M3.5 17.8l1.4 1.4 2.3-2.5"/>'
 };

 // Photos controls remain the same DOM buttons and original click listeners.
 [['photosShareBtn','share','Chia sẻ'],['photosFavoriteBtn','heart','Yêu thích'],['photosTrashBtn','trash','Xóa']].forEach(([id,kind,label])=>{
   const button=document.getElementById(id);
   if(!button)return;
   button.innerHTML=svg(paths[kind]);
   button.setAttribute('aria-label',label);
 });

 // The Mail toolbar is reconstructed by the original app on every screen change.
 // Observe only its immediate children; replacing a button's interior cannot loop.
 const mail=document.getElementById('mailToolbar');
 function decorateMail(){
   if(!mail)return;
   mail.querySelectorAll('button.mail-toolbar-btn[data-mail-action]').forEach(button=>{
     const action=button.dataset.mailAction;
     if(!paths[action]||button.dataset.ios8Svg==='1')return;
     const wasFlagged=action==='flag'&&button.textContent.trim()==='★';
     button.innerHTML=svg(paths[action]);
     button.dataset.ios8Svg='1';
     if(wasFlagged)button.classList.add('is-flagged');
     button.setAttribute('aria-label',({compose:'Soạn thư',move:'Di chuyển',flag:'Gắn cờ',trash:'Xóa',reply:'Trả lời'})[action]);
   });
 }
 if(mail){new MutationObserver(decorateMail).observe(mail,{childList:true});decorateMail();}

 // GoodReader's nav is recreated per folder. Retain data-gr and events.
 const goodreaderNav=document.getElementById('gr4Nav');
 function decorateGoodReader(){
   if(!goodreaderNav)return;
   const left=goodreaderNav.querySelector('button[data-gr="root"],button[data-gr="back"]');
   if(left&&left.dataset.ios8Svg!=='1'){
     const isBack=left.dataset.gr==='back';
     left.innerHTML=svg(paths[isBack?'back':'root'],'0 0 24 24','ios8-gr4-svg')+(isBack?'<span>Quay lại</span>':'');
     left.dataset.ios8Svg='1';
     left.setAttribute('aria-label',isBack?'Quay lại':'Tài liệu gốc');
   }
   const select=goodreaderNav.querySelector('button.gr4-nav-right[data-gr="view-setup"]');
   if(select&&select.dataset.ios8Svg!=='1'){
     select.innerHTML=svg(paths.select,'0 0 24 24','ios8-gr4-svg')+'<span>Chọn</span>';
     select.dataset.ios8Svg='1';
   }
 }
 if(goodreaderNav){new MutationObserver(decorateGoodReader).observe(goodreaderNav,{childList:true});decorateGoodReader();}

 // The four glyphs below are traced directly from the *2015* original vectors
 // in aubrey_iOS8_Status_Bars.sketch (iPhone 5 @2x, 640x40 artboard).
 // No generic icon-library paths. Preserve native aspect ratios at 1x.
 const signal=bar.querySelector('.signal-dots');
 const wifi=bar.querySelector('.wifi');
 const bluetooth=bar.querySelector('.bluetooth');
 const battery=bar.querySelector('.battery');
 if(signal)signal.innerHTML=svg(
   '<circle cx="6" cy="6" r="6"/><circle cx="20" cy="6" r="6"/><circle cx="34" cy="6" r="6"/><circle cx="48" cy="6" r="6"/><circle cx="62" cy="6" r="6"/>',
   '0 0 68 12','status-svg ios8-sketch-svg'
 );
 if(wifi)wifi.innerHTML=svg(
   '<path d="M 11.992 3.042 C 15.871 3.042 19.407 4.471 22.118 6.814 L 24 4.736 C 20.789 1.949 16.596 0 11.992 0 C 7.394 0 3.207 1.943 0 4.721 L 1.878 6.803 C 4.587 4.466 8.117 3.042 11.992 3.042 L 11.992 3.042 Z"/><path d="M 18.079 11.275 L 20.07 9.076 C 17.903 7.216 15.084 6.001 11.992 6.001 C 8.905 6.001 6.088 7.213 3.923 9.067 L 5.911 11.269 C 7.548 9.882 9.669 9.04 11.992 9.04 C 14.317 9.04 16.441 9.885 18.079 11.275 Z"/><path d="M 16.087 13.475 C 14.978 12.555 13.551 11.917 11.991 11.917 C 10.433 11.917 9.008 12.554 7.899 13.47 L 11.991 18 L 16.087 13.475 L 16.087 13.475 Z"/>',
   '0 0 24 18','status-svg ios8-sketch-svg'
 );
 if(bluetooth)bluetooth.innerHTML=svg(
   '<path d="M 10 15 L 13 18 L 10 21 L 10 15 Z"/><path d="M 10 11 L 10 5 L 13 8 L 10 11 Z"/><path d="M 16 8 L 8.057 0 L 8.057 11 L 2 5 L 0 7 L 6.907 13.022 L 0 19 L 2 21 L 8.057 15 L 8.057 26.042 L 16 18 L 11 13.022 L 16 8 Z"/>',
   '0 0 16 26.042','status-svg ios8-sketch-svg'
 );
 const percent=(bar.querySelector('.battery-percent')?.textContent||'62').match(/\d+/);
 const level=percent?Math.min(100,Math.max(0,Number(percent[0]))):62;
 if(battery){
   // Original battery outline = 46×20 rx3, hollow inset 1px,
   // terminal x48..52, and adjustable fill inside the 42×16 well.
   const width=(42*level/100).toFixed(2);
   battery.innerHTML=svg(
     '<path fill-rule="evenodd" d="M3 0h40a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3zm0 1a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h40a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2z"/><rect x="48" y="6" width="4" height="8" rx="1"/><rect class="ios8-sketch-battery-level" x="2" y="2" width="'+width+'" height="16" rx="2"/>',
     '0 0 52 20','status-svg ios8-sketch-svg'
   );
 }
 bar.classList.add('ios8-svg-status');
 bar.dataset.svgSource='aubrey-sketch-2015-iphone5';

 // Explicit app palette (2015 iOS) is more reliable than sampling an image
 // under a composited translucent status bar. Fall back to surface luminance.
 const lightHeader = /(?:^|\s)(?:facebook-open|whatsapp-open|itau-open|itau-biz-open|phone-open|voice-open)(?=\s|$)/;
 const darkHeader = /(?:^|\s)(?:photos-open|mail-open|goodreader-open|notes-open|calendar-open|messages-open|safari-open)(?=\s|$)/;
 function luminance(color) {
   const m=color&&color.match(/^rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/);
   if(!m)return null;
   return (Number(m[1])*.2126+Number(m[2])*.7152+Number(m[3])*.0722);
 }
 function statusContrast(){
   const override=screen.getAttribute('data-status-contrast');
   if(override==='light'||override==='dark')return override;
   const className=screen.className;
   if(darkHeader.test(className))return 'dark';
   if(lightHeader.test(className))return 'light';
   if(/(?:^|\s)(?:lock|passcode|home)(?:-|\s)/.test(className))return 'light';
   const candidate=[...screen.querySelectorAll('.open')].find(el=>el!==bar);
   const source=candidate?getComputedStyle(candidate).backgroundColor:getComputedStyle(screen).backgroundColor;
   const l=luminance(source);
   return l===null||l<145?'light':'dark';
 }
 let scheduled=false;
 function update(){
   scheduled=false;
   const mode=statusContrast();
   bar.dataset.ios8Contrast=mode;
   // Inline property wins over old app-specific white/black rules.
   bar.style.setProperty('color',mode==='dark'?'#202124':'#ffffff','important');
   const carrier=bar.querySelector('.carrier');
   if(carrier)carrier.style.color='inherit';
 }
 function queue(){
   if(scheduled)return;
   scheduled=true;
   // WebKit can delay rAF while entering an app; a microtask keeps
   // status glyph contrast synchronized with the same class mutation.
   Promise.resolve().then(update);
 }
 new MutationObserver(queue).observe(screen,{attributes:true,attributeFilter:['class','data-status-contrast']});
 // Photos viewer / other nested screens may change without changing screen class.
 for(const el of [document.getElementById('photosViewer'),document.getElementById('photosApp'),document.getElementById('mailApp'),document.getElementById('gr4App')]){
   if(el)new MutationObserver(queue).observe(el,{attributes:true,attributeFilter:['class']});
 }
 update();
})();
