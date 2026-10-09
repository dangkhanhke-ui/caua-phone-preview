
(function(){
'use strict';
const app=document.getElementById('goodreaderApp');
const launch=document.querySelector('[data-app="goodreader"]');
const screen=document.getElementById('screen');
if(!app||!launch||!screen)return;
const el={nav:app.querySelector('#gr4Nav'),body:app.querySelector('#gr4Body'),bar:app.querySelector('#gr4Bar'),layer:app.querySelector('#gr4Layer')};
const STORE='caua.goodreader4.2015.v1';
let source=[], entries=[], folders=[], folderDates={}, selected=new Set(), history=[], bookmarks={}, notes={}, stars=new Set(), saved={}, recents=[];
let path=[],view='files',query='',sort='name',grid=false,current=null,page=1,zoom=1,reflow=false,readerSearch='',unlocked=new Set(),mode='normal',highlightMode=false,highlights={};
let copySequence=0;
let pendingCauaMailAttachment=null;
const specials=['Sự kiện','Tài liệu cũ','Lưu trữ'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key=p=>p.join('\u0001');
const pathLabel=p=>p.length?p.join(' › '):'My Documents';
const leaf=e=>e.filename||e.name;
const baseId=x=>x&&x.id;
const icon=(type)=>type==='folder'?'📁':'pdf';
const folderId=p=>'folder:'+key(p);
const fileUrl=e=>'./assets/goodreader4/docs/'+encodeURIComponent(e.original||e.filename);
function save(){
 try{
  const changes=entries.map(x=>({id:x.id,filename:x.filename,path:x.path,deleted:!!x.deleted,original:x.original,copied:!!x.copied}));
  localStorage.setItem(STORE,JSON.stringify({changes,folderNames:folders,folderDates,stars:[...stars],recents,bookmarks,notes,highlights,sort,grid}));
 }catch(e){}
}
function load(){
 try{saved=JSON.parse(localStorage.getItem(STORE)||'{}')||{};}catch(e){saved={};}
 stars=new Set(saved.stars||[]);recents=saved.recents||[];folderDates=saved.folderDates||{};
 bookmarks=saved.bookmarks||{};notes=saved.notes||{};highlights=saved.highlights||{};sort=saved.sort||'name';grid=!!saved.grid;
}
function init(data){
 source=(data.documents||[]).map(d=>({...d,original:d.filename,type:'file'}));
 const changes=new Map((saved.changes||[]).map(x=>[x.id,x]));
 entries=source.map(d=>Object.assign({},d,changes.get(d.id)||{}));
 for(const x of (saved.changes||[])){if(x.copied&&!entries.some(d=>d.id===x.id)){
  const original=source.find(d=>d.filename===x.original);
  if(original)entries.push({...original,...x,type:'file'});
 }}
 const seen=new Map();
 for(const d of entries.filter(x=>!x.deleted)){for(let i=1;i<=d.path.length;i++){const p=d.path.slice(0,i);seen.set(key(p),p);}}
 for(const p of saved.folderNames||[])seen.set(key(p),p);
 folders=[...seen.values()];
 // Legacy user-created empty folders need a one-time timestamp as well.
 for(const p of folders){if(!folderDates[key(p)]&&!entries.some(e=>!e.deleted&&p.every((v,i)=>e.path[i]===v)))folderDates[key(p)]=gr4Now();}
 save();render();
}
function find(id){return entries.find(d=>d.id===id);}
function toast(msg){const x=document.createElement('div');x.className='gr4-toast';x.textContent=msg;app.appendChild(x);setTimeout(()=>x.remove(),2300);}
function closeLayer(){el.layer.innerHTML='';}
function sheet(title,buttons){
 closeLayer();
 const wrap=document.createElement('div');wrap.className='gr4-actions';
 const box=document.createElement('div');box.className='gr4-sheet';
 const head=document.createElement('h3');head.textContent=title;box.appendChild(head);
 for(const b of buttons){
  const btn=document.createElement('button');btn.type='button';btn.textContent=b.title;
  if(b.danger)btn.classList.add('danger');
  btn.onclick=()=>{closeLayer();b.run();};box.appendChild(btn);
 }
 const cancel=document.createElement('button');cancel.className='cancel';cancel.textContent='Hủy';cancel.onclick=closeLayer;box.appendChild(cancel);
 wrap.onclick=e=>{if(e.target===wrap)closeLayer();};wrap.appendChild(box);el.layer.appendChild(wrap);
}
function promptBox(title,initial,cb){
 closeLayer();
 const wrap=document.createElement('div');wrap.className='gr4-actions';
 const box=document.createElement('div');box.className='gr4-sheet';
 box.innerHTML='<h3>'+esc(title)+'</h3><input class="gr4-input" type="text" autocomplete="off" /><button class="gr4-prompt-save">Lưu</button><button class="cancel">Hủy</button>';
 const input=box.querySelector('input');input.value=initial||'';
 box.querySelector('.gr4-prompt-save').onclick=()=>{const val=input.value.trim();if(!val){toast('Vui lòng nhập tên');return;}closeLayer();cb(val);};
 box.querySelector('.cancel').onclick=closeLayer;
 input.onkeydown=e=>{if(e.key==='Enter')box.querySelector('.gr4-prompt-save').click()};
 wrap.onclick=e=>{if(e.target===wrap)closeLayer()};wrap.appendChild(box);el.layer.appendChild(wrap);input.focus();input.select();
}
function dateCode(value){const d=String(value||'').split('/');return d.length===3?d[2]+d[1].padStart(2,'0')+d[0].padStart(2,'0'):String(value||'');}
function folderRows(location){
 const subs=folders.filter(f=>f.length===location.length+1&&location.every((v,i)=>f[i]===v)).map(f=>({id:folderId(f),type:'folder',name:f.at(-1),path:f}));
 const files=entries.filter(e=>!e.deleted&&key(e.path)===key(location));
 return [...subs.sort((a,b)=>a.name.localeCompare(b.name,'vi')), ...files.sort((a,b)=>sort==='date'?dateCode(b.modified).localeCompare(dateCode(a.modified)):a.filename.localeCompare(b.filename,'vi'))];
}
function allMatches(term){
 const q=term.trim().toLocaleLowerCase();const dirs=folders.filter(p=>!q||p.join(' ').toLocaleLowerCase().includes(q)).map(p=>({id:folderId(p),name:p.at(-1),path:p,type:'folder'}));const docs=entries.filter(e=>!e.deleted&&(!q||[e.filename,...e.path].join(' ').toLocaleLowerCase().includes(q)));return [...dirs,...docs];
}
const GR4_ICON_PATHS={"new-folder":"<path d=\"M12 4.5v15M4.5 12h15\"/>","manage":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/><path d=\"m7.5 12 3.1 3.1 6.1-7\"/>","manage-done":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m7.5 12 3.1 3.1 6.1-7\"/>","find":"<circle cx=\"10.8\" cy=\"10.8\" r=\"6.8\"/><path d=\"m16 16 4.5 4.5\"/>","recents":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 6.5v5.8l4.1 2.2\"/>","starred":"<path d=\"m12 2.5 3 6.1 6.7 1-4.85 4.7L18 21l-6-3.2L6 21l1.15-6.7L2.3 9.6l6.7-1Z\"/>","manage-star":"<path d=\"m12 2.5 3 6.1 6.7 1-4.85 4.7L18 21l-6-3.2L6 21l1.15-6.7L2.3 9.6l6.7-1Z\"/>","manage-move":"<path d=\"M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4\"/>","manage-copy":"<rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"2\"/><path d=\"M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2\"/>","manage-rename":"<path d=\"m4 16 11-11 4 4L8 20l-5 1 1-5ZM13 7l4 4\"/>","manage-delete":"<path d=\"M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7M10 11v6m4-6v6\"/>","zoom-out":"<path d=\"M5 12h14\"/>","zoom-in":"<path d=\"M5 12h14M12 5v14\"/>","reader-find":"<circle cx=\"10.8\" cy=\"10.8\" r=\"6.8\"/><path d=\"m16 16 4.5 4.5\"/>","bookmark":"<path d=\"m12 2.5 3 6.1 6.7 1-4.85 4.7L18 21l-6-3.2L6 21l1.15-6.7L2.3 9.6l6.7-1Z\"/>","pages":"<rect x=\"3.5\" y=\"3.5\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"13.5\" y=\"3.5\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"3.5\" y=\"13.5\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"13.5\" y=\"13.5\" width=\"7\" height=\"7\" rx=\"1\"/>","reader-actions":"<circle cx=\"5\" cy=\"12\" r=\"1.25\"/><circle cx=\"12\" cy=\"12\" r=\"1.25\"/><circle cx=\"19\" cy=\"12\" r=\"1.25\"/>","locations-return":"<path d=\"m15 4-8 8 8 8\"/>","pages-list":"<rect x=\"3.5\" y=\"3.5\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"13.5\" y=\"3.5\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"3.5\" y=\"13.5\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"13.5\" y=\"13.5\" width=\"7\" height=\"7\" rx=\"1\"/>","bookmarks-list":"<path d=\"m12 2.5 3 6.1 6.7 1-4.85 4.7L18 21l-6-3.2L6 21l1.15-6.7L2.3 9.6l6.7-1Z\"/>","annotations-list":"<path d=\"M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 14h8m-8 4h5\"/>","row-chevron":"<path d=\"m9 5 7 7-7 7\"/>","row-check":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/><path d=\"m7.5 12 3.1 3.1 6.1-7\"/>","row-empty":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/>"};
function gr4Svg(name,fill){const p=GR4_ICON_PATHS[name]||GR4_ICON_PATHS['row-chevron'];return '<svg class="gr4-svg" viewBox="0 0 24 24" width="22" height="22" fill="'+(fill?'currentColor':'none')+'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+p+'</svg>';}
function gr4DateText(date,time){return date ? String(date)+' · '+(time||'12:00') : '—';}
function gr4Now(){const d=new Date(),z=n=>String(n).padStart(2,'0');return z(d.getDate())+'/'+z(d.getMonth()+1)+'/'+d.getFullYear()+' · '+z(d.getHours())+':'+z(d.getMinutes());}
function gr4FolderDate(p){const files=entries.filter(x=>!x.deleted&&p.every((v,i)=>x.path[i]===v));if(files.length){files.sort((a,b)=>dateCode(b.modified).localeCompare(dateCode(a.modified))||String(b.modifiedTime||'').localeCompare(String(a.modifiedTime||'')));return gr4DateText(files[0].modified,files[0].modifiedTime);}return folderDates[key(p)]||'—';}
function fileRow(e){
 const isFolder=e.type==='folder',st=stars.has(e.id);
 const small=isFolder?gr4FolderDate(e.path):gr4DateText(e.modified,e.modifiedTime);
 const end=mode==='manage'?gr4Svg(selected.has(e.id)?'row-check':'row-empty'):gr4Svg(st?'starred':'row-chevron',st);
 return '<button class="gr4-file" data-gr="entry" data-id="'+esc(e.id)+'"><span class="gr4-file-icon '+(isFolder?'folder':'pdf')+'">'+(isFolder?'':'')+'</span><span class="gr4-file-copy"><span class="gr4-file-name">'+esc(leaf(e))+'</span><span class="gr4-file-meta">'+esc(small)+'</span></span><span class="gr4-file-end">'+end+'</span></button>';
}
function setNav(back,title,right){
 el.nav.innerHTML='<button class="'+(back?'gr4-has-back':'')+'" data-gr="'+(back?'back':'root')+'">'+(back?'‹ Quay lại':'⌂')+'</button><strong>'+esc(title)+'</strong>'+(right?'<button class="gr4-nav-right" data-gr="view-setup">☷ Chọn</button>':'<span class="gr4-nav-spacer" aria-hidden="true"></span>');
}
function tools(items){el.bar.style.display='flex';el.bar.innerHTML=items.map(a=>'<button type="button" data-gr="'+esc(a.id)+'" aria-label="'+esc(a.label)+'" class="'+(a.active?'active':'')+'"><span class="gr4-tool-icon" aria-hidden="true">'+gr4Svg(a.id,a.id==='bookmark'&&a.icon==='★')+'</span><span class="gr4-tool-label">'+esc(a.label)+'</span></button>').join('');}
function renderFiles(){
 const rows=view==='files'?folderRows(path):view==='find'?allMatches(query):view==='recents'?recents.map(find).filter(x=>x&&!x.deleted):[...folders.filter(p=>stars.has(folderId(p))).map(p=>({id:folderId(p),name:p.at(-1),path:p,type:'folder'})),...entries.filter(x=>!x.deleted&&stars.has(x.id))];
 const title=view==='files'?(path.at(-1)||'My Documents'):({find:'Find Files',recents:'Recent Files',starred:'Starred'})[view];
 setNav(path.length||view!=='files',title,true);
 let out='';
 if(view==='files')out+='<div class="gr4-path">'+esc(pathLabel(path))+'</div>';
 if(view==='find')out+='<div class="gr4-search"><input id="gr4FindInput" placeholder="Tên tệp hoặc thư mục" type="search" value="'+esc(query)+'"/><button data-gr="clear-search">✕</button></div>';
 if(mode==='manage')out+='<div class="gr4-section-title">Đã chọn: '+selected.size+' tệp / thư mục</div>';
 out+='<div id="gr4Rows" class="'+(grid?'gr4-file-grid':'')+'">'+(rows.length?rows.map(fileRow).join(''):'<div class="gr4-empty">Không có tài liệu nào ở đây.</div>')+'</div>';
 el.body.innerHTML=out;
 if(view==='find'){
  const input=el.body.querySelector('#gr4FindInput');
  input.addEventListener('input',e=>{query=e.target.value;const rows=allMatches(query);el.body.querySelector('#gr4Rows').innerHTML=rows.length?rows.map(fileRow).join(''):'<div class="gr4-empty">Không tìm thấy.</div>';});
 }
 if(mode==='manage'){
  tools([{id:'manage-done',icon:'✓',label:'Xong'},{id:'manage-star',icon:'★',label:'Star'},{id:'manage-move',icon:'↪',label:'Di chuyển'},{id:'manage-copy',icon:'▣',label:'Sao chép'},{id:'manage-rename',icon:'✎',label:'Đổi tên'},{id:'manage-delete',icon:'▤',label:'Xóa'}]);
 }else{
  tools([{id:'new-folder',icon:'+',label:'Thư mục'},{id:'manage',icon:'☑',label:'Quản lý'},{id:'find',icon:'⌕',label:'Tìm'},{id:'recents',icon:'◷',label:'Gần đây'},{id:'starred',icon:'☆',label:'Yêu thích'}]);
 }
}
function noteState(id,p){return (notes[id]||{})[String(p)]||'';}
function bookmarked(id,p){return (bookmarks[id]||[]).includes(p);}
function htext(str){
 let raw=esc(str);
 if(readerSearch&&readerSearch.trim()){
  const q=readerSearch.trim();const parts=str.split(new RegExp('('+q.replace(/[.*+?^$()|[\]{}\\]/g,'\\$&')+')','ig'));
  raw=parts.map(x=>x.toLocaleLowerCase()===q.toLocaleLowerCase()?'<mark>'+esc(x)+'</mark>':esc(x)).join('');
 }
 return raw;
}
function blockHtml(b){
 const t=b.type;const x=htext(b.text||'');
 if(t==='brand')return '<h1>'+x+'</h1>';
 if(t==='title')return '<h2>'+x+'</h2>';
 if(t==='heading')return '<h3>'+x+'</h3>';
 if(t==='line')return '<p class="gr4-docline"><b>'+htext(b.label)+':</b> '+x+'</p>';
 if(t==='space')return '<div style="height:11px"></div>';
 if(t==='list')return '<ul>'+b.items.map(v=>'<li>'+htext(v)+'</li>').join('')+'</ul>';
 if(t==='signature')return '<p class="gr4-docsig">'+x+'</p>';
 if(t==='handwritten')return '<p class="gr4-dochand">'+x+'</p>';
 if(t==='seal')return '<p class="gr4-docseal">'+x+'</p>';
 return '<p>'+x+'</p>';
}
function markedBlock(e,block,num,idx){
 const marked=(highlights[e.id]||[]).includes(num+':'+idx);
 return '<div class="gr4-block'+(marked?' gr4-highlight':'')+'" data-page="'+num+'" data-index="'+idx+'">'+blockHtml(block)+'</div>';
}
function readerPage(e,num){
 const note=noteState(e.id,num);
 return '<section class="gr4-page" data-page="'+num+'" style="--gr4-zoom:'+zoom+';width:'+Math.round(92*zoom)+'%">'+e.pages[num-1].map((b,i)=>markedBlock(e,b,num,i)).join('')+(note?'<div class="gr4-note">🗒 '+esc(note)+'</div>':'')+'<small>'+num+'</small></section>';
}
function renderReader(restorePage=true){
 const e=find(current);if(!e){view='files';return renderFiles();}
 setNav(true,e.filename,true);
 const content=reflow?
  '<div class="gr4-reading"><div class="gr4-page" style="width:'+Math.round(92*zoom)+'%;--gr4-zoom:'+zoom+'">'+e.pages.map((part,i)=>'<section class="gr4-reflow-section" data-page="'+(i+1)+'">'+part.map((b,j)=>markedBlock(e,b,i+1,j)).join('')+'</section>').join('')+'</div></div>':
  '<div class="gr4-reading">'+e.pages.map((p,i)=>readerPage(e,i+1)).join('')+'</div>';
 const controls='<div class="gr4-page-controls"><button type="button" data-gr="prev-page" '+(page<=1?'disabled':'')+' aria-label="Trang trước">‹</button><input id="gr4PageRange" type="range" min="1" max="'+e.pages.length+'" value="'+page+'" aria-label="Chọn trang"/><span class="gr4-current-page">'+page+'/'+e.pages.length+'</span><button type="button" data-gr="next-page" '+(page>=e.pages.length?'disabled':'')+' aria-label="Trang sau">›</button></div>';
 el.body.innerHTML=(readerSearch!==''?'<div class="gr4-search"><input id="gr4ReaderSearch" value="'+esc(readerSearch)+'" placeholder="Tìm trong PDF" type="search"/><button data-gr="reader-search-close">Xong</button></div>':'')+(highlightMode?'<div class="gr4-highlight-hint">Tô sáng: chạm đoạn văn để đánh dấu hoặc bỏ đánh dấu.</div>':'')+controls+content;
 const scrub=el.body.querySelector('#gr4PageRange');
 if(scrub)scrub.addEventListener('input',()=>{goPage(Number(scrub.value));});
 if(readerSearch!==''){
  const input=el.body.querySelector('#gr4ReaderSearch');input.addEventListener('change',evt=>{readerSearch=evt.target.value;renderReader(true)});input.addEventListener('keydown',evt=>{if(evt.key==='Enter'){readerSearch=input.value;renderReader(true)}});
 }
 tools([{id:'zoom-out',icon:'−',label:'Thu nhỏ'},{id:'zoom-in',icon:'+',label:Math.round(zoom*100)+'%'},{id:'reader-find',icon:'⌕',label:'Tìm chữ'},{id:'bookmark',icon:bookmarked(e.id,page)?'★':'☆',label:'Đánh dấu'},{id:'pages',icon:'▦',label:page+'/'+e.pages.length},{id:'reader-actions',icon:'•••',label:'Công cụ'}]);
 if(restorePage)requestAnimationFrame(()=>goPage(page));
}
function goPage(n){
 const e=find(current);if(!e)return;
 page=Math.max(1,Math.min(e.pages.length,n));
 const target=el.body.querySelector('.gr4-page[data-page="'+page+'"],.gr4-reflow-section[data-page="'+page+'"]');
 if(target)el.body.scrollTop+=(target.getBoundingClientRect().top-el.body.getBoundingClientRect().top)-10;
 const count=el.bar.querySelector('[data-gr="pages"]');if(count)count.lastChild.textContent=page+'/'+e.pages.length;
 const range=el.body.querySelector('#gr4PageRange'),label=el.body.querySelector('.gr4-current-page');if(range)range.value=page;if(label)label.textContent=page+'/'+e.pages.length;
 const previous=el.body.querySelector('[data-gr="prev-page"]'),next=el.body.querySelector('[data-gr="next-page"]');if(previous)previous.disabled=page<=1;if(next)next.disabled=page>=e.pages.length;
 const star=el.bar.querySelector('[data-gr="bookmark"] span:first-child');if(star)star.innerHTML=gr4Svg('bookmark',bookmarked(current,page));
}
function unlockView(){
 const e=find(current);setNav(true,e.filename,false);
 el.body.innerHTML='<div class="gr4-lock"><div class="symbol">🔒</div><h3>PDF được bảo vệ</h3><p>Nhập mật khẩu của tài liệu để đọc nội dung.</p><input id="gr4Password" type="password" placeholder="Mật khẩu" inputmode="numeric" autocomplete="off" maxlength="32"/><div class="error" id="gr4PasswordError"></div><button class="gr4-primary" data-gr="unlock">Mở tài liệu</button></div>';
 el.bar.style.display='none';const input=el.body.querySelector('#gr4Password');input.addEventListener('keydown',e=>{if(e.key==='Enter')unlock()});input.focus();
}
function unlock(){
 const e=find(current),input=el.body.querySelector('#gr4Password');
 if(!input)return;
 if(input.value===e.password){unlocked.add(e.id);readerSearch='';view='reader';page=1;renderReader();}
 else{el.body.querySelector('#gr4PasswordError').textContent='Mật khẩu không chính xác.';input.value='';input.focus();}
}
function openFile(id){
 const e=find(id);if(!e)return;
 history.push({path:[...path],view:view});current=id;page=1;zoom=1;reflow=false;readerSearch='';highlightMode=false;
 recents=[id,...recents.filter(x=>x!==id)].slice(0,15);save();
 if(e.password&&!unlocked.has(e.id)){view='locked';unlockView();}
 else{view='reader';renderReader();}
}
function back(){
 if(view==='mail-unavailable'){const previous=history.pop();view=previous?.view||'files';path=previous?.path||[];current=null;render();return;}
 if(view==='pages'||view==='bookmarks'||view==='annotations'){view='reader';renderReader();return;}
 if(view==='locked'||view==='reader'){
  if(current){const d=find(current);if(d?.password)unlocked.delete(d.id);}
  const prev=history.pop();current=null;readerSearch='';highlightMode=false;
  view=prev?.view||'files';path=prev?.path||path;mode='normal';selected.clear();render();return;
 }
 if(view!=='files'){view='files';path=[];}
 else if(path.length)path=path.slice(0,-1);
 else return;
 mode='normal';selected.clear();render();
}
function render(){
 if(view==='locked')unlockView();
 else if(view==='reader')renderReader(false);
 else if(view==='pages'||view==='bookmarks'||view==='annotations')renderLocations();
 else renderFiles();
}

function renderLocations(){
 const d=find(current);if(!d)return;
 const isBookmarks=view==='bookmarks',isAnnotations=view==='annotations';
 const title=isAnnotations?'Annotations':isBookmarks?'Bookmarks':'Pages';
 setNav(true,title,false);
 let rows=[];
 if(isAnnotations){
  const highlighted=(highlights[d.id]||[]).map(item=>Number(item.split(':')[0]));
  const noted=Object.keys(notes[d.id]||{}).map(Number);
  rows=[...new Set([...highlighted,...noted])].filter(n=>n>=1&&n<=d.pages.length).sort((a,b)=>a-b);
 }else rows=isBookmarks?(bookmarks[d.id]||[]):d.pages.map((p,i)=>i+1);
 const desc=isAnnotations?'Ghi chú & tô sáng (lưu trên máy)':isBookmarks?'Các trang đã đánh dấu':'Chọn trang để chuyển đến';
 const body=rows.length?rows.map(n=>{
  const count=(highlights[d.id]||[]).filter(x=>x.startsWith(n+':')).length;
  const note=noteState(d.id,n);
  const suffix=isAnnotations?' · '+[count?count+' đoạn tô sáng':'',note?'có ghi chú':''].filter(Boolean).join(', '):'';
  return '<button data-gr="jump-page" data-page="'+n+'">'+(isAnnotations?'✎ ':isBookmarks?'★ ':'▤ ')+'Trang '+n+esc(suffix)+' <span>›</span></button>';
 }).join(''):'<div class="gr4-empty">'+(isAnnotations?'Chưa có ghi chú hoặc đoạn tô sáng.':'Chưa có dấu trang.')+'</div>';
 el.body.innerHTML='<div class="gr4-section-title">'+desc+'</div><div class="gr4-panel-list">'+body+'</div>';
 tools([{id:'locations-return',icon:'‹',label:'Đọc PDF'},{id:'pages-list',icon:'▦',label:'Trang'},{id:'bookmarks-list',icon:'☆',label:'Bookmarks'},{id:'annotations-list',icon:'✎',label:'Ghi chú'}]);
}

function gr4RemapFolderDates(oldPath,newPath){const from=key(oldPath),to=key(newPath);const next={};for(const [k,v] of Object.entries(folderDates)){next[k===from?to:k.startsWith(from+'\u0001')?to+k.slice(from.length):k]=v;}folderDates=next;}
function remapFolderStars(oldPath,newPath){
 const from=folderId(oldPath),to=folderId(newPath);
 stars=new Set([...stars].map(id=>id===from?to:(id.startsWith(from+'\u0001')?to+id.slice(from.length):id)));
}
function setStar(ids){for(const id of ids){if(stars.has(id))stars.delete(id);else stars.add(id)}save();render();}
function newFolder(){promptBox('Tạo thư mục mới','',name=>{const p=[...path,name];if(folders.some(x=>key(x)===key(p))){toast('Thư mục đã tồn tại');return;}folders.push(p);folderDates[key(p)]=gr4Now();save();render();});}
function deleteSelected(){
 const ids=[...selected];if(!ids.length){toast('Chọn ít nhất một tệp');return;}
 sheet('Xóa '+ids.length+' mục?',[
 {title:'Xóa vào Thùng rác',danger:true,run:()=>{
  for(const id of ids){const f=find(id);if(f)f.deleted=true;else if(id.startsWith('folder:')){const path0=folders.find(x=>folderId(x)===id);if(path0){folders=folders.filter(x=>!x.slice(0,path0.length).every((v,i)=>v===path0[i]));entries.filter(x=>x.path.slice(0,path0.length).every((v,i)=>v===path0[i])).forEach(x=>x.deleted=true);}}}
  selected.clear();mode='normal';save();render();toast('Đã chuyển vào Thùng rác');
 }}]);
}

function copySelected(){
 const ids=[...selected];if(!ids.length){toast('Chọn mục cần sao chép');return;}
 const matches=(p,base)=>base.every((v,i)=>p[i]===v);
 const uniqueFile=(name,dest)=>{
  const ext=name.toLowerCase().endsWith('.pdf')?'.pdf':'';
  const stem=ext?name.slice(0,-4):name;
  let candidate=name,n=1;
  while(entries.some(e=>!e.deleted&&key(e.path)===key(dest)&&e.filename.toLocaleLowerCase()===candidate.toLocaleLowerCase())){
   candidate=stem+' (copy'+(n>1?' '+n:'')+')'+ext;n++;
  }
  return candidate;
 };
 const uniqueFolder=(name,dest)=>{
  let candidate=name,n=1;
  while(folders.some(f=>key(f)===key([...dest,candidate]))){candidate=name+' (copy'+(n>1?' '+n:'')+')';n++;}
  return candidate;
 };
 const duplicate=(file,dest)=>{
  entries.push({...file,id:'gr4-copy-'+Date.now().toString(36)+'-'+(++copySequence),filename:uniqueFile(file.filename,dest),path:[...dest],deleted:false,copied:true,original:file.original||file.filename});
 };
 const copyTo=(dest)=>{
  const originalFolders=folders.map(f=>[...f]),originalFiles=entries.filter(e=>!e.deleted).map(e=>({...e,path:[...e.path]}));
  let done=0;
  for(const id of ids){
   const f=originalFiles.find(x=>x.id===id);
   if(f){duplicate(f,dest);done++;continue;}
   const root=originalFolders.find(x=>folderId(x)===id);
   if(!root)continue;
   const target=[...dest,uniqueFolder(root.at(-1),dest)];
   folders.push(target);folderDates[key(target)]=gr4Now();
   originalFolders.filter(x=>x.length>root.length&&matches(x,root)).forEach(x=>{const child=[...target,...x.slice(root.length)];folders.push(child);folderDates[key(child)]=gr4Now();});
   originalFiles.filter(x=>matches(x.path,root)).forEach(x=>duplicate(x,[...target,...x.path.slice(root.length)]));
   done++;
  }
  if(!done){toast('Không có mục để sao chép');return;}
  selected.clear();mode='normal';save();render();toast('Đã sao chép '+done+' mục');
 };
 sheet('Sao chép đến',[
  {title:'My Documents',run:()=>copyTo([])},
  ...folders.map(f=>({title:pathLabel(f),run:()=>copyTo(f)}))
 ]);
}

function moveSelected(){
 const ids=[...selected];if(!ids.length){toast('Chọn một tệp để di chuyển');return;}
 const buttons=[{title:'My Documents',run:()=>moveTo([])},...folders.map(p=>({title:pathLabel(p),run:()=>moveTo(p)}))];
 function moveTo(dest){
  for(const id of ids){
   const f=find(id);
   if(f){f.path=[...dest];continue;}
   const oldPath=folders.find(p=>folderId(p)===id);
   if(!oldPath)continue;
   const prefix=(p,base)=>base.every((v,i)=>p[i]===v);
   if(prefix(dest,oldPath)){toast('Không thể chuyển thư mục vào chính nó');continue;}
   const newPath=[...dest,oldPath.at(-1)];
   gr4RemapFolderDates(oldPath,newPath);
   remapFolderStars(oldPath,newPath);
   folders=folders.map(p=>prefix(p,oldPath)?[...newPath,...p.slice(oldPath.length)]:p);
   entries.forEach(e=>{if(prefix(e.path,oldPath))e.path=[...newPath,...e.path.slice(oldPath.length)];});
  }
  selected.clear();mode='normal';save();render();toast('Đã di chuyển '+ids.length+' tệp');
 }
 sheet('Di chuyển đến',buttons);
}
function renameSelected(){
 if(selected.size!==1){toast('Hãy chọn đúng một mục');return;}
 const id=[...selected][0],f=find(id);
 if(f)promptBox('Đổi tên file',f.filename,val=>{f.filename=val.endsWith('.pdf')?val:val+'.pdf';mode='normal';selected.clear();save();render();});
 else {const p=folders.find(x=>folderId(x)===id);if(p)promptBox('Đổi tên thư mục',p.at(-1),val=>{const old=[...p],updated=[...p.slice(0,-1),val];
  gr4RemapFolderDates(old,updated);
  remapFolderStars(old,updated);
  folders=folders.map(x=>x.slice(0,old.length).every((v,i)=>v===old[i])?[...updated,...x.slice(old.length)]:x);
  entries.forEach(e=>{if(e.path.slice(0,old.length).every((v,i)=>v===old[i]))e.path=[...updated,...e.path.slice(old.length)]});
  mode='normal';selected.clear();save();render();
 });}
}
function download(){
 const d=find(current);if(!d)return;
 const a=document.createElement('a');a.href=fileUrl(d);a.download=d.original||d.filename;document.body.appendChild(a);a.click();a.remove();
 toast('Đang tải tệp PDF gốc');
}
function readerActions(){
 const d=find(current);
 sheet(d.filename,[
 {title:'Tải xuống PDF gốc',run:download},
 {title:'Gửi qua Mail',run:()=>window.CauaCrossApp?.shareDocument(d.filename)},
 {title:reflow?'Trở lại chế độ PDF':'Chế độ PDF Reflow',run:()=>{reflow=!reflow;renderReader()}},
 {title:'Page Management',run:()=>{view='pages';renderLocations()}},
 {title:'Bookmarks',run:()=>{view='bookmarks';renderLocations()}},
 {title:'Annotations (Ghi chú & tô sáng)',run:()=>{view='annotations';renderLocations()}},
 {title:'Ghi chú trên trang '+page,run:()=>promptBox('Ghi chú - trang '+page,noteState(d.id,page),val=>{(notes[d.id]||(notes[d.id]={}))[String(page)]=val;save();renderReader();})},
 {title:highlightMode?'✓ Thoát chế độ tô sáng':'Tô sáng văn bản (lưu trong ứng dụng)',run:()=>{highlightMode=!highlightMode;renderReader();}},
 ...(noteState(d.id,page)?[{title:'Xóa ghi chú trang '+page,danger:true,run:()=>{delete notes[d.id][String(page)];save();renderReader();}}]:[]),
 {title:stars.has(d.id)?'Bỏ yêu thích':'Thêm vào yêu thích',run:()=>{setStar([d.id]);renderReader();}}
 ]);
}
function viewSetup(){
 sheet('Tùy chỉnh hiển thị',[
 {title:'Danh sách '+(!grid?'✓':''),run:()=>{grid=false;save();render()}},
 {title:'Lưới '+(grid?'✓':''),run:()=>{grid=true;save();render()}},
 {title:'Sắp theo tên '+(sort==='name'?'✓':''),run:()=>{sort='name';save();render()}},
 {title:'Sắp theo ngày '+(sort==='date'?'✓':''),run:()=>{sort='date';save();render()}},
 {title:'Thùng rác',run:()=>{const gone=entries.filter(e=>e.deleted);
  if(!gone.length){toast('Thùng rác trống');return;}
  sheet('Thùng rác',[...gone.map(f=>({title:f.filename+' — khôi phục',run:()=>{f.deleted=false;for(let i=1;i<=f.path.length;i++){const p=f.path.slice(0,i);if(!folders.some(x=>key(x)===key(p)))folders.push(p);}save();render();toast('Đã khôi phục '+f.filename)}})),{title:'Xóa vĩnh viễn các bản sao',danger:true,run:()=>{entries=entries.filter(e=>!e.copied||!e.deleted);save();render()}}]);
 }}
 ]);
}
function handler(action,target){
 if(action==='entry'){
  const id=target.dataset.id;
  if(mode==='manage'){selected.has(id)?selected.delete(id):selected.add(id);renderFiles();return;}
  if(id.startsWith('folder:')){const f=folders.find(x=>folderId(x)===id);if(f){path=[...f];view='files';render();}}
  else openFile(id);
 }else if(action==='back')back();
 else if(action==='root'){path=[];view='files';mode='normal';render();}
 else if(action==='new-folder')newFolder();
 else if(action==='view-setup')view==='reader'?readerActions():viewSetup();
 else if(action==='manage'){mode='manage';selected.clear();render();}
 else if(action==='manage-done'){mode='normal';selected.clear();render();}
 else if(action==='manage-star'){if(!selected.size){toast('Hãy chọn tệp');return;}setStar([...selected]);}
 else if(action==='manage-rename')renameSelected();
 else if(action==='manage-move')moveSelected();
 else if(action==='manage-copy')copySelected();
 else if(action==='manage-delete')deleteSelected();
 else if(action==='find'){view='find';query='';render();el.body.querySelector('input')?.focus();}
 else if(action==='clear-search'){query='';render();}
 else if(action==='recents'){view='recents';render();}
 else if(action==='starred'){view='starred';render();}
 else if(action==='unlock')unlock();
 else if(action==='zoom-in'){zoom=Math.min(2.5,Math.round((zoom+.25)*100)/100);renderReader();}
 else if(action==='zoom-out'){zoom=Math.max(.75,Math.round((zoom-.25)*100)/100);renderReader();}
 else if(action==='reader-find'){readerSearch=' ';renderReader();el.body.querySelector('#gr4ReaderSearch')?.focus();}
 else if(action==='reader-search-close'){readerSearch='';renderReader();}
 else if(action==='bookmark'){const list=bookmarks[current]||[];bookmarks[current]=list.includes(page)?list.filter(x=>x!==page):[...list,page].sort((a,b)=>a-b);save();renderReader();}
 else if(action==='pages'){view='pages';renderLocations();}
 else if(action==='reader-actions')readerActions();
 else if(action==='prev-page')goPage(page-1);
 else if(action==='next-page')goPage(page+1);
 else if(action==='jump-page'){page=Number(target.dataset.page)||1;view='reader';renderReader();}
 else if(action==='locations-return'){view='reader';renderReader();}
 else if(action==='pages-list'){view='pages';renderLocations();}
 else if(action==='bookmarks-list'){view='bookmarks';renderLocations();}
 else if(action==='annotations-list'){view='annotations';renderLocations();}
}
app.addEventListener('click',evt=>{
 if(view==='reader'&&highlightMode){
  const block=evt.target.closest('.gr4-block');
  if(block&&el.body.contains(block)){
   const id=Number(block.dataset.page)+':'+Number(block.dataset.index),items=highlights[current]||[];
   highlights[current]=items.includes(id)?items.filter(x=>x!==id):[...items,id];
   block.classList.toggle('gr4-highlight',highlights[current].includes(id));
   save();return;
  }
 }
 const button=evt.target.closest('[data-gr]');
 if(!button||!app.contains(button))return;
 evt.preventDefault();handler(button.dataset.gr,button);
});
el.body.addEventListener('scroll',()=>{
 if(view!=='reader')return;
 const ps=[...el.body.querySelectorAll('.gr4-page[data-page],.gr4-reflow-section[data-page]')];let best=1,d=Infinity;
 for(const item of ps){const dist=Math.abs(item.getBoundingClientRect().top-el.body.getBoundingClientRect().top);if(dist<d){d=dist;best=Number(item.dataset.page)}}
 if(page!==best){page=best;const count=el.bar.querySelector('[data-gr="pages"]');if(count)count.lastChild.textContent=page+'/'+ps.length;const slider=el.body.querySelector('#gr4PageRange'),label=el.body.querySelector('.gr4-current-page');if(slider)slider.value=page;if(label)label.textContent=page+'/'+ps.length;const previous=el.body.querySelector('[data-gr="prev-page"]'),next=el.body.querySelector('[data-gr="next-page"]');if(previous)previous.disabled=page<=1;if(next)next.disabled=page>=ps.length;const star=el.bar.querySelector('[data-gr="bookmark"] span:first-child');if(star)star.innerHTML=gr4Svg('bookmark',bookmarked(current,page));}
},{passive:true});

function importMailAttachment(item){
  if(!source.length){pendingCauaMailAttachment=item;return}
  pendingCauaMailAttachment=null;
  const name=String(item.filename||'').trim();
  if(!/^[\w .-]{1,130}\.pdf$/i.test(name))return;
  const existing=entries.find(e=>!e.deleted&&e.filename.toLowerCase()===name.toLowerCase());
  if(existing){path=[...existing.path];view='files';render();openFile(existing.id);return}
  history.push({path:[...path],view});
  view='mail-unavailable';current=null;
  setNav(true,name,false);el.bar.style.display='none';
  el.body.innerHTML='<div class="gr4-lock"><div class="symbol" aria-hidden="true">☁</div><h3>Không có kết nối</h3><p>Không thể tải nội dung tệp đính kèm.<br>Vui lòng thử lại sau.</p></div>';
}
window.addEventListener('caua:goodreader-attachment',event=>importMailAttachment(event.detail||{}));

launch.addEventListener('click',()=>{
 app.classList.add('open');screen.classList.add('goodreader-open');
 if(!source.length)toast('Đang mở My Documents...');
});
load();render();
fetch('./assets/goodreader4/documents.json',{cache:'no-store'})
 .then(r=>{if(!r.ok)throw Error('Could not load GoodReader documents');return r.json()})
 .then(data=>{init(data);if(pendingCauaMailAttachment)importMailAttachment(pendingCauaMailAttachment)})
 .catch(()=>{el.body.innerHTML='<div class="gr4-empty">Không đọc được thư viện tài liệu. Vui lòng tải lại trang.</div>';});
})();
