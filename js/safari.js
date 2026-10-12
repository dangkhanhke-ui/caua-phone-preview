
(() => {
  const app = document.getElementById('safariApp');
  const page = document.getElementById('safariPage');
  const address = document.getElementById('safariAddress');
  const safariTopbar = document.getElementById('safariTopbar');
  const safariCancel = document.getElementById('safariCancel');
  const safariRefresh = document.getElementById('safariRefresh');
  const safariAddressClear = document.getElementById('safariAddressClear');
  const backBtn = document.getElementById('safariBack');
  const forwardBtn = document.getElementById('safariForward');
  const shareBtn = document.getElementById('safariShare');
  const bookmarksBtn = document.getElementById('safariBookmarks');
  const tabsBtn = document.getElementById('safariTabsBtn');
  const tabCount = document.getElementById('safariTabCount');
  const tabsView = document.getElementById('safariTabs');
  const overlay = document.getElementById('safariOverlay');
  const alertBox = document.getElementById('safariAlert');
  const alertOk = document.getElementById('safariAlertOk');
  const privatePanel = document.getElementById('safariPrivate');
  const privateDone = document.getElementById('safariPrivateDone');
  const launcher = document.querySelector('[data-app="safari"]') || [...document.querySelectorAll('.dock .app')].find(el => el.textContent.trim() === 'Safari');
  const homeButton = document.getElementById('homeButton');
  const screen = document.getElementById('screen');
  if (!app || !launcher) return;

  const SAFARI_IMAGES = {"vertice1":"./assets/safari/vertice1.png","lapa1":"./assets/safari/lapa1.png","lapa2":"./assets/safari/lapa2.png","lapa3":"./assets/safari/lapa3.png","santa1":"./assets/safari/santa1.png","santa2":"./assets/safari/santa2.png","santa3":"./assets/safari/santa3.png","subsolo1":"./assets/safari/subsolo1.png","subsolo2":"./assets/safari/subsolo2.png","subsolo3":"./assets/safari/subsolo3.png"};

  const BOOKMARKS = [
    {section:'Yêu thích', items:[
      B('Google','google.com.br','fav-google'),
      B('Facebook','facebook.com','stub-facebook'),
      B('Subsolo','subsolo.com.br','subsolo-home'),
      B('Agenda Rio','agendarioindependente.com.br','stub-agenda-rio')
    ]},
    {section:'Công việc', folder:true, items:[
      B('Itaú Empresas','itau.com.br/empresas','stub-itau-empresas'),
      B('Rede','userede.com.br','stub-rede'),
      B('Distribuidora Guanabara','guanabaradistribuidora.com.br','stub-guanabara'),
      B('Imóveis Cariocas','imoveiscariocas.com.br','stub-imoveis'),
      B('Prefeitura do Rio','rio.rj.gov.br','stub-rio-prefeitura')
    ]},
    {section:'Lịch sử', history:true}
  ];
  const READING_LIST = [
    {title:'Những sân khấu nhỏ giữ nhạc độc lập Rio sống', source:'Revista Pulso', date:'09/08/2015', state:'Đã đọc'},
    {title:'Giá thuê mặt bằng thương mại tại Centro và Lapa tiếp tục tăng', source:'Rio Negócios', date:'12/08/2015', state:'Đã đọc'},
    {title:'Giảm chi phí điện cho bar và nhà hàng', source:'Negócio & Bar', date:'14/08/2015', state:'Đã đọc'}
  ];
  function H(time,title,domain,type,query='',targetPageId='') { return {time,title,domain,type,query,targetPageId}; }
  function B(title,url,targetPageId) { return {title,url,targetPageId}; }
  
const SAFARI_HISTORY = [
  {day:'23/08/2015', items:[
    H('17:42','đá viên giao tận nơi Rio','google.com.br','search','đá viên giao tận nơi Rio'),
    H('17:38','Distribuidora Guanabara','guanabaradistribuidora.com.br','stub','', 'stub-guanabara'),
    H('16:55','cốc nhựa 300ml giá sỉ Rio','google.com.br','search','cốc nhựa 300ml giá sỉ Rio'),
    H('15:17','Diego Vasconcelos DJ','google.com.br','search','Diego Vasconcelos DJ'),
    H('13:04','Agenda Rio Independente','agendarioindependente.com.br','stub','', 'stub-agenda-rio'),
    H('11:28','thuê máy chiếu Rio','google.com.br','search','thuê máy chiếu Rio'),
    H('11:19','dây HDMI 10m Rio','google.com.br','search','dây HDMI 10m Rio')
  ]},
  {day:'22/08/2015', items:[
    H('18:51','mặt bằng thương mại Lapa cho thuê','google.com.br','page','mặt bằng thương mại Lapa cho thuê', 'search-results-lapa'),
    H('18:47','Mặt bằng thương mại - Lapa','imoveiscariocas.com.br','page','', 'property-lapa'),
    H('18:34','Mặt bằng thương mại - Santa Teresa','imoveiscariocas.com.br','page','', 'property-santa'),
    H('18:22','địa điểm sự kiện thuê dài hạn Rio','google.com.br','search','địa điểm sự kiện thuê dài hạn Rio'),
    H('17:58','sức chứa không gian sự kiện 150 người','google.com.br','search','sức chứa không gian sự kiện 150 người'),
    H('14:16','tủ lạnh công nghiệp cũ Rio','google.com.br','search','tủ lạnh công nghiệp cũ Rio')
  ]},
  {day:'21/08/2015', items:[
    H('19:27','thiết bị âm thanh cũ Rio de Janeiro','google.com.br','search','thiết bị âm thanh cũ Rio de Janeiro'),
    H('19:19','loa kiểm âm sân khấu cũ','google.com.br','search','loa kiểm âm sân khấu cũ'),
    H('18:56','Banda Maré Baixa','google.com.br','search','Banda Maré Baixa'),
    H('15:10','Distribuidora Guanabara','guanabaradistribuidora.com.br','stub','', 'stub-guanabara'),
    H('14:51','phí hủy đặt địa điểm sự kiện','google.com.br','search','phí hủy đặt địa điểm sự kiện'),
    H('12:06','Subsolo','subsolo.com.br','page','', 'subsolo-home')
  ]},
  {day:'20/08/2015', items:[
    H('22:41','Estúdio Vértice','google.com.br','page','Estúdio Vértice', 'search-results-henrique'),
    H('22:39','Chủ Estúdio Vértice tiếp tục hồi phục sau vụ cháy','santateresahoje.com.br','page','', 'article-vertice'),
    H('22:34','Henrique Matheus Ribeiro Lima','google.com.br','page','Henrique Matheus Ribeiro Lima', 'search-results-henrique'),
    H('22:28','vụ cháy studio Santa Teresa tháng 5','google.com.br','page','vụ cháy studio Santa Teresa tháng 5', 'search-results-vertice-fire'),
    H('16:07','bảo hiểm quán bar Rio','google.com.br','search','bảo hiểm quán bar Rio'),
    H('15:53','Porto Seguro - doanh nghiệp','portoseguro.com.br','stub','', 'stub-porto')
  ]},
  {day:'19/08/2015', items:[
    H('20:18','Henrique Ribeiro tatuador','google.com.br','page','Henrique Ribeiro tatuador', 'search-results-henrique'),
    H('20:14','Chủ Estúdio Vértice tiếp tục hồi phục sau vụ cháy','santateresahoje.com.br','page','', 'article-vertice'),
    H('18:31','freezer ngang cũ Rio','google.com.br','search','freezer ngang cũ Rio'),
    H('17:45','máy làm đá quán bar cũ','google.com.br','search','máy làm đá quán bar cũ'),
    H('14:21','Rede','userede.com.br','stub','', 'stub-rede')
  ]},
  {day:'18/08/2015', items:[
    H('18:21','micro Shure cũ Rio','google.com.br','search','micro Shure cũ Rio'),
    H('18:10','chân micro sân khấu','google.com.br','search','chân micro sân khấu'),
    H('16:48','Diego Vasconcelos','google.com.br','search','Diego Vasconcelos'),
    H('15:04','kế toán Simples Nacional bar Rio','google.com.br','search','kế toán Simples Nacional bar Rio'),
    H('12:32','Itaú Empresas','itau.com.br','stub','', 'stub-itau-empresas')
  ]},
  {day:'17/08/2015', items:[
    H('21:42','giá sửa mái nhà cũ Rio','google.com.br','search','giá sửa mái nhà cũ Rio'),
    H('21:36','thợ điện Santa Teresa Rio','google.com.br','search','thợ điện Santa Teresa Rio'),
    H('21:30','sửa hệ thống điện nhà cũ giá','google.com.br','search','sửa hệ thống điện nhà cũ giá'),
    H('18:03','Distribuidora Guanabara','guanabaradistribuidora.com.br','stub','', 'stub-guanabara'),
    H('13:57','in vòng tay sự kiện Rio','google.com.br','search','in vòng tay sự kiện Rio')
  ]},
  {day:'16/08/2015', items:[
    H('20:24','mặt bằng thương mại Santa Teresa cho thuê','google.com.br','page','mặt bằng thương mại Santa Teresa cho thuê', 'search-results-santa'),
    H('20:18','Mặt bằng thương mại - Santa Teresa','imoveiscariocas.com.br','page','', 'property-santa'),
    H('20:01','nhà kho nhỏ cho thuê Rio','google.com.br','search','nhà kho nhỏ cho thuê Rio'),
    H('19:52','không gian sự kiện thuê theo tháng Rio','google.com.br','search','không gian sự kiện thuê theo tháng Rio'),
    H('17:18','âm thanh sân khấu cho 100 người','google.com.br','search','âm thanh sân khấu cho 100 người')
  ]},
  {day:'15/08/2015', items:[
    H('19:46','thiết bị cho bar có nhạc sống Rio','google.com.br','search','thiết bị cho bar có nhạc sống Rio'),
    H('18:33','Agenda Rio Independente','agendarioindependente.com.br','stub','', 'stub-agenda-rio'),
    H('14:57','nhà hàng Santa Teresa','google.com.br','search','nhà hàng Santa Teresa'),
    H('09:12','Rio Agora - Thành phố','rioagora.com.br','stub','', 'stub-rio-agora')
  ]},
  {day:'14/08/2015', items:[
    H('20:16','bàn mixer 12 kênh cũ Rio','google.com.br','search','bàn mixer 12 kênh cũ Rio'),
    H('19:50','loa kiểm âm chủ động cũ Rio','google.com.br','search','loa kiểm âm chủ động cũ Rio'),
    H('17:31','Banda Maré Baixa','google.com.br','search','Banda Maré Baixa'),
    H('15:02','Agenda Rio Independente','agendarioindependente.com.br','stub','', 'stub-agenda-rio')
  ]},
  {day:'13/08/2015', items:[
    H('21:07','mặt bằng thương mại Centro Rio 200m²','google.com.br','search','mặt bằng thương mại Centro Rio 200m²'),
    H('20:54','Imóveis Cariocas','imoveiscariocas.com.br','stub','', 'stub-imoveis'),
    H('18:20','giá thuê địa điểm tổ chức sự kiện Rio','google.com.br','search','giá thuê địa điểm tổ chức sự kiện Rio'),
    H('16:11','cách âm quán bar chi phí','google.com.br','search','cách âm quán bar chi phí')
  ]},
  {day:'12/08/2015', items:[
    H('19:03','máy POS Rede lỗi kết nối','google.com.br','search','máy POS Rede lỗi kết nối'),
    H('18:51','Rede - hỗ trợ','userede.com.br','stub','', 'stub-rede'),
    H('16:44','máy lạnh công nghiệp bar','google.com.br','search','máy lạnh công nghiệp bar'),
    H('15:12','bảo trì điều hòa Rio','google.com.br','search','bảo trì điều hòa Rio')
  ]},
  {day:'11/08/2015', items:[
    H('18:22','Banda Maré Baixa','google.com.br','search','Banda Maré Baixa'),
    H('16:08','giá thuê ban nhạc Rio','google.com.br','search','giá thuê ban nhạc Rio'),
    H('14:51','Agenda Rio Independente','agendarioindependente.com.br','stub','', 'stub-agenda-rio'),
    H('12:44','Subsolo','subsolo.com.br','page','', 'subsolo-home')
  ]},
  {day:'10/08/2015', items:[
    H('20:14','nhân viên bảo vệ sự kiện Rio','google.com.br','search','nhân viên bảo vệ sự kiện Rio'),
    H('19:58','thuê bảo vệ bar cuối tuần','google.com.br','search','thuê bảo vệ bar cuối tuần'),
    H('17:27','Distribuidora Guanabara','guanabaradistribuidora.com.br','stub','', 'stub-guanabara')
  ]},
  {day:'16/07/2015', items:[H('10:41','Estúdio Vértice - cập nhật sức khỏe Henrique Ribeiro','santateresahoje.com.br','page','', 'article-vertice')]},
  {day:'23/06/2015', items:[H('11:27','Henrique Ribeiro Estúdio Vértice','google.com.br','page','Henrique Ribeiro Estúdio Vértice', 'search-results-henrique')]},
  {day:'04/06/2015', items:[H('09:52','vụ cháy Estúdio Vértice','google.com.br','page','vụ cháy Estúdio Vértice', 'search-results-vertice-fire')]},
  {day:'01/06/2015', items:[H('18:03','Estúdio Vértice','google.com.br','page','Estúdio Vértice', 'search-results-vertice-fire')]}
];


  const state = { initialized:false, currentTabId:null, tabs:[] };
  // A real iOS 8 Safari keeps ordinary tabs separate from private tabs.
  // Only ordinary browsing is written to persistent storage.
  const TABS_KEY='caua.safari.ios8.tabs.v2';
  const HISTORY_KEY='caua.safari.ios8.visits.v2';
  let privateMode=false, privateTabs=[], privateCurrentId=null, normalTabs=[], normalCurrentId=null;
  let historyState={cleared:false,visits:[]}, sessionTimer=0;
  try {
    const h=JSON.parse(localStorage.getItem(HISTORY_KEY)||'null');
    if(h && Array.isArray(h.visits))historyState={
      cleared:!!h.cleared, visits:h.visits.filter(v=>v&&typeof v.title==='string').slice(0,160)
    };
  }catch(e){}
  function storeHistory(){try{localStorage.setItem(HISTORY_KEY,JSON.stringify(historyState))}catch(e){}}
  function safeTab(t) {
    if(!t || !Array.isArray(t.historyStack) || !t.historyStack.length)return null;
    const stack=t.historyStack.slice(-65).filter(e=>e && typeof e.pageId==='string' &&
      /^[a-z0-9-]{1,55}$/.test(e.pageId)).map(e=>({
        pageId:e.pageId,title:String(e.title||'').slice(0,180),
        url:String(e.url||'').slice(0,500),
        scroll:Math.max(0,Number(e.scroll)||0),
        extra:(e.extra&&typeof e.extra==='object'&&!Array.isArray(e.extra))?e.extra:{}
      }));
    if(!stack.length)return null;
    return {id:String(t.id||'t'+Math.random()).slice(0,40),title:String(t.title||'').slice(0,180),
      historyStack:stack,historyIndex:Math.min(stack.length-1,Math.max(0,Number(t.historyIndex)||0))};
  }
  function saveSession() {
    if(!state.initialized)return;
    const tabs=privateMode?normalTabs:state.tabs, selected=privateMode?normalCurrentId:state.currentTabId;
    if(!tabs.length)return;
    try{localStorage.setItem(TABS_KEY,JSON.stringify({tabs,currentTabId:selected}))}catch(e){}
  }
  function scheduleSession() {
    if(privateMode || !state.initialized)return;
    clearTimeout(sessionTimer);sessionTimer=setTimeout(saveSession,180);
  }
  function setPrivateMode(on) {
    if(privateMode===!!on)return;
    saveScroll();
    if(on) {
      normalTabs=state.tabs;normalCurrentId=state.currentTabId;
      state.tabs=privateTabs.length?privateTabs:[{id:'private-1',title:'Tab mới',
        historyStack:[makeEntry('new-tab')],historyIndex:0}];
      state.currentTabId=privateCurrentId||state.tabs[0].id;
    } else {
      privateTabs=state.tabs;privateCurrentId=state.currentTabId;
      state.tabs=normalTabs;state.currentTabId=normalCurrentId;
      normalTabs=[];normalCurrentId=null;
    }
    privateMode=!!on;
    app.classList.toggle('safari-private-mode',privateMode);
    screen?.classList.toggle('safari-private-mode',privateMode);
    hideOverlay();
    renderCurrent(true);
    if(!privateMode)saveSession();
  }
  function visitPage(entry) {
    if(privateMode || !entry || /^(new-tab|bookmarks|reading-list|shared-links|history-view)$/.test(entry.pageId))return;
    const url=String(entry.url||'');
    if(!url)return;
    const name=String(entry.title||pageMeta(entry.pageId,entry.extra).title||url);
    const item={time:'14:20',title:name,domain:url.split('/')[0],type:entry.pageId.startsWith('search-')?'search':'page',
      query:entry.extra?.query||'',targetPageId:entry.pageId,url,extra:entry.extra||{}};
    historyState.visits=historyState.visits.filter(v=>v.url!==url);
    historyState.visits.unshift(item);
    historyState.visits.length=Math.min(160,historyState.visits.length);
    storeHistory();
  }
  function historyGroups() {
    const historical=historyState.cleared?[]:SAFARI_HISTORY;
    return historyState.visits.length?
      [{day:'29/08/2015',items:historyState.visits},...historical]:historical;
  }
  function clearSafariHistory(){
    historyState={cleared:true,visits:[]};storeHistory();
    if(currentEntry()?.pageId==='history-view')renderCurrent(true);
  }
  function showConfirm(message, acceptLabel, action) {
    showOverlay('<div class="safari-confirm" role="dialog" aria-modal="true"><div class="safari-confirm-message">'+esc(message)+
      '</div><button type="button" data-confirm-yes>'+esc(acceptLabel)+'</button>'+
      '<button type="button" data-confirm-cancel>Hủy</button></div>');
    overlay.querySelector('[data-confirm-yes]')?.addEventListener('click',()=>{hideOverlay();action()});
    overlay.querySelector('[data-confirm-cancel]')?.addEventListener('click',hideOverlay);
  }


  const SAVED_KEY='caua.safari.phase2.saved.v1';
  let userSaved={bookmarks:[],reading:[]};
  let editSaved=false, historyDisplay=[];
  try{
    const v=JSON.parse(localStorage.getItem(SAVED_KEY)||'null');
    if(v&&Array.isArray(v.bookmarks)&&Array.isArray(v.reading))userSaved=v;
  }catch(e){}
  function saveUserPages(){
    try{localStorage.setItem(SAVED_KEY,JSON.stringify(userSaved))}catch(e){}
  }
  function saveCurrentPage(mode){
    const entry=currentEntry();if(!entry)return;
    const name=entry.title||pageMeta(entry.pageId,entry.extra).title||'Trang web';
    const url=entry.url||entry.extra?.url||'';
    const item={title:String(name),url:String(url),pageId:String(entry.pageId),extra:entry.extra||{}};
    const key=mode==='reading'?'reading':'bookmarks', items=userSaved[key];
    const old=items.find(x=>x.url===item.url && x.pageId===item.pageId);
    if(old){old.title=item.title;old.extra=item.extra||{};if(mode==='favorite')old.favorite=true;}
    else {if(mode==='favorite')item.favorite=true;items.unshift(item);if(items.length>100)items.length=100;}
    saveUserPages();
  }


  function normalize(s='') { return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
  function esc(s='') { return String(s).replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
  function closeOtherApps() {
    ['notesApp','mailApp','itauApp','itauBizApp'].forEach(id=>document.getElementById(id)?.classList.remove('open'));
    screen?.classList.remove('mail-open'); screen?.classList.remove('itau-open'); screen?.classList.remove('itau-biz-open');
  }
  function makeEntry(pageId, extra={}) {
    const meta = pageMeta(pageId, extra);
    return { pageId, url:meta.url, title:meta.title, scroll:extra.scroll || 0, extra };
  }
  function initTabs() {
    state.tabs = [
      { id:'t1', title:'Subsolo', historyStack:[makeEntry('subsolo-home',{scroll:360})], historyIndex:0 },
      { id:'t3', title:'Chủ Estúdio Vértice tiếp tục hồi phục sau vụ cháy', historyStack:[makeEntry('article-vertice')], historyIndex:0 },
      { id:'t4', title:'Mặt bằng thương mại - Santa Teresa', historyStack:[makeEntry('property-santa',{scroll:250})], historyIndex:0 },
      { id:'t5', title:'Khảo sát sớm cho thấy cuộc đua thị trưởng Rio năm 2016 vẫn còn rộng mở', historyStack:[makeEntry('radar-rio-poll')], historyIndex:0 },
      { id:'t6', title:'Braga lại đối mặt chỉ trích về bồi thường trong dự án tái phát triển', historyStack:[makeEntry('caderno-braga')], historyIndex:0 },
      { id:'t7', title:'Intranet UFRJ', historyStack:[makeEntry('ufrj-intranet')], historyIndex:0 }
    ];
    state.currentTabId = 't7';
    try{
      const saved=JSON.parse(localStorage.getItem(TABS_KEY)||'null');
      if(saved && Array.isArray(saved.tabs)){
        const tabs=saved.tabs.slice(0,24).map(safeTab).filter(Boolean);
        if(tabs.length){
          state.tabs=tabs;
          state.currentTabId=tabs.some(t=>t.id===saved.currentTabId)?saved.currentTabId:tabs[0].id;
        }
      }
    }catch(e){}
    state.initialized = true;
  }
  function currentTab() { return state.tabs.find(t => t.id === state.currentTabId); }
  function currentEntry() { const tab=currentTab(); return tab.historyStack[tab.historyIndex]; }
  function saveScroll() { const e=currentEntry(); if(e){e.scroll=page.scrollTop;scheduleSession();} }
  function pageMeta(pageId, extra={}) {
    const map = {
      'property-lapa': ['Mặt bằng thương mại - Lapa','imoveiscariocas.com.br/imovel/rua-do-lavradio-lapa-1847'],
      'property-santa': ['Mặt bằng thương mại - Santa Teresa','imoveiscariocas.com.br/imovel/santa-teresa-180m2-1922'],
      'article-vertice': ['Chủ Estúdio Vértice tiếp tục hồi phục sau vụ cháy','santateresahoje.com.br/cidade/vertice-recuperacao-henrique'],
      'subsolo-home': ['Subsolo','subsolo.com.br'],
      'article-vinculo-investigation': ['Cảnh sát xác minh hoạt động của hội kín sinh viên Vínculo Humano','rioagora.com.br/cidade/policia-verifica-grupo-vinculo-humano'],
      'radar-rio-poll': ['Khảo sát sớm cho thấy cuộc đua thị trưởng Rio năm 2016 vẫn còn rộng mở','radarrio.com.br/politica/eleicoes-2016-pesquisa-cenario'],
      'caderno-braga': ['Braga lại đối mặt chỉ trích về bồi thường trong dự án tái phát triển','cadernourbano.com.br/cidade/braga-compensacoes-reurbanizacao'],
      'ufrj-intranet': ['Intranet UFRJ','intranet.ufrj.br'],
      'google-home': ['Google','google.com.br'],
      'search-results-lapa': ['mặt bằng thương mại Lapa cho thuê','google.com.br/search?q=mặt+bằng+thương+mại+Lapa+cho+thuê'],
      'search-results-santa': ['mặt bằng thương mại Santa Teresa cho thuê','google.com.br/search?q=mặt+bằng+thương+mại+Santa+Teresa+cho+thuê'],
      'search-results-henrique': ['Henrique Matheus Ribeiro Lima','google.com.br/search?q=Henrique+Matheus+Ribeiro+Lima'],
      'search-results-vertice-fire': ['vụ cháy studio Santa Teresa tháng 5','google.com.br/search?q=vụ+cháy+studio+Santa+Teresa+tháng+5'],
      'bookmarks': ['Dấu trang',''], 'reading-list':['Danh sách đọc',''], 'shared-links':['Liên kết được chia sẻ',''], 'history-view':['Lịch sử',''], 'new-tab':['Tab mới',''],
      'stub-page':['','']
    };
    if(pageId==='search-generic') return {title: extra.query || 'Google', url:'google.com.br/search?q=' + encodeURIComponent(extra.query || '')};
    if(pageId==='stub-page') return {title: extra.title || 'Trang', url: extra.url || extra.domain || ''};
    const val = map[pageId] || ['Safari',''];
    return { title:val[0], url:val[1] };
  }

  function openApp() {
    if(!state.initialized) initTabs();
    closeOtherApps();
    app.classList.add('open'); screen?.classList.add('safari-open');
    renderCurrent(false);
  }
  function closeApp() { if(!app.classList.contains('open')) return; saveScroll(); saveSession(); hideOverlay(); hideSafariTabOverview(); privatePanel.classList.remove('show'); app.classList.remove('open'); screen?.classList.remove('safari-open'); }
  launcher.addEventListener('click', openApp);
  homeButton?.addEventListener('click', closeApp);
  page.addEventListener('scroll', () => { const e=currentEntry(); if(e){e.scroll=page.scrollTop;scheduleSession();} }, {passive:true});

  function navigate(pageId, extra={}, push=true) {
    const tab = currentTab(); if(!tab) return;
    saveScroll();
    const entry = makeEntry(pageId, extra);
    if(push) {
      tab.historyStack = tab.historyStack.slice(0, tab.historyIndex + 1);
      tab.historyStack.push(entry); tab.historyIndex = tab.historyStack.length - 1;
    } else {
      tab.historyStack[tab.historyIndex] = entry;
    }
    visitPage(entry);
    renderCurrent(false);
  }
  function goBack() { const tab=currentTab(); if(!tab || tab.historyIndex===0) return; saveScroll(); tab.historyIndex--; renderCurrent(true); }
  function goForward() { const tab=currentTab(); if(!tab || tab.historyIndex>=tab.historyStack.length-1) return; saveScroll(); tab.historyIndex++; renderCurrent(true); }
  backBtn.addEventListener('click', goBack); forwardBtn.addEventListener('click', goForward);
  shareBtn.addEventListener('click', () => showShareSheet());
  bookmarksBtn.addEventListener('click', () => navigate('bookmarks'));
  tabsBtn.addEventListener('click', () => showTabs());
  alertOk.addEventListener('click', hideOverlay);
  privateDone.addEventListener('click', () => privatePanel.classList.remove('show'));

  function setSafariAddressEditing(on) { safariTopbar?.classList.toggle('editing', !!on); }
  address.addEventListener('focus', () => { setSafariAddressEditing(true); setTimeout(() => address.select(), 10); });
  address.addEventListener('blur', () => setTimeout(() => { if(document.activeElement !== address) setSafariAddressEditing(false); }, 20));
  address.addEventListener('input', () => safariAddressClear?.classList.toggle('has-value', !!address.value));
  address.addEventListener('keydown', e => { if(e.key==='Enter') { e.preventDefault(); performAddressSearch(address.value.trim()); address.blur(); } });
  safariCancel?.addEventListener('pointerdown', e => e.preventDefault());
  safariCancel?.addEventListener('click', () => { const entry=currentEntry(); address.value=(entry?.pageId?.startsWith('search-') ? (entry.extra.query || entry.title) : (entry?.url || entry?.title || '')); setSafariAddressEditing(false); address.blur(); });
  safariAddressClear?.addEventListener('pointerdown', e => e.preventDefault());
  safariAddressClear?.addEventListener('click', () => { address.value=''; address.focus(); });
  safariRefresh?.addEventListener('click', () => renderCurrent(true));

  function performAddressSearch(raw) {
    const q = raw.trim(); if(!q) return;
    const n = normalize(q);
    if(/^(?:https?:\/\/)?(?:www\.)?google\.com(?:\.br)?\/?(?:\?.*)?$/i.test(q)||n==='google')return navigate('google-home');
    if(n.includes('santateresahoje.com.br')||n.includes('estudiovertice.com.br'))return navigate('article-vertice');
    if(n.includes('imoveiscariocas.com.br/imovel/rua-do-lavradio'))return navigate('property-lapa');
    if(n.includes('imoveiscariocas.com.br/imovel/santa-teresa'))return navigate('property-santa');
    if(n.includes('imoveiscariocas.com.br/imovel/lapa') || (n.includes('lapa') && n.includes('imove'))) return navigate('property-lapa');
    if(n.includes('imoveiscariocas.com.br/imovel/santa') || (n.includes('santa teresa') && n.includes('imove'))) return navigate('property-santa');
    if(n==='subsolo' || n.includes('subsolo.com.br')) return navigate('subsolo-home');
    if(n.includes('rioagora.com.br') || n.includes('vinculo humano')) return navigate('article-vinculo-investigation');
    if(n.includes('radarrio.com.br') || n==='radar rio') return navigate('radar-rio-poll');
    if(n.includes('cadernourbano.com.br') || n==='caderno urbano') return navigate('caderno-braga');
    if(n.includes('intranet.ufrj.br') || n.includes('siga.ufrj') || n==='ufrj intranet') return navigate('ufrj-intranet');
    if(n.includes('henrique') || n.includes('vertice')) {
      if(n.includes('chay') || n.includes('cháy') || n.includes('maio') || n.includes('thang 5')) return navigate('search-results-vertice-fire');
      return navigate('search-results-henrique');
    }
    if(n.includes('mặt bằng') || n.includes('mat bang')) {
      if(n.includes('santa teresa')) return navigate('search-results-santa');
      if(n.includes('lapa')) return navigate('search-results-lapa');
    }
    const looksLikeUrl=/^(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[/:?#]|$)/i.test(q);
    if(looksLikeUrl){
      let u;try{u=new URL(/^https?:\/\//i.test(q)?q:'https://'+q)}catch(e){}
      if(u && /^https?:$/.test(u.protocol)){
        return navigate('stub-page',{title:u.hostname,url:u.hostname+u.pathname+u.search,
          domain:u.hostname,body:'Safari không thể mở trang vì không kết nối được tới máy chủ.'});
      }
    }
    navigate('search-generic', {query:q});
  }

  function renderCurrent(restore) {
    const tab = currentTab(); if(!tab) return;
    const entry = currentEntry();
    address.value = (entry.pageId.startsWith('search-') ? (entry.extra.query || entry.title) : (entry.url || entry.title || ''));
    const meta = pageMeta(entry.pageId, entry.extra);
    tab.title = meta.title;
    page.innerHTML = renderPage(entry);
    page.classList.toggle('safari-reader-mode',!!entry.extra?.reader);
    page.classList.toggle('safari-desktop-mode',!!entry.extra?.desktop);
    bindPage();
    if(typeof updateSafariReaderButton==='function')updateSafariReaderButton();
    backBtn.disabled = tab.historyIndex === 0;
    forwardBtn.disabled = tab.historyIndex >= tab.historyStack.length - 1;
    tabCount.textContent = state.tabs.length;
    app.classList.toggle('safari-private-mode',privateMode);
    screen?.classList.toggle('safari-private-mode',privateMode);
    saveSession();
    requestAnimationFrame(() => { page.scrollTop = restore ? (entry.scroll || 0) : (entry.extra.scroll || 0); });
  }


  // Open a shared URL in Safari without navigating outside the phone.
  window.addEventListener('caua:safari-open-url',event=>{
    const url=String(event.detail?.url||'').trim();
    if(!url)return;
    openApp();
    const id='t'+Date.now()+'-'+Math.floor(Math.random()*999);
    state.tabs.push({id,title:'Tab mới',historyStack:[makeEntry('new-tab')],historyIndex:0});
    state.currentTabId=id;
    performAddressSearch(url);
  });
  function showOverlay(inner) { overlay.innerHTML = inner; overlay.classList.add('show'); }
  function hideOverlay() { overlay.classList.remove('show'); overlay.innerHTML=''; alertBox.classList.remove('show'); }
  overlay.addEventListener('click', e => { if(e.target === overlay) hideOverlay(); });

  function showShareSheet() {
    const e=currentEntry();if(!e)return;
    const url=e.url||e.extra?.url||'';
    if(!url){toastSafari('Mở một trang web trước khi chia sẻ.');return;}
    const socials=[['Tin nhắn','✉'],['Mail','✉'],['WhatsApp','◉'],['Facebook','f']];
    const actions=[['Thêm vào Danh sách đọc','◎'],['Thêm dấu trang','▣'],
      ['Thêm vào Mục ưa thích','★'],['Sao chép','▤'],
      ['Thêm vào Màn hình chính','⊞'],['Yêu cầu trang web cho máy tính','▱']];
    showOverlay('<div class="safari-ios8-share" role="dialog" aria-label="Chia sẻ">'+
      '<div class="safari-ios8-share-preview"><strong>'+esc(e.title)+'</strong>'+
      '<span>'+esc(url)+'</span></div>'+
      '<div class="safari-ios8-share-social">'+socials.map(x=>'<button type="button" data-saf-action="'+esc(x[0])+'"><i>'+esc(x[1])+'</i>'+esc(x[0])+'</button>').join('')+'</div>'+
      '<div class="safari-ios8-share-actions">'+actions.map(x=>'<button type="button" data-saf-action="'+esc(x[0])+'"><i>'+esc(x[1])+'</i>'+esc(x[0])+'</button>').join('')+'</div>'+
      '<button type="button" class="safari-ios8-share-cancel" data-saf-close>Hủy</button></div>');
    overlay.querySelectorAll('[data-saf-action]').forEach(btn=>btn.addEventListener('click',()=>{
      const act=btn.dataset.safAction,title=e.title;hideOverlay();
      const routes={'Tin nhắn':'messages','Mail':'mail','WhatsApp':'whatsapp','Facebook':'facebook'};
      if(routes[act]){
        const ok=window.CauaCrossApp?.shareLink(routes[act],title,url);
        if(!ok)toastSafari('Không thể mở ứng dụng chia sẻ.');return;
      }
      if(act==='Thêm dấu trang'){saveCurrentPage('bookmarks');toastSafari('Đã thêm dấu trang.');}
      if(act==='Thêm vào Mục ưa thích'){saveCurrentPage('favorite');toastSafari('Đã thêm vào Mục ưa thích.');}
      if(act==='Thêm vào Danh sách đọc'){saveCurrentPage('reading');toastSafari('Đã thêm vào Danh sách đọc.');}
      if(act==='Sao chép'){window.CauaCrossApp?.copy('https://'+url.replace(/^https?:\/\//,''));toastSafari('Đã sao chép liên kết.');}
      if(act==='Thêm vào Màn hình chính')promptHomeClip(e);
      if(act==='Yêu cầu trang web cho máy tính')toggleDesktop();
    }));
    overlay.querySelector('[data-saf-close]')?.addEventListener('click',hideOverlay);
  }

  function hideSafariTabOverview(){
    tabsView.classList.remove('show');
    app.classList.remove('tabs-mode');
    screen?.classList.remove('safari-tabs-open');
  }

  function showTabs(opts={}) {
    app.classList.add('tabs-mode');
    screen?.classList.add('safari-tabs-open');
    tabsView.classList.add('show');

    const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const escapeTabId=t=>esc(String(t));
    tabsView.innerHTML = `<div class="safari-tab-stack safari-ios8-perspective" role="list" aria-label="Các tab Safari">${state.tabs.map((t,i) => {
      const e=t.historyStack[t.historyIndex];
      const meta=pageMeta(e.pageId,e.extra);
      const host=(meta.url || meta.title || '').replace(/^https?:\/\//,'').split('/')[0] || meta.title || 'Tab';
      const id=escapeTabId(t.id);
      const depth=(i-state.tabs.length+1)*7;
      const zoom=(.962+i/Math.max(1,state.tabs.length-1)*.032).toFixed(3);
      return `<section class="safari-tab-card safari-ios8-card ${t.id===state.currentTabId?'active':''}"
          data-tabid="${id}" role="listitem"
          aria-label="Tab: ${esc(host)}"
          style="--saf-layer:${i+1};--saf-depth:${depth}px;--saf-scale:${zoom};--saf-delay:${i*24}ms">
        <div class="safari-tab-sheet">
          <div class="chrome">
            <button class="close" data-close-tab="${id}" type="button"
                aria-label="Đóng tab ${esc(host)}">×</button>
            <span class="safari-tab-host">${esc(host)}</span>
          </div>
          <div class="thumb">
            <div class="safari-snapshot-website">${thumbForPage(e.pageId,e.extra)}</div>
            <div class="safari-snapshot-copy"><b>${esc(meta.title)}</b><span>${esc(host)}</span></div>
          </div>
        </div>
      </section>`;
    }).join('')}</div>
    <div class="safari-tabs-bottom">
      <button id="safariPrivateToggle" type="button">${privateMode?"Private ✓":"Private"}</button>
      <button id="safariNewTab" type="button" aria-label="Tab mới">＋</button>
      <button id="safariTabsDone" type="button">Done</button>
    </div>`;

    const stack=tabsView.querySelector('.safari-tab-stack');
    const reveal=()=>{
      if(!stack?.isConnected || !tabsView.classList.contains('show'))return;
      if(typeof opts.scroll==='number'){
        stack.scrollTop=opts.scroll;
      }else{
        const selected=[...stack.querySelectorAll('[data-tabid]')].find(card=>card.dataset.tabid===state.currentTabId);
        if(selected){
          const target=selected.offsetTop-stack.offsetTop-stack.clientHeight*.58;
          stack.scrollTop=Math.max(0,target);
        }
      }
      // Tab overview appears immediately, without entrance animation.
    };
    requestAnimationFrame(reveal);

    const selectTab=card=>{
      if(!card || tabsView.dataset.busy==='1')return;
      tabsView.dataset.busy='1';
      saveScroll();
      state.currentTabId=card.dataset.tabid;
      hideSafariTabOverview();
      renderCurrent(true);
      tabsView.dataset.busy='';
    };
    stack.querySelectorAll('.safari-tab-card').forEach(card=>{
      card.addEventListener('click',ev=>{
        if(ev.target.closest('[data-close-tab]'))return;
        selectTab(card);
      });
      card.addEventListener('keydown',ev=>{
        if(ev.target!==card || (ev.key!=='Enter'&&ev.key!==' '))return;
        ev.preventDefault();selectTab(card);
      });
      card.setAttribute('tabindex','0');
    });

    stack.querySelectorAll('[data-close-tab]').forEach(btn=>btn.addEventListener('click',ev=>{
      ev.stopPropagation();
      if(tabsView.dataset.busy==='1')return;
      tabsView.dataset.busy='1';
      const sc=stack.scrollTop;
      const id=btn.dataset.closeTab;
      state.tabs=state.tabs.filter(t=>t.id!==id);
      if(!state.tabs.length)state.tabs=[{id:'t'+Date.now(),title:'Tab mới',historyStack:[makeEntry('new-tab')],historyIndex:0}];
      if(state.currentTabId===id)state.currentTabId=state.tabs[state.tabs.length-1].id;
      tabsView.dataset.busy='';
      showTabs({scroll:sc,instant:true});
      renderCurrent(true);
    }));

    tabsView.querySelector('#safariNewTab').addEventListener('click',()=>{
      if(tabsView.dataset.busy==='1')return;
      const id='t'+Date.now()+'-'+Math.floor(Math.random()*999);
      state.tabs.unshift({id,title:'Tab mới',historyStack:[makeEntry('new-tab')],historyIndex:0});
      state.currentTabId=id;
      hideSafariTabOverview();renderCurrent(false);
    });
    tabsView.querySelector('#safariPrivateToggle').addEventListener('click',()=>{
      setPrivateMode(!privateMode);showTabs();
    });
    tabsView.querySelector('#safariTabsDone').addEventListener('click',()=>{
      hideSafariTabOverview();
    });
  }

  function thumbForPage(pageId, extra={}) {
    if(pageId==='property-lapa') return `<img src="${SAFARI_IMAGES.lapa1}" alt="">`;
    if(pageId==='property-santa') return `<img src="${SAFARI_IMAGES.santa1}" alt="">`;
    if(pageId==='article-vertice') return `<img src="${SAFARI_IMAGES.vertice1}" alt="">`;
    if(pageId==='subsolo-home') return `<img src="${SAFARI_IMAGES.subsolo1}" alt="">`;
    if(pageId==='article-vinculo-investigation') return `<div style="height:100%;display:grid;place-items:center;background:#fff;color:#333;font-size:14px;font-weight:600;">Rio Agora</div>`;
    if(pageId==='radar-rio-poll') return `<div style="height:100%;display:grid;place-items:center;background:#fff;color:#173d64;font:700 17px Arial,Helvetica,sans-serif;border-top:6px solid #173d64;">RADAR RIO</div>`;
    if(pageId==='caderno-braga') return `<div style="height:100%;display:grid;place-items:center;background:#fff;color:#222;font:700 15px Georgia,serif;border-top:5px solid #444;">CADERNO URBANO</div>`;
    if(pageId==='ufrj-intranet') return `<div style="height:100%;display:grid;place-items:center;background:#fff;color:#1f4d75;font:700 22px Arial,Helvetica,sans-serif;border-top:6px solid #3e5f7d;">UFRJ</div>`;
    return `<div style="height:100%;display:grid;place-items:center;background:#fafafa;color:#666;font-size:13px;">${esc(pageMeta(pageId, extra).title)}</div>`;
  }

  function R(domain,title,snippet,pageId,extra={}) { return {domain,title,snippet,pageId,extra}; }

  function renderPage(entry) {
    switch(entry.pageId) {
      case 'property-lapa': return renderProperty('lapa');
      case 'property-santa': return renderProperty('santa');
      case 'article-vertice': return renderVertice();
      case 'subsolo-home': return renderSubsolo();
      case 'article-vinculo-investigation': return renderVinculo();
      case 'radar-rio-poll': return renderRadarRio();
      case 'caderno-braga': return renderCadernoUrbano();
      case 'ufrj-intranet': return renderUfrjIntranet();
      case 'google-home': return renderGoogleHome();
      case 'search-results-lapa': return renderSearchResults('mặt bằng thương mại Lapa cho thuê', [
        R('imoveiscariocas.com.br','Mặt bằng thương mại - Lapa','220 m² · R$7.200/tháng','property-lapa'),
        R('rioimovel.com.br','Loja comercial - Rua do Lavradio','120 m² · R$6.200/tháng','stub-page',{title:'Loja comercial - Rua do Lavradio', url:'rioimovel.com.br/lavradio-120m2', domain:'rioimovel.com.br', body:'Thông tin tóm tắt về một mặt bằng thương mại khác tại khu Rua do Lavradio.'}),
        R('cariocanegocios.com.br','Không gian thương mại - Lapa','190 m² · R$8.900/tháng','stub-page',{title:'Không gian thương mại - Lapa', url:'cariocanegocios.com.br/lapa-190', domain:'cariocanegocios.com.br', body:'Không gian thương mại 190 m² tại Lapa, phù hợp bar hoặc studio.'})
      ]);
      case 'search-results-santa': return renderSearchResults('mặt bằng thương mại Santa Teresa cho thuê', [
        R('imoveiscariocas.com.br','Nhà thương mại - Santa Teresa','380 m² · R$7.500/tháng','property-santa'),
        R('rioimovel.com.br','Nhà hai tầng - Santa Teresa','135 m² · R$6.900/tháng','stub-page',{title:'Nhà hai tầng - Santa Teresa', url:'rioimovel.com.br/santa-135', domain:'rioimovel.com.br', body:'Listing tóm tắt cho nhà hai tầng phù hợp studio hoặc văn phòng sáng tạo.'}),
        R('cariocanegocios.com.br','Studio / văn phòng - Santa Teresa','110 m² · R$5.600/tháng','stub-page',{title:'Studio / văn phòng - Santa Teresa', url:'cariocanegocios.com.br/santa-studio-110', domain:'cariocanegocios.com.br', body:'Mặt bằng nhỏ hơn tại Santa Teresa, phù hợp văn phòng hoặc studio.'})
      ]);
      case 'search-results-henrique': return renderSearchResults('Henrique Matheus Ribeiro Lima', [
        R('santateresahoje.com.br','Chủ Estúdio Vértice tiếp tục hồi phục sau vụ cháy','Bài địa phương cập nhật tình trạng Henrique Ribeiro','article-vertice'),
        R('estudiovertice.com.br','Thông tin hoạt động','Trang tạm dừng nhận lịch xăm mới','stub-page',{title:'Estúdio Vértice', url:'estudiovertice.com.br', domain:'estudiovertice.com.br', body:'Trang thông tin ngắn: Estúdio Vértice vẫn tạm ngừng nhận lịch mới trong thời gian Henrique Ribeiro hồi phục.'}),
        R('facebook.com','Henrique Ribeiro','Kết quả hồ sơ công khai trên Facebook','stub-page',{title:'Henrique Ribeiro', url:'facebook.com', domain:'facebook.com', body:'Không có kết nối.'})
      ]);
      case 'search-results-vertice-fire': return renderSearchResults('vụ cháy studio Santa Teresa tháng 5', [
        R('santateresahoje.com.br','Chủ Estúdio Vértice tiếp tục hồi phục sau vụ cháy','Henrique tiếp tục hồi phục, studio chưa mở cửa trở lại','article-vertice'),
        R('jornaldazona.com.br','Studio hình xăm hư hại sau vụ cháy tại Santa Teresa','Một người bị thương trong vụ cháy xảy ra cuối tháng Năm. Nguyên nhân vẫn đang được xác minh.','stub-page',{title:'Studio hình xăm hư hại sau vụ cháy tại Santa Teresa', url:'jornaldazona.com.br/ocorrencias/studio-santa-teresa', domain:'jornaldazona.com.br', body:'Bài tóm tắt của báo khu vực về vụ cháy cuối tháng Năm tại Santa Teresa.'}),
        R('estudiovertice.com.br','Thông báo tạm ngừng hoạt động','Studio tạm thời chưa nhận khách','stub-page',{title:'Thông báo tạm ngừng hoạt động', url:'estudiovertice.com.br/comunicado', domain:'estudiovertice.com.br', body:'Thông báo ngắn về việc Estúdio Vértice tạm ngừng hoạt động.'})
      ]);
      case 'search-generic': return renderGenericSearch(entry.extra.query || '');
      case 'bookmarks': return renderBookmarks('bookmarks');
      case 'reading-list': return renderBookmarks('reading');
      case 'shared-links': return renderBookmarks('links');
      case 'history-view': return renderHistory(entry.extra.search || '');
      case 'new-tab': return renderNewTab();
      case 'stub-page': return renderStub(entry.extra);
      default: return renderStub({ title: pageMeta(entry.pageId, entry.extra).title, url: pageMeta(entry.pageId, entry.extra).url, domain: (pageMeta(entry.pageId, entry.extra).url || '').split('/')[0], body:'Nội dung rút gọn của website được lưu cục bộ.' });
    }
  }

  function renderProperty(kind) {
    const isLapa = kind==='lapa';
    const hero = isLapa
      ? [SAFARI_IMAGES.lapa1, SAFARI_IMAGES.lapa2, SAFARI_IMAGES.lapa3]
      : [SAFARI_IMAGES.santa1, SAFARI_IMAGES.santa2, SAFARI_IMAGES.santa3];
    const title = isLapa ? 'Rua do Lavradio - Lapa' : 'Santa Teresa - nhà hai tầng';
    const price = isLapa ? 'R$ 7.200 / tháng' : 'R$ 7.500 / tháng';
    const sq = isLapa ? '220 m²' : '380 m²';
    const contact = isLapa ? 'Rogério Almeida' : 'Carolina Mendes';
    const facts = isLapa
      ? [
          ['Diện tích','220 m²'],
          ['Tầng','Tầng trệt (mặt tiền thông thoáng)'],
          ['Phòng lớn','2'],
          ['Phòng phụ','3'],
          ['Kho nhỏ','1 (Khu lưu trữ thiết bị & đồ đạc)'],
          ['Phòng vệ sinh','6'],
          ['Lối vào riêng','Có'],
          ['Mặt tiền hướng phố','Có']
        ]
      : [
          ['Diện tích','380 m²'],
          ['Tầng','2'],
          ['Phòng vệ sinh','8'],
          ['Sân','Có'],
          ['Lối vào riêng','Có'],
          ['Phòng lớn','2 phòng lớn'],
          ['Phòng nhỏ','5 phòng nhỏ']
        ];
    const description = isLapa
      ? `Không gian thương mại tầng trệt rộng rãi tại trục đường sầm uất Rua do Lavradio, trung tâm khu Lapa - nơi tập trung các hoạt động văn hóa, nhà hàng và đời sống về đêm sôi động bậc nhất Rio.

Mặt bằng sở hữu thiết kế linh hoạt với hai không gian chính mở kết nối liền mạch, hai phòng phụ phía sau làm hậu trường/văn phòng, khu kho lưu trữ riêng biệt và hệ thống 5 nhà vệ sinh được bố trí hợp lý, hoàn toàn giải quyết sự cố ùn tắc cho các sự kiện đông người.`
      : `Nhà cũ hai tầng tại Santa Teresa, thích hợp cho hoạt động thương mại, studio, văn phòng sáng tạo hoặc không gian văn hóa.

Tầng dưới có phòng sinh hoạt lớn nối với khu sân nhỏ phía sau.

Tầng trên gồm nhiều phòng riêng có thể sử dụng làm văn phòng, kho hoặc phòng làm việc.

Không gian vẫn giữ phần lớn cấu trúc nhà ở ban đầu.

Hoạt động có âm nhạc hoặc đông người vào ban đêm cần được thống nhất trước với chủ sở hữu và tuân thủ quy định địa phương.`;
    const suitable = isLapa
      ? [
          'Không gian văn hóa, triển lãm, studio sáng tạo',
          'Bar, lounge, café nghệ thuật',
          'Sự kiện tư nhân, workshop, gathering quy mô 30-60 người thoải mái',
          'Cửa hàng concept store kết hợp không gian trải nghiệm'
        ]
      : [];
    const cond = isLapa
      ? [
          ['Hợp đồng tối thiểu','30 tháng'],
          ['Bảo đảm thuê','tương đương 3 tháng tiền thuê hoặc hình thức bảo lãnh khác'],
          ['Có thể vào xem','theo lịch hẹn']
        ]
      : [
          ['Hợp đồng','30 tháng'],
          ['Bảo đảm','3 tháng tiền thuê'],
          ['Cải tạo','cần chủ nhà phê duyệt với thay đổi kết cấu']
        ];
    const relatedTarget = isLapa ? 'property-santa' : 'property-lapa';
    const relatedLine = isLapa ? 'Santa Teresa - 380 m² - R$7.500/tháng' : 'Lapa - 220 m² - R$7.200/tháng';
    const suitabilityHtml = isLapa
      ? `<h2>Phù hợp cho</h2><ul>${suitable.map(item=>`<li>${item}</li>`).join('')}</ul><p><em>Lưu ý: Hoạt động có âm thanh trực tiếp hoặc giờ mở cửa muộn phụ thuộc vào giấy phép hoạt động và thỏa thuận thuê với chủ sở hữu.</em></p>`
      : '';
    return `<div class="safari-website"><div class="site-head"><div class="site-logo">Imóveis Cariocas</div><div class="site-nav">Mua | Thuê | Thương mại | Liên hệ</div></div><div class="safari-carousel">${hero.map(src=>`<img src="${src}" alt="">`).join('')}</div><div class="page-pad"><div class="safari-tag">CHO THUÊ · THƯƠNG MẠI</div><h1>${title}</h1><div class="safari-muted">${sq}</div><div class="safari-price">${price}</div><div class="safari-muted">Rio de Janeiro · RJ</div><h2>Thông tin chính</h2><div class="safari-facts">${facts.map(f=>`<div><strong>${f[0]}</strong>${f[1]}</div>`).join('')}</div><h2>Mô tả</h2>${description.split('\n\n').map(p=>`<p>${p}</p>`).join('')}${suitabilityHtml}<h2>Điều kiện thuê</h2><div class="safari-facts">${cond.map(f=>`<div><strong>${f[0]}</strong>${f[1]}</div>`).join('')}</div><h2>Liên hệ</h2><p><strong>${contact}</strong><br>Imóveis Cariocas</p><div class="safari-btnrow"><button class="safari-btn">Gọi</button><button class="safari-btn">Gửi email</button></div><div class="safari-related"><div class="safari-muted">Có thể bạn quan tâm</div><div class="link-card" data-safari-open="${relatedTarget}">${relatedLine}</div></div></div></div>`;
  }

  function renderVertice() {
    return `<div class="safari-website"><div class="site-head"><div class="site-logo">Santa Teresa Hoje</div><div class="site-mini">Thành phố</div></div><div class="hero"><img src="${SAFARI_IMAGES.vertice1}" alt=""></div><div class="safari-caption">Estúdio Vértice vẫn đóng cửa trong thời gian Henrique Ribeiro hồi phục.</div><div class="page-pad"><h1>Chủ Estúdio Vértice tiếp tục hồi phục sau vụ cháy</h1><div class="safari-article-meta">19/08/2015 · Santa Teresa · Mariana Lopes</div><p>Henrique Matheus Ribeiro Lima, chủ Estúdio Vértice tại Santa Teresa, tiếp tục quá trình hồi phục sau vụ cháy xảy ra tại studio vào cuối tháng Năm.</p><p>Theo những người thân cận với Ribeiro, tình trạng sức khỏe của anh đã cải thiện đáng kể trong những tuần gần đây. Anh hiện có thể tự đi lại và tiếp tục các buổi phục hồi ngoại trú.</p><p>Estúdio Vértice vẫn chưa nhận lịch xăm mới. Những khách hàng còn lịch cũ được hướng dẫn liên hệ trực tiếp với studio để sắp xếp lại hoặc nhận hoàn tiền.</p><p>Vụ cháy gây thiệt hại đáng kể cho phần bên trong cơ sở. Nguyên nhân đầy đủ của vụ việc chưa được cơ quan chức năng công bố.</p><p>Một số bạn bè và khách hàng của Ribeiro tiếp tục gây quỹ hỗ trợ chi phí phục hồi và sửa chữa studio.</p><p>Estúdio Vértice chưa đưa ra ngày mở cửa trở lại.</p></div></div>`;
  }
  function renderSubsolo() {
    return `<div class="safari-website"><div class="site-head"><div class="site-logo">SUBSOLO</div><div class="site-mini">BAR · MÚSICA · EVENTOS</div></div><div class="hero"><img src="${SAFARI_IMAGES.subsolo1}" alt=""></div><div class="page-pad"><h2>Sự kiện sắp tới</h2><p><strong>28/08/2015</strong><br><span style="font-size:17px;font-weight:700">Diego Vasconcelos + convidados</span><br>21:00 · DJ set<br>Vé tại cửa: <strong>R$25</strong></p><p><strong>29/08/2015</strong><br><span style="font-size:17px;font-weight:700">Noite Aberta</span><br>Nghệ sĩ độc lập · 22:00</p><p><strong>04/09/2015</strong><br><span style="font-size:17px;font-weight:700">Banda Maré Baixa</span><br>21:30</p><h2>Đặt sự kiện riêng</h2><p>Subsolo nhận sinh nhật, tiệc riêng, showcase, listening party, ra mắt dự án và sự kiện sáng tạo quy mô nhỏ.</p><p><strong>Liên hệ để nhận báo giá và kiểm tra ngày trống.</strong></p><div class="safari-btnrow"><button class="safari-btn">Gửi yêu cầu</button></div><h2>Liên hệ</h2><p>contato@subsolo.com.br<br>Rio de Janeiro · RJ</p></div><div class="safari-carousel"><img src="${SAFARI_IMAGES.subsolo2}" alt=""><img src="${SAFARI_IMAGES.subsolo3}" alt=""></div></div>`;
  }
  function renderVinculo() {
    return `<div class="safari-website"><div class="site-head"><div class="site-logo">Rio Agora</div><div class="site-mini">Thành phố</div></div><div class="page-pad"><h1>Cảnh sát xác minh hoạt động của hội kín sinh viên Vínculo Humano</h1><div class="safari-muted">Nhóm khép kín được cho là đã hoạt động trong giới sinh viên Rio trong nhiều năm; cảnh sát cho biết việc xác minh vẫn ở giai đoạn sơ bộ.</div><div class="safari-article-meta">15/08/2015 · 09:10 · Camila Duarte</div><p>Cảnh sát Rio de Janeiro đang thu thập thêm thông tin về <strong>Vínculo Humano</strong>, một nhóm khép kín được cho là hình thành trong môi trường sinh viên và hoạt động tại thành phố trong nhiều năm qua.</p><p>Theo những người từng biết đến nhóm, Vínculo Humano không hoạt động như một hội sinh viên chính thức của trường đại học và không có cơ cấu công khai rõ ràng. Thành viên chủ yếu được giới thiệu thông qua các mối quan hệ cá nhân và tham dự những buổi gặp riêng.</p><p>Nguồn tin từ cơ quan điều tra cho biết việc xác minh hiện vẫn ở giai đoạn sơ bộ. Cảnh sát đang tìm hiểu danh tính những người từng tham gia nhóm, các địa điểm thường được sử dụng và một số mối quan hệ giữa các thành viên cũ.</p><p>Cơ quan điều tra chưa công bố cụ thể hồ sơ nào dẫn tới việc Vínculo Humano được đưa vào quá trình rà soát và chưa xác nhận bất kỳ thành viên nào là nghi phạm.</p><p>Một trong những người từng có liên hệ với nhóm là <strong>Luísa Helena de Azevedo Moura</strong>, con gái của nữ dân biểu bang <strong>Dra. Helena Cecília Montenegro de Azevedo Moura</strong>, bác sĩ và doanh nhân trong lĩnh vực y tế.</p><p>Luísa Moura từng tham gia một số hoạt động đối ngoại trong chiến dịch chính trị của gia đình vào năm 2014. Văn phòng của bà Moura không bình luận về các hoạt động riêng của con gái.</p><p>Hai người từng biết đến Vínculo Humano cho biết nhóm có thành viên xuất thân từ nhiều trường đại học và ngành nghề khác nhau, nhưng phần lớn hoạt động không được quảng bá công khai.</p><p>Cảnh sát cho biết quá trình xác minh vẫn đang tiếp tục và nhấn mạnh rằng việc một cá nhân từng tham gia hoặc có liên hệ với nhóm không đồng nghĩa với việc người đó bị nghi ngờ thực hiện hành vi phạm pháp.</p><div class="safari-related"><div class="safari-muted">Tin liên quan</div><div class="link-card">Cảnh sát tăng cường rà soát các hồ sơ mất tích cũ tại Rio</div></div></div></div>`;
  }

  function renderRadarRio() {
    return `<article class="safari-news15 radar-rio">
      <header class="news-mast">
        <div class="news-brand"><b>RADAR</b> <em>RIO</em></div>
        <div class="news-nav"><span>CHÍNH TRỊ</span><span>THÀNH PHỐ</span><span>CHÍNH QUYỀN</span><span>Ý KIẾN</span></div>
      </header>
      <div class="news-body">
        <div class="news-kicker">Chính trị thành phố · Bầu cử 2016</div>
        <h1>Khảo sát sớm cho thấy cuộc đua thị trưởng Rio năm 2016 vẫn còn rộng mở</h1>
        <div class="news-dek">Không ứng viên tiềm năng nào vượt quá 25%; tỷ lệ cử tri chưa quyết định vẫn đủ lớn để thay đổi thứ tự hiện tại.</div>
        <div class="news-meta">28/08/2015 · 08:40 · Redação Radar Rio</div>
        <figure class="news-photo-real"><img src="./assets/safari/radar_rio.png" alt="Cử tri bỏ phiếu tại Rio de Janeiro"></figure>
        <p>Cuộc bầu cử thành phố vẫn còn hơn một năm nữa, nhưng những cuộc thảo luận đầu tiên về người có thể kế nhiệm chính quyền hiện tại đã bắt đầu xuất hiện trong giới chính trị Rio.</p>
        <p>Một khảo sát thử nghiệm mới đây đưa năm cái tên đang được nhắc tới nhiều nhất vào cùng một kịch bản. Kết quả cho thấy chưa có ứng viên nào tạo được lợi thế đủ lớn để được xem là người dẫn đầu rõ ràng.</p>
        <div class="poll-list" aria-label="Kết quả khảo sát">
          <div class="poll-row"><strong>Ricardo Bastos Figueira</strong><span class="pct">23%</span></div>
          <div class="poll-row"><strong>Helena Cecília Montenegro de Azevedo Moura</strong><span class="pct">18%</span></div>
          <div class="poll-row"><strong>Celso Viana Barreto</strong><span class="pct">16%</span></div>
          <div class="poll-row"><strong>Patrícia de Almeida Rocha</strong><span class="pct">12%</span></div>
          <div class="poll-row"><strong>Mauro César Valente</strong><span class="pct">9%</span></div>
          <div class="poll-gap"></div>
          <div class="poll-row"><strong>Chưa quyết định</strong><span class="pct">14%</span></div>
          <div class="poll-row"><strong>Trắng / không chọn ai</strong><span class="pct">8%</span></div>
        </div>
        <p>Figueira hiện đứng đầu nhờ mức độ nhận diện cao sau nhiều năm hoạt động ở cả chính quyền thành phố và Quốc hội. Tuy nhiên, khoảng cách năm điểm với Helena Moura vẫn chưa đủ lớn để xác lập một lợi thế ổn định.</p>
        <p>Moura, hiện là dân biểu bang, được biết đến trước khi bước vào chính trị với tư cách bác sĩ và doanh nhân trong lĩnh vực y tế. Tên bà gần đây xuất hiện thường xuyên hơn trong các cuộc thảo luận về một thế hệ ứng viên mới có thể tham gia cuộc đua năm tới.</p>
        <p>Barreto tiếp tục có lợi thế từ mạng lưới chính trị cấp thành phố, trong khi Rocha được đánh giá là có khả năng mở rộng sự ủng hộ nếu giáo dục và dịch vụ công trở thành chủ đề lớn của chiến dịch. Valente hiện vẫn gặp khó khăn về độ nhận diện ngoài giới doanh nghiệp và hành chính.</p>
        <section class="analysis-box">
          <h2>“Cuộc đua hiện tại chủ yếu là cuộc chiến về độ nhận diện”</h2>
          <p>Theo <strong>Marcelo Tavares</strong>, nhà nghiên cứu chính trị tại <em>Instituto Carioca de Estudos Públicos</em>, các con số ở thời điểm này phản ánh mức độ quen thuộc của cử tri với từng cái tên nhiều hơn là lựa chọn cuối cùng.</p>
          <blockquote>“Một năm trước bầu cử là quá sớm để đọc các tỷ lệ này như ý định bỏ phiếu cố định. Điều đáng chú ý hơn là không ai vượt quá một phần tư số người được hỏi.”</blockquote>
          <p>Tavares cho rằng ba yếu tố sẽ quyết định liệu thứ tự hiện nay có được duy trì hay không: <strong>liên minh giữa các đảng, tỷ lệ từ chối của từng ứng viên và khả năng tiếp cận nhóm cử tri chưa quyết định</strong>.</p>
          <p>Ông cũng lưu ý rằng Rio thường tạo ra những cuộc đua khó dự báo khi nhiều ứng viên có mức nhận diện trung bình cùng cạnh tranh.</p>
          <blockquote>“Một ứng viên không nhất thiết phải dẫn đầu từ sớm. Quan trọng hơn là bước vào năm bầu cử với mức từ chối thấp, một liên minh đủ rộng và khả năng biến sự hiện diện trên truyền thông thành tổ chức thực tế ở các khu vực của thành phố.”</blockquote>
        </section>
        <p>Các đảng vẫn chưa chính thức xác nhận phần lớn những cái tên được đưa vào khảo sát, và những kịch bản tiếp theo nhiều khả năng sẽ còn thay đổi trước khi quá trình lựa chọn ứng viên thực sự bắt đầu.</p>
      </div>
    </article>`;
  }

  function renderCadernoUrbano() {
    return `<article class="safari-news15 caderno-urbano">
      <header class="news-mast">
        <div class="news-brand">CADERNO URBANO</div>
        <div class="news-nav"><span>RIO</span><span>THÀNH PHỐ</span><span>NHÀ Ở</span><span>LAO ĐỘNG</span></div>
      </header>
      <div class="news-body">
        <div class="news-kicker">THÀNH PHỐ · PHÁT TRIỂN ĐÔ THỊ</div>
        <h1>Braga lại đối mặt chỉ trích về bồi thường trong dự án tái phát triển</h1>
        <div class="news-meta">26/08/2015 · 16:20 · Redação Caderno Urbano</div>
        <figure class="news-photo-real"><img src="./assets/safari/caderno_braga.png" alt="Người dân đứng cạnh công trường tái phát triển"></figure>
        <p>Một nhóm cư dân đang phản đối các điều khoản bồi thường được đưa ra trong khu vực thuộc kế hoạch tái phát triển của <strong>Braga Desenvolvimento Urbano</strong>.</p>
        <p>Các hộ dân cho rằng mức định giá một số bất động sản thấp hơn giá trị thực tế và thời hạn phản hồi quá ngắn. Một số người cũng nói họ được yêu cầu đưa ra quyết định trước khi có thể hoàn tất việc định giá độc lập.</p>
        <p>Braga phủ nhận việc gây sức ép, cho biết các đề nghị được xây dựng theo quy trình pháp lý và từng trường hợp vẫn có thể được xem xét lại.</p>
        <p>Đây không phải lần đầu tập đoàn bất động sản này đối mặt với phản ứng từ cộng đồng.</p>

        <div class="section-cap">NHỮNG TRANH CÃI TRƯỚC ĐÂY</div>
        <section class="past-item">
          <div class="past-when">2 năm trước</div>
          <div class="past-title">Tranh chấp bồi thường và di dời</div>
          <p>Một dự án khác của Braga từng bị cư dân và các tổ chức hỗ trợ pháp lý chỉ trích vì cách xác định giá bồi thường và thời gian dành cho các hộ bị ảnh hưởng. Sau các cuộc thương lượng, công ty đồng ý xem xét lại một số hồ sơ.</p>
        </section>
        <section class="past-item">
          <div class="past-when">4 năm trước</div>
          <div class="past-title">Đình công tại các công trường</div>
          <p>Braga từng trở thành tâm điểm của một cuộc tranh chấp lao động khi công nhân và nhân viên của các nhà thầu phụ phản đối mức lương thấp, chậm thanh toán và điều kiện làm việc tại một số công trường. Một số nhóm lao động đình công và tổ chức biểu tình.</p>
          <p>Thời điểm đó, Braga cho rằng trách nhiệm trực tiếp về tiền lương thuộc các công ty thầu phụ, nhưng cam kết làm việc với các đơn vị liên quan để giải quyết khiếu nại.</p>
        </section>

        <div class="section-cap">BRAGA NÓI GÌ?</div>
        <div class="company-response">
          <p>Trong phản hồi gửi <em>Caderno Urbano</em>, công ty cho biết các dự án tái phát triển lớn thường liên quan đến “nhiều bên có quyền lợi và đánh giá khác nhau”, đồng thời khẳng định việc thương lượng với cư dân vẫn đang tiếp tục.</p>
          <blockquote>“Chúng tôi không có chính sách buộc bất kỳ hộ dân nào phải chấp nhận đề nghị mà họ chưa đồng thuận.”</blockquote>
        </div>
        <p>Các đại diện cư dân cho biết họ muốn có thêm thời gian, định giá độc lập và quy trình khiếu nại rõ ràng trước khi các bước tiếp theo của dự án được triển khai.</p>
      </div>
    </article>`;
  }

  function renderUfrjIntranet() {
    // UFRJ_LOGO_2015: custom image replaces only the header logo, original SVG stays as fallback.
    const logo = `<span class="ufrj-logo-slot"><img class="ufrj-logo-image" src="./assets/safari/UFRJ_logo.png" alt="UFRJ" onerror="this.style.display='none'"><svg class="ufrj-old-logo" viewBox="0 0 138 96" xmlns="http://www.w3.org/2000/svg" aria-label="UFRJ"><rect width="138" height="96" fill="#fff"/><g fill="none" stroke="#1f4d75" stroke-width="3"><circle cx="28" cy="37" r="22"/><path d="M19 46c4-13 9-23 18-28-2 8 0 15 7 21-7 1-13 4-18 10"/><path d="M15 59h28"/></g><text x="56" y="43" font-family="Arial,Helvetica,sans-serif" font-size="26" font-weight="700" fill="#1f4d75">UFRJ</text><text x="56" y="59" font-family="Arial,Helvetica,sans-serif" font-size="8" font-weight="700" fill="#1f4d75">UNIVERSIDADE FEDERAL</text><text x="56" y="69" font-family="Arial,Helvetica,sans-serif" font-size="8" font-weight="700" fill="#1f4d75">DO RIO DE JANEIRO</text></svg></span>`;
    return `<div class="ufrj-oldpage"><div class="ufrj-oldsite">
      <header class="ufrj-old-header">${logo}<div class="ufrj-old-headtext"><div class="ufrj-old-university">UNIVERSIDADE FEDERAL DO RIO DE JANEIRO</div><div class="ufrj-old-intranet">MẠNG NỘI BỘ UFRJ</div></div></header>
      <div class="ufrj-oldbar">Truy cập các hệ thống nội bộ của trường</div>
      <div class="ufrj-old-main">
        <form class="ufrj-login-panel" id="ufrjLoginForm" autocomplete="off">
          <div class="ufrj-login-title">Truy cập Mạng nội bộ</div>
          <div class="ufrj-login-inner">
            <label class="ufrj-label" for="ufrjIdentification">Thông tin đăng nhập</label>
            <input class="ufrj-input" id="ufrjIdentification" name="identification" type="text" value="" autocomplete="off" spellcheck="false" />
            <label class="ufrj-label" for="ufrjPassword">Mật khẩu</label>
            <input class="ufrj-input" id="ufrjPassword" name="password" type="password" value="" autocomplete="new-password" />
            <button class="ufrj-login-btn" type="submit">Đăng nhập</button>
            <div class="ufrj-old-links"><span>Truy cập lần đầu</span><span>Quên mật khẩu?</span></div>
            <div class="ufrj-help">Truy cập các hệ thống nội bộ của Đại học Liên bang Rio de Janeiro.</div>
            <div class="ufrj-login-error" id="ufrjLoginError">Không thể xác thực thông tin.</div>
          </div>
        </form>
        <aside class="ufrj-system-box">
          <div class="ufrj-system-head">HỆ THỐNG</div>
          <div class="ufrj-system-inner"><strong>SIGA</strong>Hệ thống Quản lý Học vụ Tích hợp<br><br>Dành cho sinh viên, giảng viên và nhân viên có quyền truy cập.</div>
        </aside>
      </div>
      <footer class="ufrj-old-footer">Đại học Liên bang Rio de Janeiro · Hệ thống nội bộ<br>Chỉ dành cho người dùng được cấp quyền truy cập.</footer>
    </div></div>`;
  }


  function renderGoogleHome() {
    return '<div class="safari-google-2015">'+
      '<div class="safari-google-2015-logo" aria-label="Google"><b>G</b><b>o</b><b>o</b><b>g</b><b>l</b><b>e</b></div>'+
      '<form id="safariGoogleSearchForm" role="search">'+
      '<input id="safariGoogleSearchInput" aria-label="Tìm kiếm trên Google" type="search" placeholder="Tìm kiếm trên Google" autocomplete="off">'+
      '<button type="submit">Tìm kiếm</button></form>'+
      '<div class="safari-google-2015-footer">Google.com.br · Brasil</div></div>';
  }

  function renderSearchResults(query, results) {
    return `<div class="safari-website"><div class="safari-google-head"><div class="g">Google</div><div class="q">${esc(query)}</div></div><div class="safari-search-results">${results.map((r,i)=>`<div class="safari-result" data-search-open="${i}"><div class="domain">${esc(r.domain)}</div><div class="title">${esc(r.title)}</div><div class="snippet">${esc(r.snippet)}</div></div>`).join('')}</div></div>`;
  }
  function genericResults(query) {
    const n = normalize(query);
    if(n.includes('agenda')) return [R('agendarioindependente.com.br','Agenda Rio Independente','Agenda tóm tắt sự kiện độc lập tại Rio.','stub-page',{title:'Agenda Rio Independente', url:'agendarioindependente.com.br', domain:'agendarioindependente.com.br', body:'Trang lịch sự kiện và danh sách đêm nhạc độc lập tại Rio.'}),R('facebook.com','Agenda Rio Independente','Trang công khai trên Facebook','stub-page',{title:'Agenda Rio Independente',url:'facebook.com',domain:'facebook.com',body:'Không có kết nối.'}),R('ingresso.com','Eventos no Rio','Một số sự kiện và địa điểm tương tự.','stub-page',{title:'Eventos no Rio', url:'ingresso.com/rio', domain:'ingresso.com', body:'Tập hợp kết quả sự kiện công khai.'})];
    if(n.includes('ice') || n.includes('đá') || n.includes('da vien')) return [R('gelorio.com.br','Gelo Rio - giao đá viên tại Rio','Đá viên giao nhanh cho bar, nhà hàng và sự kiện.','stub-page',{title:'Gelo Rio', url:'gelorio.com.br', domain:'gelorio.com.br', body:'Nhà cung cấp đá viên giao tận nơi tại Rio de Janeiro.'}),R('mercadolivre.com.br','Đá viên 10kg / 20kg','Một số lựa chọn mua đá viên và thùng giữ nhiệt.','stub-page',{title:'Mercado Livre - đá viên', url:'mercadolivre.com.br', domain:'mercadolivre.com.br', body:'Danh sách rao bán và giao hàng nhanh.'}),R('classificadosrj.com.br','Đồ dùng sự kiện và bar','Danh mục tổng hợp phục vụ bar và tiệc.','stub-page',{title:'Classificados RJ', url:'classificadosrj.com.br', domain:'classificadosrj.com.br', body:'Danh sách nhà cung cấp vật tư và thiết bị cho bar.'})];
    if(n.includes('diego')) return [R('soundcloud.com','Diego Vasconcelos','DJ set và profile tóm tắt','stub-page',{title:'Diego Vasconcelos', url:'soundcloud.com/diegovasconcelos', domain:'soundcloud.com', body:'Trang hồ sơ âm nhạc và liên kết DJ set.'}),R('facebook.com','Diego Vasconcelos DJ','Kết quả Facebook công khai','stub-page',{title:'Diego Vasconcelos DJ', url:'facebook.com', domain:'facebook.com', body:'Không hiển thị nội dung Facebook sâu trong Safari mockup.'}),R('agendarioindependente.com.br','Agenda Rio Independente','Một số đêm diễn có Diego Vasconcelos.','stub-page',{title:'Agenda Rio Independente', url:'agendarioindependente.com.br', domain:'agendarioindependente.com.br', body:'Lịch diễn và danh sách nghệ sĩ xuất hiện trong tuần.'})];
    if(n.includes('máy làm đá') || n.includes('mixer') || n.includes('thiết bị') || n.includes('loa') || n.includes('micro')) return [R('mercadolivre.com.br','Mercado Livre - thiết bị đã qua sử dụng','Danh sách rao bán phù hợp cho bar và sân khấu nhỏ.','stub-page',{title:'Mercado Livre - thiết bị đã qua sử dụng', url:'mercadolivre.com.br', domain:'mercadolivre.com.br', body:'Rao vặt thiết bị âm thanh và bar đã qua sử dụng.'}),R('equipamentosrio.com.br','Equipamentos Rio','Thiết bị bar, âm thanh và lạnh công nghiệp.','stub-page',{title:'Equipamentos Rio', url:'equipamentosrio.com.br', domain:'equipamentosrio.com.br', body:'Trang giới thiệu ngắn các nhóm thiết bị thương mại.'}),R('classificadosrj.com.br','Classificados RJ','Mua bán máy làm đá, tủ lạnh, freezer và mixer.','stub-page',{title:'Classificados RJ', url:'classificadosrj.com.br', domain:'classificadosrj.com.br', body:'Rao vặt địa phương cho quán bar và nhà hàng.'})];
    return [R('google.com.br','Kết quả phù hợp tại Rio','Một số kết quả tổng hợp có liên quan đến truy vấn.','stub-page',{title:'Kết quả tổng hợp', url:'google.com.br', domain:'google.com.br', body:'Không có kết nối.'}),R('agendarioindependente.com.br','Agenda Rio Independente','Lịch và danh bạ tham khảo tại Rio.','stub-page',{title:'Agenda Rio Independente', url:'agendarioindependente.com.br', domain:'agendarioindependente.com.br', body:'Danh sách ngắn các sự kiện và liên kết tham khảo.'}),R('classificadosrj.com.br','Classificados RJ','Một vài mục phù hợp với từ khóa tìm kiếm.','stub-page',{title:'Classificados RJ', url:'classificadosrj.com.br', domain:'classificadosrj.com.br', body:'Trang rao vặt địa phương dạng tóm tắt.'})];
  }
  function renderGenericSearch(query) { return renderSearchResults(query, genericResults(query)); }
  function renderStub(extra) {
    return `<div class="safari-website"><div class="safari-stub"><div class="stub-domain">${esc(extra.domain || extra.url || '')}</div><h1>${esc(extra.title || 'Trang web')}</h1><p>${esc(extra.body || 'Không có kết nối.') }</p><div class="safari-callout">Safari không thể mở trang vì không có kết nối với máy chủ.</div></div></div>`;
  }
  function renderBookmarks(mode) {
    const header='<div class="safari-header"><div class="safari-titlebar">'+
      '<button class="left" type="button" data-book-done>Xong</button>'+
      '<div>'+(mode==='reading'?'Danh sách đọc':mode==='links'?'Liên kết':'Dấu trang')+'</div>'+
      '<button class="right" type="button" data-book-edit>'+(editSaved?'Xong':'Sửa')+'</button></div>'+
      '<div class="safari-segments" role="tablist">'+
      '<button type="button" aria-label="Dấu trang" data-seg="bookmarks" '+(mode==='bookmarks'?'class="active"':'')+'>▣</button>'+
      '<button type="button" aria-label="Danh sách đọc" data-seg="reading" '+(mode==='reading'?'class="active"':'')+'>◎</button>'+
      '<button type="button" aria-label="Liên kết được chia sẻ" data-seg="links" '+(mode==='links'?'class="active"':'')+'>@</button></div></div>';
    const savedRow=(item,i,key)=>{
      const edit=editSaved?'<button type="button" class="safari-item-delete" data-saved-delete="'+key+':'+i+'" aria-label="Xóa">−</button>':'';
      const mark=key==='reading'?'<button type="button" class="safari-reading-mark" data-saved-mark="'+i+'">'+(item.read?'Chưa đọc':'Đã đọc')+'</button>':'';
      return '<div class="safari-item safari-managed-item '+(item.read?'safari-item-read':'')+'">'+edit+
        '<div class="safari-item-text" data-user-'+(key==='reading'?'reading':'book')+'="'+i+'">'+
        '<div class="safari-item-title">'+esc(item.title)+'</div><div class="safari-item-sub">'+esc(item.url||'')+'</div></div>'+mark+'</div>';
    };
    if(mode==='reading'){
      return header+'<div class="safari-list"><div class="safari-book-group-title">Danh sách đọc</div>'+
        (userSaved.reading.map((x,i)=>savedRow(x,i,'reading')).join(''))+
        READING_LIST.map((x,i)=>'<div class="safari-item" data-reading="'+i+'"><div class="safari-item-title">'+esc(x.title)+'</div><div class="safari-item-sub">'+esc(x.source)+' · '+esc(x.date)+' · '+esc(x.state)+'</div></div>').join('')+
        (!userSaved.reading.length?'<div class="safari-reading-hint">Lưu trang từ nút Chia sẻ để đọc sau.</div>':'')+'</div>';
    }
    if(mode==='links'){
      return header+'<div class="safari-empty"><strong>Liên kết được chia sẻ</strong><p>Chưa có liên kết từ các nguồn theo dõi.</p></div>';
    }
    const row=(item)=>'<div class="safari-item" data-book-open="'+esc(item.targetPageId||'stub-page')+
      '" data-book-title="'+esc(item.title)+'" data-book-url="'+esc(item.url||'')+
      '"><div class="safari-item-title">'+esc(item.title)+'</div><div class="safari-item-sub">'+esc(item.url||'')+'</div></div>';
    const favorites=BOOKMARKS.find(x=>x.section==='Yêu thích')?.items||[];
    const savedFavorites=userSaved.bookmarks.map((x,i)=>x.favorite?savedRow(x,i,'bookmarks'):'').join('');
    const savedRegular=userSaved.bookmarks.map((x,i)=>!x.favorite?savedRow(x,i,'bookmarks'):'').join('');
    const folders=BOOKMARKS.filter(x=>x.folder).map(section=>'<div class="safari-folder">'+
      '<div class="safari-book-group-title">'+esc(section.section)+'</div>'+
      section.items.map(row).join('')+'</div>').join('');
    return header+'<div class="safari-list">'+
      '<div class="safari-book-group-title">Mục ưa thích</div>'+
      favorites.map(row).join('')+savedFavorites+
      (savedRegular?'<div class="safari-book-group-title">Dấu trang</div>'+savedRegular:'')+
      '<div class="safari-item" data-book-history><div class="safari-item-title">◷  Lịch sử</div></div>'+
      folders+'</div>';
  }
  function renderHistory(search='') {
    const q=normalize(search.trim());
    historyDisplay=[];
    const matches=historyGroups().map(group=>({
      day:group.day,items:group.items.filter(item=>!q||normalize([item.title,item.domain,item.query,item.url].join(' ')).includes(q))
    })).filter(group=>group.items.length);
    const body=matches.map(group=>'<div><div class="safari-history-day">'+esc(group.day)+'</div>'+
      group.items.map(item=>{
        const id=historyDisplay.push(item)-1;
        return '<div class="safari-history-entry" data-history-id="'+id+'">'+
          '<div class="safari-history-time">'+esc(item.time||'')+'</div>'+
          '<div><div class="title">'+esc(item.title)+'</div><div class="sub">'+esc(item.domain||'')+
          (item.type==='search'?' · Tìm kiếm':'')+'</div></div></div>';
      }).join('')+'</div>').join('')||'<div class="safari-empty">Không có mục lịch sử phù hợp.</div>';
    return '<div class="safari-header"><div class="safari-titlebar">'+
      '<button type="button" class="left" data-history-back>Dấu trang</button>'+
      '<div>Lịch sử</div><button type="button" class="right" data-history-clear>Xóa</button></div>'+
      '<div class="safari-search-internal"><input id="safariHistorySearch" type="search" '+
      'placeholder="Tìm trong lịch sử" value="'+esc(search)+'" autocomplete="off"></div></div>'+
      '<div class="safari-history-list">'+body+'</div>';
  }
  function renderNewTab() {
    const favs = [ ['Google','#4285f4','g'],['Wikipedia','#d9d9d9','◌'],['Rio Agora','#d9d9d9','◌'],['Subsolo','#1f8eb7','S'],['Santa Teresa Hoje','#d9d9d9','◌'],['Imóveis Cariocas','#d9d9d9','◌'] ];
    const often = [
      ['Rio Agora','#4285f4','g'],
      ['Subsolo','#2f80ed','◌'],
      ['Santa Teresa Hoje','#d9d9d9','◌'],
      ['Imóveis Cariocas','#d9d9d9','◌'],
      ['Distribuidora Guanabara','#d9d9d9','◌'],
      ['Agenda Rio Independente','#d9d9d9','◌']
    ];
    return `<div class="safari-search-home ios8-start-page">
      <div class="safari-start-actions">
        <button class="safari-start-action" type="button" data-start-action="favorite"><span class="safari-start-symbol star">★</span><span>Thêm vào Mục ưa thích</span></button>
        <button class="safari-start-action" type="button" data-start-action="desktop"><span class="safari-start-symbol desktop">▰</span><span>Yêu cầu trang web cho máy tính</span></button>
      </div>
      <div class="safari-fav-grid ios8-favorites">${favs.map((f,i)=>`<div class="safari-fav" data-newfav="${i}"><div class="ico" style="background:${f[1]}">${f[2]}</div><div class="lbl">${f[0]}</div></div>`).join('')}</div>
      <div class="safari-section-title safari-frequent-title">THƯỜNG XUYÊN TRUY CẬP</div>
      <div class="safari-freq-grid">${often.map((f,i)=>`<div class="safari-freq" data-often="${i}"><div class="ico" style="background:${f[1]}">${f[2]}</div><div class="lbl">${f[0]}</div></div>`).join('')}</div>
    </div>`;
  }

  function bindPage() {
    page.querySelectorAll('[data-safari-open]').forEach(el=>el.addEventListener('click', () => navigate(el.dataset.safariOpen)));
    if(currentEntry().pageId==='google-home') {
      const form=page.querySelector('#safariGoogleSearchForm');
      form?.addEventListener('submit',event=>{
        event.preventDefault();
        const value=form.querySelector('input')?.value.trim();
        if(value)performAddressSearch(value);
      });
    }
    if(currentEntry().pageId.startsWith('search-results-') || currentEntry().pageId==='search-generic') {
      const query = currentEntry().pageId==='search-results-lapa' ? 'mặt bằng thương mại Lapa cho thuê' : currentEntry().pageId==='search-results-santa' ? 'mặt bằng thương mại Santa Teresa cho thuê' : currentEntry().pageId==='search-results-henrique' ? 'Henrique Matheus Ribeiro Lima' : currentEntry().pageId==='search-results-vertice-fire' ? 'vụ cháy studio Santa Teresa tháng 5' : currentEntry().extra.query;
      const results = currentEntry().pageId==='search-results-lapa' ? [
        {pageId:'property-lapa'},{pageId:'stub-page', extra:{title:'Loja comercial - Rua do Lavradio', url:'rioimovel.com.br/lavradio-120m2', domain:'rioimovel.com.br', body:'Thông tin tóm tắt về một mặt bằng thương mại khác tại khu Rua do Lavradio.'}},{pageId:'stub-page', extra:{title:'Không gian thương mại - Lapa', url:'cariocanegocios.com.br/lapa-190', domain:'cariocanegocios.com.br', body:'Không gian thương mại 190 m² tại Lapa, phù hợp bar hoặc studio.'}}
      ] : currentEntry().pageId==='search-results-santa' ? [
        {pageId:'property-santa'},{pageId:'stub-page', extra:{title:'Nhà hai tầng - Santa Teresa', url:'rioimovel.com.br/santa-135', domain:'rioimovel.com.br', body:'Listing tóm tắt cho nhà hai tầng phù hợp studio hoặc văn phòng sáng tạo.'}},{pageId:'stub-page', extra:{title:'Studio / văn phòng - Santa Teresa', url:'cariocanegocios.com.br/santa-studio-110', domain:'cariocanegocios.com.br', body:'Mặt bằng nhỏ hơn tại Santa Teresa, phù hợp văn phòng hoặc studio.'}}
      ] : currentEntry().pageId==='search-results-henrique' ? [
        {pageId:'article-vertice'},{pageId:'stub-page', extra:{title:'Estúdio Vértice', url:'estudiovertice.com.br', domain:'estudiovertice.com.br', body:'Trang thông tin ngắn: Estúdio Vértice vẫn tạm ngừng nhận lịch mới trong thời gian Henrique Ribeiro hồi phục.'}},{pageId:'stub-page', extra:{title:'Henrique Ribeiro', url:'facebook.com', domain:'facebook.com', body:'Không có kết nối.'}}
      ] : currentEntry().pageId==='search-results-vertice-fire' ? [
        {pageId:'article-vertice'},{pageId:'stub-page', extra:{title:'Studio hình xăm hư hại sau vụ cháy tại Santa Teresa', url:'jornaldazona.com.br/ocorrencias/studio-santa-teresa', domain:'jornaldazona.com.br', body:'Bài tóm tắt của báo khu vực về vụ cháy cuối tháng Năm tại Santa Teresa.'}},{pageId:'stub-page', extra:{title:'Thông báo tạm ngừng hoạt động', url:'estudiovertice.com.br/comunicado', domain:'estudiovertice.com.br', body:'Thông báo ngắn về việc Estúdio Vértice tạm ngừng hoạt động.'}}
      ] : genericResults(query).map(r=>({pageId:r.pageId, extra:r.extra||{}}));
      page.querySelectorAll('[data-search-open]').forEach((el,i)=>el.addEventListener('click', ()=>navigate(results[i].pageId, results[i].extra || {})));
    }
    if(currentEntry().pageId==='bookmarks' || currentEntry().pageId==='reading-list' || currentEntry().pageId==='shared-links') {
      page.querySelector('[data-book-done]')?.addEventListener('click',()=>{
        if(currentTab()?.historyIndex>0)goBack();else navigate('new-tab',{},false);
      });
      page.querySelector('[data-book-edit]')?.addEventListener('click',()=>{
        editSaved=!editSaved; renderCurrent(true);
      });
      page.querySelectorAll('[data-seg]').forEach(btn=>btn.addEventListener('click',()=>{
        navigate(btn.dataset.seg==='bookmarks'?'bookmarks':btn.dataset.seg==='reading'?'reading-list':'shared-links',{},false);
      }));
      page.querySelector('[data-book-history]')?.addEventListener('click',()=>navigate('history-view'));
      page.querySelectorAll('[data-book-open]').forEach(row=>row.addEventListener('click',()=>{
        const target=row.dataset.bookOpen;
        if(target==='fav-google') return navigate('google-home');
        if(target.startsWith('stub-')) return navigate('stub-page', stubData(target, row.dataset.bookTitle, row.dataset.bookUrl));
        navigate(target);
      }));
      page.querySelectorAll('[data-reading]').forEach(row=>row.addEventListener('click',()=>{
        const item=READING_LIST[Number(row.dataset.reading)];if(!item)return;
        navigate('stub-page',{title:item.title,url:'',domain:item.source,
          body:'Bản lưu đọc ngoại tuyến từ '+item.date+'. Bài viết đầy đủ hiện không có trong bản sao lưu.'});
      }));
      page.querySelectorAll('[data-saved-delete]').forEach(btn=>btn.addEventListener('click',e=>{
        e.stopPropagation();
        const [key,index]=btn.dataset.savedDelete.split(':');
        if(!['bookmarks','reading'].includes(key))return;
        const item=userSaved[key][Number(index)];if(!item)return;
        showConfirm('Xóa "'+item.title+'" khỏi '+(key==='reading'?'Danh sách đọc':'Dấu trang')+'?','Xóa',()=>{
          userSaved[key].splice(Number(index),1);saveUserPages();renderCurrent(true);
        });
      }));
      page.querySelectorAll('[data-saved-mark]').forEach(btn=>btn.addEventListener('click',e=>{
        e.stopPropagation();
        const item=userSaved.reading[Number(btn.dataset.savedMark)];
        if(item){item.read=!item.read;saveUserPages();renderCurrent(true);}
      }));
      const openSaved=(item)=>{
        if(!item)return;
        const id=item.pageId||'stub-page';
        if(id==='stub-page')navigate(id,item.extra||{title:item.title,url:item.url});
        else navigate(id,item.extra||{});
      };
      page.querySelectorAll('[data-user-book]').forEach(row=>row.addEventListener('click',()=>openSaved(userSaved.bookmarks[+row.dataset.userBook])));
      page.querySelectorAll('[data-user-reading]').forEach(row=>row.addEventListener('click',()=>openSaved(userSaved.reading[+row.dataset.userReading])));
    }
    if(currentEntry().pageId==='history-view') {
      page.querySelector('[data-history-back]')?.addEventListener('click',()=>goBack());
      page.querySelector('[data-history-clear]')?.addEventListener('click',()=>showConfirm(
        'Xóa lịch sử và dữ liệu trang web trên iPhone này?', 'Xóa lịch sử', clearSafariHistory));
      page.querySelector('#safariHistorySearch')?.addEventListener('input',e=>{
        const val=e.target.value,pos=e.target.selectionStart;
        currentEntry().extra.search=val;
        page.innerHTML=renderHistory(val);bindPage();page.scrollTop=0;
        const input=page.querySelector('#safariHistorySearch');input?.focus();
        try{input?.setSelectionRange(pos,pos)}catch(err){}
      });
      page.querySelectorAll('[data-history-id]').forEach(row=>row.addEventListener('click',()=>{
        const item=historyDisplay[Number(row.dataset.historyId)];if(!item)return;
        if(item.type==='page' && item.targetPageId) return navigate(item.targetPageId, item.extra || {});
        if(item.type==='search') return navigate('search-generic',{query:item.query || item.title});
        return navigate('stub-page', stubData(item.targetPageId || '', item.title, item.domain));
      }));
    }
    if(currentEntry().pageId==='ufrj-intranet') {
      const form = page.querySelector('#ufrjLoginForm');
      const err = page.querySelector('#ufrjLoginError');
      const ident = page.querySelector('#ufrjIdentification');
      const pass = page.querySelector('#ufrjPassword');
      form?.addEventListener('submit', e=>{ e.preventDefault(); if(err) err.style.display='block'; });
      [ident,pass].forEach(inp=>inp?.addEventListener('input',()=>{ if(err) err.style.display='none'; }));
    }
    if(currentEntry().pageId==='new-tab') {
      page.querySelectorAll('[data-start-action]').forEach(btn=>btn.addEventListener('click',()=>{
        const msg = alertBox.querySelector('.msg');
        if(btn.dataset.startAction==='desktop')toastSafari('Mở trang web trước khi yêu cầu bản máy tính.');
        else toastSafari('Mở trang web trước khi thêm vào Mục ưa thích.');
      }));
      page.querySelectorAll('[data-newfav]').forEach(el=>el.addEventListener('click',()=>{
        const choices=[['google-home',{}],['stub-page',{title:'Wikipedia',url:'wikipedia.org',domain:'wikipedia.org'}],
          ['article-vinculo-investigation',{}],['subsolo-home',{}],['article-vertice',{}],['property-lapa',{}]];
        const c=choices[Number(el.dataset.newfav)];if(c)navigate(c[0],c[1]);
      }));
      page.querySelectorAll('[data-often]').forEach(el=>el.addEventListener('click',()=>{
        const choices=[['article-vinculo-investigation',{}],['subsolo-home',{}],['article-vertice',{}],
          ['property-lapa',{}],['stub-page',stubData('stub-guanabara')],
          ['stub-page',stubData('stub-agenda-rio')]];
        const c=choices[Number(el.dataset.often)];if(c)navigate(c[0],c[1]);
      }));
      setTimeout(()=>{ if(!tabsView.classList.contains('show')&&!app.classList.contains('tabs-mode'))address.focus(); },50);
    }
  }

  function stubData(id,title,url) {
    const map = {
      'stub-guanabara': {title:'Distribuidora Guanabara', url:'guanabaradistribuidora.com.br', domain:'guanabaradistribuidora.com.br', body:'Đồ uống bán sỉ tại Rio de Janeiro. Giờ làm việc, số điện thoại và các danh mục chính như bia, destilados, gelo và mixers.'},
      'stub-agenda-rio': {title:'Agenda Rio Independente', url:'agendarioindependente.com.br', domain:'agendarioindependente.com.br', body:'Lịch sự kiện độc lập ở Rio, tập trung vào nhạc sống, DJ set và không gian văn hóa quy mô nhỏ.'},
      'stub-rede': {title:'Rede', url:'userede.com.br', domain:'userede.com.br', body:'Thông tin ngắn về máy thanh toán thẻ, hỗ trợ thiết bị và câu hỏi thường gặp cho doanh nghiệp.'},
      'stub-itau-empresas': {title:'Itaú Empresas', url:'itau.com.br/empresas', domain:'itau.com.br', body:'Trang giới thiệu dịch vụ doanh nghiệp của Itaú, các nhóm sản phẩm tài khoản và thanh toán.'},
      'stub-imoveis': {title:'Imóveis Cariocas', url:'imoveiscariocas.com.br', domain:'imoveiscariocas.com.br', body:'Trang chủ gọn của Imóveis Cariocas với danh mục cho thuê, thương mại và liên hệ.'},
      'stub-rio-prefeitura': {title:'Prefeitura do Rio', url:'rio.rj.gov.br', domain:'rio.rj.gov.br', body:'Thông tin công vụ cơ bản, giấy phép, thông báo và dịch vụ hành chính của thành phố Rio.'},
      'stub-rio-agora': {title:'Rio Agora - Thành phố', url:'rioagora.com.br', domain:'rioagora.com.br', body:'Trang chuyên mục Thành phố với tin ngắn địa phương.'},
      'stub-porto': {title:'Porto Seguro - doanh nghiệp', url:'portoseguro.com.br', domain:'portoseguro.com.br', body:'Tóm tắt dịch vụ bảo hiểm doanh nghiệp và liên hệ tư vấn.'},
      'stub-facebook': {title:'Facebook', url:'facebook.com', domain:'facebook.com', body:'Không có kết nối.'},
      'stub-ingresso': {title:'Ingresso.com', url:'ingresso.com', domain:'ingresso.com', body:'Trang đặt vé và danh sách sự kiện công khai.'},
      'stub-santa-hoje': {title:'Santa Teresa Hoje', url:'santateresahoje.com.br', domain:'santateresahoje.com.br', body:'Trang tin khu vực Santa Teresa, gồm các chuyên mục thành phố, văn hóa và cộng đồng.'}
    };
    return map[id] || {title:title||'Website', url:url||'', domain:url||'', body:'Phiên bản rút gọn của website được lưu cục bộ.'};
  }

  // Safari Smart Search, Reader, Find on Page and web clips: all inside the phone.
  const suggestionPanel=document.createElement('div');
  suggestionPanel.id='safariSmartSuggestions';
  suggestionPanel.setAttribute('aria-label','Gợi ý tìm kiếm');
  app.appendChild(suggestionPanel);
  const findPanel=document.createElement('div');
  findPanel.id='safariFindPanel';app.appendChild(findPanel);
  const readerButton=document.createElement('button');
  readerButton.id='safariReaderButton';readerButton.type='button';
  readerButton.setAttribute('aria-label','Chế độ trình đọc');
  readerButton.textContent='☰';
  document.getElementById('safariAddressWrap')?.prepend(readerButton);
  let findHits=[],findIndex=0, ignoreNextLinkClick=false;
  function toastSafari(msg) {
    const el=alertBox.querySelector('.msg');if(el)el.textContent=msg;
    alertBox.classList.add('show');
  }
  function updateSafariReaderButton(){
    const id=currentEntry()?.pageId||'';
    readerButton.hidden=!/^(article-|radar-rio-poll|caderno-braga)/.test(id);
    readerButton.classList.toggle('enabled',!!currentEntry()?.extra?.reader);
  }
  readerButton.addEventListener('click',()=>{
    const entry=currentEntry();if(!entry)return;
    saveScroll();entry.extra.reader=!entry.extra.reader;
    renderCurrent(true);
  });
  function toggleDesktop(){
    const entry=currentEntry();if(!entry || /^(new-tab|bookmarks|reading-list|history-view|shared-links)$/.test(entry.pageId)){
      toastSafari('Mở một trang web trước khi yêu cầu bản máy tính.');return;
    }
    saveScroll();entry.extra.desktop=!entry.extra.desktop;
    renderCurrent(true);
    toastSafari(entry.extra.desktop?'Đang xem bố cục máy tính (bản mô phỏng).':'Đã trở về bố cục di động.');
  }
  function showSuggestions(){
    if(!app.classList.contains('open')||!safariTopbar.classList.contains('editing'))return;
    const q=address.value.trim(), needle=normalize(q);
    let items=[];
    const use=(label,sub,act,target,extra={})=>items.push({label,sub,act,target,extra});
    if(!q){
      const favorites=BOOKMARKS[0].items;
      favorites.concat(userSaved.bookmarks.filter(x=>x.favorite)).slice(0,8).forEach(x=>
        use(x.title,x.url||'','url',x.url));
    }else{
      use('Tìm kiếm trên Google: '+q,'Google','search',q);
      const current=page.textContent||'';
      const count=needle.length>1?normalize(current).split(needle).length-1:0;
      if(count>0)use('Trên trang này: '+q,count+' kết quả','find',q);
      const combined=[...BOOKMARKS.flatMap(g=>g.items||[]),...userSaved.bookmarks,
        ...historyGroups().flatMap(g=>g.items.slice(0,35))];
      const already=new Set();
      combined.filter(x=>normalize(x.title+' '+(x.url||x.domain||'')).includes(needle))
        .forEach(x=>{
          const url=x.url||(x.domain||'');if(already.has(url))return;already.add(url);
          if(items.length<9)use(x.title,url,'url',url);
        });
    }
    const shortcuts='<div class="safari-suggestion-tools">'+
      '<button type="button" data-saf-shortcut="favorite">★ Thêm vào Mục ưa thích</button>'+
      '<button type="button" data-saf-shortcut="desktop">▱ Yêu cầu trang web cho máy tính</button></div>';
    suggestionPanel.innerHTML=shortcuts+items.map((x,i)=>'<button type="button" class="safari-smart-row" data-smart-index="'+i+'">'+
      '<span>'+esc(x.label)+'</span><small>'+esc(x.sub||'')+'</small></button>').join('');
    suggestionPanel.classList.add('show');app.classList.add('safari-searching');
    suggestionPanel.querySelectorAll('[data-smart-index]').forEach(btn=>btn.addEventListener('pointerdown',e=>e.preventDefault()));
    suggestionPanel.querySelectorAll('[data-smart-index]').forEach(btn=>btn.addEventListener('click',()=>{
      const x=items[Number(btn.dataset.smartIndex)];if(!x)return;
      hideSuggestions();setSafariAddressEditing(false);address.blur();
      if(x.act==='find')return startFind(x.target);
      performAddressSearch(x.target);
    }));
    suggestionPanel.querySelectorAll('[data-saf-shortcut]').forEach(btn=>btn.addEventListener('pointerdown',e=>e.preventDefault()));
    suggestionPanel.querySelectorAll('[data-saf-shortcut]').forEach(btn=>btn.addEventListener('click',()=>{
      hideSuggestions();setSafariAddressEditing(false);address.blur();
      if(btn.dataset.safShortcut==='desktop')toggleDesktop();
      else if(currentEntry()?.url){saveCurrentPage('favorite');toastSafari('Đã thêm vào Mục ưa thích.');}
      else toastSafari('Mở trang web trước khi thêm vào Mục ưa thích.');
    }));
  }
  function hideSuggestions(){
    suggestionPanel.classList.remove('show');app.classList.remove('safari-searching');
  }
  address.addEventListener('focus',()=>setTimeout(showSuggestions,15));
  address.addEventListener('input',showSuggestions);
  address.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();hideSuggestions();setSafariAddressEditing(false);address.blur();}
    if(e.key==='Enter'){hideSuggestions();setSafariAddressEditing(false);}
  });
  safariCancel?.addEventListener('click',hideSuggestions);
  address.addEventListener('blur',()=>setTimeout(()=>{
    if(document.activeElement!==address)hideSuggestions();
  },180));
  function decorateMatches(q) {
    findHits=[];findIndex=0;
    if(!q || q.length>100)return;
    const lower=q.toLocaleLowerCase();
    const walker=document.createTreeWalker(page,NodeFilter.SHOW_TEXT,{
      acceptNode(node){
        if(!node.nodeValue||!node.nodeValue.trim()||!node.parentElement ||
          node.parentElement.closest('button, input, textarea, script, style, mark, .safari-header'))return NodeFilter.FILTER_REJECT;
        return node.nodeValue.toLocaleLowerCase().includes(lower)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
      }
    });
    const targets=[];while(walker.nextNode()&&targets.length<160)targets.push(walker.currentNode);
    for(const textNode of targets){
      const raw=textNode.nodeValue;let cursor=0,index=raw.toLocaleLowerCase().indexOf(lower),count=0;
      const fragment=document.createDocumentFragment();
      while(index!==-1&&count++<30){
        if(index>cursor)fragment.appendChild(document.createTextNode(raw.slice(cursor,index)));
        const mark=document.createElement('mark');mark.className='safari-find-hit';
        mark.textContent=raw.slice(index,index+q.length);fragment.appendChild(mark);findHits.push(mark);
        cursor=index+q.length;index=raw.toLocaleLowerCase().indexOf(lower,cursor);
      }
      if(cursor<raw.length)fragment.appendChild(document.createTextNode(raw.slice(cursor)));
      if(cursor>0)textNode.replaceWith(fragment);
    }
  }
  function chooseFind(delta){
    if(!findHits.length)return;
    findHits[findIndex]?.classList.remove('active');
    findIndex=(findIndex+delta+findHits.length)%findHits.length;
    const item=findHits[findIndex];item.classList.add('active');
    const rect=item.getBoundingClientRect(),area=page.getBoundingClientRect();
    if(rect.top<area.top+30||rect.bottom>area.bottom-15){
      page.scrollTop+=rect.top-area.top-(area.height/3);
    }
    findPanel.querySelector('[data-find-count]').textContent=(findIndex+1)+' / '+findHits.length;
  }
  function startFind(value) {
    const q=String(value||'').trim();if(!q)return;
    saveScroll();renderCurrent(true);
    decorateMatches(q);
    findPanel.innerHTML='<div class="safari-find-caption"><strong>Trên trang này</strong>'+
      '<span data-find-count>'+findHits.length+' kết quả</span></div>'+
      '<div class="safari-find-controls"><button type="button" data-find-prev aria-label="Trước">‹</button>'+
      '<button type="button" data-find-next aria-label="Sau">›</button>'+
      '<button type="button" data-find-done>Xong</button></div>';
    findPanel.classList.add('show');app.classList.add('safari-finding');
    if(findHits.length){findIndex=findHits.length-1;chooseFind(1);}
    findPanel.querySelector('[data-find-prev]')?.addEventListener('click',()=>chooseFind(-1));
    findPanel.querySelector('[data-find-next]')?.addEventListener('click',()=>chooseFind(1));
    findPanel.querySelector('[data-find-done]')?.addEventListener('click',closeFind);
  }
  function closeFind(){
    findPanel.classList.remove('show');app.classList.remove('safari-finding');
    saveScroll();renderCurrent(true);
    findHits=[];
  }
  backBtn.addEventListener('click',()=>{if(findPanel.classList.contains('show'))closeFind()});
  tabsBtn.addEventListener('click',()=>{hideSuggestions();if(findPanel.classList.contains('show'))closeFind()});
  const WEBCLIPS_KEY='caua.safari.ios8.webclips.v1';
  let webclips=[];
  try{const saved=JSON.parse(localStorage.getItem(WEBCLIPS_KEY)||'[]');
    if(Array.isArray(saved))webclips=saved.filter(x=>x&&typeof x.url==='string').slice(0,9);
  }catch(e){}
  function renderHomeClips(){
    const grid=document.getElementById('iconGrid');if(!grid)return;
    grid.querySelectorAll('[data-safari-clip]').forEach(el=>el.remove());
    webclips.forEach((clip,i)=>{
      const el=document.createElement('div');
      el.className='app safari-webclip';el.dataset.safariClip=String(i);el.tabIndex=0;
      el.setAttribute('role','button');el.setAttribute('aria-label','Mở '+clip.title);
      el.innerHTML='<div class="icon safari-webclip-icon">'+esc((clip.title||'?').slice(0,1).toUpperCase())+
        '</div><span>'+esc(clip.title)+'</span>';
      const open=()=>{openApp();performAddressSearch(clip.url)};
      el.addEventListener('click',open);
      el.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();open()}});
      grid.appendChild(el);
    });
  }
  function promptHomeClip(e){
    const url=e.url||'';if(!url)return;
    showOverlay('<div class="safari-clip-dialog" role="dialog" aria-modal="true">'+
      '<div class="safari-clip-title">Thêm vào Màn hình chính</div>'+
      '<label>Tên trang web<input id="safariClipName" maxlength="26" value="'+esc(e.title)+'"></label>'+
      '<div class="safari-clip-url">'+esc(url)+'</div>'+
      '<div class="safari-clip-actions"><button type="button" data-clip-cancel>Hủy</button>'+
      '<button type="button" data-clip-save>Thêm</button></div></div>');
    overlay.querySelector('[data-clip-cancel]')?.addEventListener('click',hideOverlay);
    overlay.querySelector('[data-clip-save]')?.addEventListener('click',()=>{
      const title=overlay.querySelector('#safariClipName')?.value.trim()||e.title;
      if(webclips.some(x=>x.url===url)){hideOverlay();toastSafari('Trang này đã có trên Màn hình chính.');return;}
      if(webclips.length>=9){hideOverlay();toastSafari('Màn hình chính đã hết vị trí cho web clip.');return;}
      webclips.push({title:title.slice(0,26),url});try{localStorage.setItem(WEBCLIPS_KEY,JSON.stringify(webclips))}catch(err){}
      renderHomeClips();hideOverlay();toastSafari('Đã thêm trang vào Màn hình chính.');
    });
  }
  renderHomeClips();
  // Long-press real page links for the Safari iOS 8 context menu.
  function linkInfo(node){
    const target=node.closest('[data-safari-open],[data-search-open]');
    if(!target)return null;
    if(target.hasAttribute('data-safari-open')){
      const pageId=target.dataset.safariOpen,meta=pageMeta(pageId);
      return {pageId,extra:{},title:meta.title,url:meta.url};
    }
    const rowIndex=Number(target.dataset.searchOpen);
    const label=target.querySelector('.title')?.textContent||'Trang web';
    const domain=target.querySelector('.domain')?.textContent||'';
    return {pageId:'stub-page',extra:{title:label,url:domain,domain},title:label,url:domain};
  }
  function showLinkMenu(info){
    if(!info)return;
    const acts=['Mở','Mở trong tab mới','Thêm vào Danh sách đọc','Sao chép liên kết'];
    showOverlay('<div class="safari-sheet safari-link-menu"><div class="safari-sheet-title">'+esc(info.url||info.title)+
      '</div>'+acts.map((x,i)=>'<button type="button" class="safari-sheet-row" data-link-act="'+i+'">'+esc(x)+'</button>').join('')+
      '<button type="button" class="safari-sheet-row cancel" data-saf-close>Hủy</button></div>');
    overlay.querySelector('[data-saf-close]')?.addEventListener('click',hideOverlay);
    overlay.querySelectorAll('[data-link-act]').forEach(btn=>btn.addEventListener('click',()=>{
      const i=Number(btn.dataset.linkAct);hideOverlay();
      if(i===0)navigate(info.pageId,info.extra);
      if(i===1){saveScroll();
        const id='t'+Date.now();state.tabs.push({id,title:info.title,
          historyStack:[makeEntry(info.pageId,info.extra)],historyIndex:0});
        state.currentTabId=id;visitPage(currentEntry());renderCurrent(false);
      }
      if(i===2){
        const arr=userSaved.reading;
        if(!arr.some(x=>x.url===info.url)){arr.unshift({title:info.title,url:info.url,
          pageId:info.pageId,extra:info.extra,read:false});saveUserPages();}
        toastSafari('Đã lưu vào Danh sách đọc.');
      }
      if(i===3){window.CauaCrossApp?.copy('https://'+info.url.replace(/^https?:\/\//,''));toastSafari('Đã sao chép liên kết.');}
    }));
  }
  page.addEventListener('contextmenu',e=>{
    const link=linkInfo(e.target);if(!link)return;
    e.preventDefault();showLinkMenu(link);
  });
  let linkHold=0,linkStart=null;
  page.addEventListener('touchstart',e=>{
    const info=linkInfo(e.target);if(!info||e.touches.length!==1)return;
    const t=e.touches[0];linkStart={x:t.clientX,y:t.clientY};
    clearTimeout(linkHold);
    linkHold=setTimeout(()=>{
      ignoreNextLinkClick=true;showLinkMenu(info);
      setTimeout(()=>{ignoreNextLinkClick=false},650);
    },540);
  },{passive:true});
  page.addEventListener('touchmove',e=>{
    const t=e.touches[0];if(linkStart&&t&&Math.hypot(t.clientX-linkStart.x,t.clientY-linkStart.y)>12)clearTimeout(linkHold);
  },{passive:true});
  ['touchend','touchcancel'].forEach(ev=>page.addEventListener(ev,()=>clearTimeout(linkHold),{passive:true}));
  page.addEventListener('click',e=>{
    if(ignoreNextLinkClick && linkInfo(e.target)){e.stopImmediatePropagation();e.preventDefault();ignoreNextLinkClick=false;}
  },true);

})();
