/* Cauã phone: cache ONLY fixed chrome images, never user/photo/social media.
 * First visit still downloads assets; later visits can use browser cache/offline images.
 * Increment VERSION when a bundled visual asset is replaced. */
'use strict';
const VERSION='caua-fixed-images-20261011-v1';
const FIXED=[
 'assets/screen/phone_screen.png',
 'assets/whatsapp/whatsapp_chat_bg.png',
 'assets/voice-memos/voice_icon.png',
 'assets/media/451ac1907cdb59ca7a6d7fb6.png',
 'assets/media/a50f7e7d99a58d447fded094.png',
 'assets/media/66edf0697d90edcdf3562c4b.png',
 'assets/media/ded9c1162a09f194d6bd1cc0.png',
 'assets/media/b8304cae6865ff99f4f10cef.png',
 'assets/media/ead9f6efcc82327a07570445.png',
 'assets/media/99053f821a06bfb38b071cf1.png',
 'assets/media/898c09d3c8af0b9b7effdb61.png',
 'assets/media/5179632c8a940bb07383d328.png',
 'assets/media/8e47cee68a3cc75603f05f14.png',
 'assets/goodreader4/GR04_Icon.png',
 'assetsatlasAtlas_Icon.png.png'
];
const resolved=FIXED.map(path=>new URL(path,self.registration.scope).href);
const paths=new Set(resolved.map(url=>new URL(url).pathname));
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(VERSION);
  // Each image is independent: an unavailable optional icon cannot break installation.
  await Promise.allSettled(resolved.map(url=>cache.add(new Request(url,{cache:'reload'}))));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(key=>key.startsWith('caua-fixed-images-')&&key!==VERSION).map(key=>caches.delete(key)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET'||request.destination!=='image')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin||!paths.has(url.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(VERSION);
  const stored=await cache.match(request,{ignoreSearch:true});
  if(stored)return stored;
  const result=await fetch(request);
  if(result.ok&&result.type==='basic'){
   const job=cache.put(request,result.clone()).catch(()=>{});
   try{event.waitUntil(job);}catch(_){}
  }
  return result;
 })());
});