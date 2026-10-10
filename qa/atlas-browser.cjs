const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
for(const path of ['assets/atlas/atlas-data.js','assets/atlas/atlas.js']){
 new vm.Script(fs.readFileSync(path,'utf8'),{filename:path});
}
const html=fs.readFileSync('index.html','utf8');
for(const fragment of ['data-app="atlas"','id="atlasApp"','assets/atlas/atlas.css','assets/atlas/atlas-data.js','assets/atlas/atlas.js',"atlas: { id:'atlasApp'"]){
 assert(html.includes(fragment),'Missing index Atlas mount: '+fragment);
}
const checkedInline=[...html.matchAll(/<script\b(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)];
for(let i=0;i<checkedInline.length;i++)new vm.Script(checkedInline[i][1],{filename:'index-inline-'+i+'.js'});
console.log('ATLAS_STATIC_PASS',checkedInline.length);

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:465,height:900},hasTouch:true});
 const exceptions=[];
 page.on('pageerror',e=>exceptions.push(e.stack||e.message));
 const check=async(label,fn)=>{await fn();console.log('ATLAS_PASS',label)};
 try{
  await page.goto('http://127.0.0.1:8000/index.html',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForTimeout(850);
  await check('LAUNCH_APP_AND_BOOT_LOCK',async()=>{
   assert.equal(await page.locator('[data-app="atlas"]').count(),1);
   await page.locator('[data-app="atlas"]').evaluate(el=>el.click());
   await page.waitForTimeout(850);
   assert(await page.locator('#atlasApp.open').count());
   assert(await page.locator('#atlasAuth.active').count());
   assert((await page.locator('#atlasApp').innerText()).includes('Mã truy cập'));
  });
  const dial=async(section,code)=>{
   for(const digit of code)await page.locator('#atlasApp [data-do="'+section+'"][data-key="'+digit+'"]').click();
  };
  await check('REJECT_WRONG_FIRST_CODE',async()=>{
   await dial('digit','1111');
   await page.locator('#atlasApp [data-do="unlock"]').click();
   assert((await page.locator('#atlasApp #atlasAuthError').innerText()).includes('Không thể mở dữ liệu'));
  });
  await check('UNLOCK_38_PROFILES',async()=>{
   await dial('digit','2408');
   await page.locator('#atlasApp [data-do="unlock"]').click();
   assert.equal(await page.locator('#atlasMain [data-do="profile"]').count(),38);
   assert((await page.locator('#atlasMain').innerText()).includes('Leandro'));
   assert((await page.locator('#atlasMain').innerText()).includes('Vanessa'));
  });
  await check('PROFILE_TO_MONTH_TO_ITEM_METADATA',async()=>{
   await page.locator('#atlasMain [data-do="profile"][data-id="leandro"]').click();
   assert((await page.locator('#atlasMain').innerText()).includes('18/06/2012'));
   await page.locator('#atlasMain [data-do="subtab"][data-id="archive"]').click();
   await page.locator('#atlasMain [data-do="album"][data-year="2012"][data-month="6"]').first().click();
   assert(await page.locator('#atlasMain [data-do="item"]').count()>=10);
   await page.locator('#atlasMain [data-do="item"]').first().click();
   const meta=await page.locator('#atlasMain').innerText();
   assert(meta.includes('Nguồn')&&meta.includes('Đã lưu')&&meta.includes('Ngày ghi nhận'));
   await page.locator('#atlasApp [data-do="back"]').first().click();
   await page.locator('#atlasApp [data-do="back"]').first().click();
  });
  await check('SECONDARY_CODE_UNLOCK_REVEALS_MORE',async()=>{
   assert(await page.locator('#atlasApp [data-do="secondary"]').count());
   const before=await page.locator('#atlasMain').innerText();
   await page.locator('#atlasApp [data-do="secondary"]').click();
   await dial('digit2','1105');
   await page.locator('#atlasApp [data-do="secondary-open"]').click();
   assert.equal(await page.locator('#atlasApp [data-do="secondary"]').count(),0);
   const after=await page.locator('#atlasMain').innerText();
   assert.notEqual(after,before);
   assert((await page.evaluate(()=>window.Atlas2015.getStatus())).secondaryUnlocked);
  });
  await check('SEARCH_METADATA_AND_OPEN_RESULT',async()=>{
   await page.locator('#atlasApp [data-do="search"]').first().click();
   await page.locator('#atlasSearchInput').fill('VH Archive');
   assert(await page.locator('#atlasMain [data-do="search-item"]').count()>0);
   await page.locator('#atlasMain [data-do="search-item"]').first().click();
   assert((await page.locator('#atlasMain').innerText()).includes('Nguồn'));
   await page.locator('#atlasApp [data-do="back"]').first().click();
  });
  await check('ALERTS_ACTIVITY_DELETED_AND_EVENT',async()=>{
   for(const [id,term] of [['alerts','Quy tắc'],['deleted','Rafael'],['activity','08:52']]){
    await page.locator('#atlasApp [data-do="tab"][data-id="'+id+'"]').click();
    assert((await page.locator('#atlasMain').innerText()).includes(term));
   }
   await page.evaluate(()=>window.Atlas2015.pushEvent({p:'breno',type:'device',text:'Có hoạt động mới từ Breno.'}));
   assert((await page.locator('#atlasBanner').innerText()).includes('Breno'));
   assert((await page.locator('#atlasMain').innerText()).includes('Có hoạt động mới từ Breno.'));
   await page.locator('#atlasApp [data-do="filter"][data-id="location"]').click();
   assert((await page.locator('#atlasMain').innerText()).includes('Vị trí'));
  });
  await check('SWITCH_APPS_NO_OVERLAP',async()=>{
   await page.locator('[data-app="goodreader"]').evaluate(el=>el.click());
   assert.equal(await page.locator('#atlasApp.open').count(),0);
   assert.equal(await page.locator('#goodreaderApp.open').count(),1);
   await page.locator('[data-app="atlas"]').evaluate(el=>el.click());
   assert.equal(await page.locator('#goodreaderApp.open').count(),0);
   assert.equal(await page.locator('#atlasApp.open').count(),1);
  });
  assert.equal(exceptions.length,0,'Browser exceptions:\n'+exceptions.join('\n'));
  console.log('ATLAS_BROWSER_QA_SUCCESS');
 }catch(e){console.error('ATLAS_QA_FAILED',e.stack||e);console.error('BROWSER_EXCEPTIONS',exceptions);process.exitCode=1}
 finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});
