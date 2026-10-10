'use strict';
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const BASE='http://127.0.0.1:8000/index.html';
const tests=[
 {mode:'framed',w:375,h:760,fullscreen:false},
 {mode:'compact-full',w:320,h:650,fullscreen:true},
 {mode:'iphone6-full',w:375,h:667,fullscreen:true},
 {mode:'iphone-tall',w:390,h:844,fullscreen:true},
 {mode:'narrow-tall',w:320,h:844,fullscreen:true}
];
const near=(a,b,p=3)=>Math.abs(a-b)<=p;
const within=(val,lower,upper)=>val>=lower&&val<=upper;
(async()=>{
 for(const browserType of [chromium,webkit]){
  const browser=await browserType.launch({headless:true});
  try{
   for(const t of tests){
    const page=await browser.newPage({viewport:{width:t.w,height:t.h},hasTouch:true,isMobile:true,deviceScaleFactor:2});
    const errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));
    try{
     await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:45000});
     await page.waitForTimeout(160);
     await page.evaluate(isFull=>{
       document.body.classList.toggle('caua-immersive',isFull);
       document.documentElement.style.setProperty('--caua-full-h',window.innerHeight+'px');
       document.querySelectorAll('.view.active').forEach(v=>v.classList.remove('active'));
       document.getElementById('passcodeScreen').classList.add('active');
     },t.fullscreen);
     const pass=await page.evaluate(()=>{
       const box=x=>{const r=x.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2,bottom:r.bottom,top:r.top,right:r.right}};
       const screen=box(document.getElementById('screen'));
       const label=box(document.querySelector('.caua-passcode-stack .passcode-title'));
       const dots=box(document.getElementById('passcodeDots'));
       const pad=box(document.getElementById('keypad'));
       const first=box(document.querySelector('#keypad [data-number="1"]'));
       const third=box(document.querySelector('#keypad [data-number="3"]'));
       const ninth=box(document.querySelector('#keypad [data-number="9"]'));
       const cancel=box(document.getElementById('passcodeBack'));
       const emergency=box(document.querySelector('#passcodeScreen .emergency'));
       const status=box(document.getElementById('statusBar'));
       const left=box(document.querySelector('#statusBar .status-left'));
       const right=box(document.querySelector('#statusBar .status-right'));
       const clock=box(document.getElementById('statusTime'));
       const battery=box(document.querySelector('#statusBar .battery'));
       const signal=box(document.querySelector('#statusBar .signal-dots'));
       const logo=document.querySelector('#statusBar').dataset.svgSource;
       const svgCount=document.querySelectorAll('#statusBar .ios8-sketch-svg').length;
       const toggle=document.getElementById('caua-immersive-toggle');
       const zoom=toggle&&getComputedStyle(toggle).display!=='none'?box(toggle):null;
       return {screen,label,dots,pad,first,third,ninth,cancel,emergency,status,left,right,clock,battery,signal,logo,svgCount,zoom};
     });
     assert(near(pass.clock.cx,pass.screen.cx,3),'Time is not centered in status bar');
     assert(pass.left.right<pass.clock.x+1,'Carrier overlaps time');
     assert(pass.right.x>pass.clock.right-1,'Battery group overlaps time');
     assert(pass.signal.w>=24,'Cell signal is too tiny');
     assert(pass.battery.w>=21,'Battery glyph is too tiny');
     assert(pass.svgCount===4,'Original 2015 SVGs missing');
     assert(pass.logo==='aubrey-sketch-2015-iphone5','Status glyphs were replaced');
     assert(within(pass.status.h/(pass.screen.w/320),19,24),'Status height differs from 20pt rhythm in intrinsic iPhone points');
     assert(near(pass.label.cx,pass.screen.cx,4),'Passcode title not centered');
     assert(near(pass.dots.cx,pass.screen.cx,4),'Passcode dots not centered');
     assert(near(pass.pad.cx,pass.screen.cx,4),'Passcode keypad not centered');
     assert(near(pass.first.y,pass.third.y,2),'Keypad first row not aligned');
     assert(pass.pad.bottom<pass.screen.bottom-30,'Keypad reaches bottom actions');
     assert(pass.cancel.y>pass.pad.bottom+5&&pass.emergency.y>pass.pad.bottom+5,'Bottom actions collide with keypad');
     assert(near((pass.label.top+pass.pad.bottom)/2,pass.screen.cy,pass.screen.h*.17),'Passcode group not vertically centered');
     // This geometry test toggles the CSS class without performing the real zoom gesture.
     // Comparing fixed toggle viewport coordinates with an unscaled phone frame is invalid.
     // The real-toggle overlap behavior is covered by qa/legacy-zoom-regression.cjs.
     await page.evaluate(()=>{
       document.getElementById('passcodeScreen').classList.remove('active');
       document.getElementById('phoneApp').classList.add('open');
       document.getElementById('phoneCallOverlay').classList.add('show');
     });
     const call=await page.evaluate(()=>{
       const box=el=>{const r=el.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2,bottom:r.bottom,top:r.top}};
       const screen=box(document.getElementById('screen'));
       const overlay=box(document.getElementById('phoneCallOverlay'));
       const stack=box(document.querySelector('.caua-call-stack'));
       const caller=box(document.querySelector('.phone-call-person'));
       const grid=box(document.querySelector('.phone-call-controls'));
       const controls=[...document.querySelectorAll('.phone-call-control i')].map(box);
       const labels=[...document.querySelectorAll('.phone-call-control span')].map(box);
       const red=box(document.getElementById('phoneHangup')); const redCircle=box(document.querySelector('#phoneHangup > i'));
       const cs=getComputedStyle(document.getElementById('phoneHangup'));
       return {screen,overlay,stack,caller,grid,controls,labels,red,redCircle,position:cs.position,styleBottom:cs.bottom};
     });
     assert(near(call.stack.cx,call.screen.cx,3),'Call stack not centered horizontally');
     assert(near(call.red.cx,call.screen.cx,3),'Red hangup not centered');
     assert(near(call.grid.cx,call.screen.cx,3),'Six-button grid not centered');
     assert(call.controls.length===6,'Must keep all six call actions');
     assert(near(call.controls[0].y,call.controls[1].y,2),'Call grid first row misaligned');
     assert(near(call.controls[3].y,call.controls[4].y,2),'Call grid second row misaligned');
     assert(near(call.redCircle.cx,call.controls[4].cx,2),'Red call control not centered in second column');
     assert(near(call.redCircle.cy,call.controls[3].cy,2),'Red call control not in second row');
     assert(near(call.redCircle.w,call.controls[3].w,3),'Call control circles are inconsistent');
     assert(near(call.controls[0].cx,call.controls[3].cx,2),'Left column misaligned');
     assert(near(call.controls[1].cx,call.controls[4].cx,2),'Middle column misaligned');
     assert(near(call.controls[2].cx,call.controls[5].cx,2),'Right column misaligned');
     assert(call.grid.bottom<call.screen.bottom-20,'Call controls are clipped');
     assert(call.position==='relative','End call must be a grid button');
     assert(!errors.length,errors.join('\n'));
     console.log('IOS8_STEP34_PASS',browserType.name(),t.mode,JSON.stringify({statusHeight:+pass.status.h.toFixed(1),timeCenter:+(pass.clock.cx-pass.screen.cx).toFixed(2),keypadCenter:+(pass.pad.cx-pass.screen.cx).toFixed(2),callCenter:+(call.stack.cy-call.screen.cy).toFixed(1),redAlignment:+(call.redCircle.cy-call.controls[3].cy).toFixed(1)}));
    }finally{await page.close();}
   }
  }finally{await browser.close();}
 }
})().catch(e=>{console.error('IOS8_STEP34_FAIL',e.stack||e);process.exit(1)});
