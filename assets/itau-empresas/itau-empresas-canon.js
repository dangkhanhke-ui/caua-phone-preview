/* Itaú Empresas · Subsolo 2015 — read-only canon ledger, as of 29 Aug 2015.
   All money in integer centavos. No invented bank transfer confirmations. */
(() => {
'use strict';
const app=document.getElementById('itauBizApp');
const content=document.getElementById('itauBizContent');
const title=document.getElementById('itauBizTitle');
const back=document.getElementById('itauBizBack');
const topAction=document.getElementById('itauBizTopAction');
const bottom=document.getElementById('itauBizBottom');
const toast=document.getElementById('itauBizToast');
const splash=document.getElementById('itauBizSplash');
const splashLogo=document.getElementById('itauBizSplashLogo');
const launcher=document.querySelector('[data-app="itau-biz"]');
const homeButton=document.getElementById('homeButton');
const screen=document.getElementById('screen');
if(!app||!content||!launcher)return;
const ROOT='./assets/itau-empresas/';
let manifest=null,bootPromise=null,requestSeq=0;
const monthCache=new Map();
const TODAY='2015-08-29';
const DEFAULTS={tab:'home',view:'home',search:'',period:'30-days',typeFilter:'all',start:'2015-08-01',end:TODAY,loaded:20,selected:null,group:'',stack:[],statementScroll:0,payrollPeriod:'2015-07',receiptSearch:''};
let state={...DEFAULTS,stack:[]};
const esc=(x)=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=(x)=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('vi');
const money=(c,sign=false)=>`${sign?(c<0?'- ':c>0?'+ ':''):''}R$ ${(Math.abs(c)/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const dateBR=iso=>iso.slice(8,10)+'/'+iso.slice(5,7)+'/'+iso.slice(0,4);
const fromDate=(d)=>new Date(d+'T12:00:00');
function subDays(d,n){const x=fromDate(d);x.setDate(x.getDate()-n);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;}
function periodMonths(start,end){const m=[];let y=+start.slice(0,4),k=+start.slice(5,7);const last=+end.slice(0,4)*12+(+end.slice(5,7));while(y*12+k<=last){m.push(`${y}-${String(k).padStart(2,'0')}`);if(++k>12){k=1;y++;}}return m;}
function setTop(name,child=false){title.textContent=name;back.textContent=child?'‹ Quay lại':'';back.style.visibility=child?'visible':'hidden';topAction.textContent='';topAction.style.visibility='hidden';bottom.style.display=child?'none':'grid';content.classList.toggle('child',child);}
function setTab(name){state.tab=name;bottom.querySelectorAll('[data-biz-tab]').forEach(b=>b.classList.toggle('active',b.dataset.bizTab===name));}
function showToast(txt){toast.textContent=txt;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),2200);}
function errorView(err){content.innerHTML='<div class="itau-empty"><strong>Không có kết nối</strong><span>Không tải được dữ liệu sao kê. Thử mở lại ứng dụng.</span></div>';console.warn('Itaú canon ledger load error:',err);}
function waiting(){content.innerHTML='<div class="itau-empty"><strong>Đang tải sao kê</strong><span>Vui lòng đợi…</span></div>';}
async function readJSON(path){const response=await fetch(ROOT+path,{cache:'force-cache'});if(!response.ok)throw Error('HTTP '+response.status+' '+path);return response.json();}
async function init(){if(manifest)return manifest;if(!bootPromise)bootPromise=readJSON('manifest.json').then(d=>{if(d.schema!==1||d.asOf!==TODAY||d.totalCount!==2823||d.postedBalanceCents!==36267037)throw Error('Invalid canon manifest');manifest=d;return d;}).catch(e=>{bootPromise=null;throw e;});return bootPromise;}
async function fetchMonth(month){await init();if(monthCache.has(month))return monthCache.get(month);const promise=readJSON('months/'+month+'.json').then(payload=>{
 if(payload.month!==month||!Array.isArray(payload.rows))throw Error('Invalid ledger month '+month);
 const data=payload.rows.map((r,i)=>{
  if(r.length!==8)throw Error('Invalid ledger row '+month+'#'+i);
  const [day,time,typeId,descId,partyId,amount,balance,ref]=r;
  const date=month+'-'+String(day).padStart(2,'0');
  return {id:ref,date,time,type:manifest.dictionary.types[typeId],description:manifest.dictionary.descriptions[descId],counterparty:manifest.dictionary.parties[partyId],amount,balance,reference:ref,direction:amount>=0?'incoming':'outgoing',displayName:manifest.dictionary.parties[partyId],posted:true};
 }).filter(t=>t.date<=TODAY);
 const line=manifest.monthly.find(x=>x[0]===month);
 if(!line||payload.rows.length!==line[5])throw Error('Month count differs from canon '+month);
 if(payload.rows.reduce((sum,r)=>sum+Math.max(0,r[5]),0)!==line[2]||payload.rows.reduce((sum,r)=>sum+Math.max(0,-r[5]),0)!==line[3])throw Error('Month sums differ from canon '+month);
 return data;
 }).catch(e=>{monthCache.delete(month);throw e;});
 monthCache.set(month,promise);return promise;
}
async function fetchRange(start,end){await init();const months=periodMonths(start,end).filter(x=>manifest.monthly.some(row=>row[0]===x));const batches=await Promise.all(months.map(fetchMonth));return batches.flat().filter(t=>t.date>=start&&t.date<=end&&t.date<=TODAY);}
async function fetchAll(){await init();return fetchRange('2013-03-01',TODAY);}
function ordered(items){return items.slice().sort((a,b)=>b.date.localeCompare(a.date)||(b.time||'').localeCompare(a.time||'')||b.id.localeCompare(a.id));}

async function balanceAt(day){
 await init();
 const cutoff=day>TODAY?TODAY:day,month=cutoff.slice(0,7);
 const line=manifest.monthly.find(x=>x[0]===month);
 if(!line){const older=manifest.monthly.filter(x=>x[0]<month).slice(-1)[0];return older?older[4]:manifest.monthly[0][1];}
 const rows=(await fetchMonth(month)).filter(t=>t.date<=cutoff);
 return rows.length?rows[rows.length-1].balance:line[1];
}
function infoRow(k,v){return '<div class="itau-kv"><label>'+esc(k)+'</label><div>'+esc(v)+'</div></div>';}
function infoBox(k,v){return '<div class="biz-payroll-box"><strong>'+esc(k)+'</strong><p>'+esc(v)+'</p></div>';}

function companyHeader(){const a=manifest.account;return '<div class="biz-company-head"><div class="biz-company-name">'+esc(a.company)+'</div><div class="biz-company-line">Itaú · chi nhánh '+esc(a.branch)+' · tài khoản '+esc(a.number)+'</div></div>';}
function rowHTML(t){return `<div class="itau-row" data-biz-tx="${esc(t.id)}" role="button" tabindex="0"><div class="itau-row-date">${esc(t.date.slice(8,10)+'/'+t.date.slice(5,7))}<span class="biz-time">${esc(t.time)}</span></div><div class="itau-row-main"><div class="itau-row-name">${esc(t.counterparty)}</div><div class="itau-row-desc">${esc(t.description)}</div></div><div class="itau-row-amount ${t.amount>=0?'in':'out'}">${money(t.amount,true)} <span class="itau-row-arrow">›</span></div></div>`;}
function busyThen(task){const token=++requestSeq;waiting();Promise.resolve().then(task).catch(e=>{if(token===requestSeq)errorView(e);});return token;}
async function drawHome(){const token=busyThen(async()=>{await init();const balance=await balanceAt(TODAY);const tx=ordered(await fetchMonth('2015-08'));if(token!==requestSeq)return;setTab('home');setTop('Itaú Doanh nghiệp');state.view='home';statementData=tx;content.innerHTML=companyHeader()+`<div class="itau-balance"><div class="itau-balance-label">Số dư tài khoản · ${dateBR(TODAY)}</div><div class="itau-balance-value">${money(balance)}</div><button class="itau-link-btn" data-go="statement">Xem sao kê</button></div><div class="itau-section-title">Giao dịch gần đây</div><div id="bizRecent">${tx.slice(0,5).map(rowHTML).join('')}</div><button class="itau-more" data-go="statement">Xem tất cả giao dịch</button>`;content.scrollTop=0;});}
function bounds(period){if(period==='7-days')return [subDays(TODAY,6),TODAY];if(period==='30-days')return [subDays(TODAY,29),TODAY];if(period==='90-days')return [subDays(TODAY,89),TODAY];if(period==='custom')return [state.start,state.end];if(/^\d{4}-\d{2}$/.test(period))return [period+'-01',period+'-31'];if(/^\d{4}$/.test(period))return [period+'-01-01',period+'-12-31'];return ['2013-03-01',TODAY];}
function options(){const dates=manifest.monthly.map(x=>x[0]).reverse();const years=[...new Set(dates.map(d=>d.slice(0,4)))];const fmt=d=>d.slice(5,7)+'/'+d.slice(0,4);const entries=[['7-days','7 ngày'],['30-days','30 ngày'],['90-days','90 ngày'],...dates.map(d=>[d,fmt(d)]),...years.map(y=>[y,'Năm '+y]),['custom','Khoảng tùy chọn']];return entries.map(([v,l])=>`<option value="${v}" ${state.period===v?'selected':''}>${l}</option>`).join('');}
let statementData=[];
async function drawStatement(reset=false){const token=busyThen(async()=>{await init();if(reset)state.loaded=20;const [a,b]=bounds(state.period);const data=ordered(await fetchRange(a,b));if(token!==requestSeq)return;const cutOff=b>TODAY?TODAY:b;const balance=await balanceAt(cutOff);if(token!==requestSeq)return;state.view='statement';setTab('statement');setTop('Sao kê');statementData=data;content.innerHTML=companyHeader()+`<div class="itau-search-box"><input id="bizSearch" type="search" placeholder="Tìm giao dịch trong kỳ" value="${esc(state.search)}"><button id="bizClear" class="itau-search-clear ${state.search?'show':''}" type="button">×</button></div><div class="itau-filterbar"><select class="itau-select" id="bizPeriod">${options()}</select></div><div class="itau-pills"><button class="itau-pill ${state.typeFilter==='all'?'active':''}" data-biz-type="all">Tất cả</button><button class="itau-pill ${state.typeFilter==='in'?'active':''}" data-biz-type="in">Tiền vào</button><button class="itau-pill ${state.typeFilter==='out'?'active':''}" data-biz-type="out">Tiền ra</button></div><div class="itau-result-info" id="bizResultInfo"></div><div id="bizTxList"></div><button class="itau-more" id="bizLoadMore" type="button" hidden>Tải thêm giao dịch</button><div class="biz-balance-footer" id="bizEndBalance"><span>Số dư ${dateBR(cutOff)}</span><b>${money(balance)}</b></div>`;paintStatement();content.scrollTop=0;});}
function filterNow(){const q=norm(state.search.trim());return statementData.filter(t=>{
 if(state.typeFilter==='in'&&t.amount<0)return false;if(state.typeFilter==='out'&&t.amount>=0)return false;
 return !q||norm([t.description,t.counterparty,t.type,t.date,dateBR(t.date),t.time,t.reference,money(t.amount)].join(' ')).includes(q);
 });}
function paintStatement(){const list=content.querySelector('#bizTxList');if(!list)return;const found=filterNow();const shown=found.slice(0,state.loaded);list.innerHTML=shown.map(rowHTML).join('')||'<div class="itau-empty"><strong>Không tìm thấy giao dịch</strong><span>Hãy đổi từ khóa hoặc khoảng thời gian.</span></div>';const info=content.querySelector('#bizResultInfo');if(info)info.textContent=`${found.length} giao dịch · ${state.period==='30-days'?'30 ngày gần nhất':state.period==='7-days'?'7 ngày gần nhất':state.period==='90-days'?'90 ngày gần nhất':state.period}`;const load=content.querySelector('#bizLoadMore');if(load)load.hidden=shown.length>=found.length;const footer=content.querySelector('#bizEndBalance');if(footer)footer.style.display=state.typeFilter==='all'&&!state.search?'flex':'none';}
function push(view){state.stack.push({view:state.view,tab:state.tab,selected:state.selected,group:state.group,period:state.period,search:state.search,typeFilter:state.typeFilter,start:state.start,end:state.end});state.view=view;}
function go(view){push(view);drawCurrent();}
let selectedTx=null;
async function drawDetail(){
 await init();const t=selectedTx;if(!t)return drawHome();
 state.view='detail';setTop('Chi tiết giao dịch',true);
 content.innerHTML='<div class="itau-detail"><div class="itau-detail-amount"><div class="name">'+esc(t.counterparty)+'</div><div class="value">'+money(t.amount,true)+'</div></div>'
 +infoRow('Ngày ghi sổ',dateBR(t.date)+' · '+t.time)
 +infoRow('Hình thức',t.type)+infoRow('Đối tác',t.counterparty)+infoRow('Nội dung',t.description)
 +infoRow('Trạng thái','Đã hạch toán')+infoRow('Số dư sau giao dịch',money(t.balance))
 +infoRow('Mã tham chiếu',t.reference)
 +infoRow('Mã xác thực ngân hàng','Không có dữ liệu')
 +infoRow('Tài khoản đối ứng','Không có dữ liệu')+'</div>';
 content.scrollTop=0;
}

const PRIORITY_REFS=['CAP-20130315','ACQ-2013-04-IGOR-01','ACQ-2013-04-REB-ANT','ACQ-2013-04-FAB-ANT','ACQ-2013-04-CAR-ANT',
'DIST-2014-06-MARCELO','DIST-2014-06-CAUA','DIST-2014-12-MARCELO','DIST-2014-12-CAUA',
'DIST-2015-04-MARCELO','DIST-2015-04-CAUA','DIST-2015-08-MARCELO','DIST-2015-08-CAUA',
'FOLHA-2015-07-13','POS-D-2015-08-19'];

const groups={
 bills:{title:'Thanh toán hóa đơn',predicate:t=>/hóa đơn|trích nợ/i.test(t.type)},
 transfers:{title:'Chuyển khoản',predicate:t=>/TED|chuyển khoản/i.test(t.type)},
 payroll:{title:'Bảng lương',predicate:t=>/lương/i.test(t.type)},
 tax:{title:'Thuế',predicate:t=>/thuế/i.test(t.type)},
 internal:{title:'Giao dịch liên quan thành viên',predicate:t=>/Cauã Henrique Valença de Oliveira|Marcelo Henrique Paes Barreto/.test(t.counterparty)},
 suppliers:{title:'Nhà cung cấp và vận hành',predicate:t=>t.amount<0&&!/lương|thuế/i.test(t.type)},
 rede:{title:'Giao dịch Rede',predicate:t=>/Rede|Redecard/i.test(t.counterparty)}
};
async function drawGroup(){const token=busyThen(async()=>{const key=state.group,grp=groups[key];if(!grp)return drawPayments();const data=ordered((await fetchAll()).filter(grp.predicate));if(token!==requestSeq)return;state.view='payment-list';setTop(grp.title,true);content.innerHTML=companyHeader()+`<div class="itau-result-info">${data.length} giao dịch đã hạch toán, đến ${dateBR(TODAY)}</div><div>${data.slice(0,state.loaded).map(rowHTML).join('')}</div><button class="itau-more" id="bizGroupMore" ${data.length<=state.loaded?'hidden':''}>Tải thêm</button>`;statementData=data;content.scrollTop=0;});}
function drawPayments(){++requestSeq;state.view='payments';setTab('payments');setTop('Thanh toán');const entries=[['▤','Hóa đơn đã thanh toán','bills'],['↗','Chuyển khoản đã hạch toán','transfers'],['▥','Bảng lương','payroll'],['§','Thuế','tax'],['⇄','Chuyển khoản liên quan thành viên','internal'],['◫','Nhà cung cấp','suppliers']];content.innerHTML=`${companyHeader()}<div class="biz-company-head"><div class="biz-company-name">Lịch sử thanh toán</div><div class="biz-company-line">Chỉ xem giao dịch đã hạch toán · Không có kết nối để tạo lệnh mới</div></div><div class="itau-list-menu">${entries.map(([i,t,k])=>`<div class="itau-menu-row" data-biz-payment="${k}" role="button" tabindex="0"><span class="ico">${i}</span><span class="name">${t}</span><span class="arrow">›</span></div>`).join('')}</div>`;content.scrollTop=0;}
async function drawPayroll(){
 const token=busyThen(async()=>{
  const all=await fetchAll();if(token!==requestSeq)return;
  const payroll=all.filter(t=>t.reference.startsWith('FOLHA-'));
  const periods=[...new Set(payroll.map(t=>t.reference.slice(6,13)))].sort().reverse();
  if(!periods.includes(state.payrollPeriod))state.payrollPeriod=periods[0]||'2015-07';
  const rows=ordered(payroll.filter(t=>t.reference.slice(6,13)===state.payrollPeriod));
  statementData=rows;state.view='payroll';setTop('Bảng lương',true);
  const period=state.payrollPeriod,total=rows.reduce((sum,t)=>sum-t.amount,0);
  const opts=periods.map(x=>'<option value="'+x+'" '+(x===period?'selected':'')+'>'+x.slice(5,7)+'/'+x.slice(0,4)+'</option>').join('');
  const payDates=[...new Set(rows.map(t=>dateBR(t.date)))].join(', ')||'Không có dữ liệu';
  content.innerHTML=companyHeader()
   +'<div class="biz-field-picker"><label for="bizPayrollPeriod">Kỳ lương</label><select class="itau-select" id="bizPayrollPeriod">'+opts+'</select></div>'
   +'<div class="itau-info-block">'+infoRow('Kỳ lương',period.slice(5,7)+'/'+period.slice(0,4))
   +infoRow('Ngày trả',payDates)+infoRow('Tổng đã trả',money(total))+infoRow('Số dòng',String(rows.length))+'</div>'
   +'<div class="itau-section-title">Các khoản đã hạch toán</div>'+rows.map(rowHTML).join('')
   +infoBox('Nhân sự thời vụ','Khoản nhân sự thời vụ là một khoản trả gộp, không phải một nhân viên riêng.');
  content.scrollTop=0;
 });
}
function drawServices(){++requestSeq;state.view='services';setTab('services');setTop('Dịch vụ');const data=[['▤','Tra cứu tham chiếu giao dịch','receipts'],['ℹ','Thông tin tài khoản','account-info'],['▥','Bảng lương','payroll'],['▦','Thanh toán thẻ Rede','device'],['◆','Bảo mật','security'],['?','Trợ giúp','help']];content.innerHTML='<div class="itau-list-menu">'+data.map(([i,n,k])=>`<div class="itau-menu-row" data-biz-service="${k}" role="button" tabindex="0"><span class="ico">${i}</span><span class="name">${n}</span><span class="arrow">›</span></div>`).join('')+'</div>';content.scrollTop=0;}
async function drawReceipts(){
 const token=busyThen(async()=>{
  const all=ordered(await fetchAll());if(token!==requestSeq)return;
  const order=new Map(PRIORITY_REFS.map((ref,i)=>[ref,i]));
  const weight=t=>order.has(t.reference)?order.get(t.reference):100000;
  statementData=all.slice().sort((a,b)=>weight(a)-weight(b)||b.date.localeCompare(a.date)||(b.time||'').localeCompare(a.time||''));
  state.view='receipts';setTop('Tra cứu giao dịch',true);
  content.innerHTML='<div class="itau-search-box"><input id="bizReceiptSearch" type="search" placeholder="Tên hoặc mã tham chiếu" value="'+esc(state.receiptSearch)+'"></div>'
   +'<div id="bizReceiptInfo" class="itau-result-info"></div><div id="bizRefList"></div>'
   +'<button class="itau-more" id="bizRefMore" type="button">Tải thêm</button>';
  paintReceipts();content.scrollTop=0;
 });
}
function paintReceipts(){
 const q=norm(state.receiptSearch.trim());
 const items=statementData.filter(t=>!q||norm([t.reference,t.counterparty,t.description,t.type,dateBR(t.date)].join(' ')).includes(q));
 const list=content.querySelector('#bizRefList');if(!list)return;
 list.innerHTML=items.slice(0,state.loaded).map(rowHTML).join('')||'<div class="itau-empty"><strong>Không tìm thấy giao dịch</strong></div>';
 const info=content.querySelector('#bizReceiptInfo');if(info)info.textContent=items.length+' giao dịch đã hạch toán';
 const more=content.querySelector('#bizRefMore');if(more)more.hidden=items.length<=state.loaded;
}
function drawAccount(){
 ++requestSeq;state.view='account-info';setTop('Thông tin tài khoản',true);
 const a=manifest.account;
 content.innerHTML='<div class="itau-info-block">'+[
 ['Ngân hàng',a.bank],['Chủ tài khoản',a.company],['CNPJ',a.cnpj],
 ['Chi nhánh',a.branch],['Tài khoản',a.number],['Loại tài khoản',a.type],
 ['Ngày mở','01/03/2013'],['Tình trạng',a.status],['Số dư tính đến',dateBR(TODAY)]
 ].map(x=>infoRow(x[0],x[1])).join('')+'</div>';content.scrollTop=0;
}
async function drawDevices(){
 const token=busyThen(async()=>{
  const all=(await fetchAll()).filter(groups.rede.predicate);if(token!==requestSeq)return;
  const debit=all.filter(t=>/ghi nợ/i.test(t.type)),credit=all.filter(t=>/tín dụng/i.test(t.type));
  const total=all.reduce((s,t)=>s+t.amount,0),thisMonth=all.filter(t=>t.date.startsWith('2015-08'));
  state.view='service-device';setTop('Thanh toán thẻ Rede',true);
  content.innerHTML='<div class="itau-info-block">'
   +infoRow('Đơn vị','Redecard / Rede')
   +infoRow('Tổng tiền đã ghi có',money(total))
   +infoRow('Số dòng ghi có',String(all.length))
   +infoRow('Thẻ ghi nợ',String(debit.length))
   +infoRow('Thẻ tín dụng',String(credit.length))
   +infoRow('Tiền ghi có tháng 08',money(thisMonth.reduce((s,t)=>s+t.amount,0)))
   +'</div>'+infoBox('Tiền đã thực nhận','Khoản ghi có không đồng nghĩa tổng doanh số bán hàng. Ngày bán hàng gốc và phí xử lý không có trong chi tiết sao kê.')
   +'<button class="itau-more" type="button" data-biz-payment="rede">Xem lịch sử Rede</button>';
  content.scrollTop=0;
 });
}
function drawStatic(view){++requestSeq;state.view=view;setTop(view==='security'?'Mã bảo mật':'Trợ giúp',true);content.innerHTML='<div class="itau-info-block"><div class="itau-kv"><label>Trạng thái</label><div>Không có kết nối</div></div></div><div class="biz-payroll-box"><strong>Chưa có dữ liệu xác thực</strong><p>Không tự tạo iToken, mã ngân hàng hay chi tiết bảo mật không được cung cấp trong bộ canon.</p></div>';content.scrollTop=0;}
function drawCustom(){++requestSeq;state.view='custom';setTop('Khoảng thời gian',true);content.innerHTML=`<div class="itau-custom"><label>Từ ngày</label><input id="bizCustomStart" type="date" max="${TODAY}" value="${esc(state.start)}"><label>Đến ngày</label><input id="bizCustomEnd" type="date" max="${TODAY}" value="${esc(state.end)}"><div class="itau-custom-actions"><button id="bizCustomCancel">Hủy</button><button class="primary" id="bizCustomApply">Áp dụng</button></div></div>`;content.scrollTop=0;}
function drawCurrent(){switch(state.view){case 'home':return drawHome();case 'statement':return drawStatement();case 'payments':return drawPayments();case 'payment-list':return drawGroup();case 'payroll':return drawPayroll();case 'services':return drawServices();case 'receipts':return drawReceipts();case 'account-info':return drawAccount();case 'service-device':return drawDevices();case 'service-security':return drawStatic('security');case 'service-help':return drawStatic('help');case 'custom':return drawCustom();case 'detail':return drawDetail();default:return drawHome();}}
function doBack(){if(!state.stack.length)return drawHome();const prev=state.stack.pop();Object.assign(state,prev);state.loaded=20;drawCurrent();}
function navTab(tab){state.stack=[];state.tab=tab;state.view=tab;state.loaded=20;state.search='';if(tab==='home')drawHome();else if(tab==='statement')drawStatement(true);else if(tab==='payments')drawPayments();else drawServices();}
async function openApp(){document.getElementById('mailApp')?.classList.remove('open');screen?.classList.remove('mail-open');document.getElementById('itauApp')?.classList.remove('open');screen?.classList.remove('itau-open');app.classList.add('open');screen?.classList.add('itau-biz-open');state={...DEFAULTS,stack:[]};const icon=launcher.querySelector('img');if(icon)splashLogo.src=icon.src;splash.classList.remove('hide');drawHome();setTimeout(()=>splash.classList.add('hide'),500);}
function closeApp(){app.classList.remove('open');screen?.classList.remove('itau-biz-open');++requestSeq;}
launcher.addEventListener('click',openApp);
homeButton?.addEventListener('click',closeApp);
bottom.addEventListener('click',e=>{const node=e.target.closest('[data-biz-tab]');if(node)navTab(node.dataset.bizTab);});
back.addEventListener('click',doBack);
content.addEventListener('input',e=>{if(e.target.id==='bizSearch'){state.search=e.target.value;state.loaded=20;paintStatement();content.querySelector('#bizClear')?.classList.toggle('show',!!state.search);}else if(e.target.id==='bizReceiptSearch'){state.receiptSearch=e.target.value;state.loaded=20;paintReceipts();}});
content.addEventListener('change',e=>{if(e.target.id==='bizPeriod'){state.period=e.target.value;state.loaded=20;if(state.period==='custom')go('custom');else drawStatement(true);}else if(e.target.id==='bizPayrollPeriod'){state.payrollPeriod=e.target.value;drawPayroll();}});
content.addEventListener('click',e=>{
 const r=e.target.closest('[data-biz-tx]');if(r){const t=statementData.find(x=>x.id===r.dataset.bizTx);if(t){selectedTx=t;push('detail');drawDetail();}else{fetchMonth('2015-08').then(rows=>{const tx=rows.find(x=>x.id===r.dataset.bizTx);if(tx){selectedTx=tx;push('detail');drawDetail();}});}return;}
 const g=e.target.closest('[data-go]');if(g){navTab(g.dataset.go);return;}
 const payment=e.target.closest('[data-biz-payment]');if(payment){const id=payment.dataset.bizPayment;if(id==='payroll'){state.group='payroll';go('payroll');}else{state.group=id;state.loaded=20;go('payment-list');}return;}
 const svc=e.target.closest('[data-biz-service]');if(svc){const id=svc.dataset.bizService;state.loaded=20;const map={'account-info':'account-info','receipts':'receipts','payroll':'payroll','device':'service-device','security':'service-security','help':'service-help'};go(map[id]||'services');return;}
 const t=e.target.closest('[data-biz-type]');if(t){state.typeFilter=t.dataset.bizType;state.loaded=20;content.querySelectorAll('[data-biz-type]').forEach(x=>x.classList.toggle('active',x===t));paintStatement();return;}
 if(e.target.closest('#bizClear')){state.search='';state.loaded=20;content.querySelector('#bizSearch').value='';content.querySelector('#bizClear').classList.remove('show');paintStatement();return;}
 if(e.target.closest('#bizCustomCancel')){if(state.stack.length)state.stack.pop();state.period='30-days';state.view='statement';drawStatement(true);return;}
 if(e.target.closest('#bizCustomApply')){const a=content.querySelector('#bizCustomStart').value,b=content.querySelector('#bizCustomEnd').value;if(!a||!b||a>b||a>TODAY||b>TODAY){showToast('Khoảng ngày không hợp lệ');return;}state.start=a;state.end=b;state.period='custom';state.stack.pop();drawStatement(true);return;}
 if(e.target.closest('#bizLoadMore')){state.loaded+=20;paintStatement();return;}
 if(e.target.closest('#bizGroupMore')){state.loaded+=20;const out=statementData.slice(0,state.loaded);content.querySelector('#bizGroupMore')?.previousElementSibling?.replaceChildren();const node=content.querySelector('#bizGroupMore')?.previousElementSibling;if(node)node.innerHTML=out.map(rowHTML).join('');content.querySelector('#bizGroupMore').hidden=out.length>=statementData.length;return;}
 if(e.target.closest('#bizRefMore')){state.loaded+=20;paintReceipts();return;}
 });
content.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-biz-tx],[data-biz-payment],[data-biz-service]')){e.preventDefault();e.target.click();}});
content.addEventListener('scroll',()=>{if(state.view==='statement'&&content.scrollTop+content.clientHeight>=content.scrollHeight-110){const btn=content.querySelector('#bizLoadMore');if(btn&&!btn.hidden)btn.click();}},{passive:true});
})();
