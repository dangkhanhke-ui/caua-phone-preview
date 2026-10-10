'use strict';
/* STEP 6: screenshot and geometry audit BEFORE GitHub Pages deployment.
 * Runs under Chromium + WebKit. Never changes user data on production.
 * Screenshots are uploaded as a CI artifact, not published as public app files.
 */
const {chromium,webkit}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const output=process.env.SCREENSHOT_OUTPUT_DIR||'/tmp/caua-ios8-step56-shots';
fs.mkdirSync(output,{recursive:true});
const point=(el)=>{const r=el.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2,b:r.bottom}};
const confs=[
  {name:'iphone6',width:375,height:667},
  {name:'iphone-tall',width:390,height:844}
];
const apps=[
 'voice','calendar','photos','notes','facebook','itau','itau-biz',
 'whatsapp','goodreader','atlas','phone','messages','mail','safari'
];
const ids={voice:'voiceApp',calendar:'calendarApp',photos:'photosApp',notes:'notesApp',
 facebook:'facebookApp',itau:'itauApp','itau-biz':'itauBizApp',whatsapp:'whatsappApp',
 goodreader:'goodreaderApp',atlas:'atlasApp',phone:'phoneApp',messages:'messagesApp',
 mail:'mailApp',safari:'safariApp'};
function assertClose(a,b,tolerance,message){
 assert(Math.abs(a-b)<=tolerance,message+' ('+a+' vs '+b+')');
}
async function collect(page){
 return page.evaluate(()=>{
  const R=el=>{const r=el.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height,cx:r.left+r.width/2,b:r.bottom,top:r.top}};
  const query=s=>document.querySelector(s);
  const screen=R(query('#screen'));
  const home=R(query('#homeScreen'));
  const icon=R(query('#homeScreen [data-app="voice"] .icon'));
  const png=R(query('#homeScreen [data-app="voice"] img'));
  const dockIcon=R(query('#homeScreen [data-app="phone"] .icon'));
  const name=query('#homeScreen [data-app="voice"] > span');
  const dockName=query('#homeScreen [data-app="phone"] > span');
  const status=R(query('#statusBar'));
  const clock=R(query('#statusBar .status-time'));
  const batt=R(query('#statusBar .battery'));
  const glyph=selector=>{
    const el=query(selector);if(!el)return null;
    const style=getComputedStyle(el);const r=R(el);
    return {w:parseFloat(style.width)||r.w,h:parseFloat(style.height)||r.h,font:parseFloat(style.fontSize)||0,
      stroke:style.strokeWidth,fill:style.fill,color:style.color};
  };
  const get=(selector,prop)=>{const e=query(selector);return e?getComputedStyle(e).getPropertyValue(prop).trim():null};
  const styles={
   mailTitle:glyph('#mailApp .mail-nav-title'),
   msgTitle:glyph('#messagesApp .msg-nav-title'),
   phoneTitle:glyph('#phoneApp .phone-nav-title'),
   notesTitle:glyph('#notesApp .notes-nav-title'),
   calendarTitle:glyph('#calendarApp .calendar-nav-title'),
   photosTitle:glyph('#photosApp .photos-nav-title'),
   voiceTitle:glyph('#voiceApp .voice-detail-nav-title'),
   photosIcon:glyph('#photosApp .photos-tabbar .photos-tab svg'),
   phoneIcon:glyph('#phoneApp .phone-tabbar .phone-tab-icon'),
   facebookIcon:glyph('#facebookApp .fb15-tabbar .fb15-tab svg'),
   atlasIcon:glyph('#atlasApp .a10-tabbar .a10-tab svg'),
   grTitle:glyph('#goodreaderApp .gr4-nav strong'),
   brandWhatsApp:get('#waIos15 .wai-header','background-color'),
   brandFacebook:get('#facebookApp .fb15-navbar','background-color'),
   brandAtlas:get('#atlasApp .a10-navbar','background-color')
  };
  return {screen,home,icon,png,dockIcon,iconCSS:parseFloat(getComputedStyle(query('#homeScreen [data-app="voice"] .icon')).width),nameFont:parseFloat(getComputedStyle(name).fontSize),
   dockFont:parseFloat(getComputedStyle(dockName).fontSize),status,clock,batt,
   appCount:document.querySelectorAll('#homeScreen [data-app]').length,
   rawScreenWidth:query('#screen').clientWidth,
   immersive:document.body.classList.contains('caua-immersive'),
   styles
  };
 });
}
async function mode(page,immersive){
 await page.evaluate(full=>{
   document.body.classList.toggle('caua-immersive',full);
   // Match actual button behavior (visualViewport is the source in production).
   const vh=Math.round(window.visualViewport?.height||window.innerHeight);
   document.documentElement.style.setProperty('--caua-full-h',vh+'px');
   document.querySelectorAll('.view.active').forEach(el=>el.classList.remove('active'));
   document.getElementById('homeScreen').classList.add('active');
 },immersive);
 await page.waitForTimeout(180);
}
async function shot(page,label){const destination=path.join(output,label+'.png');
 await page.screenshot({path:destination,animations:'disabled',timeout:25000});
 assert(fs.statSync(destination).size>12000,'Suspiciously empty screenshot: '+destination);
 return destination;
}
async function validatePasscode(page,prefix){
 await page.evaluate(()=>{
   document.querySelectorAll('.view.active').forEach(el=>el.classList.remove('active'));
   document.getElementById('passcodeScreen').classList.add('active');
 });
 const p=await page.evaluate(()=>{
   const R=s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2,b:r.bottom}};
   return {s:R('#screen'),title:R('.caua-passcode-stack .passcode-title'),
    dots:R('#passcodeDots'),keys:R('#keypad'),button:R('#keypad .key')};
 });
 assertClose(p.s.cx,p.title.cx,3,'Passcode title center');
 assertClose(p.s.cx,p.dots.cx,3,'Passcode dots center');
 assertClose(p.s.cx,p.keys.cx,3,'Passcode keypad center');
 assert(p.keys.b<p.s.b-30,'Passcode actions must fit below keypad');
 await shot(page,prefix+'-passcode');
}
async function validateCall(page,prefix){
 await page.evaluate(()=>{
   document.getElementById('passcodeScreen').classList.remove('active');
   document.getElementById('phoneApp').classList.add('open');
   document.getElementById('phoneCallOverlay').classList.add('show');
 });
 const p=await page.evaluate(()=>{
   const R=s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2,b:r.bottom}};
   const buttons=[...document.querySelectorAll('.phone-call-controls > button')];
   return {screen:R('#screen'),grid:R('.phone-call-controls'),
     red:R('#phoneHangup > i'),controls:buttons.map(el=>{const r=el.querySelector('i').getBoundingClientRect();return {cx:r.left+r.width/2,cy:r.top+r.height/2,w:r.width}}),
     actions:buttons.map(el=>el.dataset.callAction||el.id),
     position:getComputedStyle(document.getElementById('phoneHangup')).position};
 });
 assertClose(p.screen.cx,p.grid.cx,3,'Call grid center');
 assertClose(p.screen.cx,p.red.cx,3,'End-call circle center');
 assert(p.actions.join(',')==='speaker,facetime,mute,more,phoneHangup,keypad','In-call reference control order');
 assert(p.controls.length===6,'Six call controls missing');
 for(let col=0;col<3;col++)assertClose(p.controls[col].cx,p.controls[col+3].cx,2,'Misaligned call column '+col);
 assertClose(p.controls[3].cy,p.controls[4].cy,2,'End Call is not inside second row');
 assertClose(p.controls[4].cy,p.controls[5].cy,2,'Second-row controls misaligned');
 assertClose(p.controls[4].w,p.controls[3].w,3,'End Call diameter differs from controls');
 assert(p.red.b<p.screen.b-20,'End-call button clipped');
 assert(p.position==='relative','End-call should be a normal grid item');
 await shot(page,prefix+'-call');
 // Exercise all live call controls, not merely their shapes.
 await page.locator('[data-call-action="speaker"]').click();
 assert((await page.locator('[data-call-action="speaker"]').getAttribute('aria-pressed'))==='true','Speaker button does not toggle');
 await page.locator('[data-call-action="mute"]').click();
 assert((await page.locator('[data-call-action="mute"]').getAttribute('aria-pressed'))==='true','Mute button does not toggle');
 await page.locator('[data-call-action="keypad"]').click();
 assert(await page.locator('#phoneInCallKeypad').isVisible(),'In-call keypad does not open');
 await page.locator('[data-call-digit="5"]').click();
 await page.locator('[data-call-digit="2"]').click();
 assert((await page.locator('#phoneInCallDigits').innerText())==='52','In-call digits do not register');
 await page.locator('#phoneInCallBack').click();
 assert(!(await page.locator('#phoneInCallKeypad').isVisible()),'In-call keypad failed to close');
 await page.locator('[data-call-action="more"]').click();
 assert(await page.locator('#phoneCallMorePanel').isVisible(),'More menu does not open');
 await page.locator('[data-call-extra="cancel"]').click();
 assert(!(await page.locator('#phoneCallMorePanel').isVisible()),'More menu failed to close');
 await page.locator('#phoneHangup').click();
 assert(!(await page.locator('#phoneCallOverlay').isVisible()),'End Call did not close the call');
}

(async()=>{
 let total=0;
 const report=[];
 for(const engine of [chromium,webkit]){
  const browser=await engine.launch({headless:true});
  try{
   for(const config of confs){
    const page=await browser.newPage({viewport:config,hasTouch:true,isMobile:true,deviceScaleFactor:2});
    const pageErrors=[];
    page.on('pageerror',e=>pageErrors.push(e.stack||e.message));
    try{
     await page.goto('http://127.0.0.1:8000/index.html',{waitUntil:'domcontentloaded',timeout:45000});
     for(const immersive of [false,true]){
      await mode(page,immersive);
      const prefix=engine.name()+'-'+config.name+'-'+(immersive?'fullscreen':'framed');
      const data=await collect(page);
      assert(data.appCount===14,'Missing an app launcher');
      assertClose(data.icon.w/data.screen.w,.16,.007,'Icon / screen width');
      assertClose(data.png.w,data.icon.w,1,'Image must fully fill icon');
      assertClose(data.dockIcon.w,data.icon.w,1,'Dock and Home icon size');
      assertClose(data.dockFont,data.nameFont,.35,'Dock and Home font');
      assertClose(data.nameFont/data.iconCSS,.2,.025,'Home icon/text proportions (CSS layout units)');
      assertClose(data.clock.cx,data.screen.cx,3,'Status time must be centered');
      assert(data.batt.w>=21,'Status battery too small');
      let headersChecked=0;
      for(const id of ['mailTitle','msgTitle','phoneTitle','notesTitle','calendarTitle','photosTitle','voiceTitle']){
       if(data.styles[id]){
        assert(Math.abs(data.styles[id].font-17)<.5,'Native title '+id);
        headersChecked++;
       }
      }
      assert(headersChecked>=3,'Not enough initialized system app headers: '+headersChecked);
      const ico=data.styles;
      let glyphsChecked=0;
      for(const [name,target] of [['photosIcon',24],['phoneIcon',25],['facebookIcon',21],['atlasIcon',22]]){
       if(ico[name]){
        assert(Math.abs(ico[name].w-target)<2,'Unexpected toolbar SVG '+name);
        glyphsChecked++;
       }
      }
      assert(glyphsChecked>=2,'Not enough initialized toolbar glyphs: '+glyphsChecked);
      await shot(page,prefix+'-home');
      await validatePasscode(page,prefix);
      await validateCall(page,prefix);
      report.push({engine:engine.name(),viewport:config.name,mode:immersive?'fullscreen':'framed',
       screen:data.screen.w,icon:data.icon.w,photo:data.png.w,
       label:data.nameFont,clockOffset:data.clock.cx-data.screen.cx,statusHeight:data.status.h,
       battery:data.batt.w,callAndPasscode:'pass'});
      console.log('STEP56_VISUAL_PASS',prefix,JSON.stringify(report.at(-1)));
      total++;
     }
     // Smoke every launcher in WebKit on real-world fullscreen viewport.
     if(engine.name()==='webkit'&&config.name==='iphone-tall'){
      await mode(page,true);
      for(const app of apps){
       await page.evaluate(()=>{
         document.getElementById('phoneCallOverlay').classList.remove('show');
         document.getElementById('phoneApp').classList.remove('open');
       });
       const key=app;
       await page.locator('#homeScreen [data-app="'+key+'"]').evaluate(el=>el.click());
       await page.waitForTimeout(80);
       const open=await page.locator('#'+ids[key]+'.open').count();
       assert(open===1,'Launcher did not open: '+key);
       await shot(page,'webkit-iphone-tall-fullscreen-app-'+key);
       // Validate lazy-rendered brand chrome once its app has actually opened.
       if(key==='atlas' || key==='goodreader'){
        const g=await page.evaluate(k=>{
          const root=k==='atlas'?document.querySelector('#atlasApp'):document.querySelector('#goodreaderApp');
          const nav=k==='atlas'?root.querySelector('.a10-tab svg'):root.querySelector('.gr4-nav strong');
          return nav?{font:parseFloat(getComputedStyle(nav).fontSize),width:parseFloat(getComputedStyle(nav).width)}:null;
        },key);
        // Atlas may legitimately show its password gate before creating tabs.
        if(key==='goodreader')assert(g && Math.abs(g.font-15)<.5,'GoodReader lazy navigation typography');
        if(key==='atlas'&&g)assert(Math.abs(g.width-22)<2,'Atlas lazy SVG dimension');
       }
       // Use the application's immediate Home action here, not repeated hardware
       // button clicks. Two hardware presses within 280 ms intentionally open
       // the iOS multitasking switcher, which made this sequential smoke flaky.
       await page.evaluate(()=>{
         document.getElementById('screen').dispatchEvent(new CustomEvent('caua:home-now'));
       });
       await page.waitForTimeout(80);
       total++;
      }
     }
     assert(!pageErrors.length,'Browser JS errors: '+pageErrors.join('\n'));
    }finally{await page.close();}
   }
  }finally{await browser.close();}
 }
 fs.writeFileSync(path.join(output,'measured-sizes.json'),JSON.stringify(report,null,2));
 console.log('STEP56_ALL_PASSED',total,'screenshots',fs.readdirSync(output).filter(s=>s.endsWith('.png')).length);
})().catch(error=>{console.error('STEP56_VISUAL_FAIL',error.stack||error);process.exit(1)});
