/* Cauã WhatsApp 2015 interactive extension. Canonical chat history stays untouched. */
(function(){
'use strict';
const api=window.CAUA_WA_API, app=document.getElementById('whatsappApp');
if(!api||!app||app.dataset.waExtended)return;
app.dataset.waExtended='1';
const listView=document.getElementById('waListView'), threadView=document.getElementById('waThreadView');
const chatList=document.getElementById('waChatList'), search=document.getElementById('waSearch');
const canvas=document.getElementById('waChatCanvas'), input=threadView.querySelector('.wa-input'), send=threadView.querySelector('.wa-mic');
const profileIds=['mother','camila','livia'];
const faces={mother:'./assets/whatsapp/photos/wa_avatar_mother.png',camila:'./assets/whatsapp/photos/wa_avatar_camila.png',livia:'./assets/whatsapp/photos/wa_avatar_livia.png'};
const pictures={'camila-img-1':'./assets/whatsapp/photos/wa_camila_01.png','livia-img-1':'./assets/whatsapp/photos/wa_livia_01.png','livia-img-2':'./assets/whatsapp/photos/wa_livia_02.png','livia-img-3':'./assets/whatsapp/photos/wa_livia_03.png','livia-img-4':'./assets/whatsapp/photos/wa_livia_04.png','livia-img-5':'./assets/whatsapp/photos/wa_livia_05.png'};
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const initials=s=>String(s||'?').split(' ').map(x=>x[0]).slice(-2).join('').toUpperCase();
const key='caua-wa-local-actions-2015-v1';
let saved={messages:{},groups:[],muted:{},unread:{},archived:{},settings:{lowData:false,videoBackup:false,notifications:true},about:'Có sẵn'};
try{const v=JSON.parse(localStorage.getItem(key)||'null');if(v&&typeof v==='object')saved={...saved,...v}}catch(e){}
const persist=()=>{try{localStorage.setItem(key,JSON.stringify(saved))}catch(e){}};
const find=id=>api.THREADS.find(t=>t.id===id);
const contacts=()=>api.THREADS.filter(t=>profileIds.includes(t.id));
for(const g of saved.groups||[]){if(!find(g.id))api.THREADS.push({...g,events:[]})}
for(const t of api.THREADS){for(const m of (saved.messages||{})[t.id]||[]){if(!t.events.some(e=>e.id===m.id))t.events.push(m);if(m.date==='2015-08-24'){t.preview=m.text;t.lastDate='10:00';t.activity='2015-08-24T10:00:00'}}}
const panel=document.createElement('div');panel.className='wa-ext-panel';panel.style.display='none';listView.appendChild(panel);
const sheet=document.createElement('div');sheet.className='wa-ext-sheet';sheet.style.display='none';app.querySelector('.wa-shell').appendChild(sheet);
let tab='chats', selected=new Set(), callTick=0, callTimer=null;
const face=t=>faces[t.id]?'<span class="wa-avatar caua-hd" style="background-image:url(&quot;'+faces[t.id]+'&quot;)"></span>':'<span class="wa-ext-symbol">'+safe(initials(t.name))+'</span>';
const row=(t,extra='')=>'<button class="wa-ext-row" data-wa-ext-contact="'+safe(t.id)+'">'+face(t)+'<span class="wa-ext-row-copy"><b>'+safe(t.name)+'</b><small>'+safe(extra||t.status||'WhatsApp')+'</small></span><span style="color:#0c806e">›</span></button>';
const empty=msg=>'<div class="wa-ext-empty">'+safe(msg)+'</div>';
function toast(message){
  app.querySelector('.wa-ext-toast')?.remove();
  const el=document.createElement('div');el.className='wa-ext-toast';el.textContent=message;app.querySelector('.wa-shell').appendChild(el);
  setTimeout(()=>el.remove(),2500);
}
function closeSheet(){sheet.style.display='none';sheet.innerHTML='';}
function showSheet(title,body,right=''){
  sheet.innerHTML='<div class="wa-ext-toolbar"><button type="button" data-wa-ext-close aria-label="Quay lại">‹</button><strong>'+safe(title)+'</strong>'+right+'</div><div class="wa-ext-content">'+body+'</div>';
  sheet.style.display='flex';
}
function resetTabState(){listView.querySelectorAll('.wa-tab').forEach(b=>b.classList.toggle('active',b.dataset.waTab===tab))}
function decorateChats(){
  chatList.querySelectorAll('[data-wa-thread]').forEach(el=>{
    const id=el.dataset.waThread;
    el.style.display=saved.archived?.[id]?'none':'';
    el.classList.toggle('wa-ext-unread-row',!!saved.unread?.[id]);
    if(saved.unread?.[id]&&!el.querySelector('.wa-ext-unread')){const dot=document.createElement('span');dot.className='wa-ext-unread';el.appendChild(dot)}
  });
}
function renderContacts(){
  const q=(search.value||'').toLocaleLowerCase('vi');
  const found=contacts().filter(t=>t.name.toLocaleLowerCase('vi').includes(q));
  panel.innerHTML='<div class="wa-ext-section">Danh bạ WhatsApp · '+found.length+' liên hệ</div>'+(found.length?found.map(t=>row(t)).join(''):empty('Không tìm thấy liên hệ.'));
}
function calls(){
  return api.THREADS.flatMap(t=>t.events.filter(e=>e.type==='call').map(e=>({...e,who:t.name,thread:t.id}))).sort((a,b)=>(b.date+'T'+b.time).localeCompare(a.date+'T'+a.time));
}
function renderCalls(){
  const q=(search.value||'').toLocaleLowerCase('vi');
  const all=calls().filter(c=>c.who.toLocaleLowerCase('vi').includes(q));
  const content=all.map(c=>{
    const missed=c.result==='missed';
    return '<button class="wa-ext-row" data-wa-ext-call="'+safe(c.thread)+'"><span class="wa-ext-symbol '+(missed?'missed':'')+'">'+(c.direction==='incoming'?'↙':'↗')+'</span><span class="wa-ext-row-copy"><b style="'+(missed?'color:#d45151':'')+'">'+safe(c.who)+'</b><small>'+(missed?'Cuộc gọi nhỡ':c.direction==='incoming'?'Cuộc gọi đến':'Cuộc gọi đi')+'</small></span><span class="wa-ext-time">'+safe(c.date.split('-').reverse().slice(0,2).join('/'))+' · '+safe(c.time)+'</span></button>';
  }).join('');
  panel.innerHTML='<div class="wa-ext-section">Nhật ký gọi thoại</div>'+(content||empty('Không có cuộc gọi nào.'))+'';
}
function renderChats(){
  api.renderList();decorateChats();
  if(search.value.trim()){
    const q=search.value.trim().toLocaleLowerCase('vi');
    chatList.querySelectorAll('[data-wa-thread]').forEach(el=>{
      const t=find(el.dataset.waThread);
      if(!t)return;
      const hit=t.events.some(e=>(e.text||'').toLocaleLowerCase('vi').includes(q));
      const title=t.name.toLocaleLowerCase('vi').includes(q);
      const p=(t.preview||'').toLocaleLowerCase('vi').includes(q);
      if(!hit&&!title&&!p)el.style.display='none';
      else if(saved.archived?.[t.id])el.style.display='';
    });
  }
}
function setTab(next){
  tab=next;closeSheet();api.showList();resetTabState();
  panel.style.display=next==='chats'?'none':'block';
  if(next==='chats')renderChats();
  else if(next==='contacts')renderContacts();
  else if(next==='recents')renderCalls();
  else if(next==='settings')settings();
  else if(next==='favorites')renderFavorites();
}
function chooseContact(t){closeSheet();setTab('chats');saved.unread[t.id]=false;persist();api.openThread(t.id)}
function newChat(){
  showSheet('Tin nhắn mới','<div class="wa-ext-section">Chọn người nhận</div>'+contacts().map(t=>row(t)).join(''));
}
function groupPicker(){
  selected=new Set();
  const body='<div class="wa-ext-section">Chọn ít nhất 2 thành viên</div>'+contacts().map(t=>'<button class="wa-ext-row" data-wa-ext-pick="'+safe(t.id)+'">'+face(t)+'<span class="wa-ext-row-copy"><b>'+safe(t.name)+'</b></span><span class="wa-ext-check">✓</span></button>').join('')+'<div class="wa-ext-bottom"><button class="wa-ext-action" data-wa-ext-group-next type="button">Tiếp tục</button></div>';
  showSheet('Nhóm mới',body);
}
function groupName(){
  if(selected.size<2){toast('Hãy chọn ít nhất 2 thành viên');return}
  showSheet('Tên nhóm','<div class="wa-ext-section">Thành viên: '+[...selected].map(id=>safe(find(id)?.name||id)).join(', ')+'</div><input class="wa-ext-field" id="waExtGroupTitle" maxlength="40" placeholder="Tên nhóm"><div class="wa-ext-bottom"><button class="wa-ext-action" data-wa-ext-group-create>Tạo nhóm</button></div>');
  sheet.querySelector('input')?.focus();
}
function createGroup(){
  const name=sheet.querySelector('#waExtGroupTitle')?.value.trim();
  if(!name){toast('Nhập tên nhóm');return}
  const id='caua-local-group-'+Date.now();
  const t={id,name,status:[...selected].length+' thành viên',lastDate:'24/08',preview:'Nhóm mới',activity:'2015-08-24T10:00:00',events:[],members:[...selected]};
  saved.groups.push({...t,events:[]});api.THREADS.unshift(t);persist();chooseContact(t);
  toast('Đã tạo nhóm');
}
function ownerPhoto(){return saved.avatarData&&saved.avatarData.startsWith('data:image/')?saved.avatarData:'./assets/facebook/avatar.jpg'}
function settings(){
  const owner=saved.ownerName||'Cauã Valença';
  const checks=[['notifications','Thông báo','Bật thông báo'],['lowData','Sử dụng dữ liệu thấp','Giảm dữ liệu khi gọi thoại'],['videoBackup','Bao gồm video khi sao lưu','Tùy chọn năm 2015']];
  panel.innerHTML='<div class="wa-ext-section">Tài khoản</div>'+
    '<button class="wa-owner-summary" data-wa-ext-profile type="button"><img src="'+ownerPhoto()+'" alt="Ảnh Cauã"><span><strong>'+safe(owner)+'</strong><small>'+safe(saved.about||'Có sẵn')+'</small></span><b>›</b></button>'+
    '<div class="wa-ext-section">Tùy chọn</div><div class="wa-ext-card">'+
    checks.map(([k,n,d])=>'<label class="wa-ext-line"><span>'+n+'<small style="display:block;margin-top:4px">'+d+'</small></span><input type="checkbox" data-wa-ext-pref="'+k+'" '+(saved.settings[k]?'checked':'')+'></label>').join('')+'</div>'+
    '<div class="wa-ext-section">Dữ liệu và riêng tư</div><div class="wa-ext-card"><button class="wa-ext-line" data-wa-ext-archive>Chat đã lưu trữ <small>'+Object.values(saved.archived).filter(Boolean).length+'</small></button><button class="wa-ext-line" data-wa-ext-web>WhatsApp Web <small>2015</small></button></div>'+
    '';
}
function showOwnerProfile(){
  const owner=saved.ownerName||'Cauã Valença';
  const html='<div class="wa-owner-photo-wrap"><img class="wa-owner-photo" src="'+ownerPhoto()+'" alt="Ảnh đại diện của Cauã"><label class="wa-owner-photo-change">Đổi ảnh<input id="waExtOwnerPhoto" type="file" accept="image/jpeg,image/png,image/webp" hidden></label></div>'+
   '<div class="wa-ext-section">Tên hiển thị</div><input class="wa-ext-field" id="waExtOwnerName" maxlength="45" value="'+safe(owner)+'">'+
   '<div class="wa-ext-muted">Tên này hiển thị cho người khác trên WhatsApp.</div>'+
   '<div class="wa-ext-section">Trạng thái</div><input class="wa-ext-field" id="waExtOwnerAbout" maxlength="139" value="'+safe(saved.about||'Có sẵn')+'">'+
   '<div class="wa-ext-section">Số điện thoại</div><div class="wa-owner-number">Chưa có số điện thoại của Cauã trong dữ liệu case</div>'+
   '<div class="wa-ext-bottom"><button class="wa-ext-action" id="waExtOwnerSave" type="button">Lưu hồ sơ</button></div>';
  showSheet('Hồ sơ',html);
}
function renderFavorites(){panel.innerHTML='<div class="wa-ext-section">Liên hệ WhatsApp</div>'+contacts().map(t=>row(t)).join('')}
function archived(){
  const threads=api.THREADS.filter(t=>saved.archived[t.id]);
  showSheet('Chat đã lưu trữ','<div class="wa-ext-section">'+threads.length+' cuộc trò chuyện</div>'+(threads.map(t=>'<button class="wa-ext-row" data-wa-ext-unarchive="'+safe(t.id)+'">'+face(t)+'<span class="wa-ext-row-copy"><b>'+safe(t.name)+'</b><small>Nhấn để bỏ lưu trữ</small></span></button>').join('')||empty('Chưa có cuộc trò chuyện lưu trữ.')));
}
function threadOptions(){
  const t=api.getCurrent();if(!t)return;
  const mute=saved.muted?.[t.id];
  showSheet(t.name,'<div class="wa-ext-card"><button class="wa-ext-line" data-wa-ext-search-thread>Tìm kiếm trong cuộc trò chuyện</button><button class="wa-ext-line" data-wa-ext-gallery>Ảnh đã trao đổi</button><button class="wa-ext-line" data-wa-ext-toggle-unread>Đánh dấu '+(saved.unread[t.id]?'đã đọc':'chưa đọc')+'</button><button class="wa-ext-line" data-wa-ext-mute>'+(mute?'Bật lại thông báo':'Tắt thông báo')+'</button><button class="wa-ext-line" data-wa-ext-archive-thread>Lưu trữ cuộc trò chuyện</button></div><div class="wa-ext-muted">Không xóa lịch sử tin nhắn gốc của Cauã.</div>');
}
function muteOptions(){
  const t=api.getCurrent();if(!t)return;
  if(saved.muted[t.id]){delete saved.muted[t.id];persist();threadOptions();return}
  showSheet('Tắt thông báo','<div class="wa-ext-card">'+[['8 giờ','8h'],['1 tuần','1w'],['1 năm','1y']].map(([n,v])=>'<button class="wa-ext-line" data-wa-ext-mute-set="'+v+'">'+n+'</button>').join('')+'</div>');
}
function gallery(){
  const t=api.getCurrent();if(!t)return;
  const photos=t.events.filter(e=>e.type==='image'&&pictures[e.id]);
  const grid=photos.map(e=>'<button data-wa-ext-photo="'+safe(e.id)+'" style="display:inline-block;width:46%;margin:2%;padding:0;border:0;background:none"><img loading="lazy" src="'+pictures[e.id]+'" style="width:100%;height:110px;object-fit:cover;border-radius:4px"><small>'+safe(e.date.split('-').reverse().join('/'))+'</small></button>').join('');
  showSheet('Ảnh · '+t.name,grid||empty('Chưa có ảnh trong cuộc trò chuyện.'));
}
function searchThread(){
  const t=api.getCurrent();if(!t)return;
  showSheet('Tìm trong · '+t.name,'<input class="wa-ext-field" id="waExtQuery" placeholder="Tìm nội dung tin nhắn" autocomplete="off"><div id="waExtSearchResults"></div>');
  sheet.querySelector('#waExtQuery')?.focus();
}
function searchResults(){
  const t=api.getCurrent(),q=sheet.querySelector('#waExtQuery')?.value.toLocaleLowerCase('vi').trim()||'';
  const out=sheet.querySelector('#waExtSearchResults');if(!out||!t)return;
  if(!q){out.innerHTML='<div class="wa-ext-muted">Nhập từ khóa để tìm tin nhắn cũ.</div>';return}
  const matches=t.events.map((e,i)=>({...e,i})).filter(e=>e.type==='message'&&e.text?.toLocaleLowerCase('vi').includes(q));
  out.innerHTML=matches.length?matches.map(e=>'<button class="wa-ext-row" data-wa-ext-jump="'+e.i+'"><span class="wa-ext-row-copy"><b>'+safe(e.date.split('-').reverse().slice(0,2).join('/'))+' · '+safe(e.time)+'</b><small>'+safe(e.text.slice(0,140))+'</small></span></button>').join(''):empty('Không tìm thấy tin nhắn phù hợp.');
}
function callContact(t){
  clearInterval(callTimer);callTick=0;
  showSheet('Cuộc gọi WhatsApp','<div class="wa-ext-call-face">'+safe(initials(t.name))+'</div><h2>'+safe(t.name)+'</h2><p id="waExtCallClock">Đang gọi…</p>');
  sheet.classList.add('wa-ext-call-screen');
  const end=document.createElement('button');end.className='wa-ext-hangup';end.textContent='☎';end.setAttribute('aria-label','Kết thúc cuộc gọi');end.dataset.waExtEndCall='1';sheet.appendChild(end);
  callTimer=setInterval(()=>{callTick++;const el=sheet.querySelector('#waExtCallClock');if(el)el.textContent='00:'+String(callTick).padStart(2,'0')},1000);
}
function endCall(){clearInterval(callTimer);sheet.classList.remove('wa-ext-call-screen');closeSheet();toast('Đã kết thúc cuộc gọi')}
function appendMessage(text){
  const t=api.getCurrent();if(!t||!text.trim())return;
  const previous=Object.values(saved.messages).reduce((n,a)=>n+(a?.length||0),0);
  const time='10:'+String(Math.min(59,previous+1)).padStart(2,'0');
  const msg={type:'message',id:'local-wa-'+Date.now(),date:'2015-08-24',time,sender:'caua',text:text.trim(),status:'sent'};
  (saved.messages[t.id]??=[]).push(msg);t.events.push(msg);t.preview=msg.text;t.lastDate=time;t.activity='2015-08-24T'+time+':00';
  persist();api.renderThread(t);input.value='';send.classList.remove('wa-ext-send');send.textContent='♩';
  toast('Đã gửi tin nhắn');
}
function attachmentMenu(){
  showSheet('Đính kèm','<div class="wa-ext-card"><button class="wa-ext-line" data-wa-ext-share-contact>Chia sẻ liên hệ</button><button class="wa-ext-line" data-wa-ext-share-location>Gửi vị trí</button><button class="wa-ext-line" data-wa-ext-photos>Ảnh đã trao đổi</button></div>');
}
function shareContactMenu(){
  showSheet('Chia sẻ liên hệ','<div class="wa-ext-section">Chọn một người</div>'+contacts().map(t=>'<button class="wa-ext-row" data-wa-ext-send-contact="'+safe(t.id)+'">'+face(t)+'<span class="wa-ext-row-copy"><b>'+safe(t.name)+'</b></span></button>').join(''));
}
function closeCallUI(){clearInterval(callTimer);sheet.classList.remove('wa-ext-call-screen');closeSheet()}
const extra=document.createElement('button');extra.type='button';extra.className='wa-ext-thread-more';extra.setAttribute('aria-label','Tùy chọn trò chuyện');extra.textContent='⋮';
extra.style.cssText='position:absolute;top:0;right:0;height:54px;width:26px;border:0;background:transparent;color:#fff;font-size:23px;z-index:25';
threadView.querySelector('.wa-thread-nav')?.appendChild(extra);
extra.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();threadOptions()});
listView.addEventListener('click',e=>{
  const button=e.target.closest('[data-wa-tab],#waComposeNew');
  if(!button)return;
  e.stopImmediatePropagation();e.preventDefault();
  if(button.id==='waComposeNew')newChat();else if(['chats','contacts','recents','settings','favorites'].includes(button.dataset.waTab))setTab(button.dataset.waTab);
},true);
app.addEventListener('click',e=>{
  const pop=e.target.closest('.wa-android-popup button');
  if(pop){
    e.stopImmediatePropagation();e.preventDefault();
    app.querySelector('.wa-android-popup')?.classList.remove('show');
    const label=pop.textContent.trim().toLocaleLowerCase('vi');
    if(label.includes('nhóm'))groupPicker();
    else if(label.includes('cài đặt'))setTab('settings');
    else if(label.includes('whatsapp web'))showSheet('WhatsApp Web', '<div class="wa-ext-empty">Trên máy tính, mở web.whatsapp.com rồi quét mã QR.</div>');
    else if(label.includes('trạng thái'))showAbout();
    else toast('Danh sách phát: sẽ hoàn thiện trong đợt tiếp theo');
    return;
  }
  const contact=e.target.closest('[data-wa-ext-contact]');
  if(contact){e.stopPropagation();const t=find(contact.dataset.waExtContact);if(t)chooseContact(t);return}
  const btn=e.target.closest('[data-wa-ext-profile],[data-wa-ext-close],[data-wa-ext-pick],[data-wa-ext-group-next],[data-wa-ext-group-create],[data-wa-ext-about],[data-wa-ext-archive],[data-wa-ext-web],[data-wa-ext-unarchive],[data-wa-ext-search-thread],[data-wa-ext-gallery],[data-wa-ext-toggle-unread],[data-wa-ext-mute],[data-wa-ext-mute-set],[data-wa-ext-archive-thread],[data-wa-ext-photo],[data-wa-ext-jump],[data-wa-ext-call],[data-wa-ext-end-call],[data-wa-ext-share-contact],[data-wa-ext-send-contact],[data-wa-ext-share-location],[data-wa-ext-photos]');
  if(!btn)return;
  e.preventDefault();e.stopPropagation();
  const t=api.getCurrent();
  if(btn.hasAttribute('data-wa-ext-profile'))showOwnerProfile();
  else if(btn.hasAttribute('data-wa-ext-close'))closeCallUI();
  else if(btn.hasAttribute('data-wa-ext-pick')){const id=btn.dataset.waExtPick;selected.has(id)?selected.delete(id):selected.add(id);btn.classList.toggle('selected',selected.has(id))}
  else if(btn.hasAttribute('data-wa-ext-group-next'))groupName();
  else if(btn.hasAttribute('data-wa-ext-group-create'))createGroup();
  else if(btn.hasAttribute('data-wa-ext-about'))showAbout();
  else if(btn.hasAttribute('data-wa-ext-archive'))archived();
  else if(btn.hasAttribute('data-wa-ext-web'))showSheet('WhatsApp Web',empty('Trên máy tính, mở web.whatsapp.com.'));
  else if(btn.hasAttribute('data-wa-ext-unarchive')){delete saved.archived[btn.dataset.waExtUnarchive];persist();archived()}
  else if(btn.hasAttribute('data-wa-ext-search-thread'))searchThread();
  else if(btn.hasAttribute('data-wa-ext-gallery'))gallery();
  else if(btn.hasAttribute('data-wa-ext-toggle-unread')&&t){saved.unread[t.id]=!saved.unread[t.id];persist();threadOptions()}
  else if(btn.hasAttribute('data-wa-ext-mute'))muteOptions();
  else if(btn.hasAttribute('data-wa-ext-mute-set')&&t){saved.muted[t.id]=btn.dataset.waExtMuteSet;persist();threadOptions()}
  else if(btn.hasAttribute('data-wa-ext-archive-thread')&&t){saved.archived[t.id]=true;persist();closeSheet();setTab('chats')}
  else if(btn.hasAttribute('data-wa-ext-photo')){const url=pictures[btn.dataset.waExtPhoto];if(url)showSheet('Ảnh','<img src="'+url+'" style="display:block;max-width:100%;max-height:90%;object-fit:contain;margin:18px auto">')}
  else if(btn.hasAttribute('data-wa-ext-jump')&&t){const index=Number(btn.dataset.waExtJump);closeSheet();const rows=canvas.querySelectorAll('.wa-message-row,.wa-call-row');const el=rows[index];if(el){el.scrollIntoView({block:'center'});el.style.outline='2px solid #22a689';setTimeout(()=>el.style.outline='',1700)}}
  else if(btn.hasAttribute('data-wa-ext-call')){const x=find(btn.dataset.waExtCall);if(x)callContact(x)}
  else if(btn.hasAttribute('data-wa-ext-end-call'))endCall();
  else if(btn.hasAttribute('data-wa-ext-share-contact'))shareContactMenu();
  else if(btn.hasAttribute('data-wa-ext-send-contact')&&t){const person=find(btn.dataset.waExtSendContact);if(person){closeSheet();appendMessage('👤 Liên hệ: '+person.name)}}
  else if(btn.hasAttribute('data-wa-ext-share-location')&&t){closeSheet();appendMessage('📍 Rio de Janeiro, RJ')}
  else if(btn.hasAttribute('data-wa-ext-photos'))gallery();
},true);
function showAbout(){showSheet('Trạng thái của Cauã','<input class="wa-ext-field" id="waExtAboutValue" maxlength="130" value="'+safe(saved.about)+'"><div class="wa-ext-bottom"><button class="wa-ext-action" id="waExtSaveAbout">Lưu trạng thái</button></div>')}
sheet.addEventListener('click',e=>{if(e.target.id==='waExtOwnerSave'){
  const owner=sheet.querySelector('#waExtOwnerName')?.value.trim();
  if(!owner){toast('Cần nhập tên hiển thị');return}
  saved.ownerName=owner;saved.about=sheet.querySelector('#waExtOwnerAbout')?.value.trim()||'Có sẵn';persist();
  settings();showOwnerProfile();toast('Đã lưu hồ sơ Cauã trên thiết bị');
} else if(e.target.id==='waExtSaveAbout'){saved.about=sheet.querySelector('#waExtAboutValue')?.value.trim()||'Có sẵn';persist();settings()}});
sheet.addEventListener('change',e=>{
 if(e.target.id==='waExtOwnerPhoto'){
   const file=e.target.files?.[0]; if(!file)return;
   if(!/^image\/(jpeg|png|webp)$/.test(file.type)){toast('Chọn ảnh JPG, PNG hoặc WebP');return}
   const reader=new FileReader();reader.onload=()=>{
     const img=new Image();img.onload=()=>{
       const side=256,c=document.createElement('canvas');c.width=side;c.height=side;
       const ctx=c.getContext('2d');const crop=Math.min(img.width,img.height);
       ctx.drawImage(img,(img.width-crop)/2,(img.height-crop)/2,crop,crop,0,0,side,side);
       saved.avatarData=c.toDataURL('image/jpeg',0.82);persist();settings();showOwnerProfile();toast('Đã đổi avatar hồ sơ');
     };img.src=String(reader.result);
   };reader.readAsDataURL(file);return;
 }
 if(e.target.matches('[data-wa-ext-pref]')){saved.settings[e.target.dataset.waExtPref]=e.target.checked;persist()}});
sheet.addEventListener('input',e=>{if(e.target.id==='waExtQuery')searchResults()});
input.disabled=false;input.removeAttribute('disabled');input.placeholder='Nhập tin nhắn';
input.addEventListener('input',()=>{const has=!!input.value.trim();send.classList.toggle('wa-ext-send',has);send.textContent=has?'➤':'♩'});
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();appendMessage(input.value)}});
threadView.querySelector('.wa-compose')?.addEventListener('click',e=>{
  if(e.target.closest('.wa-mic')){e.stopImmediatePropagation();e.preventDefault();if(input.value.trim())appendMessage(input.value);else toast('Ghi âm giọng nói sẽ được bổ sung ở đợt sau')}
  if(e.target.closest('.wa-plus')){e.stopImmediatePropagation();e.preventDefault();attachmentMenu()}
},true);
threadView.addEventListener('click',e=>{if(e.target.closest('#waThreadCall')){e.stopImmediatePropagation();e.preventDefault();const t=api.getCurrent();if(t)callContact(t)}},true);
search.addEventListener('input',()=>{if(tab==='contacts')renderContacts();else if(tab==='recents')renderCalls();else setTimeout(renderChats,0)});
const launcher=document.querySelector('.whatsapp-launch');
launcher?.addEventListener('click',()=>{tab='chats';closeCallUI();setTimeout(()=>{if(app.classList.contains('open'))setTab('chats')},0)});
setTab('chats');
})();
