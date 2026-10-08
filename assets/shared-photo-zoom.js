/* Shared Photos-style image gestures for Facebook and WhatsApp. */
(()=>{'use strict';
const style=document.createElement('style');style.textContent=`
#facebookApp .caua-zoom-overlay{position:absolute;inset:0;z-index:150;background:#09090c;color:white;display:flex;flex-direction:column;overflow:hidden}
#facebookApp .caua-zoom-header{height:46px;flex:none;display:flex;align-items:center;justify-content:space-between;padding:0 10px;background:#101116;font:13px Arial}
#facebookApp .caua-zoom-header button{background:none;border:0;color:white;padding:10px;font:14px Arial}
#facebookApp .caua-zoom-stage{flex:1;min-height:0;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;touch-action:none}
#facebookApp .caua-zoom-stage{cursor:zoom-in;user-select:none;-webkit-user-select:none}\n#facebookApp .caua-zoom-stage.is-zoomed{cursor:grab}\n#facebookApp .caua-zoom-stage.is-panning{cursor:grabbing}\n#facebookApp .caua-zoom-stage img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none;transform-origin:center center;will-change:transform}
#waIos15 .wai-viewer{touch-action:none;overflow:hidden;user-select:none;-webkit-user-select:none;cursor:zoom-in}\n#waIos15 .wai-viewer.is-zoomed{cursor:grab}\n#waIos15 .wai-viewer.is-panning{cursor:grabbing}
#waIos15 .wai-viewer img{pointer-events:none;user-select:none;-webkit-user-drag:none;transform-origin:center center;will-change:transform;touch-action:none}
#waIos15 .wai-viewer>button{z-index:5}
`;document.head.appendChild(style);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function attach(stage,img){
 if(!img||stage.dataset.cauaZoomBound)return;
 stage.dataset.cauaZoomBound='1';
 const z={scale:1,x:0,y:0},points=new Map();
 let gesture=null,lastTap=0,lastTapPoint=null,hadMulti=false;
 const local=(cx,cy)=>{const r=stage.getBoundingClientRect();return {x:(cx-r.left)*(stage.clientWidth/r.width),y:(cy-r.top)*(stage.clientHeight/r.height)};};
 const center=()=>({x:stage.clientWidth/2,y:stage.clientHeight/2});
 function draw(animate=false){
  // offsetWidth/Height are untransformed CSS dimensions, unlike getBoundingClientRect.
  const w=img.offsetWidth||stage.clientWidth,h=img.offsetHeight||stage.clientHeight;
  const maxX=Math.max(0,(w*z.scale-stage.clientWidth)/2);
  const maxY=Math.max(0,(h*z.scale-stage.clientHeight)/2);
  z.x=clamp(z.x,-maxX,maxX);z.y=clamp(z.y,-maxY,maxY);\n  stage.classList.toggle('is-zoomed',z.scale>1.015);
  img.style.transition=animate?'transform 220ms cubic-bezier(.22,.72,.24,1)':'none';
  img.style.transform='translate3d('+z.x+'px,'+z.y+'px,0) scale('+z.scale+')';
  const badge=stage.parentElement.querySelector('[data-caua-zoom-value]');
  if(badge)badge.textContent=(Math.round(z.scale*10)/10).toString()+'×';
 }
 function zoomAt(cx,cy,target,animate=false){
  const p=local(cx,cy),c=center(),px=p.x-c.x,py=p.y-c.y;
  const next=clamp(target,1,4),ratio=next/z.scale;
  z.x=px-(px-z.x)*ratio;z.y=py-(py-z.y)*ratio;z.scale=next;
  if(next<=1.015){z.scale=1;z.x=0;z.y=0;}
  draw(animate);
 }
 function reset(){z.scale=1;z.x=0;z.y=0;draw(true);}
 stage.addEventListener('caua-zoom-reset',reset);
 stage.addEventListener('pointerdown',e=>{
  if(e.target.closest('button')||(e.pointerType==='mouse'&&e.button!==0))return;
  e.preventDefault();\n  const p=local(e.clientX,e.clientY);points.set(e.pointerId,p);
  try{stage.setPointerCapture(e.pointerId)}catch(_){}
  if(points.size===2){
   const [a,b]=[...points.values()];
   gesture={kind:'pinch',dist:Math.hypot(b.x-a.x,b.y-a.y)||1,scale:z.scale,x:z.x,y:z.y,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2};
   hadMulti=true;lastTap=0;
  }else if(points.size===1)gesture={kind:'single',id:e.pointerId,px:p.x,py:p.y,x:z.x,y:z.y,moved:false};
 });
 stage.addEventListener('pointermove',e=>{
  if(!points.has(e.pointerId))return;
  const p=local(e.clientX,e.clientY);points.set(e.pointerId,p);
  if(points.size>=2&&gesture?.kind==='pinch'){
   const [a,b]=[...points.values()],cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
   const c=center(),ratio=clamp(gesture.scale*Math.hypot(b.x-a.x,b.y-a.y)/gesture.dist,1,4)/gesture.scale;
   z.scale=clamp(gesture.scale*Math.hypot(b.x-a.x,b.y-a.y)/gesture.dist,1,4);
   z.x=(cx-c.x)-(gesture.cx-c.x-gesture.x)*ratio;
   z.y=(cy-c.y)-(gesture.cy-c.y-gesture.y)*ratio;draw();
  }else if(points.size===1&&gesture?.kind==='single'&&gesture.id===e.pointerId){
   const dx=p.x-gesture.px,dy=p.y-gesture.py;
   if(Math.hypot(dx,dy)>8)gesture.moved=true;\n   if(gesture.moved&&z.scale>1.015)stage.classList.add('is-panning');
   if(z.scale>1.015){z.x=gesture.x+dx;z.y=gesture.y+dy;draw();}
  }
  e.preventDefault();
 },{passive:false});
 function finish(e){
  if(!points.has(e.pointerId))return;
  const p=local(e.clientX,e.clientY),prior=gesture;
  points.delete(e.pointerId);
  stage.classList.remove('is-panning');\n  if(prior?.kind==='pinch'){
   if(points.size===1){const [id,q]=[...points.entries()][0];gesture={kind:'single',id,px:q.x,py:q.y,x:z.x,y:z.y,moved:true};}
   else gesture=null;
   if(z.scale<1.08)reset();else draw(true);
   return;
  }
  if(e.pointerType!=='mouse'&&prior?.kind==='single'&&prior.id===e.pointerId&&!prior.moved&&!hadMulti&&Math.hypot(p.x-prior.px,p.y-prior.py)<9){
   const now=performance.now();
   if(now-lastTap<330&&lastTapPoint&&Math.hypot(p.x-lastTapPoint.x,p.y-lastTapPoint.y)<38){
    zoomAt(e.clientX,e.clientY,z.scale>1.05?1:2.5,true);lastTap=0;lastTapPoint=null;
   }else{lastTap=now;lastTapPoint=p;}
  }
  if(!points.size){gesture=null;hadMulti=false;}
 }
 stage.addEventListener('pointerup',finish);
 stage.addEventListener('pointercancel',e=>{points.delete(e.pointerId);gesture=null;hadMulti=false;stage.classList.remove('is-panning');draw(true);});\n stage.addEventListener('dblclick',e=>{if(e.pointerType==='touch')return;e.preventDefault();e.stopPropagation();zoomAt(e.clientX,e.clientY,z.scale>1.05?1:2.5,true);});\n stage.addEventListener('dragstart',e=>e.preventDefault());\n stage.addEventListener('contextmenu',e=>e.preventDefault());
 stage.addEventListener('wheel',e=>{
  // Wheel zoom works on desktops without requiring Ctrl.
  e.preventDefault();zoomAt(e.clientX,e.clientY,z.scale*(e.deltaY<0?1.15:1/1.15));
 },{passive:false});
 img.addEventListener('load',()=>draw());
 draw();
}
const fb=document.getElementById('facebookApp'),waHost=document.getElementById('whatsappApp');
let overlay=null;
function close(){if(overlay){overlay.remove();overlay=null}}
function open(src){
 close();if(!fb)return;
 overlay=document.createElement('div');overlay.className='caua-zoom-overlay';
 overlay.innerHTML='<div class="caua-zoom-header"><button type="button" data-caua-close>‹ Quay lại</button><span>Ảnh</span><button type="button" data-caua-zoom-value>1×</button></div><div class="caua-zoom-stage"><img alt="Ảnh Facebook" draggable="false"></div>';
 fb.appendChild(overlay);const img=overlay.querySelector('img');img.src=src;
 overlay.querySelector('[data-caua-close]').onclick=close;
 overlay.querySelector('[data-caua-zoom-value]').onclick=()=>overlay.querySelector('.caua-zoom-stage').dispatchEvent(new Event('caua-zoom-reset'));
 attach(overlay.querySelector('.caua-zoom-stage'),img);
}
if(fb)fb.addEventListener('click',e=>{
 if(overlay)return;
 const img=e.target.closest('.fb15-media.photo img,.fb15-photo-grid img,.fb15-link-thumb.photo img,.fb15-ad-thumb.photo img,.fb15-profile-cover img');
 if(!img||!fb.contains(img))return;
 e.preventDefault();e.stopImmediatePropagation();open(img.currentSrc||img.src);
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()},true);
document.getElementById('homeButton')?.addEventListener('click',close,true);
if(waHost){
 const watch=new MutationObserver(()=>{
  const viewer=waHost.querySelector('.wai-viewer');
  if(viewer&&!viewer.dataset.cauaZoomBound){const img=viewer.querySelector('img');if(img)attach(viewer,img);}
 });
 watch.observe(waHost,{childList:true,subtree:true});
 const initial=waHost.querySelector('.wai-viewer');if(initial)attach(initial,initial.querySelector('img'));
}
})();