/* Shared Photos-style image gestures for Facebook and WhatsApp. */
(()=>{'use strict';
const style=document.createElement('style');style.textContent=`
#facebookApp .caua-zoom-overlay{position:absolute;inset:0;z-index:150;background:#09090c;color:white;display:flex;flex-direction:column;overflow:hidden}
#facebookApp .caua-zoom-header{height:46px;flex:none;display:flex;align-items:center;justify-content:space-between;padding:0 10px;background:#101116;font:13px Arial}
#facebookApp .caua-zoom-header button{background:none;border:0;color:white;padding:10px;font:14px Arial}
#facebookApp .caua-zoom-stage{flex:1;min-height:0;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;touch-action:none}
#facebookApp .caua-zoom-stage img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none;transform-origin:center center;will-change:transform}
#waIos15 .wai-viewer{touch-action:none;overflow:hidden}
#waIos15 .wai-viewer img{pointer-events:none;user-select:none;-webkit-user-drag:none;transform-origin:center center;will-change:transform;touch-action:none}
#waIos15 .wai-viewer>button{z-index:5}
`;document.head.appendChild(style);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function attach(stage,img){
 if(stage.dataset.cauaZoomBound)return;
 stage.dataset.cauaZoomBound='1';
 const z={scale:1,x:0,y:0},pointers=new Map();
 let pinch=null,pan=null,lastTap=0,lastPoint=null,movedPinch=false;
 function draw(animate=false){
  const box=img.getBoundingClientRect();
  const vw=stage.clientWidth||320,vh=stage.clientHeight||500;
  const baseW=box.width/Math.max(z.scale,.001),baseH=box.height/Math.max(z.scale,.001);
  const mx=Math.max(0,(baseW*z.scale-vw)/2),my=Math.max(0,(baseH*z.scale-vh)/2);
  z.x=clamp(z.x,-mx,mx);z.y=clamp(z.y,-my,my);
  img.style.transition=animate?'transform 220ms cubic-bezier(.22,.72,.24,1)':'none';
  img.style.transform='translate3d('+z.x+'px,'+z.y+'px,0) scale('+z.scale+')';
  const label=stage.parentElement.querySelector('[data-caua-zoom-value]');
  if(label)label.textContent=(Math.round(z.scale*10)/10).toString()+'×';
 }
 function around(cx,cy,target,animate=false){
  const r=stage.getBoundingClientRect(),px=cx-r.left-r.width/2,py=cy-r.top-r.height/2;
  const old=z.scale,next=clamp(target,1,4),ratio=next/old;
  z.x=px-(px-z.x)*ratio;z.y=py-(py-z.y)*ratio;z.scale=next;
  if(next<=1.015){z.scale=1;z.x=0;z.y=0;}
  draw(animate);
 }
 stage.addEventListener('pointerdown',e=>{
  if(e.target.closest('button'))return;
  if(e.pointerType==='mouse'&&e.button!==0)return;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  try{stage.setPointerCapture(e.pointerId)}catch(_){}
  if(pointers.size>=2){
   const [a,b]=[...pointers.values()];
   pinch={dist:Math.hypot(a.x-b.x,a.y-b.y)||1,scale:z.scale,x:z.x,y:z.y,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2};
   movedPinch=true;pan=null;
  }else pan={id:e.pointerId,x:e.clientX,y:e.clientY,ox:z.x,oy:z.y};
 });
 stage.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId))return;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size>=2&&pinch){
   const [a,b]=[...pointers.values()],cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
   const r=stage.getBoundingClientRect(),baseX=pinch.cx-r.left-r.width/2,baseY=pinch.cy-r.top-r.height/2;
   const nowX=cx-r.left-r.width/2,nowY=cy-r.top-r.height/2;
   const next=clamp(pinch.scale*Math.hypot(a.x-b.x,a.y-b.y)/pinch.dist,1,4),ratio=next/pinch.scale;
   z.scale=next;z.x=nowX-(baseX-pinch.x)*ratio;z.y=nowY-(baseY-pinch.y)*ratio;draw();
  }else if(pointers.size===1&&pan&&z.scale>1.015){
   z.x=pan.ox+e.clientX-pan.x;z.y=pan.oy+e.clientY-pan.y;draw();
  }
  e.preventDefault();
 },{passive:false});
 function end(e){
  if(!pointers.has(e.pointerId))return;
  pointers.delete(e.pointerId);
  if(pinch){
   if(pointers.size<2){pinch=null;if(z.scale<1.08){z.scale=1;z.x=z.y=0;}draw(true);}
   if(pointers.size===1){const [id,q]=[...pointers.entries()][0];pan={id,x:q.x,y:q.y,ox:z.x,oy:z.y};}
   return;
  }
  if(pan&&pan.id===e.pointerId){
   const distance=Math.hypot(e.clientX-pan.x,e.clientY-pan.y);
   if(distance<12&&!movedPinch){
    const now=performance.now();
    if(now-lastTap<330&&lastPoint&&Math.hypot(e.clientX-lastPoint.x,e.clientY-lastPoint.y)<38){
     around(e.clientX,e.clientY,z.scale>1.05?1:2.5,true);lastTap=0;
    }else{lastTap=now;lastPoint={x:e.clientX,y:e.clientY};}
   }
  }
  pan=null;if(!pointers.size)movedPinch=false;
 }
 stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
 stage.addEventListener('wheel',e=>{
  if(!(e.ctrlKey||e.metaKey))return;
  e.preventDefault();around(e.clientX,e.clientY,z.scale*(e.deltaY<0?1.15:1/1.15),false);
 },{passive:false});
 stage.addEventListener('dblclick',e=>{if(e.pointerType!=='touch'){e.preventDefault();around(e.clientX,e.clientY,z.scale>1.05?1:2.5,true)}});
 img.addEventListener('load',()=>draw(),{once:true});
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
 overlay.querySelector('[data-caua-zoom-value]').onclick=()=>{const st=overlay.querySelector('.caua-zoom-stage');const im=st.querySelector('img');im.style.transform='';st.replaceWith(st.cloneNode(true));attach(overlay.querySelector('.caua-zoom-stage'),overlay.querySelector('.caua-zoom-stage img'));};
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