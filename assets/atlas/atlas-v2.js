(function(){
'use strict';
const data=window.AtlasData2015;
const app=document.getElementById('atlasApp');
const root=document.getElementById('atlasShell');
const launcher=document.querySelector('[data-app="atlas"]');
const screen=document.getElementById('screen');
if(!data||!app||!root||!launcher||!screen)return;
const CODE='1111';
const PREF='atlas.v2.preferences',LOCAL='atlas.v2.imports',PINNED='atlas.v2.pins',RECENTS='atlas.v2.recents',DEEP='atlas.v2.access';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const normal=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return v??fallback;}catch(e){return fallback;}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(e){return false;}};
let prefs=Object.assign({compact:false,sourceBadges:true,alphabetic:false,grid:false},read(PREF,{}));
let imports=read(LOCAL,[]);if(!Array.isArray(imports))imports=[];
let pins=read(PINNED,{});if(!pins||typeof pins!=='object')pins={};
let recent=read(RECENTS,['breno','vanessa','leandro']);if(!Array.isArray(recent))recent=['breno','vanessa','leandro'];
let deep=read(DEEP,false)===true;
const state={unlocked:false,code:'',codeError:'',route:'home',tab:'home',profile:'breno',personTab:'overview',year:2015,month:8,source:'Tất cả',peopleFilter:'all',query:'',viewerId:'',viewerIds:[],meta:false,secondary:false,secondaryCode:'',secondaryError:'',fileType:'all',toast:''};
let stack=[],toastTimer=0,scrollTimer=0,scrollIgnore=false,objectUrls=new Map(),database=null;
const people=[...data.profiles,...data.deleted];
const person=id=>people.find(p=>p.id===id);
const allRecords=()=>data.entries.concat(imports).filter(e=>!e.deleted);
const permitted=e=>!!e&&!e.deleted&&(deep||!e.locked);
const records=id=>allRecords().filter(e=>e.p===id&&permitted(e)).sort((a,b)=>b.date.localeCompare(a.date));
const rawRecords=id=>allRecords().filter(e=>e.p===id);
const formatDate=s=>{const t=String(s??'').split(' '),a=t[0].split('-');return a.length===3?a[2]+'/'+a[1]+'/'+a[0]+(t[1]?' · '+t[1]:''):s};
const yearOf=e=>Number(e.date.slice(0,4)),monthOf=e=>Number(e.date.slice(5,7));
const month=n=>['','Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'][Number(n)]||'';
const storedCount=id=>rawRecords(id).length;
const sourceList=['Tất cả','Camera','Thiết bị','Tin nhắn','Facebook','VH Archive','Nhập từ máy tính','Đã lưu từ web'];
const icons={
back:'<path d="m15 19-7-7 7-7"/>',
search:'<circle cx="10.7" cy="10.7" r="6.5"/><path d="m15.6 15.6 5.4 5.4"/>',
settings:'<circle cx="12" cy="12" r="3"/><path d="M10 2h4l.5 3 2.1 1 2.5-1.1 2 3.4-2.3 2 .1 3 2.2 2-2 3.4-2.6-1.1-2.1 1-.5 3h-4l-.5-3-2.1-1-2.6 1.1-2-3.4 2.2-2 .1-3-2.3-2 2-3.4L7.5 6l2.1-1z"/>',
more:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
person:'<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
users:'<circle cx="9" cy="8" r="3.4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2"/><path d="M17 5a3 3 0 0 1 0 6m2 3c2 1 3 3 3 5v2"/>',
archive:'<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v12h14V9M9 13h6"/>',
file:'<path d="M6 2h8l5 5v15H6zM14 2v6h5M9 13h7M9 17h7"/>',
camera:'<path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/>',
image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m4 18 6-6 4 4 3-3 4 4"/>',
chat:'<path d="M3 4h18v13H8l-5 4z"/><path d="M7 9h10M7 13h6"/>',
audio:'<path d="M3 10v5M7 5v14M11 2v20M15 6v12M19 9v7"/>',
map:'<path d="m3 4 6-2 6 3 6-3v18l-6 2-6-3-6 3zM9 2v17M15 5v17"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
lock:'<rect x="5" y="11" width="14" height="11" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
plus:'<path d="M12 4v16M4 12h16"/>',
grid:'<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
list:'<path d="M8 5h13M8 12h13M8 19h13M3 5h.1M3 12h.1M3 19h.1"/>',
filter:'<path d="M4 7h16M7 12h10M10 17h4"/>',
chevron:'<path d="m9 5 7 7-7 7"/>',
info:'<circle cx="12" cy="12" r="10"/><path d="M12 10v7M12 6.5v.5"/>',
pin:'<path d="m9 3 6 6-1 3 4 4-2 2-4-4-3 1-6-6zM10 14l-7 7"/>',
trash:'<path d="M4 6h16M9 6V4h6v2M6 8l1 13h10l1-13M10 11v7M14 11v7"/>',
upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6"/>',
download:'<path d="M12 3v14m-5-5 5 5 5-5M4 18v3h16v-3"/>',
eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
check:'<path d="m4 12 5 5L20 5"/>',
x:'<path d="M5 5l14 14M19 5 5 19"/>',
arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>'
};
function icon(name,size=19){return'<svg viewBox="0 0 24 24" width="'+size+'" height="'+size+'" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(icons[name]||icons.file)+'</svg>';}
function initials(p){return String(p.short||p.name||'?').split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase();}
function avatar(p,cls=''){
 if(!p)return'<span class="a10-avatar '+cls+'">?</span>';
 let inner=esc(initials(p));
 if(p.portrait)inner+='<img loading="lazy" src="./'+esc(p.portrait)+'" alt="" />';
 else if(p.sprite){
 const i=p.sprite-1,group=i>=25?2:1,cell=i%25,c=cell%5,r=Math.floor(cell/5);
 inner+='<span class="a10-sprite" style="background-image:url(./assets/facebook/avatars/batch'+group+'-sprite.jpg);background-size:500% 500%;background-position:'+(c*25)+'% '+(r*25)+'%"></span>';
 }
 return'<span class="a10-avatar '+cls+'">'+inner+'</span>';
}
function kind(e){if(e.local&&e.kind==='photo')return'image';if(e.kind==='camera'||e.kind==='video')return'camera';if(e.kind==='message'||e.kind==='mail')return'chat';if(e.kind==='map')return'map';if(e.kind==='audio')return'audio';if(e.kind==='document')return'paper';return'image';}
function iconKind(e){return({camera:'camera',chat:'chat',map:'map',audio:'audio',paper:'file',image:'image'})[kind(e)]||'file';}
function preview(e){const k=kind(e);return'<span class="a10-preview '+k+'">'+(k==='paper'?'<span class="a10-evidence-file"></span>':'')+(e.local&&k==='image'?'<img class="a10-upload-image" data-atlas-thumb="'+esc(e.id)+'" alt=""/>':'')+'</span>';}
function togglePin(e){const val=!isPinned(e);pins[e.id]=val;write(PINNED,pins);render();toast(val?'Đã lưu riêng.':'Đã bỏ lưu riêng.');}
function isPinned(e){return Object.prototype.hasOwnProperty.call(pins,e.id)?pins[e.id]:!!e.pinned;}
function recentUpdate(id){recent=[id,...recent.filter(x=>x!==id)].slice(0,7);write(RECENTS,recent);}
function mainTags(){return [['home','Hồ sơ','users'],['archive','Lưu trữ','archive'],['search','Tìm kiếm','search'],['more','Thêm','more']].map(([id,label,ic])=>'<button type="button" class="a10-tab '+(state.tab===id?'active':'')+'" data-atlas="tab" data-id="'+id+'">'+icon(ic,20)+'<span>'+label+'</span></button>').join('');}
const titles={home:'Atlas',archive:'Lưu trữ',search:'Tìm kiếm',more:'Thêm',profile:'Hồ sơ',album:'Lưu trữ',viewer:'Tệp đã lưu',timeline:'Dòng thời gian',deleted:'Đã xóa',settings:'Cài đặt',account:'Tài khoản',upload:'Nhập tệp',local:'Tệp đã nhập'};
function nav(){
 const child=!['home','archive','search','more'].includes(state.route);
 return '<div class="a10-navbar">'+(child?'<button type="button" class="a10-nav-back" data-atlas="back">'+icon('back',16)+'Trở lại</button>':'')+
 '<span class="a10-brand '+(child?'small':'')+'">'+esc(titles[state.route]||'Atlas')+'</span>'+
 (child?'<span class="a10-nav-spacer"></span>':'<button type="button" class="a10-icon-btn" data-atlas="account" aria-label="Tài khoản">'+icon('person',21)+'</button>')+'</div>';
}
function searchbar(){
 if(!['home','search'].includes(state.route))return'';
 return'<div class="a10-search-sticky"><div class="a10-searchbox">'+icon('search',17)+
 '<input id="a10Search" class="a10-search-input" type="search" autocomplete="off" spellcheck="false" placeholder="Tìm người, tệp, địa điểm..." value="'+esc(state.query)+'" />'+
 (state.query?'<button type="button" class="a10-clear" data-atlas="clear-search" aria-label="Xóa tìm kiếm">'+icon('x',16)+'</button>':'')+'</div></div>';
}
function feature(id){
 const p=person(id);if(!p)return'';
 const rec=records(p.id),show=rec.slice(0,3);
 return'<button type="button" class="a10-feature" data-atlas="profile" data-id="'+esc(p.id)+'">'+
 '<span class="a10-feature-top">'+avatar(p)+'<span class="a10-person-text"><span class="a10-person-name">'+esc(p.name)+'</span><span class="a10-person-info">'+esc(p.code)+' · '+(p.last.includes('/')?'Lần cuối '+esc(p.last):'Ghi nhận '+esc(p.last))+'</span></span><span class="a10-feature-arrow">'+icon('chevron',15)+'</span></span>'+
 '<span class="a10-preview-triplet">'+(show.length?show.map(preview).join(''):'<span class="a10-preview paper"></span>').repeat(show.length?1:3)+'</span>'+
 '<span class="a10-compact-footer"><span>'+new Set(rec.map(e=>e.source)).size+' nguồn lưu trữ</span><span class="a10-accent-count">'+rec.length+' mục</span></span></button>';
}
function filterPeople(){
 let set=data.profiles.slice();
 if(state.peopleFilter==='history')set=set.filter(p=>p.last.includes('/'));
 if(state.peopleFilter==='docs')set=set.filter(p=>records(p.id).some(e=>e.kind==='document'));
 if(prefs.alphabetic)set.sort((a,b)=>normal(a.short).localeCompare(normal(b.short),'vi'));
 return set;
}
function row(p){
 const r=records(p.id),date=p.last.includes('/')?'Lần cuối '+p.last:'Lưu đến 29/08/2015 · '+p.last;
 return'<button type="button" class="a10-person-row" style="'+(prefs.compact?'min-height:45px;padding:6px 13px':'')+'" data-atlas="profile" data-id="'+esc(p.id)+'">'+avatar(p,'small')+
 '<span class="a10-person-text"><span class="a10-person-name">'+esc(p.short)+'</span><span class="a10-person-info">'+esc(date)+'</span></span><span class="a10-row-count">'+r.length+' mục</span><span class="a10-chevron">›</span></button>';
}
function tilePerson(p){
 return'<button type="button" class="a10-grid-tile" data-atlas="profile" data-id="'+esc(p.id)+'">'+avatar(p)+'<span class="a10-name">'+esc(p.short)+'</span><small>'+records(p.id).length+' mục</small></button>';
}
function home(){
 const set=filterPeople();const seen=recent.filter(id=>person(id)&&!person(id).removed).slice(0,5);
 return'<div class="a10-section"><h2>Hồ sơ gần đây</h2><small>Vuốt để xem</small></div>'+
 '<div class="a10-carousel">'+seen.map(feature).join('')+'</div>'+
 '<div class="a10-section"><h2>Tất cả hồ sơ</h2><button type="button" class="a10-mini-btn" data-atlas="grid-toggle">'+icon(prefs.grid?'list':'grid',16)+'</button></div>'+
 '<div class="a10-chipbar">'+[['all','Tất cả'],['docs','Có tài liệu'],['history','Lịch sử']].map(([id,s])=>'<button type="button" class="a10-chip '+(state.peopleFilter===id?'active':'')+'" data-atlas="people-filter" data-id="'+id+'">'+s+'</button>').join('')+'</div>'+
 '<div class="a10-sortline"><span>'+set.length+' hồ sơ</span><button type="button" data-atlas="sort-people">'+(prefs.alphabetic?'A → Z':'Thứ tự lưu')+' '+icon('filter',13)+'</button></div>'+
 (prefs.grid?'<div class="a10-grid">'+set.map(tilePerson).join('')+'</div>':'<div class="a10-list">'+set.map(row).join('')+'</div>')+
 '<div class="a10-muted">Dữ liệu được lưu trong kho Atlas.</div>';
}
function section(name,right=''){return'<div class="a10-section"><h2>'+esc(name)+'</h2>'+right+'</div>';}
function smallRow(name,sub,ic,action,id=''){
 return'<button type="button" class="a10-row" data-atlas="'+esc(action)+'" data-id="'+esc(id)+'"><span class="a10-row-icon">'+icon(ic,17)+'</span><span class="a10-row-text"><span class="a10-row-title">'+esc(name)+'</span>'+(sub?'<span class="a10-row-sub">'+esc(sub)+'</span>':'')+'</span><span class="a10-chevron">›</span></button>';
}
function sourceCounts(rec){const o={};rec.forEach(e=>o[e.source]=(o[e.source]||0)+1);return o;}
function mediaTiles(rec){
 return'<div class="a10-media-grid">'+rec.map(e=>'<button type="button" class="a10-media-tile" data-atlas="item" data-id="'+esc(e.id)+'" title="'+esc(e.title)+'">'+preview(e)+(prefs.sourceBadges?'<span class="a10-source-dot">'+icon(iconKind(e),12)+'</span>':'')+'</button>').join('')+'</div>';
}
function profile(){
 const p=person(state.profile);if(!p)return'<div class="a10-empty">Hồ sơ không tồn tại.</div>';
 const rr=records(p.id),full=rawRecords(p.id),count=sourceCounts(rr);
 let body='<div class="a10-profile-hero">'+avatar(p,'big')+'<div><h1>'+esc(p.name)+'</h1><div class="a10-person-info">'+esc(p.code)+'</div><div class="a10-profile-last">Hoạt động cuối: '+esc(p.last)+'</div></div></div>';
 body+='<div class="a10-prof-tabs">'+[['overview','Tổng quan'],['files','Lưu trữ'],['time','Dòng thời gian']].map(([id,t])=>'<button type="button" class="a10-prof-tab '+(state.personTab===id?'active':'')+'" data-atlas="person-tab" data-id="'+id+'">'+t+'</button>').join('')+'</div>';
 if(state.personTab==='overview'){
 body+='<div class="a10-stat-row"><div class="a10-stat"><b>'+rr.length+'</b><span>Mục đã lưu</span></div><div class="a10-stat"><b>'+Object.keys(count).length+'</b><span>Nguồn</span></div><div class="a10-stat"><b>'+Object.keys(byYear(rr)).length+'</b><span>Năm</span></div></div>';
 const pinned=rr.filter(isPinned).slice(0,5);
 if(pinned.length){body+=section('Đã lưu riêng','<button class="a10-mini-btn" data-atlas="pinned">Xem tất cả ›</button>')+mediaTiles(pinned);}
 body+=section('Gần đây','<button class="a10-mini-btn" data-atlas="person-tab" data-id="files">Tất cả ›</button>')+mediaTiles(rr.slice(0,9));
 body+=section('Theo nguồn')+'<div class="a10-block">'+Object.entries(count).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([src,n])=>smallRow(src,n+' mục',src==='Camera'?'camera':'archive','source-profile',src)).join('')+'</div>';
 if(full.length>rr.length&&!deep)body+='<div class="a10-block">'+smallRow('Dữ liệu đầy đủ','Cần mã phụ để mở', 'lock','second')+'</div>';
 if(deep)body+='<p class="a10-muted">Dữ liệu đầy đủ đã mở.</p>';
 }else if(state.personTab==='files'){
 const groups=byYear(rr);
 body+=section('Lưu trữ theo thời gian',rr.length+' mục');
 for(const y of Object.keys(groups).sort((a,b)=>b-a)){
 body+='<div class="a10-year-heading"><span>'+y+'</span><span>'+groups[y].length+' mục</span></div>';
 const months={};groups[y].forEach(e=>{const m=monthOf(e);months[m]=(months[m]||0)+1;});
 for(const m of Object.keys(months).map(Number).sort((a,b)=>b-a))body+='<button class="a10-month-row" data-atlas="album" data-year="'+y+'" data-month="'+m+'"><span>'+month(m)+'</span><small>'+months[m]+' mục</small><span class="a10-chevron">›</span></button>';
 }
 if(full.length>rr.length&&!deep)body+='<div class="a10-block">'+smallRow('Dữ liệu đầy đủ','Nhập mã phụ', 'lock','second')+'</div>';
 }else{
 body+section('Dòng thời gian','<span style="font-size:10px;color:#94939a">'+rr.length+' mục</span>')+'<div class="a10-timeline">';
 const years=byYear(rr),max=Math.max(1,...Object.values(years).map(v=>v.length));
 for(const y of Object.keys(years).sort((a,b)=>a-b)){
 const months={};years[y].forEach(e=>months[monthOf(e)]=(months[monthOf(e)]||0)+1);
 body+='<div class="a10-time-year"><strong>'+y+'</strong><small>'+years[y].length+' mục</small><div class="a10-time-bar"><span style="width:'+Math.round(years[y].length/max*100)+'%"></span></div>';
 for(const m of Object.keys(months).map(Number).sort((a,b)=>a-b))body+='<button class="a10-month-row" data-atlas="album" data-year="'+y+'" data-month="'+m+'"><span>'+month(m)+'</span><small>'+months[m]+' mục</small></button>';
 body+='</div>';
 }
 body+='</div>';
 }
 return body;
}
function byYear(rec){const o={};rec.forEach(e=>(o[yearOf(e)]??=[]).push(e));return o;}
function album(){
 const p=person(state.profile);const rr=records(state.profile).filter(e=>yearOf(e)===state.year&&monthOf(e)===state.month);
 return section(month(state.month)+' '+state.year,'<span style="font-size:10px;color:#999">'+rr.length+' mục</span>')+
 '<div class="a10-muted">'+esc(p?.name||'')+'</div>'+mediaTiles(rr)+(!rr.length?'<div class="a10-empty">Không có tệp trong tháng này.</div>':'');
}
function archive(){
 const rr=allRecords().filter(permitted).sort((a,b)=>b.date.localeCompare(a.date));
 const sources=sourceCounts(rr);
 const selected=state.source==='Tất cả'?rr:rr.filter(e=>e.source===state.source);
 return section('Nguồn lưu trữ', '<small>'+rr.length+' mục</small>')+
 '<div class="a10-chipbar">'+sourceList.map(src=>'<button type="button" class="a10-chip '+(state.source===src?'active':'')+'" data-atlas="source" data-id="'+esc(src)+'">'+esc(src)+(sources[src]?' · '+sources[src]:'')+'</button>').join('')+'</div>'+
 section(state.source==='Tất cả'?'Tệp đã lưu':state.source,'<small>'+selected.length+' mục</small>')+
 mediaTiles(selected.slice(0,99))+(selected.length>99?'<div class="a10-muted">Đang hiển thị 99 mục gần nhất. Dùng tìm kiếm để tìm các tệp cũ hơn.</div>':'');
}
function searchResults(){
 const q=normal(state.query).trim();
 if(!q)return'<div class="a10-empty">'+icon('search',26)+'<p>Tìm theo tên người, nguồn, ngày, địa điểm hoặc tên tệp.</p></div>';
 const ps=people.filter(p=>normal([p.name,p.short,p.code,p.last,p.place].join(' ')).includes(q));
 const rr=allRecords().filter(e=>permitted(e)&&normal([e.title,e.source,e.location,e.date,formatDate(e.date),person(e.p)?.name||'',e.origin||''].join(' ')).includes(q)).sort((a,b)=>b.date.localeCompare(a.date));
 return section('Hồ sơ','<small>'+ps.length+'</small>')+
 (ps.length?'<div class="a10-list">'+ps.slice(0,20).map(row).join('')+'</div>':'')+
 section('Tệp đã lưu','<small>'+rr.length+' mục</small>')+
 (rr.length?'<div class="a10-block">'+rr.slice(0,80).map(e=>smallRow(e.title,(person(e.p)?.short||'')+' · '+e.source+' · '+formatDate(e.date),iconKind(e),'item',e.id)).join('')+'</div>':'')+
 (!ps.length&&!rr.length?'<div class="a10-empty">Không tìm thấy dữ liệu phù hợp.</div>':'');
}
function account(){
 return'<div class="a10-personal">'+avatar({name:'Cauã',short:'Cauã'},'big')+'<div><div class="a10-personal-name">Cauã</div><div class="a10-personal-sub">Tài khoản cục bộ · A01</div></div></div>'+
 section('Thư viện')+'<div class="a10-block">'+
 smallRow('Hồ sơ',data.profiles.length+' người','users','tab','home')+
 smallRow('Tệp đã lưu',data.entries.length+' mục gốc','archive','tab','archive')+
 smallRow('Tệp nhập từ thiết bị',imports.filter(e=>!e.deleted).length+' mục','upload','local')+'</div>'+
 section('Thiết bị')+'<div class="a10-block">'+smallRow('iPhone','Atlas · Kho dữ liệu trên thiết bị','person','settings')+'</div>';
}
function more(){
 return'<div class="a10-personal">'+avatar({name:'Cauã',short:'Cauã'},'big')+'<div><div class="a10-personal-name">Cauã</div><div class="a10-personal-sub">Administrador · A01</div></div><span class="a10-chevron">›</span></div>'+
 section('Quản lý')+'<div class="a10-block">'+
 smallRow('Nhập tệp','Ảnh, PDF, video hoặc âm thanh từ thiết bị','upload','upload')+
 smallRow('Tệp đã nhập',imports.filter(e=>!e.deleted).length+' tệp trên thiết bị','file','local')+
 smallRow('Đã xóa',data.deleted.length+' hồ sơ lưu tạm','trash','deleted')+
 smallRow('Tài khoản','Cauã · Hồ sơ nội bộ','person','account')+
 smallRow('Cài đặt','Hiển thị, sắp xếp và dữ liệu','settings','settings')+'</div>'+
 '<div class="a10-muted">Atlas lưu hồ sơ, tài liệu và lịch sử từ các nguồn đã được nhập. Không có kết nối mạng.</div>';
}
function settings(){
 const sw=(key,label,sub)=>'<button type="button" class="a10-setting" data-atlas="pref" data-id="'+key+'"><span>'+label+'<small>'+sub+'</small></span><span class="a10-switch '+(prefs[key]?'on':'')+'"></span></button>';
 return section('Hiển thị')+'<div class="a10-block">'+
 sw('grid','Lưới hồ sơ','Sử dụng ảnh đại diện trong danh sách')+
 sw('compact','Danh sách thu gọn','Thu khoảng cách giữa các hàng')+
 sw('sourceBadges','Biểu tượng nguồn','Hiện nguồn trên ảnh xem trước')+
 sw('alphabetic','Sắp xếp A – Z','Xếp hồ sơ theo tên')+'</div>'+
 section('Bảo mật')+'<div class="a10-block">'+smallRow('Khóa lại Atlas','Yêu cầu mã truy cập khi mở lại','lock','relock')+
 smallRow('Quyền xem đầy đủ',deep?'Đã mở':'Yêu cầu mã phụ','lock','second')+'</div>'+
 '<div class="a10-muted">Mã truy cập hiện tại: 4 chữ số. Bộ nhớ của các tệp nhập chỉ tồn tại trong trình duyệt này.</div>';
}
function deleted(){
 const dead=data.deleted;
 const removed=imports.filter(e=>e.deleted);
 return section('Hồ sơ đã xóa','<small>'+dead.length+' hồ sơ</small>')+
 '<div class="a10-list">'+dead.map(p=>'<button class="a10-person-row" data-atlas="profile" data-id="'+p.id+'">'+avatar(p,'small')+'<span class="a10-person-text"><span class="a10-person-name">'+esc(p.name)+'</span><span class="a10-person-info">Xóa '+esc(p.deletedAt)+' · '+storedCount(p.id)+' mảnh còn lưu</span></span><span class="a10-chevron">›</span></button>').join('')+'</div>'+
 section('Tệp đã xóa từ thiết bị','<small>'+removed.length+' mục</small>')+
 (removed.length?'<div class="a10-block">'+removed.map(e=>smallRow(e.title,'Đã xóa · '+e.source,'trash','restore',e.id)).join('')+'</div>':'<p class="a10-muted">Không có tệp cá nhân đã xóa.</p>');
}
function localFiles(){
 const rr=imports.filter(e=>!e.deleted);
 return section('Tệp đã nhập','<button class="a10-mini-btn" data-atlas="upload">+ Nhập mới</button>')+
 (rr.length?'<div class="a10-block">'+rr.map(e=>smallRow(e.title,(person(e.p)?.name||'')+' · '+e.source,iconKind(e),'item',e.id)).join('')+'</div>':'<div class="a10-empty">Chưa có tệp nào được nhập từ thiết bị.</div>');
}
function upload(){
 return'<div class="a10-form"><p style="font-size:12px;color:#78747b;line-height:18px">Tệp được lưu trong trình duyệt này và gắn vào hồ sơ đã chọn.</p>'+
 '<label for="a10UploadInput">Chọn tệp</label><input id="a10UploadInput" type="file" accept="image/*,audio/*,video/*,.pdf,.txt,.doc,.docx" />'+
 '<label for="a10UploadPerson">Hồ sơ</label><select id="a10UploadPerson">'+data.profiles.map(p=>'<option value="'+esc(p.id)+'" '+(state.profile===p.id?'selected':'')+'>'+esc(p.name)+'</option>').join('')+'</select>'+
 '<label for="a10UploadSource">Nguồn</label><select id="a10UploadSource">'+['Nhập từ máy tính','Thiết bị','Camera','Tin nhắn','VH Archive','Facebook','Đã lưu từ web'].map(src=>'<option>'+src+'</option>').join('')+'</select>'+
 '<label for="a10UploadDate">Ngày ghi nhận</label><input id="a10UploadDate" type="datetime-local" value="2015-08-29T08:54" />'+
 '<label for="a10UploadPlace">Địa điểm (không bắt buộc)</label><input id="a10UploadPlace" maxlength="100" placeholder="Tên địa điểm" />'+
 '<button type="button" class="a10-primary" data-atlas="submit-upload">Lưu vào hồ sơ</button></div>';
}
function info(k,v){return'<div class="a10-meta-line"><span class="key">'+esc(k)+'</span><span class="value">'+esc(v||'—')+'</span></div>';}
function stageFor(e){
 if(!e)return'<div class="a10-slide"><div class="a10-empty">Không có dữ liệu.</div></div>';
 let inner='';
 if(e.local){
 inner='<div class="a10-full-art"><div data-atlas-file="'+esc(e.id)+'" style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;padding:12px;color:#7e727b">'+icon(iconKind(e),40)+'</div></div>';
 }else if(e.kind==='document'){
 inner='<div class="a10-full-paper"><div style="font-size:9px;color:#777;text-align:center;letter-spacing:1px">'+esc(e.source)+'</div><div class="a10-paper-title">'+esc(e.title)+'</div><div class="a10-paper-lines"></div><div style="font-size:10px;color:#aaa;text-align:right">'+formatDate(e.date)+'</div></div>';
 }else if(['message','mail'].includes(e.kind)){
 inner='<div class="a10-full-message"><div style="text-align:center;color:#889;font-size:12px;padding-bottom:8px;border-bottom:1px solid #c9ccc5">'+esc(e.source)+'</div><div class="a10-bubble">'+esc(e.title)+'</div><div class="a10-bubble out">'+esc(formatDate(e.date))+'</div><div class="a10-bubble">Registro salvo.</div></div>';
 }else if(e.kind==='map'){
 inner='<div class="a10-full-map"><span style="position:absolute;left:10px;bottom:10px;color:#627470;background:#fff;padding:6px">'+esc(e.location||'Centro')+'</span></div>';
 }else if(e.kind==='audio'){
 inner='<div class="a10-full-audio">'+icon('audio',42)+'<p>'+esc(e.title)+'</p><small>Không có tệp âm thanh gốc.</small></div>';
 }else inner='<div class="a10-full-art">'+preview(e)+'<span style="position:absolute;bottom:12px;left:12px;background:#1b1b1c9c;color:#fff;font-size:10px;padding:5px 7px;border-radius:4px">'+esc(e.source)+' · '+esc(e.title)+'</span></div>';
 return'<div class="a10-slide">'+inner+'</div>';
}
function viewer(){
 const rr=state.viewerIds.map(id=>allRecords().find(e=>e.id===id)).filter(permitted);
 let at=rr.findIndex(e=>e.id===state.viewerId);
 if(at<0){const e=allRecords().find(e=>e.id===state.viewerId);if(!permitted(e))return'<div class="a10-empty">Không thể mở tệp.</div>';rr.push(e);at=rr.length-1;}
 const e=rr[at],p=person(e.p);
 const slides=[rr[at-1]||e,e,rr[at+1]||e];
 let html='<div class="a10-viewer"><div class="a10-viewer-stage" id="a10Stage">'+slides.map(stageFor).join('')+'</div>'+
 '<div class="a10-viewer-tools">'+
 '<button type="button" class="a10-tool" data-atlas="prev">'+icon('back')+' Trước</button>'+
 '<button type="button" class="a10-tool" data-atlas="pin">'+icon('pin')+(isPinned(e)?' Bỏ ghim':' Lưu riêng')+'</button>'+
 '<button type="button" class="a10-tool" data-atlas="next">Sau '+icon('chevron')+'</button>'+
 '</div><div class="a10-meta-sheet"><button type="button" class="a10-meta-handle" data-atlas="meta">'+icon('info',14)+' '+(state.meta?'Thu gọn':'Chi tiết tệp')+'</button>';
 if(state.meta){
 html+=info('Tên tệp',e.title)+info('Ghi nhận',formatDate(e.date))+info('Nguồn',e.source)+info('Hồ sơ',p?.name)+
 (e.location?info('Địa điểm',e.location):'')+(e.device?info('Thiết bị',e.device):'')+
 (e.origin?info('Mã gốc',e.origin):'')+info('Đã lưu',formatDate(e.saved))+
 (e.local?'<button class="a10-setting" data-atlas="delete-local"><span>Xóa tệp đã nhập</span><span style="color:#9d344e">'+icon('trash',17)+'</span></button>':'');
 }
 return html+'</div></div>';
}
function messageOnly(){return'<div class="a10-empty">Không có dữ liệu.</div>';}
function body(){
 if(['home','search'].includes(state.route)&&state.query)return searchResults();
 return({home,profile,album,archive,search:searchResults,more,settings,deleted,local:localFiles,upload,account,viewer})[state.route]?.()||messageOnly();
}
function render(){
 if(!state.unlocked){renderLock();return;}
 const full=state.route==='viewer'||state.route==='upload';
 root.innerHTML='<div class="a10-root">'+nav()+searchbar()+
 '<main class="a10-content" id="a10Content" '+(state.route==='viewer'?'style="overflow:hidden"':'')+'>'+body()+'</main>'+
 (!full?'<nav class="a10-tabbar">'+mainTags()+'</nav>':'')+
 '<div id="a10Floating"></div><div id="a10Modal"></div></div>';
 if(state.route==='viewer')viewerInit();
 fillPreviews();
}
function searchRepaint(){
 const content=document.getElementById('a10Content');if(content){content.innerHTML=body();fillPreviews();}
 const clear=root.querySelector('.a10-clear');if(clear)clear.style.display=state.query?'':'none';
}
function navigate(route,patch={}){
 stack.push({route:state.route,tab:state.tab,profile:state.profile,personTab:state.personTab,year:state.year,month:state.month,viewerId:state.viewerId,viewerIds:state.viewerIds,query:state.query});
 Object.assign(state,patch,{route});render();
}
function back(){
 if(state.secondary){state.secondary=false;drawModal();return;}
 const old=stack.pop();
 if(old){Object.assign(state,old);render();}
 else tab('home');
}
function tab(id){
 if(!['home','archive','search','more'].includes(id))return;
 state.tab=id;state.route=id;state.query='';stack=[];render();
}
function openPerson(id){
 const p=person(id);if(!p)return;
 recentUpdate(id);
 navigate('profile',{profile:id,personTab:'overview',query:''});
}
function openViewer(id,ids){
 const e=allRecords().find(e=>e.id===id);
 if(!permitted(e)){if(e?.locked)second();return;}
 navigate('viewer',{profile:e.p,viewerId:id,viewerIds:ids&&ids.length?ids:records(e.p).map(x=>x.id),meta:false,query:''});
}
function moveViewer(by){
 const ids=state.viewerIds.filter(id=>permitted(allRecords().find(e=>e.id===id)));
 const i=ids.indexOf(state.viewerId),n=i+by;
 if(n<0||n>=ids.length){const el=document.getElementById('a10Stage');if(el)el.scrollLeft=el.offsetWidth;return;}
 state.viewerId=ids[n];state.meta=false;render();
}
function viewerInit(){
 const stage=document.getElementById('a10Stage');if(!stage)return;
 scrollIgnore=true;
 requestAnimationFrame(()=>{stage.scrollLeft=stage.clientWidth;setTimeout(()=>scrollIgnore=false,90);});
 stage.addEventListener('scroll',()=>{
  if(scrollIgnore)return;
  clearTimeout(scrollTimer);
  scrollTimer=setTimeout(()=>{
   if(scrollIgnore||!stage.isConnected)return;
   const dx=stage.scrollLeft-stage.clientWidth;
   if(dx<-stage.clientWidth*.53)moveViewer(-1);
   else if(dx>stage.clientWidth*.53)moveViewer(1);
  },115);
 },{passive:true});
}
function markMeta(){state.meta=!state.meta;render();}
function lockLogo(){return'<svg class="a10-emblem" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="40" r="27" stroke="#f5dce4" stroke-width="1.6"/><circle cx="40" cy="40" r="11" stroke="#f5dce4" stroke-width="1.2"/><path d="M19 23 46 14 64 37 49 64 19 23" stroke="#f5dce4" stroke-width="1.4"/><g fill="#f8edf0"><circle cx="19" cy="23" r="3"/><circle cx="46" cy="14" r="3"/><circle cx="64" cy="37" r="3"/><circle cx="49" cy="64" r="3"/><circle cx="40" cy="40" r="3"/></g></svg>';}
function dots(value){return'<div class="a10-pass-dots">'+[0,1,2,3].map(i=>'<i class="a10-pass-dot '+(i<value.length?'filled':'')+'"></i>').join('')+'</div>';}
function keys(which){
 return'<div class="a10-pad">'+[1,2,3,4,5,6,7,8,9,'',0,'del'].map(x=>'<button type="button" class="a10-pad-key '+(x===''?'blank':x==='del'?'del':'')+'" data-atlas="'+which+'" data-key="'+x+'">'+(x==='del'?'⌫':x)+'</button>').join('')+'</div>';
}
function renderLock(){
 root.innerHTML='<div class="a10-root"><div class="a10-pass-overlay"><div class="a10-pass-shell">'+lockLogo()+
 '<div class="a10-pass-word">ATLAS</div><div class="a10-pass-sub">Mã truy cập</div><div id="a10PassDots">'+dots(state.code)+'</div>'+
 keys('digit')+'<div class="a10-pass-error" id="a10PassError">'+esc(state.codeError)+'</div></div></div></div>';
}
function digit(value,secondary=false){
 let key=secondary?'secondaryCode':'code';
 if(value==='del')state[key]=state[key].slice(0,-1);
 else if(/^\d$/.test(value)&&state[key].length<4)state[key]+=value;
 const dotsEl=document.getElementById(secondary?'a10SecDots':'a10PassDots');
 if(dotsEl)dotsEl.innerHTML=dots(state[key]);
 if(!secondary){state.codeError='';const x=document.getElementById('a10PassError');if(x)x.textContent='';}
 if(state[key].length===4){
  if(state[key]===CODE){
   if(secondary){deep=true;write(DEEP,true);state.secondary=false;state.secondaryCode='';render();toast('Đã mở dữ liệu đầy đủ.');}
   else{state.unlocked=true;state.code='';state.codeError='';render();}
  }else{
   if(secondary){state.secondaryError='Không thể mở dữ liệu.';state.secondaryCode='';drawModal();}
   else{state.code='';state.codeError='Không thể mở dữ liệu.';renderLock();}
  }
 }
}
function second(){
 if(deep){toast('Dữ liệu đầy đủ đã mở.');return;}
 state.secondary=true;state.secondaryCode='';state.secondaryError='';drawModal();
}
function drawModal(){
 const container=document.getElementById('a10Modal');if(!container)return;
 if(!state.secondary){container.innerHTML='';return;}
 container.innerHTML='<div class="a10-modal-back"><div class="a10-modal"><h3>Dữ liệu đầy đủ</h3><p>Mã phụ · 4 chữ số</p><div id="a10SecDots">'+dots(state.secondaryCode)+'</div>'+
 '<div style="background:#651c30;padding:10px;border-radius:9px">'+keys('digit2')+'</div><div style="font-size:10px;color:#a65b68;min-height:16px;margin-top:8px">'+esc(state.secondaryError)+'</div>'+
 '<div class="a10-modal-actions"><button type="button" data-atlas="second-close">Hủy</button><button type="button" data-atlas="second-accept">Mở</button></div></div></div>';
}
function toast(s){
 const area=document.getElementById('a10Floating');if(!area)return;
 area.innerHTML='<div class="a10-toast">'+esc(s)+'</div>';
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>{if(area.isConnected)area.innerHTML='';},2300);
}
function openDb(){
 if(database)return Promise.resolve(database);
 return new Promise((resolve,reject)=>{
  if(!window.indexedDB){reject(new Error('IndexedDB unavailable'));return;}
  const request=indexedDB.open('atlas-files-v2',1);
  request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('files'))db.createObjectStore('files');};
  request.onsuccess=()=>{database=request.result;resolve(database);};
  request.onerror=()=>reject(request.error||new Error('Cannot open database'));
 });
}
async function saveBlob(id,blob){
 const db=await openDb();
 await new Promise((resolve,reject)=>{
 const tx=db.transaction('files','readwrite');tx.objectStore('files').put(blob,id);
 tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
 });
}
async function getBlob(id){
 const db=await openDb();
 return new Promise((resolve,reject)=>{
 const req=db.transaction('files','readonly').objectStore('files').get(id);
 req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
 });
}
async function deleteBlob(id){
 const db=await openDb();
 await new Promise((resolve,reject)=>{
 const tx=db.transaction('files','readwrite');tx.objectStore('files').delete(id);
 tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
 });
}
async function fillPreviews(){
 const nodes=[...root.querySelectorAll('[data-atlas-thumb],[data-atlas-file]')];
 for(const node of nodes){
  const id=node.dataset.atlasThumb||node.dataset.atlasFile;
  if(!id)continue;
  try{
   const file=await getBlob(id);if(!file||!node.isConnected)continue;
   let url=objectUrls.get(id);
   if(!url){url=URL.createObjectURL(file);objectUrls.set(id,url);}
   if(node.dataset.atlasThumb){node.src=url;continue;}
   const record=imports.find(e=>e.id===id);if(!record)continue;
   const ty=file.type||record.mime||'';
   if(ty.startsWith('image/'))node.innerHTML='<img src="'+url+'" alt="'+esc(record.title)+'" style="width:100%;height:100%;object-fit:contain"/>';
   else if(ty.startsWith('video/'))node.innerHTML='<video src="'+url+'" controls playsinline style="max-width:100%;max-height:100%"></video>';
   else if(ty.startsWith('audio/'))node.innerHTML='<audio src="'+url+'" controls style="width:95%"></audio>';
   else if(ty==='application/pdf')node.innerHTML='<iframe title="'+esc(record.title)+'" src="'+url+'" style="width:100%;height:100%;border:0"></iframe>';
   else node.innerHTML='<a href="'+url+'" download="'+esc(record.title)+'" class="a10-outline">Mở tệp '+esc(record.title)+'</a>';
  }catch(e){if(node.dataset.atlasFile&&node.isConnected)node.textContent='Không thể đọc tệp trên thiết bị.';}
 }
}
async function submitUpload(){
 const file=document.getElementById('a10UploadInput')?.files?.[0],p=document.getElementById('a10UploadPerson')?.value;
 const source=document.getElementById('a10UploadSource')?.value||'Nhập từ máy tính';
 const place=document.getElementById('a10UploadPlace')?.value.trim()||'';
 if(!file){toast('Hãy chọn một tệp.');return;}
 if(!person(p)){toast('Hồ sơ không hợp lệ.');return;}
 if(file.size>48*1024*1024){toast('Tệp quá lớn (tối đa 48 MB).');return;}
 const type=file.type;
 const kind=type.startsWith('image/')?'photo':type.startsWith('audio/')?'audio':type.startsWith('video/')?'video':type==='application/pdf'?'document':'document';
 const id='user-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
 const selectedDate=document.getElementById('a10UploadDate')?.value||'2015-08-29T08:54';
 const date=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(selectedDate)?selectedDate.replace('T',' '):'2015-08-29 08:54';
 const entry={id,p,date,saved:date,source,kind,title:file.name.slice(0,150),location:place,device:'',locked:false,pinned:false,local:true,mime:file.type||'',size:file.size,deleted:false};
 try{
  await saveBlob(id,file);
  imports.unshift(entry);
  if(!write(LOCAL,imports)){imports.shift();await deleteBlob(id);throw new Error('Metadata quota');}
  navigate('local');toast('Đã lưu tệp vào hồ sơ '+person(p).short+'.');
 }catch(e){toast('Không lưu được tệp trên thiết bị.');}
}
function relock(){
 state.unlocked=false;state.code='';state.codeError='';state.secondary=false;state.route='home';state.tab='home';state.query='';stack=[];renderLock();
}
function hide(){
 app.classList.remove('open');screen.classList.remove('atlas-open');
}
function launch(){
 screen.querySelectorAll(':scope > section[id$="App"]').forEach(el=>{if(el!==app)el.classList.remove('open');});
 ['voice-open','photos-open','notes-open','phone-open','messages-open','calendar-open','safari-open','mail-open','itau-open','itau-biz-open','facebook-open','whatsapp-open','goodreader-open'].forEach(x=>screen.classList.remove(x));
 app.classList.add('open');screen.classList.add('atlas-open');render();
}
app.addEventListener('click',event=>{
 const button=event.target.closest('[data-atlas]');if(!button||!app.contains(button))return;
 const action=button.dataset.atlas,id=button.dataset.id;
 if(action==='digit'||action==='digit2'){digit(button.dataset.key,action==='digit2');return;}
 if(!state.unlocked)return;
 if(action==='tab'){tab(id);return;}
 if(action==='back'){back();return;}
 if(action==='profile'){openPerson(id);return;}
 if(action==='account'){navigate('account');return;}
 if(['settings','deleted','upload','local'].includes(action)){navigate(action);return;}
 if(action==='second'){second();return;}
 if(action==='second-close'){state.secondary=false;drawModal();return;}
 if(action==='second-accept'){if(state.secondaryCode.length===4)digit('',true);else toast('Nhập đủ 4 chữ số.');return;}
 if(action==='pref'){prefs[id]=!prefs[id];write(PREF,prefs);render();return;}
 if(action==='relock'){relock();return;}
 if(action==='grid-toggle'){prefs.grid=!prefs.grid;write(PREF,prefs);render();return;}
 if(action==='sort-people'){prefs.alphabetic=!prefs.alphabetic;write(PREF,prefs);render();return;}
 if(action==='people-filter'){state.peopleFilter=id;render();return;}
 if(action==='source'){state.source=id;render();return;}
 if(action==='source-profile'){state.source=id;navigate('archive',{tab:'archive'});return;}
 if(action==='person-tab'){state.personTab=id;render();return;}
 if(action==='pinned'){const arr=records(state.profile).filter(isPinned);if(arr[0])openViewer(arr[0].id,arr.map(e=>e.id));return;}
 if(action==='album'){navigate('album',{year:Number(button.dataset.year),month:Number(button.dataset.month)});return;}
 if(action==='item'){const e=allRecords().find(e=>e.id===id);if(!e)return;
  let ids=records(e.p).map(x=>x.id);
  if(state.route==='album')ids=ids.filter(x=>{const obj=allRecords().find(r=>r.id===x);return obj&&yearOf(obj)===state.year&&monthOf(obj)===state.month;});
  openViewer(id,ids);return;
 }
 if(action==='clear-search'){state.query='';render();const q=document.getElementById('a10Search');q?.focus();return;}
 if(action==='prev'||action==='next'){moveViewer(action==='prev'?-1:1);return;}
 if(action==='pin'){const e=allRecords().find(x=>x.id===state.viewerId);if(e)togglePin(e);return;}
 if(action==='meta'){markMeta();return;}
 if(action==='submit-upload'){submitUpload();return;}
 if(action==='delete-local'){
  const e=imports.find(x=>x.id===state.viewerId);if(!e)return;
  e.deleted=true;write(LOCAL,imports);back();toast('Đã chuyển tệp vào Đã xóa.');return;
 }
 if(action==='restore'){const e=imports.find(x=>x.id===id);if(e){e.deleted=false;write(LOCAL,imports);render();toast('Đã khôi phục tệp.');}return;}
});
app.addEventListener('input',event=>{
 if(event.target.id!=='a10Search')return;
 state.query=event.target.value;
 searchRepaint();
});
app.addEventListener('keydown',event=>{
 if(!app.classList.contains('open'))return;
 if(!state.unlocked||state.secondary){
  if(/^\d$/.test(event.key)){event.preventDefault();digit(event.key,state.secondary);}
  if(event.key==='Backspace'){event.preventDefault();digit('del',state.secondary);}
  if(event.key==='Escape'&&state.secondary){state.secondary=false;drawModal();}
  return;
 }
 if(event.key==='Escape'){event.preventDefault();back();}
 if(state.route==='viewer'&&event.key==='ArrowLeft'){event.preventDefault();moveViewer(-1);}
 if(state.route==='viewer'&&event.key==='ArrowRight'){event.preventDefault();moveViewer(1);}
});
document.addEventListener('click',event=>{
 const target=event.target.closest('[data-app]');
 if(target&&target.dataset.app!=='atlas'&&app.classList.contains('open'))hide();
},true);
launcher.addEventListener('click',launch);
screen.addEventListener('caua:home-now',()=>{if(app.classList.contains('open'))hide();});
window.addEventListener('pagehide',()=>{for(const u of objectUrls.values())URL.revokeObjectURL(u);objectUrls.clear();});
window.Atlas2015=Object.freeze({
 open:launch,
 showProfile:id=>{if(!state.unlocked||!person(id))return false;launch();openPerson(id);return true;},
 getStatus:()=>({profiles:data.profiles.length,files:allRecords().length,locked:!state.unlocked,secondaryUnlocked:deep,imports:imports.filter(e=>!e.deleted).length})
});
renderLock();
})();