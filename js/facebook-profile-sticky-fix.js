/* Keep Facebook profile sticky nav physically outside the scrolling layer. */
(()=>{
 'use strict';
 const app=document.getElementById('facebookApp');
 if(!app)return;
 const content=app.querySelector('.fb15-content');
 if(!content)return;
 const clone=document.createElement('div');
 clone.className='fb15-profile-tabs fb15-profile-tabs-overlay';
 clone.setAttribute('aria-hidden','true');
 Object.assign(clone.style,{position:'absolute',display:'none',zIndex:'2147483000',background:'#fff',overflow:'hidden',boxShadow:'0 1px 0 #cfd2d8'});
 app.appendChild(clone);
 let original=null;
 const sync=()=>{
   const nav=content.querySelector('.fb15-profile-tabs:not(.fb15-profile-tabs-overlay)');
   if(!nav||!app.classList.contains('open')){
     clone.style.display='none';original=null;return;
   }
   if(nav!==original){
     original=nav;
     clone.innerHTML=nav.innerHTML;
     clone.querySelectorAll('button').forEach((button,i)=>{
       button.addEventListener('click',ev=>{
         ev.preventDefault();
         nav.querySelectorAll('button')[i]?.click();
       });
     });
   }
   const cr=content.getBoundingClientRect();
   const ar=app.getBoundingClientRect();
   const nr=nav.getBoundingClientRect();
   const show=nr.top<=cr.top+2 && cr.width>0 && cr.height>0;
   clone.style.display=show?'grid':'none';
   if(!show)return;
   clone.style.top=(cr.top-ar.top)+'px';
   clone.style.left=(cr.left-ar.left)+'px';
   clone.style.width=cr.width+'px';
   clone.style.height=nr.height+'px';
   clone.style.gridTemplateColumns='repeat(4,minmax(0,1fr))';
   const actual=nav.querySelectorAll('.fb15-profile-tab');
   clone.querySelectorAll('.fb15-profile-tab').forEach((tab,i)=>{
      tab.classList.toggle('active',!!actual[i]?.classList.contains('active'));
   });
 };
 let pending=false;
 const schedule=()=>{
   if(pending)return;pending=true;
   requestAnimationFrame(()=>{pending=false;sync()});
 };
 content.addEventListener('scroll',schedule,{passive:true});
 new MutationObserver(schedule).observe(content,{childList:true,subtree:false});
 window.addEventListener('resize',schedule,{passive:true});
 app.addEventListener('click',schedule);
 schedule();
})();