/* Cauã phone: sole Facebook image viewer. Do not install a second Facebook handler. */
(() => {
  'use strict';
  const screen = document.getElementById('screen');
  const facebook = document.getElementById('facebookApp');
  if (!screen || !facebook) return;

  const photoTargets = [
    '.fb15-media.photo img',
    '.fb15-photo-grid img',
    '.fb15-link-thumb.photo img',
    '.fb15-ad-thumb.photo img',
    '.fb15-profile-cover > img'
  ].join(',');
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  let panel = null;
  let previouslyFocused = null;
  let activeState = null;

  function close() {
    if (!panel) return;
    panel.remove();
    panel = null;
    activeState = null;
    screen.classList.remove('fb-photo-clean-open');
    if (previouslyFocused && previouslyFocused.isConnected && typeof previouslyFocused.focus === 'function') {
      try { previouslyFocused.focus({ preventScroll: true }); } catch (_) {}
    }
    previouslyFocused = null;
  }

  function open(src) {
    if (!src || !facebook.classList.contains('open')) return;
    close();
    previouslyFocused = document.activeElement;
    panel = document.createElement('div');
    panel.className = 'fb-photo-clean';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Ảnh Facebook');
    panel.innerHTML = '<div class="fb-photo-clean-header">' +
      '<button class="fb-photo-clean-back" type="button" aria-label="Quay lại">‹ Quay lại</button>' +
      '<strong>Ảnh</strong>' +
      '<button class="fb-photo-clean-reset" type="button" aria-label="Đặt lại độ phóng đại">1×</button>' +
      '</div>' +
      '<div class="fb-photo-clean-stage"><img alt="Ảnh Facebook" draggable="false"></div>';
    const stage = panel.querySelector('.fb-photo-clean-stage');
    const image = stage.querySelector('img');
    const resetButton = panel.querySelector('.fb-photo-clean-reset');
    const backButton = panel.querySelector('.fb-photo-clean-back');
    image.src = src;

    // The old Facebook app and the status bar are fully hidden in CSS while
    // the photo is displayed as a direct sibling inside the iPhone screen.
    screen.appendChild(panel);
    screen.classList.add('fb-photo-clean-open');

    const pointers = new Map();
    const view = { scale: 1, panX: 0, panY: 0, pinch: null, drag: null, lastTap: 0 };
    activeState = view;

    function apply(animate = false) {
      if (!panel || activeState !== view) return;
      const maxX = Math.max(0, (image.offsetWidth * view.scale - stage.clientWidth) / 2);
      const maxY = Math.max(0, (image.offsetHeight * view.scale - stage.clientHeight) / 2);
      view.panX = clamp(view.panX, -maxX, maxX);
      view.panY = clamp(view.panY, -maxY, maxY);
      image.style.transition = animate ? 'transform 180ms ease-out' : 'none';
      image.style.transform = 'translate3d(' + view.panX + 'px,' + view.panY + 'px,0) scale(' + view.scale + ')';
      resetButton.textContent = (Math.round(view.scale * 10) / 10) + '×';
    }

    function setZoom(newScale, clientX, clientY, animate = false) {
      const next = clamp(newScale, 1, 4);
      if (next <= 1.001) {
        view.scale = 1;
        view.panX = 0;
        view.panY = 0;
      } else {
        const bounds = stage.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        const ratio = next / view.scale;
        view.panX = view.panX * ratio + ((clientX ?? centerX) - centerX) * (1 - ratio);
        view.panY = view.panY * ratio + ((clientY ?? centerY) - centerY) * (1 - ratio);
        view.scale = next;
      }
      apply(animate);
    }

    function midpoint() {
      const r = stage.getBoundingClientRect();
      return [r.left + r.width / 2, r.top + r.height / 2];
    }
    backButton.addEventListener('click', close);
    resetButton.addEventListener('click', () => {
      const [x,y] = midpoint();
      setZoom(1,x,y,true);
    });
    image.addEventListener('load', () => apply(false));

    stage.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointers.set(e.pointerId,{ x:e.clientX, y:e.clientY });
      if (pointers.size === 2) {
        const [a,b] = [...pointers.values()];
        view.pinch = { distance:Math.hypot(a.x-b.x,a.y-b.y)||1, scale:view.scale,
          panX:view.panX,panY:view.panY,centerX:(a.x+b.x)/2,centerY:(a.y+b.y)/2 };
        view.drag=null;
      } else if (pointers.size===1) {
        view.drag={id:e.pointerId,x:e.clientX,y:e.clientY,panX:view.panX,panY:view.panY,moved:false};
      }
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    },{passive:false});

    stage.addEventListener('pointermove',e=>{
      if(!pointers.has(e.pointerId))return;
      pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pointers.size>=2&&view.pinch){
        const [a,b]=[...pointers.values()],pinch=view.pinch;
        const target=clamp(pinch.scale*Math.hypot(a.x-b.x,a.y-b.y)/pinch.distance,1,4);
        const [cx,cy]=midpoint();
        const ratio=target/pinch.scale;
        const fx=(a.x+b.x)/2,fy=(a.y+b.y)/2;
        view.scale=target;
        view.panX=pinch.panX*ratio+(fx-cx)-(pinch.centerX-cx)*ratio;
        view.panY=pinch.panY*ratio+(fy-cy)-(pinch.centerY-cy)*ratio;
        apply(false);
      }else if(pointers.size===1&&view.drag&&view.drag.id===e.pointerId){
        const dx=e.clientX-view.drag.x,dy=e.clientY-view.drag.y;
        if(Math.hypot(dx,dy)>7)view.drag.moved=true;
        if(view.scale>1.001){
          view.panX=view.drag.panX+dx;view.panY=view.drag.panY+dy;apply(false);
        }
      }
      e.preventDefault();
    },{passive:false});

    function finish(e){
      if(!pointers.has(e.pointerId))return;
      pointers.delete(e.pointerId);
      if(pointers.size<2)view.pinch=null;
      if(!pointers.size){
        const wasTap=view.drag&&!view.drag.moved&&e.pointerType==='touch';
        view.drag=null;
        if(wasTap){
          const now=Date.now();
          if(now-view.lastTap<340){
            view.lastTap=0;setZoom(view.scale>1.01?1:2.5,e.clientX,e.clientY,true);
          }else view.lastTap=now;
        }
      }
    }
    stage.addEventListener('pointerup',finish);
    stage.addEventListener('pointercancel',finish);
    stage.addEventListener('dblclick',e=>{
      e.preventDefault();setZoom(view.scale>1.01?1:2.5,e.clientX,e.clientY,true);
    });
    stage.addEventListener('wheel',e=>{
      if(e.ctrlKey||e.metaKey){
        e.preventDefault();
        setZoom(view.scale*(e.deltaY<0?1.15:1/1.15),e.clientX,e.clientY);
      }
    },{passive:false});
    requestAnimationFrame(()=>apply(false));
    backButton.focus({preventScroll:true});
  }

  // One capture-phase handler for all Facebook photos (feed and profile).
  facebook.addEventListener('click',e=>{
    if(panel)return;
    const img=e.target.closest(photoTargets);
    if(!img||!facebook.contains(img)||!facebook.classList.contains('open'))return;
    e.preventDefault();
    e.stopImmediatePropagation();
    open(img.currentSrc||img.src);
  },true);

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&panel){e.stopPropagation();close();}
  },true);
  document.getElementById('homeButton')?.addEventListener('click',close,true);
  new MutationObserver(()=>{
    if(panel&&!facebook.classList.contains('open'))close();
  }).observe(facebook,{attributes:true,attributeFilter:['class']});
})();
