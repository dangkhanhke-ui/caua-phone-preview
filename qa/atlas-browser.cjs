const {chromium}=require('playwright');
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');

for(const file of ['assets/atlas/atlas-data.js','assets/atlas/atlas-v2.js'])new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});
const html=fs.readFileSync('index.html','utf8');
for(const marker of ['data-app="atlas"','id="atlasApp"','atlas-v2.css','atlas-v2.js',"atlas: { id:'atlasApp'"])assert(html.includes(marker),'Missing '+marker);
let inline=0;
for(const match of html.matchAll(/<script\b(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi))new vm.Script(match[1],{filename:'inline-'+(++inline)});
console.log('ATLAS_V2_STATIC_PASS',inline);

(async()=>{
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:465,height:890},hasTouch:true});
const errors=[];
page.on('pageerror',e=>errors.push(e.stack||e.message));
const verify=async(label,fn)=>{await fn();console.log('ATLAS_V2_PASS',label)};
const dial=async(value)=>{for(const num of value)await page.locator('#atlasApp [data-atlas="digit"][data-key="'+num+'"]').click();};
const tab=async(name)=>{await page.locator('#atlasApp .a10-tabbar [data-atlas="tab"][data-id="'+name+'"]').click();};
try{
 await page.goto('http://127.0.0.1:8000/index.html',{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForTimeout(500);
 await verify('LOCK_IS_CLEAN_AND_PRIVATE',async()=>{
   await page.locator('[data-app="atlas"]').evaluate(el=>el.click());
   assert(await page.locator('#atlasApp.open').count());
   assert(await page.locator('.a10-pass-overlay').count());
   assert.equal(await page.locator('#atlasApp .a10-tabbar').count(),0);
   assert.equal(await page.locator('#atlasApp .a10-navbar').count(),0);
   assert.equal(await page.locator('#atlasApp #a10Search').count(),0);
 });
 await verify('PASSCODE_WRONG_THEN_1111',async()=>{
   await dial('1234');
   assert((await page.locator('#a10PassError').innerText()).includes('Không thể mở'));
   await dial('1111');
   assert(await page.locator('#atlasApp .a10-navbar').count());
   assert.equal(await page.locator('.a10-pass-overlay').count(),0);
 });
 await verify('HOME_SEARCH_AND_38_COMPACT_AVATARS',async()=>{
   assert(await page.locator('#a10Search').count());
   assert.equal(await page.locator('#atlasApp .a10-person-row').count(),38);
   assert(await page.locator('#atlasApp .a10-carousel .a10-feature').count()>=3);
   assert.equal(await page.locator('#atlasApp .a10-avatar.small').count(),38);
   await page.locator('#a10Search').fill('Vanessa');
   assert((await page.locator('#a10Content').innerText()).includes('Vanessa'));
   await page.locator('#a10Search').fill('VH Archive');
   assert(await page.locator('#a10Content [data-atlas="item"]').count()>0);
   await page.locator('#a10Search').fill('');
 });
 await verify('CAROUSEL_SWIPES_NATIVELY',async()=>{
   const value=await page.locator('.a10-carousel').evaluate(el=>{
     el.scrollLeft=120;return {position:el.scrollLeft,snap:getComputedStyle(el).scrollSnapType};
   });
   assert(value.position>0);
   assert(value.snap.includes('mandatory'));
 });
 await verify('PROFILE_MONTH_VIEWER_AND_SOURCE',async()=>{
   await page.locator('#atlasApp [data-atlas="profile"][data-id="leandro"]').first().click();
   assert((await page.locator('#a10Content').innerText()).includes('18/06/2012'));
   await page.locator('[data-atlas="person-tab"][data-id="files"]').click();
   await page.locator('#a10Content [data-atlas="album"][data-year="2012"][data-month="6"]').first().click();
   assert(await page.locator('#a10Content [data-atlas="item"]').count()>3);
   await page.locator('#a10Content [data-atlas="item"]').first().click();
   assert(await page.locator('#a10Stage').count());
   await page.locator('[data-atlas="meta"]').click();
   assert((await page.locator('#a10Content').innerText()).includes('Nguồn'));
   await page.locator('[data-atlas="next"]').click();
   assert(await page.locator('#a10Stage').count());
   await page.locator('[data-atlas="back"]').first().click();
   await page.locator('[data-atlas="back"]').first().click();
 });
 await verify('SECONDARY_1111_REVEALS_HIDDEN_DATA',async()=>{
   assert(await page.locator('[data-atlas="second"]').count());
   await page.locator('[data-atlas="second"]').click();
   for(const d of '1111')await page.locator('[data-atlas="digit2"][data-key="'+d+'"]').click();
   assert.equal(await page.locator('.a10-modal-back').count(),0);
   assert((await page.evaluate(()=>window.Atlas2015.getStatus())).secondaryUnlocked);
 });
 await verify('NO_FAKE_LIVE_FEED_OR_BANNERS',async()=>{
   assert.equal(await page.locator('#atlasApp .atlas-banner').count(),0);
   assert.equal(await page.locator('#atlasApp [data-do="filter"]').count(),0);
   assert(!(await page.locator('#atlasApp').innerText()).includes('Đang kết nối'));
 });
 await verify('SETTINGS_HAVE_REAL_EFFECT',async()=>{
   await tab('more');
   await page.locator('[data-atlas="settings"]').click();
   await page.locator('[data-atlas="pref"][data-id="grid"]').click();
   await page.locator('[data-atlas="back"]').click();
   await tab('home');
   assert(await page.locator('.a10-grid').count());
 });
 await verify('UPLOAD_REAL_PNG_AND_SAVE_PERSISTENTLY',async()=>{
   await tab('more');
   await page.locator('[data-atlas="upload"]').click();
   const buf=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==','base64');
   await page.locator('#a10UploadInput').setInputFiles({name:'atlas-smoke.png',mimeType:'image/png',buffer:buf});
   await page.locator('#a10UploadPerson').selectOption('breno');
   await page.locator('#a10UploadPlace').fill('Subsolo');
   await page.locator('[data-atlas="submit-upload"]').click();
   await page.waitForTimeout(350);
   assert((await page.locator('#a10Content').innerText()).includes('atlas-smoke.png'));
   assert.equal((await page.evaluate(()=>window.Atlas2015.getStatus())).imports,1);
   await page.locator('#a10Content [data-atlas="item"]').first().click();
   await page.waitForTimeout(200);
   assert(await page.locator('#a10Stage img').count()>0);
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForTimeout(350);
   await page.locator('[data-app="atlas"]').evaluate(el=>el.click());
   await dial('1111');
   await tab('more');
   await page.locator('[data-atlas="local"]').click();
   assert((await page.locator('#a10Content').innerText()).includes('atlas-smoke.png'));
   assert.equal((await page.evaluate(()=>window.Atlas2015.getStatus())).imports,1);
 });
 await verify('DELETED_ITEMS_CAN_BE_RESTORED',async()=>{
   await page.locator('#a10Content [data-atlas="item"]').first().click();
   await page.locator('[data-atlas="meta"]').click();
   await page.locator('[data-atlas="delete-local"]').click();
   await page.locator('[data-atlas="back"]').click();
   await tab('more');
   await page.locator('[data-atlas="deleted"]').click();
   assert((await page.locator('#a10Content').innerText()).includes('atlas-smoke.png'));
   await page.locator('[data-atlas="restore"]').first().click();
   assert.equal((await page.evaluate(()=>window.Atlas2015.getStatus())).imports,1);
 });
 await verify('OPEN_OTHER_APPS_WITHOUT_OVERLAP',async()=>{
   await page.locator('[data-app="goodreader"]').evaluate(el=>el.click());
   assert.equal(await page.locator('#atlasApp.open').count(),0);
   assert(await page.locator('#goodreaderApp.open').count());
 });
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('ATLAS_V2_BROWSER_QA_SUCCESS');
}catch(e){console.error('ATLAS_V2_QA_FAILED',e.stack||e);console.error('PAGE_ERRORS',errors);process.exitCode=1;}
finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
