/* Photos iOS 8: local edits, selection, share and Recently Deleted.
   Original story photos remain immutable on GitHub. */
(function(){
'use strict';
const b=window.CauaPhotosBridge;if(!b)return;
const app=b.app, photos=b.photos, originals=b.originals;
const key='caua-photos-local-v2';
let memory={deleted:{},edits:{},albums:{}};
try {const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&typeof saved==='object')memory={deleted:saved.deleted||{},edits:saved.edits||{},albums:saved.albums||{}};}catch(_){}
function persist(){try{localStorage.setItem(key,JSON.stringify(memory));}catch(_){notice('Bộ nhớ trình duyệt đã đầy; thay đổi có thể không được lưu.');}}
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function byId(id){return originals.find(p=>p.id===id)}
function active(){return photos[b.state.currentIndex]}
function removeDeletedFromVisible(){
 for(let i=photos.length-1;i>=0;i--)if(memory.deleted[photos[i].id])photos.splice(i,1);
}
let chosen=new Set(), selecting=false, modal=null;
function notice(msg){let n=app.querySelector('.photos-local-notice');if(!n){n=document.createElement('div');n.className='photos-local-notice';app.appendChild(n);}n.textContent=msg;n.classList.add('show');clearTimeout(n._t);n._t=setTimeout(()=>n.classList.remove('show'),2500);}
function closeModal(){if(modal){modal.remove();modal=null;}}
function showModal(title,body){
 closeModal();modal=document.createElement('div');modal.className='photos-native-modal';
 modal.innerHTML='<div class="photos-modal-head"><button type="button" data-modal-close>Hủy</button><strong>'+esc(title)+'</strong><span></span></div><div class="photos-modal-body">'+body+'</div>';
 app.appendChild(modal);modal.querySelector('[data-modal-close]').addEventListener('click',closeModal);return modal;
}
function confirmAction(message,positive,action){
 const el=showModal('Xác nhận','<div class="photos-modal-confirm"><p>'+esc(message)+'</p><button class="photos-modal-danger" data-confirm type="button">'+esc(positive)+'</button><button data-modal-close type="button">Hủy</button></div>');
 el.querySelector('[data-confirm]').addEventListener('click',()=>{closeModal();action();});
 el.querySelectorAll('[data-modal-close]').forEach(btn=>btn.addEventListener('click',closeModal));
}
function syncMarks(){
 app.querySelectorAll('[data-photo-id]').forEach(btn=>btn.classList.toggle('photos-is-selected',selecting&&chosen.has(btn.dataset.photoId)));
 const bar=app.querySelector('.photos-select-actions');if(bar){bar.querySelector('[data-selection-count]').textContent=chosen.size+' ảnh';bar.querySelectorAll('[data-selection-required]').forEach(x=>x.disabled=!chosen.size);}
 app.querySelectorAll('.photos-nav-btn.right').forEach(btn=>{if(btn.id==='photosSelectBtn'||(btn.closest('#photosCollectionsView,#photosYearsView,#photosAlbumGridView')&&/^(Chọn|Hủy)$/.test(btn.textContent.trim())))btn.textContent=selecting?'Hủy':'Chọn';});
}
function selectMode(on){
 selecting=!!on;chosen.clear();
 app.classList.toggle('photos-selecting',selecting);
 const old=app.querySelector('.photos-select-actions');if(old)old.remove();
 if(selecting){
  const el=document.createElement('div');el.className='photos-select-actions';
  el.innerHTML='<span data-selection-count>0 ảnh</span><button type="button" data-selection-required data-selection-share disabled>Chia sẻ</button><button type="button" data-selection-required data-selection-album disabled>Album</button><button type="button" data-selection-required data-selection-delete disabled>Xóa</button>';
  app.appendChild(el);
  el.querySelector('[data-selection-share]').addEventListener('click',()=>openShare([...chosen].map(byId).filter(Boolean)));
  el.querySelector('[data-selection-album]').addEventListener('click',addSelectedToAlbum);
  el.querySelector('[data-selection-delete]').addEventListener('click',()=>askDelete([...chosen]));
 }
 syncMarks();
}
function askDelete(ids){
 if(!ids.length)return;
 confirmAction('Chuyển '+ids.length+' ảnh vào album Đã xóa gần đây?','Xóa ảnh',()=>{
  const stamp=Date.now();ids.forEach(id=>{if(byId(id))memory.deleted[id]=stamp;});
  for(let i=photos.length-1;i>=0;i--)if(memory.deleted[photos[i].id])photos.splice(i,1);
  persist();selectMode(false);
  if(b.viewer.classList.contains('active'))b.closeViewer();
  b.renderAll();if(b.state.view==='albumGrid')b.showView('albums',false);
  notice('Ảnh đã chuyển vào Đã xóa gần đây.');
 });
}
function showDeleted(){
 const ids=Object.keys(memory.deleted).filter(id=>byId(id)&&memory.deleted[id]!==Number.MAX_SAFE_INTEGER);
 const cards=ids.map(id=>{const p=byId(id);return '<div class="photos-deleted-item"><img src="'+esc(p.src)+'" alt="" loading="lazy"><div><strong>'+esc(p.filename)+'</strong><small>Khôi phục trong vòng 30 ngày (mô phỏng)</small><div><button data-restore="'+esc(id)+'">Khôi phục</button><button data-erase="'+esc(id)+'">Xóa hẳn</button></div></div></div>';}).join('');
 const el=showModal('Đã xóa gần đây',cards||'<p class="photos-modal-empty">Không có ảnh đã xóa.</p>');
 el.querySelectorAll('[data-restore]').forEach(btn=>btn.addEventListener('click',()=>{
  delete memory.deleted[btn.dataset.restore];persist();
  photos.splice(0,photos.length,...originals.filter(p=>!memory.deleted[p.id]));
  b.renderAll();showDeleted();notice('Đã khôi phục ảnh.');
 }));
 el.querySelectorAll('[data-erase]').forEach(btn=>btn.addEventListener('click',()=>{
  const id=btn.dataset.erase;
  confirmAction('Xóa vĩnh viễn ảnh này khỏi thư viện trong trình duyệt?','Xóa vĩnh viễn',()=>{
   memory.deleted[id]=Number.MAX_SAFE_INTEGER;persist();showDeleted();
  });
 }));
}
const filters={
 original:'none',mono:'grayscale(1)',tonal:'grayscale(1) contrast(1.28)',noir:'grayscale(1) contrast(1.8) brightness(.82)',
 fade:'saturate(.62) contrast(.86) brightness(1.09)',chrome:'saturate(1.5) contrast(1.08)',process:'saturate(1.35) sepia(.12) contrast(1.14)',transfer:'sepia(.25) saturate(.72) contrast(.98)',instant:'sepia(.30) saturate(.80) brightness(1.07)'
};
function editFor(id){return memory.edits[id]||{filter:'original',rotate:0,scale:1}}
function applyViewerEdit(){
 const p=active();if(!p)return;
 const e=editFor(p.id);
 b.image.style.filter=filters[e.filter]||'none';
 b.image.style.rotate=((e.rotate||0)%360)+'deg';
 b.image.style.scale=String(e.scale||1);
}
function openEditor(){
 const p=active();if(!p)return;
 const old=editFor(p.id),draft={filter:old.filter||'original',rotate:old.rotate||0,scale:old.scale||1};
 const buttons=Object.keys(filters).map(n=>'<button data-filter="'+n+'" class="'+(n===draft.filter?'selected':'')+'">'+({original:'Gốc',mono:'Mono',tonal:'Tonal',noir:'Noir',fade:'Fade',chrome:'Chrome',process:'Process',transfer:'Transfer',instant:'Instant'}[n])+'</button>').join('');
 const el=showModal('Sửa ảnh','<div class="photos-edit-preview"><img src="'+esc(p.src)+'" alt=""></div><div class="photos-edit-filters">'+buttons+'</div><div class="photos-edit-controls"><button data-rotate>↻ Xoay 90°</button><label>Phóng/cắt <input data-crop type="range" min="1" max="1.6" step=".05" value="'+draft.scale+'"></label></div><div class="photos-edit-footer"><button data-revert>Khôi phục</button><button data-save>Lưu</button></div>');
 const img=el.querySelector('.photos-edit-preview img');
 function update(){img.style.filter=filters[draft.filter]||'none';img.style.transform='rotate('+draft.rotate+'deg) scale('+draft.scale+')';el.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('selected',x.dataset.filter===draft.filter));}
 el.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{draft.filter=btn.dataset.filter;update();}));
 el.querySelector('[data-rotate]').addEventListener('click',()=>{draft.rotate=(draft.rotate+90)%360;update();});
 el.querySelector('[data-crop]').addEventListener('input',e=>{draft.scale=Number(e.target.value);update();});
 el.querySelector('[data-revert]').addEventListener('click',()=>{draft.filter='original';draft.rotate=0;draft.scale=1;el.querySelector('[data-crop]').value=1;update();});
 el.querySelector('[data-save]').addEventListener('click',()=>{memory.edits[p.id]={...draft};persist();closeModal();applyViewerEdit();notice('Đã lưu chỉnh sửa ảnh.');});
 update();
}
async function getBlob(p){
 const res=await fetch(p.src,{cache:'force-cache'});if(!res.ok)throw Error('Không tải được ảnh.');
 const blob=await res.blob(),edit=editFor(p.id);
 if(((edit.rotate||0)%360===0)&&(edit.scale||1)===1&&(!edit.filter||edit.filter==='original'))return blob;
 const url=URL.createObjectURL(blob),img=new Image();img.src=url;
 try{
  await img.decode();
  const radians=((edit.rotate||0)%360)*Math.PI/180,rotated=Math.abs(Math.round(Math.sin(radians)))===1;
  const width=rotated?img.naturalHeight:img.naturalWidth,height=rotated?img.naturalWidth:img.naturalHeight;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const context=canvas.getContext('2d');context.filter=filters[edit.filter]||'none';
  context.translate(width/2,height/2);context.rotate(radians);
  const z=Math.max(1,edit.scale||1),iw=img.naturalWidth,ih=img.naturalHeight;
  context.drawImage(img,(iw-iw/z)/2,(ih-ih/z)/2,iw/z,ih/z,-iw/2,-ih/2,iw,ih);
  return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Không xuất được ảnh.')),'image/jpeg',.88));
 }finally{URL.revokeObjectURL(url);}
}
function openShare(items){
 if(!items.length){notice('Chưa chọn ảnh.');return;}
 const el=showModal('Chia sẻ '+items.length+' ảnh','<div class="photos-share-actions"><button data-share-native>Chia sẻ qua ứng dụng…</button><button data-share-save>Lưu ảnh về máy</button><button data-share-copy>Sao chép ảnh</button></div>');
 async function deliver(kind){
  const button=el.querySelector('[data-share-'+kind+']');button.disabled=true;
  try{
   const blobs=await Promise.all(items.map(getBlob));
   const files=blobs.map((blob,i)=>new File([blob],items[i].filename||'IMG_'+i+'.jpg',{type:blob.type||'image/jpeg'}));
   if(kind==='native'){
    if(!navigator.share||!navigator.canShare?.({files}))throw Error('Không hỗ trợ chia sẻ tệp trên trình duyệt này.');
    await navigator.share({files,title:'Ảnh'});closeModal();
   }else if(kind==='save'){
    for(let i=0;i<files.length;i++){const url=URL.createObjectURL(files[i]),a=document.createElement('a');a.href=url;a.download=files[i].name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
    closeModal();notice('Đã gửi ảnh tới trình tải xuống.');
   }else{
    if(items.length!==1||!navigator.clipboard?.write||!window.ClipboardItem)throw Error('Sao chép ảnh không khả dụng trên trình duyệt này.');
    const png=await createImageBitmap(blobs[0]).then(bitmap=>new Promise(resolve=>{const c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;c.getContext('2d').drawImage(bitmap,0,0);c.toBlob(resolve,'image/png');bitmap.close?.();}));
    if(!png)throw Error('Không thể sao chép ảnh.');
    await navigator.clipboard.write([new ClipboardItem({'image/png':png})]);closeModal();notice('Đã sao chép ảnh.');
   }
  }catch(e){if(e?.name!=='AbortError')notice(e?.message||'Không thể chia sẻ ảnh.');}
  finally{if(button.isConnected)button.disabled=false;}
 }
 el.querySelector('[data-share-native]').addEventListener('click',()=>deliver('native'));
 el.querySelector('[data-share-save]').addEventListener('click',()=>deliver('save'));
 el.querySelector('[data-share-copy]').addEventListener('click',()=>deliver('copy'));
}
function albumList(){return document.getElementById('photosAlbumList');}
function syncAlbumRows(){
 const root=albumList();if(!root)return;
 for(const [id,album] of Object.entries(memory.albums)){
  if(root.querySelector('[data-local-album="'+id+'"]'))continue;
  const cover=(album.ids||[]).map(byId).find(p=>p&&!memory.deleted[p.id]);
  const row=document.createElement('div');row.className='photos-album-row';
  row.dataset.localAlbum=id;
  const count=(album.ids||[]).filter(k=>byId(k)&&!memory.deleted[k]).length;
  row.innerHTML='<div class="photos-album-cover">'+(cover?'<img src="'+esc(cover.src)+'" alt="" loading="lazy">':'')+'</div><div><div class="photos-album-name">'+esc(album.name)+'</div><div class="photos-album-count">'+count+'</div></div><div class="photos-chevron">›</div>';
  root.appendChild(row);
 }
}
function createNewAlbum(){
 const el=showModal('Album mới','<label class="photos-album-input-label">Tên album<input data-name type="text" maxlength="64" placeholder="Tên album"></label><button class="photos-modal-primary" data-create>Tạo album</button>');
 el.querySelector('[data-create]').addEventListener('click',()=>{
  const name=el.querySelector('[data-name]').value.trim();if(!name){notice('Hãy đặt tên album.');return;}
  const id='local-'+Date.now();
  memory.albums[id]={name,ids:[]};persist();closeModal();syncAlbumRows();notice('Đã tạo album.');
 });
}
function openCustomAlbum(id){
 const album=memory.albums[id];if(!album)return;
 const list=(album.ids||[]).map(byId).filter(p=>p&&!memory.deleted[p.id]);
 b.showView('albumGrid',false);
 document.getElementById('photosAlbumTitle').textContent=album.name;
 const grid=document.getElementById('photosAlbumGrid');
 grid.innerHTML=list.length?list.map(p=>'<button type="button" data-photo-id="'+esc(p.id)+'"><img src="'+esc(p.src)+'" alt="" loading="lazy" decoding="async"></button>').join(''):'<div class="photos-empty"><strong>Album trống</strong></div>';
 grid.querySelectorAll('[data-photo-id]').forEach(tile=>tile.addEventListener('click',()=>{if(!selecting)b.openPhoto(photos.findIndex(p=>p.id===tile.dataset.photoId),album.name);}));
}
function addSelectedToAlbum(){
 if(!chosen.size)return;
 const rows=Object.entries(memory.albums).map(([id,a])=>'<button data-choose-album="'+esc(id)+'">'+esc(a.name)+'</button>').join('');
 const el=showModal('Thêm vào album','<div class="photos-share-actions">'+rows+'<button data-new-album>+ Album mới</button></div>');
 el.querySelector('[data-new-album]').addEventListener('click',createNewAlbum);
 el.querySelectorAll('[data-choose-album]').forEach(btn=>btn.addEventListener('click',()=>{
  const a=memory.albums[btn.dataset.chooseAlbum];if(!a)return;
  a.ids=[...new Set([...(a.ids||[]),...chosen])];persist();closeModal();selectMode(false);b.renderAll();notice('Đã thêm ảnh vào album.');
 }));
}
function manageAlbums(){
 const rows=Object.entries(memory.albums).map(([id,a])=>'<div class="photos-manage-row"><span>'+esc(a.name)+'</span><button data-rename-album="'+esc(id)+'">Đổi tên</button><button data-remove-album="'+esc(id)+'">Xóa</button></div>').join('');
 const el=showModal('Sửa album',rows||'<p class="photos-modal-empty">Chưa có album tự tạo.</p>');
 el.querySelectorAll('[data-rename-album]').forEach(btn=>btn.addEventListener('click',()=>{
  const id=btn.dataset.renameAlbum,a=memory.albums[id];if(!a)return;
  const rename=showModal('Đổi tên album','<label class="photos-album-input-label">Tên album<input data-name maxlength="64" value="'+esc(a.name)+'"></label><button class="photos-modal-primary" data-save-album>Lưu</button>');
  rename.querySelector('[data-save-album]').addEventListener('click',()=>{
   const n=rename.querySelector('[data-name]').value.trim();if(!n)return;
   a.name=n;persist();closeModal();b.renderAll();notice('Đã đổi tên album.');
  });
 }));
 el.querySelectorAll('[data-remove-album]').forEach(btn=>btn.addEventListener('click',()=>{
  const id=btn.dataset.removeAlbum;
  confirmAction('Xóa album này? Các ảnh trong album sẽ không bị xóa.','Xóa album',()=>{
   delete memory.albums[id];persist();b.renderAll();notice('Đã xóa album.');
  });
 }));
}
const albumRoot=albumList();
if(albumRoot)new MutationObserver(syncAlbumRows).observe(albumRoot,{childList:true});
app.addEventListener('click',event=>{
 const target=event.target;
 const select=target.closest('#photosSelectBtn,#photosCollectionsView .photos-nav-btn.right,#photosYearsView .photos-nav-btn.right,#photosAlbumGridView .photos-nav-btn.right');
 if(select){event.preventDefault();event.stopImmediatePropagation();if(!selecting&&target.closest('#photosCollectionsView,#photosYearsView'))b.showView('moments',true);selectMode(!selecting);return;}
 const createAlbum=target.closest('#photosAlbumsView .photos-album-add');
 if(createAlbum){event.preventDefault();event.stopImmediatePropagation();createNewAlbum();return;}
 const editAlbums=target.closest('#photosAlbumsView .photos-nav-btn.right');
 if(editAlbums){event.preventDefault();event.stopImmediatePropagation();manageAlbums();return;}
 const offlineShared=target.closest('#photosSharedView .photos-nav-btn');
 if(offlineShared){event.preventDefault();event.stopImmediatePropagation();notice('Album được chia sẻ cần kết nối iCloud.');return;}
 const custom=target.closest('[data-local-album]');
 if(custom){event.preventDefault();event.stopImmediatePropagation();openCustomAlbum(custom.dataset.localAlbum);return;}
 const deleted=target.closest('[data-album="deleted"]');
 if(deleted){event.preventDefault();event.stopImmediatePropagation();showDeleted();return;}
 if(selecting&&target.closest('[data-photos-tab]'))selectMode(false);
 if(selecting){const tile=target.closest('[data-photo-id]');if(tile){event.preventDefault();event.stopImmediatePropagation();const id=tile.dataset.photoId;chosen.has(id)?chosen.delete(id):chosen.add(id);syncMarks();return;}}
 const edit=target.closest('#photosEditBtn');
 if(edit){event.preventDefault();event.stopImmediatePropagation();openEditor();return;}
 const trash=target.closest('#photosTrashBtn');
 if(trash){event.preventDefault();event.stopImmediatePropagation();const p=active();if(p)askDelete([p.id]);return;}
 const share=target.closest('#photosShareBtn');
 if(share){event.preventDefault();event.stopImmediatePropagation();const p=active();if(p)openShare([p]);return;}
},true);
b.image.addEventListener('load',applyViewerEdit);
new MutationObserver(applyViewerEdit).observe(b.image,{attributes:true,attributeFilter:['src']});
removeDeletedFromVisible();
window.CauaPhotosLocal={get count(){return photos.length},get deletedCount(){return Object.keys(memory.deleted).filter(id=>memory.deleted[id]!==Number.MAX_SAFE_INTEGER).length},get editing(){return !!modal}};
b.renderAll();
})();