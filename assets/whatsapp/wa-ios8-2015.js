/* WhatsApp iPhone 2.12.5 / August 2015 - local mockup UI. Canon chat content untouched. */
(function(){
'use strict';
function boot(){
 const app=document.getElementById('whatsappApp'),api=window.CAUA_WA_API;
 if(!app||!api||!Array.isArray(api.THREADS)){return}
 if(app.querySelector('#waIos15'))return;
 const root=document.createElement('div');root.id='waIos15';root.setAttribute('aria-label','WhatsApp iPhone 2015');app.appendChild(root);
 const P='./assets/whatsapp/photos/';
 const images={'camila-img-1':P+'wa_camila_01.png','livia-img-1':P+'wa_livia_01.png','livia-img-2':P+'wa_livia_02.png','livia-img-3':P+'wa_livia_03.png','livia-img-4':P+'wa_livia_04.png','livia-img-5':P+'wa_livia_05.png'};
 const faces={mother:P+'wa_avatar_mother.png',camila:P+'wa_avatar_camila.png',livia:P+'wa_avatar_livia.png'};
 const phones={caua:'+55 (21) 90000-0101',mother:'+55 (21) 90000-0102',camila:'+55 (21) 90000-0103',livia:'+55 (21) 90000-0104'};
 const base={name:'Cauã Valença',status:'Có mặt',photo:'',favorite:['mother','camila','livia'],archived:[],muted:{},unread:[],hide:[],cleared:{},deleted:[],messages:{},groups:[],prefs:{alerts:true,preview:true,sounds:true,vibrate:true,saveMedia:true,lowData:false,backupVideos:false,autoImage:true},privacy:{seen:'Mọi người',photo:'Danh bạ',status:'Danh bạ',blocked:[]},wallpaper:'',calls:[],drafts:{},seq:0};
 let data;try{const v=JSON.parse(localStorage.getItem('caua-whatsapp-ios2015-v2'));data=v&&typeof v==='object'?Object.assign(structuredClone(base),v):structuredClone(base)}catch(e){data=JSON.parse(JSON.stringify(base))}
 for(const k of ['favorite','archived','unread','hide','deleted','groups','calls'])if(!Array.isArray(data[k]))data[k]=[];
 for(const k of ['messages','muted','prefs','privacy','drafts','cleared'])if(!data[k]||typeof data[k]!=='object')data[k]=JSON.parse(JSON.stringify(base[k]));
 const portugueseStatus={'Disponível':'Có mặt','Ocupado':'Đang bận','No trabalho':'Đang làm việc','Na escola':'Đang học','Bateria quase acabando':'Pin sắp hết','Não posso falar, só WhatsApp':'Không thể nói chuyện, chỉ nhắn WhatsApp'};
 const vnStatus=x=>{const v=String(portugueseStatus[x]||x||'Có mặt').trim();return v.charAt(0).toLocaleUpperCase('vi')+v.slice(1)};
 data.status=vnStatus(data.status);
 const portuguesePrivacy={'Todos':'Mọi người','Meus contatos':'Danh bạ','Ninguém':'Không ai'};
 for(const key of ['seen','photo','status'])if(portuguesePrivacy[data.privacy[key]])data.privacy[key]=portuguesePrivacy[data.privacy[key]];
 const threads=api.THREADS;
 const camilaContact=threads.find(t=>t.id==='camila');
 if(camilaContact)camilaContact.name='Camila (nhân viên)';
 threads.forEach(t=>{if(typeof t.status==='string')t.status=vnStatus(t.status)});
 for(const g of data.groups)if(!threads.find(t=>t.id===g.id))threads.push({...g,events:[]});
 const owner={id:'caua',name:data.name,phone:phones.caua};
 const tabs=[['favorites','star','Yêu thích'],['recents','clock','Gần đây'],['contacts','users','Danh bạ'],['chats','chat','Trò chuyện'],['settings','settings','Cài đặt']];
 const icons={
 star:'<polygon points="12 2 15 9 22 9 17 14 19 22 12 18 5 22 7 14 2 9 9 9 12 2"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
 users:'<circle cx="9" cy="7" r="4"/><path d="M2 21v-2c0-5 14-5 14 0v2"/><path d="M18 3a4 4 0 0 1 0 8M18 15c3 0 4 3 4 6"/>',
 chat:'<path d="M3 4h18v14H9l-6 4z"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2l2 2 3-1 2 3-1 3 3 3-3 3 1 3-2 3-3-1-2 2-2-2-3 1-2-3 1-3-3-3 3-3-1-3 2-3 3 1z"/>',
 pencil:'<path d="M4 20l5-1L20 8l-4-4L5 15zM14 6l4 4"/>',
 phone:'<path fill="currentColor" stroke="none" d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z"/>',
 photo:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="2"/><path d="M3 18l6-7 4 4 3-3 5 6"/>',
 plus:'<path d="M12 3v18M3 12h18"/>',
 mic:'<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 10v7M12 6v.3"/>',
 back:'<path d="M15 4l-8 8 8 8"/>',
 check:'<path d="M4 12l5 5L20 6"/>',
 camera:'<rect x="2" y="5" width="20" height="16" rx="3"/><path d="M7 5l2-3h6l2 3"/><circle cx="12" cy="13" r="4"/>',
 paperclip:'<path d="M8 12l7-7a4 4 0 0 1 6 6L10 22a6 6 0 0 1-8-8L13 3"/>',
 list:'<path d="M8 5h14M8 12h14M8 19h14M3 5h.5M3 12h.5M3 19h.5"/>',
 trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v7M14 11v7"/>'
 };
 const icon=(name)=>'<svg class="wai-icon" viewBox="0 0 24 24" aria-hidden="true">'+(icons[name]||icons.info)+'</svg>';
 const esc=(x)=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const save=()=>{try{localStorage.setItem('caua-whatsapp-ios2015-v2',JSON.stringify(data))}catch(e){toast('Bộ nhớ trình duyệt đầy, ảnh có thể chưa được lưu')}};
 const contact=id=>threads.find(x=>x.id===id);
 const face=(id,size='')=>'<span class="wai-face '+size+'">'+(id==='caua'?(data.photo||'./assets/facebook/avatar.jpg')?'<img src="'+esc(data.photo||'./assets/facebook/avatar.jpg')+'" onerror="this.style.display=\'none\'">':'C':faces[id]?'<img src="'+esc(faces[id])+'" onerror="this.style.display=\'none\'">':esc((contact(id)?.name||'?').slice(0,1)))+'</span>';
 const latest=(t)=>{const ext=data.messages[t.id]||[];if(Object.prototype.hasOwnProperty.call(data.cleared,t.id))return ext.slice(data.cleared[t.id]).at(-1)||null;return ext.length?ext.at(-1):(t.events||[]).at(-1)};
 // Each newline-separated WhatsApp text is a distinct message bubble.
 // Preserve the original event object, date, sender and order; only derive render copies.
 const splitChatBubbles=e=>{
  if(e.type!=='message'||typeof e.text!=='string'||!/\r?\n/.test(e.text))return [e];
  const parts=e.text.split(/\r?\n+/).map(x=>x.trim()).filter(Boolean);
  if(parts.length<2)return [e];
  return parts.map((part,i)=>({...e,id:(e.id||'message')+'-bubble-'+(i+1),text:part,originalId:e.id}));
 };
 const allEvents=t=>(Object.prototype.hasOwnProperty.call(data.cleared,t.id)?[]:(t.events||[])).concat((data.messages[t.id]||[]).slice(data.cleared[t.id]||0))
  .sort((a,b)=>(a.date+'T'+(a.time||'00:00')).localeCompare(b.date+'T'+(b.time||'00:00')))
  .flatMap(splitChatBubbles)
  .filter(x=>!data.hide.includes(x.id)&&!data.hide.includes(x.originalId));
 const lastText=t=>{const e=latest(t);if(!e&&Object.prototype.hasOwnProperty.call(data.cleared,t.id))return '';return e?.type==='message'?String(e.text||'').split(/\r?\n+/).filter(Boolean).slice(-1)[0]||'':((e?.type==='image')?'📷 Ảnh':e?.type==='call'?'📞 Cuộc gọi':e?.type==='audio'?'🎙 Tin nhắn thoại':t.preview||'')};
 const lastTime=t=>{const e=latest(t);return e?.time||t.lastDate||''};
 const dateLabel=s=>{if(!s)return '';let a=s.split('-');return a.length===3?a[2]+'/'+a[1]+'/'+a[0]:s};
 const daySort=t=>{const e=latest(t);return e?e.date+'T'+(e.time||'00:00'):t.activity||''};
 let pendingCauaShare=null;
 let ui={tab:'chats',page:'main',id:'',sub:'',query:'',search:'',callFilter:'all',stack:[],overlay:null,viewer:'',select:[],edit:false,photoPickerFor:'chat',scrollThread:true,chatScroll:{},recording:false};
 let toastTimeout,callTimer,recorder,recParts=[];
 const action=(a,label,extra='')=>'<button type="button" data-act="'+a+'" '+extra+'>'+label+'</button>';
 function nav(title,left='',right=''){
  return '<header class="wai-header">'+(left?'<button class="wai-nav-btn left" data-act="back">'+icon('back')+esc(left)+'</button>':'')+'<strong class="wai-title">'+esc(title)+'</strong>'+(right||'')+'</header>';
 }
 const navbar=()=>'<nav class="wai-tabs" aria-label="WhatsApp 2015">'+tabs.map(([id,glyph,title])=>'<button data-act="tab" data-id="'+id+'" class="wai-tab '+(ui.tab===id?'active':'')+'">'+icon(glyph)+'<span class="wai-tab-label">'+title+'</span></button>').join('')+'</nav>';
 const info=(text)=>'<div class="wai-empty">'+text+'</div>';
 const headButton=(act,content,extra='')=>'<button type="button" class="wai-nav-btn right" data-act="'+act+'" '+extra+'>'+content+'</button>';
 const cell=(name,act,val='',extra='')=>'<button class="wai-cell" data-act="'+act+'" '+extra+'><span class="wai-cell-title">'+name+'</span>'+(val?'<small class="wai-cell-val">'+esc(val)+'</small>':'')+'<span class="wai-chevron">›</span></button>';
 const section=t=>'<div class="wai-section">'+esc(t)+'</div>';
 const wrap=c=>'<div class="wai-card">'+c+'</div>';
 const line=(text,sub='')=>'<div style="flex:1;min-width:0"><span>'+esc(text)+'</span>'+(sub?'<small class="wai-cell-sub">'+esc(sub)+'</small>':'')+'</div>';
 const toggle=(title,key,sub='')=>'<button class="wai-cell" data-act="pref" data-id="'+key+'">'+line(title,sub)+'<span class="wai-switch '+(data.prefs[key]?'on':'')+'"></span></button>';
 const menuBtn=(symbol,title,id)=>'<span class="wai-cell-icon" style="background:'+symbol+'">'+icon(id||'settings')+'</span><span class="wai-cell-title">'+title+'</span><span class="wai-chevron">›</span>';
 function navigate(page,params={}){
  ui.stack.push({page:ui.page,id:ui.id,sub:ui.sub,tab:ui.tab,query:ui.query,search:ui.search});
  ui.page=page;ui.id=params.id||ui.id;ui.sub=params.sub||'';ui.search='';ui.overlay=null;ui.viewer='';ui.edit=false;render();
 }
 function back(){
  if(ui.viewer){ui.viewer='';render();return}
  if(ui.overlay){ui.overlay=null;render();return}
  const prev=ui.stack.pop();
  if(prev)Object.assign(ui,prev);else ui.page='main';
  ui.overlay=null;render();
 }
 function tab(id){ui.tab=id;ui.page='main';ui.stack=[];ui.query='';ui.search='';ui.overlay=null;ui.edit=false;render()}
 function selectContact(id){data.unread=data.unread.filter(x=>x!==id);data.deleted=data.deleted.filter(x=>x!==id);save();ui.scrollThread=true;ui.id=id;navigate('chat',{id})}
 const contactRow=(t,actionName='open-contact')=>'<button class="wai-row" data-act="'+actionName+'" data-id="'+esc(t.id)+'">'+face(t.id)+'<span class="wai-row-info"><span class="wai-row-top"><b>'+esc(t.name)+'</b></span><small>'+esc(t.status||phones[t.id]||'WhatsApp')+'</small></span><span class="wai-chevron">›</span></button>';
 const chatRow=t=>{
  const unread=data.unread.includes(t.id),muted=!!data.muted[t.id];
  return '<button class="wai-row wai-chat-row" data-act="open-chat" data-thread="'+esc(t.id)+'" data-id="'+esc(t.id)+'">'+face(t.id)+'<span class="wai-row-info"><span class="wai-row-top"><b>'+esc(t.name)+'</b><small class="wai-row-time">'+esc(lastTime(t))+'</small></span><small>'+esc(lastText(t)).slice(0,95)+(muted?' · 🔕':'')+'</small></span>'+(unread?'<span class="wai-unread-badge">1</span>':'')+'</button>';
 };
 // Two sibling buttons: unlike a button nested in a button, both the chat
 // and its visible menu are independently keyboard- and touch-accessible.
 const chatItem=t=>'<div class="wai-chat-item">'+chatRow(t)+'<button type="button" class="wai-chat-more" data-act="swipe-menu" data-id="'+esc(t.id)+'" aria-label="Tùy chọn trò chuyện với '+esc(t.name)+'" title="Tùy chọn trò chuyện">⋯</button></div>';
 function chats(){
  const q=ui.query.trim().toLocaleLowerCase('vi');
  const rows=threads.filter(t=>!data.archived.includes(t.id)&&!data.deleted.includes(t.id)).filter(t=>!q||t.name.toLocaleLowerCase('vi').includes(q)||lastText(t).toLocaleLowerCase('vi').includes(q)||allEvents(t).some(e=>(e.text||'').toLocaleLowerCase('vi').includes(q))).sort((a,b)=>daySort(b).localeCompare(daySort(a)));
  return '<div class="wai-underbar"><input class="wai-search" id="waiSearch" type="search" placeholder="Tìm kiếm" value="'+esc(ui.query)+'"></div>'+
   '<div class="wai-quick">'+action('broadcasts','Danh sách phát')+action('new-group','Nhóm mới')+'</div>'+
   (rows.map(chatItem).join('')||info('Không có cuộc trò chuyện phù hợp.'))+
   (data.archived.length?'<button class="wai-list-action" data-act="archived">Chat lưu trữ ('+data.archived.length+')</button>':'');
 }
 function favorites(){
  const rows=threads.filter(t=>data.favorite.includes(t.id)).sort((a,b)=>a.name.localeCompare(b.name));
  return '<div class="wai-underbar"><input class="wai-search" id="waiSearch" placeholder="Tìm liên hệ" value="'+esc(ui.query)+'"></div>'+
   rows.filter(t=>t.name.toLocaleLowerCase('vi').includes(ui.query.toLocaleLowerCase('vi'))).map(t=>contactRow(t,'open-contact')).join('')+
   '<button class="wai-list-action" data-act="choose-favorite">Thêm vào Yêu thích</button>';
 }
 function contacts(){
  const q=ui.query.trim().toLocaleLowerCase('vi');
  const rows=threads.filter(t=>!t.members).filter(t=>!q||t.name.toLocaleLowerCase('vi').includes(q));
  return '<div class="wai-underbar"><input class="wai-search" id="waiSearch" placeholder="Tìm danh bạ" value="'+esc(ui.query)+'"></div>'+
   section('Liên hệ WhatsApp · '+rows.length)+rows.map(t=>contactRow(t)).join('')+
   '';
 }
 function eventsCalls(){
  let calls=threads.flatMap(t=>(t.events||[]).filter(e=>e.type==='call').map(e=>({...e,contactId:t.id}))).concat(data.calls||[]);
  return calls.sort((a,b)=>(b.date+'T'+b.time).localeCompare(a.date+'T'+a.time));
 }
 function recents(){
  const rows=eventsCalls().filter(e=>ui.callFilter==='all'||e.result==='missed');
  return '<div style="padding:7px 40px"><div style="display:flex;border:1px solid #007aff;border-radius:5px;overflow:hidden">'+
    ['all','missed'].map(f=>'<button data-act="call-filter" data-id="'+f+'" style="flex:1;border:0;padding:6px;color:'+(ui.callFilter===f?'white':'#007aff')+';background:'+(ui.callFilter===f?'#007aff':'white')+'">'+(f==='all'?'Tất cả':'Nhỡ')+'</button>').join('')+'</div></div>'+
   (rows.map(e=>'<button class="wai-row" data-act="call" data-id="'+esc(e.contactId)+'"><span style="color:'+(e.result==='missed'?'#e45555':'#777')+';font-size:22px;width:38px;text-align:center">'+(e.direction==='incoming'?'↙':'↗')+'</span><span class="wai-row-info"><b style="color:'+(e.result==='missed'?'#de4848':'#222')+'">'+esc(contact(e.contactId)?.name||e.contactId)+'</b><small>'+dateLabel(e.date)+' · '+esc(e.time)+' · '+(e.result==='missed'?'Cuộc gọi nhỡ':'Cuộc gọi thoại')+'</small></span><span class="wai-blue">'+icon('info')+'</span></button>').join('')||info('Chưa có cuộc gọi nào.'));
 }
 function settings(){
  return section('Hồ sơ cá nhân')+
   '<button class="wai-owner" data-act="profile">'+face('caua')+'<span style="flex:1"><b>'+esc(data.name)+'</b><small>'+esc(data.status)+'</small></span><span class="wai-chevron">›</span></button>'+
   section('Cài đặt')+wrap(
    cell('Tài khoản','account')+
    cell('Trò chuyện và cuộc gọi','chats-calls')+
    cell('Thông báo','notifications')+
    cell('Mạng và dữ liệu','network')+
    cell('WhatsApp Web','web')+
    cell('Trợ giúp','help'))+
   section('Khác')+wrap(cell('Mời bạn bè','invite')+cell('Giới thiệu','about-app'))+
   '';
 }
 function main(){
  let title={chats:'Trò chuyện',contacts:'Danh bạ',favorites:'Yêu thích',recents:'Gần đây',settings:'Cài đặt'}[ui.tab];
  let r=ui.tab==='chats'?headButton('new-chat',icon('pencil')):ui.tab==='recents'?headButton('new-call',icon('phone')):ui.tab==='favorites'?headButton('choose-favorite',icon('plus')):ui.tab==='contacts'?headButton('new-chat',icon('plus')):'';
  const content={chats,favorites,contacts,recents,settings}[ui.tab]();
  return nav(title,'',r)+'<main class="wai-screen '+(ui.tab==='settings'?'grouped':'')+'">'+content+'</main>'+navbar();
 }
 function prettyMsg(e){
  const out=e.sender==='caua',meta='<small class="wai-meta '+(e.status==='read'?'read':'')+'">'+esc(e.time||'')+(out?' ✓✓':'')+'</small>';
  if(e.type==='call')return '<div class="wai-service-msg wai-call-event '+(e.result==='missed'?'missed':'')+'"><span class="wai-call-icon">'+icon('phone')+'</span><span>'+(e.result==='missed'?'Cuộc gọi thoại nhỡ':'Cuộc gọi thoại')+' · '+esc(e.time||'')+'</span></div>';
  if(e.type==='message')return '<div class="wai-msg '+(out?'out':'in')+'"><div class="wai-bubble" data-msg="'+esc(e.id||'')+'">'+esc(e.text||'').replace(/\n/g,'<br>')+meta+'</div></div>';
  if(e.type==='image')return '<div class="wai-msg '+(out?'out':'in')+'"><div class="wai-bubble" data-msg="'+esc(e.id||'')+'">'+(images[e.id]||e.src?'<img class="wai-media" data-open-img="'+esc(e.src||images[e.id])+'" src="'+esc(e.src||images[e.id])+'" alt="Ảnh WhatsApp">':'Ảnh trong cuộc trò chuyện')+meta+'</div></div>';
  if(e.type==='audio')return '<div class="wai-msg '+(out?'out':'in')+'"><div class="wai-bubble" data-msg="'+esc(e.id||'')+'"><span class="wai-audio">🎙 <audio src="'+esc(e.src)+'" controls preload="none"></audio></span>'+meta+'</div></div>';
  if(e.type==='contact')return '<div class="wai-msg '+(out?'out':'in')+'"><div class="wai-bubble" data-msg="'+esc(e.id||'')+'">👤 <b>'+esc(e.contactName||'Liên hệ')+'</b><br>'+esc(e.phone||'')+meta+'</div></div>';
  if(e.type==='location')return '<div class="wai-msg '+(out?'out':'in')+'"><div class="wai-bubble" data-msg="'+esc(e.id||'')+'">📍 <b>'+esc(e.title||'Rio de Janeiro, RJ')+'</b>'+meta+'</div></div>';
  return '<div class="wai-service-msg">'+esc(e.text||'Thông tin')+'</div>';
 }
 function chat(){
  const t=contact(ui.id);if(!t)return info('Không tìm thấy cuộc trò chuyện');
  const ev=allEvents(t);let last='',messages='';
  for(const e of ev){if(e.date!==last){messages+='<div class="wai-date">'+esc(dateLabel(e.date))+'</div>';last=e.date}messages+=prettyMsg(e)}
  const composer='<div class="wai-compose">'+action('attach',icon('plus'))+
   '<textarea id="waiText" rows="1" placeholder="Nhập tin nhắn">'+esc(data.drafts[t.id]||'')+'</textarea>'+
   action('send','Gửi','class="wai-send"')+action('mic',icon('mic'))+'</div>';
  return nav(t.name,'Trò chuyện',headButton('call',icon('phone')))+
   '<main class="wai-screen thread"><div class="wai-messages" id="waiMessages" data-thread="'+esc(t.id)+'">'+messages+'</div>'+composer+'</main>'+
   '<button type="button" data-act="info" aria-label="Thông tin người liên hệ" style="position:absolute;top:0;left:44px;right:43px;height:43px;z-index:13;background:none;border:0"></button>';
 }
 function profile(){
  return nav('Hồ sơ','Cài đặt')+'<main class="wai-screen grouped">'+
   '<div class="wai-profile-big">'+face('caua')+action('change-photo','Chỉnh sửa ảnh','class="wai-photo-change"')+'</div>'+
   section('Tên hiển thị')+wrap(cell(esc(data.name),'edit-name'))+
   '<div class="wai-descr">Tên hiển thị với những người chưa lưu số điện thoại của bạn.</div>'+
   section('Trạng thái')+wrap(cell(esc(data.status),'edit-status'))+
   section('Số điện thoại')+wrap('<div class="wai-profile-number">'+esc(phones.caua)+'</div>')+
   ''+
   '</main>';
 }
 function contactInfo(){
  const t=contact(ui.id);if(!t)return '';
  const pictures=allEvents(t).filter(e=>e.type==='image'&&(images[e.id]||e.src));
  const subtitle=t.members?'Nhóm · '+t.members.length+' thành viên':phones[t.id]||'';
  return nav('Thông tin','Quay lại')+'<main class="wai-screen grouped">'+
   '<div class="wai-profile-big">'+face(t.id)+'<b style="display:block">'+esc(t.name)+'</b><div class="wai-subtle" style="margin-top:5px">'+esc(subtitle)+'</div></div>'+
   wrap(cell('Nhắn tin','open-chat','', 'data-id="'+esc(t.id)+'"')+cell('Gọi thoại','call'))+
   section('Trạng thái')+wrap('<div class="wai-cell">'+esc(vnStatus(t.status))+'</div>')+
   section('Ảnh và video · '+pictures.length)+wrap(cell('Ảnh đã trao đổi','media',''+pictures.length))+
   section('Tùy chọn')+wrap(cell('Tìm trong chat','thread-search')+
   cell('Tắt tiếng','mute',data.muted[t.id]?'Đang tắt':'')+
   cell('Thông báo tùy chỉnh','custom-notify')+
   cell(data.favorite.includes(t.id)?'Bỏ khỏi Yêu thích':'Thêm vào Yêu thích','fav-toggle')+
   cell(data.archived.includes(t.id)?'Bỏ lưu trữ cuộc trò chuyện':'Lưu trữ cuộc trò chuyện',data.archived.includes(t.id)?'unarchive':'archive-chat')+
   cell('Xóa nội dung trò chuyện','confirm-clear-chat')+
   cell('Xóa cuộc trò chuyện','confirm-delete-chat'))+
   (t.members?section('Thành viên')+wrap(t.members.map(id=>cell(esc(contact(id)?.name||id),'open-contact','', 'data-id="'+esc(id)+'"')).join('')):'')+
   '</main>';
 }
 function listPick(kind){
  const chosen=ui.select||[];
  return nav(kind==='group'?'Nhóm mới':kind==='broadcast'?'Danh sách phát':kind==='call'?'Cuộc gọi mới':'Tin nhắn mới','Hủy',headButton(kind==='group'?'group-next':kind==='broadcast'?'broadcast-next':'noop',kind==='group'||kind==='broadcast'?'Tiếp':' '))+
   '<main class="wai-screen">'+section(kind==='group'||kind==='broadcast'?'Chọn ít nhất hai người':'Liên hệ')+
   threads.filter(t=>!t.members).map(t=>'<button class="wai-row" data-act="'+(kind==='group'||kind==='broadcast'?'toggle-select':'pick-contact')+'" data-id="'+esc(t.id)+'">'+face(t.id)+'<span class="wai-row-info"><b>'+esc(t.name)+'</b><small>'+esc(phones[t.id]||'')+'</small></span>'+(chosen.includes(t.id)?'<span class="wai-unread-badge">✓</span>':'')+'</button>').join('')+'</main>';
 }
 function newGroupForm(){
  return nav('Tên nhóm','Quay lại')+'<main class="wai-screen grouped">'+section('Thành viên: '+ui.select.map(id=>contact(id)?.name).join(', '))+
    '<input class="wai-form-input" id="waiGroupTitle" maxlength="42" placeholder="Tên nhóm">'+
    ''+
    '<div style="padding:0 13px">'+action('create-group','Tạo nhóm','class="wai-list-action"')+'</div></main>';
 }
 function gallery(){
  const t=contact(ui.id);
  const photos=allEvents(t).filter(e=>e.type==='image'&&(images[e.id]||e.src));
  return nav('Ảnh và video','Quay lại')+'<main class="wai-screen">'+(photos.length?'<div class="wai-gallery">'+photos.map(e=>'<button style="padding:0;border:0" data-act="view-img" data-src="'+esc(e.src||images[e.id])+'"><img src="'+esc(e.src||images[e.id])+'" loading="lazy"></button>').join('')+'</div>':info('Chưa có ảnh nào được trao đổi.'))+'</main>';
 }
 function archived(){
  const rows=threads.filter(t=>data.archived.includes(t.id));
  return nav('Đã lưu trữ','Trò chuyện')+'<main class="wai-screen">'+
  (rows.map(t=>'<div class="wai-archive-item">'+chatItem(t)+'<div class="wai-archive-actions">'+
   '<button type="button" data-act="unarchive" data-id="'+esc(t.id)+'">Bỏ lưu trữ</button>'+
   '<button type="button" data-act="confirm-delete-chat" data-id="'+esc(t.id)+'">Xóa chat</button></div></div>').join('')||info('Không có chat lưu trữ.'))+'</main>';
 }
 function threadSearch(){
  const t=contact(ui.id),q=ui.search.toLocaleLowerCase('vi');
  const rows=q?allEvents(t).filter(e=>String(e.text||'').toLocaleLowerCase('vi').includes(q)):[];
  return nav('Tìm trong chat','Quay lại')+'<main class="wai-screen"><div class="wai-underbar"><input id="waiThreadSearch" class="wai-search" placeholder="Tìm tin nhắn" value="'+esc(ui.search)+'"></div>'+
  (rows.map(e=>'<button class="wai-row" data-act="jump" data-id="'+esc(e.id)+'"><span class="wai-row-info"><b>'+esc(dateLabel(e.date))+' · '+esc(e.time)+'</b><small>'+esc(e.text||'')+'</small></span></button>').join('')||info(q?'Không tìm thấy tin nhắn.':'Nhập nội dung cần tìm.'))+'</main>';
 }
 function callScreen(){
  const t=contact(ui.id);return '<div class="wai-call">'+
  '<h2>'+esc(t?.name||'Liên hệ')+'</h2><small id="waiCallTime">Đang gọi…</small>'+face(ui.id)+
  ''+
  '<button class="wai-call-end" data-act="end-call" aria-label="Kết thúc cuộc gọi">'+icon('phone')+'</button></div>';
 }
 function genericPage(){
  const sub=ui.sub;
  const group=t=>section(t);
  const desc=t=>'<div class="wai-descr">'+t+'</div>';
  let title='Cài đặt',body='';
  if(sub==='account'){title='Tài khoản';body=group('Quyền riêng tư')+wrap(cell('Riêng tư','sub','', 'data-sub="privacy"')+cell('Bảo mật','sub','', 'data-sub="security"')+cell('Đổi số','sub','', 'data-sub="change-number"'))+'' }
  else if(sub==='privacy'){title='Riêng tư';body=group('Ai có thể xem thông tin của tôi')+wrap(cell('Lần cuối truy cập','sub',data.privacy.seen,'data-sub="seen"')+cell('Ảnh đại diện','sub',data.privacy.photo,'data-sub="photo"')+cell('Trạng thái','sub',data.privacy.status,'data-sub="status"')+cell('Danh sách chặn','sub',data.privacy.blocked.length+' người','data-sub="blocked"'))+''}
  else if(['seen','photo','status'].includes(sub)){title={seen:'Lần cuối truy cập',photo:'Ảnh đại diện',status:'Trạng thái'}[sub];body=group('Hiển thị với')+wrap(['Mọi người','Danh bạ','Không ai'].map(x=>cell(x,'privacy-set',data.privacy[sub]===x?'✓':'','data-key="'+sub+'" data-value="'+x+'"')).join(''))}
  else if(sub==='blocked'){title='Danh sách chặn';body=group('Các liên hệ đã chặn')+wrap(data.privacy.blocked.map(id=>cell(esc(contact(id)?.name||id),'unblock','','data-id="'+id+'"')).join('')||'<div class="wai-cell">Không có liên hệ bị chặn</div>')+cell('Thêm liên hệ','block-list')}
  else if(sub==='security'){title='Bảo mật';body=group('Cảnh báo')+wrap(toggle('Hiển thị cảnh báo bảo mật','securityAlert'))+''}
  else if(sub==='change-number'){title='Đổi số';body=desc('Chuyển thông tin tài khoản và nhóm sang số điện thoại mới.')}
  else if(sub==='chats-calls'){title='Trò chuyện và cuộc gọi';body=group('Trò chuyện')+wrap(cell('Hình nền trò chuyện','sub','','data-sub="wallpaper"')+toggle('Lưu ảnh nhận được','saveMedia')+cell('Tự động tải media','sub','','data-sub="auto-download"')+cell('Sao lưu trò chuyện','sub','','data-sub="backup"')+cell('Chat đã lưu trữ','archived',data.archived.length+'',''))+group('Cuộc gọi')+wrap(toggle('Sử dụng ít dữ liệu','lowData','Tiết kiệm dữ liệu khi gọi thoại')) }
  else if(sub==='notifications'){title='Thông báo';body=group('Tin nhắn')+wrap(toggle('Hiển thị thông báo','alerts')+toggle('Âm thanh','sounds')+toggle('Hiển thị nội dung xem trước','preview')+toggle('Rung','vibrate'))+''}
  else if(sub==='network'){title='Mạng và dữ liệu';const m=Object.values(data.messages).reduce((n,a)=>n+a.length,0);body=group('Thống kê sử dụng')+wrap('<div class="wai-cell">Tin nhắn đã gửi <span class="wai-cell-val">'+m+'</span></div><div class="wai-cell">Cuộc gọi thoại <span class="wai-cell-val">'+data.calls.length+'</span></div>')+''}
  else if(sub==='backup'){title='Sao lưu trò chuyện';body=group('Sao lưu trò chuyện')+wrap(toggle('Bao gồm video','backupVideos')+cell('Xuất lịch sử trò chuyện','export'))+''}
  else if(sub==='auto-download'){title='Tự tải ảnh';body=group('Tự động tải media')+wrap(toggle('Tải ảnh tự động','autoImage'))}
  else if(sub==='wallpaper'){title='Hình nền';body=group('Chọn hình nền')+wrap(cell('Hình nền HD hiện tại','wallpaper-pick','', 'data-value=""')+cell('Màu kem','wallpaper-pick','','data-value="cream"')+cell('Màu xám xanh','wallpaper-pick','','data-value="blue"')+cell('Màu trắng','wallpaper-pick','','data-value="white"'))}
  else if(sub==='web'){title='WhatsApp Web';body=group('Trình duyệt trên máy tính')+desc('Trên máy tính, mở web.whatsapp.com để sử dụng WhatsApp Web.')}
  else if(sub==='help'){title='Trợ giúp';body=wrap(cell('Thông tin ứng dụng','sub','','data-sub="about-app"')+cell('Gửi phản hồi','feedback'))+''}
  else if(sub==='about-app'){title='Giới thiệu';body=group('WhatsApp')+wrap('<div class="wai-cell">WhatsApp Messenger · v2.12.5</div>')}
  else if(sub==='invite'){title='Mời bạn bè';body=desc('Mời bạn bè sử dụng WhatsApp.')}
  else if(sub==='custom-notify'){title='Thông báo tùy chỉnh';body=group('Thông báo của '+esc(contact(ui.id)?.name||''))+wrap(toggle('Bật tùy chỉnh','customAlert')+cell('Âm thông báo','notify-tone',data.notifyTone||'Mặc định'))}
  else if(sub==='choose-status'){title='Trạng thái';body=group('Chọn trạng thái')+wrap(['Có mặt','Đang bận','Đang làm việc','Đang học','Pin sắp hết','Không thể nói chuyện, chỉ nhắn WhatsApp'].map(x=>cell(esc(x),'status-choose',data.status===x?'✓':'','data-value="'+esc(x)+'"')).join('')+cell('Tùy chỉnh…','status-edit'))}
  else if(sub==='choose-fav'){title='Thêm vào yêu thích';body=threads.filter(t=>!t.members&&!data.favorite.includes(t.id)).map(t=>contactRow(t,'favorite-add')).join('')||info('Tất cả liên hệ đang nằm trong Yêu thích.')}
  else if(sub==='call-picker'){title='Cuộc gọi mới';body=threads.filter(t=>!t.members).map(t=>contactRow(t,'call')).join('')}
  else if(sub==='contact-picker'){title='Chia sẻ liên hệ';body=threads.filter(t=>!t.members).map(t=>contactRow(t,'contact-share')).join('')}
  else if(sub==='forward-pick'){title='Chuyển tiếp';body=threads.filter(t=>!t.members).map(t=>contactRow(t,'forward-to')).join('')}
  else if(sub==='block-list'){title='Chặn liên hệ';body=threads.filter(t=>!t.members&&!data.privacy.blocked.includes(t.id)).map(t=>contactRow(t,'block')).join('')}
  else if(sub==='tone'){title='Âm thanh';body=wrap(['Mặc định','Note','Chord','Glass'].map(x=>cell(x,'tone-choose',data.notifyTone===x?'✓':'','data-value="'+x+'"')).join(''))}
  else{title='WhatsApp';body=info('Chưa có dữ liệu cho màn hình này.')}
  return nav(title,'Quay lại')+'<main class="wai-screen grouped">'+body+'</main>';
 }

 function photosPicker(){
   const sources=[...document.querySelectorAll('#photosMomentsScroll .photos-thumb img')]
     .map(img=>img.getAttribute('src')||'')
     .filter(src=>/^\.\/assets\/photos\/[a-z0-9_.-]+\.(?:jpe?g|png|webp)$/i.test(src));
   const unique=[...new Set(sources)];
   return nav('Ảnh','Hủy')+
     '<main class="wai-screen"><div class="caua-wa-photo-grid">'+
       unique.map(src=>'<button type="button" class="caua-wa-photo-thumb" data-act="photo-pick" data-src="'+esc(src)+'" aria-label="Chọn ảnh"><img src="'+esc(src)+'" loading="lazy" alt=""></button>').join('')+
     '</div></main>';
 }

 function render(){
  const oldMessages=root.querySelector('#waiMessages[data-thread]');
  if(oldMessages)ui.chatScroll[oldMessages.dataset.thread]=oldMessages.scrollTop;
  if(ui.page==='main')root.innerHTML=main();
  else if(ui.page==='chat')root.innerHTML=chat();
  else if(ui.page==='profile')root.innerHTML=profile();
  else if(ui.page==='contact-info')root.innerHTML=contactInfo();
  else if(ui.page==='new-chat'||ui.page==='new-group'||ui.page==='broadcast')root.innerHTML=listPick(ui.page==='new-group'?'group':ui.page==='broadcast'?'broadcast':'chat');
  else if(ui.page==='group-name')root.innerHTML=newGroupForm();
  else if(ui.page==='media')root.innerHTML=gallery();
  else if(ui.page==='photo-picker')root.innerHTML=photosPicker();
  else if(ui.page==='archived')root.innerHTML=archived();
  else if(ui.page==='thread-search')root.innerHTML=threadSearch();
  else if(ui.page==='call')root.innerHTML=callScreen();
  else root.innerHTML=genericPage();
  if(ui.page==='chat'){
   const m=root.querySelector('#waiMessages');
   if(m){m.style.backgroundImage=data.wallpaper==='cream'?'none':data.wallpaper==='blue'?'none':data.wallpaper==='white'?'none':'';if(data.wallpaper)m.style.backgroundColor=({cream:'#e8ded2',blue:'#d8e2e5',white:'#fff'})[data.wallpaper]||'#e8ded2';if(ui.targetMsg){const el=[...m.querySelectorAll('[data-msg]')].find(x=>x.dataset.msg===ui.targetMsg);if(el){el.scrollIntoView({block:'center'});el.style.outline='2px solid #007aff'}ui.targetMsg=''}else if(ui.scrollThread)m.scrollTop=m.scrollHeight;else m.scrollTop=ui.chatScroll[ui.id]||0;ui.scrollThread=false}
  }
  if(ui.overlay)root.insertAdjacentHTML('beforeend',sheet());
  if(ui.viewer)root.insertAdjacentHTML('beforeend','<div class="wai-viewer">'+action('close-viewer','‹ Đóng')+'<img src="'+esc(ui.viewer)+'" alt="Ảnh trong WhatsApp"></div>');
 }
 function sheet(){
  if(!ui.overlay)return '';
  return '<div class="wai-overlay" data-overlay="1"><div class="wai-action-sheet">'+
   '<div style="font-size:12px;color:#888;text-align:center;padding:6px">'+esc(ui.overlay.title||'WhatsApp')+'</div>'+
   ui.overlay.buttons.map(b=>'<button data-act="'+esc(b.act)+'" '+(b.danger?'class="wai-danger" ':'')+(b.value?'data-value="'+esc(b.value)+'" ':'')+(b.id?'data-id="'+esc(b.id)+'" ':'')+'>'+esc(b.text)+'</button>').join('')+
   '<button class="cancel" data-act="close-sheet">Hủy</button></div></div>';
 }
 function openSheet(title,buttons){ui.overlay={title,buttons};render()}
 function closeSheet(){ui.overlay=null;render()}
 function toast(text){
  root.querySelector('.wai-toast')?.remove();const el=document.createElement('div');el.className='wai-toast';el.textContent=text;root.appendChild(el);
  clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.remove(),2500);
 }
 function makeMessage(t,type,extra={}){
  if(!t)return;
  const seq=++data.seq;
  const msg={id:'wai-local-'+Date.now()+'-'+seq,type,sender:'caua',date:'2015-08-24',time:'10:'+String(Math.min(59,seq%60)).padStart(2,'0'),status:'sent',...extra};
  (data.messages[t.id]||(data.messages[t.id]=[])).push(msg);save();return msg;
 }
 function sendText(){
  const t=contact(ui.id),el=root.querySelector('#waiText');if(!t||!el)return;
  const text=el.value.trim();if(!text)return;
  delete data.drafts[t.id];makeMessage(t,'message',{text});ui.scrollThread=true;render();
 }
 function clearConversation(id,removeFromList){
  const t=contact(id);if(!t)return;
  data.cleared[id]=(data.messages[id]||[]).length;
  data.unread=data.unread.filter(x=>x!==id);
  data.archived=data.archived.filter(x=>x!==id);
  if(removeFromList&&!data.deleted.includes(id))data.deleted.push(id);
  if(!removeFromList)data.deleted=data.deleted.filter(x=>x!==id);
  delete data.drafts[id];
  ui.chatScroll[id]=0;
  save();
 }
 function groupCreate(){
  const el=root.querySelector('#waiGroupTitle');const name=el?.value.trim();if(!name){toast('Nhập tên nhóm');return}
  const id='wai-group-'+Date.now(),t={id,name,members:[...ui.select],status:ui.select.length+' thành viên',events:[],preview:'Nhóm mới',lastDate:'24/08',activity:'2015-08-24T10:00:00'};
  data.groups.push(t);threads.push(t);save();ui.stack=[];ui.id=id;ui.page='chat';ui.select=[];ui.scrollThread=true;render();toast('Đã tạo nhóm');
 }
 function callStart(id){
  const t=contact(id);if(!t)return;
  const now={contactId:id,direction:'outgoing',result:'answered',date:'2015-08-24',time:'10:'+String((data.seq++)%60).padStart(2,'0')};
  data.calls.push(now);save();navigate('call',{id});
  let secs=0;clearInterval(callTimer);callTimer=setInterval(()=>{secs++;const n=root.querySelector('#waiCallTime');if(n)n.textContent='00:'+String(secs%60).padStart(2,'0')},1000)
 }
 function hangup(){clearInterval(callTimer);back();toast('Đã kết thúc cuộc gọi')}
 function addFavorite(id){if(!data.favorite.includes(id))data.favorite.push(id);save();back();toast('Đã thêm vào Yêu thích')}
 function editing(field){
  const fieldValue=field==='name'?data.name:data.status;
  openSheet(field==='name'?'Tên Cauã':'Trạng thái',[{text:'Chỉnh sửa',act:field==='name'?'prompt-name':'prompt-status'},...(field==='status'?[{text:'Chọn trạng thái có sẵn',act:'status-presets'}]:[])]);
 }
 function modalInput(field){
  ui.overlay=null;render();
  const old=field==='name'?data.name:data.status;
  const v=window.prompt(field==='name'?'Tên hiển thị Cauã:':'Trạng thái WhatsApp:',old);
  if(v===null)return;
  if(!v.trim()){toast('Nội dung không thể để trống');return}
  if(field==='name')data.name=v.trim().slice(0,45);else data.status=v.trim().slice(0,139);
  save();render();
 }
 function attachment(){
  openSheet('Gửi cho '+(contact(ui.id)?.name||''),[
   {text:'Ảnh từ thư viện',act:'attach-image'},
   {text:'Gửi vị trí · Rio de Janeiro',act:'attach-location'},
   {text:'Chia sẻ liên hệ',act:'attach-contact'},
   {text:'Tin nhắn thoại',act:'mic'}
  ]);
 }
 function bubbleActions(id){
  ui.selectedMessage=id;
  openSheet('Tùy chọn tin nhắn',[
   {text:'Sao chép',act:'copy-msg'},
   {text:'Chuyển tiếp',act:'forward-msg'},
   {text:'Thông tin tin nhắn',act:'message-info'},
   {text:'Xóa tin nhắn',act:'hide-msg'}
  ]);
 }
 function getSelectedMsg(){
  const t=contact(ui.id);return t?allEvents(t).find(e=>e.id===ui.selectedMessage):null;
 }
 function sendImage(file){
  if(!file||!file.type.startsWith('image/')){toast('Hãy chọn file ảnh');return}
  if(file.size>12000000){toast('Ảnh quá lớn, hãy chọn file dưới 12 MB');return}
  const reader=new FileReader();
  reader.onload=()=>{
   const img=new Image();img.onload=()=>{
    const c=document.createElement('canvas'),ratio=Math.min(1,850/Math.max(img.width,img.height));
    c.width=Math.max(1,Math.round(img.width*ratio));c.height=Math.max(1,Math.round(img.height*ratio));
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    const src=c.toDataURL('image/jpeg',.75);
    const t=contact(ui.id);makeMessage(t,'image',{src});
    render();toast('Đã gửi ảnh');
   };img.onerror=()=>toast('Không đọc được ảnh');img.src=String(reader.result);
  };reader.readAsDataURL(file);
 }
 function showRecording(){
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){toast('Trình duyệt không hỗ trợ ghi âm');return}
  if(ui.recording){if(recorder?.state==='recording')recorder.stop();return}
  navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
   ui.recording=true;recParts=[];recorder=new MediaRecorder(stream);
   recorder.ondataavailable=e=>{if(e.data.size)recParts.push(e.data)};
   recorder.onstop=()=>{ui.recording=false;stream.getTracks().forEach(t=>t.stop());const blob=new Blob(recParts,{type:recorder.mimeType||'audio/webm'});
    if(blob.size>1200000){toast('Ghi âm quá dài để lưu cục bộ, thử dưới 20 giây');return}
    const reader=new FileReader();reader.onload=()=>{makeMessage(contact(ui.id),'audio',{src:String(reader.result)});render();toast('Đã lưu tin nhắn thoại trên thiết bị')};reader.readAsDataURL(blob);
   };
   recorder.start();toast('Đang ghi âm… nhấn micro lần nữa để gửi');
  }).catch(()=>toast('Chưa có quyền dùng microphone'));
 }
 function backToChat(){ui.page='chat';ui.stack=ui.stack.filter(x=>x.page!=='chat');render()}
 function exportLocal(){
  const json=JSON.stringify({date:'2015-08-24',app:'WhatsApp Messenger',data},null,2);
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([json],{type:'application/json'}));a.download='caua-whatsapp-sao-luu.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  toast('Đã xuất lịch sử trò chuyện');
 }
 function setEdit(flag){ui.edit=flag;render()}
 function handle(a,el){
  const id=el.dataset.id||ui.id,val=el.dataset.value||'';
  if(a==='tab'){tab(id);return}
  if(a==='back'){back();return}
  if(a==='noop')return;
  if(a==='pick-contact'&&pendingCauaShare){
    const item=pendingCauaShare;pendingCauaShare=null;
    selectContact(id);
    const to=contact(id);if(!to)return;
    if(item.kind==='photo'&&/^\.\/assets\/photos\/[a-z0-9_.-]+\.(?:jpe?g|png|webp)$/i.test(item.src||'')){
      makeMessage(to,'image',{src:item.src});
    }else if(item.kind==='link'){
      makeMessage(to,'message',{text:[item.title,item.url].filter(Boolean).join('\n')});
    }
    ui.scrollThread=true;render();toast('Đã chia sẻ');return;
  }
  if(a==='open-chat'||a==='pick-contact'){selectContact(id);return}
  if(a==='open-contact'){navigate('contact-info',{id});return}
  if(a==='new-chat'){ui.select=[];navigate('new-chat');return}
  if(a==='new-group'){ui.select=[];navigate('new-group');return}
  if(a==='broadcasts'){ui.select=[];navigate('broadcast');return}
  if(a==='call-filter'){ui.callFilter=id;render();return}
  if(a==='new-call'){navigate('sub',{sub:'call-picker'});return}
  if(a==='call'){ui.overlay=null;callStart(id);return}
  if(a==='end-call'){hangup();return}
  if(a==='profile'){navigate('profile');return}
  if(a==='info'){navigate('contact-info');return}
  if(a==='media'){navigate('media');return}
  if(a==='thread-search'){ui.search='';navigate('thread-search');return}
  if(a==='archived'){navigate('archived');return}
  if(a==='account'||a==='chats-calls'||a==='notifications'||a==='network'||a==='web'||a==='help'||a==='invite'||a==='about-app'){navigate('sub',{sub:a});return}
  if(a==='sub'){navigate('sub',{sub:el.dataset.sub||''});return}
  if(a==='edit-name'){editing('name');return}
  if(a==='edit-status'){editing('status');return}
  if(a==='prompt-name'){modalInput('name');return}
  if(a==='prompt-status'){modalInput('status');return}
  if(a==='status-presets'){ui.overlay=null;navigate('sub',{sub:'choose-status'});return}
  if(a==='status-edit'){modalInput('status');return}
  if(a==='status-choose'){data.status=val;save();back();return}
  if(a==='attach-image'){ui.overlay=null;ui.photoPickerFor='chat';navigate('photo-picker');return}
  if(a==='photo-pick'){
    const src=el.dataset.src||'';
    if(!/^\.\/assets\/photos\/[a-z0-9_.-]+\.(?:jpe?g|png|webp)$/i.test(src))return;
    if(ui.photoPickerFor==='profile'){
      data.photo=src;save();ui.photoPickerFor='chat';back();toast('Đã đổi ảnh đại diện');return;
    }
    if(!contact(ui.id)){toast('Không tìm thấy liên hệ');return}
    makeMessage(contact(ui.id),'image',{src});
    ui.scrollThread=true;back();toast('Đã gửi ảnh');return;
  }
  if(a==='change-photo'){ui.photoPickerFor='profile';navigate('photo-picker');return}
  if(a==='send'){sendText();return}
  if(a==='attach'){attachment();return}
  if(a==='mic'){ui.overlay=null;render();toast('Không có kết nối. Không thể ghi âm lúc này.');return}
  if(a==='attach-location'){ui.overlay=null;makeMessage(contact(ui.id),'location',{title:'Rio de Janeiro, RJ'});render();return}
  if(a==='attach-contact'){ui.overlay=null;ui.select=[];navigate('sub',{sub:'contact-picker'});return}
  if(a==='toggle-select'){ui.select=ui.select.includes(id)?ui.select.filter(x=>x!==id):[...ui.select,id];render();return}
  if(a==='group-next'||a==='broadcast-next'){if(ui.select.length<2){toast('Chọn ít nhất 2 liên hệ');return}
   if(a==='group-next')navigate('group-name');else{ui.overlay=null;const content=window.prompt('Nhập tin nhắn danh sách phát:','');if(content?.trim()){for(const cid of ui.select)makeMessage(contact(cid),'message',{text:content.trim()});tab('chats');toast('Đã thêm tin cho '+ui.select.length+' liên hệ')}}return}
  if(a==='create-group'){groupCreate();return}
  if(a==='choose-favorite'){navigate('sub',{sub:'choose-fav'});return}
  if(a==='favorite-add'){addFavorite(id);return}
  if(a==='fav-toggle'){data.favorite=data.favorite.includes(ui.id)?data.favorite.filter(x=>x!==ui.id):data.favorite.concat(ui.id);save();render();return}
  if(a==='mute'){ui.overlay=null;openSheet('Tắt thông báo '+contact(ui.id)?.name,[{text:'8 giờ',act:'mute-set',value:'8 giờ'},{text:'1 tuần',act:'mute-set',value:'1 tuần'},{text:'1 năm',act:'mute-set',value:'1 năm'},{text:'Bật lại thông báo',act:'mute-set',value:'off'}]);return}
  if(a==='mute-set'){if(val==='off')delete data.muted[ui.id];else data.muted[ui.id]=val;save();closeSheet();return}
  if(a==='archive-chat'){if(!data.archived.includes(ui.id))data.archived.push(ui.id);save();tab('chats');return}
  if(a==='unarchive'){data.archived=data.archived.filter(x=>x!==id);save();render();toast('Đã bỏ lưu trữ');return}
  if(a==='confirm-clear-chat'){openSheet('Xóa tin nhắn của '+(contact(id)?.name||'cuộc trò chuyện')+'?', [{text:'Xóa toàn bộ tin nhắn',act:'clear-chat',id,danger:true}]);return}
  if(a==='confirm-delete-chat'){openSheet('Xóa cuộc trò chuyện với '+(contact(id)?.name||'liên hệ')+'?', [{text:'Xóa cuộc trò chuyện',act:'delete-chat',id,danger:true}]);return}
  if(a==='clear-chat'){clearConversation(id,false);ui.overlay=null;render();toast('Đã xóa nội dung trò chuyện');return}
  if(a==='delete-chat'){clearConversation(id,true);ui.overlay=null;tab('chats');toast('Đã xóa cuộc trò chuyện');return}
  if(a==='mark-unread'){if(!data.unread.includes(id))data.unread.push(id);save();closeSheet();return}
  if(a==='mark-read'){data.unread=data.unread.filter(x=>x!==id);save();closeSheet();return}
  if(a==='archive-from-list'){if(!data.archived.includes(id))data.archived.push(id);save();closeSheet();return}
  if(a==='swipe-menu'){ui.overlay=null;ui.swipeId=id;openSheet(contact(id)?.name||'Chat',[
   {text:data.unread.includes(id)?'Đánh dấu đã đọc':'Đánh dấu chưa đọc',act:data.unread.includes(id)?'mark-read':'mark-unread',id},
   {text:data.archived.includes(id)?'Bỏ lưu trữ':'Lưu trữ',act:data.archived.includes(id)?'unarchive':'archive-from-list',id},
   {text:'Xóa nội dung trò chuyện',act:'confirm-clear-chat',id},
   {text:'Xóa cuộc trò chuyện',act:'confirm-delete-chat',id},
   {text:'Tắt thông báo',act:'mute-list',id},
   {text:'Thông tin liên hệ',act:'info-list',id}]);return}
  if(a==='mute-list'){ui.overlay=null;data.muted[id]='8 giờ';save();render();return}
  if(a==='info-list'){ui.overlay=null;navigate('contact-info',{id});return}
  if(a==='open-media'){ui.viewer=val||el.dataset.src||'';render();return}
  if(a==='view-img'){ui.viewer=el.dataset.src||'';render();return}
  if(a==='close-viewer'){ui.viewer='';render();return}
  if(a==='close-sheet'){closeSheet();return}
  if(a==='bubble'){bubbleActions(id);return}
  if(a==='copy-msg'){const e=getSelectedMsg();if(e&&navigator.clipboard?.writeText)navigator.clipboard.writeText(e.text||'').then(()=>toast('Đã sao chép')).catch(()=>toast('Không thể sao chép'));ui.overlay=null;render();return}
  if(a==='message-info'){const e=getSelectedMsg();closeSheet();openSheet('Thông tin tin nhắn',[{text:'Gửi '+dateLabel(e?.date)+' lúc '+(e?.time||''),act:'noop'},{text:e?.sender==='caua'?'Đã gửi ✓✓':'Đã nhận',act:'noop'}]);return}
  if(a==='hide-msg'){if(ui.selectedMessage&&!data.hide.includes(ui.selectedMessage))data.hide.push(ui.selectedMessage);save();closeSheet();return}
  if(a==='forward-msg'){ui.overlay=null;navigate('sub',{sub:'forward-pick'});return}
  if(a==='forward-to'){const source=ui.stack.findLast?.(x=>x.page==='chat');const origin=source?contact(source.id):contact(ui.id);const message=origin?allEvents(origin).find(e=>e.id===ui.selectedMessage):null,t=contact(id);if(message&&t){makeMessage(t,'message',{text:'↪ '+(message.text||'Đã chuyển tiếp tệp đính kèm')});ui.page='chat';ui.id=id;ui.stack=[];render();toast('Đã chuyển tiếp')}return}
  if(a==='jump'){ui.targetMsg=id;backToChat();return}
  if(a==='pref'){const k=id;data.prefs[k]=!data.prefs[k];save();render();return}
  if(a==='privacy-set'){data.privacy[el.dataset.key]=val;save();back();return}
  if(a==='block-list'){navigate('sub',{sub:'block-list'});return}
  if(a==='block'){if(!data.privacy.blocked.includes(id))data.privacy.blocked.push(id);save();back();return}
  if(a==='unblock'){data.privacy.blocked=data.privacy.blocked.filter(x=>x!==id);save();render();return}
  if(a==='wallpaper-pick'){data.wallpaper=val;save();back();return}
  if(a==='export'){exportLocal();return}
  if(a==='custom-notify'){navigate('sub',{sub:'custom-notify'});return}
  if(a==='notify-tone'){navigate('sub',{sub:'tone'});return}
  if(a==='tone-choose'){data.notifyTone=val;save();back();return}
  if(a==='feedback'){toast('Không thể gửi phản hồi lúc này');return}
  if(a==='contact-share'){const person=contact(id);if(person){makeMessage(contact(ui.id),'contact',{contactName:person.name,phone:phones[id]||''});backToChat()}return}
 }

 window.addEventListener('caua:whatsapp-share',event=>{
   const item=event.detail||{};
   if(item.kind!=='photo'&&item.kind!=='link')return;
   pendingCauaShare=item;
   ui.stack=[];ui.tab='chats';ui.page='new-chat';ui.id='';ui.select=[];ui.overlay=null;
   render();
 });
 root.addEventListener('click',e=>{
  const image=e.target.closest('[data-open-img]');if(image){e.preventDefault();e.stopPropagation();ui.viewer=image.dataset.openImg;render();return}
  const bubble=e.target.closest('.wai-bubble[data-msg]');if(bubble&&!e.target.closest('audio,button')){if(bubble.dataset.msg){ui.selectedMessage=bubble.dataset.msg;openSheet('Tin nhắn',[{text:'Sao chép',act:'copy-msg'},{text:'Chuyển tiếp',act:'forward-msg'},{text:'Thông tin',act:'message-info'},{text:'Xóa tin nhắn',act:'hide-msg'}])}return}
  const el=e.target.closest('[data-act]');if(!el)return;e.preventDefault();e.stopPropagation();
  handle(el.dataset.act,el);
 },true);
 root.addEventListener('input',e=>{
  if(e.target.id==='waiSearch'){ui.query=e.target.value;const caret=e.target.selectionStart;render();const n=root.querySelector('#waiSearch');if(n){n.focus();n.setSelectionRange(caret,caret)}}
  if(e.target.id==='waiThreadSearch'){ui.search=e.target.value;const caret=e.target.selectionStart;render();const n=root.querySelector('#waiThreadSearch');if(n){n.focus();n.setSelectionRange(caret,caret)}}
  if(e.target.id==='waiText'){data.drafts[ui.id]=e.target.value;save()}
 });
 root.addEventListener('keydown',e=>{if(e.target.id==='waiText'&&e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendText()}});
 root.addEventListener('change',e=>{
  if(e.target.id!=='waiFile')return;
  const file=e.target.files?.[0],kind=e.target.dataset.kind;if(!file)return;
  if(kind==='avatar'){
   const reader=new FileReader();reader.onload=()=>{
    const image=new Image();image.onload=()=>{const c=document.createElement('canvas'),side=280,k=Math.min(image.width,image.height);c.width=side;c.height=side;c.getContext('2d').drawImage(image,(image.width-k)/2,(image.height-k)/2,k,k,0,0,side,side);data.photo=c.toDataURL('image/jpeg',0.78);save();render();toast('Đã thay ảnh profile Cauã')};image.src=String(reader.result);
   };reader.readAsDataURL(file);
  }else sendImage(file);
 });
 let touch=null;
 root.addEventListener('touchstart',e=>{const row=e.target.closest('.wai-chat-row');if(row)touch={x:e.touches[0].clientX,y:e.touches[0].clientY,id:row.dataset.thread}},{passive:true});
 root.addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;const id=touch.id;touch=null;if(Math.abs(dx)>65&&Math.abs(dy)<50){e.preventDefault();handle('swipe-menu',{dataset:{id}})}},{passive:false});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&app.classList.contains('open'))back()});
 const fileInput=document.createElement('input');fileInput.id='waiFile';fileInput.type='file';fileInput.accept='image/*';fileInput.style.display='none';root.appendChild(fileInput);
 const draw=render;render=()=>{draw();if(!root.contains(fileInput))root.appendChild(fileInput)};
 render();
 console.info('CAUA WhatsApp iOS8 2015: independent five-tab UI ready; case history preserved.');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
