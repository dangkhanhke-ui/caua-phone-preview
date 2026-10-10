/* Regression: 29 Aug 2015 canon ledger; only posted banking records. */
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const URL='http://127.0.0.1:8000/index.html';
async function suite(engine,engineName){
 const browser=await engine.launch({headless:true});
 let passed=0;const errors=[];
 async function test(name,run){
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
  try{
   await page.goto(URL,{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('[data-app="itau-biz"]').first().evaluate(e=>e.click());
   await page.locator('#itauBizContent .itau-balance-value').waitFor({timeout:18000});
   const click=async(sel)=>{const el=page.locator(sel).first();await el.waitFor({timeout:12000});await el.evaluate(e=>e.click());};
   await run({page,click,tab:async(id)=>click(`[data-biz-tab="${id}"]`)});
   assert.deepEqual(pageErrors,[]);
   passed++;console.log('ITAU_CANON_PASS',engineName,name);
  }catch(e){errors.push(name+' '+(e.stack||e));console.error('ITAU_CANON_FAIL',engineName,name,e.stack||e);}finally{await page.close();}
 }
 try{
  await test('home-balance-and-account',async({page})=>{const text=await page.locator('#itauBizContent').innerText();assert(text.includes('362.670,37'));assert(text.includes('66291-8'));assert((await page.locator('#bizRecent [data-biz-tx]').count())===5);});
  await test('home-detail-reference-and-back',async({page,click})=>{await click('#bizRecent [data-biz-tx]');const detail=await page.locator('#itauBizContent').innerText();assert(detail.includes('Mã tham chiếu nội bộ'));assert(detail.includes('Số dư sau giao dịch'));assert(!detail.includes('Mã xác thực ngân hàng'));await click('#itauBizBack');assert((await page.locator('#itauBizContent').innerText()).toLocaleLowerCase('vi').includes('giao dịch gần đây'));});
  await test('statement-period-month-august',async({page,tab})=>{await tab('statement');await page.locator('#bizTxList [data-biz-tx]').first().waitFor();await page.locator('#bizPeriod').selectOption('2015-08');await page.waitForTimeout(1100);assert((await page.locator('#bizResultInfo').innerText()).includes('87 giao dịch'));});
  await test('statement-canon-2013-and-pagination',async({page,tab})=>{await tab('statement');await page.locator('#bizPeriod').selectOption('2013-03');await page.locator('#bizTxList [data-biz-tx]').first().waitFor();await page.waitForTimeout(700);assert((await page.locator('#bizResultInfo').innerText()).includes('62 giao dịch'));assert(await page.locator('#bizLoadMore').isVisible());});
  await test('statement-search-within-period',async({page,tab})=>{await tab('statement');await page.locator('#bizTxList [data-biz-tx]').first().waitFor();await page.locator('#bizPeriod').selectOption('2015-08');await page.waitForTimeout(600);await page.locator('#bizSearch').fill('Cauã');assert(!((await page.locator('#bizResultInfo').innerText()).includes('2823')));});
  await test('statement-correct-posted-filter',async({page,tab,click})=>{await tab('statement');await page.locator('#bizTxList [data-biz-tx]').first().waitFor();await click('[data-biz-type="in"]');assert(!((await page.locator('#bizTxList').innerText()).includes('- R$')));await click('[data-biz-type="out"]');assert(!((await page.locator('#bizTxList').innerText()).includes('+ R$')));});
  await test('statement-date-range-validated',async({page,tab,click})=>{await tab('statement');await page.locator('#bizTxList [data-biz-tx]').first().waitFor();await page.locator('#bizPeriod').selectOption('custom');await click('#bizCustomApply');assert((await page.locator('#itauBizContent').innerText()).includes('Khoảng thời gian'));await page.locator('#bizCustomStart').fill('2015-08-25');await page.locator('#bizCustomEnd').fill('2015-08-28');await click('#bizCustomApply');await page.locator('#bizTxList [data-biz-tx]').first().waitFor();const tx=await page.locator('#bizResultInfo').innerText();assert(tx.includes('14 giao dịch'));});
  await test('payment-navigation',async({page,tab,click})=>{await tab('payments');await click('[data-biz-payment="suppliers"]');await page.locator('[data-biz-tx]').first().waitFor({timeout:18000});await click('[data-biz-tx]');assert((await page.locator('#itauBizContent').innerText()).includes('Mã tham chiếu nội bộ'));await click('#itauBizBack');await click('#itauBizBack');assert(await page.locator('[data-biz-payment="bills"]').count()===1);});
  await test('payroll-is-derived-not-hardcoded',async({page,tab,click})=>{await tab('payments');await click('[data-biz-payment="payroll"]');await page.locator('.itau-info-block').waitFor({timeout:12000});const t=await page.locator('#itauBizContent').innerText();assert(t.includes('Tháng 8/2015'));assert(t.includes('Đã ghi nợ'));assert(t.includes('đã hạch toán'));});
  await test('service-account-details',async({page,tab,click})=>{await tab('services');await click('[data-biz-service="account-info"]');const t=await page.locator('#itauBizContent').innerText();assert(t.includes('73.951.482/0001-39'));assert(t.includes('66291-8'));assert(t.includes('Subsolo Produções e Eventos Ltda.'));});
  await test('service-reference-disclaimer',async({page,tab,click})=>{await tab('services');await click('[data-biz-service="receipts"]');await page.locator('#bizRefList [data-biz-tx]').first().waitFor({timeout:18000});assert((await page.locator('#itauBizContent').innerText()).includes('Không phải comprovante ngân hàng'));await click('#bizRefList [data-biz-tx]');assert((await page.locator('#itauBizContent').innerText()).includes('Mã tham chiếu nội bộ'));});
  await test('service-rede-august-derived',async({page,tab,click})=>{await tab('services');await click('[data-biz-service="device"]');await page.locator('.itau-info-block').waitFor({timeout:12000});assert((await page.locator('#itauBizContent').innerText()).includes('Đã ghi có tháng 8'));await click('[data-biz-payment="rede"]');await page.locator('[data-biz-tx]').first().waitFor();});
  await test('security-no-invented-token',async({page,tab,click})=>{await tab('services');await click('[data-biz-service="security"]');const text=await page.locator('#itauBizContent').innerText();assert(text.includes('Không có kết nối'));assert(!text.includes('1111'));});
  console.log('ITAU_CANON_SUMMARY',JSON.stringify({engine:engineName,passed,failed:errors.length}));if(errors.length)throw Error(errors.join('\n\n'));
 }finally{await browser.close()}
}
(async()=>{const rs=await Promise.allSettled([suite(chromium,'chromium'),suite(webkit,'webkit')]);for(const r of rs)if(r.status==='rejected'){console.error('ITAU_CANON_SUITE_ERROR',r.reason?.stack||r.reason);process.exitCode=1;}})();
