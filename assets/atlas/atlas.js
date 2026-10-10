(function(){
'use strict';
const D=window.AtlasData2015;
const app=document.getElementById('atlasApp');
const shell=document.getElementById('atlasShell');
const launcher=document.querySelector('[data-app="atlas"]');
const screen=document.getElementById('screen');
if(!D||!app||!shell||!launcher||!screen)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const profileBy=id=>D.profiles.concat(D.deleted).find(p=>p.id===id);
const allEntries=D.entries.slice().sort((a,b)=>b.date.localeCompare(a.date));
const monthName=n=>['','Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'][Number(n)]||'';
const pretty=d=>{const p=String(d||'').split(' '),a=p[0].split('-');return a.length===3?a[2]+'/'+a[1]+'/'+a[0]+(p[1]?' · '+p[1]:''):String(d||'');};
const state={tab:'profiles',view:'grid',profileId:'',subtab:'live',year:2015,month:8,from:'profile',pinnedOnly:false,recordId:'',filter:'all',q:'',searchScope:'all',searchLimit:60,auth:'',secondary:'',secondaryOpen:false,unlocked:false,secondaryUnlocked:false,booting:false,activity:D.activity.slice(),clockMinute:52};
const trail=[];
try{state.secondaryUnlocked=localStorage.getItem('caua.atlas.2015.secondary.v1')==='1';}catch(e){}
function icon(name){
 const paths={
 search:'<circle cx="10" cy="10" r="6.1"/><path d="m14.5 14.5 5.5 5.5"/>',
 bell:'<path d="M6 17h12l-2-3V9a4 4 0 0 0-8 0v5l-2 3Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
 people:'<circle cx="8" cy="8" r="3"/><path d="M2 20v-2c0-3 2.5-5 6-5s6 2 6 5v2"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14c3 0 6 2 6 5v1"/>',
 activity:'<path d="M2 12h4l3-7 5 14 3-7h5"/>',
 trash:'<path d="M4 6h16M9 6V4h6v2M6 7l1 13h10l1-13M10 10v7M14 10v7"/>',
 photo:'<rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="9" cy="9" r="2"/><path d="m4 18 6-6 4 4 3-3 4 4"/>',
 camera:'<path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="4"/>',
 file:'<path d="M6 2h8l5 5v15H6z"/><path d="M14 2v6h5M9 12h7M9 16h7"/>',
 msg:'<path d="M3 4h18v13H9l-5 4v-4H3z"/><path d="M7 9h10M7 13h7"/>',
 map:'<path d="m3 5 6-3 6 3 6-3v17l-6 3-6-3-6 3zM9 2v17M15 5v17"/>',
 audio:'<path d="M3 11v3M7 6v13M11 3v18M15 7v10M19 4v16"/>',
 video:'<rect x="2" y="4" width="15" height="16" rx="1"/><path d="m17 9 5-4v14l-5-4z"/>',
 wifi:'<path d="M2 9a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M9 16a4 4 0 0 1 6 0"/><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/>',
 lock:'<rect x="5" y="10" width="14" height="12" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 refresh:'<path d="M20 10a8 8 0 1 0-1 7M20 4v6h-6"/>'
 };
 return '<svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" stroke="currentColor" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+(paths[name]||paths.file)+'</svg>';
}
function portrait(p){
 if(!p)return'<span class="atlas-initials">?</span>';
 let h='';
 if(p.portrait)h='<img loading="lazy" src="./'+esc(p.portrait)+'" alt="" onerror="this.style.display=\'none\'" />';
 else if(p.sprite){
  const i=p.sprite-1,grp=i>=25?2:1,cell=i%25,col=cell%5,row=Math.floor(cell/5);
  h='<span class="atlas-sprite" style="background-image:url(./assets/facebook/avatars/batch'+grp+'-sprite.jpg);background-size:500% 500%;background-position:'+(col*25)+'% '+(row*25)+'%"></span>';
 }
 return '<span class="atlas-person-photo">'+h+'<span class="atlas-initials" style="position:absolute;inset:0;z-index:-1">'+esc((p.short||p.name||'?').slice(0,1))+'</span></span>';
}
function visibleRecords(id){return allEntries.filter(e=>e.p===id&&(state.secondaryUnlocked||!e.locked));}
function allRecords(id){return allEntries.filter(e=>e.p===id);}
function category(k){
 if(k==='camera'||k==='video')return'cam';if(k==='message'||k==='mail')return'msg';if(k==='document')return'doc';if(k==='map')return'map';if(k==='audio')return'audio';return'photo';
}
function sourceIcon(e){
 if(e.source==='Camera')return icon('camera');
 if(e.source==='Tin nhắn')return icon('msg');
 if(e.source==='Thiết bị')return icon('wifi');
 if(e.kind==='map')return icon('map');
 if(e.kind==='audio')return icon('audio');
 return icon('file');
}
function thumbnail(e){
 return '<button type="button" class="atlas-thumb" data-do="item" data-id="'+esc(e.id)+'" aria-label="'+esc(e.title)+'"><span class="atlas-thumb-art '+category(e.kind)+'"></span><span class="atlas-source-icon">'+sourceIcon(e)+'</span></button>';
}
function title(){
 if(state.view==='grid')return'Atlas';
 if(state.view==='activity')return'Hoạt động';
 if(state.view==='alerts')return'Cảnh báo';
 if(state.view==='deleted')return'Đã xóa';
 if(state.view==='search')return'Tìm kiếm';
 if(state.view==='profile')return'Atlas';
 if(state.view==='album')return state.pinnedOnly?'Đã lưu riêng':monthName(state.month)+' '+state.year;
 if(state.view==='item')return'Tệp';
 if(state.view==='timeline')return'Dòng thời gian';
 if(state.view==='location')return'Vị trí gần đây';
 return'Atlas';
}
function canBack(){return trail.length>0;}
function nav(){
 const back=canBack()?'<button class="atlas-nav-btn back" type="button" data-do="back">Quay lại</button>':'';
 const actions=state.view==='grid'?'<button type="button" class="atlas-nav-btn" data-do="search" aria-label="Tìm kiếm">'+icon('search')+'</button><button type="button" class="atlas-nav-btn" data-do="top-alerts" aria-label="Cảnh báo">'+icon('bell')+'</button>':
 state.view==='profile'?'<button type="button" class="atlas-nav-btn" data-do="timeline" aria-label="Dòng thời gian">'+icon('clock')+'</button><button type="button" class="atlas-nav-btn" data-do="search" aria-label="Tìm kiếm">'+icon('search')+'</button>':
 state.view==='activity'?'<button type="button" class="atlas-nav-btn" data-do="search" aria-label="Tìm kiếm">'+icon('search')+'</button>':'';
 document.getElementById('atlasNav').innerHTML='<div class="atlas-hleft">'+back+'</div><div class="atlas-title">'+esc(title())+'</div><div class="atlas-hright">'+actions+'</div>';
}
function tabBar(){
 document.getElementById('atlasTabs').innerHTML=[
 ['profiles','Hồ sơ','people'],['activity','Hoạt động','activity'],['alerts','Cảnh báo','bell'],['deleted','Đã xóa','trash']
 ].map(([id,label,g])=>'<button type="button" class="atlas-tab '+(state.tab===id?'active':'')+'" data-do="tab" data-id="'+id+'">'+icon(g)+'<span>'+label+'</span></button>').join('');
}
function showContent(markup){
 const main=document.getElementById('atlasMain');
 main.innerHTML='<div class="atlas-view active" id="atlasScroll">'+markup+'</div>';
 main.querySelector('#atlasScroll').scrollTop=0;
}
function countNew(p){return p.id==='luisa'?12:p.id==='lucas'?3:p.id==='brenda'?2:0;}
function grid(){
 const markup='<div class="atlas-strip"><strong>'+D.profiles.length+' hồ sơ</strong><span class="atlas-updated">Đồng bộ 08:54</span></div><div class="atlas-grid">'+D.profiles.map(p=>{
 let line='';
 if(p.id==='vanessa'||p.id==='leandro'||p.id==='guilherme')line='Hoạt động cuối '+p.last;
 else if(p.id==='brenda'||p.offline)line='Thiết bị ngoại tuyến';
 else if(countNew(p))line=countNew(p)+' mục mới';
 else line='Hoạt động '+p.last;
 return'<button type="button" class="atlas-person '+(p.offline?'stale':'')+'" data-do="profile" data-id="'+esc(p.id)+'">'+portrait(p)+'<span class="atlas-person-name">'+esc(p.short)+'</span><span class="atlas-person-status '+(!p.offline?'live':'')+'">'+esc(line)+'</span></button>';
 }).join('')+'</div>';
 return markup;
}
function sec(t){return'<div class="atlas-section-title">'+esc(t)+'</div>';}
function field(k,v,action,cmd){
 return (action?'<button type="button" class="atlas-field action" data-do="'+esc(cmd||'location')+'">':'<div class="atlas-field">')+
 '<span class="label">'+esc(k)+'</span><span class="value">'+esc(v||'Không có kết nối')+'</span>'+(action?'</button>':'</div>');
}
function profile(){
 const p=profileBy(state.profileId);if(!p)return'<div class="atlas-empty">Không tìm thấy hồ sơ.</div>';
 const head='<div class="atlas-profile-heading"><div class="atlas-profile-pic">'+portrait(p)+'</div><div><h2>'+esc(p.name)+'</h2><div class="atlas-code">'+esc(p.code)+'</div><div class="atlas-last">Hoạt động cuối: '+esc(p.last)+'</div></div></div>';
 const switcher='<div class="atlas-segment-wrap"><div class="atlas-segment"><button type="button" data-do="subtab" data-id="live" class="'+(state.subtab==='live'?'active':'')+'">TRỰC TIẾP</button><button type="button" data-do="subtab" data-id="archive" class="'+(state.subtab==='archive'?'active':'')+'">LƯU TRỮ</button></div></div>';
 return head+switcher+(state.subtab==='archive'?archive(p):live(p));
}
function live(p){
 const records=visibleRecords(p.id);
 if(p.removed)return sec('Trạng thái')+'<div class="atlas-fields">'+field('Ngày xóa',p.deletedAt)+field('Các mục còn lưu',records.length+' mục')+'</div><p class="atlas-note">Bản sao lưu tạm. Hồ sơ gốc không còn trong danh sách chính.</p>';
 const newest=records[0], cam=records.find(e=>e.kind==='camera');
 const net=p.network||'Ngoại tuyến';
 const current=(p.last.includes('/')?'Không hoạt động':'Trực tuyến lần cuối '+p.last);
 const rules=D.rules.find(r=>r.p===p.id);
 return sec('Thiết bị')+'<div class="atlas-fields">'+field('Trạng thái thiết bị',current)+field('Vị trí gần đây',p.place,p.last&&!p.last.includes('/'),'location')+field('Mạng gần nhất',net)+field('Đồng bộ gần nhất',p.sync+' · '+Math.min(4,records.length)+' mục')+'</div>'+
 sec('Ghi nhận')+'<div class="atlas-fields">'+(cam?field('Camera gần nhất',cam.location||p.camera,true,'latest-camera'):field('Camera gần nhất','Không có kết nối'))+
 field('Dữ liệu đang lưu',records.length+' mục',true,'archive')+'</div>'+
 sec('Cảnh báo đang bật')+'<div class="atlas-fields">'+(rules?rules.names.map(n=>field(n,'Bật')).join(''):field('Quy tắc','Không có'))+'</div>'+
 '<p class="atlas-note">Dữ liệu thiết bị được đồng bộ lần cuối: 29/08/2015. Các ghi nhận không được cập nhật ngoài mô phỏng.</p>';
}
function archive(p){
 const records=visibleRecords(p.id);
 const hidden=allRecords(p.id).length-records.length;
 const groups={};
 records.forEach(e=>{const y=e.date.slice(0,4),m=Number(e.date.slice(5,7));(groups[y]??={})[m]=(groups[y][m]||0)+1;});
 let out=sec('Lưu trữ · '+records.length+' mục');
 const pinned=records.filter(e=>e.pinned);
 if(pinned.length)out+='<button type="button" class="atlas-archive-action" data-do="pinned"><span>'+icon('file')+'</span><span>Đã lưu riêng<small>'+pinned.length+' mục được giữ lại</small></span><span class="atlas-chevron">›</span></button>';
 Object.keys(groups).sort((a,b)=>Number(b)-Number(a)).forEach(y=>{
 out+='<div class="atlas-year-head"><span>'+esc(y)+'</span><span>'+Object.values(groups[y]).reduce((s,n)=>s+n,0)+' mục</span></div>';
 Object.keys(groups[y]).map(Number).sort((a,b)=>b-a).forEach(m=>{
 out+='<button type="button" class="atlas-month" data-do="album" data-year="'+y+'" data-month="'+m+'"><span>'+monthName(m)+'</span><small>'+groups[y][m]+' mục <span class="atlas-chevron">›</span></small></button>';
 });
 });
 if(!records.length)out+='<div class="atlas-empty">Không có dữ liệu trong hồ sơ.</div>';
 if(!state.secondaryUnlocked&&hidden>0)out+='<button type="button" class="atlas-archive-action" data-do="secondary"><span>'+icon('lock')+'</span><span>Dữ liệu đầy đủ<small>Cần mã phụ để xem thêm mục đã lưu</small></span><span class="atlas-chevron">›</span></button>';
 if(state.secondaryUnlocked)out+='<div class="atlas-note">Dữ liệu đầy đủ đã được mở khóa.</div>';
 return out;
}
function album(){
 const p=profileBy(state.profileId);
 let records=visibleRecords(state.profileId);
 if(state.pinnedOnly)records=records.filter(e=>e.pinned);
 else records=records.filter(e=>Number(e.date.slice(0,4))===Number(state.year)&&Number(e.date.slice(5,7))===Number(state.month));
 const titleInfo=p?(p.short+' · '+(state.pinnedOnly?'Đã lưu riêng':monthName(state.month)+' '+state.year)):'';
 return'<div class="atlas-album-header"><span>'+esc(titleInfo)+'</span><span>'+records.length+' mục</span></div>'+
 (records.length?'<div class="atlas-album-grid">'+records.map(thumbnail).join('')+'</div>':'<div class="atlas-empty">Không có mục nào trong giai đoạn này.</div>');
}
function preview(e){
 if(e.kind==='document')return'<div class="atlas-preview-paper"><div class="paper-top">'+(e.source==='VH Archive'?'VH ARCHIVE':'DOCUMENTO · ARQUIVO')+'</div><div class="paper-name">'+esc(e.title)+'</div><div class="paper-line"></div><div class="paper-line short"></div><div class="paper-line"></div><div class="paper-line"></div><div class="paper-line short"></div><div class="paper-sign">/ /</div></div>';
 if(e.kind==='message'||e.kind==='mail')return'<div class="atlas-preview-message"><div class="msg-head">'+(e.kind==='mail'?'Correio · '+esc(e.title):'Conversa · '+esc(e.date.slice(0,10)))+'</div><div class="bubble">Mensagem arquivada.</div><div class="bubble right">Registro salvo.</div><div class="bubble">'+esc(e.title)+'</div></div>';
 if(e.kind==='map')return'<div class="atlas-preview-map"><span>'+esc(e.location||'Centro')+'</span></div>';
 if(e.kind==='audio')return'<div class="atlas-preview-audio">'+icon('audio')+'<div class="audio-wave"></div><p>Registro de áudio<br>Não há conexão com o arquivo original.</p></div>';
 if(e.kind==='camera'||e.kind==='video')return'<div class="atlas-preview-photo"><div class="cam-clock">CAM '+esc(e.date.slice(0,16))+'</div><div class="cam-place">'+esc(e.location||'Câmera de segurança')+'</div></div>';
 return'<div class="atlas-preview-photo"><div class="cam-clock">'+esc(e.title)+'</div><div class="cam-place">'+esc(e.source)+'</div></div>';
}
function meta(k,v){return'<div class="atlas-meta-row"><span class="k">'+esc(k)+'</span><span class="v">'+esc(v||'—')+'</span></div>';}
function itemView(){
 const e=allEntries.find(i=>i.id===state.recordId);
 if(!e)return'<div class="atlas-empty">Tệp không tồn tại.</div>';
 if(e.locked&&!state.secondaryUnlocked)return'<div class="atlas-empty">Cần mã phụ để mở dữ liệu này.</div>';
 const p=profileBy(e.p);
 return'<div class="atlas-viewer-preview">'+preview(e)+'</div>'+
 sec('Thông tin tệp')+'<div class="atlas-meta">'+
 meta('Tên tệp',e.title)+meta('Ngày ghi nhận',pretty(e.date))+meta('Nguồn',e.source)+
 (e.device?meta('Thiết bị',e.device):'')+
 (e.location?meta(e.source==='Camera'?'Camera':'Địa điểm',e.location):'')+
 (e.origin?meta('Mã gốc',e.origin):'')+
 meta('Đã lưu',pretty(e.saved))+
 meta(e.source==='VH Archive'?'Sao chép vào Atlas':'Hồ sơ',e.source==='VH Archive'?pretty(e.saved):(p?p.name:''))+
 (e.source==='VH Archive'?meta('Hồ sơ',p?p.name:''):'')+
 '</div>'+(e.caption?'<p class="atlas-note">'+esc(e.caption)+'</p>':'')+
 '<p class="atlas-note">Bản xem trước nội bộ · thông tin nguồn được giữ nguyên.</p>';
}
function location(){
 const p=profileBy(state.profileId);
 if(!p)return'<div class="atlas-empty">Không có dữ liệu.</div>';
 return sec('Địa điểm gần đây')+'<div class="atlas-viewer-preview"><div class="atlas-preview-map"><span>'+esc(p.place)+'</span></div></div><div class="atlas-meta">'+meta('Hồ sơ',p.name)+meta('Địa điểm',p.place)+meta('Ghi nhận',p.last)+meta('Nguồn','Thiết bị / Camera')+'</div>';
}
function timeline(){
 const p=profileBy(state.profileId);if(!p)return'';
 const rr=visibleRecords(p.id), groups={};
 rr.forEach(e=>{const y=e.date.slice(0,4);(groups[y]??=[]).push(e)});
 const years=Object.keys(groups).sort((a,b)=>a-b),max=Math.max(1,...Object.values(groups).map(r=>r.length));
 return'<div class="atlas-strip"><strong>'+esc(p.name)+'</strong><span>'+rr.length+' mục</span></div>'+
 '<div class="atlas-timeline-line">'+years.map(y=>{
 const ms={}, r=groups[y];r.forEach(e=>{const m=Number(e.date.slice(5,7));ms[m]=(ms[m]||0)+1;});
 return'<div class="atlas-timeline-yr"><strong>'+y+'</strong><small>'+r.length+' mục</small><div class="atlas-timeline-bar"><span style="width:'+Math.round(r.length/max*100)+'%"></span></div>'+
 Object.keys(ms).map(Number).sort((a,b)=>a-b).map(m=>'<button class="atlas-month" data-do="album" data-year="'+y+'" data-month="'+m+'"><span>'+monthName(m)+'</span><small>'+ms[m]+' mục ›</small></button>').join('')+'</div>';
 }).join('')+'</div><p class="atlas-note">Dòng thời gian được xếp theo thời điểm ghi nhận, không phải thời điểm tệp được nhập vào Atlas.</p>';
}
const types=[['all','Tất cả'],['device','Thiết bị'],['location','Vị trí'],['camera','Camera'],['sync','Đồng bộ']];
function activity(){
 const aa=state.filter==='all'?state.activity:state.activity.filter(e=>e.type===state.filter);
 return'<div class="atlas-filter-scroll">'+types.map(([id,n])=>'<button type="button" class="atlas-filter '+(state.filter===id?'active':'')+'" data-do="filter" data-id="'+id+'">'+n+'</button>').join('')+'</div><div class="atlas-feed-section">'+
 (aa.length?aa.map(e=>'<div class="atlas-feed"><time>'+esc(e.time)+'</time><p>'+esc(e.text)+'<small>'+esc(profileBy(e.p)?.name||'Atlas')+'</small></p></div>').join(''):'<div class="atlas-empty">Không có hoạt động trong bộ lọc này.</div>')+
 '</div>';
}
function alerts(){
 return'<div class="atlas-strip">Quy tắc đang được ghi nhận <span>'+D.rules.length+' hồ sơ</span></div>'+
 D.rules.map(r=>{const p=profileBy(r.p);
 return'<div class="atlas-rule"><button type="button" class="atlas-rule-name" data-do="profile" data-id="'+esc(r.p)+'">'+esc(p?.short||r.p)+' <span class="atlas-chevron">›</span></button>'+r.names.map(n=>'<div class="atlas-rule-item">'+esc(n)+'</div>').join('')+'</div>';
 }).join('')+'<p class="atlas-note">Quy tắc chỉ đọc. Các cảnh báo trong Atlas là sự kiện của kịch bản.</p>';
}
function deleted(){
 return'<div class="atlas-strip"><strong>'+D.deleted.length+' hồ sơ</strong><span>Kho tạm</span></div>'+
 D.deleted.map(p=>'<button class="atlas-deleted-row" type="button" data-do="profile" data-id="'+esc(p.id)+'"><div class="atlas-row-pic">'+portrait(p)+'</div><div><div class="atlas-name">'+esc(p.name)+'</div><div class="atlas-sub">Xóa '+esc(p.deletedAt)+' · '+allRecords(p.id).length+' mục còn lưu</div></div><span class="atlas-chevron">›</span></button>').join('')+
 '<p class="atlas-note">Chỉ lưu lại những mảnh dữ liệu còn tồn tại. Không có chức năng khôi phục lịch sử.</p>';
}
function matchResults(){
 const q=norm(state.q).trim();
 if(!q)return{people:[],items:[]};
 const people=D.profiles.concat(D.deleted).filter(p=>norm([p.name,p.short,p.code,p.last,p.place].join(' ')).includes(q));
 const items=allEntries.filter(e=>(state.secondaryUnlocked||!e.locked)&&norm([e.title,e.source,e.location,e.date,pretty(e.date),profileBy(e.p)?.name||'',e.origin,e.device].join(' ')).includes(q));
 return{people,items};
}
function resultBody(){
 const q=state.q.trim();if(!q)return'<div class="atlas-empty">Tìm theo tên, ngày, nguồn, địa điểm hoặc tên tệp.</div>';
 const {people,items}=matchResults(),personCount=new Set(items.map(e=>e.p)).size;
 let out='<div class="atlas-strip">'+items.length+' mục · '+personCount+' hồ sơ có tệp phù hợp</div>';
 if(state.searchScope!=='items'){
 out+='<div class="atlas-result-heading">Hồ sơ · '+people.length+'</div>';
 out+=people.length?people.map(p=>'<button class="atlas-row" data-do="profile" data-id="'+esc(p.id)+'"><div class="atlas-row-pic">'+portrait(p)+'</div><span class="atlas-row-main"><span class="atlas-row-title">'+esc(p.name)+'</span><span class="atlas-row-sub">'+esc(p.code)+' · '+allRecords(p.id).length+' mục đã lưu</span></span><span class="atlas-chevron">›</span></button>').join(''):'';
 }
 if(state.searchScope!=='people'){
 out+='<div class="atlas-result-heading">Tệp · '+items.length+'</div>';
 out+=items.slice(0,state.searchLimit).map(e=>{
 const p=profileBy(e.p);
 return'<button type="button" class="atlas-row" data-do="search-item" data-id="'+esc(e.id)+'"><span style="color:#7a90a0">'+sourceIcon(e)+'</span><span class="atlas-row-main"><span class="atlas-row-title">'+esc(e.title)+'</span><span class="atlas-row-sub">'+esc(p?.short||'')+' · '+esc(e.source)+' · '+pretty(e.date)+'</span></span><span class="atlas-chevron">›</span></button>';
 }).join('');
 if(items.length>state.searchLimit)out+='<button type="button" class="atlas-row" data-do="more"><span class="atlas-row-main" style="text-align:center;color:#607c90">Hiện thêm · còn '+(items.length-state.searchLimit)+' mục</span></button>';
 }
 if(!people.length&&!items.length)out+='<div class="atlas-empty">Không tìm thấy dữ liệu phù hợp.</div>';
 return out;
}
function search(){
 return'<div class="atlas-search-wrap"><span class="search-glass">'+icon('search')+'</span><input id="atlasSearchInput" class="atlas-search-input" type="search" spellcheck="false" autocomplete="off" placeholder="Tên, địa điểm, nguồn..." value="'+esc(state.q)+'" /></div>'+
 '<div class="atlas-filter-scroll">'+[['all','Tất cả'],['people','Hồ sơ'],['items','Tệp']].map(([v,n])=>'<button type="button" class="atlas-filter '+(state.searchScope===v?'active':'')+'" data-do="search-scope" data-id="'+v+'">'+n+'</button>').join('')+'</div><div id="atlasSearchResults">'+resultBody()+'</div>';
}
function render(){
 nav();tabBar();
 const views={grid,profile,album,item:itemView,location,timeline,activity,alerts,deleted,search};
 const func=views[state.view]||grid;
 showContent(func());
}
function navTo(view,data){
 trail.push({tab:state.tab,view:state.view,profileId:state.profileId,subtab:state.subtab,year:state.year,month:state.month,pinnedOnly:state.pinnedOnly,recordId:state.recordId,filter:state.filter,q:state.q,searchScope:state.searchScope});
 Object.assign(state,data||{});
 state.view=view;render();
}
function back(){
 if(state.secondaryOpen){dismissSecondary();return;}
 const prev=trail.pop();
 if(prev){Object.assign(state,prev);render();}
 else goTab('profiles');
}
function goTab(id){
 const views={profiles:'grid',activity:'activity',alerts:'alerts',deleted:'deleted'};
 if(!views[id])return;
 state.tab=id;state.view=views[id];trail.length=0;render();
}
function openRecord(e){const rec=allEntries.find(x=>x.id===e);if(!rec)return;
 if(rec.locked&&!state.secondaryUnlocked){secondaryDialog();return;}
 navTo('item',{recordId:e,profileId:rec.p});
}
function closeOtherApps(){
 screen.querySelectorAll(':scope > section[id$="App"]').forEach(el=>{if(el!==app)el.classList.remove('open')});
 ['voice-open','photos-open','phone-open','notes-open','messages-open','calendar-open','safari-open','mail-open','itau-open','itau-biz-open','facebook-open','whatsapp-open','goodreader-open'].forEach(x=>screen.classList.remove(x));
}
function authMarkup(which){
 const small=which==='secondary',input=small?state.secondary:state.auth;
 const dots='<div class="atlas-dots">'+[0,1,2,3].map(n=>'<i class="'+(input.length>n?'on':'')+'"></i>').join('')+'</div>';
 const keys='<div class="atlas-keypad">'+[1,2,3,4,5,6,7,8,9,'',0,'del'].map(v=>v===''?'<span class="atlas-key empty"></span>':'<button type="button" class="atlas-key '+(v==='del'?'del':'')+'" data-do="'+(small?'digit2':'digit')+'" data-key="'+v+'">'+(v==='del'?'Xóa':v)+'</button>').join('')+'</div>';
 return{dots,keys};
}
function authRender(){
 const el=document.getElementById('atlasAuth');if(!el)return;
 if(state.unlocked){el.classList.remove('active');el.innerHTML='';return;}
 const k=authMarkup('main');
 el.innerHTML='<div class="atlas-auth-body"><div class="atlas-auth-logo">ATLAS</div><div class="atlas-auth-caption">Mã truy cập</div><div id="atlasAuthDots">'+k.dots+'</div>'+k.keys+'<button type="button" class="atlas-auth-submit" data-do="unlock">Mở</button><div class="atlas-auth-error" id="atlasAuthError"></div><div class="atlas-sync-caption">Lần đồng bộ cuối: '+esc(D.config.sync)+'</div></div>';
 el.classList.add('active');
}
function authDigit(key,second){
 const prop=second?'secondary':'auth';
 if(key==='del')state[prop]=state[prop].slice(0,-1);
 else if(state[prop].length<4&&/^\d$/.test(key))state[prop]+=key;
 const target=document.getElementById(second?'atlasSecondaryDots':'atlasAuthDots');
 if(target)target.innerHTML=authMarkup(second?'secondary':'main').dots;
 const err=document.getElementById(second?'atlasSecondaryError':'atlasAuthError');
 if(err)err.textContent='';
}
function unlock(){
 if(state.auth===D.config.firstCode){state.unlocked=true;state.auth='';authRender();render();return;}
 const err=document.getElementById('atlasAuthError');if(err)err.textContent='Không thể mở dữ liệu.';
 state.auth='';document.getElementById('atlasAuthDots').innerHTML=authMarkup('main').dots;
}
function secondaryDialog(){
 if(state.secondaryUnlocked)return;
 state.secondaryOpen=true;state.secondary='';
 const k=authMarkup('secondary');
 document.getElementById('atlasLayer').innerHTML='<div class="atlas-overlay"><div class="atlas-dialog"><h3>Dữ liệu đầy đủ</h3><p>Mã phụ</p><div id="atlasSecondaryDots">'+k.dots+'</div>'+k.keys+'<div class="atlas-dialog-err" id="atlasSecondaryError"></div><div class="atlas-dialog-actions"><button data-do="secondary-cancel">Hủy</button><button data-do="secondary-open">Mở</button></div></div></div>';
}
function dismissSecondary(){state.secondaryOpen=false;state.secondary='';document.getElementById('atlasLayer').innerHTML='';}
function unlockSecondary(){
 if(state.secondary!==D.config.secondCode){state.secondary='';document.getElementById('atlasSecondaryDots').innerHTML=authMarkup('secondary').dots;document.getElementById('atlasSecondaryError').textContent='Không thể mở dữ liệu.';return;}
 state.secondaryUnlocked=true;try{localStorage.setItem('caua.atlas.2015.secondary.v1','1');}catch(e){}
 dismissSecondary();state.subtab='archive';if(state.view==='item'&&state.recordId){render();return;}state.view='profile';render();
}
let bootTimer=0,runTimer=0,bannerTimer=0,tick=0;
function boot(){
 clearTimeout(bootTimer);
 state.booting=true;
 const el=document.getElementById('atlasBoot');el.classList.add('active');
 bootTimer=setTimeout(()=>{el.classList.remove('active');state.booting=false;authRender();if(state.unlocked)render();},580);
}
function launch(){
 closeOtherApps();
 app.classList.add('open');screen.classList.add('atlas-open');
 if(!state.unlocked)boot();
 else render();
 if(!runTimer)runTimer=setInterval(simulate,84000);
}
function hide(){
 app.classList.remove('open');screen.classList.remove('atlas-open');
 const banner=document.getElementById('atlasBanner');if(banner)banner.classList.remove('show');
}
function noteEvent(raw){
 const p=profileBy(raw?.p||raw?.profileId);
 if(!p)return false;
 const kind=['device','location','camera','sync'].includes(raw.type)?raw.type:'sync';
 const minute=String((state.clockMinute++)%60).padStart(2,'0');
 const hour=String(8+Math.floor((state.clockMinute-53)/60)).padStart(2,'0');
 const ev={p:p.id,time:raw.time||hour+':'+minute,type:kind,text:String(raw.text||('Có hoạt động mới từ '+p.short+'.')).slice(0,200)};
 state.activity.unshift(ev);if(state.activity.length>120)state.activity.length=120;
 if(state.view==='activity'&&state.unlocked&&app.classList.contains('open'))render();
 if(state.unlocked&&app.classList.contains('open')&&!state.booting){
  const b=document.getElementById('atlasBanner');
  b.innerHTML='<strong>Atlas</strong><span>'+esc(ev.text)+'</span>';
  b.classList.add('show');clearTimeout(bannerTimer);
  bannerTimer=setTimeout(()=>b.classList.remove('show'),4400);
 }
 return true;
}
const simulated=[
 {p:'breno',type:'device',text:'Có hoạt động mới từ thiết bị của Breno.'},
 {p:'dudu',type:'location',text:'Eduardo Santos vừa tới A Casa.'},
 {p:'enzo',type:'sync',text:'1 mục mới đã được đồng bộ vào Enzo.'},
 {p:'brenda',type:'camera',text:'Camera A Casa ghi nhận hoạt động mới.'}
];
function simulate(){
 if(!state.unlocked)return;
 noteEvent(simulated[tick%simulated.length]);tick++;
}
app.addEventListener('click',event=>{
 const btn=event.target.closest('[data-do]');if(!btn||!app.contains(btn))return;
 const cmd=btn.dataset.do,id=btn.dataset.id;
 if(state.booting)return;
 if(cmd==='tab'){goTab(id);return;}
 if(cmd==='back'){back();return;}
 if(cmd==='profile'){navTo('profile',{profileId:id,subtab:'live'});return;}
 if(cmd==='subtab'){state.subtab=id;render();return;}
 if(cmd==='archive'){state.subtab='archive';render();return;}
 if(cmd==='album'){navTo('album',{year:Number(btn.dataset.year),month:Number(btn.dataset.month),pinnedOnly:false});return;}
 if(cmd==='pinned'){navTo('album',{pinnedOnly:true});return;}
 if(cmd==='item'||cmd==='search-item'){openRecord(id);return;}
 if(cmd==='timeline'){navTo('timeline');return;}
 if(cmd==='location'){navTo('location');return;}
 if(cmd==='latest-camera'){const f=visibleRecords(state.profileId).find(x=>x.kind==='camera');if(f)openRecord(f.id);return;}
 if(cmd==='filter'){state.filter=id;render();return;}
 if(cmd==='top-alerts'){goTab('alerts');return;}
 if(cmd==='search'){state.q='';state.searchLimit=60;state.searchScope='all';navTo('search');return;}
 if(cmd==='search-scope'){state.searchScope=id;document.getElementById('atlasSearchResults').innerHTML=resultBody();app.querySelectorAll('[data-do="search-scope"]').forEach(x=>x.classList.toggle('active',x.dataset.id===id));return;}
 if(cmd==='more'){state.searchLimit+=60;document.getElementById('atlasSearchResults').innerHTML=resultBody();return;}
 if(cmd==='secondary'){secondaryDialog();return;}
 if(cmd==='secondary-cancel'){dismissSecondary();return;}
 if(cmd==='secondary-open'){unlockSecondary();return;}
 if(cmd==='digit'||cmd==='digit2'){authDigit(btn.dataset.key,cmd==='digit2');return;}
 if(cmd==='unlock'){unlock();return;}
});
app.addEventListener('input',e=>{
 if(e.target.id==='atlasSearchInput'){
  state.q=e.target.value;state.searchLimit=60;
  const out=document.getElementById('atlasSearchResults');if(out)out.innerHTML=resultBody();
 }
});
app.addEventListener('keydown',e=>{
 if(!app.classList.contains('open'))return;
 const focused=e.target?.tagName;
 if((focused==='INPUT'||focused==='TEXTAREA')&&e.key!=='Escape')return;
 if(e.key==='Escape'){e.preventDefault();back();return;}
 const second=state.secondaryOpen;
 if(!state.unlocked||second){
  if(/^\d$/.test(e.key)){e.preventDefault();authDigit(e.key,second);}
  else if(e.key==='Backspace'){e.preventDefault();authDigit('del',second);}
  else if(e.key==='Enter'){e.preventDefault();second?unlockSecondary():unlock();}
 }
});
document.addEventListener('click',e=>{
 const l=e.target.closest('[data-app]');
 if(l&&l.dataset.app!=='atlas'&&app.classList.contains('open'))hide();
},true);
launcher.addEventListener('click',launch);
screen.addEventListener('caua:home-now',()=>{if(app.classList.contains('open'))hide();});
window.addEventListener('caua:atlas-event',event=>noteEvent(event.detail||{}));
shell.innerHTML='<header class="atlas-head" id="atlasNav"></header><main class="atlas-main" id="atlasMain"></main><footer class="atlas-tabs" id="atlasTabs"></footer><div class="atlas-auth" id="atlasAuth"></div><div class="atlas-layer" id="atlasLayer"></div><div class="atlas-boot" id="atlasBoot"><strong>ATLAS</strong><span>Đang kết nối...</span></div><button type="button" class="atlas-banner" id="atlasBanner" data-do="tab" data-id="activity" aria-label="Mở hoạt động"></button>';
authRender();render();
window.Atlas2015=Object.freeze({
 open:launch,
 pushEvent:noteEvent,
 showProfile:id=>{if(!profileBy(id)||!state.unlocked)return false;launch();navTo('profile',{profileId:id,subtab:'live'});return true;},
 getStatus:()=>({profiles:D.profiles.length,files:allEntries.length,locked:!state.unlocked,secondaryUnlocked:state.secondaryUnlocked})
});
})();