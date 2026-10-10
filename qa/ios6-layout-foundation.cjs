'use strict';
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const BASE='http://127.0.0.1:8000/index.html';
const scenarios=[{name:'compact-phone',w:320,h:700},{name:'iphone-6',w:375,h:667},{name:'tall-iphone',w:390,h:844}];
const within=(a,b,t=.022)=>Math.abs(a-b)<=t;
async function measurement(page){
 return page.evaluate(()=>{
  const screen=document.querySelector('#screen');
  const home=document.querySelector('#homeScreen');
  const icon=document.querySelector('#homeScreen [data-app="voice"] > .icon');
  const img=icon.querySelector('img');
  const label=document.querySelector('#homeScreen [data-app="voice"] > span');
  const dock=document.querySelector('#homeScreen .dock');
  const dockIcon=dock.querySelector('[data-app="mail"] > .icon');
  const dockLabel=dock.querySelector('[data-app="mail"] > span');
  const itau=document.querySelector('#homeScreen [data-app="itau-biz"] > span');
  const grid=document.querySelector('#iconGrid');
  const frame=document.querySelector('#phoneWrap');
  const r=el=>el.getBoundingClientRect();
  return {
   screenW:r(screen).width,
   screenH:r(screen).height,
   intrinsicScreenW:screen.clientWidth,
   frameW:r(frame).width,
   iconW:r(icon).width,
   imgW:r(img).width,
   labelSize:parseFloat(getComputedStyle(label).fontSize),
   labelH:r(label).height,
   labelMaxW:r(label).width,
   iconGridOverflow:grid.scrollWidth>grid.clientWidth+2,
   dockOverflow:dock.scrollWidth>dock.clientWidth+2,
   dockIconW:r(dockIcon).width,
   dockFont:parseFloat(getComputedStyle(dockLabel).fontSize),
   dockLabelH:r(dockLabel).height,
   longLabelH:r(itau).height,
   longLineHeight:parseFloat(getComputedStyle(itau).lineHeight),
   cardCount:document.querySelectorAll('#homeScreen [data-app]').length,
   parentMode:document.body.classList.contains('caua-immersive'),
   canvasZoom:getComputedStyle(screen).zoom
  };
 });
}
(async()=>{
 for(const engine of [chromium,webkit]){
  const browser=await engine.launch({headless:true});
  try{
   for(const cfg of scenarios){
    const page=await browser.newPage({viewport:{width:cfg.w,height:cfg.h},hasTouch:true,isMobile:true,deviceScaleFactor:2});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    try{
     await page.goto(BASE,{waitUntil:'domcontentloaded'});
     await page.waitForTimeout(300);
     await page.evaluate(()=>{
      document.querySelectorAll('.view.active').forEach(e=>e.classList.remove('active'));
      document.getElementById('homeScreen').classList.add('active');
     });
     const compact=await measurement(page);
     assert(compact.cardCount===14,'Expected 14 app launchers');
     assert(compact.intrinsicScreenW===320,'Framed legacy app canvas must remain 320px');
     assert(within(compact.iconW/compact.screenW,.16,.007),JSON.stringify({cfg,mode:'framed',compact}));
     assert(within(compact.labelSize/compact.intrinsicScreenW,.032,.004),'Framed label does not follow 12pt design');
     assert(within(compact.dockFont,compact.labelSize,.4),'Dock font does not match home');
     assert(within(compact.dockIconW,compact.iconW,1.5),'Dock icon differs from Home');
     assert(within(compact.imgW,compact.iconW,1.5),'Actual PNG smaller than icon frame');
     assert(!compact.iconGridOverflow&&!compact.dockOverflow,'Framed grid/dock horizontal overflow');
     assert(compact.longLabelH>=compact.longLineHeight*1.5,'Long Itaú name should use 2 lines');
     await page.evaluate(()=>document.body.classList.add('caua-immersive'));
     await page.waitForTimeout(90);
     const full=await measurement(page);
     assert(full.parentMode);
     assert(within(full.screenW,cfg.w,3),'Fullscreen must fill viewport width');
     assert(within(full.iconW/full.screenW,.16,.007),JSON.stringify({cfg,mode:'full',full}));
     assert(within(full.labelSize/full.intrinsicScreenW,.032,.004),'Fullscreen font must follow 12pt design');
     assert(within(full.dockIconW,full.iconW,1.5));
     assert(within(full.imgW,full.iconW,1.5));
     assert(!full.iconGridOverflow&&!full.dockOverflow,'Fullscreen grid/dock horizontal overflow');
     assert(within(full.labelSize/full.iconW,.2,.025),'Icon-to-text visual ratio incorrect');
     // Exercise one actual app tap after changing layout.
     await page.locator('#homeScreen [data-app="photos"]').click({timeout:8000});
     assert(await page.locator('#photosApp.open').count(),'Photos did not open after relayout');
     assert(!errors.length,'Browser JavaScript error: '+errors.join(' | '));
     console.log('IOS6_FOUNDATION_PASS',engine.name(),cfg.name,JSON.stringify({framed:{icon:compact.iconW,img:compact.imgW,label:compact.labelSize},fullscreen:{icon:full.iconW,img:full.imgW,label:full.labelSize}}));
    }finally{await page.close();}
   }
  }finally{await browser.close();}
 }
})().catch(error=>{console.error('IOS6_FOUNDATION_FAIL',error.stack||error);process.exit(1)});
