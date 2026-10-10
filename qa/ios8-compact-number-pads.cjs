'use strict';
/* Verify the circular PIN pad and Phone dialer after the size revision.
   Tests visual CSS units (before hardware zoom), centering and actual dialing.
   Both framed and borderless zoom modes are exercised. */
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
fs.mkdirSync('/tmp/caua-compact-pad-shots',{recursive:true});
const close=(a,b,t=1.1)=>Math.abs(a-b)<=t;
(async()=>{
  for(const engine of [chromium,webkit]){
    const browser=await engine.launch({headless:true});
    try{
      for(const config of [
        {name:'iphone',w:375,h:667,mobile:true},
        {name:'laptop',w:1366,h:768,mobile:false}
      ]){
        const page=await browser.newPage({
          viewport:{width:config.w,height:config.h},
          isMobile:config.mobile,hasTouch:config.mobile,deviceScaleFactor:config.mobile?2:1
        });
        try{
          await page.goto('http://127.0.0.1:8000/index.html',{waitUntil:'domcontentloaded'});
          for(const immersive of [false,true]){
            if(immersive)await page.locator('#caua-immersive-toggle').click();
            // Measure PASSCODE controls without modifying the lock state itself.
            await page.evaluate(()=>{
              document.querySelectorAll('.view.active').forEach(el=>el.classList.remove('active'));
              document.getElementById('passcodeScreen').classList.add('active');
            });
            const pass=await page.evaluate(()=>{
              const q=s=>document.querySelector(s);
              const r=e=>e.getBoundingClientRect();
              const key=q('#passcodeScreen .key[data-number="5"]');
              const title=q('#passcodeScreen .passcode-title');
              const grid=q('#passcodeScreen .keypad');
              return {
                diameter:parseFloat(getComputedStyle(key).width),
                renderedDiameter:r(key).width,
                renderedRatio:r(key).width/r(q('#screen')).width,
                height:parseFloat(getComputedStyle(key).height),
                font:parseFloat(getComputedStyle(key.querySelector('strong')).fontSize),
                titleFont:parseFloat(getComputedStyle(title).fontSize),
                dotWidth:parseFloat(getComputedStyle(q('#passcodeDots i')).width),
                border:parseFloat(getComputedStyle(key).borderTopWidth),
                weight:getComputedStyle(key.querySelector('strong')).fontWeight,
                offset:(r(grid).left+r(grid).width/2)-(r(q('#screen')).left+r(q('#screen')).width/2),
                fit:r(grid).bottom<r(q('#screen')).bottom-20
              };
            });
            assert(close(pass.diameter,60)&&close(pass.height,60),'PIN circle is wrong: '+JSON.stringify(pass));
            assert(close(pass.font,25)&&close(pass.dotWidth,11),'PIN typography is wrong');
            assert(pass.border<1.1&&Number(pass.weight)<=300,'PIN stroke/numeral weight too thick: '+JSON.stringify(pass));
            assert(Math.abs(pass.offset)<3&&pass.fit,'PIN grid off-center or cropped');
            assert(pass.renderedRatio<.205&&pass.renderedRatio>.17,'PIN still looks oversized relative to screenshot: '+JSON.stringify(pass));
            await page.screenshot({path:'/tmp/caua-compact-pad-shots/'+engine.name()+'-'+config.name+'-'+(immersive?'zoom':'framed')+'-pin.png'});

            // Open Phone from its launcher and use the actual Keypad tab & digits.
            await page.evaluate(()=>{
              document.querySelectorAll('.view.active').forEach(el=>el.classList.remove('active'));
              document.getElementById('homeScreen').classList.add('active');
            });
            await page.locator('#homeScreen [data-app="phone"]').evaluate(e=>e.click());
            await page.locator('#phoneApp [data-phone-tab="keypad"]').evaluate(e=>e.click());
            await page.waitForTimeout(60);
            const phone=await page.evaluate(()=>{
              const q=s=>document.querySelector(s),r=e=>e.getBoundingClientRect();
              const key=q('#phoneApp [data-dial-key="5"]'),grid=q('#phoneApp .phone-keypad'),screen=q('#screen'),call=q('#phoneDialCall');
              if(!key||!grid||!call)return null;
              return {
                diameter:parseFloat(getComputedStyle(key).width),
                renderedDiameter:r(key).width,
                renderedRatio:r(key).width/r(screen).width,
                font:parseFloat(getComputedStyle(key.querySelector('strong')).fontSize),
                green:parseFloat(getComputedStyle(call).width),
                offset:r(grid).left+r(grid).width/2-(r(screen).left+r(screen).width/2),
                callVisible:r(call).bottom<=r(screen).bottom+1,
                count:q('#phoneApp .phone-keypad').querySelectorAll('.phone-key').length,
                tabs:[...q('#phoneTabbar').querySelectorAll('[data-phone-tab]')].map(e=>{let b=r(e);return {center:b.left+b.width/2,width:b.width}}),
                tabbar:{left:r(q('#phoneTabbar')).left,width:r(q('#phoneTabbar')).width}
              };
            });
            assert(phone&&phone.count===12&&close(phone.diameter,60),'Phone dial circles wrong: '+JSON.stringify(phone));
            assert(close(phone.font,26)&&close(phone.green,60),'Dial glyph/call circle wrong');
            assert(Math.abs(phone.offset)<3&&phone.callVisible,'Dial grid not centered / call button clipped');
            assert(phone.tabs.length===5,'Phone tabbar must contain five visible tabs');
            for(let i=0;i<5;i++){
              const expected=phone.tabbar.left+phone.tabbar.width*(i+.5)/5;
              assert(Math.abs(phone.tabs[i].center-expected)<2.5,'Phone tab '+i+' is not in its equal-width lane: '+JSON.stringify(phone.tabs));
              assert(Math.abs(phone.tabs[i].width-phone.tabbar.width/5)<2.5,'Phone tab width differs: '+i);
            }
            assert(phone.renderedRatio<.205&&phone.renderedRatio>.16,'Dial circles still visually too large: '+JSON.stringify(phone));
            // Dial state intentionally persists when switching display modes.
            // Verify incremental input instead of assuming every tab opens empty.
            const prior=await page.locator('#phoneDialNumber').innerText();
            await page.locator('#phoneApp [data-dial-key="5"]').evaluate(e=>e.click());
            await page.locator('#phoneApp [data-dial-key="2"]').evaluate(e=>e.click());
            assert.equal(await page.locator('#phoneDialNumber').innerText(),prior+'52','Dial keys did not enter number');
            await page.locator('#phoneDeleteDigit').evaluate(e=>e.click());
            assert.equal(await page.locator('#phoneDialNumber').innerText(),prior+'5','Delete digit broken');
            await page.screenshot({path:'/tmp/caua-compact-pad-shots/'+engine.name()+'-'+config.name+'-'+(immersive?'zoom':'framed')+'-phone.png'});
            console.log('COMPACT_PAD_PASS',engine.name(),config.name,immersive?'zoom':'framed',JSON.stringify({pass,phone}));
            await page.evaluate(()=>{
              document.getElementById('phoneApp').classList.remove('open');
              document.getElementById('screen').classList.remove('phone-open');
            });
          }
        }finally{await page.close();}
      }
    }finally{await browser.close();}
  }
})().catch(e=>{console.error('COMPACT_PAD_FAIL',e.stack||e);process.exit(1)});
