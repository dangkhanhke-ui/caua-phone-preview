/* Photo viewer for Facebook / WhatsApp. Gesture rules ported from Photos. */
(()=>{'use strict';
const css=document.createElement('style');css.textContent=`
#facebookApp .caua-photo-overlay{position:absolute;inset:0;z-index:170;background:#08090c;color:white;display:flex;flex-direction:column;overflow:hidden}
#facebookApp .caua-photo-toolbar{height:46px;flex:none;background:#0d0e12;display:flex;justify-content:space-between;align-items:center;padding:0 10px;font:13px Arial}
#facebookApp .caua-photo-toolbar button{background:none;color:white;border:0;padding:10px;font:14px Arial}
#facebookApp .caua-photo-stage{min-height:0;flex:1;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;touch-action:none;cursor:zoom-in;user-select:none;-webkit-user-select:none}
#facebookApp .caua-photo-stage.is-zoomed{cursor:grab}
#facebookApp .caua-photo-stage.is-panning{cursor:grabbing}
#facebookApp .caua-photo-stage img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;transform-origin:center center;pointer-events:none;user-select:none;-webkit-user-drag:none;will-change:transform}
#waIos15 .wai-viewer{touch-action:none;overflow:hidden;user-select:none;-webkit-user-select:none;cursor:zoom-in}
#waIos15 .wai-viewer.is-zoomed{cursor:grab}
#waIos15 .wai-viewer.is-panning{cursor:grabbing}
#waIos15 .wai-viewer img{pointer-events:none;user-select:none;-webkit-user-drag:none;transform-origin:center center;will-change:transform;touch-action:none}
#waIos15 .wai-viewer>button{z-index:5}
`;document.head.appendChild(css);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function bind(stage,img){
 if(!stage||!img||stage.dataset.cauaPhotoReady)return;
 stage.dataset.cauaPhotoReady='1';
 const zoom={scale:1,x:0,y:0,min:1,max:4},pointers=new Map();
 let gesture=null,pinch=null,lastTapAt=0,lastTapX=0,lastTapY=0,suppressClick=false;
 const toLocal=(e)=>{const r=stage.getBoundingClientRect();return {x:(e.clientX-r.left)*stage.clientWidth/r.width,y:(e.clientY-r.top)*stage.clientHeight/r.height};};
 const box=()=>({w:stage.clientWidth||320,h:stage.clientHeight||430});
 function apply(animated=false){
  const {w,h}=box();
  // Same pan bounds as Photos: never use transformed image dimensions.
  const mx=Math.max(0,w*(zoom.scale-1)/2),my=Math.max(0,h*(zoom.scale-1)/2);
  zoom.x=clamp(zoom.x,-mx,mx);zoom.y=clamp(zoom.y,-my,my);
  img.style.transition=animated?'transform 220ms cubic-bezier(.22,.72,.24,1)':'none';
  img.style.transform='translate3d('+zoom.x+'px,'+zoom.y+'px,0) scale('+zoom.scale+')';
  stage.classList.toggle('is-zoomed',zoom.scale>1.015);
  const counter=stage.parentElement.querySelector('[data-caua-reset]');
  if(counter)counter.textContent=(Math.round(zoom.scale*10)/10).toString()+'×';
 }
 function reset(animated=true){zoom.scale=1;zoom.x=zoom.y=0;stage.classList.remove('is-panning');apply(animated);}
 function around(cx,cy,target,animated=true){
  const r=stage.getBoundingClientRect(),sx=stage.clientWidth/r.width,sy=stage.clientHeight/r.height;
  const px=(cx-r.left)*sx-stage.clientWidth/2,py=(cy-r.top)*sy-stage.clientHeight/2;
  const old=zoom.scale,next=clamp(target,1,4),ratio=next/old;
  zoom.x=px-(px-zoom.x)*ratio;zoom.y=py-(py-zoom.y)*ratio;zoom.scale=next;
  if(next<=1.015){zoom.x=zoom.y=0;zoom.scale=1;}
  apply(animated);
 }
 stage.addEventListener('caua-photo-reset',()=>reset());
 stage.addEventListener('dragstart',e=>e.preventDefault());
 stage.addEventListener('pointerdown',e=>{
  if(e.target.closest('button')||(e.pointerType==='mouse'&&e.button!==0))return;
  const p=toLocal(e);pointers.set(e.pointerId,p);
  try{stage.setPointerCapture(e.pointerId)}catch(_){}
  if(pointers.size===2){
   const [a,b]=[...pointers.values()];
   pinch={dist:Math.hypot(b.x-a.x,b.y-a.y)||1,scale:zoom.scale,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,x:zoom.x,y:zoom.y};
   gesture=null;lastTapAt=0;suppressClick=true;
  }else if(pointers.size===1){
   gesture={id:e.pointerId,x:p.x,y:p.y,startX:zoom.x,startY:zoom.y,moved:false,pointerType:e.pointerType};
   if(zoom.scale>1.015)stage.classList.add('is-panning');
  }
  e.preventDefault();
 });
 stage.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId))return;
  const p=toLocal(e);pointers.set(e.pointerId,p);
  if(pointers.size>=2&&pinch){
   const [a,b]=[...pointers.values()],cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
   const next=clamp(pinch.scale*Math.hypot(b.x-a.x,b.y-a.y)/pinch.dist,1,4);
   const ratio=next/pinch.scale;
   const midX=stage.clientWidth/2,midY=stage.clientHeight/2;
   zoom.scale=next;
   zoom.x=(cx-midX)-(pinch.cx-midX-pinch.x)*ratio;
   zoom.y=(cy-midY)-(pinch.cy-midY-pinch.y)*ratio;apply(false);
  }else if(pointers.size===1&&gesture&&gesture.id===e.pointerId){
   const dx=p.x-gesture.x,dy=p.y-gesture.y;
   if(Math.hypot(dx,dy)>7)gesture.moved=true;
   if(zoom.scale>1.015){zoom.x=gesture.startX+dx;zoom.y=gesture.startY+dy;apply(false);}
  }
  e.preventDefault();
 },{passive:false});
 function end(e){
  if(!pointers.has(e.pointerId))return;
  const p=toLocal(e),g=gesture;pointers.delete(e.pointerId);
  stage.classList.remove('is-panning');
  if(pinch){
   if(pointers.size<2){
    pinch=null;if(zoom.scale<1.08)reset();else apply(true);
    if(pointers.size===1){const [id,q]=[...pointers.entries()][0];gesture={id,x:q.x,y:q.y,startX:zoom.x,startY:zoom.y,moved:true,pointerType:'touch'};}
   }
   return;
  }
  if(g&&g.id===e.pointerId&&g.pointerType==='touch'&&!g.moved&&!suppressClick&&Math.hypot(p.x-g.x,p.y-g.y)<9){
   const now=performance.now();
   if(now-lastTapAt<330&&Math.hypot(p.x-lastTapX,p.y-lastTapY)<38){
    lastTapAt=0;around(e.clientX,e.clientY,zoom.scale>1.05?1:2.5,true);
   }else{lastTapAt=now;lastTapX=p.x;lastTapY=p.y;}
  }
  if(!pointers.size){gesture=null;suppressClick=false;}
 }
 stage.addEventListener('pointerup',end);
 stage.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);pinch=null;gesture=null;stage.classList.remove('is-panning');apply(true);});
 // Desktop is deliberately separate: exactly one dblclick event per zoom.
 stage.addEventListener('dblclick',e=>{e.preventDefault();e.stopPropagation();around(e.clientX,e.clientY,zoom.scale>1.05?1:2.5,true);});
 stage.addEventListener('wheel',e=>{
  if(!(e.ctrlKey||e.metaKey))return;
  e.preventDefault();around(e.clientX,e.clientY,zoom.scale*Math.exp(-e.deltaY*.004),false);
 },{passive:false});
 img.addEventListener('load',()=>apply(false));apply(false);
}
const fb=document.getElementById('facebookApp'),wa=document.getElementById('whatsappApp');
let overlay=null;
function close(){if(overlay){overlay.remove();overlay=null;}}
function open(src){
 close();overlay=document.createElement('div');overlay.className='caua-photo-overlay';
 overlay.innerHTML='<div class="caua-photo-toolbar"><button type="button" data-caua-close>‹ Quay lại</button><span>Ảnh</span><button type="button" data-caua-reset>1×</button></div><div class="caua-photo-stage"><img alt="Ảnh Facebook" draggable="false"></div>';
 fb.appendChild(overlay);
 overlay.querySelector('[data-caua-close]').onclick=close;
 overlay.querySelector('[data-caua-reset]').onclick=()=>overlay.querySelector('.caua-photo-stage').dispatchEvent(new Event('caua-photo-reset'));
 const im=overlay.querySelector('img');im.src=src;bind(overlay.querySelector('.caua-photo-stage'),im);
}
if(fb)fb.addEventListener('click',e=>{
 if(overlay)return;
 const im=e.target.closest('.fb15-media.photo img,.fb15-photo-grid img,.fb15-link-thumb.photo img,.fb15-ad-thumb.photo img,.fb15-profile-cover img');
 if(!im||!fb.contains(im))return;
 e.preventDefault();e.stopImmediatePropagation();open(im.currentSrc||im.src);
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()},true);
document.getElementById('homeButton')?.addEventListener('click',close,true);
if(wa){
 const observe=new MutationObserver(()=>{
  const v=wa.querySelector('.wai-viewer');
  if(v&&!v.dataset.cauaPhotoReady)bind(v,v.querySelector('img'));
 });
 observe.observe(wa,{childList:true,subtree:true});
 const current=wa.querySelector('.wai-viewer');if(current)bind(current,current.querySelector('img'));
}
})();