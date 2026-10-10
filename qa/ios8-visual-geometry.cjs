'use strict';
const {chromium,webkit}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const out=path.resolve('qa-artifacts/ios8-step56');
fs.mkdirSync(out,{recursive:true});
const tests=[
 {engine:'chromium',browser:chromium},
 {engine:'webkit',browser:webkit}
];
const sizes=[{id:'iphone6',width:375,height:667},{id:'tall',width:390,height:844}];
const modes=['framed','fullscreen'];
const screenshotNames=['home','passcode','call','messages','mail','photos','safari','facebook','whatsapp','atlas','goodreader','itau','itau-biz','calendar','notes','voice','phone'];
const appByName={messages:'messagesApp',mail:'mailApp',photos:'photosApp',safari:'safariApp',facebook:'facebookApp',whatsapp:'whatsappApp',atlas:'atlasApp',goodreader:'goodreaderApp',itau:'itauApp','itau-biz':'itauBizApp',calendar:'calendarApp',notes:'notesApp',voice:'voiceApp',phone:'phoneApp'};
const report=[];
function approx(a,b,t=2){return Math.abs(a-b)<=t;}
async function show(page,name){
 await page.evaluate(name=>{
   const screen=document.getElementById('screen');
   const classes=[...screen.classList].filter(c=>c.endsWith('-open'));
   screen.classList.remove(...classes);
   for(const el of screen.querySelectorAll('.view.active'))el.classList.remove('active');
   for(const el of screen.querySelectorAll('[id$="App"].open'))el.classList.remove('open');
   document.getElementById('phoneCallOverlay')?.classList.remove('show');
   if(name==='home'||name==='passcode'){
      document.getElementById(name==='home'?'homeScreen':'passcodeScreen').classList.add('active');
   }else if(name==='call'){
      document.getElementById('phoneApp').classList.add('open');
      document.getElementById('phoneCallOverlay').classList.add('show');
      screen.classList.add('phone-open');
   }else{
      const lookup={messages:'messagesApp',mail:'mailApp',photos:'photosApp',safari:'safariApp',facebook:'facebookApp',whatsapp:'whatsappApp',atlas:'atlasApp',goodreader:'goodreaderApp',itau:'itauApp','itau-biz':'itauBizApp',calendar:'calendarApp',notes:'notesApp',voice:'voiceApp',phone:'phoneApp'};
      const id=lookup[name];const app=document.getElementById(id);
      if(app)app.classList.add('open');
      screen.classList.add(name+'-open');
   }
 },name);
 await page.waitForTimeout(120);
}
async function measure(page,name){
 return page.evaluate(name=>{
   const screen=document.getElementById('screen');
   const r=el=>{if(!el)return null;const x=el.getBoundingClientRect();return {x:x.x,y:x.y,w:x.width,h:x.height,left:x.left,right:x.right,top:x.top,bottom:x.bottom,cx:x.x+x.width/2,cy:x.y+x.height/2}};
   const fs=el=>el?parseFloat(getComputedStyle(el).fontSize):null;
   const bar=r(document.getElementById('statusBar'));
   const clock=r(document.querySelector('#statusBar .status-time'));
   const battery=r(document.querySelector('#statusBar .battery'));
   const icon=r(document.querySelector('#homeScreen .icon-grid [data-app="voice"] .icon'));
   const img=r(document.querySelector('#homeScreen .icon-grid [data-app="voice"] img'));
   const label=document.querySelector('#homeScreen .icon-grid [data-app="voice"]>span');
   const pass=r(document.querySelector('.caua-passcode-stack'));
   const pad=r(document.getElementById('keypad'));
   const stack=r(document.querySelector('.caua-call-stack'));
   const red=r(document.getElementById('phoneHangup'));
   const controls=r(document.querySelector('.phone-call-controls'));
   const refs={messages:'.msg-nav-title',mail:'.mail-nav-title',photos:'.photos-nav-title',calendar:'.calendar-nav-title',phone:'.phone-nav-title'};
   const title=document.querySelector(refs[name]||'.msg-nav-title');
   return {
      name,screen:r(screen),bar,clock,battery,icon,img,labelFont:fs(label),iconCssW:parseFloat(getComputedStyle(document.querySelector('#homeScreen .icon-grid [data-app="voice"] .icon')).width),labelRect:r(label),
      pass,pad,stack,red,controls,
      titleFont:fs(title),titleText:title?.textContent?.trim()||'',
      colors:{status:getComputedStyle(document.getElementById('statusBar')).color,button:getComputedStyle(document.getElementById('phoneHangup')).backgroundColor},
      scrollbarX:screen.scrollWidth>screen.clientWidth+3,
      errors:[...document.querySelectorAll('img')].filter(x=>x.complete&&x.naturalWidth===0&&x.closest('#homeScreen')).map(x=>x.src)
   };
 },name);
}
(async()=>{
 for(const t of tests){
  const browser=await t.browser.launch({headless:true});
  try{
   for(const size of sizes){
    const page=await browser.newPage({viewport:size,deviceScaleFactor:2,isMobile:true,hasTouch:true});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    try{
     await page.goto('http://127.0.0.1:8000/index.html',{waitUntil:'domcontentloaded',timeout:45000});
     await page.waitForTimeout(280);
     for(const mode of modes){
      await page.evaluate(mode=>{
       document.body.classList.toggle('caua-immersive',mode==='fullscreen');
       document.documentElement.style.setProperty('--caua-full-h',window.innerHeight+'px');
      },mode);
      for(const name of screenshotNames){
       await show(page,name);
       const m=await measure(page,name);
       assert(!m.scrollbarX,JSON.stringify({reason:'screen horizontal overflow',t:t.engine,size,mode,name}));
       assert(m.icon&&m.img&&approx(m.icon.w,m.img.w,2),'Home icon artwork and tile mismatched');
       assert(approx(m.clock.cx,m.screen.cx,3),'2015 status clock not horizontally centered');
       assert(m.battery.right<m.screen.right+1,'Status battery clipped');
       assert(m.bar.h>=15&&m.bar.h<=25,'Status bar height outside scaled iOS8 range');
       if(mode==='fullscreen'){
        assert(approx(m.screen.w,size.width,3),'Fullscreen does not fill visual viewport');
       }
       if(name==='home'){
        assert(approx(m.labelFont/m.iconCssW,.2,.025),'Home name/icon CSS ratio differs from iOS 8 design');
       }
       if(name==='passcode'){
        assert(approx(m.pass.cx,m.screen.cx,3),'Password UI group off-center');
        assert(approx(m.pad.cx,m.screen.cx,3),'Keypad off-center');
        assert(m.pad.bottom<m.screen.bottom-25,'Password keypad collides with bottom');
       }
       if(name==='call'){
        assert(approx(m.stack.cx,m.screen.cx,3),'Call stack off-center');
        assert(approx(m.red.cx,m.screen.cx,3),'End call button off-center');
        assert(m.red.top>=m.controls.bottom+8,'Hangup button overlaps controls');
        assert(m.red.top-m.controls.bottom<=105,'Hangup button detached from controls');
       }
       if(['messages','mail','photos'].includes(name)&&m.titleText){
        assert(m.titleFont>=15&&m.titleFont<=19,name+' nav text outside system rhythm');
       }
       if(name==='home'&&m.errors.length)throw Error('Missing launcher image '+m.errors.join(','));
       const filename=[t.engine,size.id,mode,name].join('-')+'.png';
       await page.screenshot({path:path.join(out,filename),animations:'disabled',timeout:16000});
       report.push({browser:t.engine,viewport:size.id,mode,...m,screenshot:filename});
      }
     }
     assert(!errors.length,'Page JS errors: '+errors.join('\n'));
     console.log('IOS8_VISUAL_PASS',t.engine,size.id,2*screenshotNames.length,'snapshots');
    }finally{await page.close();}
   }
  }finally{await browser.close();}
 }
 fs.writeFileSync(path.join(out,'geometry-report.json'),JSON.stringify(report,null,2));
 console.log('IOS8_VISUAL_TOTAL',report.length);
})().catch(error=>{console.error('IOS8_VISUAL_FAIL',error.stack||error);process.exit(1)});
