'use strict';
/* Regression for the original two-mode iPhone preview:
 * framed hardware vs borderless, aspect-preserving zoom INSIDE the webpage.
 * Exercise the REAL toggle button on laptop and phone. Never request native fullscreen.
 */
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const output='/tmp/caua-legacy-zoom-shots';
fs.mkdirSync(output,{recursive:true});
const cases=[
  {name:'laptop-1536x960',width:1536,height:960,mobile:false},
  {name:'laptop-1366x768',width:1366,height:768,mobile:false},
  {name:'iphone-6',width:375,height:667,mobile:true},
  {name:'iphone-tall',width:390,height:844,mobile:true}
];
const nearly=(a,b,tol=3)=>Math.abs(a-b)<=tol;
async function geometry(page){
  return page.evaluate(()=>{
    const r=el=>{const b=el.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height,right:b.right,bottom:b.bottom,cx:b.x+b.width/2};};
    const screen=document.getElementById('screen');
    const home=document.getElementById('homeScreen');
    const icon=home.querySelector('[data-app="voice"]>.icon');
    const grid=[...home.querySelectorAll('#iconGrid>.app')].slice(0,4).map(r);
    const dock=home.querySelector('.dock');
    return {
      screen:r(screen),frame:r(document.getElementById('phoneWrap')),
      icon:r(icon),grid,dock:r(dock),
      clientScreenWidth:screen.clientWidth,clientScreenHeight:screen.clientHeight,
      fullscreen:!!document.fullscreenElement,immersive:document.body.classList.contains('caua-immersive'),
      togglePressed:document.getElementById('caua-immersive-toggle').getAttribute('aria-pressed'),
      bezel:getComputedStyle(document.querySelector('.iphone')).borderRadius,
      hardware:getComputedStyle(document.querySelector('.top-hardware')).display,
      viewportWidth:innerWidth,viewportHeight:innerHeight,
      visualWidth:visualViewport?.width||innerWidth,visualHeight:visualViewport?.height||innerHeight
    };
  });
}
(async()=>{
 for(const engine of [chromium,webkit]){
  const browser=await engine.launch({headless:true});
  try{
   for(const test of cases){
    const page=await browser.newPage({viewport:{width:test.width,height:test.height},
      isMobile:test.mobile,hasTouch:test.mobile,deviceScaleFactor:test.mobile?2:1});
    try{
      await page.goto('http://127.0.0.1:8000/index.html',{waitUntil:'domcontentloaded',timeout:45000});
      await page.evaluate(()=>{
        document.querySelectorAll('.view.active').forEach(el=>el.classList.remove('active'));
        document.getElementById('homeScreen').classList.add('active');
      });
      let framed=await geometry(page);
      assert(!framed.immersive&&!framed.fullscreen,'Framed mode must not use fullscreen');
      assert(framed.hardware!=='none','Framed mode must retain iPhone hardware');
      await page.locator('#caua-immersive-toggle').click();
      await page.waitForTimeout(150);
      const zoom=await geometry(page);
      assert(zoom.immersive&&zoom.togglePressed==='true','Real zoom toggle did not activate');
      assert(!zoom.fullscreen,'Zoom incorrectly requested browser Fullscreen API');
      assert(zoom.clientScreenWidth===320&&zoom.clientScreenHeight===568,
        'Zoom must preserve 320x568 intrinsic screen (no responsive desktop reflow)');
      const aspect=zoom.screen.w/zoom.screen.h;
      assert(nearly(aspect,320/568,.008),'Zoom did not retain portrait aspect ratio: '+aspect);
      const expectedScale=Math.min(Math.min(zoom.viewportWidth,zoom.visualWidth)/320,
        Math.min(zoom.viewportHeight,zoom.visualHeight)/568);
      assert(nearly(zoom.screen.w,320*expectedScale,3.5),
        'Zoom scale wrong: '+JSON.stringify({test,zoom,expectedScale}));
      assert(nearly(zoom.screen.cx,zoom.viewportWidth/2,5),'Zoom canvas not centered');
      assert(zoom.hardware==='none','Zoom must hide hardware bezel/earpiece');
      assert(zoom.icon.w/zoom.screen.w>.135&&zoom.icon.w/zoom.screen.w<.23,
        'Icon-to-screen ratio is broken: '+JSON.stringify(zoom));
      for(let i=1;i<4;i++){
        const delta=(zoom.grid[i].cx-zoom.grid[i-1].cx)/zoom.screen.w;
        assert(delta>.20&&delta<.30,'Home icons reflowed across desktop width: '+delta);
      }
      assert(zoom.dock.w<=zoom.screen.w+2,'Dock wider than scaled phone screen');
      assert(zoom.screen.x>=-4&&zoom.screen.right<=zoom.viewportWidth+4,'Canvas horizontally clipped');
      const out=output+'/'+engine.name()+'-'+test.name+'.png';
      await page.screenshot({path:out,animations:'disabled'});
      assert(fs.statSync(out).size>12000,'Empty screenshot: '+out);
      await page.locator('#caua-immersive-toggle').click();
      await page.waitForTimeout(50);
      const returned=await geometry(page);
      assert(!returned.immersive&&!returned.fullscreen,'Framed toggle must return to normal');
      assert(returned.hardware!=='none','Framed hardware did not return');
      assert(nearly(returned.frame.w,framed.frame.w,4),'Original framed dimensions changed');
      console.log('LEGACY_ZOOM_PASS',engine.name(),test.name,
        JSON.stringify({screen:zoom.screen,icon:zoom.icon.w,expectedScale:+expectedScale.toFixed(3)}));
    }finally{await page.close();}
   }
  }finally{await browser.close();}
 }
})().catch(e=>{console.error('LEGACY_ZOOM_FAIL',e.stack||e);process.exit(1)});
