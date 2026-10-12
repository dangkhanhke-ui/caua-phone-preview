/* Safari 2015 internal URL handoff from local Messages / WhatsApp.
   Never open the containing browser and never fetch outside the fictional phone. */
(()=>{
  'use strict';
  const containers=['#messagesApp .msg-bubble','#whatsappApp .wa-bubble'];
  const matcher=/(?:https?:\/\/|www\.)[^\s<>"']+|(?:[a-z0-9_-]+\.)+(?:com\.br|org\.br|net\.br|com|org|net|br)(?:\/[^\s<>"']*)?/gi;
  const blocked=/^(?:javascript|data|file|blob):/i;
  function safeURL(raw){
    const url=String(raw||'').replace(/[),;.!?]+$/,'');
    if(!url||url.length>700||blocked.test(url))return '';
    try{
      const parsed=new URL(/^https?:\/\//i.test(url)?url:'https://'+url);
      if(!['https:','http:'].includes(parsed.protocol)||!parsed.hostname.includes('.'))return '';
      return parsed.href;
    }catch(e){return ''}
  }
  function linkify(bubble){
    if(bubble.dataset.cauaSafariScanned==='1')return;
    bubble.dataset.cauaSafariScanned='1';
    const walker=document.createTreeWalker(bubble,NodeFilter.SHOW_TEXT,{
      acceptNode(node){
        const host=node.parentElement;
        if(!host || host.closest('a,button,textarea,input,script,style,.wa-msg-time,.msg-time,.wa-media-placeholder,.wa-contact-card'))return NodeFilter.FILTER_REJECT;
        if(!node.nodeValue||!node.nodeValue.includes('.'))return NodeFilter.FILTER_REJECT;
        matcher.lastIndex=0;
        return matcher.test(node.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
      }
    });
    const matches=[];
    while(walker.nextNode()&&matches.length<180)matches.push(walker.currentNode);
    for(const node of matches){
      const source=node.nodeValue;const frag=document.createDocumentFragment();let last=0,hit;
      matcher.lastIndex=0;
      while((hit=matcher.exec(source))){
        const raw=hit[0],url=safeURL(raw);
        if(!url)continue;
        const clipped=raw.replace(/[),;.!?]+$/,'');
        const pos=hit.index;
        if(pos>last)frag.appendChild(document.createTextNode(source.slice(last,pos)));
        const anchor=document.createElement('a');
        anchor.href=url;anchor.textContent=clipped;anchor.className='caua-safari-link';
        anchor.dataset.cauaSafariHref=url;
        anchor.setAttribute('aria-label','Mở '+clipped+' trong Safari');
        frag.appendChild(anchor);
        last=pos+clipped.length;
        if(matcher.lastIndex<=pos)matcher.lastIndex=pos+raw.length;
      }
      if(last){
        frag.appendChild(document.createTextNode(source.slice(last)));
        node.replaceWith(frag);
      }
    }
  }
  let scheduled=false;
  function scan(){
    scheduled=false;
    for(const selector of containers)document.querySelectorAll(selector).forEach(linkify);
  }
  function requestScan(){
    if(scheduled)return;scheduled=true;
    queueMicrotask(scan);
  }
  const observer=new MutationObserver(requestScan);
  for(const id of ['messagesApp','whatsappApp']){
    const app=document.getElementById(id);
    if(app)observer.observe(app,{subtree:true,childList:true,characterData:true});
  }
  document.addEventListener('click',event=>{
    const anchor=event.target.closest?.('a[data-caua-safari-href]');
    if(!anchor)return;
    if(!anchor.closest('#messagesApp, #whatsappApp'))return;
    const url=safeURL(anchor.dataset.cauaSafariHref);
    if(!url)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    const handoff=window.CauaCrossApp;
    if(handoff?.open)handoff.open('safari');
    else document.querySelector('[data-app="safari"]')?.click();
    window.dispatchEvent(new CustomEvent('caua:safari-open-url',{detail:{url,source:'message'}}));
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',requestScan,{once:true});
  else requestScan();
})();
