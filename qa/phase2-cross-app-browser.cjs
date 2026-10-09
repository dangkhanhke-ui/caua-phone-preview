const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const base='http://127.0.0.1:8000/index.html';
async function run(engine,name){
 const browser=await engine.launch({headless:true});
 const errors=[];
 async function fresh(){
   const page=await browser.newPage({viewport:{width:460,height:860},hasTouch:true});
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base,{waitUntil:'domcontentloaded'});
   await page.waitForTimeout(650);
   return page;
 }
 async function photo(page){
   await page.locator('[data-app="photos"]').evaluate(x=>x.click());
   await page.waitForTimeout(250);
   await page.locator('#photosMomentsScroll .photos-thumb').first().click();
   await page.locator('#photosShareBtn').click();
   assert((await page.locator('#photosSheetBackdrop .photos-sheet .row').allInnerTexts()).some(t=>t.trim()==='WhatsApp'));
 }
 async function destination(page,label,app){
   await page.locator('#photosSheetBackdrop .photos-sheet .row').filter({hasText:new RegExp('^'+label+'$')}).click();
   await page.waitForTimeout(250);
   assert(await page.locator('#'+({
     mail:'mailApp',messages:'messagesApp',whatsapp:'whatsappApp',facebook:'facebookApp'
   })[app]).evaluate(el=>el.classList.contains('open')),app+' did not open');
   const modes=await page.evaluate(()=>[...document.querySelectorAll('#screen > section.open')].map(x=>x.id));
   console.log(name,'APP_HANDOFF',app,JSON.stringify(modes));
 }
 try{
   // Photos -> Mail: attach real asset as a *draft*.
   let p=await fresh(); await photo(p); await destination(p,'Mail','mail');
   assert((await p.locator('#mailBody .caua-share-file').innerText()).startsWith('IMG_'));
   assert(await p.locator('#mailBody .caua-share-preview img').count()===1);
   assert((await p.locator('#composeSubject').inputValue()).startsWith('Ảnh: '));
   console.log(name,'PHOTOS_MAIL_PASS');await p.close();

   // Photos -> Messages: image appears in the native new-message composer.
   p=await fresh();await photo(p);await destination(p,'Tin nhắn','messages');
   assert(await p.locator('#messagesNewView.active .caua-share-preview img').count()===1);
   await p.locator('#messagesRecipient').fill('Marcela');
   assert(await p.locator('#messagesNewSend').innerText()==='Gửi');
   console.log(name,'PHOTOS_MESSAGES_PASS');await p.close();

   // Photos -> WhatsApp: using real picker and persisting the shared message.
   p=await fresh();await photo(p);await destination(p,'WhatsApp','whatsapp');
   assert(await p.locator('#waIos15 [data-act="pick-contact"]').count()>0);
   await p.locator('#waIos15 [data-act="pick-contact"]').first().click();
   assert(await p.locator('#waIos15 .wai-bubble img.wai-media[src*="assets/photos"]').count()===1);
   const state=await p.evaluate(()=>JSON.parse(localStorage.getItem('caua-whatsapp-ios2015-v2')||'{}'));
   assert(Object.values(state.messages||{}).flat().some(x=>x.type==='image'&&/assets\/photos/.test(x.src)));
   console.log(name,'PHOTOS_WHATSAPP_PASS');await p.close();

   // Photos -> Facebook: upload preview and actual media on a local post.
   p=await fresh();await photo(p);await destination(p,'Facebook','facebook');
   assert(await p.locator('#fb15Dialog .caua-share-preview img').count()===1);
   await p.locator('#fb15ComposerPost').click();
   assert(await p.locator('#fb15Feed .fb15-post img[src*="assets/photos"]').count()>=1);
   console.log(name,'PHOTOS_FACEBOOK_PASS');await p.close();

   // Safari -> save bookmarks / Reading List, then share link into Mail draft.
   p=await fresh();await p.locator('[data-app="safari"]').evaluate(x=>x.click());
   await p.waitForTimeout(250);
   await p.locator('#safariAddress').fill('subsolo.com.br');
   await p.locator('#safariAddress').press('Enter');
   await p.locator('#safariShare').click();
   await p.locator('#safariOverlay [data-saf-action="Thêm dấu trang"]').click();
   await p.locator('#safariShare').click();
   await p.locator('#safariOverlay [data-saf-action="Thêm vào Danh sách đọc"]').click();
   await p.locator('#safariBookmarks').click();
   assert(await p.locator('#safariPage [data-user-book]').count()===1);
   await p.locator('#safariPage [data-seg="reading"]').click();
   assert(await p.locator('#safariPage [data-user-reading]').count()===1);
   const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('caua.safari.phase2.saved.v1')||'{}'));
   assert(saved.bookmarks.length===1 && saved.reading.length===1);
   await p.locator('#safariAddress').fill('subsolo.com.br');
   await p.locator('#safariAddress').press('Enter');
   await p.locator('#safariShare').click();
   await p.locator('#safariOverlay [data-saf-action="Mail"]').click();
   assert((await p.locator('#composeBody').inputValue()).includes('subsolo.com.br'));
   console.log(name,'SAFARI_BOOKMARK_SHARE_MAIL_PASS');await p.close();

   // Mail -> GoodReader: never invent missing PDF bytes.
   p=await fresh();await p.locator('[data-app="mail"]').evaluate(x=>x.click());
   await p.waitForTimeout(200);
   await p.locator('#mailBody .mail-row[data-mail-id="4"]').click();
   await p.locator('#mailBody [data-attachment]').click();
   await p.locator('#mailBody .mail-open-goodreader').click();
   assert(await p.locator('#goodreaderApp.open').count()===1);
   const message=await p.locator('#gr4Body').innerText();
   assert(message.includes('Không có kết nối') && message.includes('Không thể tải nội dung'));
   assert((await p.locator('#gr4Nav strong').innerText()).includes('DANH_SACH_23_08.pdf'));
   const json=await p.evaluate(()=>fetch('assets/goodreader4/documents.json').then(x=>x.json()));
   assert(json.documents.length===2,'Original GoodReader evidence documents mutated');
   console.log(name,'MAIL_GOODREADER_PASS');await p.close();

   assert.deepEqual(errors,[],'JavaScript page errors in '+name);
   console.log(name,'PHASE2_ALL_PASS');
 }finally{await browser.close()}
}
(async()=>{await run(chromium,'chromium');await run(webkit,'webkit')})().catch(err=>{console.error('PHASE2_FAIL',err.stack||err);process.exitCode=1});
