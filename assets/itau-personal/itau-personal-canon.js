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
const state={view:'home',tab:'home',stack:[],month:'2015-08',filter:'all',search:'',cardMonth:'2015-09',shown:25,list:[],demoToken:null,tokenCounter:0,helpTopic:null};

/* 2014 iPhone Itaú personal navigation: flat, thin one-family pictograms. */
const PATHS={
 home:'<path d="m3 11 9-7 9 7v9H3z"/><path d="M9 20v-6h6v6"/>',
 statement:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M8 8h8M8 12h8M8 16h6"/>',
 transfer:'<path d="M4 7h16l-4-4M20 7l-4 4M20 17H4l4-4M4 17l4 4"/>',
 services:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 back:'<path d="m15 4-8 8 8 8"/>',
 card:'<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="M3 10h18M7 15h5"/>',
 bill:'<path d="M5 3h14v18l-3-2-4 2-4-2-3 2z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
 atm:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M6 8h12M6 12h12M12 15v4m-3-3 3-2 3 2"/>',
 itoken:'<path d="M12 2 20 5v6c0 5-3 8.5-8 11-5-2.5-8-6-8-11V5z"/><path d="m9 12 2 2 4-4"/>',
 account:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.8 1c0 2-2.3 2-2.3 4"/><circle cx="12" cy="18" r=".7" fill="currentColor" stroke="none"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
 history:'<path d="M4 6v5h5"/><path d="M5.5 11a7 7 0 1 1 2 6"/><path d="M12 8v5l3 2"/>',
 pay:'<path d="M3 8h18v12H3zM3 8l4-5h10l4 5"/><path d="M7 13h10M7 17h5"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>'
};
function ico(k,klass=''){
 return '<svg class="personal-ico '+html(klass)+'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+(PATHS[k]||PATHS.services)+'</svg>';
}
bottom.querySelectorAll('[data-itau-tab]').forEach(t=>{
 const glyph=t.querySelector('i');
 if(glyph)glyph.innerHTML=ico(t.dataset.itauTab,'personal-ico-nav');
});
function menuLine(label,view,iconName){
 return '<div class="itau-menu-row" data-personal-go="'+html(view)+'" role="button" tabindex="0"><span class="ico">'+ico(iconName)+'</span><span class="name">'+html(label)+'</span><span class="arrow">›</span></div>';
}

function notice(txt){toast.textContent=txt;toast.classList.add('show');clearTimeout(notice.timer);notice.timer=setTimeout(()=>toast.classList.remove('show'),1800);}
function top(name,child=false){
 title.textContent=name;back.innerHTML=child?ico('back')+'<span>Quay lại</span>':'';
 back.style.visibility=child?'visible':'hidden';
 action.textContent='';action.style.visibility='hidden';
 bottom.style.display=child?'none':'grid';
 content.classList.toggle('child',child);
 bottom.querySelectorAll('[data-itau-tab]').forEach(n=>n.classList.toggle('active',!child&&n.dataset.itauTab===state.tab));
 accountMenu?.classList.remove('open');
}
function box(k,v){return '<div class="itau-kv"><label>'+html(k)+'</label><div>'+html(v)+'</div></div>';}
function cardHead(){return '<div class="itau-account-head"><div class="personal-account-mark">'+ico('account')+'</div><div class="personal-account-copy"><div class="itau-hello">Cauã Henrique Valença de Oliveira</div><div class="itau-account-line">Agência 0917 · Conta 43972-1</div></div></div>';}
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
 +'<div class="personal-home-head"><span>Tài khoản thanh toán</span><span>'+fmt(AS_OF)+'</span></div>'
 +'<div class="itau-balance"><div class="itau-balance-label">Số dư tài khoản</div>'
 +'<div class="itau-balance-value">'+money(balanceAt(AS_OF))+'</div>'
 +'<button type="button" class="itau-link-btn" data-personal-go="statement">Xem sao kê <span aria-hidden="true">›</span></button></div>'
 +'<div class="personal-action-grid">'
 +'<button type="button" data-personal-go="transfers-list">'+ico('transfer')+'<span>Chuyển khoản</span></button>'
 +'<button type="button" data-personal-go="bills-list">'+ico('pay')+'<span>Thanh toán</span></button>'
 +'<button type="button" data-personal-go="card">'+ico('card')+'<span>Thẻ tín dụng</span></button>'
 +'<button type="button" data-personal-go="itoken">'+ico('itoken')+'<span>iToken</span></button></div>'
 +'<div class="personal-credit-overview" data-personal-go="card" role="button" tabindex="0">'
 +'<span class="personal-credit-sign">'+ico('card')+'</span><div><strong>Visa Gold ···· 4836</strong><small>Kỳ 09/2015 · đang phát sinh</small></div>'
 +'<b>'+money(card.currentCents)+'</b><span class="itau-row-arrow">›</span></div>'
 +'<div class="itau-section-title">Giao dịch gần đây</div>'+tx.slice(0,6).map(bankRow).join('')
 +'<button class="itau-more" type="button" data-personal-go="statement">Xem tất cả giao dịch</button>';
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
 content.innerHTML=cardHead()+'<div class="personal-section-heading">Tra cứu giao dịch</div><div class="itau-list-menu">'
 +menuLine('Chuyển khoản đã ghi sổ','transfers-list','transfer')
 +menuLine('Thanh toán hóa đơn','bills-list','bill')
 +menuLine('Rút tiền ATM','cash-list','atm')
 +menuLine('Lịch sử trả hóa đơn thẻ','card-payments','history')
 +menuLine('Thẻ tín dụng Visa Gold','card','card')+'</div>';
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
 const bills=card.statements.slice().reverse();
 content.innerHTML='<div class="personal-card-wrap">'
 +'<div class="itau-personal-visa" role="img" aria-label="Itaú Visa Gold, thẻ kết thúc 4836">'
 +'<div class="visa-watermark" aria-hidden="true"></div>'
 +'<div class="visa-card-top"><span class="visa-itau-brand"><span>itaú</span></span><span class="visa-tier">GOLD</span></div>'
 +'<div class="visa-card-mid"><svg class="visa-chip" viewBox="0 0 55 42" aria-hidden="true"><rect x="1" y="1" width="53" height="40" rx="7" fill="#e8d6a1" stroke="#8e7949" stroke-width="1.5"/><rect x="17" y="2" width="21" height="38" rx="3" fill="#cbb577" stroke="#8e7949"/><path d="M1 14h16M1 28h16M38 14h16M38 28h16M17 14h21M17 28h21M27.5 2v12M27.5 28v12" fill="none" stroke="#87754a" stroke-width="1.35"/><rect x="21" y="15" width="13" height="12" rx="2" fill="#e5d3a0" stroke="#8a784f"/></svg>'
 +'<span class="visa-contactless" aria-hidden="true"><i></i><i></i><i></i></span></div>'
 +'<div class="visa-card-number"><span>••••</span><span>••••</span><span>••••</span><span>'+html(card.last4)+'</span></div>'
 +'<div class="visa-card-bottom"><div class="visa-holder"><small>TITULAR</small><strong>'+html(card.holder)+'</strong></div><div class="visa-brandmark" aria-label="Visa">VISA<span class="visa-brand-swoosh"></span></div></div>'
 +'<div class="visa-hologram" aria-hidden="true"></div>'
 +'</div></div>'
 +'<div class="personal-card-section"><div class="personal-card-intro"><span>Cartão de crédito · Visa Gold</span><strong>•••• '+html(card.last4)+'</strong></div></div>'
 +'<div class="itau-info-block">'+box('Hạn mức total',money(card.limitCents))
 +box('Utilizado',money(card.currentCents))+box('Disponível',money(card.availableCents))
 +box('Fatura em aberto','09/2015')+'</div>'
 +'<div class="itau-section-title">Faturas · Hóa đơn gần đây</div>'
 +'<div class="itau-list-menu">'+bills.map(s=>{
   const label=s.period.slice(5,7)+'/'+s.period.slice(0,4);
   return '<div class="itau-menu-row itau-card-bill" data-personal-bill="'+s.period+'" role="button" tabindex="0"><span class="name">'
    +'<strong>'+label+'</strong><span class="'+(s.status==='paid'?'visa-bill-paid':'visa-bill-open')+'">'
    +(s.status==='paid'?'✓ Đã thanh toán':'● Đang phát sinh')+'</span></span>'
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
 +box(statement.status==='paid'?'Ngày chốt':'Ngày chốt dự kiến',fmt(statement.closingDate))
 +box(statement.status==='paid'?'Hạn thanh toán':'Hạn thanh toán dự kiến',fmt(statement.dueDate))
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
 content.innerHTML=cardHead()+'<div class="personal-section-heading">Tài khoản & dịch vụ</div><div class="itau-list-menu">'
 +menuLine('Thẻ tín dụng Visa Gold','card','card')
 +menuLine('Thông tin tài khoản','account','account')
 +menuLine('iToken','itoken','itoken')
 +menuLine('Khoản đang chờ','pending','clock')
 +menuLine('Trợ giúp','help','help')
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

const HELP_TOPICS=[
 ['acesso','Mật khẩu & truy cập','Mật khẩu điện tử được sử dụng để acessar a conta. Nếu quên senha, có thể đăng ký lại tại caixa eletrônico Itaú bằng thẻ và giấy tờ cá nhân. Đừng chia sẻ senha qua tin nhắn hoặc điện thoại.','itoken'],
 ['fatura','Hóa đơn thẻ tín dụng','Vào Thẻ tín dụng để xem các faturas. Kỳ 07/2015 và 08/2015 đã thanh toán; kỳ 09/2015 đang phát sinh và chưa đến hạn.','card'],
 ['extrato','Tìm giao dịch trong sao kê','Mở Sao kê và chọn mês/ano, sau đó tìm theo tên đối tác hoặc mã tham chiếu. Sao kê tài khoản chỉ ghi nhận tiền ra khi thanh toán hóa đơn thẻ.','statement'],
 ['seguranca','Mất thẻ hoặc giao dịch lạ','Nếu thẻ bị thất lạc, hãy liên hệ ngay central de atendimento hoặc agência Itaú để được hỗ trợ khóa thẻ. Không cung cấp senha hay mã iToken cho người khác.','card'],
 ['conexao','Không thể kết nối','Kiểm tra kết nối di động/Wi-Fi rồi thử truy cập lại. Các giao dịch chưa được ngân hàng xác nhận không được xem là hoàn tất.','services'],
 ['sobre','Về aplicativo','Itaú 30 Horas · giao diện mô phỏng thời kỳ 2015. Nội dung tài khoản trong trải nghiệm này được lưu cục bộ.','services']
];
function renderIToken(){
 state.view='itoken';top('iToken',true);
 const token=state.demoToken;
 content.innerHTML='<div class="personal-token-top"><div class="personal-token-emblem">'+ico('itoken')+'</div>'
 +'<strong>iToken no aplicativo</strong><span class="personal-token-status"><b></b> Habilitado</span>'
 +'<p>Thiết bị: iPhone · đăng ký ngày 15/06/2015</p></div>'
 +'<div class="personal-token-panel"><div class="personal-token-label">Código de segurança · Mã xác thực</div>'
 +(token?'<div class="personal-token-digits" aria-label="Mã mô phỏng">'+html(token.slice(0,3))+' '+html(token.slice(3))+'</div>':'<div class="personal-token-placeholder">••• •••</div>')
 +'<p class="personal-token-disclaimer">Mã minh họa trong game, không có giá trị xác thực ngân hàng.</p>'
 +'<button type="button" class="personal-token-action" data-personal-token="'+(token?'hide':'generate')+'">'
 +(token?'Ẩn mã':'Hiển thị mã mô phỏng')+'</button>'
 +(token?'<button type="button" class="personal-token-refresh" data-personal-token="generate">'+ico('history')+' Tạo mã khác</button>':'')
 +'</div>'
 +'<div class="personal-token-tips"><div class="personal-tips-title">'+ico('help')+' Về iToken</div>'
 +'<p>iToken dùng để xác minh một số giao dịch trên internet và điện thoại. Mã trên ứng dụng ngân hàng thật được thay đổi định kỳ.</p>'
 +'<p>Itaú không yêu cầu khách hàng gửi mã iToken qua SMS, email hay tin nhắn.</p></div>';
 content.scrollTop=0;
}
function renderHelp(){
 state.view='help';top('Trợ giúp',true);
 content.innerHTML='<div class="personal-help-hero">'+ico('help')+'<div><strong>Como podemos ajudar?</strong><span>Trung tâm trợ giúp Itaú 30 Horas</span></div></div>'
 +'<div class="personal-help-section">Các câu hỏi thường gặp</div>'
 +'<div class="personal-help-faq">'+HELP_TOPICS.map(x=>'<div class="personal-help-item">'
 +'<button type="button" data-personal-faq="'+x[0]+'" aria-expanded="'+(state.helpTopic===x[0]?'true':'false')+'">'
 +'<span>'+html(x[1])+'</span><b class="'+(state.helpTopic===x[0]?'is-open':'')+'">⌄</b></button>'
 +(state.helpTopic===x[0]?'<div class="personal-help-answer"><p>'+html(x[2])+'</p>'
 +'<button type="button" class="personal-help-go" data-personal-go="'+x[3]+'">Mở chức năng liên quan <span>›</span></button></div>':'')
 +'</div>').join('')+'</div>'
 +'<div class="personal-help-section">Kênh hỗ trợ</div>'
 +'<div class="personal-help-footer">'+ico('account')+'<div><strong>Agência Itaú</strong><span>Hỗ trợ tài khoản và cartões trực tiếp tại chi nhánh.</span></div></div>'
 +'<div class="personal-help-note">Itaú 30 Horas · phiên bản mô phỏng năm 2015</div>';
 content.scrollTop=0;
}
function renderEmpty(){
 state.view='pending';top('Giao dịch đang chờ',true);
 content.innerHTML='<div class="itau-empty"><strong>Không có giao dịch đang chờ</strong><span>Không có lệnh mới nào cần xác nhận.</span></div>';
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
 case 'itoken':return renderIToken();case 'help':return renderHelp();case 'pending':return renderEmpty();
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
function closeApp(){state.demoToken=null;++revision;app.classList.remove('open');screen?.classList.remove('itau-open');accountMenu?.classList.remove('open');}
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
 const token=e.target.closest('[data-personal-token]');
 if(token){
  if(token.dataset.personalToken==='hide'){state.demoToken=null;}
  else{state.tokenCounter++;state.demoToken=String((673921+state.tokenCounter*7193)%1000000).padStart(6,'0');}
  renderIToken();return;
 }
 const faq=e.target.closest('[data-personal-faq]');
 if(faq){state.helpTopic=state.helpTopic===faq.dataset.personalFaq?null:faq.dataset.personalFaq;renderHelp();return;}
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
 if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-personal-go],[data-personal-bank],[data-personal-purchase],[data-personal-bill],[data-personal-faq],[data-personal-token]')){
  e.preventDefault();e.target.click();
 }
});
})();