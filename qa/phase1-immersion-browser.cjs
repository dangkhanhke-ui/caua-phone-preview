const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const banned=/bản sao điện thoại|bản sao dữ liệu|bản mô phỏng|bản offline|chế độ xem dữ liệu|chế độ chỉ đọc|trong game|bản thử này|bản dựng này|thiết bị điều tra|dữ liệu case|Safari local|Cài đặt Messenger/i;
async function browserAudit(browserType,engine){
  const browser=await browserType.launch({headless:true});
  const server='http://127.0.0.1:8000/index.html';
  async function open(app){
    const p=await browser.newPage({viewport:{width:460,height:860},hasTouch:true});
    await p.goto(server,{waitUntil:'domcontentloaded'});
    await p.waitForTimeout(250);
    const found=await p.evaluate(key=>{
      const el=document.querySelector('[data-app="'+key+'"]');
      if(!el)return false;
      el.click();return true;
    },app);
    assert(found,engine+' missing launcher '+app);
    await p.waitForTimeout(250);
    return p;
  }
  async function assertCopy(page,where){
    const text=await page.locator('#screen').innerText();
    assert(!banned.test(text),engine+' immersion leak on '+where+': '+text.match(banned)?.[0]);
  }
  try{
    const f=await open('facebook');
    await f.locator('[data-fbtab="messages"]').click();
    const fb=await f.locator('#fb15Content').innerText();
    assert(fb.includes('Không có kết nối'),engine+' missing natural Facebook offline state');
    assert(!/Cài đặt Messenger|Messenger.*Cài đặt/i.test(fb),engine+' fake Messenger installer visible');
    await assertCopy(f,'Facebook messages');
    await f.close();
    console.log(engine,'FACEBOOK_NO_INSTALL_PASS');
    const p=await open('photos');
    await p.locator('#photosMomentsScroll .photos-thumb').first().click();
    await p.locator('#photosTrashBtn').click();
    const photoAlert=await p.locator('#photosAlertText').innerText();
    assert(photoAlert.includes('Không thể xóa ảnh lúc này'),engine+' photo alert not replaced');
    await assertCopy(p,'Photos trash');
    await p.close();
    console.log(engine,'PHOTOS_COPY_PASS');
    const n=await open('notes');
    await n.locator('#notesAccountsBtn').click();
    const noteAlert=await n.locator('#notesAlertCopy').innerText();
    assert(noteAlert.includes('Không tìm thấy thư mục khác'),engine+' Notes folder message not replaced');
    await assertCopy(n,'Notes accounts');
    await n.close();
    console.log(engine,'NOTES_COPY_PASS');
    const s=await open('safari');
    await s.locator('#safariAddress').fill('khongco.example');
    await s.locator('#safariAddress').press('Enter');
    await s.waitForTimeout(250);
    const hits=s.locator('#safariPage [data-search-open]');
    if(await hits.count()){
      await hits.first().click();
      const web=await s.locator('#safariPage').innerText();
      assert(!banned.test(web),engine+' Safari stub leaks game language');
      assert(/Không có kết nối|không thể kết nối/i.test(web),engine+' stub did not produce natural network error');
    }else{
      const web=await s.locator('#safariPage').innerText();
      assert(!banned.test(web),engine+' Safari search leaks game language');
    }
    await assertCopy(s,'Safari');
    await s.close();
    console.log(engine,'SAFARI_COPY_PASS');
    const m=await open('messages');
    await m.locator('#messagesListBody [data-thread-id]').first().click();
    // The existing code makes this an offline read-only action; this phase
    // changes only the message, never the message data or send functionality.
    const input=m.locator('#messagesReplyInput');
    if(await input.isVisible() && await input.isEnabled()){
      await input.fill('Kiểm tra giao diện');
      await m.locator('#messagesSendBtn').click();
      const alert=await m.locator('#messagesAlertText').innerText().catch(()=>m.locator('#messagesAlertLayer').innerText());
      assert(!banned.test(alert),engine+' Messages send leaks game text');
      assert(alert.includes('Không có kết nối'),engine+' Messages send failed to use natural error');
    }
    await assertCopy(m,'Messages');
    await m.close();
    console.log(engine,'MESSAGES_COPY_PASS');
    console.log(engine,'PHASE1_BROWSER_PASS');
  }finally{await browser.close()}
}
(async()=>{await browserAudit(chromium,'chromium');await browserAudit(webkit,'webkit')})().catch(e=>{console.error('PHASE1_BROWSER_FAIL',e.stack||e);process.exitCode=1});
