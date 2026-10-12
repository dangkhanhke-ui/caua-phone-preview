/* iOS 8 Voice Memos: true microphone recording and local library.
   Voice blobs live only in the player's browser IndexedDB, never a server. */
(function(){
'use strict';
const b=window.CauaVoiceBridge;if(!b)return;
const app=b.app, memos=b.memos;
const key='caua-voice-preferences-v2', dbName='caua-voice-recordings-2015';
let prefs={names:{},hidden:[]};
try{const o=JSON.parse(localStorage.getItem(key)||'null');if(o)prefs={names:o.names||{},hidden:o.hidden||[]};}catch(_){}
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function prefsSave(){try{localStorage.setItem(key,JSON.stringify(prefs));}catch(_){}}
let dbPromise=null;
function database(){
 if(!('indexedDB' in window))return Promise.reject(new Error('Safari chưa cho phép lưu âm thanh cục bộ.'));
 if(dbPromise)return dbPromise;
 dbPromise=new Promise((resolve,reject)=>{
  const req=indexedDB.open(dbName,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('memos'))req.result.createObjectStore('memos',{keyPath:'id'});};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||new Error('Không mở được thư viện ghi âm.'));
 });return dbPromise;
}
async function runDB(mode,fn){
 const db=await database();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction('memos',mode),store=tx.objectStore('memos');
  let result;try{const req=fn(store);if(req){req.onsuccess=()=>result=req.result;req.onerror=()=>reject(req.error);}}catch(e){reject(e);return}
  tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
 });
}
const urls=new Map();
function voiceUrl(id,blob){const old=urls.get(id);if(old)URL.revokeObjectURL(old);const url=URL.createObjectURL(blob);urls.set(id,url);return url;}
function showTip(msg){let n=app.querySelector('.voice-native-tip');if(!n){n=document.createElement('div');n.className='voice-native-tip';app.appendChild(n);}n.textContent=msg;n.classList.add('show');clearTimeout(n._hide);n._hide=setTimeout(()=>n.classList.remove('show'),3000);}
let dialog=null;
function closeDialog(){if(dialog){dialog.remove();dialog=null;}}
function showDialog(title,body){
 closeDialog();dialog=document.createElement('div');dialog.className='voice-native-dialog';
 dialog.innerHTML='<div class="voice-dialog-head"><button data-voice-close type="button">Hủy</button><strong>'+esc(title)+'</strong><span></span></div><div class="voice-dialog-body">'+body+'</div>';
 app.appendChild(dialog);dialog.querySelector('[data-voice-close]').addEventListener('click',closeDialog);return dialog;
}
function getMemo(id){return memos.find(m=>m.id===id)}
async function persistMemo(m){
 const blob=await fetch(m.audio).then(r=>{if(!r.ok)throw Error('Không thể đọc âm thanh.');return r.blob();});
 return runDB('readwrite',store=>store.put({id:m.id,title:m.title,blob,duration:m.duration,displayDate:m.displayDate,displayTime:m.displayTime,datetime:m.datetime,mime:blob.type}));
}
function applyRecord(row){
 const existing=getMemo(row.id),newMemo={
  id:row.id,title:row.title||'Ghi âm mới',datetime:row.datetime||'2015-08-29T12:00:00',
  displayDate:row.displayDate||'29/08/2015',displayTime:row.displayTime||'12:00',
  audio:voiceUrl(row.id,row.blob),duration:row.duration||0,transcript:[],speakers:1,localRecord:true
 };
 if(existing){Object.assign(existing,newMemo);}else memos.unshift(newMemo);
}
async function loadSaved(){
 try{
  const rows=await runDB('readonly',store=>store.getAll());
  rows.sort((a,z)=>z.datetime.localeCompare(a.datetime));
  rows.forEach(row=>{if(row.blob)applyRecord(row);});
  for(let i=memos.length-1;i>=0;i--){
   const m=memos[i];if(prefs.hidden.includes(m.id)){memos.splice(i,1);continue;}
   if(prefs.names[m.id])m.title=prefs.names[m.id];
  }
  b.renderList();
 }catch(e){showTip(e.message||'Không thể đọc ghi âm đã lưu.');}
}
let stream=null,rec=null,chunks=[],recordStarted=0,pausedTotal=0,pausedAt=0,recordingPanel=null,frame=0,saving=false;
function elapsed(){
 return Math.max(0,(performance.now()-recordStarted-pausedTotal-(pausedAt?performance.now()-pausedAt:0))/1000);
}
function fmt(t){const s=Math.floor(Math.max(0,t));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
function cleanupStream(){if(stream){stream.getTracks().forEach(x=>x.stop());stream=null;}}
function cleanupPanel(){clearInterval(frame);frame=0;if(recordingPanel){recordingPanel.remove();recordingPanel=null;}}
function drawClock(){
 if(!recordingPanel)return;
 recordingPanel.querySelector('[data-voice-elapsed]').textContent=fmt(elapsed());
 const bars=recordingPanel.querySelectorAll('.voice-live-bars i');
 const tick=performance.now()/1000;
 bars.forEach((el,i)=>{el.style.height=(6+Math.abs(Math.sin(tick*5+i*1.4))*16)+'px';});
}

function stopRecording(save){
 if(!rec||saving)return;
 saving=true;
 const duration=elapsed(),recorder=rec,parts=chunks.slice();
 const mime=recorder.mimeType||'audio/mp4';
 recorder.onstop=async()=>{
  try{
   if(save){
    const blob=new Blob(chunks.length?chunks:parts,{type:mime});
    if(!blob.size)throw Error('Không thu được âm thanh. Hãy thử lại.');
    const id='voice-local-'+Date.now();
    const time=(document.getElementById('statusTime')?.textContent||'12:00').trim().slice(0,5);
    const record={id,title:'Ghi âm mới '+(memos.length+1),blob,duration,
      datetime:'2015-08-29T'+time+':00',displayDate:'29/08/2015',displayTime:time};
    await runDB('readwrite',store=>store.put(record));
    applyRecord(record);b.renderList();showTip('Đã lưu bản ghi trên thiết bị.');
   }else showTip('Đã hủy bản ghi.');
  }catch(e){showTip(e.message||'Không lưu được bản ghi. Kiểm tra dung lượng Safari.');}
  finally{cleanupStream();rec=null;chunks=[];saving=false;cleanupPanel();}
 };
 try{recorder.stop();}catch(e){saving=false;cleanupStream();rec=null;cleanupPanel();showTip('Không dừng được ghi âm.');}
}
async function begin(){
 if(saving||rec)return;
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){showTip('Trình duyệt này chưa hỗ trợ ghi âm. Hãy dùng Safari trên HTTPS.');return;}
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
  if(!app.classList.contains('open')){cleanupStream();return;}
  let opts={};
  for(const mime of ['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg']){
   if(MediaRecorder.isTypeSupported?.(mime)){opts={mimeType:mime};break;}
  }
  rec=new MediaRecorder(stream,opts);chunks=[];saving=false;
  rec.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data);};
  rec.onerror=()=>showTip('Micro gặp lỗi trong khi ghi.');
  const panel=document.createElement('div');panel.className='voice-record-overlay';
  panel.innerHTML='<div class="voice-record-label">Đang ghi âm</div><div class="voice-record-clock" data-voice-elapsed>00:00</div><div class="voice-live-bars">'+Array.from({length:28},()=>'<i></i>').join('')+'</div><div class="voice-record-buttons"><button data-voice-cancel>Hủy</button><button data-voice-pause>Tạm dừng</button><button data-voice-done>Xong</button></div><p>Âm thanh được lưu trên iPhone mô phỏng này, không gửi lên mạng.</p>';
  app.appendChild(panel);recordingPanel=panel;
  panel.querySelector('[data-voice-cancel]').addEventListener('click',()=>stopRecording(false));
  panel.querySelector('[data-voice-done]').addEventListener('click',()=>stopRecording(true));
  panel.querySelector('[data-voice-pause]').addEventListener('click',e=>{
   if(!rec||saving)return;
   try{
    if(rec.state==='recording'){rec.pause();pausedAt=performance.now();e.target.textContent='Tiếp tục';panel.classList.add('paused');}
    else if(rec.state==='paused'){rec.resume();pausedTotal+=performance.now()-pausedAt;pausedAt=0;e.target.textContent='Tạm dừng';panel.classList.remove('paused');}
   }catch(_){showTip('Không thể tạm dừng bản ghi.');}
  });
  recordStarted=performance.now();pausedTotal=0;pausedAt=0;rec.start(1000);drawClock();frame=setInterval(drawClock,140);
 }catch(e){cleanupStream();rec=null;showTip(e.name==='NotAllowedError'?'Chưa có quyền dùng micro. Hãy cấp quyền trong Safari.':e.message||'Không mở được micro.');}
}
window.CauaVoiceRecording={toggle:begin};
function shareMemo(m){
 if(!m.audio){showTip('Bản ghi này không có âm thanh.');return;}
 const el=showDialog('Chia sẻ bản ghi','<div class="voice-dialog-actions"><button data-voice-share>Chia sẻ qua ứng dụng…</button><button data-voice-export>Lưu vào Tệp</button></div>');
 async function deliver(mode){
  try{
   const res=await fetch(m.audio);if(!res.ok)throw Error('Không đọc được âm thanh.');const blob=await res.blob();
   const ext=blob.type.includes('webm')?'webm':blob.type.includes('wav')?'wav':'m4a';
   const file=new File([blob],m.title+'.'+ext,{type:blob.type||'audio/mp4'});
   if(mode==='share'){
    if(!navigator.share||!navigator.canShare?.({files:[file]}))throw Error('Safari không hỗ trợ chia sẻ âm thanh trực tiếp.');
    await navigator.share({files:[file],title:m.title});
   }else{
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),12000);
   }
   closeDialog();
  }catch(e){if(e.name!=='AbortError')showTip(e.message||'Không thể chia sẻ bản ghi.');}
 }
 el.querySelector('[data-voice-share]').addEventListener('click',()=>deliver('share'));
 el.querySelector('[data-voice-export]').addEventListener('click',()=>deliver('export'));
}
function renameMemo(m){
 const el=showDialog('Đổi tên','<label class="voice-dialog-field">Tên bản ghi<input maxlength="80" value="'+esc(m.title)+'" data-name></label><button class="voice-dialog-primary" data-save-name>Lưu</button>');
 el.querySelector('[data-save-name]').addEventListener('click',async()=>{
  const name=el.querySelector('[data-name]').value.trim();if(!name){showTip('Tên không được để trống.');return;}
  m.title=name;prefs.names[m.id]=name;prefsSave();
  if(m.localRecord){try{await persistMemo(m);}catch(e){showTip('Tên chưa lưu được vào thư viện.');}}
  closeDialog();b.closeDetail();b.openMemo(m.id);showTip('Đã đổi tên bản ghi.');
 });
}
function deleteMemo(m){
 const el=showDialog('Xóa bản ghi','<p>Xóa “'+esc(m.title)+'” khỏi thư viện trên thiết bị?</p><button class="voice-dialog-danger" data-delete>Xóa bản ghi</button>');
 el.querySelector('[data-delete]').addEventListener('click',async()=>{
  try{
   if(m.localRecord)await runDB('readwrite',store=>store.delete(m.id));
   else{prefs.hidden.push(m.id);prefsSave();}
   closeDialog();b.closeDetail();
   const idx=memos.indexOf(m);if(idx>=0)memos.splice(idx,1);
   const url=urls.get(m.id);if(url){URL.revokeObjectURL(url);urls.delete(m.id);}
   b.renderList();showTip('Đã xóa bản ghi.');
  }catch(e){showTip('Không thể xóa: '+e.message);}
 });
}
/* Native-style non-destructive source trim: only local copy changes. */
function trimMemo(m){
 if(!m.audio){showTip('Bản ghi này không có âm thanh.');return;}
 const duration=Math.max(0,Number(m.duration)||0);
 if(duration<1){showTip('Chưa đọc được độ dài bản ghi.');return;}
 const el=showDialog('Cắt bản ghi','<p class="voice-trim-desc">Chọn đoạn cần giữ lại.</p><label>Bắt đầu <span data-start-time>'+fmt(0)+'</span><input data-trim-start type="range" min="0" max="'+duration+'" step=".25" value="0"></label><label>Kết thúc <span data-end-time>'+fmt(duration)+'</span><input data-trim-end type="range" min="0" max="'+duration+'" step=".25" value="'+duration+'"></label><button class="voice-dialog-primary" data-trim-save>Lưu đoạn đã cắt</button>');
 const start=el.querySelector('[data-trim-start]'),end=el.querySelector('[data-trim-end]');
 function display(){
  if(Number(end.value)<=Number(start.value)+.5)end.value=Math.min(duration,Number(start.value)+.75);
  el.querySelector('[data-start-time]').textContent=fmt(+start.value);
  el.querySelector('[data-end-time]').textContent=fmt(+end.value);
 }
 start.addEventListener('input',display);end.addEventListener('input',()=>{
  if(Number(end.value)<=Number(start.value)+.5)start.value=Math.max(0,Number(end.value)-.75);display();
 });
 el.querySelector('[data-trim-save]').addEventListener('click',async()=>{
  const from=Number(start.value),to=Number(end.value);
  if(to-from<.5){showTip('Chọn đoạn dài hơn nửa giây.');return;}
  if(to-from>180){showTip('Mỗi lần cắt tối đa 3 phút để tránh đầy bộ nhớ iPhone.');return;}
  const button=el.querySelector('[data-trim-save]');button.disabled=true;button.textContent='Đang xử lý…';
  let context;
  try{
   const r=await fetch(m.audio);if(!r.ok)throw Error('Không đọc được âm thanh.');
   const encoded=await r.arrayBuffer();
   context=new (window.AudioContext||window.webkitAudioContext)();
   const decoded=await context.decodeAudioData(encoded.slice(0));
   const rate=decoded.sampleRate,startFrame=Math.floor(from*rate),
     samples=Math.min(decoded.length-startFrame,Math.round((to-from)*rate));
   if(samples<=0||samples>rate*181)throw Error('Đoạn cắt không hợp lệ.');
   const buffer=new ArrayBuffer(44+samples*2),view=new DataView(buffer);
   const str=(pos,value)=>{for(let i=0;i<value.length;i++)view.setUint8(pos+i,value.charCodeAt(i));};
   str(0,'RIFF');view.setUint32(4,36+samples*2,true);str(8,'WAVE');str(12,'fmt ');
   view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
   view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
   str(36,'data');view.setUint32(40,samples*2,true);
   const channels=Array.from({length:decoded.numberOfChannels},(_,i)=>decoded.getChannelData(i));
   for(let i=0;i<samples;i++){
    let value=0;for(const ch of channels)value+=ch[startFrame+i]||0;
    value=Math.max(-1,Math.min(1,value/channels.length));
    view.setInt16(44+i*2,value<0?value*32768:value*32767,true);
   }
   const blob=new Blob([buffer],{type:'audio/wav'});
   const record={id:m.id,title:m.title,blob,duration:to-from,datetime:m.datetime,
     displayDate:m.displayDate,displayTime:m.displayTime};
   b.teardownAudio(true);
   await runDB('readwrite',store=>store.put(record));
   applyRecord(record);closeDialog();b.closeDetail();b.openMemo(m.id);
   showTip('Đã lưu đoạn cắt trên thiết bị.');
  }catch(e){showTip(e?.message||'Không thể cắt bản ghi.');}
  finally{try{await context?.close();}catch(_){}if(button.isConnected){button.disabled=false;button.textContent='Lưu đoạn đã cắt';}}
 });
}
function addDetailActions(){
 const id=b.currentId(),m=getMemo(id);
 if(!m||!b.detail.classList.contains('open')||b.detail.querySelector('.voice-native-actions'))return;
 const body=b.detail.querySelector('.voice-detail-body');if(!body)return;
 const panel=document.createElement('div');panel.className='voice-native-actions';
 panel.innerHTML='<button type="button" data-voice-rename>Đổi tên</button><button type="button" data-voice-trim-action>Cắt</button><button type="button" data-voice-share-action>Chia sẻ</button><button type="button" data-voice-delete-action>Xóa</button>';
 body.querySelector('.voice-detail-hero')?.after(panel);
 panel.querySelector('[data-voice-rename]').addEventListener('click',()=>renameMemo(m));
 panel.querySelector('[data-voice-trim-action]').addEventListener('click',()=>trimMemo(m));
 panel.querySelector('[data-voice-share-action]').addEventListener('click',()=>shareMemo(m));
 panel.querySelector('[data-voice-delete-action]').addEventListener('click',()=>deleteMemo(m));
 if(!m.transcript.length){const transcript=body.querySelector('[data-transcript]');if(transcript)transcript.textContent='Không có bản chép lời cho bản ghi này.';}
}
new MutationObserver(addDetailActions).observe(b.detail,{childList:true,subtree:true});
app.addEventListener('click',e=>{
 if(e.target.closest('.voice-record-btn')){
  // Inline handler delegates to this controller. No second recording handler.
 }
},true);
document.addEventListener('visibilitychange',()=>{
 if(document.hidden&&rec&&rec.state==='recording'&&!saving){
  try{rec.pause();pausedAt=performance.now();recordingPanel?.classList.add('paused');const pause=recordingPanel?.querySelector('[data-voice-pause]');if(pause)pause.textContent='Tiếp tục';}catch(_){}
 }
});
new MutationObserver(()=>{if(!app.classList.contains('open')&&rec&&!saving)stopRecording(true);}).observe(app,{attributes:true,attributeFilter:['class']});
window.addEventListener('pagehide',()=>{if(rec&&!saving){try{rec.stop();}catch(_){}cleanupStream();}});
window.CauaVoiceLocal={get recording(){return !!rec},get saved(){return memos.filter(x=>x.localRecord).length}};
loadSaved();
})();