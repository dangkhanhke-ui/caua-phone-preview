const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const base='http://127.0.0.1:8000/index.html';
const vm=require('node:vm');
const fs=require('node:fs');
let checked=0;
for(const hit of fs.readFileSync('index.html','utf8').matchAll(/<script\b(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)){
  new vm.Script(hit[1],{filename:'index-inline-'+(++checked)+'.js'});
}
console.log('PHASE3_INLINE_SYNTAX_PASS',checked);
const ids={
  photos:'photosApp',notes:'notesApp',phone:'phoneApp',
  messages:'messagesApp',calendar:'calendarApp',safari:'safariApp',
  mail:'mailApp',facebook:'facebookApp',whatsapp:'whatsappApp',
  goodreader:'goodreaderApp',voice:'voiceApp',
  itau:'itauApp','itau-biz':'itauBizApp'
};
async function run(engine,label){
  const browser=await engine.launch({headless:true});
  const failures=[];
  let passed=0;
  const pageErrors=[];
  async function fresh(){
    const p=await browser.newPage({viewport:{width:460,height:860},hasTouch:true,acceptDownloads:false});
    p.on('pageerror',e=>pageErrors.push(e.message));
    p.on('dialog',dialog=>dialog.dismiss().catch(()=>{}));
    await p.goto(base,{waitUntil:'domcontentloaded',timeout:45000});
    await p.waitForTimeout(650);
    return p;
  }
  async function open(p,key){
    const launcher=p.locator('[data-app="'+key+'"]').first();
    assert(await launcher.count(),key+' launcher missing');
    await launcher.evaluate(el=>el.click());
    await p.waitForTimeout(160);
    assert(await p.locator('#'+ids[key]).evaluate(el=>el.classList.contains('open')),key+' did not open');
  }
  async function probe(name,cb){
    const p=await fresh();
    try{await cb(p);passed++;console.log('PHASE3_PASS',label,name);}
    catch(err){failures.push(name+': '+(err.stack||err));console.error('PHASE3_FAIL',label,name,err.stack||err);}
    finally{await p.close();}
  }
  try{
    await probe('ALL_13_APPS_OPEN_AND_HOME',async p=>{
      for(const key of Object.keys(ids)){
        await open(p,key);
        await p.locator('#homeButton').evaluate(el=>el.click());
        await p.waitForTimeout(60);
      }
    });
    await probe('ZOOM_ICON_ONLY_AND_TOGGLE_STATE',async p=>{
      const btn=p.locator('#caua-immersive-toggle');
      assert(await btn.count(),'zoom control missing');
      assert.equal((await btn.innerText()).trim(),'','zoom button should contain no visible words');
      assert.equal(await btn.locator('svg.caua-zoom-icon').count(),2,'expand/shrink icons missing');
      const design=await btn.evaluate(el=>{
        const cs=getComputedStyle(el);
        return {width:parseFloat(cs.width),height:parseFloat(cs.height),border:parseFloat(cs.borderTopWidth),radius:cs.borderRadius};
      });
      assert.equal(design.width,42,'zoom control width');
      assert.equal(design.height,42,'zoom control height');
      assert.equal(design.border,0,'zoom control should have no visible border');
      assert.equal(design.radius,'50%','zoom control should be circular');
      assert.equal(await btn.getAttribute('aria-label'),'Phóng to iPhone');
      await btn.click();
      assert.equal(await btn.getAttribute('aria-pressed'),'true');
      assert.equal(await btn.getAttribute('aria-label'),'Thu nhỏ iPhone');
      assert(await p.locator('body.caua-immersive').count(),'zoom-on mode missing');
      await btn.click();
      assert.equal(await btn.getAttribute('aria-pressed'),'false');
      assert.equal(await btn.getAttribute('aria-label'),'Phóng to iPhone');
      assert.equal(await p.locator('body.caua-immersive').count(),0,'zoom did not revert');
    });
    await probe('MAIL_OPEN_READ_AND_NO_FAKE_SEND',async p=>{
      await open(p,'mail');
      assert(await p.locator('#mailBody .mail-row[data-mail-id]').count()>0);
      await p.locator('#mailBody .mail-row[data-mail-id]').first().click();
      assert(await p.locator('#mailBody').innerText());
      await p.locator('#mailBack').click();
      await p.locator('#mailToolbar [data-mail-action="compose"]').first().click();
      await p.locator('#composeTo').fill('teste@example.com');
      await p.locator('#composeSubject').fill('bản nháp kiểm tra');
      await p.locator('#composeBody').fill('không gửi ra mạng');
      await p.locator('#mailAction').click();
      assert(await p.locator('#composeBody').count(),'draft discarded after failed send');
      assert((await p.locator('#mailToast').innerText()).includes('Không có kết nối'),'false sent status');
      assert.equal(await p.locator('#composeBody').inputValue(),'không gửi ra mạng');
    });
    await probe('MESSAGES_THREAD_DETAILS_AND_OFFLINE_SEND',async p=>{
      await open(p,'messages');
      assert(await p.locator('#messagesThreads [data-thread-id]').count()>0);
      await p.locator('#messagesThreads [data-thread-id]').first().click();
      assert(await p.locator('#messagesConversationView.active').count());
      await p.locator('#messagesDetailsBtn').click();
      assert(await p.locator('#messagesDetailView.active').count());
      await p.locator('#messagesDetailBack').click();
      await p.locator('#messagesBackBtn').click();
      await p.locator('#messagesComposeBtn').click();
      await p.locator('#messagesRecipient').fill('Marcela');
      await p.locator('#messagesNewText').fill('kiểm tra');
      await p.locator('#messagesNewSend').click();
      assert((await p.locator('#messagesAlertText').innerText()).includes('Không có kết nối'));
    });
    await probe('PHONE_TABS_AND_DIAL',async p=>{
      await open(p,'phone');
      for(const tab of ['recents','contacts','favorites','keypad']){
        await p.locator('[data-phone-tab="'+tab+'"]').click();
        assert(await p.locator('[data-phone-tab="'+tab+'"].active').count(),'tab '+tab+' not activated');
      }
      const first=p.locator('#phoneMain [data-dial-key]').first();
      assert(await first.count(),'keypad lacks digit buttons');
      await first.click();
      assert((await p.locator('#phoneMain #phoneDialNumber').innerText()).trim().length>0,'keypad did not update');
    });
    await probe('NOTES_CREATE_EDIT_SAVE_REOPEN',async p=>{
      await open(p,'notes');
      await p.locator('#notesFloatingCompose').click();
      const note=p.locator('#notesDetailBody');
      assert(await note.count());
      await note.evaluate(el=>{el.textContent='ghi chú test phase 3';el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:'ghi chú test phase 3'}));});
      await p.locator('#notesBackBtn').click();
      assert((await p.locator('#notesList').innerText()).includes('ghi chú test phase 3'),'new note missing from list');
      await p.reload({waitUntil:'domcontentloaded'});
      await p.waitForTimeout(400);
      await open(p,'notes');
      assert((await p.locator('#notesList').innerText()).includes('ghi chú test phase 3'),'new note lost after reload');
    });
    await probe('PHOTOS_OPEN_FAVORITE_SHARE',async p=>{
      await open(p,'photos');
      assert(await p.locator('#photosMomentsScroll .photos-thumb').count()>=30);
      await p.locator('#photosMomentsScroll .photos-thumb').first().evaluate(el=>el.click());
      assert(await p.locator('#photosViewer.active').count(),'photo viewer did not open');
      assert(await p.locator('#photosViewerImage').getAttribute('src'));
      await p.locator('#photosFavoriteBtn').evaluate(el=>el.click());
      await p.locator('#photosShareBtn').click();
      assert(await p.locator('#photosSheetBackdrop.open .row').count()>=5);
      await p.locator('#photosSheetBackdrop .row.cancel').click();
      await p.locator('#photosViewerBack').click();
      assert(await p.locator('#photosMomentsView.active').count(),'photo navigation back failed');
    });
    await probe('PHOTOS_FAVORITES_PERSIST_AFTER_RELOAD',async p=>{
      await open(p,'photos');
      await p.locator('#photosMomentsScroll .photos-thumb').first().evaluate(el=>el.click());
      const selected=await p.locator('#photosViewerImage').getAttribute('src');
      const before=await p.locator('#photosFavoriteBtn').evaluate(el=>el.classList.contains('on'));
      await p.locator('#photosFavoriteBtn').click();
      const next=!before;
      assert.equal(await p.locator('#photosFavoriteBtn').evaluate(el=>el.classList.contains('on')),next);
      await p.reload({waitUntil:'domcontentloaded'});
      await p.waitForTimeout(400);
      await open(p,'photos');
      await p.locator('#photosMomentsScroll .photos-thumb').first().evaluate(el=>el.click());
      assert.equal(await p.locator('#photosViewerImage').getAttribute('src'),selected);
      assert.equal(await p.locator('#photosFavoriteBtn').evaluate(el=>el.classList.contains('on')),next,'favorite was not persisted');
    });
    await probe('CALENDAR_SEARCH_AND_BACK',async p=>{
      await open(p,'calendar');
      assert((await p.locator('#calendarMainView').innerText()).trim().length>0);
      await p.locator('#calendarSearchBtn').click();
      await p.locator('#calSearchInput').fill('Ascension');
      assert((await p.locator('#calSearchResults').innerText()).length>0,'calendar search empty');
      await p.locator('#calSearchDone').click();
      assert(!await p.locator('#calendarOverlay').evaluate(el=>el.classList.contains('show')),'calendar search stuck open');
    });
    await probe('SAFARI_NAVIGATION_AND_BACK',async p=>{
      await open(p,'safari');
      await p.locator('#safariAddress').fill('subsolo.com.br');
      await p.locator('#safariAddress').press('Enter');
      assert((await p.locator('#safariPage').innerText()).length>20);
      await p.locator('#safariShare').click();
      assert(await p.locator('#safariOverlay.show').count());
      await p.locator('#safariOverlay [data-saf-action="Thêm dấu trang"]').click();
      await p.locator('#safariBookmarks').click();
      assert(await p.locator('#safariPage [data-user-book]').count()>=1);
    });
    await probe('FACEBOOK_FEED_LIKE_AND_SEARCH',async p=>{
      await open(p,'facebook');
      assert(await p.locator('#fb15Feed .fb15-post').count()>=4);
      const like=p.locator('#fb15Feed [data-like]').first();
      assert(await like.count());
      const before=await like.evaluate(el=>el.classList.contains('active'));
      await like.evaluate(el=>el.click());
      const after=await like.evaluate(el=>el.classList.contains('active'));
      assert.notEqual(before,after,'like button did not toggle');
      await p.locator('#fb15SearchLaunch').click();
      assert(await p.locator('#fb15SearchScreen.open').count());
      await p.locator('#fb15SearchCancel').click();
      assert(!await p.locator('#fb15SearchScreen').evaluate(el=>el.classList.contains('open')));
    });
    await probe('WHATSAPP_LOCAL_MESSAGE_SURVIVES_RELOAD',async p=>{
      await open(p,'whatsapp');
      await p.locator('#waIos15 [data-act="open-chat"]').first().click();
      await p.locator('#waiText').fill('phase3 local message');
      await p.locator('#waIos15 [data-act="send"]').click();
      assert((await p.locator('#waiMessages').innerText()).includes('phase3 local message'));
      const state=await p.evaluate(()=>JSON.parse(localStorage.getItem('caua-whatsapp-ios2015-v2')||'{}'));
      assert(Object.values(state.messages||{}).flat().some(x=>x.text==='phase3 local message'));
      await p.reload({waitUntil:'domcontentloaded'});
      await p.waitForTimeout(400);
      await open(p,'whatsapp');
      assert((await p.locator('#waIos15').innerText()).length>0);
    });
    await probe('WHATSAPP_AVATAR_USES_INTERNAL_PHOTOS',async p=>{
      await open(p,'whatsapp');
      await p.locator('#waIos15 [data-act="tab"][data-id="settings"]').click();
      await p.locator('#waIos15 [data-act="profile"]').click();
      await p.locator('#waIos15 [data-act="change-photo"]').click();
      assert(await p.locator('#waIos15 .caua-wa-photo-thumb').count()>=30);
      const chosen=await p.locator('#waIos15 .caua-wa-photo-thumb').first().getAttribute('data-src');
      await p.locator('#waIos15 .caua-wa-photo-thumb').first().click();
      assert(await p.locator('#waIos15 .wai-profile-big img').count());
      const state=await p.evaluate(()=>JSON.parse(localStorage.getItem('caua-whatsapp-ios2015-v2')||'{}'));
      assert.equal(state.photo,chosen,'avatar did not persist internal photo');
    });
    await probe('GOODREADER_DOCUMENTS_AND_LIST',async p=>{
      await open(p,'goodreader');
      const text=await p.locator('#gr4Body').innerText();
      assert(text.length>5,'GoodReader view empty');
      const manifest=await p.evaluate(()=>fetch('assets/goodreader4/documents.json').then(r=>r.json()));
      assert.equal(manifest.documents.length,2);
      assert.equal(manifest.documents.find(x=>x.id==='n09-2012').password,'1111');
    });
    await probe('VOICE_MEMOS_OPEN_AND_RECORDER_FEEDBACK',async p=>{
      await open(p,'voice');
      assert(await p.locator('#voiceList .voice-row-head').count()>0);
      await p.locator('#voiceList .voice-row-head').first().click();
      assert(await p.locator('#voiceDetail.open').count());
      await p.locator('#voiceDetail [data-voice-back]').click();
      await p.locator('#voiceApp .voice-record-btn').click();
      assert((await p.locator('#voiceApp .voice-offline-notice').innerText()).includes('Không có kết nối'));
    });
    await probe('BANKING_TWO_APPS_CAN_NAVIGATE',async p=>{
      await open(p,'itau');
      assert((await p.locator('#itauContent').innerText()).length>10);
      await open(p,'itau-biz');
      assert((await p.locator('#itauBizContent').innerText()).length>10);
    });
    if(pageErrors.length) failures.push('RUNTIME_PAGE_ERRORS: '+JSON.stringify(pageErrors.slice(0,16)));
    console.log('PHASE3_SUMMARY',JSON.stringify({engine:label,passed,failures:failures.length,runtimeErrors:pageErrors.length}));
    if(failures.length)throw Error(label+' audit failures:\n'+failures.join('\n\n'));
  }finally{await browser.close();}
}
(async()=>{await run(chromium,'chromium');await run(webkit,'webkit');})()
  .catch(err=>{console.error('PHASE3_SUITE_FAILED',err.stack||err);process.exitCode=1;});
