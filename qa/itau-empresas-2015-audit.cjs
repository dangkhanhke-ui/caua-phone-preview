const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const URL='http://127.0.0.1:8000/index.html';
async function suite(browserType,name){
 const browser=await browserType.launch({headless:true});
 const results=[],failures=[];
 async function test(label,fn){
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
  const runtime=[];
  page.on('pageerror',e=>runtime.push(String(e.message)));
  page.on('dialog',d=>d.dismiss().catch(()=>{}));
  try{
   await page.goto(URL,{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('[data-app="itau-biz"]').first().evaluate(el=>el.click());
   await page.waitForTimeout(600);
   assert.equal(await page.locator('#itauBizApp').evaluate(x=>x.classList.contains('open')),true);
   const click=async(sel)=>{const x=page.locator(sel).first();assert(await x.count()>0,'missing '+sel);await x.evaluate(el=>el.click());await page.waitForTimeout(35);};
   const tab=async(id)=>click('#itauBizBottom [data-biz-tab="'+id+'"]');
   await fn({page,click,tab});
   assert.deepEqual(runtime,[],'uncaught browser error(s)');
   results.push(label);console.log('BIZ_PASS',name,label);
  }catch(err){failures.push(label+': '+(err.stack||err));console.error('BIZ_FAIL',name,label,err.stack||err);}
  finally{await page.close();}
 }
 try{
  await test('home-company-balance-5-recents',async({page})=>{
   const t=await page.locator('#itauBizContent').innerText();
   assert(t.includes('Subsolo'));assert(t.includes('66.850,40'));
   assert.equal(await page.locator('#bizRecent [data-biz-tx]').count(),5);
   assert.equal(await page.locator('#itauBizBottom [data-biz-tab]').count(),4);
  });
  await test('home-detail-back',async({page,click})=>{
   await click('#bizRecent [data-biz-tx]');
   assert((await page.locator('#itauBizTitle').innerText()).includes('Chi tiết'));
   await click('#itauBizBack');
   const afterBack=await page.locator('#itauBizContent').innerText();
   console.log('BIZ_HOME_BACK_TRACE',name,JSON.stringify({title:await page.locator('#itauBizTitle').innerText(),content:afterBack.slice(0,400),isOpen:await page.locator('#itauBizApp').evaluate(x=>x.classList.contains('open'))}));
   assert(afterBack.toLocaleLowerCase('vi').includes('giao dịch gần đây'));
  });
  await test('statement-search-rede-clear',async({page,tab,click})=>{
   await tab('statement');
   assert(await page.locator('#bizTxList [data-biz-tx]').count()>=10);
   await page.locator('#bizSearch').fill('Rede');
   assert((await page.locator('#bizResultInfo').innerText()).includes('kết quả'));
   assert(await page.locator('#bizTxList [data-biz-tx]').count()>0);
   await click('#bizClear');
   assert.equal(await page.locator('#bizSearch').inputValue(),'');
  });
  await test('statement-income-expense-pills',async({page,tab,click})=>{
   await tab('statement');
   await click('[data-biz-type="in"]');
   assert(!((await page.locator('#bizTxList').innerText()).includes('- R$')));
   await click('[data-biz-type="out"]');
   assert(!((await page.locator('#bizTxList').innerText()).includes('+ R$')));
   await click('[data-biz-type="all"]');
   assert(await page.locator('#bizTxList [data-biz-tx]').count()>3);
  });
  await test('statement-date-preset-and-empty',async({page,tab})=>{
   await tab('statement');
   await page.locator('#bizPeriod').selectOption('7-days');
   assert(await page.locator('#bizTxList [data-biz-tx]').count()>1);
   await page.locator('#bizPeriod').selectOption('2015-07');
   assert((await page.locator('#bizTxList').innerText()).includes('Không tìm thấy giao dịch'));
   await page.locator('#bizPeriod').selectOption('2015-08');
   assert(await page.locator('#bizTxList [data-biz-tx]').count()>1);
  });
  await test('custom-date-filter',async({page,tab,click})=>{
   await tab('statement');
   await page.locator('#bizPeriod').selectOption('custom');
   await page.locator('#bizCustomStart').fill('2015-08-02');
   await page.locator('#bizCustomEnd').fill('2015-08-04');
   await click('#bizCustomApply');
   const text=await page.locator('#bizTxList').innerText();
   assert(text.includes('02/08')&&text.includes('04/08'),'custom dates excluded');
   assert(!text.includes('24/08'),'date filter did not apply');
  });
  await test('transaction-detail-from-statement',async({page,tab,click})=>{
   await tab('statement');
   await click('#bizTxList [data-biz-tx]');
   assert(await page.locator('#bizReceiptBtn').count());
   await click('#itauBizBack');
   assert(await page.locator('#bizPeriod').count());
  });
  await test('receipt-on-eligible-transaction',async({page,tab,click})=>{
   await tab('statement');
   await page.locator('#bizSearch').fill('Carvalho');
   await click('#bizTxList [data-biz-tx]');
   await click('#bizReceiptBtn');
   assert((await page.locator('#itauBizContent').innerText()).includes('Biên nhận giao dịch'));
   await click('#itauBizBack');
   assert(await page.locator('#bizReceiptBtn').count());
  });
  await test('payments-six-categories',async({page,tab})=>{
   await tab('payments');
   const labels=await page.locator('[data-biz-payment]').allTextContents();
   assert.equal(labels.length,6);
   for(const name of ['bills','transfers','tax','internal','suppliers']){
    await page.locator('[data-biz-payment="'+name+'"]').evaluate(el=>el.click());
    assert((await page.locator('#itauBizTitle').innerText()).length>0);
    await page.locator('#itauBizBack').evaluate(el=>el.click());
   }
  });
  await test('payments-to-history-and-detail',async({page,tab,click})=>{
   await tab('payments');await click('[data-biz-payment="suppliers"]');
   assert(await page.locator('[data-biz-tx]').count()>0);
   await click('[data-biz-tx]');
   assert(await page.locator('#bizReceiptBtn').count());
   await click('#itauBizBack');
   assert(await page.locator('[data-biz-tx]').count()>0);
   await click('#itauBizBack');
   assert(await page.locator('[data-biz-payment]').count());
  });
  await test('payroll-7-recipients',async({page,tab,click})=>{
   await tab('payments');await click('[data-biz-payment="payroll"]');
   const t=await page.locator('#itauBizContent').innerText();
   assert(t.includes('14.800,00'));assert(t.includes('7'));
   await click('[data-biz-tx]');
   assert((await page.locator('#itauBizContent').innerText()).includes('Số người nhận'));
   await click('#bizReceiptBtn');
   assert((await page.locator('#itauBizContent').innerText()).includes('Biên nhận'));
  });
  await test('services-six-entries',async({page,tab})=>{
   await tab('services');
   assert.equal(await page.locator('[data-biz-service]').count(),6);
  });
  await test('services-receipts-to-detail-back',async({page,tab,click})=>{
   await tab('services');await click('[data-biz-service="receipts"]');
   assert(await page.locator('#bizReceiptList [data-biz-tx]').count()>0);
   await click('#bizReceiptList [data-biz-tx]');
   await click('#itauBizBack');
   assert(await page.locator('#bizReceiptList').count());
   await click('#itauBizBack');
   assert(await page.locator('[data-biz-service]').count());
  });
  await test('services-rede-total',async({page,tab,click})=>{
   await tab('services');await click('[data-biz-service="device"]');
   assert((await page.locator('#itauBizContent').innerText()).includes('58.700,00'));
   await click('#bizShowRede');
   assert.equal(await page.locator('[data-biz-tx]').count(),7);
   await click('#itauBizBack');
   assert(await page.locator('[data-biz-service]').count());
  });
  await test('services-account-security-help',async({page,tab,click})=>{
   await tab('services');
   for(const route of ['account-info','security','help']){
    await click('[data-biz-service="'+route+'"]');
    assert((await page.locator('#itauBizContent').innerText()).length>30);
    await click('#itauBizBack');
    assert(await page.locator('[data-biz-service]').count());
   }
  });
  console.log('BIZ_SUMMARY',JSON.stringify({engine:name,passed:results.length,failures:failures.length,tests:results}));
  if(failures.length)throw Error(name+' FAILED:\n'+failures.join('\n\n'));
 }finally{await browser.close();}
}
(async()=>{
 const outcomes=await Promise.allSettled([suite(chromium,'chromium'),suite(webkit,'webkit')]);
 for(const result of outcomes)if(result.status==='rejected'){console.error('BIZ_SUITE_FAILED',result.reason?.stack||result.reason);process.exitCode=1;}
})();
