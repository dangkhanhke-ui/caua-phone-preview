/* Image performance, non-destructive: no src rewrite, no resizing,
   no transforms, no content or layout changes. */
(() => {
  'use strict';
  const selector = '#facebookApp img, #whatsappApp img, #photosApp img';
  const processed = new WeakSet();
  let scheduled = false;
  const queue = new Set();
  const optimize = (img) => {
    if (processed.has(img)) return;
    processed.add(img);
    // Asynchronous decoding helps preserve touch/scroll responsiveness
    // without changing image source, resolution, or visual dimensions.
    if (!img.hasAttribute('decoding')) img.decoding = 'async';
    // Offscreen photos can be fetched when approaching the viewport.
    // Exclude avatars, icons, and small UI elements from lazy loading.
    const attrWidth = Number(img.getAttribute('width')) || 0;
    const attrHeight = Number(img.getAttribute('height')) || 0;
    const src = img.getAttribute('src') || '';
    const isSmall = /avatar|icon|logo|emoji|button|thumb/i.test(img.className + ' ' + src);
    if (isSmall || (attrWidth && attrWidth < 96) || (attrHeight && attrHeight < 96)) return;
    const gallery = img.closest('[class*="photo"],[class*="media"],[class*="image"],[class*="feed"]');
    if (!gallery) return;
    // Only lazy-load photos that are clearly below the visible phone.
    // Hidden app screens are deliberately excluded from lazy loading:
    // they must be ready when the user opens the app.
    if (!img.getClientRects().length) return;
    const bounds = img.getBoundingClientRect();
    if (bounds.top > window.innerHeight + 500 && bounds.height > 0 &&
        !img.hasAttribute('loading')) img.loading = 'lazy';
  };
  const enqueue = (root) => {
    if (root.nodeType !== 1) return;
    if (root.matches && root.matches(selector)) queue.add(root);
    root.querySelectorAll?.(selector).forEach(el => queue.add(el));
    if (scheduled || !queue.size) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      for (const img of queue) optimize(img);
      queue.clear();
    });
  };
  const start = () => {
    enqueue(document.documentElement);
    const observer = new MutationObserver(records => {
      for (const record of records)
        for (const node of record.addedNodes) enqueue(node);
    });
    observer.observe(document.documentElement, {childList:true,subtree:true});
  };
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
