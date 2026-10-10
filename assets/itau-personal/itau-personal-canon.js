/* Itaú 30 Horas · Cauã personal account · player view as of 29 Aug 2015.
   346 checking entries + separate 32 Visa Gold purchases; no real bank instructions.
   Presentation uses the pre-existing Itaú personal app shell. */
(function(){
'use strict';
const app=document.getElementById('itauApp'),content=document.getElementById('itauContent');
const title=document.getElementById('itauTitle'),back=document.getElementById('itauBack');
const action=document.getElementById('itauTopAction'),bottom=document.getElementById('itauBottom');
const toast=document.getElementById('itauToast'),splash=document.getElementById('itauSplash');
const splashLogo=document.getElementById('itauSplashLogo'),launcher=document.querySelector('[data-app="itau"]');
const homeButton=document.getElementById('homeButton'),accountMenu=document.getElementById('itauAccountMenu');
const screen=document.getElementById('screen');
if(!app||!content||!launcher)return;
const ledgerSource=window.CauaCheckingLedger,card=window.CauaPersonalCard;
const AS_OF='2015-08-29';
const money=c=>'R$ '+(Math.abs(c)/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const signed=c=>(c<0?'− ':'+ ')+money(c);
const fmt=date=>date.slice(8,10)+'/'+date.slice(5,7)+'/'+date.slice(0,4);
const short=date=>date.slice(8,10)+'/'+date.slice(5,7);
const html=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let ledger=[],started=null,revision=0,selected=null;
const state={view:'home',tab:'home',stack:[],month:'2015-08',filter:'all',search:'',cardMonth:'2015-09',shown:25,list:[]};
function notice(txt){toast.textContent=txt;toast.classList.add('show');clearTimeout(notice.timer);notice.timer=setTimeout(()=>toast.classList.remove('show'),1800);}
function top(name,child=false){
 title.textContent=name;back.textContent=child?'‹ Quay lại':'';
 back.style.visibility=child?'visible':'hidden';
 action.textContent='';action.style.visibility='hidden';
 bottom.style.display=child?'none':'grid';
 content.classList.toggle('child',child);
 bottom.querySelectorAll('[data-itau-tab]').forEach(n=>n.classList.toggle('active',!child&&n.dataset.itauTab===state.tab));
 accountMenu?.classList.remove('open');
}
function box(k,v){return '<div class="itau-kv"><label>'+html(k)+'</label><div>'+html(v)+'</div></div>';}
function cardHead(){return '<div class="itau-account-head"><div class="itau-hello">Cauã Henrique Valença de Oliveira</div><div class="itau-account-line">Agência 0917 · Conta 43972-1</div></div>';}
function sorted(rows){return rows.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.time.localeCompare(a.time)||b.id.localeCompare(a.id));}
function balanceAt(date){
 const transactions=ledger.filter(t=>t.date<=date);return transactions.length?transactions[transactions.length-1].balanceCents:1843000;
}
function bankRow(t){
 return '<div class="itau-row" data-personal-bank="'+html(t.id)+'" role="button" tabindex="0">'
 +'<div class="itau-row-date">'+short(t.date)+'<span class="biz-time">'+html(t.time)+'</span></div>'
 +'<div class="itau-row-main"><div class="itau-row-name">'+html(t.counterparty)+'</div>'
 +'<div class="itau-row-desc">'+html(t.description)+'</div></div>'
 +'<div class="itau-row-amount '+(t.amountCents>=0?'in':'out')+'">'+signed(t.amountCents)+' <span class="itau-row-arrow">›</span></div></div>';
}
function cardRow(t){
 return '<div class="itau-row" data-personal-purchase="'+html(t.id)+'" role="button" tabindex="0">'
 +'<div class="itau-row-date">'+short(t.date)+'<span class="biz-time">'+html(t.time)+'</span></div>'
 +'<div class="itau-row-main"><div class="itau-row-name">'+html(t.merchant)+'</div><div class="itau-row-desc">'+html(t.category)+'</div></div>'
 +'<div class="itau-row-amount out">− '+money(t.amountCents)+' <span class="itau-row-arrow">›</span></div></div>';
}
function begin(view){
 state.stack.push({view:state.view,tab:state.tab,month:state.month,cardMonth:state.cardMonth,filter:state.filter,search:state.search,shown:state.shown});
 state.view=view;state.shown=25;render();
}
function goBack(){
 if(!state.stack.length){state.view='home';state.tab='home';return render();}
 const prev=state.stack.pop();Object.assign(state,prev);render();
}
function nav(tab){
 state.tab=tab;state.view=tab;state.stack=[];state.shown=25;state.search='';
 if(tab==='transfer')state.view='transfers';render();
}
function renderHome(){
 state.view='home';state.tab='home';top('Itaú');
 const tx=sorted(ledger.filter(t=>t.date<=AS_OF));
 content.innerHTML=cardHead()
 +'<div class="itau-balance"><div class="itau-balance-label">Số dư tài khoản · '+fmt(AS_OF)+'</div>'
 +'<div class="itau-balance-value">'+money(balanceAt(AS_OF))+'</div>'
 +'<button type="button" class="itau-link-btn" data-personal-go="statement">Xem sao kê</button></div>'
 +'<div class="itau-list-menu itau-personal-shortcuts">'
 +'<div class="itau-menu-row" data-personal-go="card" role="button" tabindex="0"><span class="ico">▣</span><span class="name">Visa Gold •••• 4836</span><span class="arrow">›</span></div>'
 +'<div class="itau-menu-row" data-personal-go="transfers" role="button" tabindex="0"><span class="ico">⇄</span><span class="name">Chuyển khoản đã ghi sổ</span><span class="arrow">›</span></div></div>'
 +'<div class="itau-section-title">Giao dịch gần đây</div>'+tx.slice(0,6).map(bankRow).join('')
 +'<button class="itau-more" type="button" data-personal-go="statement">Xem thêm giao dịch</button>';
 content.scrollTop=0;
}
function listPane(rows,heading,withFilter=false){
 const display=rows.slice(0,state.shown);
 return '<div class="itau-result-info">'+rows.length+' giao dịch '+html(heading)+'</div>'
 +'<div id="personalRows">'+(display.length?display.map(bankRow).join(''):'<div class="itau-empty"><strong>Không tìm thấy giao dịch</strong></div>')+'</div>'
 +(rows.length>display.length?'<button class="itau-more" id="personalMore" type="button">Tải thêm giao dịch</button>':'');
}
function statementOptions(){
 const periods=[...new Set(ledger.map(t=>t.date.slice(0,7)))].reverse();
 return periods.map(p=>'<option value="'+p+'" '+(p===state.month?'selected':'')+'>'+p.slice(5,7)+'/'+p.slice(0,4)+'</option>').join('');
}
function statementFilter(){
 const q=norm(state.search.trim());
 return sorted(ledger.filter(t=>t.date.slice(0,7)===state.month&&t.date<=AS_OF)
  .filter(t=>state.filter==='all'||(state.filter==='in'?t.amountCents>=0:t.amountCents<0))
  .filter(t=>!q||norm([t.id,t.description,t.counterparty,t.type,t.channel,fmt(t.date),money(t.amountCents)].join(' ')).includes(q)));
}
function paintStatement(){
 const rows=statementFilter(),list=content.querySelector('#personalRows'),result=content.querySelector('#personalCount'),more=content.querySelector('#personalMore'),balance=content.querySelector('#personalPeriodBalance');
 if(!list)return;
 list.innerHTML=rows.slice(0,state.shown).map(bankRow).join('')||'<div class="itau-empty"><strong>Không tìm thấy giao dịch</strong></div>';
 if(result)result.textContent=rows.length+' giao dịch';
 if(more)more.hidden=rows.length<=state.shown;
 if(balance)balance.textContent=money(balanceAt(state.month+'-31'));
}
function renderStatement(){
 state.view='statement';state.tab='statement';top('Sao kê');
 content.innerHTML=cardHead()
 +'<div class="itau-search-box"><input type="search" id="personalSearch" placeholder="Tìm tên, mã CP, nội dung…" value="'+html(state.search)+'"></div>'
 +'<div class="itau-filterbar"><select class="itau-select" id="personalMonth">'+statementOptions()+'</select></div>'
 +'<div class="itau-pills"><button class="itau-pill '+(state.filter==='all'?'active':'')+'" data-personal-filter="all">Tất cả</button>'
 +'<button class="itau-pill '+(state.filter==='in'?'active':'')+'" data-personal-filter="in">Tiền vào</button>'
 +'<button class="itau-pill '+(state.filter==='out'?'active':'')+'" data-personal-filter="out">Tiền ra</button></div>'
 +'<div id="personalCount" class="itau-result-info"></div><div id="personalRows"></div>'
 +'<button id="personalMore" class="itau-more" type="button">Tải thêm giao dịch</button>'
 +'<div class="biz-balance-footer"><span>Số dư cuối kỳ</span><b id="personalPeriodBalance"></b></div>';
 paintStatement();content.scrollTop=0;
}
function renderBankDetail(){
 const t=selected;if(!t){goBack();return;}
 top('Chi tiết giao dịch',true);
 content.innerHTML='<div class="itau-detail"><div class="itau-detail-amount"><div class="name">'+html(t.counterparty)+'</div>'
 +'<div class="value">'+signed(t.amountCents)+'</div></div>'
 +box('Ngày ghi sổ',fmt(t.date)+' · '+t.time)+box('Loại giao dịch',t.type)
 +box('Kênh',t.channel)+box('Đối tác',t.counterparty)
 +box('Nội dung',t.description)+box('Trạng thái','Đã ghi nhận')
 +box('Số dư sau giao dịch',money(t.balanceCents))+box('Mã tra cứu',t.id)
 +box('Mã xác thực ngân hàng','Không có thông tin')
 +'</div>';
 content.scrollTop=0;
}
function renderTransfers(){
 state.view='transfers';state.tab='transfer';top('Giao dịch');
 const menus=[['Chuyển khoản','transfers-list'],['Thanh toán hóa đơn','bills-list'],['Rút tiền ATM','cash-list'],['Lịch sử trả hóa đơn thẻ','card-payments'],['Thẻ tín dụng Visa Gold','card']];
 content.innerHTML=cardHead()+'<div class="itau-list-menu">'+menus.map(m=>'<div class="itau-menu-row" data-personal-go="'+m[1]+'" role="button" tabindex="0"><span class="ico">›</span><span class="name">'+m[0]+'</span><span class="arrow">›</span></div>').join('')+'</div>';
 content.scrollTop=0;
}
function renderGroup(){
 const map={
 'transfers-list':{title:'Chuyển khoản',test:t=>/chuyển khoản|thu nhập dịch vụ|phân phối lợi nhuận|dịch vụ pháp lý/i.test(t.type)},
 'bills-list':{title:'Thanh toán hóa đơn',test:t=>/thanh toán hóa đơn|tiền thuê nhà|phí dịch vụ ngân hàng/i.test(t.type)},
 'cash-list':{title:'Rút tiền ATM',test:t=>/rút tiền/i.test(t.type)},
 'card-payments':{title:'Thanh toán thẻ tín dụng',test:t=>/thanh toán thẻ tín dụng/i.test(t.type)}
 };
 const item=map[state.view];top(item.title,true);
 const rows=sorted(ledger.filter(item.test));
 state.list=rows;
 content.innerHTML=listPane(rows,'đã ghi nhận');
 content.scrollTop=0;
}
function renderCard(){
 state.view='card';top('Thẻ tín dụng',true);
 const open=card.statements.find(s=>s.period==='2015-09');
 const bills=card.statements.slice().reverse();
 content.innerHTML='<div class="itau-personal-visa"><div>Itaú <b>Visa Gold</b></div><strong>•••• •••• •••• '+html(card.last4)+'</strong><small>'+html(card.holder)+'</small></div>'
 +'<div class="itau-info-block">'+box('Hạn mức',money(card.limitCents))+box('Đã sử dụng',money(card.currentCents))
 +box('Còn lại',money(card.availableCents))+box('Kỳ đang phát sinh','09/2015')+'</div>'
 +'<div class="itau-section-title">Hóa đơn gần đây</div>'
 +'<div class="itau-list-menu">'+bills.map(s=>{
   const label=s.period.slice(5,7)+'/'+s.period.slice(0,4);
   return '<div class="itau-menu-row itau-card-bill" data-personal-bill="'+s.period+'" role="button" tabindex="0"><span class="name">'
    +'<strong>'+label+'</strong><span>'+ (s.status==='paid'?'Đã thanh toán':'Đang phát sinh') +'</span></span>'
    +'<b>'+money(s.amountCents)+'</b><span class="arrow">›</span></div>';
 }).join('')+'</div>';
 content.scrollTop=0;
}
function renderCardBill(){
 const statement=card.statements.find(s=>s.period===state.cardMonth);if(!statement){state.view='card';return renderCard();}
 state.view='card-bill';top('Hóa đơn '+state.cardMonth.slice(5,7)+'/'+state.cardMonth.slice(0,4),true);
 const purchases=sorted(card.transactions.filter(t=>t.period===state.cardMonth));
 content.innerHTML='<div class="itau-info-block">'+box('Thẻ','Visa Gold •••• 4836')
 +box('Giá trị',money(statement.amountCents))
 +box('Trạng thái',statement.status==='paid'?'Đã thanh toán':'Đang phát sinh')
 +box('Ngày chốt',fmt(statement.closingDate))+box('Hạn thanh toán',fmt(statement.dueDate))
 +(statement.paymentReference?box('Thanh toán tài khoản',statement.paymentReference):'')
 +'</div><div class="itau-section-title">'+purchases.length+' giao dịch mua sắm</div>'
 +purchases.map(cardRow).join('')
 +(statement.paymentReference?'<button class="itau-more" type="button" data-personal-ref="'+html(statement.paymentReference)+'">Xem khoản đã trả trong tài khoản</button>':'');
 content.scrollTop=0;
}
function renderPurchase(){
 const t=selected;if(!t){goBack();return;}
 state.view='purchase-detail';top('Chi tiết thẻ',true);
 const bill=card.statements.find(s=>s.period===t.period);
 content.innerHTML='<div class="itau-detail"><div class="itau-detail-amount"><div class="name">'+html(t.merchant)+'</div>'
 +'<div class="value">− '+money(t.amountCents)+'</div></div>'
 +box('Ngày mua',fmt(t.date)+' · '+t.time)
 +box('Thẻ','Itaú Visa Gold •••• 4836')
 +box('Điểm thanh toán',t.merchant)
 +box('Loại chi tiêu',t.category)
 +box('Kỳ hóa đơn',t.period.slice(5,7)+'/'+t.period.slice(0,4))
 +box('Trạng thái',bill.status==='paid'?'Đã thanh toán':'Chưa đến hạn')
 +'</div>';content.scrollTop=0;
}
function renderServices(){
 state.view='services';state.tab='services';top('Dịch vụ');
 content.innerHTML=cardHead()+'<div class="itau-list-menu">'
 +[['Thẻ tín dụng Visa Gold','card'],['Thông tin tài khoản','account'],['iToken','itoken'],['Khoản đang chờ','pending'],['Trợ giúp','help']]
  .map(x=>'<div class="itau-menu-row" data-personal-go="'+x[1]+'" role="button" tabindex="0"><span class="ico">›</span><span class="name">'+x[0]+'</span><span class="arrow">›</span></div>').join('')
 +'</div>';content.scrollTop=0;
}
function renderAccount(){
 top('Thông tin tài khoản',true);
 content.innerHTML='<div class="itau-info-block">'+box('Ngân hàng','Itaú')
 +box('Chủ tài khoản',ledgerSource.owner)+box('Loại','Tài khoản thanh toán cá nhân')
 +box('Chi nhánh','0917')+box('Tài khoản','43972-1')
 +box('Ngày mở','16/06/2010')+box('Số dư',money(balanceAt(AS_OF)))+'</div>';
 content.scrollTop=0;
}
function renderEmpty(){
 const label=state.view==='pending'?'Không có giao dịch đang chờ':state.view==='itoken'?'Không có kết nối':'Thông tin hỗ trợ';
 top(state.view==='pending'?'Giao dịch đang chờ':state.view==='itoken'?'iToken':'Trợ giúp',true);
 content.innerHTML='<div class="itau-empty"><strong>'+label+'</strong><span>'+(state.view==='itoken'?'Không thể xác thực giao dịch lúc này.':'')+'</span></div>';
 content.scrollTop=0;
}
function render(){
 switch(state.view){
 case 'home':return renderHome();
 case 'statement':return renderStatement();
 case 'transfers':return renderTransfers();
 case 'transfers-list':case 'bills-list':case 'cash-list':case 'card-payments':return renderGroup();
 case 'detail':return renderBankDetail();
 case 'card':return renderCard();
 case 'card-bill':return renderCardBill();
 case 'purchase-detail':return renderPurchase();
 case 'services':return renderServices();
 case 'account':return renderAccount();
 case 'itoken':case 'pending':case 'help':return renderEmpty();
 default:state.view='home';return renderHome();
 }
}
function openView(name){
 if(name==='statement'){state.tab='statement';state.stack=[];state.view='statement';return render();}
 if(name==='transfers'){state.tab='transfer';state.stack=[];state.view='transfers';return render();}
 begin(name);
}
async function openApp(){
 document.getElementById('itauBizApp')?.classList.remove('open');screen?.classList.remove('itau-biz-open');
 document.getElementById('mailApp')?.classList.remove('open');screen?.classList.remove('mail-open');
 app.classList.add('open');screen?.classList.add('itau-open');
 const icon=launcher.querySelector('img');if(icon)splashLogo.src=icon.src;
 splash.classList.remove('hide');
 content.innerHTML='<div class="itau-empty"><strong>Đang tải dữ liệu tài khoản</strong></div>';
 const token=++revision;
 try{
  if(!ledgerSource||!card)throw Error('Không tìm thấy dữ liệu tài khoản');
  if(!started)started=ledgerSource.load().catch(e=>{started=null;throw e});
  const all=await started;
  if(token!==revision)return;
  ledger=all.filter(t=>t.date<=AS_OF);
  if(ledger.length!==346||balanceAt(AS_OF)!==20564200)throw Error('Sao kê cá nhân không hợp lệ');
  Object.assign(state,{view:'home',tab:'home',stack:[],month:'2015-08',cardMonth:'2015-09',filter:'all',search:'',shown:25});
  renderHome();
 }catch(err){
  if(token!==revision)return;
  console.warn('Itaú personal ledger loading error',err);
  content.innerHTML='<div class="itau-empty"><strong>Không tải được sao kê</strong><span>Vui lòng mở lại ứng dụng.</span></div>';
 }finally{if(token===revision)splash.classList.add('hide');}
}
function closeApp(){++revision;app.classList.remove('open');screen?.classList.remove('itau-open');accountMenu?.classList.remove('open');}
launcher.addEventListener('click',openApp);
homeButton?.addEventListener('click',closeApp);
bottom.addEventListener('click',e=>{
 const hit=e.target.closest('[data-itau-tab]');
 if(hit)nav(hit.dataset.itauTab);
});
back.addEventListener('click',goBack);
content.addEventListener('input',e=>{
 if(e.target.id==='personalSearch'){state.search=e.target.value;state.shown=25;paintStatement();}
});
content.addEventListener('change',e=>{
 if(e.target.id==='personalMonth'){state.month=e.target.value;state.shown=25;paintStatement();}
});
content.addEventListener('click',e=>{
 const filter=e.target.closest('[data-personal-filter]');
 if(filter){state.filter=filter.dataset.personalFilter;state.shown=25;content.querySelectorAll('[data-personal-filter]').forEach(b=>b.classList.toggle('active',b===filter));paintStatement();return;}
 if(e.target.closest('#personalMore')){
  state.shown+=25;
  if(state.view==='statement')paintStatement();
  else if(state.list.length){const rows=state.list.slice(0,state.shown);content.querySelector('#personalRows').innerHTML=rows.map(bankRow).join('');if(state.list.length<=state.shown)e.target.hidden=true;}
  return;
 }
 const go=e.target.closest('[data-personal-go]');if(go){openView(go.dataset.personalGo);return;}
 const bill=e.target.closest('[data-personal-bill]');if(bill){state.cardMonth=bill.dataset.personalBill;begin('card-bill');return;}
 const link=e.target.closest('[data-personal-ref]');if(link){
  const tx=ledger.find(x=>x.id===link.dataset.personalRef);
  if(tx){selected=tx;begin('detail');}return;
 }
 const tx=e.target.closest('[data-personal-bank]');if(tx){
  const t=ledger.find(x=>x.id===tx.dataset.personalBank);
  if(t){selected=t;begin('detail');}return;
 }
 const purchase=e.target.closest('[data-personal-purchase]');if(purchase){
  const t=card.transactions.find(x=>x.id===purchase.dataset.personalPurchase);
  if(t){selected=t;begin('purchase-detail');}return;
 }
});
content.addEventListener('keydown',e=>{
 if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-personal-go],[data-personal-bank],[data-personal-purchase],[data-personal-bill]')){
  e.preventDefault();e.target.click();
 }
});
})();