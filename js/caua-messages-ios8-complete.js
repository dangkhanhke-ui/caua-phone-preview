/* Messages iOS 8 / 29 August 2015.
   Canonical story messages are immutable on GitHub; local actions only affect this browser.
   SMS/iMessage require a real messaging backend. Outgoing messages are explicitly UNSENT. */
(function(){
'use strict';
const b=window.CauaMessagesBridge;if(!b)return;
const {app,threads,state,threadsEl,listBody,convoScroll,detailContent,newView,replyInput,recipientInput,newText,showAlert,renderList,renderConversation,openThread,openNewMessage,setView,currentThread,updateSendButton,updateNewSend,esc,normalize}=b;
const STORAGE='caua-messages-local-ios8-v2';
const GAME_DATE='29/08/2015';
let store={hidden:[],unread:[],read:[],muted:[],deletedMessages:{},outgoing:[]};
try{const x=JSON.parse(localStorage.getItem(STORAGE)||'null');if(x&&typeof x==='object')store={...store,...x};}catch(_){}
for(const t of threads){
 t.messages.forEach((m,i)=>m._localKey='canon-'+t.id+'-'+i);
 const deleted=new Set(store.deletedMessages[t.id]||[]);
 t.messages=t.messages.filter(m=>!deleted.has(m._localKey));
 t.localHidden=store.hidden.includes(t.id);
 if(store.read.includes(t.id))t.unread=false;
 if(store.unread.includes(t.id))t.unread=true;
}
for(const entry of store.outgoing||[]){
 if(!entry||!entry.threadId||!entry.message)continue;
 let t=threads.find(x=>x.id===entry.threadId);
 if(!t){t={id:entry.threadId,listName:entry.name||entry.to||'Không rõ',displayName:entry.name||entry.to||'Không rõ',number:entry.to||'',saved:false,transport:'SMS',preview:'',messages:[],localCreated:true};threads.push(t);}
 if(!t.messages.some(m=>m._localKey===entry.message._localKey))t.messages.push({...entry.message});
 t.preview=(entry.message.attachment?'Tệp đính kèm':entry.message.body||'Tin nhắn')+' · Chưa gửi';
 t.localHidden=false;
}
const hiddenSet=new Set(store.hidden),muteSet=new Set(store.muted),selection=new Set(),deletedOnce=new Set();
let editing=false,activeMenu=null,mediaDraft=null,recording=null,recorder=null,recParts=[],recStream=null,recStart=0,recordTimer=0,recordDialog=null;
function persist(){
 try{localStorage.setItem(STORAGE,JSON.stringify(store));return true;}
 catch(_){showToast('Bộ nhớ Safari đã đầy. Nội dung mới có thể không được lưu.');return false;}
}
function showToast(message){
 let el=app.querySelector('.msg-local-toast');
 if(!el){el=document.createElement('div');el.className='msg-local-toast';app.appendChild(el);}
 el.textContent=message;el.classList.add('show');clearTimeout(el._hide);el._hide=setTimeout(()=>el.classList.remove('show'),2600);
}
function dismiss(){if(activeMenu){activeMenu.remove();activeMenu=null;}}
function sheet(title,actions){
 dismiss();const box=document.createElement('div');box.className='msg-local-sheet';
 box.innerHTML='<div class="msg-local-sheet-backdrop"></div><div class="msg-local-sheet-panel"><div class="msg-local-sheet-title">'+esc(title)+'</div>'+actions.map((a,i)=>'<button type="button" data-sheet-action="'+i+'" class="'+(a.danger?'danger':'')+'">'+esc(a.label)+'</button>').join('')+'<button type="button" data-sheet-cancel>Hủy</button></div>';
 app.appendChild(box);activeMenu=box;
 box.querySelector('.msg-local-sheet-backdrop').addEventListener('click',dismiss);
 box.querySelector('[data-sheet-cancel]').addEventListener('click',dismiss);
 box.querySelectorAll('[data-sheet-action]').forEach(btn=>btn.addEventListener('click',()=>{const f=actions[Number(btn.dataset.sheetAction)].run;dismiss();f();}));
}
function messageTime(){
 const t=(document.getElementById('statusTime')?.textContent||'12:00').trim();
 return /^\d{1,2}:\d{2}$/.test(t)?t:'12:00';
}
function identity(s){return String(s||'').toLowerCase().replace(/[\s()+.-]/g,'');}
function resolveRecipient(value){
 const name=value.trim();
 return threads.find(t=>identity(t.number)===identity(name)||normalize(t.listName)===normalize(name)||normalize(t.displayName)===normalize(name))||null;
}
function removeHidden(id){const t=threads.find(x=>x.id===id);if(t)t.localHidden=false;hiddenSet.delete(id);store.hidden=[...hiddenSet];}
function markRead(id){
 const t=threads.find(x=>x.id===id);if(t)t.unread=false;
 if(!store.read.includes(id))store.read.push(id);
 store.unread=store.unread.filter(x=>x!==id);persist();
}
function markUnread(id){
 const t=threads.find(x=>x.id===id);if(!t)return;
 t.unread=true;store.unread=[...new Set([...store.unread,id])];store.read=store.read.filter(x=>x!==id);persist();renderList(true);
}
function hideThread(id){
 const t=threads.find(x=>x.id===id);if(!t)return;
 t.localHidden=true;hiddenSet.add(id);store.hidden=[...hiddenSet];persist();
 if(state.currentThread===id)setView('list');
 renderList(true);showToast('Đã xóa cuộc trò chuyện khỏi danh sách trên thiết bị.');
}
function saveMessage(thread,message){
 message._localKey='local-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);
 const entry={threadId:thread.id,name:thread.listName,to:thread.number,message:{...message}};
 store.outgoing.push(entry);
 thread.messages.push(message);
 thread.preview=message.attachment?'Ảnh hoặc âm thanh chưa gửi':(message.body||'Tin nhắn chưa gửi');
 removeHidden(thread.id);
 if(!persist())return false;
 return true;
}
function composeFailed(t,text,attachment){
 if(!t||t.automated){showToast('Không thể nhắn tin tới số dịch vụ này.');return false;}
 const clean=String(text||'').trim();if(!clean&&!attachment)return false;
 const newMessage={date:GAME_DATE,time:messageTime(),direction:'outgoing',body:clean,status:'failed',unread:false};
 if(attachment)newMessage.attachment=attachment;
 if(!saveMessage(t,newMessage))return false;
 b.state.convoScrollById[t.id]=null;
 renderConversation(t,false);
 showToast('Tin nhắn chưa gửi: iPhone mô phỏng không kết nối mạng di động.');
 return true;
}
function sendCurrent(){
 const t=currentThread();
 if(!t)return;
 if(composeFailed(t,replyInput.value,mediaDraft)){replyInput.value='';clearMedia();updateSendButton();}
}
function sendNew(){
 const to=recipientInput.value.trim(),text=newText.value.trim();
 if(!to){showToast('Hãy nhập người nhận.');return;}
 if(!text&&!mediaDraft&&!newView.querySelector('.caua-share-preview'))return;
 const recipients=to.split(/[,;]/).map(x=>x.trim()).filter(Boolean);
 let t=recipients.length===1?resolveRecipient(to):null;
 if(recipients.length>1){
  const members=recipients.map(name=>resolveRecipient(name)?.listName||name);
  const id='local-group-'+recipients.map(identity).sort().join('-').slice(0,120);
  t=threads.find(x=>x.id===id)||{id,listName:members.join(', '),displayName:members.join(', '),number:to,saved:false,transport:'SMS',messages:[],preview:'',groupRecipients:members,localCreated:true};
  if(!threads.includes(t))threads.push(t);
 }
 if(!t){
  const id='local-to-'+identity(to).slice(0,60);
  t=threads.find(x=>x.id===id)||{id,listName:to,displayName:to,number:to,saved:false,transport:'SMS',messages:[],preview:'',localCreated:true};
  if(!threads.includes(t))threads.push(t);
 }
 let attachment=mediaDraft;
 const cross=newView.querySelector('.caua-share-preview img');
 if(!attachment&&cross?.getAttribute('src')){const src=cross.getAttribute('src');attachment={data:src,filename:'Ảnh'};}
 if(composeFailed(t,text,attachment)){
  const prev=newView.querySelector('.caua-share-preview');prev?.remove();
  newText.value='';recipientInput.value='';clearMedia();updateNewSend();
  b.state.currentThread=t.id;
 }
}
function updateLocalMessage(key,mutator){
 const found=store.outgoing.find(x=>x.message?._localKey===key);
 if(found){mutator(found.message);persist();}
}
function deleteMessage(t,m){
 const i=t.messages.indexOf(m);if(i<0)return;
 t.messages.splice(i,1);
 if(String(m._localKey).startsWith('canon-')){
  if(!store.deletedMessages[t.id])store.deletedMessages[t.id]=[];
  if(!store.deletedMessages[t.id].includes(m._localKey))store.deletedMessages[t.id].push(m._localKey);
 }else store.outgoing=store.outgoing.filter(e=>e.message?._localKey!==m._localKey);
 t.preview=t.messages[t.messages.length-1]?.body||'';
 persist();renderConversation(t,false);showToast('Đã xóa tin nhắn trên thiết bị.');
}
function copyText(text){
 if(!text){showToast('Không có văn bản để sao chép.');return;}
 if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>showToast('Đã sao chép tin nhắn.'),()=>fallbackCopy(text));}
 else fallbackCopy(text);
}
function fallbackCopy(str){
 const el=document.createElement('textarea');el.value=str;el.style.position='fixed';el.style.opacity='0';app.appendChild(el);el.select();
 try{document.execCommand('copy');showToast('Đã sao chép tin nhắn.');}catch(_){showToast('Trình duyệt không hỗ trợ sao chép.');}el.remove();
}
function forwardMessage(m){
 b.openNewMessage();newText.value=m.body||'';newText.dispatchEvent(new Event('input',{bubbles:true}));
 if(m.attachment?.data){mediaDraft=m.attachment;renderMediaPreview(newView);}
 showToast('Chọn người nhận để chuyển tiếp. Tin sẽ được giữ ở trạng thái chưa gửi.');
}
function optionMessage(index){
 const t=currentThread(),m=t?.messages[index];if(!m)return;
 const actions=[];
 if(m.body)actions.push({label:'Sao chép',run:()=>copyText(m.body)});
 actions.push({label:'Chuyển tiếp',run:()=>forwardMessage(m)});
 if(m.status==='failed'){
  actions.push({label:'Thử gửi lại',run:()=>showAlert('Chưa gửi được','Không có kết nối SMS/iMessage trong bản mô phỏng.')});
  actions.push({label:'Chỉnh sửa bản nháp',run:()=>{
   deleteMessage(t,m);replyInput.value=m.body||'';mediaDraft=m.attachment||null;renderMediaPreview(b.convoView);
   updateSendButton();replyInput.focus();
  }});
 }
 actions.push({label:'Xóa tin nhắn',danger:true,run:()=>sheet('Xóa tin nhắn?',[
  {label:'Xóa trên iPhone này',danger:true,run:()=>deleteMessage(t,m)}
 ])});
 sheet('Tin nhắn · '+m.time,actions);
}
function showMedia(data){
 if(!data)return;
 const el=document.createElement('div');el.className='msg-photo-lightbox';
 if(data.startsWith('data:audio'))el.innerHTML='<button class="msg-photo-close">Xong</button><audio controls autoplay src="'+esc(data)+'"></audio>';
 else el.innerHTML='<button class="msg-photo-close">Xong</button><img src="'+esc(data)+'" alt="Ảnh đính kèm">';
 app.appendChild(el);el.querySelector('button').addEventListener('click',()=>el.remove());
}
let longTimer=0,downX=0,downY=0,longConsumed=false;
convoScroll.addEventListener('pointerdown',e=>{
 const line=e.target.closest('.msg-line[data-message-index]');if(!line)return;
 clearTimeout(longTimer);longConsumed=false;downX=e.clientX;downY=e.clientY;
 longTimer=setTimeout(()=>{longConsumed=true;optionMessage(Number(line.dataset.messageIndex));},520);
},{passive:true});
convoScroll.addEventListener('pointermove',e=>{if(Math.abs(e.clientX-downX)>11||Math.abs(e.clientY-downY)>11)clearTimeout(longTimer);},{passive:true});
['pointerup','pointercancel','pointerleave'].forEach(evt=>convoScroll.addEventListener(evt,()=>clearTimeout(longTimer),{passive:true}));
convoScroll.addEventListener('contextmenu',e=>{
 const line=e.target.closest('.msg-line[data-message-index]');if(!line)return;
 e.preventDefault();clearTimeout(longTimer);optionMessage(Number(line.dataset.messageIndex));
});
convoScroll.addEventListener('click',e=>{
 if(longConsumed){e.preventDefault();longConsumed=false;return;}
 const img=e.target.closest('.msg-inline-photo');if(img){showMedia(img.getAttribute('src'));return;}
 const failed=e.target.closest('.msg-failed-mark');if(failed){const line=failed.closest('.msg-line');optionMessage(Number(line.dataset.messageIndex));}
});
let touchOrigin=null;
convoScroll.addEventListener('touchstart',e=>{const t=e.touches[0];if(t)touchOrigin={x:t.clientX,y:t.clientY};},{passive:true});
convoScroll.addEventListener('touchmove',e=>{
 if(!touchOrigin)return;const t=e.touches[0];if(!t)return;
 const dx=t.clientX-touchOrigin.x,dy=t.clientY-touchOrigin.y;
 convoScroll.classList.toggle('reveal-times',dx< -22&&Math.abs(dx)>Math.abs(dy)*1.3);
},{passive:true});
convoScroll.addEventListener('touchend',()=>{touchOrigin=null;convoScroll.classList.remove('reveal-times');},{passive:true});
convoScroll.addEventListener('touchcancel',()=>{touchOrigin=null;convoScroll.classList.remove('reveal-times');},{passive:true});
/* Thread editing and swipe-delete, 2015-style. */
const editBar=document.createElement('div');editBar.className='msg-local-edit-bar';
editBar.innerHTML='<span data-selected-count>0 cuộc trò chuyện</span><button data-mark-unread disabled>Chưa đọc</button><button data-delete-threads disabled>Xóa</button>';
app.querySelector('.messages-shell').appendChild(editBar);
function syncEdit(){
 const editButton=document.getElementById('messagesEditBtn');editButton.textContent=editing?'Xong':'Sửa';
 app.classList.toggle('msg-list-editing',editing);
 editBar.querySelector('[data-selected-count]').textContent=selection.size+' đã chọn';
 editBar.querySelectorAll('button').forEach(x=>x.disabled=!selection.size);
 threadsEl.querySelectorAll('[data-thread-id]').forEach(row=>{
  if(editing&&!row.querySelector('.msg-row-selector')){const span=document.createElement('span');span.className='msg-row-selector';row.insertBefore(span,row.firstChild);}
  row.classList.toggle('selected',selection.has(row.dataset.threadId));
 });
}
function toggleEditing(){
 editing=!editing;selection.clear();
 syncEdit();renderList(true);
}
threadsEl.addEventListener('click',e=>{
 const row=e.target.closest('[data-thread-id]');if(!row||!editing)return;
 e.preventDefault();e.stopImmediatePropagation();
 const id=row.dataset.threadId;selection.has(id)?selection.delete(id):selection.add(id);syncEdit();
},true);
new MutationObserver(()=>{if(editing)syncEdit();}).observe(threadsEl,{childList:true});
editBar.querySelector('[data-mark-unread]').addEventListener('click',()=>{for(const id of selection)markUnread(id);editing=false;selection.clear();syncEdit();renderList(true);});
editBar.querySelector('[data-delete-threads]').addEventListener('click',()=>sheet('Xóa '+selection.size+' cuộc trò chuyện?',[
 {label:'Xóa trên iPhone này',danger:true,run:()=>{
  [...selection].forEach(id=>{const t=threads.find(x=>x.id===id);if(t)t.localHidden=true;hiddenSet.add(id);});
  store.hidden=[...hiddenSet];persist();selection.clear();editing=false;syncEdit();renderList(true);showToast('Đã xóa các cuộc trò chuyện trên thiết bị.');
 }}
]));
let startRow=null;
threadsEl.addEventListener('touchstart',e=>{const row=e.target.closest('[data-thread-id]'),t=e.touches[0];if(row&&t)startRow={id:row.dataset.threadId,x:t.clientX,y:t.clientY};},{passive:true});
threadsEl.addEventListener('touchend',e=>{
 if(!startRow||editing)return;const t=e.changedTouches[0];if(!t)return;
 const dx=t.clientX-startRow.x,dy=t.clientY-startRow.y,id=startRow.id;startRow=null;
 if(dx< -52&&Math.abs(dx)>Math.abs(dy)*1.3)sheet('Cuộc trò chuyện',[
 {label:'Đánh dấu chưa đọc',run:()=>markUnread(id)},
 {label:'Xóa cuộc trò chuyện',danger:true,run:()=>hideThread(id)}
 ]);
},{passive:true});
/* 2015 Details: Do Not Disturb is local; attachment gallery reflects actual data. */
function decorateDetails(t){
 const group=detailContent.querySelector('.msg-group'),row=group?.querySelector('.msg-detail-row:nth-child(2)');
 if(row){
  row.innerHTML='<span>Không làm phiền</span><button type="button" class="msg-switch '+(muteSet.has(t.id)?'on':'')+'" role="switch" aria-checked="'+muteSet.has(t.id)+'" aria-label="Không làm phiền"></button>';
  row.querySelector('button').addEventListener('click',e=>{
   const btn=e.currentTarget;
   if(muteSet.has(t.id))muteSet.delete(t.id);else muteSet.add(t.id);
   store.muted=[...muteSet];persist();btn.classList.toggle('on',muteSet.has(t.id));btn.setAttribute('aria-checked',String(muteSet.has(t.id)));
  });
  const loc=document.createElement('div');loc.className='msg-detail-row msg-location-row';
  loc.innerHTML='<button type="button">Gửi vị trí hiện tại</button>';
  group.appendChild(loc);
  loc.querySelector('button').addEventListener('click',()=>showAlert('Không thể gửi vị trí','Cần kết nối mạng và quyền vị trí để gửi cho người khác.'));
 }
 const files=t.messages.filter(m=>m.attachment?.data);
 const empty=detailContent.querySelector('.msg-attachments-empty');
 if(empty&&files.length){
  empty.className='msg-attachment-grid';
  empty.innerHTML=files.map((m,i)=>m.attachment.kind==='audio'?'<button data-attachment="'+i+'">▶ '+esc(m.attachment.filename||'Âm thanh')+'</button>':'<button data-attachment="'+i+'"><img src="'+esc(m.attachment.data)+'" loading="lazy" alt="Ảnh đính kèm"></button>').join('');
  empty.querySelectorAll('[data-attachment]').forEach(btn=>btn.addEventListener('click',()=>showMedia(files[Number(btn.dataset.attachment)].attachment.data)));
 }
 if(!t.saved){
  const group2=detailContent.querySelectorAll('.msg-group')[1];
  group2?.querySelectorAll('.msg-detail-row').forEach((el,i)=>{el.classList.remove('disabled');el.setAttribute('role','button');el.tabIndex=0;el.addEventListener('click',()=>showAlert('Danh bạ','Không thể tạo hoặc sửa liên hệ khi bản mô phỏng chưa có ứng dụng Danh bạ.'));});
 }
}
/* Camera roll/camera attachments: preview locally, never invent delivery. */
function clearMedia(){
 mediaDraft=null;
 app.querySelectorAll('.msg-draft-attachment').forEach(x=>x.remove());
}
function renderMediaPreview(view){
 view=view||b.convoView;
 view.querySelector('.msg-draft-attachment')?.remove();
 if(!mediaDraft)return;
 const target=view.querySelector('.msg-composer');if(!target)return;
 const panel=document.createElement('div');panel.className='msg-draft-attachment';
 panel.innerHTML='<button aria-label="Bỏ tệp đính kèm" type="button">×</button>'+(mediaDraft.kind==='audio'?'<span>◉ '+esc(mediaDraft.filename||'Âm thanh')+'</span>':'<img src="'+esc(mediaDraft.data)+'" alt="Ảnh chờ gửi">');
 target.appendChild(panel);panel.querySelector('button').addEventListener('click',()=>{clearMedia();updateSendButton();updateNewSend();});
}
const input=document.createElement('input');input.type='file';input.accept='image/*';input.style.display='none';app.appendChild(input);
function takePicture(capture){if(capture)input.setAttribute('capture','environment');else input.removeAttribute('capture');input.click();}
function camera(btn){
 const isNew=!!btn.closest('#messagesNewView');if(isNew&&state.view!=='new')return;
 sheet('Ảnh và video',[
  {label:'Chụp ảnh',run:()=>takePicture(true)},
  {label:'Chọn ảnh',run:()=>takePicture(false)}
 ]);
}
async function optimizePhoto(file){
 const image=new Image(),url=URL.createObjectURL(file);image.src=url;
 try{
  await image.decode();const factor=Math.min(1,900/Math.max(image.naturalWidth,image.naturalHeight)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(image.naturalWidth*factor));c.height=Math.max(1,Math.round(image.naturalHeight*factor));
  c.getContext('2d').drawImage(image,0,0,c.width,c.height);
  return {kind:'image',filename:file.name||'IMG_2015.jpg',data:c.toDataURL('image/jpeg',.66)};
 }finally{URL.revokeObjectURL(url);}
}
input.addEventListener('change',async()=>{
 const file=input.files?.[0];input.value='';if(!file)return;
 if(!file.type.startsWith('image/')){showToast('Vui lòng chọn một ảnh.');return;}
 try{mediaDraft=await optimizePhoto(file);renderMediaPreview(state.view==='new'?newView:b.convoView);showToast('Đã thêm ảnh. Chưa gửi.');}
 catch(_){showToast('Không đọc được ảnh này.');}
});
function startVoice(){
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){showToast('Safari không hỗ trợ ghi âm ở trang này.');return;}
 if(recorder)return;
 navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
  recStream=stream;recParts=[];
  let options={};for(const type of ['audio/mp4','audio/webm;codecs=opus','audio/webm']){if(MediaRecorder.isTypeSupported?.(type)){options={mimeType:type};break;}}
  recorder=new MediaRecorder(stream,options);
  recorder.ondataavailable=e=>{if(e.data.size)recParts.push(e.data);};
  const modal=document.createElement('div');modal.className='msg-local-record';
  modal.innerHTML='<div class="msg-local-record-box"><strong>Ghi âm</strong><p data-record-clock>00:00</p><span class="msg-record-hint">Âm thanh chưa được gửi</span><div><button data-cancel>Hủy</button><button data-done>Xong</button></div></div>';
  app.appendChild(modal);recordDialog=modal;recStart=Date.now();
  recordTimer=setInterval(()=>{const sec=Math.floor((Date.now()-recStart)/1000);const clock=modal.querySelector('[data-record-clock]');if(clock)clock.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');if(sec>=20)stopVoice(true);},200);
  modal.querySelector('[data-cancel]').addEventListener('click',()=>stopVoice(false));modal.querySelector('[data-done]').addEventListener('click',()=>stopVoice(true));
  recorder.start(800);
 }).catch(e=>showToast(e?.name==='NotAllowedError'?'Hãy cấp quyền dùng micro cho Safari.':'Không mở được micro.'));
}
function stopVoice(save){
 const r=recorder;if(!r)return;
 recorder=null;clearInterval(recordTimer);recordTimer=0;recordDialog?.remove();recordDialog=null;
 r.onstop=()=>{
  if(save&&recParts.length){
   const blob=new Blob(recParts,{type:r.mimeType||'audio/mp4'});
   if(blob.size>450000){showToast('Bản ghi quá lớn để lưu cục bộ. Hãy ghi dưới 15 giây.');}
   else{const reader=new FileReader();reader.onload=()=>{mediaDraft={kind:'audio',filename:'Âm thanh.m4a',data:String(reader.result)};renderMediaPreview(state.view==='new'?newView:b.convoView);showToast('Đã thêm âm thanh. Chưa gửi.');};reader.readAsDataURL(blob);}
  }
  recStream?.getTracks().forEach(t=>t.stop());recStream=null;recParts=[];
 };
 try{r.stop();}catch(_){recStream?.getTracks().forEach(t=>t.stop());recStream=null;}
}
function micButton(btn){sheet('Tin nhắn âm thanh (iOS 8)',[{label:'Ghi âm',run:startVoice}]);}
function installMic(btn){btn.addEventListener('click',e=>{if(btn.classList.contains('send')||btn.textContent.trim()==='Gửi')return;e.preventDefault();micButton(btn);});}
installMic(b.sendBtn);
const newSend=document.getElementById('messagesNewSend');installMic(newSend);
replyInput.addEventListener('input',()=>{const t=currentThread();if(t){const id=t.id;try{sessionStorage.setItem('caua-message-draft-'+id,replyInput.value);}catch(_){}}});
/* Restore drafts after original renderer has updated the composer. */
const originalOpen=b.openThread;
document.getElementById('messagesBackBtn').addEventListener('click',()=>{clearMedia();},true);
new MutationObserver(()=>{
 if(state.view==='conversation'){
  const t=currentThread();if(t&&!replyInput.value){try{const draft=sessionStorage.getItem('caua-message-draft-'+t.id);if(draft)replyInput.value=draft;}catch(_){}}
 }
}).observe(b.convoView,{attributes:true,attributeFilter:['class']});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&recorder)stopVoice(true);});
window.CauaMessagesLocal={sendCurrent,sendNew,markRead,markUnread,hideThread,toggleEditing,decorateDetails,camera,get pending(){return store.outgoing.length},get editing(){return editing}};
renderList(false);
})();
