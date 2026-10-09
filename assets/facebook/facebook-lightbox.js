(()=>{'use strict';
 const app=document.getElementById('facebookApp');
 if(!app)return;
 let overlay=null,stage=null,photo=null,scale=1,dx=0,dy=0,tracking=new Map(),pinch=null,drag=null,lastTap=0;
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 let savedStatusInline=null;
 const statusBar=()=>document.querySelector('#screen .status-bar')||document.querySelector('.screen .status-bar')||document.querySelector('.status-bar');
 function setPhotoStatusHidden(hidden){
  const bar=statusBar();
  if(!bar)return;
  if(hidden){
   if(savedStatusInline===null)savedStatusInline={visibility:bar.style.getPropertyValue('visibility'),visibilityPriority:bar.style.getPropertyPriority('visibility'),opacity:bar.style.getPropertyValue('opacity'),opacityPriority:bar.style.getPropertyPriority('opacity'),pointerEvents:bar.style.getPropertyValue('pointer-events'),pointerPriority:bar.style.getPropertyPriority('pointer-events')};
   bar.style.setProperty('visibility','hidden','important');bar.style.setProperty('opacity','0','important');bar.style.setProperty('pointer-events','none','important');
  }else if(savedStatusInline){
   const saved=savedStatusInline;savedStatusInline=null;
   for(const [prop,val,priority] of [['visibility',saved.visibility,saved.visibilityPriority],['opacity',saved.opacity,saved.opacityPriority],['pointer-events',saved.pointerEvents,saved.pointerPriority]]){
    if(val)bar.style.setProperty(prop,val,priority);else bar.style.removeProperty(prop);
   }
  }
 }

 function apply(){
  if(!photo||!stage)return;
  const w=stage.clientWidth,h=stage.clientHeight;
  const boundsX=Math.max(0,(w*scale-w)/2),boundsY=Math.max(0,(h*scale-h)/2);
  dx=clamp(dx,-boundsX,boundsX);dy=clamp(dy,-boundsY,boundsY);
  photo.style.transform='translate3d('+dx+'px,'+dy+'px,0) scale('+scale+')';
  stage.classList.toggle('zoomed',scale>1.01);
 }
 function zoomTo(next){scale=clamp(next,1,4);if(scale===1){dx=0;dy=0}apply()}
 function close(){if(overlay){overlay.remove();overlay=null;stage=null;photo=null;tracking.clear();pinch=null;drag=null}document.getElementById('screen')?.classList.remove('fb15-photo-fullscreen');setPhotoStatusHidden(false)}
 function open(src){
  close();scale=1;dx=0;dy=0;
  document.getElementById('screen')?.classList.add('fb15-photo-fullscreen');
  setPhotoStatusHidden(true);
  overlay=document.createElement('div');overlay.className='fb15-lightbox';
  overlay.innerHTML='<div class="fb15-lightbox-toolbar"><button type="button" data-fb-photo-close="1" aria-label="Đóng ảnh">‹ Quay lại</button><strong>Ảnh</strong><button type="button" data-fb-photo-reset="1" aria-label="Thu nhỏ">1×</button></div><div class="fb15-lightbox-stage"><img class="fb15-lightbox-photo" alt="Ảnh" draggable="false"><div class="fb15-lightbox-hint">Chạm hai lần hoặc dùng hai ngón để phóng to</div></div>';
  app.appendChild(overlay);
  stage=overlay.querySelector('.fb15-lightbox-stage');photo=overlay.querySelector('img');photo.src=src;
  overlay.querySelector('[data-fb-photo-close]').addEventListener('click',close);
  overlay.querySelector('[data-fb-photo-reset]').addEventListener('click',()=>zoomTo(1));
  stage.addEventListener('dblclick',e=>{e.preventDefault();zoomTo(scale>1.01?1:2.5)});
  stage.addEventListener('pointerdown',e=>{
   if(e.pointerType==='mouse'&&e.button!==0)return;
   tracking.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(tracking.size===2){const p=[...tracking.values()];pinch={dist:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)||1,scale};drag=null;}
   else if(tracking.size===1)drag={x:e.clientX,y:e.clientY,dx,dy};
   try{stage.setPointerCapture(e.pointerId)}catch(err){}
  });
  stage.addEventListener('pointermove',e=>{
   if(!tracking.has(e.pointerId))return;
   tracking.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(tracking.size===2&&pinch){
    const p=[...tracking.values()],dist=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
    zoomTo(pinch.scale*dist/pinch.dist);
   }else if(tracking.size===1&&drag&&scale>1.01){
    dx=drag.dx+e.clientX-drag.x;dy=drag.dy+e.clientY-drag.y;apply();
   }
   e.preventDefault();
  });
  function finish(e){
   const start=tracking.get(e.pointerId);
   tracking.delete(e.pointerId);
   if(tracking.size<2)pinch=null;
   if(!tracking.size){
    const moved=drag?Math.hypot(e.clientX-drag.x,e.clientY-drag.y):999;
    drag=null;
    if(e.pointerType==='touch'&&moved<14&&!pinch){
     const now=Date.now();if(now-lastTap<340){zoomTo(scale>1.01?1:2.5);lastTap=0;}else lastTap=now;
    }
   }
  }
  stage.addEventListener('pointerup',finish);stage.addEventListener('pointercancel',finish);
  stage.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();zoomTo(scale*(e.deltaY<0?1.15:1/1.15))}},{passive:false});
  apply();
 }
 app.addEventListener('click',e=>{
  const img=e.target.closest('.fb15-media.photo img,.fb15-photo-grid img,.fb15-link-thumb.photo img,.fb15-ad-thumb.photo img,.fb15-profile-cover>img');
  if(!img||!app.contains(img)||app.querySelector('.fb15-lightbox'))return;
  e.preventDefault();e.stopImmediatePropagation();open(img.currentSrc||img.src);
 },true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay){e.stopPropagation();close()}},true);
})();